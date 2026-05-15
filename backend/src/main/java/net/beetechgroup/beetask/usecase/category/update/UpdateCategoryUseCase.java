package net.beetechgroup.beetask.usecase.category.update;

import java.util.Objects;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.usecase.category.CategoryMapper;
import net.beetechgroup.beetask.usecase.category.CategoryOutput;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import org.jboss.logging.Logger;

public class UpdateCategoryUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateCategoryUseCase.class);
    private final CategoryRepository categoryRepository;
    private final AuthorizeOrganizationAdminUseCase authorizer;

    public UpdateCategoryUseCase(CategoryRepository categoryRepository,
                                  AuthorizeOrganizationAdminUseCase authorizer) {
        this.categoryRepository = categoryRepository;
        this.authorizer = authorizer;
    }

    public CategoryOutput execute(UpdateCategoryInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        Category category = categoryRepository.findCategoryById(input.categoryId())
                .orElseThrow(() -> {
                    LOGGER.warnf("Category update failed because category %d was not found", input.categoryId());
                    return new IllegalArgumentException("Categoria não encontrada");
                });

        if (Objects.isNull(category.getOrganization()) || !category.getOrganization().getId().equals(input.organizationId())) {
            LOGGER.warnf("Category update failed because category %d does not belong to organization %d",
                    input.categoryId(), input.organizationId());
            throw new IllegalArgumentException("Categoria não pertence à organização");
        }

        String name = Objects.nonNull(input.name()) ? input.name().trim() : "";
        if (name.isBlank()) {
            throw new IllegalArgumentException("Nome da categoria é obrigatório");
        }
        if (categoryRepository.existsByNameInOrganization(input.organizationId(), name, input.categoryId())) {
            throw new IllegalArgumentException("Já existe uma categoria com este nome");
        }

        category.setName(name);
        category.setColor(input.color());
        category.setIcon(input.icon());

        Category saved = categoryRepository.saveCategory(category);
        LOGGER.infof("Category %d updated in organization %d by user %s", saved.getId(), input.organizationId(), input.userEmail());
        return CategoryMapper.toCategoryOutput(saved);
    }
}
