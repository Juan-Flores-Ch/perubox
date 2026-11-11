"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, ImagePlus, Minus, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { cn, pen } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Button, Field, inputCls, ProductArt, Spinner } from "@/components/ui";
import { PageTitle } from "./Dashboard";

const CATEGORIES = ["Bebidas", "Snacks", "Dulces", "Gourmet", "Recuerdos"];
const EMPTY: Partial<Product> = { name: "", description: "", category: "Snacks", price: 0, stock: 0, emoji: "🎁", featured: false, active: true, image_url: null };

export default function ProductsAdmin() {
  const { data, loading, reload } = useProducts(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const list = (data ?? []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const patch = async (p: Product, changes: Partial<Product>) => {
    const { error } = await supabase.from("products").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", p.id);
    if (error) return toast.error(error.message);
    reload();
  };

  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Si ya tiene ventas, mejor desactívalo.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Producto eliminado");
    reload();
  };

  return (
    <>
      <PageTitle title="Productos" subtitle={`${data?.length ?? 0} productos · precios en soles`}>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </PageTitle>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cacao/40" />
        <input className={cn(inputCls, "pl-11")} placeholder="Buscar producto…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <Spinner className="text-vino-600" />}

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {list.map((p) => (
          <motion.div layout key={p.id} className={cn("flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-kraft/60", !p.active && "opacity-60")}>
            <ProductArt product={p} className="h-24 w-24 shrink-0 rounded-2xl [&_span]:text-5xl" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-cacao/50">{p.category}</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <IconBtn title={p.featured ? "Quitar de destacados" : "Destacar"} onClick={() => patch(p, { featured: !p.featured })}>
                    <Star className={cn("h-4 w-4", p.featured && "fill-oro text-oro")} />
                  </IconBtn>
                  <IconBtn title={p.active ? "Ocultar de la tienda" : "Mostrar en la tienda"} onClick={() => patch(p, { active: !p.active })}>
                    {p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn title="Editar" onClick={() => setEditing(p)}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn title="Eliminar" onClick={() => remove(p)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                <p className="font-serif text-xl font-bold text-vino-700">{pen(p.price)}</p>
                <div className="flex items-center gap-1 rounded-full bg-crema ring-1 ring-kraft">
                  <button className="grid h-8 w-8 place-items-center" onClick={() => p.stock > 0 && patch(p, { stock: p.stock - 1 })} aria-label="Restar stock">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className={cn("min-w-10 text-center text-sm font-bold", p.stock <= 10 && "text-vino-600")}>{p.stock}</span>
                  <button className="grid h-8 w-8 place-items-center" onClick={() => patch(p, { stock: p.stock + 1 })} aria-label="Sumar stock">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>{editing && <ProductModal initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}</AnimatePresence>
    </>
  );
}

function IconBtn({ children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="grid h-8 w-8 place-items-center rounded-full text-cacao/60 transition hover:bg-crema hover:text-vino-700" {...p}>
      {children}
    </button>
  );
}

function ProductModal({ initial, onClose, onSaved }: { initial: Partial<Product>; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Partial<Product>>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setF({ ...f, image_url: data.publicUrl });
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: f.name,
      description: f.description,
      category: f.category,
      price: Number(f.price),
      stock: Number(f.stock),
      emoji: f.emoji,
      featured: f.featured,
      active: f.active,
      image_url: f.image_url,
      updated_at: new Date().toISOString(),
    };
    const { error } = f.id ? await supabase.from("products").update(payload).eq("id", f.id) : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(f.id ? "Producto actualizado" : "Producto creado");
    onSaved();
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-end bg-cacao/50 backdrop-blur-sm sm:place-items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 sm:rounded-[2rem] sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">{f.id ? "Editar producto" : "Nuevo producto"}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-crema">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-[160px_1fr]">
          <div>
            <ProductArt product={{ ...(f as Product), name: f.name || "" }} className="aspect-square w-full rounded-2xl" />
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-kraft py-2 text-xs font-semibold text-cacao/70 hover:border-vino-400">
              {uploading ? <Spinner className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />} Subir foto
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            {f.image_url && (
              <button type="button" onClick={() => setF({ ...f, image_url: null })} className="mt-1 w-full text-xs text-cacao/50 hover:text-vino-600">
                Quitar foto
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nombre">
                <input required className={inputCls} value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Descripción">
                <textarea rows={2} className={inputCls} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} />
              </Field>
            </div>
            <Field label="Precio (S/)">
              <input required type="number" step="0.10" min="0" className={inputCls} value={f.price ?? 0} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
            </Field>
            <Field label="Stock (unidades)">
              <input required type="number" min="0" className={inputCls} value={f.stock ?? 0} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} />
            </Field>
            <Field label="Categoría">
              <select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Emoji (si no hay foto)">
              <input className={inputCls} value={f.emoji ?? ""} onChange={(e) => setF({ ...f, emoji: e.target.value })} maxLength={4} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-vino-600" checked={!!f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Destacado en la portada
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-vino-600" checked={!!f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Visible en la tienda
            </label>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy || uploading}>
            {busy ? <Spinner /> : "Guardar"}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
