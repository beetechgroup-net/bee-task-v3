package net.beetechgroup.beetask.usecase.report.update;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.report.ReportSection;
import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.report.ReportMapper;
import net.beetechgroup.beetask.usecase.report.ReportTemplateOutput;
import net.beetechgroup.beetask.usecase.report.create.CreateReportTemplateInput;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import org.jboss.logging.Logger;

public class UpdateReportTemplateUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateReportTemplateUseCase.class);

    private final ReportTemplateRepository reportTemplateRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final StorageRepository storageRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public UpdateReportTemplateUseCase(
            ReportTemplateRepository reportTemplateRepository,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.storageRepository = storageRepository;
        this.authorizer = authorizer;
    }

    public ReportTemplateOutput execute(UpdateReportTemplateInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        if (input.templateId() == null) {
            throw new IllegalArgumentException("ID do modelo de relatório é obrigatório");
        }
        if (input.name() == null || input.name().trim().isBlank()) {
            throw new IllegalArgumentException("Nome do modelo de relatório é obrigatório");
        }

        ReportTemplate template = reportTemplateRepository.findReportTemplateById(input.templateId())
                .orElseThrow(() -> new IllegalArgumentException("Modelo de relatório não encontrado"));

        if (!template.getOrganization().getId().equals(input.organizationId())) {
            throw new IllegalArgumentException("Modelo de relatório não pertence a esta organização");
        }

        template.setName(input.name().trim());
        template.setDescription(input.description());
        template.setScope(input.scope() != null && input.scope().equalsIgnoreCase("PROJECT") ? "PROJECT" : "ORGANIZATION");

        if ("PROJECT".equalsIgnoreCase(template.getScope()) && input.projectId() != null && input.projectId() > 0) {
            Project project = projectRepository.findProjectById(input.projectId()).orElse(null);
            template.setProject(project);
        } else {
            template.setProject(null);
        }

        // Se enviou um novo arquivo .docx, fazer upload no MinIO e atualizar caminho
        if (input.fileInputStream() != null && input.fileName() != null && !input.fileName().isBlank()) {
            if (!input.fileName().toLowerCase().endsWith(".docx")) {
                throw new IllegalArgumentException("O arquivo de modelo deve ser no formato .docx");
            }
            String cleanFileName = input.fileName().replaceAll("[^a-zA-Z0-9._-]", "_");
            String storageKey = "reports/templates/" + input.organizationId() + "/" + UUID.randomUUID() + "_" + cleanFileName;
            String contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            String fileUrl = storageRepository.upload(storageKey, input.fileInputStream(), contentType, input.fileSize());

            template.setFileName(input.fileName());
            template.setStorageKey(storageKey);
            template.setFileUrl(fileUrl);
        }

        // Atualizar seções
        List<ReportSection> sections = new ArrayList<>();
        if (input.sections() != null) {
            int order = 0;
            for (CreateReportTemplateInput.SectionInput sInput : input.sections()) {
                if (sInput.sectionKey() == null || sInput.sectionKey().isBlank()) continue;

                ReportSection section = new ReportSection();
                section.setSectionKey(sInput.sectionKey().trim().toLowerCase().replaceAll("[^a-z0-9_]", "_"));
                section.setTitle(sInput.title() != null ? sInput.title().trim() : section.getSectionKey());
                section.setSectionType(sInput.sectionType() != null ? sInput.sectionType() : "FREE_TEXT");
                section.setDefaultValue(sInput.defaultValue() != null ? sInput.defaultValue().trim() : null);
                section.setDateFormat(sInput.dateFormat() != null ? sInput.dateFormat().trim() : null);
                section.setFilterStatus(sInput.filterStatus() != null ? sInput.filterStatus() : "ALL");
                section.setIncludeTime(sInput.includeTime() != null ? sInput.includeTime() : true);
                section.setOrderIndex(sInput.orderIndex() != null ? sInput.orderIndex() : order++);
                section.setCreatedAt(LocalDateTime.now());

                if (sInput.filterCategoryId() != null && sInput.filterCategoryId() > 0) {
                    Category cat = categoryRepository.findCategoryById(sInput.filterCategoryId()).orElse(null);
                    section.setFilterCategory(cat);
                }

                sections.add(section);
            }
        }
        template.setSections(sections);
        template.setUpdatedAt(LocalDateTime.now());

        ReportTemplate updated = reportTemplateRepository.saveReportTemplate(template);
        LOGGER.infof("Modelo de relatório '%s' (ID %d) atualizado com sucesso", updated.getName(), updated.getId());
        return ReportMapper.toOutput(updated);
    }
}
