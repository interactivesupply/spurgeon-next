#!/usr/bin/env node
/**
 * Userback triage cron helper.
 *
 *   node --env-file=.env.local scripts/userback-cron.mjs
 *
 * Pulls every Userback item currently in the "Open" workflow, diffs against
 * the last seen state, and prints a JSON object describing the new items plus
 * the path to the state file. Updates the state file in place to record what
 * we've now seen — so the next run only surfaces newer arrivals.
 *
 * Designed to be the first step of the recurring cron prompt: the Claude
 * session that fires reads this output, writes a one-paragraph fix
 * recommendation per new item, and posts a single message to Slack.
 *
 * Output (stdout, JSON):
 *   {
 *     "stateFile": "...",
 *     "slackWebhook": "https://hooks.slack.com/services/.../...",
 *     "totalOpen": 12,
 *     "newItems": [ { id, title, description, name, email, pageUrl, screenshot, created, link } ],
 *     "stillOpenSeen": [123, 124, ...]  // already alerted on a prior run
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '..', '.userback-triage-state.json');

const TOKEN = process.env.USERBACK_API_TOKEN;
const SLACK = process.env.SLACK_TRIAGE_WEBHOOK || '';
const PROJECT_ID = 140589;
const STATUS_OPEN = 576325;

if (!TOKEN) {
  console.error(JSON.stringify({ error: 'USERBACK_API_TOKEN missing' }));
  process.exit(1);
}

async function fetchOpenItems() {
  const filter = encodeURIComponent(`projectId eq ${PROJECT_ID} and workflowId eq ${STATUS_OPEN}`);
  const res = await fetch(`https://rest.userback.io/1.0/feedback?filter=${filter}&per_page=100`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Userback API ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  return json?.data || [];
}

// Comments live at /feedback/comment (a sub-path of /feedback, NOT a
// top-level /comment) — discovered via the Userback Postman collection.
// Filter syntax: `feedbackId eq <id>`. Sorted oldest-first so the
// recommendation reads them in conversation order.
async function fetchCommentsForItem(feedbackId) {
  const filter = encodeURIComponent(`feedbackId eq ${feedbackId}`);
  const res = await fetch(
    `https://rest.userback.io/1.0/feedback/comment?filter=${filter}&sort=created,asc&per_page=50`,
    { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data || []).map(c => ({
    id: c.id,
    author: c.userId ? `member-${c.userId}` : (c.guestName || c.guestEmail || 'anon'),
    comment: (c.comment || '').replace(/\s+/g, ' ').trim(),
    created: (c.created || '').slice(0, 10),
    isResolved: !!c.isResolved,
  }));
}

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { seenIds: [], firstRun: true, lastCheck: null }; }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function trim(s, n) { return (s || '').replace(/\s+/g, ' ').trim().slice(0, n); }

(async () => {
  const items = await fetchOpenItems();
  const state = readState();
  const seen = new Set(state.seenIds || []);
  const isFirstRun = !!state.firstRun;
  const newOnes = [];
  const stillOpenSeen = [];

  for (const i of items) {
    if (seen.has(i.id)) {
      stillOpenSeen.push(i.id);
      continue;
    }
    // First run: record everything as "seen" without alerting on it. We don't
    // want to flood Slack on cron startup with the entire backlog — those
    // were known to the user before the triage cron existed.
    if (!isFirstRun) {
      const comments = await fetchCommentsForItem(i.id);
      newOnes.push({
        id: i.id,
        type: i.feedbackType || 'feedback',
        title: trim(i.title, 200),
        description: trim(i.description, 600),
        name: i.name || '',
        email: i.email || '',
        pageUrl: i.pageUrl || '',
        screenshot: i.Screenshots?.[0]?.url || '',
        created: i.created || '',
        link: `https://app.userback.io/projects/${PROJECT_ID}/feedback/${i.id}`,
        comments, // [{id, author, comment, created, isResolved}], oldest-first
      });
    }
    seen.add(i.id);
  }

  // Persist updated state.
  writeState({
    seenIds: [...seen],
    firstRun: false,
    lastCheck: new Date().toISOString(),
  });

  console.log(JSON.stringify({
    stateFile: STATE_FILE,
    slackWebhook: SLACK,
    totalOpen: items.length,
    newItems: newOnes,
    stillOpenSeen,
    isFirstRun,
  }, null, 2));
})().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
