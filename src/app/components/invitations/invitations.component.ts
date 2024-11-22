import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { InvitationService } from '../../services/invitation-service/invitation.service';
import { ToastService } from '../../services/toast-service/toast.service';
import {
  Invitation,
  InvitationResponse,
  InvitationType,
} from '../../models/invitation.models';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.scss',
})
export class InvitationsComponent implements OnInit {
  loading$ = signal<boolean>(false)
  invitations: Invitation[] | null = null;
  invitationType: [InvitationType, InvitationType] | undefined = [
    InvitationType.pending,
    InvitationType.sent,
  ];
  selectedInvitationType: InvitationType = InvitationType.pending;

  constructor(
    private invitationService: InvitationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading$.set(true);
    if (this.selectedInvitationType === InvitationType.pending) {
      this.loadPendingInvitations();
    } else {
      this.loadSentInvitations();
    }
  }

  onInvitationTypeSelect(): void {
    this.loadInvitations();
  }

  loadPendingInvitations(): void {
    this.invitationService.getInvitations('pending').subscribe({
      next: (data: InvitationResponse) => {
        this.invitations = data.invitations;
        this.loading$.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading$.set(false);
        this.toastService.showError('Failed to load pending invitations');
      },
    });
  }

  loadSentInvitations(): void {
    this.invitationService.getInvitations('sent').subscribe({
      next: (data: InvitationResponse) => {
        this.invitations = data.invitations;
        this.loading$.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading$.set(false);
        this.toastService.showError('Failed to load sent invitations');
        console.error(error);
      },
    });
  }

  onCancelInvitation(invitationId: string): void {
    this.loading$.set(true);
    this.invitationService.cancelInvitation(invitationId).subscribe({
      next: (response: { message: string; code: number }) => {
        // Remove the canceled invitation from sent invitations

        if (this.invitations) {
          this.invitations = this.invitations.filter(
            (invitation: Invitation) =>
              invitation.invitation_id !== invitationId
          );
        }
        this.loading$.set(false);
        this.toastService.showSuccess('Invitation Cancelled');
      },
      error: (error: HttpErrorResponse) => {
        this.loading$.set(false);
        this.toastService.showError(error.error.message);
        console.error(error);
      },
    });
  }

  onAccept(invitationId: string): void {
    this.loading$.set(true);
    this.invitationService.acceptInvitation(invitationId).subscribe({
      next: (response: HttpResponse<{ code: number; message: string }>) => {
          this.toastService.showSuccess(response.body?.message!);
          this.invitations = this.invitations?.filter(
            (invitation: Invitation) =>
              invitation.invitation_id !== invitationId
          )!;
          if (this.invitations?.length == 0) {
            this.invitationService.isInvitationPending$.set(false);
          }
      },
      error: (error: HttpErrorResponse) => {
        this.loading$.set(false);
        this.toastService.showError(error.error.message);
      },
    });
  }

  onReject(invitationId: string): void {
    this.loading$.set(true);
    this.invitationService.rejectInvitation(invitationId).subscribe({
      next: (response: HttpResponse<{ code: number; message: string }>) => {

          this.invitations = this.invitations?.filter(
            (invitation: Invitation) =>
              invitation.invitation_id !== invitationId
          )!;
        this.loading$.set(false);
        this.toastService.showSuccess(response.body?.message!);
          if (this.invitations?.length == 0) {
            this.invitationService.isInvitationPending$.set(false);
          }
      },
      error: (error: HttpErrorResponse) => {
        this.loading$.set(false);
        this.toastService.showError(error.error.message);
      },
    });
  }

  protected readonly InvitationType = InvitationType;
}
