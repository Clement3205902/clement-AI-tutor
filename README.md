# ME AI Tutor - Virginia Tech Mechanical Engineering Assistant

A comprehensive AI-powered tutoring system specifically designed for Virginia Tech Mechanical Engineering students. This intelligent tutoring website provides step-by-step explanations, problem-solving assistance, and educational support across all major ME subjects.

## 🎓 Features

### Core Functionality
- **AI Chat Tutor**: Interactive conversation with an AI tutor specialized in mechanical engineering
- **Subject-Specific Help**: Detailed explanations for specific topics in your ME curriculum
- **Step-by-Step Problem Solver**: Comprehensive problem-solving with detailed explanations
- **File Upload & Analysis**: Upload lecture notes, videos, PDFs, and images for AI explanation
- **VT ME Curriculum Guide**: Complete guide to Virginia Tech's Mechanical Engineering program

### Subjects Covered
Based on Virginia Tech ME curriculum requirements:

**Mathematics & Sciences:**
- Calculus I, II, III
- Differential Equations
- Linear Algebra
- Physics I, II (Mechanics, Electromagnetics)
- Statistics

**Core Engineering:**
- Statics & Dynamics
- Thermodynamics
- Fluid Mechanics
- Heat and Mass Transfer
- Materials Engineering
- Controls Engineering
- Mechanical Design
- Vibrations

### Smart Features
- **Beginner-Friendly**: All explanations designed for mechanical engineering beginners
- **Step-by-Step Solutions**: Problems broken down into manageable steps with clear reasoning
- **Multi-Modal Learning**: Supports text, images, videos, and audio content analysis
- **Practice Problem Generator**: Creates custom practice problems based on your needs
- **Work Checker**: Reviews and provides feedback on your solutions

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key

### Installation

1. **Clone or download the project**
   ```bash
   # Navigate to the me-tutor directory
   cd me-tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**
   - Open the `.env` file
   - Replace `your_openai_api_key_here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and go to: `http://localhost:3000`

## 🎯 How to Use

### AI Tutor Chat
1. Select the "💬 AI Tutor Chat" tab
2. Choose a subject context (optional but recommended)
3. Type your question or problem
4. Get detailed, beginner-friendly explanations

**Example Questions:**
- "Can you explain Newton's second law with examples?"
- "How do I draw free body diagrams?"
- "What is the difference between heat and temperature?"
- "Walk me through solving a statics problem step by step"

### Subject Help
1. Click "📚 Subject Help" tab
2. Select a subject card (Statics, Thermodynamics, etc.)
3. Enter a specific topic
4. Choose your learning level
5. Get comprehensive topic explanations

### Problem Solver
1. Go to "🧮 Problem Solver" tab
2. Choose your mode:
   - **Solve Problem**: Get complete step-by-step solutions
   - **Check My Work**: Get feedback on your solutions
   - **Generate Practice Problems**: Create custom practice problems
   - **Calculator**: Perform calculations with explanations

### Upload & Analyze
1. Click "📄 Upload & Analyze" tab
2. Upload files: PDFs, images, videos, audio, or text files
3. The AI will extract and explain content
4. Perfect for analyzing lecture notes, homework problems, or educational videos

## 🎓 Virginia Tech ME Curriculum Integration

The AI tutor is specifically trained on Virginia Tech's Mechanical Engineering curriculum, including:

- **128 Total Credit Hours** across the full program
- **Core Requirements**: ME 2004, ME 3304, ME 3414, ME 3534, ME 3624, ME 4005
- **Major Requirements**: Thermodynamics, Design, Vibrations, Materials, and more
- **Technical Electives**: 15 credits with specific requirements
- **Career Bridge Experience**: Senior Design, Internships, Co-ops, Research

## 🧠 AI Knowledge Base

The AI tutor has access to:
- MIT OpenCourseWare materials for all subjects
- Engineering Statics textbook content
- Comprehensive thermodynamics and heat transfer resources
- Fluid mechanics and dynamics principles
- Materials science and engineering mechanics
- Control systems and vibrations theory
- Complete mathematical foundations

## 💡 Tips for Best Results

1. **Be Specific**: Instead of "help with statics," ask "explain how to solve beam equilibrium problems"
2. **Use Context**: Select the subject context to get more relevant explanations
3. **Ask for Examples**: Request real-world applications and practice problems
4. **Upload Materials**: Share your lecture notes or homework for personalized help
5. **Follow Up**: Ask clarifying questions if you need more detail on any step

## 🔧 Technical Details

### Backend Technologies
- Node.js with Express server
- OpenAI GPT-4 for AI tutoring
- Multer for file uploads
- PDF parsing and audio transcription
- Math.js for calculations

### Frontend Technologies
- Vanilla JavaScript for interactivity
- CSS Grid and Flexbox for responsive design
- KaTeX for mathematical equations
- File drag-and-drop interface

### File Support
- **Documents**: PDF, TXT, DOC, DOCX
- **Images**: JPG, PNG, GIF (with vision analysis)
- **Videos**: MP4, AVI, MOV (with audio transcription)
- **Audio**: MP3, WAV (with transcription)

## 🛠️ Troubleshooting

### Common Issues

**"Failed to get response from AI tutor"**
- Check that your OpenAI API key is correctly set in the `.env` file
- Ensure your API key has sufficient credits
- Verify your internet connection

**File upload not working**
- Check that your file is under 50MB
- Ensure the file format is supported
- Try refreshing the page and uploading again

**Server won't start**
- Make sure Node.js is installed (`node --version`)
- Run `npm install` to install dependencies
- Check if port 3000 is available

## 🎯 Study Strategies

### For Different Learning Styles
- **Visual Learners**: Upload diagrams and images for AI analysis
- **Auditory Learners**: Upload lecture recordings for transcription and explanation
- **Kinesthetic Learners**: Use the problem solver for hands-on practice
- **Reading/Writing Learners**: Use the chat feature for detailed written explanations

### Exam Preparation
1. Use the practice problem generator for each subject
2. Upload your study materials for AI analysis
3. Ask for summaries of key concepts
4. Practice with the work checker to identify weak areas

## 📈 Advanced Features

### Mathematical Support
- LaTeX rendering for equations
- Step-by-step algebraic manipulations
- Unit analysis and dimensional analysis
- Graphical descriptions of functions and relationships

### Engineering Applications
- Real-world problem contexts
- Industry applications and examples
- Design considerations and trade-offs
- Safety factors and engineering ethics

## 🤝 Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review your setup steps
3. Ensure all dependencies are properly installed

## 📄 License

This project is created for educational purposes to help Virginia Tech Mechanical Engineering students succeed in their studies.

---

**Happy Learning! 🎓**

Your AI tutor is here to help you master mechanical engineering concepts and succeed at Virginia Tech!