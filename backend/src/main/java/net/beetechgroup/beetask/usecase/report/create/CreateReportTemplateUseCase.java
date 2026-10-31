package net.beetechgroup.beetask.usecase.report.create;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.report.ReportSection;
import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.report.ReportMapper;
import net.beetechgroup.beetask.usecase.report.ReportTemplateOutput;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class CreateReportTemplateUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateReportTemplateUseCase.class);

    private final ReportTemplateRepository reportTemplateRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final StorageRepository storageRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public CreateReportTemplateUseCase(
            ReportTemplateRepository reportTemplateRepository,
            OrganizationRepository organizationRepository,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.organizationRepository = organizationRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.storageRepository = storageRepository;
        this.authorizer = authorizer;
    }

    public ReportTemplateOutput execute(CreateReportTemplateInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        if (input.name() == null || input.name().trim().isBlank()) {
            throw new IllegalArgumentException("Nome do modelo de relatório é obrigatório");
        }
        if (input.fileInputStream() == null || input.fileName() == null) {
            throw new IllegalArgumentException("Arquivo de modelo .docx é obrigatório");
        }
        if (!input.fileName().toLowerCase().endsWith(".docx")) {
            throw new IllegalArgumentException("O arquivo de modelo deve ser no formato .docx");
        }

        Organization org = organizationRepository.findOrganizationById(input.organizationId())
                .orElseThrow(() -> new IllegalArgumentException("Organização não encontrada"));

        User user = userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Project project = null;
        if (input.projectId() != null && input.projectId() > 0) {
            project = projectRepository.findProjectById(input.projectId()).orElse(null);
        }

        // Upload do arquivo para MinIO
        String cleanFileName = input.fileName().replaceAll("[^a-zA-Z0-9._-]", "_");
        String storageKey = "reports/templates/" + org.getId() + "/" + UUID.randomUUID() + "_" + cleanFileName;
        String contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        String fileUrl = storageRepository.upload(storageKey, input.fileInputStream(), contentType, input.fileSize());

        ReportTemplate template = new ReportTemplate();
        template.setOrganization(org);
        template.setProject(project);
        template.setName(input.name().trim());
        template.setDescription(input.description());
        template.setScope(input.scope() != null && input.scope().equalsIgnoreCase("PROJECT") ? "PROJECT" : "ORGANIZATION");
        template.setFileName(input.fileName());
        template.setStorageKey(storageKey);
        template.setFileUrl(fileUrl);
        template.setCreatedBy(user);
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());

        List<ReportSection> sections = new ArrayList<>();
        if (input.sections() != null) {
            int order = 0;
            for (CreateReportTemplateInput.SectionInput sInput : input.sections()) {
                if (sInput.sectionKey() == null || sInput.sectionKey().isBlank()) continue;

                ReportSection section = new ReportSection();
                section.setSectionKey(sInput.sectionKey().trim().toLowerCase().replaceAll("[^a-z0-9_]", "_"));
                section.setTitle(sInput.title() != null ? sInput.title().trim() : section.getSectionKey());
                section.setSectionType(sInput.sectionType() != null ? sInput.sectionType() : "FREE_TEXT");
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

        ReportTemplate saved = reportTemplateRepository.saveReportTemplate(template);
        LOGGER.infof("Template de relatório '%s' salvo com ID %d", saved.getName(), saved.getId());
        return ReportMapper.toOutput(saved);
    }
}
