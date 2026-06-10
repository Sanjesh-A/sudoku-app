package com.sudokuapp.api.service;

import com.sudokuapp.api.persistence.UserEntity;
import com.sudokuapp.api.persistence.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CurrentUserService {

  private final UserRepository userRepository;

  public CurrentUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public UserEntity getCurrentUser() {
    Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String auth0Id = jwt.getSubject();

    return userRepository.findByAuth0Id(auth0Id)
      .orElseGet(() -> createUserFromJwt(jwt));
  }

  private UserEntity createUserFromJwt(Jwt jwt) {
    String auth0Id = jwt.getSubject();
    String displayName = (String) jwt.getClaims().getOrDefault("name", auth0Id);
    return userRepository.save(new UserEntity(auth0Id, displayName));
  }
}