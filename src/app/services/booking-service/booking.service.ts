import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Booking, BookingResponse } from '../../models/booking.model';

import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../shared/constants/constants';
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private httpClient: HttpClient) {}

  getBookings(type: string): Observable<BookingResponse> {
    return this.httpClient
      .get<BookingResponse>(`${BASE_URL}/bookings?type=${type}`)
      .pipe(
        tap((response: BookingResponse) => {
          if (response.bookings) {
            response.bookings = response.bookings.map((booking: Booking) => ({
              ...booking,
              date: new Date(booking.date),
              start_time: new Date(booking.start_time),
              end_time: new Date(booking.end_time),
            }));
          }
        })
      );
  }

  createBooking(
    slotId: string,
    gameId: string
  ): Observable<{
    code: number;
    message: string;
  }> {
    return this.httpClient.post<{
      code: number;
      message: string;
    }>(`${BASE_URL}/bookings`, {
      slot_id: slotId,
      game_id: gameId,
    });
  }

  updateBookingResult(
    gameId: string,
    bookingId: string,
    result: string
  ): Observable<{ code: number; message: string }> {
    return this.httpClient.post<{
      code: number;
      message: string;
    }>(`${BASE_URL}/leaderboards/record-result`, {
      game_id: gameId,
      booking_id: bookingId,
      result: result,
    });
  }

  deleteBooking(bookingId: string): Observable<{
    code: number;
    message: string;
  }> {
    return this.httpClient.delete<{
      code: number;
      message: string;
    }>(`${BASE_URL}/bookings/${bookingId}`);
  }
}
