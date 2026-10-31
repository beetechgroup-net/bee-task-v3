package net.beetechgroup.beetask.usecase.report.list;

import java.util.List;
import net.beetechgroup.beetask.entities.report.GeneratedReport;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.GeneratedReportRepository;

public class ListGeneratedReportsUseCase {

    private final GeneratedReportRepository generatedReportRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public ListGeneratedReportsUseCase(
            GeneratedReportRepository generatedReportRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.generatedReportRepository = generatedReportRepository;
        this.authorizer = authorizer;
    }

    public List<GeneratedReport> execute(String userEmail, Long organizationId) {
        authorizer.execute(userEmail, organizationId);
        return generatedReportRepository.findByOrganizationId(organizationId);
    }
}
