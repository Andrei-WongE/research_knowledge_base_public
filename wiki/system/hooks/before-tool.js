/**
 * before-tool.js
 * Enforce vault folder rules and required frontmatter.
 * Hardened for synchronous I/O and absolute project paths.
 */

const fs = require('fs');
const path = require('path');

const WRITE_TOOLS = new Set([
  "obsidian_write_note",
  "obsidian_create_note",
  "obsidian_append_note",
  "obsidian_update_note",
  "obsidian_patch_note",
  "write_file",
  "replace"
]);

const PARTIAL_WRITE_TOOLS = new Set([
  "obsidian_append_note",
  "obsidian_patch_note",
  "replace"
]);

// Legacy hardcoded fields (fallback if schemas missing)
const FALLBACK_REQUIRED_FIELDS = {
  "01_papers": ["type", "citekey", "zotero_item_key", "status"],
  "02_topics": ["type", "status"],
  "04_synthesis": ["type", "status"]
};

function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function toRelativeVaultPath(filePath) {
  const normalized = normalizePath(filePath).replace(/^\/+/, "");
  const knownRoots = ["01_papers", "02_topics", "03_raw", "04_synthesis", "05_outputs", "wiki"];
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (vaultPath) {
    const absVault = path.resolve(vaultPath).replace(/\\/g, "/");
    const absFile = path.resolve(filePath).replace(/\\/g, "/");
    if (absFile.startsWith(absVault)) {
      return absFile.slice(absVault.length).replace(/^\/+/, "");
    }
  }
  for (const root of knownRoots) {
    const idx = normalized.indexOf(root + "/");
    if (idx >= 0) return normalized.slice(idx);
  }
  return normalized;
}

function parseFrontmatter(content) {
  const normalized = String(content || "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return null;
  const fields = {};
  match[1].split("\n").forEach(line => {
    const pair = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (pair) fields[pair[1]] = pair[2].trim();
  });
  return fields;
}

function main() {
  let raw;
  try {
    raw = fs.readFileSync(0, 'utf8');
    if (!raw || !raw.trim()) {
      process.stdout.write(JSON.stringify({ continue: true }));
      return;
    }
  } catch (err) {
    process.stderr.write(`[BeforeTool] Stdin error: ${err.message}\n`);
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    process.stderr.write(`[BeforeTool] JSON error: ${e.message}\n`);
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  let toolName = payload.tool_name || payload.toolName || "";
  if (toolName.startsWith("mcp_")) toolName = toolName.slice(4);

  // Normalize obsidian tool names
  if (toolName.includes("obsidian")) {
    if (toolName.includes("write")) toolName = "obsidian_write_note";
    else if (toolName.includes("create")) toolName = "obsidian_create_note";
    else if (toolName.includes("append")) toolName = "obsidian_append_note";
    else if (toolName.includes("update")) toolName = "obsidian_update_note";
    else if (toolName.includes("patch")) toolName = "obsidian_patch_note";
  }

  if (!WRITE_TOOLS.has(toolName)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  const args = payload.tool_input || payload.toolInput || payload.args || {};
  const rawPath = args.path || args.filename || args.note_path || args.file_path || "";
  const relPath = toRelativeVaultPath(rawPath);
  const content = args.content || args.body || args.text || args.new_string || "";

  if (!relPath) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  if (relPath.startsWith("03_raw/")) {
    process.stdout.write(JSON.stringify({
      continue: false,
      reason: "Write blocked: 03_raw/ is human-managed inbox only."
    }));
    return;
  }

  if (PARTIAL_WRITE_TOOLS.has(toolName) || relPath.startsWith("wiki/") || relPath.startsWith("05_outputs/")) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // Basic validation
  const issues = [];
  const folder = relPath.split("/")[0];
  if (folder === "01_papers") {
    const filename = path.basename(relPath);
    const namingRegex = /^\d{4}_[a-z0-9_]+_[a-z0-9_]+\.md$/;
    if (!namingRegex.test(filename)) {
      issues.push(`filename '${filename}' must conform to the 'YYYY_firstauthor_shorttitle.md' convention (lowercase, underscores, digits, e.g. 2017_catney_ethnic_geographies.md)`);
    }
  }
  
  if (FALLBACK_REQUIRED_FIELDS[folder]) {
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      issues.push("missing leading YAML frontmatter block");
    } else {
      FALLBACK_REQUIRED_FIELDS[folder].forEach(field => {
        if (!frontmatter[field]) issues.push(`missing required field '${field}'`);
      });
    }
  }

  if (issues.length > 0) {
    process.stdout.write(JSON.stringify({
      continue: false,
      reason: `Validation failed for ${relPath}: ${issues.join("; ")}`
    }));
  } else {
    process.stdout.write(JSON.stringify({ continue: true }));
  }
}

try {
  main();
} catch (err) {
  process.stderr.write(`[BeforeTool] Fatal error: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
} finally {
  process.exit(0);
}
