---
name: wiki-indexer
description: Sync vault embeddings using @tobilu/qmd (Node.js version). Use when the user requests updating search embeddings, indexing new notes, or running the semantic search synchronization.
---
# wiki-indexer

## Overview
Sync vault embeddings using @tobilu/qmd (Node.js version).

## Rules
- **Dependency Check**: This skill uses the **Node.js version of qmd** (`@tobilu/qmd`) to enable **Hybrid Search** (vector embeddings + keyword search).
  - **Verification**: Run `qmd --version`. It should return `qmd 2.x.x`.
  - **Runtime Execution**: If the global `qmd` wrapper fails on Windows (e.g., error about `/bin/sh`), execute via the Node.js entry point using the portable `APPDATA` path:
    `node "$env:APPDATA\npm\node_modules\@tobilu\qmd\dist\cli\qmd.js" <command>`
    Alternatively, use `npx`:
    `npx -y @tobilu/qmd <command>`
- **Vault Root Constraint**: **ALL commands MUST be executed from the Vault Root.** 
  - **Verify**: The current directory should contain `01_papers/`, `02_topics/`, and `04_synthesis/`. **If you are in a subdirectory, `cd` to the root before proceeding.**

### 3. Systematic Synchronization Workflow
Maintain the semantic index by systematically running these commands:

```bash
# 1. Update the index (scans for new, renamed, or deleted files)
qmd update

# 2. Refresh embeddings (generates vectors for new content)
qmd embed
```

### 4. Semantic Retrieval (RRF Optimization)
Where possible, use the following MCP tools for query and search. These tools leverage **Reciprocal Rank Fusion (RRF)** to combine keyword and vector results:
- `mcp_qmd_query`: Perform hybrid search with auto-expansion. **Preferred** for relational discovery.
- `mcp_qmd_search`: Perform standard keyword search.

### 5. Collection Verification
Confirm that the following project collections are synchronized for hybrid retrieval:
- `papers` → `./01_papers/`
- `topics` → `./02_topics/`
- `synthesis` → `./04_synthesis/`

### 6. Semantic Search Spot-Check
After synchronization, verify the hybrid search engine is functional:
```bash
qmd search "segregation" --hybrid
```

## Related Skills
- **wiki-compiler**: Run `wiki-indexer` immediately after Zotero imports.
- **wiki-linter**: Run `wiki-linter` *before* indexing to ensure data quality.

## Allowed Tools
- `run_shell_command` (Allowed: `node`, `qmd`, `ls`, `cd`)

## Do Not
- Attempt to use the legacy Go `index` command syntax.
- Index `03_raw/` or `05_outputs/`.
- Run from subdirectories.
