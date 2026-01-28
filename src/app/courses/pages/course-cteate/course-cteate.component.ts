import { CoursesService } from './../../services/courses.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-course-create',
  standalone: true,
  imports: [MatSnackBarModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-cteate.component.html',
  styleUrl: './course-cteate.component.css'
})
export class CourseCteateComponent {

  isSubmitting = false;
  serverError: string | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private router: Router
  ) { }

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.maxLength(500)]],
    credits: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(10)]
    ],
  });

  submit(): void {
    this.serverError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.coursesService.createCourse(this.form.value as any).subscribe({
      next: async () => {
        this.isSubmitting = false;
        this.snackBar.open('Course created successfully', 'Close', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        await this.router.navigate(['/courses'], { queryParams: { created: 1 } });
      },
      error: () => {
        this.isSubmitting = false;
        this.serverError = 'Create failed. Please try again.';
      }
    });
  }
}
