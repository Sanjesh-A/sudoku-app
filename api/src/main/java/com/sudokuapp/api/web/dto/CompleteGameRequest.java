package com.sudokuapp.api.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CompleteGameRequest(
  @NotNull int[][] entries,
  @NotNull @PositiveOrZero Long elapsedMs
) {}