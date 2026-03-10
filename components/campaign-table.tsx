"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { InsightRow, fetchCampaignStatus, changeStatusCampaign } from "@/app/actions/fetch-insights"
import { formatVND, formatNumber } from "@/lib/process-insights"
import type { Lang } from "@/components/dashboard"

const ACTION_TYPE = "onsite_conversion.messaging_conversation_started_7d"

interface StatusConfig {
  label: string
  labelEn: string
  color: string
  active: boolean
  canToggle: boolean
}

const STATUS_MAP: Record<string, StatusConfig> = {
  ACTIVE: { label: "Đang chạy", labelEn: "Active", color: "text-green-600", active: true, canToggle: true },
  PAUSED: { label: "Tạm dừng", labelEn: "Paused", color: "text-yellow-500", active: false, canToggle: true },
  CAMPAIGN_PAUSED: { label: "Campaign dừng", labelEn: "Campaign Paused", color: "text-orange-500", active: false, canToggle: false },
  DELETED: { label: "Đã xóa", labelEn: "Deleted", color: "text-red-500", active: false, canToggle: false },
  ARCHIVED: { label: "Lưu trữ", labelEn: "Archived", color: "text-muted-foreground", active: false, canToggle: false },
  PENDING_REVIEW: { label: "Chờ duyệt", labelEn: "Pending Review", color: "text-blue-500", active: false, canToggle: false },
  DISAPPROVED: { label: "Bị từ chối", labelEn: "Disapproved", color: "text-red-600", active: false, canToggle: false },
  PREAPPROVED: { label: "Pre-approved", labelEn: "Pre-approved", color: "text-blue-400", active: false, canToggle: false },
  PENDING_BILLING_INFO: { label: "Chờ thanh toán", labelEn: "Pending Billing", color: "text-orange-400", active: false, canToggle: false },
}

const dict = {
  vi: {
    title: "Chi Tiết Chiến Dịch",
    campaign: "Chiến Dịch",
    spend: "Chi Tiêu",
    interactions: "Tương Tác",
    status: "Trạng Thái",
    toggle: "Bật/Tắt",
    noData: "Không có dữ liệu chiến dịch",
  },
  en: {
    title: "Campaign Details",
    campaign: "Campaign",
    spend: "Spend",
    interactions: "Interactions",
    status: "Status",
    toggle: "Toggle",
    noData: "No campaign data",
  },
}

interface CampaignRowProps {
  row: InsightRow
  lang: Lang
}

function CampaignRow({ row, lang }: CampaignRowProps) {
  const [status, setStatus] = React.useState<string | null>(null)
  const [statusLoading, setStatusLoading] = React.useState(true)
  const [toggling, setToggling] = React.useState(false)

  React.useEffect(() => {
    fetchCampaignStatus(row.campaign_id).then(({ status: s }) => {
      setStatus(s)
      setStatusLoading(false)
    })
  }, [row.campaign_id])

  const handleToggle = async (checked: boolean) => {
    setToggling(true)
    const result = await changeStatusCampaign({ status: checked, campaign_id: row.campaign_id })
    if (!result.error) {
      setStatus(checked ? "ACTIVE" : "PAUSED")
    }
    setToggling(false)
  }

  const actionValue = row.actions?.find((a) => a.action_type === ACTION_TYPE)?.value ?? "0"
  const cfg = status ? (STATUS_MAP[status] ?? { label: status, labelEn: status, color: "text-muted-foreground", active: false, canToggle: false }) : null

  return (
    <tr className="border-t hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3 min-w-[120px]">
        {statusLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : cfg ? (
          <span className={`text-xs font-mono uppercase tracking-widest ${cfg.color}`}>
            {lang === "vi" ? cfg.label : cfg.labelEn}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        {statusLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : toggling ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : cfg?.canToggle ? (
          <Switch
            checked={cfg.active}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
        ) : (
          <span className="text-xs text-muted-foreground font-mono">—</span>
        )}
      </td>

      <td className="px-4 py-3 max-w-[240px]">
        <p className="font-semibold text-sm leading-tight truncate" title={row.campaign_name}>
          {row.campaign_name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{row.campaign_id}</p>
      </td>

      <td className="px-4 py-3 text-right tabular-nums font-semibold font-mono text-sm">
        {formatVND(parseFloat(row.spend))}
      </td>

      <td className="px-4 py-3 text-right tabular-nums font-mono text-sm">
        {formatNumber(parseInt(actionValue, 10) || 0)}
      </td>
    </tr>
  )
}

interface CampaignTableProps {
  rows: InsightRow[]
  lang: Lang
}

export function CampaignTable({ rows, lang }: CampaignTableProps) {
  const t = dict[lang]

  if (rows.length === 0) {
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
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.status}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.toggle}</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.campaign}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.spend}</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-widest font-normal">{t.interactions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <CampaignRow
                key={`${row.campaign_id}-${idx}`}
                row={row}
                lang={lang}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
