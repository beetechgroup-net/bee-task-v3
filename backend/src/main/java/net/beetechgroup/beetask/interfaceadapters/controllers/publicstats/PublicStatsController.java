package net.beetechgroup.beetask.interfaceadapters.controllers.publicstats;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.usecase.publicstats.PublicStatsUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/public/stats")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Public Stats")
public class PublicStatsController {
    @Inject
    PublicStatsUseCase publicStatsUseCase;

    @GET
    @Operation(summary = "Get public platform statistics")
    @APIResponse(
        responseCode = "200",
        description = "Platform statistics",
        content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PublicStatsResponse.class))
    )
    public PublicStatsResponse getStats() {
        var output = publicStatsUseCase.execute();
        return PublicStatsControllerMapper.toPublicStatsResponse(output);
    }
}
