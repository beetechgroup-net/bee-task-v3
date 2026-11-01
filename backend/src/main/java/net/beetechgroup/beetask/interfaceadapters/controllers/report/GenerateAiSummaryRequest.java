package net.beetechgroup.beetask.interfaceadapters.controllers.report;

import java.time.LocalDate;

public class GenerateAiSummaryRequest {
    public Long templateId;
    public String sectionKey;
    public LocalDate startDate;
    public LocalDate endDate;
    public String customPrompt;
}
