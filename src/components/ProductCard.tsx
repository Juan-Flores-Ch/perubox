"use client";

import { motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBox } from "@/store/box";
import { useMounted } from "@/lib/hooks";
import { cn, pen } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductArt } from "./ui";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useBox((s) => s.add);
  const inBox = useBox((s) => s.items.find((i) => i.product.id === product.id)?.qty ?? 0);
  const mounted = useMounted();
  const qty = mounted ? inBox : 0;
  const soldOut = product.stock < 1;
  const maxed = qty >= product.stock;

  const onAdd = () => {
    if (soldOut || maxed) return;
    add(product);
    toast.success(`${product.emoji ?? ""} ${product.name} se agregó a tu box`, { duration: 1600 });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-kraft/70 transition-shadow hover:shadow-2xl hover:shadow-vino-900/10"
    >
      <div className="relative">
        <ProductArt product={product} className="aspect-[4/3.2] transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cacao backdrop-blur">
          {product.category}
        </span>
        {product.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-oro px-2.5 py-1 text-[11px] font-bold text-cacao">★ Favorito</span>
        )}
        {qty > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-3 right-3 grid h-9 min-w-9 place-items-center rounded-full bg-vino-600 px-2 text-sm font-bold text-white shadow-lg"
          >
            ×{qty}
          </motion.span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-serif text-lg font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-cacao/60">{product.description}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="font-serif text-2xl font-bold text-vino-700">{pen(product.price)}</p>
            <p className={cn("text-[11px] font-medium", product.stock <= 10 ? "text-vino-500" : "text-cacao/50")}>
              {soldOut ? "Agotado" : product.stock <= 10 ? `¡Solo quedan ${product.stock}!` : `${product.stock} disponibles`}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onAdd}
            disabled={soldOut || maxed}
            className={cn(
              "grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40",
              qty > 0 ? "bg-cacao" : "bg-vino-600 shadow-vino-700/30 hover:bg-vino-700",
            )}
            aria-label={`Agregar ${product.name}`}
          >
            {maxed && qty > 0 ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-kraft/60">
      <div className="aspect-[4/3.2] animate-pulse bg-kraft-light" />
      <div className="space-y-2 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-kraft-light" />
        <div className="h-3 w-full animate-pulse rounded bg-kraft-light" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-kraft-light" />
      </div>
    </div>
  );
}
