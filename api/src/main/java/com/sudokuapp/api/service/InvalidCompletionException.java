package com.sudokuapp.api.service;

public class InvalidCompletionException extends RuntimeException {
  public InvalidCompletionException(String message) {
    super(message);
  }
}