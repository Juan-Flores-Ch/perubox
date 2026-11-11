-- =====================================================================
--  PerúBox · Esquema de base de datos (Supabase / PostgreSQL)
--  Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO → Run
--  Se puede ejecutar varias veces sin romper nada (idempotente).
-- =====================================================================

-- ---------- PERFILES (clientes y administradores) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text,
  full_name   text,
  email       text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  marketing_opt_in boolean not null default true,
  provider    text default 'email',
  created_at  timestamptz not null default now()
);

-- Crea el perfil automáticamente cuando alguien se registra (email, Google, Facebook, Microsoft)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, email, phone, provider, marketing_opt_in)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', new.phone),
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, true)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- CONFIGURACIÓN DE TIENDA ----------
create table if not exists public.store_settings (
  id              int primary key default 1 check (id = 1),
  usd_to_pen      numeric(6,3) not null default 3.750,
  yape_number     text not null default '987 654 321',
  yape_holder     text not null default 'PerúBox SAC',
  min_box_items   int not null default 3,
  updated_at      timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- ---------- PRODUCTOS ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  category    text not null default 'Snacks',
  price       numeric(10,2) not null check (price >= 0),   -- en soles (S/)
  stock       int not null default 0 check (stock >= 0),
  image_url   text,
  emoji       text default '🎁',
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- TARIFAS DE ENVÍO ----------
create table if not exists public.shipping_rates (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('nacional','internacional','europa')),
  destination text not null,
  price       numeric(10,2) not null check (price >= 0),
  currency    text not null check (currency in ('PEN','USD')),
  eta         text not null default '',
  active      boolean not null default true,
  sort_order  int not null default 0,
  unique (scope, destination)
);

-- ---------- PEDIDOS ----------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     bigint generated always as identity,
  user_id          uuid not null references auth.users(id),
  customer_name    text not null,
  customer_email   text,
  customer_phone   text,
  shipping_scope   text not null,
  shipping_destination text not null,
  shipping_address text not null,
  shipping_cost_pen numeric(10,2) not null,
  items_total_pen  numeric(10,2) not null,
  total_pen        numeric(10,2) not null,
  gift_message     text,
  payment_method   text not null check (payment_method in ('yape','plin','tarjeta','transferencia')),
  payment_ref      text,
  status           text not null default 'pagado'
                   check (status in ('pagado','preparando','enviado','entregado','cancelado')),
  seen_by_admin    boolean not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  unit_price  numeric(10,2) not null,
  quantity    int not null check (quantity > 0)
);

-- ---------- REGISTRAR PEDIDO (transacción segura) ----------
-- Recalcula precios desde la BD, valida y descuenta stock, guarda pedido + ítems.
create or replace function public.place_order(
  p_items jsonb,               -- [{ "product_id": "...", "quantity": 2 }, ...]
  p_shipping_rate_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_gift_message text,
  p_payment_method text,
  p_payment_ref text
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
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para comprar'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'Tu box está vacía'; end if;

  select * into v_rate from public.shipping_rates where id = p_shipping_rate_id and active;
  if not found then raise exception 'Destino de envío no válido'; end if;
  select usd_to_pen into v_fx from public.store_settings where id = 1;
  v_ship := case when v_rate.currency = 'USD' then round(v_rate.price * v_fx, 2) else v_rate.price end;

  insert into public.orders (user_id, customer_name, customer_email, customer_phone,
      shipping_scope, shipping_destination, shipping_address, shipping_cost_pen,
      items_total_pen, total_pen, gift_message, payment_method, payment_ref)
  values (v_uid, p_customer_name, (select email from auth.users where id = v_uid), p_customer_phone,
      v_rate.scope, v_rate.destination, p_address, v_ship, 0, 0, nullif(p_gift_message,''),
      p_payment_method, p_payment_ref)
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

  update public.orders set items_total_pen = v_items, total_pen = v_items + v_ship
    where id = v_order.id returning * into v_order;

  -- guarda el teléfono en el perfil si no lo tenía
  update public.profiles set phone = coalesce(phone, p_customer_phone),
         full_name = coalesce(nullif(full_name,''), p_customer_name)
    where id = v_uid;

  return jsonb_build_object('id', v_order.id, 'order_number', v_order.order_number,
                            'total_pen', v_order.total_pen);
end $$;

-- ---------- SEGURIDAD (Row Level Security) ----------
alter table public.profiles       enable row level security;
alter table public.store_settings enable row level security;
alter table public.products       enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

drop policy if exists "perfil propio o admin" on public.profiles;
create policy "perfil propio o admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "editar perfil propio" on public.profiles;
create policy "editar perfil propio" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- Evita que un cliente se ponga role = 'admin' a sí mismo desde la web.
-- (Desde el SQL Editor de Supabase no hay usuario web —auth.uid() es null— y sí se permite.)
create or replace function public.protect_role()
returns trigger language plpgsql as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then new.role := old.role; end if;
  return new;
end $$;
drop trigger if exists protect_role on public.profiles;
create trigger protect_role before update on public.profiles for each row execute function public.protect_role();

drop policy if exists "settings lectura" on public.store_settings;
create policy "settings lectura" on public.store_settings for select using (true);
drop policy if exists "settings admin" on public.store_settings;
create policy "settings admin" on public.store_settings for update using (public.is_admin());

drop policy if exists "productos lectura" on public.products;
create policy "productos lectura" on public.products for select using (active or public.is_admin());
drop policy if exists "productos admin" on public.products;
create policy "productos admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "envios lectura" on public.shipping_rates;
create policy "envios lectura" on public.shipping_rates for select using (active or public.is_admin());
drop policy if exists "envios admin" on public.shipping_rates;
create policy "envios admin" on public.shipping_rates for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "pedidos propios o admin" on public.orders;
create policy "pedidos propios o admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "pedidos admin update" on public.orders;
create policy "pedidos admin update" on public.orders for update using (public.is_admin());

drop policy if exists "items propios o admin" on public.order_items;
create policy "items propios o admin" on public.order_items for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

grant execute on function public.place_order(jsonb, uuid, text, text, text, text, text, text) to authenticated;

-- Permisos de la API (por si el proyecto no expone tablas nuevas automáticamente).
-- RLS sigue decidiendo qué filas ve o modifica cada usuario.
grant usage on schema public to anon, authenticated;
grant select on public.products, public.shipping_rates, public.store_settings to anon, authenticated;
grant select, update on public.profiles, public.store_settings to authenticated;
grant select, insert, update, delete on public.products, public.shipping_rates to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- ---------- NOTIFICACIONES EN TIEMPO REAL PARA EL ADMIN ----------
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;

-- ---------- STORAGE: imágenes de productos ----------
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict (id) do nothing;
drop policy if exists "imagenes publicas" on storage.objects;
create policy "imagenes publicas" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "imagenes admin insert" on storage.objects;
create policy "imagenes admin insert" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "imagenes admin update" on storage.objects;
create policy "imagenes admin update" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
drop policy if exists "imagenes admin delete" on storage.objects;
create policy "imagenes admin delete" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());
