package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import io.quarkus.security.identity.SecurityIdentity;
import net.beetechgroup.beetask.usecase.task.start.StartTaskInput;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;

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

    @Inject
    ListAllTasksUseCase listAllTasksUseCase;

    @Inject
    UpdateTaskStatusUseCase updateTaskStatusUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @POST
    @Operation(summary = "Create a new task", description = "Creates a new task in the system")
    @APIResponse(responseCode = "201", description = "Task created successfully")
    public CreateTaskResponse createTask(CreateTaskRequest request) {
        CreateTaskInput input = TaskControllerMapper.toCreateTaskInput(request);
        CreateTaskOutput output = createTaskUseCase.execute(input);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PUT
    @Path("/{id}/start")
    @Operation(summary = "Start a task", description = "Starts a task in the system")
    @APIResponse(responseCode = "200", description = "Task started successfully")
    public CreateTaskResponse startTask(@PathParam("id") Long id) {
        String email = securityIdentity.getPrincipal().getName();
        CreateTaskOutput output = startTaskUseCase.execute(new StartTaskInput(id, email));
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PUT
    @Path("/{id}/stop")
    @Operation(summary = "Stop a task", description = "Stops a task in the system")
    @APIResponse(responseCode = "200", description = "Task stopped successfully")
    public CreateTaskResponse stopTask(@PathParam("id") Long id) {
        CreateTaskOutput output = stopTaskUseCase.execute(TaskControllerMapper.toStopTaskInput(id));
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PATCH
    @Path("/{id}/status")
    @Operation(summary = "Update task status", description = "Updates the status of a task")
    @APIResponse(responseCode = "200", description = "Task status updated successfully")
    public CreateTaskResponse updateTaskStatus(@PathParam("id") Long id, TaskStatus status) {
        CreateTaskOutput output = updateTaskStatusUseCase.execute(id, status);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @GET
    @Operation(summary = "List all tasks", description = "Lists all tasks in the system")
    @APIResponse(responseCode = "200", description = "Tasks listed successfully")
    public List<CreateTaskResponse> listTasks() {
        return listAllTasksUseCase.execute().stream().map(TaskControllerMapper::toCreateTaskResponse).toList();
    }

}
