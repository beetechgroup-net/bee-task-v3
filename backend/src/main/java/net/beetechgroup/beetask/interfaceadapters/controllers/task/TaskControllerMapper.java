package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.ArrayList;
import java.util.List;
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

    private static List<String> normalizeStatuses(List<String> rawStatuses) {
        if (rawStatuses == null || rawStatuses.isEmpty()) {
            return rawStatuses;
        }
        List<String> normalized = new ArrayList<>();
        for (String s : rawStatuses) {
            if (s == null) continue;
            normalized.add(s);
            String trimmed = s.trim();
            if ("NOT_STARTED".equalsIgnoreCase(trimmed) && !normalized.contains("A Fazer")) {
                normalized.add("A Fazer");
            } else if ("IN_PROGRESS".equalsIgnoreCase(trimmed) && !normalized.contains("Em Andamento")) {
                normalized.add("Em Andamento");
            } else if ("COMPLETED".equalsIgnoreCase(trimmed) && !normalized.contains("Concluído")) {
                normalized.add("Concluído");
            } else if ("CANCELED".equalsIgnoreCase(trimmed) && !normalized.contains("Cancelado")) {
                normalized.add("Cancelado");
            }
        }
        return normalized;
    }

    public static ListTasksInput toListTasksInput(ListTasksRequest request, String email) {
        return new ListTasksInput(
                email,
                request.organizationId,
                request.text,
                request.projectIds,
                normalizeStatuses(request.statuses),
                request.categoryIds,
                request.userIds
        );
    }

    public static ListMyTasksInput toListMyTasksInput(ListMyTasksRequest request, String email) {
        return new ListMyTasksInput(email, request.text, request.projectIds, normalizeStatuses(request.statuses), request.categoryIds);
    }

    public static CreateTaskInput toCreateTaskInput(CreateTaskRequest request, String userEmail) {
        return new CreateTaskInput(
                request.title(),
                request.description(),
                request.status(),
                request.statusId(),
                request.organizationId(),
                request.projectId(),
                request.categoryId(),
                request.assigneeUserId(),
                userEmail,
                Objects.nonNull(request.history()) ? request.history().stream()
                        .map(h -> new TaskHistoryItemInput(h.id(), h.startAt(), h.endAt()))
                        .toList() : null,
                request.externalUrl()
        );
    }

    public static CreateTaskResponse toCreateTaskResponse(CreateTaskOutput output) {
        return new CreateTaskResponse(
                output.id(),
                output.title(),
                output.description(),
                output.status() != null ? output.status().getName() : null,
                output.status() != null ? new CreateTaskResponse.TaskStatusResponse(
                        output.status().getId(),
                        output.status().getName(),
                        output.status().getColor(),
                        output.status().getPosition(),
                        output.status().isDefault(),
                        output.status().isCompleted(),
                        output.status().isCanceled()) : null,
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
                Objects.nonNull(output.createdBy())
                        ? new CreateTaskResponse.UserResponse(
                                output.createdBy().id(),
                                output.createdBy().name(),
                                output.createdBy().email(),
                                output.createdBy().photo())
                        : null,
                output.finishedAt(),
                output.history().stream().map(taskHistoryItemOutput -> new TaskHistoryItemResponse(
                        taskHistoryItemOutput.id(), taskHistoryItemOutput.startAt(), taskHistoryItemOutput.endAt(), taskHistoryItemOutput.elapsedSeconds())).toList(),
                output.externalUrl()
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
                request.statusId(),
                request.organizationId(),
                request.projectId(),
                request.categoryId(),
                request.assigneeUserId(),
                userEmail,
                Objects.nonNull(request.history()) ? request.history().stream()
                        .map(h -> new TaskHistoryItemInput(h.id(), h.startAt(), h.endAt()))
                        .toList() : null,
                request.externalUrl()
        );
    }
}
