package net.beetechgroup.beetask.interfaceadapters.controllers.report;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public class CreateReportTemplateForm {

    @RestForm("file")
    public FileUpload file;

    @RestForm("name")
    public String name;

    @RestForm("description")
    public String description;

    @RestForm("scope")
    public String scope; // 'ORGANIZATION' ou 'PROJECT'

    @RestForm("projectId")
    public Long projectId;

    @RestForm("sectionsJson")
    public String sectionsJson;
}
