package com.sudokuapp.api.web;

import com.sudokuapp.api.persistence.GameEntity;
import com.sudokuapp.api.persistence.HistoryEntryEntity;
import com.sudokuapp.api.service.CurrentUserService;
import com.sudokuapp.api.service.GameService;
import com.sudokuapp.api.web.dto.CompleteGameRequest;
import com.sudokuapp.api.web.dto.GameResponse;
import com.sudokuapp.api.web.dto.HistoryEntryResponse;
import com.sudokuapp.api.web.dto.SaveGameRequest;
import com.sudokuapp.api.web.dto.StartGameRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class GameController {

  private final GameService gameService;
  private final CurrentUserService currentUser;

  public GameController(GameService gameService, CurrentUserService currentUser) {
    this.gameService = gameService;
    this.currentUser = currentUser;
  }

  @PostMapping("/games")
  public ResponseEntity<GameResponse> startGame(@Valid @RequestBody StartGameRequest request) {
    GameEntity game = gameService.startGame(currentUser.getCurrentUser(), request.difficulty());
    return ResponseEntity.status(HttpStatus.CREATED).body(toGameResponse(game));
  }

  @GetMapping("/games/active")
  public ResponseEntity<GameResponse> getActiveGame() {
    Optional<GameEntity> game = gameService.findActiveGame(currentUser.getCurrentUser().getId());
    return game.map(g -> ResponseEntity.ok(toGameResponse(g)))
      .orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping("/games/active")
  public GameResponse saveProgress(@Valid @RequestBody SaveGameRequest request) {
    GameEntity game = gameService.saveProgress(
      currentUser.getCurrentUser().getId(),
      request.entries(),
      request.notes(),
      request.elapsedMs()
    );
    return toGameResponse(game);
  }

  @DeleteMapping("/games/active")
  @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
  public void abandonGame() {
    gameService.abandonGame(currentUser.getCurrentUser().getId());
  }

  @PostMapping("/games/active/complete")
  public HistoryEntryResponse completeGame(@Valid @RequestBody CompleteGameRequest request) {
    HistoryEntryEntity entry = gameService.completeGame(
      currentUser.getCurrentUser(),
      request.entries(),
      request.elapsedMs()
    );
    return toHistoryResponse(entry);
  }

  @GetMapping("/history")
  public List<HistoryEntryResponse> getHistory() {
    return gameService.findHistory(currentUser.getCurrentUser().getId())
      .stream()
      .map(this::toHistoryResponse)
      .toList();
  }

  private GameResponse toGameResponse(GameEntity game) {
    return new GameResponse(
      game.getId(),
      game.getDifficulty(),
      game.getPuzzle(),
      game.getEntries(),
      game.getNotes(),
      game.getElapsedMs(),
      game.getStartedAt(),
      game.getUpdatedAt()
    );
  }

  private HistoryEntryResponse toHistoryResponse(HistoryEntryEntity entry) {
    return new HistoryEntryResponse(
      entry.getId(),
      entry.getDifficulty(),
      entry.getElapsedMs(),
      entry.getCompletedAt()
    );
  }
}