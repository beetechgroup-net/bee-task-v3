package net.beetechgroup.beetask.frameworks.persistence.repository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.frameworks.persistence.entities.ReportTemplateEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.ReportEntityMapper;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import org.jboss.logging.Logger;

@ApplicationScoped
public class ReportTemplateRepositoryImpl implements ReportTemplateRepository, PanacheRepository<ReportTemplateEntity> {
    private static final Logger LOGGER = Logger.getLogger(ReportTemplateRepositoryImpl.class);

    @Override
    @Transactional
    public ReportTemplate saveReportTemplate(ReportTemplate template) {
        ReportTemplateEntity entity = ReportEntityMapper.toEntity(template);
        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            ReportTemplateEntity existing = findById(entity.getId());
            if (existing != null) {
                existing.setName(entity.getName());
                existing.setDescription(entity.getDescription());
                existing.setScope(entity.getScope());
                existing.setProject(entity.getProject());
                existing.setFileName(entity.getFileName());
                existing.setFileUrl(entity.getFileUrl());
                existing.setStorageKey(entity.getStorageKey());
                existing.setManagerName(entity.getManagerName());
                existing.setCustomProjectName(entity.getCustomProjectName());
                existing.setDateFormatPattern(entity.getDateFormatPattern());
                existing.setUpdatedAt(java.time.LocalDateTime.now());

                existing.getSections().clear();
                if (entity.getSections() != null) {
                    for (net.beetechgroup.beetask.frameworks.persistence.entities.ReportSectionEntity s : entity.getSections()) {
                        s.setReportTemplate(existing);
                        existing.getSections().add(s);
                    }
                }
                entity = existing;
            } else {
                entity = getEntityManager().merge(entity);
            }
        }
        getEntityManager().flush();
        ReportTemplate saved = ReportEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted report template %d for organization %d", saved.getId(), saved.getOrganization().getId());
        return saved;
    }

    @Override
    public Optional<ReportTemplate> findReportTemplateById(Long id) {
        return findByIdOptional(id).map(ReportEntityMapper::toDomain);
    }

    @Override
    public List<ReportTemplate> findByOrganizationId(Long organizationId) {
        return find("organization.id = ?1 order by createdAt desc", organizationId).stream()
                .map(ReportEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<ReportTemplate> findByProjectId(Long projectId) {
        return find("project.id = ?1 order by createdAt desc", projectId).stream()
                .map(ReportEntityMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void deleteReportTemplateById(Long id) {
        delete("id", id);
        LOGGER.infof("Deleted report template %d", id);
    }
}
