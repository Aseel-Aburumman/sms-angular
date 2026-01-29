import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { DashboardData } from './dashboard.model';
import { DashboardService } from './services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    isLoading = true;
    error: string | null = null;
    currentRole: 'Admin' | 'Teacher' | 'Student' = 'Student';  
    dashboardData: DashboardData | null = null;
    lastUpdated: string = 'Just now';

    constructor(
        private auth: AuthService,
        private dashboardService: DashboardService
    ) { }

    ngOnInit(): void {
        const roles = this.auth.getRoles();
        if (roles.includes('Admin')) {
            this.currentRole = 'Admin';
        } else if (roles.includes('Teacher')) {
            this.currentRole = 'Teacher';
        } else {
            this.currentRole = 'Student';
        }

        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.isLoading = true;
        this.error = null;

        const studentId = this.currentRole === 'Student' ? this.auth.getUserIdFromToken() || '' : undefined;

        this.dashboardService.dashboard(this.currentRole, studentId).subscribe({
            next: (data) => {
                this.dashboardData = data;
                this.isLoading = false;
                this.lastUpdated = 'Just now';
            },
            error: (err) => {
                console.error('Dashboard load error', err);
                this.error = 'Failed to load dashboard data.';
                this.isLoading = false;
            }
        });
    }

    getGradeBadgeClass(grade: string): string {
        if (!grade) return 'bg-secondary';
        if (grade.startsWith('A')) return 'bg-success';
        if (grade.startsWith('B')) return 'bg-primary';
        if (grade.startsWith('C')) return 'bg-warning text-dark';
        if (grade.startsWith('D')) return 'bg-danger';
        return 'bg-secondary';
    }

    getProgressColor(progress: number): string {
        if (progress >= 80) return 'bg-success';
        if (progress >= 50) return 'bg-primary';
        return 'bg-warning';
    }
}

