package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.category.create.CreateCategoryUseCase;
import net.beetechgroup.beetask.usecase.category.list.ListCategoriesUseCase;
import net.beetechgroup.beetask.usecase.category.update.UpdateCategoryUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

@ApplicationScoped
public class CategoryUseCaseConfig {

    @Produces
    public CreateCategoryUseCase createCategoryUseCase(CategoryRepository categoryRepository,
                                                       OrganizationRepository organizationRepository,
                                                       AuthorizeOrganizationAdminUseCase authorizer) {
        return new CreateCategoryUseCase(categoryRepository, organizationRepository, authorizer);
    }

    @Produces
    public UpdateCategoryUseCase updateCategoryUseCase(CategoryRepository categoryRepository,
                                                       AuthorizeOrganizationAdminUseCase authorizer) {
        return new UpdateCategoryUseCase(categoryRepository, authorizer);
    }

    @Produces
    public ListCategoriesUseCase listCategoriesUseCase(CategoryRepository categoryRepository) {
        return new ListCategoriesUseCase(categoryRepository);
    }
}
