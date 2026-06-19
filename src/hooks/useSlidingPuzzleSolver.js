import { useState, useRef, useEffect, useCallback } from 'react';
import { solveSlidingPuzzleLive } from './slidingPuzzleLogic';

/**
 * Hook to solve sliding puzzle live, showing each search step including backtracks
 * @param {number[]} board - Current puzzle board state
 * @param {number} size - Puzzle size (e.g., 3 for 3x3)
 * @returns {Object} Object with solver state and controls
 */
export function useSlidingPuzzleSolver(board, size) {
  const [isSolving, setIsSolving] = useState(false);
  const [solveDelay, setSolveDelay] = useState(100); // milliseconds between steps
  const [moveCount, setMoveCount] = useState(0);
  const [backtrackCount, setBacktrackCount] = useState(0);
  const [currentMove, setCurrentMove] = useState('');
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isBacktracking, setIsBacktracking] = useState(false);
  const solveDelayRef = useRef(solveDelay);
  const solveIntervalRef = useRef(null);
  const generatorRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => {
    solveDelayRef.current = solveDelay;
  }, [solveDelay]);

  const solve = useCallback((onBoardUpdate) => {
    if (isSolving) return;

    setIsSolving(true);
    setMoveCount(0);
    setBacktrackCount(0);
    setCurrentMove('Searching...');
    setCurrentDepth(0);
    setIsBacktracking(false);
    abortRef.current = false;

    // Initialize the generator
    generatorRef.current = solveSlidingPuzzleLive(board, size, 50);

    const processStep = async () => {
      try {
        const { value, done } = await generatorRef.current.next();

        if (done || abortRef.current) {
          setIsSolving(false);
          setCurrentMove(done ? '✓ Solved!' : 'Stopped');
          clearInterval(solveIntervalRef.current);
          return;
        }

        if (value) {
          // Update board
          onBoardUpdate(value.board);

          // Update UI
          if (value.isBacktrack) {
            setBacktrackCount((c) => c + 1);
            setIsBacktracking(true);
            setCurrentMove(`↶ Backtrack from ${value.direction}`);
          } else {
            setMoveCount((c) => c + 1);
            setIsBacktracking(false);
            setCurrentMove(`→ Trying ${value.direction.charAt(0).toUpperCase() + value.direction.slice(1)}`);
          }

          setCurrentDepth(value.depth);
        }
      } catch (error) {
        console.error('Solver error:', error);
        setIsSolving(false);
        setCurrentMove('❌ Error during solving');
        clearInterval(solveIntervalRef.current);
      }
    };

    // Start processing steps
    solveIntervalRef.current = setInterval(processStep, solveDelayRef.current);
  }, [board, size, isSolving]);

  const stop = useCallback(() => {
    abortRef.current = true;
    if (solveIntervalRef.current) {
      clearInterval(solveIntervalRef.current);
    }
    setIsSolving(false);
    setCurrentMove('');
  }, []);

  return {
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
  };
}
