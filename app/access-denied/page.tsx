"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, ArrowLeft, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function AccessDeniedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [networkStatus, setNetworkStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const detectedIP = searchParams.get('ip') || 'Unknown'
  const reason = searchParams.get('reason') || 'IP not in allowed range'

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
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 w-fit mx-auto">
            <Wifi className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Access Restricted</h1>
            <p className="text-muted-foreground text-lg">
              Please connect to the university Wi-Fi network to access this room.
            </p>
          </div>
        </div>

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
                  192.168.29.0/24
                </code>
              </div>

              {/* Reason */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  <strong>Reason:</strong> {reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Steps */}
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
                <span>Check that your device's Wi-Fi is enabled</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Try disconnecting and reconnecting to the Wi-Fi</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>If the issue persists, contact IT support with your IP address: <code className="bg-muted px-1 rounded">{detectedIP}</code></span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Retry Connection
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
