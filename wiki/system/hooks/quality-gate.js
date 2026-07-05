/**
 * quality-gate.js
 * Validates note content and increments session write count.
 */

const fs = require('fs');
const path = require('path');

const WRITE_TOOLS = new Set([
  "obsidian_write_note", 
  "obsidian_create_note", 
  "obsidian_update_note", 
  "obsidian_append_note", 
  "obsidian_patch_note",
  "write_file",
  "replace"
]);

function toRelativeVaultPath(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const knownRoots = ["01_papers", "02_topics", "03_raw", "04_synthesis", "05_outputs", "wiki"];
  const segments = normalized.split("/").filter(Boolean);
  let rootIndex = -1;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (knownRoots.includes(segments[i])) {
      rootIndex = i;
      break;
    }
  }
  return rootIndex >= 0 ? segments.slice(rootIndex).join("/") : normalized;
}

function updateStats() {
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || ".";
    const statsPath = path.join(projectDir, ".gemini/session_stats.json");
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      stats.writeCount = (stats.writeCount || 0) + 1;
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

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
    return;
  }
  
  let toolName = payload.tool_name || payload.toolName || "";
  if (toolName.startsWith("mcp_")) toolName = toolName.slice(4);
  
  if (!WRITE_TOOLS.has(toolName) && !payload.tool_name?.includes("obsidian")) {
    process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
    return;
  }

  // Increment write count
  updateStats();

  const args = payload.tool_input || payload.toolInput || payload.args || {};
  const rawPath = args.path || args.filename || args.note_path || args.file_path || "";
  const relPath = toRelativeVaultPath(rawPath);
  const folder = relPath.split("/")[0];

  let schema = null;
  try {
    const projectDir = process.env.GEMINI_PROJECT_DIR || ".";
    const schemaPath = path.join(projectDir, "wiki/system/schemas", `${folder}.json`);
    if (fs.existsSync(schemaPath)) {
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    }
  } catch (err) {}

  if (!schema) {
    process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
    return;
  }

  let content = "";
  try {
    const vaultPath = process.env.OBSIDIAN_VAULT_PATH || ".";
    const fullPath = path.join(vaultPath, relPath);
    if (fs.existsSync(fullPath)) content = fs.readFileSync(fullPath, 'utf8');
  } catch (err) { }

  if (!content) content = (args.content || args.body || args.text || args.new_string || "").trim();
  if (!content) {
    process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
    return;
  }

  const issues = [];
  const frontmatterMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/);
  
  if (!frontmatterMatch) {
    issues.push("Note must start with YAML frontmatter block (enclosed in '---').");
  } else {
    const frontmatter = frontmatterMatch[1];
    schema.required_fields.forEach(field => {
      if (!new RegExp(`^${field}\\s*:`, "m").test(frontmatter)) {
        issues.push(`Missing required field in frontmatter: '${field}'`);
      }
    });
  }

  const fileName = path.basename(relPath);
  if (schema.naming_convention && !new RegExp(schema.naming_convention).test(fileName)) {
    issues.push(`Filename '${fileName}' does not match convention for ${folder}.`);
  }

  const brokenSyntax = (content.match(/\[\[[^\]]*$/g) || []).length;
  if (brokenSyntax > 0) issues.push("Detected unclosed wikilink syntax '[['.");

  const response = { continue: true };
  if (issues.length > 0) {
    response.hint = `QUALITY GATE: Issues in ${relPath}:\n- ${issues.join('\n- ')}`;
  } else if (/0[124]_/.test(relPath)) {
    response.hint = `💡 [WIKI HINT] Vault content modified. Remember to update index/log and run 'wiki-indexer' before finishing.`;
  }
  
  process.stdout.write(JSON.stringify(response), () => process.exit(0));
}

try {
  main();
} catch (err) {
  process.stdout.write(JSON.stringify({ continue: true }), () => process.exit(0));
}
