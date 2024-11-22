import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { BASE_URL } from '../../shared/constants/constants';
import { Game, GameResponse } from '../../models/game.model';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameService]
    });

    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllGames', () => {
    it('should fetch all games', () => {
      const mockResponse: GameResponse = {
        code: 200,
        message: 'test',
        games: [
          {
            game_id: '1',
            game_name: 'Test Game',
            image_url: 'test',
            max_players: 4,
            min_players: 2,
            instances: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };

      service.getAllGames().subscribe(response => {
        expect(response.games?.length).toBe(1);
        // @ts-ignore
        expect(response.games[0]).toBe(mockResponse.games[0]);
      });

      const req = httpMock.expectOne(`${BASE_URL}/games`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('deleteGame', () => {
    it('should delete a game successfully', () => {
      service.deleteGame('game123').subscribe(response => {
        expect(response.status).toBe(200);
      });

      const req = httpMock.expectOne(`${BASE_URL}/games/game123`);
      expect(req.request.method).toBe('DELETE');
      req.flush({}, { status: 200, statusText: 'OK' });
    });
  });

  describe('addGame', () => {
    it('should add a new game', () => {
      const formData = new FormData();
      formData.append('name', 'New Game');

      service.addGame(formData).subscribe(response => {
        expect(response.status).toBe(201);
      });

      const req = httpMock.expectOne(`${BASE_URL}/games`);
      expect(req.request.method).toBe('POST');
      req.flush({}, { status: 201, statusText: 'Created' });
    });
  });

  describe('updateGame', () => {
    it('should update an existing game', () => {
      const formData = new FormData();
      formData.append('name', 'Updated Game');

      service.updateGame('game123', formData).subscribe(response => {
        expect(response.status).toBe(200);
      });

      const req = httpMock.expectOne(`${BASE_URL}/games/game123`);
      expect(req.request.method).toBe('PUT');
      req.flush({}, { status: 200, statusText: 'OK' });
    });
  });
});
