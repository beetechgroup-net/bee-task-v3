package net.beetechgroup.beetask.usecase.task.stop;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

public class StopTaskUseCase {

    private final TaskRepository taskRepository;

    public StopTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(StopTaskInput input) {
        Task task = taskRepository.findTaskById(input.id());
        task.stop();
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}
