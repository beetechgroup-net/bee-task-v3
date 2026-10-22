package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListMyTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.get.GetTaskUseCase;

@ApplicationScoped
public class TaskUseCaseConfig {

    @Produces
    public CreateTaskUseCase createTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository,
                                                CategoryRepository categoryRepository, UserRepository userRepository,
                                                UserOrganizationRepository userOrganizationRepository,
                                                net.beetechgroup.beetask.usecase.repository.OrganizationRepository organizationRepository) {
        return new CreateTaskUseCase(taskRepository, projectRepository, categoryRepository, userRepository, userOrganizationRepository, organizationRepository);
    }

    @Produces
    public StartTaskUseCase startTaskUseCase(TaskRepository taskRepository, UserRepository userRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        return new StartTaskUseCase(taskRepository, userRepository, authorizer);
    }

    @Produces
    public StopTaskUseCase stopTaskUseCase(TaskRepository taskRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        return new StopTaskUseCase(taskRepository, authorizer);
    }

    @Produces
    public ListAllTasksUseCase listAllTasksUseCase(TaskRepository taskRepository, UserRepository userRepository) {
        return new ListAllTasksUseCase(taskRepository, userRepository);
    }

    @Produces
    public ListMyTasksUseCase listMyTasksUseCase(TaskRepository taskRepository) {
        return new ListMyTasksUseCase(taskRepository);
    }

    @Produces
    public UpdateTaskStatusUseCase updateTaskStatusUseCase(TaskRepository taskRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        return new UpdateTaskStatusUseCase(taskRepository, authorizer);
    }

    @Produces
    public UpdateTaskUseCase updateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository,
                                                CategoryRepository categoryRepository, UserRepository userRepository,
                                                UserOrganizationRepository userOrganizationRepository,
                                                net.beetechgroup.beetask.usecase.repository.OrganizationRepository organizationRepository) {
        return new UpdateTaskUseCase(taskRepository, projectRepository, categoryRepository, userRepository, userOrganizationRepository, organizationRepository);
    }

    @Produces
    public GetTaskUseCase getTaskUseCase(TaskRepository taskRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        return new GetTaskUseCase(taskRepository, authorizer);
    }

    @Produces
    public net.beetechgroup.beetask.usecase.task.delete.DeleteTaskUseCase deleteTaskUseCase(
            TaskRepository taskRepository,
            UserRepository userRepository,
            UserOrganizationRepository userOrganizationRepository) {
        return new net.beetechgroup.beetask.usecase.task.delete.DeleteTaskUseCase(taskRepository, userRepository, userOrganizationRepository);
    }
}

