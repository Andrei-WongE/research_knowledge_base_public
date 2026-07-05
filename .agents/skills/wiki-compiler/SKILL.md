---
name: wiki-compiler
description: Convert Zotero items and raw markdown files into normalized Obsidian wiki notes using the official Obsidian CLI. Use when the user requests importing, compiling, or ingesting a new paper/source from Zotero or raw notes.
---
# wiki-compiler

## Overview
Convert Zotero items and raw markdown files into normalized Obsidian wiki notes using the official Obsidian CLI.

## Rules
- **Fetch from Zotero**: Use `mcp_zotero_zotero_search_items`, `mcp_zotero_zotero_get_item_metadata`, or `mcp_zotero_zotero_get_annotations`.
- **Note Naming**: `YYYY_firstauthor_shorttitle.md` (lowercase, underscores).
- **Split-Key Standard**: Always populate both `citekey` (human-readable Better BibTeX key) and `zotero_item_key` (stable 8-char random ID).
- **Persistence**: Templates include `{% persist %}` blocks. Re-compilation logic MUST preserve existing content within these blocks to avoid losing hand-written annotations.
- **Zotilo Integration**: Use the `zotero_item_key` for all `zotero://` URI deep-links to ensure link stability if metadata changes.

### Vault Operations (Favoring Obsidian CLI)
- **Check for existing note**: `obsidian search query="path:01_papers/ zotero_item_key:ID"`
- **Write/Create Note**: `obsidian create name="note_name.md" path="01_papers/" content="body"` (using `assets/templates/paper-template.md`)
- **Persistence**: Templates include `{% persist %}` blocks. Re-compilation logic MUST preserve existing content within these blocks.
- **Linking**: Automatically link new paper notes to relevant topic notes in `02_topics/` (using `assets/templates/topic-stub-template.md` for stubs).

### Topic Management
- Search `02_topics/` for existing concepts.
- If missing, create a stub using `obsidian create` with the topic template.

### Post-Import Tasks
- Suggest running `wiki-indexer` if multiple papers were imported.
- Run `wiki-linter` to verify structural integrity.

## Allowed Tools
- `run_shell_command` (Required for `obsidian` CLI, `date`, `wc`)
- `mcp_zotero_zotero_search_items`, `mcp_zotero_zotero_get_item_metadata`, `mcp_zotero_zotero_get_annotations`
- `mcp_obsidian_read_note` (Fallback if CLI read is unavailable)

## Do Not
- Write to 03_raw/, 04_synthesis/, or 05_outputs/.
- Overwrite existing note bodies without explicit user confirmation.
