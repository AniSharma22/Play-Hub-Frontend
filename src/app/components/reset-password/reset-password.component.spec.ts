import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { ToastService } from '../../services/toast-service/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputOtpModule } from 'primeng/inputotp';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['resetPassword'], {
      forgotPasswordEmail$: signal('test.test@watchguard.com'),
    });
    routerSpy = jasmine.createSpyObj(Router, ['navigate']);
    toastServiceSpy = jasmine.createSpyObj(ToastService, [
      'showSuccess',
      'showError',
    ]);
    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        PasswordModule,
        InputOtpModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the request to reset password endpoint', fakeAsync(() => {
    // Use a valid password that meets the requirements
    component.form.controls.password.setValue('Test123!@');
    component.form.controls.confirmPassword.setValue('Test123!@');
    component.form.controls.otp.setValue(121212);
    authServiceSpy.resetPassword.and.returnValue(
      of({ code: 200, message: 'Password reset successfully' })
    );

    expect(component.form.valid).toBeTrue();

    component.onSubmit();
    tick();

    expect(toastServiceSpy.showSuccess).toHaveBeenCalledOnceWith(
      'Password reset successfully'
    );
    expect(authServiceSpy.forgotPasswordEmail$()).toEqual('');
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['login']);
  }));

  it('should submit the request to reset password endpoint and show error with navigating to the login page', fakeAsync(() => {
    // Use a valid password that meets the requirements
    component.form.controls.password.setValue('Test123!@');
    component.form.controls.confirmPassword.setValue('Test123!@');
    component.form.controls.otp.setValue(121212);
    const httpError = new HttpErrorResponse({
      status: 500,
      error: {
        message: 'Server error',
      },
    });
    authServiceSpy.resetPassword.and.returnValue(throwError(() => httpError));

    expect(component.form.valid).toBeTrue();

    component.onSubmit();
    tick();

    expect(toastServiceSpy.showError).toHaveBeenCalledOnceWith('Server error');
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['login']);
  }));

  it('should navigate to the login page if the forgotPassword email is not set in the signal', () => {
    authServiceSpy.forgotPasswordEmail$.set('');

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['forgot-password']);
  });
});
