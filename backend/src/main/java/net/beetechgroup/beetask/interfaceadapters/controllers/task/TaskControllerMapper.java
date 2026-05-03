package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.task.start.StartTaskInput;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskInput;

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
                output.project(),
                output.history().stream().map(taskHistoryItemOutput -> new TaskHistoryItemResponse(taskHistoryItemOutput.startAt(), taskHistoryItemOutput.endAt())).toList()
        );
    }

    public static StartTaskInput toStartTaskInput(Long id) {
        return new StartTaskInput(id);
    }

    public static StopTaskInput toStopTaskInput(Long id) {
        return new StopTaskInput(id);
    }
}
