package net.beetechgroup.beetask.usecase.report;

import java.time.LocalDateTime;

public record ReportSectionOutput(
        Long id,
        String sectionKey,
        String title,
        String sectionType,
        Long filterCategoryId,
        String filterCategoryName,
        String filterStatus,
        Boolean includeTime,
        Integer orderIndex,
        LocalDateTime createdAt
) {}
