"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, Gift, Globe2, Heart, MapPin, Plane, Quote, Sparkles, Truck } from "lucide-react";
import ProductCard, { ProductSkeleton } from "@/components/ProductCard";
import { Chakana, Mountains, MountainMark, Reveal } from "@/components/ui";
import { useProducts, useSettings, useShippingRates } from "@/lib/hooks";
import { cn, pen, rateLabel, shippingInPen } from "@/lib/format";
import { SCOPE_LABEL, type ShippingScope } from "@/lib/types";

/* ============================== HERO ============================== */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBack = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yImg = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // efecto 3D con el mouse sobre la caja
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 14 });

  const words = ["Productos", "peruanos,"];

  return (
    <section ref={ref} className="relative overflow-hidden pb-24 pt-32 sm:pt-36 lg:min-h-[100svh]">
      {/* cielo y montañas en capas (parallax) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fde7d2] via-crema to-crema" />
      <div className="absolute right-[-10%] top-[-10%] -z-10 h-[520px] w-[520px] rounded-full bg-oro/25 blur-3xl" />
      <div className="absolute left-[-15%] top-[30%] -z-10 h-[420px] w-[420px] rounded-full bg-vino-400/15 blur-3xl" />
      <motion.div style={{ y: yBack }} className="absolute inset-x-0 bottom-28 -z-10 text-[#ecd2b8]">
        <Mountains className="h-48 w-full sm:h-64" />
      </motion.div>
      <motion.div style={{ y: yMid }} className="absolute inset-x-0 bottom-10 -z-10 scale-x-[-1] text-[#e3bfa0]/80">
        <Mountains className="h-40 w-full sm:h-52" />
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-crema to-transparent" />

      {/* avión con corazón */}
      <motion.svg
        viewBox="0 0 400 120"
        className="absolute right-4 top-24 hidden w-80 text-vino-600 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.path
          d="M10 100 C 80 100, 120 40, 170 60 S 200 110, 230 80 S 280 20, 360 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, delay: 1, ease: "easeInOut" }}
        />
      </motion.svg>
      <motion.div
        className="absolute right-6 top-20 hidden text-vino-700 md:block"
        initial={{ x: -260, y: 60, opacity: 0, rotate: 10 }}
        animate={{ x: 0, y: 0, opacity: 1, rotate: -12 }}
        transition={{ duration: 2.2, delay: 1, ease: "easeInOut" }}
      >
        <Plane className="h-9 w-9 fill-current" />
      </motion.div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, rotate: -6, y: 20 }}
            animate={{ opacity: 1, rotate: -3, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-script text-3xl text-vino-600 sm:text-4xl"
          >
            ¡Aquí es donde nace PerúBox! <Heart className="inline h-6 w-6 fill-vino-500 text-vino-500" />
          </motion.p>
          <h1 className="mt-3 font-serif text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            {words.map((w, i) => (
              <span key={w} className="mr-3 inline-block overflow-hidden pb-2 align-bottom">
                <motion.span
                  className="inline-block text-cacao"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.35 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
            <br />
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                className="text-shine inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                sabores que unen.
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 max-w-xl text-lg text-cacao/75"
          >
            Lleva un pedacito del Perú a cada rincón del mundo. Elige tus favoritos, arma tu caja personalizada y
            recíbela en casa, en Perú o en cualquier parte del planeta.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/arma-tu-box"
              className="group inline-flex items-center gap-2 rounded-full bg-vino-600 px-7 py-4 font-semibold text-white shadow-xl shadow-vino-700/30 transition hover:bg-vino-700"
            >
              Arma tu Box <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <a href="#productos" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-cacao ring-1 ring-kraft transition hover:ring-vino-400">
              Ver productos
            </a>
          </motion.div>
          <motion.dl
            initial="h"
            animate="v"
            variants={{ v: { transition: { staggerChildren: 0.1, delayChildren: 1.2 } } }}
            className="mt-10 grid max-w-md grid-cols-3 gap-4"
          >
            {[
              ["20+", "productos"],
              ["31", "destinos"],
              ["100%", "peruano"],
            ].map(([n, l]) => (
              <motion.div key={l} variants={{ h: { opacity: 0, y: 12 }, v: { opacity: 1, y: 0 } }} className="border-l-2 border-vino-500/40 pl-3">
                <dt className="font-serif text-3xl font-bold text-vino-700">{n}</dt>
                <dd className="text-xs uppercase tracking-widest text-cacao/60">{l}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>

        {/* Imagen de la caja con efecto 3D */}
        <motion.div style={{ y: yImg }} className="relative mx-auto w-full max-w-lg [perspective:1200px]">
          <motion.div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width - 0.5);
              my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onMouseLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            style={{ rotateX: rx, rotateY: ry }}
            initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 2 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-vino-900/30 ring-8 ring-white"
          >
            <Image src="/img/flyer-2.webp" alt="Caja PerúBox personalizada" fill priority sizes="(max-width:1024px) 90vw, 40vw" className="origin-[50%_44%] scale-[1.75] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-vino-900/40 via-transparent to-transparent" />
          </motion.div>

          {/* sellos flotantes */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: "spring" }}
            className="absolute -left-4 top-10 sm:-left-10"
          >
            <div className="animate-float rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-kraft">
              <p className="text-2xl">🥤🍫🦙</p>
              <p className="text-xs font-semibold text-cacao">Tú eliges qué va</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="absolute -right-2 bottom-16 sm:-right-8"
          >
            <div className="animate-float rounded-2xl bg-cacao px-4 py-3 text-crema shadow-xl [animation-delay:-3s]">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Globe2 className="h-4 w-4 text-oro" /> Envíos al mundo
              </p>
              <p className="text-xs text-crema/60">Perú · América · Europa</p>
            </div>
          </motion.div>
          {/* sello giratorio */}
          <motion.div
            className="absolute -bottom-8 left-6 grid h-28 w-28 place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <motion.svg viewBox="0 0 100 100" className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
              <defs>
                <path id="circ" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
              </defs>
              <circle cx="50" cy="50" r="49" fill="#e2a93b" />
              <text fontSize="10.5" fontWeight="700" letterSpacing="2.6" fill="#3b2116">
                <textPath href="#circ">HECHO EN PERÚ • CON CARIÑO •</textPath>
              </text>
            </motion.svg>
            <Chakana className="relative h-9 w-9 text-vino-700" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================== MARQUEE ============================== */
function Marquee() {
  const items = ["Inca Kola", "Sublime", "Doña Pepa", "Pingüino", "Inka Chips", "Alfajores", "Café de Chanchamayo", "Maca", "Chicha Morada", "Turrón", "Ají Amarillo", "Alpaca"];
  const row = [...items, ...items];
  return (
    <div className="relative -rotate-1 bg-vino-700 py-4 text-crema shadow-xl">
      <div className="andean-band absolute inset-x-0 -top-2 h-2" />
      <div className="flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee gap-10 whitespace-nowrap pr-10">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-serif text-2xl font-semibold italic">
              {t} <Chakana className="h-5 w-5 text-oro" />
            </span>
          ))}
        </div>
      </div>
      <div className="andean-band absolute inset-x-0 -bottom-2 h-2" />
    </div>
  );
}

/* ============================== CÓMO FUNCIONA ============================== */
function HowItWorks() {
  const steps = [
    { icon: Gift, title: "Personaliza tu caja", text: "Elige entre bebidas, dulces, snacks, productos gourmet y recuerdos andinos. Tú decides qué va dentro." },
    { icon: Truck, title: "Recíbela en casa", text: "Envíos a los 24 departamentos del Perú y a más de 15 países de América, Europa, Asia y Oceanía." },
    { icon: Heart, title: "Conecta con tus raíces", text: "Regala sabores que traen recuerdos. Ideal para peruanos en el extranjero y para quien quiere conocer el Perú." },
  ];
  return (
    <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24 sm:px-8">
      <Reveal className="text-center">
        <p className="font-script text-3xl text-vino-600">Así de fácil</p>
        <h2 className="font-serif text-4xl font-bold sm:text-5xl">¿Cómo funciona?</h2>
      </Reveal>
      <div className="relative mt-16 grid gap-8 md:grid-cols-3">
        <motion.div
          className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 origin-left bg-[repeating-linear-gradient(90deg,var(--color-vino-400)_0_10px,transparent_10px_18px)] md:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.15} className="relative text-center">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
              className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-kraft-light to-kraft shadow-lg ring-8 ring-crema"
            >
              <s.icon className="h-10 w-10 text-vino-700" strokeWidth={2.2} />
              <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-vino-600 font-serif text-sm font-bold text-white">
                {i + 1}
              </span>
            </motion.div>
            <h3 className="mt-6 font-serif text-2xl font-bold text-vino-700">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-cacao/70">{s.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================== PRODUCTOS ============================== */
function Products() {
  const { data, loading, error } = useProducts();
  const cats = ["Todos", ...Array.from(new Set((data ?? []).map((p) => p.category)))];
  const [cat, setCat] = useState("Todos");
  const list = (data ?? []).filter((p) => (cat === "Todos" ? p.featured : p.category === cat)).slice(0, 8);

  return (
    <section id="productos" className="relative scroll-mt-28 bg-gradient-to-b from-crema via-kraft-light/60 to-crema py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-script text-3xl text-vino-600">Sabores que traen recuerdos</p>
            <h2 className="font-serif text-4xl font-bold sm:text-5xl">Nuestros favoritos</h2>
          </div>
          <Link href="/arma-tu-box" className="group inline-flex items-center gap-2 font-semibold text-vino-700">
            Ver catálogo completo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition",
                cat === c ? "text-white" : "bg-white text-cacao ring-1 ring-kraft hover:ring-vino-400",
              )}
            >
              {cat === c && <motion.span layoutId="catpill" className="absolute inset-0 rounded-full bg-vino-600" />}
              <span className="relative">{c === "Todos" ? "★ Destacados" : c}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {loading && Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          {!loading && error && <p className="col-span-full rounded-2xl bg-white p-6 text-center text-cacao/60">No se pudieron cargar los productos: {error}</p>}
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9 }}>
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ============================== SHOWCASE ============================== */
function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const perks = [
    { icon: Gift, t: "Regalos únicos y personalizados", d: "Agrega un mensaje y sorprende a quien más quieres." },
    { icon: MapPin, t: "Productos 100% peruanos", d: "Marcas queridas y productores locales de la costa, sierra y selva." },
    { icon: Globe2, t: "Envíos nacionales e internacionales", d: "Empaque reforzado y seguimiento hasta tu puerta." },
  ];
  return (
    <section ref={ref} className="mx-auto grid max-w-7xl items-center gap-14 overflow-hidden px-5 py-24 sm:px-8 lg:grid-cols-2">
      <motion.div style={{ rotate, y }} className="relative mx-auto w-full max-w-md">
        <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-oro/40 to-vino-500/30 blur-2xl" />
        <div className="relative aspect-[2/3] overflow-hidden rounded-[2.5rem] shadow-2xl ring-8 ring-white">
          <Image src="/img/flyer-1.webp" alt="Contenido de una PerúBox" fill sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" />
        </div>
      </motion.div>
      <div>
        <Reveal>
          <p className="font-script text-3xl text-vino-600">Más que una caja</p>
          <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Un pedacito del Perú <span className="text-vino-700">en cada rincón del mundo.</span>
          </h2>
          <p className="mt-5 text-lg text-cacao/70">
            Cada PerúBox se arma a mano en Lima, con papel kraft y textiles inspirados en los tejidos andinos. Es un abrazo que viaja.
          </p>
        </Reveal>
        <ul className="mt-8 space-y-4">
          {perks.map((p, i) => (
            <Reveal key={p.t} delay={0.1 * i}>
              <li className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-kraft/70 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-vino-600 text-white">
                  <p.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold">{p.t}</p>
                  <p className="text-sm text-cacao/60">{p.d}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================== ENVÍOS ============================== */
function Shipping() {
  const { data: rates, loading } = useShippingRates();
  const { data: settings } = useSettings();
  const [scope, setScope] = useState<ShippingScope>("nacional");
  const fx = settings?.usd_to_pen ?? 3.75;
  const list = (rates ?? []).filter((r) => r.scope === scope);

  return (
    <section id="envios" className="relative scroll-mt-28 overflow-hidden bg-cacao py-24 text-crema">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="andean-band h-full w-full [background-size:112px_56px] [background-repeat:repeat]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-script text-3xl text-oro">De nuestra tierra a tu puerta</p>
          <h2 className="font-serif text-4xl font-bold sm:text-5xl">Enviamos a todo el mundo</h2>
          <p className="mx-auto mt-4 max-w-2xl text-crema/70">Tarifas transparentes. Elige tu destino al finalizar tu box y el costo se suma automáticamente.</p>
        </Reveal>

        <div className="mx-auto mt-10 flex w-fit rounded-full bg-white/10 p-1.5">
          {(Object.keys(SCOPE_LABEL) as ShippingScope[]).map((s) => (
            <button key={s} onClick={() => setScope(s)} className={cn("relative rounded-full px-4 py-2.5 text-sm font-semibold transition sm:px-6", scope === s ? "text-cacao" : "text-crema/70 hover:text-crema")}>
              {scope === s && <motion.span layoutId="scopepill" className="absolute inset-0 rounded-full bg-oro" />}
              <span className="relative">{SCOPE_LABEL[s]}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {loading &&
            Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}
          <AnimatePresence mode="popLayout">
            {list.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.025 }}
                className="group rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-oro/50"
              >
                <p className="truncate text-sm font-semibold">{r.destination}</p>
                <p className="mt-1 font-serif text-2xl font-bold text-oro">{rateLabel(r)}</p>
                <p className="text-[11px] text-crema/50">
                  {r.currency === "USD" ? `≈ ${pen(shippingInPen(r, fx))} · ` : ""}
                  {r.eta}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================== TESTIMONIOS ============================== */
function Testimonials() {
  const t = [
    { n: "Lucía M.", c: "Madrid, España", q: "Abrí la caja y olía a mi casa en Arequipa. La Inca Kola y los alfajores me hicieron llorar de felicidad." },
    { n: "Carlos R.", c: "Miami, EE.UU.", q: "Se la regalé a mi esposa que es americana y ahora es fan del Sublime y de la Doña Pepa. ¡Llegó perfecta!" },
    { n: "Andrea P.", c: "Cusco, Perú", q: "Pedí una box para mi hermano en Santiago. Súper fácil armarla y el seguimiento fue muy claro." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal className="text-center">
        <p className="font-script text-3xl text-vino-600">Historias que unen</p>
        <h2 className="font-serif text-4xl font-bold sm:text-5xl">Lo que dicen de nosotros</h2>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {t.map((x, i) => (
          <Reveal key={x.n} delay={i * 0.12}>
            <motion.figure whileHover={{ y: -6, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }} className="relative h-full rounded-3xl bg-white p-7 shadow-sm ring-1 ring-kraft/70">
              <Quote className="h-8 w-8 text-oro" />
              <blockquote className="mt-4 text-cacao/80">“{x.q}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-vino-600 font-serif font-bold text-white">{x.n[0]}</span>
                <span>
                  <span className="block font-semibold">{x.n}</span>
                  <span className="block text-xs text-cacao/60">{x.c}</span>
                </span>
              </figcaption>
            </motion.figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================== CTA ============================== */
function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8">
      <Reveal>
        <div className="kraft relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center shadow-2xl sm:px-16">
          <div className="andean-band absolute inset-x-0 top-0 h-5" />
          <div className="andean-band absolute inset-x-0 bottom-0 h-5" />
          <MountainMark className="mx-auto h-10 w-24 text-vino-700" />
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-black text-cacao sm:text-6xl">
            ¡Descubre, comparte y <span className="text-vino-700">celebra el Perú!</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cacao/70">Arma tu box en menos de 3 minutos. Sin registrarte hasta el momento de pagar.</p>
          <Link href="/arma-tu-box" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-vino-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-vino-700/30 transition hover:scale-105 hover:bg-vino-700">
            <Sparkles className="h-5 w-5" /> Empezar mi PerúBox
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Hero />
      <Marquee />
      <HowItWorks />
      <Products />
      <Showcase />
      <Shipping />
      <Testimonials />
      <FinalCta />
    </>
  );
}
