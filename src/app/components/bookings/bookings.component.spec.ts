import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BookingsComponent } from './bookings.component';
import { BookingService } from '../../services/booking-service/booking.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { of } from 'rxjs';
import { BookingResponse, BookingType } from '../../models/booking.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimePipe } from '../../shared/pipes/time-pipe/time.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  let mockUpcomingBookingResponse: BookingResponse = {
    code: 200,
    message: 'test',
    bookings: [
      {
        booking_id: '1',
        game_id: '1',
        game: 'test',
        image_url: 'test',
        date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        booked_users: [],
      },
    ],
  };

  let mockPendingResultsBookingResponse: BookingResponse = {
    code: 200,
    message: 'test',
    bookings: [
      {
        booking_id: '2',
        game_id: '2',
        game: 'test-2',
        image_url: 'test-2',
        date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        booked_users: ['test'],
      },
    ],
  };

  beforeEach(async () => {
    bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getBookings','deleteBooking','updateBookingResult']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess']);

    await TestBed.configureTestingModule({
      declarations: [BookingsComponent, NavbarComponent, TimePipe],
      imports: [
        HttpClientModule,
        DropdownModule,
        FormsModule,
        ReactiveFormsModule,
        TooltipModule,
        ButtonModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    bookingServiceSpy.getBookings.and.returnValue(of(mockUpcomingBookingResponse));

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('the bookings signal should update with the updated bookings in ngOnInit', () => {
    expect(component.bookings()).toEqual(mockUpcomingBookingResponse.bookings);
  });

  it('on booking type upcoming select a call should be made to get the bookings of that type', fakeAsync(() => {
    component.selectedBookingType = BookingType.upcoming;

    component.onBookingTypeSelect();
    tick();

    expect(component.bookings()).toEqual(mockUpcomingBookingResponse.bookings);

  }));

  it('on booking type upcoming select a call should be made to get the bookings of that type', fakeAsync(() => {
    bookingServiceSpy.getBookings.and.returnValue(of(mockPendingResultsBookingResponse));

    component.selectedBookingType = BookingType.pendingResults;

    component.onBookingTypeSelect();
    tick();

    expect(component.bookings()).toEqual(mockPendingResultsBookingResponse.bookings);

  }));

  it('on calling the win function the bookings array should remove that booking from the array',fakeAsync(() => {
    bookingServiceSpy.updateBookingResult.and.returnValue(of({ code: 200, message: "success" }));
    component.onWin("1","1");

    tick();

    expect(component.bookings()?.length).toBe(0);

  }));

  it('on calling the loss function the bookings array should remove that booking from the array',fakeAsync(() => {
    bookingServiceSpy.updateBookingResult.and.returnValue(of({ code: 200, message: "success" }));
    component.onLoss("1","1");

    tick();

    expect(component.bookings()?.length).toBe(0);

  }));

  it('on cancelling the booking a call should be made and the booking must be removed from the bookings array',fakeAsync(() => {
    bookingServiceSpy.deleteBooking.and.returnValue(of({ code: 200, message: "success" }));

    component.onCancelBooking("1");
    tick();

    expect(component.bookings()?.length).toBe(0);
  }))
});
