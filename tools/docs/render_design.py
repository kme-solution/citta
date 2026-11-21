"""Render the approved design sources using installed Graphviz and Poppler tools.

This documentation-only renderer never starts the application or reads .env.
"""
from pathlib import Path
import argparse
import math
import hashlib
import html
import json
import os
import re
import subprocess
import tempfile
import textwrap

ROOT = Path(__file__).resolve().parents[2]
os.chdir(ROOT)
OUTPUT = ROOT / "artifacts/design"
SOURCES = ["doc/design/architecture.md", "doc/design/behavior-flows.md"]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true", help="Check source and output hashes without rendering")
args = parser.parse_args()

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

if args.check:
    manifest = json.loads((OUTPUT / "manifest.json").read_text())
    for group in ("sources", "renderer", "outputs"):
        for path, expected in manifest[group].items():
            if not Path(path).is_file() or digest(path) != expected:
                raise SystemExit("Stale or missing design artifact input/output: " + path)
    print("Design source/output hashes match the rendered baseline.")
    raise SystemExit(0)

OUTPUT.mkdir(parents=True, exist_ok=True)
workspace = tempfile.TemporaryDirectory(prefix="citta-design-")
work = Path(workspace.name)
gallery_charts = []
FLOW_TEXT = Path(SOURCES[1]).read_text()
ARCH_TEXT = Path(SOURCES[0]).read_text()
FLOW_COUNT = len(re.findall(r'^## F\d{2}\b', FLOW_TEXT, re.M))
SCENARIO_COUNT = len(re.findall(r'^\| S\d{2}\b', FLOW_TEXT, re.M))
WALK_COUNT = len(re.findall(r'^### W\d{2}\b', FLOW_TEXT, re.M))
ARCH_COUNT = len(re.findall(r'^## A\d{2}\b', ARCH_TEXT, re.M))
DECISION_COUNT = sum(line.startswith('| ') and not line.startswith('| Concern') and len(line.split('|')[1:-1]) == 2 for line in ARCH_TEXT.splitlines())
SCENARIO_PAGES = math.ceil(SCENARIO_COUNT / 6)
FLOW_TOTAL = 1 + FLOW_COUNT + SCENARIO_PAGES + WALK_COUNT + 1
STACK_RECORDS = [tuple(cell.strip() for cell in line.split("|")[1:-1]) for line in ARCH_TEXT.splitlines() if line.startswith("| ") and not line.startswith("| Layer") and len(line.split("|")[1:-1]) == 3]
STACK_PAGES = math.ceil(len(STACK_RECORDS) / 6)
ARCH_TOTAL = 1 + ARCH_COUNT + STACK_PAGES + math.ceil(DECISION_COUNT / 7) + 1
def q(s):return '"'+s.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n')+'"'
def wrap(s,width=36):return '\n'.join('\n'.join(textwrap.wrap(part,width)) for part in s.split('\n'))
def render(dot,name):
 p=work/(name+'.pdf');subprocess.run(['dot','-Tpdf','-o',str(p)],input=dot.encode(),check=True);return p
def pagination(name):
 if name.startswith('behavior-'):
  suffix=name.removeprefix('behavior-');total=FLOW_TOTAL
  if suffix=='cover':page=1
  elif suffix.isdigit():page=int(suffix)+1
  elif suffix.startswith('scenarios-'):page=2+FLOW_COUNT+int(suffix.split('-')[-1])//6
  elif suffix.startswith('walkthrough-'):page=1+FLOW_COUNT+SCENARIO_PAGES+int(suffix.split('-')[-1])
  else:page=FLOW_TOTAL
 else:
  suffix=name.removeprefix('architecture-');total=ARCH_TOTAL
  if suffix=='cover':page=1
  elif suffix.isdigit():page=int(suffix)+1
  elif suffix.startswith('stack-'):page=2+ARCH_COUNT+int(suffix.split('-')[-1])//6
  elif suffix.startswith('decisions-'):page=2+ARCH_COUNT+STACK_PAGES+int(suffix.split('-')[-1])//7
  else:page=ARCH_TOTAL
 return 'Page '+str(page)+' of '+str(total)
def textpage(title,subtitle,blocks,name):
 subtitle += ' | '+pagination(name)
 rows=[]
 for heading,body in blocks:
  rows.append('<TR><TD ALIGN="LEFT" BGCOLOR="#eaf2ed" CELLPADDING="10"><B>'+html.escape(heading)+'</B></TD></TR>')
  rows.append('<TR><TD ALIGN="LEFT" CELLPADDING="10">'+html.escape(wrap(body,100)).replace('\n','<BR ALIGN="LEFT"/>')+'</TD></TR>')
 table='<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">'+''.join(rows)+'</TABLE>>'
 dot='digraph G { graph [bgcolor="white",pad="0.4",label='+q(title+'\n'+subtitle)+',labelloc=t,fontname="DejaVu Sans",fontsize=22]; node [shape=plain,fontname="DejaVu Sans",fontsize=12]; content [label='+table+'];}'
 return render(dot,name)
def chart(title,code,caption,number,total,name):
 nodes={};edges=[]
 def node(token):
  m=re.fullmatch(r'(\w+)(?:\["([^"]+)"\]|\{"([^"]+)"\})?',token.strip())
  if not m:raise ValueError(token)
  key,a,b=m.groups()
  if a or b:nodes[key]=(a or b,'diamond' if b else 'box')
  else:nodes.setdefault(key,(key,'box'))
  return key
 if code.startswith('flowchart'):
  for line in code.splitlines()[1:]:
   if not line.strip():continue
   a,label,b=re.fullmatch(r'\s*(.*?)\s*-->\s*(?:\|"([^"]*)"\|\s*)?(.*?)\s*',line).groups();edges.append((node(a),node(b),label or ''))
 elif code.startswith('stateDiagram'):
  for line in code.splitlines()[1:]:
   if not line.strip():continue
   a,b,label=re.fullmatch(r'\s*(.*?)\s*-->\s*(.*?)(?::\s*(.*))?',line).groups();a=a.strip();b=b.strip()
   a='start' if a=='[*]' else a;b='finish' if b=='[*]' else b
   nodes.setdefault(a,(a,'ellipse'));nodes.setdefault(b,(b,'ellipse'));edges.append((a,b,label or ''))
 else:
  participants={};previous=None
  for line in code.splitlines()[1:]:
   line=line.strip()
   if line.startswith('participant '):
    key,label=line.removeprefix('participant ').split(' as ');participants[key]=label
   elif '->>' in line:
    a,b,label=re.fullmatch(r'(\w+)->>(\w+):\s*(.*)',line).groups();key='event'+str(len(nodes)+1)
    nodes[key]=(participants[a]+' to '+participants[b]+'\n'+label,'box')
    if previous:edges.append((previous,key,''))
    previous=key
 heading=title.replace('·','-')+'\nDesign refinement | 2026-11-22 | Diagram '+str(number)+' of '+str(total)+' | '+pagination(name)
 dot=['digraph G {','graph [rankdir=TB,bgcolor="white",pad="0.45",nodesep="0.35",ranksep="0.55",labelloc=t,label='+q(heading)+',fontname="DejaVu Sans",fontsize=21];','node [fontname="DejaVu Sans",fontsize=13,style="rounded,filled",fillcolor="#f1f6f2",color="#3a6b58",margin="0.18,0.12"];','edge [fontname="DejaVu Sans",fontsize=11,color="#557369"];']
 for key,(label,shape) in nodes.items():dot.append(key+' [label='+q(wrap(label))+',shape='+shape+'];')
 for a,b,label in edges:dot.append(a+' -> '+b+' [label='+q(label)+'];')
 footer=wrap(caption.replace('`',''),110)+'\nCitta design review - source: '+('doc/design/behavior-flows.md' if name.startswith('behavior') else 'doc/design/architecture.md')+' | Not implemented or verified runtime behavior'
 dot.append('footer [shape=plain,style="",fontsize=11,label='+q(footer)+'];')
 dot.append('{rank=sink; footer;}')
 # Keep explanatory text below the graph without changing logical edges.
 outgoing={a for a,_,_ in edges};sinks=[key for key in nodes if key not in outgoing]
 if not sinks:sinks=[list(nodes)[-1]]
 for key in sinks:dot.append(key+' -> footer [style=invis];')
 dot.append('}')
 data = '\n'.join(dot)
 if name.startswith('behavior-'):
  svg = subprocess.run(['dot', '-Tsvg'], input=data.encode(), capture_output=True, check=True).stdout.decode()
  gallery_charts.append((title.split()[0], title, svg[svg.index('<svg'):]))
 return render(data, name)
def charts(path,prefix):
 s=Path(path).read_text();matches=list(re.finditer(r'## ([FA]\d+[^\n]*)\n\n```mermaid\n(.*?)\n```',s,re.S));pages=[]
 for i,m in enumerate(matches,1):
  tail=s[m.end():].split('\n## ',1)[0].strip();caption=tail.split('\n\n')[0]
  if not caption:caption='See the editable source document for scope and interpretation.'
  pages.append(chart(m[1],m[2],caption,i,len(matches),prefix+'-'+str(i).zfill(2)))
 return s,matches,pages
flow,matches,flowpages=charts('doc/design/behavior-flows.md','behavior')
cover=textpage('Citta - Behavior Flow Diagrams','Design baseline and initiative refinement | 2026-11-22 | Target behavior',[
 ('Purpose','Review a continuing agent that attends to one object at a time, checkpoints unfinished commitments, responds to interruptions and resumes work. With no pending task, persistent interests/ambitions can originate fresh topics, bounded activity or appropriate conversation.'),
 ('Reading route','F01: whole lifecycle. F03: interrupt and resume. F08: contextual feeling model. F11-F15: consideration, advice, action and review. F17-F18: cancellation/recovery. F21-F26: internal motivation, fresh topics, proactive contact and improvement.'),
 ('Contents',f'{FLOW_COUNT} drawn diagrams, {SCENARIO_COUNT} scenario examples and {WALK_COUNT} multi-event walkthroughs. Each diagram has an explanatory note. Sources and modeling boundaries appear at the end.'),
 ('Modeling boundary','The diagrams describe engineering behavior inspired by cited teachings and Theravada manual models. They do not prove subjective feeling, consciousness, attainment or human equivalence. Application operations are not literal thought-moments.'),
 ('Editable source','doc/design/behavior-flows.md. Development order is in doc/delivery/plan.md; actual progress/evidence is in doc/delivery/status.md.')], 'behavior-cover')
flowpages.insert(0,cover)
rows=[line.split('|')[1:-1] for line in flow.splitlines() if re.match(r'\| S\d+',line)]
for start in range(0,len(rows),6):
 blocks=[]
 for cells in rows[start:start+6]:
  sid,trigger,appraisal,response,refs=[x.strip() for x in cells]
  blocks.append((sid+' - '+trigger,'Consideration: '+appraisal+'\nRequired behavior: '+response+'\nRelated diagrams: '+refs))
 flowpages.append(textpage('Scenario review '+str(start+1)+'-'+str(min(start+6,len(rows))),'Possible modeled appraisals, not universal claims about human feeling',blocks,'behavior-scenarios-'+str(start)))
for index,m in enumerate(re.finditer(r'### (W\d+[^\n]*)\n\n(.*?)(?=\n### |\n## |\Z)',flow,re.S),1):
 blocks=[]
 for line in m[2].splitlines():
  if re.match(r'\d+\. ',line):n,body=line.split('. ',1);blocks.append(('Step '+n,body))
 flowpages.append(textpage(m[1].replace('·','-'),'Multi-event scenario | Observe continuity, interpretation and response',blocks,'behavior-walkthrough-'+str(index)))
refs=[('Feeling and response','MN 148: https://www.dhammatalks.org/suttas/MN/MN148.html\nSN 36.6: https://www.dhammatalks.org/suttas/SN/SN36_6.html'),('Reflection and speech','MN 61: https://www.dhammatalks.org/suttas/MN/MN61.html\nMN 58: https://www.dhammatalks.org/suttas/MN/MN58.html'),('Theravada manual model','Narada Sangaha translation, chapters III-IV:\nhttps://palikanon.com/english/sangaha/chapter_3.htm\nhttps://www.palikanon.com/english/sangaha/chapter_4.htm'),('Interpretation boundaries','Feeling tone, reaction, emotion and long-term mood are distinct modeling concerns. Queues, interruption policies and numerical scores are engineering additions. Mental factors are not shown as a literal series of clock ticks. A text-only agent has no biological body; resource failures are not bodily pain.'),('Review status','Drawings describe the approved target design. General language interpretation, richer learning and human-like subjective experience are not established capabilities. Software correctness and doctrinal review remain separate. No application code changed for this document task.')]
flowpages.append(textpage('Sources and design boundaries','Read with doc/reference/model.md',refs,'behavior-sources'))
arch,amatches,archpages=charts('doc/design/architecture.md','architecture')
archpages.insert(0,textpage('Citta - System Architecture','Design baseline and initiative refinement | 2026-11-22 | Target architecture',[
 ('Purpose','A local modular monolith with durable observations, commitments, attention, consideration, action and review. One foreground decision writer per agent; asynchronous input and ability effects are queued.'),
 ('Contents',f'{ARCH_COUNT} drawn architecture views: deployment, ownership, lineage, transactions, foreground continuity, doctrine/application separation, replay, internal motivation, proactive interaction/improvement boundaries and agreed technology deployment.'),
 ('External AI','Codex is an optional adviser. Its local CLI may contact an external provider. It cannot own agent identity, silently promote advice to fact, or grant itself permissions.'),
 ('Scope','Reuse Node.js, TypeScript, PostgreSQL and current catalog/fixture foundations. The stack selects Fastify, React/Vite, Temporal and local Ollama cognition. Actual model/hardware selection remains an evaluation gate; remote hosting and unrestricted learning are outside the first slice.'),
 ('Editable source','doc/design/architecture.md. Contracts are in doc/design/contracts.md; development order is in doc/delivery/plan.md; progress is in doc/delivery/status.md.')],'architecture-cover'))
for start in range(0, len(STACK_RECORDS), 6):
 stack_blocks = [(layer + ': ' + selection, qualification) for layer, selection, qualification in STACK_RECORDS[start:start + 6]]
 archpages.append(textpage('Agreed technology stack', 'Accepted 2026-11-22; model and hardware evaluation pending', stack_blocks, 'architecture-stack-' + str(start)))
entries=[]
for line in arch.splitlines():
 if line.startswith('|') and not line.startswith('|---') and not line.startswith('| Concern'):
  cells=[x.strip() for x in line.split('|')[1:-1]]
  if len(cells)==2:entries.append(tuple(cells))
for start in range(0,len(entries),7):archpages.append(textpage('Architecture decisions','Initial boundaries for implementation review',entries[start:start+7],'architecture-decisions-'+str(start)))
archpages.append(textpage('Architecture review and acceptance','Approved structure, not completed implementation',[
 ('First delivery','Use doc/delivery/plan.md for dependency-gated development. Start with P0 executable contracts. Actual completion and open decisions are tracked only in doc/delivery/status.md.'),
 ('Required evidence','Show one ordered foreground stream across interruptions; preserve goal criteria, pending effects and budgets. Verify local-sufficient tasks make zero adviser calls. Verify advice remains attributed and results are reviewed.'),
 ('Recovery','Test duplicate input, stale claims, restart during dispatch, late results after cancellation and unknown external effects. Offline replay must be unable to invoke live abilities.'),
 ('Doctrine boundary','Use doc/reference/model.md for source selection and interpretation boundaries. Architecture arrows express data flow and ownership, not literal mental causation. Keep doctrinal simulation and application traces separate.'),
 ('Limitations','No application build, migration or runtime test was run for PDF authoring. Existing implementation does not yet satisfy this target. Follow AGENTS.md and the development-plan verification requirements before claiming completion.')],'architecture-review'))
for name,pages in [('behavior-flows',flowpages),('architecture',archpages)]:
 out=OUTPUT/(name+'.pdf')
 subprocess.run(['pdfunite',*[str(p) for p in pages],str(out)],check=True)
 print(str(out)+': '+str(len(pages))+' pages')

assert len(matches) == FLOW_COUNT and len(amatches) == ARCH_COUNT
assert len(rows) == SCENARIO_COUNT
assert len(gallery_charts) == FLOW_COUNT
nav = "".join(f'<a href="#{key}">{html.escape(title)}</a>' for key, title, _ in gallery_charts)
sections = "".join(
    f'<section id="{key}"><h2>{html.escape(title)}</h2>'
    '<button type="button" data-zoom="160%">Enlarge</button>'
    '<button type="button" data-zoom="100%">Fit</button>'
    f'<div class="chart">{svg}</div><a href="#top">Back to index</a></section>'
    for key, title, svg in gallery_charts
)
page = """<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Citta behavior flows</title>
<style>body{font:16px/1.6 system-ui;margin:0;background:#f6f7f4;color:#20382e}
main{max-width:1200px;margin:auto;padding:28px}nav{display:grid;gap:6px}
section{background:white;padding:22px;margin:28px 0;border:1px solid #cbd9cf;border-radius:12px}
.chart{overflow:auto}svg{display:block;max-width:none;width:var(--chart-width,100%);height:auto;margin:auto}
button{font:inherit;padding:5px 12px;margin:0 6px 10px 0;cursor:pointer}
a{color:#226148}h1,h2{line-height:1.25}@media print{section{break-before:page}nav,button{display:none}}</style>
<main id="top"><h1>Citta behavior flows</h1>
<p>Approved design baseline - target behavior, not completed implementation.</p>
<p>Editable source: <a href="../../doc/design/behavior-flows.md">behavior flows and scenario atlas</a>.
Review the <a href="../../doc/README.md">documentation index</a> for authority and current status.</p>
<p>Graphviz rendering of Mermaid relationships; F04 is shown as ordered sender/recipient interactions.</p>
<nav>""" + nav + '</nav>' + sections + """</main><script>
document.addEventListener('click',event=>{const b=event.target.closest('button[data-zoom]');
if(b)b.closest('section').style.setProperty('--chart-width',b.dataset.zoom);});
</script></html>"""
(OUTPUT / "flowcharts.html").write_text(page)
outputs = [str((OUTPUT / name).relative_to(ROOT)) for name in ("behavior-flows.pdf", "architecture.pdf", "flowcharts.html")]
manifest = {
    "baseline": "accepted behavior, internal initiative and technology stack, 2026-11-22",
    "sources": {path: digest(path) for path in SOURCES},
    "renderer": {"tools/docs/render_design.py": digest(__file__)},
    "outputs": {path: digest(path) for path in outputs},
    "diagrams": {"behavior": FLOW_COUNT, "architecture": ARCH_COUNT},
    "scenarios": SCENARIO_COUNT,
    "walkthroughs": WALK_COUNT,
}
(OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
workspace.cleanup()
print("Rendered gallery and source/output manifest.")
