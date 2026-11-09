package net.beetechgroup.beetask.usecase.taskstatus;

import java.util.List;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import org.jboss.logging.Logger;

public class ReorderTaskStatusesUseCase {
    private static final Logger LOGGER = Logger.getLogger(ReorderTaskStatusesUseCase.class);

    private final TaskStatusRepository taskStatusRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public ReorderTaskStatusesUseCase(TaskStatusRepository taskStatusRepository,
                                     AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskStatusRepository = taskStatusRepository;
        this.authorizer = authorizer;
    }

    public List<TaskStatusOutput> execute(String userEmail, Long organizationId, List<Long> statusIds) {
        authorizer.execute(userEmail, organizationId);

        if (statusIds == null || statusIds.isEmpty()) {
            return taskStatusRepository.findByOrganizationId(organizationId).stream()
                    .map(s -> TaskStatusMapper.toOutput(s, taskStatusRepository.countTasksByStatusId(s.getId())))
                    .toList();
        }

        for (int i = 0; i < statusIds.size(); i++) {
            Long id = statusIds.get(i);
            var opt = taskStatusRepository.findTaskStatusById(id);
            if (opt.isPresent()) {
                TaskStatus status = opt.get();
                if (status.getOrganization().getId().equals(organizationId)) {
                    status.setPosition(i);
                    taskStatusRepository.saveTaskStatus(status);
                }
            }
        }

        LOGGER.infof("Reordered %d task statuses for organization %d by user %s", statusIds.size(), organizationId, userEmail);

        return taskStatusRepository.findByOrganizationId(organizationId).stream()
                .map(s -> TaskStatusMapper.toOutput(s, taskStatusRepository.countTasksByStatusId(s.getId())))
                .toList();
    }
}
