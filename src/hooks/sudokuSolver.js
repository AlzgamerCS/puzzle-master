// Constants for grid size
const SIZE = 9;
const BOX_SIZE = 3;

/**
 * Converts a string-based grid (from UI) to a numeric grid for calculation.
 */
export const toNumberGrid = (grid) =>
  grid.map((row) => row.map((cell) => (cell === "" ? 0 : Number(cell))));

/**
 * Converts a numeric grid back to a string grid for the UI.
 */
export const toStringGrid = (grid) =>
  grid.map((row) => row.map((cell) => (cell === 0 ? "" : String(cell))));

/**
 * Returns all cell coordinates [r, c] that conflict with the given cell.
 * Precalculating these would be even faster, but a simple array is much better than a generator.
 */
const getNeighbors = (row, col) => {
  const cells = new Set();

  // Row and Column
  for (let i = 0; i < SIZE; i++) {
    if (i !== col) cells.add(`${row},${i}`);
    if (i !== row) cells.add(`${i},${col}`);
  }

  // 3x3 Box
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      const nr = boxRow + r;
      const nc = boxCol + c;
      if (nr !== row || nc !== col) cells.add(`${nr},${nc}`);
    }
  }

  return Array.from(cells).map((s) => s.split(",").map(Number));
};

export class SudokuSolver {
  constructor(grid) {
    this.grid = grid.map((row) => [...row]);
    // Cache neighbors for this instance if we wanted to be even faster
    this.neighborCache = Array.from({ length: SIZE }, () => []);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        this.neighborCache[r][c] = getNeighbors(r, c);
      }
    }
  }

  isValid(row, col) {
    const num = this.grid[row][col];
    if (num === 0) return true;

    // Check against neighbors
    return !this.neighborCache[row][col].some(
      ([r, c]) => this.grid[r][c] === num,
    );
  }

  getOptions(row, col) {
    if (this.grid[row][col] !== 0) return [];

    const used = new Set();
    this.neighborCache[row][col].forEach(([r, c]) => {
      const val = this.grid[r][c];
      if (val !== 0) used.add(val);
    });

    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => !used.has(v));
  }

  /**
   * Checks if the entire grid is currently valid (no conflicts).
   */
  isFullGridValid() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!this.isValid(r, c)) return false;
      }
    }
    return true;
  }

  /**
   * Finds the empty cell with the fewest possible remaining options (MRV heuristic).
   */
  findBestCell() {
    let best = { r: -1, c: -1, options: Array(10).fill(0) };

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (this.grid[r][c] === 0) {
          const options = this.getOptions(r, c);
          if (options.length < best.options.length) {
            best = { r, c, options };
            if (options.length === 0) return best; // Early exit if unsolvable
          }
        }
      }
    }
    return best;
  }

  *solveNaive() {
    const self = this;
    function* backtrack() {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (self.grid[r][c] === 0) {
            for (let num = 1; num <= 9; num++) {
              self.grid[r][c] = num;
              if (self.isValid(r, c)) {
                yield self.grid;
                if (yield* backtrack()) return true;
              }
              self.grid[r][c] = 0;
              yield self.grid;
            }
            return false;
          }
        }
      }
      return true;
    }
    return yield* backtrack();
  }

  *solveHeuristic() {
    const self = this;
    function* backtrack() {
      const { r, c, options } = self.findBestCell();

      if (r === -1) return true; // All filled
      if (options.length === 0) return false;

      for (let num of options) {
        self.grid[r][c] = num;
        yield self.grid;
        if (yield* backtrack()) return true;
        self.grid[r][c] = 0;
        yield self.grid;
      }
      return false;
    }
    return yield* backtrack();
  }
}
