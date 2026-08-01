import { readFile } from 'fs/promises';

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

if (!loginEmail || !loginPassword) {
  throw new Error('KANBAN_EMAIL and KANBAN_PASSWORD environment variables are required.');
}
if (!bugFilePath) {
  throw new Error('Usage: node scripts/log-kanban-bug.js <path-to-bug-file> [attachment ...]');
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

  const sanitizedPaths = normalized
    .replace(/(?:Resources|resources)\/[\w\-\.\/]+/g, 'a large file')
    .replace(/\(e\.g\.\s*a large file\)/gi, '(e.g. a large file)')
    .replace(/-\s*\d+(?:\.\d+)?MB/gi, '')
    .replace(/https?:\/\/[\w\-\.\/]+/gi, 'the app');

  // The Kanban tool renders the description as HTML (existing tasks store
  // <h3>/<p> tags), so emit real markup: bold section labels and an <ol>
  // for the numbered steps. Plain text with newlines collapses to one line.
  const escape = value => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = sanitizedPaths
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const html = [];
  let steps = null;

  const flushSteps = () => {
    if (steps) {
      html.push(`<ol>\n${steps.map(step => `  <li>${escape(step)}</li>`).join('\n')}\n</ol>`);
      steps = null;
    }
  };

  for (const line of lines) {
    const heading = line.match(/^#{2,6}\s+(.+)$/);
    const step = line.match(/^\d+\.\s+(.+)$/);

    if (heading) {
      flushSteps();
      const label = heading[1].replace(/:\s*$/, '') + ':';
      if (/^description/i.test(label)) continue;
      html.push(`<p><strong>${escape(label)}</strong></p>`);
    } else if (step) {
      if (!steps) steps = [];
      steps.push(step[1]);
    } else {
      flushSteps();
      html.push(`<p>${escape(line)}</p>`);
    }
  }
  flushSteps();

  return html.join('\n');
}

async function main() {
  log('Reading bug file:', bugFilePath);
  const raw = await readFile(bugFilePath, 'utf8');
  const [titleLine, ...rest] = raw.split('\n');
  const title = titleLine.replace(/^#\s*/, '').trim() || 'Kanban bug report';
  const description = normalizeDescription(rest.join('\n'));

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

  const payload = {
    projectId: resolvedProjectId,
    title,
    description,
    status: 'To Do',
    priority: 'Medium',
    type: 'Bug',
    ...(assigneeId && { assignee: assigneeId }),
  };

  const existing = await findTaskByTitle(token, resolvedProjectId, title);
  if (existing) {
    log('Task already exists, updating description only:', existing._id);
    const updated = await updateTask(token, existing._id, {
      description,
      ...(assigneeId && { assignee: assigneeId }),
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
