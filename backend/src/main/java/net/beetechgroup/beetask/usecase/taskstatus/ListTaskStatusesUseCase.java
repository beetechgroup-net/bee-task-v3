package net.beetechgroup.beetask.usecase.taskstatus;

import java.util.List;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import org.jboss.logging.Logger;

public class ListTaskStatusesUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListTaskStatusesUseCase.class);

    private final TaskStatusRepository taskStatusRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public ListTaskStatusesUseCase(TaskStatusRepository taskStatusRepository,
                                  AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskStatusRepository = taskStatusRepository;
        this.authorizer = authorizer;
    }

    public List<TaskStatusOutput> execute(String userEmail, Long organizationId) {
        authorizer.execute(userEmail, organizationId);
        LOGGER.infof("Listing task statuses for organization %d by user %s", organizationId, userEmail);

        return taskStatusRepository.findByOrganizationId(organizationId).stream()
                .map(s -> {
                    long taskCount = taskStatusRepository.countTasksByStatusId(s.getId());
                    return TaskStatusMapper.toOutput(s, taskCount);
                })
                .toList();
    }
}
