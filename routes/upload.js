const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

const router = express.Router();

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/avi',
            'video/quicktime',
            'audio/mpeg',
            'audio/wav'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    }
});

// Extract text from PDF
async function extractPDFText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
}

// Extract audio from video
function extractAudioFromVideo(videoPath, audioPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(audioPath)
            .audioCodec('libmp3lame')
            .on('end', () => resolve(audioPath))
            .on('error', reject)
            .run();
    });
}

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioPath) {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
        });
        return transcription.text;
    } catch (error) {
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
}

// Upload and process files
router.post('/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        let extractedContent = '';
        let contentType = 'text';

        // Process different file types
        switch (true) {
            case fileType === 'application/pdf':
                extractedContent = await extractPDFText(filePath);
                contentType = 'PDF document';
                break;

            case fileType === 'text/plain':
                extractedContent = fs.readFileSync(filePath, 'utf8');
                contentType = 'text file';
                break;

            case fileType.startsWith('image/'):
                // For images, we'll use OpenAI's vision capabilities
                const imageBuffer = fs.readFileSync(filePath);
                const base64Image = imageBuffer.toString('base64');
                
                const visionResponse = await openai.chat.completions.create({
                    model: 'gpt-4-vision-preview',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Analyze this image and extract any text, equations, diagrams, or educational content. Describe what you see in detail, especially any engineering or mathematical content.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${fileType};base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 2000
                });
                
                extractedContent = visionResponse.choices[0].message.content;
                contentType = 'image analysis';
                break;

            case fileType.startsWith('video/'):
                // Extract audio from video and transcribe
                const audioPath = filePath.replace(path.extname(filePath), '.mp3');
                await extractAudioFromVideo(filePath, audioPath);
                extractedContent = await transcribeAudio(audioPath);
                contentType = 'video transcript';
                
                // Clean up temporary audio file
                fs.unlinkSync(audioPath);
                break;

            case fileType.startsWith('audio/'):
                // Transcribe audio directly
                extractedContent = await transcribeAudio(filePath);
                contentType = 'audio transcript';
                break;

            default:
                throw new Error('Unsupported file type for content extraction');
        }

        res.json({
            filename: req.file.originalname,
            contentType,
            extractedContent,
            fileId: req.file.filename,
            size: req.file.size
        });

    } catch (error) {
        console.error('File Upload Error:', error);
        res.status(500).json({ 
            error: 'Failed to process file',
            details: error.message 
        });
    }
});

// Get explanation for uploaded content
router.post('/explain', async (req, res) => {
    try {
        const { content, contentType, context, subject } = req.body;

        const explainPrompt = `You are an expert mechanical engineering tutor. A student has uploaded ${contentType} content and needs it explained in beginner-friendly terms.

${subject ? `SUBJECT CONTEXT: ${subject}` : ''}
${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

CONTENT TO EXPLAIN:
${content}

Please provide:
1. Overview of the content and its purpose
2. Key concepts and principles covered
3. Step-by-step breakdown of complex parts
4. Important equations or formulas (if any)
5. How this relates to mechanical engineering curriculum
6. Study tips and what to focus on
7. Suggest related topics to explore

Remember to explain everything clearly as if teaching a beginner mechanical engineering student.`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'user', content: explainPrompt }
            ],
            temperature: 0.3,
            max_tokens: 3000
        });

        res.json({
            explanation: completion.choices[0].message.content,
            contentType,
            processed: true
        });

    } catch (error) {
        console.error('Content Explanation Error:', error);
        res.status(500).json({ error: 'Failed to explain content' });
    }
});

// Analyze lecture video/audio transcript
router.post('/analyze-lecture', async (req, res) => {
    try {
        const { transcript, subject, lectureTitle } = req.body;

        const analyzePrompt = `You are analyzing a lecture transcript for a mechanical engineering student. Please provide a comprehensive analysis that will help a beginner understand and study from this lecture.

SUBJECT: ${subject || 'Mechanical Engineering'}
LECTURE TITLE: ${lectureTitle || 'Engineering Lecture'}

TRANSCRIPT:
${transcript}

Please provide:
1. LECTURE SUMMARY: Key points and main topics covered
2. IMPORTANT CONCEPTS: List and explain key engineering concepts discussed
3. EQUATIONS & FORMULAS: Extract and explain any mathematical content
4. STUDY GUIDE: Create a structured study guide from this lecture
5. KEY TAKEAWAYS: Most important points for exam preparation
6. FOLLOW-UP TOPICS: Related topics students should explore
7. PRACTICE SUGGESTIONS: What types of problems to practice based on this lecture

Format your response in clear sections that are easy to study from.`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'user', content: analyzePrompt }
            ],
            temperature: 0.3,
            max_tokens: 3500
        });

        res.json({
            analysis: completion.choices[0].message.content,
            subject,
            lectureTitle: lectureTitle || 'Engineering Lecture'
        });

    } catch (error) {
        console.error('Lecture Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze lecture content' });
    }
});

module.exports = router;