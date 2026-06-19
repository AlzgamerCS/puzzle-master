import { useState, useEffect } from "react";
import { createSolvedBoard, move, shuffle } from "../hooks/slidingPuzzleLogic";
import { useSlidingPuzzleSolver } from "../hooks/useSlidingPuzzleSolver";

function SlidingPuzzleBoard({ size = 4 }) {
  const [board, setBoard] = useState(() => createSolvedBoard(size));
  const {
    isSolving,
    solveDelay,
    setSolveDelay,
    moveCount,
    backtrackCount,
    currentMove,
    currentDepth,
    isBacktracking,
    solve,
    stop,
  } = useSlidingPuzzleSolver(board, size);

  function handleMove(dir) {
    if (!isSolving) {
      setBoard((b) => move(b, size, dir));
    }
  }

  function handleShuffle() {
    if (!isSolving) {
      setBoard((b) => shuffle(b, size));
    }
  }

  function handleSolve() {
    solve(setBoard);
  }

  useEffect(() => {
    function handleKey(e) {
      if (isSolving) return; // Disable manual controls during solving
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    }

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [size, isSolving]);

  // Handle tile click to move it (simplified logic: check neighbors)
  // Since our logic is direction-based, click-to-move is complex to add without refactoring logic.
  // For now, we'll keep it visual, or maybe add a simple 'try move' if we had that logic.
  // We'll stick to just improved visuals for now.

  return (
    <div className="flex-col-center">
      <div
        className="sliding-board"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: `${size * 80 + (size - 1) * 8 + 24}px`, // approximate width calculation
          maxWidth: "90vw",
        }}
      >
        {board.map((tile, i) => (
          <div
            key={i}
            className={`sliding-tile ${tile === 0 ? "empty" : ""}`}
            style={{
              aspectRatio: "1/1",
            }}
          >
            {tile !== 0 ? tile : ""}
          </div>
        ))}
      </div>

      {/* Solver Status Display */}
      {isSolving && (
        <div
          className="solver-status"
          style={{
            marginTop: "1rem",
            textAlign: "center",
            padding: "1rem",
            backgroundColor: isBacktracking ? "#fff3cd" : "#e8f5e9",
            borderRadius: "8px",
            border: `2px solid ${isBacktracking ? "#ffc107" : "#4CAF50"}`,
          }}
        >
          <div style={{ fontSize: "1.1em", fontWeight: "bold", color: "var(--text-primary)" }}>
            {isBacktracking ? "↶ " : "→ "}
            <span style={{ color: isBacktracking ? "#ff9800" : "#4CAF50", fontSize: "1.2em" }}>
              {currentMove}
            </span>
          </div>

          <div
            style={{
              fontSize: "0.9em",
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.5rem",
            }}
          >
            <div>
              <strong>Forward:</strong> {moveCount}
            </div>
            <div>
              <strong>Backtrack:</strong> {backtrackCount}
            </div>
            <div>
              <strong>Depth:</strong> {currentDepth}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "#e0e0e0",
              borderRadius: "3px",
              marginTop: "0.8rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min((currentDepth / 20) * 100, 100)}%`,
                height: "100%",
                backgroundColor: isBacktracking ? "#ff9800" : "#4CAF50",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      )}

      <div className="controls-container">
        <div className="controls-row">
          <button
            className="primary"
            onClick={handleShuffle}
            disabled={isSolving}
            style={{ opacity: isSolving ? 0.5 : 1, cursor: isSolving ? "not-allowed" : "pointer" }}
          >
            Shuffle Board
          </button>
          <button
            className="primary"
            onClick={isSolving ? stop : handleSolve}
            style={{
              backgroundColor: isSolving ? "#f44336" : "#4CAF50",
              marginLeft: "0.5rem",
            }}
          >
            {isSolving ? "Stop Solving" : "Solve Puzzle"}
          </button>
        </div>

        {/* Speed Control */}
        {isSolving && (
          <div className="controls-row" style={{ marginTop: "1rem", gap: "0.5rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.9em" }}>Speed:</label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={solveDelay}
              onChange={(e) => setSolveDelay(Number(e.target.value))}
              style={{ width: "200px" }}
            />
            <span style={{ fontSize: "0.85em", color: "var(--text-secondary)" }}>
              {(1010 - solveDelay) / 100}x
            </span>
          </div>
        )}

        <p style={{ textAlign: "center", opacity: 0.7, fontSize: "0.9em", marginTop: "1rem" }}>
          {isSolving
            ? "🔍 Live search with backtracking..."
            : "Use arrow keys to move tiles"}
        </p>
      </div>
    </div>
  );
}

export default SlidingPuzzleBoard;
