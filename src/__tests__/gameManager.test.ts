import { describe, it, expect } from 'vitest';
import { createRoom, addPlayerToRoom } from '../game/roomManager.js';
import { startGameIfReady } from '../game/gameManager.js';
import { vi } from 'vitest';

vi.mock('../redis/redisClient.js', async () => {
  const mod = await import('./__mocks__/redisClient.js');
  return mod;
});

describe('gameManager', () => {
  it('starts game when room is READY', () => {
    const room = createRoom('room-1');

    addPlayerToRoom(room, 'p1', 'Alice');
    addPlayerToRoom(room, 'p2', 'Bob');

    expect(room.state).toBe('READY');

    startGameIfReady(room);

    expect(room.state).toBe('COUNTDOWN');
  });

  it('does not start game if room is not READY', () => {
    const room = createRoom('room-2');

    addPlayerToRoom(room, 'p1', 'Alice');

    startGameIfReady(room);

    expect(room.state).toBe('WAITING');
  });
});
