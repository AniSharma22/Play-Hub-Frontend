import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onPlayNow() {
    if (localStorage.getItem('authToken')) {
      this.authService.loggedIn$.set(true);
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['login']);
    }
  }
}
