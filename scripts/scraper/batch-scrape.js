/**
 * Batch scraper for popular songs
 */
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

async function scrapeSong(url, index, total) {
  console.log(`\n[${index}/${total}] Scraping: ${url}`);

  try {
    const { stdout, stderr } = await execPromise(`node tab-scraper-v2.js "${url}"`);
    console.log(stdout);
    if (stderr) console.error(stderr);

    // Wait 2 seconds between scrapes
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { url, success: true };
  } catch (error) {
    console.error(`❌ Failed: ${url}`);
    console.error(error.message);
    return { url, success: false, error: error.message };
  }
}

async function main() {
  const urlsFile = 'popular-songs-urls.txt';
  const urls = fs.readFileSync(urlsFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.startsWith('http'));

  console.log(`🎸 Scraping ${urls.length} popular songs...\n`);

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const result = await scrapeSong(urls[i], i + 1, urls.length);
    results.push(result);
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`📊 SCRAPING COMPLETED`);
  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`✅ Successful:   ${successful}/${urls.length}`);
  console.log(`❌ Failed:       ${failed}/${urls.length}`);
  console.log(`\n✨ Done!\n`);
}

main().catch(console.error);
