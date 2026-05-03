package net.beetechgroup.beetask.usecase.repository;


import net.beetechgroup.beetask.entities.organization.Organization;

public interface OrganizationRepository {
    Organization saveOrganization(Organization organization);
}