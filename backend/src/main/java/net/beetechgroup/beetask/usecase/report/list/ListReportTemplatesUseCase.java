package net.beetechgroup.beetask.usecase.report.list;

import java.util.List;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.report.ReportMapper;
import net.beetechgroup.beetask.usecase.report.ReportTemplateOutput;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;

public class ListReportTemplatesUseCase {

    private final ReportTemplateRepository reportTemplateRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public ListReportTemplatesUseCase(
            ReportTemplateRepository reportTemplateRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.authorizer = authorizer;
    }

    public List<ReportTemplateOutput> execute(String userEmail, Long organizationId, Long projectId) {
        authorizer.execute(userEmail, organizationId);

        if (projectId != null && projectId > 0) {
            return reportTemplateRepository.findByProjectId(projectId).stream()
                    .map(ReportMapper::toOutput)
                    .toList();
        }

        return reportTemplateRepository.findByOrganizationId(organizationId).stream()
                .map(ReportMapper::toOutput)
                .toList();
    }
}
