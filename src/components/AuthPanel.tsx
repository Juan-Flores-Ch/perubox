"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/format";
import { Button, Field, inputCls, Spinner } from "./ui";

type Provider = "google" | "facebook" | "azure";

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  {
    id: "google",
    label: "Gmail",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2">
        <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
      </svg>
    ),
  },
  {
    id: "azure",
    label: "Hotmail",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
        <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
        <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
        <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
      </svg>
    ),
  },
];

export default function AuthPanel({ redirectPath = "/", onDone, title }: { redirectPath?: string; onDone?: () => void; title?: string }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ username: "", full_name: "", email: "", phone: "", password: "", marketing: true });
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const oauth = async (provider: Provider) => {
    if (!supabaseConfigured) return toast.error("Primero conecta Supabase");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + redirectPath, scopes: provider === "azure" ? "email" : undefined },
    });
    if (error) toast.error(error.message.includes("not enabled") ? `El acceso con ${provider} aún no está habilitado en Supabase` : error.message);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) return toast.error("Primero conecta Supabase");
    setBusy(true);
    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: { data: { username: f.username, full_name: f.full_name, phone: f.phone, marketing_opt_in: f.marketing } },
      });
      setBusy(false);
      if (error) return toast.error(traducir(error.message));
      if (!data.session) return toast.info("Te enviamos un correo para confirmar tu cuenta.");
      toast.success(`¡Bienvenido/a, ${f.full_name || f.username}! 🎉`);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      setBusy(false);
      if (error) return toast.error(traducir(error.message));
      toast.success("¡Qué bueno verte de nuevo!");
    }
    onDone?.();
  };

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-vino-900/5 ring-1 ring-kraft/70 sm:p-8">
      {title && <h2 className="font-serif text-2xl font-bold">{title}</h2>}
      <div className="mt-4 grid grid-cols-2 rounded-full bg-crema p-1">
        {(["register", "login"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={cn("relative rounded-full py-2.5 text-sm font-semibold", mode === m ? "text-white" : "text-cacao/70")}>
            {mode === m && <motion.span layoutId="authtab" className="absolute inset-0 rounded-full bg-vino-600" />}
            <span className="relative">{m === "register" ? "Crear cuenta" : "Ya tengo cuenta"}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => oauth(p.id)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-kraft py-3 text-xs font-semibold text-cacao transition hover:-translate-y-0.5 hover:border-vino-400 hover:shadow-md sm:flex-row sm:justify-center sm:text-sm"
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-cacao/50">
        <span className="h-px flex-1 bg-kraft" /> o con tu correo <span className="h-px flex-1 bg-kraft" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <AnimatePresence initial={false}>
          {mode === "register" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-4 overflow-hidden sm:grid-cols-2">
              <Field label="Usuario">
                <input required className={inputCls} value={f.username} onChange={up("username")} placeholder="juanperez" autoComplete="username" />
              </Field>
              <Field label="Nombre completo">
                <input required className={inputCls} value={f.full_name} onChange={up("full_name")} placeholder="Juan Pérez" autoComplete="name" />
              </Field>
              <Field label="Teléfono / WhatsApp">
                <input required className={inputCls} value={f.phone} onChange={up("phone")} placeholder="+51 987 654 321" type="tel" autoComplete="tel" />
              </Field>
              <div className="hidden sm:block" />
            </motion.div>
          )}
        </AnimatePresence>
        <Field label="Correo electrónico">
          <input required type="email" className={inputCls} value={f.email} onChange={up("email")} placeholder="tucorreo@gmail.com" autoComplete="email" />
        </Field>
        <Field label="Contraseña" hint={mode === "register" ? "Mínimo 6 caracteres" : undefined}>
          <input required minLength={6} type="password" className={inputCls} value={f.password} onChange={up("password")} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </Field>
        {mode === "register" && (
          <label className="flex items-start gap-3 text-sm text-cacao/70">
            <input type="checkbox" checked={f.marketing} onChange={up("marketing")} className="mt-0.5 h-4 w-4 accent-vino-600" />
            Quiero recibir ofertas y novedades de PerúBox por correo y WhatsApp.
          </label>
        )}
        <Button type="submit" disabled={busy} className="w-full py-3.5 text-base">
          {busy ? <Spinner /> : mode === "register" ? "Crear cuenta y continuar" : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}

function traducir(msg: string) {
  if (msg.includes("Invalid login")) return "Correo o contraseña incorrectos";
  if (msg.includes("already registered")) return "Ese correo ya está registrado. Usa “Ya tengo cuenta”.";
  if (msg.includes("Password")) return "La contraseña debe tener al menos 6 caracteres";
  if (msg.includes("Email not confirmed")) return "Confirma tu correo antes de ingresar";
  return msg;
}
