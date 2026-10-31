package net.beetechgroup.beetask.usecase.report;

import java.time.LocalDateTime;
import java.util.List;

public record ReportTemplateOutput(
        Long id,
        Long organizationId,
        String organizationName,
        Long projectId,
        String projectName,
        String name,
        String description,
        String scope,
        String fileUrl,
        String fileName,
        String storageKey,
        Long createdById,
        String createdByName,
        String managerName,
        String customProjectName,
        String dateFormatPattern,
        List<ReportSectionOutput> sections,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
