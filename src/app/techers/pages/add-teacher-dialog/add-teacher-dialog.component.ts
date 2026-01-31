import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TeachersService } from '../../services/teachers.service';

@Component({
  selector: 'app-add-teacher-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-teacher-dialog.component.html',
  styleUrl: './add-teacher-dialog.component.css'
})
export class AddTeacherDialogComponent {
  isSaving = false;
  apiError: string | null = null;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber: [''],
    profession: [''],
    imageUrl: [''],
    userName: ['']
  });

  constructor(
    private fb: FormBuilder,
    private teachers: TeachersService,
    private dialogRef: MatDialogRef<AddTeacherDialogComponent>
  ) { }

  close() {
    this.dialogRef.close(false);
  }

  submit() {
    this.apiError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.teachers.create(this.form.value as any).subscribe({
      next: () => {
        this.isSaving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving = false;
        this.apiError = err?.error?.message || 'Failed to create teacher.';
      }
    });
  }
}
