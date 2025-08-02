const vision = require('@google-cloud/vision');
const path = require('path');

// Set up Google Cloud Vision credentials
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../../', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

class VisionService {
    constructor() {
        try {
            // Creates a client
            this.client = new vision.ImageAnnotatorClient();
            console.log('[VisionService] Google Cloud Vision client initialized successfully');
        } catch (error) {
            console.error('[VisionService] Failed to initialize Google Cloud Vision client:', error.message);
            throw error;
        }
    }

    /**
     * Extract text from image using Google Cloud Vision OCR
     * @param {Buffer} imageBuffer - Image buffer
     * @param {string} fileName - Original file name for logging
     * @returns {Promise<Object>} - Extracted text and metadata
     */
    async extractTextFromImage(imageBuffer, fileName = 'image') {
        try {
            console.log(`[VisionService] Starting OCR for image: ${fileName} (${imageBuffer.length} bytes)`);

            // Validate image buffer
            if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
                throw new Error('Invalid image buffer provided');
            }

            // Perform text detection
            const [result] = await this.client.textDetection({
                image: {
                    content: imageBuffer
                }
            });

            const detections = result.textAnnotations;
            
            console.log(`[VisionService] OCR completed. Found ${detections?.length || 0} text annotations`);

            if (!detections || detections.length === 0) {
                return {
                    success: true,
                    extractedText: '',
                    confidence: 0,
                    wordCount: 0,
                    textLength: 0,
                    message: 'No text found in the image'
                };
            }

            // The first annotation contains the full text
            const fullText = detections[0].description || '';
            const confidence = detections[0].confidence || 0;

            // Calculate metadata
            const wordCount = fullText.trim().split(/\s+/).filter(word => word.length > 0).length;
            const textLength = fullText.length;

            console.log(`[VisionService] Successfully extracted ${textLength} characters, ${wordCount} words`);

            return {
                success: true,
                extractedText: fullText.trim(),
                confidence: confidence,
                wordCount: wordCount,
                textLength: textLength,
                fileName: fileName,
                message: 'Text extracted successfully from image'
            };

        } catch (error) {
            console.error('[VisionService] OCR extraction error:', {
                message: error.message,
                stack: error.stack,
                fileName: fileName,
                bufferLength: imageBuffer?.length || 0
            });

            // Handle specific Google Cloud Vision errors
            if (error.message.includes('INVALID_ARGUMENT')) {
                throw new Error('Invalid image format. Please ensure the image is in a supported format (JPEG, PNG, GIF, BMP, WebP, RAW, ICO, PDF, TIFF).');
            } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('has not been used') || error.message.includes('is disabled')) {
                // Provide helpful instructions for API setup
                throw new Error(`Google Cloud Vision API is not enabled for this project.

To enable image text extraction:
1. Visit the Google Cloud Console: https://console.developers.google.com/apis/api/vision.googleapis.com/overview
2. Enable the Cloud Vision API for your project
3. Ensure your service account has the necessary permissions

For now, you can still use the AI assistant with text messages. Image analysis will be available once the API is properly configured.`);
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                throw new Error('Google Cloud Vision API quota exceeded. Please try again later.');
            } else if (error.message.includes('UNAVAILABLE')) {
                throw new Error('Google Cloud Vision API is temporarily unavailable. Please try again later.');
            } else {
                throw new Error(`Failed to extract text from image: ${error.message}`);
            }
        }
    }

    /**
     * Validate image file type
     * @param {string} fileName - File name
     * @param {string} mimeType - MIME type
     * @returns {Object} - Validation result
     */
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
            console.warn(`[VisionService] Unexpected MIME type: ${mimeType} for file: ${fileName}`);
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
     * Get supported image formats
     * @returns {Array} - Array of supported file extensions
     */
    getSupportedFormats() {
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.pdf'];
    }

    /**
     * Health check for Google Cloud Vision service
     * @returns {Promise<Object>} - Health status
     */
    async healthCheck() {
        try {
            // Create a simple test image (1x1 pixel PNG)
            const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
            
            const result = await this.extractTextFromImage(testImageBuffer, 'health-check.png');
            
            return {
                status: 'healthy',
                service: 'Google Cloud Vision',
                message: 'OCR service is working correctly',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                service: 'Google Cloud Vision',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create and export a singleton instance
const visionService = new VisionService();

module.exports = visionService;
