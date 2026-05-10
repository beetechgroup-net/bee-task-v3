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
import org.jboss.logging.Logger;

import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListMyTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.get.GetTaskUseCase;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tasks", description = "Task management operations")
public class TaskController {
    private static final Logger LOGGER = Logger.getLogger(TaskController.class);

    @Inject
    CreateTaskUseCase createTaskUseCase;

    @Inject
    StartTaskUseCase startTaskUseCase;

    @Inject
    StopTaskUseCase stopTaskUseCase;

    @Inject
    ListAllTasksUseCase listAllTasksUseCase;

    @Inject
    ListMyTasksUseCase listMyTasksUseCase;

    @Inject
    UpdateTaskStatusUseCase updateTaskStatusUseCase;
    
    @Inject
    UpdateTaskUseCase updateTaskUseCase;

    @Inject
    GetTaskUseCase getTaskUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @POST
    @Operation(summary = "Create a new task", description = "Creates a new task in the system")
    @APIResponse(responseCode = "201", description = "Task created successfully")
    public CreateTaskResponse createTask(CreateTaskRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested task creation with title '%s'", email, request.title());
        CreateTaskInput input = TaskControllerMapper.toCreateTaskInput(request, email);
        CreateTaskOutput output = createTaskUseCase.execute(input);
        LOGGER.infof("Task %d created successfully by user %s", output.id(), email);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update a task", description = "Updates an existing task in the system")
    @APIResponse(responseCode = "200", description = "Task updated successfully")
    public CreateTaskResponse updateTask(@PathParam("id") Long id, CreateTaskRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested update for task %d", email, id);
        CreateTaskOutput output = updateTaskUseCase.execute(TaskControllerMapper.toUpdateTaskInput(id, request, email));
        LOGGER.infof("Task %d updated successfully by user %s", id, email);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a task", description = "Gets a specific task by ID")
    @APIResponse(responseCode = "200", description = "Task retrieved successfully")
    public CreateTaskResponse getTask(@PathParam("id") Long id) {
        LOGGER.infof("Task details requested for task %d", id);
        return TaskControllerMapper.toCreateTaskResponse(getTaskUseCase.execute(id));
    }

    @PUT
    @Path("/{id}/start")
    @Operation(summary = "Start a task", description = "Starts a task in the system")
    @APIResponse(responseCode = "200", description = "Task started successfully")
    public CreateTaskResponse startTask(@PathParam("id") Long id) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested start for task %d", email, id);
        CreateTaskOutput output = startTaskUseCase.execute(new StartTaskInput(id, email));
        LOGGER.infof("Task %d started successfully by user %s", id, email);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PUT
    @Path("/{id}/stop")
    @Operation(summary = "Stop a task", description = "Stops a task in the system")
    @APIResponse(responseCode = "200", description = "Task stopped successfully")
    public CreateTaskResponse stopTask(@PathParam("id") Long id) {
        LOGGER.infof("Stop requested for task %d", id);
        CreateTaskOutput output = stopTaskUseCase.execute(TaskControllerMapper.toStopTaskInput(id));
        LOGGER.infof("Task %d stopped successfully", id);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PATCH
    @Path("/{id}/status")
    @Operation(summary = "Update task status", description = "Updates the status of a task")
    @APIResponse(responseCode = "200", description = "Task status updated successfully")
    public CreateTaskResponse updateTaskStatus(@PathParam("id") Long id, TaskStatus status) {
        LOGGER.infof("Status update requested for task %d to %s", id, status);
        CreateTaskOutput output = updateTaskStatusUseCase.execute(id, status);
        LOGGER.infof("Task %d status updated successfully to %s", id, status);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @GET
    @Operation(summary = "List all tasks", description = "Lists all tasks in the system")
    @APIResponse(responseCode = "200", description = "Tasks listed successfully")
    public List<CreateTaskResponse> listTasks() {
        List<CreateTaskResponse> tasks = listAllTasksUseCase.execute().stream().map(TaskControllerMapper::toCreateTaskResponse).toList();
        LOGGER.infof("Listed %d tasks", tasks.size());
        return tasks;
    }

    @GET
    @Path("/mine")
    @Operation(summary = "List my tasks", description = "Lists all tasks belonging to the authenticated user")
    @APIResponse(responseCode = "200", description = "Tasks listed successfully")
    public List<CreateTaskResponse> listMyTasks() {
        String email = securityIdentity.getPrincipal().getName();
        List<CreateTaskResponse> tasks = listMyTasksUseCase.execute(email).stream().map(TaskControllerMapper::toCreateTaskResponse).toList();
        LOGGER.infof("Listed %d tasks for user %s", tasks.size(), email);
        return tasks;
    }

}
