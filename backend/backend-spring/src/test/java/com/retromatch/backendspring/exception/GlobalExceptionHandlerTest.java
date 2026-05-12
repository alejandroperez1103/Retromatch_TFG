package com.retromatch.backendspring.exception;

import com.retromatch.backendspring.dto.ApiErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @Test
    void shouldReturnNotFoundResponseForMissingResources() {
        ResponseEntity<ApiErrorResponse> response = globalExceptionHandler.handleResourceNotFound(
                new ResourceNotFoundException("Producto no encontrado")
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Producto no encontrado", response.getBody().getMessage());
    }

    @Test
    void shouldReturnBadRequestResponseForBusinessErrors() {
        ResponseEntity<ApiErrorResponse> response = globalExceptionHandler.handleBusinessException(
                new BusinessException("No queda stock disponible para la talla M.")
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("No queda stock disponible para la talla M.", response.getBody().getMessage());
    }
}
