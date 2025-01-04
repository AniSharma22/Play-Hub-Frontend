import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { InvitationService } from '../../services/invitation-service/invitation.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Role } from '../../models/models';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let invitationServiceSpy: jasmine.SpyObj<InvitationService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login'], {
      role$: signal(null),
      loggedIn$: signal(false),
    });
    invitationServiceSpy = jasmine.createSpyObj(
      'InvitationService',
      ['getPendingInvitationStatus', 'createInvitationPoll'],
      {
        isInvitationPending$: signal(false),
      }
    );
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess','showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        FloatLabelModule,
        PasswordModule,
        InputGroupModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: InvitationService, useValue: invitationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.form.controls.email.value).toEqual('');
    expect(component.form.controls.password.value).toEqual('');
  });

  it('onSubmit should call the login method of authService and navigate user to home page on successful login', fakeAsync(() => {
    component.form.controls.email.setValue('test.test@watchguard.com');
    component.form.controls.password.setValue('testPassword2003@');
    spyOn(localStorage, 'setItem');
    authServiceSpy.login.and.returnValue(
      of({
        code: 200,
        role: Role.user,
        token: 'test-token',
      })
    );
    invitationServiceSpy.getPendingInvitationStatus.and.returnValue(of(true));

    expect(component.form.valid).toBe(true);

    component.onSubmit();

    tick();

    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(
      'Login Successful'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'authToken',
      'test-token'
    );
    expect(authServiceSpy.role$()).toEqual(Role.user);
    expect(authServiceSpy.loggedIn$()).toBe(true);
    expect(invitationServiceSpy.isInvitationPending$()).toBe(true);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
  }));

  it('should show error toast and set loading to false if login credentials are wrong or if some error occured on the backedn', fakeAsync(() => {
    component.form.controls.email.setValue('test.test@watchguard.com');
    component.form.controls.password.setValue('testPassword2003@');

    // Create a mock HTTP error response
    const errorResponse = new HttpErrorResponse({
      error: {
        code : 1100,
        message: "invalid credentials"
      },
      status: 401,
      statusText: 'Unauthorized'
    });

    authServiceSpy.login.and.returnValue(throwError(()=> errorResponse));

    component.onSubmit();

    tick();

    expect(component.loading).toBe(false);
    expect(toastServiceSpy.showError).toHaveBeenCalledWith(errorResponse.error.message);
  }));
});
