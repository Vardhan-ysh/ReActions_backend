export type GameState =
  | 'WAITING'
  | 'READY'
  | 'COUNTDOWN'
  | 'PROMPT'
  | 'RESULT'
  | 'FINISHED';

export enum PromptType {
  CLICK_HERE = 'CLICK_HERE',
  PRESS_KEY = 'PRESS_KEY',
  TYPING = 'TYPING',
}

export interface Player {
  playerId: string;
  name: string;
  score: number;
  reacted: boolean;
  reactionTime?: number;
}

export interface Room {
  roomId: string;
  players: Player[];
  state: GameState;
  round: number;
  promptStartTime?: number;
}
