package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.dashboard.DashboardUseCase;
import net.beetechgroup.beetask.usecase.orgdashboard.OrgDashboardUseCase;
import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

@ApplicationScoped
public class DashboardUseCaseConfig {

    @Produces
    public DashboardUseCase dashboardUseCase(TaskRepository taskRepository) {
        return new DashboardUseCase(taskRepository);
    }

    @Produces
    public OrgDashboardUseCase orgDashboardUseCase(TaskRepository taskRepository,
                                                    UserOrganizationRepository userOrganizationRepository,
                                                    AuthorizeOrganizationAdminUseCase authorizer) {
        return new OrgDashboardUseCase(taskRepository, userOrganizationRepository, authorizer);
    }

    @Produces
    public MemberDetailUseCase memberDetailUseCase(TaskRepository taskRepository,
                                                   UserOrganizationRepository userOrganizationRepository,
                                                   AuthorizeOrganizationAdminUseCase authorizer) {
        return new MemberDetailUseCase(taskRepository, userOrganizationRepository, authorizer);
    }
}
