import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { BASE_URL } from '../../shared/constants/constants';
import { BookingResponse } from '../../models/booking.model';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });

    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBookings', () => {
    it('should fetch bookings and convert date strings to Date objects', () => {
      const mockResponse: BookingResponse = {
        code: 200,
        message: "test",
        bookings: [
          {
            booking_id: '1',
            game_id: '1',
            game: "test",
            image_url: "test",
            date: new Date(),
            start_time: new Date(),
            end_time: new Date(),
            booked_users: ['anish'],
          }
        ]
      };

      service.getBookings('active').subscribe(response => {
        expect(response.bookings).toBeTruthy();
        expect(response.bookings![0].date).toBeInstanceOf(Date);
        expect(response.bookings![0].start_time).toBeInstanceOf(Date);
        expect(response.bookings![0].end_time).toBeInstanceOf(Date);
      });

      const req = httpMock.expectOne(`${BASE_URL}/bookings?type=active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', () => {
      const mockResponse = { code: 200, message: 'Booking created' };

      service.createBooking('slot123', 'game456').subscribe(response => {
        expect(response.code).toBe(200);
        expect(response.message).toBe('Booking created');
      });

      const req = httpMock.expectOne(`${BASE_URL}/bookings`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        slot_id: 'slot123',
        game_id: 'game456'
      });
      req.flush(mockResponse);
    });
  });

  describe('updateBookingResult', () => {
    it('should update booking result successfully', () => {
      const mockResponse = { code: 200, message: 'Result recorded' };

      service.updateBookingResult('game123', 'booking456', 'win').subscribe(response => {
        expect(response.code).toBe(200);
        expect(response.message).toBe('Result recorded');
      });

      const req = httpMock.expectOne(`${BASE_URL}/leaderboards/record-result`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        game_id: 'game123',
        booking_id: 'booking456',
        result: 'win'
      });
      req.flush(mockResponse);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking successfully', () => {
      const mockResponse = { code: 200, message: 'Booking deleted' };

      service.deleteBooking('booking123').subscribe(response => {
        expect(response.code).toBe(200);
        expect(response.message).toBe('Booking deleted');
      });

      const req = httpMock.expectOne(`${BASE_URL}/bookings/booking123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
