const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Ollama API endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { model, prompt } = req.body;
    
    console.log('Ollama request:', { model, prompt });
    
    // Choose your Ollama endpoint:
    // Local: 'http://localhost:11434/api/generate'
    // Cloud examples (uncomment the one you want to use):
    
    // Option 1: Ollama Cloud (official) - NOW ACTIVE
    const ollamaEndpoint = 'https://api.ollama.com/v1/chat/completions';
    
    // Option 2: Groq (fast inference) - RECOMMENDED
    // const ollamaEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    
    // For Groq, you'd need to update the request format:
    /*
    const ollamaResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer gsk_YOUR_GROQ_API_KEY_HERE',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Groq model names
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });
    */
    
    // Option 3: Together.ai
    // const ollamaEndpoint = 'https://api.together.xyz/v1/chat/completions';
    
    // Option 4: Replicate
    // const ollamaEndpoint = 'https://api.replicate.com/v1/models/meta/meta-llama-3.1-8b-instruct/predictions';
    
    const ollamaResponse = await fetch(ollamaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1b0fc972a9d64f1e9f0675c9503526b3.0T4fWH0Dbp6r3oDOAAJq1fha',
      },
      body: JSON.stringify({
        model: model || 'llama3.2:3b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });
    
    const data = await ollamaResponse.json();
    
    console.log('Ollama response:', data);
    
    // For Ollama Cloud, response format is different
    // Cloud API returns: { choices: [{ message: { content: "..." } }] }
    const reflection = {
      summary: data.choices?.[0]?.message?.content || data.response || "Here's a thoughtful reflection on your belief.",
      clarifying_questions: [], // No longer extracting questions since response is natural paragraph
      assumptions_noticed: "" // No longer extracting assumptions since response is natural paragraph
    };
    
    res.json(reflection);
    
  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ 
      error: 'Failed to generate reflection',
      details: error.message 
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Ollama proxy server running on port ${PORT}`);
});
