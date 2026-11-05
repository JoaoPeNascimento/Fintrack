package com.fintrack.infrastructure.web;

import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.shared.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** Converte erros de negócio em respostas {@code { "message": "..." }} consumidas pelo front-end. */
@RestControllerAdvice
public class ApiExceptionHandler {

    public record ErrorResponse(String message) {
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse notFound(NotFoundException e) {
        return new ErrorResponse(e.getMessage());
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse invalid(ValidationException e) {
        return new ErrorResponse(e.getMessage());
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse malformed(Exception e) {
        return new ErrorResponse("Requisição inválida.");
    }
}
