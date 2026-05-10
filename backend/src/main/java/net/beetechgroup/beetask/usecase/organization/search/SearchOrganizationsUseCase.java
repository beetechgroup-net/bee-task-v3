package net.beetechgroup.beetask.usecase.organization.search;

import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

import java.util.List;
import org.jboss.logging.Logger;

public class SearchOrganizationsUseCase {
    private static final Logger LOGGER = Logger.getLogger(SearchOrganizationsUseCase.class);
    private final OrganizationRepository organizationRepository;

    public SearchOrganizationsUseCase(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public List<SearchOrganizationOutput> execute(String query) {
        List<SearchOrganizationOutput> organizations = organizationRepository.search(query).stream()
                .map(org -> new SearchOrganizationOutput(org.getId(), org.getName()))
                .toList();
        LOGGER.infof("Organization search for query '%s' returned %d results", query, organizations.size());
        return organizations;
    }
}
