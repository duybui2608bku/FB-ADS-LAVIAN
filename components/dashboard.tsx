"use client"

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Loader2, AlertCircle, RefreshCw, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/date-range-picker"
import { StatsCards } from "@/components/stats-cards"
import { PlatformTable } from "@/components/platform-table"
import { fetchInsights, InsightRow } from "@/app/actions/fetch-insights"
import { processInsights } from "@/lib/process-insights"

export type Lang = "vi" | "en"

const dict = {
  vi: {
    dateRange: "Khoảng ngày",
    reload: "Tải lại",
    overview: "Tổng quan",
    byPlatform: "Chi tiết theo nền tảng",
    loading: "Đang tải...",
    errDate: "Vui lòng chọn khoảng ngày.",
  },
  en: {
    dateRange: "Date range",
    reload: "Reload",
    overview: "Overview",
    byPlatform: "By platform",
    loading: "Loading...",
    errDate: "Please select a date range.",
  },
}

export function Dashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [rows, setRows] = React.useState<InsightRow[] | null>(null)
  const [lang, setLang] = React.useState<Lang>("vi")

  const t = dict[lang]

  const handleFetch = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError(t.errDate)
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchInsights({
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      setRows(null)
    } else {
      setRows(result.data)
    }
  }

  React.useEffect(() => {
    handleFetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = rows ? processInsights(rows) : null

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-sans font-bold tracking-tight uppercase">FB ADS LAVIAN</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-muted-foreground border px-2.5 py-1.5 hover:text-foreground hover:border-foreground transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "vi" ? "VI" : "EN"}
          </button>
          <div className="hidden sm:flex items-center gap-1 text-xs font-sans text-muted-foreground border px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
            Graph API v25.0
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="border p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs font-sans uppercase tracking-widest shrink-0">{t.dateRange}</Label>
            <div className="flex items-center gap-2 min-w-0">
              <DateRangePicker value={dateRange} onChange={setDateRange} className="rounded-none min-w-0" />
              <Button
                onClick={handleFetch}
                disabled={loading}
                title={t.reload}
                className="rounded-none font-sans text-sm uppercase tracking-widest shrink-0 px-3 w-10 h-10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm font-sans text-destructive border border-destructive/40 bg-destructive/5 p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </section>
        {stats && (
          <>
            <section className="space-y-3">
              <h2 className="text-xs font-sans uppercase tracking-widest text-muted-foreground">{t.overview}</h2>
              <StatsCards
                totalSpend={stats.totalSpend}
                totalInteractions={stats.totalInteractions}
                platformCount={stats.byPlatform.length}
                campaignCount={rows?.length ?? 0}
                lang={lang}
              />
            </section>
            <section className="space-y-3">
              <h2 className="text-xs font-sans uppercase tracking-widest text-muted-foreground">{t.byPlatform}</h2>
              <PlatformTable data={stats.byPlatform} totalSpend={stats.totalSpend} lang={lang} />
            </section>


          </>
        )}

        {rows === null && !loading && !error && (
          <div className="border p-16 text-center space-y-2">
            <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">{t.loading}</p>
          </div>
        )}
      </div>
    </main>
  )
}

