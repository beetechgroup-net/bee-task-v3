package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

import java.util.List;

public class ListAllTasksUseCase {

    private final TaskRepository taskRepository;

    public ListAllTasksUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<CreateTaskOutput> execute() {
        return taskRepository.findAllTasks().stream().map(CreateTaskMapper::toCreateTaskOutput).toList();
    }
}
