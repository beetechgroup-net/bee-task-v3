package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.frameworks.persistence.entities.OrganizationEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.OrganizationEntityMapper;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@ApplicationScoped
public class OrganizationRepositoryImpl implements OrganizationRepository, PanacheRepository<OrganizationEntity> {

    @Override
    @Transactional
    public Organization saveOrganization(Organization organization) {
        OrganizationEntity entity = OrganizationEntityMapper.toEntity(organization);
        if (entity.getId() == null) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        return OrganizationEntityMapper.toDomain(entity);
    }

    @Override
    public List<Organization> search(String query) {
        if (Objects.isNull(query) || query.isBlank()) {
            return findAll().list().stream()
                    .map(OrganizationEntityMapper::toDomain)
                    .toList();
        }

        return find("name like ?1", "%" + query + "%").stream()
                .map(OrganizationEntityMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Organization> findOrganizationById(Long id) {
        return findByIdOptional(id)
                .map(OrganizationEntityMapper::toDomain);
    }
}