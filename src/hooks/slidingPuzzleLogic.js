export function createSolvedBoard(size) {
  const arr = Array.from({ length: size * size }, (_, i) => i + 1);
  arr[arr.length - 1] = 0;
  return arr;
}

export function getEmptyIndex(board) {
  return board.indexOf(0);
}

export function getRowCol(index, size) {
  return [Math.floor(index / size), index % size];
}

export function getIndex(row, col, size) {
  return row * size + col;
}

export function swap(board, i, j) {
  const newBoard = [...board];
  [newBoard[i], newBoard[j]] = [newBoard[j], newBoard[i]];
  return newBoard;
}

export function move(board, size, direction) {
  const empty = getEmptyIndex(board);
  const [r, c] = getRowCol(empty, size);

  let target;

  if (direction === "up" && r < size - 1) target = getIndex(r + 1, c, size);
  if (direction === "down" && r > 0) target = getIndex(r - 1, c, size);
  if (direction === "left" && c < size - 1) target = getIndex(r, c + 1, size);
  if (direction === "right" && c > 0) target = getIndex(r, c - 1, size);
  if (target === undefined) return board;

  return swap(board, empty, target);
}

export function shuffle(board, size, steps = 200) {
  const dirs = ["up", "down", "left", "right"];
  let b = board;

  for (let i = 0; i < steps; i++) {
    const d = dirs[Math.floor(Math.random() * 4)];
    b = move(b, size, d);
  }

  return b;
}

// Helper to check if board is solved
function isSolved(board) {
  // solved board is 1..N-1,0 at the end
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

/**
 * Depth‑first backtracking solver for the sliding puzzle.
 * Returns an array of directions ("up", "down", "left", "right") that
 * transforms the supplied board into the solved state, or `null` if no
 * solution is found within the optional depth limit.
 *
 * This naive DFS works for small boards (e.g., 3×3) and is intended as a
 * demonstration. For larger boards consider A* or IDA*.
 */
export function solveSlidingPuzzle(initialBoard, size, maxDepth = 50) {
  const visited = new Set();
  const startKey = initialBoard.join(",");
  visited.add(startKey);

  function dfs(board, path) {
    if (isSolved(board)) return path;
    if (path.length >= maxDepth) return null;

    const empty = getEmptyIndex(board);
    const [r, c] = getRowCol(empty, size);
    const directions = [];
    if (r < size - 1) directions.push("up");
    if (r > 0) directions.push("down");
    if (c < size - 1) directions.push("left");
    if (c > 0) directions.push("right");

    for (const dir of directions) {
      const nextBoard = move(board, size, dir);
      const key = nextBoard.join(",");
      if (visited.has(key)) continue;
      visited.add(key);
      const result = dfs(nextBoard, [...path, dir]);
      if (result) return result;
      visited.delete(key);
    }
    return null;
  }

  return dfs(initialBoard, []);
}

/**
 * Calculate Manhattan distance heuristic for the sliding puzzle
 * Returns the sum of distances each tile is from its goal position
 */
export function calculateManhattanDistance(board, size) {
  let distance = 0;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0) continue; // Skip empty tile
    const value = board[i];
    const goalIndex = value - 1; // Goal position for this value
    const currentRow = Math.floor(i / size);
    const currentCol = i % size;
    const goalRow = Math.floor(goalIndex / size);
    const goalCol = goalIndex % size;
    distance += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
  }
  return distance;
}

/**
 * Live solving generator that yields each step (move and backtrack)
 * Returns {board, direction, isBacktrack} for each step
 */
export async function* solveSlidingPuzzleLive(initialBoard, size, maxDepth = 60) {
  const visited = new Set();
  const startKey = initialBoard.join(",");
  visited.add(startKey);

  let stepCount = 0;
  const YIELD_FREQUENCY = 10; // Yield every N iterations

  function* dfsGenerator(board, path, depth) {
    stepCount++;

    // Yield control periodically
    if (stepCount % YIELD_FREQUENCY === 0) {
      yield null; // Null means no UI update, just yield for responsiveness
    }

    if (isSolved(board)) {
      return path;
    }

    if (depth >= maxDepth) {
      return null;
    }

    const empty = getEmptyIndex(board);
    const [r, c] = getRowCol(empty, size);

    // Get possible directions
    const possibleMoves = [];
    if (r < size - 1) possibleMoves.push("up");
    if (r > 0) possibleMoves.push("down");
    if (c < size - 1) possibleMoves.push("left");
    if (c > 0) possibleMoves.push("right");

    // Sort directions by heuristic (manhattan distance)
    // Try moves that reduce manhattan distance first
    const currentDistance = calculateManhattanDistance(board, size);
    possibleMoves.sort((dirA, dirB) => {
      const boardA = move(board, size, dirA);
      const boardB = move(board, size, dirB);
      const distA = calculateManhattanDistance(boardA, size);
      const distB = calculateManhattanDistance(boardB, size);
      return distA - distB;
    });

    for (const dir of possibleMoves) {
      const nextBoard = move(board, size, dir);
      const key = nextBoard.join(",");

      if (visited.has(key)) continue;

      visited.add(key);

      // Yield the move being tried
      yield {
        board: nextBoard,
        direction: dir,
        isBacktrack: false,
        depth: depth + 1,
      };

      const result = yield* dfsGenerator(nextBoard, [...path, dir], depth + 1);
      if (result) return result;

      visited.delete(key);

      // Yield backtrack
      yield {
        board: board,
        direction: dir,
        isBacktrack: true,
        depth: depth,
      };
    }

    return null;
  }

  // Convert generator to async generator
  for (const step of dfsGenerator(initialBoard, [], 0)) {
    yield step;
    // Yield control to browser periodically
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

// Export the helper for potential external tests (optional)
export { isSolved };

