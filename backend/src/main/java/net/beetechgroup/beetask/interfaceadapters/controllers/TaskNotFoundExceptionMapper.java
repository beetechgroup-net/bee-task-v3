package net.beetechgroup.beetask.interfaceadapters.controllers;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import net.beetechgroup.beetask.usecase.exceptions.TaskNotFoundException;

import java.util.Map;

@Provider
public class TaskNotFoundExceptionMapper implements ExceptionMapper<TaskNotFoundException> {
    @Override
    public Response toResponse(TaskNotFoundException exception) {
        return Response.status(Response.Status.NOT_FOUND)
                .type(MediaType.APPLICATION_JSON)
                .entity(Map.of(
                        "error", "Not Found",
                        "message", exception.getMessage() != null ? exception.getMessage() : "Tarefa não encontrada"
                ))
                .build();
    }
}
