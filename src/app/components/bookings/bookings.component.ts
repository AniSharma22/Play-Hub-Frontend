import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { BookingService } from '../../services/booking-service/booking.service';
import { ToastService } from '../../services/toast-service/toast.service';
import {
  Booking,
  BookingResponse,
  BookingResult,
  BookingType,
} from '../../models/booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  bookings = signal<Booking[] | null>(null);
  loading$ = signal<boolean>(false);
  bookingType: [BookingType, BookingType] | undefined = [
    BookingType.upcoming,
    BookingType.pendingResults,
  ];
  selectedBookingType: BookingType = BookingType.upcoming;
  protected readonly BookingType = BookingType;

  constructor(
    private bookingService: BookingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.bookingService.getBookings(this.selectedBookingType).subscribe({
      next: (data: BookingResponse): void => {
        this.bookings.set(data.bookings);
      },
      error: (error: HttpErrorResponse): void => {
        this.toastService.showError(error.error.message);
      },
    });
  }

  onBookingTypeSelect(): void {
    this.bookingService.getBookings(this.selectedBookingType).subscribe({
      next: (data: BookingResponse): void => {
        this.bookings.set(data.bookings);
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      },
    });
  }

  onWin(gameId: string, bookingId: string): void {
    this.loading$.set(true);
    this.bookingService
      .updateBookingResult(gameId, bookingId, BookingResult.win)
      .subscribe({
        next: (data: { code: number; message: string }): void => {
          this.bookings.update((prevBookings) =>
            (prevBookings ?? []).filter(
              (booking) => booking.booking_id !== bookingId
            )
          );
          // Show success message
          this.loading$.set(false);
          this.toastService.showSuccess(data.message);
        },
        error: (error: HttpErrorResponse): void => {
          // Show error message
          this.loading$.set(false);
          this.toastService.showError(error.error.message);
        },
      });
  }

  onLoss(gameId: string, bookingId: string): void {
    this.loading$.set(true);
    this.bookingService
      .updateBookingResult(gameId, bookingId, BookingResult.loss)
      .subscribe({
        next: (data: { code: number; message: string }): void => {
          this.bookings.update((prevBookings) =>
            (prevBookings ?? []).filter(
              (booking) => booking.booking_id !== bookingId
            )
          );
          // Show success message
          this.loading$.set(false);
          this.toastService.showSuccess(data.message);
        },
        error: (error: HttpErrorResponse): void => {
          this.loading$.set(false);
          this.toastService.showError(error.error.message);
        },
      });
  }

  onCancelBooking(bookingId: string): void {
    this.loading$.set(true);
    this.bookingService.deleteBooking(bookingId).subscribe({
      next: (response: { code: number; message: string }) => {
        this.loading$.set(false);
        this.toastService.showSuccess(response.message);
        this.bookings.update((prevBookings) =>
          prevBookings!.filter((booking: Booking) => {
            return booking.booking_id !== bookingId;
          })
        );
      },
      error: (error: HttpErrorResponse): void => {
        this.loading$.set(false);
        this.toastService.showError(error.error.message);
      },
    });
  }
}
