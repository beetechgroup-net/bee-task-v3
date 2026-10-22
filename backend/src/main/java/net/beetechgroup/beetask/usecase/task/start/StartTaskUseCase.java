package net.beetechgroup.beetask.usecase.task.start;

import java.util.Objects;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class StartTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(StartTaskUseCase.class);

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public StartTaskUseCase(TaskRepository taskRepository, UserRepository userRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.authorizer = authorizer;
    }

    public CreateTaskOutput execute(StartTaskInput input) {
        LOGGER.infof("Starting task %d for user %s", input.id(), input.userEmail());
        Task task = taskRepository.findTaskById(input.id());

        Long orgId = null;
        if (task.getOrganization() != null) {
            orgId = task.getOrganization().getId();
        } else if (task.getProject() != null && task.getProject().getOrganization() != null) {
            orgId = task.getProject().getOrganization().getId();
        } else if (task.getCategory() != null && task.getCategory().getOrganization() != null) {
            orgId = task.getCategory().getOrganization().getId();
        }

        if (orgId != null) {
            authorizer.execute(input.userEmail(), orgId);
        }

        if (Objects.nonNull(task.getUser()) && !task.getUser().getEmail().equals(input.userEmail())) {
            LOGGER.warnf("User %s attempted to start task %d owned by %s",
                    input.userEmail(), input.id(), task.getUser().getEmail());
            throw new SecurityException("Você não tem permissão para iniciar esta tarefa.");
        }

        net.beetechgroup.beetask.entities.User currentUser = userRepository.findByEmail(input.userEmail()).orElse(null);

        // Auto-stop any existing running timers for this user across all tasks (Toggl style)
        java.util.List<Task> runningTasks = taskRepository.findRunningTasksByUserEmail(input.userEmail());
        for (Task running : runningTasks) {
            if (!running.getId().equals(task.getId()) && running.isRunning()) {
                LOGGER.infof("Auto-stopping previously running task %d for user %s", running.getId(), input.userEmail());
                running.stop();
                taskRepository.saveTask(running);
            }
        }

        task.start(currentUser);
        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d started successfully", input.id());
        return output;
    }
}

