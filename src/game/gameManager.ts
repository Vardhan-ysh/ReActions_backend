import { GameState, Player, Room, PromptType } from '../types/game.js';
import { createRoom, getRoom, addPlayerToRoom } from './roomManager.js';
import { Connection, setRoom } from '../ws/connectionRegistry.js';
import { BroadcastType, WebSocketResponse } from '../types/ws.js';
import { broadcast } from '../ws/wsServer.js';

const WIN_SCORE = 5;

function startGame(room: Room) {
  room.state = 'COUNTDOWN';

  broadcast(room.roomId, {
    type: BroadcastType.GAME_STATE,
    payload: { state: room.state },
  });

  setTimeout(() => startRound(room), 3000);
}

function startRound(room: Room) {
  room.round += 1;
  room.state = 'PROMPT';

  room.promptStartTime = Date.now();

  room.players.forEach((p: Player) => {
    p.reacted = false;
    p.reactionTime = undefined;
  });

  const promptTypes = Object.values(PromptType);
  const randomPromptType =
    promptTypes[Math.floor(Math.random() * promptTypes.length)];

  broadcast(room.roomId, {
    type: BroadcastType.PROMPT,
    payload: { round: room.round, prompt: { type: randomPromptType } },
  });
}

export function handlePlayerAction(connection: Connection) {
  if (!connection.roomId) return;
  const room = getRoom(connection.roomId);
  if (!room || room.state !== 'PROMPT') return;

  const player = room.players.find((p) => p.playerId === connection.playerId);
  if (!player || player.reacted) return;

  player.reacted = true;
  player.reactionTime = Date.now() - room.promptStartTime!;

  if (room.players.every((p) => p.reacted)) {
    finishRound(room);
  }
}

function finishRound(room: Room) {
  room.state = 'RESULT';

  const sorted: Player[] = [...room.players].sort(
    (a, b) => (a.reactionTime ?? 9999) - (b.reactionTime ?? 9999)
  );

  const winner = sorted[0];
  winner.score += 1;

  broadcast(room.roomId, {
    type: BroadcastType.ROUND_RESULT,
    payload: {
      winnerPlayerId: winner.playerId,
      scores: room.players.map((p: Player) => ({
        playerId: p.playerId,
        score: p.score,
      })),
    },
  });

  if (winner.score >= WIN_SCORE) {
    endGame(room, winner.playerId);
  } else {
    setTimeout(() => startRound(room), 2000);
  }
}

function endGame(room: Room, winnerId: string) {
  room.state = 'FINISHED';

  broadcast(room.roomId, {
    type: BroadcastType.GAME_OVER,
    payload: { winnerPlayerId: winnerId },
  });
}

export function startGameIfReady(room: Room) {
  if (room.state === "READY") {
    startGame(room);
  }
}