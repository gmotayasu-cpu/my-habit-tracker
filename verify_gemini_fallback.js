
const apiKey = "AIzaSyAaYVOaJoeqncW76lipDtHsPclkTYTz8ME";
// Trying a known working model
const model = "gemini-1.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

async function testGemini() {
    console.log(`Testing Gemini API with model: ${model}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, tell me a joke." }] }]
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();

        if (!response.ok) {
            console.error("Error response:", JSON.stringify(data, null, 2));
        } else {
            console.log("Success! Response:", data.candidates[0].content.parts[0].text);
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}

testGemini();
