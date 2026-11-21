"""Check repository documentation links and stable approved design identifiers.

Read-only documentation checks; no application execution or environment access.
"""
from pathlib import Path
import re
import unicodedata
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]
files = [ROOT / 'README.md', ROOT / 'AGENTS.md', *sorted((ROOT / 'doc').rglob('*.md'))]
errors = []

def anchors(path):
    found = set()
    duplicates = {}
    for heading in re.findall(r'^#{1,6}\s+(.+)$', path.read_text(), re.M):
        heading = heading.replace('`', '').strip().lower()
        slug = ''.join(c for c in heading if not unicodedata.category(c).startswith('P') or c in '-_')
        slug = slug.replace(' ', '-')
        count = duplicates.get(slug, 0)
        duplicates[slug] = count + 1
        found.add(slug + (f'-{count}' if count else ''))
    return found

for path in files:
    text = path.read_text()
    headings = re.findall(r'^#{1,6}\s+(.+)$', re.sub(r'```.*?```', '', text, flags=re.S), re.M)
    if len(headings) != len(set(headings)):
        errors.append(f'{path.relative_to(ROOT)}: duplicate section heading')
    # Remove code fences: examples and diagram labels are not Markdown links.
    text = re.sub(r'```.*?```', '', text, flags=re.S)
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
        if re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:', target):
            continue
        address, _, fragment = target.partition('#')
        resolved = (path.parent / unquote(address)).resolve() if address else path
        if not resolved.exists():
            errors.append(f'{path.relative_to(ROOT)}: missing {target}')
        elif fragment and resolved.suffix == '.md' and unquote(fragment) not in anchors(resolved):
            errors.append(f'{path.relative_to(ROOT)}: missing anchor {target}')

flow = (ROOT / 'doc/design/behavior-flows.md').read_text()
architecture = (ROOT / 'doc/design/architecture.md').read_text()
for prefix, count, text, pattern in [
    ('F', 26, flow, r'^## (F\d{2})\b'),
    ('S', 60, flow, r'^\| (S\d{2})\b'),
    ('W', 6, flow, r'^### (W\d{2})\b'),
    ('A', 10, architecture, r'^## (A\d{2})\b'),
]:
    actual = re.findall(pattern, text, re.M)
    expected = [f'{prefix}{i:02}' for i in range(1, count + 1)]
    if actual != expected:
        errors.append(f'Approved identifiers changed or duplicated: {prefix}')

# Deleted names must not remain in active prose or source links.
retired = ['Citta_Codex_Implementation_Runbook.md', 'Citta_Research_and_Requirements.md',
           'Citta_Architecture.md', 'Citta_Flowcharts.md', 'Testing-portal.md', 'Local-usage.md']
for path in files:
    for name in retired:
        if name in path.read_text():
            errors.append(f'{path.relative_to(ROOT)}: obsolete reference {name}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Checked {len(files)} Markdown files: local links/anchors and all A/F/S/W identifiers are valid.')
