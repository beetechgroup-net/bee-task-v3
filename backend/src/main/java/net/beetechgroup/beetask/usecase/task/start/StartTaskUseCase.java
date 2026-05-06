package net.beetechgroup.beetask.usecase.task.start;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;

public class StartTaskUseCase {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public StartTaskUseCase(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public CreateTaskOutput execute(StartTaskInput input) {
        Task task = taskRepository.findTaskById(input.id());
        
        if (task.getUser() != null && !task.getUser().getEmail().equals(input.userEmail())) {
            throw new SecurityException("Você não tem permissão para iniciar esta tarefa.");
        }
        
        task.start();
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}
