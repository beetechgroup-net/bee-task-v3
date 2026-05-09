package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailInput;
import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailUseCase;

@Path("/organizations/{id}/members/{memberId}/stats")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class MemberDetailController {

    @Inject
    MemberDetailUseCase memberDetailUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    public MemberDetailResponse getMemberStats(
            @PathParam("id") Long organizationId,
            @PathParam("memberId") Long memberId) {

        String email = securityIdentity.getPrincipal().getName();

        return MemberDetailControllerMapper.toResponse(
                memberDetailUseCase.execute(new MemberDetailInput(email, organizationId, memberId))
        );
    }
}
