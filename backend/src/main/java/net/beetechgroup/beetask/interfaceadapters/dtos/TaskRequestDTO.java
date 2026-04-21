package net.beetechgroup.beetask.interfaceadapters.dtos;

import java.util.List;

public record TaskRequestDTO(
        String title,
        String description,
        String status,
        String project,
        List<String> activities) {
}
