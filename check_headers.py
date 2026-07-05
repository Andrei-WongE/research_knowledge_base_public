import os

headers = ["## Research questions", "## Methodology", "## Connections", "## Findings", "## Synthesis", "## Annotations"]
directory = "01_papers"
missing_count = 0

with open("strict_headers_report.txt", "w", encoding="utf-8") as out:
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                missing = [h for h in headers if h not in content]
                if missing:
                    missing_count += 1
                    out.write(f"{filename} is missing: {', '.join(missing)}\n")

print(f"Check complete. Files missing headers: {missing_count}")
