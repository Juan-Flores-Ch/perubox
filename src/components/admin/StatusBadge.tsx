import { cn } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

const COLORS: Record<OrderStatus, string> = {
  pagado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  preparando: "bg-amber-50 text-amber-700 ring-amber-200",
  enviado: "bg-sky-50 text-sky-700 ring-sky-200",
  entregado: "bg-violet-50 text-violet-700 ring-violet-200",
  cancelado: "bg-stone-100 text-stone-500 ring-stone-200",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", COLORS[status])}>{STATUS_LABEL[status]}</span>;
}
