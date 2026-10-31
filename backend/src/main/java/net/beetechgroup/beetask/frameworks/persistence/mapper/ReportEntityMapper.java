package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.Objects;
import java.util.stream.Collectors;
import net.beetechgroup.beetask.entities.report.GeneratedReport;
import net.beetechgroup.beetask.entities.report.ReportSection;
import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.frameworks.persistence.entities.GeneratedReportEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.ReportSectionEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.ReportTemplateEntity;

public class ReportEntityMapper {

    public static ReportTemplateEntity toEntity(ReportTemplate domain) {
        if (Objects.isNull(domain)) return null;
        ReportTemplateEntity entity = new ReportTemplateEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setScope(domain.getScope());
        entity.setFileUrl(domain.getFileUrl());
        entity.setFileName(domain.getFileName());
        entity.setStorageKey(domain.getStorageKey());
        entity.setManagerName(domain.getManagerName());
        entity.setCustomProjectName(domain.getCustomProjectName());
        entity.setDateFormatPattern(domain.getDateFormatPattern());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());

        if (domain.getOrganization() != null) {
            entity.setOrganization(OrganizationEntityMapper.toEntity(domain.getOrganization()));
        }
        if (domain.getProject() != null) {
            entity.setProject(ProjectEntityMapper.toEntity(domain.getProject()));
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(UserEntityMapper.toEntity(domain.getCreatedBy()));
        }
        if (domain.getSections() != null) {
            entity.setSections(domain.getSections().stream()
                    .map(s -> toEntity(s, entity))
                    .collect(Collectors.toList()));
        }
        return entity;
    }

    public static ReportSectionEntity toEntity(ReportSection domain, ReportTemplateEntity templateEntity) {
        if (Objects.isNull(domain)) return null;
        ReportSectionEntity entity = new ReportSectionEntity();
        entity.setId(domain.getId());
        entity.setReportTemplate(templateEntity);
        entity.setSectionKey(domain.getSectionKey());
        entity.setTitle(domain.getTitle());
        entity.setSectionType(domain.getSectionType());
        entity.setDefaultValue(domain.getDefaultValue());
        entity.setFilterStatus(domain.getFilterStatus());
        entity.setIncludeTime(domain.getIncludeTime());
        entity.setOrderIndex(domain.getOrderIndex());
        entity.setCreatedAt(domain.getCreatedAt());

        if (domain.getFilterCategory() != null) {
            entity.setFilterCategory(CategoryEntityMapper.toEntity(domain.getFilterCategory()));
        }
        return entity;
    }

    public static ReportTemplate toDomain(ReportTemplateEntity entity) {
        if (Objects.isNull(entity)) return null;
        ReportTemplate domain = new ReportTemplate();
        domain.setId(entity.getId());
        domain.setName(entity.getName());
        domain.setDescription(entity.getDescription());
        domain.setScope(entity.getScope());
        domain.setFileUrl(entity.getFileUrl());
        domain.setFileName(entity.getFileName());
        domain.setStorageKey(entity.getStorageKey());
        domain.setManagerName(entity.getManagerName());
        domain.setCustomProjectName(entity.getCustomProjectName());
        domain.setDateFormatPattern(entity.getDateFormatPattern());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getOrganization() != null) {
            domain.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        }
        if (entity.getProject() != null) {
            domain.setProject(ProjectEntityMapper.toDomain(entity.getProject()));
        }
        if (entity.getCreatedBy() != null) {
            domain.setCreatedBy(UserEntityMapper.toDomain(entity.getCreatedBy()));
        }
        if (entity.getSections() != null) {
            domain.setSections(entity.getSections().stream()
                    .map(ReportEntityMapper::toDomain)
                    .collect(Collectors.toList()));
        }
        return domain;
    }

    public static ReportSection toDomain(ReportSectionEntity entity) {
        if (Objects.isNull(entity)) return null;
        ReportSection domain = new ReportSection();
        domain.setId(entity.getId());
        domain.setReportTemplateId(entity.getReportTemplate() != null ? entity.getReportTemplate().getId() : null);
        domain.setSectionKey(entity.getSectionKey());
        domain.setTitle(entity.getTitle());
        domain.setSectionType(entity.getSectionType());
        domain.setDefaultValue(entity.getDefaultValue());
        domain.setFilterStatus(entity.getFilterStatus());
        domain.setIncludeTime(entity.getIncludeTime());
        domain.setOrderIndex(entity.getOrderIndex());
        domain.setCreatedAt(entity.getCreatedAt());

        if (entity.getFilterCategory() != null) {
            domain.setFilterCategory(CategoryEntityMapper.toDomain(entity.getFilterCategory()));
        }
        return domain;
    }

    public static GeneratedReport toDomain(GeneratedReportEntity entity) {
        if (Objects.isNull(entity)) return null;
        GeneratedReport domain = new GeneratedReport();
        domain.setId(entity.getId());
        domain.setReportTemplateId(entity.getReportTemplate() != null ? entity.getReportTemplate().getId() : null);
        domain.setTitle(entity.getTitle());
        domain.setStartDate(entity.getStartDate());
        domain.setEndDate(entity.getEndDate());
        domain.setFileUrl(entity.getFileUrl());
        domain.setFileName(entity.getFileName());
        domain.setStorageKey(entity.getStorageKey());
        domain.setCreatedAt(entity.getCreatedAt());

        if (entity.getOrganization() != null) {
            domain.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        }
        if (entity.getProject() != null) {
            domain.setProject(ProjectEntityMapper.toDomain(entity.getProject()));
        }
        if (entity.getUser() != null) {
            domain.setUser(UserEntityMapper.toDomain(entity.getUser()));
        }
        return domain;
    }
}
