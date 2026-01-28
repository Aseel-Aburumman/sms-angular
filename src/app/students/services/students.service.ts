import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private readonly baseUrl = 'http://localhost:5000/api/Admin/Students';
  constructor(private http: HttpClient) { }

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }


  createStudent(
    payload:
      {
        fullName: string;
        email: string;
        dateOfBirth: number;
      }
  ): Observable<Student[]> {
    return this.http.post<Student[]>(this.baseUrl, payload)
  }

  getById(id: string) {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  updateStudent(
    id: string,
    payload:
      {
        id: string
        fullName: string;
        email: string;
        dateOfBirth: number;
      }
  ): Observable<Student[]> {
    return this.http.put<Student[]>(this.baseUrl + "/" + id, payload)
  }

  deleteStudent(id: string): Observable<Student[]> {
    return this.http.delete<Student[]>(`${this.baseUrl}/${id}`)
  }

}
