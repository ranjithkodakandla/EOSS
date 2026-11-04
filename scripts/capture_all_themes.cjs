const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = '/Users/ranjithkodakandla/.gemini/antigravity/brain/f6af247c-f4c4-4506-bc10-4e75d59732f3/screenshots';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Helper to switch theme
  async function setTheme(themeName) {
    await page.evaluate((t) => {
      if (window.__EOSS_SET_THEME__) {
        window.__EOSS_SET_THEME__(t);
      }
      const root = document.documentElement;
      root.classList.remove('theme-aurora', 'theme-ocean', 'theme-graphite');
      root.classList.add(`theme-${t}`);
    }, themeName);
    await new Promise(r => setTimeout(r, 500));
  }

  // ── 1. Desktop 1440px — Theme A (Aurora Indigo) ──
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');
  await setTheme('aurora');
  await page.screenshot({ path: path.join(outDir, 'EOSS_Theme_A_Aurora_Indigo_1440.png') });
  console.log('✓ Captured EOSS_Theme_A_Aurora_Indigo_1440.png');

  // ── 2. Desktop 1440px — Theme B (Ocean Teal) ──
  await setTheme('ocean');
  await page.screenshot({ path: path.join(outDir, 'EOSS_Theme_B_Ocean_Teal_1440.png') });
  console.log('✓ Captured EOSS_Theme_B_Ocean_Teal_1440.png');

  // ── 3. Desktop 1440px — Theme C (Graphite Amber) ──
  await setTheme('graphite');
  await page.screenshot({ path: path.join(outDir, 'EOSS_Theme_C_Graphite_Amber_1440.png') });
  console.log('✓ Captured EOSS_Theme_C_Graphite_Amber_1440.png');

  // Reset to Aurora
  await setTheme('aurora');

  // ── 4. Tablet 1024px ──
  await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'EOSS_Home_Tablet_1024.png') });
  console.log('✓ Captured EOSS_Home_Tablet_1024.png');

  // ── 5. Mobile 390px ──
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'EOSS_Home_Mobile_390.png') });
  console.log('✓ Captured EOSS_Home_Mobile_390.png');

  // ── 6. Global Search Modal Interaction (Cmd+K) ──
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const searchBtn = document.querySelector('header button[title*="Global Record Search"]');
    if (searchBtn) searchBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.type('SO-1245');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'EOSS_Home_GlobalSearch_Open.png') });
  console.log('✓ Captured EOSS_Home_GlobalSearch_Open.png');

  // Close search
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ── 7. Copilot Interactive Chat ──
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const planBtn = buttons.find(b => b.textContent && b.textContent.includes('Plan production for pending orders'));
    if (planBtn) planBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'EOSS_Home_Copilot_Interaction.png') });
  console.log('✓ Captured EOSS_Home_Copilot_Interaction.png');

  await browser.close();
}

main().catch(console.error);
