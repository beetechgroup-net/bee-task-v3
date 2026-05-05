package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.task.start.StartTaskInput;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskInput;
import net.beetechgroup.beetask.usecase.task.update.TaskHistoryItemInput;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskInput;

public class TaskControllerMapper {

    public static CreateTaskInput toCreateTaskInput(CreateTaskRequest request) {
        return new CreateTaskInput(
                request.title(),
                request.description(),
                request.status(),
                request.projectId()
        );
    }

    public static CreateTaskResponse toCreateTaskResponse(CreateTaskOutput output) {
        return new CreateTaskResponse(
                output.id(),
                output.title(),
                output.description(),
                output.status(),
                output.projectName(),
                output.finishedAt(),
                output.history().stream().map(taskHistoryItemOutput -> new TaskHistoryItemResponse(taskHistoryItemOutput.id(), taskHistoryItemOutput.startAt(), taskHistoryItemOutput.endAt())).toList()
        );
    }

    public static StartTaskInput toStartTaskInput(Long id, String email) {
        return new StartTaskInput(id, email);
    }

    public static StopTaskInput toStopTaskInput(Long id) {
        return new StopTaskInput(id);
    }

    public static UpdateTaskInput toUpdateTaskInput(Long id, CreateTaskRequest request) {
        return new UpdateTaskInput(
                id,
                request.title(),
                request.description(),
                request.status(),
                request.projectId(),
                request.history() != null ? request.history().stream()
                        .map(h -> new TaskHistoryItemInput(h.id(), h.startAt(), h.endAt()))
                        .toList() : null
        );
    }
}
