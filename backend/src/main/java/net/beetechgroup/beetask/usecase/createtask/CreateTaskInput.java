package net.beetechgroup.beetask.usecase.createtask;

import java.util.List;

public record CreateTaskInput(
        String title,
        String description,
        String status,
        String project,
        List<String> activities) {
}
