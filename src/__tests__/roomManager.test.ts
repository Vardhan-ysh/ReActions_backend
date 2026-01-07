import { describe, it, expect } from 'vitest';
import { createRoom, addPlayerToRoom } from '../game/roomManager.js';

describe('roomManager', () => {
  it('creates a room in WAITING state', () => {
    const room = createRoom('room-1');

    expect(room.roomId).toBe('room-1');
    expect(room.players.length).toBe(0);
    expect(room.state).toBe('WAITING');
  });

  it('moves room to READY when two players join', () => {
    const room = createRoom('room-2');

    addPlayerToRoom(room, 'p1', 'Alice');
    expect(room.state).toBe('WAITING');

    addPlayerToRoom(room, 'p2', 'Bob');
    expect(room.state).toBe('READY');
    expect(room.players.length).toBe(2);
  });

  it('does not allow more than two players', () => {
    const room = createRoom('room-3');

    addPlayerToRoom(room, 'p1', 'A');
    addPlayerToRoom(room, 'p2', 'B');
    addPlayerToRoom(room, 'p3', 'C');

    expect(room.players.length).toBe(2);
  });
});
