package com.sudokuapp.api.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<GameEntity, UUID> {

  Optional<GameEntity> findByUserId(UUID userId);

  void deleteByUserId(UUID userId);
}