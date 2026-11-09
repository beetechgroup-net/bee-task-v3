package net.beetechgroup.beetask.interfaceadapters.controllers.taskstatus;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import net.beetechgroup.beetask.usecase.taskstatus.CreateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.DeleteTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.ListTaskStatusesUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.ReorderTaskStatusesUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.UpdateTaskStatusInfoUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

@Path("/organizations/{orgId}/task-statuses")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@Tag(name = "Task Statuses", description = "Task status operations")
public class TaskStatusController {
    private static final Logger LOGGER = Logger.getLogger(TaskStatusController.class);

    @Inject
    ListTaskStatusesUseCase listTaskStatusesUseCase;

    @Inject
    CreateTaskStatusUseCase createTaskStatusUseCase;

    @Inject
    UpdateTaskStatusInfoUseCase updateTaskStatusInfoUseCase;

    @Inject
    DeleteTaskStatusUseCase deleteTaskStatusUseCase;

    @Inject
    ReorderTaskStatusesUseCase reorderTaskStatusesUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    @Operation(summary = "List task statuses", description = "Lists all task statuses for an organization")
    @APIResponse(responseCode = "200", description = "Task statuses listed successfully")
    public List<TaskStatusResponse> listStatuses(@PathParam("orgId") Long orgId) {
        String email = securityIdentity.getPrincipal().getName();
        return listTaskStatusesUseCase.execute(email, orgId).stream()
                .map(TaskStatusControllerMapper::toResponse)
                .toList();
    }

    @POST
    @Transactional
    @Operation(summary = "Create task status", description = "Creates a new task status in the organization")
    @APIResponse(responseCode = "201", description = "Task status created successfully")
    public Response createStatus(@PathParam("orgId") Long orgId, TaskStatusRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Creating task status '%s' in organization %d by %s", request.name(), orgId, email);
        var output = createTaskStatusUseCase.execute(TaskStatusControllerMapper.toCreateInput(email, orgId, request));
        return Response.status(Response.Status.CREATED).entity(TaskStatusControllerMapper.toResponse(output)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Update task status", description = "Updates an existing task status")
    @APIResponse(responseCode = "200", description = "Task status updated successfully")
    public TaskStatusResponse updateStatus(@PathParam("orgId") Long orgId, @PathParam("id") Long id, TaskStatusRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Updating task status %d in organization %d by %s", id, orgId, email);
        var output = updateTaskStatusInfoUseCase.execute(TaskStatusControllerMapper.toUpdateInput(email, orgId, id, request));
        return TaskStatusControllerMapper.toResponse(output);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete task status", description = "Deletes a task status, optionally reassigning tasks to another status")
    @APIResponse(responseCode = "204", description = "Task status deleted successfully")
    public Response deleteStatus(@PathParam("orgId") Long orgId,
                                 @PathParam("id") Long id,
                                 @QueryParam("moveToStatusId") Long moveToStatusId) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Deleting task status %d in organization %d by %s (moveToStatusId=%s)", id, orgId, email, moveToStatusId);
        deleteTaskStatusUseCase.execute(email, orgId, id, moveToStatusId);
        return Response.noContent().build();
    }

    @PUT
    @Path("/reorder")
    @Transactional
    @Operation(summary = "Reorder task statuses", description = "Updates order of task statuses in organization")
    @APIResponse(responseCode = "200", description = "Task statuses reordered successfully")
    public List<TaskStatusResponse> reorderStatuses(@PathParam("orgId") Long orgId, List<Long> statusIds) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Reordering task statuses in organization %d by %s", orgId, email);
        return reorderTaskStatusesUseCase.execute(email, orgId, statusIds).stream()
                .map(TaskStatusControllerMapper::toResponse)
                .toList();
    }
}
