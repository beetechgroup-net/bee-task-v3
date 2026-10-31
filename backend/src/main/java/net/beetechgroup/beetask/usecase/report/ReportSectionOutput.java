package net.beetechgroup.beetask.usecase.report;

import java.time.LocalDateTime;

public record ReportSectionOutput(
        Long id,
        String sectionKey,
        String title,
        String sectionType,
        String defaultValue,
        String dateFormat,
        Long filterCategoryId,
        String filterCategoryName,
        String filterStatus,
        Boolean includeTime,
        Integer orderIndex,
        LocalDateTime createdAt
) {}
