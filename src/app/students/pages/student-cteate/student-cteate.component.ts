import { Student } from './../../student.model';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../services/students.service';
import { noDateBefore1990, noFutureDate } from '../../../../utilities/noFutureDate';

@Component({
  selector: 'app-student-cteate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-cteate.component.html',
  styleUrl: './student-cteate.component.css'
})
export class StudentCteateComponent {

  constructor(private formBuilder: FormBuilder, private StudentsService: StudentsService, private router: Router
  ) { }

  isSubmitting = false
  today = new Date().toISOString().split('T')[0];

  form = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200),]],
    dateOfBirth: ['', [Validators.required, noFutureDate, noDateBefore1990]]
  })

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true
    this.StudentsService.createStudent(this.form.value as any).subscribe({
      next: async () => {
        this.isSubmitting = false
        await this.router.navigate(['/students'], { queryParams: { created: 1 } })
      },
      error: () => {
        this.isSubmitting = false;
        alert('Create failed');
      },
    })
    console.log('FORM VALUE', this.form.value);
  }
}
