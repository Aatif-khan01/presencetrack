"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { roomAPI, attendanceAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import { CheckCircle2, Wifi, Loader2 } from "lucide-react"
import { User, Room } from "@/lib/types"

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [session, setSession] = useState<{ id: string } | null>(null)
  const [marked, setMarked] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("presence_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(savedUser)
    setUser(userData)

    // Verify network status again
    fetch("/api/network-status")
      .then((res) => {
        if (!res.ok) {
          toast.error(
            "Network verification failed. Please connect to Campus Wi-Fi."
          )
          router.push("/access-denied")
        }
      })
      .catch(() => {
        router.push("/access-denied")
      })

    fetchData(userData.id, params.id as string)
  }, [params.id])

  const fetchData = async (userId: string, roomId: string) => {
    try {
      const data = await roomAPI.getRoomForStudent(roomId, userId)
      if (!data) {
        toast.error("Room not found")
        router.push("/student/dashboard")
        return
      }

      setRoom(data.room as Room)
      if (!data.hasActiveSession) {
        toast.error("No active session in this room")
        router.push(`/room/${roomId}`)
        return
      }
      setSession({ id: data.sessionId as string })
      setMarked(data.hasMarked)
    } catch (err) {
      toast.error("Failed to load session")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async () => {
    if (!session || !user) return
    setMarking(true)
    try {
      await attendanceAPI.mark(session.id, user)
      setMarked(true)
      toast.success("Attendance Marked Successfully!")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setMarking(false)
    }
  }

  if (!user || !room) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("presence_user")
          localStorage.removeItem("presence_token")
        }}
      />
      <main className="flex-1 flex items-center justify-center p-6 bg-secondary/20">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {room.courseCode}
            </CardTitle>
            <CardDescription className="text-lg text-foreground font-medium">
              {room.roomName}
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Instructor: {room.teacherName}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium dark:bg-green-900/30 dark:text-green-400">
                <Wifi className="h-4 w-4" />
                Campus Wi-Fi Verified
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-center py-8">
              {marked ? (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">
                    Marked Present
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Your attendance has been recorded for this session.
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="h-32 w-32 rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-transform"
                  onClick={handleMarkAttendance}
                  disabled={marking}
                >
                  {marking ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    "Tap to Mark"
                  )}
                </Button>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <Button
              variant="link"
              onClick={() => router.push("/student/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
