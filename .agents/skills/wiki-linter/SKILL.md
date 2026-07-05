---
name: wiki-linter
description: Audit the vault for structural problems using native Windows tools or Obsidian CLI. Use when the user requests a wiki lint, checking for broken links, verifying template compliance, or auditing note frontmatter.
---
# wiki-linter

## Overview
Audit the vault for structural problems using native Windows tools or Obsidian CLI.

## Rules
- **Windows Portability**: Perform vault-wide structural audits using native shell tools or the Obsidian CLI. **Always use relative paths from the workspace root.**
- **Check for missing frontmatter**: Use `grep_search` or PowerShell's `Select-String` to identify notes in `01_papers/`, `02_topics/`, and `04_synthesis/` missing required YAML fields (`type`, `status`, and `citekey`/`zotero_item_key` for papers).
- **Check for template compliance**: For notes in `01_papers/`, explicitly verify the presence of mandatory internal section headers defined in the vault template: `## Research questions`, `## Methodology`, `## Connections`, `## Findings`, `## Synthesis`, and `## Annotations`. Identify files missing any of these specific headers.
- **Identify broken links**: Use `grep_search` to extract `[[Link]]` syntax and verify target existence against the file system relative to the workspace. *Crucial:* Obsidian wikilinks may include folder paths (e.g. `[[02_topics/file]]`). Make sure to extract just the basename (e.g. `file`) before checking if it exists in the vault to avoid false positives.
- **Search for duplicates**: Identify papers sharing the same `zotero_item_key` across `01_papers/`.

### Severity Levels
- **Error**: Missing `type`, `citekey`, `zotero_item_key` (papers), broken wikilinks, or missing mandatory template section headers (`## Methodology`, `## Findings`, etc.). *Note: Errors in newly created notes may indicate a bypass of 'before-tool.js' or legacy notes predating current hooks.*
- **Warning**: Orphan notes, thin pages (<100 words prose), or legacy Notion artifacts (e.g., `[[My_notes.base]]`).
- **Info**: Notes with `status: draft` ready for further synthesis.

### 3. Reporting
- Write the audit report to `05_outputs/lint-report.md`.
- When referring to note files in the report, use the standard `YYYY_firstauthor_shorttitle.md` naming convention.

### 4. Auto-fix Mode (Safety First)
- **Confirm fixes with user**: Only auto-fix safe frontmatter fields (e.g., `status`, `tags`, `created`, `updated`).
- **Do NOT** auto-fix `zotero_item_key`, `citekey`, `type`, or delete files without explicit confirmation.

## Related Skills
- **wiki-compiler**: Suggest `wiki-compiler` for notes with missing Zotero metadata.
- **wiki-indexer**: Run `wiki-indexer` *after* linting to ensure valid data is indexed.

## Allowed Tools
- `run_shell_command` (Allowed: `obsidian` CLI, `Select-String`, `wc`, `cat`, `echo`)
- `grep_search` (Preferred for performance)
- `mcp_obsidian_read_note`
- `mcp_obsidian_write_note`

## Do Not
- Hardcode absolute paths or user-specific directories.
- Use Unix-only commands like `grep` unless verified available.
- Write to `03_raw/`.
