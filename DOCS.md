# QuizFire - Project Documentation

A real-time quiz game (think Kahoot) where a **host** creates a quiz, players join with a game code, and everyone plays live together.

---

## Table of Contents

- [How It Works (Big Picture)](#how-it-works-big-picture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running the App](#running-the-app)
- [Server Side](#server-side)
  - [Entry Point](#entry-point)
  - [Game Engine](#game-engine)
  - [State Machine](#state-machine)
  - [Scoring](#scoring)
  - [Data Storage](#data-storage)
  - [REST API](#rest-api)
  - [Socket Events](#socket-events)
  - [Middleware](#middleware)
- [Client Side](#client-side)
  - [Pages & Routes](#pages--routes)
  - [State Management](#state-management)
  - [How the Client Talks to the Server](#how-the-client-talks-to-the-server)
  - [Key Components](#key-components)
- [Game Lifecycle (Step by Step)](#game-lifecycle-step-by-step)
- [Data Flow Diagram](#data-flow-diagram)
- [Key Files Quick Reference](#key-files-quick-reference)

---

## How It Works (Big Picture)

1. A **host** creates a quiz (pick a template or write your own questions).
2. The server gives back a **6-character game code** (like `AB3X7K`).
3. **Players** enter that code and a nickname to join the lobby.
4. The host clicks **Start** — everyone sees the first question with a countdown timer.
5. Players pick an answer. Faster answers + answer streaks = more points.
6. The host clicks **Reveal** — the correct answer and leaderboard are shown.
7. Repeat for each question, then the final podium and leaderboard are shown.

There are two roles:
- **Host** — controls the flow (start, reveal, next question, end).
- **Player** — joins and answers questions.

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Server** | Node.js + Express | HTTP server and REST API |
| **Real-time** | Socket.IO | Instant two-way communication (questions, answers, leaderboard) |
| **Database** | SQLite (via better-sqlite3) | Stores quizzes and game results on disk |
| **Client** | React 18 + Vite | Fast UI with hot reload during development |
| **Styling** | Tailwind CSS 4 | Utility-first CSS classes |
| **Animations** | Framer Motion | Smooth page/element transitions |
| **Routing** | React Router 6 | Client-side page navigation |
| **Deployment** | Docker (multi-stage) | One container runs both client and server |

---

## Project Structure

```
proto-1/
├── client/                    ← React frontend
│   ├── src/
│   │   ├── main.jsx           ← App bootstrap
│   │   ├── App.jsx            ← Routes, providers, navigation sync
│   │   ├── config/            ← API and socket URLs
│   │   ├── services/          ← API calls and socket connection
│   │   ├── context/           ← Global state (game, player, socket, chat)
│   │   ├── hooks/             ← Custom hooks (game events, timer, leaderboard)
│   │   ├── pages/             ← All screens (home, create, host/*, player/*)
│   │   └── components/        ← Reusable UI pieces
│   ├── vite.config.js         ← Dev server proxy config
│   └── package.json
│
├── server/                    ← Node.js backend
│   ├── index.js               ← Server entry point
│   ├── config/                ← App settings (port, CORS, timers, scoring)
│   ├── db/                    ← SQLite setup and schema
│   ├── data/                  ← Pre-built quiz templates
│   ├── engine/                ← Core game logic (the brain)
│   ├── errors/                ← Custom error classes
│   ├── routes/                ← REST API endpoints
│   ├── store/                 ← In-memory game state + DB repositories
│   ├── transport/             ← Socket.IO server, handlers, emitters, middleware
│   ├── utils/                 ← Logger, game code generator
│   └── package.json
│
├── Dockerfile                 ← Build & run everything in one container
├── .gitignore
└── README.md
```

---

## Running the App

**Development (two terminals):**

```bash
# Terminal 1 — start the server
cd server
npm install
npm run dev          # runs on port 3001

# Terminal 2 — start the client
cd client
npm install
npm run dev          # runs on port 5173, proxies API to 3001
```

Open `http://localhost:5173` in your browser.

**Production / Docker:**

```bash
docker build -t quizfire .
docker run -p 3001:3001 quizfire
```

The client is pre-built and served by the Express server at `http://localhost:3001`.

---

## Server Side

### Entry Point

**`server/index.js`** does four things on startup:

1. Initializes the SQLite database (creates tables if they don't exist).
2. Sets up Express with CORS and JSON parsing.
3. Mounts the REST API routes at `/api`.
4. Creates an HTTP server and attaches Socket.IO to it.
5. In production, serves the built React app from `server/public/`.

### Game Engine

**`server/engine/GameEngine.js`** is the brain of the app. It contains all the game logic but knows nothing about sockets or HTTP — it just takes input and returns data. The transport layer (socket handlers) decides what to send where.

Key methods:

| Method | What it does |
|--------|-------------|
| `createGame(quiz)` | Generates a game code and host token, stores the game in memory |
| `joinGame(gameCode, socketId, nickname)` | Adds a player to the game (or reconnects a disconnected one) |
| `startQuiz(gameCode, hostToken)` | Moves game to "question" state, starts the timer |
| `submitAnswer(gameCode, socketId, optionIndex)` | Records a player's answer with timestamp |
| `revealAnswer(gameCode, hostToken)` | Stops timer, calculates scores, builds leaderboard |
| `nextQuestion(gameCode, hostToken)` | Advances to the next question (or ends the game) |
| `endQuiz(gameCode, hostToken)` | Ends the game early and saves results |
| `getGameState(gameCode)` | Returns public game state (for REST API polling) |

The `hostToken` is a secret given only to the host at game creation. It's how the server knows "this person is allowed to control the game."

### State Machine

**`server/engine/stateMachine.js`** controls what states a game can be in and what transitions are allowed:

```
LOBBY  →  QUESTION  →  REVEAL  →  QUESTION (next question)
                                →  ENDED    (no more questions)
```

- **LOBBY** — waiting for players to join.
- **QUESTION** — a question is active, timer is running, players can answer.
- **REVEAL** — correct answer is shown, scores are calculated.
- **ENDED** — game is over, final leaderboard shown.

You can't skip states. For example, you can't go from LOBBY directly to REVEAL.

### Scoring

**`server/engine/scoring.js`** calculates points. There are three strategies, but the default is **streakBased**:

- **Base points:** 1000 for a correct answer, 0 for wrong.
- **Speed bonus:** Up to 500 extra points for answering quickly (the faster you answer, the more bonus you get).
- **Streak multiplier:** Consecutive correct answers multiply your score:
  - 2 in a row → 1.1x
  - 3 in a row → 1.2x
  - 5+ in a row → 1.5x

**`server/engine/leaderboard.js`** sorts players by score, assigns ranks (handling ties), and tracks rank changes so the UI can show "you moved up 2 spots."

### Data Storage

There are two layers:

**In-memory (while a game is active):**
- **`server/store/GameStore.js`** — a `Map` of all active games. Each game holds its state, participants, and answers. This is fast but lost on server restart.

**SQLite (permanent):**
- **`server/store/QuizRepository.js`** — saves/loads quiz definitions (title + questions as JSON).
- **`server/store/ResultRepository.js`** — saves final game results (who scored what).
- **`server/db/init.js`** — creates the `quizzes` and `game_results` tables on startup.

**`server/data/templates.js`** has pre-built quiz templates (e.g., "General Knowledge") so users don't have to write questions from scratch.

### REST API

**`server/routes/quizRoutes.js`** provides these endpoints:

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/api/quiz` | Create a new quiz and start a game for it |
| `GET` | `/api/quiz/:gameCode` | Get current game state (for reconnection/polling) |
| `GET` | `/api/templates` | List all quiz templates |
| `GET` | `/api/templates/:id` | Get a specific template |
| `GET` | `/api/quizzes` | List all saved quizzes |
| `GET` | `/api/quizzes/:id` | Get a specific saved quiz |
| `DELETE` | `/api/quizzes/:id` | Delete a quiz |
| `GET` | `/api/results/:gameCode` | Get results for a specific game |
| `GET` | `/api/results` | Get recent game results |

### Socket Events

Socket.IO handles all real-time communication. Here are the events:

**Client sends to server:**

| Event | Who sends it | What it does |
|-------|-------------|-------------|
| `joinGame` | Player | Join a game with code + nickname |
| `joinAsHost` | Host | Reconnect as host with game code + host token |
| `createGame` | Host | Create a new game via socket (alternative to REST) |
| `startQuiz` | Host | Start the quiz |
| `submitAnswer` | Player | Submit answer for current question |
| `revealAnswer` | Host | Show the correct answer |
| `nextQuestion` | Host | Move to next question |
| `endQuiz` | Host | End the game early |
| `sendMessage` | Anyone | Send a chat message |

**Server sends to client:**

| Event | Who receives it | What it contains |
|-------|----------------|-----------------|
| `gameCreated` | Host | Game code and host token |
| `hostJoined` | Host | Game code and participant list |
| `participantsUpdated` | Everyone in room | Updated participant list |
| `reconnected` | Reconnecting player | Full game state snapshot |
| `questionStart` | Everyone in room | Question text, options, timer end time |
| `answerUpdate` | Host only | Which player answered (no correct answer info) |
| `answerAck` | Answering player | Confirmation that answer was received |
| `reveal` | Everyone in room | Correct answer index + leaderboard |
| `quizEnd` | Everyone in room | Final leaderboard |
| `chatMessage` | Everyone in room | Chat message content |

### Middleware

- **`server/transport/middleware/auth.js`** — reads `gameCode` and `role` from the socket handshake and stores them on `socket.data`.
- **`server/transport/middleware/rateLimiter.js`** — limits each socket to 30 events per second. Excess events cause a disconnect.

---

## Client Side

### Pages & Routes

The app has two main flows: **host** and **player**.

**Shared pages:**

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Landing page with "Create Quiz" and "Join Game" buttons |
| `/create` | CreateQuiz | Build a quiz from scratch or pick a template |

**Host flow:**

| Route | Page | What happens here |
|-------|------|------------------|
| `/host/lobby` | HostLobby | Shows the game code, lists joined players, has a "Start" button |
| `/host/question` | HostQuestion | Shows the question, countdown timer, and how many have answered |
| `/host/reveal` | HostReveal | Shows correct answer, leaderboard, "Next Question" or "End Quiz" buttons |
| `/host/end` | HostEnd | Podium (top 3) and full final leaderboard |

**Player flow:**

| Route | Page | What happens here |
|-------|------|------------------|
| `/play/join` or `/join/:gameCode` | PlayerJoin | Enter game code and nickname |
| `/play/lobby` | PlayerLobby | "Waiting for host to start..." screen |
| `/play/question` | PlayerQuestion | See the question and tap your answer |
| `/play/reveal` | PlayerReveal | See if you were right/wrong, your score, rank changes |
| `/play/end` | PlayerEnd | Your final score, the podium, and leaderboard |

**Navigation is automatic.** A `NavigationManager` component in `App.jsx` listens to game state changes and navigates to the right page. When the server says "we're on question now," both host and player screens navigate automatically.

### State Management

State is managed with React Context + `useReducer` (no external library like Redux):

- **`GameContext`** — the main game state: game code, current question, participants, leaderboard, game phase.
- **`PlayerContext`** — player-specific state: nickname, score, rank, streak, selected answer.
- **`SocketContext`** — the Socket.IO connection instance and whether it's connected.
- **`ChatContext`** — chat messages.

The `useGameEvents` hook (in `hooks/useGame.js`) is the glue — it listens to all Socket.IO events and dispatches actions to update the contexts.

### How the Client Talks to the Server

**Two channels:**

1. **REST API** (`services/api.js`) — used for one-time actions:
   - Creating a quiz (`POST /api/quiz`)
   - Fetching game state (`GET /api/quiz/:code`)
   - Loading templates

2. **Socket.IO** (`services/socket.js`) — used for everything real-time:
   - Joining a game
   - Starting the quiz
   - Submitting answers
   - Receiving questions, reveals, leaderboard updates

**In development**, Vite's dev server (port 5173) proxies `/api` and `/socket.io` requests to the backend (port 3001), so the client doesn't need to know the backend URL.

**In production**, the server serves the built client files and handles everything on one port.

### Key Components

| Component | What it does |
|-----------|-------------|
| `QuestionDisplay` | Renders a question with its options |
| `QuestionEditor` | Form for editing a question when creating a quiz |
| `OptionButton` | A single answer option (with color coding for reveal) |
| `AnswerProgress` | Shows how many players have answered (host view) |
| `CountdownTimer` | Circular countdown animation |
| `Leaderboard` | Ranked list of players with scores |
| `LeaderboardRow` | Single player row (rank, name, score, rank change indicator) |
| `Podium` | Top 3 players with a podium visual |
| `ChatBox` | In-game chat panel |
| `TemplateSelector` | Pick a pre-built quiz template |
| `PageWrapper` | Common page layout with fade-in animation |
| `GameHeader` | Header bar showing quiz title and game code |
| `Button`, `Card`, `Input`, `Badge` | Basic reusable UI elements |

---

## Game Lifecycle (Step by Step)

Here's the full flow with what happens in the code:

```
Step 1: HOST CREATES A QUIZ
├── Client: POST /api/quiz with {title, questions}
├── Server: GameEngine.createGame() → generates gameCode + hostToken
├── Server: Saves quiz to SQLite, stores game in memory (GameStore)
└── Client: Receives {gameCode, hostToken}, navigates to /host/lobby

Step 2: HOST JOINS THE SOCKET ROOM
├── Client: Emits "joinAsHost" with {gameCode, hostToken}
├── Server: Validates hostToken, joins socket to room
└── Client: Receives "hostJoined" with participant list

Step 3: PLAYERS JOIN
├── Client: Emits "joinGame" with {gameCode, nickname}
├── Server: GameEngine.joinGame() → adds to participants
├── Server: Emits "participantsUpdated" to everyone in the room
└── All clients: Update their participant lists

Step 4: HOST STARTS THE QUIZ
├── Client: Emits "startQuiz"
├── Server: GameEngine.startQuiz() → state changes LOBBY → QUESTION
├── Server: Starts timer, emits "questionStart" to the room
│   (question sent to players has the correct answer removed)
└── All clients: Navigate to question screen, countdown begins

Step 5: PLAYERS ANSWER
├── Client: Emits "submitAnswer" with {optionIndex}
├── Server: GameEngine.submitAnswer() → records answer + timestamp
├── Server: Emits "answerAck" to the player (confirmation)
└── Server: Emits "answerUpdate" to host only (shows who answered)

Step 6: HOST REVEALS THE ANSWER
├── Client: Emits "revealAnswer"
├── Server: GameEngine.revealAnswer() → calculates scores, builds leaderboard
├── Server: Emits "reveal" with {correctIndex, leaderboard}
└── All clients: Navigate to reveal screen, see correct answer + rankings

Step 7: NEXT QUESTION (or END)
├── Client: Emits "nextQuestion"
├── Server: If more questions → back to Step 4
├── Server: If no more questions → state changes to ENDED
├── Server: Saves results to SQLite
├── Server: Emits "quizEnd" with {finalLeaderboard}
└── All clients: Navigate to end screen, see podium
```

### Disconnection & Reconnection

- When a player disconnects, they're **not removed** — just marked as disconnected.
- If they rejoin with the **same nickname**, they're reconnected with their score and streak intact.
- The server sends them a full state snapshot so they can jump back in where they left off.

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                       │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │
│  │  Pages   │  │  Context  │  │   Hooks   │  │Components│  │
│  │(screens) │──│(state mgmt)│──│(event glue)│──│  (UI)    │  │
│  └──────────┘  └───────────┘  └───────────┘  └──────────┘  │
│       │              ▲                                       │
│       │              │ dispatches actions                    │
│       ▼              │                                       │
│  ┌──────────────────────────────┐                            │
│  │  services/api.js  (REST)    │ ← one-time requests        │
│  │  services/socket.js (WS)   │ ← real-time events          │
│  └──────────────────────────────┘                            │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTP + WebSocket
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js)                          │
│                                                              │
│  ┌───────────────┐   ┌──────────────────────────────────┐   │
│  │ REST Routes   │   │  Socket.IO Handlers              │   │
│  │ (quizRoutes)  │   │  (lobby, host, player, chat)     │   │
│  └───────┬───────┘   └───────────────┬──────────────────┘   │
│          │                           │                       │
│          │         ┌─────────────────┤                       │
│          ▼         ▼                 ▼                       │
│  ┌────────────────────────┐  ┌─────────────────────┐        │
│  │     GameEngine         │  │   gameEmitter       │        │
│  │  (pure game logic)     │  │ (send events back)  │        │
│  └───────────┬────────────┘  └─────────────────────┘        │
│              │                                               │
│    ┌─────────┴──────────┐                                    │
│    ▼                    ▼                                    │
│  ┌──────────┐    ┌──────────────┐                            │
│  │GameStore │    │  SQLite DB   │                            │
│  │(in-memory│    │(QuizRepo +   │                            │
│  │  Map)    │    │ ResultRepo)  │                            │
│  └──────────┘    └──────────────┘                            │
│  active games     saved quizzes                              │
│  participants     game results                               │
│  answers                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Files Quick Reference

When you need to change something, here's where to look:

| I want to... | Look at |
|--------------|---------|
| Change game rules / scoring | `server/engine/scoring.js`, `server/engine/GameEngine.js` |
| Add a new game state | `server/engine/stateMachine.js` |
| Change timer settings | `server/config/index.js`, `server/engine/timer.js` |
| Add a new socket event | `server/transport/handlers/` (pick the right handler file) |
| Add a new REST endpoint | `server/routes/quizRoutes.js` |
| Change database schema | `server/db/init.js` |
| Add a quiz template | `server/data/templates.js` |
| Add a new page/screen | `client/src/pages/` + add route in `client/src/App.jsx` |
| Change game state logic (client) | `client/src/context/GameContext.jsx` |
| Change player state logic | `client/src/context/PlayerContext.jsx` |
| Handle a new socket event (client) | `client/src/hooks/useGame.js` |
| Change API URLs | `client/src/config/index.js` |
| Modify shared UI components | `client/src/components/` |
| Change how errors are handled | `server/errors/GameError.js` |
| Change rate limits / auth | `server/transport/middleware/` |

---

## Quick Glossary

| Term | Meaning |
|------|---------|
| **Game Code** | 6-character alphanumeric code (like `AB3X7K`) players use to join |
| **Host Token** | Secret string only the host gets — proves they're the host |
| **Room** | Socket.IO room named after the game code — everyone in the same game is in the same room |
| **Participant** | A player in the game (stored with socketId, nickname, score, streak) |
| **State Machine** | Controls which phase the game is in (lobby → question → reveal → ended) |
| **GameStore** | In-memory storage for active games (lost on restart) |
| **Repository** | Database access layer (QuizRepository, ResultRepository) — permanent storage |
| **Emitter** | Helper functions to send Socket.IO events to the right people (room, host only, single player) |
| **Context** | React's way of sharing state across components without passing props everywhere |
