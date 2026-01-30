export interface Student {
    id: string;
    fullName: string;
    email: string;
    dateOfBirth: string;
    enrollments: any[];
    imageUrl: string;
    gender: string;
    phoneNumber: string;
    createdAt: string;
    summary: {
        totalCourses: number;
        passedCourses: number;
        failedCourses: number;
        inProgressCourses: number;
        averageGpa: number;
        averageLetterGrade: string;
    }
}

export interface StudentQuery {
    search?: string;
    name?: string;
    email?: string;
    courseId?: string;
    courseName?: string;
    page?: number;      // 1-based
    pageSize?: number;
}
