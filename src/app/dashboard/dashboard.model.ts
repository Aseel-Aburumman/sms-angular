
export interface KPI {
    label: string;
    description: string;
    value: string | number;
    icon: string;
    trend?: string;
    colorClass: string;
}

export interface StudentCourse {
    name: string;
    credits: number;
    grade: string;
    progress: number;
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

export interface TeacherCourse {
    name: string;
    courseId: string;
    studentsCount: number;
    avgGrade: string;
    teacherId: string;
}

export interface PendingGrade {
    studentName: string;
    course: string;
    submittedDate: string;
    paramId?: number;
}

export interface AtRiskStudent {
    name: string;
    course: string;
    currentGrade: string;
}

export interface CourseStat {
    name: string;
    enrollments: number;
}

export interface ActivityLog {
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning';
}

export interface DashboardData {
    role: 'Admin' | 'Teacher' | 'Student';
    kpis: KPI[];
    studentCourses?: StudentCourse[];
    gradeTrend?: StudentAssessment[];
    upcomingClasses?: UpcomingClass[];
    announcements?: Announcement[];

    teacherCourses?: TeacherCourse[];
    pendingGrades?: PendingGrade[];
    atRiskStudents?: AtRiskStudent[];
    recentActivity?: ActivityLog[];


    courseStats?: CourseStat[];
    systemActivity?: ActivityLog[];
    dataHealthAlerts?: string[];
}
