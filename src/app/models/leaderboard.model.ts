
export type UserStats = {
  score_id: string;
  user_id: string;
  game_id: string;
  wins: number;
  losses: number;
  score: number;
  created_at: Date;
};

export type UserStatsResponse = {
  code: number;
  message: string;
  stats: UserStats;
};

export type LeaderboardResponse = {
  code: number;
  message: string;
  leaderboard: LeaderboardDTO[];
};

export type LeaderboardDTO = {
  user_name: string;
  total_games: number;
  wins: number;
  losses: number;
  score: number;
};
