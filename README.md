# ReActions Backend

Backend server for **ReActions**, a real-time multiplayer reaction game.

This project is intentionally designed as a **learning-focused but production-style system**, emphasizing clean architecture, real-time systems, and infrastructure concepts (Redis, WebSockets, testing, service boundaries).

---

## Overview

**ReActions** is a real-time multiplayer game where two players compete in reaction-based rounds.
This backend is responsible for:

- Managing real-time WebSocket connections
- Room creation, invite-code joins, and matchmaking
- Server-authoritative game state and scoring
- Redis-backed coordination (room codes, matchmaking)
- Clean separation of concerns (services vs managers)
- Deterministic unit tests for core logic

---

## Key Design Principles

- **Server authoritative**: Clients never decide outcomes
- **Single responsibility layers**:
  - `RoomService` → entry flows & Redis coordination
  - `RoomManager` → in-memory room state
  - `GameManager` → game lifecycle & rules

- **Redis is coordination, not game state**
- **Test core logic, not transports**

---

## Tech Stack

### Backend

- **Language**: TypeScript (Node.js, ESM)
- **Transport**: WebSockets (`ws`)
- **Cache / Coordination**: Redis (`ioredis`)
- **Testing**: Vitest (Jest-compatible API)
- **Dev Tooling**: `tsx`

### Infra (Planned / Optional)

- Kafka (event logging, analytics)
- Docker + Nginx (deployment)

---

## Prerequisites

Make sure the following are available:

1. **Node.js** v18+
2. **Redis** running locally on `localhost:6379`

Kafka is **not required** to run the core game.

---

## Installation

```bash
npm install
```

---

## Running the Project

### Development (watch mode)

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

---

## Running Tests

Unit tests cover:

- Room lifecycle
- Game start conditions
- RoomService logic (with mocked Redis)

```bash
npm test
```

To run once (CI-style):

```bash
npm run test:run
```

---

## Project Structure

```bash
src
│
├─ index.ts                  # App entry point
├─ server.ts                 # HTTP + WS bootstrap
│
├─ ws
│  ├─ wsServer.ts            # WebSocket server setup
│  ├─ wsHandler.ts           # Message router (thin)
│  └─ connectionRegistry.ts  # playerId ↔ socket mapping
│
├─ services
│  └─ roomService.ts         # Room entry flows (Redis-backed)
│
├─ game
│  ├─ gameManager.ts         # Game lifecycle & rules
│  └─ roomManager.ts         # In-memory room state
│
├─ redis
│  └─ redisClient.ts         # Redis connection
│
├─ types
│  ├─ game.ts                # Game domain types
│  └─ ws.ts                  # WebSocket message types
│
├─ utils
│  └─ roomCode.ts            # 4-digit invite code generator
│
└─ __tests__
   ├─ roomManager.test.ts
   ├─ gameManager.test.ts
   └─ roomService.test.ts
```

---

## Room Entry Flows

The backend supports **three ways** to enter a game.
All flows converge into the same game logic.

### 1. Create Room (Invite Flow)

- Generates a UUID roomId
- Generates a **4-digit invite code**
- Stores `code → roomId` in Redis (TTL: 10 minutes)

### 2. Join by Code

- Looks up roomId via Redis
- Ensures room exists and is not full
- Invite codes are **one-time use**

### 3. Matchmaking

- Redis single-slot matchmaking
- If no one is waiting → player waits
- If one player is waiting → paired immediately
- New room is created automatically

---

## WebSocket Protocol

All messages are JSON with a `type` and `payload`.

### Client → Server

```json
{
  "type": "ACTION_TYPE",
  "payload": { ... }
}
```

| Type            | Payload                                | Description        |
| --------------- | -------------------------------------- | ------------------ |
| `TEST`          | `{}`                                   | Health check       |
| `CREATE_ROOM`   | `{ "name": "Player" }`                 | Create invite room |
| `JOIN_BY_CODE`  | `{ "name": "Player", "code": "1234" }` | Join via invite    |
| `FIND_MATCH`    | `{ "name": "Player" }`                 | Random matchmaking |
| `PLAYER_ACTION` | `{}`                                   | Submit reaction    |

---

### Server → Client

```json
{
  "type": "EVENT_TYPE",
  "payload": { ... }
}
```

#### Connection

- **CONNECTED**

#### Room

- **ROOM_CREATED**

```json
{
  "roomId": "uuid",
  "roomCode": "1234",
  "playerId": "uuid"
}
```

- **JOINED**

```json
{
  "roomId": "uuid",
  "playerId": "uuid"
}
```

- **MATCH_WAITING**

#### Game

- **GAME_STATE**
- **PROMPT**
- **ROUND_RESULT**
- **GAME_OVER**

The server controls all state transitions.

---

## Testing Strategy

- **Unit tests only**
- Redis is **mocked**, not real
- Timers and sockets are not tested directly
- Focus is on **deterministic logic**, not transport behavior

This keeps tests fast, reliable, and meaningful.

---

## What This Project Demonstrates

- Real-time multiplayer architecture
- Redis as a coordination layer
- Service vs manager separation
- Server-authoritative game logic
- Practical testing strategy
- Clean, interview-explainable design

---

## License

ISC
