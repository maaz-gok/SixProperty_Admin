import { existsSync, renameSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const archiveDir = join(root, 'reports-archive');
const dirs = ['playwright-report', 'allure-results', 'allure-report'];

mkdirSync(archiveDir, { recursive: true });

for (const dir of dirs) {
  const src = join(root, dir);
  if (existsSync(src)) {  
    const dest = join(archiveDir, `${dir}-${ts}`);
    renameSync(src, dest);
    console.log(`Archived ${dir}/ → reports-archive/${dir}-${ts}/`);
  }
}
