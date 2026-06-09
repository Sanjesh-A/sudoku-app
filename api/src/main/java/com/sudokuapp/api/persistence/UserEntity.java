package com.sudokuapp.api.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity {

  @Id
  private UUID id;

  @Column(name = "auth0_id", nullable = false, unique = true)
  private String auth0Id;

  @Column(name = "display_name", nullable = false)
  private String displayName;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected UserEntity() {
    // JPA requires a no-arg constructor.
  }

  public UserEntity(String auth0Id, String displayName) {
    this.id = UUID.randomUUID();
    this.auth0Id = auth0Id;
    this.displayName = displayName;
    this.createdAt = Instant.now();
  }

  public UUID getId() { return id; }
  public String getAuth0Id() { return auth0Id; }
  public String getDisplayName() { return displayName; }
  public Instant getCreatedAt() { return createdAt; }

  public void setDisplayName(String displayName) { this.displayName = displayName; }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof UserEntity that)) return false;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}