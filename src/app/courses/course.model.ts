export interface Course {
    id: string;
    name: string;
    description: string;
    credits: number;
    enrollments: any[];
    teacherId: string | null;
    createdAt: string;
}

