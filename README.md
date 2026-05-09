# ♟️ Chess Engine & Web App

A fully playable chess application built from scratch by using React and TypeScript, featuring:
- a custom chess engine,
- legal move validation,
- AI opponent support,
- polished interactive UI,
- and full implementation of official chess rules.

## Live Demo

Play online here:

- [VPChess Live Demo](https://vpchessts.vercel.app)
- Backup deployment: [Alternative Deployment](https://vpchess-an66ypd0g-computerviruswannabes-projects.vercel.app)

---

# Features

## ♟️ Complete Chess Rules
The engine fully supports:
- Legal move generation
- Check and checkmate detection
- Castling
- En passant
- Pawn promotion
- Turn validation
- Piece capture logic

## AI Opponent
Includes a custom-built chess AI using:
- Minimax search
- Alpha-beta pruning
- Board evaluation heuristics

The engine is capable of playing complete games and provides a solid challenge for casual and intermediate players.

## Interactive UI
Designed for usability and readability:
- Highlighted legal moves
- Last-move highlighting
- Visual check indicators
- Responsive board interactions
- Human vs Human mode
- Human vs AI mode

## Performance-Focused Architecture
The project separates:
- board state management,
- move generation,
- rule validation,
- AI search,
- and UI rendering

to keep the codebase modular and maintainable.

---

# How to Play

## Playing Against the AI
- Your pieces always appear at the bottom of the board.
- Click a piece to display all legal moves.
- Legal move squares are highlighted in yellow.

## Game Indicators
- The opponent’s last move is highlighted for clarity.
- When a king is in check:
  - the king’s square turns green,
  - and flashes red as a warning.

## Game Modes
Choose between:
- Human vs Human
- Human vs AI

---

# AI Overview

The chess engine currently uses:
- Minimax search
- Alpha-beta pruning
- Zobrist hashing
- Transposition tables
- Static board evaluation

The AI is functional and competitive for many players, though stronger players (roughly 1500+ ELO) can still reliably defeat it.

---

# Tech Stack

- React
- TypeScript
- JavaScript
- CSS
- Vercel Deployment

---

# Project Goals

This project was created to explore:
- game engine architecture,
- adversarial search algorithms,
- recursive problem solving,
- state management,
- and frontend/UI engineering.

The long-term goal is to continue improving the engine strength and overall polish.

---

# Known Issues

- Checkmate notification may occasionally trigger too early when the AI wins.
- The engine is considered too weak and has only one level of difficulty.
- Unable to undo/redo moves.
- Not yet able to save the state of the board when the browser/game is refreshed.

---

# Future Improvements

Planned features include:
- PGN export/import
- Undo/redo system
- Engine statistics
- Improved AI evaluation
- Multiplayer support
- Mobile UI improvements

---

# Running Locally

```bash
git clone https://github.com/ComputerVirusWannabe/test.git
npm install
npm run dev
```

Then open the local development URL shown in the terminal.

---

# Why This Project Matters

Chess engines are deceptively complex systems involving:
- recursive search,
- optimization,
- rule validation,
- state synchronization,
- and performance engineering.

This project was built entirely from scratch as both a technical challenge and a way to deepen understanding of software engineering and AI fundamentals.

---
