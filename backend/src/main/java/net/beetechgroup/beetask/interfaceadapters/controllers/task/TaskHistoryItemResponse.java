package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.time.LocalDateTime;

public record TaskHistoryItemResponse(
                LocalDateTime startAt,
                LocalDateTime endAt) {
}
