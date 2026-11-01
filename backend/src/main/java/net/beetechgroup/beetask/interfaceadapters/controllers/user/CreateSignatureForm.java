package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public class CreateSignatureForm {

    @RestForm("file")
    public FileUpload file;

    @RestForm("imageBase64")
    public String imageBase64;

    @RestForm("name")
    public String name;

    @RestForm("signatureType")
    public String signatureType; // "UPLOAD", "DRAW", "TEMPLATE"

    @RestForm("isDefault")
    public Boolean isDefault;
}
