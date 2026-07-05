/**
 * routing-hook.js
 * Analyzes user prompt to inject routing hints and increments session turn count.
 */

const fs = require('fs');
const path = require('path');

function readStdinSync() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (err) {
    return "";
  }
}

function updateStats() {
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || ".";
    const statsPath = path.join(projectDir, ".gemini/session_stats.json");
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      stats.turnCount = (stats.turnCount || 0) + 1;
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    }
  } catch (err) {
    // Silently fail to avoid breaking the hook
  }
}

function main() {
  const raw = readStdinSync();
  if (!raw || !raw.trim()) {
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

  const prompt = (payload.prompt || "").toLowerCase();
  const hints = [];

  const hasPaper = prompt.includes("paper") || prompt.includes("study");
  const hasZotero = prompt.includes("zotero") || prompt.includes("cite") || prompt.includes("citekey");
  const hasAction = prompt.includes("add") || prompt.includes("create") || prompt.includes("import") || prompt.includes("ingest");

  if ((hasPaper || hasZotero) && hasAction) {
    hints.push("ROUTING HINT: Targeted at 01_papers/. Ensure 'type: paper', 'citekey', 'zotero_item_key', and 'status: draft|reviewed|integrated' are in frontmatter. Filename should follow YYYY_firstauthor_shorttitle.md");
  }
  
  if ((prompt.includes("concept") || prompt.includes("topic") || prompt.includes("theory")) && hasAction) {
    hints.push("ROUTING HINT: Targeted at 02_topics/. Ensure 'type: topic' and 'status: stub|developing|stable' are in frontmatter.");
  }

  if ((prompt.includes("summary") || prompt.includes("synthesis") || prompt.includes("review")) && hasAction) {
    hints.push("ROUTING HINT: Targeted at 04_synthesis/. Ensure 'type: synthesis' and 'status: draft|complete' are in frontmatter.");
  }

  const response = { continue: true };
  if (hints.length > 0) {
    response.hint = hints.join('\n');
  }
  
  process.stdout.write(JSON.stringify(response), () => process.exit(0));
}

try {
  main();
} catch (err) {
  process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
}
