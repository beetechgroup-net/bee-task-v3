package net.beetechgroup.beetask.usecase.report.generate;

import java.time.LocalDate;
import java.util.Map;

public record GenerateReportInput(
        String userEmail,
        Long organizationId,
        Long templateId,
        Long projectId,
        LocalDate startDate,
        LocalDate endDate,
        Map<String, String> customFields
) {}
