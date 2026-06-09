package com.sudokuapp.api.web.dto;

import com.sudokuapp.api.domain.Difficulty;

import java.time.Instant;
import java.util.UUID;

public record HistoryEntryResponse(
  UUID id,
  Difficulty difficulty,
  long elapsedMs,
  Instant completedAt
) {}