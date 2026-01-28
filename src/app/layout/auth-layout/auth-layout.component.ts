import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../app-layout/sideMenu/side-menu.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, SideMenuComponent],
  templateUrl: './auth-layout.component.html',
})
export class AuthAppLayoutComponent { }
