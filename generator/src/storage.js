import fs from 'node:fs/promises';
import path from 'node:path';

export async function saveDaily(dataDir, dateStr, data) {
  const dailyDir = path.join(dataDir, 'daily');
  await fs.mkdir(dailyDir, { recursive: true });

  const filePath = path.join(dailyDir, `${dateStr}.json`);
  const tempPath = `${filePath}.tmp`;

  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
}

export async function updateIndex(dataDir, dateStr) {
  const indexPath = path.join(dataDir, 'index.json');
  let index = { dates: [] };

  try {
    const content = await fs.readFile(indexPath, 'utf8');
    index = JSON.parse(content);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  if (!index.dates.includes(dateStr)) {
    index.dates.push(dateStr);
    index.dates.sort();
    
    const tempPath = `${indexPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(index, null, 2), 'utf8');
    await fs.rename(tempPath, indexPath);
  }
}

export async function updateLatest(dataDir, dateStr) {
  const latestPath = path.join(dataDir, 'latest.json');
  const data = { date: dateStr };
  
  const tempPath = `${latestPath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempPath, latestPath);
}

export async function fileExists(dataDir, dateStr) {
  const filePath = path.join(dataDir, 'daily', `${dateStr}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
