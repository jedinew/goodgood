import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { updateIndex, updateLatest, saveDaily } from '../src/storage.js';

const TEST_DIR = './test-data';

describe('Storage', () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  test('updateIndex should add date and sort', async () => {
    await updateIndex(TEST_DIR, '2026-02-02');
    await updateIndex(TEST_DIR, '2026-02-01');

    const content = await fs.readFile(path.join(TEST_DIR, 'index.json'), 'utf8');
    const index = JSON.parse(content);
    
    assert.deepStrictEqual(index.dates, ['2026-02-01', '2026-02-02']);
  });

  test('updateLatest should update date', async () => {
    await updateLatest(TEST_DIR, '2026-02-01');
    
    const content = await fs.readFile(path.join(TEST_DIR, 'latest.json'), 'utf8');
    const latest = JSON.parse(content);
    
    assert.strictEqual(latest.date, '2026-02-01');
  });

  test('saveDaily should write file', async () => {
    const data = { foo: 'bar' };
    await saveDaily(TEST_DIR, '2026-02-01', data);
    
    const content = await fs.readFile(path.join(TEST_DIR, 'daily', '2026-02-01.json'), 'utf8');
    const saved = JSON.parse(content);
    
    assert.deepStrictEqual(saved, data);
  });
});
