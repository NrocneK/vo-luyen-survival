// Chuẩn hóa xuống dòng cho stylesheet sau khi dựng UI, giúp sửa CSS dễ hơn.
import { readFile, writeFile } from 'node:fs/promises';
const path = 'src/ui/styles.css';
const source = (await readFile(path, 'utf8')).replaceAll("'Noto Serif'", "'Noto Serif Variable'");
let depth = 0;
const lines = source.replace(/([{};])/g, token => token + '\n').split('\n').map(line => line.trim()).filter(Boolean);
const formatted = lines.map(line => {
  if (line.startsWith('}')) depth = Math.max(0, depth - 1);
  const value = '  '.repeat(depth) + line;
  if (line.endsWith('{')) depth++;
  return value;
}).join('\n') + '\n';
await writeFile(path, formatted);
console.log('CSS đã định dạng.');
