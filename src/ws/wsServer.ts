import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import { handleMessage } from './wsHandler.js';
import { v4 as uuid } from 'uuid';

export interface WSContext {
  socket: WebSocket;
  playerId: string;
  roomId?: string;
}

export const clients = new Map<WebSocket, WSContext>();

export function initWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket) => {
    const context: WSContext = {
      socket,
      playerId: uuid(),
    };

    clients.set(socket, context);

    socket.on('message', (data) => {
      handleMessage(context, data.toString());
    });

    socket.on('close', () => {
      clients.delete(socket);
      // later: cleanup room, notify opponent
    });
  });
}
