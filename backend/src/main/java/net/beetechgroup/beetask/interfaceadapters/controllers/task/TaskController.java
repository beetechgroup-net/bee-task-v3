package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import jakarta.inject.Inject;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import net.beetechgroup.beetask.usecase.task.start.StartTaskInput;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.delete.DeleteTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListMyTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.ai.EnrichTaskDescriptionInput;
import net.beetechgroup.beetask.usecase.task.ai.EnrichTaskDescriptionOutput;
import net.beetechgroup.beetask.usecase.task.ai.EnrichTaskDescriptionUseCase;
import net.beetechgroup.beetask.usecase.task.ai.ParseTaskWithAiInput;
import net.beetechgroup.beetask.usecase.task.ai.ParsedTaskOutput;
import net.beetechgroup.beetask.usecase.task.ai.ParseTaskWithAiUseCase;
import net.beetechgroup.beetask.usecase.task.get.GetTaskUseCase;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
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
    DeleteTaskUseCase deleteTaskUseCase;

    @Inject
    ParseTaskWithAiUseCase parseTaskWithAiUseCase;

    @Inject
    EnrichTaskDescriptionUseCase enrichTaskDescriptionUseCase;

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
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Task details requested for task %d by %s", id, email);
        return TaskControllerMapper.toCreateTaskResponse(getTaskUseCase.execute(id, email));
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
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested stop for task %d", email, id);
        CreateTaskOutput output = stopTaskUseCase.execute(TaskControllerMapper.toStopTaskInput(id, email));
        LOGGER.infof("Task %d stopped successfully", id);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PUT
    @Path("/{id}/status")
    @Consumes({MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN})
    @Operation(summary = "Update task status (PUT)", description = "Updates the status of a task")
    @APIResponse(responseCode = "200", description = "Task status updated successfully")
    public CreateTaskResponse updateTaskStatusPut(@PathParam("id") Long id, String rawStatus) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Status update (PUT) requested for task %d to %s by %s", id, rawStatus, email);
        CreateTaskOutput output = updateTaskStatusUseCase.execute(id, rawStatus, email);
        LOGGER.infof("Task %d status updated successfully", id);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PATCH
    @Path("/{id}/status")
    @Consumes({MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN})
    @Operation(summary = "Update task status (PATCH)", description = "Updates the status of a task")
    @APIResponse(responseCode = "200", description = "Task status updated successfully")
    public CreateTaskResponse updateTaskStatusPatch(@PathParam("id") Long id, String rawStatus) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Status update (PATCH) requested for task %d to %s by %s", id, rawStatus, email);
        CreateTaskOutput output = updateTaskStatusUseCase.execute(id, rawStatus, email);
        LOGGER.infof("Task %d status updated successfully", id);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @PUT
    @Path("/{id}/status/{statusId}")
    @Operation(summary = "Update task status by ID", description = "Updates the status of a task by status ID")
    @APIResponse(responseCode = "200", description = "Task status updated successfully")
    public CreateTaskResponse updateTaskStatusById(@PathParam("id") Long id, @PathParam("statusId") Long statusId) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Status update by ID requested for task %d to status %d by %s", id, statusId, email);
        CreateTaskOutput output = updateTaskStatusUseCase.execute(id, statusId, null, email);
        LOGGER.infof("Task %d status updated successfully to status %d", id, statusId);
        return TaskControllerMapper.toCreateTaskResponse(output);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a task", description = "Deletes a task if requester is admin of the organization or the owner/creator")
    @APIResponse(responseCode = "204", description = "Task deleted successfully")
    public Response deleteTask(@PathParam("id") Long id) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested deletion of task %d", email, id);
        deleteTaskUseCase.execute(id, email);
        return Response.noContent().build();
    }

    @GET
    @Operation(summary = "List all tasks", description = "Lists all tasks in the system")
    @APIResponse(responseCode = "200", description = "Tasks listed successfully")
    public List<CreateTaskResponse> listTasks(@BeanParam ListTasksRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        List<CreateTaskResponse> tasks = listAllTasksUseCase.execute(TaskControllerMapper.toListTasksInput(request, email))
                .stream().map(TaskControllerMapper::toCreateTaskResponse).toList();
        LOGGER.infof("Listed %d accessible tasks for user %s", tasks.size(), email);
        return tasks;
    }

    @GET
    @Path("/mine")
    @Operation(summary = "List my tasks", description = "Lists all tasks belonging to the authenticated user, with optional filters")
    @APIResponse(responseCode = "200", description = "Tasks listed successfully")
    public List<CreateTaskResponse> listMyTasks(@BeanParam ListMyTasksRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        List<CreateTaskResponse> tasks = listMyTasksUseCase.execute(TaskControllerMapper.toListMyTasksInput(request, email))
                .stream().map(TaskControllerMapper::toCreateTaskResponse).toList();
        LOGGER.infof("Listed %d tasks for user %s", tasks.size(), email);
        return tasks;
    }

    @POST
    @Path("/ai/parse")
    @Operation(summary = "Parse natural language task", description = "Extracts task details from natural language using AI")
    @APIResponse(responseCode = "200", description = "Task parsed successfully")
    public ParsedTaskResponse parseTaskWithAi(ParseTaskWithAiRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested AI task parsing for org %d", email, request.organizationId());
        ParsedTaskOutput output = parseTaskWithAiUseCase.execute(
                new ParseTaskWithAiInput(email, request.organizationId(), request.prompt())
        );
        return new ParsedTaskResponse(
                output.title(),
                output.description(),
                output.projectId(),
                output.categoryId(),
                output.assigneeUserId(),
                output.externalUrl(),
                output.status()
        );
    }

    @POST
    @Path("/ai/enrich")
    @Operation(summary = "Enrich task description", description = "Generates structured description and acceptance criteria using AI")
    @APIResponse(responseCode = "200", description = "Task description enriched successfully")
    public EnrichTaskDescriptionResponse enrichTaskDescription(EnrichTaskDescriptionRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested AI description enrichment for task '%s'", email, request.title());
        EnrichTaskDescriptionOutput output = enrichTaskDescriptionUseCase.execute(
                new EnrichTaskDescriptionInput(
                        email,
                        request.organizationId(),
                        request.title(),
                        request.currentDescription(),
                        request.projectId(),
                        request.categoryId()
                )
        );
        return new EnrichTaskDescriptionResponse(output.description());
    }

}
