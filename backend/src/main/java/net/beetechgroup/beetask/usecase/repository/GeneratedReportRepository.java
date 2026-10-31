package net.beetechgroup.beetask.usecase.repository;

import java.util.List;
import java.util.Optional;
import net.beetechgroup.beetask.entities.report.GeneratedReport;

public interface GeneratedReportRepository {
    GeneratedReport saveGeneratedReport(GeneratedReport report);
    Optional<GeneratedReport> findGeneratedReportById(Long id);
    List<GeneratedReport> findByOrganizationId(Long organizationId);
    List<GeneratedReport> findByUserId(Long userId);
    void deleteGeneratedReportById(Long id);
}
