export enum BroadcastType {
  JOINED,
  LEFT,
  GAME_STATE,
  PROMPT,
  ROUND_RESULT,
  GAME_OVER,
}

export interface BroadcastMessage {
  type: BroadcastType;
  payload?: any;
}
