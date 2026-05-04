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

import java.util.List;

@Path("/organizations/{orgId}/projects")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProjectController {

    @Inject
    CreateProjectUseCase createProjectUseCase;

    @Inject
    ListProjectsUseCase listProjectsUseCase;

    @GET
    @Authenticated
    public List<ProjectResponse> listProjects(@PathParam("orgId") Long orgId) {
        return listProjectsUseCase.execute(orgId).stream()
                .map(p -> new ProjectResponse(p.getId(), p.getName()))
                .toList();
    }

    @POST
    @Authenticated
    public ProjectResponse createProject(@PathParam("orgId") Long orgId, CreateProjectRequest request) {
        Project project = createProjectUseCase.execute(orgId, request.name());
        return new ProjectResponse(project.getId(), project.getName());
    }

    // TODO must be a independent file
    public record CreateProjectRequest(String name) {}

    // TODO must be a independent file
    public record ProjectResponse(Long id, String name) {}
}
