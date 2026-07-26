# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR (defaults to `http://localhost:5173`)
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — lint with Oxlint (rules in `.oxlintrc.json`)

There is no test runner configured yet. There is no TypeScript — this is a plain JS/JSX project.

## Architecture

This is the **facilitator (control) frontend** for a live rebus picture-puzzle game show, one of three sibling projects (typically checked out alongside each other):
- `../rubus_puzzle` — the TV **display** frontend (also Vite/React, no router)
- `../rubus_puzzle_backend` — Express + Socket.IO + MongoDB backend; holds authoritative game state
- `facilitator_rubuspuzzle` (this repo) — creates games and (eventually) drives them

The backend deliberately does not know puzzle content — it only stores an ordered array of puzzle ID strings per game session. All puzzle content (images, answers, hints, etc.) lives in frontend code, duplicated independently in each frontend that needs it.

Key structural points:
- `src/data/puzzles.js` is the single source of truth for the puzzle catalogue on this frontend: `puzzles` (full records), `puzzleIds` (all IDs in canonical order), and `activePuzzles` (puzzles currently offered to a facilitator). Adding a puzzle here automatically flows through to the create-game screen — never hardcode a separate ID list elsewhere.
- `src/lib/api.js` exports `apiUrl`, read from `VITE_API_URL` (see `.env.example`), defaulting to `http://localhost:5000` to match the backend's default `PORT`.
- Routing is `react-router-dom` (`BrowserRouter` set up in `main.jsx`). `App.jsx` just declares `<Routes>`: `/` → `CreateGamePage`, `/control/:gameCode` → `ControlPage`.
- `src/pages/CreateGamePage.jsx` is the puzzle-selection screen: select/deselect/select-all/clear, reorder and shuffle the selection, then `POST /api/game-sessions` with `{ puzzleIds: selectedPuzzleIds }` (IDs only, never full puzzle objects) and navigate to `/control/:gameCode` on success.
- `src/pages/ControlPage.jsx` is currently just a stub that confirms a session was created and lists its puzzle order (`GET /api/game-sessions/:gameCode`). The real facilitator control panel (start/pause/judge/skip, live timer, Socket.IO sync to match `rubus_puzzle_backend`'s room-based events) has not been built yet.
- The backend's CORS is locked to a single `CLIENT_URL` origin (see its `.env`) — if you need to run this frontend and `rubus_puzzle` against the same backend at once, they must not both claim the same origin/port, or one will be rejected by CORS.
- The **React Compiler** is enabled via Babel at build time (`vite.config.js` wires `@rolldown/plugin-babel` with `reactCompilerPreset()` alongside `@vitejs/plugin-react`). This auto-memoizes components/hooks, so manual `useMemo`/`useCallback`/`React.memo` are generally unnecessary — let the compiler handle it.
- Static SVG icons for the (now-removed) template landing page were in `public/icons.svg`, referenced by fragment id via `<use href="/icons.svg#icon-name">`; puzzle thumbnail assets live in `public/puzzleImage/`.
- Oxlint (not ESLint) is the linter; config lives in `.oxlintrc.json` with the `react` and `oxc` plugin rule sets enabled (notably `react/rules-of-hooks` as an error).
