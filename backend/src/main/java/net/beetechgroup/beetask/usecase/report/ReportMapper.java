package net.beetechgroup.beetask.usecase.report;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import net.beetechgroup.beetask.entities.report.ReportSection;
import net.beetechgroup.beetask.entities.report.ReportTemplate;

public class ReportMapper {

    public static ReportTemplateOutput toOutput(ReportTemplate template) {
        if (Objects.isNull(template)) return null;

        List<ReportSectionOutput> sections = template.getSections() != null
                ? template.getSections().stream().map(ReportMapper::toSectionOutput).collect(Collectors.toList())
                : Collections.emptyList();

        return new ReportTemplateOutput(
                template.getId(),
                template.getOrganization() != null ? template.getOrganization().getId() : null,
                template.getOrganization() != null ? template.getOrganization().getName() : null,
                template.getProject() != null ? template.getProject().getId() : null,
                template.getProject() != null ? template.getProject().getName() : null,
                template.getName(),
                template.getDescription(),
                template.getScope(),
                template.getFileUrl(),
                template.getFileName(),
                template.getStorageKey(),
                template.getCreatedBy() != null ? template.getCreatedBy().getId() : null,
                template.getCreatedBy() != null ? template.getCreatedBy().getName() : null,
                template.getManagerName(),
                template.getCustomProjectName(),
                template.getDateFormatPattern(),
                sections,
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }

    public static ReportSectionOutput toSectionOutput(ReportSection section) {
        if (Objects.isNull(section)) return null;
        return new ReportSectionOutput(
                section.getId(),
                section.getSectionKey(),
                section.getTitle(),
                section.getSectionType(),
                section.getDefaultValue(),
                section.getDateFormat(),
                section.getAiPrompt(),
                section.getFilterCategory() != null ? section.getFilterCategory().getId() : null,
                section.getFilterCategory() != null ? section.getFilterCategory().getName() : null,
                section.getFilterStatus(),
                section.getIncludeTime(),
                section.getOrderIndex(),
                section.getCreatedAt()
        );
    }
}
