import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../services/students.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Student } from '../../student.model';
import { noDateBefore1990, noFutureDate } from '../../../../utilities/noFutureDate';
import { CoursesService } from '../../../courses/services/courses.service';
import { Course } from '../../../courses/course.model';
import { EnrollmentsService } from '../../../enrollments/enrollments.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './student-update.component.html',
  styleUrl: './student-update.component.css'
})
export class StudentUpdateComponent {
  viewMode = true
  manageMode = true

  grades: Array<'A' | 'B' | 'C' | 'D' | 'F'> = ['A', 'B', 'C', 'D', 'F'];

  id!: string;
  courses: Course[] = []
  student: Student | null = null;

  isLoading = true
  isCoursesLoading = true
  isEnrolling = false;
  isUpdating = false
  isUnrolling = false;


  enrollError: string | null = null;
  serverError: string | null = null;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentsService,
    private CoursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
    private snackBar: MatSnackBar


  ) { }


  isGradeUpdatingId: string | null = null;
  courseSearch = '';
  selectedCourseId: string | null = null;
  selectedGrade: string = '';

   isCourseAvailable(courseId: string): boolean {
    return !!this.availableCourses.find(c => c.id === courseId);
  }

  selectCourse(id: string): void {
    this.selectedCourseId = id;
  }

  get filteredCourses(): Course[] {
    const q = (this.courseSearch || '').trim().toLowerCase();
    if (!q) return this.courses;

    return this.courses.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }

  updateEnrollmentGrade(enrollmentId: string, gradeValue: string): void {
    if (!enrollmentId) return;

    this.enrollError = null;
    this.isGradeUpdatingId = enrollmentId;

    const payload = { grade: gradeValue === '' ? null : gradeValue };

    this.enrollmentsService.updateGrade(enrollmentId, payload).subscribe({
      next: () => {
        this.loadStudent();
        this.snackBar.open('Grade updated', 'Close', {
          duration: 2500,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.isGradeUpdatingId = null;
      },
      error: () => {
        this.enrollError = 'Grade update failed. Please try again.';
        this.isGradeUpdatingId = null;
      }
    });
  }


  private getCorses(): void {
    this.CoursesService.getAll().subscribe({
      next: (data) => {
        console.log(data)
        this.courses = data
        this.isCoursesLoading = false
      }, error: () => {
        this.isCoursesLoading = false
      }
    })
  }

  public switchMode() {
    this.viewMode = !this.viewMode
  }

  public newEnrollmentMode() {
    this.manageMode = !this.manageMode
    this.getCorses()
  }

  form = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200),]],
    dateOfBirth: ['', [Validators.required, noFutureDate, noDateBefore1990]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.serverError = 'Missing student id.';
      this.isLoading = false;
      return;
    }

    this.id = id;
    this.loadStudent();
  }

  private loadStudent(): void {
    this.isLoading = true;
    this.serverError = null;

    this.studentService.getById(this.id).subscribe({
      next: (student) => {
        this.student = student
        this.form.setValue({
          fullName: student.fullName ?? '',
          email: student.email ?? '',
          dateOfBirth: student.dateOfBirth ?? '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.serverError = 'Failed to load student.';
        this.isLoading = false;
      },
    });
  }




  submit(): void {
    this.serverError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isUpdating = true;

    const payload = this.form.value as any
    console.log(this.id)
    this.studentService.updateStudent(this.id, payload).subscribe({
      next: async () => {
        this.isUpdating = false;
        await this.router.navigate(['/students'], { queryParams: { updated: 1 } });
      },
      error: (err: HttpErrorResponse) => {
        this.isUpdating = false;
        this.form.markAllAsTouched();
        this.serverError = 'Update failed. Please try again.';
      },
    });
  }

  get availableCourses(): Course[] {
    const enrolledIds = new Set(
      (this.student?.enrollments ?? []).map(e => e.courseId)
    );

    return (this.courses ?? []).filter(c => !enrolledIds.has(c.id));
  }

  trackById = (_: number, item: { id: string }) => item.id;

  enroll(courseId: string, gradeValue: string): void {
    if (!this.student?.id) return;

    this.enrollError = null;
    this.isEnrolling = true;
    const grade = gradeValue === '' ? null : gradeValue;  
    const payload = {
      studentId: this.student.id,
      courseId: courseId,
      grade: grade ?? null

    };
    this.enrollmentsService.enrollStudent(payload)
      .subscribe({
        next: () => {
          this.loadStudent();
          this.manageMode = true;
          this.snackBar.open('Student Enrolled successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.selectedCourseId = null;
          this.isEnrolling = false;
        },
        error: () => {
          this.enrollError = 'Enrollment failed. Please try again.';
          this.isEnrolling = false;
          this.selectedCourseId = null;
        },
      });
  }

  unRoll(enrollmentId: string): void {
    this.isUnrolling = true;
    this.enrollmentsService.unrollStudent(enrollmentId)
      .subscribe({
        next: () => {
          this.loadStudent();
          this.snackBar.open('Student Unrolled successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.selectedCourseId = null;
          this.manageMode = true;
          this.isUnrolling = false;

        },
        error: () => {
          this.enrollError = 'Enrollment failed. Please try again.';
          this.isUnrolling = false;
          this.selectedCourseId = null;

        },
      });
  }
}
