package net.beetechgroup.beetask.usecase.report.create;

import java.io.InputStream;
import java.util.List;

public record CreateReportTemplateInput(
        String userEmail,
        Long organizationId,
        Long projectId,
        String name,
        String description,
        String scope,
        String managerName,
        String customProjectName,
        String dateFormatPattern,
        String fileName,
        InputStream fileInputStream,
        long fileSize,
        List<SectionInput> sections
) {
    public record SectionInput(
            String sectionKey,
            String title,
            String sectionType,
            String defaultValue,
            Long filterCategoryId,
            String filterStatus,
            Boolean includeTime,
            Integer orderIndex
    ) {}
}
