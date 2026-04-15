#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const DATA_PATH = 'public/investors-db.json';
const MAX_LINKS = Number(process.env.MAX_LINKS || 80);
const TIMEOUT_MS = Number(process.env.LINK_TIMEOUT_MS || 8000);
const STRICT = process.argv.includes('--strict');

function isHttpUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  return /^https?:\/\//i.test(value.trim());
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function checkUrl(url) {
  const timer = withTimeout(TIMEOUT_MS);
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: timer.signal,
      headers: { 'user-agent': 'venturepilot-link-check/1.0' },
    });

    // Some sites block HEAD; retry with GET for better signal.
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: timer.signal,
        headers: { 'user-agent': 'venturepilot-link-check/1.0' },
      });
      return get.status;
    }

    return head.status;
  } catch {
    return 0;
  } finally {
    timer.clear();
  }
}

const raw = await readFile(DATA_PATH, 'utf8');
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  console.error('ERROR: investors-db.json is not an array');
  process.exit(1);
}

const ids = new Set();
const duplicateIds = new Set();
const websites = [];

for (const row of data) {
  if (!row || typeof row !== 'object') continue;
  const id = String(row.id || '').trim();
  if (id) {
    if (ids.has(id)) duplicateIds.add(id);
    ids.add(id);
  }

  // LinkedIn often blocks bots (999), so check firm websites by default.
  const website = typeof row.website === 'string' ? row.website.trim() : '';
  if (website && isHttpUrl(website)) websites.push(website);
}

const uniqueWebsites = [...new Set(websites)].slice(0, MAX_LINKS);

console.log(`Dataset rows: ${data.length}`);
console.log(`Unique IDs: ${ids.size}`);
console.log(`Duplicate IDs: ${duplicateIds.size}`);
console.log(`Websites sampled: ${uniqueWebsites.length}${websites.length > uniqueWebsites.length ? ` of ${new Set(websites).size}` : ''}`);

if (duplicateIds.size > 0) {
  console.log('Duplicate IDs found:');
  for (const id of duplicateIds) console.log(`- ${id}`);
}

const failures = [];
for (const url of uniqueWebsites) {
  const status = await checkUrl(url);
  const ok = status >= 200 && status < 400;
  const unknown = status === 0;
  if (!ok && !unknown) failures.push({ url, status });
  if (unknown) console.log(`?   ${url} (timeout/network blocked)`);
  else console.log(`${ok ? 'OK ' : 'BAD'} ${url} (${status})`);
}

console.log(`\nBroken website links in sample: ${failures.length}`);

if (failures.length > 0) {
  console.log('Broken links:');
  for (const item of failures) console.log(`- ${item.status} ${item.url}`);
}

if (STRICT && (duplicateIds.size > 0 || failures.length > 0)) {
  process.exit(1);
}
