"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

export type BoxItem = { product: Product; qty: number };

export type ShippingDetails = { name: string; phone: string; address: string; gift: string };

type BoxState = {
  items: BoxItem[];
  shippingRateId: string | null;
  details: ShippingDetails;
  setDetails: (d: Partial<ShippingDetails>) => void;
  open: boolean;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setShipping: (id: string | null) => void;
  setOpen: (v: boolean) => void;
};

// La box se guarda en el navegador, así sobrevive al login con Google/Facebook (redirección).
export const useBox = create<BoxState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingRateId: null,
      details: { name: "", phone: "", address: "", gift: "" },
      setDetails: (d) => set({ details: { ...get().details, ...d } }),
      open: false,
      add: (p) => {
        const found = get().items.find((i) => i.product.id === p.id);
        if (found) {
          if (found.qty >= p.stock) return;
          set({ items: get().items.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)) });
        } else {
          if (p.stock < 1) return;
          set({ items: [...get().items, { product: p, qty: 1 }] });
        }
      },
      setQty: (id, qty) =>
        set({
          items: get()
            .items.map((i) => (i.product.id === id ? { ...i, qty: Math.min(Math.max(qty, 0), i.product.stock) } : i))
            .filter((i) => i.qty > 0),
        }),
      remove: (id) => set({ items: get().items.filter((i) => i.product.id !== id) }),
      clear: () => set({ items: [], shippingRateId: null, details: { name: "", phone: "", address: "", gift: "" } }),
      setShipping: (id) => set({ shippingRateId: id }),
      setOpen: (v) => set({ open: v }),
    }),
    { name: "perubox-box", partialize: (s) => ({ items: s.items, shippingRateId: s.shippingRateId, details: s.details }) },
  ),
);

export const boxCount = (items: BoxItem[]) => items.reduce((a, i) => a + i.qty, 0);
export const boxSubtotal = (items: BoxItem[]) => items.reduce((a, i) => a + i.qty * Number(i.product.price), 0);
