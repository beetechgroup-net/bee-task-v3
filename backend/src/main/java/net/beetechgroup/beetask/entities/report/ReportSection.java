package net.beetechgroup.beetask.entities.report;

import java.time.LocalDateTime;
import net.beetechgroup.beetask.entities.Category;

public class ReportSection {
    private Long id;
    private Long reportTemplateId;
    private String sectionKey;
    private String title;
    private String sectionType; // 'FREE_TEXT', 'FIXED_TEXT', 'DATE', 'TASK_LIST'
    private String defaultValue;
    private String dateFormat;
    private String aiPrompt;
    private Category filterCategory;
    private String filterStatus; // 'ALL', 'COMPLETED', 'IN_PROGRESS'
    private Boolean includeTime;
    private Integer orderIndex;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReportTemplateId() {
        return reportTemplateId;
    }

    public void setReportTemplateId(Long reportTemplateId) {
        this.reportTemplateId = reportTemplateId;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSectionType() {
        return sectionType;
    }

    public void setSectionType(String sectionType) {
        this.sectionType = sectionType;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public Category getFilterCategory() {
        return filterCategory;
    }

    public void setFilterCategory(Category filterCategory) {
        this.filterCategory = filterCategory;
    }

    public String getFilterStatus() {
        return filterStatus;
    }

    public void setFilterStatus(String filterStatus) {
        this.filterStatus = filterStatus;
    }

    public Boolean getIncludeTime() {
        return includeTime != null ? includeTime : true;
    }

    public void setIncludeTime(Boolean includeTime) {
        this.includeTime = includeTime;
    }

    public Integer getOrderIndex() {
        return orderIndex != null ? orderIndex : 0;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getAiPrompt() {
        return aiPrompt;
    }

    public void setAiPrompt(String aiPrompt) {
        this.aiPrompt = aiPrompt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
