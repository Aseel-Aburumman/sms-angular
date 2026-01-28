import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../course.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly baseUrl = 'http://localhost:5000/api/Courses';
  constructor(private http: HttpClient) { }
  getAll(q?: string) {
    const params: any = {};
    if (q && q.trim().length) params.q = q.trim();

    return this.http.get<Course[]>(`${this.baseUrl}`, { params });
  }



  createCourse(
    payload:
      {
        name: string;
        description: string;
        credits: number;
      }
  ): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, payload)
  }

  getById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);

  }

  updateCourse(
    id: string,
    payload:
      {
        id: string
        name: string;
        description: string;
        credits: number;
      }
  ): Observable<Course> {
    return this.http.put<Course>(this.baseUrl + "/" + id, payload)
  }

  deleteCouse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
  }

}
