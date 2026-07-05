/**
 * after-agent.js
 * Prompt wiki-linter at session end using lightweight session stats.
 * Hardened to prevent transcript bloat and exit race conditions.
 */

const fs = require('fs');
const path = require('path');

function main() {
  const messages = [];

  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || ".";
    const statsPath = path.join(projectDir, ".gemini/session_stats.json");
    
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      
      if (stats.writeCount >= 5) {
        messages.push(`You have made ${stats.writeCount} changes to wiki notes. Run 'wiki-linter' to verify.`);
      }

      if (stats.turnCount >= 10) {
        messages.push("Research intensity high. Consider triggering 'Crystallization' into '04_synthesis/' using 'wiki-synthesizer'.");
      }
    }
  } catch (err) {
    // Silent fail to avoid CLI 'hook failed' error
  }

  const response = { continue: true };
  if (messages.length > 0) {
    response.systemMessage = `[WIKI ADVISORY]\n- ${messages.join('\n- ')}`;
  }
  
  process.stdout.write(JSON.stringify(response), () => process.exit(0));
}

try {
  main();
} catch (err) {
  process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
}
