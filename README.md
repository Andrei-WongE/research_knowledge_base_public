# Obsidian Agentic Research Vault Template

A boilerplate structure and toolset for running a structured Obsidian vault optimized for academic literature research and automated systems workflows. This template showcases a hardened **5-Layer Reference Agentic Architecture** for co-programming with agentic AI models (e.g. Google Antigravity, Claude Code, Gemini CLI).

## 🚀 5-Layer Reference Architecture

This repository contains the configuration, hooks, and custom skills implementing a deterministic, safe, and observable agentic pipeline:

1. **Layer 1: 4-Phase State Machine** (`PLAN` -> `ACT` -> `OBSERVE` -> `REVIEW`): Enforces step budgets and clear boundaries for LLM execution loops to prevent runaway token expenditure.
2. **Layer 2: Dual-Tier Memory + Action-Attempt Hash Register**: Implements a disk-backed key-value memory store and md5-based action deduplication to instantly break duplicate retry loops.
3. **Layer 3: Permission-Tagged Tool Registry**: Controls access to file operations and system execution tools.
4. **Layer 4: Hybrid Judge / Hard Gates**: Runs zero-token structural linting checks and python-based regex validations prior to sending code to qualitative LLM rubrics.
5. **Layer 5: Squad Orchestrator**: Dispatches specialized, instruction-restricted subagents for parallel execution of isolated subtasks.

---

## 📂 Vault Structure

```
├── .agents/                 # Agent configuration
│   ├── hooks.json           # Event hooks for agent invocation
│   ├── mcp_config.json      # Model Context Protocol servers
│   └── skills/              # Custom agent skills (compiling, linting, memory)
├── .github/
│   └── workflows/           # CI pipelines (secret scanning, PR visual recaps)
├── 01_papers/               # Standardized literature notes (YAML metadata + citations)
├── 02_topics/               # Concept and methodological topic stubs
├── 03_raw/                  # Inbox for unprocessed PDFs/documents
├── 04_synthesis/            # Literature maps and cross-cutting reviews
├── 05_outputs/              # Presentation slides, reports, and charts
├── assets/
│   └── templates/           # Markdown templates for papers, topics, and logs
├── wiki/                    # System log, vault index, and hooks
└── wiki_linter.py           # Custom Python script for structural link checking
```

---

## 🛠️ Getting Started

1. **Clone the repository** to your local machine.
2. **Environment Configuration**:
   * Rename `.env.example` to `.env`.
   * Fill in your API keys (`GEMINI_API_KEY`, `GITHUB_TOKEN`, `OBSIDIAN_API_KEY`).
3. **Configure MCP Servers**:
   * Inspect and customize `.agents/mcp_config.json` to configure connections to local Obsidian, Zotero, and Notion APIs.
4. **Run the Linter**:
   * Run the structural validator suite:
     ```bash
     python wiki_linter.py
     ```
