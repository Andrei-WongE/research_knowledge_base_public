---
type: topic
status: stub
related: []
tags:
  - topic/concept
aliases: []
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.file.title %>

## Definition
> [!quote] Definition
> A concise definition of the concept.

## Core intuition
- 

## Semantic relationships
- **supports::** [[Related concept]]
- **contradicts::** [[Related concept]]
- **relates_to::** [[Related concept]]
- **depends_on::** [[Related concept]]

## Theoretical origin
- **first_proposed_by::** [[Author]]
- **key_paper::** [[Key paper]]
- **evolution::** 

## Evidence map
| Paper | Finding | Strength | Confidence |
|---|---|---|---|
| [[Paper A]] | Supports X | High (RCT) | High |
| [[Paper B]] | Contradicts X | Medium (case study) | Medium |

## Related debates
- 

## Research gaps
- 

## Automated mentions
```dataview
LIST FROM #sci/paper
WHERE contains(file.outlinks, this.file.link)
AND file.name != this.file.name
SORT file.name ASC
```
