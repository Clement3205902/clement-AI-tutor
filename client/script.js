// Global variables
let currentTab = 'chat';
let isProcessing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeChat();
});

// Event Listeners
function initializeEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Chat functionality
    document.getElementById('sendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Subject help
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', (e) => selectSubject(e.currentTarget.dataset.subject));
    });
    document.getElementById('getHelpBtn').addEventListener('click', getSubjectHelp);

    // Problem solver
    document.querySelectorAll('.solver-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchSolverMode(e.target.dataset.mode));
    });
    document.getElementById('solveBtn').addEventListener('click', solveProblem);
    document.getElementById('checkBtn').addEventListener('click', checkWork);
    document.getElementById('generateBtn').addEventListener('click', generateProblems);
    document.getElementById('calculateBtn').addEventListener('click', performCalculation);

    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeUploadedFile);
}

// Tab Management
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    currentTab = tabName;
}

// Chat Functionality
function initializeChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const contextSelect = document.getElementById('contextSelect');
    const message = input.value.trim();
    
    if (!message || isProcessing) return;

    const context = contextSelect.value;
    
    // Add user message to chat
    addMessageToChat('user', message);
    input.value = '';
    
    // Show processing state
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/tutor/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message, 
                context,
                subject: context 
            })
        });

        if (!response.ok) throw new Error('Failed to get response');

        const data = await response.json();
        addMessageToChat('assistant', data.response);
        
    } catch (error) {
        addMessageToChat('assistant', 'Sorry, I encountered an error. Please make sure you have set up your OpenAI API key in the .env file and try again.');
        console.error('Chat error:', error);
    } finally {
        setProcessingState(false);
    }
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (sender === 'assistant') {
        // Process markdown and math in assistant messages
        contentDiv.innerHTML = `<strong>ME AI Tutor:</strong> ${processMessageContent(message)}`;
    } else {
        contentDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(message)}`;
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processMessageContent(content) {
    // Basic markdown processing
    content = escapeHtml(content);
    
    // Process code blocks
    content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Process inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Process bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Process lists
    content = content.replace(/^\* (.+)$/gm, '<li>$1</li>');
    content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Process line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Subject Help
function selectSubject(subject) {
    document.getElementById('selectedSubject').textContent = subject;
    document.querySelector('.topic-input-section').style.display = 'block';
    document.querySelector('.topic-input-section').scrollIntoView({ behavior: 'smooth' });
}

async function getSubjectHelp() {
    const subject = document.getElementById('selectedSubject').textContent;
    const topic = document.getElementById('topicInput').value.trim();
    const level = document.getElementById('levelSelect').value;
    
    if (!subject || !topic) return;
    
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/tutor/subject-help', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, topic, level })
        });

        if (!response.ok) throw new Error('Failed to get help');

        const data = await response.json();
        document.getElementById('subjectResponse').innerHTML = `
            <h3>${subject}: ${topic}</h3>
            <div>${processMessageContent(data.response)}</div>
        `;
        
    } catch (error) {
        document.getElementById('subjectResponse').innerHTML = `
            <div class="error">Error getting help: ${error.message}</div>
        `;
    } finally {
        setProcessingState(false);
    }
}

// Problem Solver
function switchSolverMode(mode) {
    // Update buttons
    document.querySelectorAll('.solver-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update modes
    document.querySelectorAll('.solver-mode').forEach(modeDiv => {
        modeDiv.classList.toggle('active', modeDiv.id === `${mode}-mode`);
    });
}

async function solveProblem() {
    const problem = document.getElementById('problemInput').value.trim();
    const subject = document.getElementById('problemSubject').value;
    
    if (!problem) return;
    
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/solve/solve-problem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problem, subject })
        });

        if (!response.ok) throw new Error('Failed to solve problem');

        const data = await response.json();
        document.getElementById('solutionResponse').innerHTML = `
            <h3>Solution</h3>
            <div>${processMessageContent(data.solution)}</div>
        `;
        
    } catch (error) {
        document.getElementById('solutionResponse').innerHTML = `
            <div class="error">Error solving problem: ${error.message}</div>
        `;
    } finally {
        setProcessingState(false);
    }
}

async function checkWork() {
    const problem = document.getElementById('originalProblem').value.trim();
    const solution = document.getElementById('studentSolution').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value.trim();
    
    if (!problem || !solution) return;
    
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/solve/check-work', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problem, studentSolution: solution, correctAnswer })
        });

        if (!response.ok) throw new Error('Failed to check work');

        const data = await response.json();
        document.getElementById('checkResponse').innerHTML = `
            <h3>Feedback on Your Work</h3>
            <div>${processMessageContent(data.feedback)}</div>
        `;
        
    } catch (error) {
        document.getElementById('checkResponse').innerHTML = `
            <div class="error">Error checking work: ${error.message}</div>
        `;
    } finally {
        setProcessingState(false);
    }
}

async function generateProblems() {
    const subject = document.getElementById('genSubject').value;
    const topic = document.getElementById('genTopic').value.trim();
    const difficulty = document.getElementById('genDifficulty').value;
    const count = document.getElementById('genCount').value;
    
    if (!subject || !topic) return;
    
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/solve/generate-problems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, topic, difficulty, count })
        });

        if (!response.ok) throw new Error('Failed to generate problems');

        const data = await response.json();
        document.getElementById('generateResponse').innerHTML = `
            <h3>Practice Problems: ${subject} - ${topic}</h3>
            <div>${processMessageContent(data.problems)}</div>
        `;
        
    } catch (error) {
        document.getElementById('generateResponse').innerHTML = `
            <div class="error">Error generating problems: ${error.message}</div>
        `;
    } finally {
        setProcessingState(false);
    }
}

async function performCalculation() {
    const expression = document.getElementById('mathExpression').value.trim();
    const context = document.getElementById('calcContext').value.trim();
    
    if (!expression) return;
    
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/solve/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression, context })
        });

        if (!response.ok) throw new Error('Failed to perform calculation');

        const data = await response.json();
        document.getElementById('calcResponse').innerHTML = `
            <h3>Calculation Result</h3>
            <p><strong>Expression:</strong> ${escapeHtml(data.expression)}</p>
            <p><strong>Result:</strong> ${data.result}</p>
            <div><strong>Explanation:</strong><br>${processMessageContent(data.explanation)}</div>
        `;
        
    } catch (error) {
        document.getElementById('calcResponse').innerHTML = `
            <div class="error">Error performing calculation: ${error.message}</div>
        `;
    } finally {
        setProcessingState(false);
    }
}

// File Upload Functionality
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    setProcessingState(true);
    updateUploadStatus('Uploading and processing file...', 'info');
    
    try {
        const response = await fetch('/api/upload/file', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload file');

        const data = await response.json();
        
        // Show file info and processing options
        updateUploadStatus(`File processed successfully: ${data.filename}`, 'success');
        document.querySelector('.upload-options').style.display = 'block';
        
        // Store extracted content for analysis
        window.uploadedContent = {
            content: data.extractedContent,
            contentType: data.contentType,
            filename: data.filename
        };
        
    } catch (error) {
        updateUploadStatus(`Error uploading file: ${error.message}`, 'error');
    } finally {
        setProcessingState(false);
    }
}

async function analyzeUploadedFile() {
    if (!window.uploadedContent) return;
    
    const subject = document.getElementById('fileSubject').value;
    const context = document.getElementById('fileContext').value;
    
    setProcessingState(true);
    
    try {
        const response = await fetch('/api/upload/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: window.uploadedContent.content,
                contentType: window.uploadedContent.contentType,
                subject,
                context
            })
        });

        if (!response.ok) throw new Error('Failed to analyze content');

        const data = await response.json();
        document.getElementById('fileAnalysis').innerHTML = `
            <h3>Analysis: ${window.uploadedContent.filename}</h3>
            <div>${processMessageContent(data.explanation)}</div>
        `;
        
    } catch (error) {
        document.getElementById('fileAnalysis').innerHTML = `
            <div class="error">Error analyzing file: ${error.message}</div>
        `;
    } finally {
        setProcessingState(false);
    }
}

// Utility Functions
function setProcessingState(processing) {
    isProcessing = processing;
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = processing ? 'flex' : 'none';
    
    // Disable/enable relevant buttons
    const buttons = document.querySelectorAll('.send-btn, .action-btn, .help-btn');
    buttons.forEach(btn => {
        btn.disabled = processing;
    });
}

function updateUploadStatus(message, type) {
    const statusContainer = document.getElementById('uploadStatus');
    statusContainer.textContent = message;
    statusContainer.className = `status-container ${type}`;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Resize textarea automatically
document.addEventListener('input', function(e) {
    if (e.target.tagName === 'TEXTAREA') {
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    }
});