package net.beetechgroup.beetask.usecase.organization.join;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.Optional;

public class RequestJoinOrganizationUseCase {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public RequestJoinOrganizationUseCase(OrganizationRepository organizationRepository,
                                         UserRepository userRepository,
                                         UserOrganizationRepository userOrganizationRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public void execute(Long organizationId, String userEmail) {
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        Optional<Organization> orgOptional = organizationRepository.findOrganizationById(organizationId);

        if (userOptional.isEmpty() || orgOptional.isEmpty()) {
            throw new RuntimeException("User or Organization not found");
        }

        User user = userOptional.get();
        Organization organization = orgOptional.get();

        Optional<UserOrganization> existing = userOrganizationRepository.findByUserAndOrganization(user.getId(), organization.getId());
        if (existing.isPresent()) {
            if (existing.get().getStatus() == UserOrganizationStatus.ACTIVE) {
                throw new RuntimeException("User is already a member of this organization");
            } else if (existing.get().getStatus() == UserOrganizationStatus.PENDING) {
                throw new RuntimeException("A join request is already pending for this organization");
            }
            // If REJECTED, we allow a new request (or we could just update the existing one to PENDING)
        }

        UserOrganization request = new UserOrganization();
        request.setUser(user);
        request.setOrganization(organization);
        request.setRole(UserOrganizationRole.MEMBER);
        request.setStatus(UserOrganizationStatus.PENDING);
        
        userOrganizationRepository.save(request);
    }
}
