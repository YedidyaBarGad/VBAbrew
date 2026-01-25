// Conversation history for iterative feedback
let conversationHistory = [];
let lastGeneratedCode = null;

// ---------------------------------------------------------
// ENHANCED SYSTEM PROMPT - Clear and Precise
// ---------------------------------------------------------
const SYSTEM_PROMPT = `You are a VBA Code Generator for Microsoft Excel.

## YOUR TASK
Generate production-ready VBA code from the user's description.

## INPUT
The user will describe what they want an Excel macro to do in plain language.

## OUTPUT
Return a JSON object with exactly these 4 keys:

{
  "code": "...",
  "explanation": "...",
  "limitations": "...",
  "non_vba_alternative": "..."
}

### Key Details:

**code** (required)
- Complete, runnable VBA code
- Start with 'Option Explicit'
- Include error handling: On Error GoTo ErrorHandler
- Include performance optimization: Application.ScreenUpdating = False
- Use clear variable names (e.g., wsData, lastRow, targetRange)
- Include cleanup in a CleanExit block

**explanation** (required)
- 2-3 sentences explaining what the code does
- Mention key logic steps

**limitations** (required)
- List specific edge cases (e.g., "Fails if sheet is protected")
- Note any assumptions (e.g., "Assumes data starts in row 2")
- Warn about destructive operations

**non_vba_alternative** (required)
- If a built-in Excel feature works better (Power Query, XLOOKUP, Pivot Tables), explain it
- Otherwise write: "VBA is the optimal solution for this task."

## RULES
1. Return ONLY valid JSON - no markdown, no code blocks, no extra text
2. If the user provides feedback on previous code, incorporate their changes
3. Keep explanations concise but complete`;

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

    // Build messages array with conversation history
    const messages = [
        { role: "system", content: SYSTEM_PROMPT }
    ];

    // Add conversation history for context
    conversationHistory.forEach(msg => {
        messages.push(msg);
    });

    // Add current user message
    messages.push({ role: "user", content: prompt });

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
            const errData = await response.json();
            throw new Error(errData.error?.message || response.statusText);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        const content = JSON.parse(assistantMessage);

        // Store in conversation history for follow-up
        conversationHistory.push({ role: "user", content: prompt });
        conversationHistory.push({ role: "assistant", content: assistantMessage });
        lastGeneratedCode = content.code;

        // ---------------------------------------------------------
        // POPULATE UI
        // ---------------------------------------------------------

        // 1. The Code
        document.getElementById('codeOutput').textContent = content.code;

        // 2. The Explanation
        document.getElementById('explanationOutput').textContent = content.explanation;

        // 3. Limitations
        document.getElementById('limitationsOutput').textContent = content.limitations;

        // 4. Non-VBA Alternative
        const altOutput = document.getElementById('alternativeOutput');
        if (altOutput) {
            if (content.non_vba_alternative && content.non_vba_alternative.length > 20) {
                altOutput.parentElement.classList.remove('hidden');
                altOutput.textContent = content.non_vba_alternative;
            } else {
                altOutput.parentElement.classList.add('hidden');
            }
        }

        // Show feedback section
        showFeedbackSection();

        loading.classList.add('hidden');
        results.classList.remove('hidden');
        results.scrollIntoView({ behavior: 'smooth' });

        // Update prompt placeholder for feedback mode
        updatePromptForFeedback();

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
    promptArea.placeholder = 'Tell me what to change... (e.g., "Add a progress bar", "Make it work with multiple sheets", "Change the output format to...")';
}

function startNewConversation() {
    // Reset conversation history
    conversationHistory = [];
    lastGeneratedCode = null;

    // Reset UI
    document.getElementById('userPrompt').value = '';
    document.getElementById('userPrompt').placeholder = "e.g., Create a button that deletes empty rows in the active sheet and highlights duplicates in column A in red...";
    document.getElementById('results').classList.add('hidden');

    const feedbackSection = document.getElementById('feedbackSection');
    if (feedbackSection) {
        feedbackSection.classList.add('hidden');
    }

    // Scroll to top
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
