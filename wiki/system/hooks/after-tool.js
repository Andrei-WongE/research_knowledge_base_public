/**
 * after-tool.js
 * Enrichment hook for Zotero output. Also increments session read count.
 */

const fs = require('fs');
const path = require('path');

function updateStats() {
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || ".";
    const statsPath = path.join(projectDir, ".gemini/session_stats.json");
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      stats.readCount = (stats.readCount || 0) + 1;
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    }
  } catch (err) {}
}

function main() {
  let raw;
  try {
    raw = fs.readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) {
      process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
      return;
    }
  } catch (err) {
    process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
    return;
  }

  updateStats();

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
    return;
  }

  const toolName = payload.tool_name || payload.toolName || "";
  const result = payload.tool_output || payload.toolOutput || payload.result || {};

  // Enrichment logic for Zotero (dummy placeholder for existing logic)
  // ...

  process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
}

try {
  main();
} catch (err) {
  process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
}
