const fs = require('fs');
const path = require('path');

class MockTranscriptionService {
    constructor() {
        this.isEnabled = process.env.USE_MOCK_TRANSCRIPTION === 'true';
        console.log(`[MockTranscriptionService] Mock mode: ${this.isEnabled ? 'ENABLED' : 'DISABLED'}`);
    }

    generateMockTransription(duration, videoTitle) {
        // Sample transcription texts for different types of content
        const sampleTexts = {
            music: [
                "This is a music video featuring instrumental and vocal performances.",
                "The song includes various musical elements and artistic expression.",
                "Musical composition with rhythm, melody, and harmonic progression."
            ],
            educational: [
                "Welcome to this educational content. Today we'll be discussing important concepts.",
                "Let's explore the key principles and understand the fundamental ideas.",
                "This tutorial will guide you through step-by-step instructions and examples."
            ],
            general: [
                "This video contains spoken content with various topics and discussions.",
                "The presentation includes information, explanations, and detailed coverage.",
                "Content covers multiple aspects with comprehensive analysis and insights."
            ]
        };

        // Determine content type based on title
        let contentType = 'general';
        if (videoTitle.toLowerCase().includes('music') || 
            videoTitle.toLowerCase().includes('song') || 
            videoTitle.toLowerCase().includes('official')) {
            contentType = 'music';
        } else if (videoTitle.toLowerCase().includes('tutorial') || 
                   videoTitle.toLowerCase().includes('learn') || 
                   videoTitle.toLowerCase().includes('how to')) {
            contentType = 'educational';
        }

        // Generate text based on duration (roughly 150 words per minute)
        const wordsPerMinute = 150;
        const estimatedWords = Math.floor((duration / 60) * wordsPerMinute);
        const baseTexts = sampleTexts[contentType];
        
        let transcriptionText = '';
        let currentWords = 0;
        
        while (currentWords < estimatedWords) {
            const randomText = baseTexts[Math.floor(Math.random() * baseTexts.length)];
            transcriptionText += randomText + ' ';
            currentWords += randomText.split(' ').length;
        }

        // Trim to approximate word count
        const words = transcriptionText.split(' ').slice(0, estimatedWords);
        transcriptionText = words.join(' ').trim();

        return {
            text: transcriptionText,
            confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
            language: 'en',
            duration: duration,
            words: words.length,
            status: 'completed',
            audio_duration: duration,
            language_detection: [
                { language: 'en', confidence: 0.95 }
            ],
            chapters: this.generateMockChapters(duration, transcriptionText),
            summary: this.generateMockSummary(transcriptionText, videoTitle)
        };
    }

    generateMockChapters(duration, text) {
        if (duration < 300) return []; // No chapters for videos under 5 minutes

        const chapters = [];
        const chapterCount = Math.min(Math.floor(duration / 300), 5); // Max 5 chapters
        const chapterDuration = duration / chapterCount;

        for (let i = 0; i < chapterCount; i++) {
            chapters.push({
                start: Math.floor(i * chapterDuration),
                end: Math.floor((i + 1) * chapterDuration),
                headline: `Chapter ${i + 1}: Key Topics`,
                summary: `This section covers important concepts and detailed explanations.`
            });
        }

        return chapters;
    }

    /**
     * Generate mock summary
     * @param {string} text - Transcription text
     * @param {string} videoTitle - Video title
     * @returns {string} - Mock summary
     */
    generateMockSummary(text, videoTitle) {
        const summaries = [
            `This content from "${videoTitle}" provides comprehensive coverage of the main topics discussed.`,
            `The video "${videoTitle}" presents detailed information and analysis on various subjects.`,
            `"${videoTitle}" offers insights and explanations covering multiple important aspects.`
        ];

        return summaries[Math.floor(Math.random() * summaries.length)];
    }

    async mockYouTubeProcessing(youtubeUrl, audioInfo, options = {}) {
        console.log(`[MockTranscriptionService] Generating mock transcription for: ${audioInfo.videoTitle}`);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        const transcription = this.generateMockTransription(audioInfo.duration, audioInfo.videoTitle);

        return {
            success: true,
            videoInfo: {
                title: audioInfo.videoTitle,
                duration: audioInfo.duration,
                audioQuality: '192K',
                url: youtubeUrl,
                fileSize: audioInfo.fileSize
            },
            transcription: {
                text: transcription.text,
                textLength: transcription.text.length,
                confidence: transcription.confidence,
                language: transcription.language,
                duration: transcription.duration,
                words: transcription.words,
                chapters: transcription.chapters,
                summary: transcription.summary
            },
            processingTime: new Date().toISOString(),
            mockMode: true,
            note: 'This is a mock transcription generated for development/testing purposes.'
        };
    }

    shouldUseMock() {
        return this.isEnabled;
    }
}

module.exports = MockTranscriptionService;
