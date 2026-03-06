"use client"

import * as React from "react"
import { Dashboard } from "@/components/dashboard"
import { PinLock } from "@/components/pin-lock"

const STORAGE_KEY = "lvian_ads_unlocked"

export default function Page() {
  const [unlocked, setUnlocked] = React.useState<boolean | null>(null)

  // Read from localStorage after mount (avoids SSR mismatch)
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    setUnlocked(saved === "1")
  }, [])

  const handleUnlock = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setUnlocked(true)
  }

  // Still loading from storage
  if (unlocked === null) return null

  if (!unlocked) {
    return <PinLock onUnlock={handleUnlock} />
  }

  return <Dashboard />
}
