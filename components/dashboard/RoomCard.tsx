import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Room } from "@/lib/types"

interface RoomCardProps {
  room: Room & { teacherName?: string; hasActiveSession?: boolean }
  role: "student" | "teacher"
  onAction?: (room: Room) => void
  disabled?: boolean
}

export function RoomCard({
  room,
  role,
  onAction,
  disabled,
}: RoomCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col ${
        disabled ? "opacity-70" : ""
      }`}
      onClick={() => !disabled && onAction && onAction(room)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2">
            {room.courseCode}
          </Badge>
          {room.hasActiveSession && (
            <Badge className="bg-orange-500 hover:bg-orange-600 animate-pulse text-white border-0">
              Live Session
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-1" title={room.roomName}>
          {room.roomName}
        </CardTitle>
        <CardDescription>
          {role === "student"
            ? `by ${room.teacherName}`
            : `${room.memberCount || 0} Students`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* Content reserved for extra details if needed */}
      </CardContent>

      <CardFooter>
        {role === "teacher" ? (
          <Button
            className="w-full group-hover:bg-primary/90"
            variant="outline"
          >
            Manage Room{" "}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : room.hasActiveSession ? (
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            disabled={disabled}
          >
            Enter Room
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full text-muted-foreground"
            disabled
          >
            No Session
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
