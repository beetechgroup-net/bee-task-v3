package net.beetechgroup.beetask.interfaceadapters.dtos;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.usecase.createtask.CreateTaskInput;

public class TaskDTOMapper {

    public static CreateTaskInput toInput(TaskRequestDTO request) {
        return new CreateTaskInput(
                request.title(),
                request.description(),
                request.status(),
                request.project(),
                request.activities()
        );
    }

    public static TaskResponseDTO toResponse(Task task) {
        return new TaskResponseDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getProject(),
                task.getActivities()
        );
    }
}
