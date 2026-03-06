"use client"

import { TrendingUp, MessageCircle, DollarSign, BarChart3 } from "lucide-react"
import { formatVND, formatNumber } from "@/lib/process-insights"
import type { Lang } from "@/components/dashboard"

const dict = {
  vi: {
    totalSpend: "Tổng Chi Tiêu",
    totalInteractions: "Tổng Tương Tác",
    cpi: "Chi Phí / Tương Tác",
    totalCampaigns: "Tổng Chiến Dịch",
    platforms: (n: number) => `${n} nền tảng`,
    convStarted: "conversation started 7d",
    costPerInt: "cost per interaction",
    campaignsInPeriod: "campaigns trong kỳ",
  },
  en: {
    totalSpend: "Total Spend",
    totalInteractions: "Total Interactions",
    cpi: "Cost / Interaction",
    totalCampaigns: "Total Campaigns",
    platforms: (n: number) => `${n} platform${n > 1 ? "s" : ""}`,
    convStarted: "conversation started 7d",
    costPerInt: "cost per interaction",
    campaignsInPeriod: "campaigns in period",
  },
}

interface StatCardProps {
  title: string
  value: string
  sub?: string
  icon: React.ReactNode
  highlight?: boolean
}

function StatCard({ title, value, sub, icon, highlight }: StatCardProps) {
  return (
    <div
      className={`relative border rounded-none p-5 flex flex-col gap-3 ${highlight ? "bg-foreground text-background" : "bg-background text-foreground"
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest opacity-60">{title}</span>
        <span className={`opacity-40 ${highlight ? "text-background" : "text-foreground"}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-mono font-bold tracking-tight leading-none">{value}</p>
        {sub && <p className="text-xs font-mono opacity-50 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

interface StatsCardsProps {
  totalSpend: number
  totalInteractions: number
  platformCount: number
  campaignCount: number
  lang: Lang
}

export function StatsCards({ totalSpend, totalInteractions, platformCount, campaignCount, lang }: StatsCardsProps) {
  const cpi = totalInteractions > 0 ? totalSpend / totalInteractions : 0
  const t = dict[lang]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border bg-border">
      <StatCard
        title={t.totalSpend}
        value={formatVND(totalSpend)}
        sub={t.platforms(platformCount)}
        icon={<DollarSign className="h-4 w-4" />}
        highlight
      />
      <StatCard
        title={t.totalInteractions}
        value={formatNumber(totalInteractions)}
        sub={t.convStarted}
        icon={<MessageCircle className="h-4 w-4" />}
      />
      <StatCard
        title={t.cpi}
        value={formatVND(cpi)}
        sub={t.costPerInt}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        title={t.totalCampaigns}
        value={formatNumber(campaignCount)}
        sub={t.campaignsInPeriod}
        icon={<BarChart3 className="h-4 w-4" />}
      />
    </div>
  )
}
