import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User, UserResponse, UsersResponse } from '../../models/user.models';
import { BASE_URL } from '../../shared/constants/constants';

import { Observable, tap } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  selectedUser: User | null = null;
  constructor(private httpClient: HttpClient) {}

  getAllUsers(
    limit: number = 10,
    offset: number = 0,
    substring: string = ''
  ): Observable<UsersResponse> {
    return this.httpClient
      .get<UsersResponse>(
        `${BASE_URL}/users?limit=${limit}&offset=${offset}&substring=${substring}`
      )
      .pipe(
        tap((response: UsersResponse) => {
          if (response.users) {
            response.users = response.users.map((user: User) => ({
              ...user,
              created_at: new Date(user.created_at),
              updated_at: new Date(user.updated_at),
            }));
          }
        })
      );
  }

  getAllUsersPublic(slotId: string): Observable<UsersResponse> {
    return this.httpClient.get<UsersResponse>(
      `${BASE_URL}/users/public?slotId=${slotId}`
    );
  }

  sendInvite(
    userId: string,
    slotId: string,
    gameId: string
  ): Observable<{
    code: number;
    message: string;
    invitation_id: string;
  }> {
    return this.httpClient.post<{
      code: number;
      message: string;
      invitation_id: string;
    }>(`${BASE_URL}/invitations`, {
      invited_user_id: userId,
      slot_id: slotId,
      game_id: gameId,
    });
  }

  getProfile(): Observable<UserResponse> {
    return this.httpClient.get<UserResponse>(`${BASE_URL}/users/me`);
  }

  deleteUser(userId: string): Observable<{
    code: number;
    message: string;
  }> {
    return this.httpClient.delete<{
      code: number;
      message: string;
    }>(`${BASE_URL}/users/${userId}`);
  }

  updateUserDetails(
    username: string,
    password: string,
    mobileNumber: string,
    imageUrl: string
  ) {
    return this.httpClient.put(
      `${BASE_URL}/users`,
      {
        username: username,
        password: password,
        mobile_number: mobileNumber.toString(),
        image_url: imageUrl,
      },
      {
        observe: 'response',
      }
    );
  }
}
