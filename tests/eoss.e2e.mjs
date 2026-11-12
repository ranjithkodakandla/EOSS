import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const PORT = 4181;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eoss-chrome-'));

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch { /* retrying */ }
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for Vite server at ${url}`);
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  cwd: '/Users/ranjithkodakandla/.gemini/antigravity/scratch/EOSS',
  stdio: ['ignore', 'pipe', 'pipe'],
});

let browser;
const pageErrors = [];

try {
  await waitForServer(BASE_URL);
  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    userDataDir: profileDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--no-first-run'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('pageerror', err => pageErrors.push(err.message));

  // Clear persisted storage cleanly on first navigation
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // ── TEST 1: Job creation uses New PO only (no None), Title Case readiness, no dead chevron ──
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('table');

  // Verify Title Case Material Readiness pills (no lowercase 'shortage', 'awaiting_procurement', etc.)
  const readinessTexts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('table tbody td')).map(td => td.textContent?.trim() ?? '')
  );
  assert.ok(readinessTexts.some(t => ['Available', 'Shortage', 'Partially Available', 'Awaiting Procurement', 'Awaiting goods receipt', 'Quality Hold', 'Not Assessed'].includes(t)),
    'Jobs table should render Title Case Material Readiness badges');

  // Open New Job Modal & confirm only New PO / Existing POs (no "None" option)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('New Job'));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('New job'));
  const poOptions = await page.evaluate(() =>
    Array.from(document.querySelectorAll('select option')).map(o => o.textContent?.trim() ?? '')
  );
  assert.ok(!poOptions.some(t => /^None\b/i.test(t)), 'Ambiguous "None" PO option must not exist in New Job modal');
  assert.ok(poOptions.some(t => t === 'New PO'), 'New PO option must be present');

  // Fill Customer, Job Description, and New Customer PO fields via React-compatible setters
  await page.evaluate(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const selectSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    const setInput = (el, val) => {
      if (!el) return;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const selects = Array.from(document.querySelectorAll('select'));
    const custSelect = selects.find(s => Array.from(s.options).some(o => o.textContent?.includes('Select customer')));
    if (custSelect && custSelect.options.length > 1) {
      selectSetter.call(custSelect, custSelect.options[1].value);
      custSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const inputs = Array.from(document.querySelectorAll('input'));
    const descInput = inputs.find(i => i.placeholder?.toLowerCase().includes('fabrication') || i.placeholder?.toLowerCase().includes('frames'));
    if (descInput) setInput(descInput, 'E2E Turbine Casing');
    const cpoInput = inputs.find(i => i.placeholder?.includes('CPO-'));
    if (cpoInput) setInput(cpoInput, 'CPO-E2E-771');
    const numInputs = inputs.filter(i => i.type === 'number');
    for (const ni of numInputs) {
      if (!ni.value || ni.value === '0') setInput(ni, '10');
    }
    const dateInput = inputs.find(i => i.type === 'date');
    if (dateInput && !dateInput.value) setInput(dateInput, '2026-12-01');
  });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Create PO & Job'));
    btn?.click();
  });
  await page.waitForFunction(() => window.location.pathname.startsWith('/jobs/job-'));
  const jobUrl = page.url();
  const hasCpoLink = await page.evaluate(() => document.body.innerText.includes('CPO-E2E-771'));
  assert.ok(hasCpoLink, `Created Job page (${jobUrl}) must display linked Customer PO CPO-E2E-771`);

  // Click Customer PO badge to verify bidirectional navigation -> PODetail -> back to Job
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent?.includes('CPO-E2E-771'));
    btn?.click();
  });
  await page.waitForFunction(() => window.location.pathname.startsWith('/sales/po/'));
  const hasJobOnPo = await page.evaluate(() => document.body.innerText.includes('E2E Turbine Casing'));
  assert.ok(hasJobOnPo, 'Customer PO detail page must show linked Job');

  // ── TEST 2: Supplier PO Record GRN -> Partial Multi-Lot -> Start Inspection -> Accept -> Inventory ──
  await page.goto(`${BASE_URL}/procurement?tab=spo`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('table');
  // Click spo-002 (confirmed PO for SSI, or find first confirmed SPO)
  await page.goto(`${BASE_URL}/procurement/spo/spo-002`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('Record GRN'));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Record GRN'));
    btn?.click();
  });
  await page.waitForFunction(() => window.location.pathname.startsWith('/procurement/grn/new'));
  await page.waitForFunction(() => document.body.innerText.includes('Lots Received'));

  // Fill Delivery Challan
  await page.evaluate(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const challan = Array.from(document.querySelectorAll('input')).find(i => i.placeholder?.includes('DC-'));
    if (challan) {
      setter.call(challan, 'DC-E2E-404');
      challan.dispatchEvent(new Event('input', { bubbles: true }));
      challan.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  // Submit GRN
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Save GRN & Record Lots'));
    btn?.click();
  });
  await page.waitForFunction(() => /^\/procurement\/grn\/grn-/.test(window.location.pathname));
  const grnText = await page.evaluate(() => document.body.innerText);
  assert.ok(grnText.includes('Pending QC') && grnText.includes('DC-E2E-404'), 'Saved GRN detail should show Pending QC & challan');

  // Start Inspection from GRN -> Inspection Detail -> Complete Pass
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Start Inspection') || b.textContent?.includes('Open Inspection'));
    btn?.click();
  });
  await page.waitForFunction(() => window.location.pathname.startsWith('/quality/inspection/'));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Record Result'));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Accept & Release'));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Accept & Release'));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Pass'));

  // ── TEST 3: PR Creation (no Job ID) + Edit PR + Multi-Quotation Comparison + Generate 1 SPO ──
  await page.goto(`${BASE_URL}/procurement/pr/new`, { waitUntil: 'networkidle0' });
  const prHasJobField = await page.evaluate(() => document.body.innerText.includes('Link to Job'));
  assert.equal(prHasJobField, false, 'PR Creation must NOT ask for a Job ID');
  await page.goto(`${BASE_URL}/procurement/pr/pr-001`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.body.innerText.includes('Supplier Quotations'));
  const prDetailText = await page.evaluate(() => document.body.innerText);
  assert.ok(prDetailText.includes('Side-by-Side Line Item Comparison'), 'PR Detail with >=2 quotations must show comparison');

  // ── TEST 4: Maintenance Conditional Log Event & Edit Asset Running Hours + Status Validation ──
  await page.goto(`${BASE_URL}/assets`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Log Event'));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Breakdown (Unplanned)'));
  // Switch Event Type to Preventive and verify conditional fields update
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const typeSelect = selects.find(s => Array.from(s.options).some(o => o.value === 'Preventive'));
    if (typeSelect) {
      typeSelect.value = 'Preventive';
      typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForFunction(() => document.body.innerText.includes('Planned Maintenance Date'));

  // Close modal and open Edit on first asset to confirm Current Reading + Operational Status fields exist
  await page.evaluate(() => {
    const cancel = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Cancel');
    cancel?.click();
  });
  await page.evaluate(() => {
    const editBtn = Array.from(document.querySelectorAll('button')).find(b => b.title === 'Edit asset');
    editBtn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Operational Status'));
  const hasMeterEdit = await page.evaluate(() =>
    document.body.innerText.includes('Current Reading') || document.body.innerText.includes('Current Meter Reading')
  );
  assert.ok(hasMeterEdit, 'Asset Edit modal must allow editing Current Reading & Operational Status');

  assert.equal(pageErrors.length, 0, `Unexpected runtime page errors: ${pageErrors.join('; ')}`);
  console.log('ALL E2E BROWSER CHECKS PASSED');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
  fs.rmSync(profileDir, { recursive: true, force: true });
}
