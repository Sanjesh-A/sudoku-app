package com.sudokuapp.api.service;

import com.sudokuapp.api.domain.Difficulty;
import com.sudokuapp.api.domain.Grid;
import com.sudokuapp.api.domain.Puzzle;
import com.sudokuapp.api.persistence.GameEntity;
import com.sudokuapp.api.persistence.GameRepository;
import com.sudokuapp.api.persistence.HistoryEntryEntity;
import com.sudokuapp.api.persistence.HistoryEntryRepository;
import com.sudokuapp.api.persistence.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class GameService {

  private final GeneratorService generator;
  private final ValidatorService validator;
  private final GameRepository gameRepository;
  private final HistoryEntryRepository historyRepository;

  public GameService(
    GeneratorService generator,
    ValidatorService validator,
    GameRepository gameRepository,
    HistoryEntryRepository historyRepository
  ) {
    this.generator = generator;
    this.validator = validator;
    this.gameRepository = gameRepository;
    this.historyRepository = historyRepository;
  }

  public GameEntity startGame(UserEntity user, Difficulty difficulty) {
    // Replace any existing in-progress game with the new one.
    gameRepository.deleteByUserId(user.getId());

    Puzzle puzzle = generator.generate(difficulty);
    int[][] emptyEntries = new int[9][9];
    boolean[][][] emptyNotes = new boolean[9][9][9];

    GameEntity game = new GameEntity(
      user,
      difficulty,
      puzzle.puzzle().cells(),
      puzzle.solution().cells(),
      emptyEntries,
      emptyNotes
    );
    return gameRepository.save(game);
  }

  @Transactional(readOnly = true)
  public Optional<GameEntity> findActiveGame(UUID userId) {
    return gameRepository.findByUserId(userId);
  }

  public GameEntity saveProgress(
    UUID userId,
    int[][] entries,
    boolean[][][] notes,
    long elapsedMs
  ) {
    GameEntity game = gameRepository.findByUserId(userId)
      .orElseThrow(() -> new GameNotFoundException("No active game for user"));

    game.setEntries(entries);
    game.setNotes(notes);
    game.setElapsedMs(elapsedMs);
    return game;  // dirty checking will flush on commit
  }

  public void abandonGame(UUID userId) {
    gameRepository.deleteByUserId(userId);
  }

  public HistoryEntryEntity completeGame(
    UserEntity user,
    int[][] entries,
    long elapsedMs
  ) {
    GameEntity game = gameRepository.findByUserId(user.getId())
      .orElseThrow(() -> new GameNotFoundException("No active game to complete"));

    // Verify the submitted solution is actually complete and valid.
    Grid mergedGrid = mergeGrid(game.getPuzzle(), entries);
    if (!validator.isComplete(mergedGrid)) {
      throw new InvalidCompletionException("Submitted solution is incomplete or invalid");
    }

    HistoryEntryEntity entry = new HistoryEntryEntity(user, game.getDifficulty(), elapsedMs);
    historyRepository.save(entry);
    gameRepository.delete(game);

    return entry;
  }

  @Transactional(readOnly = true)
  public List<HistoryEntryEntity> findHistory(UUID userId) {
    return historyRepository.findByUserIdOrderByCompletedAtDesc(userId);
  }

  private Grid mergeGrid(int[][] puzzle, int[][] entries) {
    int[][] merged = new int[9][9];
    for (int r = 0; r < 9; r++) {
      for (int c = 0; c < 9; c++) {
        merged[r][c] = puzzle[r][c] != 0 ? puzzle[r][c] : entries[r][c];
      }
    }
    return new Grid(merged);
  }
}