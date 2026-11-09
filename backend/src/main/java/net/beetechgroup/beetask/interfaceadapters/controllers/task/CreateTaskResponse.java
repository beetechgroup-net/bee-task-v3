package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.time.LocalDateTime;
import java.util.List;

public record CreateTaskResponse(
                Long id,
                String title,
                String description,
                String status,
                TaskStatusResponse taskStatus,
                ProjectResponse project,
                CategoryResponse category,
                UserResponse user,
                UserResponse createdBy,
                LocalDateTime finishedAt,
                List<TaskHistoryItemResponse> history,
                String externalUrl) {

    public record TaskStatusResponse(
            Long id,
            String name,
            String color,
            Integer position,
            boolean isDefault,
            boolean isCompleted,
            boolean isCanceled) {}

    public record ProjectResponse(Long id, String name) {}
    public record CategoryResponse(Long id, String name, String color, String icon) {}
    public record UserResponse(Long id, String name, String email, String photo) {}
}
