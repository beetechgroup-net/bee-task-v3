package net.beetechgroup.beetask.usecase.repository;


import net.beetechgroup.beetask.entities.organization.Organization;
import java.util.List;
import java.util.Optional;

public interface OrganizationRepository {
    Organization saveOrganization(Organization organization);
    List<Organization> search(String query);
    Optional<Organization> findOrganizationById(Long id);
}