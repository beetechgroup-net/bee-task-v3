package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.List;

import jakarta.ws.rs.QueryParam;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public class ListTasksRequest {

    @QueryParam("organizationId")
    public Long organizationId;

    @QueryParam("text")
    public String text;

    @QueryParam("projectId")
    public List<Long> projectIds;

    @QueryParam("status")
    public List<TaskStatus> statuses;

    @QueryParam("categoryId")
    public List<Long> categoryIds;

    @QueryParam("userId")
    public List<Long> userIds;
}
