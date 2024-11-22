import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvitationService } from './invitation.service';
import { BASE_URL } from '../../shared/constants/constants';
import { Invitation, InvitationResponse } from '../../models/invitation.models';
import { Observable } from 'rxjs';

describe('InvitationService', () => {
  let service: InvitationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvitationService]
    });

    service = TestBed.inject(InvitationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInvitations', () => {
    it('should fetch invitations and convert date strings to Date objects', () => {
      const mockResponse: InvitationResponse = {
        code: 200,
        message: 'test',
        invitations: [
          {
            invitation_id: '1',
            slotId: '1',
            game_id: '1',
            game: 'test-game',
            image_url: 'test-image',
            date: new Date(),
            start_time: new Date(),
            end_time: new Date(),
            booked_users: [{ user_name: 'anish',user_image: 'test_image' }],
            invited_by: 'test',
          },
        ],
      };

      service.getInvitations('pending').subscribe(response => {
        expect(response.invitations).toBeTruthy();
        expect(response.invitations![0].date).toBeInstanceOf(Date);
        expect(response.invitations![0].start_time).toBeInstanceOf(Date);
        expect(response.invitations![0].end_time).toBeInstanceOf(Date);
        expect(service.isInvitationPending$()).toBe(true);
      });

      const req = httpMock.expectOne(`${BASE_URL}/invitations?type=pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel an invitation successfully', () => {
      const mockResponse = { message: 'Invitation cancelled', code: 200 };

      service.cancelInvitation('invite123').subscribe(response => {
        expect(response.message).toBe('Invitation cancelled');
        expect(response.code).toBe(200);
      });

      const req = httpMock.expectOne(`${BASE_URL}/invitations/invite123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getPendingInvitationStatus', () => {
    it('should get invitation status from headers', () => {
      service.getPendingInvitationStatus().subscribe(status => {
        expect(status).toBe(true);
      });

      const req = httpMock.expectOne(`${BASE_URL}/invitations/status`);
      expect(req.request.method).toBe('HEAD');
      req.flush(null, {
        headers: { 'invitation_status': 'true' },
        status: 200,
        statusText: 'OK'
      });
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation', () => {
      service.acceptInvitation('invite123').subscribe(response => {
        expect(response.status).toBe(200);
      });

      const req = httpMock.expectOne(`${BASE_URL}/invitations/invite123?action=accept`);
      expect(req.request.method).toBe('PATCH');
      req.flush({}, { status: 200, statusText: 'OK' });
    });
  });

  describe('rejectInvitation', () => {
    it('should reject an invitation', () => {
      service.rejectInvitation('invite123').subscribe(response => {
        expect(response.status).toBe(200);
      });

      const req = httpMock.expectOne(`${BASE_URL}/invitations/invite123?action=reject`);
      expect(req.request.method).toBe('PATCH');
      req.flush({}, { status: 200, statusText: 'OK' });
    });
  });

  describe('createInvitationPoll', () => {
    it('should create an interval for checking invitation status', (done) => {
      jasmine.clock().install();
      spyOn(service, 'getPendingInvitationStatus').and.callFake(() => {
        return Observable.create(
          (observer: {
            next: (arg0: boolean) => void;
            complete: () => void;
          }) => {
            observer.next(true);
            observer.complete();
          }
        );
      });

      service.createInvitationPoll();
      jasmine.clock().tick(30001);

      expect(service.getPendingInvitationStatus).toHaveBeenCalled();

      jasmine.clock().uninstall();
      done();
    });
  });
});
