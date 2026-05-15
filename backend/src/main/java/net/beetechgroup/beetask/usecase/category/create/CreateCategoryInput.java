package net.beetechgroup.beetask.usecase.category.create;

public record CreateCategoryInput(String userEmail, Long organizationId, String name, String color, String icon) {}
