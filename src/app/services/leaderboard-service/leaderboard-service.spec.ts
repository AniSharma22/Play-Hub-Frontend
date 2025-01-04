import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardResponse,
  UserStatsResponse,
  UserStats,
} from '../../models/leaderboard.model';
import { BASE_URL } from '../../shared/constants/constants';

describe('LeaderboardService', () => {
  let leaderboardService: LeaderboardService;
  let httpTestingController: HttpTestingController;

  const mockLeaderboardResponse: LeaderboardResponse = {
    code: 200,
    message: 'Leaderboard retrieved successfully',
    leaderboard: [
      {
        user_name: 'test1',
        total_games: 10,
        wins: 5,
        losses: 5,
        score: 12,
      },
      {
        user_name: 'test2',
        total_games: 11,
        wins: 6,
        losses: 5,
        score: 13,
      },
    ],
  };

  const mockUserStats: UserStats = {
    user_id: '1',
    game_id: 'game123',
    score_id: '1',
    score: 12,
    wins: 7,
    losses: 3,
    created_at: new Date('2023-01-01T00:00:00Z'),
  };

  const mockUserStatsResponse: UserStatsResponse = {
    code: 200,
    message: 'User stats retrieved successfully',
    stats: mockUserStats,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeaderboardService],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    leaderboardService = TestBed.inject(LeaderboardService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(leaderboardService).toBeTruthy();
  });

  describe('getGameLeaderboard', () => {
    it('should fetch leaderboard for a specific game', () => {
      const gameId = 'game123';

      leaderboardService.getGameLeaderboard(gameId).subscribe((response) => {
        expect(response).toEqual(mockLeaderboardResponse);
        expect(response.leaderboard.length).toBe(2);
      });

      const req = httpTestingController.expectOne(
        `${BASE_URL}/leaderboards/games/${gameId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockLeaderboardResponse);
    });
  });

  describe('getUserGameStats', () => {
    it('should fetch user game stats and parse created_at date', () => {
      const userId = '1';
      const gameId = 'game123';

      leaderboardService
        .getUserGameStats(userId, gameId)
        .subscribe((response) => {
          expect(response).toEqual(mockUserStatsResponse);

          // Verify date parsing
          if (response.stats) {
            expect(response.stats.created_at).toBeInstanceOf(Date);
            expect(response.stats.created_at.toISOString()).toBe(
              '2023-01-01T00:00:00.000Z'
            );
          }

          // Verify other stats
          expect(response.stats?.wins).toBe(7);
          expect(response.stats?.losses).toBe(3);
        });

      const req = httpTestingController.expectOne(
        `${BASE_URL}/leaderboards/user-stats`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        game_id: gameId,
        user_id: userId,
      });
      req.flush(mockUserStatsResponse);
    });
  });
});
