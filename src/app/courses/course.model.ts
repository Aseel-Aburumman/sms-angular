
export interface Course {
    id: string;
    name: string;
    description: string;
    credits: number;
    imageUrl: string | "assets/user.png";
    createdAt: string;
    teacherId: string | null;
    teacher: Teacher | null;
    statuse: string;
    enrollments: Enrollment[];
}

export interface Enrollment {
    id: string;
    studentId: string;
    studentName: string;
    studentUserId: string;
    grade: string | null;
    enrollmentDate: string;
    createdAt: string;
}

export interface Teacher {
    id: string;
    fullName: string;
    phoneNumber: string | null;
    email: string;
    createdAt: string;
}
