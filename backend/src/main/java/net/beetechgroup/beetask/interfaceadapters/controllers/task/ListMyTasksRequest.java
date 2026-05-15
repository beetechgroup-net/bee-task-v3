package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import jakarta.ws.rs.QueryParam;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public class ListMyTasksRequest {

    @QueryParam("text")
    public String text;

    @QueryParam("projectId")
    public Long projectId;

    @QueryParam("status")
    public TaskStatus status;
}
