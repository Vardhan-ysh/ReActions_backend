import type { Connection } from './connectionRegistry.js';
import { joinGame, handlePlayerAction } from '../game/gameManager.js';

import { BroadcastType } from '../types/ws.js';

interface WSMessage {
  type: string;
  payload?: any;
}

export function handleMessage(connection: Connection, raw: string) {
  let message: WSMessage;

  try {
    message = JSON.parse(raw);
  } catch {
    return;
  }

  switch (message.type) {
    case 'TEST':
      connection.socket.send(JSON.stringify({ type: BroadcastType.CONNECTED }));
      break;

    case 'JOIN_GAME':
      joinGame(connection, message.payload.name, message.payload.roomId);
      console.log('JOIN_GAME from', connection.playerId);
      break;

    case 'CHAT_MESSAGE':
      // chatHandler later
      break;

    case 'PLAYER_ACTION':
      handlePlayerAction(connection);
      break;

    default:
      console.warn('Unknown message', message.type);
  }
}
