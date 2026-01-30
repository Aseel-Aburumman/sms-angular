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
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [MatPaginatorModule, CommonModule, FormsModule, RouterLink, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatIconModule],
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
    this.page = 1;
    this.getCorses();
  }

  onPageChange(e: any) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getCorses();
  }
  error: string | null = null
  deleteError: string | null = null;

  constructor(
    private CoursesService: CoursesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) { }


  private subscription?: Subscription;

  page = 1;           // backend is 1-based
  pageSize = 9;       // nice for card grid
  totalCount = 0
  private getCorses(): void {
    this.isLoading = true;
    this.error = null;

    this.CoursesService.getAllPaged(this.search, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.courses = res.items;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.error = "failed";
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;

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



  selectedFile: File | null = null;
  importResult: any = null;
  isUploading = false;


  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;

     if (file && !file.name.toLowerCase().endsWith('.xlsx')) {
      this.selectedFile = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  upload() {
    if (!this.selectedFile) return;
    this.isUploading = true;

    const form = new FormData();
    form.append('file', this.selectedFile);

    this.http.post('http://localhost:5000/api/Courses/import-excel', form).subscribe({
      next: (res) => {
        this.importResult = res
        this.getCorses()
        this.snackBar.open('Course imported successfully ,Total:' + this.importResult.totalCount + ' ,inserted:' + this.importResult.inserted + ' ,Skipped:' + this.importResult.skippedCount, 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.isUploading = false;
      },
      error: (err) => console.error(err)
    });
  }

}
