package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailInput;
import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailUseCase;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Path("/organizations/{id}/members/{memberId}/stats")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class MemberDetailController {
    private static final Logger LOGGER = Logger.getLogger(MemberDetailController.class);

    @Inject
    MemberDetailUseCase memberDetailUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    public MemberDetailResponse getMemberStats(
            @PathParam("id") Long organizationId,
            @PathParam("memberId") Long memberId,
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {

        String email = securityIdentity.getPrincipal().getName();

        LocalDateTime start = startDateStr != null
                ? LocalDateTime.parse(startDateStr, DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now().minusMonths(1);

        LocalDateTime end = endDateStr != null
                ? LocalDateTime.parse(endDateStr, DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now();

        if (endDateStr != null && end.toLocalTime().equals(java.time.LocalTime.MIDNIGHT)) {
            end = end.with(java.time.LocalTime.MAX);
        }

        LOGGER.infof("Member stats requested by user %s for organization %d member %d and period %s to %s",
                email, organizationId, memberId, start, end);
        return MemberDetailControllerMapper.toResponse(
                memberDetailUseCase.execute(new MemberDetailInput(email, organizationId, memberId, start, end))
        );
    }
}
