"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authAPI } from "@/lib/mock-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GraduationCap, School, User as UserIcon, Hash } from "lucide-react"
import { User } from "@/lib/types"

export default function CompleteProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState("student")
  const [enrollmentNumber, setEnrollmentNumber] = useState("")

  useEffect(() => {
    // Load partial user data from local storage
    try {
      const storedUser = localStorage.getItem("presence_user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        router.push("/login") // Redirect if no user data
      }
    } catch (e) {
      console.error("Failed to parse user data", e)
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!user) return

    try {
      const profileData = {
        ...user,
        role,
        enrollmentNumber:
          role === "student" ? enrollmentNumber.toUpperCase() : undefined,
      }

      const updatedUser = await authAPI.completeProfile(profileData)

      // Update local storage with full profile
      localStorage.setItem("presence_user", JSON.stringify(updatedUser))

      toast.success("Profile completed!")

      if (role === "teacher") {
        router.push("/teacher/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    } catch (err) {
      console.error(err)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error("Failed to update profile: " + (err as any).message)
    } finally {
      setLoading(false)
    }
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            Please provide a few more details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-primary"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <div className="p-2 border rounded-md bg-muted text-muted-foreground">
                {user.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={role} onValueChange={(value) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Teacher
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="enrollment">Enrollment Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="enrollment"
                    placeholder="2024UG1234"
                    value={enrollmentNumber}
                    onChange={(e) =>
                      setEnrollmentNumber(e.target.value.toUpperCase())
                    }
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for attendance tracking
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
