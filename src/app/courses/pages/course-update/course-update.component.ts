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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-update',
  standalone: true,
  imports: [MatSnackBarModule, CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
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




  studentSearch = '';
  teacherSearch = '';

  selectedStudentId: string | null = null;
  selectedGrade: string = '';

  isGradeUpdatingId: string | null = null;

  currentRole: 'Admin' | 'Teacher' | 'Student' = 'Student';  
  teachers: Array<{ id: string; fullName: string; email: string; phoneNumber?: string | null }> = [];
  isTeachersLoading = false;
  teacherError: string | null = null;

  get filteredStudents(): Student[] {
    const q = (this.studentSearch || '').trim().toLowerCase();
    if (!q) return this.students;

    return this.students.filter(s =>
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  }

  selectStudent(id: string): void {
    this.selectedStudentId = id;
  }

  updateEnrollmentGrade(enrollmentId: string, gradeValue: string): void {
    if (!enrollmentId) return;

    this.enrollError = null;
    this.isGradeUpdatingId = enrollmentId;

    const payload = { grade: gradeValue === '' ? null : gradeValue };

    this.enrollmentsService.updateGrade(enrollmentId, payload).subscribe({
      next: () => {
        this.loadCourse();
        this.snackBar.open('Grade updated', 'Close', { duration: 2500 });
        this.isGradeUpdatingId = null;
      },
      error: () => {
        this.enrollError = 'Grade update failed.';
        this.isGradeUpdatingId = null;
      }
    });
  }

  // ADMIN ONLY
  loadTeachers(): void {
    this.teacherError = null;
    this.isTeachersLoading = true;

    this.CoursesService.getTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.isTeachersLoading = false;
      },
      error: () => {
        this.teacherError = 'Failed to load teachers.';
        this.isTeachersLoading = false;
      }
    });
  }

  assignTeacher(teacherId: string): void {
    if (!this.course?.id) return;

    this.isUpdating = true;
    this.CoursesService.assignTeacher(this.course.id, { teacherId }).subscribe({
      next: () => {
        this.isUpdating = false;
        this.snackBar.open('Teacher assigned', 'Close', { duration: 2500 });
        this.loadCourse();
      },
      error: () => {
        this.isUpdating = false;
        this.teacherError = 'Assigning teacher failed.';
      }
    });
  }

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
  get availableStudent(): Student[] {
    const enrolledIds = new Set(
      (this.course?.enrollments ?? []).map(e => e.studentId)
    );

    return (this.students ?? []).filter(c => !enrolledIds.has(c.id));
  }

  isStudentAvailable(studentId: string): boolean {
    return this.availableStudent.find(x => x.id === studentId) != null;
  }

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.maxLength(500)]],
    credits: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.currentRole = (localStorage.getItem('auth_roles') || 'Student') as any;

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
        // await this.router.navigate(['/courses'], { queryParams: { updated: 1 } });
        this.loadCourse()
        this.snackBar.open('Course updated', 'Close', { duration: 2500 });
        this.viewMode = true
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
          this.selectedStudentId = null;
          this.isEnrolling = false;



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
          this.isEnrolling = false;

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
          this.selectedStudentId = null;
          this.isEnrolling = false;

        },
        error: () => {

          this.enrollError = 'Enrollment failed. Please try again.';
          this.isUnrolling = false;
          this.isEnrolling = false;


        },
      });
  }
}
