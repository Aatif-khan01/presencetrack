"use client"

import { GraduationCap, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { User } from "@/lib/types"

interface NavbarProps {
  user: User | null
  onLogout: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    onLogout()
    router.push("/login")
  }

  if (!mounted) return null

  return (
    <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg leading-none">Presence Track</h1>
            <p className="text-xs text-muted-foreground">
              {user?.role === "teacher"
                ? "Teacher Dashboard"
                : user?.role === "student"
                ? "Student Portal"
                : "University Attendance"}
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {user.role === "student" ? user.enrollmentNumber : user.email}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
