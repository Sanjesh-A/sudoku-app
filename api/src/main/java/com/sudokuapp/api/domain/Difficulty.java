package com.sudokuapp.api.domain;

public enum Difficulty {
  EASY(40),
  MEDIUM(48),
  HARD(54);

  private final int cellsToRemove;

  Difficulty(int cellsToRemove) {
    this.cellsToRemove = cellsToRemove;
  }

  public int cellsToRemove() {
    return cellsToRemove;
  }
}