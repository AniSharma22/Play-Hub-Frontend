import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth-service/auth.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { CustomValidators } from '../../shared/custom-validator/custom-validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  form = new FormGroup(
    {
      password: new FormControl<string>('', [
        Validators.required,
        CustomValidators.isValidPassword(),
      ]),
      confirmPassword: new FormControl<string>('', [Validators.required]),
      otp: new FormControl<number | null>(null, [Validators.required]),
    },

    CustomValidators.matchPassword('password', 'confirmPassword')
  );

  onSubmit() {
    if (this.authService.forgotPasswordEmail$() === '') {
      this.router.navigate(['forgot-password']);
    }
    if (this.form.valid) {
      const password = this.form.controls.password.value!;
      const otp = this.form.controls.otp.value!;
      this.authService.resetPassword(password, otp.toString()).subscribe({
        next: (data: { code: number; message: string }) => {
          this.toastService.showSuccess(data.message);
          this.authService.forgotPasswordEmail$.set('');
          this.router.navigate(['login']);
        },
        error: (error) => {
          this.toastService.showError(error.error.message);
          this.router.navigate(['login']);
        },
      });
    }
  }
}
