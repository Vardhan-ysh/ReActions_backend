import { GameState, PromptType } from './game.js';

export enum BroadcastType {
  CONNECTED = 'CONNECTED',
  JOINED = 'JOINED',
  LEFT = 'LEFT',
  GAME_STATE = 'GAME_STATE',
  PROMPT = 'PROMPT',
  ROUND_RESULT = 'ROUND_RESULT',
  GAME_OVER = 'GAME_OVER',
<<<<<<< HEAD
  ROOM_CREATED = 'ROOM_CREATED',
=======
>>>>>>> 79d5c1d7aca90b367594eeec8bd01b34a26ddb26
}

export interface ConnectedResponse {
  type: BroadcastType.CONNECTED;
}

export interface JoinedResponse {
  type: BroadcastType.JOINED;
  payload: {
    roomId: string;
    playerId: string;
  };
}

export interface GameStateResponse {
  type: BroadcastType.GAME_STATE;
  payload: {
    state: GameState;
  };
}

export interface PromptResponse {
  type: BroadcastType.PROMPT;
  payload: {
    round: number;
    prompt: {
      type: PromptType;
    };
  };
}

export interface RoundResultResponse {
  type: BroadcastType.ROUND_RESULT;
  payload: {
    winnerPlayerId: string;
    scores: { playerId: string; score: number }[];
  };
}

export interface GameOverResponse {
  type: BroadcastType.GAME_OVER;
  payload: {
    winnerPlayerId: string;
  };
}

<<<<<<< HEAD
export interface RoomCreatedResponse {
  type: BroadcastType.ROOM_CREATED;
  payload: {
    roomId: string;
    roomCode: string;
    playerId: string;
  };
}

=======
>>>>>>> 79d5c1d7aca90b367594eeec8bd01b34a26ddb26
export type WebSocketResponse =
  | ConnectedResponse
  | JoinedResponse
  | GameStateResponse
  | PromptResponse
  | RoundResultResponse
<<<<<<< HEAD
  | GameOverResponse
  | RoomCreatedResponse;


=======
  | GameOverResponse;
>>>>>>> 79d5c1d7aca90b367594eeec8bd01b34a26ddb26
