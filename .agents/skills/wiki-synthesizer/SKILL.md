---
name: wiki-synthesizer
description: Perform cross-paper evidence mapping and generate synthesis notes. Use when the user requests synthesizing literature, cross-paper evidence mapping, resolving research gaps, or compiling literature review notes.
---
# wiki-synthesizer

## Overview
Perform cross-paper evidence mapping and generate synthesis notes. Use when the user requests synthesizing literature, cross-paper evidence mapping, resolving research gaps, or compiling literature review notes.

## Rules
1. **Identify Synthesis Goal**: Determine the research question or topic for synthesis.
2. **Pre-creation Semantic Routing (Mandatory)**: 
   - BEFORE creating a new note, use `qmd query` to search the vault for existing comparisons or conceptually similar structures.
   - If found, prefer updating the existing note or explicitly linking the new note to the existing ones using typed relationships.
   - Query the `papers` and `topics` collections for relevant evidence.
   - **Windows Hint**: If the `qmd` command fails, use `npx.cmd -y @tobilu/qmd search ...` or point directly to the JS file with `node`.
3. **Evidence Mapping**: Extract key findings from the search results, and identify supporting/conflicting papers.
4. **Create/Update Synthesis Note**:
   - Use `assets/templates/synthesis-note.md` to create a new note in `04_synthesis/`.
   - Ensure `type: synthesis` and `status: draft|complete` are in the frontmatter to pass hook validation.
5. **Cross-Linking**: Link the synthesis note back to all source papers, and update `02_topics/` notes with a link to the new synthesis.

## Related Skills

- **wiki-indexer**: Relies on `qmd` embeddings for searching.
- **academic-writing**: Use the output of `wiki-synthesizer` to draft the final manuscript.
- **systematic-review**: Follows PRISMA standards for structuring evidence.

## Allowed Tools

- `run_shell_command` (`qmd` search and string processing)
- `mcp_obsidian_read_note`, `mcp_obsidian_write_note`, `mcp_obsidian_search_notes`
- `mcp_zotero_zotero_search_items`, `mcp_zotero_zotero_get_item_metadata`

## Do Not

- Overwrite existing synthesis conclusions without explicit instruction.
- Generalize findings beyond what is supported by the indexed papers.
