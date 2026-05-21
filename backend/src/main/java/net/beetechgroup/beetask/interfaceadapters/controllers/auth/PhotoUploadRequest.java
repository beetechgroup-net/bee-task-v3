package net.beetechgroup.beetask.interfaceadapters.controllers.auth;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public class PhotoUploadRequest {

    @RestForm("photo")
    public FileUpload photo;
}
