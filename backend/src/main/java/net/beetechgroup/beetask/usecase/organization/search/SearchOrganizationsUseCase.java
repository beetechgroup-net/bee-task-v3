package net.beetechgroup.beetask.usecase.organization.search;

import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

import java.util.List;

public class SearchOrganizationsUseCase {
    private final OrganizationRepository organizationRepository;

    public SearchOrganizationsUseCase(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public List<SearchOrganizationOutput> execute(String query) {
        return organizationRepository.search(query).stream()
                .map(org -> new SearchOrganizationOutput(org.getId(), org.getName()))
                .toList();
    }
}
