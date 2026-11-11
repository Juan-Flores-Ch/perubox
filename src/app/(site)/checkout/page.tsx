import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";

export const metadata: Metadata = { title: "Finalizar compra · PerúBox" };

export default function CheckoutPage() {
  return <Checkout />;
}
