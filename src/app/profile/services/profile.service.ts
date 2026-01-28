import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MyProfile, UpdateMyProfileDto } from '../profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private readonly baseUrl = 'http://localhost:5000/api/profile';

    constructor(private http: HttpClient) { }

    me(): Observable<MyProfile> {
        return this.http.get<MyProfile>(`${this.baseUrl}/me`);
    }

    updateMe(dto: UpdateMyProfileDto): Observable<MyProfile> {
        return this.http.put<MyProfile>(`${this.baseUrl}/me`, dto);
    }

    uploadStudentImage(file: File): Observable<MyProfile> {
        const form = new FormData();
        form.append('file', file); // MUST match backend param name: UploadStudentImage([FromForm] IFormFile file)

        return this.http.post<MyProfile>(`${this.baseUrl}/me/student-image`, form);
    }
}
