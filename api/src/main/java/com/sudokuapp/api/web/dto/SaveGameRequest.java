package com.sudokuapp.api.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record SaveGameRequest(
  @NotNull int[][] entries,
  @NotNull boolean[][][] notes,
  @NotNull @PositiveOrZero Long elapsedMs
) {}