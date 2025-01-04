import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { SlotService } from './slot.service';
import { BASE_URL } from '../../shared/constants/constants';
import { Slot, SlotResponse } from '../../models/slot.model';

describe('SlotService', () => {
  let service: SlotService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SlotService],
    });

    service = TestBed.inject(SlotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGameSlots', () => {
    const mockGameId = 'game123';
    const mockResponse: SlotResponse = {
      code: 200,
      message: 'Success',
      slots: [
        {
          slot_id: 'slot123',
          game_id: mockGameId,
          slot_date: new Date('2024-11-28'),
          start_time: new Date('2024-11-28T10:00:00'),
          end_time: new Date('2024-11-28T11:00:00'),
          is_booked: false,
          booked_users: null,
          created_at: new Date('2024-11-27T10:00:00'),
        },
      ],
    };

    const mockApiResponse: SlotResponse = {
      code: 200,
      message: 'Success',
      slots: [
        {
          slot_id: 'slot123',
          game_id: mockGameId,
          slot_date: new Date(),
          start_time: new Date(),
          end_time: new Date(),
          is_booked: false,
          booked_users: null,
          created_at: new Date(),
        },
      ],
    };

    it('should make a GET request to the correct URL', () => {
      service.getGameSlots(mockGameId).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/slots/games/${mockGameId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should handle empty slots array', (done) => {
      const emptyResponse: SlotResponse = {
        code: 200,
        message: 'Success',
        slots: [],
      };

      service.getGameSlots(mockGameId).subscribe((response) => {
        expect(response.slots).toEqual([]);
        expect(response.code).toBe(200);
        expect(response.message).toBe('Success');
        done();
      });

      const req = httpMock.expectOne(`${BASE_URL}/slots/games/${mockGameId}`);
      req.flush(emptyResponse);
    });
  });
});
