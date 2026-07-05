---
type: paper
citekey: "{{citekey}}"
zotero_item_key: "{{zotero_item_key}}"
status: draft
aliases:
  - "{{title}}"
author:
  - "{{authors}}"
year: "{{year}}"
journal: "{{publication}}"
DOI: "{{doi}}"
url: "{{url}}"
zotero_link: "zotero://select/library/items/{{zotero_item_key}}"
study_design:
tags:
  - sci/paper
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
---

# {{title}}

> [!abstract]+ Abstract
> {{abstract}}

## Research questions
- 

```dataview
TABLE L.text AS "Question", L.children.text AS "Potential answer"
FROM ""
FLATTEN file.lists AS L
WHERE file.path = this.file.path
WHERE contains(L.tags, "#Q")
```

## Methodology
- **Study design::** 
- **Confidence::** high | medium | low
- **Data source::** 
- **Sample / scope::** 
- **Identification strategy::** 
- **Biases / limitations::** 

## Connections
- **supports::** [[Concept or Paper]]
- **contradicts::** [[Concept or Paper]]
- **relates_to::** [[Concept or Paper]]
- **depends_on::** [[Concept or Paper]]
- **project::** [[Project name]]
- **my_take::** 

## Findings
- **finding_1::** 
- **finding_2::** 

## Synthesis
- **related_concepts::** [[Concept name]]
- **conflicting_evidence::** [[Other paper]]
- **next_note::** [[Follow-up note]]

## Annotations
%% begin_annotations %%
{% persist "annotations" %}
{{annotations}}
{% endpersist %}
%% end_annotations %%
