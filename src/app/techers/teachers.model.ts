export interface TeacherDto {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    profession?: string | null;
    imageUrl?: string | null;
    coursesCount: number;
}

export interface PagedResult<T> {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    items: T[];
}

export interface TeacherQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    name?: string;
    email?: string;
}

export interface CreateTeacherRequestDto {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string | null;
    profession?: string | null;
    imageUrl?: string | null;
    userName?: string | null;
}


export interface TeacherCourseStatsDto {
    courseId: string;
    courseName: string;
    status: 'NoStudents' | 'Ungraded' | 'InProgress' | 'Passed' | 'Failed' | string;
    studentsCount: number;
    passedCount: number;
    failedCount: number;
    ungradedCount: number;
    imageUrl?: string | null;
    averageGrade: number | null;
}

export interface TeacherDetailsDto {
    teacherId: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    profession?: string | null;
    imageUrl?: string | null;

    totalCourses: number;
    totalStudentsAcrossCourses: number;
    overallAverageGrade: number | null;

    courses: TeacherCourseStatsDto[];
}