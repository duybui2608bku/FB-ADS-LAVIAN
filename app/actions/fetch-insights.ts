"use server"

export interface InsightRow {
  spend: string
  campaign_id: string
  account_name: string
  campaign_name: string
  actions: { action_type: string; value: string }[]
  date_start: string
  date_stop: string
}

export interface FBApiResponse {
  data: InsightRow[]
  error?: { message: string; code: number }
  paging?: { cursors: { before: string; after: string }; next?: string }
}

export interface FetchInsightsParams {
  startDate: string
  endDate: string
}

const AD_ACCOUNT_IDS = [
  "act_1494701561142295",
  "act_1560209974756985",
]

export async function fetchInsights({
  startDate,
  endDate,
}: FetchInsightsParams): Promise<{ data: InsightRow[] | null; error: string | null }> {
  const accessToken = process.env.FB_ACCESS_TOKEN

  if (!accessToken) {
    return { data: null, error: "FB_ACCESS_TOKEN chưa được cấu hình trong Environment Variables." }
  }

  const date = `time_range={"since":"${startDate}","until":"${endDate}"}`
  const filtering = `[{"field":"action_type","operator":"CONTAIN","value":"onsite_conversion.messaging_conversation_started_7d"}]`

  try {
    const results = await Promise.all(
      AD_ACCOUNT_IDS.map(async (accountId) => {
        const url =
          `https://graph.facebook.com/v25.0/${accountId}/insights?fields=spend,campaign_id,account_name,campaign_name,actions` +
          `&level=campaign&${date}&filtering=${encodeURIComponent(filtering)}&limit=5000&access_token=${accessToken}`

        const res = await fetch(url, { cache: "no-store" })
        const json: FBApiResponse = await res.json()

        if (json.error) {
          throw new Error(`Account ${accountId}: ${json.error.message}`)
        }

        return json.data ?? []
      })
    )

    const mergedData = results.flat()
    return { data: mergedData, error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return { data: null, error: msg }
  }
}


export async function fetchCampaignStatus(
  campaign_id: string
): Promise<{ status: string | null; error: string | null }> {
  const accessToken = process.env.FB_ACCESS_TOKEN

  if (!accessToken) {
    return { status: null, error: "FB_ACCESS_TOKEN chưa được cấu hình." }
  }

  try {
    const url = `https://graph.facebook.com/v25.0/${campaign_id}?fields=effective_status&access_token=${accessToken}`
    const res = await fetch(url, { cache: "no-store" })
    const json = await res.json()

    if (json.error) {
      throw new Error(json.error.message)
    }

    return { status: json.effective_status ?? null, error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return { status: null, error: msg }
  }
}

export async function changeStatusCampaign({
  status,
  campaign_id,
}: {
  status: boolean
  campaign_id: string
}): Promise<{ data: any | null; error: string | null }> {
  const accessToken = process.env.FB_ACCESS_TOKEN

  if (!accessToken) {
    return {
      data: null,
      error: "FB_ACCESS_TOKEN chưa được cấu hình trong Environment Variables.",
    }
  }

  const newStatus = status ? "ACTIVE" : "PAUSED"

  try {
    const url = `https://graph.facebook.com/v25.0/${campaign_id}`

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
        access_token: accessToken,
      }),
    })

    const json = await res.json()

    if (json.error) {
      throw new Error(json.error.message)
    }

    return { data: json, error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return { data: null, error: msg }
  }
}