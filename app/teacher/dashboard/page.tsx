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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { roomAPI, analyticsAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { Plus, Users, BookOpen, Clock, Calendar } from "lucide-react"
import { User } from "@/lib/types"

interface TeacherRoom {
  id: string
  roomName: string
  courseCode: string
  memberCount: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<TeacherRoom[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newRoom, setNewRoom] = useState({ roomName: "", courseCode: "" })
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalStudents: 0,
    todaySessions: 0,
    activeSessions: 0,
  })

  useEffect(() => {
    const savedUser = localStorage.getItem("presence_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(savedUser)
    if (userData.role !== "teacher") {
      router.push("/student/dashboard")
      return
    }
    setUser(userData)
    fetchDashboardData(userData.id)
  }, [])

  const fetchDashboardData = (userId: string) => {
    setLoading(true)

    // Fetch rooms immediately
    roomAPI
      .getTeacherRooms(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data) => setRooms((data.rooms as any[]) || []))
      .catch(() => toast.error("Failed to load rooms"))

    // Fetch stats independently
    analyticsAPI
      .getTeacherDashboardStats(userId)
      .then((data) => setStats(data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false))
  }

  const handleCreateRoom = async () => {
    if (!newRoom.roomName || !newRoom.courseCode) {
      toast.error("Please fill all fields")
      return
    }

    if (!user) return

    try {
      await roomAPI.create(newRoom, user.id)
      toast.success("Room created successfully!")
      setCreateOpen(false)
      setNewRoom({ roomName: "", courseCode: "" })
      fetchDashboardData(user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (!user) return null

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
        <Sidebar className="hidden md:block" role="teacher" />
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back, Professor {user.name}
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Add a new course room for attendance tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Room Name</Label>
                    <Input
                      placeholder="Data Structures & Algorithms"
                      value={newRoom.roomName}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, roomName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input
                      placeholder="CS201"
                      value={newRoom.courseCode}
                      onChange={(e) =>
                        setNewRoom({
                          ...newRoom,
                          courseCode: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRoom}>Create Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Rooms
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRooms}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&#39;s Sessions
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todaySessions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSessions} Active now
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSessions}</div>
                <p className="text-xs text-muted-foreground">Running classes</p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-lg font-semibold mt-8">Your Classrooms</h3>
          {rooms.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <div className="flex flex-col items-center justify-center space-y-3">
                <p className="text-muted-foreground">
                  You haven&#39;t created any rooms yet.
                </p>
                <Button variant="outline" onClick={() => setCreateOpen(true)}>
                  Create First Room
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/room/${room.id}`)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {room.courseCode}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{room.roomName}</div>
                    <p className="text-xs text-muted-foreground">
                      {room.memberCount || 0} Students Enrolled
                    </p>
                    <Button variant="secondary" className="w-full mt-4">
                      Manage Room
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
