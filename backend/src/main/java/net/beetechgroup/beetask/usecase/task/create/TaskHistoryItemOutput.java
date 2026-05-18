package net.beetechgroup.beetask.usecase.task.create;

import java.time.LocalDateTime;

public record TaskHistoryItemOutput(
        Long id,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Long elapsedSeconds) {
}
