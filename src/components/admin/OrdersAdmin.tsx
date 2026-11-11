"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { ChevronDown, FileText, Gift, Mail, MapPin, Phone } from "lucide-react";
import { docCode, docLabel } from "@/lib/invoice";
import { toast } from "sonner";
import { useQuery } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { cn, dateTime, pen } from "@/lib/format";
import { SCOPE_LABEL, STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";
import { inputCls, Spinner } from "@/components/ui";
import { useAdminRefresh } from "./AdminShell";
import { PageTitle } from "./Dashboard";
import { StatusBadge } from "./StatusBadge";

const FILTERS: ("todos" | OrderStatus)[] = ["todos", "pagado", "preparando", "enviado", "entregado", "cancelado"];

export default function OrdersAdmin() {
  const refresh = useAdminRefresh();
  const { data, loading, reload } = useQuery<Order[]>(() => supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }), [refresh]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("todos");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leer ?id= tras hidratar
    if (id) setOpen(id);
  }, []);

  const list = (data ?? []).filter(
    (o) =>
      (filter === "todos" || o.status === filter) &&
      `${o.order_number} ${o.customer_name} ${o.customer_email} ${o.shipping_destination}`.toLowerCase().includes(q.toLowerCase()),
  );

  const toggle = async (o: Order) => {
    setOpen(open === o.id ? null : o.id);
    if (!o.seen_by_admin) {
      await supabase.from("orders").update({ seen_by_admin: true }).eq("id", o.id);
      reload();
    }
  };

  const setStatus = async (o: Order, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status, seen_by_admin: true }).eq("id", o.id);
    if (error) return toast.error(error.message);
    toast.success(`Pedido #${String(o.order_number).padStart(5, "0")} → ${STATUS_LABEL[status]}`);
    reload();
  };

  return (
    <>
      <PageTitle title="Ventas" subtitle="Cada compra llega aquí en tiempo real con una notificación." />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize", filter === f ? "bg-cacao text-crema" : "bg-white text-cacao/70 ring-1 ring-kraft/60")}
            >
              {f === "todos" ? "Todos" : STATUS_LABEL[f]} ({f === "todos" ? data?.length ?? 0 : (data ?? []).filter((o) => o.status === f).length})
            </button>
          ))}
        </div>
        <input className={cn(inputCls, "md:max-w-xs")} placeholder="Buscar por #, cliente o destino…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <Spinner className="text-vino-600" />}
      {!loading && list.length === 0 && <p className="rounded-3xl bg-white p-10 text-center text-cacao/50">No hay ventas para mostrar.</p>}

      <div className="space-y-3">
        {list.map((o) => (
          <motion.div layout key={o.id} className={cn("overflow-hidden rounded-3xl bg-white shadow-sm ring-1", o.seen_by_admin ? "ring-kraft/60" : "ring-2 ring-vino-400")}>
            <button onClick={() => toggle(o)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left">
              <span className="font-serif text-lg font-bold">
                #{String(o.order_number).padStart(5, "0")}
                {!o.seen_by_admin && <span className="ml-2 rounded-full bg-vino-600 px-2 py-0.5 align-middle font-sans text-[10px] font-bold uppercase text-white">Nuevo</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {o.customer_name}
                  {o.doc_type && <span className="ml-2 font-mono text-xs font-normal text-cacao/50">{docCode(o)}</span>}
                </span>
                <span className="block truncate text-xs text-cacao/50">
                  {dateTime(o.created_at)} · {o.shipping_destination}
                </span>
              </span>
              <StatusBadge status={o.status} />
              <span className="font-serif text-xl font-bold text-vino-700">{pen(o.total_pen)}</span>
              <ChevronDown className={cn("h-5 w-5 text-cacao/40 transition", open === o.id && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open === o.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="grid gap-6 border-t border-dashed border-kraft px-5 py-5 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-cacao/50">Productos</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {o.order_items?.map((it) => (
                          <li key={it.id} className="flex justify-between gap-2">
                            <span>
                              {it.quantity} × {it.name}
                            </span>
                            <span className="text-cacao/60">{pen(it.unit_price * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-3 space-y-1 border-t border-kraft/50 pt-2 text-sm">
                        <div className="flex justify-between"><dt className="text-cacao/60">Productos</dt><dd>{pen(o.items_total_pen)}</dd></div>
                        <div className="flex justify-between"><dt className="text-cacao/60">Envío</dt><dd>{pen(o.shipping_cost_pen)}</dd></div>
                        <div className="flex justify-between font-bold"><dt>Total</dt><dd>{pen(o.total_pen)}</dd></div>
                      </dl>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cacao/50">Cliente y entrega</p>
                      <p className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-vino-500" /> {o.customer_email}</p>
                      <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-vino-500" /> {o.customer_phone}</p>
                      <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-vino-500" /> {SCOPE_LABEL[o.shipping_scope]} · {o.shipping_destination} — {o.shipping_address}</p>
                      {o.gift_message && <p className="flex gap-2 rounded-xl bg-crema p-2 italic"><Gift className="h-4 w-4 shrink-0 text-vino-500" /> “{o.gift_message}”</p>}
                    </div>
                    <div className="space-y-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cacao/50">Pago</p>
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 font-medium capitalize text-emerald-800">
                        {o.payment_method} · {o.payment_ref}
                      </p>
                      {o.doc_type && (
                        <Link href={`/comprobante?id=${o.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-crema px-3 py-2 ring-1 ring-kraft hover:bg-vino-50">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-vino-600" />
                            <span>
                              <span className="block font-semibold">
                                {docLabel(o.doc_type)} {docCode(o)}
                              </span>
                              <span className="block text-xs text-cacao/60">
                                {o.doc_type === "factura" ? `RUC ${o.customer_doc_number} · ${o.customer_legal_name}` : o.customer_doc_number ? `${o.customer_doc_type} ${o.customer_doc_number}` : "Sin documento"}
                              </span>
                            </span>
                          </span>
                          <span className="text-xs font-semibold text-vino-700">Ver →</span>
                        </Link>
                      )}
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-cacao/50">Estado del pedido</span>
                        <select className={cn(inputCls, "mt-1")} value={o.status} onChange={(e) => setStatus(o, e.target.value as OrderStatus)}>
                          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      {o.customer_phone && (
                        <a
                          href={`https://wa.me/${o.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${o.customer_name}! Tu PerúBox #${String(o.order_number).padStart(5, "0")} está: ${STATUS_LABEL[o.status]} 🇵🇪`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Avisar por WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </>
  );
}
