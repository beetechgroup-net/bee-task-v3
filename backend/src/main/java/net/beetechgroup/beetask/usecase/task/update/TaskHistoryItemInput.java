package net.beetechgroup.beetask.usecase.task.update;

import java.time.LocalDateTime;

public record TaskHistoryItemInput(
        Long id,
        LocalDateTime startAt,
        LocalDateTime endAt) {
}
