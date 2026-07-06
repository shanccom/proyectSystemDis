package com.voting.voting.exception;

public class InvalidCandidateException extends RuntimeException {
    public InvalidCandidateException(String message) {
        super(message);
    }
}