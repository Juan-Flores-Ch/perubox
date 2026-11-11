import type { Metadata } from "next";
import BoxBuilder from "@/components/BoxBuilder";

export const metadata: Metadata = { title: "Arma tu Box · PerúBox" };

export default function ArmaTuBoxPage() {
  return <BoxBuilder />;
}
