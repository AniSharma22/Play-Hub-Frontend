import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { GameService } from '../../services/game-service/game.service';
import { LeaderboardService } from '../../services/leaderboard-service/leaderboard.service';
import { Game, GameResponse } from '../../models/game.model';
import {
  LeaderboardDTO,
  LeaderboardResponse,
} from '../../models/leaderboard.model';
import { ToastService } from '../../services/toast-service/toast.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnInit {
  games: Game[] | undefined;
  selectedGame: Game | undefined;
  leaderboard: LeaderboardDTO[] | null = null;

  constructor(
    private gameService: GameService,
    private leaderboardService: LeaderboardService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.gameService.getAllGames().subscribe({
      next: (data: GameResponse): void => {
        this.games = data.games ?? undefined;
        if (data.games?.[0]) {
          this.selectedGame = data.games[0];
          this.onGameSelect();
        }
      },
      error: (error: HttpErrorResponse): void => {
        this.toastService.showError(error.error.message);
      },
    });
  }

  onGameSelect(): void {
    this.leaderboardService
      .getGameLeaderboard(this.selectedGame?.game_id!)
      .subscribe({
        next: (data: LeaderboardResponse): void => {
          this.leaderboard = data.leaderboard;
        },
        error: (error: HttpErrorResponse): void => {
          this.toastService.showError(error.error.message);
        },
      });
  }
}
