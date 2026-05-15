package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.Objects;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.frameworks.persistence.entities.CategoryEntity;

public class CategoryEntityMapper {

    public static CategoryEntity toEntity(Category category) {
        if (Objects.isNull(category)) return null;
        CategoryEntity entity = new CategoryEntity();
        entity.setId(category.getId());
        entity.setName(category.getName());
        entity.setColor(category.getColor());
        entity.setIcon(category.getIcon());
        entity.setOrganization(OrganizationEntityMapper.toEntity(category.getOrganization()));
        return entity;
    }

    public static Category toDomain(CategoryEntity entity) {
        if (Objects.isNull(entity)) return null;
        Category category = new Category();
        category.setId(entity.getId());
        category.setName(entity.getName());
        category.setColor(entity.getColor());
        category.setIcon(entity.getIcon());
        category.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        return category;
    }
}
