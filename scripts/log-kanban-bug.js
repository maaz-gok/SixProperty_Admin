import { readFile, readdir } from 'fs/promises';
import path from 'path';

const apiBase = process.env.KANBAN_BASE_URL || 'https://pm-gok-release.onrender.com';
const loginEmail = process.env.KANBAN_EMAIL;
const loginPassword = process.env.KANBAN_PASSWORD;
const projectId = process.env.KANBAN_PROJECT_ID;
const assigneeFeId = process.env.KANBAN_ASSIGNEE_FE;
const assigneeBeId = process.env.KANBAN_ASSIGNEE_BE;
const bugFilePath = process.argv[2];
const attachmentPaths = process.argv.slice(3);

const FE_KEYWORDS = [
  'frontend', 'front-end', 'front end', 'ui bug', 'ui/ux', 'button', 'css', 'layout',
  'responsive', 'component', 'render', 'screen', 'client-side', 'browser', 'style', 'dropdown',
  'modal', 'form field', 'checkbox', 'alignment', 'overlapping', 'not clickable',
];
const BE_KEYWORDS = [
  'backend', 'back-end', 'back end', 'api', 'endpoint', 'server', 'database', 'query',
  '500 error', '502', '503', 'timeout', 'server-side', 'auth token', 'schema', 'null pointer',
  'stack trace', 'exception', 'payload', 'response status',
];

function detectAssignee(text) {
  const haystack = text.toLowerCase();
  const feHits = FE_KEYWORDS.filter(k => haystack.includes(k)).length;
  const beHits = BE_KEYWORDS.filter(k => haystack.includes(k)).length;

  if (feHits === 0 && beHits === 0) return { key: null, feHits, beHits };
  if (feHits === beHits) return { key: null, feHits, beHits };
  return { key: feHits > beHits ? 'fe' : 'be', feHits, beHits };
}

const VALID_TASK_TYPES = ['Bug', 'Task'];
const taskType = process.env.KANBAN_TYPE || 'Bug';

if (!loginEmail || !loginPassword) {
  throw new Error('KANBAN_EMAIL and KANBAN_PASSWORD environment variables are required.');
}
if (!bugFilePath) {
  throw new Error('Usage: node scripts/log-kanban-bug.js <path-to-bug-file> [attachment ...]');
}
if (!VALID_TASK_TYPES.includes(taskType)) {
  throw new Error(`KANBAN_TYPE must be one of: ${VALID_TASK_TYPES.join(', ')} (got "${taskType}"). The board only supports these two types.`);
}

const authUrl = `${apiBase}/auth/login`;
const projectsUrl = `${apiBase}/api/projects/my-projects`;
const tasksUrl = `${apiBase}/api/tasks`;

const log = (...args) => console.log('[kanban-bug]', ...args);

async function login() {
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://gok-pm-tool.vercel.app',
      Referer: 'https://gok-pm-tool.vercel.app/',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Login failed: ${response.status} ${response.statusText} - ${body}`);
  }

  return await response.json();
}

async function getProjectId(token) {
  if (projectId) {
    log('Using configured projectId:', projectId);
    return projectId;
  }

  const response = await fetch(projectsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: 'https://gok-pm-tool.vercel.app',
      Referer: 'https://gok-pm-tool.vercel.app/',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetching projects failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('No projects returned from projects endpoint.');
  }

  return data[0]?.id || data[0]?._id;
}

async function createTask(token, payload) {
  const response = await fetch(tasksUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: 'https://gok-pm-tool.vercel.app',
      Referer: 'https://gok-pm-tool.vercel.app/',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Create task failed: ${response.status} ${response.statusText}\n${body}`);
  }

  return JSON.parse(body);
}

async function uploadAttachment(token, taskId, filePath) {
  const buffer = await readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([buffer]), filePath.split('/').pop());

  const response = await fetch(`${apiBase}/api/tasks/${taskId}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: 'https://gok-pm-tool.vercel.app',
      Referer: 'https://gok-pm-tool.vercel.app/',
      'User-Agent': 'Mozilla/5.0',
    },
    body: form,
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Upload attachment failed: ${response.status} ${response.statusText}\n${body}`);
  }

  return JSON.parse(body);
}

function extractTaskId(created) {
  return (
    created?._id ||
    created?.id ||
    created?.data?._id ||
    created?.data?.id ||
    created?.task?._id ||
    created?.task?.id
  );
}

async function findTaskByTitle(token, projectId, title) {
  const url = `${tasksUrl}?projectId=${encodeURIComponent(projectId)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Origin: 'https://gok-pm-tool.vercel.app',
      Referer: 'https://gok-pm-tool.vercel.app/',
      'User-Agent': 'Mozilla/5.0',
    },
  });
  if (!response.ok) {
    throw new Error(`Fetching tasks failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const tasks = Array.isArray(data) ? data : data.data || data.tasks || [];
  return tasks.find(t => t.title === title);
}

async function updateTask(token, taskId, fields) {
  const response = await fetch(`${tasksUrl}/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Origin: 'https://gok-pm-tool.vercel.app',
      Referer: 'https://gok-pm-tool.vercel.app/',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify(fields),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Update task failed: ${response.status} ${response.statusText}\n${body}`);
  }

  return JSON.parse(body);
}

function normalizeDescription(text) {
  const normalized = text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // The Kanban tool renders the description as HTML (existing tasks store
  // <h3>/<p> tags), so emit real markup: bold section labels, an <ol> for
  // numbered steps, a <ul> for bullet points, <code> for backtick spans,
  // and <pre><code> for fenced code blocks (indentation/blank lines kept
  // as-is inside a fence — everything else is trimmed).
  const escape = value => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const renderInline = value => escape(value).replace(/`([^`]+)`/g, '<code>$1</code>');
  const sanitize = value => value
    .replace(/(?:Resources|resources)\/[\w\-\.\/]+/g, 'a large file')
    .replace(/\(e\.g\.\s*a large file\)/gi, '(e.g. a large file)')
    .replace(/-\s*\d+(?:\.\d+)?MB/gi, '')
    .replace(/https?:\/\/[\w\-\.\/]+/gi, 'the app');

  const rawLines = normalized.split('\n');
  const html = [];
  let steps = null;
  let bullets = null;

  const flushLists = () => {
    if (steps) {
      html.push(`<ol>\n${steps.map(step => `  <li>${renderInline(step)}</li>`).join('\n')}\n</ol>`);
      steps = null;
    }
    if (bullets) {
      html.push(`<ul>\n${bullets.map(item => `  <li>${renderInline(item)}</li>`).join('\n')}\n</ul>`);
      bullets = null;
    }
  };

  let i = 0;
  while (i < rawLines.length) {
    const fence = rawLines[i].trim().match(/^```(\w*)\s*$/);
    if (fence) {
      flushLists();
      const lang = fence[1];
      const codeLines = [];
      i++;
      while (i < rawLines.length && !/^```\s*$/.test(rawLines[i].trim())) {
        codeLines.push(rawLines[i]);
        i++;
      }
      i++; // skip closing fence
      const classAttr = lang ? ` class="language-${escape(lang)}"` : '';
      html.push(`<pre><code${classAttr}>${escape(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    const line = sanitize(rawLines[i]).trim();
    i++;
    if (!line) continue;

    const heading = line.match(/^#{2,6}\s+(.+)$/);
    const step = line.match(/^\d+\.\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (heading) {
      flushLists();
      const label = heading[1].replace(/:\s*$/, '') + ':';
      if (/^description/i.test(label)) continue;
      html.push(`<p><strong>${escape(label)}</strong></p>`);
    } else if (step) {
      if (bullets) flushLists();
      if (!steps) steps = [];
      steps.push(step[1]);
    } else if (bullet) {
      if (steps) flushLists();
      if (!bullets) bullets = [];
      bullets.push(bullet[1]);
    } else {
      flushLists();
      html.push(`<p>${renderInline(line)}</p>`);
    }
  }
  flushLists();

  return html.join('\n');
}

function extractTitle(raw) {
  const lines = raw.split('\n');
  const titleHeadingIndex = lines.findIndex(line => /^##\s+Title\s*$/i.test(line.trim()));
  if (titleHeadingIndex !== -1) {
    for (let i = titleHeadingIndex + 1; i < lines.length; i++) {
      const candidate = lines[i].trim();
      if (!candidate) continue;
      if (/^#{1,6}\s/.test(candidate)) break;
      return candidate;
    }
  }
  const fallback = lines.find(line => line.trim() && !/^#{1,6}\s/.test(line.trim()));
  return (fallback || 'Kanban bug report').trim();
}

const PRIORITY_MAP = {
  p1: 'Critical', critical: 'Critical',
  p2: 'High', high: 'High',
  p3: 'Medium', medium: 'Medium',
  p4: 'Low', low: 'Low',
};

// Reads the bug file's own "## Priority" section (e.g. "P2") instead of
// hardcoding one value for every bug.
function resolvePriority(raw) {
  const lines = raw.split('\n');
  const headingIndex = lines.findIndex(line => /^##\s+Priority\s*$/i.test(line.trim()));
  if (headingIndex !== -1) {
    for (let i = headingIndex + 1; i < lines.length; i++) {
      const candidate = lines[i].trim();
      if (!candidate) continue;
      if (/^#{1,6}\s/.test(candidate)) break;
      return PRIORITY_MAP[candidate.toLowerCase()] || 'Medium';
    }
  }
  return 'Medium';
}

function stripTitleSection(raw) {
  const lines = raw.split('\n');
  const start = /^#\s+/.test(lines[0]?.trim() || '') ? 1 : 0;
  const kept = [];
  let inTitleSection = false;
  for (let i = start; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const isHeading = /^#{2,6}\s+/.test(trimmed);
    if (isHeading && /^Title\s*$/i.test(trimmed.replace(/^#{2,6}\s+/, ''))) {
      inTitleSection = true;
      continue;
    }
    if (isHeading && inTitleSection) {
      inTitleSection = false;
    }
    if (inTitleSection) continue;
    kept.push(lines[i]);
  }
  return kept.join('\n');
}

// Finds the tests/ subfolder that actually holds the specs for this bug,
// by matching the bug file's naming prefix (e.g. "admin-login") against
// spec filenames on disk — no hardcoded folder name to fall out of date.
async function resolveTestDir(filePath, testsRoot = 'tests') {
  const baseName = path.basename(filePath, path.extname(filePath));
  const prefix = baseName.split('-').slice(0, 2).join('-');

  let entries;
  try {
    entries = await readdir(testsRoot, { withFileTypes: true });
  } catch {
    return `${testsRoot}/`;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(testsRoot, entry.name);
    const files = await readdir(dirPath);
    if (files.some(f => f.startsWith(prefix))) {
      return `${dirPath}/`;
    }
  }
  return `${testsRoot}/`;
}

async function main() {
  log('Reading bug file:', bugFilePath);
  const raw = await readFile(bugFilePath, 'utf8');
  const title = extractTitle(raw);
  const testDir = await resolveTestDir(bugFilePath);
  const REPORTED_VIA_NOTE = `<p><code>Reported using the Playwright automated test suite (${testDir}).</code></p>`;
  const description = normalizeDescription(stripTitleSection(raw)) + '\n<br/>\n' + REPORTED_VIA_NOTE;

  const detected = detectAssignee(raw);
  const assigneeMap = { fe: assigneeFeId, be: assigneeBeId };
  const assigneeId = detected.key ? assigneeMap[detected.key] : undefined;
  if (detected.key && !assigneeId) {
    log(`Detected assignee "${detected.key}" but KANBAN_ASSIGNEE_${detected.key.toUpperCase()} is not set — leaving unassigned.`);
  } else if (detected.key) {
    log(`Auto-detected assignee: ${detected.key} (fe keywords: ${detected.feHits}, be keywords: ${detected.beHits})`);
  } else {
    log(`Could not confidently auto-detect assignee (fe keywords: ${detected.feHits}, be keywords: ${detected.beHits}) — leaving unassigned.`);
  }

  log('Logging in to Kanban API:', authUrl);
  const loginResult = await login();
  const token = loginResult?.token || loginResult?.accessToken;
  if (!token) {
    throw new Error('Could not extract token from login response.');
  }
  log('Login successful. Token obtained.');

  log('Fetching project list from:', projectsUrl);
  const resolvedProjectId = await getProjectId(token);
  log('Resolved projectId:', resolvedProjectId);

  const priority = resolvePriority(raw);
  log('Resolved priority:', priority);
  log('Task type:', taskType);

  const payload = {
    projectId: resolvedProjectId,
    title,
    description,
    status: 'To Do',
    priority,
    type: taskType,
    ...(assigneeId && { assignees: [assigneeId] }),
  };

  const existing = await findTaskByTitle(token, resolvedProjectId, title);
  if (existing) {
    log('Task already exists, updating description only:', existing._id);
    const updated = await updateTask(token, existing._id, {
      description,
      priority,
      ...(assigneeId && { assignees: [assigneeId] }),
    });
    log('Task updated successfully:', updated);
    if (attachmentPaths.length > 0) {
      log('Skipping attachments: task was updated, not created (re-run without an existing task to re-upload).');
    }
    return;
  }

  log('Creating task at:', tasksUrl);
  const created = await createTask(token, payload);
  log('Task created successfully:', created);

  const taskId = extractTaskId(created);
  if (attachmentPaths.length > 0) {
    if (!taskId) {
      throw new Error('Could not extract task id from create response; skipping attachments.');
    }
    for (const attachmentPath of attachmentPaths) {
      log('Uploading attachment:', attachmentPath);
      const uploaded = await uploadAttachment(token, taskId, attachmentPath);
      log('Attachment uploaded successfully:', uploaded);
    }
  }
}

main().catch((error) => {
  console.error('[kanban-bug] Error:', error.message || error);
  process.exit(1);
});
