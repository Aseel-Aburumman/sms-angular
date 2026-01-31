import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { CoursesService } from '../../services/courses.service';
import { Course } from '../../course.model';
import { EnrollmentsService } from '../../../enrollments/enrollments.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'app-course-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-view.component.html',
  styleUrl: './course-view.component.css',
})
export class CourseViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = true;
  error: string | null = null;
  currentRole: 'Admin' | 'Teacher' | 'Student' = 'Student';
  currentUserId: string | null = null;
  course: Course | null = null;
  getProfileImageUrl(url: string | null | undefined): string {
    const imageUrl = url;

    if (!imageUrl) {
      return 'assets/courses/course-1.jpeg';
    }



    return `${environment.apiBaseUrl}${imageUrl}`;
  }
  instructorName = 'Instructor';
  instructorBio =
    'No instructor details available yet. You can extend the API to return teacher info (name, image, bio).';

  constructor(private route: ActivatedRoute, private courses: CoursesService,
    private enrollmentsService: EnrollmentsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;
    this.currentUserId = localStorage.getItem('auth_user_id');

    this.loadCourse();

  }
  isEnrolled = false;
  loadCourse(): void {
    this.route.paramMap
      .pipe(
        switchMap((p) => {
          const id = p.get('id');
          if (!id) throw new Error('Missing course id in route.');
          this.isLoading = true;
          this.error = null;
          return this.courses.getById(id);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (c) => {
          this.course = c;
          this.isLoading = false;
          this.isEnrolled = this.course.enrollments?.some((e) => e.studentUserId === this.currentUserId) || false;
        },
        error: (err) => {
          this.error = err?.error?.message ?? err?.message ?? 'Failed to load course.';
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isEnrolling = false;
  enrollError: string | null = null;


  startCourse(): void {
    if (!this.course?.id) return;

    const userId = this.currentUserId;
    if (!userId) {
      this.enrollError = 'User ID not found. Please log in.';
      return;
    }

    this.enrollError = null;
    this.isEnrolling = true;
    const payload = {
      courseId: this.course.id,
      userId: userId,
    };

    this.enrollmentsService.enrollUser(payload)
      .subscribe({
        next: () => {
          this.snackBar.open('Student Enrolled successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });

          this.isEnrolling = false;
          this.loadCourse();



        },
        error: () => {

          this.enrollError = 'Enrollment failed. Please try again.';
          this.isEnrolling = false;

        },
      });
  }




  formatDate(iso: string): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  }

  gradeClass(grade: string | null): string {
    const g = (grade || '').toUpperCase().trim();
    if (g === 'A' || g === 'A+') return 'badge-grade badge-grade-a';
    if (g === 'B' || g === 'B+') return 'badge-grade badge-grade-b';
    if (g === 'C' || g === 'C+') return 'badge-grade badge-grade-c';
    if (g === 'D' || g === 'D+') return 'badge-grade badge-grade-d';
    if (g === 'F') return 'badge-grade badge-grade-f';
    return 'badge-grade badge-grade-na';
  }

  safeImage(url: string | null): string {
    return url?.trim()
      ? url
      : 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?q=80&w=1200&auto=format&fit=crop';
  }
}
