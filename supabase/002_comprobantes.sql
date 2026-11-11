-- =====================================================================
--  PerúBox · Comprobantes de venta (boleta / factura) — SIMULADOS
--  Ejecutar en Supabase → SQL Editor (después de schema.sql). Idempotente.
-- =====================================================================

-- ---------- Datos del emisor (editables desde /admin/envios) ----------
alter table public.store_settings
  add column if not exists issuer_ruc     text not null default '20000000001',
  add column if not exists issuer_name    text not null default 'PERUBOX S.A.C.',
  add column if not exists issuer_address text not null default 'Lima, Perú';

-- ---------- Datos del comprobante en cada pedido ----------
alter table public.orders
  add column if not exists doc_type text check (doc_type in ('boleta','factura')),
  add column if not exists doc_series text,
  add column if not exists doc_number int,
  add column if not exists customer_doc_type text,     -- DNI, RUC, CE, PASAPORTE, '-'
  add column if not exists customer_doc_number text,
  add column if not exists customer_legal_name text,   -- razón social (factura)
  add column if not exists customer_fiscal_address text,
  add column if not exists igv_pen numeric(10,2);

create sequence if not exists public.boleta_seq;
create sequence if not exists public.factura_seq;

-- Pedidos antiguos sin comprobante → se les asigna una boleta
do $$
declare r record;
begin
  for r in select id, total_pen from public.orders where doc_type is null order by created_at loop
    update public.orders set
      doc_type = 'boleta', doc_series = 'B001', doc_number = nextval('public.boleta_seq'),
      customer_doc_type = '-', igv_pen = round(r.total_pen - r.total_pen / 1.18, 2)
    where id = r.id;
  end loop;
end $$;

-- ---------- Validación de RUC (módulo 11, SUNAT) ----------
create or replace function public.ruc_valido(p text) returns boolean
language plpgsql immutable as $$
declare w int[] := array[5,4,3,2,7,6,5,4,3,2]; s int := 0; r int;
begin
  if p !~ '^(10|15|17|20)\d{9}$' then return false; end if;
  for i in 1..10 loop s := s + substr(p, i, 1)::int * w[i]; end loop;
  r := 11 - (s % 11);
  if r = 10 then r := 0; elsif r = 11 then r := 1; end if;
  return r = substr(p, 11, 1)::int;
end $$;

-- ---------- place_order v2: ahora emite el comprobante ----------
drop function if exists public.place_order(jsonb, uuid, text, text, text, text, text, text);

create or replace function public.place_order(
  p_items jsonb,
  p_shipping_rate_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_gift_message text,
  p_payment_method text,
  p_payment_ref text,
  p_invoice jsonb default '{}'::jsonb   -- { doc_type, customer_doc_type, customer_doc_number, legal_name, fiscal_address }
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_rate public.shipping_rates;
  v_fx numeric;
  v_ship numeric;
  v_items numeric := 0;
  v_order public.orders;
  v_item jsonb;
  v_prod public.products;
  v_qty int;
  v_doc text := coalesce(nullif(p_invoice->>'doc_type',''), 'boleta');
  v_cdt text := coalesce(nullif(p_invoice->>'customer_doc_type',''), '-');
  v_cdn text := nullif(trim(coalesce(p_invoice->>'customer_doc_number','')), '');
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para comprar'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'Tu box está vacía'; end if;
  if v_doc not in ('boleta','factura') then raise exception 'Tipo de comprobante no válido'; end if;

  if v_doc = 'factura' then
    if not public.ruc_valido(coalesce(v_cdn,'')) then raise exception 'El RUC ingresado no es válido'; end if;
    if length(trim(coalesce(p_invoice->>'legal_name',''))) < 3 then raise exception 'Ingresa la razón social'; end if;
    if length(trim(coalesce(p_invoice->>'fiscal_address',''))) < 5 then raise exception 'Ingresa la dirección fiscal'; end if;
    v_cdt := 'RUC';
  elsif v_cdt = 'DNI' and coalesce(v_cdn,'') !~ '^\d{8}$' then
    raise exception 'El DNI debe tener 8 dígitos';
  end if;

  select * into v_rate from public.shipping_rates where id = p_shipping_rate_id and active;
  if not found then raise exception 'Destino de envío no válido'; end if;
  select usd_to_pen into v_fx from public.store_settings where id = 1;
  v_ship := case when v_rate.currency = 'USD' then round(v_rate.price * v_fx, 2) else v_rate.price end;

  insert into public.orders (user_id, customer_name, customer_email, customer_phone,
      shipping_scope, shipping_destination, shipping_address, shipping_cost_pen,
      items_total_pen, total_pen, gift_message, payment_method, payment_ref,
      doc_type, doc_series, doc_number, customer_doc_type, customer_doc_number,
      customer_legal_name, customer_fiscal_address)
  values (v_uid, p_customer_name, (select email from auth.users where id = v_uid), p_customer_phone,
      v_rate.scope, v_rate.destination, p_address, v_ship, 0, 0, nullif(p_gift_message,''),
      p_payment_method, p_payment_ref,
      v_doc,
      case when v_doc = 'factura' then 'F001' else 'B001' end,
      case when v_doc = 'factura' then nextval('public.factura_seq') else nextval('public.boleta_seq') end,
      v_cdt, v_cdn,
      nullif(trim(coalesce(p_invoice->>'legal_name','')), ''),
      nullif(trim(coalesce(p_invoice->>'fiscal_address','')), ''))
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_prod from public.products
      where id = (v_item->>'product_id')::uuid and active for update;
    if not found then raise exception 'Un producto ya no está disponible'; end if;
    if v_qty < 1 or v_prod.stock < v_qty then
      raise exception 'Stock insuficiente para "%" (quedan %)', v_prod.name, v_prod.stock;
    end if;
    update public.products set stock = stock - v_qty, updated_at = now() where id = v_prod.id;
    insert into public.order_items (order_id, product_id, name, unit_price, quantity)
      values (v_order.id, v_prod.id, v_prod.name, v_prod.price, v_qty);
    v_items := v_items + v_prod.price * v_qty;
  end loop;

  -- Boleta mayor a S/ 700 exige identificar al cliente (regla SUNAT)
  if v_doc = 'boleta' and v_items + v_ship > 700 and v_cdn is null then
    raise exception 'Para boletas mayores a S/ 700 debes ingresar tu DNI, CE o pasaporte';
  end if;

  update public.orders set
      items_total_pen = v_items,
      total_pen = v_items + v_ship,
      igv_pen = round((v_items + v_ship) - (v_items + v_ship) / 1.18, 2)
    where id = v_order.id returning * into v_order;

  update public.profiles set phone = coalesce(phone, p_customer_phone),
         full_name = coalesce(nullif(full_name,''), p_customer_name)
    where id = v_uid;

  return jsonb_build_object('id', v_order.id, 'order_number', v_order.order_number,
                            'total_pen', v_order.total_pen,
                            'doc_type', v_order.doc_type, 'doc_series', v_order.doc_series,
                            'doc_number', v_order.doc_number);
end $$;

grant execute on function public.place_order(jsonb, uuid, text, text, text, text, text, text, jsonb) to authenticated;
grant usage on sequence public.boleta_seq, public.factura_seq to authenticated;
