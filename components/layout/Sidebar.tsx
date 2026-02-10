"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  User as UserIcon,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { User } from "@/lib/types"

interface SidebarProps {
  className?: string
  role: User["role"] | string
}

export function Sidebar({ className, role }: SidebarProps) {
  const pathname = usePathname()

  const links =
    role === "teacher"
      ? [
          {
            href: "/teacher/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { href: "/teacher/rooms", label: "Rooms", icon: BookOpen },
          { href: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/profile", label: "Profile", icon: UserIcon },
        ]
      : [
          {
            href: "/student/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { href: "/student/rooms", label: "Rooms", icon: BookOpen },
          {
            href: "/student/time-management",
            label: "Time",
            icon: Clock,
          },
          { href: "/student/history", label: "History", icon: BarChart3 },
          { href: "/profile", label: "Profile", icon: UserIcon },
        ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "pb-12 w-64 border-r min-h-[calc(100vh-4rem)] hidden lg:block",
          className
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "transparent"
                    )}
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
