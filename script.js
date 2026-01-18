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

    // ---------------------------------------------------------
    // ENHANCED SYSTEM PROMPT
    // ---------------------------------------------------------
    const systemMessage = `
    You are a Senior Excel Solutions Architect and VBA Expert.
    
    YOUR GOAL:
    Convert the user's natural language request into robust, enterprise-grade VBA code, while also analyzing if a modern Excel feature would be a better solution.

    STRICT OUTPUT FORMAT:
    Return ONLY a valid JSON object. Do not wrap in markdown blocks (no \`\`\`json).
    The JSON must contain exactly these 4 keys:
    
    1. "code": string 
       - The VBA code.
       - MUST include 'Option Explicit' at the top.
       - MUST include standard Error Handling (On Error GoTo ErrorHandler).
       - MUST include 'Application.ScreenUpdating = False' optimizations where applicable, and ensure they are reset in a 'CleanExit' block.
       - Use descriptive variable names (e.g., 'wsSource' instead of 'ws').
       
    2. "explanation": string
       - A concise, professional explanation of the logic flow.
       
    3. "limitations": string
       - Specific edge cases (e.g., "Will fail if sheets are protected"), security warnings, or hard-coded assumptions made.
       
    4. "non_vba_alternative": string
       - CRITICAL: Analyze the request. If this task is better solved using Power Query (Get & Transform), Dynamic Array Formulas (FILTER, UNIQUE, XLOOKUP), or Pivot Tables, explain that solution here. 
       - If VBA is strictly the best tool, write "VBA is the optimal solution for this specific complexity."
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
                // Using the larger model for better logic reasoning
                model: "llama-3.3-70b-versatile", 
                temperature: 0.1, // Very low temp for deterministic code
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || response.statusText);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        // ---------------------------------------------------------
        // POPULATE UI
        // ---------------------------------------------------------
        
        // 1. The Code
        document.getElementById('codeOutput').textContent = content.code;
        
        // 2. The Explanation
        document.getElementById('explanationOutput').textContent = content.explanation;
        
        // 3. Limitations (Bullet points style)
        document.getElementById('limitationsOutput').textContent = content.limitations;

        // 4. Non-VBA Alternative (New Field)
        // Ensure you have an element with id="alternativeOutput" in your HTML
        const altOutput = document.getElementById('alternativeOutput');
        if (altOutput) {
            if (content.non_vba_alternative && content.non_vba_alternative.length > 20) {
                 altOutput.parentElement.classList.remove('hidden'); // Show container if hidden
                 altOutput.textContent = content.non_vba_alternative;
            } else {
                 altOutput.parentElement.classList.add('hidden'); // Hide if not relevant
            }
        }

        loading.classList.add('hidden');
        results.classList.remove('hidden');

        results.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        loading.classList.add('hidden');
    }
}
