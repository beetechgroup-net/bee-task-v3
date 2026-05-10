package net.beetechgroup.beetask.usecase.task.update;

import java.util.List;
import java.util.Objects;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class UpdateTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateTaskUseCase.class);
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public UpdateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public CreateTaskOutput execute(UpdateTaskInput input) {
        LOGGER.infof("Updating task %d requested by user %s", input.id(), input.userEmail());
        Task task = taskRepository.findTaskById(input.id());

        if (Objects.isNull(task.getUser())) {
            task.setUser(userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> {
                    LOGGER.warnf("Task update failed because user %s was not found", input.userEmail());
                    return new IllegalArgumentException("Usuário não encontrado: " + input.userEmail());
                }));
        }

        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());

        if (Objects.nonNull(input.projectId())) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> {
                        LOGGER.warnf("Task update failed because project %d was not found", input.projectId());
                        return new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId());
                    });
            task.setProject(project);
        } else {
            task.setProject(null);
        }

        if (Objects.nonNull(input.history())) {
            List<TaskHistoryItem> updatedHistory = input.history().stream().map(hInput -> {
                if (Objects.nonNull(hInput.id())) {
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
            LOGGER.infof("Task %d history updated with %d entries", input.id(), updatedHistory.size());
        }

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d updated successfully", input.id());
        return output;
    }
}
