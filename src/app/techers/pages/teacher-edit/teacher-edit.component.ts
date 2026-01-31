import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CourseMiniDto, TeacherDetailsDto, UpdateTeacherRequestDto } from '../../teachers.model';
import { TeachersService } from '../../services/teachers.service';
import { CoursesService } from '../../../courses/services/courses.service';
import { environment } from '../../../../environments/environment';




@Component({
  selector: 'app-teacher-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './teacher-edit.component.html',
  styleUrl: './teacher-edit.component.css'
})
export class TeacherEditComponent implements OnInit {
  isLoading = false;
  isSaving = false;
  error: string | null = null;

  teacherId!: string;
  details: TeacherDetailsDto | null = null;

  // form
  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    userName: [''],
    phoneNumber: [''],
    profession: [''],
    imageUrl: ['']
  });

  // courses assignment UI
  availableCourses: CourseMiniDto[] = [];
  assignedCourseIds = new Set<string>();   // from details
  selectedToAssign = new Set<string>();
  selectedToUnassign = new Set<string>();

  courseSearch = '';
  private courseSearch$ = new Subject<string>();

  // busy flags for assign/unassign
  isAssigning = false;
  isUnassigning = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private teachers: TeachersService,
    private courses: CoursesService,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing teacher id.';
      return;
    }
    this.teacherId = id;

    this.courseSearch$
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((q) => this.loadCourses(q));

    this.loadAll();
  }

  private loadAll() {
    this.isLoading = true;
    this.error = null;

    this.teachers.getDetails(this.teacherId).subscribe({
      next: (res) => {
        this.details = res;

        this.form.patchValue({
          fullName: res.fullName,
          email: res.email,
          phoneNumber: res.phoneNumber || '',
          profession: res.profession || '',
          imageUrl: res.imageUrl || '',
          userName: ''
        });

        this.assignedCourseIds = new Set(res.courses.map(c => c.courseId));

        this.loadCourses('');

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load teacher.';
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: UpdateTeacherRequestDto = {
      fullName: this.form.value.fullName!.trim(),
      email: this.form.value.email!.trim(),
      userName: (this.form.value.userName || '').trim() || null,
      phoneNumber: (this.form.value.phoneNumber || '').trim() || null,
      profession: (this.form.value.profession || '').trim() || null,
      imageUrl: (this.form.value.imageUrl || '').trim() || null
    };

    this.isSaving = true;
    this.teachers.updateTeacher(this.teacherId, dto).subscribe({
      next: () => {
        this.isSaving = false;
        this.snack.open('Teacher updated.', 'OK', { duration: 2000 });
        // refresh profile data (profession/image updated)
        this.loadAll();
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err?.error?.message || 'Update failed.';
        this.snack.open(msg, 'OK', { duration: 3500 });
      }
    });
  }

  onCourseSearchChange(v: string) {
    this.courseSearch = v;
    this.courseSearch$.next(v);
  }

  private loadCourses(search: string) {
    this.courses.getAll(search).subscribe({
      next: (list) => {
        this.availableCourses = list || [];
        const visible = new Set(this.availableCourses.map(c => c.id));
        [...this.selectedToAssign].forEach(id => { if (!visible.has(id)) this.selectedToAssign.delete(id); });
        [...this.selectedToUnassign].forEach(id => { if (!visible.has(id)) this.selectedToUnassign.delete(id); });
      },
      error: () => {
        this.snack.open('Failed to load courses.', 'OK', { duration: 2500 });
      }
    });
  }

  isAssigned(courseId: string): boolean {
    return this.assignedCourseIds.has(courseId);
  }

  toggleAssign(courseId: string) {
    if (this.selectedToAssign.has(courseId)) this.selectedToAssign.delete(courseId);
    else this.selectedToAssign.add(courseId);
  }

  toggleUnassign(courseId: string) {
    if (this.selectedToUnassign.has(courseId)) this.selectedToUnassign.delete(courseId);
    else this.selectedToUnassign.add(courseId);
  }

  assignSelected() {
    const courseIds = [...this.selectedToAssign].filter(id => !this.isAssigned(id));
    if (!courseIds.length) return;

    this.isAssigning = true;
    this.teachers.assignCourses({ teacherId: this.teacherId, courseIds }).subscribe({
      next: () => {
        this.isAssigning = false;
        this.selectedToAssign.clear();
        this.snack.open('Courses assigned.', 'OK', { duration: 2000 });
        this.loadAll();
      },
      error: (err) => {
        this.isAssigning = false;
        const msg = err?.error?.message || 'Assign failed.';
        this.snack.open(msg, 'OK', { duration: 3500 });
      }
    });
  }

  unassignSelected() {
    const courseIds = [...this.selectedToUnassign].filter(id => this.isAssigned(id));
    if (!courseIds.length) return;

    this.isUnassigning = true;
    this.teachers.unassignCourses({ teacherId: this.teacherId, courseIds }).subscribe({
      next: () => {
        this.isUnassigning = false;
        this.selectedToUnassign.clear();
        this.snack.open('Courses unassigned.', 'OK', { duration: 2000 });
        this.loadAll();
      },
      error: (err) => {
        this.isUnassigning = false;
        const msg = err?.error?.message || 'Unassign failed.';
        this.snack.open(msg, 'OK', { duration: 3500 });
      }
    });
  }




  onPickImage(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error = null;

    this.teachers.uploadTeacherImage(this.teacherId, file).subscribe({
      next: (p) => {
        this.loadAll();
        this.snack.open('Teacher Image Updated successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to upload image.';
      },
    });
  }


  getProfileImageUrl(): string {
    const imageUrl = this.details?.imageUrl;

    if (!imageUrl) {
      return 'assets/user.png';
    }



    return `${environment.apiBaseUrl}${imageUrl}`;
  }
}
