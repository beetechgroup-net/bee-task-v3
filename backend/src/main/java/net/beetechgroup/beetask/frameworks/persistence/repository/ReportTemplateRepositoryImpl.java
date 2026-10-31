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
            entity = getEntityManager().merge(entity);
        }
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
