package net.beetechgroup.beetask.usecase.category.create;

import java.util.Objects;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.usecase.category.CategoryMapper;
import net.beetechgroup.beetask.usecase.category.CategoryOutput;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import org.jboss.logging.Logger;

public class CreateCategoryUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateCategoryUseCase.class);
    private final CategoryRepository categoryRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthorizeOrganizationAdminUseCase authorizer;

    public CreateCategoryUseCase(CategoryRepository categoryRepository,
                                  OrganizationRepository organizationRepository,
                                  AuthorizeOrganizationAdminUseCase authorizer) {
        this.categoryRepository = categoryRepository;
        this.organizationRepository = organizationRepository;
        this.authorizer = authorizer;
    }

    public CategoryOutput execute(CreateCategoryInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        String name = Objects.nonNull(input.name()) ? input.name().trim() : "";
        if (name.isBlank()) {
            throw new IllegalArgumentException("Nome da categoria é obrigatório");
        }
        if (categoryRepository.existsByNameInOrganization(input.organizationId(), name, null)) {
            LOGGER.warnf("Category creation failed because name '%s' already exists in organization %d", name, input.organizationId());
            throw new IllegalArgumentException("Já existe uma categoria com este nome");
        }

        Organization organization = organizationRepository.findOrganizationById(input.organizationId())
                .orElseThrow(() -> {
                    LOGGER.warnf("Category creation failed because organization %d was not found", input.organizationId());
                    return new IllegalArgumentException("Organization not found");
                });

        Category category = new Category();
        category.setName(name);
        category.setColor(input.color());
        category.setIcon(input.icon());
        category.setOrganization(organization);

        Category saved = categoryRepository.saveCategory(category);
        LOGGER.infof("Category %d created in organization %d by user %s", saved.getId(), input.organizationId(), input.userEmail());
        return CategoryMapper.toCategoryOutput(saved);
    }
}
