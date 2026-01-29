import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';

import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CoursesComponent } from './courses/courses.component';
import { CourseCteateComponent } from './courses/pages/course-cteate/course-cteate.component';
import { CourseUpdateComponent } from './courses/pages/course-update/course-update.component';
import { StudentsComponent } from './students/students.component';
import { StudentCteateComponent } from './students/pages/student-cteate/student-cteate.component';
import { StudentUpdateComponent } from './students/pages/student-update/student-update.component';
import { AuthAppLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { CourseViewComponent } from './courses/pages/course-view/course-view.component';



export const routes: Routes = [
     {
        path: '',
        component: AuthAppLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
        ],
    },

     {
        path: '',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'profile', component: ProfileComponent },

            { path: 'courses', component: CoursesComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } },
            { path: 'courses/create', component: CourseCteateComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } },
            { path: 'courses/:id/edit', component: CourseUpdateComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } },
            { path: 'courses/:id', component: CourseViewComponent, canActivate: [RoleGuard] },


            { path: 'students', component: StudentsComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'Staff'] } },
            { path: 'students/create', component: StudentCteateComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'Staff'] } },
            { path: 'students/:id/edit', component: StudentUpdateComponent, canActivate: [RoleGuard], data: { roles: ['Admin', 'Staff'] } },
            { path: 'students/:id', component: StudentUpdateComponent, canActivate: [RoleGuard] },

        ],
    },

     { path: '', pathMatch: 'full', redirectTo: '' },

    { path: '**', redirectTo: '' },
];
