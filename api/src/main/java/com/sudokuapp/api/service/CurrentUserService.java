package com.sudokuapp.api.service;

import com.sudokuapp.api.persistence.UserEntity;
import com.sudokuapp.api.persistence.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CurrentUserService {

  private static final String PLACEHOLDER_AUTH0_ID = "dev|placeholder";
  private static final String PLACEHOLDER_DISPLAY_NAME = "Dev User";

  private final UserRepository userRepository;

  public CurrentUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public UserEntity getCurrentUser() {
    return userRepository.findByAuth0Id(PLACEHOLDER_AUTH0_ID)
      .orElseGet(() -> userRepository.save(
        new UserEntity(PLACEHOLDER_AUTH0_ID, PLACEHOLDER_DISPLAY_NAME)
      ));
  }
}