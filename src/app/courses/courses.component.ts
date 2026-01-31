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
import { ConfirmDialogComponent } from '../../utilities/dialog/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [MatPaginatorModule, CommonModule, FormsModule, RouterLink, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCheckboxModule],
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
  getCourseImageUrl(url: string | null): string {
    if (!url) return 'assets/courses/course-1.jpeg';
    return `${environment.apiBaseUrl}${url}`;
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
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
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
    if (!this.currentRole.includes('Admin')) return;


    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Switch Course Statuse',
        message: `You are about to switch 1 course  to InActive.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        danger: true
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.CoursesService.deleteCouse(course.id).subscribe({
        next: () => {
          this.isDeleting = false
          this.snackBar.open('Course Deactivated successfully', 'Close', {
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
    })
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

    this.http.post(environment.apiBaseUrl + '/api/Courses/import-excel', form).subscribe({
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



  selectedCourseIds = new Set<string>();
  isBulkUpdating = false;

  isCourseSelected(id: string): boolean {
    return this.selectedCourseIds.has(id);
  }

  toggleCourseOne(courseId: string, checked: boolean): void {
    if (checked) this.selectedCourseIds.add(courseId);
    else this.selectedCourseIds.delete(courseId);
  }

  toggleAllCoursesCurrentPage(checked: boolean): void {
    if (checked) {
      this.courses.forEach(c => this.selectedCourseIds.add(c.id));
    } else {
      this.courses.forEach(c => this.selectedCourseIds.delete(c.id));
    }
  }

  get allCoursesChecked(): boolean {
    return this.courses.length > 0 && this.courses.every(c => this.selectedCourseIds.has(c.id));
  }

  get someCoursesChecked(): boolean {
    return this.courses.some(c => this.selectedCourseIds.has(c.id)) && !this.allCoursesChecked;
  }

  openBulkInactivate(): void {
    if (!this.currentRole.includes('Admin')) return;
    if (this.selectedCourseIds.size === 0 || this.isBulkUpdating) return;

    const ids = Array.from(this.selectedCourseIds);

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Switch Course Statuse',
        message: `You are about to switch ${ids.length} course(s) statuses.`,
        confirmText: 'Proceed',
        cancelText: 'Cancel',
        danger: true
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isBulkUpdating = true;

      this.CoursesService.bulkInactivate(ids).subscribe({
        next: () => {

          ids.forEach(id => this.selectedCourseIds.delete(id));

          this.snack.open(`${ids.length} course(s) statuses updated successfully.`, 'OK', { duration: 2500 });
          this.isBulkUpdating = false;
          this.getCorses()
        },
        error: () => {
          this.snack.open('Bulk deactivate failed.', 'OK', { duration: 3000 });
          this.isBulkUpdating = false;
        }
      });
    });
  }

}
