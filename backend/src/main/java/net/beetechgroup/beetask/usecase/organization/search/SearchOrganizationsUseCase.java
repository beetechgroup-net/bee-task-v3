package net.beetechgroup.beetask.usecase.organization.search;

import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

import java.util.List;
import java.util.stream.Collectors;

public class SearchOrganizationsUseCase {
    private final OrganizationRepository organizationRepository;

    public SearchOrganizationsUseCase(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public List<SearchOrganizationOutput> execute(String query) {
        List<Organization> results = organizationRepository.search(query);
        return results.stream()
                .map(org -> new SearchOrganizationOutput(org.getId(), org.getName()))
                .collect(Collectors.toList());
    }
}
