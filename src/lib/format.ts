import type { ShippingRate } from "./types";

export const pen = (n: number) =>
  "S/ " + Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const usd = (n: number) =>
  "US$ " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Costo de envío convertido a soles (los envíos al extranjero se configuran en USD). */
export const shippingInPen = (rate: ShippingRate | null | undefined, fx: number) =>
  !rate ? 0 : rate.currency === "USD" ? Math.round(rate.price * fx * 100) / 100 : Number(rate.price);

export const rateLabel = (rate: ShippingRate) =>
  rate.currency === "USD" ? usd(rate.price) : pen(rate.price);

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
