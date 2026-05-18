package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.Objects;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskInput;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import net.beetechgroup.beetask.usecase.task.listall.ListTasksInput;
import net.beetechgroup.beetask.usecase.task.listall.ListMyTasksInput;
import net.beetechgroup.beetask.usecase.task.start.StartTaskInput;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskInput;
import net.beetechgroup.beetask.usecase.task.update.TaskHistoryItemInput;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskInput;

public class TaskControllerMapper {

    public static ListTasksInput toListTasksInput(ListTasksRequest request, String email) {
        return new ListTasksInput(
                email,
                request.organizationId,
                request.text,
                request.projectIds,
                request.statuses,
                request.categoryIds,
                request.userIds
        );
    }

    public static ListMyTasksInput toListMyTasksInput(ListMyTasksRequest request, String email) {
        return new ListMyTasksInput(email, request.text, request.projectIds, request.statuses, request.categoryIds);
    }

    public static CreateTaskInput toCreateTaskInput(CreateTaskRequest request, String userEmail) {
        return new CreateTaskInput(
                request.title(),
                request.description(),
                request.status(),
                request.projectId(),
                request.categoryId(),
                userEmail,
                Objects.nonNull(request.history()) ? request.history().stream()
                        .map(h -> new TaskHistoryItemInput(h.id(), h.startAt(), h.endAt()))
                        .toList() : null
        );
    }

    public static CreateTaskResponse toCreateTaskResponse(CreateTaskOutput output) {
        return new CreateTaskResponse(
                output.id(),
                output.title(),
                output.description(),
                output.status(),
                Objects.nonNull(output.project())
                        ? new CreateTaskResponse.ProjectResponse(output.project().id(), output.project().name())
                        : null,
                Objects.nonNull(output.category())
                        ? new CreateTaskResponse.CategoryResponse(
                                output.category().id(),
                                output.category().name(),
                                output.category().color(),
                                output.category().icon())
                        : null,
                Objects.nonNull(output.user())
                        ? new CreateTaskResponse.UserResponse(
                                output.user().id(),
                                output.user().name(),
                                output.user().email(),
                                output.user().photo())
                        : null,
                output.finishedAt(),
                output.history().stream().map(taskHistoryItemOutput -> new TaskHistoryItemResponse(
                        taskHistoryItemOutput.id(), taskHistoryItemOutput.startAt(), taskHistoryItemOutput.endAt())).toList()
        );
    }

    public static StartTaskInput toStartTaskInput(Long id, String email) {
        return new StartTaskInput(id, email);
    }

    public static StopTaskInput toStopTaskInput(Long id, String email) {
        return new StopTaskInput(id, email);
    }

    public static UpdateTaskInput toUpdateTaskInput(Long id, CreateTaskRequest request, String userEmail) {
        return new UpdateTaskInput(
                id,
                request.title(),
                request.description(),
                request.status(),
                request.projectId(),
                request.categoryId(),
                userEmail,
                Objects.nonNull(request.history()) ? request.history().stream()
                        .map(h -> new TaskHistoryItemInput(h.id(), h.startAt(), h.endAt()))
                        .toList() : null
        );
    }
}
