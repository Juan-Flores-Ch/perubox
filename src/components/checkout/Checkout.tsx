"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, FileText, Gift, MapPin, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import AuthPanel from "@/components/AuthPanel";
import { Button, Field, inputCls, ProductArt } from "@/components/ui";
import PaymentStep, { type PaymentResult } from "./PaymentStep";
import InvoiceForm, { EMPTY_INVOICE, invoiceError, type Invoice } from "./InvoiceForm";
import { docCode, docLabel } from "@/lib/invoice";
import type { DocType } from "@/lib/types";
import { boxCount, boxSubtotal, useBox } from "@/store/box";
import { useAuth, useMounted, useSettings, useShippingRates } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { cn, pen, rateLabel, shippingInPen, usd } from "@/lib/format";
import { SCOPE_LABEL, type ShippingScope } from "@/lib/types";

const STEPS = ["Envío", "Tu cuenta", "Pago", "¡Listo!"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ scale: i === step ? 1.1 : 1 }}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-colors",
                i < step ? "bg-vino-600 text-white" : i === step ? "bg-oro text-cacao ring-4 ring-oro/30" : "bg-white/15 text-crema/60",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </motion.span>
            <span className={cn("hidden text-sm font-semibold sm:inline", i <= step ? "text-crema" : "text-crema/50")}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <span className={cn("h-0.5 w-6 rounded sm:w-12", i < step ? "bg-oro" : "bg-white/20")} />}
        </li>
      ))}
    </ol>
  );
}

type Done = { id: string; order_number: number; total_pen: number; doc_type: DocType; doc_series: string; doc_number: number };

export default function Checkout() {
  const mounted = useMounted();
  const { items, shippingRateId, setShipping, details, setDetails, clear } = useBox();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: rates } = useShippingRates();
  const { data: settings } = useSettings();
  const fx = settings?.usd_to_pen ?? 3.75;
  const min = settings?.min_box_items ?? 3;

  const [rawStep, setStep] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [invoice, setInvoice] = useState<Invoice>(EMPTY_INVOICE);
  const rate = useMemo(() => rates?.find((r) => r.id === shippingRateId) ?? null, [rates, shippingRateId]);
  const [pickedScope, setScope] = useState<ShippingScope | null>(null);
  const scope = pickedScope ?? rate?.scope ?? "nacional";
  // Si ya inició sesión (p. ej. al volver de Google/Facebook), el paso "Tu cuenta" se salta solo.
  const step = rawStep === 1 && user && !authLoading ? 2 : rawStep;

  const subtotal = boxSubtotal(items);
  const shipping = shippingInPen(rate, fx);
  const total = subtotal + shipping;
  const shippingOk = Boolean(rate && details.name.trim() && details.phone.trim() && details.address.trim());

  // Prellenar datos con el perfil
  useEffect(() => {
    if (profile && !details.name && profile.full_name) setDetails({ name: profile.full_name });
    if (profile && !details.phone && profile.phone) setDetails({ phone: profile.phone });
  }, [profile, details.name, details.phone, setDetails]);

  const goNext = () => {
    if (!shippingOk) return toast.error("Completa destino, nombre, teléfono y dirección");
    setStep(user ? 2 : 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPay = async (p: PaymentResult) => {
    const { data, error } = await supabase.rpc("place_order", {
      p_items: items.map((i) => ({ product_id: i.product.id, quantity: i.qty })),
      p_shipping_rate_id: shippingRateId,
      p_customer_name: details.name,
      p_customer_phone: details.phone,
      p_address: details.address,
      p_gift_message: details.gift,
      p_payment_method: p.method,
      p_payment_ref: p.ref,
      p_invoice: {
        doc_type: invoice.doc_type,
        customer_doc_type: invoice.doc_type === "factura" ? "RUC" : invoice.customer_doc_number.trim() ? invoice.customer_doc_type : "-",
        customer_doc_number: invoice.customer_doc_number.trim(),
        legal_name: invoice.legal_name,
        fiscal_address: invoice.fiscal_address,
      },
    });
    if (error) {
      toast.error(error.message);
      return false;
    }
    setDone(data as Done);
    clear();
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  };

  if (!mounted) return <div className="min-h-[60vh]" />;

  if (!done && boxCount(items) < min) {
    return (
      <div className="mx-auto max-w-lg px-5 pb-10 pt-40 text-center">
        <p className="text-6xl">📦</p>
        <h1 className="mt-4 font-serif text-3xl font-bold">Tu box necesita al menos {min} productos</h1>
        <p className="mt-2 text-cacao/60">Vuelve al catálogo y termina de armarla.</p>
        <Link href="/arma-tu-box" className="mt-6 inline-flex rounded-full bg-vino-600 px-6 py-3 font-semibold text-white">
          Arma tu Box
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-vino-700 pb-16 pt-32 text-crema">
        <div className="mx-auto max-w-6xl px-5">
          <Stepper step={step} />
        </div>
      </section>

      <div className={cn("mx-auto -mt-8 grid max-w-6xl gap-6 px-5 pb-10", step < 3 && "lg:grid-cols-[1fr_360px]")}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            {step === 0 && (
              <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-vino-900/5 ring-1 ring-kraft/70 sm:p-8">
                <h2 className="font-serif text-2xl font-bold">¿A dónde enviamos tu PerúBox?</h2>
                <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-crema p-1">
                  {(Object.keys(SCOPE_LABEL) as ShippingScope[]).map((s) => (
                    <button key={s} onClick={() => setScope(s)} className={cn("relative rounded-full py-2.5 text-xs font-semibold sm:text-sm", scope === s ? "text-white" : "text-cacao/70")}>
                      {scope === s && <motion.span layoutId="ckscope" className="absolute inset-0 rounded-full bg-vino-600" />}
                      <span className="relative">{SCOPE_LABEL[s]}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {(rates ?? [])
                    .filter((r) => r.scope === scope)
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setShipping(r.id)}
                        className={cn(
                          "rounded-2xl border-2 p-3 text-left transition",
                          shippingRateId === r.id ? "border-vino-600 bg-vino-50" : "border-kraft/70 hover:border-vino-300",
                        )}
                      >
                        <p className="flex items-center gap-1 truncate text-sm font-semibold">
                          {shippingRateId === r.id && <MapPin className="h-3.5 w-3.5 shrink-0 text-vino-600" />}
                          {r.destination}
                        </p>
                        <p className="font-bold text-vino-700">{rateLabel(r)}</p>
                        <p className="text-[11px] text-cacao/50">{r.eta}</p>
                      </button>
                    ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="¿Quién recibe?">
                    <input className={inputCls} value={details.name} onChange={(e) => setDetails({ name: e.target.value })} placeholder="Nombre y apellido" autoComplete="name" />
                  </Field>
                  <Field label="Teléfono / WhatsApp">
                    <input className={inputCls} value={details.phone} onChange={(e) => setDetails({ phone: e.target.value })} placeholder="+51 987 654 321" type="tel" autoComplete="tel" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Dirección completa" hint={scope === "nacional" ? "Calle, número, distrito, provincia y referencia" : "Calle, número, ciudad, código postal y país"}>
                      <textarea rows={2} className={inputCls} value={details.address} onChange={(e) => setDetails({ address: e.target.value })} placeholder="Av. Larco 123, Miraflores, Lima" />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Mensaje de regalo (opcional)">
                      <div className="relative">
                        <Gift className="absolute left-4 top-3.5 h-4 w-4 text-vino-500" />
                        <input className={cn(inputCls, "pl-11")} value={details.gift} onChange={(e) => setDetails({ gift: e.target.value.slice(0, 160) })} placeholder="¡Feliz cumpleaños, hermano! Un pedacito de casa para ti 🇵🇪" />
                      </div>
                    </Field>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                  <Link href="/arma-tu-box" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-cacao/70 hover:bg-crema">
                    <ArrowLeft className="h-4 w-4" /> Editar mi box
                  </Link>
                  <Button onClick={goNext} disabled={!shippingOk} className="py-3.5">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <AuthPanel title="Último paso antes de pagar: identifícate" redirectPath="/checkout" onDone={() => setStep(2)} />
                <button onClick={() => setStep(0)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cacao/60">
                  <ArrowLeft className="h-4 w-4" /> Volver a envío
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                {user && (
                  <p className="mb-4 rounded-2xl bg-white px-5 py-3 text-sm text-cacao/70 shadow ring-1 ring-kraft/70">
                    Comprando como <b className="text-cacao">{profile?.full_name || user.email}</b> · {user.email}
                  </p>
                )}
                <InvoiceForm value={invoice} onChange={setInvoice} total={total} />
                <PaymentStep total={total} settings={settings} onPay={onPay} validate={() => invoiceError(invoice, total)} />
                <button onClick={() => setStep(0)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cacao/60">
                  <ArrowLeft className="h-4 w-4" /> Cambiar envío
                </button>
              </div>
            )}

            {step === 3 && done && <Success done={done} />}
          </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-xl shadow-vino-900/5 ring-1 ring-kraft/70 lg:sticky lg:top-24">
            <h3 className="font-serif text-xl font-bold">Resumen de tu box</h3>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.product.id} className="flex items-center gap-3">
                  <ProductArt product={i.product} className="h-12 w-12 shrink-0 rounded-xl [&_span]:text-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.product.name}</p>
                    <p className="text-xs text-cacao/50">× {i.qty}</p>
                  </div>
                  <span className="text-sm font-semibold">{pen(i.qty * i.product.price)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-dashed border-kraft pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-cacao/70">Productos</dt>
                <dd>{pen(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cacao/70">Envío {rate ? `· ${rate.destination}` : ""}</dt>
                <dd>{rate ? pen(shipping) : "—"}</dd>
              </div>
              {rate?.currency === "USD" && (
                <p className="text-right text-[11px] text-cacao/50">
                  {usd(rate.price)} × TC {fx.toFixed(2)}
                </p>
              )}
              <div className="flex items-end justify-between border-t border-kraft pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="font-serif text-3xl font-bold text-vino-700">{pen(total)}</dd>
              </div>
              <p className="text-right text-xs text-cacao/50">≈ {usd(total / fx)}</p>
            </dl>
          </aside>
        )}
      </div>
    </>
  );
}

function Success({ done }: { done: Done }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: (i * 37) % 100,
        d: (i % 7) * 0.12,
        r: (i * 47) % 360,
        c: ["#b0202c", "#e2a93b", "#3b2116", "#e6c9a1", "#7c1620"][i % 5],
      })),
    [],
  );
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white px-6 py-14 text-center shadow-xl ring-1 ring-kraft/70">
      {confetti.map((c, i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-3 w-2 rounded-sm"
          style={{ left: `${c.x}%`, background: c.c }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 520, rotate: c.r + 360, opacity: 0 }}
          transition={{ duration: 2.4, delay: c.d, ease: "easeIn" }}
        />
      ))}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-vino-600 text-white shadow-xl shadow-vino-700/30">
        <PartyPopper className="h-11 w-11" />
      </motion.div>
      <p className="mt-6 font-script text-3xl text-vino-600">¡Gracias por tu compra!</p>
      <h1 className="font-serif text-4xl font-black">Pedido #{String(done.order_number).padStart(5, "0")}</h1>
      <p className="mx-auto mt-3 max-w-md text-cacao/70">
        Recibimos tu pago de <b className="text-vino-700">{pen(done.total_pen)}</b>. Ya estamos preparando tu PerúBox con mucho cariño. Te
        avisaremos por correo y WhatsApp cuando salga a su destino.
      </p>
      <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-2xl bg-crema p-4 text-left ring-1 ring-kraft">
        <FileText className="h-8 w-8 shrink-0 text-vino-600" />
        <div>
          <p className="text-xs uppercase tracking-wide text-cacao/60">{docLabel(done.doc_type)} de venta electrónica</p>
          <p className="font-mono text-lg font-bold">{docCode(done)}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={`/comprobante?id=${done.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-vino-600 px-6 py-3 font-semibold text-white">
          <FileText className="h-4 w-4" /> Ver mi {docLabel(done.doc_type).toLowerCase()}
        </Link>
        <Link href="/cuenta" className="rounded-full px-6 py-3 font-semibold text-cacao ring-1 ring-kraft">
          Ver mis pedidos
        </Link>
        <Link href="/" className="rounded-full px-6 py-3 font-semibold text-cacao ring-1 ring-kraft">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
