package net.beetechgroup.beetask.usecase.report.delete;

import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;

public class DeleteReportTemplateUseCase {

    private final ReportTemplateRepository reportTemplateRepository;
    private final StorageRepository storageRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public DeleteReportTemplateUseCase(
            ReportTemplateRepository reportTemplateRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.storageRepository = storageRepository;
        this.authorizer = authorizer;
    }

    public void execute(String userEmail, Long templateId) {
        ReportTemplate template = reportTemplateRepository.findReportTemplateById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Modelo de relatório não encontrado"));

        authorizer.execute(userEmail, template.getOrganization().getId());

        if (template.getStorageKey() != null) {
            storageRepository.delete(template.getStorageKey());
        }

        reportTemplateRepository.deleteReportTemplateById(templateId);
    }
}
