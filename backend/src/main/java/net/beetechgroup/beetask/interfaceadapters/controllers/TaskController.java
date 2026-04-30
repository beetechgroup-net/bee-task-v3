package net.beetechgroup.beetask.interfaceadapters.controllers;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.interfaceadapters.dtos.TaskDTOMapper;
import net.beetechgroup.beetask.interfaceadapters.dtos.TaskRequestDTO;
import net.beetechgroup.beetask.interfaceadapters.dtos.TaskResponseDTO;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tasks", description = "Task management operations")
public class TaskController {

    @Inject
    CreateTaskUseCase createTaskUseCase;

    @Inject
    StartTaskUseCase startTaskUseCase;

    @Inject
    StopTaskUseCase stopTaskUseCase;

    @POST
    @Operation(summary = "Create a new task", description = "Creates a new task in the system")
    @APIResponse(responseCode = "201", description = "Task created successfully")
    public TaskResponseDTO createTask(TaskRequestDTO request) {
        Task task = createTaskUseCase.execute(TaskDTOMapper.toCreateTaskInput(request));
        return TaskDTOMapper.toTaskResponseDTO(task);
    }

    @PUT
    @Path("/{id}/start")
    @Operation(summary = "Start a task", description = "Starts a task in the system")
    @APIResponse(responseCode = "200", description = "Task started successfully")
    public TaskResponseDTO startTask(@PathParam("id") Long id) {
        Task task = startTaskUseCase.execute(TaskDTOMapper.toStartTaskInput(id));
        return TaskDTOMapper.toTaskResponseDTO(task);
    }

    @PUT
    @Path("/{id}/stop")
    @Operation(summary = "Stop a task", description = "Stops a task in the system")
    @APIResponse(responseCode = "200", description = "Task stopped successfully")
    public TaskResponseDTO stopTask(@PathParam("id") Long id) {
        Task task = stopTaskUseCase.execute(TaskDTOMapper.toStopTaskInput(id));
        return TaskDTOMapper.toTaskResponseDTO(task);
    }  

}
