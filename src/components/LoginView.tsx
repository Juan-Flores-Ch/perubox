"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import AuthPanel from "./AuthPanel";
import { useAuth } from "@/lib/hooks";

export default function LoginView() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace(isAdmin ? "/admin" : "/cuenta");
  }, [loading, user, isAdmin, router]);

  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fde7d2] to-crema" />
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
          <Image src="/img/logo.webp" alt="PerúBox" width={180} height={180} className="rounded-full shadow-2xl" />
          <h1 className="mt-8 font-serif text-5xl font-black leading-tight">
            Bienvenido/a a la familia <span className="text-vino-700">PerúBox</span>
          </h1>
          <p className="mt-4 text-lg text-cacao/70">Guarda tus pedidos, sigue tus envíos y recibe ofertas exclusivas de sabores peruanos.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AuthPanel redirectPath="/login" />
        </motion.div>
      </div>
    </section>
  );
}
