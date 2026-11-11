"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, MessageCircle, Printer } from "lucide-react";
import { useAuth, useSettings } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { pen } from "@/lib/format";
import { breakdown, docCode, docLabel, montoEnLetras } from "@/lib/invoice";
import { SCOPE_LABEL, type Order } from "@/lib/types";
import { Spinner } from "./ui";

const SUNAT_DOC: Record<string, string> = { RUC: "6", DNI: "1", CE: "4", PASAPORTE: "7", "-": "0" };
const DOC_NAME: Record<string, string> = { RUC: "RUC", DNI: "DNI", CE: "C.E.", PASAPORTE: "Pasaporte", "-": "Sin documento" };

export default function ReceiptView() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: settings } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (authLoading) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!user || !id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin sesión o sin id no hay nada que cargar
      setStatus("notfound");
      return;
    }
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data as Order | null);
        setStatus(data ? "ok" : "notfound");
      });
  }, [authLoading, user]);

  const issuerRuc = settings?.issuer_ruc ?? "20000000001";

  useEffect(() => {
    if (!order) return;
    // Formato del QR de comprobantes electrónicos SUNAT
    const data = [
      issuerRuc,
      order.doc_type === "factura" ? "01" : "03",
      order.doc_series,
      order.doc_number,
      Number(order.igv_pen ?? breakdown(order.total_pen).igv).toFixed(2),
      Number(order.total_pen).toFixed(2),
      order.created_at.slice(0, 10),
      SUNAT_DOC[order.customer_doc_type ?? "-"] ?? "0",
      order.customer_doc_number ?? "-",
    ].join("|");
    QRCode.toDataURL(data, { margin: 1, width: 220, color: { dark: "#2a1a14", light: "#ffffff" } }).then(setQr);
  }, [order, issuerRuc]);

  if (status === "loading")
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="text-vino-600" />
      </div>
    );

  if (status === "notfound" || !order)
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-5xl">🧾</p>
          <p className="mt-3 font-serif text-2xl font-bold">Comprobante no disponible</p>
          <p className="mt-1 text-cacao/60">{user ? "No encontramos este comprobante en tu cuenta." : "Inicia sesión para ver tus comprobantes."}</p>
          <Link href={user ? "/cuenta" : "/login"} className="mt-6 inline-flex rounded-full bg-vino-600 px-6 py-3 font-semibold text-white">
            {user ? "Ir a mis pedidos" : "Ingresar"}
          </Link>
        </div>
      </div>
    );

  const b = breakdown(Number(order.total_pen));
  const isFactura = order.doc_type === "factura";
  const title = `${docLabel(order.doc_type)} de venta electrónica`;
  const lines = [
    ...(order.order_items ?? []).map((it) => ({ qty: it.quantity, unit: "NIU", desc: it.name, price: Number(it.unit_price), amount: it.unit_price * it.quantity })),
    {
      qty: 1,
      unit: "ZZ",
      desc: `Servicio de envío · ${SCOPE_LABEL[order.shipping_scope]} · ${order.shipping_destination}`,
      price: Number(order.shipping_cost_pen),
      amount: Number(order.shipping_cost_pen),
    },
  ];
  const link = typeof window !== "undefined" ? window.location.href : "";
  const wa = order.customer_phone
    ? `https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${order.customer_name}! Aquí tienes tu ${docLabel(order.doc_type).toLowerCase()} ${docCode(order)} de PerúBox: ${link}`)}`
    : null;

  return (
    <div className="min-h-screen bg-[#efe6d8] px-3 py-6 sm:py-10 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-2">
        <Link href={isAdmin ? "/admin/pedidos" : "/cuenta"} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-cacao hover:bg-white/60">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="flex gap-2">
          {isAdmin && wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white">
              <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
            </a>
          )}
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-vino-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
            <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-[820px] overflow-hidden rounded-2xl bg-white text-[13px] text-ink shadow-2xl print:max-w-none print:rounded-none print:shadow-none">
        <div className="andean-band h-3 print:[print-color-adjust:exact]" />
        <div className="p-6 sm:p-10">
          {/* Cabecera */}
          <header className="grid gap-6 sm:grid-cols-[1fr_260px]">
            <div className="flex gap-4">
              <Image src="/img/logo.webp" alt="PerúBox" width={84} height={84} className="h-20 w-20 rounded-full" />
              <div>
                <p className="font-serif text-xl font-bold">{settings?.issuer_name ?? "PERUBOX S.A.C."}</p>
                <p className="text-cacao/70">{settings?.issuer_address ?? "Lima, Perú"}</p>
                <p className="text-cacao/70">hola@perubox.pe · +51 {settings?.yape_number ?? "987 654 321"}</p>
              </div>
            </div>
            <div className="rounded-xl border-2 border-vino-600 p-4 text-center">
              <p className="font-bold">R.U.C. {issuerRuc}</p>
              <p className="my-1 bg-vino-600 py-1.5 font-bold uppercase text-white print:[print-color-adjust:exact]">{title}</p>
              <p className="font-mono text-lg font-bold">{docCode(order)}</p>
            </div>
          </header>

          {/* Cliente */}
          <section className="mt-6 grid gap-x-6 gap-y-1 rounded-xl bg-crema p-4 sm:grid-cols-2 print:[print-color-adjust:exact]">
            <Row k="Fecha de emisión" v={new Date(order.created_at).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })} />
            <Row k="Moneda" v="SOLES (PEN)" />
            {isFactura ? (
              <>
                <Row k="Razón social" v={order.customer_legal_name ?? ""} />
                <Row k="RUC" v={order.customer_doc_number ?? ""} />
                <Row k="Dirección fiscal" v={order.customer_fiscal_address ?? ""} wide />
              </>
            ) : (
              <>
                <Row k="Cliente" v={order.customer_name} />
                <Row k={DOC_NAME[order.customer_doc_type ?? "-"] ?? "Documento"} v={order.customer_doc_number || "—"} />
              </>
            )}
            <Row k="Forma de pago" v={`Contado · ${order.payment_method.toUpperCase()}`} />
            <Row k="Referencia de pago" v={order.payment_ref ?? "—"} />
            <Row k="Pedido" v={`#${String(order.order_number).padStart(5, "0")}`} />
            <Row k="Entregar en" v={`${order.shipping_destination} — ${order.shipping_address}`} wide />
          </section>

          {/* Detalle */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b-2 border-cacao text-left text-[11px] uppercase tracking-wide">
                  <th className="py-2 pr-2">Cant.</th>
                  <th className="py-2 pr-2">Unid.</th>
                  <th className="py-2 pr-2">Descripción</th>
                  <th className="py-2 pr-2 text-right">P. unit.</th>
                  <th className="py-2 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-b border-kraft/60">
                    <td className="py-2 pr-2">{l.qty}</td>
                    <td className="py-2 pr-2 text-cacao/60">{l.unit}</td>
                    <td className="py-2 pr-2">{l.desc}</td>
                    <td className="py-2 pr-2 text-right">{l.price.toFixed(2)}</td>
                    <td className="py-2 text-right font-semibold">{l.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales + QR */}
          <section className="mt-6 grid items-start gap-6 sm:grid-cols-[1fr_280px]">
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- QR generado como data URL */}
              {qr && <img src={qr} alt="Código QR del comprobante" className="h-28 w-28 shrink-0 rounded-lg ring-1 ring-kraft" />}
              <div className="text-[12px] text-cacao/70">
                <p className="font-semibold text-ink">SON: {montoEnLetras(b.total)}</p>
                <p className="mt-2">Representación impresa de la {title.toLowerCase()}.</p>
                <p>Precios incluyen IGV (18%).</p>
              </div>
            </div>
            <dl className="space-y-1">
              <Total k="Op. gravada" v={pen(b.gravada)} />
              <Total k="IGV (18%)" v={pen(b.igv)} />
              <div className="mt-2 flex justify-between rounded-lg bg-vino-600 px-3 py-2 text-base font-bold text-white print:[print-color-adjust:exact]">
                <dt>Importe total</dt>
                <dd>{pen(b.total)}</dd>
              </div>
            </dl>
          </section>

          <p className="mt-8 rounded-lg border border-dashed border-vino-400 px-4 py-2 text-center text-[11px] text-vino-700">
            Documento SIMULADO con fines académicos (proyecto universitario). No ha sido enviado a SUNAT y no tiene validez tributaria.
          </p>
          {order.gift_message && <p className="mt-4 text-center font-script text-2xl text-vino-600">“{order.gift_message}”</p>}
          <p className="mt-4 text-center text-[11px] text-cacao/50">¡Gracias por llevar un pedacito del Perú contigo! · perubox.pe</p>
        </div>
      </article>
    </div>
  );
}

function Row({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <p className={wide ? "sm:col-span-2" : ""}>
      <span className="font-semibold">{k}: </span>
      <span className="text-cacao/80">{v}</span>
    </p>
  );
}

function Total({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between px-3">
      <dt className="text-cacao/70">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
