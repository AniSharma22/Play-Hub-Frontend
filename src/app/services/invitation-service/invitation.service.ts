import { Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { interval, map, Observable, tap } from 'rxjs';
import { Invitation, InvitationResponse, InvitationType } from '../../models/invitation.models';
import { BASE_URL } from '../../shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class InvitationService implements OnDestroy {
  private intervalId: any = null;
  isInvitationPending$ = signal<boolean>(false);

  constructor(private httpClient: HttpClient) {}

  getInvitations(type: string): Observable<InvitationResponse> {
    return this.httpClient
      .get<InvitationResponse>(`${BASE_URL}/invitations?type=${type}`)
      .pipe(
        tap((response: InvitationResponse) => {
          if (type === InvitationType.pending && response.invitations && response.invitations.length > 0) {
            this.isInvitationPending$.set(true);
            response.invitations = response.invitations.map(
              (invitation: Invitation) => ({
                ...invitation,
                date: new Date(invitation.date),
                start_time: new Date(invitation.start_time),
                end_time: new Date(invitation.end_time),
              })
            );
          }
        })
      );
  }

  cancelInvitation(invitationId: string): Observable<{
    message: string;
    code: number;
  }> {
    return this.httpClient.delete<{
      message: string;
      code: number;
    }>(`${BASE_URL}/invitations/${invitationId}`);
  }

  getPendingInvitationStatus(): Observable<boolean> {
    return this.httpClient
      .head(`${BASE_URL}/invitations/status`, {
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>): boolean => {
          return response.headers.get('invitation_status') === 'true';
        })
      );
  }

  acceptInvitation(invitationId: string): Observable<HttpResponse<any>> {
    return this.httpClient.patch<HttpResponse<any>>(
      `${BASE_URL}/invitations/${invitationId}?action=accept`,
      {},
      { observe: 'response' }
    );
  }

  rejectInvitation(invitationId: string): Observable<HttpResponse<any>> {
    return this.httpClient.patch<HttpResponse<any>>(
      `${BASE_URL}/invitations/${invitationId}?action=reject`,
      {},
      { observe: 'response' }
    );
  }

  createInvitationPoll() {
    this.intervalId = interval(10000).subscribe(() => {
      this.getPendingInvitationStatus().subscribe((status: boolean): void => {
        this.isInvitationPending$.set(status);
      });
    });
  }

  removeInvitationPoll(): void {
    if (this.intervalId) {
      this.intervalId.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.removeInvitationPoll();
  }
}
