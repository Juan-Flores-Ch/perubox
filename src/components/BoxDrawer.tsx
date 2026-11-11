"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { boxCount, boxSubtotal, useBox } from "@/store/box";
import { pen } from "@/lib/format";
import { useSettings } from "@/lib/hooks";
import { ProductArt } from "./ui";
import { BoxIcon } from "./SiteHeader";

export default function BoxDrawer() {
  const { items, open, setOpen, setQty, remove } = useBox();
  const { data: settings } = useSettings();
  const min = settings?.min_box_items ?? 3;
  const count = boxCount(items);
  const progress = Math.min(count / min, 1);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-cacao/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-crema shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="andean-band h-3" />
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="font-script text-2xl text-vino-600">Tu</p>
                <h2 className="-mt-2 font-serif text-3xl font-bold">PerúBox</h2>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-kraft-light" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-6 rounded-2xl bg-white p-4 ring-1 ring-kraft">
              <div className="flex justify-between text-xs font-semibold text-cacao/70">
                <span>{count >= min ? "¡Tu box está lista! 🎉" : `Agrega ${min - count} producto(s) más`}</span>
                <span>
                  {count}/{min}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-kraft-light">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-vino-600 to-oro" animate={{ width: `${progress * 100}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <BoxIcon className="mx-auto h-20 w-20 text-kraft" />
                    <p className="mt-4 font-serif text-xl font-semibold">Tu box está vacía</p>
                    <p className="mt-1 text-sm text-cacao/60">Llénala de sabores peruanos.</p>
                    <Link href="/arma-tu-box" onClick={() => setOpen(false)} className="mt-6 inline-flex rounded-full bg-vino-600 px-6 py-3 text-sm font-semibold text-white">
                      Arma tu Box
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map(({ product, qty }) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0 }}
                        className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-kraft/70"
                      >
                        <ProductArt product={product} className="h-20 w-20 shrink-0 rounded-xl [&_span]:text-4xl" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{product.name}</p>
                            <button onClick={() => remove(product.id)} className="text-cacao/40 hover:text-vino-600" aria-label="Quitar">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-cacao/60">{pen(product.price)} c/u</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full bg-crema ring-1 ring-kraft">
                              <button onClick={() => setQty(product.id, qty - 1)} className="grid h-8 w-8 place-items-center" aria-label="Menos">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">{qty}</span>
                              <button onClick={() => setQty(product.id, qty + 1)} disabled={qty >= product.stock} className="grid h-8 w-8 place-items-center disabled:opacity-30" aria-label="Más">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-bold text-vino-700">{pen(qty * product.price)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-kraft bg-white px-6 py-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-cacao/70">Subtotal productos</span>
                  <span className="font-serif text-2xl font-bold">{pen(boxSubtotal(items))}</span>
                </div>
                <p className="mt-1 text-xs text-cacao/50">El envío se calcula en el siguiente paso.</p>
                {count >= min ? (
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-vino-600 py-3.5 font-semibold text-white shadow-lg shadow-vino-700/30 transition hover:bg-vino-700"
                  >
                    Elegir envío y pagar →
                  </Link>
                ) : (
                  <Link href="/arma-tu-box" onClick={() => setOpen(false)} className="mt-4 flex w-full items-center justify-center rounded-full border-2 border-vino-600 py-3 font-semibold text-vino-700">
                    Seguir armando mi box
                  </Link>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
