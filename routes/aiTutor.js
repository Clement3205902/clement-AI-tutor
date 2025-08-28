const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Virginia Tech ME Curriculum Knowledge Base
const ME_CURRICULUM = {
    core_subjects: [
        'Calculus I, II, III', 'Differential Equations', 'Linear Algebra',
        'Physics I, II (Mechanics, E&M)', 'Chemistry', 'Statistics',
        'Statics', 'Dynamics', 'Fluid Dynamics', 'Thermodynamics',
        'Heat and Mass Transfer', 'Materials Engineering', 'Controls Engineering',
        'Mechanical Design', 'Manufacturing Processes', 'Vibrations'
    ],
    learning_objectives: {
        beginner: 'Build fundamental understanding with step-by-step explanations',
        intermediate: 'Apply concepts to solve problems with guided assistance',
        advanced: 'Synthesize knowledge across multiple disciplines'
    }
};

// Enhanced AI Tutor System Prompt
const TUTOR_SYSTEM_PROMPT = `You are an expert AI tutor specializing in Mechanical Engineering for Virginia Tech students. Your knowledge base includes:

CORE SUBJECTS: ${ME_CURRICULUM.core_subjects.join(', ')}

EDUCATIONAL RESOURCES:
- MIT OpenCourseWare materials for all subjects
- Engineering Statics textbook content
- Thermodynamics and heat transfer fundamentals
- Fluid mechanics and dynamics principles
- Materials science and engineering mechanics
- Control systems and vibrations theory
- Mathematical foundations (Calculus, Differential Equations, Linear Algebra)

TEACHING APPROACH:
1. Always start with fundamental concepts and build up complexity
2. Provide step-by-step explanations suitable for beginners
3. Use real-world engineering examples and applications
4. Break down complex problems into manageable steps
5. Explain the "why" behind each step, not just the "how"
6. Connect concepts across different subjects when relevant
7. Encourage critical thinking and problem-solving skills

COMMUNICATION STYLE:
- Patient and encouraging, like a knowledgeable teaching assistant
- Use clear, simple language that a beginner can understand
- Provide visual descriptions when helpful
- Ask follow-up questions to ensure understanding
- Offer multiple approaches to solve problems

When solving problems:
1. Identify what type of problem it is
2. List given information and what needs to be found
3. Explain relevant principles and equations
4. Show step-by-step solution with clear explanations
5. Verify the answer and explain its physical meaning
6. Suggest related practice problems or concepts to study

Remember: You're teaching a beginner, so explain every step clearly and don't assume prior knowledge.`;

// Chat with AI tutor
router.post('/chat', async (req, res) => {
    try {
        const { message, context, subject } = req.body;

        let enhancedPrompt = TUTOR_SYSTEM_PROMPT;
        
        if (subject) {
            enhancedPrompt += `\n\nCURRENT SUBJECT FOCUS: ${subject}`;
        }

        if (context) {
            enhancedPrompt += `\n\nCONTEXT: ${context}`;
        }

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: enhancedPrompt },
                { role: 'user', content: message }
            ],
            temperature: parseFloat(process.env.GPT_TEMPERATURE) || 0.3,
            max_tokens: 2000
        });

        res.json({
            response: completion.choices[0].message.content,
            usage: completion.usage
        });
    } catch (error) {
        console.error('AI Tutor Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI tutor' });
    }
});

// Get subject-specific help
router.post('/subject-help', async (req, res) => {
    try {
        const { subject, topic, level } = req.body;

        const subjectPrompt = `${TUTOR_SYSTEM_PROMPT}

SPECIFIC REQUEST: Provide comprehensive help for ${subject} - ${topic}
STUDENT LEVEL: ${level || 'beginner'}

Please provide:
1. Key concepts and principles
2. Important equations and formulas
3. Step-by-step problem-solving approach
4. Common mistakes to avoid
5. Practice problem suggestions
6. Real-world applications

Focus on clear, beginner-friendly explanations with detailed steps.`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: subjectPrompt },
                { role: 'user', content: `I need help understanding ${topic} in ${subject}` }
            ],
            temperature: 0.3,
            max_tokens: 2500
        });

        res.json({
            response: completion.choices[0].message.content,
            subject,
            topic,
            level
        });
    } catch (error) {
        console.error('Subject Help Error:', error);
        res.status(500).json({ error: 'Failed to get subject-specific help' });
    }
});

// Explain uploaded content
router.post('/explain-content', async (req, res) => {
    try {
        const { content, contentType, context } = req.body;

        const explainPrompt = `${TUTOR_SYSTEM_PROMPT}

TASK: Explain the following ${contentType} content in detail, suitable for a mechanical engineering beginner.

${context ? `CONTEXT: ${context}` : ''}

Please provide:
1. Overview of what this content covers
2. Key concepts and principles explained
3. Important equations or formulas (if any)
4. Step-by-step breakdown of complex parts
5. How this relates to mechanical engineering curriculum
6. Study tips and what to focus on

Remember to explain everything clearly as if teaching a beginner.`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: explainPrompt },
                { role: 'user', content: content }
            ],
            temperature: 0.3,
            max_tokens: 3000
        });

        res.json({
            explanation: completion.choices[0].message.content,
            contentType
        });
    } catch (error) {
        console.error('Content Explanation Error:', error);
        res.status(500).json({ error: 'Failed to explain content' });
    }
});

module.exports = router;