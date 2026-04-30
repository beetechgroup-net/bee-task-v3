package net.beetechgroup.beetask.interfaceadapters.dtos;

import java.time.LocalDateTime;

public record TaskHistoryItemDTO(LocalDateTime startAt, LocalDateTime endAt) {

}
