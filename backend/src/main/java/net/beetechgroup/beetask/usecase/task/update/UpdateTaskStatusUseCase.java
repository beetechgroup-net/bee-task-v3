package net.beetechgroup.beetask.usecase.task.update;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class UpdateTaskStatusUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateTaskStatusUseCase.class);

    private final TaskRepository taskRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public UpdateTaskStatusUseCase(TaskRepository taskRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.authorizer = authorizer;
    }

    public CreateTaskOutput execute(Long id, TaskStatus newStatus, String userEmail) {
        LOGGER.infof("Updating status for task %d to %s by user %s", id, newStatus, userEmail);
        Task task = taskRepository.findTaskById(id);

        Long orgId = null;
        if (task.getProject() != null && task.getProject().getOrganization() != null) {
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

        task.setStatus(newStatus);

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Status updated for task %d to %s", id, newStatus);
        return output;
    }
}

