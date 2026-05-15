package net.beetechgroup.beetask.frameworks.persistence.repository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.frameworks.persistence.entities.CategoryEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.CategoryEntityMapper;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import org.jboss.logging.Logger;

@ApplicationScoped
public class CategoryRepositoryImpl implements CategoryRepository, PanacheRepository<CategoryEntity> {
    private static final Logger LOGGER = Logger.getLogger(CategoryRepositoryImpl.class);

    @Override
    @Transactional
    public Category saveCategory(Category category) {
        CategoryEntity entity = CategoryEntityMapper.toEntity(category);
        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        Category saved = CategoryEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted category %d for organization %d", saved.getId(), saved.getOrganization().getId());
        return saved;
    }

    @Override
    public Optional<Category> findCategoryById(Long id) {
        Optional<Category> category = findByIdOptional(id).map(CategoryEntityMapper::toDomain);
        if (category.isEmpty()) {
            LOGGER.warnf("Category %d was not found", id);
        }
        return category;
    }

    @Override
    public List<Category> findByOrganizationId(Long organizationId) {
        List<Category> categories = find("organization.id = ?1 order by name", organizationId).stream()
                .map(CategoryEntityMapper::toDomain)
                .toList();
        LOGGER.infof("Loaded %d categories for organization %d", categories.size(), organizationId);
        return categories;
    }

    @Override
    public boolean existsByNameInOrganization(Long organizationId, String name, Long excludeId) {
        if (Objects.isNull(excludeId)) {
            return count("organization.id = ?1 and lower(name) = lower(?2)", organizationId, name) > 0;
        }
        return count("organization.id = ?1 and lower(name) = lower(?2) and id <> ?3",
                organizationId, name, excludeId) > 0;
    }
}
