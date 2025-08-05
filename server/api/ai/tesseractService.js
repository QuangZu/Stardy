const Tesseract = require('tesseract.js');

class TesseractService {
    constructor() {
        console.log('[TesseractService] Tesseract OCR service initialized successfully');
    }

    async extractTextFromImage(imageBuffer, fileName = 'image') {
        try {
            console.log(`[TesseractService] Starting OCR for image: ${fileName} (${imageBuffer.length} bytes)`);

            // Validate image buffer
            if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
                throw new Error('Invalid image buffer provided');
            }

            // Perform text detection using Tesseract.js
            // Support multiple languages: English and Vietnamese
            const { data } = await Tesseract.recognize(
                imageBuffer,
                'eng+vie', // English + Vietnamese support
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`[TesseractService] OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );

            console.log(`[TesseractService] OCR completed. Confidence: ${Math.round(data.confidence)}%`);

            const extractedText = data.text || '';
            const confidence = data.confidence / 100; // Convert to 0-1 scale

            if (!extractedText || extractedText.trim().length === 0) {
                return {
                    success: true,
                    extractedText: '',
                    confidence: confidence,
                    wordCount: 0,
                    textLength: 0,
                    message: 'No text found in the image'
                };
            }

            // Calculate metadata
            const cleanText = extractedText.trim();
            const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
            const textLength = cleanText.length;

            console.log(`[TesseractService] Successfully extracted ${textLength} characters, ${wordCount} words`);

            return {
                success: true,
                extractedText: cleanText,
                confidence: confidence,
                wordCount: wordCount,
                textLength: textLength,
                fileName: fileName,
                message: 'Text extracted successfully from image'
            };

        } catch (error) {
            console.error('[TesseractService] OCR extraction error:', {
                message: error.message,
                stack: error.stack,
                fileName: fileName,
                bufferLength: imageBuffer?.length || 0
            });

            // Handle specific Tesseract errors
            if (error.message.includes('Invalid image')) {
                throw new Error('Invalid image format. Please ensure the image is in a supported format (JPEG, PNG, GIF, BMP, WebP, TIFF).');
            } else if (error.message.includes('Worker')) {
                throw new Error('OCR worker failed to initialize. Please try again.');
            } else if (error.message.includes('timeout')) {
                throw new Error('OCR processing timed out. Please try with a smaller image.');
            } else {
                throw new Error(`Failed to extract text from image: ${error.message}`);
            }
        }
    }

    validateImageFile(fileName, mimeType) {
        const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.pdf'];
        const supportedMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'image/tiff',
            'application/pdf'
        ];

        const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        
        const errors = [];

        if (!supportedExtensions.includes(fileExtension)) {
            errors.push(`Unsupported file extension: ${fileExtension}. Supported formats: ${supportedExtensions.join(', ')}`);
        }

        if (mimeType && !supportedMimeTypes.includes(mimeType)) {
            console.warn(`[TesseractService] Unexpected MIME type: ${mimeType} for file: ${fileName}`);
            // Don't add to errors as browsers sometimes send incorrect MIME types
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            fileExtension: fileExtension,
            mimeType: mimeType
        };
    }

    /**
     * Get list of supported image formats
     * @returns {Array} - Array of supported formats
     */
    getSupportedFormats() {
        return [
            'JPEG (.jpg, .jpeg)',
            'PNG (.png)',
            'GIF (.gif)',
            'BMP (.bmp)',
            'WebP (.webp)',
            'TIFF (.tiff, .tif)',
            'PDF (.pdf)'
        ];
    }

    async healthCheck() {
        try {
            // Create a simple test image (1x1 pixel PNG)
            const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
            
            const result = await this.extractTextFromImage(testImageBuffer, 'health-check.png');
            
            return {
                status: 'healthy',
                service: 'Tesseract OCR',
                message: 'OCR service is working correctly',
                timestamp: new Date().toISOString(),
                version: 'tesseract.js',
                supportedLanguages: ['eng', 'vie']
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                service: 'Tesseract OCR',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create and export a singleton instance
const tesseractService = new TesseractService();

module.exports = tesseractService;
