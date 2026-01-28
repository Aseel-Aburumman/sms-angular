import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentsService {
  private readonly baseUrl = 'http://localhost:5000/api/Enrollment';

  constructor(private http: HttpClient) { }


  enrollStudent(payload: { studentId: string; courseId: string }) {
    return this.http.post(this.baseUrl, payload);
  }

  unrollStudent(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }

  updateGrade(enrollmentId: string, payload: { grade: string | null }) {
    return this.http.patch(`${this.baseUrl}/${enrollmentId}/grade`, payload);
  }


}
