package net.beetechgroup.beetask.frameworks.report;

import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class PdfConverterService {
    private static final Logger LOGGER = Logger.getLogger(PdfConverterService.class);

    public byte[] convertDocxToPdf(byte[] docxBytes) {
        if (docxBytes == null || docxBytes.length == 0) {
            throw new IllegalArgumentException("Arquivo DOCX vazio");
        }

        String tempId = UUID.randomUUID().toString();
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("docx_pdf_" + tempId);
            Path docxPath = tempDir.resolve("document.docx");
            Files.write(docxPath, docxBytes);

            ProcessBuilder pb = new ProcessBuilder(
                    "soffice",
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    tempDir.toAbsolutePath().toString(),
                    docxPath.toAbsolutePath().toString()
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(45, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("Timeout ao converter DOCX para PDF com LibreOffice");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                String errorOutput = new String(process.getInputStream().readAllBytes());
                throw new IllegalStateException("LibreOffice falhou com código " + exitCode + ": " + errorOutput);
            }

            Path pdfPath = tempDir.resolve("document.pdf");
            if (!Files.exists(pdfPath)) {
                throw new IllegalStateException("Arquivo PDF gerado não foi encontrado");
            }

            LOGGER.infof("Conversão para PDF realizada com sucesso (%d bytes)", Files.size(pdfPath));
            return Files.readAllBytes(pdfPath);
        } catch (Exception e) {
            LOGGER.errorf("Erro ao converter DOCX para PDF: %s", e.getMessage());
            throw new RuntimeException("Falha ao gerar PDF: " + e.getMessage(), e);
        } finally {
            if (tempDir != null) {
                try {
                    deleteDirectory(tempDir.toFile());
                } catch (Exception ignored) {}
            }
        }
    }

    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) deleteDirectory(f);
                else f.delete();
            }
        }
        dir.delete();
    }
}
