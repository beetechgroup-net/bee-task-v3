package net.beetechgroup.beetask.interfaceadapters.controllers.dashboard;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.usecase.dashboard.DashboardInput;
import net.beetechgroup.beetask.usecase.dashboard.DashboardOutput;
import net.beetechgroup.beetask.usecase.dashboard.DashboardUseCase;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Path("/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class DashboardController {

    @Inject
    DashboardUseCase dashboardUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    public DashboardOutput getDashboard(
            @QueryParam("startDate") String startDateStr,
            @QueryParam("endDate") String endDateStr) {

        String email = securityIdentity.getPrincipal().getName();
        
        LocalDateTime start = (startDateStr != null) 
            ? LocalDateTime.parse(startDateStr, DateTimeFormatter.ISO_DATE_TIME) 
            : LocalDateTime.now().minusMonths(1);
            
        LocalDateTime end = (endDateStr != null) 
            ? LocalDateTime.parse(endDateStr, DateTimeFormatter.ISO_DATE_TIME) 
            : LocalDateTime.now();

        DashboardInput input = new DashboardInput(email, start, end);
        return dashboardUseCase.execute(input);
    }
}
