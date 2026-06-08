package com.sudokuapp.api.service;

import com.sudokuapp.api.domain.Grid;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.DisplayName;

import static org.assertj.core.api.Assertions.assertThat;

class ValidatorServiceTest {

  private final ValidatorService validator = new ValidatorService();

  private static Grid grid(int[]... rows) {
    if (rows.length != 9) throw new IllegalArgumentException("Expected 9 rows");
    return new Grid(rows);
  }

  private static int[] row(int... values) {
    if (values.length != 9) throw new IllegalArgumentException("Expected 9 values");
    return values;
  }

  private static Grid empty() {
    return Grid.empty();
  }

  private static final Grid SOLVED = grid(
    row(5, 3, 4, 6, 7, 8, 9, 1, 2),
    row(6, 7, 2, 1, 9, 5, 3, 4, 8),
    row(1, 9, 8, 3, 4, 2, 5, 6, 7),
    row(8, 5, 9, 7, 6, 1, 4, 2, 3),
    row(4, 2, 6, 8, 5, 3, 7, 9, 1),
    row(7, 1, 3, 9, 2, 4, 8, 5, 6),
    row(9, 6, 1, 5, 3, 7, 2, 8, 4),
    row(2, 8, 7, 4, 1, 9, 6, 3, 5),
    row(3, 4, 5, 2, 8, 6, 1, 7, 9)
  );

  @Nested
  @DisplayName("hasConflict")
  class HasConflictTests {

    @Test
    void returnsFalseForAnEmptyValue() {
      assertThat(validator.hasConflict(SOLVED, 0, 0, 0)).isFalse();
    }

    @Test
    void returnsFalseForAValueThatFitsInAnEmptyGrid() {
      assertThat(validator.hasConflict(empty(), 0, 0, 5)).isFalse();
    }

    @Test
    void detectsADuplicateInTheSameRow() {
      Grid g = empty();
      g.cells()[0][3] = 5;
      assertThat(validator.hasConflict(g, 0, 7, 5)).isTrue();
    }

    @Test
    void ignoresTheSameColumnInADifferentRow() {
      Grid g = empty();
      g.cells()[5][3] = 5;
      assertThat(validator.hasConflict(g, 0, 7, 5)).isFalse();
    }

    @Test
    void detectsADuplicateInTheSameColumn() {
      Grid g = empty();
      g.cells()[3][2] = 7;
      assertThat(validator.hasConflict(g, 8, 2, 7)).isTrue();
    }

    @Test
    void detectsADuplicateInTheSameBox() {
      Grid g = empty();
      g.cells()[0][0] = 9;
      assertThat(validator.hasConflict(g, 2, 2, 9)).isTrue();
    }

    @Test
    void doesNotFlagADuplicateInADifferentBox() {
      Grid g = empty();
      g.cells()[0][0] = 9;
      assertThat(validator.hasConflict(g, 3, 3, 9)).isFalse();
    }

    @Test
    void doesNotFlagTheCellAgainstItself() {
      Grid g = empty();
      g.cells()[0][0] = 5;
      assertThat(validator.hasConflict(g, 0, 0, 5)).isFalse();
    }
  }

  @Nested
  @DisplayName("isComplete")
  class IsCompleteTests {

    @Test
    void returnsTrueForAValidSolvedGrid() {
      assertThat(validator.isComplete(SOLVED)).isTrue();
    }

    @Test
    void returnsFalseForAnEmptyGrid() {
      assertThat(validator.isComplete(empty())).isFalse();
    }

    @Test
    void returnsFalseWhenAnyCellIsEmpty() {
      Grid g = SOLVED.copy();
      g.cells()[4][4] = 0;
      assertThat(validator.isComplete(g)).isFalse();
    }

    @Test
    void returnsFalseForARowWithADuplicate() {
      Grid g = SOLVED.copy();
      g.cells()[0][1] = 5;
      assertThat(validator.isComplete(g)).isFalse();
    }

    @Test
    void returnsFalseForAColumnWithADuplicate() {
      Grid g = SOLVED.copy();
      g.cells()[1][0] = 5;
      assertThat(validator.isComplete(g)).isFalse();
    }

    @Test
    void returnsFalseForABoxWithADuplicate() {
      Grid g = SOLVED.copy();
      g.cells()[1][1] = 5;
      assertThat(validator.isComplete(g)).isFalse();
    }
  }
}