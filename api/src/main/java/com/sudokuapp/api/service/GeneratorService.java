package com.sudokuapp.api.service;

import com.sudokuapp.api.domain.Difficulty;
import com.sudokuapp.api.domain.Grid;
import com.sudokuapp.api.domain.Puzzle;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import static com.sudokuapp.api.domain.Grid.BOX;
import static com.sudokuapp.api.domain.Grid.SIZE;

/**
 * Generates valid Sudoku puzzles by starting from a known-valid grid
 * and applying validity-preserving transformations.
 */
@Service
public class GeneratorService {

  private final Random random;

  public GeneratorService() {
    this(new Random());
  }

  /**
   * Constructor that accepts an injected Random instance.
   * Useful for tests that need deterministic output via a seeded Random.
   */
  public GeneratorService(Random random) {
    this.random = random;
  }

  public Puzzle generate(Difficulty difficulty) {
    Grid solution = generateSolution();
    Grid puzzle = removeCells(solution, difficulty.cellsToRemove());
    return new Puzzle(puzzle, solution, difficulty);
  }

  Grid generateSolution() {
    int[][] cells = buildBaseGrid();
    cells = relabelDigits(cells);
    cells = shuffleRowsWithinBands(cells);
    cells = shuffleBands(cells);
    cells = shuffleColumnsWithinStacks(cells);
    cells = shuffleStacks(cells);
    return new Grid(cells);
  }

  /**
   * Builds a known-valid Sudoku grid using a row-shift pattern.
   *
   * Each row r is row 0 (1..9) shifted left by an amount chosen so
   * the result satisfies all three Sudoku constraints:
   *
   *   shift(r) = BOX * positionInBand(r) + bandIndex(r)
   *
   * - positionInBand(r) = r % 3, multiplied by 3 → rows inside a band
   *   shift by 3 each, so the 3x3 box covers all 9 digits.
   * - bandIndex(r) = r / 3 → the +1 between bands prevents the first
   *   row of the next band from duplicating an existing row, keeping
   *   every column a permutation of 1..9.
   */
  int[][] buildBaseGrid() {
    int[][] grid = new int[SIZE][SIZE];
    for (int r = 0; r < SIZE; r++) {
      int positionInBand = r % BOX;
      int bandIndex = r / BOX;
      int shift = BOX * positionInBand + bandIndex;
      for (int c = 0; c < SIZE; c++) {
        grid[r][c] = (shift + c) % SIZE + 1;
      }
    }
    return grid;
  }

  /**
   * Relabels digits by a random permutation of 1..9.
   * Sudoku digit labels are arbitrary; this preserves validity.
   */
  int[][] relabelDigits(int[][] grid) {
    List<Integer> mapping = shuffledRange(1, 9);
    int[][] result = new int[SIZE][SIZE];
    for (int r = 0; r < SIZE; r++) {
      for (int c = 0; c < SIZE; c++) {
        result[r][c] = mapping.get(grid[r][c] - 1);
      }
    }
    return result;
  }

  int[][] shuffleRowsWithinBands(int[][] grid) {
    int[][] result = new int[SIZE][SIZE];
    for (int band = 0; band < BOX; band++) {
      List<Integer> order = shuffledRange(0, BOX - 1);
      for (int i = 0; i < BOX; i++) {
        result[band * BOX + i] = grid[band * BOX + order.get(i)].clone();
      }
    }
    return result;
  }

  int[][] shuffleBands(int[][] grid) {
    List<Integer> order = shuffledRange(0, BOX - 1);
    int[][] result = new int[SIZE][SIZE];
    for (int band = 0; band < BOX; band++) {
      int sourceBand = order.get(band);
      for (int i = 0; i < BOX; i++) {
        result[band * BOX + i] = grid[sourceBand * BOX + i].clone();
      }
    }
    return result;
  }

  int[][] shuffleColumnsWithinStacks(int[][] grid) {
    int[][] result = new int[SIZE][SIZE];
    for (int r = 0; r < SIZE; r++) {
      result[r] = new int[SIZE];
    }
    for (int stack = 0; stack < BOX; stack++) {
      List<Integer> order = shuffledRange(0, BOX - 1);
      for (int r = 0; r < SIZE; r++) {
        for (int i = 0; i < BOX; i++) {
          result[r][stack * BOX + i] = grid[r][stack * BOX + order.get(i)];
        }
      }
    }
    return result;
  }

  int[][] shuffleStacks(int[][] grid) {
    int[][] result = new int[SIZE][SIZE];
    for (int r = 0; r < SIZE; r++) {
      result[r] = new int[SIZE];
    }
    List<Integer> order = shuffledRange(0, BOX - 1);
    for (int r = 0; r < SIZE; r++) {
      for (int stack = 0; stack < BOX; stack++) {
        int sourceStack = order.get(stack);
        for (int i = 0; i < BOX; i++) {
          result[r][stack * BOX + i] = grid[r][sourceStack * BOX + i];
        }
      }
    }
    return result;
  }

  Grid removeCells(Grid solution, int count) {
    int[][] puzzle = solution.copy().cells();
    List<Integer> positions = shuffledRange(0, SIZE * SIZE - 1);
    int removed = 0;
    for (int pos : positions) {
      if (removed >= count) break;
      int r = pos / SIZE;
      int c = pos % SIZE;
      if (puzzle[r][c] != 0) {
        puzzle[r][c] = 0;
        removed++;
      }
    }
    return new Grid(puzzle);
  }

  private List<Integer> shuffledRange(int lo, int hi) {
    List<Integer> list = new ArrayList<>();
    for (int i = lo; i <= hi; i++) list.add(i);
    Collections.shuffle(list, random);
    return list;
  }
}