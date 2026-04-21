package net.beetechgroup.beetask.interfaceadapters.controllers;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.interfaceadapters.dtos.TaskDTOMapper;
import net.beetechgroup.beetask.interfaceadapters.dtos.TaskRequestDTO;
import net.beetechgroup.beetask.interfaceadapters.dtos.TaskResponseDTO;
import net.beetechgroup.beetask.usecase.createtask.CreateTaskUseCase;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tasks", description = "Task management operations")
public class TaskController {

    @Inject
    CreateTaskUseCase createTaskUseCase;

    @POST
    @Operation(summary = "Create a new task", description = "Creates a new task in the system")
    @APIResponse(responseCode = "201", description = "Task created successfully")
    public TaskResponseDTO createTask(TaskRequestDTO request) {
        Task task = createTaskUseCase.execute(TaskDTOMapper.toInput(request));
        return TaskDTOMapper.toResponse(task);
    }
}
