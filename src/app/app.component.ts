import { DashboardComponent } from './dashboard/dashboard.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoursesComponent } from './courses/courses.component';
import { SideMenuComponent } from './layout/app-layout/sideMenu/side-menu.component';
import { StudentsComponent } from './students/students.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideMenuComponent, DashboardComponent, CoursesComponent, StudentsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'school-manegment-system-front';
}
