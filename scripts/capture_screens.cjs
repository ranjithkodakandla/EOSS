const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('h1');

  // Check top positions of elements
  const positions = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    return {
      windowScrollY: window.scrollY,
      h1Rect: h1 ? h1.getBoundingClientRect() : null,
      headerRect: header ? header.getBoundingClientRect() : null,
      asideRect: aside ? aside.getBoundingClientRect() : null,
      bodyRect: document.body.getBoundingClientRect()
    };
  });
  console.log('Positions:', JSON.stringify(positions, null, 2));

  const outDir = '/Users/ranjithkodakandla/.gemini/antigravity/brain/f6af247c-f4c4-4506-bc10-4e75d59732f3/screenshots';
  await page.screenshot({ path: path.join(outDir, 'test_1440.png') });
  console.log('Saved test_1440.png');

  await browser.close();
}

main().catch(console.error);
