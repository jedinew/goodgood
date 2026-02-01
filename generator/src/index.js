import process from 'node:process';
import path from 'node:path';
import { getTodayUTC } from './utils.js';
import { fileExists, saveDaily, updateIndex, updateLatest } from './storage.js';
import { generateContent } from './llm.js';
import { extractJson, validateSchema } from './validation.js';

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || process.env.FORCE === '1';
  
  const dataDir = process.env.DATA_DIR || './data';
  const provider = process.env.LLM_PROVIDER || 'openai';
  const dateStr = getTodayUTC();

  console.log(`[${new Date().toISOString()}] Starting generation for ${dateStr}`);
  console.log(`Data directory: ${dataDir}`);
  console.log(`Provider: ${provider}`);

  if (!force) {
    const exists = await fileExists(dataDir, dateStr);
    if (exists) {
      console.log(`File for ${dateStr} already exists. Skipping (use --force to overwrite).`);
      return;
    }
  }

  try {
    console.log("Generating content...");
    const { content, model } = await generateContent(provider, null, dateStr);
    
    console.log("Extracting JSON...");
    const data = extractJson(content);
    
    // Add metadata
    data.date = dateStr;
    data.meta = {
      model: `${provider}/${model}`,
      generated_at_utc: new Date().toISOString(),
      languages: Object.keys(data.translations)
    };

    console.log("Validating schema...");
    const errors = validateSchema(data);
    if (errors.length > 0) {
      console.error("Schema validation failed:", errors);
      process.exit(1);
    }

    console.log("Saving data...");
    await saveDaily(dataDir, dateStr, data);
    await updateIndex(dataDir, dateStr);
    await updateLatest(dataDir, dateStr);
    
    console.log("Success!");
  } catch (err) {
    console.error("Error during generation:", err);
    process.exit(1);
  }
}

main();
