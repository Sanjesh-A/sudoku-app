package com.sudokuapp.api.domain;

import java.util.Arrays;

public record Grid(int[][] cells) {

  public static final int SIZE = 9;
  public static final int BOX = 3;

  public Grid {
    if (cells.length != SIZE) {
      throw new IllegalArgumentException("Grid must have " + SIZE + " rows");
    }
    for (int[] row : cells) {
      if (row.length != SIZE) {
        throw new IllegalArgumentException("Each row must have " + SIZE + " columns");
      }
    }
  }

  public static Grid empty() {
    return new Grid(new int[SIZE][SIZE]);
  }

  public int at(int row, int col) {
    return cells[row][col];
  }

  public Grid copy() {
    int[][] copy = new int[SIZE][SIZE];
    for (int r = 0; r < SIZE; r++) {
      copy[r] = cells[r].clone();
    }
    return new Grid(copy);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) return true;
    if (!(other instanceof Grid otherGrid)) return false;
    return Arrays.deepEquals(this.cells, otherGrid.cells);
  }

  @Override
  public int hashCode() {
    return Arrays.deepHashCode(cells);
  }
}