package net.beetechgroup.beetask.usecase.report.generate;

public record GenerateReportOutput(
        byte[] docxBytes,
        String fileName,
        String contentType,
        String fileUrl,
        Long generatedReportId
) {}
