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
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { roomAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { Search, Users, Globe } from "lucide-react"
import { User, Room } from "@/lib/types"

interface AvailableRoom extends Room {
  teacherName: string
}

export default function StudentRoomsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [joining, setJoining] = useState<string | null>(null)

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
  }, [])

  const fetchRooms = async (userId: string) => {
    try {
      const data = await roomAPI.getAvailableRooms(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAvailableRooms((data.rooms as any[]) || [])
    } catch (err) {
      toast.error("Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (room: AvailableRoom) => {
    if (!user) return
    setJoining(room.id)
    try {
      await roomAPI.join(room.id, user)
      toast.success(`Joined ${room.roomName} successfully!`)
      router.push(`/room/${room.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setJoining(null)
    }
  }

  if (!user) return null

  const filteredRooms = availableRooms.filter(
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Browse Rooms
              </h2>
              <p className="text-muted-foreground">
                Join new courses and start tracking attendance
              </p>
            </div>
            <div className="relative w-full sm:w-auto min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course name or code..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <Card className="p-12 text-center bg-muted/50 border-dashed">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 rounded-full bg-background border shadow-sm">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No new rooms found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {availableRooms.length === 0
                    ? "You have joined all available rooms, or no new rooms have been created yet."
                    : "Try searching with a different keyword."}
                </p>
                {availableRooms.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/student/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className="group hover:shadow-lg transition-all"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold font-mono">
                        {room.courseCode}
                      </div>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle
                      className="mt-2 text-xl truncate"
                      title={room.roomName}
                    >
                      {room.roomName}
                    </CardTitle>
                    <CardDescription>
                      Instructor: {room.teacherName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Join this classroom to mark your attendance for upcoming
                      sessions.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full group-hover:bg-primary/90"
                      onClick={() => handleJoinRoom(room)}
                      disabled={joining === room.id}
                    >
                      {joining === room.id ? "Joining..." : "Join Class"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
