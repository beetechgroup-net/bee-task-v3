package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.report.create.CreateReportTemplateUseCase;
import net.beetechgroup.beetask.usecase.report.update.UpdateReportTemplateUseCase;
import net.beetechgroup.beetask.usecase.report.delete.DeleteReportTemplateUseCase;
import net.beetechgroup.beetask.usecase.report.generate.GenerateReportUseCase;
import net.beetechgroup.beetask.usecase.report.list.ListGeneratedReportsUseCase;
import net.beetechgroup.beetask.usecase.report.list.ListReportTemplatesUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.GeneratedReportRepository;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

@ApplicationScoped
public class ReportUseCaseConfig {

    @Produces
    public CreateReportTemplateUseCase createReportTemplateUseCase(
            ReportTemplateRepository reportTemplateRepository,
            OrganizationRepository organizationRepository,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        return new CreateReportTemplateUseCase(
                reportTemplateRepository,
                organizationRepository,
                projectRepository,
                categoryRepository,
                userRepository,
                storageRepository,
                authorizer
        );
    }

    @Produces
    public UpdateReportTemplateUseCase updateReportTemplateUseCase(
            ReportTemplateRepository reportTemplateRepository,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        return new UpdateReportTemplateUseCase(
                reportTemplateRepository,
                projectRepository,
                categoryRepository,
                storageRepository,
                authorizer
        );
    }

    @Produces
    public ListReportTemplatesUseCase listReportTemplatesUseCase(
            ReportTemplateRepository reportTemplateRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        return new ListReportTemplatesUseCase(reportTemplateRepository, authorizer);
    }

    @Produces
    public DeleteReportTemplateUseCase deleteReportTemplateUseCase(
            ReportTemplateRepository reportTemplateRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        return new DeleteReportTemplateUseCase(reportTemplateRepository, storageRepository, authorizer);
    }

    @Produces
    public GenerateReportUseCase generateReportUseCase(
            ReportTemplateRepository reportTemplateRepository,
            GeneratedReportRepository generatedReportRepository,
            TaskRepository taskRepository,
            OrganizationRepository organizationRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        return new GenerateReportUseCase(
                reportTemplateRepository,
                generatedReportRepository,
                taskRepository,
                organizationRepository,
                projectRepository,
                userRepository,
                storageRepository,
                authorizer
        );
    }

    @Produces
    public ListGeneratedReportsUseCase listGeneratedReportsUseCase(
            GeneratedReportRepository generatedReportRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        return new ListGeneratedReportsUseCase(generatedReportRepository, authorizer);
    }
}
