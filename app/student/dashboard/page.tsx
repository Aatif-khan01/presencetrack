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
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { roomAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { Search, Wifi, WifiOff } from "lucide-react"
import { User } from "@/lib/types"

interface DashboardRoom {
  id: string
  roomName: string
  courseCode: string
  teacherName: string
  hasActiveSession?: boolean
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<DashboardRoom[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [wifiStatus, setWifiStatus] = useState(true) // Mock status

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
    checkNetworkStatus()
  }, [])

  const checkNetworkStatus = async () => {
    try {
      const res = await fetch("/api/network-status")
      if (res.ok) {
        setWifiStatus(true)
      } else {
        setWifiStatus(false)
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

  const handleEnterRoom = (room: DashboardRoom) => {
    if (room.hasActiveSession) {
      router.push(`/room/${room.id}/attendance`)
    } else {
      router.push(`/room/${room.id}`)
    }
  }

  if (!user) return null

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(search.toLowerCase()) ||
      room.courseCode.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("presence_user")
          localStorage.removeItem("presence_token")
        }}
      />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-6 p-6">
        <Sidebar className="hidden md:block" role="student" />
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                wifiStatus
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {wifiStatus ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {wifiStatus ? "Campus Wi-Fi Connected" : "Wi-Fi Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
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
