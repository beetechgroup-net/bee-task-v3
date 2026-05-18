package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

import java.util.List;

public class ListAllTasksUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListAllTasksUseCase.class);

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public ListAllTasksUseCase(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public List<CreateTaskOutput> execute(ListTasksInput input) {
        if (input.organizationId() == null) {
            throw new IllegalArgumentException("organizationId is required");
        }

        var user = userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user was not found"));

        boolean belongsToOrganization = userRepository.findUserOrganizations(user.getId()).stream()
                .anyMatch(membership -> membership.getOrganization().getId().equals(input.organizationId()));

        if (!belongsToOrganization) {
            throw new SecurityException("Você não tem permissão para listar tarefas desta organização.");
        }

        List<CreateTaskOutput> tasks = taskRepository.findAccessibleTasksFiltered(
                        input.userEmail(),
                        input.organizationId(),
                        input.text(),
                        input.projectIds(),
                        input.statuses(),
                        input.categoryIds(),
                        input.userIds())
                .stream()
                .map(CreateTaskMapper::toCreateTaskOutput)
                .toList();
        LOGGER.infof("Loaded %d accessible tasks for user %s in organization %d", tasks.size(), input.userEmail(), input.organizationId());
        return tasks;
    }
}
