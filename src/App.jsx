import { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";

import SudokuBoard from "./pages/SudokuBoard";
import SlidingPuzzleBoard from "./pages/SlidingPuzzleBoard";

import "./App.css";

function App() {
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    document.body.classList.toggle("dark");
    setDark(!dark);
  }
  return (
    <div className="app">
      <header>
        <button onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <h1>Puzzle Master</h1>

      <nav className="nav">
        <NavLink to="/sudoku" className="nav-link">
          Sudoku
        </NavLink>
        <NavLink to="/sliding" className="nav-link">
          Sliding Tile
        </NavLink>
      </nav>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{
                  textAlign: "center",
                  marginTop: "2rem",
                  maxWidth: "600px",
                  color: "var(--text-secondary)",
                }}
              >
                <h2
                  style={{ color: "var(--text-primary)", marginBottom: "1rem" }}
                >
                  Welcome to Puzzle Master
                </h2>
                <p>
                  Select a game from the navigation menu above to start playing.
                </p>
              </div>
            }
          />
          <Route path="/sudoku" element={<SudokuBoard />} />
          <Route path="/sliding" element={<SlidingPuzzleBoard size={4} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
