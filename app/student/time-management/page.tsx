"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react"
import { timeManagementAPI } from "@/lib/mock-api"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StudentAnalytics } from "@/lib/types"

export default function TimeManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detailedRecords, setDetailedRecords] = useState<any[]>([])

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
    fetchData(userData.id)
  }, [])

  const fetchData = async (userId: string) => {
    try {
      setLoading(true)
      const data = await timeManagementAPI.getStudentAnalytics(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAnalytics(data as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDetailedRecords((data as any).recentHistory || [])
    } catch (error) {
      console.error("Failed to load data", error)
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    )
  }

  if (!analytics) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    studentInfo,
    attendanceStats,
    attendanceRate,
    weeklyData,
    classPerformance,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = analytics as any

  // Monthly Trend Data for Chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trendData = weeklyData.map((d: any) => ({
    name: d.name,
    Attendance: d.attendance,
    Average: 75, // Mock class average
  }))

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 space-y-8 font-sans text-slate-900">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <Button
            variant="ghost"
            className="mb-4 pl-0 hover:bg-transparent hover:text-slate-600 text-slate-400"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Student Details
          </h1>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center p-6 gap-6">
            <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
              <AvatarImage src={studentInfo.photoURL} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-bold">
                {studentInfo.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {studentInfo.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {studentInfo.enrollmentNumber}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{studentInfo.email}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Joined Aug 2024</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Filter className="h-4 w-4" />
                    <span>This Month</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>This Month</DropdownMenuItem>
                  <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
                  <DropdownMenuItem>This Semester</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Classes",
            value: (analytics as any).totalSessions || 0,
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Present Days",
            value: attendanceStats.totalAttendance,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Absent Days",
            value: attendanceStats.totalAbsent,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Attendance Rate",
            value: `${attendanceRate.monthly}%`,
            icon: BarChart3,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            highlight: true,
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <h3
                    className={`text-3xl font-bold tracking-tight text-slate-900 ${
                      stat.highlight ? "text-indigo-600" : ""
                    }`}
                  >
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Attendance Trend
            </CardTitle>
            <CardDescription>
              Weekly participation overview for the current semester
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Attendance"
                  stroke="#0f172a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0f172a" }}
                  activeDot={{ r: 6 }}
                  name="Your Attendance"
                />
                <Line
                  type="monotone"
                  dataKey="Average"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Class Average"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance & Rank Panel */}
        <Card className="border-0 shadow-sm rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Class Performance
            </CardTitle>
            <CardDescription>
              Your standing in the current batch
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Current Rank</span>
                <span className="font-bold text-slate-900">
                  Top {classPerformance?.percentile || 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full"
                  style={{ width: `${classPerformance?.percentile || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 text-right">
                {classPerformance?.rank || 0}th out of{" "}
                {classPerformance?.totalStudents || 0} students
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Class Size
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {classPerformance?.totalStudents || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Avg. Attendance
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {classPerformance?.classAverage || 0}%
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-auto">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Consistency Streak
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    You have attended {classPerformance?.streak || 0}{" "}
                    consecutive sessions!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Attendance Table */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Recent Attendance
            </CardTitle>
            <CardDescription>
              Detailed log of your last 5 sessions
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-900"
          >
            View All History
          </Button>
        </CardHeader>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Session
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Time Marked
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Notes
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailedRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      {record.date}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {record.session}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {record.time}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`
                                                  ${
                                                    record.status === "Present"
                                                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"
                                                      : "bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                                  }
                                                  px-3 py-1 text-xs font-semibold
                                              `}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {record.notes}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
