package net.beetechgroup.beetask.interfaceadapters.dtos;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.entities.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.start.StartTaskInput;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskInput;

public class TaskDTOMapper {

    public static CreateTaskInput toCreateTaskInput(TaskRequestDTO request) {
        return new CreateTaskInput(
                request.title(),
                request.description(),
                request.status(),
                request.project()
        );
    }

    public static TaskResponseDTO toTaskResponseDTO(Task task) {
        return new TaskResponseDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getProject(),
                task.getHistory().stream().map(TaskDTOMapper::toTaskHistoryItemDTO).toList()
        );
    }

    private static TaskHistoryItemDTO toTaskHistoryItemDTO(TaskHistoryItem taskHistoryItem) {
        return new TaskHistoryItemDTO(taskHistoryItem.getStartAt(), taskHistoryItem.getEndAt());
    }

    public static StartTaskInput toStartTaskInput(Long id) {
        return new StartTaskInput(id);
    }

    public static StopTaskInput toStopTaskInput(Long id) {
        return new StopTaskInput(id);
    }
}
