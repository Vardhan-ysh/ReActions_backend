# ReActions Backend

Backend server for the ReActions real-time multiplayer game.

## Overview

ReActions is a fast-paced multiplayer game where players compete in various reaction-based mini-games. This backend handles:
- Real-time WebSocket connections for game state.
- Room management (creation, joining, matchmaking).
- Game state synchronization using Redis.
- Event processing (integrated with Kafka).

## Tech Stack

- **Language**: TypeScript (Node.js)
- **Communication**: WebSockets (`ws`)
- **Database/Cache**: Redis (`ioredis`)
- **Message Queue**: Kafka (`kafkajs`)
- **Tooling**: `tsx` (for dev), Prettier.

## Prerequisites

Before running the server, ensure you have the following installed and running:

1.  **Node.js** (v18 or higher)
2.  **Redis**: Running locally on port `6379`.
3.  **Kafka** (Optional/if configured): Ensure your Kafka broker is accessible if using event streaming features.

## Installation

```bash
npm install
```

## Running the Project

### Development
Runs the server in watch mode using `tsx`.
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```bash
src
|   index.ts                # Application entry point
|   server.ts               # HTTP server initialization
|
+---chat
|       chatHandler.ts      # Chat logic (Future Implementation)
|
+---game
|       gameManager.ts      # Core game logic coordination
|       gameState.ts        # Game state persistence and retrieval
|       promptManager.ts    # Prompt generation logic
|       roomManager.ts      # Room lifecycle management
|
+---kafka
|       producer.ts         # Kafka producer configuration
|       topics.ts           # Kafka topic definitions
|
+---matchmaking
|       queue.ts            # Matchmaking queue logic
|
+---redis
|       redisClient.ts      # Redis connection setup
|
+---services
|       roomService.ts      # Room business logic
|
+---types
|       game.ts             # Game-related type definitions
|       ws.ts               # WebSocket payload types
|
+---utils
|       logger.ts           # Logging utility
|       roomCode.ts         # Room code generation
|       uuid.ts             # UUID helper
|
\---ws
        connectionRegistry.ts # Socket connection tracking
        wsHandler.ts          # WebSocket message router
        wsServer.ts           # WebSocket server setup
```

## WebSocket API

The server uses a JSON-based protocol. All messages sent to the server must follow the `Request` format, and all messages received from the server follow the `Response` format.

### 1. Client -> Server Requests

**Generic Request Format:**
```json
{
  "type": "ACTION_TYPE",
  "payload": { ... }
}
```

| Action Type | Payload Structure | Description |
| :--- | :--- | :--- |
| `TEST` | `{}` | Ping the server. Returns `CONNECTED`. |
| `JOIN_GAME` | `{ "name": "PlayerName", "roomId": "optional_id" }` | Join an existing room or queue for one. |
| `PLAYER_ACTION` | `...` | Submit a move or reaction in game. |
| `CHAT_MESSAGE` | `{ "message": "hello" }` | Send a chat message (WIP). |

### 2. Server -> Client Responses

**Generic Response Format:**
```json
{
  "type": "BROADCAST_TYPE",
  "payload": { ... }
}
```

#### Connection Events
- **`CONNECTED`**: Sent immediately on connection.
  ```json
  { "type": "CONNECTED" }
  ```

#### Room Events
- **`ROOM_CREATED`**: Sent to the creator when a new room is made.
  ```json
  {
    "type": "ROOM_CREATED",
    "payload": {
      "roomId": "uuid",
      "roomCode": "ABCD",
      "playerId": "uuid"
    }
  }
  ```
- **`JOINED`**: Sent when a player successfully joins.
  ```json
  {
    "type": "JOINED",
    "payload": { "roomId": "...", "playerId": "..." }
  }
  ```

#### Game Events
- **`GAME_STATE`**: Updates on players, scores, and status.
  ```json
  {
    "type": "GAME_STATE",
    "payload": {
      "state": {
        "status": "WAITING|IN_PROGRESS|FINISHED",
        "players": [...],
        "currentRound": 1
      }
    }
  }
  ```
- **`PROMPT`**: The challenge for the current round.
  ```json
  {
    "type": "PROMPT",
    "payload": {
      "round": 1,
      "prompt": { "type": "CLICK_FAST" }
    }
  }
  ```
- **`ROUND_RESULT`**: Results after a prompt concludes.
  ```json
  {
    "type": "ROUND_RESULT",
    "payload": {
      "winnerPlayerId": "uuid",
      "scores": [{ "playerId": "...", "score": 10 }]
    }
  }
  ```
- **`GAME_OVER`**: Final game results.
  ```json
  {
    "type": "GAME_OVER",
    "payload": { "winnerPlayerId": "uuid" }
  }
  ```


## License

ISC
