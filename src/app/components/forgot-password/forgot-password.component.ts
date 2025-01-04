import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth-service/auth.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { CustomValidators } from '../../shared/custom-validator/custom-validators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  form = new FormGroup({
    email: new FormControl<string>('', [
      Validators.required,
      CustomValidators.isValidEmail(),
    ]),
  });

  onSubmit() {
    if (this.form.valid) {
      this.authService.forgotPassword(this.form.value.email!).subscribe({
        next: (data: { code: number; message: string }) => {
          this.toastService.showSuccess(
            'If this email exists an OTP has been sent'
          );
          this.authService.forgotPasswordEmail$.set(this.form.value.email!);
          this.router.navigate(['/reset-password']);
        },
        error: (error) => {
          this.toastService.showError(
            'Some error occurred. Please try again later'
          );
          this.router.navigate(['/login']);
        },
      });
    }
  }
}
