import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const widths = [375, 768, 1280];
const url = 'http://localhost:3000/feature/souvenir-スヴニール-';
const outputDir = 'agent-teams/screenshots';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function takeScreenshots() {
  const browser = await chromium.launch();
  try {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 1200 },
      });
      const page = await context.newPage();

      console.log(`Taking screenshot at ${width}px width...`);
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for images to load
      await page.waitForTimeout(1000);

      const filename = path.join(outputDir, `souvenir_${width}px.png`);
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`✓ Saved: ${filename}`);

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log('\nScreenshots complete!');
}

takeScreenshots().catch(console.error);
