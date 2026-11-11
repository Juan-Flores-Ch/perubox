"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, CreditCard, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Button, Field, inputCls, Spinner } from "@/components/ui";
import { cn, pen } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";

export type PaymentResult = { method: "yape" | "plin" | "tarjeta" | "transferencia"; ref: string };

const METHODS = [
  { id: "yape", label: "Yape", icon: Smartphone, color: "bg-[#742284]" },
  { id: "plin", label: "Plin", icon: Smartphone, color: "bg-[#00b2a9]" },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard, color: "bg-cacao" },
  { id: "transferencia", label: "Transferencia", icon: Building2, color: "bg-[#0a3d8f]" },
] as const;

const luhn = (num: string) => {
  const d = num.replace(/\D/g, "");
  if (d.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
};
const brand = (n: string) => (/^4/.test(n) ? "VISA" : /^5[1-5]/.test(n) ? "MASTERCARD" : /^3[47]/.test(n) ? "AMEX" : "TARJETA");

/** QR decorativo (simulado) generado con un patrón determinístico. */
function FakeQR({ seed }: { seed: string }) {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21,
      y = Math.floor(i / 21);
    const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7;
    if (finder(0, 0) || finder(14, 0) || finder(0, 14)) {
      const lx = x % 14 === x ? x : x - 14,
        ly = y % 14 === y ? y : y - 14;
      return lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
    }
    const h = (x * 73856093) ^ (y * 19349663) ^ seed.length * 83492791;
    return (h >>> 3) % 3 === 0;
  });
  return (
    <svg viewBox="0 0 21 21" className="h-40 w-40" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="white" />
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#1d1d1d" />)}
    </svg>
  );
}

export default function PaymentStep({
  total,
  settings,
  onPay,
  validate,
}: {
  total: number;
  settings: StoreSettings | null;
  onPay: (r: PaymentResult) => Promise<boolean>;
  validate?: () => string | null;
}) {
  const [method, setMethod] = useState<PaymentResult["method"]>("yape");
  const [code, setCode] = useState("");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [flip, setFlip] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const digits = card.number.replace(/\D/g, "");
  const formatted = (digits.match(/.{1,4}/g) ?? []).join(" ");

  const pay = async () => {
    setErr("");
    const pre = validate?.();
    if (pre) return setErr(pre);
    let ref = "";
    if (method === "yape" || method === "plin" || method === "transferencia") {
      if (!/^\d{6,10}$/.test(code)) return setErr("Ingresa el número de operación (6 a 10 dígitos) que te muestra tu app.");
      ref = `${method.toUpperCase()} op. ${code}`;
    } else {
      if (!luhn(digits)) return setErr("El número de tarjeta no es válido. Prueba con 4242 4242 4242 4242.");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) return setErr("Fecha de vencimiento inválida (MM/AA).");
      const [mm, yy] = card.exp.split("/").map(Number);
      if (new Date(2000 + yy, mm) < new Date()) return setErr("La tarjeta está vencida.");
      if (!/^\d{3,4}$/.test(card.cvv)) return setErr("CVV inválido.");
      if (card.name.trim().length < 3) return setErr("Escribe el nombre como figura en la tarjeta.");
      // Nunca guardamos el número completo: solo marca y últimos 4 dígitos
      ref = `${brand(digits)} •••• ${digits.slice(-4)}`;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1800)); // simula la pasarela
    const ok = await onPay({ method, ref });
    setBusy(false);
    if (!ok) setErr("No se pudo completar el pago. Revisa el mensaje e inténtalo otra vez.");
  };

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-vino-900/5 ring-1 ring-kraft/70 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Método de pago</h2>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Lock className="h-3.5 w-3.5" /> Pago seguro (simulado)
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMethod(m.id);
              setErr("");
              setCode("");
            }}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-sm font-semibold transition",
              method === m.id ? "border-vino-600 bg-vino-50 text-vino-800" : "border-kraft text-cacao hover:border-vino-300",
            )}
          >
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl text-white", m.color)}>
              <m.icon className="h-5 w-5" />
            </span>
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={method} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-6">
          {(method === "yape" || method === "plin") && (
            <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <div className={cn("mx-auto rounded-3xl p-4 text-center text-white", method === "yape" ? "bg-[#742284]" : "bg-[#00b2a9]")}>
                <p className="mb-2 font-bold">{method === "yape" ? "Yapea" : "Plinea"} a PerúBox</p>
                <div className="rounded-2xl bg-white p-2">
                  <FakeQR seed={method + total} />
                </div>
                <p className="mt-2 text-sm font-semibold">{settings?.yape_number ?? "987 654 321"}</p>
                <p className="text-xs opacity-80">{settings?.yape_holder ?? "PerúBox SAC"}</p>
              </div>
              <div className="space-y-4">
                <ol className="space-y-2 text-sm text-cacao/75">
                  <li>1. Abre tu app {method === "yape" ? "Yape" : "Plin"} y escanea el QR o usa el número.</li>
                  <li>
                    2. Envía exactamente <b className="text-vino-700">{pen(total)}</b>.
                  </li>
                  <li>3. Escribe abajo el número de operación.</li>
                </ol>
                <Field label="N.º de operación" hint="Para la demo, cualquier número de 6 dígitos funciona (ej. 123456).">
                  <input className={inputCls} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="123456" />
                </Field>
              </div>
            </div>
          )}

          {method === "transferencia" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["BCP Soles", "191-2345678-0-12", "CCI 002-191-002345678012-55"],
                  ["Interbank Soles", "200-3001234567", "CCI 003-200-003001234567-41"],
                ].map(([b, n, c]) => (
                  <div key={b} className="rounded-2xl bg-crema p-4 ring-1 ring-kraft">
                    <p className="text-xs font-semibold uppercase tracking-wide text-cacao/60">{b}</p>
                    <p className="mt-1 font-mono text-lg font-bold">{n}</p>
                    <p className="font-mono text-xs text-cacao/60">{c}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-cacao/70">
                Titular: <b>{settings?.yape_holder ?? "PerúBox SAC"}</b> · Monto: <b className="text-vino-700">{pen(total)}</b>
              </p>
              <Field label="N.º de operación" hint="Para la demo usa cualquier número de 6 dígitos.">
                <input className={inputCls} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="123456" />
              </Field>
            </div>
          )}

          {method === "tarjeta" && (
            <div className="grid items-start gap-6 md:grid-cols-[300px_1fr]">
              {/* tarjeta 3D */}
              <div className="mx-auto h-[180px] w-[290px] [perspective:1000px]">
                <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: 0.6 }}>
                  <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-vino-600 via-vino-800 to-cacao p-5 text-white shadow-2xl [backface-visibility:hidden]">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-oro/20" />
                    <div className="flex items-center justify-between">
                      <span className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-200 to-oro" />
                      <span className="text-sm font-black italic tracking-wider">{brand(digits)}</span>
                    </div>
                    <p className="font-mono text-xl tracking-widest">{formatted.padEnd(19, "•").replace(/(.{4})(?=.)/g, "$1") || "•••• •••• •••• ••••"}</p>
                    <div className="flex justify-between text-xs uppercase">
                      <span className="max-w-[170px] truncate">{card.name || "NOMBRE APELLIDO"}</span>
                      <span>{card.exp || "MM/AA"}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-cacao to-vino-800 text-white shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="mt-6 h-10 bg-black/70" />
                    <div className="mx-5 mt-4 flex h-9 items-center justify-end rounded bg-white/90 px-3 font-mono text-cacao">{card.cvv || "•••"}</div>
                  </div>
                </motion.div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Número de tarjeta" hint="Tarjeta de prueba: 4242 4242 4242 4242">
                    <input className={cn(inputCls, "font-mono")} inputMode="numeric" value={formatted} onFocus={() => setFlip(false)} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="4242 4242 4242 4242" autoComplete="off" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Nombre en la tarjeta">
                    <input className={cn(inputCls, "uppercase")} value={card.name} onFocus={() => setFlip(false)} onChange={(e) => setCard({ ...card, name: e.target.value.slice(0, 26) })} placeholder="JUAN PEREZ" autoComplete="off" />
                  </Field>
                </div>
                <Field label="Vence">
                  <input
                    className={cn(inputCls, "font-mono")}
                    value={card.exp}
                    onFocus={() => setFlip(false)}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setCard({ ...card, exp: v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v });
                    }}
                    placeholder="12/29"
                    autoComplete="off"
                  />
                </Field>
                <Field label="CVV">
                  <input className={cn(inputCls, "font-mono")} inputMode="numeric" value={card.cvv} onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" autoComplete="off" />
                </Field>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {err && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 rounded-xl bg-vino-50 px-4 py-3 text-sm text-vino-700">
            {err}
          </motion.p>
        )}
      </AnimatePresence>

      <Button onClick={pay} disabled={busy} className="mt-6 w-full py-4 text-base">
        {busy ? (
          <>
            <Spinner /> Procesando pago…
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" /> Pagar {pen(total)}
          </>
        )}
      </Button>
      <p className="mt-3 text-center text-xs text-cacao/50">Esta es una pasarela simulada con fines académicos. No se realiza ningún cobro real.</p>
    </div>
  );
}
