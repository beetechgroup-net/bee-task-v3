package net.beetechgroup.beetask.interfaceadapters.controllers.project;

import io.quarkus.security.Authenticated;
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
public class ProjectController {
    private static final Logger LOGGER = Logger.getLogger(ProjectController.class);

    @Inject
    CreateProjectUseCase createProjectUseCase;

    @Inject
    ListProjectsUseCase listProjectsUseCase;

    @GET
    @Authenticated
    public List<ProjectResponse> listProjects(@PathParam("orgId") Long orgId) {
        List<ProjectResponse> projects = listProjectsUseCase.execute(orgId).stream()
                .map(p -> new ProjectResponse(p.getId(), p.getName()))
                .toList();
        LOGGER.infof("Listed %d projects for organization %d", projects.size(), orgId);
        return projects;
    }

    @POST
    @Authenticated
    public ProjectResponse createProject(@PathParam("orgId") Long orgId, CreateProjectRequest request) {
        LOGGER.infof("Project creation requested for organization %d with name '%s'", orgId, request.name());
        Project project = createProjectUseCase.execute(orgId, request.name());
        LOGGER.infof("Project %d created successfully for organization %d", project.getId(), orgId);
        return new ProjectResponse(project.getId(), project.getName());
    }

    // TODO must be a independent file
    public record CreateProjectRequest(String name) {}

    // TODO must be a independent file
    public record ProjectResponse(Long id, String name) {}
}
