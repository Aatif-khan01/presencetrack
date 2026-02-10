"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Badge } from "@/components/ui/badge"
import { roomAPI, attendanceAPI, analyticsAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { Play, Square, Download } from "lucide-react"
import { User, Room, Member, Session, StudentAnalytics } from "@/lib/types"

interface AnalyticsData {
  room: Room
  totalSessions: number
  totalStudents: number
  studentStats: {
    studentId: string
    studentName: string
    enrollmentNumber: string
    presentCount: number
    totalSessions: number
    percentage: number
  }[]
}

interface DetailedSession extends Session {
  presentCount: number
  totalMembers: number
}

export default function RoomDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [sessions, setSessions] = useState<DetailedSession[]>([])
  const [activeSession, setActiveSession] = useState<DetailedSession | null>(
    null
  )
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("presence_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(savedUser)
    setUser(userData)
    fetchData(userData, params.id as string)
  }, [params.id])

  const fetchData = async (userData: User, roomId: string) => {
    try {
      const isTeacher = userData.role === "teacher"
      const [roomData, sessData, anaData] = await Promise.all([
        roomAPI.getDetails(roomId),
        attendanceAPI.getRoomSessions(roomId),
        isTeacher
          ? analyticsAPI.getRoomAnalytics(roomId)
          : Promise.resolve(null),
      ])
      setRoom(roomData.room as Room)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMembers((roomData.members as any[]) || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadedSessions = (sessData.sessions as any[]) || []
      setSessions(loadedSessions)
      setActiveSession(loadedSessions.find((s) => s.active) || null)
      if (anaData) setAnalytics(anaData as unknown as AnalyticsData)
    } catch (err) {
      toast.error("Failed to load room data")
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    if (!room || !user) return
    try {
      await attendanceAPI.start(room.id)
      toast.success("Attendance session started!")
      fetchData(user, room.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleEndSession = async () => {
    if (!activeSession || !room || !user) return
    try {
      await attendanceAPI.end(activeSession.id)
      toast.success("Attendance session ended!")
      fetchData(user, room.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleExportCSV = async () => {
    if (!room) return
    try {
      toast.info("Generating CSV...")
      const data = await attendanceAPI.getDetailedReport(room.id)

      // Build CSV content
      // Header: Student Name, Enrollment Number, Session 1 (Date), Session 2 (Date)...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionHeaders = data.sessions.map(
        (s: any) => `${s.date} (${s.active ? "Active" : "Ended"})`
      )
      const headers = [
        "Student Name",
        "Enrollment Number",
        ...sessionHeaders,
        "Total Present",
        "Total Sessions",
        "Percentage",
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = data.members.map((member: any) => {
        let presentCount = 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionCells = data.sessions.map((session: any) => {
          const record =
            data.attendanceMap[`${session.id}_${member.studentId}`]
          if (record) presentCount++
          return record ? "Present" : "Absent"
        })

        const percentage =
          data.sessions.length > 0
            ? Math.round((presentCount / data.sessions.length) * 100)
            : 0

        return [
          member.studentName,
          member.enrollmentNumber || "N/A",
          ...sessionCells,
          presentCount,
          data.sessions.length,
          `${percentage}%`,
        ]
      })

      const csvContent = [
        headers.join(","),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...rows.map((row: any[]) => row.join(",")),
      ].join("\n")

      // Download
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const safeFilename = room.courseCode
        ? room.courseCode.replace(/\s+/g, "_")
        : "Attendance_Report"
      a.download = `${safeFilename}_Attendance_Report.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success("CSV exported successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to export CSV")
    }
  }

  if (!user || !room) return null

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
        <Sidebar className="hidden md:block" role={user.role} />
        <main className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {room.courseCode}
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                  {room.roomName}
                </h2>
              </div>
              <p className="text-muted-foreground mt-1">
                Instructor: {room.teacherName}
              </p>
            </div>
            {user.role === "teacher" && (
              <div className="flex gap-2">
                {activeSession ? (
                  <Button variant="destructive" onClick={handleEndSession}>
                    <Square className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                ) : (
                  <Button onClick={handleStartSession}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                )}
              </div>
            )}
          </div>

          {activeSession && (
            <Card className="border-primary bg-primary/5 animate-fade-in">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Attendance Session Active
                  </span>
                  <Badge variant="secondary">{activeSession.date}</Badge>
                  <span className="text-muted-foreground ml-auto">
                    {activeSession.presentCount} Present / {members.length} Total
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="students" className="space-y-4">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="attendance">Attendance History</TabsTrigger>
              {user.role === "teacher" && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Students</CardTitle>
                  <CardDescription>
                    Total {members.length} students enrolled in this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Enrollment No.</TableHead>
                        <TableHead>Name</TableHead>
                        {user.role === "teacher" && (
                          <TableHead>Attendance %</TableHead>
                        )}
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => {
                        const stats = analytics?.studentStats?.find(
                          (s) => s.studentId === member.studentId
                        )
                        return (
                          <TableRow key={member.studentId}>
                            <TableCell className="font-mono">
                              {member.enrollmentNumber}
                            </TableCell>
                            <TableCell className="font-medium">
                              {member.studentName}
                            </TableCell>
                            {user.role === "teacher" && (
                              <TableCell>
                                <Badge
                                  variant={
                                    (stats?.percentage || 0) < 75
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {stats?.percentage || 0}%
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell className="text-muted-foreground">
                              {member.joinedAt
                                ? new Date(
                                    member.joinedAt?.toDate?.() ??
                                      member.joinedAt
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {members.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No students enrolled yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Session History</CardTitle>
                  <CardDescription>Past attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.date}</TableCell>
                          <TableCell>
                            {session.active ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Completed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {session.presentCount}
                          </TableCell>
                          <TableCell className="text-red-600 font-medium">
                            {session.totalMembers - session.presentCount}
                          </TableCell>
                        </TableRow>
                      ))}
                      {sessions.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No sessions recorded yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {user.role === "teacher" && (
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Room Settings</CardTitle>
                    <CardDescription>
                      Manage course configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          Export Attendance Data
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Download detailed attendance report as CSV
                        </p>
                      </div>
                      <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-900/10">
                      <div>
                        <h4 className="font-medium text-red-600">
                          Delete Room
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove this room and all data
                        </p>
                      </div>
                      <Button variant="destructive">Delete Room</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}
