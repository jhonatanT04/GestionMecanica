package mecanica.ec.cue.backend.controller;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import mecanica.ec.cue.backend.service.CredencialesInvalidasException;
import mecanica.ec.cue.backend.service.ResourceNotFoundException;
import mecanica.ec.cue.backend.service.StockInsuficienteException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", HttpStatus.NOT_FOUND.value(),
                "error", "Not Found",
                "message", ex.getMessage()));
    }

    @ExceptionHandler({ StockInsuficienteException.class, IllegalArgumentException.class })
    public ResponseEntity<Map<String, Object>> handleBadRequest(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Bad Request",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", HttpStatus.UNAUTHORIZED.value(),
                "error", "Unauthorized",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String detail = ex.getMostSpecificCause().getMessage();
        String message = "El registro viola una restriccion de datos unicos";
        if (detail != null) {
            if (detail.contains("uk_usuario_email")) {
                message = "El email ya esta en uso";
            } else if (detail.contains("uk_vehiculo_placa")) {
                message = "Ya existe un vehiculo con esa placa";
            } else if (detail.contains("uk_producto_sku")) {
                message = "Ya existe un producto con ese sku";
            } else if (detail.contains("uk_factura_numero")) {
                message = "Ya existe una factura con ese numero";
            } else if (detail.contains("uk_factura_orden")) {
                message = "Esa orden ya tiene una factura generada";
            }
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", HttpStatus.CONFLICT.value(),
                "error", "Conflict",
                "message", message));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Bad Request",
                "message", message));
    }
}
