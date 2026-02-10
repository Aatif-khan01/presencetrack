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
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Mail, Hash, Shield } from "lucide-react"
import { User } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("presence_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(savedUser))
  }, [])

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
        <Sidebar className="hidden md:block" role={user.role} />
        <main className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h2>

          <div className="max-w-2xl">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>
                    {user.role === "teacher" ? "Faculty Member" : "Student"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue={user.name} className="pl-10" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue={user.email} className="pl-10" />
                  </div>
                </div>
                {user.role === "student" && (
                  <div className="grid gap-2">
                    <Label>Enrollment Number</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue={user.enrollmentNumber || ""}
                        className="pl-10 bg-muted"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contact administration to update enrollment number
                    </p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={
                        user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      }
                      className="pl-10 bg-muted"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
