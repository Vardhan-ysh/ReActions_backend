import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoomAndJoin } from '../services/roomService.js';
import { redis } from './__mocks__/redisClient.js';

vi.mock('../redis/redisClient', async () => {
  const mod = await import('./__mocks__/redisClient.js');
  return mod;
});

function mockConnection(playerId = 'p1') {
  return {
    playerId,
    socket: {
      send: vi.fn(),
    },
  } as any;
}

describe('roomService', () => {
  beforeEach(() => {
    redis.clear();
  });

  it('creates a room and assigns a 4-digit code', async () => {
    const conn = mockConnection();

    await createRoomAndJoin(conn, 'Alice');

    expect(conn.socket.send).toHaveBeenCalled();

    const sent = JSON.parse(conn.socket.send.mock.calls[0][0]);
    expect(sent.type).toBe('ROOM_CREATED');
    expect(sent.payload.roomCode).toMatch(/^\d{4}$/);
  });
});
