/** Backend: Firebase (Auth + Firestore) only. No MongoDB. */
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    UserCredential
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp,
    increment,
    limit,
    DocumentData,
    QuerySnapshot
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { User, Room, Session, Member, AttendanceRecord, StudentAnalytics } from "./types";

// Helper to get user role from Firestore
const getUserRole = async (uid: string): Promise<User | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
};

// ============ AUTH ============

export const authAPI = {
    login: async ({ email, password }: any) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userData = await getUserRole(userCredential.user.uid);

        if (!userData) throw new Error("User data not found");

        return {
            token: await userCredential.user.getIdToken(),
            user: { ...userData, id: userCredential.user.uid }
        };
    },

    register: async (userData: any) => {
        // Check if enrollment exists for students
        if (userData.role === 'student' && userData.enrollmentNumber) {
            const q = query(collection(db, "users"), where("enrollmentNumber", "==", userData.enrollmentNumber));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error("Enrollment number already exists");
            }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const uid = userCredential.user.uid;

        const newUser: User = {
            id: uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            enrollmentNumber: userData.enrollmentNumber || null,
            createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", uid), newUser);

        return {
            token: await userCredential.user.getIdToken(),
            user: { ...newUser, createdAt: new Date().toISOString() }
        };
    },

    loginWithGoogle: async (role: string = "student") => {
        const result = await signInWithPopup(auth, googleProvider);
        const uid = result.user.uid;

        // Check if user exists
        let userData = await getUserRole(uid);

        if (!userData) {
            return {
                token: await result.user.getIdToken(),
                user: {
                    id: uid,
                    name: result.user.displayName || "Unknown",
                    email: result.user.email || "",
                    photoURL: result.user.photoURL,
                    role: role as 'student' | 'teacher'
                },
                isNewUser: true
            };
        }

        return {
            token: await result.user.getIdToken(),
            user: { ...userData, id: uid },
            isNewUser: false
        };
    },

    completeProfile: async (data: any) => {
        const uid = data.id;
        const profileUpdate: any = {};
        if (data.name != null) profileUpdate.name = String(data.name);
        if (data.role != null) profileUpdate.role = String(data.role);
        profileUpdate.enrollmentNumber = data.role === "student" ? (data.enrollmentNumber ? String(data.enrollmentNumber) : null) : null;
        if (data.photoURL != null && typeof data.photoURL === "string") profileUpdate.photoURL = data.photoURL;
        await setDoc(doc(db, "users", uid), profileUpdate, { merge: true });
        const updated = await getUserRole(uid);
        const createdAt = updated?.createdAt;
        const serializable = {
            id: uid,
            name: updated?.name ?? data.name,
            email: updated?.email ?? data.email,
            role: updated?.role ?? data.role,
            enrollmentNumber: updated?.enrollmentNumber ?? profileUpdate.enrollmentNumber ?? null,
            photoURL: updated?.photoURL ?? data.photoURL ?? null,
            createdAt: createdAt?.toDate?.() ? createdAt.toDate().toISOString() : (typeof createdAt === "string" ? createdAt : null),
        };
        return serializable;
    },

    logout: async () => {
        await signOut(auth);
    },

    me: async (userId: string) => {
        const userData = await getUserRole(userId);
        if (!userData) throw new Error('User not found');
        return { user: userData };
    }
};

// ============ ROOMS ============

export const roomAPI = {
    create: async (roomData: any, teacherId: string) => {
        const teacherData = await getUserRole(teacherId);

        const newRoom = {
            ...roomData,
            teacherId,
            teacherName: teacherData?.name || 'Unknown Teacher',
            createdAt: serverTimestamp(),
            memberCount: 0
        };

        const docRef = await addDoc(collection(db, "rooms"), newRoom);
        return { room: { ...newRoom, id: docRef.id } };
    },

    getTeacherRooms: async (teacherId: string) => {
        const q = query(collection(db, "rooms"), where("teacherId", "==", teacherId));
        const querySnapshot = await getDocs(q);
        const rooms = querySnapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
            memberCount: typeof d.data().memberCount === "number" ? d.data().memberCount : 0
        }));
        return { rooms };
    },

    getStudentRooms: async (studentId: string) => {
        const membersQ = query(collection(db, "members"), where("studentId", "==", studentId));
        const membersSnap = await getDocs(membersQ);
        const roomIds = membersSnap.docs.map((d) => d.data().roomId);

        if (roomIds.length === 0) return { rooms: [] };

        const today = new Date().toISOString().split("T")[0];

        const [roomDocs, sessionsSnap, attendanceSnap] = await Promise.all([
            Promise.all(roomIds.map((roomId) => getDoc(doc(db, "rooms", roomId)))),
            getDocs(query(
                collection(db, "sessions"),
                where("date", "==", today),
                where("active", "==", true)
            )),
            getDocs(query(
                collection(db, "attendance"),
                where("studentId", "==", studentId)
            ))
        ]);

        const rooms = roomDocs
            .map((roomDoc, i) => (roomDoc.exists() ? { ...roomDoc.data(), id: roomIds[i] } : null))
            .filter(Boolean);

        const activeSessionsByRoom: Record<string, any> = {};
        sessionsSnap.docs.forEach((d) => {
            const data = d.data();
            if (roomIds.includes(data.roomId)) {
                activeSessionsByRoom[data.roomId] = { ...data, id: d.id };
            }
        });

        const markedSessionIds = new Set(attendanceSnap.docs.map((d) => d.data().sessionId));

        const roomsWithStatus = rooms.map((room: any) => {
            const session = activeSessionsByRoom[room.id] || null;
            return {
                ...room,
                hasActiveSession: !!session,
                sessionId: session?.id,
                hasMarked: session ? markedSessionIds.has(session.id) : false
            };
        });

        return { rooms: roomsWithStatus };
    },

    getRoomForStudent: async (roomId: string, studentId: string) => {
        const [roomDoc, memberSnap, sessionsSnap] = await Promise.all([
            getDoc(doc(db, "rooms", roomId)),
            getDocs(query(
                collection(db, "members"),
                where("roomId", "==", roomId),
                where("studentId", "==", studentId)
            )),
            getDocs(query(
                collection(db, "sessions"),
                where("roomId", "==", roomId),
                where("date", "==", new Date().toISOString().split("T")[0]),
                where("active", "==", true)
            ))
        ]);

        if (!roomDoc.exists() || memberSnap.empty) return null;

        const room = { ...roomDoc.data(), id: roomId };
        const session = !sessionsSnap.empty ? { ...sessionsSnap.docs[0].data(), id: sessionsSnap.docs[0].id } : null;

        let hasMarked = false;
        if (session) {
            const attSnap = await getDocs(query(
                collection(db, "attendance"),
                where("sessionId", "==", session.id),
                where("studentId", "==", studentId)
            ));
            hasMarked = !attSnap.empty;
        }

        return {
            room,
            hasActiveSession: !!session,
            sessionId: session?.id,
            hasMarked
        };
    },

    getAvailableRooms: async (studentId: string) => {
        const [membersSnap, roomSnap] = await Promise.all([
            getDocs(query(collection(db, "members"), where("studentId", "==", studentId))),
            getDocs(query(collection(db, "rooms"), limit(100)))
        ]);
        const joinedRoomIds = new Set(membersSnap.docs.map((d) => d.data().roomId));
        const allRooms = roomSnap.docs.map((d) => ({ ...d.data(), id: d.id }));
        const availableRooms = allRooms.filter((r: any) => !joinedRoomIds.has(r.id));
        availableRooms.sort((a: any, b: any) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        return { rooms: availableRooms };
    },

    join: async (roomId: string, student: User) => {
        const q = query(
            collection(db, "members"),
            where("roomId", "==", roomId),
            where("studentId", "==", student.id)
        );
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error("Already joined this room");

        const newMember = {
            roomId,
            studentId: student.id,
            enrollmentNumber: student.enrollmentNumber || "N/A",
            studentName: student.name,
            joinedAt: serverTimestamp()
        };

        const roomRef = doc(db, "rooms", roomId);
        await Promise.all([
            addDoc(collection(db, "members"), newMember),
            updateDoc(roomRef, { memberCount: increment(1) })
        ]);
        return { message: "Joined successfully" };
    },

    getDetails: async (roomId: string) => {
        const roomPromise = getDoc(doc(db, "rooms", roomId));
        const membersQ = query(collection(db, "members"), where("roomId", "==", roomId));
        const membersPromise = getDocs(membersQ);

        const [roomDoc, membersSnap] = await Promise.all([roomPromise, membersPromise]);

        if (!roomDoc.exists()) throw new Error('Room not found');
        const members = membersSnap.docs.map(d => d.data());

        return { room: { ...roomDoc.data(), id: roomId }, members };
    }
};

// ============ ATTENDANCE ============

export const attendanceAPI = {
    start: async (roomId: string) => {
        const today = new Date().toISOString().split('T')[0];

        // Check active session only - prevent concurrent active sessions if desired, 
        // OR allow multiple active sessions. Usually only one active session per room makes sense.
        // Let's restrict to one ACTIVE session at a time, but allow multiple completed ones.

        const q = query(
            collection(db, "sessions"),
            where("roomId", "==", roomId),
            where("active", "==", true)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
            throw new Error('A session is already active. Please end it first.');
        }

        const newSession = {
            roomId,
            date: today,
            active: true,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "sessions"), newSession);
        return { session: { ...newSession, id: docRef.id } };
    },

    end: async (sessionId: string) => {
        const sessionRef = doc(db, "sessions", sessionId);
        await updateDoc(sessionRef, {
            active: false,
            endedAt: serverTimestamp()
        });
        return { message: 'Session ended' };
    },

    mark: async (sessionId: string, student: any) => {
        const response = await fetch('/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, student })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to mark attendance');
        }

        return await response.json();
    },

    getSessionDetails: async (sessionId: string) => {
        const sessionSnap = await getDoc(doc(db, "sessions", sessionId));
        if (!sessionSnap.exists()) throw new Error('Session not found');
        const session = { ...sessionSnap.data(), id: sessionSnap.id } as Session;

        const roomSnap = await getDoc(doc(db, "rooms", session.roomId));
        const room = { ...roomSnap.data(), id: roomSnap.id };

        const membersQ = query(collection(db, "members"), where("roomId", "==", session.roomId));
        const membersSnap = await getDocs(membersQ);
        const members = membersSnap.docs.map(d => d.data());

        const attQ = query(collection(db, "attendance"), where("sessionId", "==", sessionId));
        const attSnap = await getDocs(attQ);
        const records = attSnap.docs.map(d => d.data());
        const presentIds = records.map(r => r.studentId);

        const attendance = members.map(member => ({
            studentId: member.studentId,
            studentName: member.studentName,
            enrollmentNumber: member.enrollmentNumber,
            status: presentIds.includes(member.studentId) ? 'present' : 'absent',
            timestamp: records.find(r => r.studentId === member.studentId)?.timestamp || null
        }));

        return { session, room, attendance };
    },

    getRoomSessions: async (roomId: string) => {
        const roomDoc = await getDoc(doc(db, "rooms", roomId));
        const room = { ...roomDoc.data(), id: roomDoc.id } as Room;

        const sessionsQ = query(collection(db, "sessions"), where("roomId", "==", roomId)); // sort needs index
        const sessionsSnap = await getDocs(sessionsQ);
        let sessions = sessionsSnap.docs.map(d => ({ ...d.data(), id: d.id, date: d.data().date }));

        // Sort in memory to avoid index requirement for now
        sessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const membersQ = query(collection(db, "members"), where("roomId", "==", roomId));
        const membersSnap = await getDocs(membersQ);
        const totalMembers = membersSnap.size;

        const sessionsWithCount = await Promise.all(sessions.map(async (s: any) => {
            const attQ = query(collection(db, "attendance"), where("sessionId", "==", s.id));
            const attSnap = await getDocs(attQ);
            return { ...s, presentCount: attSnap.size, totalMembers };
        }));

        return { room, sessions: sessionsWithCount };
    },

    getMyHistory: async (roomId: string, studentId: string) => {
        const roomDoc = await getDoc(doc(db, "rooms", roomId));
        const room = { ...roomDoc.data(), id: roomDoc.id };

        const sessionsQ = query(collection(db, "sessions"), where("roomId", "==", roomId));
        const sessionsSnap = await getDocs(sessionsQ);
        let sessions = sessionsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        sessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const history = await Promise.all(sessions.map(async (s: any) => {
            const q = query(
                collection(db, "attendance"),
                where("sessionId", "==", s.id),
                where("studentId", "==", studentId)
            );
            const snap = await getDocs(q);
            const record = !snap.empty ? snap.docs[0].data() : null;

            return {
                date: s.date,
                sessionId: s.id,
                status: record ? 'present' : 'absent',
                timestamp: record?.timestamp || null
            }
        }));

        const presentCount = history.filter(h => h.status === 'present').length;
        const percentage = sessions.length > 0 ? Math.round((presentCount / sessions.length) * 100) : 0;

        return { room, history, stats: { total: sessions.length, present: presentCount, percentage } };
    },

    getDetailedReport: async (roomId: string) => {
        const [membersSnap, sessionsSnap, attendanceSnap] = await Promise.all([
            getDocs(query(collection(db, "members"), where("roomId", "==", roomId))),
            getDocs(query(collection(db, "sessions"), where("roomId", "==", roomId))),
            getDocs(query(collection(db, "attendance"), where("roomId", "==", roomId)))
        ]);

        const members = membersSnap.docs.map(d => d.data());
        // Sort sessions by date ascending for the report columns
        let sessions = sessionsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        sessions.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const attendanceMap: Record<string, any> = {};
        attendanceSnap.docs.forEach(d => {
            const data = d.data();
            attendanceMap[`${data.sessionId}_${data.studentId}`] = data;
        });

        return { members, sessions, attendanceMap };
    }
};

// ============ ANALYTICS ============

export const analyticsAPI = {
    getRoomAnalytics: async (roomId: string) => {
        const [roomDoc, membersSnap, sessionsSnap, attendanceSnap] = await Promise.all([
            getDoc(doc(db, "rooms", roomId)),
            getDocs(query(collection(db, "members"), where("roomId", "==", roomId))),
            getDocs(query(collection(db, "sessions"), where("roomId", "==", roomId))),
            getDocs(query(collection(db, "attendance"), where("roomId", "==", roomId)))
        ]);

        if (!roomDoc.exists()) throw new Error("Room not found");
        const room = { ...roomDoc.data(), id: roomDoc.id } as Room;
        const members = membersSnap.docs.map((d) => d.data());
        const sessions = sessionsSnap.docs.map((d) => ({ ...d.data(), id: d.id }));
        const totalSessions = sessions.length;

        const presentByStudent: Record<string, number> = {};
        attendanceSnap.docs.forEach((d) => {
            const sid = d.data().studentId;
            presentByStudent[sid] = (presentByStudent[sid] || 0) + 1;
        });

        const studentStats = members.map((member) => {
            const presentCount = presentByStudent[member.studentId] || 0;
            return {
                studentId: member.studentId,
                studentName: member.studentName,
                enrollmentNumber: member.enrollmentNumber,
                presentCount,
                totalSessions,
                percentage: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
            };
        });
        studentStats.sort((a, b) => a.percentage - b.percentage);

        return { room, totalSessions, totalStudents: members.length, studentStats };
    },

    getTeacherDashboardStats: async (teacherId: string) => {
        // Get all teacher's rooms
        const roomsQ = query(collection(db, "rooms"), where("teacherId", "==", teacherId));
        const roomsSnap = await getDocs(roomsQ);
        const roomIds = roomsSnap.docs.map(d => d.id);

        if (roomIds.length === 0) {
            return {
                totalRooms: 0,
                totalStudents: 0,
                todaySessions: 0,
                activeSessions: 0
            };
        }

        // Parallelize fetching stats for all rooms
        const roomStats = await Promise.all(roomIds.map(async (roomId) => {
            // Member count
            const mQ = query(collection(db, "members"), where("roomId", "==", roomId));
            const mSnapPromise = getDocs(mQ);

            // Session count
            const today = new Date().toISOString().split('T')[0];
            const sQ = query(
                collection(db, "sessions"),
                where("roomId", "==", roomId),
                where("date", "==", today)
            );
            const sSnapPromise = getDocs(sQ);

            const [mSnap, sSnap] = await Promise.all([mSnapPromise, sSnapPromise]);

            return {
                studentCount: mSnap.size,
                sessionCount: sSnap.size,
                activeCount: sSnap.docs.filter(d => d.data().active).length
            };
        }));

        // Aggregate results
        let totalStudents = 0;
        let todaySessions = 0;
        let activeSessions = 0;

        roomStats.forEach(stat => {
            totalStudents += stat.studentCount;
            todaySessions += stat.sessionCount;
            activeSessions += stat.activeCount;
        });

        return {
            totalRooms: roomIds.length,
            totalStudents,
            todaySessions,
            activeSessions
        };
    },

    getAllRoomsAnalytics: async (teacherId: string) => {
        const roomsQ = query(collection(db, "rooms"), where("teacherId", "==", teacherId));
        const roomsSnap = await getDocs(roomsQ);
        const rooms = roomsSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Room[];

        if (rooms.length === 0) return {
            rooms: [],
            avgAttendance: 0,
            lowAttendanceCount: 0,
            totalSessions: 0,
            weeklyData: [],
            classComparison: []
        };

        const roomResults = await Promise.all(rooms.map(async (room) => {
            const [sSnap, mSnap] = await Promise.all([
                getDocs(query(collection(db, "sessions"), where("roomId", "==", room.id))),
                getDocs(query(collection(db, "members"), where("roomId", "==", room.id)))
            ]);

            const memberCount = mSnap.size;
            const sessions: any[] = sSnap.docs.map((d) => ({ ...d.data(), id: d.id, roomId: room.id, roomName: room.roomName, courseCode: room.courseCode }));

            let roomPresentCount = 0;
            const roomTotalPossible = sessions.length * memberCount;
            let localLowAttendanceCount = 0;
            const sessionPresentCounts: any[] = [];

            if (sessions.length > 0 && memberCount > 0) {
                const sessionAttSnaps = await Promise.all(
                    sessions.map((s) => getDocs(query(collection(db, "attendance"), where("sessionId", "==", s.id))))
                );

                const studentAttendanceCounts: Record<string, number> = {};
                sessionAttSnaps.forEach((snap, i) => {
                    const pc = snap.size;
                    roomPresentCount += pc;
                    sessionPresentCounts.push({ sessionId: sessions[i].id, presentCount: pc, totalMembers: memberCount });
                });
                sessionAttSnaps.forEach((snap) => {
                    snap.docs.forEach((d) => {
                        const sid = d.data().studentId;
                        studentAttendanceCounts[sid] = (studentAttendanceCounts[sid] || 0) + 1;
                    });
                });
                const members = mSnap.docs.map((d) => d.data());
                members.forEach((m) => {
                    const p = studentAttendanceCounts[m.studentId] || 0;
                    if (sessions.length > 0 && p / sessions.length < 0.75) localLowAttendanceCount++;
                });
            }

            const roomAvg = roomTotalPossible > 0 ? Math.round((roomPresentCount / roomTotalPossible) * 100) : 0;

            return {
                sessions: sessions.map((s, i) => ({
                    ...s,
                    presentCount: sessionPresentCounts[i]?.presentCount ?? 0,
                    totalMembers: memberCount
                })),
                memberCount,
                roomAvg,
                roomPresentCount,
                roomTotalPossible,
                localLowAttendanceCount,
                classComparisonItem: {
                    name: room.courseCode,
                    present: roomPresentCount,
                    absent: roomTotalPossible - roomPresentCount
                }
            };
        }));

        let totalSessionsAcrossAll = 0;
        let totalAttendanceSum = 0;
        let lowAttendanceCount = 0;
        const classComparison: any[] = [];
        const allSessionsWithStats: any[] = [];

        roomResults.forEach((res) => {
            totalSessionsAcrossAll += res.sessions.length;
            totalAttendanceSum += res.roomAvg;
            lowAttendanceCount += res.localLowAttendanceCount;
            classComparison.push(res.classComparisonItem);
            allSessionsWithStats.push(...res.sessions);
        });

        const avgAttendance = rooms.length > 0 ? Math.round(totalAttendanceSum / rooms.length) : 0;

        const sessionsByDate: Record<string, any[]> = {};
        allSessionsWithStats.forEach((s) => {
            if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
            sessionsByDate[s.date].push(s);
        });

        const sortedDates = Object.keys(sessionsByDate).sort();
        const last5Dates = sortedDates.slice(-5);

        const weeklyData = last5Dates.map((date) => {
            const sessionsOnDate = sessionsByDate[date];
            let totalP = 0;
            let totalPossible = 0;
            sessionsOnDate.forEach((s) => {
                totalP += s.presentCount ?? 0;
                totalPossible += s.totalMembers ?? 0;
            });
            const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
            return {
                name: dayName,
                attendance: totalPossible > 0 ? Math.round((totalP / totalPossible) * 100) : 0
            };
        });

        while (weeklyData.length < 5) {
            weeklyData.unshift({ name: "-", attendance: 0 });
        }

        return {
            avgAttendance,
            lowAttendanceCount,
            totalSessions: totalSessionsAcrossAll,
            classComparison,
            weeklyData
        };
    }
};

// ============ TIME MANAGEMENT ============

export const timeManagementAPI = {
    /**
     * Get comprehensive analytics for a student
     * @param {string} studentId - The student's user ID
     * @returns {Promise<Object>} Student analytics data
     */
    getStudentAnalytics: async (studentId: string): Promise<StudentAnalytics> => {
        try {
            // Get student info
            const studentDoc = await getDoc(doc(db, "users", studentId));
            if (!studentDoc.exists()) {
                throw new Error("Student not found");
            }
            const studentInfo = { id: studentDoc.id, ...studentDoc.data() } as User;

            // Get all attendance records for this student
            const attendanceQuery = query(
                collection(db, "attendance"),
                where("studentId", "==", studentId)
            );
            const attendanceSnapshot = await getDocs(attendanceQuery);

            const attendanceRecords: AttendanceRecord[] = [];
            attendanceSnapshot.forEach((doc) => {
                const data = doc.data();
                attendanceRecords.push({ id: doc.id, ...data } as AttendanceRecord);
            });

            // Calculate statistics
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            // Filter records by year and month
            const thisYearRecords = attendanceRecords.filter(record => {
                const recordDate = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
                return recordDate.getFullYear() === currentYear;
            });

            const thisMonthRecords = attendanceRecords.filter(record => {
                const recordDate = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
                return recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth;
            });

            // Count attendance statuses
            const totalAttendance = attendanceRecords.filter(r => r.status === 'present').length;
            const lateAttendance = attendanceRecords.filter(r => r.status === 'late').length;
            const undertimeAttendance = attendanceRecords.filter(r => r.status === 'undertime').length;
            const totalAbsent = attendanceRecords.filter(r => r.status === 'absent').length;

            // Calculate class days this month (unique dates with sessions)
            const uniqueDatesThisMonth = new Set();
            thisMonthRecords.forEach(record => {
                const recordDate = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
                uniqueDatesThisMonth.add(recordDate.toDateString());
            });
            const classDaysThisMonth = uniqueDatesThisMonth.size;

            // Calculate attendance rates
            const yearlyTotal = thisYearRecords.length;
            const yearlyPresent = thisYearRecords.filter(r => r.status === 'present').length;
            const yearlyRate = yearlyTotal > 0 ? Math.round((yearlyPresent / yearlyTotal) * 100) : 0;

            const monthlyTotal = thisMonthRecords.length;
            const monthlyPresent = thisMonthRecords.filter(r => r.status === 'present').length;
            const monthlyRate = monthlyTotal > 0 ? Math.round((monthlyPresent / monthlyTotal) * 100) : 0;

            // Calculate weekly data (last 8 weeks)
            const weeklyData = [];
            for (let i = 7; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - (i * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                const weekRecords = attendanceRecords.filter(r => {
                    const rDate = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
                    return rDate >= weekStart && rDate <= weekEnd && r.status === 'present';
                });

                weeklyData.push({
                    name: `Week ${8 - i}`,
                    attendance: weekRecords.length
                });
            }

            // detailed records for table
            const recentHistory = attendanceRecords
                .sort((a, b) => {
                    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                    return dateB - dateA; // Sort descending
                })
                .slice(0, 5)
                .map(record => {
                    const date = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
                    return {
                        id: record.id,
                        date: date.toLocaleDateString(),
                        session: record.roomName || "Session", // Assuming roomName is saved or fetched
                        status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
                        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        notes: record.status === 'absent' ? 'Absent' : '-'
                    };
                });



            // Calculate Class Performance (Rank, Average, etc.)
            // Note: In a real large-scale app, this should be a separate aggregated document or cloud function
            const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
            const studentsSnapshot = await getDocs(studentsQuery);
            const totalStudents = studentsSnapshot.size;

            let totalClassAttendanceRate = 0;
            const studentRates: { id: string, rate: number }[] = [];

            for (const doc of studentsSnapshot.docs) {
                const sId = doc.id;
                // We need to fetch attendance for each student to calculate accurate rank
                // Optimization: In real app, store 'attendanceRate' on user document
                const sAttendanceQuery = query(collection(db, "attendance"), where("studentId", "==", sId));
                const sAttendanceSnapshot = await getDocs(sAttendanceQuery);
                const sTotal = sAttendanceSnapshot.size;
                const sPresent = sAttendanceSnapshot.docs.filter(d => d.data().status === 'present').length;
                const sRate = sTotal > 0 ? (sPresent / sTotal) * 100 : 0;

                totalClassAttendanceRate += sRate;
                studentRates.push({ id: sId, rate: sRate });
            }

            const classAverage = totalStudents > 0 ? Math.round(totalClassAttendanceRate / totalStudents) : 0;

            // Sort to find rank
            studentRates.sort((a, b) => b.rate - a.rate);
            const rankIndex = studentRates.findIndex(s => s.id === studentId);
            const rank = rankIndex !== -1 ? rankIndex + 1 : 0;

            // Calculate Streak
            // Sort records in reverse chronological order
            const sortedRecords = [...attendanceRecords].sort((a, b) => {
                const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return dateB - dateA;
            });

            let streak = 0;
            for (const record of sortedRecords) {
                if (record.status === 'present') {
                    streak++;
                } else {
                    break;
                }
            }

            return {
                studentInfo: {
                    id: studentInfo.id,
                    name: studentInfo.name,
                    email: studentInfo.email,
                    phone: studentInfo.phone || "N/A",
                    address: studentInfo.address || "N/A",
                    enrollmentNumber: studentInfo.enrollmentNumber || "N/A",
                    photoURL: studentInfo.photoURL || null,
                    role: studentInfo.role
                },
                totalSessions: attendanceRecords.length,
                attendanceStats: {
                    totalAttendance,
                    lateAttendance,
                    undertimeAttendance,
                    totalAbsent,
                    classDaysThisMonth
                },
                attendanceRate: {
                    thisYear: yearlyRate,
                    monthly: monthlyRate
                },
                summary: {
                    attendance: totalAttendance,
                    late: lateAttendance,
                    undertime: undertimeAttendance,
                    absent: totalAbsent
                },
                weeklyData,
                recentHistory,
                classPerformance: {
                    rank,
                    totalStudents,
                    classAverage,
                    streak,
                    percentile: totalStudents > 0 ? Math.round(((totalStudents - rank) / totalStudents) * 100) : 0
                }
            };
        } catch (error) {
            console.error("Error fetching student analytics:", error);
            throw error;
        }
    },

    /**
     * Get top performing students based on attendance rate
     * @param {number} limitCount - Number of top students to return
     * @returns {Promise<Array>} Array of top students
     */
    getTopStudents: async (limitCount = 10) => {
        try {
            // Get all students
            const studentsQuery = query(
                collection(db, "users"),
                where("role", "==", "student")
            );
            const studentsSnapshot = await getDocs(studentsQuery);

            const studentStats: any[] = [];

            // Calculate attendance rate for each student
            for (const studentDoc of studentsSnapshot.docs) {
                const studentId = studentDoc.id;
                const studentData = studentDoc.data();

                // Get attendance records
                const attendanceQuery = query(
                    collection(db, "attendance"),
                    where("studentId", "==", studentId)
                );
                const attendanceSnapshot = await getDocs(attendanceQuery);

                const totalRecords = attendanceSnapshot.size;
                let presentCount = 0;

                attendanceSnapshot.forEach((doc) => {
                    if (doc.data().status === 'present') {
                        presentCount++;
                    }
                });

                const attendanceRate = totalRecords > 0
                    ? Math.round((presentCount / totalRecords) * 100)
                    : 0;

                studentStats.push({
                    id: studentId,
                    name: studentData.name,
                    email: studentData.email,
                    photoURL: studentData.photoURL,
                    role: studentData.role,
                    attendanceRate,
                    totalClasses: totalRecords,
                    presentClasses: presentCount
                });
            }

            // Sort by attendance rate (descending)
            studentStats.sort((a, b) => b.attendanceRate - a.attendanceRate);

            return studentStats.slice(0, limitCount);
        } catch (error) {
            console.error("Error fetching top students:", error);
            return [];
        }
    }
};
