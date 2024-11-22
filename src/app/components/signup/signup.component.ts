import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth-service/auth.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { Gender } from '../../models/models';
import { SignupResponse } from '../../models/auth.models';
import { CustomValidators } from '../../shared/custom-validator/custom-validators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  loading: boolean = false;

  form = new FormGroup(
    {
      email: new FormControl<string>('', [
        Validators.required,
        CustomValidators.isValidEmail(),
      ]),
      mobile: new FormControl<number | null>(null, [
        Validators.required,
        CustomValidators.isValidPhoneNumber(),
      ]),
      gender: new FormControl<{ label: string; value: Gender } | null>(null, [
        Validators.required,
      ]),
      password: new FormControl<string>('', [
        Validators.required,
        CustomValidators.isValidPassword(),
      ]),
      confirmPassword: new FormControl<string>('', [Validators.required]),
    },
    CustomValidators.matchPassword('password', 'confirmPassword')
  );

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const email: string = this.form.value.email!;
      const phoneNo: number = this.form.value.mobile!;
      const gender: Gender = this.form.value.gender?.value!;
      const password: string = this.form.value.password!;

      this.authService.signup({ email, phoneNo, gender, password }).subscribe({
        next: (response: SignupResponse): void => {
          this.toastService.showSuccess('Signup Successful');
          localStorage.setItem('authToken', response.token);
          this.loading = false;
          this.router.navigate(['home']);
          this.authService.loggedIn$.set(true);
        },
        error: (error: HttpErrorResponse): void => {
          this.toastService.showError(error.error.message);
          this.loading = false;
        },
      });
    }
  }
}
