package com.sudokuapp.api.persistence;

import com.sudokuapp.api.TestcontainersConfig;
import com.sudokuapp.api.domain.Difficulty;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
@Import(TestcontainersConfig.class)
class GameRepositoryTest {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private GameRepository gameRepository;

  @Autowired
  private jakarta.persistence.EntityManager entityManager;

  @Test
  void saveAndLoadGame_roundTripsAllFields() {
    UserEntity user = userRepository.save(new UserEntity("auth0|alice", "Alice"));

    int[][] puzzle = newGrid();
    puzzle[0][0] = 5;
    int[][] solution = newGrid();
    solution[0][0] = 5;
    solution[0][1] = 3;
    int[][] entries = newGrid();
    boolean[][][] notes = newNotes();
    notes[2][3][4] = true;

    GameEntity game = new GameEntity(user, Difficulty.MEDIUM, puzzle, solution, entries, notes);
    GameEntity saved = gameRepository.save(game);
    gameRepository.flush();

    Optional<GameEntity> loaded = gameRepository.findByUserId(user.getId());

    assertThat(loaded).isPresent();
    GameEntity g = loaded.get();
    assertThat(g.getId()).isEqualTo(saved.getId());
    assertThat(g.getUser().getId()).isEqualTo(user.getId());
    assertThat(g.getDifficulty()).isEqualTo(Difficulty.MEDIUM);
    assertThat(g.getPuzzle()[0][0]).isEqualTo(5);
    assertThat(g.getSolution()[0][1]).isEqualTo(3);
    assertThat(g.getNotes()[2][3][4]).isTrue();
  }

  @Test
  void enforcesOneGamePerUser() {
    UserEntity user = userRepository.save(new UserEntity("auth0|bob", "Bob"));

    GameEntity first = new GameEntity(user, Difficulty.EASY, newGrid(), newGrid(), newGrid(), newNotes());
    gameRepository.save(first);

    GameEntity second = new GameEntity(user, Difficulty.HARD, newGrid(), newGrid(), newGrid(), newNotes());

    assertThat(catchThrowable(() -> {
      gameRepository.save(second);
      gameRepository.flush();
    }))
      .isNotNull()
      .hasMessageContaining("constraint");
  }

  @Test
  void findByUserId_returnsEmptyWhenNoGame() {
    UserEntity user = userRepository.save(new UserEntity("auth0|carol", "Carol"));
    assertThat(gameRepository.findByUserId(user.getId())).isEmpty();
  }

  @Test
  void deleteByUserId_removesTheGame() {
    UserEntity user = userRepository.save(new UserEntity("auth0|dave", "Dave"));
    gameRepository.save(new GameEntity(user, Difficulty.MEDIUM, newGrid(), newGrid(), newGrid(), newNotes()));

    gameRepository.deleteByUserId(user.getId());
    gameRepository.flush();

    assertThat(gameRepository.findByUserId(user.getId())).isEmpty();
  }

  @Test
  void cascadeDelete_removesGameWhenUserIsDeleted() {
    UserEntity user = userRepository.save(new UserEntity("auth0|eve", "Eve"));
    UUID userId = user.getId();
    gameRepository.save(new GameEntity(user, Difficulty.HARD, newGrid(), newGrid(), newGrid(), newNotes()));
    gameRepository.flush();

    // Clear JPA's tracking of these entities so the database cascade isn't
    // shadowed by Hibernate's own relationship handling.
    entityManager.clear();

    userRepository.deleteById(userId);
    userRepository.flush();

    assertThat(gameRepository.findByUserId(userId)).isEmpty();
  }

  private static int[][] newGrid() {
    return new int[9][9];
  }

  private static boolean[][][] newNotes() {
    return new boolean[9][9][9];
  }

  private static Throwable catchThrowable(Runnable r) {
    try {
      r.run();
      return null;
    } catch (Throwable t) {
      return t;
    }
  }
}