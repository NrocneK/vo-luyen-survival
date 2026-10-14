import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const totals = new Map(), issues = [];
const patterns = [/github_pat_[A-Za-z0-9_]{20,}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /sk-[A-Za-z0-9_-]{32,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
for (const file of files) {
  const size = statSync(file).size, folder = file.split('/')[0];
  const group = totals.get(folder) ?? { count: 0, bytes: 0 }; group.count++; group.bytes += size; totals.set(folder, group);
  if (size > 50 * 1024 * 1024) issues.push({ file, issue: 'file lớn hơn 50 MB' });
  if (/(?:^|\/)(?:\.env(?:\..*)?|id_rsa|credentials(?:\..*)?)$/.test(file) && !file.endsWith('.example')) issues.push({ file, issue: 'tên file cấu hình riêng' });
  if (/\.(?:ts|tsx|js|mjs|py|json|md|ya?ml|toml|txt)$/.test(file) && size < 5 * 1024 * 1024) {
    const text = readFileSync(file, 'utf8'); if (patterns.some(pattern => pattern.test(text))) issues.push({ file, issue: 'chuỗi giống thông tin xác thực, cần kiểm tra' });
  }
}
console.log(JSON.stringify({ files: files.length, folders: [...totals].map(([folder, group]) => ({ folder, files: group.count, mb: +(group.bytes / 1024 / 1024).toFixed(2) })), issues }, null, 2));
if (issues.length) process.exitCode = 1;
