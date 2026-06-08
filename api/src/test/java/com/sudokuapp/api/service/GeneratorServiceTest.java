package com.sudokuapp.api.service;

import com.sudokuapp.api.domain.Difficulty;
import com.sudokuapp.api.domain.Grid;
import com.sudokuapp.api.domain.Puzzle;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class GeneratorServiceTest {

  private final GeneratorService generator = new GeneratorService();

  @Test
  void generateSolution_producesA9x9Grid() {
    Grid solution = generator.generateSolution();
    assertThat(solution.cells()).hasDimensions(9, 9);
  }

  @Test
  void generateSolution_producesAValidSudoku() {
    Grid solution = generator.generateSolution();
    assertThat(isValidSolution(solution)).isTrue();
  }

  @Test
  void generateSolution_producesDifferentGridsOnEachCall() {
    Grid a = generator.generateSolution();
    Grid b = generator.generateSolution();
    assertThat(a).isNotEqualTo(b);
  }

  @Test
  void generator_isDeterministicWithSeededRandom() {
    GeneratorService seededA = new GeneratorService(new Random(42));
    GeneratorService seededB = new GeneratorService(new Random(42));
    assertThat(seededA.generateSolution()).isEqualTo(seededB.generateSolution());
  }

  @ParameterizedTest
  @EnumSource(Difficulty.class)
  void generate_returnsCorrectNumberOfClues(Difficulty difficulty) {
    Puzzle puzzle = generator.generate(difficulty);
    int clues = countNonZero(puzzle.puzzle());
    int expectedClues = 81 - difficulty.cellsToRemove();
    assertThat(clues).isEqualTo(expectedClues);
  }

  @ParameterizedTest
  @EnumSource(Difficulty.class)
  void generate_solutionIsValid(Difficulty difficulty) {
    Puzzle puzzle = generator.generate(difficulty);
    assertThat(isValidSolution(puzzle.solution())).isTrue();
  }

  @ParameterizedTest
  @EnumSource(Difficulty.class)
  void generate_puzzleMatchesSolutionAtClueCells(Difficulty difficulty) {
    Puzzle puzzle = generator.generate(difficulty);
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        int clue = puzzle.puzzle().at(r, c);
        if (clue != 0) {
          assertThat(clue).isEqualTo(puzzle.solution().at(r, c));
        }
      }
    }
  }

  @ParameterizedTest
  @EnumSource(Difficulty.class)
  void generate_echoesBackTheRequestedDifficulty(Difficulty difficulty) {
    Puzzle puzzle = generator.generate(difficulty);
    assertThat(puzzle.difficulty()).isEqualTo(difficulty);
  }

  private boolean isValidSolution(Grid grid) {
    for (int i = 0; i < 9; i++) {
      Set<Integer> rowValues = new HashSet<>();
      Set<Integer> colValues = new HashSet<>();
      for (int j = 0; j < 9; j++) {
        rowValues.add(grid.at(i, j));
        colValues.add(grid.at(j, i));
      }
      if (rowValues.size() != 9 || rowValues.contains(0)) return false;
      if (colValues.size() != 9 || colValues.contains(0)) return false;
    }
    for (int br = 0; br < 3; br++) {
      for (int bc = 0; bc < 3; bc++) {
        Set<Integer> boxValues = new HashSet<>();
        for (int r = 0; r < 3; r++) {
          for (int c = 0; c < 3; c++) {
            boxValues.add(grid.at(br * 3 + r, bc * 3 + c));
          }
        }
        if (boxValues.size() != 9 || boxValues.contains(0)) return false;
      }
    }
    return true;
  }

  private int countNonZero(Grid grid) {
    int count = 0;
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        if (grid.at(r, c) != 0) count++;
      }
    }
    return count;
  }
}