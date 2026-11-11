"use client";

import { AnimatePresence, motion } from "motion/react";
import { Building2, FileText, User } from "lucide-react";
import { Field, inputCls } from "@/components/ui";
import { cn } from "@/lib/format";
import { rucValido } from "@/lib/invoice";
import type { DocType } from "@/lib/types";

export type Invoice = {
  doc_type: DocType;
  customer_doc_type: "DNI" | "CE" | "PASAPORTE" | "-" | "RUC";
  customer_doc_number: string;
  legal_name: string;
  fiscal_address: string;
};

export const EMPTY_INVOICE: Invoice = { doc_type: "boleta", customer_doc_type: "DNI", customer_doc_number: "", legal_name: "", fiscal_address: "" };

/** Devuelve un mensaje de error o null si los datos del comprobante están completos. */
export function invoiceError(inv: Invoice, total: number): string | null {
  if (inv.doc_type === "factura") {
    if (!rucValido(inv.customer_doc_number)) return "El RUC no es válido. Debe tener 11 dígitos y empezar con 10 o 20.";
    if (inv.legal_name.trim().length < 3) return "Ingresa la razón social de la empresa.";
    if (inv.fiscal_address.trim().length < 5) return "Ingresa la dirección fiscal.";
    return null;
  }
  const n = inv.customer_doc_number.trim();
  if (inv.customer_doc_type === "DNI" && n && !/^\d{8}$/.test(n)) return "El DNI debe tener 8 dígitos.";
  if (total > 700 && !n) return "Para boletas mayores a S/ 700, SUNAT exige identificar al comprador (DNI, CE o pasaporte).";
  return null;
}

export default function InvoiceForm({ value, onChange, total }: { value: Invoice; onChange: (v: Invoice) => void; total: number }) {
  const set = (p: Partial<Invoice>) => onChange({ ...value, ...p });
  const isFactura = value.doc_type === "factura";
  const rucOk = rucValido(value.customer_doc_number);

  return (
    <div className="mb-4 rounded-[2rem] bg-white p-6 shadow-xl shadow-vino-900/5 ring-1 ring-kraft/70 sm:p-8">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
        <FileText className="h-6 w-6 text-vino-600" /> Comprobante de pago
      </h2>
      <p className="mt-1 text-sm text-cacao/60">Elige el documento que necesitas. Lo podrás ver, imprimir o guardar en PDF al terminar.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {(
          [
            { id: "boleta", icon: User, t: "Boleta", d: "Para personas (DNI)" },
            { id: "factura", icon: Building2, t: "Factura", d: "Para empresas (RUC)" },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => set({ doc_type: o.id, customer_doc_type: o.id === "factura" ? "RUC" : "DNI", customer_doc_number: "" })}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
              value.doc_type === o.id ? "border-vino-600 bg-vino-50" : "border-kraft hover:border-vino-300",
            )}
          >
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", value.doc_type === o.id ? "bg-vino-600 text-white" : "bg-crema text-cacao")}>
              <o.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold">{o.t}</span>
              <span className="block text-xs text-cacao/60">{o.d}</span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={value.doc_type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 grid gap-4 sm:grid-cols-2">
          {isFactura ? (
            <>
              <Field label="RUC" hint={value.customer_doc_number.length === 11 ? (rucOk ? "✓ RUC válido" : "✗ El dígito verificador no coincide") : "11 dígitos"}>
                <input className={cn(inputCls, "font-mono")} inputMode="numeric" value={value.customer_doc_number} onChange={(e) => set({ customer_doc_number: e.target.value.replace(/\D/g, "").slice(0, 11) })} placeholder="20123456789" />
              </Field>
              <Field label="Razón social">
                <input className={inputCls} value={value.legal_name} onChange={(e) => set({ legal_name: e.target.value })} placeholder="Mi Empresa S.A.C." />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Dirección fiscal">
                  <input className={inputCls} value={value.fiscal_address} onChange={(e) => set({ fiscal_address: e.target.value })} placeholder="Av. Javier Prado 456, San Isidro, Lima" />
                </Field>
              </div>
            </>
          ) : (
            <>
              <Field label="Tipo de documento">
                <select className={inputCls} value={value.customer_doc_type} onChange={(e) => set({ customer_doc_type: e.target.value as Invoice["customer_doc_type"], customer_doc_number: "" })}>
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </Field>
              <Field label={`Número${total > 700 ? "" : " (opcional)"}`} hint={total > 700 ? "Obligatorio para compras mayores a S/ 700" : "Puedes dejarlo vacío en compras menores a S/ 700"}>
                <input
                  className={cn(inputCls, "font-mono")}
                  value={value.customer_doc_number}
                  inputMode={value.customer_doc_type === "DNI" ? "numeric" : "text"}
                  onChange={(e) =>
                    set({ customer_doc_number: value.customer_doc_type === "DNI" ? e.target.value.replace(/\D/g, "").slice(0, 8) : e.target.value.toUpperCase().slice(0, 15) })
                  }
                  placeholder={value.customer_doc_type === "DNI" ? "12345678" : "A1234567"}
                />
              </Field>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
