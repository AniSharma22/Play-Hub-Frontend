import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  LeaderboardResponse,
  UserStatsResponse,
} from '../../models/leaderboard.model';

import { Observable, tap } from 'rxjs';
import { BASE_URL } from '../../shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private httpClient: HttpClient) {}

  getGameLeaderboard(gameId: string): Observable<LeaderboardResponse> {
    return this.httpClient.get<LeaderboardResponse>(
      `${BASE_URL}/leaderboards/games/${gameId}`
    );
  }

  getUserGameStats(
    userId: string,
    gameId: string
  ): Observable<UserStatsResponse> {
    return this.httpClient
      .post<UserStatsResponse>(
        `${BASE_URL}/leaderboards/user-stats`,
        {
          game_id: gameId,
          user_id: userId,
        }
      )
      .pipe(
        tap((response: UserStatsResponse) => {
          if (response.stats) {
            response.stats.created_at = new Date(
              response.stats.created_at
            );
          }
        })
      );
  }
}
