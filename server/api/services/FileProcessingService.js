const fs = require('fs').promises;
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class FileProcessingService {
    static async processYouTubeVideo(url) {
        try {
            console.log('Processing YouTube URL:', url);
            
            // Validate URL format
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
            if (!youtubeRegex.test(url)) {
                throw new Error('Invalid YouTube URL format');
            }
            
            // Enhanced youtube-dl options
            const options = {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: [
                    'referer:youtube.com', 
                    'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ],
                extractFlat: false,
                writeSubtitles: false,
                writeAutoSub: false,
                skipDownload: true
            };
            
            console.log('Calling youtube-dl-exec with options:', options);
            const info = await youtubedl(url, options);
            console.log('YouTube-dl response received:', !!info);
            
            if (!info) {
                throw new Error('No video information received from YouTube');
            }
            
            return {
                title: info.title || 'Untitled Video',
                description: info.description || 'No description available',
                duration: info.duration || 0,
                uploader: info.uploader || 'Unknown',
                upload_date: info.upload_date || null,
                view_count: info.view_count || 0,
                transcript: null, // Simplified for now
                url: url,
                thumbnail: info.thumbnail || null
            };
        } catch (error) {
            console.error('YouTube processing error details:', {
                message: error.message,
                stack: error.stack,
                url: url
            });
            
            // Return fallback data instead of throwing
            return {
                title: 'YouTube Video',
                description: `Video content from: ${url}`,
                duration: 0,
                uploader: 'Unknown',
                upload_date: null,
                view_count: 0,
                transcript: null,
                url: url,
                thumbnail: null,
                error: error.message
            };
        }
    }
    
    static async processPDF(filePath) {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            
            return {
                text: data.text,
                pages: data.numpages,
                info: data.info
            };
        } catch (error) {
            console.error('PDF processing error:', error);
            throw new Error('Failed to process PDF document: ' + error.message);
        }
    }
    
    static async processWordDocument(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            
            return {
                text: result.value,
                messages: result.messages
            };
        } catch (error) {
            console.error('Word document processing error:', error);
            throw new Error('Failed to process Word document: ' + error.message);
        }
    }
    
    static async processAudio(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                text: 'Audio file detected. Full transcription requires Google Cloud Speech-to-Text integration.',
                size: stats.size,
                processed: false
            };
        } catch (error) {
            console.error('Audio processing error:', error);
            throw new Error('Failed to process audio file: ' + error.message);
        }
    }
    
    static createNotesStructure(content, type, userId) {
        try {
            let notesContent = '';
            
            if (type === 'youtube') {
                notesContent = `# ${content.title}\n\n`;
                notesContent += `**Source:** ${content.url}\n\n`;
                
                if (content.uploader) {
                    notesContent += `**Channel:** ${content.uploader}\n\n`;
                }
                
                if (content.description && content.description !== 'No description available') {
                    notesContent += `## Description\n${content.description.substring(0, 500)}...\n\n`;
                }
                
                if (content.duration) {
                    const minutes = Math.floor(content.duration / 60);
                    const seconds = content.duration % 60;
                    notesContent += `**Duration:** ${minutes}:${seconds.toString().padStart(2, '0')}\n\n`;
                }
                
                notesContent += `## Notes\n*Add your study notes here...*\n\n`;
                
                if (content.error) {
                    notesContent += `\n---\n*Note: There was an issue processing this video: ${content.error}*`;
                }
            } else if (type === 'pdf' || type === 'document') {
                notesContent = `# Document Notes\n\n## Content Summary\n${content.text.substring(0, 1000)}...\n\n`;
            } else if (type === 'audio') {
                notesContent = `# Audio Notes\n\n## File Information\n${content.text}\n\n`;
            }
            
            return {
                title: type === 'youtube' ? content.title : `${type.toUpperCase()} Notes - ${new Date().toLocaleDateString()}`,
                content: notesContent,
                category: type.charAt(0).toUpperCase() + type.slice(1),
                userId: userId,
                createdAt: new Date(),
                sourceType: type,
                sourceData: content
            };
        } catch (error) {
            console.error('Notes creation error:', error);
            throw new Error('Failed to create notes structure: ' + error.message);
        }
    }
}

module.exports = FileProcessingService;