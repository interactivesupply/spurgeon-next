#!/usr/bin/env node
/**
 * Userback feedback triage helper for the Spurgeon project.
 *
 * Subcommands:
 *   list                       Print open items (default)
 *   list --status <name>       Print items in a different workflow
 *   get <id>                   Print full detail for one item
 *   set-status <id> <status>   Update an item's workflow
 *                              status: open | in-progress | under-review |
 *                                      needs-discussion | resolved
 *   comment <id> <text...>     Post a comment on an item (everything after
 *                              the id is joined as the comment body)
 *
 * Run via:  npm run triage [-- list|get|set-status|comment …]
 *
 * Requires USERBACK_API_TOKEN in .env.local (already wired via
 * --env-file=.env.local in the npm script).
 */

const TOKEN = process.env.USERBACK_API_TOKEN;
if (!TOKEN) {
  console.error('Missing USERBACK_API_TOKEN in environment.');
  process.exit(1);
}

const PROJECT_ID = 140589; // Spurgeon Center

// Author for comments posted via this CLI. Userback's POST /feedback/comment
// rejects the request with 400 unless the body identifies the author —
// either as a workspace member (userId) or an external commenter (guestName
// + guestEmail). 63047 is the "Dev Team" admin member on this workspace
// (support@interactivesupply.com); it's the user that generated this token.
// Look up via:
//   curl -H "Authorization: Bearer $USERBACK_API_TOKEN" \
//     https://rest.userback.io/1.0/member
const COMMENT_AUTHOR_USER_ID = 63047;

// Workflow IDs for the Spurgeon project. Discovered once via the workflow
// endpoint; baked in here so we don't pay an extra round trip per command.
// If new statuses are added in Userback, run:
//   curl -H "Authorization: Bearer $USERBACK_API_TOKEN" \
//     "https://rest.userback.io/1.0/workflow?filter=projectId%20eq%20140589"
const STATUS = {
  'open':             576325,
  'in-progress':      576327,
  'under-review':     576329,
  'needs-discussion': 576349,
  'resolved':         576331,
};

const BASE = 'https://rest.userback.io/1.0';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { /* leave as text */ }
  if (!res.ok) {
    const err = new Error(`Userback API ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function statusIdFromName(name) {
  const id = STATUS[name];
  if (!id) {
    console.error(`Unknown status "${name}". Available: ${Object.keys(STATUS).join(', ')}`);
    process.exit(2);
  }
  return id;
}

async function listItems({ statusName = 'open' } = {}) {
  const statusId = statusIdFromName(statusName);
  // OData: project + workflow. Userback exposes the FK as workflowId
  // (the nested Workflow/id navigation is rejected as an invalid filter field).
  const filter = encodeURIComponent(
    `projectId eq ${PROJECT_ID} and workflowId eq ${statusId}`
  );
  // Userback caps pageSize at 10 server-side regardless of per_page, so walk
  // the pages until _pagination says we've seen everything.
  const items = [];
  let page = 1;
  while (true) {
    const json = await api(`/feedback?filter=${filter}&page=${page}`);
    const batch = json?.data || [];
    items.push(...batch);
    const totalPages = json?._pagination?.totalPages ?? 1;
    if (page >= totalPages || batch.length === 0) break;
    page += 1;
  }
  if (items.length === 0) {
    console.log(`No items in "${statusName}" status for the Spurgeon project.`);
    return;
  }
  console.log(`${items.length} item${items.length === 1 ? '' : 's'} in "${statusName}":\n`);
  for (const i of items) {
    const created = new Date(i.created).toISOString().slice(0, 10);
    console.log(`#${i.id}  [${i.feedbackType}]  ${i.title || '(no title)'}`);
    if (i.description) console.log(`  ${i.description.replace(/\s+/g, ' ').slice(0, 200)}`);
    console.log(`  by ${i.name || '(anon)'} <${i.email || '?'}>  ${created}`);
    console.log(`  page: ${i.pageUrl}`);
    if (i.Screenshots?.[0]?.url) console.log(`  shot: ${i.Screenshots[0].url}`);
    console.log();
  }
}

async function getItem(id) {
  const i = await api(`/feedback/${id}`);
  console.log(JSON.stringify(i, null, 2));
}

async function postComment(id, body) {
  const text = (body || '').trim();
  if (!text) throw new Error('comment body is empty');
  // Comments live at /feedback/comment (sub-path of /feedback). The GET
  // shape uses { feedbackId, comment, ... } so the POST mirrors that.
  const created = await api('/feedback/comment', {
    method: 'POST',
    body: JSON.stringify({
      feedbackId: Number(id),
      userId: COMMENT_AUTHOR_USER_ID,
      comment: text,
    }),
  });
  console.log(`#${id}  comment posted${created?.id ? ` (comment id ${created.id})` : ''}`);
}

async function setStatus(id, statusName) {
  const statusId = statusIdFromName(statusName);
  const updated = await api(`/feedback/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ Workflow: { id: statusId } }),
  });
  console.log(`#${id}  ->  ${updated?.Workflow?.name || statusName}`);
}

// ─── arg parsing ───────────────────────────────────────────────────
const argv = process.argv.slice(2);
const cmd = argv[0] || 'list';

try {
  if (cmd === 'list') {
    const flagIdx = argv.indexOf('--status');
    const statusName = flagIdx >= 0 ? argv[flagIdx + 1] : 'open';
    await listItems({ statusName });
  } else if (cmd === 'get') {
    const id = argv[1];
    if (!id) throw new Error('usage: triage get <id>');
    await getItem(id);
  } else if (cmd === 'set-status') {
    const id = argv[1];
    const status = argv[2];
    if (!id || !status) throw new Error('usage: triage set-status <id> <status>');
    await setStatus(id, status);
  } else if (cmd === 'comment') {
    const id = argv[1];
    const body = argv.slice(2).join(' ');
    if (!id || !body) throw new Error('usage: triage comment <id> <text...>');
    await postComment(id, body);
  } else if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    console.log(`
Usage:
  npm run triage                                 # list open items
  npm run triage -- list --status resolved       # list resolved
  npm run triage -- get <id>                     # full detail
  npm run triage -- set-status <id> <status>     # change workflow
  npm run triage -- comment <id> <text...>       # post a comment

Statuses: ${Object.keys(STATUS).join(', ')}
`.trim());
  } else {
    console.error(`Unknown command: ${cmd}. Run 'npm run triage -- --help'.`);
    process.exit(2);
  }
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
