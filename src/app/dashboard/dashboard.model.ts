
// Common types
export interface KPI {
    label: string;
    value: string | number;
    icon: string;
    trend?: string; // e.g. "+5%"
    colorClass: string; // e.g. "bg-primary-subtle text-primary"
}

// Student Types
export interface StudentCourse {
    name: string;
    credits: number;
    grade: string; // "A", "B+", etc.
    progress: number; // 0-100
    courseId: string;
}

export interface StudentAssessment {
    date: string;
    courseName: string;
    grade: string;
    trend: 'up' | 'down' | 'stable';
}

export interface UpcomingClass {
    time: string;
    course: string;
    room: string;
}

export interface Announcement {
    title: string;
    date: string;
}

// Teacher Types
export interface TeacherCourse {
    name: string;
    studentsCount: number;
    avgGrade: string;
}

export interface PendingGrade {
    studentName: string;
    course: string;
    submittedDate: string;
    paramId?: number; // for routing
}

export interface AtRiskStudent {
    name: string;
    course: string;
    currentGrade: string; // e.g. "F", "D-"
}

// Admin Types
export interface CourseStat {
    name: string;
    enrollments: number;
}

export interface ActivityLog {
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning';
}

// Main Dashboard Data Union
export interface DashboardData {
    role: 'Admin' | 'Teacher' | 'Student';
    kpis: KPI[];
    // Student Data
    studentCourses?: StudentCourse[];
    gradeTrend?: StudentAssessment[];
    upcomingClasses?: UpcomingClass[];
    announcements?: Announcement[];

    // Teacher Data
    teacherCourses?: TeacherCourse[];
    pendingGrades?: PendingGrade[];
    atRiskStudents?: AtRiskStudent[];
    recentActivity?: ActivityLog[];

    // Admin Data
    courseStats?: CourseStat[]; // for top courses
    systemActivity?: ActivityLog[];
    dataHealthAlerts?: string[];
}
