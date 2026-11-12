package net.beetechgroup.beetask.interfaceadapters.controllers.user;

public class SaveUserNoteRequest {
    private String content;

    public SaveUserNoteRequest() {
    }

    public SaveUserNoteRequest(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
