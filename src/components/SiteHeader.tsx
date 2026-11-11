"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { LayoutDashboard, LogOut, Menu, Package, User, X } from "lucide-react";
import { useState } from "react";
import { boxCount, useBox } from "@/store/box";
import { useAuth, useMounted } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#productos", label: "Productos" },
  { href: "/#envios", label: "Envíos" },
  { href: "/arma-tu-box", label: "Arma tu Box" },
];

export function BoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M3 8.5 12 4l9 4.5v9L12 22l-9-4.5z" />
      <path d="M3 8.5 12 13l9-4.5M12 13v9" />
      <path d="m7.5 6.2 9 4.6" />
    </svg>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  const items = useBox((s) => s.items);
  const setOpen = useBox((s) => s.setOpen);
  const mounted = useMounted();
  const count = mounted ? boxCount(items) : 0;
  const { user, profile, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    setUserMenu(false);
    router.push("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 sm:px-5",
          scrolled || pathname !== "/" ? "glass shadow-lg shadow-vino-900/10 ring-1 ring-kraft/60" : "bg-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenu(false)}>
          <Image src="/img/logo.webp" alt="PerúBox" width={44} height={44} className="rounded-full" priority />
          <span translate="no" className="notranslate font-serif text-xl font-bold tracking-tight">
            <span className="text-vino-700">Perú</span>
            <span className="text-cacao">Box</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-cacao/80 transition hover:bg-vino-50 hover:text-vino-700",
                  pathname === l.href && "bg-vino-50 text-vino-700",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            {user ? (
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full bg-cacao text-sm font-bold uppercase text-crema transition hover:scale-105"
                aria-label="Mi cuenta"
              >
                {(profile?.full_name || profile?.username || user.email || "?").slice(0, 1)}
              </button>
            ) : (
              <Link href="/login" className="grid h-10 w-10 place-items-center rounded-full text-cacao transition hover:bg-vino-50" aria-label="Ingresar">
                <User className="h-5 w-5" />
              </Link>
            )}
            <AnimatePresence>
              {userMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-kraft"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold">{profile?.full_name || profile?.username}</p>
                    <p className="truncate text-xs text-cacao/60">{user.email}</p>
                  </div>
                  <Link href="/cuenta" onClick={() => setUserMenu(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-crema">
                    <Package className="h-4 w-4" /> Mis pedidos
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-vino-700 hover:bg-vino-50">
                      <LayoutDashboard className="h-4 w-4" /> Panel administrador
                    </Link>
                  )}
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-crema">
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="relative flex h-10 items-center gap-2 rounded-full bg-vino-600 px-4 text-sm font-semibold text-white shadow-lg shadow-vino-700/30 transition hover:bg-vino-700"
          >
            <BoxIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Mi Box</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-oro px-1 text-[11px] font-bold text-cacao ring-2 ring-crema"
              >
                {count}
              </motion.span>
            )}
          </button>

          <button className="grid h-10 w-10 place-items-center rounded-full text-cacao lg:hidden" onClick={() => setMenu((v) => !v)} aria-label="Menú">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menu && (
          <motion.ul
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl p-2 shadow-xl ring-1 ring-kraft/60 lg:hidden"
          >
            {LINKS.map((l, i) => (
              <motion.li key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={l.href} onClick={() => setMenu(false)} className="block rounded-2xl px-4 py-3 font-medium text-cacao hover:bg-vino-50">
                  {l.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
