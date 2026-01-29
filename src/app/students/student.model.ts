export interface Student {
    id: string;
    fullName: string;
    email: string;
    dateOfBirth: string;
    enrollments: any[];
    createdAt: string;
}

export interface StudentQuery {
    search?: string;
    name?: string;
    email?: string;
    courseId?: string;
    courseName?: string;
}
