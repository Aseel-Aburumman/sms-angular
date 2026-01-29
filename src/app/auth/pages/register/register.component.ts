import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  isLoading = false;
  error: string | null = null;
  showPassword = false;

  form = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = {
      fullName: this.form.value.fullName!,
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.isLoading = true;

    this.auth
      .register(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
 
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.error =
            err?.error?.message ||
            err?.error ||
            'Registration failed. Please try again.';
        },
      });
  }

  get f() {
    return this.form.controls;
  }
}
