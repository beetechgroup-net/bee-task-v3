package net.beetechgroup.beetask.interfaceadapters.controllers.project;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.usecase.project.create.CreateProjectUseCase;
import net.beetechgroup.beetask.usecase.project.list.ListProjectsUseCase;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/organizations/{orgId}/projects")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class ProjectController {
    private static final Logger LOGGER = Logger.getLogger(ProjectController.class);

    @Inject
    CreateProjectUseCase createProjectUseCase;

    @Inject
    ListProjectsUseCase listProjectsUseCase;

    @Inject
    net.beetechgroup.beetask.usecase.project.update.UpdateProjectUseCase updateProjectUseCase;

    @Inject
    net.beetechgroup.beetask.usecase.project.delete.DeleteProjectUseCase deleteProjectUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    public List<ProjectResponse> listProjects(@PathParam("orgId") Long orgId) {
        String email = securityIdentity.getPrincipal().getName();
        List<ProjectResponse> projects = listProjectsUseCase.execute(email, orgId).stream()
                .map(p -> new ProjectResponse(p.getId(), p.getName(), p.getColor(), p.getIcon()))
                .toList();
        LOGGER.infof("Listed %d projects for organization %d by user %s", projects.size(), orgId, email);
        return projects;
    }

    @POST
    public ProjectResponse createProject(@PathParam("orgId") Long orgId, CreateProjectRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Project creation requested by %s for organization %d with name '%s'", email, orgId, request.name());
        Project project = createProjectUseCase.execute(email, orgId, request.name(), request.color(), request.icon());
        LOGGER.infof("Project %d created successfully for organization %d by user %s", project.getId(), orgId, email);
        return new ProjectResponse(project.getId(), project.getName(), project.getColor(), project.getIcon());
    }

    @jakarta.ws.rs.PUT
    @Path("/{id}")
    public ProjectResponse updateProject(@PathParam("orgId") Long orgId,
                                         @PathParam("id") Long id,
                                         CreateProjectRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Project update requested by %s for project %d in org %d", email, id, orgId);
        Project project = updateProjectUseCase.execute(email, orgId, id, request.name(), request.color(), request.icon());
        return new ProjectResponse(project.getId(), project.getName(), project.getColor(), project.getIcon());
    }

    @jakarta.ws.rs.DELETE
    @Path("/{id}")
    public jakarta.ws.rs.core.Response deleteProject(@PathParam("orgId") Long orgId,
                                                     @PathParam("id") Long id) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Project deletion requested by %s for project %d in org %d", email, id, orgId);
        deleteProjectUseCase.execute(email, orgId, id);
        return jakarta.ws.rs.core.Response.noContent().build();
    }

    // TODO must be a independent file
    public record CreateProjectRequest(String name, String color, String icon) {}

    // TODO must be a independent file
    public record ProjectResponse(Long id, String name, String color, String icon) {}
}
