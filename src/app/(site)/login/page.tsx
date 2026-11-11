import type { Metadata } from "next";
import LoginView from "@/components/LoginView";

export const metadata: Metadata = { title: "Ingresar · PerúBox" };

export default function LoginPage() {
  return <LoginView />;
}
