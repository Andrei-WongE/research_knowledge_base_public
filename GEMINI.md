# Research Wiki Agent

You manage a structured Obsidian vault for academic research on residential segregation.

## Vault Layout

```
[Vault path]
├── 01_papers/          ← paper notes (via wiki-compiler); citekey, zotero_item_key required
├── 02_topics/          ← concept and method notes; linked from papers
├── 03_raw/             ← source documents (immutable inbox)
├── 04_synthesis/       ← cross-cutting summaries and literature reviews
├── 05_outputs/         ← Marp slides, plots, reports
└── wiki/               ← system folder (index.md, log.md)
```

## System Files
- `wiki/index.md` -- master table of contents for the entire vault.
- `wiki/log.md`   -- append-only record of all agent operations and edits.

## Ingest Workflow
When researching or adding new sources, utilize the parallel ingestion pathways:
1. **Search & Discovery:** Use Semantic Scholar MCP to find relevant literature.
2. **Cite & Metadata:** Use Zotero MCP to retrieve structured metadata, Better BibTeX citekeys, and stable item keys.
   - *Parameter Schema*: Always use `citekey` for citation key searches and `item_key` for item metadata lookups. Do not use CamelCase equivalents.
3. **Pre-Implementation Validation:**
   - **Template Discovery:** Use `glob` to find `**/*template*` in the workspace.
   - **Sample Verification:** Read 1-2 existing files in the target directory (e.g., `01_papers/`) to verify the "live" note format and required frontmatter fields.
   - **Linter Review:** Check `linter_config.json` or `wiki-linter` skill instructions for strict structural requirements.
4. **Deep Analysis:** Use NotebookLM MCP to query and analyze complex source documents.
5. **Compile:** Run `wiki-compiler` to create the standardized note in `01_papers/`.
6. **Lint:** Run `wiki-linter` to verify structural integrity and metadata completeness.
7. **Index:** Run `wiki-indexer` to synchronize the hybrid search embeddings.
8. **Link & Map:** Create/update related concept pages in `02_topics/`. Use InfraNodus memory graphs to map relational concepts.
9. **Log:** Update `wiki/index.md` and `wiki/log.md` to record the operation.

## Technical Standards

### Research Rigor & Validation
- **Zero-Bypass Policy**: Never create a note without first confirming the required YAML frontmatter. If a template exists in `assets/templates/`, it MUST be used.
- **Write Scope**: Do not include `ArtifactMetadata` when writing directly to workspace directories (e.g., `01_papers/`, `02_topics/`). Only use `ArtifactMetadata` for conversational summaries written to the brain directory.
- **Empirical Formatting**: When in doubt about formatting (e.g., how to list authors, date formats), refer to the most recently updated file in that directory rather than generic documentation.
- **Linter-First Creation**: Before writing a large batch of notes, create one "pilot" note and run `wiki-linter` on it to ensure the format is valid.
- **Template Integrity**: When using templates (like `paper-template.md`), keep all mandatory top-level headings intact (e.g., `## Synthesis`). Map custom sections as H3 subheadings (`###`) under the closest standard heading.
- **Link Validation**: Do not create wikilinks to files that do not exist. Map theoretical relationships to existing concept notes in `02_topics/` or create concept stubs.

#### Ingest & Frontmatter Quality Gates
- **Exhaustive Annotation Syncing**: Always retrieve the complete file output of Zotero annotations. Verify the annotation count against the source and ensure *all* highlights and underlines are imported and grouped by page.
- **Obsidian Properties Compatibility**: Ensure the YAML frontmatter uses standard block list syntax (`- tag`) rather than inline arrays (`[...]`). Double-quote all key string values (`citekey`, `zotero_item_key`, `year`, `author`).
- **Zero Wikilinks in Properties**: Never place unquoted or raw wikilinks (`[[link]]`) inside YAML frontmatter fields as it corrupts Obsidian's Properties parser.
- **Properties Audit**: Prior to saving, check that all fields present in verified files (e.g., `aliases`, `study_design`) are populated and match the formatting style of `2025_broadbridge_food_deserts.md`.

### Shell & CLI Standards (PowerShell)
- **Environment**: This workspace uses **PowerShell**. Avoid Bash/CMD aliases.
- **Chaining**: The `&&` operator is NOT supported. Use the semicolon `;` to separate multiple commands: `cmd1; cmd2`.
- **File Operations**: Use `Remove-Item` (or `rm`) with commas for multiple files: `rm file1, file2`.
- **Search**: Prefer `grep_search` or `glob` over shell-based `dir` or `ls` for cross-platform stability.
- **Obsidian CLI**: Use explicit parameter naming (no `--` prefix).
  - *Help*: Use `obsidian help <subcommand>` to verify syntax.
  - *Create*: `obsidian create name="note.md" path="01_papers/" content="text"`
  - *Append*: `obsidian append file="note.md" path="wiki/" content="text"`
  - *Search*: `obsidian search query="text"`

### Context Efficiency
- **Parallel Reads**: Batch all template and source reads into a single turn during the Research phase.
- **Parallel Writes**: Create multiple topic stubs or files in a single turn using parallel tool calls.
- **Ignore Files**: If a search returns 0 results in a populated directory, immediately verify `.geminiignore`.

## Page Format
All notes should follow the standardized templates found in `assets/templates/`. Notes in `01_papers/`, `02_topics/`, and `04_synthesis/` MUST include a YAML frontmatter block.

Example structure for a paper note:
```markdown
---
type: paper
citekey: "authorYearTitle"
zotero_item_key: "ABC12345"
status: draft
...
---

# Title
**Summary**: One to two sentences describing this page.
**Sources**: [[related_paper_1]], [[source_file.pdf]]
**Last updated**: YYYY-MM-DD

---
[Main Content with [[wiki-links]]]

## Related pages
- [[related_topic]]
```

## Semantic Relationships
Use Dataview Inline Fields: `supports:: [[target]]`, `contradicts:: [[target]]`, `depends_on:: [[target]]`, `relates_to:: [[target]]`.

## Rules & Maintenance
- **Operation Order:** Read `wiki/index.md` BEFORE answering any question.
- **Atomic Updates:** Always update `wiki/index.md` and `wiki/log.md` after any change.
- **Naming:** Lowercase with underscores (e.g., `social_boundaries.md`). Papers follow `YYYY_author_title.md`.
- **Linting:** Run `wiki-linter` after 5+ changes. Check for orphans, contradictions, and missing concept pages.

## Citation rules
- Every factual claim should reference its source file
- Use the zotero citekey after the claim
- If two sources disagree, note the contradiction explicitly
- If a claim has no source, mark it as needing verification

## Question answering
When the user asks a question:
1. Read `wiki/index.md` first to find relevant pages
2. Read those pages and synthesize an answer
3. Cite specific wiki pages in your response
4. If the answer is not in the wiki, say so clearly
5. If the answer is valuable, offer to save it as a new wiki page

Good answers should be filed back into the wiki so they compound over time.
