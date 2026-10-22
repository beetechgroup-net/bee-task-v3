package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/public/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users")
public class PublicUserController {

    @Inject
    UserController userController;

    @GET
    @Operation(summary = "List all users publicly")
    public List<UserController.UserResponse> listUsers() {
        return userController.listUsers();
    }
}
