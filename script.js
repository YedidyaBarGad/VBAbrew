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
    results.classList.add('hidden');
    loading.classList.remove('hidden');

    // System Prompt: Strictly enforces JSON format and English language
    const systemMessage = `
    You are an expert Excel VBA developer. 
    Your task is to convert user requests into VBA code.
    You MUST return the output in valid JSON format only, with no markdown formatting (like \`\`\`json) outside the structure.
    
    The JSON object must have exactly these 3 keys:
    1. "code": The VBA code itself (clean, indented, with comments).
    2. "explanation": A concise explanation in ENGLISH of how the code works.
    3. "limitations": A list in ENGLISH of any limitations, edge cases, security risks, or parts of the request that could not be fully implemented.
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile", // High performance model
                temperature: 0.2, // Lower temperature for more precise code
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || response.statusText);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        // Populate results
        document.getElementById('codeOutput').textContent = content.code;
        document.getElementById('explanationOutput').textContent = content.explanation;
        document.getElementById('limitationsOutput').textContent = content.limitations;

        loading.classList.add('hidden');
        results.classList.remove('hidden');

        // Scroll to results
        results.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        loading.classList.add('hidden');
    }
}

function copyCode() {
    const codeText = document.getElementById('codeOutput').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        alert("Code copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
