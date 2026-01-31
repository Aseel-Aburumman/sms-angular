import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeacherCourseStatsDto, TeacherDetailsDto } from '../../teachers.model';
import { TeachersService } from '../../services/teachers.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-view-teacher',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-teacher.component.html',
  styleUrl: './view-teacher.component.css'
})
export class ViewTeacherComponent {
  isLoading = false;
  error: string | null = null;

  teacher: TeacherDetailsDto | null = null;

  // carousel
  idx = 0;

  // status summary
  summary = {
    totalCourses: 0,
    totalStudents: 0,
    passedCourses: 0,
    failedCourses: 0,
    inProgressCourses: 0,
    ungradedCourses: 0,
    noStudentsCourses: 0,
    avg: null as number | null
  };

  constructor(
    private route: ActivatedRoute,
    private teachers: TeachersService
  ) { }

  ngOnInit(): void {
    const teacherId = this.route.snapshot.paramMap.get('id');
    if (!teacherId) {
      this.error = 'Missing teacher id.';
      return;
    }
    this.load(teacherId);
  }

  private load(id: string) {
    this.isLoading = true;
    this.error = null;

    this.teachers.getDetails(id).subscribe({
      next: (res) => {
        this.teacher = res;
        this.idx = 0;
        this.computeSummary(res);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load teacher profile.';
      }
    });
  }

  get courses(): TeacherCourseStatsDto[] {
    return this.teacher?.courses || [];
  }

  get activeCourse(): TeacherCourseStatsDto | null {
    if (!this.courses.length) return null;
    return this.courses[Math.min(this.idx, this.courses.length - 1)];
  }

  prev() {
    if (!this.courses.length) return;
    this.idx = (this.idx - 1 + this.courses.length) % this.courses.length;
  }

  next() {
    if (!this.courses.length) return;
    this.idx = (this.idx + 1) % this.courses.length;
  }

  avatarUrl(): string {
    return this.teacher?.imageUrl || 'assets/avatar-placeholder.png';
  }

  niceAvg(v: number | null | undefined): string {
    if (v === null || v === undefined) return '--';
    return Number(v).toFixed(2);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Passed': return 'badge-ok';
      case 'Failed': return 'badge-bad';
      case 'Ungraded': return 'badge-warn';
      case 'InProgress': return 'badge-info';
      case 'NoStudents': return 'badge-muted';
      default: return 'badge-muted';
    }
  }

  private computeSummary(t: TeacherDetailsDto) {
    const s = {
      totalCourses: t.totalCourses || 0,
      totalStudents: t.totalStudentsAcrossCourses || 0,
      passedCourses: 0,
      failedCourses: 0,
      inProgressCourses: 0,
      ungradedCourses: 0,
      noStudentsCourses: 0,
      avg: t.overallAverageGrade ?? null
    };

    for (const c of (t.courses || [])) {
      switch (c.status) {
        case 'Passed': s.passedCourses++; break;
        case 'Failed': s.failedCourses++; break;
        case 'Ungraded': s.ungradedCourses++; break;
        case 'NoStudents': s.noStudentsCourses++; break;
        default: s.inProgressCourses++; break;
      }
    }

    this.summary = s;
  }

  getCourseImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/courses/course-1.jpeg';
    return `${environment.apiBaseUrl}${url}`;
  }

  getTeacherImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/teacher.jpg';
    return `${environment.apiBaseUrl}${url}`;
  }
}
