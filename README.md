# PerúBox · Productos peruanos, sabores que unen

Tienda web (proyecto universitario) donde el cliente **arma su box** con productos peruanos sin registrarse, elige el envío (nacional, internacional o Europa), se identifica (correo, Gmail, Facebook o Hotmail) y paga con una **pasarela simulada** (Yape, Plin, tarjeta o transferencia). El administrador gestiona productos, stock, precios, tarifas de envío, ventas (con notificaciones en tiempo real) y clientes.

**Tecnología:** Next.js 16 · React 19 · Tailwind CSS 4 · Motion (animaciones) · Supabase (PostgreSQL + Auth + Storage + Realtime) · Vercel (hosting).

## Puesta en marcha

1. **Supabase:** crea un proyecto en supabase.com.
2. En **SQL Editor** ejecuta, en orden:
   - `supabase/schema.sql` (tablas, seguridad, función de compra)
   - `supabase/002_comprobantes.sql` (boletas y facturas simuladas)
   - `supabase/seed.sql` (20 productos y 41 tarifas de envío)
3. En **Authentication → Providers → Email** desactiva *Confirm email* (para la demo).
4. Copia `.env.local.example` como `.env.local` y pega la URL y la anon key.
5. `npm install` y luego `npm run dev` → http://localhost:3000
6. Regístrate en `/login` con tu correo y ejecuta `supabase/make-admin.sql` (con tu correo) para volverte administrador. El panel está en `/admin`.

## Login social (opcional)

En Supabase → Authentication → Providers activa **Google**, **Facebook** y **Azure** (Hotmail/Outlook). Cada uno pide un *Client ID* y un *Secret* que se obtienen en Google Cloud Console, Meta for Developers y Azure Portal. La *Redirect URL* que debes registrar allí es la que te muestra Supabase (`https://xxxx.supabase.co/auth/v1/callback`). En **Authentication → URL Configuration** agrega `http://localhost:3000/**` y la URL de Vercel.

## Publicar en Vercel

Sube el proyecto a GitHub → vercel.com → *Import project* → agrega las dos variables de entorno → *Deploy*.

## Estructura

| Ruta | Qué hace |
|---|---|
| `/` | Landing animada: hero, cómo funciona, productos, envíos, testimonios |
| `/arma-tu-box` | Catálogo con buscador y caja animada en vivo |
| `/checkout` | Envío → cuenta → pago simulado → confirmación |
| `/cuenta` | Historial y seguimiento de pedidos del cliente |
| `/admin` | Resumen, ventas, productos, envíos, clientes (exporta CSV) |

Seguridad: Row Level Security en todas las tablas; los precios y el stock se recalculan en la base de datos (`place_order`), así nadie puede alterar el total desde el navegador. Con tarjeta solo se guardan marca y últimos 4 dígitos.
