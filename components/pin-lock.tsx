"use client"

import * as React from "react"
import { Delete, Globe } from "lucide-react"

const CORRECT_PIN = "7799"

const i18n = {
    vi: {
        title: "Nhập mã PIN",
        subtitle: "Vui lòng nhập mã PIN để tiếp tục",
        error: "Mã PIN không đúng. Thử lại.",
        lang: "EN",
    },
    en: {
        title: "Enter PIN",
        subtitle: "Please enter your PIN to continue",
        error: "Incorrect PIN. Please try again.",
        lang: "VI",
    },
}

export function PinLock({ onUnlock }: { onUnlock: () => void }) {
    const [pin, setPin] = React.useState("")
    const [error, setError] = React.useState(false)
    const [shake, setShake] = React.useState(false)
    const [lang, setLang] = React.useState<"vi" | "en">("vi")

    const t = i18n[lang]

    const handleDigit = (digit: string) => {
        if (pin.length >= 4) return
        const next = pin + digit
        setPin(next)
        setError(false)

        if (next.length === 4) {
            if (next === CORRECT_PIN) {
                setTimeout(() => onUnlock(), 200)
            } else {
                setShake(true)
                setError(true)
                setTimeout(() => {
                    setPin("")
                    setShake(false)
                }, 600)
            }
        }
    }

    const handleDelete = () => {
        setPin((p) => p.slice(0, -1))
        setError(false)
    }

    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"]

    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="w-full max-w-xs px-6 space-y-8">

                {/* Lang toggle */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setLang(lang === "vi" ? "en" : "vi")}
                        className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-muted-foreground border px-2.5 py-1.5 hover:text-foreground hover:border-foreground transition-colors"
                    >
                        <Globe className="h-3.5 w-3.5" />
                        {lang === "vi" ? "VI" : "EN"}
                    </button>
                </div>

                {/* Title */}
                <div className="text-center space-y-1">
                    <h1 className="text-lg font-sans font-semibold tracking-tight">{t.title}</h1>
                    <p className="text-xs text-muted-foreground font-sans">{t.subtitle}</p>
                </div>

                {/* PIN dots */}
                <div style={shake ? { animation: 'pin-shake 0.5s ease-in-out' } : {}} className="flex justify-center gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${pin.length > i
                                ? error
                                    ? "bg-destructive border-destructive"
                                    : "bg-foreground border-foreground"
                                : "bg-transparent border-muted-foreground"
                                }`}
                        />
                    ))}
                </div>

                {/* Error message */}
                <div className="h-4 text-center">
                    {error && (
                        <p className="text-xs text-destructive font-sans animate-in fade-in">{t.error}</p>
                    )}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3">
                    {digits.map((d, idx) => {
                        if (d === "") return <div key={idx} />
                        if (d === "del") {
                            return (
                                <button
                                    key={idx}
                                    onClick={handleDelete}
                                    className="h-14 flex items-center justify-center rounded-sm border border-border hover:bg-muted active:scale-95 transition-all text-muted-foreground"
                                >
                                    <Delete className="h-5 w-5" />
                                </button>
                            )
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleDigit(d)}
                                className="h-14 text-xl font-sans font-medium rounded-sm border border-border hover:bg-muted active:scale-95 transition-all"
                            >
                                {d}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
