import { GameState, Player, Room } from '../types/game.js';
import { createRoom, getRoom, addPlayerToRoom } from './roomManager.js';
import type { WSContext } from '../ws/wsServer.js';
import { BroadcastType, BroadcastMessage } from '../types/ws.js';
import { clients } from '../ws/wsServer.js';

const WIN_SCORE = 5;

export function joinGame(ctx: WSContext, name: string, roomId?: string) {
  const id = roomId ?? crypto.randomUUID();

  let room = getRoom(id);
  if (!room) room = createRoom(id);

  addPlayerToRoom(room, ctx.playerId, name);
  ctx.roomId = id;

  ctx.socket.send(
    JSON.stringify({
      type: BroadcastType.JOINED,
      payload: { roomId: id, playerId: ctx.playerId },
    })
  );

  if (room.state === GameState.READY) {
    startGame(room);
  }
}

function startGame(room: Room) {
  room.state = GameState.COUNTDOWN;

  broadcast(room, {
    type: BroadcastType.GAME_STATE,
    payload: { state: room.state },
  });

  setTimeout(() => startRound(room), 3000);
}

function startRound(room: Room) {
  room.round += 1;
  room.state = GameState.PROMPT;

  room.promptStartTime = Date.now();

  room.players.forEach((p: Player) => {
    p.reacted = false;
    p.reactionTime = undefined;
  });

  broadcast(room, {
    type: BroadcastType.PROMPT,
    payload: { round: room.round, prompt: { type: 'CLICK_NOW' } },
  });
}

export function handlePlayerAction(ctx: WSContext) {
  if (!ctx.roomId) return;
  const room = getRoom(ctx.roomId);
  if (!room || room.state !== GameState.PROMPT) return;

  const player = room.players.find((p) => p.playerId === ctx.playerId);
  if (!player || player.reacted) return;

  player.reacted = true;
  player.reactionTime = Date.now() - room.promptStartTime!;

  if (room.players.every((p) => p.reacted)) {
    finishRound(room);
  }
}

function finishRound(room: Room) {
  room.state = GameState.RESULT;

  const sorted: Player[] = [...room.players].sort(
    (a, b) => (a.reactionTime ?? 9999) - (b.reactionTime ?? 9999)
  );

  const winner = sorted[0];
  winner.score += 1;

  broadcast(room, {
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
  room.state = GameState.FINISHED;

  broadcast(room, {
    type: BroadcastType.GAME_OVER,
    payload: { winnerPlayerId: winnerId },
  });
}

function broadcast(room: Room, message: BroadcastMessage) {
  const data = JSON.stringify(message);

  room.players.forEach((p) => {
    // you’ll map playerId -> socket later
    // keep simple for now
  });
}
