import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game, GameResponse } from '../../models/game.model';
import { BASE_URL } from '../../shared/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  selectedGame$ = signal<Game | null>(null);
  constructor(private httpClient: HttpClient) {}

  getAllGames(): Observable<GameResponse> {
    return this.httpClient.get<GameResponse>(`${BASE_URL}/games`);
  }

  deleteGame(gameId: string): Observable<HttpResponse<any>> {
    return this.httpClient.delete(`${BASE_URL}/games/${gameId}`, {
      observe: 'response',
    });
  }

  // Add new game
  addGame(gameData: FormData): Observable<HttpResponse<any>> {
    return this.httpClient.post<{ code: number; message: string }>(
      `${BASE_URL}/games`,
      gameData,
      {
        observe: 'response',
      }
    );
  }

  // Update existing game
  updateGame(
    gameId: string,
    gameData: FormData
  ): Observable<HttpResponse<any>> {
    return this.httpClient.put<any>(`${BASE_URL}/games/${gameId}`, gameData, {
      observe: 'response',
    });
  }
}
