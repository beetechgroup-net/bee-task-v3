package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.List;
import jakarta.ws.rs.QueryParam;

public class ListMyTasksRequest {

    @QueryParam("text")
    public String text;

    @QueryParam("projectId")
    public List<Long> projectIds;

    @QueryParam("status")
    public List<String> statuses;

    @QueryParam("categoryId")
    public List<Long> categoryIds;
}
