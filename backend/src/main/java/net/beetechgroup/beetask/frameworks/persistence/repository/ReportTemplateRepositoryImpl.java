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
    @Transactional
    public Optional<ReportTemplate> findReportTemplateById(Long id) {
        return find("select distinct t from ReportTemplateEntity t left join fetch t.sections s left join fetch s.filterCategory left join fetch t.project left join fetch t.organization left join fetch t.createdBy where t.id = ?1", id)
                .firstResultOptional()
                .map(ReportEntityMapper::toDomain);
    }

    @Override
    @Transactional
    public List<ReportTemplate> findByOrganizationId(Long organizationId) {
        List<ReportTemplateEntity> entities = find("select distinct t from ReportTemplateEntity t left join fetch t.sections s left join fetch s.filterCategory left join fetch t.project left join fetch t.organization left join fetch t.createdBy where t.organization.id = ?1 order by t.createdAt desc", organizationId)
                .list();
        return entities.stream()
                .map(ReportEntityMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public List<ReportTemplate> findByProjectId(Long projectId) {
        List<ReportTemplateEntity> entities = find("select distinct t from ReportTemplateEntity t left join fetch t.sections s left join fetch s.filterCategory left join fetch t.project left join fetch t.organization left join fetch t.createdBy where t.project.id = ?1 order by t.createdAt desc", projectId)
                .list();
        return entities.stream()
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
