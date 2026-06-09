package com.sudokuapp.api.web;

import com.sudokuapp.api.service.GameNotFoundException;
import com.sudokuapp.api.service.InvalidCompletionException;
import com.sudokuapp.api.web.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(GameNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(GameNotFoundException ex) {
    return error(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(InvalidCompletionException.class)
  public ResponseEntity<ErrorResponse> handleInvalidCompletion(InvalidCompletionException ex) {
    return error(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getAllErrors().stream()
      .map(err -> err.getDefaultMessage())
      .findFirst()
      .orElse("Validation failed");
    return error(HttpStatus.BAD_REQUEST, message);
  }

  private ResponseEntity<ErrorResponse> error(HttpStatus status, String message) {
    return ResponseEntity.status(status).body(new ErrorResponse(
      Instant.now(),
      status.value(),
      status.getReasonPhrase(),
      message
    ));
  }
}