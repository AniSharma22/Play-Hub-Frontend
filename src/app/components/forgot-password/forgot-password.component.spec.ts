import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ToastService } from '../../services/toast-service/toast.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['forgotPassword'], {
      forgotPasswordEmail$: signal(''),
    });
    routerSpy = jasmine.createSpyObj(Router, ['navigate']);
    toastServiceSpy = jasmine.createSpyObj(ToastService, [
      'showSuccess',
      'showError',
    ]);

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the requets to forgot password enpoint if the form is valid and store the email in the signal', fakeAsync(() => {
    component.form.controls.email.setValue('test.test@watchguard.com');
    authServiceSpy.forgotPassword.and.returnValue(
      of({ code: 200, message: 'success' })
    );

    expect(component.form.valid).toBeTrue();

    component.onSubmit();
    tick();

    expect(toastServiceSpy.showSuccess).toHaveBeenCalledOnceWith(
      'If this email exists an OTP has been sent'
    );
    expect(authServiceSpy.forgotPasswordEmail$()).toEqual(
      'test.test@watchguard.com'
    );
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/reset-password']);
  }));

  it('should submit the request to forgot password endpoint and show error because of some error on the backend', fakeAsync(() => {
    component.form.controls.email.setValue('test.test@watchguard.com');
    const httpError = new HttpErrorResponse({
      status: 500,
      error: 'Server error',
    });
    authServiceSpy.forgotPassword.and.returnValue(throwError(() => httpError));

    expect(component.form.valid).toBeTrue();

    component.onSubmit();
    tick();

    expect(toastServiceSpy.showError).toHaveBeenCalledOnceWith(
      'Some error occurred. Please try again later'
    );
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/login']);
  }));
});
