package net.beetechgroup.beetask.interfaceadapters.dtos;

import java.util.List;

public record TaskResponseDTO(
        Long id,
        String title,
        String description,
        String status,
        String project,
        List<String> activities) {
}
