package net.beetechgroup.beetask.frameworks.persistence.entities;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "report_sections")
public class ReportSectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_template_id", nullable = false)
    private ReportTemplateEntity reportTemplate;

    @Column(name = "section_key", nullable = false, length = 100)
    private String sectionKey;

    @Column(nullable = false)
    private String title;

    @Column(name = "section_type", nullable = false, length = 50)
    private String sectionType; // 'FREE_TEXT' ou 'TASK_LIST'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filter_category_id")
    private CategoryEntity filterCategory;

    @Column(name = "filter_status", length = 50)
    private String filterStatus = "ALL";

    @Column(name = "include_time")
    private Boolean includeTime = true;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ReportTemplateEntity getReportTemplate() {
        return reportTemplate;
    }

    public void setReportTemplate(ReportTemplateEntity reportTemplate) {
        this.reportTemplate = reportTemplate;
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

    public CategoryEntity getFilterCategory() {
        return filterCategory;
    }

    public void setFilterCategory(CategoryEntity filterCategory) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
