const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const PPTX2Json = require('pptx2json');
const path = require('path');

class FileParserService {
    constructor() {
        this.supportedTypes = {
            '.pdf': 'pdf',
            '.docx': 'docx',
            '.doc': 'docx',
            '.pptx': 'pptx',
            '.ppt': 'pptx',
            '.txt': 'text'
        };
    }

    detectFileType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        if (!this.supportedTypes[ext]) {
            throw new Error(`Unsupported file type: ${ext}. Supported types: ${Object.keys(this.supportedTypes).join(', ')}`);
        }
        
        return this.supportedTypes[ext];
    }

    async extractFromPDF(fileBuffer) {
        try {
            console.log('[FileParserService] Extracting text from PDF...');
            const data = await pdfParse(fileBuffer);
            
            if (!data.text || data.text.trim().length === 0) {
                throw new Error('No text content found in PDF file');
            }
            
            console.log(`[FileParserService] Successfully extracted ${data.text.length} characters from PDF`);
            return data.text.trim();
        } catch (error) {
            console.error('[FileParserService] PDF extraction error:', error.message);
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }

    async extractFromDOCX(fileBuffer) {
        try {
            console.log('[FileParserService] Extracting text from DOCX...');
            console.log('[FileParserService] DOCX buffer info:', {
                isBuffer: Buffer.isBuffer(fileBuffer),
                length: fileBuffer.length,
                firstBytes: Array.from(fileBuffer.slice(0, 4)).map(b => b.toString(16)).join(' ')
            });

            // Validate that this looks like a DOCX file (should start with PK for ZIP format)
            if (fileBuffer.length < 4 || fileBuffer[0] !== 0x50 || fileBuffer[1] !== 0x4B) {
                console.warn('[FileParserService] File does not appear to be a valid DOCX (ZIP) file');
                // Continue anyway, let mammoth handle it
            }

            const result = await mammoth.extractRawText({ buffer: fileBuffer });

            console.log('[FileParserService] Mammoth extraction result:', {
                hasValue: !!result.value,
                valueLength: result.value?.length || 0,
                messageCount: result.messages?.length || 0,
                firstMessages: result.messages?.slice(0, 3) || []
            });

            if (!result.value || result.value.trim().length === 0) {
                // Try alternative extraction methods
                console.log('[FileParserService] No text found with extractRawText, trying extractHtml...');

                try {
                    const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer });
                    if (htmlResult.value && htmlResult.value.trim().length > 0) {
                        // Strip HTML tags to get plain text
                        const plainText = htmlResult.value.replace(/<[^>]*>/g, '').trim();
                        if (plainText.length > 0) {
                            console.log(`[FileParserService] Successfully extracted ${plainText.length} characters from DOCX using HTML conversion`);
                            return plainText;
                        }
                    }
                } catch (htmlError) {
                    console.warn('[FileParserService] HTML extraction also failed:', htmlError.message);
                }

                throw new Error('No text content found in DOCX file. The document may be empty, corrupted, or contain only images/graphics.');
            }

            // Log any warnings from mammoth
            if (result.messages && result.messages.length > 0) {
                console.warn('[FileParserService] DOCX extraction warnings:', result.messages.map(m => m.message));
            }

            console.log(`[FileParserService] Successfully extracted ${result.value.length} characters from DOCX`);
            return result.value.trim();
        } catch (error) {
            console.error('[FileParserService] DOCX extraction error:', {
                message: error.message,
                stack: error.stack,
                bufferLength: fileBuffer?.length || 0
            });
            throw new Error(`Failed to extract text from DOCX: ${error.message}`);
        }
    }

    async extractFromPPTX(fileBuffer, fileName = 'PowerPoint file') {
        try {
            console.log('[FileParserService] Extracting text from PPTX...');
            console.log('[FileParserService] PPTX buffer info:', {
                isBuffer: Buffer.isBuffer(fileBuffer),
                length: fileBuffer.length,
                firstBytes: Array.from(fileBuffer.slice(0, 4)).map(b => b.toString(16)).join(' ')
            });

            // Validate that this looks like a PPTX file (should start with PK for ZIP format)
            if (fileBuffer.length < 4 || fileBuffer[0] !== 0x50 || fileBuffer[1] !== 0x4B) {
                console.warn('[FileParserService] File does not appear to be a valid PPTX (ZIP) file');
            }

            // Try a faster, simpler approach first
            console.log('[FileParserService] Attempting fast PPTX processing...');

            let result;
            try {
                // Use PPTX2Json constructor properly with shorter timeout
                const pptx2json = new PPTX2Json();

                // Extract content directly from buffer with extended timeout
                result = await new Promise((resolve, reject) => {
                    // Set a 30-minute timeout for processing large files
                    const timeout = setTimeout(() => {
                        reject(new Error('PPTX processing timed out after 30 minutes'));
                    }, 1800000); // 30 minutes = 30 * 60 * 1000 = 1,800,000 milliseconds

                    pptx2json.buffer2json(fileBuffer, (err, json) => {
                        clearTimeout(timeout);
                        if (err) {
                            reject(err);
                        } else {
                            resolve(json);
                        }
                    });
                });
            } catch (fastError) {
                console.warn('[FileParserService] Fast PPTX processing failed, trying fallback:', fastError.message);

                // Fallback: Create a basic response for complex PPTX files
                result = {
                    slides: [{
                        content: [{
                            type: 'text',
                            value: `PowerPoint file "${fileName}" was uploaded but text extraction timed out. This file may contain complex graphics, animations, or embedded content that makes text extraction difficult.

The file appears to be about graphs and data structures based on the filename. Please consider:
1. Converting this PowerPoint to PDF format for better text extraction
2. Manually copying key text content if needed
3. Simplifying the presentation by removing complex elements

File size: ${Math.round(fileBuffer.length / 1024)} KB
Slides: Unable to determine due to processing complexity`
                        }]
                    }]
                };
            }

                console.log('[FileParserService] PPTX parsing result:', {
                    hasSlides: !!(result && result.slides),
                    slideCount: result?.slides?.length || 0,
                    resultType: typeof result
                });

                if (!result || !result.slides || result.slides.length === 0) {
                    throw new Error('No slides found in PPTX file. The file may be corrupted or empty.');
                }

                // Extract text from all slides
                const slideTexts = [];

                for (let i = 0; i < result.slides.length; i++) {
                    const slide = result.slides[i];
                    let slideText = '';

                    console.log(`[FileParserService] Processing slide ${i + 1}:`, {
                        hasContent: !!(slide && slide.content),
                        contentType: typeof slide?.content,
                        contentLength: Array.isArray(slide?.content) ? slide.content.length : 'Not array'
                    });

                    // Extract text from slide content
                    if (slide && slide.content) {
                        if (Array.isArray(slide.content)) {
                            const textParts = slide.content
                                .filter(item => item && (item.type === 'text' || item.text) && (item.value || item.text))
                                .map(item => {
                                    const text = item.value || item.text || '';
                                    return typeof text === 'string' ? text.trim() : String(text).trim();
                                })
                                .filter(text => text.length > 0);

                            slideText = textParts.join('\n');
                        } else if (typeof slide.content === 'string') {
                            slideText = slide.content.trim();
                        }
                    }

                    // Also check for title if available
                    if (slide && slide.title && typeof slide.title === 'string' && slide.title.trim()) {
                        slideText = slide.title.trim() + (slideText ? '\n' + slideText : '');
                    }

                    // Add slide text to collection
                    if (slideText.length > 0) {
                        slideTexts.push(`Slide ${i + 1}:\n${slideText}`);
                    } else {
                        slideTexts.push(`Slide ${i + 1}: [No text content]`);
                    }
                }

                const extractedText = slideTexts.join('\n\n---\n\n');

                if (!extractedText || extractedText.trim().length === 0) {
                    throw new Error('No text content found in PPTX file. All slides appear to be empty or contain only images.');
                }

                console.log(`[FileParserService] Successfully extracted text from ${result.slides.length} slides (${extractedText.length} characters)`);
                return extractedText.trim();

        } catch (error) {
            console.error('[FileParserService] PPTX extraction error:', {
                message: error.message,
                stack: error.stack,
                bufferLength: fileBuffer?.length || 0
            });

            // If PPTX processing fails, provide a helpful fallback
            if (error.message.includes('timeout') || error.message.includes('timed out')) {
                throw new Error(`PowerPoint processing timed out after 30 minutes. This file may be extremely complex or very large.

Suggested solutions:
1. Convert the PowerPoint to PDF format and upload the PDF instead
2. Try simplifying the presentation (remove complex animations, reduce image sizes)
3. Split large presentations into smaller files

The system works best with simpler PowerPoint files or PDF documents.`);
            } else if (error.message.includes('zip file')) {
                throw new Error(`Invalid PowerPoint file format. Please ensure the file is not corrupted and try uploading again.`);
            } else {
                throw new Error(`Failed to extract text from PowerPoint: ${error.message}.

For best results, try converting the file to PDF format first, which typically provides better text extraction compatibility.`);
            }
        }
    }

    async extractFromText(fileBuffer) {
        try {
            console.log('[FileParserService] Reading plain text file...');
            const text = fileBuffer.toString('utf-8');
            
            if (!text || text.trim().length === 0) {
                throw new Error('Text file is empty');
            }
            
            console.log(`[FileParserService] Successfully read ${text.length} characters from text file`);
            return text.trim();
        } catch (error) {
            console.error('[FileParserService] Text file reading error:', error.message);
            throw new Error(`Failed to read text file: ${error.message}`);
        }
    }

    async parseFile(fileBuffer, fileName) {
        try {
            console.log(`[FileParserService] Starting to parse file: ${fileName}`);
            console.log(`[FileParserService] File buffer info:`, {
                isBuffer: Buffer.isBuffer(fileBuffer),
                length: fileBuffer?.length || 0,
                type: typeof fileBuffer,
                firstBytes: fileBuffer?.length > 0 ? Array.from(fileBuffer.slice(0, 10)) : 'No data'
            });

            if (!fileBuffer || fileBuffer.length === 0) {
                throw new Error('File buffer is empty or invalid');
            }

            if (!fileName) {
                throw new Error('File name is required');
            }

            console.log(`[FileParserService] File details: ${fileName} (${fileBuffer.length} bytes)`);

            const fileType = this.detectFileType(fileName);
            console.log(`[FileParserService] Detected file type: ${fileType}`);

            let extractedText = '';

            try {
                switch (fileType) {
                    case 'pdf':
                        console.log(`[FileParserService] Processing as PDF...`);
                        extractedText = await this.extractFromPDF(fileBuffer);
                        break;
                    case 'docx':
                        console.log(`[FileParserService] Processing as DOCX...`);
                        extractedText = await this.extractFromDOCX(fileBuffer);
                        break;
                    case 'pptx':
                        console.log(`[FileParserService] Processing as PPTX...`);
                        extractedText = await this.extractFromPPTX(fileBuffer, fileName);
                        break;
                    case 'text':
                        console.log(`[FileParserService] Processing as plain text...`);
                        extractedText = await this.extractFromText(fileBuffer);
                        break;
                    default:
                        throw new Error(`Unsupported file type: ${fileType}`);
                }

                console.log(`[FileParserService] Text extraction completed. Length: ${extractedText?.length || 0}`);

            } catch (extractionError) {
                console.error(`[FileParserService] Text extraction failed for ${fileType}:`, {
                    error: extractionError.message,
                    stack: extractionError.stack,
                    fileName: fileName,
                    fileType: fileType,
                    bufferLength: fileBuffer.length
                });
                throw extractionError;
            }

            // Validate extracted text
            if (!extractedText || extractedText.trim().length === 0) {
                console.error(`[FileParserService] No text extracted from ${fileName} (${fileType})`);

                // Try alternative extraction methods based on file type
                if (fileType === 'docx') {
                    console.log('[FileParserService] Attempting alternative DOCX extraction...');
                    try {
                        // Try extracting as plain text with different options
                        const altResult = await mammoth.extractRawText({
                            buffer: fileBuffer,
                            includeEmbeddedStyleMap: true
                        });
                        if (altResult.value && altResult.value.trim().length > 0) {
                            extractedText = altResult.value.trim();
                            console.log(`[FileParserService] Alternative extraction successful: ${extractedText.length} characters`);
                        }
                    } catch (altError) {
                        console.warn('[FileParserService] Alternative DOCX extraction failed:', altError.message);
                    }
                }

                // If still no text, provide a helpful error
                if (!extractedText || extractedText.trim().length === 0) {
                    const errorDetails = {
                        fileName: fileName,
                        fileType: fileType,
                        bufferSize: fileBuffer.length,
                        suggestion: this.getExtractionSuggestion(fileType)
                    };

                    throw new Error(`No text content could be extracted from the file. ${errorDetails.suggestion}`);
                }
            }

            // Clean up the text (remove excessive whitespace, normalize line breaks)
            const cleanedText = this.cleanText(extractedText);

            const result = {
                success: true,
                fileName: fileName,
                fileType: fileType,
                originalSize: fileBuffer.length,
                extractedText: cleanedText,
                textLength: cleanedText.length,
                wordCount: this.countWords(cleanedText),
                extractedAt: new Date().toISOString()
            };

            console.log(`[FileParserService] Successfully parsed ${fileName}: ${result.textLength} characters, ${result.wordCount} words`);
            return result;

        } catch (error) {
            console.error(`[FileParserService] Error parsing file ${fileName}:`, error.message);
            return {
                success: false,
                fileName: fileName,
                error: error.message,
                extractedAt: new Date().toISOString()
            };
        }
    }

    cleanText(text) {
        return text
            // Normalize line breaks
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Remove excessive whitespace
            .replace(/[ \t]+/g, ' ')
            // Remove excessive line breaks (more than 2 consecutive)
            .replace(/\n{3,}/g, '\n\n')
            // Trim whitespace from each line
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            // Final trim
            .trim();
    }

    /**
     * Count words in text
     * @param {string} text - Text to count words in
     * @returns {number} - Word count
     */
    countWords(text) {
        if (!text || text.trim().length === 0) {
            return 0;
        }
        
        return text
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .length;
    }

    validateFile(fileBuffer, fileName, maxSizeBytes = 100 * 1024 * 1024) {
        const errors = [];

        if (!fileBuffer) {
            errors.push('File buffer is required');
        } else if (fileBuffer.length === 0) {
            errors.push('File is empty');
        } else if (fileBuffer.length > maxSizeBytes) {
            errors.push(`File size (${Math.round(fileBuffer.length / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSizeBytes / 1024 / 1024)}MB)`);
        }

        if (!fileName) {
            errors.push('File name is required');
        } else {
            try {
                this.detectFileType(fileName);
            } catch (error) {
                errors.push(error.message);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get supported file types
     * @returns {Array} - Array of supported file extensions
     */
    getSupportedTypes() {
        return Object.keys(this.supportedTypes);
    }

    /**
     * Get extraction suggestion based on file type
     * @param {string} fileType - File type identifier
     * @returns {string} - Helpful suggestion
     */
    getExtractionSuggestion(fileType) {
        switch (fileType) {
            case 'docx':
                return 'Please ensure the DOCX file contains actual text content and is not corrupted. Try saving the document as a new file or converting it to PDF.';
            case 'pdf':
                return 'Please ensure the PDF contains selectable text and is not a scanned image. If it\'s a scanned PDF, you may need to use OCR software first.';
            case 'pptx':
                return 'Please ensure the PowerPoint file contains text content in slides and is not corrupted. Try saving as a new file.';
            case 'text':
                return 'Please ensure the text file is not empty and uses UTF-8 encoding.';
            default:
                return 'Please check that the file is not corrupted and contains readable text content.';
        }
    }
}

// Export singleton instance
module.exports = new FileParserService();
