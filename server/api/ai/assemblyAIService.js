const { AssemblyAI } = require('assemblyai');
const axios = require('axios');
const FormData = require('form-data');
const ytdlp = require('yt-dlp-exec');

// Required modules for file operations
const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock transcription service for fallback
const MockTranscriptionService = require('./mockTranscriptionService');

class AssemblyAIService {
    constructor() {
        this.apiKey = process.env.ASSEMBLYAI_API_KEY;
        
        if (!this.apiKey) {
            throw new Error('AssemblyAI API key is required. Please set ASSEMBLYAI_API_KEY in your environment variables.');
        }
        
        this.client = new AssemblyAI({
            apiKey: this.apiKey
        });
        
        // Initialize mock service for fallback
        this.mockService = new MockTranscriptionService();
        
        console.log('[AssemblyAIService] Service initialized successfully');
    }

    /**
     * Upload audio file to AssemblyAI with retry logic
     * @param {Buffer} audioBuffer - Audio file buffer
     * @param {string} filename - Original filename
     * @returns {Promise<string>} - Upload URL
     */
    async uploadAudioFile(audioBuffer, filename) {
        const maxRetries = 2;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[AssemblyAIService] Uploading audio file (attempt ${attempt}/${maxRetries}): ${filename}`);
                
                const uploadUrl = await this.client.files.upload(audioBuffer);
                
                console.log(`[AssemblyAIService] Audio file uploaded successfully: ${filename}`);
                return uploadUrl;
                
            } catch (error) {
                lastError = error;
                console.error(`[AssemblyAIService] Upload attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    const waitTime = attempt * 1000; // 1s, 2s
                    console.log(`[AssemblyAIService] Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        throw new Error(`Failed to upload audio file after ${maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * Download audio from YouTube video using yt-dlp
     * @param {string} youtubeUrl - YouTube video URL
     * @returns {Promise<Object>} - Downloaded audio file info
     */
    async downloadYouTubeAudio(youtubeUrl) {
        let tempFilePath = null;
        
        try {
            console.log(`[AssemblyAIService] Downloading audio from YouTube: ${youtubeUrl}`);

            // Validate YouTube URL format
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(youtubeUrl)) {
                throw new Error('Invalid YouTube URL provided');
            }

            // First, get basic video info to check duration
            const basicInfo = await ytdlp(youtubeUrl, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                skipDownload: true
            });

            const videoTitle = basicInfo.title || 'Unknown Title';
            const videoDuration = parseInt(basicInfo.duration) || 0;

            // Check video duration (limit to 2 hours for processing efficiency)
            if (videoDuration > 7200) {
                throw new Error('Video is too long (over 2 hours). Please use a shorter video.');
            }

            console.log(`[AssemblyAIService] Video info: ${videoTitle} (${Math.floor(videoDuration / 60)}:${videoDuration % 60})`);

            // Create temporary file path
            const tempDir = os.tmpdir();
            const timestamp = Date.now();
            const sanitizedTitle = videoTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
            tempFilePath = path.join(tempDir, `youtube_audio_${timestamp}_${sanitizedTitle}.%(ext)s`);

            console.log(`[AssemblyAIService] Downloading audio to: ${tempFilePath}`);

            // Download audio using yt-dlp (WebM format - no FFmpeg conversion needed)
            await ytdlp(youtubeUrl, {
                format: 'bestaudio[ext=webm]/bestaudio',
                output: tempFilePath,
                noCheckCertificates: true,
                noWarnings: true,
                addHeader: [
                    'referer:youtube.com',
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ]
            });

            // Find the actual downloaded file (try multiple extensions)
            const possibleExtensions = ['.webm', '.mp3', '.m4a', '.opus'];
            let actualFilePath = null;
            
            for (const ext of possibleExtensions) {
                const testPath = tempFilePath.replace('.%(ext)s', ext);
                if (fs.existsSync(testPath)) {
                    actualFilePath = testPath;
                    console.log(`[AssemblyAIService] Found downloaded file: ${actualFilePath}`);
                    break;
                }
            }

            if (!actualFilePath) {
                throw new Error('Audio file was not downloaded successfully');
            }

            const fileStats = fs.statSync(actualFilePath);
            console.log(`[AssemblyAIService] Audio downloaded successfully: ${actualFilePath} (${Math.round(fileStats.size / 1024 / 1024 * 100) / 100} MB)`);

            return {
                filePath: actualFilePath,
                videoTitle: videoTitle,
                duration: videoDuration,
                fileSize: fileStats.size,
                format: path.extname(actualFilePath).substring(1)
            };

        } catch (error) {
            console.error('[AssemblyAIService] YouTube audio download error:', error.message);
            
            // Clean up temp file if it exists
            if (tempFilePath) {
                const possibleExtensions = ['.webm', '.mp3', '.m4a', '.opus'];
                for (const ext of possibleExtensions) {
                    const testPath = tempFilePath.replace('.%(ext)s', ext);
                    try {
                        if (fs.existsSync(testPath)) {
                            fs.unlinkSync(testPath);
                        }
                    } catch (cleanupError) {
                        console.warn('[AssemblyAIService] Failed to clean up temp file:', cleanupError.message);
                    }
                }
            }
            
            throw new Error(`Failed to download audio from YouTube: ${error.message}`);
        }
    }

    /**
     * Transcribe audio using AssemblyAI
     * @param {string} audioUrl - Audio URL
     * @param {Object} options - Transcription options
     * @returns {Promise<Object>} - Transcription result
     */
    async transcribeAudio(audioUrl, options = {}) {
        try {
            console.log(`[AssemblyAIService] Starting transcription`);

            const params = {
                audio: audioUrl,
                speech_model: 'universal',
                language_detection: true,
                punctuate: true,
                format_text: true,
                ...options
            };

            const transcript = await this.client.transcripts.transcribe(params);

            if (transcript.status === 'error') {
                throw new Error(`Transcription failed: ${transcript.error}`);
            }

            console.log(`[AssemblyAIService] Transcription completed successfully`);

            return {
                text: transcript.text,
                textLength: transcript.text?.length || 0,
                confidence: transcript.confidence,
                language: transcript.language_code,
                duration: transcript.audio_duration,
                words: transcript.words?.length || 0
            };

        } catch (error) {
            console.error('[AssemblyAIService] Transcription error:', error.message);
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
    }

    /**
     * Process YouTube video with fallback to mock service
     * @param {string} youtubeUrl - YouTube video URL
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} - Complete processing result
     */
    async processYouTubeVideo(youtubeUrl, options = {}) {
        let downloadedFilePath = null;
        
        try {
            console.log(`[AssemblyAIService] Processing YouTube video: ${youtubeUrl}`);

            // Step 1: Download audio from YouTube
            const audioInfo = await this.downloadYouTubeAudio(youtubeUrl);
            downloadedFilePath = audioInfo.filePath;

            // Check if mock mode is enabled
            if (this.mockService.shouldUseMock()) {
                console.log(`[AssemblyAIService] Mock mode enabled, using mock transcription`);
                
                // Clean up downloaded file
                try {
                    fs.unlinkSync(downloadedFilePath);
                    console.log(`[AssemblyAIService] Cleaned up temporary file: ${downloadedFilePath}`);
                } catch (cleanupError) {
                    console.warn(`[AssemblyAIService] Failed to clean up temp file: ${cleanupError.message}`);
                }
                
                return await this.mockService.mockYouTubeProcessing(youtubeUrl, audioInfo, options);
            }

            // Step 2: Try real AssemblyAI processing
            try {
                console.log(`[AssemblyAIService] Uploading audio file to AssemblyAI`);
                const audioBuffer = fs.readFileSync(downloadedFilePath);
                const uploadUrl = await this.uploadAudioFile(audioBuffer, path.basename(downloadedFilePath));

                console.log(`[AssemblyAIService] Starting transcription`);
                const transcriptionResult = await this.transcribeAudio(uploadUrl, options);

                // Clean up downloaded file
                try {
                    fs.unlinkSync(downloadedFilePath);
                    console.log(`[AssemblyAIService] Cleaned up temporary file: ${downloadedFilePath}`);
                } catch (cleanupError) {
                    console.warn(`[AssemblyAIService] Failed to clean up temp file: ${cleanupError.message}`);
                }

                return {
                    success: true,
                    videoInfo: {
                        title: audioInfo.videoTitle,
                        duration: audioInfo.duration,
                        audioQuality: '192K',
                        url: youtubeUrl,
                        fileSize: audioInfo.fileSize
                    },
                    transcription: transcriptionResult,
                    processingTime: new Date().toISOString()
                };
            } catch (assemblyError) {
                console.error('[AssemblyAIService] AssemblyAI processing failed, falling back to mock:', assemblyError.message);
                
                // Clean up downloaded file
                try {
                    fs.unlinkSync(downloadedFilePath);
                    console.log(`[AssemblyAIService] Cleaned up temporary file: ${downloadedFilePath}`);
                } catch (cleanupError) {
                    console.warn(`[AssemblyAIService] Failed to clean up temp file: ${cleanupError.message}`);
                }
                
                // Fallback to mock service
                const mockResult = await this.mockService.mockYouTubeProcessing(youtubeUrl, audioInfo, options);
                mockResult.fallbackMode = true;
                mockResult.originalError = assemblyError.message;
                return mockResult;
            }

        } catch (error) {
            console.error('[AssemblyAIService] YouTube processing error:', error.message);
            
            // Clean up downloaded file if it exists
            if (downloadedFilePath) {
                try {
                    if (fs.existsSync(downloadedFilePath)) {
                        fs.unlinkSync(downloadedFilePath);
                        console.log(`[AssemblyAIService] Cleaned up temp file after error: ${downloadedFilePath}`);
                    }
                } catch (cleanupError) {
                    console.warn(`[AssemblyAIService] Failed to clean up temp file after error: ${cleanupError.message}`);
                }
            }
            
            throw new Error(`Failed to process YouTube video: ${error.message}`);
        }
    }
}

module.exports = AssemblyAIService;
