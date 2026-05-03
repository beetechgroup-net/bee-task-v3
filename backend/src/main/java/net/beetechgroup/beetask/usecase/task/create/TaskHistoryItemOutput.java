package net.beetechgroup.beetask.usecase.task.create;

import java.time.LocalDateTime;

public record TaskHistoryItemOutput(
        LocalDateTime startAt,
        LocalDateTime endAt) {
}
