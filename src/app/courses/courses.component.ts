import { CoursesService } from './services/courses.service';
import { Component, OnInit } from '@angular/core';
import { Course } from './course.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = []
  isLoading = true
  isDeleting = false
  currentRole: 'Admin' | 'Teacher' | 'Student' | string = 'Student';
  currentUserId: string | null = null;

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

  search = '';

  onSearchChange(value: string) {
    this.search = value;
    this.getCorses(); // calls API with q
  }


  error: string | null = null
  deleteError: string | null = null;

  constructor(
    private CoursesService: CoursesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }


  private subscription?: Subscription;

  private getCorses(): void {
    this.isLoading = true

    this.CoursesService.getAll(this.search).subscribe({
      next: (data) => {
        console.log(data)
        this.courses = data
        this.isLoading = false
      }, error: () => {
        this.error = "failed"
        this.isLoading = false

      }
    })
  }
  ngOnInit(): void {
    // role from localStorage
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;

    // userId from localStorage (adjust key to match your app)
    this.currentUserId = localStorage.getItem('auth_user_id');
    this.getCorses()
    this.subscription = this.route.queryParams.subscribe((params) => {
      this.getCorses();
      if (params['created'] === '1') {
        this.snackBar.open('Created successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { created: null, updated: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,

        });
      }

      if (params['updated'] === '1') {
        this.snackBar.open('Updated successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { created: null, updated: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,

        });
      }
    });
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


  delete(course: Course) {
    const ok = window.confirm(`Delete course "${course.name}"? This cannot be undone.`);
    if (!ok) return;
    this.isDeleting = true

    this.CoursesService.deleteCouse(course.id).subscribe({
      next: () => {
        this.courses = this.courses.filter(x => x.id !== course.id);
        this.isDeleting = false
        this.snackBar.open('Course Deleted successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      },
      error: () => {
        this.deleteError = 'Delete failed. The course may be referenced by enrollments.';
        this.isDeleting = false
      },
    });
  }
}
