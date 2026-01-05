import type { WebSocket } from 'ws';

export interface Connection {
  playerId: string;
  socket: WebSocket;
  roomId?: string;
}

const connections = new Map<string, Connection>();

export function addConnection(connection: Connection) {
  connections.set(connection.playerId, connection);
}

export function removeConnection(playerId: string) {
  connections.delete(playerId);
}

export function getConnection(playerId: string) {
  return connections.get(playerId);
}

export function setRoom(playerId: string, roomId: string) {
  const conn = connections.get(playerId);
  if (conn) conn.roomId = roomId;
}
