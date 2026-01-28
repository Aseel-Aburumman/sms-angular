import { CoursesService } from './../../services/courses.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-course-cteate',
  standalone: true,
  imports: [MatSnackBarModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-cteate.component.html',
  styleUrl: './course-cteate.component.css'
})
export class CourseCteateComponent {

  constructor(private snackBar: MatSnackBar, private formBuilder: FormBuilder, private CoursesService: CoursesService, private router: Router
  ) { }

  isSubmitting = false

  form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.maxLength(500)]],
    credits: [null as number | null, [Validators.required, Validators.min(1)]],
  })

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true
    this.CoursesService.createCourse(this.form.value as any).subscribe({
      next: async () => {

        this.isSubmitting = false
        await this.router.navigate(['/courses'], { queryParams: { created: 1 } })
        // alert('Created!');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Create failed');
      },
    })
    console.log('FORM VALUE', this.form.value);
  }
}
