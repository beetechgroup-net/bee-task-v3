package net.beetechgroup.beetask.usecase.task.get;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class GetTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(GetTaskUseCase.class);
    private final TaskRepository taskRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public GetTaskUseCase(TaskRepository taskRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.authorizer = authorizer;
    }

    public CreateTaskOutput execute(Long id, String userEmail) {
        LOGGER.infof("Fetching task %d requested by %s", id, userEmail);
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
            LOGGER.warnf("User %s denied access to task %d owned by %s", userEmail, id, task.getUser().getEmail());
            throw new SecurityException("Você não tem permissão para acessar esta tarefa.");
        }

        return CreateTaskMapper.toCreateTaskOutput(task);
    }
}

