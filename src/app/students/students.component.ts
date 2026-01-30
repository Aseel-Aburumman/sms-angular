import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { StudentsService } from './services/students.service';
import { Student, StudentQuery } from './student.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule, FormsModule, MatPaginatorModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  isLoading = true;
  isDeleting = false;

  error: string | null = null;
  deleteError: string | null = null;
  currentRole: 'Admin' | 'Teacher' | 'Student' = 'Student';

  search = '';
  courseName = '';

  private subscription?: Subscription;

  private search$ = new Subject<void>();

  constructor(
    private studentsService: StudentsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }
  page = 1;        // backend is 1-based
  pageSize = 10;
  totalCount = 0;
  private getStudents(): void {
    this.isLoading = true;
    this.error = null;

    const query: StudentQuery = {
      search: this.search,
      courseName: this.courseName,
      page: this.page,
      pageSize: this.pageSize,
    };

    this.studentsService.getAllPaged(query).subscribe({
      next: (res) => {
        this.students = res.items;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'failed';
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;

    this.search$
      .pipe(debounceTime(350))
      .subscribe(() => this.getStudents());

    this.getStudents();
    this.subscription = this.route.queryParams.subscribe((params) => {
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

  onSearchChange(v: string) {
    this.search = v;
    this.page = 1;
    this.getStudents();
  }

  onCourseNameChange(v: string) {
    this.courseName = v;
    this.page = 1;
    this.getStudents();
  }

  // Mat paginator event: pageIndex is 0-based
  onPageChange(e: any) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.getStudents();
  }

  clearFilters() {
    this.search = '';
    this.courseName = '';
    this.page = 1;
    this.getStudents();
  }

  delete(student: Student) {
    const ok = window.confirm(`Delete Student "${student.fullName}"? This cannot be undone.`);
    if (!ok) return;

    this.isDeleting = true;

    this.studentsService.deleteStudent(student.id).subscribe({
      next: () => {
        this.students = this.students.filter(x => x.id !== student.id);
        this.isDeleting = false;
      },
      error: () => {
        this.deleteError = 'Delete failed. The Student may be referenced by enrollments.';
        this.isDeleting = false;
      },
    });
  }


  download() {
    this.studentsService.downloadStudentsExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }


}
