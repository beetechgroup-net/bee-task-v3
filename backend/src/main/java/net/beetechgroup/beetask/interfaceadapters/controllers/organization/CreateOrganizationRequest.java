package net.beetechgroup.beetask.interfaceadapters.controllers.organization;

public record CreateOrganizationRequest(
        String name,
        Boolean isPrivate) {
}
