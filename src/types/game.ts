export enum GameState {
  WAITING = 'WAITING',
  READY = 'READY',
  COUNTDOWN = 'COUNTDOWN',
  PROMPT = 'PROMPT',
  RESULT = 'RESULT',
  FINISHED = 'FINISHED',
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
