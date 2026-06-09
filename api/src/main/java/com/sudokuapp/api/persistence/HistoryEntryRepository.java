package com.sudokuapp.api.persistence;

import com.sudokuapp.api.domain.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HistoryEntryRepository extends JpaRepository<HistoryEntryEntity, UUID> {

  List<HistoryEntryEntity> findByUserIdOrderByCompletedAtDesc(UUID userId);

  Optional<HistoryEntryEntity>
  findFirstByUserIdAndDifficultyOrderByElapsedMsAsc(UUID userId, Difficulty difficulty);
}