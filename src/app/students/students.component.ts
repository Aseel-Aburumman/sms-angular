import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentsService } from './services/students.service';
import { Student } from './student.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students: Student[] = []
  isLoading = true
  isDeleting = false

  error: string | null = null
  deleteError: string | null = null;

  constructor(private studentsService: StudentsService, private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }
  private subscription?: Subscription;

  private getStudents(): void {
    this.isLoading = true


    this.studentsService.getAll().subscribe({
      next: (data) => {
        console.log(data)
        this.students = data
        this.isLoading = false
      }, error: () => {
        this.error = "failed"
        this.isLoading = false

      }
    })
  }
  ngOnInit(): void {
    this.getStudents()
    this.subscription = this.route.queryParams.subscribe((params) => {
      this.getStudents();
      if (params['created'] === '1') {
        this.snackBar.open('Created successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { created: null, updated: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,

        });
      }

      if (params['updated'] === '1') {
        this.snackBar.open('Updated successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { created: null, updated: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,

        });
      }
    });
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


  delete(student: Student) {
    const ok = window.confirm(`Delete Student "${student.fullName}"? This cannot be undone.`);
    if (!ok) return;
    this.isDeleting = true
    console.log(student)
    this.studentsService.deleteStudent(student.id).subscribe({
      next: () => {
        this.students = this.students.filter(x => x.id !== student.id);
        this.isDeleting = false

      },
      error: () => {
        this.deleteError = 'Delete failed. The Student may be referenced by enrollments.';
        this.isDeleting = false
      },
    });
  }
}
