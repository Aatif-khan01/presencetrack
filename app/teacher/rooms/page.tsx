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
import { Plus, Users, Search } from "lucide-react"
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
import { User, Room } from "@/lib/types"

interface TeacherRoom extends Room {
  memberCount: number
}

export default function TeacherRoomsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<TeacherRoom[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [newRoom, setNewRoom] = useState({ roomName: "", courseCode: "" })

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
    fetchRooms(userData.id)
  }, [])

  const fetchRooms = async (userId: string) => {
    try {
      const data = await roomAPI.getTeacherRooms(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRooms((data.rooms as any[]) || [])
    } catch (err) {
      toast.error("Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!newRoom.roomName || !newRoom.courseCode) {
      toast.error("Please fill all fields")
      return
    }

    try {
      const savedUser = localStorage.getItem("presence_user")
      if (!savedUser) return
      const userData = JSON.parse(savedUser)
      await roomAPI.create(newRoom, userData.id)
      toast.success("Room created successfully!")
      setCreateOpen(false)
      setNewRoom({ roomName: "", courseCode: "" })
      fetchRooms(userData.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message)
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
        <Sidebar className="hidden md:block" role="teacher" />
        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                My Classrooms
              </h2>
              <p className="text-muted-foreground">
                Manage your courses and attendance sessions
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

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your classrooms..."
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
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  No classrooms created
                </h3>
                <p className="text-muted-foreground">
                  Get started by creating your first course classroom.
                </p>
                <Button onClick={() => setCreateOpen(true)} className="mt-4">
                  Create First Room
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => router.push(`/room/${room.id}`)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold font-mono">
                      {room.courseCode}
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div
                      className="text-2xl font-bold truncate"
                      title={room.roomName}
                    >
                      {room.roomName}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {room.memberCount || 0} Students Enrolled
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full">
                      Manage Room
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
