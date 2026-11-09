package net.beetechgroup.beetask.interfaceadapters.controllers.taskstatus;

import net.beetechgroup.beetask.usecase.taskstatus.CreateTaskStatusInput;
import net.beetechgroup.beetask.usecase.taskstatus.TaskStatusOutput;
import net.beetechgroup.beetask.usecase.taskstatus.UpdateTaskStatusInput;

public class TaskStatusControllerMapper {

    public static CreateTaskStatusInput toCreateInput(String email, Long orgId, TaskStatusRequest request) {
        return new CreateTaskStatusInput(
                email,
                orgId,
                request.name(),
                request.color(),
                request.position(),
                request.isDefault(),
                request.isCompleted(),
                request.isCanceled()
        );
    }

    public static UpdateTaskStatusInput toUpdateInput(String email, Long orgId, Long id, TaskStatusRequest request) {
        return new UpdateTaskStatusInput(
                email,
                orgId,
                id,
                request.name(),
                request.color(),
                request.position(),
                request.isDefault(),
                request.isCompleted(),
                request.isCanceled()
        );
    }

    public static TaskStatusResponse toResponse(TaskStatusOutput output) {
        if (output == null) return null;
        return new TaskStatusResponse(
                output.id(),
                output.name(),
                output.color(),
                output.position(),
                output.isDefault(),
                output.isCompleted(),
                output.isCanceled(),
                output.organizationId(),
                output.taskCount()
        );
    }
}
