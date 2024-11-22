import { Component, OnInit, OnDestroy, computed, Signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth-service/auth.service';
import { InvitationService } from '../../services/invitation-service/invitation.service';
import { Role } from '../../models/models';
import { User } from '../../models/user.models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})

export class NavbarComponent {
  role: Signal<Role> = computed(() => this.authService.role$());
  user: Signal<User | null> = computed(() => this.authService.user$());
  isAdmin: Signal<boolean> = computed(() => this.role() === Role.admin);
  isLoggedIn: Signal<boolean> = computed(() => this.authService.loggedIn$());

  constructor(
    public authService: AuthService,
    public invitationService: InvitationService,
    private router: Router
  ) {}

  onSignup(): void {
    this.router.navigate(['signup']);
  }

  onLogin(): void {
    this.router.navigate(['login']);
  }

  onProfile(): void {
    this.router.navigate(['profile']);
  }

  onLogout(): void {
    this.authService.loggedIn$.set(false);
    localStorage.removeItem('authToken');
    this.invitationService.removeInvitationPoll();
    this.router.navigate(['']);
  }
}
