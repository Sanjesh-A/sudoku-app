package com.sudokuapp.api.web.dto;

import com.sudokuapp.api.domain.Difficulty;

import java.time.Instant;
import java.util.UUID;

public record GameResponse(
  UUID id,
  Difficulty difficulty,
  int[][] puzzle,
  int[][] entries,
  boolean[][][] notes,
  long elapsedMs,
  Instant startedAt,
  Instant updatedAt
) {}