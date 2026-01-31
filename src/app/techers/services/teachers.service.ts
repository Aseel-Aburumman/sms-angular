import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AssignTeacherCoursesDto, CreateTeacherRequestDto, TeacherDetailsDto, TeacherDto, TeacherQuery, UnassignTeacherCoursesDto, UpdateTeacherRequestDto } from '../teachers.model';



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
export class TeachersService {
  private readonly baseUrl = 'http://localhost:5000/api/Teacher';
  constructor(private http: HttpClient) { }

  getAll(query: TeacherQuery): Observable<PagedResult<TeacherDto>> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        params = params.set(key, String(value).trim());
      }
    });

    return this.http.get<PagedResult<TeacherDto>>(this.baseUrl, { params });
  }



  create(dto: CreateTeacherRequestDto) {
    return this.http.post(this.baseUrl, dto);
  }

  bulkDelete(ids: string[]) {
    return this.http.request('delete', `${this.baseUrl}/bulk`, {
      body: { ids }
    });
  }


  getDetails(teacherId: string) {
    return this.http.get<TeacherDetailsDto>(`${this.baseUrl}/${teacherId}/details`);
  }


  updateTeacher(teacherId: string, dto: UpdateTeacherRequestDto) {
    return this.http.put<TeacherDto>(`${this.baseUrl}/${teacherId}`, dto);
  }

  assignCourses(payload: AssignTeacherCoursesDto) {
    return this.http.post(`${this.baseUrl}/assign-courses`, payload);
  }

  unassignCourses(payload: UnassignTeacherCoursesDto) {
    return this.http.post(`${this.baseUrl}/unassign-courses`, payload);
  }


    uploadTeacherImage(id: string, file: File) {
      const formData = new FormData();
      formData.append('file', file);
  
      return this.http.post<TeacherDto>(`${this.baseUrl}/${id}/teacher-image`, formData);
    }
  
}