import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../services/user-service/user.service';
import { GameService } from '../../services/game-service/game.service';
import { LeaderboardService } from '../../services/leaderboard-service/leaderboard.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { Game, GameResponse } from '../../models/game.model';
import { User } from '../../models/user.models';
import { UserStats, UserStatsResponse } from '../../models/leaderboard.model';
import {
  BUTTON_CLASSES,
  CONFIRMATION_MESSAGES,
  ICONS,
} from '../../shared/constants/constants';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  games: Game[] | undefined;
  selectedGame: Game | undefined;
  currentUser: User | null = null;
  currentUserStats: UserStats | null = null;
  deleteLoading: boolean = false;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private gameService: GameService,
    private leaderboardService: LeaderboardService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.selectedUser;
    this.gameService.getAllGames().subscribe({
      next: (data: GameResponse) => {
        this.games = data.games ?? undefined;
        if (data.games && data.games.length > 0) {
          this.selectedGame = data.games[0];
          this.onGameSelect();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showError(error.error.message);
      },
    });
  }

  onGameSelect(): void {
    this.leaderboardService
      .getUserGameStats(this.currentUser?.user_id!, this.selectedGame?.game_id!)
      .subscribe({
        next: (data: UserStatsResponse) => {
          this.currentUserStats = data.stats;
        },
        error: (error: HttpErrorResponse) => {
          this.toastService.showError(error.error.message);
        },
      });
  }

  getWinRatio(): string {
    const wins = this.currentUserStats?.wins ?? 0;
    const losses = this.currentUserStats?.losses ?? 0;
    const total = wins + losses;
    return total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0%';
  }

  getPlayTimePerDay(): string {
    const wins = this.currentUserStats?.wins ?? 0;
    const losses = this.currentUserStats?.losses ?? 0;
    const total = wins + losses;

    if (total == 0) {
      return '0';
    }

    // Get days since account creation
    const createdAt = this.currentUserStats?.created_at!;
    const today = new Date();
    // Calculate difference in milliseconds without ts-ignore
    const diffTime = Math.abs(today.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate total minutes played (20 mins per game)
    const totalMinutesPlayed = total * 20;

    // Calculate average minutes per day
    const averageMinutesPerDay =
      diffDays > 0 ? totalMinutesPlayed / diffDays : 0;

    // Round to 1 decimal place and return as string
    return averageMinutesPerDay.toFixed(1) + 'min';
  }

  deleteUser(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: CONFIRMATION_MESSAGES.DELETE_USER_MESSAGE,
      header: CONFIRMATION_MESSAGES.DELETE_USER_HEADER,
      icon: ICONS.INFO,
      acceptButtonStyleClass: BUTTON_CLASSES.ACCEPT,
      rejectButtonStyleClass: BUTTON_CLASSES.REJECT,
      acceptIcon: ICONS.NONE,
      rejectIcon: ICONS.NONE,
      accept: (): void => {
        this.deleteLoading = true;
        this.userService.deleteUser(this.currentUser?.user_id!).subscribe({
          next: (data: { code: number; message: string }) => {
            this.deleteLoading = false;
            this.router.navigate(['users']);
            this.toastService.showSuccess(data.message);
            this.deleteLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            this.toastService.showError(error.error.message);
            this.deleteLoading = false;
            this.triggerBack();
          },
        });
      },
    });
  }

  triggerBack() {
    this.router.navigate(['users']);
  }
}
