import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TeachersService } from './services/teachers.service';
import { TeacherDto, TeacherQuery, PagedResult } from './teachers.model';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AddTeacherDialogComponent } from './pages/add-teacher-dialog/add-teacher-dialog.component';
import { ConfirmDialogComponent } from '../../utilities/dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, RouterLink, MatCheckboxModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css'
})
export class TeachersComponent implements OnInit, OnDestroy {
  teachers: TeacherDto[] = [];
  currentRole: 'Admin' | 'Teacher' | 'Student' | string = 'Student';

  search = '';
  name = '';
  email = '';

  page = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  isLoading = false;
  error: string | null = null;
  deleteError: string | null = null;

  getTeacherImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/courses/course-1.jpeg';
    return `${environment.apiBaseUrl}${url}`;
  }


  private destroy$ = new Subject<void>();
  private search$ = new Subject<void>();

  constructor(private teachersService: TeachersService, private dialog: MatDialog, private snack: MatSnackBar) { }

  ngOnInit(): void {
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;

    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string) {
    this.search = value;
    this.page = 1;
    this.load();
  }

  onPageChange(e: any) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    const query: TeacherQuery = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.search,
      name: this.name,
      email: this.email
    };

    this.teachersService.getAll(query).subscribe({
      next: (res: PagedResult<TeacherDto>) => {
        this.teachers = res.items ?? [];
        this.page = res.page;
        this.pageSize = res.pageSize;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load teachers.';
        this.isLoading = false;
      }
    });
  }

  trackById(_: number, t: TeacherDto) {
    return t.id;
  }

  get pagesToShow(): number[] {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, this.page - half);
    let end = Math.min(this.totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
  isTeacherSelected(id: string): boolean {
    return this.selectedTeachersIds.has(id);
  }

  selectedTeachersIds = new Set<string>();

  get allTeachersChecked(): boolean {
    return this.teachers.length > 0 && this.teachers.every(c => this.selectedTeachersIds.has(c.id));
  }

  get someTeachersChecked(): boolean {
    return this.teachers.some(c => this.selectedTeachersIds.has(c.id)) && !this.allTeachersChecked;
  }

  toggleTeacherOne(teacherId: string, checked: boolean): void {
    if (checked) this.selectedTeachersIds.add(teacherId);
    else this.selectedTeachersIds.delete(teacherId);
  }


  toggleAllTeachersCurrentPage(checked: boolean): void {
    if (checked) {
      this.teachers.forEach(c => this.selectedTeachersIds.add(c.id));
    } else {
      this.teachers.forEach(c => this.selectedTeachersIds.delete(c.id));
    }
  }


  openAddTeacher() {
    const ref = this.dialog.open(AddTeacherDialogComponent, {
      width: '720px',
      maxWidth: '95vw'
    });

    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.snack.open('Teacher created successfully.', 'OK', { duration: 2500 });
        this.load();
      }
    });
  }

  isDeleting = false;

  deleteTeacher(id: string): void {
    if (!this.isTeacherSelected(id)) {
      this.toggleTeacherOne(id, true);
    }

    this.deleteSelected();
  }


  deleteSelected() {
    if (!this.selectedTeachersIds.size) return;

    if (this.selectedTeachersIds.size === 0 || this.isDeleting) return;

    const ids = Array.from(this.selectedTeachersIds);

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Teacher',
        message: `You are about to delete ${ids.length} teacher(s).`,
        confirmText: 'Proceed',
        cancelText: 'Cancel',
        danger: true
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      this.teachersService.bulkDelete(ids).subscribe({
        next: () => {
          this.selectedTeachersIds.clear();
          this.snack.open('Deleted successfully.', 'OK', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Delete failed.';
          this.snack.open(msg, 'OK', { duration: 3500 });
        }
      });
    });
  }
}
