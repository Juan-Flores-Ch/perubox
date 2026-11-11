"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Aparece suavemente al entrar en pantalla. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...rest
}: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Mountains({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        fill={fill}
        d="M0 220V150l90-48 70 30 110-92 80 64 60-40 130 104 90-62 70 36 120-108 100 88 70-30 110 74 90-56 100 64 80-34 100 50V220z"
      />
    </svg>
  );
}

export function MountainMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 50" className={className} aria-hidden fill="none">
      <path d="M4 46 L38 14 L50 28 L70 4 L116 46" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chakana({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 70" className={className} aria-hidden fill="currentColor">
      <path d="M25 2h20v8h8v8h8v8h7v18h-7v8h-8v8h-8v8H25v-8h-8v-8H9v-8H2V26h7v-8h8v-8h8z M28 9v8h-8v8h-8v20h8v8h8v8h14v-8h8v-8h8V25h-8v-8h-8V9z" />
      <path d="M35 24 46 35 35 46 24 35z" />
    </svg>
  );
}

const CAT_GRADIENT: Record<string, string> = {
  Bebidas: "from-amber-200 via-yellow-100 to-orange-200",
  Snacks: "from-orange-200 via-amber-100 to-red-200",
  Dulces: "from-rose-200 via-orange-100 to-amber-200",
  Gourmet: "from-stone-300 via-amber-100 to-lime-100",
  Recuerdos: "from-red-200 via-rose-100 to-amber-100",
};

/** Imagen del producto o, si no tiene foto, una ilustración con su emoji. */
export function ProductArt({ product, className, big }: { product: Product; className?: string; big?: boolean }) {
  if (product.image_url) {
    return (
      <div className={cn("relative overflow-hidden bg-kraft-light", className)}>
        <Image src={product.image_url} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden bg-gradient-to-br",
        CAT_GRADIENT[product.category] ?? "from-kraft-light to-kraft",
        className,
      )}
    >
      <Chakana className="absolute -right-4 -bottom-4 h-24 w-24 text-white/40" />
      <Chakana className="absolute -left-6 -top-6 h-16 w-16 text-vino-500/10" />
      <span className={cn("relative drop-shadow-[0_10px_12px_rgba(94,17,26,.25)]", big ? "text-8xl" : "text-6xl")}>
        {product.emoji || "🎁"}
      </span>
    </div>
  );
}

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "dark" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-vino-600 text-white shadow-lg shadow-vino-700/25 hover:bg-vino-700",
        variant === "dark" && "bg-cacao text-crema hover:bg-ink",
        variant === "outline" && "border-2 border-vino-600 text-vino-700 hover:bg-vino-600 hover:text-white",
        variant === "ghost" && "text-vino-700 hover:bg-vino-50",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cacao/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cacao/50">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-kraft bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-cacao/35 focus:border-vino-500 focus:ring-4 focus:ring-vino-500/10";

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)} />;
}
