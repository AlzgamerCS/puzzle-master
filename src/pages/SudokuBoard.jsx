import { useState } from "react";
import { useSudoku } from "../hooks/useSudoku";

function SudokuBoard() {
  const {
    grid,
    fixedCells,
    isSolving,
    solveDelay,
    setSolveDelay,
    updateCell,
    clearGrid,
    solve,
  } = useSudoku();

  const [solverType, setSolverType] = useState("heuristic");

  return (
    <div className="flex-col-center">
      <div className="sudoku-board">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              className={`sudoku-cell ${fixedCells.has(`${r},${c}`) ? "fixed" : ""}`}
              value={cell}
              onChange={(e) => updateCell(r, c, e.target.value)}
              maxLength={1}
              inputMode="numeric"
              disabled={isSolving}
            />
          )),
        )}
      </div>

      <div className="controls-container">
        <div className="controls-row">
          <div className="control-group">
            <span className="control-label">Actions</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={clearGrid} disabled={isSolving}>
                Clear
              </button>
              <button
                className="primary"
                onClick={() => solve(solverType)}
                disabled={isSolving}
              >
                {isSolving ? "Solving..." : "Solve Puzzle"}
              </button>
            </div>
          </div>
        </div>

        <div className="controls-row">
          <div className="control-group" style={{ flex: 1 }}>
            <span className="control-label">Speed: {solveDelay}ms</span>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              value={solveDelay}
              onChange={(e) => setSolveDelay(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <span className="control-label">Algorithm</span>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  value="naive"
                  checked={solverType === "naive"}
                  onChange={(e) => setSolverType(e.target.value)}
                  disabled={isSolving}
                />
                Naive
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  value="heuristic"
                  checked={solverType === "heuristic"}
                  onChange={(e) => setSolverType(e.target.value)}
                  disabled={isSolving}
                />
                Heuristics
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SudokuBoard;
