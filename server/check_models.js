// server/check_models.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No API Key found in .env");
        return;
    }

    console.log("Using Key ending in:", key.slice(-4));
    const genAI = new GoogleGenerativeAI(key);

    try {
        // This is the equivalent of c.listGeminiModels() in your Go code
        // It asks Google what models are available for YOUR key
        const modelList = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; 
        
        // Use the raw fetch to get the list (SDK doesn't always have a clean 'list' method exposed easily)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Google Error:", data.error.message);
            return;
        }

        console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
        console.log("-----------------------------------");
        
        const preferred = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];
        
        data.models.forEach(m => {
            // Filter just like your Go app does!
            const name = m.name.replace("models/", "");
            const isSupported = m.supportedGenerationMethods.includes("generateContent");
            
            if (isSupported) {
                let status = "   ";
                if (preferred.includes(name)) status = "⭐ "; // Preferred
                console.log(`${status}${name}`);
            }
        });
        console.log("-----------------------------------");

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkModels();