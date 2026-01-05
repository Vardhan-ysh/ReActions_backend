import { Room, Player, GameState } from '../types/game.js';

const rooms = new Map<string, Room>();

export function createRoom(roomId: string): Room {
  const room: Room = {
    roomId,
    players: [],
    state: 'WAITING',
    round: 0,
  };

  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function addPlayerToRoom(room: Room, playerId: string, name: string) {
  if (room.players.length >= 2) return;

  const player: Player = {
    playerId,
    name,
    score: 0,
    reacted: false,
  };

  room.players.push(player);

  if (room.players.length === 2) {
    room.state = 'READY';
  }
}
