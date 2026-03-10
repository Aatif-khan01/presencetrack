import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
    doc,
    getDoc,
    query,
    collection,
    where,
    getDocs,
    addDoc,
} from "firebase/firestore"
import { checkRateLimit, getClientIP, sanitizeInput } from "@/lib/security"

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        // Validate Firebase is configured
        if (!db) {
            return NextResponse.json(
                { error: "Service unavailable" },
                { status: 503 }
            )
        }

        // Rate limit: 10 requests per minute per IP (attendance marking)
        const ip = getClientIP(request)
        const rl = checkRateLimit(`attendance:${ip}`, 10, 60000)
        if (!rl.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            )
        }

        const body = await request.json()
        const { sessionId, student } = body

        // Validate required fields
        if (!sessionId || typeof sessionId !== 'string') {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 400 }
            )
        }

        if (!student || !student.id || typeof student.id !== 'string') {
            return NextResponse.json(
                { error: "Invalid student data" },
                { status: 400 }
            )
        }

        // Sanitize inputs
        const cleanSessionId = sessionId.trim().slice(0, 128)
        const cleanStudentId = student.id.trim().slice(0, 128)
        const cleanStudentName = sanitizeInput(student.name || 'Unknown', 100)
        const cleanEnrollmentNumber = sanitizeInput(student.enrollmentNumber || 'N/A', 30)

        // Verify session exists and is active
        const sessionRef = doc(db, "sessions", cleanSessionId)
        const sessionSnap = await getDoc(sessionRef)

        if (!sessionSnap.exists()) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        if (!sessionSnap.data().active) {
            return NextResponse.json(
                { error: "Session is no longer active" },
                { status: 400 }
            )
        }

        const roomId = sessionSnap.data().roomId

        // Verify student is an approved member of the room
        const memberQ = query(
            collection(db, "members"),
            where("roomId", "==", roomId),
            where("studentId", "==", cleanStudentId),
            where("status", "==", "approved")
        )
        const memberSnap = await getDocs(memberQ)

        if (memberSnap.empty) {
            return NextResponse.json(
                { error: "You are not an approved member of this room" },
                { status: 403 }
            )
        }

        // Check for duplicate attendance
        const q = query(
            collection(db, "attendance"),
            where("sessionId", "==", cleanSessionId),
            where("studentId", "==", cleanStudentId)
        )
        const snap = await getDocs(q)

        if (!snap.empty) {
            return NextResponse.json(
                { error: "Attendance already marked" },
                { status: 400 }
            )
        }

        // Mark attendance with sanitized data
        const newRecord = {
            sessionId: cleanSessionId,
            roomId,
            studentId: cleanStudentId,
            enrollmentNumber: cleanEnrollmentNumber,
            studentName: cleanStudentName,
            status: "PRESENT",
            timestamp: new Date().toISOString(),
        }

        await addDoc(collection(db, "attendance"), newRecord)

        return NextResponse.json({
            message: "Attendance marked successfully",
        })
    } catch {
        // SECURITY: Never leak internal error details to the client
        return NextResponse.json(
            { error: "Failed to mark attendance. Please try again." },
            { status: 500 }
        )
    }
}
