package net.beetechgroup.beetask.usecase.task.start;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

public class StartTaskUseCase {

    private final TaskRepository taskRepository;

    public StartTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(StartTaskInput input) {
        Task task = taskRepository.findTaskById(input.id());
        task.start();
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}
