"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";
import type { Product, Profile, ShippingRate, StoreSettings } from "./types";

/** true solo en el navegador después de hidratar (evita desajustes con datos de localStorage). */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Pequeño helper para cargar datos de Supabase desde el cliente. */
export function useQuery<T>(fn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(supabaseConfigured ? null : "Supabase aún no está configurado");
  const [loading, setLoading] = useState(supabaseConfigured);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let alive = true;
    Promise.resolve(fn()).then(({ data, error }) => {
      if (!alive) return;
      setData(data);
      setError(error?.message ?? null);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}

export const useProducts = (all = false) =>
  useQuery<Product[]>(() => {
    const q = supabase.from("products").select("*").order("featured", { ascending: false }).order("name");
    return all ? q : q.eq("active", true);
  }, [all]);

export const useShippingRates = (all = false) =>
  useQuery<ShippingRate[]>(() => {
    const q = supabase.from("shipping_rates").select("*").order("scope").order("sort_order");
    return all ? q : q.eq("active", true);
  }, [all]);

export const useSettings = () =>
  useQuery<StoreSettings>(() => supabase.from("store_settings").select("*").eq("id", 1).single());

/** Sesión + perfil del usuario actual. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let alive = true;
    const loadProfile = async (s: Session | null) => {
      if (!s) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle();
      if (alive) {
        setProfile(data as Profile | null);
        setLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      loadProfile(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // diferido para no bloquear el callback de auth
      setTimeout(() => loadProfile(s), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, profile, isAdmin: profile?.role === "admin", loading };
}
