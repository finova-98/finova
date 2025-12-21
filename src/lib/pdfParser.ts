import * as pdfjsLib from "pdfjs-dist";

// Set worker path for PDF.js - use local worker file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Extract text content from a PDF file using PDF.js
 * @param file - PDF file to parse
 * @returns Extracted text content
 */
export async function extractPDFText(file: File): Promise<string> {
    try {
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = "";

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Combine text items from the page
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");

            fullText += pageText + "\n\n";
        }

        return fullText.trim();
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw new Error("Failed to extract text from PDF. Please ensure the file is a valid PDF.");
    }
}

/**
 * Get PDF metadata
 * @param file - PDF file to parse
 * @returns PDF metadata including page count
 */
export async function getPDFMetadata(file: File): Promise<{
    pages: number;
    info: any;
}> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const metadata = await pdf.getMetadata();

        return {
            pages: pdf.numPages,
            info: metadata.info,
        };
    } catch (error) {
        console.error("Error getting PDF metadata:", error);
        throw new Error("Failed to read PDF metadata.");
    }
}

/**
 * Check if a file is a PDF
 * @param file - File to check
 * @returns true if file is a PDF
 */
export function isPDF(file: File): boolean {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

/**
 * Format PDF text for AI analysis
 * Cleans up the text and adds structure
 */
export function formatPDFTextForAI(text: string, fileName: string): string {
    // Clean up excessive whitespace
    const cleanedText = text
        .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newline
        .replace(/[ \t]{2,}/g, " ") // Replace multiple spaces/tabs with single space
        .trim();

    // Truncate if too long (to avoid token limits)
    const maxLength = 8000; // Adjust based on your needs
    const truncatedText = cleanedText.length > maxLength
        ? cleanedText.substring(0, maxLength) + "\n\n[... text truncated due to length ...]"
        : cleanedText;

    return `I've uploaded a PDF file named "${fileName}". Here is the extracted text content:\n\n---\n${truncatedText}\n---\n\nPlease analyze this document and provide insights about the financial information contained within.`;
}
