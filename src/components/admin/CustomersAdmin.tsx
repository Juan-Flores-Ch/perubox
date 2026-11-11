"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import { useQuery } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { cn, dateTime, pen } from "@/lib/format";
import type { Order, Profile } from "@/lib/types";
import { Button, inputCls } from "@/components/ui";
import { useAdminRefresh } from "./AdminShell";
import { PageTitle } from "./Dashboard";

export default function CustomersAdmin() {
  const refresh = useAdminRefresh();
  const { data: profiles } = useQuery<Profile[]>(() => supabase.from("profiles").select("*").order("created_at", { ascending: false }), [refresh]);
  const { data: orders } = useQuery<Pick<Order, "user_id" | "total_pen" | "status">[]>(() => supabase.from("orders").select("user_id,total_pen,status"), [refresh]);
  const [q, setQ] = useState("");
  const [onlyOptIn, setOnlyOptIn] = useState(false);

  const stats = new Map<string, { n: number; spent: number }>();
  (orders ?? [])
    .filter((o) => o.status !== "cancelado")
    .forEach((o) => {
      const s = stats.get(o.user_id) ?? { n: 0, spent: 0 };
      stats.set(o.user_id, { n: s.n + 1, spent: s.spent + Number(o.total_pen) });
    });

  const list = (profiles ?? []).filter(
    (p) => (!onlyOptIn || p.marketing_opt_in) && `${p.full_name} ${p.email} ${p.username} ${p.phone}`.toLowerCase().includes(q.toLowerCase()),
  );

  const exportCsv = () => {
    const rows = [["Nombre", "Usuario", "Correo", "Teléfono", "Acepta ofertas", "Registro", "Proveedor", "Pedidos", "Total gastado (S/)"]];
    list.forEach((p) => {
      const s = stats.get(p.id);
      rows.push([p.full_name ?? "", p.username ?? "", p.email ?? "", p.phone ?? "", p.marketing_opt_in ? "Sí" : "No", p.created_at, p.provider ?? "", String(s?.n ?? 0), (s?.spent ?? 0).toFixed(2)]);
    });
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `clientes-perubox-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <>
      <PageTitle title="Clientes" subtitle="Tu base de contactos para enviar ofertas y novedades.">
        <Button variant="dark" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Exportar CSV (Excel)
        </Button>
      </PageTitle>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cacao/40" />
          <input className={cn(inputCls, "pl-11")} placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-vino-600" checked={onlyOptIn} onChange={(e) => setOnlyOptIn(e.target.checked)} />
          Solo quienes aceptan ofertas
        </label>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-kraft/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-kraft/50 text-left text-xs uppercase tracking-wide text-cacao/50">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Contacto</th>
              <th className="px-5 py-3">Registro</th>
              <th className="px-5 py-3 text-center">Ofertas</th>
              <th className="px-5 py-3 text-right">Pedidos</th>
              <th className="px-5 py-3 text-right">Gastado</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const s = stats.get(p.id);
              return (
                <tr key={p.id} className="border-b border-kraft/30 last:border-0 hover:bg-crema/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-vino-50 font-bold uppercase text-vino-700">{(p.full_name || p.email || "?")[0]}</span>
                      <div>
                        <p className="font-semibold">
                          {p.full_name || "—"} {p.role === "admin" && <span className="ml-1 rounded bg-oro px-1.5 text-[10px] font-bold">ADMIN</span>}
                        </p>
                        <p className="text-xs text-cacao/50">@{p.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p>{p.email}</p>
                    <p className="text-xs text-cacao/50">{p.phone || "sin teléfono"}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-cacao/60">
                    {dateTime(p.created_at)}
                    <span className="block capitalize">vía {p.provider === "azure" ? "Microsoft" : p.provider}</span>
                  </td>
                  <td className="px-5 py-3 text-center">{p.marketing_opt_in ? "✅" : "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold">{s?.n ?? 0}</td>
                  <td className="px-5 py-3 text-right font-semibold text-vino-700">{pen(s?.spent ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-10 text-center text-cacao/50">Aún no hay clientes registrados.</p>}
      </div>
    </>
  );
}
