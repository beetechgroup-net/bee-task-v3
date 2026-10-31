package net.beetechgroup.beetask.interfaceadapters.controllers.report;

import java.time.LocalDate;
import java.util.Map;

public class GenerateReportRequest {
    public Long templateId;
    public Long projectId;
    public LocalDate startDate;
    public LocalDate endDate;
    public Map<String, String> customFields;
}
