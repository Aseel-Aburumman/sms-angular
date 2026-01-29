import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  isLoading = false;
  error: string | null = null;
  showPassword = false;

  form = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) { }

  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = {
       email: this.form.value.emailOrUsername!,
      password: this.form.value.password!,
    };

    this.isLoading = true;

    this.auth
      .login(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
           this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
           this.error =
            err?.error?.message ||
            err?.error ||
            'Login failed. Please check your credentials.';
        },
      });
  }

  get f() {
    return this.form.controls;
  }
}
