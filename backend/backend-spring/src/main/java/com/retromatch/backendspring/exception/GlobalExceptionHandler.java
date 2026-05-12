package com.retromatch.backendspring.exception;

import com.retromatch.backendspring.dto.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException exception) {
        return buildResponse(HttpStatus.NOT_FOUND, exception, false);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception, false);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(Exception exception) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                new RuntimeException("Ha ocurrido un error interno. Intentalo de nuevo en unos minutos.", exception),
                true
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, RuntimeException exception, boolean withStackTrace) {
        if (withStackTrace) {
            log.error("Error no controlado en la API", exception);
        } else {
            log.warn("Error de negocio/controlado: {}", exception.getMessage());
        }

        ApiErrorResponse errorResponse = new ApiErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage()
        );

        return ResponseEntity.status(status).body(errorResponse);
    }
}
