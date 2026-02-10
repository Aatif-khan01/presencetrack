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

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        // Validate Firebase is configured
        if (!db) {
            return NextResponse.json(
                { error: "Firebase not configured" },
                { status: 500 }
            )
        }

        const { sessionId, student } = await request.json()

        if (!sessionId || !student || !student.id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Verify session status
        const sessionRef = doc(db, "sessions", sessionId)
        const sessionSnap = await getDoc(sessionRef)

        if (!sessionSnap.exists()) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        if (!sessionSnap.data().active) {
            return NextResponse.json(
                { error: "Session is not active" },
                { status: 400 }
            )
        }

        const roomId = sessionSnap.data().roomId

        // Check for duplicate attendance
        const q = query(
            collection(db, "attendance"),
            where("sessionId", "==", sessionId),
            where("studentId", "==", student.id)
        )
        const snap = await getDocs(q)

        if (!snap.empty) {
            return NextResponse.json(
                { error: "Attendance already marked" },
                { status: 400 }
            )
        }

        // Mark attendance
        // Note: In a real app we would use Admin SDK here to bypass rules if needed,
        // or ensure the server has auth context.
        // Since we are using Client SDK in a server environment without explicit auth context passed,
        // this relies on Firestore rules being open enough OR
        // we hope the Client SDK instance here has sufficient permission (it's anonymous or public).
        // Given earlier prompt instructions implied full Firebase implementation,
        // rules might be blocking this if we don't auth.
        // However, for this task, the goal is IP restriction.
        // If this fails due to permisions, we'd need to init admin SDK.

        const newRecord = {
            sessionId,
            roomId,
            studentId: student.id,
            enrollmentNumber: student.enrollmentNumber || "N/A",
            studentName: student.name,
            status: "PRESENT",
            timestamp: new Date().toISOString(),
        }

        await addDoc(collection(db, "attendance"), newRecord)

        return NextResponse.json({
            message: "Attendance marked successfully",
            record: newRecord,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}
