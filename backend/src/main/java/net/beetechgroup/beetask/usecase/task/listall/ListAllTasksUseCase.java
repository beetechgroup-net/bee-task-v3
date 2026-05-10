package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

import java.util.List;

public class ListAllTasksUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListAllTasksUseCase.class);

    private final TaskRepository taskRepository;

    public ListAllTasksUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<CreateTaskOutput> execute() {
        List<CreateTaskOutput> tasks = taskRepository.findAllTasks().stream().map(CreateTaskMapper::toCreateTaskOutput).toList();
        LOGGER.infof("Loaded %d tasks from repository", tasks.size());
        return tasks;
    }
}
