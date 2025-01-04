import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { InvitationService } from '../invitation-service/invitation.service';
import { LoginResponse, SignupResponse } from '../../models/auth.models';
import { User, UserDetails, UserResponse } from '../../models/user.models';
import { Role } from '../../models/models';
import { BASE_URL } from '../../shared/constants/constants';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = signal<User | null>(null);
  loggedIn$ = signal<boolean>(this.hasValidToken());
  role$ = signal<Role>(Role.user);
  forgotPasswordEmail$ = signal<string>('');

  constructor(
    private httpClient: HttpClient,
    private invitationService: InvitationService
  ) {
    if (this.loggedIn$()) {
      this.fetchAndStoreUserDetails();
      this.invitationService.createInvitationPoll();
    }
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

      // Check if the token has expired
      return decodedToken.exp > currentTime;
    } catch (error) {
      // In case of any error (invalid token format, decoding issues), treat it as invalid
      return false;
    }
  }

  private fetchAndStoreUserDetails() {
    this.httpClient
      .get<UserResponse>(`${BASE_URL}/users/me`)
      .pipe(
        tap((response: UserResponse) => {
          this.loggedIn$.set(true);
          this.user$.set(response.user);
          this.role$.set(response.user?.role);
        })
      )
      .subscribe();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${BASE_URL}/auth/login`, {
      email: email,
      password: password,
    });
  }

  signup(userDetails: UserDetails): Observable<SignupResponse> {
    return this.httpClient.post<SignupResponse>(`${BASE_URL}/auth/signup`, {
      email: userDetails.email,
      password: userDetails.password,
      phone_no: userDetails.phoneNo.toString(),
      gender: userDetails.gender,
    });
  }

  forgotPassword(email: string): Observable<{ code: number; message: string }> {
    return this.httpClient.post<{ code: number; message: string }>(
      `${BASE_URL}/auth/forgot-password`,
      {
        email: email,
      }
    );
  }

  resetPassword(
    password: string,
    otp: string
  ): Observable<{ code: number; message: string }> {
    return this.httpClient.post<{ code: number; message: string }>(
      `${BASE_URL}/auth/reset-password`,
      {
        email: this.forgotPasswordEmail$(),
        password: password,
        otp: otp,
      }
    );
  }
}
