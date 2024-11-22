import { HomeComponent } from './home.component';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { GameService } from '../../services/game-service/game.service';
import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsersResponse } from '../../models/user.models';
import { FormType, Gender, Role } from '../../models/models';
import { NavbarComponent } from '../navbar/navbar.component';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FallbackComponent } from '../fallback/fallback.component';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { Game, GameResponse } from '../../models/game.model';
import { of } from 'rxjs';
import { CONFIRMATION_MESSAGES } from '../../shared/constants/constants';

describe('Home', async () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let routerSpy: jasmine.SpyObj<Router>;

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

  const mockGameResponse: GameResponse = {
    code: 200,
    message: 'test',
    games: [
      {
        game_id: '1',
        game_name: 'test-game',
        image_url: 'test-url',
        min_players: 2,
        max_players: 4,
        instances: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    // create all the spies
    gameServiceSpy = jasmine.createSpyObj(
      'GameService',
      ['getAllGames', 'deleteGame', 'addGame', 'updateGame'],
      {
        selectedGame$: signal(null),
      }
    );
    confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', [
      'confirm',
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showInfo',
      'showSuccess',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      role$: signal(Role.user),
      loggedIn$: signal(true),
      user$: signal(mockUsersResponse.users[0]),
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getProfile']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent, NavbarComponent, FallbackComponent],
      imports: [
        HttpClientModule,
        ConfirmDialogModule,
        DialogModule,
        InputNumberModule,
        InputGroupModule,
        InputSwitchModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
        { provide: GameService, useValue: gameServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    gameServiceSpy.getAllGames.and.returnValue(of(mockGameResponse));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should navigate to the game page if a game is selected and update the selected game', fakeAsync(() => {
    component.onGameSelect(mockGameResponse.games![0]);
    expect(gameServiceSpy.selectedGame$()).toEqual(mockGameResponse.games![0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
  }));

  it('should show a toast message stating the game is currently disabled', fakeAsync(() => {
    const game: Game = { ...mockGameResponse.games![0], is_active: false };
    component.onGameSelect(game);
    expect(toastServiceSpy.showInfo).toHaveBeenCalledWith(
      'Game is currently disabled!'
    );
  }));

  it('should delete the game if game delete icon is clicked and confirmed', fakeAsync(() => {
    const testEvent = jasmine.createSpyObj('Event', [
      'preventDefault',
      'stopPropagation',
    ]);
    const game = mockGameResponse.games![0];

    // Set up confirmation service to trigger accept callback
    confirmationServiceSpy.confirm.and.callFake(
      (confirmation: Confirmation) => {
        if (confirmation.accept) {
          return confirmation.accept();
        }
      }
    );
    // @ts-ignore
    gameServiceSpy.deleteGame.and.returnValue(of({ status: 200 }));
    component.onGameDelete(testEvent, game.game_id);

    tick();

    expect(component.games.length).toEqual(0);
    expect(toastServiceSpy.showSuccess).toHaveBeenCalledWith(
      'Game Deleted Successfully'
    );
  }));

  it('should update the form when a file a uploaded and be cleared when on clear is called', fakeAsync(() => {
    // Create a mock file
    const mockFile = new File([''], 'test-image.jpg', { type: 'image/jpeg' });

    // Create mock event object similar to what FileUpload component provides
    const mockEvent = {
      currentFiles: [mockFile],
    };

    // Call the method
    component.onFileSelect(mockEvent);

    // Assertions
    expect(component.selectedFileName).toBe('test-image.jpg');
    expect(component.gameForm.get('game_image')?.value).toBe(mockFile);
    expect(component.gameForm.get('game_image')?.touched).toBeTrue();

    component.onFileClear();
    tick();
    // Assertions
    expect(component.selectedFileName).toBe('');
    expect(component.gameForm.get('game_image')?.value).toBeNull();
    expect(component.gameForm.get('game_image')?.touched).toBeTrue();
  }));

  it('should setup form for editing and populate with game data', () => {
    // Create mock event
    const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

    const mockGame = mockGameResponse.games![0];

    // Spy on form methods
    spyOn(component.gameForm, 'patchValue').and.callThrough();
    spyOn(component.gameForm.controls.minPlayers, 'disable').and.callThrough();
    spyOn(component.gameForm.controls.maxPlayers, 'disable').and.callThrough();

    // Call method
    component.onGameEdit(mockEvent, mockGame);

    // Verify event propagation was stopped
    expect(mockEvent.stopPropagation).toHaveBeenCalled();

    // Verify component properties were set
    expect(component.selectedGame).toBe(mockGame);
    expect(component.formType).toBe(FormType.edit);
    expect(component.header).toBe(CONFIRMATION_MESSAGES.EDIT_GAME_HEADER);
    expect(component.label).toBe(CONFIRMATION_MESSAGES.EDIT_GAME_LABEL);
    expect(component.visible).toBeTrue();

    // Verify form was populated
    expect(component.gameForm.patchValue).toHaveBeenCalledWith({
      gameName: mockGame.game_name,
      maxPlayers: mockGame.max_players,
      minPlayers: mockGame.min_players,
      instances: mockGame.instances,
      isActive: mockGame.is_active,
    });

    // Verify players controls were disabled
    expect(component.gameForm.controls.minPlayers.disable).toHaveBeenCalled();
    expect(component.gameForm.controls.maxPlayers.disable).toHaveBeenCalled();
  });

  it('should setup form for adding new game', () => {
    // Spy on form methods
    spyOn(component.gameForm, 'reset').and.callThrough();

    // Call method
    component.onAddGame();

    // Verify component properties were set
    expect(component.formType).toBe(FormType.add);
    expect(component.selectedGame).toBeNull();
    expect(component.header).toBe(CONFIRMATION_MESSAGES.ADD_GAME_HEADER);
    expect(component.label).toBe(CONFIRMATION_MESSAGES.ADD_GAME_LABEL);
    expect(component.visible).toBeTrue();

    // Verify form was reset
    expect(component.gameForm.reset).toHaveBeenCalled();
  });

  it('should reset form and clear selection', () => {
    // Setup initial state
    component.visible = true;
    const mockGame = mockGameResponse.games![0];
    component.selectedFileName = 'test.jpg';
    component.selectedGame = mockGame;

    // Spy on form reset
    spyOn(component.gameForm, 'reset').and.callThrough();

    // Call method
    component.cancelEdit();

    // Verify form was reset
    expect(component.gameForm.reset).toHaveBeenCalled();

    // Verify component state was reset
    expect(component.visible).toBeFalse();
    expect(component.selectedFileName).toBe('');
    expect(component.selectedGame).toBeNull();
  });

  it('should reset form even if no file or game was selected', () => {
    // Setup initial state with no selections
    component.visible = true;
    component.selectedFileName = '';
    component.selectedGame = null;

    // Spy on form reset
    spyOn(component.gameForm, 'reset').and.callThrough();

    // Call method
    component.cancelEdit();

    // Verify form was reset
    expect(component.gameForm.reset).toHaveBeenCalled();
    expect(component.visible).toBeFalse();
  });

  it('should send an update request to update the selected game with form details only when form is vailid', fakeAsync(() => {
    component.gameForm.setValue({
      gameName: 'Table-tennis',
      minPlayers: 2,
      maxPlayers: 4,
      instances: 1,
      isActive: true,
      game_image: new File([''], 'test-image.jpg', { type: 'image/jpeg' }),
    });
    component.formType = FormType.add;

    gameServiceSpy.addGame.and.returnValue(
      // @ts-ignore
      of({ code: 200, body: { message: 'success' } })
    );

    component.saveGameDetails();
    tick();

    expect(toastServiceSpy.showSuccess).toHaveBeenCalledOnceWith('success');
    expect(component.visible).toBe(false);
  }));

  it('should filter games array based on the searched game', fakeAsync(() => {
    component.searchedGame = '';

    component.filterGames();

    expect(component.filteredGames).toEqual(component.games);

    component.searchedGame = 'asdkf';

    component.filterGames();

    expect(component.filteredGames).toEqual([]);
  }));
});
