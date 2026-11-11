"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { docCode, docLabel } from "@/lib/invoice";
import { useAuth, useQuery } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { dateTime, pen } from "@/lib/format";
import { STATUS_LABEL, type Order } from "@/lib/types";
import { Spinner } from "./ui";
import { StatusBadge } from "./admin/StatusBadge";

export default function AccountView() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { data: orders, loading: loadingOrders } = useQuery<Order[]>(
    () => supabase.from("orders").select("*, order_items(*)").eq("user_id", user?.id ?? "").order("created_at", { ascending: false }),
    [user?.id],
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner className="text-vino-600" />
      </div>
    );

  return (
    <section className="mx-auto max-w-4xl px-5 pb-10 pt-32">
      <p className="font-script text-3xl text-vino-600">Hola, {profile?.full_name?.split(" ")[0] || profile?.username}</p>
      <h1 className="font-serif text-4xl font-black">Mis pedidos</h1>

      <div className="mt-8 space-y-4">
        {loadingOrders && <Spinner className="text-vino-600" />}
        {!loadingOrders && (orders ?? []).length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-kraft">
            <p className="text-5xl">📦</p>
            <p className="mt-3 font-semibold">Aún no tienes pedidos</p>
            <Link href="/arma-tu-box" className="mt-4 inline-flex rounded-full bg-vino-600 px-5 py-2.5 text-sm font-semibold text-white">
              Arma tu primera box
            </Link>
          </div>
        )}
        {(orders ?? []).map((o, i) => (
          <motion.article
            key={o.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-kraft/70 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-xl font-bold">Pedido #{String(o.order_number).padStart(5, "0")}</p>
                <p className="text-xs text-cacao/60">{dateTime(o.created_at)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <Timeline status={o.status} />
            <p className="mt-4 text-sm text-cacao/70">
              {o.order_items?.map((it) => `${it.quantity}× ${it.name}`).join(" · ")}
            </p>
            <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-dashed border-kraft pt-3 text-sm">
              <span className="text-cacao/70">
                📍 {o.shipping_destination} · {o.payment_ref}
              </span>
              {o.doc_type && (
                <Link href={`/comprobante?id=${o.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-crema px-3 py-1 text-xs font-semibold text-vino-700 ring-1 ring-kraft hover:bg-vino-50">
                  <FileText className="h-3.5 w-3.5" /> {docLabel(o.doc_type)} {docCode(o)}
                </Link>
              )}
              <span className="font-serif text-xl font-bold text-vino-700">{pen(o.total_pen)}</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Timeline({ status }: { status: Order["status"] }) {
  const flow: Order["status"][] = ["pagado", "preparando", "enviado", "entregado"];
  if (status === "cancelado") return null;
  const idx = flow.indexOf(status);
  return (
    <div className="mt-5 grid grid-cols-4 gap-1">
      {flow.map((s, i) => (
        <div key={s}>
          <div className="h-1.5 overflow-hidden rounded-full bg-kraft-light">
            <motion.div className="h-full bg-vino-600" initial={{ width: 0 }} animate={{ width: i <= idx ? "100%" : 0 }} transition={{ delay: 0.2 + i * 0.15 }} />
          </div>
          <p className={i <= idx ? "mt-1 text-[11px] font-semibold text-vino-700" : "mt-1 text-[11px] text-cacao/40"}>{STATUS_LABEL[s]}</p>
        </div>
      ))}
    </div>
  );
}
