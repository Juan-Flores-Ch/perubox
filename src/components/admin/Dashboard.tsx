"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, DollarSign, Receipt, ShoppingBag, Users } from "lucide-react";
import { useQuery } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { dateTime, pen } from "@/lib/format";
import type { Order, Product } from "@/lib/types";
import { useAdminRefresh } from "./AdminShell";
import { StatusBadge } from "./StatusBadge";

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl font-black sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-cacao/60">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const refresh = useAdminRefresh();
  const { data: orders } = useQuery<Order[]>(() => supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }), [refresh]);
  const { data: products } = useQuery<Product[]>(() => supabase.from("products").select("*").order("stock"), [refresh]);
  const { data: clients } = useQuery<{ id: string }[]>(() => supabase.from("profiles").select("id").eq("role", "customer"), [refresh]);

  const valid = (orders ?? []).filter((o) => o.status !== "cancelado");
  const revenue = valid.reduce((a, o) => a + Number(o.total_pen), 0);
  const today = new Date().toDateString();
  const todayRev = valid.filter((o) => new Date(o.created_at).toDateString() === today).reduce((a, o) => a + Number(o.total_pen), 0);

  // últimos 7 días
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    return {
      label: d.toLocaleDateString("es-PE", { weekday: "short" }),
      total: valid.filter((o) => new Date(o.created_at).toDateString() === key).reduce((a, o) => a + Number(o.total_pen), 0),
    };
  });
  const maxDay = Math.max(...days.map((d) => d.total), 1);

  // productos más vendidos
  const sold = new Map<string, number>();
  valid.forEach((o) => o.order_items?.forEach((it) => sold.set(it.name, (sold.get(it.name) ?? 0) + it.quantity)));
  const top = [...sold.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = top[0]?.[1] ?? 1;

  const low = (products ?? []).filter((p) => p.stock <= 10).slice(0, 6);

  const kpis = [
    { icon: DollarSign, label: "Ingresos totales", value: pen(revenue), sub: `Hoy: ${pen(todayRev)}` },
    { icon: Receipt, label: "Ventas", value: String(valid.length), sub: `${(orders ?? []).filter((o) => !o.seen_by_admin).length} sin revisar` },
    { icon: ShoppingBag, label: "Ticket promedio", value: pen(valid.length ? revenue / valid.length : 0), sub: "por pedido" },
    { icon: Users, label: "Clientes registrados", value: String(clients?.length ?? 0), sub: "base para ofertas" },
  ];

  return (
    <>
      <PageTitle title="Resumen" subtitle="Así va PerúBox hoy" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-kraft/60 sm:p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-vino-50 text-vino-700">
              <k.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs font-medium text-cacao/60">{k.label}</p>
            <p className="font-serif text-2xl font-bold sm:text-3xl">{k.value}</p>
            <p className="text-xs text-cacao/50">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-kraft/60 sm:p-6">
          <h2 className="font-semibold">Ingresos · últimos 7 días</h2>
          <div className="mt-6 flex h-48 items-end gap-2 sm:gap-4">
            {days.map((d, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-cacao/60 opacity-0 transition group-hover:opacity-100">{pen(d.total)}</span>
                <motion.div
                  className="w-full rounded-t-xl bg-gradient-to-t from-vino-700 to-vino-400"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.total / maxDay) * 150 + 4}px` }}
                  transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 80 }}
                />
                <span className="text-xs capitalize text-cacao/60">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-kraft/60 sm:p-6">
          <h2 className="font-semibold">Más vendidos</h2>
          <div className="mt-4 space-y-3">
            {top.length === 0 && <p className="text-sm text-cacao/50">Aún no hay ventas.</p>}
            {top.map(([name, q], i) => (
              <div key={name}>
                <div className="flex justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <span className="font-semibold">{q} u.</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-kraft-light">
                  <motion.div className="h-full rounded-full bg-oro" initial={{ width: 0 }} animate={{ width: `${(q / topMax) * 100}%` }} transition={{ delay: 0.2 + i * 0.08 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-kraft/60 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Últimas ventas</h2>
            <Link href="/admin/pedidos" className="text-sm font-semibold text-vino-600">
              Ver todas →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-kraft/50">
            {(orders ?? []).slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    #{String(o.order_number).padStart(5, "0")} · {o.customer_name}
                    {!o.seen_by_admin && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-vino-500" />}
                  </p>
                  <p className="truncate text-xs text-cacao/50">
                    {dateTime(o.created_at)} · {o.shipping_destination}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="hidden font-semibold sm:inline">{pen(o.total_pen)}</span>
                </div>
              </li>
            ))}
            {(orders ?? []).length === 0 && <p className="py-6 text-center text-sm text-cacao/50">Cuando alguien compre, aparecerá aquí al instante.</p>}
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-kraft/60 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-oro" /> Stock bajo
          </h2>
          <ul className="mt-4 space-y-2">
            {low.length === 0 && <p className="text-sm text-cacao/50">Todo el inventario está bien 👌</p>}
            {low.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl bg-crema px-3 py-2 text-sm">
                <span className="truncate">
                  {p.emoji} {p.name}
                </span>
                <span className={p.stock === 0 ? "font-bold text-vino-600" : "font-semibold text-amber-700"}>{p.stock} u.</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/productos" className="mt-4 inline-block text-sm font-semibold text-vino-600">
            Gestionar inventario →
          </Link>
        </section>
      </div>
    </>
  );
}
