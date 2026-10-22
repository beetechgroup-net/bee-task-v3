package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.usecase.user.list.ListAllUsersUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users", description = "User management operations")
public class UserController {
    private static final Logger LOGGER = Logger.getLogger(UserController.class);

    @Inject
    ListAllUsersUseCase listAllUsersUseCase;

    @GET
    @Operation(summary = "List all users", description = "Lists all users with name and email, without pagination or authentication required")
    public List<UserResponse> listUsers() {
        LOGGER.info("Public list of all users requested");
        return listAllUsersUseCase.execute().stream()
                .map(u -> new UserResponse(u.getName(), u.getEmail()))
                .toList();
    }

    public record UserResponse(String name, String email) {}
}
