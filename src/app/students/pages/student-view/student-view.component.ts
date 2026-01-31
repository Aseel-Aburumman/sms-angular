import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Student } from '../../student.model';
import { StudentsService } from '../../services/students.service';
import { EnrollmentsService } from '../../../enrollments/enrollments.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-student-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-view.component.html',
  styleUrl: './student-view.component.css'
})
export class StudentViewComponent {
  private destroy$ = new Subject<void>();

  isLoading = true;
  error: string | null = null;
  currentRole: 'Admin' | 'Teacher' | 'Student' = 'Student';
  currentUserId: string | null = null;
  student: Student | null = null;
  courseBackgrounds: string[] = [
    'assets/courses/course-1.jpg',
    'assets/courses/course-2.jpg',
    'assets/courses/course-3.jpg',
    'assets/courses/course-4.jpg',
  ];

  courseBgMap = new Map<string, string>();
  getCourseBackground(courseId: string): string {
    if (!this.courseBgMap.has(courseId)) {
      const randomIndex = Math.floor(Math.random() * this.courseBackgrounds.length);
      this.courseBgMap.set(courseId, this.courseBackgrounds[randomIndex]);
    }
    return this.courseBgMap.get(courseId)!;
  }
  instructorName = 'Instructor';
  instructorBio =
    'No instructor details available yet. You can extend the API to return teacher info (name, image, bio).';

  constructor(private route: ActivatedRoute, private studentsService: StudentsService,
    private enrollmentsService: EnrollmentsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;
    this.currentUserId = localStorage.getItem('auth_user_id');

    this.loadStudent();

  }
  gradeClass(grade: string | null | undefined): string {
    const g = (grade ?? '').trim().toUpperCase();
    if (!g) return 'grade-na';

    // Accept "A", "A+", "B-" etc. by only looking at first letter
    const first = g[0];

    switch (first) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'D': return 'grade-d';
      case 'F': return 'grade-f';
      default: return 'grade-na';
    }
  }



  getProfileImageUrl(): string {
    const imageUrl = this.student?.imageUrl;

    if (!imageUrl) {
      return 'assets/user.png';
    }



    return `${environment.apiBaseUrl}${imageUrl}`;
  }

  getCourseImageUrl(url: string | null): string {
     if (!url) return 'assets/courses/course-1.jpeg';
    return `${environment.apiBaseUrl}${url}`;
  }
  @ViewChild('gallery', { static: false })
  gallery!: ElementRef<HTMLDivElement>;

  scrollLeft(): void {
    this.gallery.nativeElement.scrollBy({
      left: -320,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    this.gallery.nativeElement.scrollBy({
      left: 320,
      behavior: 'smooth'
    });
  }


  isEnrolled = false;
  loadStudent(): void {
    this.route.paramMap
      .pipe(
        switchMap((p) => {
          const id = p.get('id');
          if (!id) throw new Error('Missing course id in route.');
          this.isLoading = true;
          this.error = null;
          return this.studentsService.getById(id);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (c) => {
          this.student = c;
          this.isLoading = false;
          this.isEnrolled = this.student.enrollments?.some((e) => e.studentUserId === this.currentUserId) || false;
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







  formatDate(iso: string): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  }


  trackById = (_: number, item: { id: string }) => item.id;

  safeImage(url: string | null): string {
    return url?.trim()
      ? url
      : 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?q=80&w=1200&auto=format&fit=crop';
  }
}
