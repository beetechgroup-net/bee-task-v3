package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.time.LocalDateTime;

public record TaskHistoryItemResponse(
        Long id,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Long elapsedSeconds) {
}
