package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListMyTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.ai.EnrichTaskDescriptionUseCase;
import net.beetechgroup.beetask.usecase.task.ai.ParseTaskWithAiUseCase;
import net.beetechgroup.beetask.frameworks.ai.OllamaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.beetechgroup.beetask.usecase.task.get.GetTaskUseCase;

@ApplicationScoped
public class TaskUseCaseConfig {

    @Produces
    public CreateTaskUseCase createTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository,
                                                CategoryRepository categoryRepository, UserRepository userRepository,
                                                UserOrganizationRepository userOrganizationRepository,
                                                net.beetechgroup.beetask.usecase.repository.OrganizationRepository organizationRepository,
                                                TaskStatusRepository taskStatusRepository) {
        return new CreateTaskUseCase(taskRepository, projectRepository, categoryRepository, userRepository, userOrganizationRepository, organizationRepository, taskStatusRepository);
    }

    @Produces
    public StartTaskUseCase startTaskUseCase(TaskRepository taskRepository, UserRepository userRepository,
                                            AuthorizeOrganizationMemberUseCase authorizer, TaskStatusRepository taskStatusRepository) {
        return new StartTaskUseCase(taskRepository, userRepository, authorizer, taskStatusRepository);
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
    public UpdateTaskStatusUseCase updateTaskStatusUseCase(TaskRepository taskRepository,
                                                          TaskStatusRepository taskStatusRepository,
                                                          AuthorizeOrganizationMemberUseCase authorizer) {
        return new UpdateTaskStatusUseCase(taskRepository, taskStatusRepository, authorizer);
    }

    @Produces
    public UpdateTaskUseCase updateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository,
                                                CategoryRepository categoryRepository, UserRepository userRepository,
                                                UserOrganizationRepository userOrganizationRepository,
                                                net.beetechgroup.beetask.usecase.repository.OrganizationRepository organizationRepository,
                                                TaskStatusRepository taskStatusRepository) {
        return new UpdateTaskUseCase(taskRepository, projectRepository, categoryRepository, userRepository, userOrganizationRepository, organizationRepository, taskStatusRepository);
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

    @Produces
    public ParseTaskWithAiUseCase parseTaskWithAiUseCase(
            OllamaService ollamaService,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            UserOrganizationRepository userOrganizationRepository,
            AuthorizeOrganizationMemberUseCase authorizer,
            ObjectMapper objectMapper) {
        return new ParseTaskWithAiUseCase(ollamaService, projectRepository, categoryRepository, userOrganizationRepository, authorizer, objectMapper);
    }

    @Produces
    public EnrichTaskDescriptionUseCase enrichTaskDescriptionUseCase(
            OllamaService ollamaService,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            AuthorizeOrganizationMemberUseCase authorizer) {
        return new EnrichTaskDescriptionUseCase(ollamaService, projectRepository, categoryRepository, authorizer);
    }
}

