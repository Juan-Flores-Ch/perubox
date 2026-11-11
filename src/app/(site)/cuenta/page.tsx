import type { Metadata } from "next";
import AccountView from "@/components/AccountView";

export const metadata: Metadata = { title: "Mis pedidos · PerúBox" };

export default function CuentaPage() {
  return <AccountView />;
}
