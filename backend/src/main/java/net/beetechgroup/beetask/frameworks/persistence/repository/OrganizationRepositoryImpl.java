package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.frameworks.persistence.entities.OrganizationEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.OrganizationEntityMapper;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

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

}