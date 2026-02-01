import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateSchema, extractJson } from '../src/validation.js';

describe('Validation', () => {
  test('validateSchema should pass for valid data', () => {
    const validData = {
      date: '2026-02-01',
      message: 'Hello',
      translations: {
        en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao',
        pt: 'Olá', ru: 'Привет', zh: '你好', ja: 'こんにちは', ko: '안녕하세요',
        ar: 'مرحبا', hi: 'नमस्ते', bn: 'হ্যালো', vi: 'Xin chào', th: 'สวัสดี',
        tr: 'Merhaba', nl: 'Hallo', sv: 'Hej', id: 'Halo', pl: 'Cześć'
      },
      theme: { bg: '#ffffff', fg: '#000000', accent: '#ff0000' },
      meta: { model: 'test', generated_at_utc: '2026-02-01T00:00:00Z' }
    };
    const errors = validateSchema(validData);
    assert.deepStrictEqual(errors, []);
  });

  test('validateSchema should fail for missing fields', () => {
    const invalidData = {
      message: 'Hello'
    };
    const errors = validateSchema(invalidData);
    assert.ok(errors.length > 0);
    assert.ok(errors.includes("Missing 'date'"));
  });

  test('extractJson should extract from code fences', () => {
    const text = 'Here is the JSON:\n```json\n{"foo":"bar"}\n```';
    const json = extractJson(text);
    assert.deepStrictEqual(json, { foo: 'bar' });
  });

  test('extractJson should extract from raw json', () => {
    const text = 'Some text {"foo":"bar"} more text';
    const json = extractJson(text);
    assert.deepStrictEqual(json, { foo: 'bar' });
  });
});
