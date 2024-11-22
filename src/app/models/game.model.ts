export type Game = {
  game_id: string;
  game_name: string;
  image_url: string;
  min_players: number;
  max_players: number;
  instances: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type GameResponse = {
  code: number;
  games: Game[] | null;
  message: string;
};
