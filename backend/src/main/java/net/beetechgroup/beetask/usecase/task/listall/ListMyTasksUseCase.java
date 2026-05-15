package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

import java.util.List;

public class ListMyTasksUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListMyTasksUseCase.class);

    private final TaskRepository taskRepository;

    public ListMyTasksUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<CreateTaskOutput> execute(ListMyTasksInput input) {
        List<CreateTaskOutput> tasks = taskRepository.findTasksByUserFiltered(
                        input.email(), input.text(), input.projectId(), input.statuses(), input.categoryIds())
                .stream().map(CreateTaskMapper::toCreateTaskOutput).toList();
        LOGGER.infof("Loaded %d tasks for user %s", tasks.size(), input.email());
        return tasks;
    }
}
