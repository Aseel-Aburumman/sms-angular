import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { CoursesService } from '../../services/courses.service';
import { Course } from '../../course.model';



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

  course: Course | null = null;
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
  // UI-only placeholders (since your API sample has teacherId but no teacher object)
  instructorName = 'Instructor';
  instructorBio =
    'No instructor details available yet. You can extend the API to return teacher info (name, image, bio).';

  constructor(private route: ActivatedRoute, private courses: CoursesService) { }

  ngOnInit(): void {
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

  startCourse(): void {
    // Your action here (navigate, open lessons, etc.)
    // Example: console.log('Start course', this.course?.id);
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
    // Put your real placeholder image in assets if you want
    return url?.trim()
      ? url
      : 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?q=80&w=1200&auto=format&fit=crop';
  }
}
