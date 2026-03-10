"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { roomAPI, analyticsAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { Search, Wifi, WifiOff, Flame, Trophy, TrendingUp, BookOpen } from "lucide-react"
import { User } from "@/lib/types"

interface DashboardRoom {
  id: string
  roomName: string
  courseCode: string
  teacherName: string
  hasActiveSession?: boolean
}

interface HeatmapDay {
  date: string
  dayName: string
  status: 'present' | 'absent' | 'no-session'
  count: number
}

interface SubjectStat {
  roomId: string
  roomName: string
  courseCode: string
  present: number
  total: number
  percentage: number
}

interface GamificationStats {
  streak: number
  bestStreak: number
  totalPresent: number
  totalSessions: number
  weeklyHeatmap: HeatmapDay[]
  subjectStats: SubjectStat[]
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<DashboardRoom[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [wifiStatus, setWifiStatus] = useState<boolean | null>(null) // null = checking
  const [detectedIP, setDetectedIP] = useState<string>("")
  const [gamification, setGamification] = useState<GamificationStats | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("presence_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(savedUser)
    if (userData.role !== "student") {
      router.push("/teacher/dashboard")
      return
    }
    setUser(userData)
    fetchRooms(userData.id)
    fetchGamificationStats(userData.id)

    // Initial check
    checkNetworkStatus()

    // Poll every 15 seconds for real-time updates
    const interval = setInterval(checkNetworkStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  const checkNetworkStatus = async () => {
    try {
      const res = await fetch("/api/network-status")
      const data = await res.json()
      // Use onCampus (not just allowed) so localhost doesn't falsely show as campus Wi-Fi
      if (data.success && data.onCampus) {
        setWifiStatus(true)
      } else {
        setWifiStatus(false)
      }
      if (data.detectedIP) {
        setDetectedIP(data.detectedIP)
      }
    } catch (error) {
      console.error("Network check failed", error)
      setWifiStatus(false)
    }
  }

  const fetchRooms = async (userId: string) => {
    try {
      const data = await roomAPI.getStudentRooms(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRooms((data.rooms as any[]) || [])
    } catch (err) {
      toast.error("Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  const fetchGamificationStats = async (userId: string) => {
    try {
      const stats = await analyticsAPI.getStudentGamificationStats(userId)
      setGamification(stats)
    } catch (err) {
      console.error("Failed to load gamification stats", err)
    }
  }

  const handleEnterRoom = (room: DashboardRoom) => {
    if (room.hasActiveSession) {
      router.push(`/room/${room.id}/attendance`)
    } else {
      router.push(`/room/${room.id}`)
    }
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🏆"
    if (streak >= 14) return "⚡"
    if (streak >= 7) return "🔥"
    if (streak >= 3) return "✨"
    return "🎯"
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary!"
    if (streak >= 14) return "Unstoppable!"
    if (streak >= 7) return "On fire!"
    if (streak >= 3) return "Keep it up!"
    if (streak >= 1) return "Good start!"
    return "Start your streak!"
  }

  const getHeatmapColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500 dark:bg-green-400'
      case 'absent': return 'bg-red-400 dark:bg-red-500'
      case 'no-session': return 'bg-muted'
      default: return 'bg-muted'
    }
  }

  const getPercentageColor = (pct: number) => {
    if (pct >= 90) return 'text-primary dark:text-primary'
    if (pct >= 75) return 'text-accent dark:text-accent'
    if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBarColor = (pct: number) => {
    if (pct >= 90) return 'bg-primary'
    if (pct >= 75) return 'bg-accent'
    if (pct >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  if (!user) return null

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(search.toLowerCase()) ||
      room.courseCode.toLowerCase().includes(search.toLowerCase())
  )

  const overallPercentage = gamification && gamification.totalSessions > 0
    ? Math.round((gamification.totalPresent / gamification.totalSessions) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("presence_user")
          localStorage.removeItem("presence_token")
        }}
      />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-6 p-4 md:p-6 pb-24 md:pb-6">
        <Sidebar className="hidden md:block" role="student" />
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-default transition-colors ${
                wifiStatus === null
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : wifiStatus
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
              title={detectedIP ? `Your IP: ${detectedIP}` : "Checking network..."}
            >
              {wifiStatus === null ? (
                <Wifi className="h-4 w-4 animate-pulse" />
              ) : wifiStatus ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span>
                {wifiStatus === null
                  ? "Checking Wi-Fi..."
                  : wifiStatus
                  ? "Campus Wi-Fi Connected"
                  : "Not on Campus Wi-Fi"}
              </span>
              {wifiStatus === null && (
                <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* ===== GAMIFICATION SECTION ===== */}
          {gamification && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-1">
              {/* Stats Row: Streak, Best Streak, Overall Attendance */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {/* Current Streak */}
                <Card className="col-span-2 lg:col-span-1 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-4xl font-black text-orange-600 dark:text-orange-400">
                            {gamification.streak}
                          </span>
                          <span className="text-sm text-muted-foreground">days</span>
                        </div>
                        <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1 font-medium">
                          {getStreakMessage(gamification.streak)}
                        </p>
                      </div>
                      <span className="text-4xl">{getStreakEmoji(gamification.streak)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Streak */}
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Best Streak</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-bold">{gamification.bestStreak}</span>
                          <span className="text-sm text-muted-foreground">days</span>
                        </div>
                      </div>
                      <Trophy className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Attendance */}
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Overall Attendance</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className={`text-3xl font-bold ${getPercentageColor(overallPercentage)}`}>
                            {overallPercentage}%
                          </span>
                        </div>
                      </div>
                      <TrendingUp className={`h-8 w-8 ${overallPercentage >= 75 ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                  </CardContent>
                </Card>

                {/* Classes Attended */}
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Classes Attended</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-bold">{gamification.totalPresent}</span>
                          <span className="text-sm text-muted-foreground">/ {gamification.totalSessions}</span>
                        </div>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Heatmap + Subject Stats */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Weekly Heatmap */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Attendance Heatmap</CardTitle>
                    <CardDescription>Last 4 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1.5">
                      {/* Day labels */}
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-[10px] text-muted-foreground text-center font-medium pb-1">
                          {day}
                        </div>
                      ))}
                      {/* Heatmap cells — pad start to align with correct day of week */}
                      {(() => {
                        const cells: React.ReactNode[] = []
                        if (gamification.weeklyHeatmap.length > 0) {
                          // Get the day of week for the first date (0=Sun, 1=Mon, ...)
                          const firstDate = new Date(gamification.weeklyHeatmap[0].date)
                          // Convert to Mon=0 ... Sun=6
                          let startDay = firstDate.getDay() - 1
                          if (startDay < 0) startDay = 6
                          // Add empty cells for alignment
                          for (let i = 0; i < startDay; i++) {
                            cells.push(<div key={`pad-${i}`} className="aspect-square" />)
                          }
                          // Add heatmap days
                          gamification.weeklyHeatmap.forEach((day, i) => {
                            cells.push(
                              <div
                                key={day.date}
                                className={`aspect-square rounded-sm ${getHeatmapColor(day.status)} transition-colors cursor-default relative group`}
                                title={`${day.date}: ${day.status === 'present' ? '✅ Present' : day.status === 'absent' ? '❌ Absent' : '— No session'}`}
                              >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                                  <div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap border">
                                    {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                    {day.status === 'present' && ' ✅'}
                                    {day.status === 'absent' && ' ❌'}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        }
                        return cells
                      })()}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-green-500" />
                        <span>Present</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-red-400" />
                        <span>Absent</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-muted border" />
                        <span>No class</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject-wise Attendance */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Subject-wise Attendance</CardTitle>
                    <CardDescription>Your attendance by course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gamification.subjectStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                    ) : (
                      <div className="space-y-4">
                        {gamification.subjectStats.map(subject => (
                          <div key={subject.roomId} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                  {subject.courseCode}
                                </Badge>
                                <span className="text-sm font-medium truncate max-w-[140px]" title={subject.roomName}>
                                  {subject.roomName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {subject.present}/{subject.total}
                                </span>
                                <span className={`text-sm font-bold ${getPercentageColor(subject.percentage)}`}>
                                  {subject.percentage}%
                                </span>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${getBarColor(subject.percentage)}`}
                                style={{ width: `${subject.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ===== COURSES SECTION ===== */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Courses</h3>
            <div className="relative w-full max-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <p className="text-muted-foreground">
                  You haven&#39;t joined any rooms yet.
                </p>
                <Button onClick={() => router.push("/student/rooms")}>
                  Browse Available Rooms
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {room.courseCode}
                    </CardTitle>
                    {room.hasActiveSession ? (
                      <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-slate-300" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{room.roomName}</div>
                    <p className="text-xs text-muted-foreground">
                      {room.teacherName}
                    </p>
                    <Button
                      className="w-full mt-4"
                      disabled={!room.hasActiveSession && !wifiStatus}
                      onClick={() => handleEnterRoom(room)}
                      variant={room.hasActiveSession ? "default" : "outline"}
                    >
                      {room.hasActiveSession ? "Enter Class" : "View Details"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
