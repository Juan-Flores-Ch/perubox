"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import ProductCard, { ProductSkeleton } from "./ProductCard";
import { BoxIcon } from "./SiteHeader";
import { Mountains } from "./ui";
import { boxCount, boxSubtotal, useBox } from "@/store/box";
import { useMounted, useProducts, useSettings } from "@/lib/hooks";
import { cn, pen } from "@/lib/format";

/** Caja kraft animada donde "caen" los productos elegidos. */
function LiveBox() {
  const items = useBox((s) => s.items);
  const mounted = useMounted();
  const list = mounted ? items : [];
  const { data: settings } = useSettings();
  const min = settings?.min_box_items ?? 3;
  const count = boxCount(list);
  const ready = count >= min;
  const emojis = list.flatMap((i) => Array.from({ length: Math.min(i.qty, 4) }, (_, k) => ({ k: `${i.product.id}-${k}`, e: i.product.emoji || "🎁" }))).slice(0, 18);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-vino-900/5 ring-1 ring-kraft/70">
      <p className="font-script text-2xl text-vino-600">Tu caja en vivo</p>
      <div className="relative mx-auto mt-3 h-48 w-full max-w-xs">
        {/* tapa */}
        <motion.div
          className="kraft absolute inset-x-2 top-0 z-10 h-10 origin-bottom rounded-t-lg shadow-inner"
          animate={{ rotateX: ready ? 0 : 70, y: ready ? 38 : 0, opacity: ready ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          style={{ transformPerspective: 600 }}
        >
          {ready && <p className="pt-2 text-center font-serif text-sm font-bold text-vino-700">PerúBox ✓</p>}
        </motion.div>
        {/* cuerpo */}
        <div className="kraft absolute inset-x-0 bottom-0 h-36 overflow-hidden rounded-b-2xl rounded-t-md shadow-lg">
          <div className="andean-band absolute inset-x-0 bottom-3 h-5" />
          <div className="absolute inset-x-3 top-2 flex flex-wrap content-start justify-center gap-0.5">
            <AnimatePresence>
              {emojis.map(({ k, e }, i) => (
                <motion.span
                  key={k}
                  initial={{ y: -140, opacity: 0, rotate: -30 }}
                  animate={{ y: 0, opacity: 1, rotate: (i % 2 ? 1 : -1) * 8 }}
                  exit={{ y: -60, opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="text-3xl drop-shadow"
                >
                  {e}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs font-semibold text-cacao/70">
          <span>{ready ? "¡Lista para enviar!" : `Mínimo ${min} productos`}</span>
          <span>{count} productos</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-kraft-light">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-vino-600 to-oro" animate={{ width: `${Math.min(count / min, 1) * 100}%` }} />
        </div>
      </div>

      <div className="mt-5 max-h-48 space-y-1.5 overflow-y-auto pr-1 text-sm">
        {list.map((i) => (
          <div key={i.product.id} className="flex justify-between gap-2">
            <span className="truncate text-cacao/80">
              {i.qty} × {i.product.name}
            </span>
            <span className="shrink-0 font-semibold">{pen(i.qty * i.product.price)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-dashed border-kraft pt-4">
        <span className="text-sm text-cacao/70">Subtotal</span>
        <span className="font-serif text-3xl font-bold text-vino-700">{pen(boxSubtotal(list))}</span>
      </div>
      <Link
        href={ready ? "/checkout" : "#"}
        aria-disabled={!ready}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition",
          ready ? "bg-vino-600 text-white shadow-lg shadow-vino-700/30 hover:bg-vino-700" : "pointer-events-none bg-kraft-light text-cacao/40",
        )}
      >
        Elegir envío <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function BoxBuilder() {
  const { data, loading, error } = useProducts();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const items = useBox((s) => s.items);
  const setOpen = useBox((s) => s.setOpen);
  const mounted = useMounted();
  const count = mounted ? boxCount(items) : 0;

  const cats = useMemo(() => ["Todos", ...Array.from(new Set((data ?? []).map((p) => p.category)))], [data]);
  const list = useMemo(
    () =>
      (data ?? []).filter(
        (p) =>
          (cat === "Todos" || p.category === cat) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase())),
      ),
    [data, cat, q],
  );

  return (
    <>
      <section className="relative overflow-hidden bg-vino-700 pb-24 pt-36 text-crema">
        <div className="absolute inset-0 opacity-10">
          <div className="andean-band h-full w-full [background-repeat:repeat]" />
        </div>
        <Mountains className="absolute -bottom-px h-20 w-full text-crema" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-script text-3xl text-oro">
            Primer paso · Elige tus sabores
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl font-black sm:text-6xl"
          >
            Arma tu Box
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-3 max-w-xl text-crema/75">
            Toca el <b>+</b> para agregar productos. Mira cómo se llena tu caja en tiempo real. No necesitas cuenta hasta el momento de pagar.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto -mt-8 grid max-w-7xl gap-8 px-5 pb-10 sm:px-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="sticky top-24 z-20 rounded-3xl bg-white/90 p-3 shadow-lg ring-1 ring-kraft/70 backdrop-blur">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cacao/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busca Inca Kola, alfajores, café…"
                className="w-full rounded-2xl bg-crema py-3 pl-11 pr-4 text-sm outline-none ring-vino-500/30 focus:ring-4"
              />
            </div>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold", cat === c ? "text-white" : "text-cacao hover:bg-crema")}
                >
                  {cat === c && <motion.span layoutId="buildercat" className="absolute inset-0 rounded-full bg-vino-600" />}
                  <span className="relative">{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
            {loading && Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            {error && !loading && <p className="col-span-full rounded-2xl bg-white p-6 text-center text-cacao/60">{error}</p>}
            {!loading && !error && list.length === 0 && (
              <p className="col-span-full rounded-2xl bg-white p-10 text-center text-cacao/60">No encontramos productos con “{q}”.</p>
            )}
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <LiveBox />
          </div>
        </aside>
      </div>

      {/* barra inferior móvil */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
          >
            <button
              onClick={() => setOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-cacao px-5 py-4 text-crema shadow-2xl"
            >
              <span className="flex items-center gap-3">
                <BoxIcon className="h-6 w-6 text-oro" />
                <span className="text-left">
                  <span className="block text-sm font-semibold">{count} productos en tu box</span>
                  <span className="block text-xs text-crema/60">Toca para revisar</span>
                </span>
              </span>
              <span className="font-serif text-xl font-bold text-oro">{pen(boxSubtotal(items))}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
