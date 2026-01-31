import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SideMenuComponent } from './sideMenu/side-menu.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, SideMenuComponent, CommonModule, RouterLink],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  showDropdown = false;
  fullName = localStorage.getItem('auth_user_name') || 'User';
  userImage = localStorage.getItem('auth_user_image');

  constructor(private authService: AuthService, private router: Router) { }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  getProfileImageUrl(): string {
    const imageUrl = this.userImage
    if (!imageUrl) {
      return 'assets/user.png';
    }

    return `${environment.apiBaseUrl}${imageUrl}`;
  }

}
