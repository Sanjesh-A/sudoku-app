package com.sudokuapp.api.web.dto;

import com.sudokuapp.api.domain.Difficulty;
import jakarta.validation.constraints.NotNull;

public record StartGameRequest(@NotNull Difficulty difficulty) {}