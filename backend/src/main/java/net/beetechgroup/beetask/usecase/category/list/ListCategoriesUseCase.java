package net.beetechgroup.beetask.usecase.category.list;

import java.util.List;

import net.beetechgroup.beetask.usecase.category.CategoryMapper;
import net.beetechgroup.beetask.usecase.category.CategoryOutput;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import org.jboss.logging.Logger;

public class ListCategoriesUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListCategoriesUseCase.class);
    private final CategoryRepository categoryRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public ListCategoriesUseCase(CategoryRepository categoryRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.categoryRepository = categoryRepository;
        this.authorizer = authorizer;
    }

    public List<CategoryOutput> execute(String userEmail, Long organizationId) {
        authorizer.execute(userEmail, organizationId);
        List<CategoryOutput> categories = categoryRepository.findByOrganizationId(organizationId).stream()
                .map(CategoryMapper::toCategoryOutput)
                .toList();
        LOGGER.infof("Loaded %d categories for organization %d by user %s", categories.size(), organizationId, userEmail);
        return categories;
    }
}

