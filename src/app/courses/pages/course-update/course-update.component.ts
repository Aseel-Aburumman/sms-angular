import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Course } from '../../course.model';
import { StudentsService } from '../../../students/services/students.service';
import { Student } from '../../../students/student.model';
import { EnrollmentsService } from '../../../enrollments/enrollments.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-course-update',
  standalone: true,
  imports: [MatSnackBarModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-update.component.html',
  styleUrl: './course-update.component.css'
})
export class CourseUpdateComponent {
  id!: string;
  viewMode = true
  manageMode = true

  grades: Array<'A' | 'B' | 'C' | 'D' | 'F'> = ['A', 'B', 'C', 'D', 'F'];

  students: Student[] = []
  course: Course | null = null;

  isEnrolling = false;
  isUnrolling = false;
  isLoading = true
  isUpdating = false
  isStudentLoading = true

  enrollError: string | null = null;
  serverError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private CoursesService: CoursesService,
    private studentsService: StudentsService,
    private enrollmentsService: EnrollmentsService,
    private snackBar: MatSnackBar
  ) { }

  public switchMode() {
    this.viewMode = !this.viewMode
  }

  public newEnrollmentMode() {
    this.manageMode = !this.manageMode
    this.getStudents()
  }

  private getStudents(): void {
    this.isStudentLoading = true


    this.studentsService.getAll().subscribe({
      next: (data) => {
        console.log(data)
        this.students = data
        this.isStudentLoading = false
      }, error: () => {
        this.isStudentLoading = false
      }
    })
  }

  trackById = (_: number, item: { id: string }) => item.id;

  get availableStudent(): Student[] {
    const enrolledIds = new Set(
      (this.course?.enrollments ?? []).map(e => e.studentId)
    );

    return (this.students ?? []).filter(c => !enrolledIds.has(c.id));
  }

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.maxLength(500)]],
    credits: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.serverError = 'Missing course id.';
      this.isLoading = false;
      return;
    }

    this.id = id;
    this.loadCourse();
  }

  private loadCourse(): void {
    this.isLoading = true;
    this.serverError = null;

    this.CoursesService.getById(this.id).subscribe({
      next: (course) => {
        this.course = course
        this.form.setValue({
          name: course.name ?? '',
          description: course.description ?? '',
          credits: course.credits ?? '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.serverError = 'Failed to load course.';
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
    this.CoursesService.updateCourse(this.id, payload).subscribe({
      next: async () => {

        this.isUpdating = false;
        await this.router.navigate(['/courses'], { queryParams: { updated: 1 } });
      },
      error: () => {
        this.isUpdating = false;
        this.form.markAllAsTouched();
        this.serverError = 'Update failed. Please try again.';
      },
    });
  }


  enroll(studentId: string, gradeValue: string): void {
    if (!this.course?.id) return;

    this.enrollError = null;
    this.isEnrolling = true;
    const grade = gradeValue === '' ? null : gradeValue; // <-- critical
    const payload = {
      courseId: this.course.id,
      studentId: studentId,
      grade: grade ?? null

    };

    this.enrollmentsService.enrollStudent(payload)
      .subscribe({
        next: () => {
          this.loadCourse();
          this.snackBar.open('Student Enrolled successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.manageMode = true;
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.enrollError = 'Course is already enrolled in this course.';
            return;
          }
          if (err.status === 400) {
            this.enrollError = 'Invalid enrollment data.';
            return;
          }
          this.enrollError = 'Enrollment failed. Please try again.';
        },
      });
  }


  unRoll(enrollmentId: string): void {
    this.isUnrolling = true;
    this.enrollmentsService.unrollStudent(enrollmentId)
      .subscribe({
        next: () => {
          this.loadCourse();
          this.snackBar.open('Student Unrolled successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.manageMode = true;
          this.isUnrolling = false;

        },
        error: () => {

          this.enrollError = 'Enrollment failed. Please try again.';
          this.isUnrolling = false;

        },
      });
  }
}
