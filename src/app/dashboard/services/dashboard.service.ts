import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardData } from '../dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = environment.apiBaseUrl + '/api/Dashboard';

  constructor(private http: HttpClient) { }
  dashboard(role: string, studentId?: string): Observable<DashboardData> {
    let url = `${this.baseUrl}?role=${role}`;
    if (role === 'Student' && studentId) {
      url += `&studentId=${studentId}`;
    }
    return this.http.get<DashboardData>(url);
  }
}
