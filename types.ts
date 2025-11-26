
export enum Position {
  GK = "KL",
  DEF = "DF",
  MID = "OS",
  FWD = "FV"
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  age: number;
  nationality: string;
  overall: number; // 1-20 scale
  condition: number; // 0-100%
  value: number; // Market value in Euros
  image?: string; // Player photo URL
  club?: string; // For transfer market
  stats: {
    finishing: number;
    passing: number;
    tackling: number;
    pace: number;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  players: Player[];
  tactic: string;
  budget: number;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'MISS' | 'CARD' | 'SUB' | 'COMMENT' | 'WHISTLE' | 'ATTACK' | 'DEFENSE';
  description: string;
  side?: 'home' | 'away' | 'neutral'; 
  teamId?: string;
  coordinate?: { x: number; y: number }; // 0-100 scale for visual engine
}

export interface MatchResult {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  played: boolean;
}

export interface GameState {
  playerTeam: Team | null;
  currentDate: Date;
  view: 'MENU' | 'DASHBOARD' | 'SQUAD' | 'MATCH_PREVIEW' | 'MATCH_LIVE' | 'LEAGUE' | 'FIXTURE' | 'TRANSFER';
  loading: boolean;
  loadingMessage: string;
  matchContext?: MatchResult;
  nextOpponent?: Team;
  transferMarket: Player[]; 
}