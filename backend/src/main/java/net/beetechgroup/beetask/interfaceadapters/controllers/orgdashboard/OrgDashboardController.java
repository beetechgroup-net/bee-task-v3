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
import net.beetechgroup.beetask.usecase.orgdashboard.OrgDashboardInput;
import net.beetechgroup.beetask.usecase.orgdashboard.OrgDashboardOutput;
import net.beetechgroup.beetask.usecase.orgdashboard.OrgDashboardUseCase;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Path("/organizations/{id}/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class OrgDashboardController {

    @Inject
    OrgDashboardUseCase orgDashboardUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    public OrgDashboardOutput getDashboard(
            @PathParam("id") Long organizationId,
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

        return orgDashboardUseCase.execute(new OrgDashboardInput(email, organizationId, start, end));
    }
}
