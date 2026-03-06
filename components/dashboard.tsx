"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/date-range-picker"
import { StatsCards } from "@/components/stats-cards"
import { PlatformTable } from "@/components/platform-table"
import { fetchInsights, InsightRow } from "@/app/actions/fetch-insights"
import { processInsights } from "@/lib/process-insights"

export function Dashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [rows, setRows] = React.useState<InsightRow[] | null>(null)

  const handleFetch = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      setError("Vui lòng chọn khoảng ngày.")
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
  }, [])

  const stats = rows ? processInsights(rows) : null

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-sans font-bold tracking-tight uppercase">FB ADS LAVIAN</h1>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs font-sans text-muted-foreground border px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
          Graph API v25.0
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="border p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs font-sans uppercase tracking-widest shrink-0">Khoảng ngày</Label>
            <div className="flex items-center gap-2 min-w-0">
              <DateRangePicker value={dateRange} onChange={setDateRange} className="rounded-none min-w-0" />
              <Button
                onClick={handleFetch}
                disabled={loading}
                title="Tải lại"
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
              <h2 className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Tổng quan</h2>
              <StatsCards
                totalSpend={stats.totalSpend}
                totalInteractions={stats.totalInteractions}
                platformCount={stats.byPlatform.length}
                campaignCount={rows?.length ?? 0}
              />
            </section>
            <section className="space-y-3">
              <h2 className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Chi tiết theo nền tảng</h2>
              <PlatformTable data={stats.byPlatform} totalSpend={stats.totalSpend} />
            </section>


          </>
        )}

        {rows === null && !loading && !error && (
          <div className="border p-16 text-center space-y-2">
            <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Đang tải biểu đồ...</p>
          </div>
        )}
      </div>
    </main>
  )
}
