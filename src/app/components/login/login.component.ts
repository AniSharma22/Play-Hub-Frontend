import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth-service/auth.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { httpError, LoginResponse } from '../../models/auth.models';
import { InvitationService } from '../../services/invitation-service/invitation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private router: Router,
    private toastService: ToastService
  ) {}

  form = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', Validators.required),
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const email = this.form.value.email!;
      const password = this.form.value.password!;
      this.authService.login(email, password).subscribe({
        next: (response: LoginResponse): void => {
          this.toastService.showSuccess('Login Successful');
          localStorage.setItem('authToken', response.token);
          this.authService.role$.set(response.role);
          this.authService.loggedIn$.set(true);
          this.loading = false;
          this.loadInvitationStatus();
          this.invitationService.createInvitationPoll();
          this.router.navigate(['home']);
        },
        error: (error: httpError): void => {
          this.toastService.showError(error.error.message);
          this.loading = false;
        },
      });
    }
  }

  private loadInvitationStatus(): void {
    this.invitationService.getPendingInvitationStatus().subscribe({
      next: (response: boolean): void => {
        this.invitationService.isInvitationPending$.set(response);
      },
    });
  }
}
