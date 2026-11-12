"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Music, VolumeX } from "lucide-react";
import { cn } from "@/lib/format";

const SRC = "/audio/musica-andina.mp3";
const VOLUME = 0.3;
const PREF_KEY = "perubox-music"; // "off" si el visitante la silenció

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
}
function savePref(v: "on" | "off") {
  try {
    localStorage.setItem(PREF_KEY, v);
  } catch {}
}

/**
 * Música de fondo. Los navegadores no permiten audio automático con sonido,
 * así que arranca con la primera interacción (toque, clic o tecla) y luego
 * sigue sonando al navegar entre páginas. Se puede silenciar con el botón flotante.
 */
export default function BackgroundMusic() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(false);
  const pathname = usePathname();

  const fadeTo = (target: number, then?: () => void) => {
    const a = audio.current;
    if (!a) return;
    if (fade.current) clearInterval(fade.current);
    fade.current = window.setInterval(() => {
      const next = a.volume + (target > a.volume ? 0.03 : -0.05);
      if ((target > a.volume && next >= target) || (target <= a.volume && next <= target)) {
        a.volume = Math.max(0, Math.min(1, target));
        if (fade.current) clearInterval(fade.current);
        then?.();
      } else a.volume = Math.max(0, Math.min(1, next));
    }, 60);
  };

  const start = () => {
    const a = audio.current;
    if (!a) return;
    a.volume = 0;
    a.play()
      .then(() => fadeTo(VOLUME))
      .catch(() => {});
  };

  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.preload = "none";
    audio.current = a;
    const onPlay = () => {
      setPlaying(true);
      setHint(false);
    };
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    let unlock: ((e: Event) => void) | null = null;
    if (readPref() !== "off") {
      unlock = (e: Event) => {
        // El clic en el propio botón de música lo maneja el botón.
        if ((e.target as HTMLElement | null)?.closest?.("[data-music-toggle]")) return;
        remove();
        start();
      };
      const remove = () => ["pointerdown", "keydown", "touchstart"].forEach((t) => window.removeEventListener(t, unlock!));
      ["pointerdown", "keydown", "touchstart"].forEach((t) => window.addEventListener(t, unlock!, { passive: true }));
      const t = window.setTimeout(() => setHint(true), 1500);
      const t2 = window.setTimeout(() => setHint(false), 9000);
      // En el celular, pausa si la persona cambia de app o de pestaña.
      const wasPlaying = { v: false };
      const onVis = () => {
        if (document.hidden) {
          wasPlaying.v = !a.paused;
          a.pause();
        } else if (wasPlaying.v) a.play().catch(() => {});
      };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        remove();
        clearTimeout(t);
        clearTimeout(t2);
        document.removeEventListener("visibilitychange", onVis);
        a.pause();
        a.removeEventListener("play", onPlay);
        a.removeEventListener("pause", onPause);
      };
    }
    return () => {
      a.pause();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se crea una sola vez
  }, []);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      savePref("on");
      start();
    } else {
      savePref("off");
      fadeTo(0, () => a.pause());
    }
  };

  // En "Arma tu Box" el celular tiene una barra fija abajo: subimos el botón.
  const lifted = pathname === "/arma-tu-box";

  return (
    <div className={cn("fixed right-4 z-50 flex items-center gap-2 sm:right-6", lifted ? "bottom-24 lg:bottom-6" : "bottom-4 sm:bottom-6")}>
      <AnimatePresence>
        {hint && !playing && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="rounded-full bg-cacao px-3 py-1.5 text-xs font-semibold text-crema shadow-lg"
          >
            🎵 Activa la música andina
          </motion.span>
        )}
      </AnimatePresence>
      <button
        type="button"
        data-music-toggle
        onClick={toggle}
        aria-label={playing ? "Silenciar música" : "Reproducir música"}
        title={playing ? "Silenciar música" : "Reproducir música"}
        className={cn(
          "relative grid h-12 w-12 place-items-center rounded-full shadow-xl ring-2 transition hover:scale-105",
          playing ? "bg-vino-600 text-white ring-oro/70" : "bg-white text-vino-600 ring-kraft",
        )}
      >
        {playing ? (
          <span className="relative flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-white"
                animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </span>
        ) : (
          <Music className="relative h-5 w-5" />
        )}
        {!playing && <VolumeX className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-cacao p-0.5 text-crema" aria-hidden />}
      </button>
    </div>
  );
}
