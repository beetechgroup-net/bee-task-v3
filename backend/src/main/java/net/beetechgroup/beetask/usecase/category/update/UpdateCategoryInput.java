package net.beetechgroup.beetask.usecase.category.update;

public record UpdateCategoryInput(String userEmail, Long organizationId, Long categoryId,
                                  String name, String color, String icon) {}
