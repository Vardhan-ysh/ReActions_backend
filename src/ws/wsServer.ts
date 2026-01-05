import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';
import http from 'http';
import {
  addConnection,
  removeConnection,
  getConnection,
  Connection,
} from './connectionRegistry.js';
import { WebSocketResponse } from '../types/ws.js';
import { getRoom } from '../game/roomManager.js';
import { handleMessage } from './wsHandler.js';

export function initWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket) => {
    const playerId = uuid();
    const context: Connection = {
      playerId,
      socket,
    };

    addConnection(context);

    socket.on('message', (data) => {
      handleMessage(context, data.toString());
    });

    socket.on('close', () => {
      removeConnection(playerId);
    });
  });
}

export function broadcast(roomId: string, message: WebSocketResponse) {
  const data = JSON.stringify(message);

  const room = getRoom(roomId);
  if (!room) return;

  room.players.forEach((p) => {
    const connection = getConnection(p.playerId);
    if (!connection) return;
    connection.socket.send(data);
  });
}
