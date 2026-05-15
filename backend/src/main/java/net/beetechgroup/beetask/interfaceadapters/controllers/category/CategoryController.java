package net.beetechgroup.beetask.interfaceadapters.controllers.category;

import java.util.List;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.beetechgroup.beetask.usecase.category.create.CreateCategoryUseCase;
import net.beetechgroup.beetask.usecase.category.list.ListCategoriesUseCase;
import net.beetechgroup.beetask.usecase.category.update.UpdateCategoryUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

@Path("/organizations/{orgId}/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@Tag(name = "Categories", description = "Category management operations")
public class CategoryController {
    private static final Logger LOGGER = Logger.getLogger(CategoryController.class);

    @Inject
    CreateCategoryUseCase createCategoryUseCase;

    @Inject
    UpdateCategoryUseCase updateCategoryUseCase;

    @Inject
    ListCategoriesUseCase listCategoriesUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @GET
    @Operation(summary = "List categories", description = "Lists all categories for the given organization")
    @APIResponse(responseCode = "200", description = "Categories listed successfully")
    public List<CategoryResponse> listCategories(@PathParam("orgId") Long orgId) {
        List<CategoryResponse> categories = listCategoriesUseCase.execute(orgId).stream()
                .map(CategoryControllerMapper::toResponse)
                .toList();
        LOGGER.infof("Listed %d categories for organization %d", categories.size(), orgId);
        return categories;
    }

    @POST
    @Operation(summary = "Create a category", description = "Creates a new category in the organization")
    @APIResponse(responseCode = "201", description = "Category created successfully")
    public CategoryResponse createCategory(@PathParam("orgId") Long orgId, CategoryRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Category creation requested by %s for organization %d with name '%s'", email, orgId, request.name());
        return CategoryControllerMapper.toResponse(
                createCategoryUseCase.execute(CategoryControllerMapper.toCreateInput(email, orgId, request)));
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update a category", description = "Updates an existing category")
    @APIResponse(responseCode = "200", description = "Category updated successfully")
    public CategoryResponse updateCategory(@PathParam("orgId") Long orgId,
                                            @PathParam("id") Long id,
                                            CategoryRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Category update requested by %s for category %d in organization %d", email, id, orgId);
        return CategoryControllerMapper.toResponse(
                updateCategoryUseCase.execute(CategoryControllerMapper.toUpdateInput(email, orgId, id, request)));
    }
}
