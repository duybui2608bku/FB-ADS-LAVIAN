import { InsightRow } from "@/app/actions/fetch-insights"

export type Platform = "WA" | "IG" | "FB" | "OTHER"

export interface PlatformStats {
  platform: Platform
  label: string
  spend: number
  interactions: number
  campaigns: number
}

const PLATFORM_MAP: Record<string, { key: Platform; label: string }> = {
  WA: { key: "WA", label: "WhatsApp" },
  IG: { key: "IG", label: "Instagram" },
  FB: { key: "FB", label: "Facebook" },
}

export function detectPlatform(campaignName: string): Platform {
  const upper = campaignName.trim().toUpperCase()
  for (const prefix of Object.keys(PLATFORM_MAP)) {
    if (upper.startsWith(prefix + " ") || upper.startsWith(prefix + "-") || upper.startsWith(prefix + "_") || upper === prefix) {
      return PLATFORM_MAP[prefix].key
    }
  }
  return "OTHER"
}

export function getPlatformLabel(platform: Platform): string {
  if (platform === "OTHER") return "Other"
  return PLATFORM_MAP[platform]?.label ?? platform
}

export function processInsights(rows: InsightRow[]): {
  byPlatform: PlatformStats[]
  totalSpend: number
  totalInteractions: number
} {
  const map = new Map<Platform, PlatformStats>()

  for (const row of rows) {
    const platform = detectPlatform(row.campaign_name)
    const spend = parseFloat(row.spend) || 0
    const interactions =
      parseInt(
        row.actions?.find(
          (a) => a.action_type === "onsite_conversion.messaging_conversation_started_7d"
        )?.value ?? "0",
        10
      ) || 0

    if (!map.has(platform)) {
      map.set(platform, {
        platform,
        label: getPlatformLabel(platform),
        spend: 0,
        interactions: 0,
        campaigns: 0,
      })
    }

    const entry = map.get(platform)!
    entry.spend += spend
    entry.interactions += interactions
    entry.campaigns += 1
  }

  const ORDER: Platform[] = ["FB", "IG", "WA", "OTHER"]
  const byPlatform = ORDER.map((p) => map.get(p)).filter(Boolean) as PlatformStats[]

  const totalSpend = byPlatform.reduce((s, p) => s + p.spend, 0)
  const totalInteractions = byPlatform.reduce((s, p) => s + p.interactions, 0)

  return { byPlatform, totalSpend, totalInteractions }
}

export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value)
}

export function costPerInteraction(spend: number, interactions: number): number {
  if (interactions === 0) return 0
  return spend / interactions
}
