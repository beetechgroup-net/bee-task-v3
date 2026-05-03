package net.beetechgroup.beetask.usecase.organization.auth;

public abstract class AuthenticatedOrganizationUseCase<I, O> {
    protected final AuthorizeOrganizationAdminUseCase authorizer;

    protected AuthenticatedOrganizationUseCase(AuthorizeOrganizationAdminUseCase authorizer) {
        this.authorizer = authorizer;
    }

    public O execute(String userEmail, Long organizationId, I input) {
        authorizer.execute(userEmail, organizationId);
        return doExecute(organizationId, input);
    }

    protected abstract O doExecute(Long organizationId, I input);
}
