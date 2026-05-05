package net.beetechgroup.beetask.usecase.task.get;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

public class GetTaskUseCase {
    private final TaskRepository taskRepository;

    public GetTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(Long id) {
        //TODO deve validar se o usuario logado é o dono da task
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.findTaskById(id));
    }
}
