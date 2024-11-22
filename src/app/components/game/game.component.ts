import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { SlotService } from '../../services/slot-service/slot.service';
import { GameService } from '../../services/game-service/game.service';
import { BookingService } from '../../services/booking-service/booking.service';
import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { Slot, SlotResponse } from '../../models/slot.model';
import { User, UsersResponse } from '../../models/user.models';

import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  morningSlots: Slot[] | null = null;
  afternoonSlots: Slot[] | null = null;
  eveningSlots: Slot[] | null = null;
  selectedSlot: Slot | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchedUser: string = '';
  loadingBooking: boolean = false;
  currentTime$ = signal(new Date());
  currentTimeRef: any = null;
  loading$ = signal<boolean>(false);
  @ViewChild('op') overlayPanel: OverlayPanel | undefined;

  constructor(
    private router: Router,
    public authService: AuthService,
    private slotService: SlotService,
    private gameService: GameService,
    private bookingService: BookingService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.gameService.selectedGame$()) {
      const gameId: string = this.gameService.selectedGame$()?.game_id!;
      this.slotService.getGameSlots(gameId).subscribe({
        next: (data: SlotResponse) => {
          this.morningSlots = data.slots.slice(0, 9);
          this.afternoonSlots = data.slots.slice(9, 18);
          this.eveningSlots = data.slots.slice(18);
          this.selectedSlot = data.slots[0];

          this.currentTimeRef = setInterval(() => {
            this.currentTime$.set(new Date());
          }, 600000);
        },
        error: (error: HttpErrorResponse) => {
          this.toastService.showError(error.error.message);
        },
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  bookSlot() {
    this.loadingBooking = true;
    const slotId: string = this.selectedSlot?.slot_id!;
    const gameId: string = this.selectedSlot?.game_id!;
    this.bookingService.createBooking(slotId, gameId).subscribe({
      next: (response: { code: number; message: string }) => {
        this.toastService.showSuccess(response.message);
        this.loadingBooking = false;
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showError(error.error.message);
        this.loadingBooking = false;
        this.router.navigate(['/home']);
      },
    });
  }

  fetchUsers(event: Event) {
    this.overlayPanel?.toggle(event);

    this.userService.getAllUsersPublic(this.selectedSlot?.slot_id!).subscribe({
      next: (data: UsersResponse) => {
        // Filter out already booked users
        this.users = data.users.filter((user: User) => {
          if (this.selectedSlot?.booked_users) {
            return !this.selectedSlot.booked_users.some(
              (bookedUser: string): boolean => bookedUser === user.username
            );
          }
          return true;
        });
        // Initialize filtered users with all available users
        this.filteredUsers = [...this.users];
      },
      error: (error: HttpErrorResponse): void => {
        this.toastService.showError(error.error.message);
      },
    });
  }

  // Method to Send an actual invite to a specific user
  inviteUser(userId: string): void {
    this.loading$.set(true);
    const slotId: string = this.selectedSlot?.slot_id!;
    const gameId: string = this.selectedSlot?.game_id!;
    this.userService.sendInvite(userId, slotId, gameId).subscribe({
      next: (data: {
        code: number;
        message: string;
        invitation_id: string;
      }) => {
        this.users = this.users.filter((user: User) => user.user_id !== userId);
        this.filterUsers();
        this.loading$.set(false);
        this.toastService.showSuccess(data.message);
      },
      error: (error: HttpErrorResponse): void => {
        this.loading$.set(false);
        this.toastService.showError(error.error.message);
      },
    });
  }

  // Search functionality to invite a user
  filterUsers(): void {
    if (!this.searchedUser.trim()) {
      // If search is empty, show all users
      this.filteredUsers = [...this.users];
      return;
    }

    const searchTerm: string = this.searchedUser.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (user: User): boolean =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
  }

  triggerBack(): void {
    this.router.navigate(['/home']);
  }

  selectSlot(slot: Slot): void {
    this.selectedSlot = slot;
  }

  getGradientBackground(slot: Slot): string {
    const maxPlayers = this.gameService.selectedGame$()?.max_players!;
    const bookedCount = slot.booked_users?.length!;

    if (!bookedCount) {
      return `linear-gradient(to right, #35a335 100%, #35a335 100%, #333333 100%, #333333 0%)`;
    }

    // Calculate the percentage of booking
    const bookedPercentage = (bookedCount / maxPlayers) * 100;
    const remainingPercentage = 100 - bookedPercentage;

    // Use a more vibrant green and a darker shade for the booked part
    return `linear-gradient(to right, #35a335 ${remainingPercentage}%, #35a335 ${remainingPercentage}%, #333333 ${remainingPercentage}%, #333333 ${bookedPercentage}%)`;
  }

  ngOnDestroy() {
    clearInterval(this.currentTimeRef);
  }

  protected readonly Date = Date;
}
