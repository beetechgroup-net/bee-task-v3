package net.beetechgroup.beetask.usecase.task.update;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class UpdateTaskStatusUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateTaskStatusUseCase.class);

    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public UpdateTaskStatusUseCase(TaskRepository taskRepository,
                                  TaskStatusRepository taskStatusRepository,
                                  AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.taskStatusRepository = taskStatusRepository;
        this.authorizer = authorizer;
    }

    public CreateTaskOutput execute(Long id, Long newStatusId, String newStatusName, String userEmail) {
        LOGGER.infof("Updating status for task %d (statusId=%s, statusName=%s) by user %s", id, newStatusId, newStatusName, userEmail);
        Task task = taskRepository.findTaskById(id);

        Long orgId = null;
        if (task.getOrganization() != null) {
            orgId = task.getOrganization().getId();
        } else if (task.getProject() != null && task.getProject().getOrganization() != null) {
            orgId = task.getProject().getOrganization().getId();
        } else if (task.getCategory() != null && task.getCategory().getOrganization() != null) {
            orgId = task.getCategory().getOrganization().getId();
        }

        if (orgId != null) {
            authorizer.execute(userEmail, orgId);
        } else if (task.getUser() != null && !task.getUser().getEmail().equals(userEmail)) {
            LOGGER.warnf("User %s denied status update on task %d owned by %s", userEmail, id, task.getUser().getEmail());
            throw new SecurityException("Você não tem permissão para atualizar esta tarefa.");
        }

        TaskStatus resolved = null;
        if (newStatusId != null) {
            resolved = taskStatusRepository.findTaskStatusById(newStatusId).orElse(null);
        }
        if (resolved == null && newStatusName != null && !newStatusName.isBlank() && orgId != null) {
            String name = newStatusName.trim();
            if ("NOT_STARTED".equalsIgnoreCase(name)) name = "A Fazer";
            else if ("IN_PROGRESS".equalsIgnoreCase(name)) name = "Em Andamento";
            else if ("COMPLETED".equalsIgnoreCase(name)) name = "Concluído";
            else if ("CANCELED".equalsIgnoreCase(name)) name = "Cancelado";
            resolved = taskStatusRepository.findByNameAndOrganizationId(name, orgId).orElse(null);
        }

        if (resolved == null) {
            throw new IllegalArgumentException("Status não encontrado para a tarefa.");
        }

        task.setStatus(resolved);

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Status updated for task %d to %s", id, resolved.getName());
        return output;
    }

    public CreateTaskOutput execute(Long id, String rawStatus, String userEmail) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new IllegalArgumentException("Status é obrigatório.");
        }
        String clean = rawStatus.trim();
        if (clean.startsWith("\"") && clean.endsWith("\"") && clean.length() >= 2) {
            clean = clean.substring(1, clean.length() - 1).trim();
        }

        Long statusId = null;
        try {
            statusId = Long.parseLong(clean);
        } catch (NumberFormatException ignored) {
        }

        return execute(id, statusId, clean, userEmail);
    }
}
