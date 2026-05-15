package net.beetechgroup.beetask.usecase.category.list;

import java.util.List;

import net.beetechgroup.beetask.usecase.category.CategoryMapper;
import net.beetechgroup.beetask.usecase.category.CategoryOutput;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import org.jboss.logging.Logger;

public class ListCategoriesUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListCategoriesUseCase.class);
    private final CategoryRepository categoryRepository;

    public ListCategoriesUseCase(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryOutput> execute(Long organizationId) {
        List<CategoryOutput> categories = categoryRepository.findByOrganizationId(organizationId).stream()
                .map(CategoryMapper::toCategoryOutput)
                .toList();
        LOGGER.infof("Loaded %d categories for organization %d", categories.size(), organizationId);
        return categories;
    }
}
