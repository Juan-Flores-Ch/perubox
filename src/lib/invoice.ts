import type { DocType, Order } from "./types";

export const IGV_RATE = 0.18;

/** Valida un RUC peruano con el dígito verificador (módulo 11). */
export function rucValido(ruc: string) {
  if (!/^(10|15|17|20)\d{9}$/.test(ruc)) return false;
  const w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const s = w.reduce((a, wi, i) => a + Number(ruc[i]) * wi, 0);
  let r = 11 - (s % 11);
  if (r === 10) r = 0;
  if (r === 11) r = 1;
  return r === Number(ruc[10]);
}

export const docLabel = (t: DocType | null) => (t === "factura" ? "Factura" : "Boleta");

export const docCode = (o: Pick<Order, "doc_series" | "doc_number">) =>
  o.doc_series && o.doc_number != null ? `${o.doc_series}-${String(o.doc_number).padStart(8, "0")}` : "—";

/** Desglose con IGV incluido en el precio (como se vende al público en Perú). */
export function breakdown(total: number) {
  const gravada = Math.round((total / (1 + IGV_RATE)) * 100) / 100;
  return { gravada, igv: Math.round((total - gravada) * 100) / 100, total };
}

const UNI = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
const DEC = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CEN = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

function hasta999(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100);
  const r = n % 100;
  let txt = CEN[c];
  if (r) {
    const d = r < 30 ? UNI[r] : DEC[Math.floor(r / 10)] + (r % 10 ? " Y " + UNI[r % 10] : "");
    txt = (txt ? txt + " " : "") + d;
  }
  return txt;
}

/** 37.5 → "TREINTA Y SIETE CON 50/100 SOLES" */
export function montoEnLetras(monto: number) {
  const entero = Math.floor(monto);
  const cent = Math.round((monto - entero) * 100);
  const miles = Math.floor(entero / 1000);
  const resto = entero % 1000;
  let txt = "";
  if (miles) txt = miles === 1 ? "MIL" : hasta999(miles).replace(/UNO$/, "UN") + " MIL";
  if (resto) txt = (txt ? txt + " " : "") + hasta999(resto);
  if (!txt) txt = "CERO";
  return `${txt} CON ${String(cent).padStart(2, "0")}/100 SOLES`;
}
