-- Convierte tu cuenta en ADMINISTRADOR.
-- 1) Regístrate primero en la web (/login) con tu correo.
-- 2) Cambia el correo de abajo por el tuyo y ejecuta TODO esto en Supabase → SQL Editor.

-- Permite cambiar roles desde el SQL Editor (sin usuario web conectado)
create or replace function public.protect_role()
returns trigger language plpgsql as $$
begin
  if new.role <> old.role and auth.uid() is not null and not public.is_admin() then new.role := old.role; end if;
  return new;
end $$;

update public.profiles set role = 'admin'
where lower(trim(email)) = lower('TU_CORREO@ejemplo.com');

-- Verifica:
select email, role from public.profiles;
