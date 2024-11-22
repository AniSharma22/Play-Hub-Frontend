import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { GameComponent } from './game.component';
import { GameService } from '../../services/game-service/game.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { SlotService } from '../../services/slot-service/slot.service';
import { BookingService } from '../../services/booking-service/booking.service';
import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Game } from '../../models/game.model';
import { UsersResponse } from '../../models/user.models';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { TimePipe } from '../../shared/pipes/time-pipe/time.pipe';
import { FullTimePipe } from '../../shared/pipes/full-time-pipe/full-time.pipe';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputGroupModule } from 'primeng/inputgroup';
import { Slot, SlotResponse } from '../../models/slot.model';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Gender, Role } from '../../models/models';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockSlotsResponse: SlotResponse = {
    code: 200,
    message: 'test',
    slots: [
      {
        slot_id: '1',
        game_id: '1',
        slot_date: new Date(),
        start_time: new Date(),
        end_time: new Date(),
        is_booked: false,
        booked_users: ['test-user'],
        created_at: new Date(),
      },
    ],
  };

  const mockUsersResponse: UsersResponse = {
    code: 200,
    message: 'test',
    total: 1,
    users: [
      {
        user_id: '1',
        username: 'test-user',
        email: '1',
        password: '1',
        mobile_number: '1',
        gender: Gender.male,
        role: Role.user,
        image_url: 'test',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };
  beforeEach(async () => {
    // Mock the value that the `selectedGame$` property should return
    const mockGame: Game = {
      game_id: '1',
      game_name: 'test-game',
      image_url: 'test',
      max_players: 4,
      min_players: 2,
      instances: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Create a spy for `GameService` with `selectedGame$` as a mock property
    gameServiceSpy = jasmine.createSpyObj('GameService', [], {
      selectedGame$: signal(mockGame),
    });
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      user$: signal(null),
    });
    slotServiceSpy = jasmine.createSpyObj('SlotService', ['getGameSlots']);
    bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'createBooking',
    ]);
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAllUsersPublic',
      'sendInvite',
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [GameComponent, TimePipe, FullTimePipe],
      imports: [
        HttpClientModule,
        OverlayPanelModule,
        InputGroupModule,
        ButtonModule,
        FormsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: GameService, useValue: gameServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    slotServiceSpy.getGameSlots.and.returnValue(of(mockSlotsResponse));

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a booking when book slot button is clicked', fakeAsync(() => {
    component.selectedSlot = mockSlotsResponse.slots[0];
    bookingServiceSpy.createBooking.and.returnValue(
      of({ code: 200, message: 'test' })
    );

    component.bookSlot();
    tick();

    expect(bookingServiceSpy.createBooking).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should fetch all users by calling FetchUsers method', fakeAsync(() => {
    userServiceSpy.getAllUsersPublic.and.returnValue(of(mockUsersResponse));
    const testEvent = jasmine.createSpyObj('Event', [
      'preventDefault',
      'stopPropagation',
    ]);

    component.fetchUsers(testEvent);
    tick();

    expect(component.users.length).toEqual(0);
    expect(component.filteredUsers.length).toEqual(0);
  }));

  it('should create an invitation to a user when invite button is clicked corresponding to user', fakeAsync(() => {
    userServiceSpy.sendInvite.and.returnValue(
      of({ code: 200, message: 'test', invitation_id: '1' })
    );

    component.inviteUser(mockUsersResponse.users[0].user_id);
    tick();

    expect(component.users.length).toEqual(0);
    expect(component.filteredUsers.length).toEqual(0);
    expect(userServiceSpy.sendInvite).toHaveBeenCalledTimes(1);
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledTimes(1);
  }));

  it('should filter all the users based on the searched term', fakeAsync(() => {
    const testMockUsersResponse: UsersResponse = {
      code: 200,
      message: 'test',
      total: 1,
      users: [
        {
          user_id: '1',
          username: 'test',
          email: '1',
          password: '1',
          mobile_number: '1',
          gender: Gender.male,
          role: Role.user,
          image_url: 'test',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    };

    userServiceSpy.getAllUsersPublic.and.returnValue(of(testMockUsersResponse));

    const testEvent = jasmine.createSpyObj('Event', [
      'preventDefault',
      'stopPropagation',
    ]);

    component.fetchUsers(testEvent);
    tick();
    component.searchedUser = 'test';
    component.filterUsers();

    expect(component.filteredUsers.length).toEqual(1);
  }));

  it('should return the gradient background based on the percentage of the slot booked', fakeAsync(() => {
    const gradient = component.getGradientBackground(
      mockSlotsResponse.slots[0]
    );

    const result = `linear-gradient(to right, #35a335 75%, #35a335 75%, #333333 75%, #333333 25%)`;

    expect(gradient).toEqual(result);
  }));

  it('should trigger back when the back button is clicked', fakeAsync(() => {
    component.triggerBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should update the selected slot as selected when slot button is clicked', fakeAsync(() => {
    const mockSlot: Slot = {
      slot_id: '2',
      slot_date: new Date(),
      start_time: new Date(),
      end_time: new Date(),
      game_id: 'test-id',
      booked_users: ['test-user1', 'test-user2'],
      is_booked: false,
      created_at: new Date(),
    };

    component.selectSlot(mockSlot);

    expect(component.selectedSlot).toEqual(mockSlot);
  }));
});
