package net.beetechgroup.beetask.usecase.report.update;

import java.io.InputStream;
import java.util.List;
import net.beetechgroup.beetask.usecase.report.create.CreateReportTemplateInput.SectionInput;

public record UpdateReportTemplateInput(
        String userEmail,
        Long organizationId,
        Long templateId,
        Long projectId,
        String name,
        String description,
        String scope,
        String fileName,
        InputStream fileInputStream,
        long fileSize,
        List<SectionInput> sections
) {}
