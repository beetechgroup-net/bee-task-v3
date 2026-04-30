package net.beetechgroup.beetask.interfaceadapters.dtos;

import java.util.List;

import net.beetechgroup.beetask.entities.TaskStatus;

public record TaskResponseDTO(
                Long id,
                String title,
                String description,
                TaskStatus status,
                String project,
                List<TaskHistoryItemDTO> history) {
}
