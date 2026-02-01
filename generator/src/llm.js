import { LANGUAGES } from './validation.js';

const SYSTEM_PROMPT = `You are a helpful assistant that generates uplifting, culture-neutral daily messages.
You must output strictly valid JSON.
The schema is:
{
  "message": "The uplifting message in English",
  "translations": {
    "en": "...",
    "es": "...",
    ... (all 20 languages)
  },
  "theme": {
    "bg": "#RRGGBB",
    "fg": "#RRGGBB",
    "accent": "#RRGGBB"
  }
}
The 20 languages are: ${LANGUAGES.join(', ')}.
The theme should be pleasing and vary daily.
Do not include any text outside the JSON.
`;

export async function generateContent(provider, model, dateStr) {
  const prompt = `Generate the daily message for ${dateStr}.`;

  if (provider === 'openai') {
    return callOpenAI(model || 'gpt-5.2', prompt);
  } else if (provider === 'anthropic') {
    return callAnthropic(model || 'claude-sonnet-4-5', prompt);
  } else if (provider === 'gemini') {
    return callGemini(model || 'gemini-2.5-flash', prompt);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

async function callOpenAI(model, prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model
  };
}

async function callAnthropic(model, prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing");

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    model: data.model
  };
}

async function callGemini(model, prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  // Gemini structure: candidates[0].content.parts[0].text
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Gemini response missing candidates/content");
  }

  return {
    content: data.candidates[0].content.parts[0].text,
    model: model // Gemini API doesn't always echo back the exact model version in the same way, so return requested
  };
}
