"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authAPI } from "@/lib/mock-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Hash, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">(
    "student"
  )
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "",
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const authData = isLogin
        ? await authAPI.login({
            email: formData.email,
            password: formData.password,
          })
        : await authAPI.register({ ...formData, role: selectedRole })

      handleAuthSuccess(authData)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const data = await authAPI.loginWithGoogle(selectedRole)

      // If new user, we need to ensure role is set correctly in profile completion
      if (data.isNewUser) {
        // Store selected role for profile completion page to use
        localStorage.setItem("pending_role", selectedRole)
        toast.success("Welcome! Please complete your profile.")
        router.push("/complete-profile")
        return
      }

      // If existing user, verify role match (optional security/UX check)
      if (data.user.role !== selectedRole) {
        toast.warning(`Note: You are logged in as a ${data.user.role}`)
      }

      handleAuthSuccess(data)
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAuthSuccess = (data: any) => {
    localStorage.setItem("presence_token", data.token)
    localStorage.setItem("presence_user", JSON.stringify(data.user))

    // Set cookie for middleware access control
    document.cookie = `presence_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`

    toast.success(isLogin ? "Welcome back!" : "Account created successfully!")

    if (data.user.role === "teacher") {
      router.push("/teacher/dashboard")
    } else {
      router.push("/student/dashboard")
    }
  }

  // Style constants
  const primaryColorClass =
    selectedRole === "student" ? "text-emerald-600" : "text-indigo-600"
  const bgColorClass =
    selectedRole === "student"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-indigo-600 hover:bg-indigo-700"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-3">
      <Button
        variant="ghost"
        className="absolute top-2 left-2 md:top-4 md:left-4 text-xs md:text-sm"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Back
      </Button>

      <Card className="w-full max-w-sm mx-auto shadow-xl border-0 bg-card/80 backdrop-blur overflow-hidden">
        <Tabs
          defaultValue="student"
          value={selectedRole}
          onValueChange={(v) => setSelectedRole(v as "student" | "teacher")}
          className="w-full"
        >
          <div className="p-1.5 bg-muted/50">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger
                value="student"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all duration-300 font-medium text-sm"
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="teacher"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all duration-300 font-medium text-sm"
              >
                Teacher
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex justify-center pt-4 pb-2">
            <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center relative">
              {selectedRole === "student" ? (
                <Image
                  src="/assets/login/student-character.png"
                  alt="Student Character"
                  width={135}
                  height={135}
                  className="object-contain"
                  priority
                />
              ) : (
                <Image
                  src="/assets/login/teacher-character.png"
                  alt="Teacher Character"
                  width={110}
                  height={110}
                  className="object-contain"
                  priority
                />
              )}
            </div>
          </div>

          <div className="text-center space-y-1 px-4 pb-2">
            <h2
              className={`text-xl md:text-2xl font-bold tracking-tight ${primaryColorClass}`}
            >
              {selectedRole === "student"
                ? "Student Portal"
                : "Instructor Portal"}
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm">
              {selectedRole === "student"
                ? "Login to track your attendance"
                : "Login to manage your classes"}
            </p>
          </div>

          <CardContent className="pt-3 px-4 pb-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-9 h-9 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {selectedRole === "student" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="enrollment" className="text-sm">
                        Enrollment Number
                      </Label>
                      <div className="relative">
                        <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="enrollment"
                          placeholder="2024UG1234"
                          value={formData.enrollmentNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              enrollmentNumber: e.target.value.toUpperCase(),
                            })
                          }
                          className="pl-9 h-9 text-sm"
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="h-9 text-sm"
                />
              </div>

              <Button
                type="submit"
                className={`w-full h-9 text-sm ${bgColorClass} text-white`}
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login as " +
                    (selectedRole === "student" ? "Student" : "Teacher")
                  : "Create " +
                    (selectedRole === "student" ? "Student" : "Teacher") +
                    " Account"}
              </Button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-sm"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </CardContent>
          <CardFooter className="py-3 px-4">
            <p className="text-xs text-center w-full text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={`${primaryColorClass} hover:underline font-medium`}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  )
}
