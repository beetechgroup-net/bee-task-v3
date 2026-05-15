package net.beetechgroup.beetask.usecase.category;

import net.beetechgroup.beetask.entities.Category;

public class CategoryMapper {

    public static CategoryOutput toCategoryOutput(Category category) {
        return new CategoryOutput(
                category.getId(),
                category.getName(),
                category.getColor(),
                category.getIcon());
    }
}
