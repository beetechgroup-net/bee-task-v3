package net.beetechgroup.beetask.frameworks.persistence.repository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.report.GeneratedReport;
import net.beetechgroup.beetask.frameworks.persistence.entities.GeneratedReportEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.ReportTemplateEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.ReportEntityMapper;
import net.beetechgroup.beetask.usecase.repository.GeneratedReportRepository;
import org.jboss.logging.Logger;

@ApplicationScoped
public class GeneratedReportRepositoryImpl implements GeneratedReportRepository, PanacheRepository<GeneratedReportEntity> {
    private static final Logger LOGGER = Logger.getLogger(GeneratedReportRepositoryImpl.class);

    @Override
    @Transactional
    public GeneratedReport saveGeneratedReport(GeneratedReport report) {
        GeneratedReportEntity entity = new GeneratedReportEntity();
        entity.setId(report.getId());
        entity.setTitle(report.getTitle());
        entity.setStartDate(report.getStartDate());
        entity.setEndDate(report.getEndDate());
        entity.setFileUrl(report.getFileUrl());
        entity.setFileName(report.getFileName());
        entity.setStorageKey(report.getStorageKey());
        entity.setCreatedAt(report.getCreatedAt());

        if (report.getReportTemplateId() != null) {
            ReportTemplateEntity template = new ReportTemplateEntity();
            template.setId(report.getReportTemplateId());
            entity.setReportTemplate(template);
        }
        if (report.getOrganization() != null) {
            entity.setOrganization(net.beetechgroup.beetask.frameworks.persistence.mapper.OrganizationEntityMapper.toEntity(report.getOrganization()));
        }
        if (report.getProject() != null) {
            entity.setProject(net.beetechgroup.beetask.frameworks.persistence.mapper.ProjectEntityMapper.toEntity(report.getProject()));
        }
        if (report.getUser() != null) {
            entity.setUser(net.beetechgroup.beetask.frameworks.persistence.mapper.UserEntityMapper.toEntity(report.getUser()));
        }

        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        GeneratedReport saved = ReportEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted generated report %d for organization %d", saved.getId(), saved.getOrganization().getId());
        return saved;
    }

    @Override
    public Optional<GeneratedReport> findGeneratedReportById(Long id) {
        return findByIdOptional(id).map(ReportEntityMapper::toDomain);
    }

    @Override
    public List<GeneratedReport> findByOrganizationId(Long organizationId) {
        return find("organization.id = ?1 order by createdAt desc", organizationId).stream()
                .map(ReportEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<GeneratedReport> findByUserId(Long userId) {
        return find("user.id = ?1 order by createdAt desc", userId).stream()
                .map(ReportEntityMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void deleteGeneratedReportById(Long id) {
        delete("id", id);
        LOGGER.infof("Deleted generated report %d", id);
    }
}
