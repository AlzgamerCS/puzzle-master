import { useState, useCallback, useRef, useEffect } from 'react';
import * as solver from './sudokuSolver';

const createEmptyGrid = () => Array.from({ length: 9 }, () => Array(9).fill(''));

export function useSudoku() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [fixedCells, setFixedCells] = useState(new Set());
  const [isSolving, setIsSolving] = useState(false);
  const [solveDelay, setSolveDelay] = useState(50);
  const solveDelayRef = useRef(solveDelay);

  useEffect(() => {
    solveDelayRef.current = solveDelay;
  }, [solveDelay]);

  const updateCell = useCallback((r, c, value) => {
    if (isSolving) return;
    
    // Only allow 1-9
    let newVal = value.slice(-1);
    if (!/^[1-9]$/.test(newVal)) newVal = '';

    setGrid(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = newVal;
        return next;
    });

    // Mark as fixed if the user is entering it before solving
    setFixedCells(prev => {
        const next = new Set(prev);
        if (newVal !== '') next.add(`${r},${c}`);
        else next.delete(`${r},${c}`);
        return next;
    });
  }, [isSolving]);

  const clearGrid = useCallback(() => {
    setGrid(createEmptyGrid());
    setFixedCells(new Set());
  }, []);

  const solve = async (type = 'heuristic') => {
    if (isSolving) return;
    setIsSolving(true);

    const numGrid = solver.toNumberGrid(grid);
    const s = new solver.SudokuSolver(numGrid);
    const generator = type === 'naive' ? s.solveNaive() : s.solveHeuristic();

    try {
        let step = generator.next();
        while (!step.done) {
            setGrid(solver.toStringGrid(step.value));
            if (solveDelayRef.current > 0) {
                await new Promise(resolve => setTimeout(resolve, solveDelayRef.current));
            }
            step = generator.next();
        }
        if (!step.value) alert('This puzzle has no solution!');
    } catch (e) {
        console.error(e);
        alert('An error occurred during solving.');
    } finally {
        setIsSolving(false);
    }
  };

  return {
    grid,
    fixedCells,
    isSolving,
    solveDelay,
    setSolveDelay,
    updateCell,
    clearGrid,
    solve
  };
}
