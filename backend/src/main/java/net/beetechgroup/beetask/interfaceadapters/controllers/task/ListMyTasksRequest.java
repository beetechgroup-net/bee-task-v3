package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.List;

import jakarta.ws.rs.QueryParam;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public class ListMyTasksRequest {

    @QueryParam("text")
    public String text;

    @QueryParam("projectId")
    public List<Long> projectIds;

    @QueryParam("status")
    public List<TaskStatus> statuses;

    @QueryParam("categoryId")
    public List<Long> categoryIds;
}
