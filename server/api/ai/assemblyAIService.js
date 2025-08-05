const { AssemblyAI } = require('assemblyai');
const axios = require('axios');
const FormData = require('form-data');
const ytdlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MockTranscriptionService = require('./mockTranscriptionService');

class AssemblyAIService {
    constructor() {
        this.apiKey = process.env.ASSEMBLYAI_API_KEY;
        if (!this.apiKey) {
            console.warn('[AssemblyAIService] No API key found, mock mode will be used');
        } else {
            this.client = new AssemblyAI({ apiKey: this.apiKey });
        }
        this.mockService = new MockTranscriptionService();
    }

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

    async extractBasicVideoInfo(youtubeUrl) {
        try {
            console.log(`[AssemblyAIService] Extracting basic video info: ${youtubeUrl}`);

            // Clean the URL to remove playlist and other parameters
            const cleanUrl = this.cleanYouTubeUrl(youtubeUrl);
            console.log(`[AssemblyAIService] Cleaned URL: ${cleanUrl}`);

            // Validate YouTube URL format
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(cleanUrl)) {
                throw new Error('Invalid YouTube URL provided');
            }

            // Basic options for info extraction only
            const infoOptions = {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                skipDownload: true,
                userAgent: this.getRandomUserAgent(),
                addHeader: [
                    'Accept-Language:en-US,en;q=0.9',
                    'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'DNT:1',
                    'Connection:keep-alive'
                ],
                retries: 3,
                socketTimeout: 30
            };

            const basicInfo = await ytdlp(youtubeUrl, infoOptions);

            const videoInfo = {
                title: basicInfo.title || 'Unknown Title',
                duration: parseInt(basicInfo.duration) || 0,
                uploader: basicInfo.uploader || 'Unknown',
                uploadDate: basicInfo.upload_date || null,
                description: basicInfo.description || '',
                viewCount: basicInfo.view_count || 0,
                url: youtubeUrl
            };

            console.log(`[AssemblyAIService] Extracted video info: ${videoInfo.title} (${Math.floor(videoInfo.duration / 60)}:${videoInfo.duration % 60})`);

            return videoInfo;

        } catch (error) {
            console.error(`[AssemblyAIService] Failed to extract video info:`, error.message);

            // Return basic fallback info
            return {
                title: 'YouTube Video',
                duration: 0,
                uploader: 'Unknown',
                uploadDate: null,
                description: 'Video information could not be extracted',
                viewCount: 0,
                url: youtubeUrl,
                error: error.message
            };
        }
    }
    async downloadYouTubeAudio(youtubeUrl) {
        let tempFilePath = null;

        try {
            console.log(`[AssemblyAIService] Downloading audio from YouTube: ${youtubeUrl}`);

            // Clean the URL to remove playlist and other parameters
            const cleanUrl = this.cleanYouTubeUrl(youtubeUrl);
            console.log(`[AssemblyAIService] Using cleaned URL for download: ${cleanUrl}`);

            // Validate YouTube URL format
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(cleanUrl)) {
                throw new Error('Invalid YouTube URL provided');
            }

            // Enhanced yt-dlp options with stronger bot detection bypass
            const baseOptions = {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                skipDownload: true,
                // Rotate user agents
                userAgent: this.getRandomUserAgent(),
                addHeader: [
                    'Accept-Language:en-US,en;q=0.9,es;q=0.8',
                    'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding:gzip, deflate, br',
                    'DNT:1',
                    'Connection:keep-alive',
                    'Upgrade-Insecure-Requests:1',
                    'Sec-Fetch-Dest:document',
                    'Sec-Fetch-Mode:navigate',
                    'Sec-Fetch-Site:none',
                    'Cache-Control:max-age=0'
                ],
                // Enhanced retry and timeout options
                retries: 5,
                fragmentRetries: 5,
                socketTimeout: 60,
                // Add sleep between requests
                sleepInterval: 2,
                maxSleepInterval: 5,
                // Add proxy rotation if needed
                proxy: process.env.PROXY_URL || null
            };

            // Add random delay to avoid rate limiting
            await this.randomDelay(1000, 3000);

            // First, get basic video info to check duration
            const basicInfo = await ytdlp(youtubeUrl, baseOptions);

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

            // Enhanced download options with additional bypass techniques
            const downloadOptions = {
                format: 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best[height<=480]',
                output: tempFilePath,
                noCheckCertificates: true,
                noWarnings: true,
                userAgent: this.getRandomUserAgent(),
                addHeader: [
                    'Accept-Language:en-US,en;q=0.9,es;q=0.8',
                    'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding:gzip, deflate, br',
                    'DNT:1',
                    'Connection:keep-alive',
                    'Upgrade-Insecure-Requests:1',
                    'referer:https://www.youtube.com/',
                    'origin:https://www.youtube.com'
                ],
                retries: 5,
                fragmentRetries: 5,
                socketTimeout: 60,
                sleepInterval: 2,
                maxSleepInterval: 5,
                // Add geo bypass options
                geoBypass: true,
                geoBypassCountry: 'US',
                // Try to extract without downloading first
                simulate: false,
                // Use alternative extraction methods
                extractor: 'youtube:tab,youtube'
            };

            // Add another random delay before download
            await this.randomDelay(2000, 5000);

            // Download audio using yt-dlp
            await ytdlp(cleanUrl, downloadOptions);

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

            // Enhanced bot detection error handling
            if (error.message.includes('Sign in to confirm') ||
                error.message.includes('bot') ||
                error.message.includes('cookies') ||
                error.message.includes('429') ||
                error.message.includes('rate limit') ||
                error.message.includes('HTTP Error 403') ||
                error.message.includes('Forbidden')) {

                // Return a special error object that indicates bot detection
                console.log('[AssemblyAIService] Bot detection triggered, will use mock service');
                const botDetectionError = new Error('YOUTUBE_BOT_DETECTION');
                botDetectionError.isBotDetection = true;
                botDetectionError.originalError = error.message;
                throw botDetectionError;
            }

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

    async processYouTubeVideo(youtubeUrl, options = {}) {
        let downloadedFilePath = null;

        try {
            console.log(`[AssemblyAIService] Processing YouTube video: ${youtubeUrl}`);

            // Step 1: Try to download audio from YouTube with bot detection handling
            let audioInfo;
            try {
                audioInfo = await this.downloadYouTubeAudio(youtubeUrl);
                downloadedFilePath = audioInfo.filePath;
            } catch (downloadError) {
                // Check if this is a bot detection error
                if (downloadError.isBotDetection || downloadError.message === 'YOUTUBE_BOT_DETECTION') {
                    console.log(`[AssemblyAIService] Bot detection triggered, falling back to mock service`);

                    // Try to extract basic video info without downloading
                    audioInfo = await this.extractBasicVideoInfo(youtubeUrl);

                    return await this.mockService.mockYouTubeProcessing(youtubeUrl, audioInfo, options);
                }

                // If it's not bot detection, re-throw the error
                throw downloadError;
            }

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

    async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
    }

    cleanYouTubeUrl(url) {
        try {
            // Extract video ID from various YouTube URL formats
            let videoId = null;

            // Handle different YouTube URL formats
            if (url.includes('youtube.com/watch')) {
                const urlParams = new URL(url).searchParams;
                videoId = urlParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('youtube.com/embed/')[1].split('?')[0].split('&')[0];
            }

            if (!videoId) {
                console.warn('[AssemblyAIService] Could not extract video ID, using original URL');
                return url;
            }

            // Return clean YouTube URL with just the video ID
            const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
            console.log(`[AssemblyAIService] Cleaned URL: ${url} -> ${cleanUrl}`);
            return cleanUrl;

        } catch (error) {
            console.warn('[AssemblyAIService] Error cleaning URL, using original:', error.message);
            return url;
        }
    }

    // Add helper methods
    getRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }
}
const assemblyAIServiceInstance = new AssemblyAIService();

module.exports = {
    uploadAudioFile: assemblyAIServiceInstance.uploadAudioFile.bind(assemblyAIServiceInstance),
    downloadYouTubeAudio: assemblyAIServiceInstance.downloadYouTubeAudio.bind(assemblyAIServiceInstance),
    transcribeAudio: assemblyAIServiceInstance.transcribeAudio.bind(assemblyAIServiceInstance),
    processYouTubeVideo: assemblyAIServiceInstance.processYouTubeVideo.bind(assemblyAIServiceInstance)
};