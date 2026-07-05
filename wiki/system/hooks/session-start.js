/**
 * session-start.js
 * Injects vault architecture and initializes session stats.
 * Hardened for synchronous I/O and absolute project paths.
 */

const fs = require('fs');
const path = require('path');

function main() {
  // Initialize/Reset session stats
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || ".";
    const statsPath = path.join(projectDir, ".gemini/session_stats.json");
    
    // Ensure .gemini dir exists
    const geminiDir = path.dirname(statsPath);
    if (!fs.existsSync(geminiDir)) fs.mkdirSync(geminiDir, { recursive: true });

    const initialStats = {
      writeCount: 0,
      turnCount: 0,
      readCount: 0,
      startTime: new Date().toISOString()
    };
    fs.writeFileSync(statsPath, JSON.stringify(initialStats, null, 2));
  } catch (err) {
    process.stderr.write(`[SessionStart] Stats init error: ${err.message}\n`);
  }

  const context = [
    "=== RESEARCH WIKI (Obsidian vault) ===",
    "Vault Layout:",
    "- 01_papers/: Peer-reviewed literature (requires 'type: paper', 'citekey', 'zotero_item_key', 'status')",
    "- 02_topics/: Concepts and methods (requires 'type: topic', 'status')",
    "- 04_synthesis/: Summaries and reviews (requires 'type: synthesis', 'status')",
    "",
    "Rules:",
    "1. Favor the official Obsidian CLI ('obsidian' command) for file/vault operations.",
    "2. Filenames for papers: YYYY_firstauthor_shorttitle.md (lowercase, underscores).",
    "3. Run wiki-compiler after Zotero retrieval.",
    "4. Run wiki-indexer after bulk imports or restructuring.",
    "5. Metadata Standard: All papers MUST have 'zotero_item_key' for stable deep-linking."
  ];

  process.stdout.write(JSON.stringify({
    continue: true,
    context: context.join("\n")
  }), () => process.exit(0));
}

try {
  main();
} catch (err) {
  process.stderr.write(`[SessionStart] Fatal error: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
}
