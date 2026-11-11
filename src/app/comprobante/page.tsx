import type { Metadata } from "next";
import ReceiptView from "@/components/ReceiptView";

export const metadata: Metadata = { title: "Comprobante de venta · PerúBox" };

export default function ComprobantePage() {
  return <ReceiptView />;
}
