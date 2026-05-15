package net.beetechgroup.beetask.interfaceadapters.controllers.category;

import net.beetechgroup.beetask.usecase.category.CategoryOutput;
import net.beetechgroup.beetask.usecase.category.create.CreateCategoryInput;
import net.beetechgroup.beetask.usecase.category.update.UpdateCategoryInput;

public class CategoryControllerMapper {

    public static CreateCategoryInput toCreateInput(String userEmail, Long organizationId, CategoryRequest request) {
        return new CreateCategoryInput(userEmail, organizationId, request.name(), request.color(), request.icon());
    }

    public static UpdateCategoryInput toUpdateInput(String userEmail, Long organizationId, Long categoryId, CategoryRequest request) {
        return new UpdateCategoryInput(userEmail, organizationId, categoryId,
                request.name(), request.color(), request.icon());
    }

    public static CategoryResponse toResponse(CategoryOutput output) {
        return new CategoryResponse(output.id(), output.name(), output.color(), output.icon());
    }
}
