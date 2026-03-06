"use client"

import { TrendingUp, MessageCircle, DollarSign, BarChart3 } from "lucide-react"
import { formatVND, formatNumber } from "@/lib/process-insights"

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
      className={`relative border rounded-none p-5 flex flex-col gap-3 ${
        highlight ? "bg-foreground text-background" : "bg-background text-foreground"
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
}

export function StatsCards({ totalSpend, totalInteractions, platformCount, campaignCount }: StatsCardsProps) {
  const cpi = totalInteractions > 0 ? totalSpend / totalInteractions : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border bg-border">
      <StatCard
        title="Tổng Chi Tiêu"
        value={formatVND(totalSpend)}
        sub={`${platformCount} nền tảng`}
        icon={<DollarSign className="h-4 w-4" />}
        highlight
      />
      <StatCard
        title="Tổng Tương Tác"
        value={formatNumber(totalInteractions)}
        sub="conversation started 7d"
        icon={<MessageCircle className="h-4 w-4" />}
      />
      <StatCard
        title="Chi Phí / Tương Tác"
        value={formatVND(cpi)}
        sub="cost per interaction"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        title="Tổng Chiến Dịch"
        value={formatNumber(campaignCount)}
        sub="campaigns trong kỳ"
        icon={<BarChart3 className="h-4 w-4" />}
      />
    </div>
  )
}
