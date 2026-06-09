package com.sudokuapp.api.persistence;

import com.sudokuapp.api.domain.Difficulty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "history_entries")
public class HistoryEntryEntity {

  @Id
  private UUID id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", nullable = false)
  private Difficulty difficulty;

  @Column(name = "elapsed_ms", nullable = false)
  private long elapsedMs;

  @Column(name = "completed_at", nullable = false, updatable = false)
  private Instant completedAt;

  protected HistoryEntryEntity() {}

  public HistoryEntryEntity(UserEntity user, Difficulty difficulty, long elapsedMs) {
    this.id = UUID.randomUUID();
    this.user = user;
    this.difficulty = difficulty;
    this.elapsedMs = elapsedMs;
    this.completedAt = Instant.now();
  }

  public UUID getId() { return id; }
  public UserEntity getUser() { return user; }
  public Difficulty getDifficulty() { return difficulty; }
  public long getElapsedMs() { return elapsedMs; }
  public Instant getCompletedAt() { return completedAt; }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof HistoryEntryEntity that)) return false;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}