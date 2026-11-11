"use client";

import { supabaseConfigured } from "@/lib/supabase";

export default function SetupNotice() {
  if (supabaseConfigured) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl bg-cacao px-5 py-3 text-sm text-crema shadow-2xl">
      ⚙️ <b>Modo configuración:</b> falta conectar Supabase. Crea <code className="rounded bg-white/10 px-1">.env.local</code> con{" "}
      <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
      <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
    </div>
  );
}
