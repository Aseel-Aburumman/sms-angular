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


export interface CourseMiniDto {
    id: string;
    name: string;
    credits?: number;
    imageUrl?: string | null;
    teacherId?: string | null;

}

export interface UpdateTeacherRequestDto {
    fullName: string;
    email: string;
    userName?: string | null;
    phoneNumber?: string | null;
    profession?: string | null;
    imageUrl?: string | null;
}

export interface AssignTeacherCoursesDto {
    teacherId: string;
    courseIds: string[];
}

export interface UnassignTeacherCoursesDto {
    teacherId: string;
    courseIds: string[];
}
