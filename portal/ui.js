const select = id => document.getElementById(id);
const storeKey = "citta.local-chat.v1";
let saved;
try { saved = JSON.parse(sessionStorage.getItem(storeKey)); } catch {}
const session = saved ?? {conversationId:crypto.randomUUID(), turns:[]};
for (const turn of session.turns) if (turn.status === "Processing") turn.status = "Interrupted";
let active = session.turns.at(-1);
function persist() { try { sessionStorage.setItem(storeKey,JSON.stringify(session)); } catch {} }
function el(tag,text) {
  const node=document.createElement(tag);
  node.textContent=text;
  return node;
}
function render(follow = false) {
  const chat=select("chat");
  chat.replaceChildren();
  for (const turn of session.turns) {
    const button=el("button","");
    button.className="turn";
    button.setAttribute("aria-pressed",String(turn===active));
    button.append(el("b","You"),el("span",turn.text),el("b","Citta"),el("span",turn.reply || turn.status));
    button.onclick=()=>{ active=turn; render(); };
    chat.append(button);
  }
  if (follow) chat.scrollTop=chat.scrollHeight;
  if (!active) return;
  select("status").textContent=active.status+" · "+active.text;
  const flow=select("flow");
  flow.replaceChildren();
  for (const step of active.steps) {
    const item=el("li","");
    const details=el("details","");
    details.append(el("summary",step.service+" · "+step.ms+" ms"),el("p",step.reason),
      el("small","Input"),el("pre",JSON.stringify(step.input,null,2)),
      el("small","Output"),el("pre",JSON.stringify(step.output,null,2)));
    item.append(details,el("small",step.reason));
    flow.append(item);
  }
}
select("message").addEventListener("keydown", event=>{
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
    event.preventDefault();
    if (!select("send").disabled) document.querySelector("form").requestSubmit();
  }
});
document.querySelector("form").onsubmit=async event=>{
  event.preventDefault();
  const text=select("message").value.trim();
  if (!text || select("send").disabled) return;
  const turn={id:crypto.randomUUID(),text,reply:"",status:"Processing",steps:[]};
  active=turn;
  session.turns.push(turn);
  select("message").value="";
  select("send").disabled=true;
  persist();render(true);
  try {
    const response=await fetch("/message",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text,messageId:turn.id,conversationId:session.conversationId})});
    if (!response.ok) throw Error(await response.text());
    const reader=response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer="";
    while(true){
      const {done,value}=await reader.read();
      if(done) break;
      buffer+=value;
      const lines=buffer.split("\n");
      buffer=lines.pop();
      for(const line of lines){
        if(!line) continue;
        const item=JSON.parse(line);
        if(item.type==="error") throw Error(item.message);
        if(item.type==="step") turn.steps.push(item);
        if(item.type==="done"){turn.reply=item.reply;turn.status="Complete";}
      }
      render(true);
    }
    if(turn.status!=="Complete") throw Error("Response stream interrupted.");
  } catch(error){turn.status="Failed";turn.reply=error.message;}
  finally {persist();render(true);select("send").disabled=false;select("message").focus();}
};
render(true);
