package net.beetechgroup.beetask.usecase.task.update;

import java.util.List;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

public class UpdateTaskUseCase {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public UpdateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public CreateTaskOutput execute(UpdateTaskInput input) {
        //TODO deve validar se o usuario logado é o dono da task
        Task task = taskRepository.findTaskById(input.id());

        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());

        if (input.projectId() != null) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId()));
            task.setProject(project);
        } else {
            task.setProject(null);
        }

        if (input.history() != null) {
            List<TaskHistoryItem> updatedHistory = input.history().stream().map(hInput -> {
                if (hInput.id() != null) {
                    return task.getHistory().stream()
                            .filter(existing -> existing.getId().equals(hInput.id()))
                            .findFirst()
                            .map(existing -> {
                                existing.setStartAt(hInput.startAt());
                                existing.setEndAt(hInput.endAt());
                                return existing;
                            })
                            .orElseGet(() -> {
                                TaskHistoryItem newItem = new TaskHistoryItem();
                                newItem.setStartAt(hInput.startAt());
                                newItem.setEndAt(hInput.endAt());
                                return newItem;
                            });
                } else {
                    TaskHistoryItem newItem = new TaskHistoryItem();
                    newItem.setStartAt(hInput.startAt());
                    newItem.setEndAt(hInput.endAt());
                    return newItem;
                }
            }).toList();
            
            task.getHistory().clear();
            task.getHistory().addAll(updatedHistory);
        }

        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}
