import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaderboardComponent } from './leaderboard.component';
import { GameService } from '../../services/game-service/game.service';
import { LeaderboardService } from '../../services/leaderboard-service/leaderboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GameResponse } from '../../models/game.model';
import { LeaderboardResponse } from '../../models/leaderboard.model';
import { ToastService } from '../../services/toast-service/toast.service';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let leaderboardServiceSpy: jasmine.SpyObj<LeaderboardService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  // Mock data
  const mockGames: GameResponse = {
    code: 200,
    message: 'success',
    games: [
      {
        game_id: '1',
        game_name: 'Test Game 1',
        image_url: 'test-url-1',
        min_players: 0,
        max_players: 0,
        instances: 0,
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        game_id: '2',
        game_name: 'Test Game 2',
        image_url: 'test-url-2',
        min_players: 0,
        max_players: 0,
        instances: 0,
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };

  const mockLeaderboard: LeaderboardResponse = {
    code: 200,
    message: 'success',
    leaderboard: [
      {
        user_name: 'test-user-1',
        total_games: 20,
        wins: 10,
        losses: 10,
        score: 2,
      },
      {
        user_name: 'test-user-2',
        total_games: 20,
        wins: 10,
        losses: 10,
        score: 2,
      },
    ],
  };

  beforeEach(async () => {
    gameServiceSpy = jasmine.createSpyObj('GameService', ['getAllGames']);
    leaderboardServiceSpy = jasmine.createSpyObj('LeaderboardService', [
      'getGameLeaderboard',
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [LeaderboardComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: LeaderboardService, useValue: leaderboardServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      // Setup default successful responses
      gameServiceSpy.getAllGames.and.returnValue(of(mockGames));
      leaderboardServiceSpy.getGameLeaderboard.and.returnValue(of(mockLeaderboard));
    });

    it('should fetch games and set first game as selected on successful response', () => {
      fixture.detectChanges();

      expect(component.games).toEqual(mockGames.games!);
      expect(component.selectedGame).toEqual(mockGames.games![0]);
      expect(leaderboardServiceSpy.getGameLeaderboard).toHaveBeenCalledWith(
        mockGames.games![0].game_id
      );
      expect(component.leaderboard).toEqual(mockLeaderboard.leaderboard);
    });

    it('should handle empty games array', () => {
      const emptyGamesResponse: GameResponse = {
        code: 200,
        message: 'success',
        games: []
      };
      gameServiceSpy.getAllGames.and.returnValue(of(emptyGamesResponse));

      fixture.detectChanges();

      expect(component.games).toEqual([]);
      expect(component.selectedGame).toBeUndefined();
      expect(leaderboardServiceSpy.getGameLeaderboard).not.toHaveBeenCalled();
    });

    it('should handle null games response', () => {
      const nullGamesResponse: GameResponse = {
        code: 200,
        message: 'success',
        games: null
      };
      gameServiceSpy.getAllGames.and.returnValue(of(nullGamesResponse));

      fixture.detectChanges();

      expect(component.games).toBeUndefined();
      expect(component.selectedGame).toBeUndefined();
      expect(leaderboardServiceSpy.getGameLeaderboard).not.toHaveBeenCalled();
    });

    it('should handle error in getting games', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Failed to fetch games' },
        status: 404,
        statusText: 'Not Found',
      });
      gameServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));

      fixture.detectChanges();

      expect(toastServiceSpy.showError).toHaveBeenCalledWith('Failed to fetch games');
      expect(component.games).toBeUndefined();
      expect(component.selectedGame).toBeUndefined();
      expect(leaderboardServiceSpy.getGameLeaderboard).not.toHaveBeenCalled();
    });
  });

  describe('onGameSelect', () => {
    beforeEach(() => {
      // Set up successful response by default
      leaderboardServiceSpy.getGameLeaderboard.and.returnValue(of(mockLeaderboard));
    });

    it('should fetch leaderboard for selected game on successful response', () => {
      component.selectedGame = mockGames.games![0];
      component.onGameSelect();

      expect(leaderboardServiceSpy.getGameLeaderboard).toHaveBeenCalledWith(
        mockGames.games![0].game_id
      );
      expect(component.leaderboard).toEqual(mockLeaderboard.leaderboard);
    });

    it('should handle error in getting leaderboard', () => {
      component.selectedGame = mockGames.games![0];
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Failed to fetch leaderboard' },
        status: 404,
        statusText: 'Not Found',
      });
      leaderboardServiceSpy.getGameLeaderboard.and.returnValue(
        throwError(() => errorResponse)
      );

      component.onGameSelect();

      expect(toastServiceSpy.showError).toHaveBeenCalledWith('Failed to fetch leaderboard');
      expect(leaderboardServiceSpy.getGameLeaderboard).toHaveBeenCalledWith(
        mockGames.games![0].game_id
      );
      expect(component.leaderboard).toBeNull();
    });

    it('should not call getGameLeaderboard if no game is selected', () => {
      component.selectedGame = undefined;
      component.onGameSelect();
      expect(leaderboardServiceSpy.getGameLeaderboard).not.toHaveBeenCalled();
    });
  });
});
