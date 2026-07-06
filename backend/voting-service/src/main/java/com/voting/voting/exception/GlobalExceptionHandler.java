package com.voting.voting.exception;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(VoteAlreadyExistsException.class)
    public ResponseEntity<?> handleDuplicateVote(VoteAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("timestamp", LocalDateTime.now(), "message", ex.getMessage()));
    }

    // Captura la condición de carrera real: dos votos simultáneos que pasan
    // la validación en memoria pero chocan contra el UNIQUE(user_id, election_id) en BD.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("timestamp", LocalDateTime.now(),
                        "message", "El voto ya fue registrado (conflicto de concurrencia)."));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("timestamp", LocalDateTime.now(), "message", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCandidateException.class)
    public ResponseEntity<?> handleInvalidCandidate(InvalidCandidateException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("timestamp", LocalDateTime.now(), "message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("timestamp", LocalDateTime.now(), "message", ex.getMessage()));
    }

    // Admin Service devolvió 404 -> el recurso remoto (elección/candidato) no existe
    @ExceptionHandler(HttpClientErrorException.NotFound.class)
    public ResponseEntity<?> handleRemoteNotFound(HttpClientErrorException.NotFound ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("timestamp", LocalDateTime.now(),
                        "message", "El recurso solicitado no existe en Admin Service."));
    }

    // Admin Service no responde / timeout / caído
    @ExceptionHandler({ResourceAccessException.class, ExternalServiceException.class})
    public ResponseEntity<?> handleExternalServiceDown(Exception ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("timestamp", LocalDateTime.now(),
                        "message", "Admin Service no disponible en este momento."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("timestamp", LocalDateTime.now(), "message", ex.getMessage()));
    }
}