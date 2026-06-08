package com.sudokuapp.api.domain;

public record Puzzle(Grid puzzle, Grid solution, Difficulty difficulty) {}