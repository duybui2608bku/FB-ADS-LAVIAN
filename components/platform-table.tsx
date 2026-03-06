"use client"

import { PlatformStats, formatVND, formatNumber, costPerInteraction } from "@/lib/process-insights"
import type { Lang } from "@/components/dashboard"

const dict = {
  vi: {
    platform: "Nền Tảng",
    spend: "Chi Tiêu",
    spendPct: "% Chi Tiêu",
    interactions: "Tương Tác",
    cpi: "Chi Phí / TT",
    total: "Tổng Cộng",
    noData: "Không có dữ liệu",
  },
  en: {
    platform: "Platform",
    spend: "Spend",
    spendPct: "% Spend",
    interactions: "Interactions",
    cpi: "Cost / Int",
    total: "Total",
    noData: "No data",
  },
}

const PLATFORM_ICONS: Record<string, string> = {
  Facebook: "FB",
  Instagram: "IG",
  WhatsApp: "WA",
  Other: "?",
}

interface PlatformTableProps {
  data: PlatformStats[]
  totalSpend: number
  lang: Lang
}

export function PlatformTable({ data, totalSpend, lang }: PlatformTableProps) {
  const t = dict[lang]

  if (data.length === 0) {
    return (
      <div className="border p-10 text-center text-xs font-mono text-muted-foreground uppercase tracking-widest">
        {t.noData}
      </div>
    )
  }

  return (
    <div className="border rounded-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-foreground text-background">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.platform}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.spend}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest font-normal hidden md:table-cell">{t.spendPct}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.interactions}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest font-normal hidden lg:table-cell">{t.cpi}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const pct = totalSpend > 0 ? (row.spend / totalSpend) * 100 : 0
              const cpi = costPerInteraction(row.spend, row.interactions)
              return (
                <tr
                  key={row.platform}
                  className={`border-t hover:bg-muted/50 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-8 w-8 text-xs font-bold border border-foreground shrink-0">
                        {PLATFORM_ICONS[row.label] ?? row.platform}
                      </span>
                      <div>
                        <p className="font-semibold leading-none">{row.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{row.platform}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatVND(row.spend)}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 bg-muted overflow-hidden rounded-none">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${pct.toFixed(1)}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-xs w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.interactions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums hidden lg:table-cell text-muted-foreground">
                    {formatVND(cpi)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30 font-semibold">
              <td className="px-4 py-3 text-xs uppercase tracking-widest">{t.total}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatVND(totalSpend)}</td>
              <td className="px-4 py-3 hidden md:table-cell" />
              <td className="px-4 py-3 text-right tabular-nums">
                {formatNumber(data.reduce((s, r) => s + r.interactions, 0))}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
