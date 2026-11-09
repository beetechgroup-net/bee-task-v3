package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import net.beetechgroup.beetask.usecase.taskstatus.CreateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.DeleteTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.ListTaskStatusesUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.ReorderTaskStatusesUseCase;
import net.beetechgroup.beetask.usecase.taskstatus.UpdateTaskStatusInfoUseCase;

@ApplicationScoped
public class TaskStatusUseCaseConfig {

    @Produces
    public ListTaskStatusesUseCase listTaskStatusesUseCase(TaskStatusRepository taskStatusRepository,
                                                          AuthorizeOrganizationMemberUseCase authorizer) {
        return new ListTaskStatusesUseCase(taskStatusRepository, authorizer);
    }

    @Produces
    public CreateTaskStatusUseCase createTaskStatusUseCase(TaskStatusRepository taskStatusRepository,
                                                          OrganizationRepository organizationRepository,
                                                          AuthorizeOrganizationMemberUseCase authorizer) {
        return new CreateTaskStatusUseCase(taskStatusRepository, organizationRepository, authorizer);
    }

    @Produces
    public UpdateTaskStatusInfoUseCase updateTaskStatusInfoUseCase(TaskStatusRepository taskStatusRepository,
                                                                  AuthorizeOrganizationMemberUseCase authorizer) {
        return new UpdateTaskStatusInfoUseCase(taskStatusRepository, authorizer);
    }

    @Produces
    public DeleteTaskStatusUseCase deleteTaskStatusUseCase(TaskStatusRepository taskStatusRepository,
                                                          AuthorizeOrganizationMemberUseCase authorizer) {
        return new DeleteTaskStatusUseCase(taskStatusRepository, authorizer);
    }

    @Produces
    public ReorderTaskStatusesUseCase reorderTaskStatusesUseCase(TaskStatusRepository taskStatusRepository,
                                                                AuthorizeOrganizationMemberUseCase authorizer) {
        return new ReorderTaskStatusesUseCase(taskStatusRepository, authorizer);
    }
}
