export interface Student {
    studentId: string;
    fullName: string;
    email: string;
    dateOfBirth: string | null;
    gender: string;
    imageUrl: string | null;
    createdAt: string;
}

export interface Teacher {
    teacherId: string;
    imageUrl: string | null;
    profession: string | null;
}

export interface MyProfile {
    userId: string;
    email: string;
    fullName: string;
    roles: string[];
    phoneNumber?: string | null;
    student?: Student | null;
    teacher?: Teacher | null;

}

export interface UpdateMyProfileDto {
    fullName?: string;
    email?: string;
    userName?: string;
    gender?: string;

    phoneNumber?: string | null;
    dateOfBirth?: string;
}

export interface ApiMessage {
    message: string;
}
