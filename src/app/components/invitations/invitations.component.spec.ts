import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { InvitationsComponent } from './invitations.component';
import { InvitationService } from '../../services/invitation-service/invitation.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { InvitationResponse } from '../../models/invitation.models';
import { TimePipe } from '../../shared/pipes/time-pipe/time.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { HttpResponse } from '@angular/common/http';

describe('InvitationsComponent', () => {
  let component: InvitationsComponent;
  let fixture: ComponentFixture<InvitationsComponent>;
  let invitationServiceSpy: jasmine.SpyObj<InvitationService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  let mockInvitationResponse: InvitationResponse = {
    code: 200,
    message: 'success',
    invitations: [
      {
        invitation_id: 'test',
        slotId: 'test',
        game_id: 'test',
        game: 'test',
        image_url: 'test',
        date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        booked_users: [],
        invited_by: 'test-user',
      },
    ],
  };

  beforeEach(async () => {

    invitationServiceSpy = jasmine.createSpyObj('InvitationService',['getInvitations','cancelInvitation','acceptInvitation','rejectInvitation'],{
      isInvitationPending$ : signal(true)
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService',['showSuccess','showError']);
    await TestBed.configureTestingModule({
      declarations: [InvitationsComponent, TimePipe],
      imports: [TooltipModule],
      providers: [
        {provide: InvitationService, useValue: invitationServiceSpy},
        {provide: ToastService, useValue: toastServiceSpy},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    invitationServiceSpy.getInvitations.and.returnValue(of(mockInvitationResponse));

    fixture = TestBed.createComponent(InvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all sent Invitations ',fakeAsync(()=>{
    invitationServiceSpy.getInvitations.and.returnValue(of(mockInvitationResponse));

    component.loadSentInvitations();
    tick();

    expect(component.invitations).toEqual(mockInvitationResponse.invitations);
    expect(component.loading$()).toBe(false);
  }));

  it('should cancel sent invitation if cancel button is clicked',fakeAsync(()=>{
    invitationServiceSpy.cancelInvitation.and.returnValue(of({ message: "success", code: 200 }));

    component.onCancelInvitation(mockInvitationResponse.invitations[0].invitation_id);
    tick();

    expect(component.invitations?.length).toEqual(0);
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith('Invitation Cancelled');
  }));

  it('should  accept invitation if the accept icon is clicked',fakeAsync(()=>{
    let InvitationResponse = new HttpResponse({
      body: {
        code : 200,
        message : "successfully accepted"
      }
    })
    invitationServiceSpy.acceptInvitation.and.returnValue(of(InvitationResponse));

    component.onAccept(mockInvitationResponse.invitations[0].invitation_id);
    tick();

    expect(component.invitations?.length).toEqual(0);
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith('successfully accepted');
    expect(invitationServiceSpy.isInvitationPending$()).toBe(false);
  }));

  it('should  reject invitation if the reject icon is clicked',fakeAsync(()=>{
    let InvitationResponse = new HttpResponse({
      body: {
        code : 200,
        message : "successfully rejected"
      }
    })
    invitationServiceSpy.rejectInvitation.and.returnValue(of(InvitationResponse));

    component.onReject(mockInvitationResponse.invitations[0].invitation_id);
    tick();

    expect(component.invitations?.length).toEqual(0);
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith('successfully rejected');
    expect(invitationServiceSpy.isInvitationPending$()).toBe(false);
  }));

  it('on invitationTypeSelect ')




});
