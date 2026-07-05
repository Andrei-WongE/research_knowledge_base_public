---
name: research-paper-writing
description: Improve academic paper writing quality for ML/CV/NLP-style papers with clear section structure, paragraph flow, and reviewer-facing presentation. Use when drafting or revising Abstract, Introduction, Related Work, Method, Experiments, or Conclusion; polishing figures/tables; checking claim-support alignment; or performing self-review before submission.
---
# Research Paper Writing

## Overview
Use this skill to rewrite a research paper into a reviewer-friendly, high-clarity draft. Prioritize first-impression quality (figures/tables/layout), logical flow, and evidence-backed claims.

## Core Workflow
1. Clarify the paper story before sentence-level edits.
2. Use section-specific guidance in `references/`.
3. Rewrite paragraph-by-paragraph with one message per paragraph.
4. Run reverse outlining after writing each section.
5. Check every major claim in Abstract/Introduction against experimental evidence.
6. Run final-paper adversarial review with `references/paper-review.md`.

## Rules
1. **Paragraph Focus**: Keep one paragraph for one message only. State the message in the first sentence.
2. **Clarity & Flow**: Maintain sentence-to-sentence flow (cause, contrast, consequence, refinement). Define new terms before reuse. Run clarity check in `references/does-my-writing-flow-source.md`.
3. **Adversarial Self-Review**: Review as a skeptical reviewer using `references/paper-review.md`.
4. **Visual Quality**: Treat visual quality (figures, tables, layout) as core content, not decoration.
5. **Efficiency Constraint**: Do not load all section references at once; load only the specific section guide needed for the current edit target.

## Section Guides
Load only the needed section file:
- Introduction: `references/introduction.md`
- Abstract: `references/abstract.md`
- Related Work: `references/related-work.md`
- Method: `references/method.md`
- Experiments: `references/experiments.md`
- Conclusion: `references/conclusion.md`
- Paper review: `references/paper-review.md`
- Paragraph clarity: `references/does-my-writing-flow-source.md`
- Example bank index: `references/examples/index.md`

## Output Contract
When asked to rewrite or draft sections, return:
1. A compact section outline (3-7 bullets).
2. Revised paragraphs with explicit roles (opening/challenge/method/advantage/evidence/limitation).
3. A short self-review checklist covering clarity, flow, terminology, and evidence.
4. A claim-evidence map for each major claim: `Claim: ... | Evidence: ... | Status: supported/needs evidence`.
