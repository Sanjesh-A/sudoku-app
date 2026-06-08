package com.sudokuapp.api.service;

import com.sudokuapp.api.domain.Grid;
import org.springframework.stereotype.Service;

import static com.sudokuapp.api.domain.Grid.BOX;
import static com.sudokuapp.api.domain.Grid.SIZE;

@Service
public class ValidatorService {

  /**
   * Returns true if placing `value` at (row, col) would conflict with
   * another non-empty cell in the same row, column, or 3x3 box.
   *
   * The cell at (row, col) itself is ignored, so this works whether or
   * not that cell already contains `value`.
   *
   * A value of 0 (empty) never conflicts.
   */
  public boolean hasConflict(Grid grid, int row, int col, int value) {
    if (value == 0) return false;

    for (int c = 0; c < SIZE; c++) {
      if (c != col && grid.at(row, c) == value) return true;
    }
    for (int r = 0; r < SIZE; r++) {
      if (r != row && grid.at(r, col) == value) return true;
    }

    int boxRow = (row / BOX) * BOX;
    int boxCol = (col / BOX) * BOX;
    for (int r = boxRow; r < boxRow + BOX; r++) {
      for (int c = boxCol; c < boxCol + BOX; c++) {
        if ((r != row || c != col) && grid.at(r, c) == value) return true;
      }
    }

    return false;
  }

  /**
   * Returns true if the grid is completely filled with a valid solution:
   * every row, column, and 3x3 box contains exactly the digits 1-9.
   */
  public boolean isComplete(Grid grid) {
    for (int r = 0; r < SIZE; r++) {
      for (int c = 0; c < SIZE; c++) {
        if (grid.at(r, c) == 0) return false;
      }
    }

    // We already verified no zeros above, so 9 distinct values = exactly 1-9.
    for (int i = 0; i < SIZE; i++) {
      boolean[] rowSeen = new boolean[SIZE + 1];
      boolean[] colSeen = new boolean[SIZE + 1];
      for (int j = 0; j < SIZE; j++) {
        int rv = grid.at(i, j);
        int cv = grid.at(j, i);
        if (rowSeen[rv]) return false;
        if (colSeen[cv]) return false;
        rowSeen[rv] = true;
        colSeen[cv] = true;
      }
    }

    for (int br = 0; br < BOX; br++) {
      for (int bc = 0; bc < BOX; bc++) {
        boolean[] boxSeen = new boolean[SIZE + 1];
        for (int r = 0; r < BOX; r++) {
          for (int c = 0; c < BOX; c++) {
            int v = grid.at(br * BOX + r, bc * BOX + c);
            if (boxSeen[v]) return false;
            boxSeen[v] = true;
          }
        }
      }
    }

    return true;
  }
}