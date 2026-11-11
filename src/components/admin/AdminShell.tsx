"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Boxes, ExternalLink, LayoutDashboard, LogOut, Receipt, Truck, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { cn, dateTime, pen } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Spinner } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Ventas", icon: Receipt },
  { href: "/admin/productos", label: "Productos", icon: Boxes },
  { href: "/admin/envios", label: "Envíos", icon: Truck },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

/** Avisa a las páginas del admin cuando entra una venta nueva. */
const RefreshCtx = createContext(0);
export const useAdminRefresh = () => useContext(RefreshCtx);

function playDing() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.15);
      o.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch {}
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unseen, setUnseen] = useState<Order[]>([]);
  const [bell, setBell] = useState(false);
  const [tick, setTick] = useState(0);

  const loadUnseen = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").eq("seen_by_admin", false).order("created_at", { ascending: false }).limit(20);
    setUnseen((data as Order[]) ?? []);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga asíncrona inicial
    loadUnseen();
    // Notificaciones de venta en tiempo real
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new as Order;
        playDing();
        toast.success(`🛍️ Nueva venta #${String(o.order_number).padStart(5, "0")}`, {
          description: `${o.customer_name} · ${o.shipping_destination}`,
          duration: 8000,
        });
        // el total se completa un instante después del INSERT
        setTimeout(() => {
          loadUnseen();
          setTick((t) => t + 1);
        }, 800);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [isAdmin, loadUnseen]);

  const markAll = async () => {
    await supabase.from("orders").update({ seen_by_admin: true }).eq("seen_by_admin", false);
    setUnseen([]);
    setTick((t) => t + 1);
  };

  if (!supabaseConfigured)
    return <Centered>Conecta Supabase en <code>.env.local</code> para usar el panel.</Centered>;
  if (loading)
    return (
      <Centered>
        <Spinner className="text-vino-600" />
      </Centered>
    );
  if (!user)
    return (
      <Centered>
        <p className="font-serif text-2xl font-bold">Panel de administración</p>
        <p className="mt-2 text-cacao/60">Ingresa con tu cuenta de administrador.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-vino-600 px-6 py-3 font-semibold text-white">
          Ingresar
        </Link>
      </Centered>
    );
  if (!isAdmin)
    return (
      <Centered>
        <p className="font-serif text-2xl font-bold">Acceso restringido</p>
        <p className="mt-2 max-w-md text-cacao/60">
          Tu cuenta ({user.email}) no es administradora. Para habilitarla, ejecuta en Supabase el SQL de <code>supabase/make-admin.sql</code>.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-vino-600 px-6 py-3 font-semibold text-white">
          Volver a la tienda
        </Link>
      </Centered>
    );

  return (
    <div className="flex min-h-screen bg-[#f6efe4]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-cacao p-5 text-crema lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/img/logo.webp" alt="PerúBox" width={44} height={44} className="rounded-full" />
          <div>
            <p className="font-serif text-lg font-bold leading-none">PerúBox</p>
            <p className="text-xs text-crema/50">Administración</p>
          </div>
        </Link>
        <nav className="mt-10 space-y-1">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={cn("relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition", active ? "text-cacao" : "text-crema/70 hover:bg-white/5 hover:text-crema")}>
                {active && <motion.span layoutId="adminnav" className="absolute inset-0 rounded-xl bg-oro" />}
                <n.icon className="relative h-5 w-5" />
                <span className="relative">{n.label}</span>
                {n.href === "/admin/pedidos" && unseen.length > 0 && (
                  <span className="relative ml-auto rounded-full bg-vino-500 px-2 text-xs font-bold text-white">{unseen.length}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1 text-sm">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-crema/70 hover:bg-white/5">
            <ExternalLink className="h-4 w-4" /> Ver tienda
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-crema/70 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-kraft/60 bg-[#f6efe4]/85 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Image src="/img/logo.webp" alt="PerúBox" width={36} height={36} className="rounded-full" />
              <span className="font-serif font-bold">Admin</span>
            </div>
            <p className="hidden text-sm text-cacao/60 lg:block">
              Hola, <b className="text-cacao">{profile?.full_name || profile?.username}</b> 👋
            </p>
            <div className="relative">
              <button onClick={() => setBell((v) => !v)} className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-1 ring-kraft" aria-label="Notificaciones">
                <motion.span animate={unseen.length ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}>
                  <Bell className="h-5 w-5 text-cacao" />
                </motion.span>
                {unseen.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-vino-600 px-1 text-[11px] font-bold text-white">{unseen.length}</span>
                )}
              </button>
              <AnimatePresence>
                {bell && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-kraft"
                  >
                    <div className="flex items-center justify-between border-b border-kraft/60 px-4 py-3">
                      <p className="font-semibold">Notificaciones de venta</p>
                      {unseen.length > 0 && (
                        <button onClick={markAll} className="text-xs font-semibold text-vino-600">
                          Marcar como vistas
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {unseen.length === 0 && <p className="p-6 text-center text-sm text-cacao/50">No hay ventas nuevas 🙌</p>}
                      {unseen.map((o) => (
                        <Link key={o.id} href={`/admin/pedidos?id=${o.id}`} onClick={() => setBell(false)} className="flex gap-3 border-b border-kraft/40 px-4 py-3 hover:bg-crema">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-vino-50 text-lg">🛍️</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">
                              Venta #{String(o.order_number).padStart(5, "0")} · {pen(o.total_pen)}
                            </span>
                            <span className="block truncate text-xs text-cacao/60">
                              {o.customer_name} → {o.shipping_destination}
                            </span>
                            <span className="block text-[11px] text-cacao/40">{dateTime(o.created_at)}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
            {NAV.map((n) => {
              const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium", active ? "bg-cacao text-crema" : "text-cacao/70")}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <RefreshCtx.Provider value={tick}>
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </RefreshCtx.Provider>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-crema p-6 text-center">{<div>{children}</div>}</div>;
}
