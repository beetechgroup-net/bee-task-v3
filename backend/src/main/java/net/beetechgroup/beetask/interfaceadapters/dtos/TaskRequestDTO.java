package net.beetechgroup.beetask.interfaceadapters.dtos;

import net.beetechgroup.beetask.entities.TaskStatus;

public record TaskRequestDTO(
                String title,
                String description,
                TaskStatus status,
                String project) {
}
