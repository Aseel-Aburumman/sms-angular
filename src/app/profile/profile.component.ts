import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { finalize } from 'rxjs';
import { MyProfile } from './profile.models';
import { ProfileService } from './services/profile.service';
import { noDateBefore1990, noFutureDate } from '../../utilities/noFutureDate';
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: MyProfile | null = null;
  loading = false;
  userImage = '../../assets/user.png'; 

  saving = false;
  error: string | null = null;
  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200),]],
    gender: [''],
    dateOfBirth: ['', [noFutureDate, noDateBefore1990]],
    phoneNumber: ['', [Validators.maxLength(12)]],
  });

  currentRole: 'Admin' | 'Teacher' | 'Student' = 'Student';  



  ngOnInit(): void {
     const roles = this.auth.getRoles();
    if (roles.includes('Admin')) {
      this.currentRole = 'Admin';
    } else if (roles.includes('Teacher')) {
      this.currentRole = 'Teacher';
    } else {
      this.currentRole = 'Student';
    }

     this.load();
  }


  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private profileApi: ProfileService) { }


  load() {
    this.error = null;
    this.loading = true;

    this.profileApi.me().subscribe({
      next: (p) => {
        localStorage.setItem('auth_user_name', p.fullName);
        this.profile = p;
        this.form.patchValue({
          fullName: p.fullName ?? '',
          email: p.email ?? '',
          gender: p.student?.gender ?? '',
          phoneNumber: p.phoneNumber ?? '',
          dateOfBirth: p.student?.dateOfBirth ?? '',
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Failed to load profile.';
      },
    });
  }

  save() {
    this.error = null;
    this.saving = true;

    const raw = this.form.getRawValue();

    const payload = {
      fullName: raw.fullName?.trim(),
      email: raw.email?.trim(),
      gender: (raw.gender ?? '').trim() || null,

      dateOfBirth: this.normalizeDateOnly(raw.dateOfBirth),

       phoneNumber: this.normalizePhone(raw.phoneNumber),
    };

    this.profileApi.updateMe(payload as any).subscribe({
      next: () => {
        this.saving = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message ?? 'Failed to update profile.';
      },
    });
  }

  private normalizePhone(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const s = String(value).trim();
    if (s === '') return null;
    const normalized = s.replace(/[^\d+]/g, '');
    return normalized;
  }


  private normalizeDateOnly(value: string | null | undefined): string | null {
    if (!value) return null;

    const v = value.trim();
    if (v === '') return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    return null;
  }
  getProfileImageUrl(): string {
    const imageUrl = this.profile?.student?.imageUrl;

    if (!imageUrl) {
      return 'assets/user.png';
    }

     if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

     return `${environment.apiBaseUrl}${imageUrl}`;
  }

  cancel() {
    this.load();
  }
  onPickImage(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error = null;

    this.profileApi.uploadStudentImage(file).subscribe({
      next: (p) => {
        this.profile = p;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to upload image.';
      },
    });
  }
}
