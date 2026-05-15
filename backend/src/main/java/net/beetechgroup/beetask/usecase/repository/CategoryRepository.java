package net.beetechgroup.beetask.usecase.repository;

import java.util.List;
import java.util.Optional;

import net.beetechgroup.beetask.entities.Category;

public interface CategoryRepository {
    Category saveCategory(Category category);
    Optional<Category> findCategoryById(Long id);
    List<Category> findByOrganizationId(Long organizationId);
    boolean existsByNameInOrganization(Long organizationId, String name, Long excludeId);
}
