# QuizFire

A real-time quiz app where hosts create custom quizzes and participants compete live — think Kahoot, built from scratch.

## Features

- **Custom quiz creation** — hosts add questions with 2-4 options, set correct answers and time limits
- **Real-time gameplay** — participants join with a game code and answer questions simultaneously via WebSockets
- **Live leaderboard** — animated rank transitions after every question, with speed-based scoring and streak multipliers
- **Host controls** — pace the game with reveal/next controls; see live answer counts as they come in
- **Animated UI** — glass-morphism design, smooth transitions, podium for final results

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, Socket.io |
| State | In-memory (swappable for Redis/DB via store interface) |

## Getting Started

### Prerequisites

- Node.js 18+ (20.x recommended)

### Install

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### Run

Open two terminals:

```bash
# Terminal 1: Backend (port 3001)
cd server
npm run dev

# Terminal 2: Frontend (port 5173)
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

### How to Play

1. **Host**: Click "Create Quiz" → add questions → click "Create Quiz"
2. **Host**: Share the game code with participants
3. **Participants**: Enter the game code + a nickname on the home page → click "Join"
4. **Host**: Click "Start Quiz" once everyone has joined
5. Each round: participants answer → host reveals correct answer + leaderboard → host advances to next question
6. After the last question: final standings with podium

## Architecture

```
server/
├── config/          # App configuration
├── store/           # Data layer (in-memory, swappable)
├── engine/          # Pure game logic (scoring, state machine, leaderboard)
├── transport/       # Socket.io layer (handlers, emitters, middleware)
├── routes/          # REST API
└── index.js         # Entry point

client/src/
├── config/          # Client config
├── services/        # Socket.io client, REST API
├── context/         # React contexts (Socket, Game, Player)
├── hooks/           # Custom hooks (game events, timer, leaderboard)
├── pages/           # Route pages (host flow + player flow)
└── components/      # Reusable UI (Leaderboard, Timer, Quiz, common)
```

### Key Design Decisions

- **Engine is pure logic** — no I/O, no socket awareness; returns data that handlers emit
- **State machine** guards all game transitions (lobby → question → reveal → ended)
- **Scoring is pluggable** — standard, streak-based, or flat strategies
- **Store has a clean interface** — swap in Redis/Postgres without touching engine or transport
- **Frontend contexts are separated** — Socket, Game, Player each have their own context

## Scoring

- Correct answer: **100 base points**
- Speed bonus: up to **+50 points** (answer faster = more points)
- Streak multiplier: 2 correct in a row = ×1.2, 3 = ×1.5, 4+ = ×2.0
