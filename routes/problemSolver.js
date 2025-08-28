const express = require('express');
const OpenAI = require('openai');
const math = require('mathjs');
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Problem Solver System Prompt
const PROBLEM_SOLVER_PROMPT = `You are an expert mechanical engineering problem solver and tutor. When presented with a problem, you must:

PROBLEM ANALYSIS:
1. Identify the type of problem (Statics, Dynamics, Thermodynamics, Fluid Mechanics, etc.)
2. List all given information clearly
3. Identify what needs to be found
4. State relevant assumptions

SOLUTION APPROACH:
1. Explain the underlying physics/engineering principles
2. Identify relevant equations and formulas
3. Draw free body diagrams or sketches when applicable (describe them)
4. Show ALL calculation steps with proper units
5. Explain the reasoning behind each step
6. Verify the final answer for reasonableness

EDUCATIONAL VALUE:
1. Explain WHY each step is necessary
2. Point out common mistakes students make
3. Suggest alternative solution methods if applicable
4. Connect to real-world applications
5. Recommend follow-up topics to study

BEGINNER-FRIENDLY APPROACH:
- Define technical terms as you use them
- Explain the physical meaning of results
- Use analogies when helpful
- Break complex problems into simpler sub-problems

Always show your work step-by-step and explain the reasoning behind each calculation.`;

// Solve engineering problems
router.post('/solve-problem', async (req, res) => {
    try {
        const { problem, subject, context } = req.body;

        let enhancedPrompt = PROBLEM_SOLVER_PROMPT;
        
        if (subject) {
            enhancedPrompt += `\n\nSUBJECT AREA: ${subject}`;
        }

        if (context) {
            enhancedPrompt += `\n\nADDITIONAL CONTEXT: ${context}`;
        }

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: enhancedPrompt },
                { role: 'user', content: `Please solve this problem step by step: ${problem}` }
            ],
            temperature: 0.2, // Lower temperature for more consistent problem solving
            max_tokens: 3000
        });

        res.json({
            solution: completion.choices[0].message.content,
            problem,
            subject: subject || 'General Engineering'
        });
    } catch (error) {
        console.error('Problem Solver Error:', error);
        res.status(500).json({ error: 'Failed to solve problem' });
    }
});

// Check student's work
router.post('/check-work', async (req, res) => {
    try {
        const { problem, studentSolution, correctAnswer } = req.body;

        const checkPrompt = `${PROBLEM_SOLVER_PROMPT}

TASK: Review and provide feedback on a student's solution to an engineering problem.

PROBLEM: ${problem}
STUDENT'S SOLUTION: ${studentSolution}
${correctAnswer ? `CORRECT ANSWER: ${correctAnswer}` : ''}

Please provide:
1. Assessment of the student's approach
2. Identification of correct steps
3. Identification of errors or misconceptions
4. Suggestions for improvement
5. Hints for next steps if the solution is incomplete
6. Encouragement and positive feedback where appropriate

Be constructive and educational in your feedback, focusing on helping the student learn.`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: checkPrompt },
                { role: 'user', content: 'Please review my work on this problem.' }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        res.json({
            feedback: completion.choices[0].message.content,
            problem
        });
    } catch (error) {
        console.error('Work Check Error:', error);
        res.status(500).json({ error: 'Failed to check work' });
    }
});

// Generate practice problems
router.post('/generate-problems', async (req, res) => {
    try {
        const { subject, topic, difficulty, count } = req.body;

        const generatePrompt = `Generate ${count || 3} practice problems for ${subject} - ${topic} at ${difficulty || 'beginner'} level.

For each problem, provide:
1. A clear problem statement with given values
2. What needs to be found
3. Difficulty level indicators
4. Brief solution approach (without full solution)

Make problems realistic and relevant to Virginia Tech mechanical engineering curriculum.
Include proper units and realistic numerical values.
Problems should build understanding of key concepts.`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: PROBLEM_SOLVER_PROMPT },
                { role: 'user', content: generatePrompt }
            ],
            temperature: 0.7, // Higher temperature for more variety in problems
            max_tokens: 2000
        });

        res.json({
            problems: completion.choices[0].message.content,
            subject,
            topic,
            difficulty: difficulty || 'beginner'
        });
    } catch (error) {
        console.error('Problem Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate practice problems' });
    }
});

// Mathematical calculation helper
router.post('/calculate', async (req, res) => {
    try {
        const { expression, context } = req.body;

        // Use mathjs for safe mathematical calculations
        let result;
        try {
            result = math.evaluate(expression);
        } catch (mathError) {
            return res.status(400).json({ 
                error: 'Invalid mathematical expression',
                details: mathError.message 
            });
        }

        // Get explanation from AI
        const explainPrompt = `Explain this mathematical calculation step by step:
        
Expression: ${expression}
Result: ${result}
${context ? `Context: ${context}` : ''}

Provide:
1. Step-by-step breakdown of the calculation
2. Explanation of mathematical concepts used
3. Physical meaning if applicable
4. Unit analysis if relevant`;

        const completion = await openai.chat.completions.create({
            model: process.env.GPT_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'You are a math tutor helping with engineering calculations.' },
                { role: 'user', content: explainPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        res.json({
            expression,
            result,
            explanation: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('Calculation Error:', error);
        res.status(500).json({ error: 'Failed to perform calculation' });
    }
});

module.exports = router;