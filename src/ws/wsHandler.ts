import type { Connection } from './connectionRegistry.js';
import { handlePlayerAction } from '../game/gameManager.js';
import {
  createRoomAndJoin,
  joinRoomByCode,
  findMatch,
} from '../services/roomService.js';
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
      connection.socket.send(
        JSON.stringify({ type: BroadcastType.CONNECTED })
      );
      break;

    case 'CREATE_ROOM': {
      const { name } = message.payload || {};
      if (!name) return;
      createRoomAndJoin(connection, name);
      break;
    }

    case 'JOIN_BY_CODE': {
      const { name, code } = message.payload || {};
      if (!name || !code) return;
      joinRoomByCode(connection, name, code);
      break;
    }

    case 'FIND_MATCH': {
      const { name } = message.payload || {};
      if (!name) return;
      findMatch(connection, name);
      break;
    }

    case 'PLAYER_ACTION':
      handlePlayerAction(connection);
      break;

    case 'CHAT_MESSAGE':
      // later
      break;

    default:
      console.warn('Unknown message', message.type);
  }
}
