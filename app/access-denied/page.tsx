"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, ArrowLeft, AlertCircle, CheckCircle2, XCircle, Smartphone } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function AccessDeniedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [networkStatus, setNetworkStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const detectedIP = searchParams.get('ip') || 'Unknown'
  const reason = searchParams.get('reason') || 'IP not in allowed range'
  const isPrivateRelay = searchParams.get('privateRelay') === 'true'
  const returnTo = searchParams.get('returnTo') || '/student/dashboard'

  useEffect(() => {
    // Fetch network status
    fetch('/api/network-status')
      .then(res => res.json())
      .then(data => {
        setNetworkStatus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch network status:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`p-4 rounded-full w-fit mx-auto ${isPrivateRelay ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            {isPrivateRelay ? (
              <Smartphone className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            ) : (
              <Wifi className="h-12 w-12 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isPrivateRelay ? 'iCloud Private Relay Detected' : 'Access Restricted'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isPrivateRelay
                ? 'Your iPhone is hiding your real IP address. Please disable Private Relay to mark attendance.'
                : 'Please connect to the university Wi-Fi network to access this room.'}
            </p>
          </div>
        </div>

        {/* Private Relay Instructions - Only shown for iOS Safari users */}
        {isPrivateRelay && (
          <Card className="border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">
                  How to Fix This on Your iPhone
                </h3>
              </div>

              <p className="text-sm text-orange-800 dark:text-orange-300">
                Apple&apos;s iCloud Private Relay hides your real IP address, which prevents us from verifying you&apos;re on the campus Wi-Fi. You have two options:
              </p>

              {/* Option 1: Per-site disable */}
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 text-xs font-bold">1</span>
                  Quick Fix — Disable for This Website Only
                </h4>
                <ol className="space-y-2 text-sm text-orange-800 dark:text-orange-300 ml-8">
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">1.</span>
                    <span>Tap the <strong>aA</strong> button in Safari&apos;s address bar</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">2.</span>
                    <span>Tap <strong>&quot;Show IP Address&quot;</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">3.</span>
                    <span>Reload this page</span>
                  </li>
                </ol>
              </div>

              {/* Option 2: Global disable */}
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 text-xs font-bold">2</span>
                  Alternative — Disable Private Relay Entirely
                </h4>
                <ol className="space-y-2 text-sm text-orange-800 dark:text-orange-300 ml-8">
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">1.</span>
                    <span>Go to <strong>Settings → Your Name → iCloud</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">2.</span>
                    <span>Tap <strong>Private Relay</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">3.</span>
                    <span>Toggle it <strong>Off</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0">4.</span>
                    <span>Come back and reload this page</span>
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  💡 <strong>Tip:</strong> You can re-enable Private Relay after marking your attendance. Option 1 (per-site) only affects this website.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Network Status Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-4 w-4" />
              Network Diagnostics
            </div>
            
            <div className="space-y-3">
              {/* Detected IP */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Detected IP Address</span>
                </div>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  {detectedIP}
                </code>
              </div>

              {/* Allowed Range */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Allowed Network</span>
                </div>
                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                  Campus Wi-Fi
                </code>
              </div>

              {/* Reason */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  <strong>Reason:</strong> {isPrivateRelay ? 'iCloud Private Relay is masking your real IP address' : reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Steps - General (shown when NOT Private Relay) */}
        {!isPrivateRelay && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Troubleshooting Steps</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Verify you are connected to the university Wi-Fi network</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Check that your device&apos;s Wi-Fi is enabled</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Try disconnecting and reconnecting to the Wi-Fi</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>If using an iPhone with iCloud Private Relay, disable it in Safari settings (tap aA → Show IP Address)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">5.</span>
                  <span>If the issue persists, contact IT support with your IP address: <code className="bg-muted px-1 rounded">{detectedIP}</code></span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            onClick={() => {
              // Navigate back to the original page the user was trying to access
              window.location.href = returnTo
            }}
            className="w-full"
          >
            {isPrivateRelay ? 'I\'ve Disabled Private Relay — Retry' : 'Retry Connection'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/student/dashboard")}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Network Status (if available) */}
        {!loading && networkStatus && (
          <div className="text-center text-xs text-muted-foreground">
            <p>Network Status: {networkStatus.allowed ? '✅ Allowed' : '❌ Blocked'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  )
}
