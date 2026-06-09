package com.sudokuapp.api.persistence;

import com.sudokuapp.api.domain.Difficulty;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "games")
public class GameEntity {

  @Id
  private UUID id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", nullable = false)
  private Difficulty difficulty;

  @Type(JsonBinaryType.class)
  @Column(name = "puzzle", nullable = false, columnDefinition = "jsonb")
  private int[][] puzzle;

  @Type(JsonBinaryType.class)
  @Column(name = "entries", nullable = false, columnDefinition = "jsonb")
  private int[][] entries;

  @Type(JsonBinaryType.class)
  @Column(name = "notes", nullable = false, columnDefinition = "jsonb")
  private boolean[][][] notes;

  @Type(JsonBinaryType.class)
  @Column(name = "solution", nullable = false, columnDefinition = "jsonb")
  private int[][] solution;

  @Column(name = "elapsed_ms", nullable = false)
  private long elapsedMs;

  @Column(name = "started_at", nullable = false, updatable = false)
  private Instant startedAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected GameEntity() {}

  public GameEntity(UserEntity user, Difficulty difficulty, int[][] puzzle,
                    int[][] solution, int[][] entries, boolean[][][] notes) {
    this.id = UUID.randomUUID();
    this.user = user;
    this.difficulty = difficulty;
    this.puzzle = puzzle;
    this.solution = solution;
    this.entries = entries;
    this.notes = notes;
    this.elapsedMs = 0L;
    this.startedAt = Instant.now();
    this.updatedAt = this.startedAt;
  }

  @PreUpdate
  private void touchUpdatedAt() {
    this.updatedAt = Instant.now();
  }

  public UUID getId() { return id; }
  public UserEntity getUser() { return user; }
  public Difficulty getDifficulty() { return difficulty; }
  public int[][] getPuzzle() { return puzzle; }
  public int[][] getEntries() { return entries; }
  public boolean[][][] getNotes() { return notes; }
  public int[][] getSolution() { return solution; }
  public long getElapsedMs() { return elapsedMs; }
  public Instant getStartedAt() { return startedAt; }
  public Instant getUpdatedAt() { return updatedAt; }

  public void setEntries(int[][] entries) { this.entries = entries; }
  public void setNotes(boolean[][][] notes) { this.notes = notes; }
  public void setElapsedMs(long elapsedMs) { this.elapsedMs = elapsedMs; }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof GameEntity that)) return false;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}