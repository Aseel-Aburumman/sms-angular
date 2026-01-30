import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Course } from '../course.model';


export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}


@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly baseUrl = 'http://localhost:5000/api/Courses';
  constructor(private http: HttpClient) { }


  getAll(q?: string) {
    const params: any = {};
    if (q && q.trim().length) params.q = q.trim();

    // backend now returns paged object → map to items so old code still receives Course[]
    return this.http
      .get<PagedResult<Course>>(`${this.baseUrl}`, { params })
      .pipe(map(res => res.items));
  }

  // NEW: use this only in your Courses page where you need pagination UI
  getAllPaged(q?: string, page: number = 1, pageSize: number = 10) {
    const params: any = { page, pageSize };
    if (q && q.trim().length) params.q = q.trim();

    return this.http.get<PagedResult<Course>>(`${this.baseUrl}`, { params });
  }

  // getAll(q?: string) {
  //   const params: any = {};
  //   if (q && q.trim().length) params.q = q.trim();

  //   return this.http.get<Course[]>(`${this.baseUrl}`, { params });
  // }



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


  getTeachers() {
    return this.http.get<Array<{ id: string; fullName: string; email: string; phoneNumber?: string | null }>>(
      `${this.baseUrl}/teachers`
    );
  }

  assignTeacher(courseId: string, payload: { teacherId: string }) {
    return this.http.patch(`${this.baseUrl}/${courseId}/teacher`, payload);
  }

  uploadCourseImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Course>(`${this.baseUrl}/${id}/course-image`, formData);
  }

}
