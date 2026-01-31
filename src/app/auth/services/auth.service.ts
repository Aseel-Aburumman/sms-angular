import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../auth.models';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly rolesKey = 'auth_roles';
  private readonly userNameKey = 'auth_user_name';
  private readonly userIdKey = 'auth_user_id';



  constructor(private http: HttpClient) { }

  register(payload: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => {
        this.setToken(res.token);
        localStorage.setItem(this.userNameKey, res.fullName);
        localStorage.setItem(this.userIdKey, res.userId);
        localStorage.setItem(this.rolesKey, JSON.stringify(res.roles ?? []));
        localStorage.setItem('auth_user_image', res.imageUrl || '');
      })
    );
  }

  getRoles(): string[] {
    const raw = localStorage.getItem(this.rolesKey);
    return raw ? JSON.parse(raw) : [];
  }

  hasRole(allowed: string[]): boolean {
    const roles = this.getRoles();
    return allowed.some(r => roles.includes(r));
  }

  logout(): void {

    this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {}).subscribe({
      next: () => console.log('Logged out from server'),
      error: (err) => console.error('Logout error', err)
    });
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('auth_user_image');
  }

  getProfile(): Observable<any> {

    return new Observable(observer => {
      setTimeout(() => {
        const stored = localStorage.getItem('user_profile');
        if (stored) {
          observer.next(JSON.parse(stored));
        } else {
          observer.next({
            fullName: 'Aseel User',
            email: 'aseel@example.com',
            role: this.getRoles()[0] || 'Student',
            image: ''
          });
        }
        observer.complete();
      }, 500);
    });
  }

  updateProfile(data: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        localStorage.setItem('user_profile', JSON.stringify(data));
        observer.next({ message: 'Profile updated successfully' });
        observer.complete();
      }, 800);
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedJson = atob(payload);
      const decoded = JSON.parse(decodedJson);
      return decoded.nameid || decoded.sub || decoded.id || null;
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  }
}
