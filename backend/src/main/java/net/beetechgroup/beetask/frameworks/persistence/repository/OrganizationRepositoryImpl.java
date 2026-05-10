package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.frameworks.persistence.entities.OrganizationEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.OrganizationEntityMapper;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@ApplicationScoped
public class OrganizationRepositoryImpl implements OrganizationRepository, PanacheRepository<OrganizationEntity> {
    private static final Logger LOGGER = Logger.getLogger(OrganizationRepositoryImpl.class);

    @Override
    @Transactional
    public Organization saveOrganization(Organization organization) {
        OrganizationEntity entity = OrganizationEntityMapper.toEntity(organization);
        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        Organization savedOrganization = OrganizationEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted organization %d with name '%s'", savedOrganization.getId(), savedOrganization.getName());
        return savedOrganization;
    }

    @Override
    public List<Organization> search(String query) {
        if (Objects.isNull(query) || query.isBlank()) {
            List<Organization> organizations = findAll().list().stream()
                    .map(OrganizationEntityMapper::toDomain)
                    .toList();
            LOGGER.infof("Loaded %d organizations with empty search query", organizations.size());
            return organizations;
        }

        List<Organization> organizations = find("name like ?1", "%" + query + "%").stream()
                .map(OrganizationEntityMapper::toDomain)
                .toList();
        LOGGER.infof("Loaded %d organizations for search query '%s'", organizations.size(), query);
        return organizations;
    }

    @Override
    public Optional<Organization> findOrganizationById(Long id) {
        Optional<Organization> organization = findByIdOptional(id)
                .map(OrganizationEntityMapper::toDomain);
        if (organization.isEmpty()) {
            LOGGER.warnf("Organization %d was not found", id);
        }
        return organization;
    }
}
