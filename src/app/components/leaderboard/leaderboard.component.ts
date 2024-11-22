import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { GameService } from '../../services/game-service/game.service';
import { LeaderboardService } from '../../services/leaderboard-service/leaderboard.service';
import { Game, GameResponse } from '../../models/game.model';
import {
  LeaderboardDTO,
  LeaderboardResponse,
} from '../../models/leaderboard.model';

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
    private leaderboardService: LeaderboardService
  ) {}

  ngOnInit(): void {
    this.gameService.getAllGames().subscribe({
      next: (data: GameResponse): void => {
        console.log(data);
        this.games = data.games ?? undefined;
        if (data.games?.[0]) {
          this.selectedGame = data.games[0];
          this.onGameSelect();
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      },
    });
  }

  onGameSelect(): void {
    console.log(this.selectedGame);
    this.leaderboardService
      .getGameLeaderboard(this.selectedGame?.game_id!)
      .subscribe({
        next: (data: LeaderboardResponse): void => {
          console.log(data);
          this.leaderboard = data.leaderboard;
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
        },
      });
  }
}
