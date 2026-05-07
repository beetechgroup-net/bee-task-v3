package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

import java.util.List;

public class ListMyTasksUseCase {

    private final TaskRepository taskRepository;

    public ListMyTasksUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<CreateTaskOutput> execute(String email) {
        return taskRepository.findTasksByUser(email).stream().map(CreateTaskMapper::toCreateTaskOutput).toList();
    }
}
