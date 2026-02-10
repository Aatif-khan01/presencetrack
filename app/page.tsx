"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  CheckCircle2,
  BarChart3,
  Shield,
  Zap,
  GraduationCap,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      <Navbar user={null} onLogout={() => {}} />

      <main className="flex-1">
        {/* Hero Section - Modern & Dynamic */}
        <section className="relative pt-20 pb-32 overflow-hidden lg:pt-32">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left Content */}
              <div className="flex-1 space-y-8 text-center lg:text-left z-10">
                {/* Main Heading with Gradient */}
                <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl xl:text-8xl">
                  <span className="block mb-2">Attendance</span>
                  <span className="block bg-gradient-to-r from-primary via-purple-600 to-accent bg-clip-text text-transparent animate-gradient">
                    reimagined.
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xl text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Say goodbye to paper sheets and proxy attendance. Experience{" "}
                  <span className="font-semibold text-foreground">
                    intelligent Wi-Fi verification
                  </span>{" "}
                  that marks attendance automatically, securely, and instantly.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 group"
                    onClick={() => router.push("/login")}
                  >
                    Get Started
                    <svg
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50 backdrop-blur-sm"
                    onClick={() => router.push("/login")}
                  >
                    Create Account
                  </Button>
                </div>
              </div>

              {/* Right Visual - Floating Dashboard Preview */}
              <div className="flex-1 w-full max-w-[650px] lg:max-w-none relative">
                {/* Main Dashboard Card */}
                <div className="relative z-10 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-accent rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border overflow-hidden">
                    {/* Header */}
                    <div className="h-14 border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center px-6 gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="h-7 px-4 bg-white/50 dark:bg-slate-950/50 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                          <div className="w-3 h-3 text-green-500">●</div>
                          <span className="text-xs font-medium">presence-track.app</span>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-6 space-y-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform">
                          <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-xs font-medium opacity-90">Today</span>
                          </div>
                          <div className="text-3xl font-bold">94%</div>
                          <div className="text-xs opacity-90">Attendance Rate</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm transform hover:scale-105 transition-transform">
                          <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="h-5 w-5 text-accent" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Active
                            </span>
                          </div>
                          <div className="text-3xl font-bold">156</div>
                          <div className="text-xs text-muted-foreground">Students</div>
                        </div>
                      </div>

                      {/* Live Activity */}
                      <div className="space-y-3">
                        {[
                          { name: "Computer Science 101", status: "active", count: 45 },
                          { name: "Mathematics 201", status: "active", count: 38 },
                          { name: "Physics Lab", status: "ended", count: 28 },
                        ].map((session, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-primary/50 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {session.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.count} students
                              </div>
                            </div>
                            <Badge
                              className={
                                session.status === "active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              }
                            >
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-accent to-orange-600 rounded-2xl shadow-xl flex items-center justify-center text-white transform rotate-12 hover:rotate-0 transition-transform">
                  <div className="text-center">
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-xs">Accuracy</div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl flex items-center justify-center text-white transform -rotate-12 hover:rotate-0 transition-transform">
                  <div className="text-center">
                    <Zap className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-xs font-medium">Instant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Premium Asymmetric Layout */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <div className="container px-4 md:px-6">
            {/* Section Header */}
            <div className="max-w-3xl mb-20">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-sm font-semibold text-primary">
                  Why Choose Presence Track
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Built for modern universities.{" "}
                <span className="text-muted-foreground">
                  Designed for simplicity.
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Everything you need to manage attendance across campus, from
                real-time analytics to secure verification, all in one platform.
              </p>
            </div>

            {/* Feature Grid - Asymmetric Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Large Feature 1 - Analytics */}
              <div className="lg:col-span-7 group">
                <div className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        Real-time Analytics
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Track attendance trends, identify at-risk students, and
                        generate comprehensive reports instantly. Visual data
                        that helps you make better decisions.
                      </p>
                    </div>
                  </div>

                  {/* Embedded Chart */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Weekly Overview
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-muted-foreground">
                          94% Average
                        </span>
                      </div>
                    </div>
                    <div className="relative h-48 w-full">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 300 120"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="chartGradient"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgb(59, 130, 246)"
                              stopOpacity="0.4"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgb(59, 130, 246)"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 80 L 50 40 L 100 55 L 150 15 L 200 30 L 250 20 L 300 25 L 300 120 L 0 120 Z"
                          fill="url(#chartGradient)"
                        />
                        <path
                          d="M 0 80 L 50 40 L 100 55 L 150 15 L 200 30 L 250 20 L 300 25"
                          fill="none"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-muted-foreground">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day, i) => (
                            <span key={i}>{day}</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Small Feature 1 - Instant Setup */}
              <div className="lg:col-span-5 group">
                <div className="h-full bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-3xl border border-orange-200 dark:border-orange-900/30 p-8 md:p-10 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg w-fit mb-6">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Instant Setup</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    No hardware required. Uses existing Wi-Fi infrastructure to
                    verify physical presence.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Zero installation time",
                      "Works with any router",
                      "Cloud-based solution",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Small Feature 2 - Security */}
              <div className="lg:col-span-5 group">
                <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl border border-green-200 dark:border-green-900/30 p-8 md:p-10 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg w-fit mb-6">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Enterprise Security
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Role-based access control with data privacy compliance
                    built-in from day one.
                  </p>
                  <div className="space-y-3">
                    {[
                      "End-to-end encryption",
                      "GDPR compliant",
                      "Audit logs included",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Large Feature 2 - Geofencing */}
              <div className="lg:col-span-7 group">
                <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-3xl border border-slate-700 p-8 md:p-12 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden relative">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-8">
                      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                        <Wifi className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                          Geofenced Verification
                        </h3>
                        <p className="text-slate-300 text-lg leading-relaxed">
                          Our proprietary verification layer ensures students
                          are actually in the room, eliminating proxy marking
                          by checking local network signatures.
                        </p>
                      </div>
                    </div>

                    {/* Visual Element */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 flex items-center justify-center h-48 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent animate-pulse"></div>
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-green-500/30 border-4 border-green-400 flex items-center justify-center">
                              <CheckCircle2 className="h-8 w-8 text-green-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container px-4 md:px-6">
            <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                  Ready to modernize your classroom?
                </h2>
                <p className="text-xl text-blue-100">
                  Join students and teachers tracking attendance the smart
                  way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-8 text-lg text-primary font-bold shadow-lg"
                    onClick={() => router.push("/login")}
                  >
                    Get Started Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-16">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Left Side - Developer Info */}
            <div className="space-y-6">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                {/* Profile Image */}
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-xl border-4 border-slate-700 bg-slate-800">
                  <img
                    src="/images/profile.jpg"
                    alt="Aatif Khan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Developed by</p>
                  <h3 className="text-2xl font-bold mb-3">Aatif Khan</h3>
                  <p className="text-slate-300 leading-relaxed max-w-md">
                    Full-stack developer passionate about creating innovative
                    educational solutions that make a real difference.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 mt-0.5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div>--------</div>
                    <div>--------</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>xxxxxxxxx</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>atifmuneeb909@gmail.com</span>
                </div>
              </div>


              {/* Social Links */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
                <div className="flex gap-3">
                  <a
                    href="https://www.linkedin.com/in/aatif-khan-390036273"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary transition-colors flex items-center justify-center"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              © 2026 Presence Track. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
