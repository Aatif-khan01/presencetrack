export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher';
    enrollmentNumber?: string | null;
    photoURL?: string | null;
    phone?: string;
    address?: string;
    createdAt?: any;
}

export interface Room {
    id: string;
    roomName: string;
    courseCode: string;
    teacherId: string;
    teacherName: string;
    memberCount: number;
    createdAt?: any;
}

export interface Session {
    id: string;
    roomId: string;
    date: string;
    active: boolean;
    createdAt?: any;
    endedAt?: any;
}

export interface Member {
    id?: string;
    roomId: string;
    studentId: string;
    enrollmentNumber: string;
    studentName: string;
    status: 'pending' | 'approved' | 'rejected';
    joinedAt: any;
}

export interface AttendanceRecord {
    id: string;
    sessionId: string;
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'undertime';
    timestamp: any;
    location?: {
        lat: number;
        lng: number;
    };
    deviceInfo?: string;
    ip?: string;
    roomName?: string;
    date?: string;
    courseCode?: string;
}

export interface StudentAnalytics {
    studentInfo: User;
    totalSessions: number;
    attendanceStats: {
        totalAttendance: number;
        lateAttendance: number;
        undertimeAttendance: number;
        totalAbsent: number;
        classDaysThisMonth: number;
    };
    attendanceRate: {
        thisYear: number;
        monthly: number;
    };
    summary: {
        attendance: number;
        late: number;
        undertime: number;
        absent: number;
    };
    weeklyData: { name: string; attendance: number }[];
    recentHistory: any[];
    classPerformance: {
        rank: number;
        totalStudents: number;
        classAverage: number;
        streak: number;
        percentile: number;
    };
}
