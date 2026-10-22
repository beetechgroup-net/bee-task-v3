package net.beetechgroup.beetask.usecase.task.stop;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class StopTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(StopTaskUseCase.class);

    private final TaskRepository taskRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public StopTaskUseCase(TaskRepository taskRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.authorizer = authorizer;
    }

    public CreateTaskOutput execute(StopTaskInput input) {
        LOGGER.infof("Stopping task %d for user %s", input.id(), input.userEmail());
        Task task = taskRepository.findTaskById(input.id());

        Long orgId = null;
        if (task.getProject() != null && task.getProject().getOrganization() != null) {
            orgId = task.getProject().getOrganization().getId();
        } else if (task.getCategory() != null && task.getCategory().getOrganization() != null) {
            orgId = task.getCategory().getOrganization().getId();
        }

        if (orgId != null) {
            authorizer.execute(input.userEmail(), orgId);
        }

        if (task.getUser() != null && !task.getUser().getEmail().equals(input.userEmail())) {
            LOGGER.warnf("User %s attempted to stop task %d owned by %s",
                    input.userEmail(), input.id(), task.getUser().getEmail());
            throw new SecurityException("Você não tem permissão para parar esta tarefa.");
        }

        task.stop();
        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d stopped successfully", input.id());
        return output;
    }
}

