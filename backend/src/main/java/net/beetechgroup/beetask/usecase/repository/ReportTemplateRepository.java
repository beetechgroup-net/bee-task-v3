package net.beetechgroup.beetask.usecase.repository;

import java.util.List;
import java.util.Optional;
import net.beetechgroup.beetask.entities.report.ReportTemplate;

public interface ReportTemplateRepository {
    ReportTemplate saveReportTemplate(ReportTemplate template);
    Optional<ReportTemplate> findReportTemplateById(Long id);
    List<ReportTemplate> findByOrganizationId(Long organizationId);
    List<ReportTemplate> findByProjectId(Long projectId);
    void deleteReportTemplateById(Long id);
}
