export const LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 
  'ar', 'hi', 'bn', 'vi', 'th', 'tr', 'nl', 'sv', 'id', 'pl'
];

export function validateSchema(data) {
  const errors = [];

  if (!data.date) errors.push("Missing 'date'");
  if (!data.message) errors.push("Missing 'message'");
  
  if (!data.translations || typeof data.translations !== 'object') {
    errors.push("Missing or invalid 'translations' object");
  } else {
    LANGUAGES.forEach(lang => {
      if (!data.translations[lang]) {
        errors.push(`Missing translation for '${lang}'`);
      }
    });
  }

  if (!data.theme || typeof data.theme !== 'object') {
    errors.push("Missing or invalid 'theme' object");
  } else {
    ['bg', 'fg', 'accent'].forEach(color => {
      if (!data.theme[color]) errors.push(`Missing theme color '${color}'`);
      else if (!/^#[0-9A-Fa-f]{6}$/.test(data.theme[color])) {
        errors.push(`Invalid hex color for '${color}': ${data.theme[color]}`);
      }
    });
  }

  if (!data.meta || typeof data.meta !== 'object') {
    errors.push("Missing 'meta' object");
  } else {
    if (!data.meta.model) errors.push("Missing 'meta.model'");
    if (!data.meta.generated_at_utc) errors.push("Missing 'meta.generated_at_utc'");
  }

  return errors;
}

export function extractJson(text) {
  // Try to find JSON between code fences
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    return JSON.parse(match[1]);
  }
  // Fallback: try to parse the whole text or look for first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return JSON.parse(text.substring(firstBrace, lastBrace + 1));
  }
  throw new Error("Could not extract JSON from response");
}
