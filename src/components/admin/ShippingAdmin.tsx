"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings, useShippingRates } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { cn, pen, shippingInPen } from "@/lib/format";
import { SCOPE_LABEL, type ShippingRate, type ShippingScope, type StoreSettings } from "@/lib/types";
import { Button, Field, inputCls } from "@/components/ui";
import { rucValido } from "@/lib/invoice";
import { PageTitle } from "./Dashboard";

export default function ShippingAdmin() {
  const { data: rates, reload } = useShippingRates(true);
  const { data: settings, reload: reloadSettings } = useSettings();
  const [scope, setScope] = useState<ShippingScope>("nacional");
  const [draft, setDraft] = useState({ destination: "", price: "", eta: "" });
  const fx = settings?.usd_to_pen ?? 3.75;
  const list = (rates ?? []).filter((r) => r.scope === scope);
  const currency = scope === "nacional" ? "PEN" : "USD";

  const update = async (r: ShippingRate, changes: Partial<ShippingRate>) => {
    const { error } = await supabase.from("shipping_rates").update(changes).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.destination} actualizado`, { duration: 1200 });
    reload();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("shipping_rates").insert({
      scope,
      destination: draft.destination,
      price: Number(draft.price),
      currency,
      eta: draft.eta,
      sort_order: list.length + 1,
    });
    if (error) return toast.error(error.message);
    setDraft({ destination: "", price: "", eta: "" });
    toast.success("Destino agregado");
    reload();
  };

  const remove = async (r: ShippingRate) => {
    if (!confirm(`¿Eliminar el destino ${r.destination}?`)) return;
    const { error } = await supabase.from("shipping_rates").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <>
      <PageTitle title="Envíos" subtitle="Tarifas por destino. Nacional en soles; internacional y Europa en dólares." />

      {settings && <SettingsCard key={JSON.stringify(settings)} settings={settings} onSaved={reloadSettings} />}

      <div className="mt-6 flex w-fit rounded-full bg-white p-1 shadow-sm ring-1 ring-kraft/60">
        {(Object.keys(SCOPE_LABEL) as ShippingScope[]).map((s) => (
          <button key={s} onClick={() => setScope(s)} className={cn("relative rounded-full px-4 py-2 text-sm font-semibold", scope === s ? "text-white" : "text-cacao/70")}>
            {scope === s && <motion.span layoutId="shipadm" className="absolute inset-0 rounded-full bg-vino-600" />}
            <span className="relative">
              {SCOPE_LABEL[s]} ({(rates ?? []).filter((r) => r.scope === s).length})
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-kraft/60">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_auto_auto] gap-3 border-b border-kraft/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-cacao/50 md:grid">
          <span>Destino</span>
          <span>Precio ({currency})</span>
          <span>Tiempo estimado</span>
          <span>Activo</span>
          <span />
        </div>
        {list.map((r) => (
          <RateRow key={r.id} rate={r} fx={fx} onSave={(c) => update(r, c)} onDelete={() => remove(r)} />
        ))}
        <form onSubmit={add} className="grid gap-3 bg-crema/60 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <input required className={inputCls} placeholder="Nuevo destino (ej. Uruguay)" value={draft.destination} onChange={(e) => setDraft({ ...draft, destination: e.target.value })} />
          <input required type="number" step="0.5" min="0" className={inputCls} placeholder={`Precio ${currency}`} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          <input className={inputCls} placeholder="ej. 7 a 12 días" value={draft.eta} onChange={(e) => setDraft({ ...draft, eta: e.target.value })} />
          <Button type="submit">
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </form>
      </div>
    </>
  );
}

function RateRow({ rate, fx, onSave, onDelete }: { rate: ShippingRate; fx: number; onSave: (c: Partial<ShippingRate>) => void; onDelete: () => void }) {
  const [price, setPrice] = useState(String(rate.price));
  const [eta, setEta] = useState(rate.eta);
  const dirty = Number(price) !== Number(rate.price) || eta !== rate.eta;
  return (
    <div className="grid grid-cols-2 items-center gap-3 border-b border-kraft/40 px-5 py-3 md:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
      <p className="col-span-2 font-semibold md:col-span-1">{rate.destination}</p>
      <div>
        <input type="number" step="0.5" min="0" className={cn(inputCls, "py-2")} value={price} onChange={(e) => setPrice(e.target.value)} />
        {rate.currency === "USD" && <p className="mt-0.5 text-[11px] text-cacao/50">≈ {pen(shippingInPen({ ...rate, price: Number(price) }, fx))}</p>}
      </div>
      <input className={cn(inputCls, "py-2")} value={eta} onChange={(e) => setEta(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-vino-600" checked={rate.active} onChange={(e) => onSave({ active: e.target.checked })} />
        <span className="md:hidden">Activo</span>
      </label>
      <div className="flex justify-end gap-1">
        {dirty && (
          <button onClick={() => onSave({ price: Number(price), eta })} className="grid h-9 w-9 place-items-center rounded-full bg-vino-600 text-white" title="Guardar">
            <Save className="h-4 w-4" />
          </button>
        )}
        <button onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-full text-cacao/50 hover:bg-crema hover:text-vino-600" title="Eliminar">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SettingsCard({ settings, onSaved }: { settings: StoreSettings; onSaved: () => void }) {
  const [s, setS] = useState(settings);
  const save = async () => {
    const { error } = await supabase
      .from("store_settings")
      .update({
        usd_to_pen: Number(s.usd_to_pen),
        yape_number: s.yape_number,
        yape_holder: s.yape_holder,
        min_box_items: Number(s.min_box_items),
        ...(s.issuer_ruc !== undefined && { issuer_ruc: s.issuer_ruc, issuer_name: s.issuer_name, issuer_address: s.issuer_address }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Configuración guardada");
    onSaved();
  };
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-kraft/60">
      <h2 className="font-semibold">Configuración de la tienda</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Tipo de cambio USD → S/">
          <input type="number" step="0.01" className={inputCls} value={s.usd_to_pen} onChange={(e) => setS({ ...s, usd_to_pen: Number(e.target.value) })} />
        </Field>
        <Field label="Mínimo de productos por box">
          <input type="number" min="1" className={inputCls} value={s.min_box_items} onChange={(e) => setS({ ...s, min_box_items: Number(e.target.value) })} />
        </Field>
        <Field label="Número Yape / Plin">
          <input className={inputCls} value={s.yape_number} onChange={(e) => setS({ ...s, yape_number: e.target.value })} />
        </Field>
        <Field label="Titular">
          <input className={inputCls} value={s.yape_holder} onChange={(e) => setS({ ...s, yape_holder: e.target.value })} />
        </Field>
        <div className="flex items-end">
          <Button onClick={save} className="w-full py-3">
            <Save className="h-4 w-4" /> Guardar
          </Button>
        </div>
      </div>
      {s.issuer_ruc !== undefined ? (
        <>
          <h3 className="mt-6 text-sm font-semibold">Emisor de boletas y facturas</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-[180px_1fr_1.4fr]">
            <Field label="RUC del emisor" hint={rucValido(s.issuer_ruc ?? "") ? "✓ válido" : "✗ RUC no válido"}>
              <input className={cn(inputCls, "font-mono")} value={s.issuer_ruc} onChange={(e) => setS({ ...s, issuer_ruc: e.target.value.replace(/\D/g, "").slice(0, 11) })} />
            </Field>
            <Field label="Razón social">
              <input className={inputCls} value={s.issuer_name} onChange={(e) => setS({ ...s, issuer_name: e.target.value })} />
            </Field>
            <Field label="Dirección fiscal">
              <input className={inputCls} value={s.issuer_address} onChange={(e) => setS({ ...s, issuer_address: e.target.value })} />
            </Field>
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800">Ejecuta supabase/002_comprobantes.sql para configurar el emisor de boletas y facturas.</p>
      )}
    </div>
  );
}
