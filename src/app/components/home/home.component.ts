import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { GameService } from '../../services/game-service/game.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { UserService } from '../../services/user-service/user.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { FormType, Role } from '../../models/models';
import { Game, GameResponse } from '../../models/game.model';
import {
  BUTTON_CLASSES,
  CONFIRMATION_MESSAGES,
  ICONS,
} from '../../shared/constants/constants';

import { ConfirmationService } from 'primeng/api';
import { CustomValidators } from '../../shared/custom-validator/custom-validators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  games: Game[] = [];
  visible: boolean = false;
  selectedGame: Game | null = null;
  formType: FormType | null = null;
  header = '';
  label = '';
  selectedFileName: string = '';
  filteredGames: Game[] = [];
  searchedGame: string = '';

  role$ = computed(() => this.authService.role$());
  isAdmin$ = computed(() => this.role$() === Role.admin);

  constructor(
    private gameService: GameService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.gameService.getAllGames().subscribe({
      next: (data: GameResponse) => {
        if(data.games){
          this.games = data.games;
          this.filteredGames = data.games;
        }
      },
      error: (error) => {
        this.toastService.showError(error.error.message);
      },
    });

    this.authService.user$() ||
      this.userService.getProfile().subscribe({
        next: (data) => {
          this.authService.user$.set(data.user);
        },
      });
  }

  gameForm = new FormGroup({
    gameName: new FormControl<string>(''),
    minPlayers: new FormControl<number | null>(null),
    maxPlayers: new FormControl<number | null>(null),
    instances: new FormControl<number | null>(null),
    isActive: new FormControl<boolean>(true),
    game_image: new FormControl<File | null>(null),
  });

  private setValidators(isAdd: boolean): void {
    const controls = this.gameForm.controls;

    if (isAdd) {
      this.gameForm.controls.maxPlayers.enable();
      this.gameForm.controls.minPlayers.enable();
      // add validators while adding a new game
      controls.gameName.setValidators([Validators.required]);
      controls.minPlayers.setValidators([
        Validators.required,
        Validators.min(1),
      ]);
      controls.maxPlayers.setValidators([
        Validators.required,
        Validators.min(1),
        CustomValidators.maxPlayersValidator("minPlayers")
      ]);
      controls.instances.setValidators([
        Validators.required,
        Validators.min(1),
      ]);
      controls.game_image.setValidators([Validators.required]);
    } else {
      // Remove validators for edit mode
      controls.gameName.clearValidators();
      controls.minPlayers.clearValidators();
      controls.maxPlayers.clearValidators();
      controls.instances.clearValidators();
      controls.game_image.clearValidators();
    }

    // Update validity
    Object.values(controls).forEach((control) =>
      control.updateValueAndValidity()
    );
  }

  onGameSelect(game: Game): void {
    if (game.is_active) {
      this.gameService.selectedGame$.set(game);
      this.router.navigate(['game']);
    } else {
      this.toastService.showInfo('Game is currently disabled!');
    }
  }

  onGameDelete(event: Event, gameId: string): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: CONFIRMATION_MESSAGES.DELETE_GAME_MESSAGE,
      header: CONFIRMATION_MESSAGES.DELETE_GAME_HEADER,
      icon: ICONS.INFO,
      acceptButtonStyleClass: BUTTON_CLASSES.ACCEPT,
      rejectButtonStyleClass: BUTTON_CLASSES.REJECT,
      acceptIcon: ICONS.NONE,
      rejectIcon: ICONS.NONE,
      accept: (): void => {
        this.gameService.deleteGame(gameId).subscribe({
          next: (data) => {
            if (data.status === 200) {
              this.toastService.showSuccess('Game Deleted Successfully');
              this.games = this.games.filter((game: Game)=> game.game_id !== gameId);
            }
          },
          error: (error: HttpErrorResponse) => {
            this.toastService.showError(error.error.message);
          },
        });
      },
    });
  }

  onFileSelect(event: any): void {
    if (event.currentFiles && event.currentFiles[0]) {
      const file = event.currentFiles[0];
      this.selectedFileName = file.name;
      this.gameForm.patchValue({
        game_image: file,
      });
      this.gameForm.get('game_image')?.markAsTouched();
    }
  }

  onFileClear(): void {
    this.selectedFileName = '';
    this.gameForm.patchValue({
      game_image: null,
    });
    this.gameForm.get('game_image')?.markAsTouched();
  }

  onGameEdit(event: Event, game: Game) {
    event.stopPropagation();
    this.selectedGame = game;
    this.formType = FormType.edit;
    this.header = CONFIRMATION_MESSAGES.EDIT_GAME_HEADER;
    this.label = CONFIRMATION_MESSAGES.EDIT_GAME_LABEL;

    this.gameForm.patchValue({
      gameName: game.game_name,
      maxPlayers: game.max_players,
      minPlayers: game.min_players,
      instances: game.instances,
      isActive: game.is_active,
    });

    this.gameForm.controls.minPlayers.disable();
    this.gameForm.controls.maxPlayers.disable();
    this.setValidators(false);
    this.visible = true;
  }

  onAddGame(): void {
    this.formType = FormType.add;
    this.selectedGame = null;
    this.gameForm.reset();
    this.header = CONFIRMATION_MESSAGES.ADD_GAME_HEADER;
    this.label = CONFIRMATION_MESSAGES.ADD_GAME_LABEL;

    this.setValidators(true);
    this.visible = true;
  }

  cancelEdit(): void {
    this.gameForm.reset();
    this.gameForm.controls.minPlayers.enable();
    this.gameForm.controls.maxPlayers.enable();
    this.visible = false;
    this.selectedFileName = '';
    this.selectedGame = null;
  }

  saveGameDetails(): void {
    if (this.gameForm.valid) {
      const formData = new FormData();
      const formValue = this.gameForm.value;

      formData.append('name', formValue.gameName || '');
      formData.append(
        'min_players',
        formValue.minPlayers?.toString() ||
          this.selectedGame?.min_players.toString() ||
          ''
      );
      formData.append(
        'max_players',
        formValue.maxPlayers?.toString() ||
          this.selectedGame?.max_players.toString() ||
          ''
      );
      formData.append('instances', formValue.instances?.toString() || '');
      formData.append('isActive', formValue.isActive?.toString() || 'true');

      if (this.formType === FormType.add && formValue.game_image) {
        formData.append('image', formValue.game_image);
      }

      const request$ =
        this.formType === FormType.add
          ? this.gameService.addGame(formData)
          : this.gameService.updateGame(
              this.selectedGame?.game_id || '',
              formData
            );

      request$.subscribe({
        next: (response): void => {
          this.toastService.showSuccess(response.body.message);
          this.visible = false;
          this.ngOnInit();
        },
        error: (error: HttpErrorResponse): void => {
          this.toastService.showError(error.error.message);
        },
      });
    }
  }

  filterGames(): void {
    if (!this.searchedGame.trim()) {
      // If search is empty, show all games
        this.filteredGames = [...this.games];
      return;
    }

    const searchTerm: string = this.searchedGame.toLowerCase().trim();
    this.filteredGames = this.filteredGames.filter((game: Game): boolean =>
      game.game_name.toLowerCase().includes(searchTerm)
    );
  }
}
