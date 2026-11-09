package net.beetechgroup.beetask.usecase.task.create;

import java.util.List;
import java.util.Objects;
import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class CreateTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateTaskUseCase.class);
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final OrganizationRepository organizationRepository;
    private final TaskStatusRepository taskStatusRepository;

    public CreateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository,
                              CategoryRepository categoryRepository, UserRepository userRepository,
                              UserOrganizationRepository userOrganizationRepository,
                              OrganizationRepository organizationRepository,
                              TaskStatusRepository taskStatusRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.organizationRepository = organizationRepository;
        this.taskStatusRepository = taskStatusRepository;
    }

    public CreateTaskOutput execute(CreateTaskInput input) {
        LOGGER.infof("Creating task '%s' for user %s", input.title(), input.userEmail());
        Task task = new Task();
        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setExternalUrl(input.externalUrl());

        if (Objects.nonNull(input.projectId())) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> {
                        LOGGER.warnf("Task creation failed because project %d was not found", input.projectId());
                        return new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId());
                    });
            task.setProject(project);
        }

        if (Objects.nonNull(input.categoryId())) {
            Category category = categoryRepository.findCategoryById(input.categoryId())
                    .orElseThrow(() -> {
                        LOGGER.warnf("Task creation failed because category %d was not found", input.categoryId());
                        return new IllegalArgumentException("Categoria não encontrada com ID: " + input.categoryId());
                    });
            task.setCategory(category);
        }

        validateRequesterMembership(input.organizationId(), input.userEmail());
        if (Objects.nonNull(input.organizationId())) {
            organizationRepository.findOrganizationById(input.organizationId()).ifPresent(task::setOrganization);
        } else if (task.getProject() != null && task.getProject().getOrganization() != null) {
            task.setOrganization(task.getProject().getOrganization());
        } else if (task.getCategory() != null && task.getCategory().getOrganization() != null) {
            task.setOrganization(task.getCategory().getOrganization());
        }

        // Resolve task status
        TaskStatus taskStatus = null;
        if (input.statusId() != null) {
            taskStatus = taskStatusRepository.findTaskStatusById(input.statusId()).orElse(null);
        }
        if (taskStatus == null && input.status() != null && !input.status().isBlank() && task.getOrganization() != null) {
            String name = input.status().trim();
            if ("NOT_STARTED".equalsIgnoreCase(name)) name = "A Fazer";
            else if ("IN_PROGRESS".equalsIgnoreCase(name)) name = "Em Andamento";
            else if ("COMPLETED".equalsIgnoreCase(name)) name = "Concluído";
            else if ("CANCELED".equalsIgnoreCase(name)) name = "Cancelado";
            taskStatus = taskStatusRepository.findByNameAndOrganizationId(name, task.getOrganization().getId()).orElse(null);
        }
        if (taskStatus == null && task.getOrganization() != null) {
            taskStatus = taskStatusRepository.findDefaultByOrganizationId(task.getOrganization().getId())
                    .orElseGet(() -> {
                        List<TaskStatus> all = taskStatusRepository.findByOrganizationId(task.getOrganization().getId());
                        return all.isEmpty() ? null : all.get(0);
                    });
        }
        task.setStatus(taskStatus);

        task.setUser(resolveAssignee(input.organizationId(), input.assigneeUserId()));
        User creator = userRepository.findByEmail(input.userEmail()).orElse(null);
        task.setCreatedBy(creator);

        if (Objects.nonNull(input.history())) {
            List<TaskHistoryItem> historyItems = input.history().stream().map(h -> {
                TaskHistoryItem item = new TaskHistoryItem();
                item.setStartAt(h.startAt());
                item.setEndAt(h.endAt());
                return item;
            }).toList();
            task.getHistory().addAll(historyItems);
        }

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d created for user %s with status %s", output.id(), input.userEmail(),
                task.getStatus() != null ? task.getStatus().getName() : "none");
        return output;
    }

    private void validateRequesterMembership(Long organizationId, String userEmail) {
        if (Objects.isNull(organizationId)) {
            throw new IllegalArgumentException("Organização é obrigatória para criar a tarefa.");
        }

        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    LOGGER.warnf("Task creation failed because user %s was not found", userEmail);
                    return new IllegalArgumentException("Usuário não encontrado: " + userEmail);
                });

        boolean belongsToOrganization = userRepository.findUserOrganizations(requester.getId()).stream()
                .anyMatch(membership -> membership.getOrganization().getId().equals(organizationId));

        if (!belongsToOrganization) {
            LOGGER.warnf("Task creation denied because user %s is not an active member of organization %d", userEmail, organizationId);
            throw new SecurityException("Você não tem permissão para criar tarefas nesta organização.");
        }
    }

    private User resolveAssignee(Long organizationId, Long assigneeUserId) {
        if (Objects.isNull(assigneeUserId)) {
            return null;
        }

        boolean belongsToOrganization = userOrganizationRepository
                .findByOrganizationIdAndStatus(organizationId, UserOrganizationStatus.ACTIVE)
                .stream()
                .anyMatch(membership -> membership.getUser().getId().equals(assigneeUserId));

        if (!belongsToOrganization) {
            LOGGER.warnf("Task creation failed because assignee %d is not an active member of organization %d", assigneeUserId, organizationId);
            throw new IllegalArgumentException("Responsável não pertence à organização selecionada.");
        }

        return userRepository.findUserById(assigneeUserId)
                .orElseThrow(() -> {
                    LOGGER.warnf("Task creation failed because assignee %d was not found", assigneeUserId);
                    return new IllegalArgumentException("Usuário responsável não encontrado: " + assigneeUserId);
                });
    }
}
