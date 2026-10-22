package net.beetechgroup.beetask.usecase.task.update;

import java.util.List;
import java.util.Objects;
import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class UpdateTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateTaskUseCase.class);
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final net.beetechgroup.beetask.usecase.repository.OrganizationRepository organizationRepository;

    public UpdateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository,
                              CategoryRepository categoryRepository, UserRepository userRepository,
                              UserOrganizationRepository userOrganizationRepository,
                              net.beetechgroup.beetask.usecase.repository.OrganizationRepository organizationRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.organizationRepository = organizationRepository;
    }

    public CreateTaskOutput execute(UpdateTaskInput input) {
        LOGGER.infof("Updating task %d requested by user %s", input.id(), input.userEmail());
        Task task = taskRepository.findTaskById(input.id());

        Long currentOrgId = null;
        if (task.getOrganization() != null) {
            currentOrgId = task.getOrganization().getId();
        } else if (task.getProject() != null && task.getProject().getOrganization() != null) {
            currentOrgId = task.getProject().getOrganization().getId();
        } else if (task.getCategory() != null && task.getCategory().getOrganization() != null) {
            currentOrgId = task.getCategory().getOrganization().getId();
        }
        if (currentOrgId != null && !currentOrgId.equals(input.organizationId())) {
            validateRequesterMembership(currentOrgId, input.userEmail());
        }

        validateRequesterMembership(input.organizationId(), input.userEmail());

        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());
        task.setExternalUrl(input.externalUrl());

        if (Objects.nonNull(input.organizationId())) {
            organizationRepository.findOrganizationById(input.organizationId()).ifPresent(task::setOrganization);
        }

        if (Objects.nonNull(input.projectId())) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> {
                        LOGGER.warnf("Task update failed because project %d was not found", input.projectId());
                        return new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId());
                    });
            task.setProject(project);
        } else {
            task.setProject(null);
        }

        if (Objects.nonNull(input.categoryId())) {
            Category category = categoryRepository.findCategoryById(input.categoryId())
                    .orElseThrow(() -> {
                        LOGGER.warnf("Task update failed because category %d was not found", input.categoryId());
                        return new IllegalArgumentException("Categoria não encontrada com ID: " + input.categoryId());
                    });
            task.setCategory(category);
        } else {
            task.setCategory(null);
        }

        task.setUser(resolveAssignee(input.organizationId(), input.assigneeUserId()));

        if (Objects.nonNull(input.history())) {
            long openIntervalCount = input.history().stream().filter(h -> h.endAt() == null).count();
            if (openIntervalCount > 1) {
                throw new IllegalArgumentException("Não é permitido mais de um intervalo em andamento ao mesmo tempo.");
            }

            for (var hInput : input.history()) {
                if (hInput.startAt() != null && hInput.endAt() != null && hInput.endAt().isBefore(hInput.startAt())) {
                    throw new IllegalArgumentException("Data final do intervalo não pode ser anterior à data inicial.");
                }
            }

            User defaultWorker = task.getUser();
            List<TaskHistoryItem> updatedHistory = input.history().stream().map(hInput -> {
                if (Objects.nonNull(hInput.id())) {
                    return task.getHistory().stream()
                            .filter(existing -> existing.getId().equals(hInput.id()))
                            .findFirst()
                            .map(existing -> {
                                existing.setStartAt(hInput.startAt());
                                existing.setEndAt(hInput.endAt());
                                if (existing.getUser() == null) {
                                    existing.setUser(defaultWorker);
                                }
                                return existing;
                            })
                            .orElseGet(() -> {
                                TaskHistoryItem newItem = new TaskHistoryItem();
                                newItem.setStartAt(hInput.startAt());
                                newItem.setEndAt(hInput.endAt());
                                newItem.setUser(defaultWorker);
                                return newItem;
                            });
                } else {
                    TaskHistoryItem newItem = new TaskHistoryItem();
                    newItem.setStartAt(hInput.startAt());
                    newItem.setEndAt(hInput.endAt());
                    newItem.setUser(defaultWorker);
                    return newItem;
                }
            }).toList();

            task.getHistory().clear();
            task.getHistory().addAll(updatedHistory);
            LOGGER.infof("Task %d history updated with %d entries", input.id(), updatedHistory.size());
        }

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d updated successfully", input.id());
        return output;
    }

    private void validateRequesterMembership(Long organizationId, String userEmail) {
        if (Objects.isNull(organizationId)) {
            throw new IllegalArgumentException("Organização é obrigatória para atualizar a tarefa.");
        }

        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    LOGGER.warnf("Task update failed because user %s was not found", userEmail);
                    return new IllegalArgumentException("Usuário não encontrado: " + userEmail);
                });

        boolean belongsToOrganization = userRepository.findUserOrganizations(requester.getId()).stream()
                .anyMatch(membership -> membership.getOrganization().getId().equals(organizationId));

        if (!belongsToOrganization) {
            LOGGER.warnf("Task update denied because user %s is not an active member of organization %d", userEmail, organizationId);
            throw new SecurityException("Você não tem permissão para atualizar tarefas nesta organização.");
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
            LOGGER.warnf("Task update failed because assignee %d is not an active member of organization %d", assigneeUserId, organizationId);
            throw new IllegalArgumentException("Responsável não pertence à organização selecionada.");
        }

        return userRepository.findUserById(assigneeUserId)
                .orElseThrow(() -> {
                    LOGGER.warnf("Task update failed because assignee %d was not found", assigneeUserId);
                    return new IllegalArgumentException("Usuário responsável não encontrado: " + assigneeUserId);
                });
    }
}
