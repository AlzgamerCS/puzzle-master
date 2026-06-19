# Puzzle Master

An interactive puzzle solver built with **React + Vite**. Includes a Sudoku solver and a classic 15-puzzle (sliding puzzle), both with real-time step-by-step visualization of the solving algorithms.

---

## Features

### Sudoku Solver

- Interactive 9x9 grid — click any cell to enter a number (1–9)
- Two solving algorithms:
  - **Naive** — classic backtracking DFS, left-to-right, top-to-bottom
  - **Heuristic (MRV)** — backtracking with *Minimum Remaining Values*: always picks the cell with the fewest valid candidates, solving most puzzles dramatically faster
- **Live visualization** — watch the solver fill and backtrack through cells in real time
- **Speed control** — slider from instant to 500ms per step
- Clear button to reset the board
- Fixed/pre-filled cells are visually distinct and cannot be edited during solving

### Sliding Puzzle (15-Puzzle)

- Classic 4x4 grid with 15 numbered tiles and one empty space
- **Keyboard controls** — arrow keys move tiles
- **Shuffle** — randomizes the board with 200 random moves (always solvable)
- **DFS solver** with:
  - Manhattan distance heuristic for smarter move ordering
  - Live backtrack visualization (forward moves vs. backtracks shown with different colors)
  - Step counters: moves forward, backtracks, current search depth
  - Progress bar reflecting forward/backtrack state
- **Speed control** — adjustable during solving
- **Stop** button to interrupt the solver at any time

### UI / UX

- Light and dark theme toggle with smooth CSS transitions
- Clean navigation between puzzles via React Router
- Fully keyboard accessible

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint
```

---

## Project Structure

```text
src/
├── App.jsx                        # Root layout: navigation, routing, theme toggle
├── index.css                      # Global CSS variables (colors, shadows, dark mode)
├── App.css                        # Component-level styles
├── hooks/
│   ├── sudokuSolver.js            # Sudoku algorithms (naive + MRV heuristic) as generators
│   ├── useSudoku.js               # React hook: Sudoku grid state + solve orchestration
│   ├── slidingPuzzleLogic.js      # Sliding puzzle algorithms (DFS + Manhattan) as generators
│   └── useSlidingPuzzleSolver.js  # React hook: sliding puzzle solve state + stop control
└── pages/
    ├── SudokuBoard.jsx            # Sudoku UI
    └── SlidingPuzzleBoard.jsx     # Sliding puzzle UI
```

The key architectural pattern is **generator-based visualization**: solvers are pure JavaScript generator functions that `yield` each step. React hooks consume these generators on a timer, so playback speed is fully controllable without any changes to the algorithm code.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Routing | React Router DOM 7 |
| Build | Vite 7 + SWC |
| Styling | Plain CSS with custom properties |
| Linting | ESLint 9 (flat config) |

---

## Algorithms

### Sudoku — Naive Backtracking

Iterates cells in row-major order. For each empty cell, tries digits 1–9 in sequence, backtracks on conflict. Simple to understand, can be slow on hard puzzles.

### Sudoku — Heuristic (MRV)

At each step, selects the empty cell with the *fewest valid candidates* (Minimum Remaining Values). This constraint propagation dramatically prunes the search tree. Neighbor lookups are O(1) thanks to pre-cached neighbor sets built at solver construction time.

### Sliding Puzzle — DFS + Manhattan Distance

Depth-first search with a configurable max depth (60). Before expanding, moves are sorted by the **Manhattan distance** of the resulting board state — tiles that are closer to their goal positions are tried first. Backtracks are tracked and displayed separately in the UI.
