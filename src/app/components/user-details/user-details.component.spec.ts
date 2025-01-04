import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsComponent } from './user-details.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { UserService } from '../../services/user-service/user.service';
import { GameService } from '../../services/game-service/game.service';
import { LeaderboardService } from '../../services/leaderboard-service/leaderboard.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { User } from '../../models/user.models';
import { Gender, Role } from '../../models/models';
import { Game, GameResponse } from '../../models/game.model';
import { UserStats, UserStatsResponse } from '../../models/leaderboard.model';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let leaderboardServiceSpy: jasmine.SpyObj<LeaderboardService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const testUser: User = {
    user_id: '1',
    username: 'test',
    email: 'test',
    password: 'test',
    mobile_number: '8888888888',
    gender: Gender.male,
    role: Role.user,
    image_url: 'string',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const testGame: Game = {
    game_id: '1',
    game_name: 'test-game',
    image_url: 'test-url',
    min_players: 2,
    max_players: 4,
    instances: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const testGameResponse: GameResponse = {
    code: 200,
    message: 'test',
    games: [testGame],
  };

  const testUserStats: UserStats = {
    user_id: '1',
    game_id: '1',
    wins: 10,
    losses: 5,
    score_id: '1',
    score: 12,
    created_at: new Date('2024-01-01'),
  };

  const testUserStatsResponse: UserStatsResponse = {
    code: 200,
    message: 'Success',
    stats: testUserStats,
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      user$: signal(testUser),
    });
    userServiceSpy = jasmine.createSpyObj('UserService', ['deleteUser'], {
      selectedUser: testUser,
    });
    gameServiceSpy = jasmine.createSpyObj('GameService', ['getAllGames']);
    leaderboardServiceSpy = jasmine.createSpyObj('LeaderboardService', ['getUserGameStats']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showError', 'showSuccess']);
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      declarations: [UserDetailsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: GameService, useValue: gameServiceSpy },
        { provide: LeaderboardService, useValue: leaderboardServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    gameServiceSpy.getAllGames.and.returnValue(of(testGameResponse));
    leaderboardServiceSpy.getUserGameStats.and.returnValue(of(testUserStatsResponse));

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with games and user stats', () => {
    expect(component.currentUser).toBe(testUser);
    expect(component.games).toEqual([testGame]);
    expect(component.selectedGame).toBe(testGame);
    expect(component.currentUserStats).toBe(testUserStats);
  });

  it('should handle error when fetching games', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Error fetching games' },
      status: 404,
    });
    gameServiceSpy.getAllGames.and.returnValue(throwError(() => errorResponse));

    component.ngOnInit();

    expect(toastServiceSpy.showError).toHaveBeenCalledWith('Error fetching games');
  });

  it('should handle game selection and fetch user stats', () => {
    component.selectedGame = testGame;
    component.onGameSelect();

    expect(leaderboardServiceSpy.getUserGameStats).toHaveBeenCalledWith(testUser.user_id, testGame.game_id);
    expect(component.currentUserStats).toBe(testUserStats);
  });

  it('should handle error when fetching user stats', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Error fetching stats' },
      status: 404,
    });
    leaderboardServiceSpy.getUserGameStats.and.returnValue(throwError(() => errorResponse));

    component.selectedGame = testGame;
    component.onGameSelect();

    expect(toastServiceSpy.showError).toHaveBeenCalledWith('Error fetching stats');
  });

  it('should calculate win ratio correctly', () => {
    component.currentUserStats = testUserStats;
    expect(component.getWinRatio()).toBe('66.7%');

    component.currentUserStats = { ...testUserStats, wins: 0, losses: 0 };
    expect(component.getWinRatio()).toBe('0%');
  });

  it('should calculate play time per day correctly', () => {
    component.currentUserStats = testUserStats;
    const result = component.getPlayTimePerDay();
    expect(result.endsWith('min')).toBeTruthy();

    component.currentUserStats = { ...testUserStats, wins: 0, losses: 0 };
    expect(component.getPlayTimePerDay()).toBe('0');
  });

  it('should handle user deletion', () => {
    const mockEvent = new Event('click');
    const successResponse = { code: 200, message: 'User deleted' };
    userServiceSpy.deleteUser.and.returnValue(of(successResponse));

    // @ts-ignore
    confirmationServiceSpy.confirm.and.callFake(({ accept }) => accept());

    component.deleteUser(mockEvent);

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(testUser.user_id);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['users']);
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(successResponse.message);
    expect(component.deleteLoading).toBeFalse();
  });

  it('should handle error during user deletion', () => {
    const mockEvent = new Event('click');
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Error deleting user' },
      status: 404,
    });
    userServiceSpy.deleteUser.and.returnValue(throwError(() => errorResponse));

    // @ts-ignore
    confirmationServiceSpy.confirm.and.callFake(({ accept }) => accept());

    component.deleteUser(mockEvent);

    expect(toastServiceSpy.showError).toHaveBeenCalledWith('Error deleting user');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['users']);
    expect(component.deleteLoading).toBeFalse();
  });

  it('should navigate back when triggered', () => {
    component.triggerBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['users']);
  });
});
