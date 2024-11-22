import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { User, UserDetails, UserResponse } from '../../models/user.models';
import { Gender, Role } from '../../models/models';
import { LoginResponse } from '../../models/auth.models';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BASE_URL } from '../../shared/constants/constants';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  const testUser: User = {
    user_id: '1',
    username: 'test',
    email: 'test',
    password: 'test',
    mobile_number: '8888888888',
    gender: Gender.male,
    role: Role.user,
    image_url: 'string',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const testUserResponse: UserResponse = {
    code: 200,
    message: 'test message',
    user: testUser,
  };

  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxODE2MjM5MDIyfQ.f0AIqQZcicNfbEwmW1MRxBmIGTENoHy7MtNZBJu3CT4';

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should fetch user details when logged inside constructor', fakeAsync(() => {
    // Mocking localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'authToken') {
        return testToken;
      }
      return null;
    });

    authService = TestBed.inject(AuthService);

    tick();

    const req = httpTestingController.expectOne(`${BASE_URL}/users/me`);
    expect(req.request.method).toBe('GET'); // Ensure the correct HTTP method is used
    req.flush(testUserResponse);

    tick();

    // Assertions
    expect(authService.user$()).toEqual(testUser);
    expect(authService.role$()).toEqual(Role.user);
    expect(authService.loggedIn$()).toEqual(true);

    httpTestingController.verify();
  }));

  it('should successfully login with valid credentials', (done) => {
    const mockResponse: LoginResponse = {
      code: 200,
      token: 'fake-jwt-token',
      role: Role.user,
    };
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    authService = TestBed.inject(AuthService);

    authService.login(testEmail, testPassword).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        done();
      },
    });

    const req = httpTestingController.expectOne(`${BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: testEmail,
      password: testPassword,
    });
    req.flush(mockResponse);
  });

  it('should successfully signup with the provided details in the body', (done: DoneFn) => {
    const testUserDetails: UserDetails = {
      email: 'test',
      password: 'test',
      phoneNo: 8899119922,
      gender: Gender.male,
    };

    const mockResponse: LoginResponse = {
      code: 200,
      token: 'fake-jwt-token',
      role: Role.user,
    };

    authService = TestBed.inject(AuthService);

    authService.signup(testUserDetails).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        done();
      },
    });

    const req = httpTestingController.expectOne(`${BASE_URL}/auth/signup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: testUserDetails.email,
      password: testUserDetails.password,
      phone_no: testUserDetails.phoneNo.toString(),
      gender: testUserDetails.gender,
    });
    req.flush(mockResponse);
  });
});
