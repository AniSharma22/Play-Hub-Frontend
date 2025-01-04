import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { InvitationService } from '../../services/invitation-service/invitation.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { Gender, Role } from '../../models/models';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let invitationServiceSpy: jasmine.SpyObj<InvitationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signup'], {
      role$: signal(null),
      loggedIn$: signal(false),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    invitationServiceSpy = jasmine.createSpyObj(
      'InvitationService',
      ['getPendingInvitationStatus', 'createInvitationPoll'],
      {
        isInvitationPending$: signal(false),
      }
    );

    await TestBed.configureTestingModule({
      declarations: [SignupComponent],
      imports: [
        FloatLabelModule,
        PasswordModule,
        InputGroupModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        ToastModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        {provide: InvitationService, useValue: invitationServiceSpy},
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSubmit should call the signup method of authService and navigate user to home page on successful signup', fakeAsync(() => {
    const mockFormDate = {
      email: 'test.test@watchguard.com',
      mobile: 8890765809,
      gender: {
        label: 'male',
        value: Gender.male,
      },
      password: 'testPassword2003@',
      confirmPassword: 'testPassword2003@',
    };

    authServiceSpy.signup.and.returnValue(
      of({ code: 200, role: Role.user, token: 'test-token' })
    );
    spyOn(localStorage, 'setItem');
    invitationServiceSpy.getPendingInvitationStatus.and.returnValue(of(false));

    component.form.setValue(mockFormDate);

    component.onSubmit();

    tick();

    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(
      'Signup Successful'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'authToken',
      'test-token'
    );
    expect(authServiceSpy.role$()).toEqual(Role.user);
    expect(authServiceSpy.loggedIn$()).toBe(true);
    expect(invitationServiceSpy.isInvitationPending$()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
  }));

  it('should show error toast and set loading to false if signup fails for some reason', fakeAsync(() => {
    const mockFormDate = {
      email: 'test.test@watchguard.com',
      mobile: 8890765809,
      gender: {
        label: 'male',
        value: Gender.male,
      },
      password: 'testPassword2003@',
      confirmPassword: 'testPassword2003@',
    };

    // Create a mock HTTP error response
    const errorResponse = new HttpErrorResponse({
      error: {
        code : 1100,
        message: "invalid credentials"
      },
      status: 401,
      statusText: 'Unauthorized'
    });

    component.form.setValue(mockFormDate);

    authServiceSpy.signup.and.returnValue(throwError(()=> errorResponse));

    component.onSubmit();

    tick();

    expect(component.loading).toBe(false);
    expect(toastServiceSpy.showError).toHaveBeenCalledWith(errorResponse.error.message);
  }));
});
