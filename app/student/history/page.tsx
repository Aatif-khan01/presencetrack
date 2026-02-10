"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { roomAPI, attendanceAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"
import { User, Room, AttendanceRecord } from "@/lib/types"

interface HistoryRecord extends AttendanceRecord {
  roomName: string
  courseCode: string
  roomId: string
}

export default function StudentHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [history, setHistory] = useState<HistoryRecord[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

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
    fetchData(userData.id)
  }, [])

  const fetchData = async (userId: string) => {
    try {
      // Get all rooms student is part of
      const roomData = await roomAPI.getStudentRooms(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentRooms = (roomData.rooms as any[]) || []
      setRooms(studentRooms)

      // Fetch history for all of them
      // In a real app this would be a specialized API call
      // For mock, we'll iterate
      const allHistory: HistoryRecord[] = []
      for (const room of studentRooms) {
        const histData = await attendanceAPI.getMyHistory(room.id, userId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allHistory.push(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...histData.history.map((h: any) => ({
            ...h,
            roomName: room.roomName,
            courseCode: room.courseCode,
            roomId: room.id,
          }))
        )
      }

      // Sort by date desc
      allHistory.sort(
        (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
      )
      setHistory(allHistory)
    } catch (err) {
      toast.error("Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const filteredHistory =
    selectedRoom === "all"
      ? history
      : history.filter((h) => h.roomId === selectedRoom)

  const stats = {
    total: filteredHistory.length,
    present: filteredHistory.filter((h) => h.status === "present").length,
    absent: filteredHistory.filter((h) => h.status === "absent").length,
  }
  const percentage =
    stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

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
                Attendance History
              </h2>
              <p className="text-muted-foreground">
                View your attendance records across all courses
              </p>
            </div>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.courseCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overall Attendance
                </CardTitle>
                <div
                  className={`h-2 w-2 rounded-full ${
                    percentage >= 75 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{percentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.present} Present / {stats.total} Sessions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Classes Attended
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.present}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Classes Missed
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.absent}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Session Records</CardTitle>
              <CardDescription>
                Detailed log of your attendance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((record) => (
                    <TableRow key={`${record.sessionId}-${record.date}`}>
                      <TableCell className="font-medium">
                        {new Date(record.date || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.courseCode}</TableCell>
                      <TableCell>
                        {record.status === "present" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none dark:bg-green-900/40 dark:text-green-400">
                            Present
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700 hover:bg-red-200 border-none dark:bg-red-900/40 dark:text-red-400"
                          >
                            Absent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {record.timestamp
                          ? new Date(record.timestamp).toLocaleTimeString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredHistory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
