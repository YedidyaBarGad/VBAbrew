// API Configuration
// API Configuration
// API Configuration
const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

const API_URL = isLocal ? 'http://localhost:3001/api' : '/api';
console.log(`Using API URL: ${API_URL}`);

// State
let conversationHistory = [];
let lastGeneratedCode = null;
let currentChatId = null;
let authToken = localStorage.getItem('vbabrew_token');
let currentUser = null;

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    if (authToken) {
        await checkAuth();
    }
    updateUIState();
});

// ---------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            loadUserChats();
        } else {
            logout(); // Token expired or invalid
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const errorMsg = document.getElementById('regError');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        let data;
        const text = await response.text();

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            // Not JSON
            if (!response.ok) throw new Error(text || `Error ${response.status}`);
            throw new Error("Invalid server response (not JSON)");
        }

        if (!response.ok) throw new Error(data.error || 'Registration failed');

        loginSuccess(data.token, data.user);
        closeAuthModal();
        alert('Registration successful! You are now logged in.');
    } catch (error) {
        errorMsg.textContent = error.message;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        let data;
        const text = await response.text();

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            // Not JSON
            if (!response.ok) throw new Error(text || `Error ${response.status}`);
            throw new Error("Invalid server response (not JSON)");
        }

        if (!response.ok) throw new Error(data.error || 'Login failed');

        loginSuccess(data.token, data.user);
        closeAuthModal();
    } catch (error) {
        errorMsg.textContent = error.message;
    }
}

function loginSuccess(token, user) {
    authToken = token;
    currentUser = user;
    localStorage.setItem('vbabrew_token', token);
    updateUIState();
    loadUserChats();
}

function logout() {
    authToken = null;
    currentUser = null;
    currentChatId = null;
    localStorage.removeItem('vbabrew_token');
    conversationHistory = [];
    updateUIState();
}

function updateUIState() {
    const userBar = document.getElementById('userBar');
    const authBtn = document.getElementById('authBtn');
    const welcomeMsg = document.getElementById('welcomeMsg');
    const chatSidebar = document.getElementById('chatSidebar');

    if (currentUser) {
        userBar.classList.remove('hidden');
        authBtn.classList.add('hidden');
        welcomeMsg.textContent = `Welcome, ${currentUser.username}!`;
        chatSidebar.classList.remove('hidden');
    } else {
        userBar.classList.add('hidden');
        authBtn.classList.remove('hidden');
        chatSidebar.classList.add('hidden');
    }
}

// ---------------------------------------------------------
// UI MODAL HELPERS
// ---------------------------------------------------------

function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('registerForm');
    const btns = document.querySelectorAll('.tab-btn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}

// ---------------------------------------------------------
// CHAT MANAGEMENT
// ---------------------------------------------------------

async function loadUserChats() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/chats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        renderChatList(data.chats);
    } catch (error) {
        console.error('Failed to load chats:', error);
    }
}

function renderChatList(chats) {
    const list = document.getElementById('chatList');
    list.innerHTML = '';

    chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = `chat-item ${chat._id === currentChatId ? 'active' : ''}`;
        div.innerHTML = `
            <div>${chat.title}</div>
            <span class="chat-date">${new Date(chat.updatedAt).toLocaleDateString()}</span>
        `;
        div.onclick = () => loadChat(chat._id);
        list.appendChild(div);
    });
}

async function loadChat(chatId) {
    try {
        const response = await fetch(`${API_URL}/chats/${chatId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        currentChatId = data.chat._id;
        conversationHistory = data.chat.conversationHistory;

        // Restore last code if available (simplified for now)
        if (data.chat.lastGeneratedCode) {
            document.getElementById('codeOutput').textContent = data.chat.lastGeneratedCode;
            document.getElementById('results').classList.remove('hidden');
        }

        // Refresh list to show active state
        loadUserChats();

    } catch (error) {
        console.error('Failed to load chat:', error);
    }
}

async function saveCurrentChat(title) {
    if (!currentUser) return; // Only save if logged in

    const chatData = {
        title: title,
        conversationHistory: conversationHistory,
        lastGeneratedCode: lastGeneratedCode
    };

    try {
        let url = `${API_URL}/chats`;
        let method = 'POST';

        // Update existing if we have an ID
        if (currentChatId) {
            url += `/${currentChatId}`;
            method = 'PUT';
            // We don't necessarily update title on every edit, keeping original title for now
            // or we could update it. Let's just update history.
            delete chatData.title;
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatData)
        });

        const data = await response.json();
        if (method === 'POST') {
            currentChatId = data.chat._id;
        }

        loadUserChats(); // Refresh sidebar

    } catch (error) {
        console.error('Failed to save chat:', error);
    }
}

// ---------------------------------------------------------
// MAIN GENERATION LOGIC (Refactored)
// ---------------------------------------------------------

const SYSTEM_PROMPT = `You are a VBA Code Generator for Microsoft Excel.
## YOUR TASK
Generate production-ready VBA code from the user's description.
## OUTPUT
Return a JSON object with exactly these 4 keys:
{
  "code": "...",
  "explanation": "...",
  "limitations": "...",
  "non_vba_alternative": "..."
}
## RULES
1. Return ONLY valid JSON - no markdown, no code blocks
2. Include error handling and performance optimization in code
`;

async function generateVBA() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const prompt = document.getElementById('userPrompt').value.trim();
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    if (!apiKey) {
        alert("Please enter a valid Groq API Key.");
        return;
    }
    if (!prompt) {
        alert("Please describe what you want the Excel macro to do.");
        return;
    }

    // Reset UI
    loading.classList.remove('hidden');
    document.getElementById('generateBtn').disabled = true;

    // Prepare Messages
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: "user", content: prompt }
    ];

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorMessage = response.statusText;

            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errData = await response.json();
                errorMessage = errData.error?.message || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || `Error ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        const content = JSON.parse(assistantMessage);

        // Update History
        conversationHistory.push({ role: "user", content: prompt });
        conversationHistory.push({ role: "assistant", content: assistantMessage });
        lastGeneratedCode = content.code;

        // --- NEW: Save Chat to Backend ---
        if (currentUser) {
            // If it's a new chat, use the prompt as title
            const title = currentChatId ? null : (prompt.substring(0, 30) + "...");
            await saveCurrentChat(title);
        }
        // --------------------------------

        // Render Results
        document.getElementById('codeOutput').textContent = content.code;
        document.getElementById('explanationOutput').textContent = content.explanation;
        document.getElementById('limitationsOutput').textContent = content.limitations;

        const altOutput = document.getElementById('alternativeOutput');
        if (altOutput) {
            if (content.non_vba_alternative && content.non_vba_alternative.length > 20) {
                altOutput.parentElement.classList.remove('hidden');
                altOutput.textContent = content.non_vba_alternative;
            } else {
                altOutput.parentElement.classList.add('hidden');
            }
        }

        showFeedbackSection();
        updatePromptForFeedback();

        loading.classList.add('hidden');
        results.classList.remove('hidden');
        results.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        loading.classList.add('hidden');
    } finally {
        document.getElementById('generateBtn').disabled = false;
    }
}

function showFeedbackSection() {
    const feedbackSection = document.getElementById('feedbackSection');
    if (feedbackSection) {
        feedbackSection.classList.remove('hidden');
    }
}

function updatePromptForFeedback() {
    const promptArea = document.getElementById('userPrompt');
    promptArea.value = '';
    promptArea.placeholder = 'Tell me what to change... (e.g., "Add a progress bar", "Make it work with multiple sheets")';
}

function startNewConversation() {
    conversationHistory = [];
    lastGeneratedCode = null;
    currentChatId = null; // Important: Clear ID so we create new

    document.getElementById('userPrompt').value = '';
    document.getElementById('userPrompt').placeholder = "e.g., Create a button that deletes empty rows...";
    document.getElementById('results').classList.add('hidden');

    const feedbackSection = document.getElementById('feedbackSection');
    if (feedbackSection) feedbackSection.classList.add('hidden');

    // Deselect chat in sidebar
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyCode() {
    const code = document.getElementById('codeOutput').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = originalText; }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}
