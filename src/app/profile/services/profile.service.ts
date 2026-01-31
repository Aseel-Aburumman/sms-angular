import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MyProfile, UpdateMyProfileDto } from '../profile.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private readonly baseUrl = environment.apiBaseUrl + '/api/profile';

    constructor(private http: HttpClient) { }

    me(): Observable<MyProfile> {
        return this.http.get<MyProfile>(`${this.baseUrl}/me`);
    }

    updateMe(dto: UpdateMyProfileDto): Observable<MyProfile> {
        return this.http.put<MyProfile>(`${this.baseUrl}/me`, dto);
    }

    uploadStudentImage(file: File): Observable<MyProfile> {
        const form = new FormData();
        form.append('file', file);

        return this.http.post<MyProfile>(`${this.baseUrl}/me/student-image`, form);
    }
}
