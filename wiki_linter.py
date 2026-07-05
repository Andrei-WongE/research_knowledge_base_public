import os
import re

# Define directories to scan
MD_DIRS = ["01_papers", "02_topics", "04_synthesis"]
SYSTEM_DIR = "wiki"

# Mandatory template headers for papers
MANDATORY_HEADERS = [
    "## Research questions",
    "## Methodology",
    "## Connections",
    "## Findings",
    "## Synthesis",
    "## Annotations"
]

def main():
    # 1. Build map of all files in the vault (case-insensitive basename -> relative path)
    all_notes = {} # lowercase_basename -> relative_path
    all_files = set() # lowercase_relative_path
    
    for root, dirs, files in os.walk("."):
        # Skip hidden/system directories
        parts = root.split(os.sep)
        # Remove leading dot if present
        if parts and parts[0] == '.':
            parts = parts[1:]
        if any(part.startswith(".") or part in ["node_modules", "wiki/system"] for part in parts):
            continue
            
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), ".").replace("\\", "/")
            all_files.add(rel_path.lower())
            
            if file.endswith(".md"):
                basename = os.path.splitext(file)[0]
                all_notes[basename.lower()] = rel_path

    # Keep track of metrics
    errors = []
    warnings = []
    info = []
    
    # Track link relationships
    linked_targets = set() # lowercase names of linked notes
    zotero_keys = {} # zotero_item_key -> list of files
    
    # 2. Scan notes
    notes_to_scan = []
    for d in MD_DIRS:
        if os.path.exists(d):
            for file in os.listdir(d):
                if file.endswith(".md"):
                    notes_to_scan.append((d, file, os.path.join(d, file)))
                    
    # Also add wiki/index.md and wiki/log.md for link tracking, but handle them separately
    for file in ["index.md", "log.md"]:
        path = os.path.join(SYSTEM_DIR, file)
        if os.path.exists(path):
            notes_to_scan.append((SYSTEM_DIR, file, path))

    for folder, filename, path in notes_to_scan:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse frontmatter
        frontmatter = {}
        fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
        prose_content = content
        if fm_match:
            fm_text = fm_match.group(1)
            prose_content = content[fm_match.end():]
            
            # Simple line-by-line parsing of YAML frontmatter to avoid dependencies
            for line in fm_text.split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    frontmatter[key] = val
                    
        is_system_file = folder == SYSTEM_DIR
        
        # Word count of prose (approximate)
        # Strip code blocks, headers, and metadata lines
        clean_prose = re.sub(r"```.*?```", "", prose_content, flags=re.DOTALL)
        clean_prose = re.sub(r"^#+\s+.*", "", clean_prose, flags=re.MULTILINE)
        clean_prose = re.sub(r"^\s*[-*+]\s+.*", "", clean_prose, flags=re.MULTILINE)
        words = len(re.findall(r"\b\w+\b", clean_prose))
        
        # Extracted variables
        note_type = frontmatter.get("type")
        status = frontmatter.get("status")
        citekey = frontmatter.get("citekey")
        zotero_key = frontmatter.get("zotero_item_key")
        
        # Check Frontmatter (only for non-system files)
        if not is_system_file:
            if not note_type:
                errors.append(f"[{filename}] Missing `type` in YAML frontmatter.")
            if not status:
                errors.append(f"[{filename}] Missing `status` in YAML frontmatter.")
                
            if folder == "01_papers":
                if not citekey:
                    errors.append(f"[{filename}] Missing `citekey` in YAML frontmatter.")
                if not zotero_key:
                    errors.append(f"[{filename}] Missing `zotero_item_key` in YAML frontmatter.")
                elif zotero_key:
                    zotero_keys.setdefault(zotero_key, []).append(filename)

        # Check Template Compliance (only for papers)
        if folder == "01_papers":
            missing_headers = []
            for h in MANDATORY_HEADERS:
                # Check case-insensitively at the start of a line
                pattern = r"^\s*" + re.escape(h) + r"\b"
                if not re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
                    missing_headers.append(h)
            if missing_headers:
                errors.append(f"[{filename}] Missing template headers: {', '.join(missing_headers)}")

        # Check Content Quality (thin pages)
        if not is_system_file:
            if words < 100:
                warnings.append(f"[{filename}] Thin page ({words} words).")
            if status == "draft":
                info.append(f"[{filename}] (status: draft) Ready for further synthesis.")

        # Find Wikilinks
        # Format: [[Link]], [[Link|Alias]], [[Link#Heading]], [[Link#Heading|Alias]]
        # Strip code blocks to avoid false positives from programming syntax (e.g. R list indexing [[1]])
        content_no_code = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
        links = re.findall(r"\[\[(.*?)\]\]", content_no_code)
        for link in links:
            # Parse link target
            target = link.split("|")[0].split("#")[0].strip()
            if not target:
                continue
                
            # Normalize target path slashes
            target_norm = target.replace("\\", "/").strip("/")
            
            # Extract basename in case they wrote a path link like [[02_topics/bourdieu]]
            target_basename = target_norm.split("/")[-1]
            if target_basename.lower().endswith(".md"):
                target_basename = target_basename[:-3]
                
            target_basename_lower = target_basename.lower()
            target_norm_lower = target_norm.lower()

            # Exclude link tracking if it comes from index/log to avoid making everything a non-orphan
            if not is_system_file:
                linked_targets.add(target_basename_lower)
                
            # Check 1: Is it in the list of markdown note basenames?
            if target_basename_lower in all_notes:
                continue
                
            # Check 2: Is it a direct file path match (e.g. assets/images/image.png)?
            if target_norm_lower in all_files:
                continue
                
            # Check 3: Is it an asset path match relative to root or asset directory?
            # E.g. [[image.png]] when it is located in assets/image.png
            found_asset = False
            for f in all_files:
                if f.endswith("/" + target_norm_lower):
                    found_asset = True
                    break
            if found_asset:
                continue
                
            # If all checks fail, it is a broken link (except for log.md which is a historical record)
            if filename != "log.md":
                errors.append(f"[{filename}] Broken link: [[{link}]] (Target '{target}' not found)")

    # 3. Check for Duplicates
    for key, files in zotero_keys.items():
        if len(files) > 1:
            errors.append(f"[Duplicate Key] Zotero Item Key '{key}' shared by: {', '.join(files)}")

    # 4. Check for Orphans (excluding system files)
    all_valid_note_basenames = {os.path.splitext(f)[0].lower() for folder, f, p in notes_to_scan if folder != SYSTEM_DIR}
    orphans = all_valid_note_basenames - linked_targets
    
    # Filter orphans list to only files in MD_DIRS
    for folder, filename, path in notes_to_scan:
        if folder != SYSTEM_DIR:
            basename_lower = os.path.splitext(filename)[0].lower()
            if basename_lower in orphans:
                warnings.append(f"[{filename}] Orphan note (no other non-system notes link to it).")

    # 5. Build report markdown
    report_lines = [
        "---",
        "type: lint-report",
        f"generated: {os.popen('date /t').read().strip()} {os.popen('time /t').read().strip()}",
        "---",
        "",
        f"# Wiki Lint Report — {os.popen('date /t').read().strip()}",
        "",
        "## Summary",
        "| Check | Count |",
        "|-------|-------|",
        f"| Errors | {len(errors)} |",
        f"| Warnings | {len(warnings)} |",
        f"| Info / Drafts | {len(info)} |",
        "",
        "## Errors"
    ]
    
    if errors:
        for err in sorted(errors):
            report_lines.append(f"- [ ] {err}")
    else:
        report_lines.append("*None detected. The vault is currently 100% compliant with structural templates and link integrity.*")
        
    report_lines.append("")
    report_lines.append("## Warnings")
    
    # Group warnings into Thin Pages vs Orphans
    thin_warnings = [w for w in warnings if "Thin page" in w]
    orphan_warnings = [w for w in warnings if "Orphan note" in w]
    
    report_lines.append("### Thin Pages (< 100 words prose)")
    if thin_warnings:
        for w in sorted(thin_warnings):
            report_lines.append(f"- {w}")
    else:
        report_lines.append("*None.*")
        
    report_lines.append("")
    report_lines.append("### Orphan Notes")
    if orphan_warnings:
        for w in sorted(orphan_warnings):
            report_lines.append(f"- {w}")
    else:
        report_lines.append("*None.*")
        
    report_lines.append("")
    report_lines.append("## Info")
    report_lines.append("### Drafts Ready for Synthesis")
    if info:
        for inf in sorted(info):
            report_lines.append(f"- [ ] {inf}")
    else:
        report_lines.append("*None.*")
        
    report_lines.append("")
    report_lines.append("## Recommendations")
    if errors:
        report_lines.append("1. **Fix errors**: Address the template headers and broken links listed in the Errors section.")
    else:
        report_lines.append("1. **Synchronize embeddings**: Run `wiki-indexer` to update search embeddings.")
        
    # Write report
    os.makedirs("05_outputs", exist_ok=True)
    report_path = "05_outputs/lint-report.md"
    with open(report_path, "w", encoding="utf-8") as rf:
        rf.write("\n".join(report_lines))
        
    print(f"Linter finished. Errors: {len(errors)}, Warnings: {len(warnings)}, Info: {len(info)}")
    print(f"Report written to {report_path}")

if __name__ == "__main__":
    main()
