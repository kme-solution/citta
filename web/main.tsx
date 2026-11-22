import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {RuntimeState, Message} from './types.ts';
import {api} from './api.ts';
import {MemoryRecords} from './MemoryRecords.tsx';
import {MindPage} from './MindPage.tsx';
import {ActivityPage} from './ActivityPage.tsx';
import './style.css';
type View = 'inbox'|'activity'|'mind'|'memory'|'catalog';
type Pending = {conversationId:string;messageId:string;text:string;replyToContactId?:string};
function readPending(): Pending|null { try {return JSON.parse(localStorage.getItem('citta.pending')||'null');} catch {return null;} }
const timestamp = (value: string) => new Date(value).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function App() {
  const [view,setView]=useState<View>(()=>location.hash.startsWith('#/activity')?'activity':'inbox');
  const [state,setState]=useState<RuntimeState|null>(null);
  useEffect(()=>{const navigate=()=>{if(location.hash.startsWith('#/activity'))setView('activity');};window.addEventListener('hashchange',navigate);return()=>window.removeEventListener('hashchange',navigate);},[]);
  const [loadedConversation,setLoadedConversation]=useState<string|null>(null);
  const [conversation,setConversation]=useState(()=>localStorage.getItem('citta.conversation')||'');
  const [draft,setDraft]=useState('');
  const [replyTo,setReplyTo]=useState<string|undefined>();
  const [pending,setPending]=useState<Pending|null>(readPending);
  const [sending,setSending]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [connected,setConnected]=useState(false);
  const [health,setHealth]=useState<Record<string,string>>({});
  const [catalog,setCatalog]=useState<Record<string,unknown>>({});
  const [catalogType,setCatalogType]=useState('citta');
  const [projection,setProjection]=useState('summary');
  const [older,setOlder]=useState<Message[]>([]);
  const [loadingOlder,setLoadingOlder]=useState(false);
  const [historyEnd,setHistoryEnd]=useState(false);
  const previousHeight=useRef(0);
  const previousWindow=useRef<Message[]>([]);
  const historyRequested=useRef(false);
  const [search,setSearch]=useState('');
  const [jump,setJump]=useState(false);
  const bottom=useRef<HTMLDivElement>(null);
  const thread=useRef<HTMLDivElement>(null);
  const follow=useRef(true);
  const loadVersion=useRef(0);
  const draftRef=useRef<HTMLTextAreaElement>(null);
  const load=useCallback(async()=> {
    const version=++loadVersion.current;
    try {
      const next=await api<RuntimeState>('/api/state'+(conversation?'?conversationId='+conversation:''));
      if (version!==loadVersion.current) return;
      if(historyRequested.current)setOlder(current=>Array.from(new Map([...current,...previousWindow.current].map(m=>[m.id,m])).values()));
      previousWindow.current=next.messages;
      setState(next);setLoadedConversation(conversation);
      if (!conversation && next.conversations.length) setConversation(next.conversations[0].id);
    } catch (e) {if (version===loadVersion.current) setError(e instanceof Error?e.message:'State unavailable.');}
  },[conversation]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{if (conversation) localStorage.setItem('citta.conversation',conversation);},[conversation]);
  useEffect(()=> {
    let timer:ReturnType<typeof setTimeout>|undefined;
    const refresh=()=> {if (!timer) timer=setTimeout(()=>{timer=undefined;void load();},150);};
    const events=new EventSource('/api/events');
    events.onopen=()=>{setConnected(true);refresh();};
    events.onerror=()=>setConnected(false);
    events.addEventListener('change',refresh);
    events.addEventListener('unavailable',()=>setConnected(false));
    const interval=setInterval(()=>{void load();void api<Record<string,string>>('/api/health').then(setHealth).catch(()=>setHealth({database:'unavailable'}));},10000);
    void api<Record<string,string>>('/api/health').then(setHealth).catch(()=>{});
    return ()=>{events.close();clearInterval(interval);clearTimeout(timer);};
  },[load]);
  useLayoutEffect(()=> {
    if(view!=='inbox')return;
    if(follow.current){const element=thread.current;if(element)element.scrollTop=element.scrollHeight;}
    else setJump(true);
  },[view,conversation,state?.messages.length,state?.messages.at(-1)?.id]);
  useEffect(()=> {
    const element=thread.current;if(!element)return;
    const observer=new ResizeObserver(()=>{if(follow.current)element.scrollTop=element.scrollHeight;});
    observer.observe(element);return ()=>observer.disconnect();
  },[view,conversation]);
  useEffect(()=>{follow.current=true;setJump(false);setReplyTo(undefined);setOlder([]);setHistoryEnd(false);previousWindow.current=[];historyRequested.current=false;},[conversation]);
  useLayoutEffect(()=>{if(previousHeight.current&&thread.current){thread.current.scrollTop+=thread.current.scrollHeight-previousHeight.current;previousHeight.current=0;}},[older]);
  useEffect(()=> {
    const seen=()=>{if(view==='inbox'&&conversation&&document.visibilityState==='visible')void api('/api/seen',{conversationId:conversation}).catch(()=>{});};
    seen();document.addEventListener('visibilitychange',seen);
    return ()=>document.removeEventListener('visibilitychange',seen);
  },[view,conversation,state?.messages.at(-1)?.id]);
  useEffect(()=>{if(view==='catalog' && !catalog.citta) void api<Record<string,unknown>>('/api/catalog').then(setCatalog).catch(e=>setError(e.message));},[view,catalog.citta]);
  async function send(retry?:Pending) {
    const text=retry?.text||draft.trim();
    if (!text || sending) return;
    const request=retry||{conversationId:conversation||crypto.randomUUID(),messageId:crypto.randomUUID(),text,...(replyTo?{replyToContactId:replyTo}:{})};
    setSending(true);setError('');setPending(request);
    localStorage.setItem('citta.pending',JSON.stringify(request));
    try {
      await api('/api/messages',request);
      setConversation(request.conversationId);setDraft('');setReplyTo(undefined);setPending(null);localStorage.removeItem('citta.pending');
      follow.current=true;await load();draftRef.current?.focus();
    } catch(e) {setError(e instanceof Error?e.message:'Message not accepted. Retry with the same ID.');}
    finally {setSending(false);}
  }
  async function control(operation:string,goalId?:string) {
    if (!state || busy) return;
    setBusy(true);setError('');
    try {await api('/api/control',{requestId:crypto.randomUUID(),operation,expectedVersion:state.agent.control_version,...(goalId?{goalId}:{})});await load();}
    catch(e) {setError(e instanceof Error?e.message:'Control failed.');await load();}
    finally {setBusy(false);}
  }
  const messages=Array.from(new Map((loadedConversation===conversation?[...older,...(state?.messages||[])]:[]).map(m=>[m.id,m])).values()).sort((a,b)=>BigInt(a.ordinal)<BigInt(b.ordinal)?-1:1);
  async function loadOlder(){
    if(!conversation||!messages.length||loadingOlder)return;
    historyRequested.current=true;setLoadingOlder(true);const version=loadVersion.current;
    try{const history=await api<{messages:Message[]}>('/api/history?conversationId='+conversation+'&before='+messages[0].ordinal);if(version!==loadVersion.current)return;previousHeight.current=thread.current?.scrollHeight||0;setOlder(current=>[...history.messages,...current]);setHistoryEnd(history.messages.length<100);follow.current=false;}catch(e){setError(e instanceof Error?e.message:'History unavailable.');}finally{setLoadingOlder(false);}
  }
  const activeGoals=state?.goals.filter(g=>!['completed','cancelled','exhausted'].includes(g.state))||[];
  const rows=Array.isArray(catalog[catalogType])?catalog[catalogType] as Record<string,unknown>[]:[];
  const filtered=rows.filter(row=>(catalogType!=='citta'||row.projection==='shared'||row.projection===projection)&&JSON.stringify(row).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <div className="app">
    <aside className="rail">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();setView('inbox');}}><span className="brand-mark">စိတ်</span><span>{state?.profile.name||'Citta'}<small>Continuing local agent</small></span></a>
      <nav aria-label="Main navigation">{([['inbox','Inbox','↗'],['activity','Activity','◎'],['mind','Mind','◉'],['memory','Memory','◇'],['catalog','Catalog','▤']] as const).map(([key,label,icon])=><button key={key} aria-current={view===key?'page':undefined} className={view===key?'selected':''} onClick={()=>setView(key)}><span aria-hidden="true">{icon}</span>{label}{key==='activity'&&activeGoals.length>0&&<b>{activeGoals.length}</b>}</button>)}</nav>
      <div className="conversation-heading"><span>CONVERSATIONS</span><button title="New conversation" aria-label="New conversation" onClick={()=>{setConversation(crypto.randomUUID());setView('inbox');}}>+</button></div>
      <div className="conversations">{state?.conversations.map(c=><button key={c.id} className={conversation===c.id?'current':''} onClick={()=>{setConversation(c.id);setView('inbox');}}>{c.title}</button>)}{!state?.conversations.length&&<p className="muted">Your conversations will appear here.</p>}</div>
      <div className="rail-footer"><span className={'dot '+(connected?'online':'')}/>{connected?'Live connection':'Reconnecting…'}<small>Local inbox · private device</small></div>
    </aside>
    <main>
      <header className="topbar"><div><div className="eyebrow">CITTA / {view.toUpperCase()}</div><h1>{view==='inbox'?'A place to think together':view==='activity'?'Thought & ongoing work':view==='mind'?`${state?.profile.name||'Citta'}’s mind`:view==='memory'?'Saved experience':'Reference catalog'}</h1></div><div className={'mode '+(state?.agent.control||'offline')}><span className="dot"/>{state?.agent.control||'Connecting'}</div></header>
      <div className="mobile-conversations"><label className="sr-only" htmlFor="conversation">Conversation</label><select id="conversation" value={conversation} onChange={e=>setConversation(e.target.value)}>{!state?.conversations.some(c=>c.id===conversation)&&<option value={conversation}>New conversation</option>}{state?.conversations.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><button aria-label="New conversation" onClick={()=>{setConversation(crypto.randomUUID());setView('inbox');}}>＋ New</button></div><div className="controlbar"><span>{health.runner==='ready'?'Runner connected':'Runner unavailable'} · English conversation · Cognition: {health.cognition||'checking'}</span><div><button disabled={!state||busy||state.agent.control==='paused'} onClick={()=>void control('pause')}>Pause</button><button disabled={!state||busy||state.agent.control==='running'} onClick={()=>void control('resume')}>Resume</button><button disabled={!state||busy||state.agent.control==='stopped'} onClick={()=>void control('stop')}>Stop</button><button aria-pressed={state?.agent.quiet||false} disabled={!state||busy} onClick={()=>void control(state?.agent.quiet?'unquiet':'quiet')}>{state?.agent.quiet?'Quiet on':'Quiet'}</button></div></div>
      {error&&<div className="error" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={()=>setError('')}>×</button></div>}
      {view==='inbox'&&<section className="inbox" aria-label="Conversation">
        {activeGoals.length>0&&<div className="ongoing"><span className="pulse"/> {activeGoals.length} ongoing {activeGoals.length===1?'commitment':'commitments'}<button onClick={()=>setView('activity')}>View activity →</button></div>}
        <div className="thread" ref={thread} onScroll={()=>{const el=thread.current;if(el){follow.current=el.scrollHeight-el.scrollTop-el.clientHeight<100;if(follow.current)setJump(false);}}}>
          {messages.length>=200&&!historyEnd&&<button className="history-more" disabled={loadingOlder} onClick={()=>void loadOlder()}>{loadingOlder?'Loading history…':'Load earlier messages'}</button>}{!messages.length&&<div className="welcome"><div className="welcome-symbol">စိတ်</div><h2>Start with a thought.</h2><p>Tell me something, ask a question, or leave a note. I can continue thinking between conversations and share an idea here when appropriate.</p><div className="suggestions">{['Who are you?','What do you remember?','What are your goals?'].map(t=><button key={t} onClick={()=>{setDraft(t);draftRef.current?.focus();}}>{t}</button>)}</div></div>}
          {messages.map(m=><article key={m.id} className={'message '+m.role}><div className="message-meta"><strong>{m.role==='operator'?'You':m.role==='adviser'?'Codex · external advice':state?.profile.name||'Citta'}</strong><span>{timestamp(m.created_at)}</span>{m.initiative&&<span className="tag">Initiated · {m.contact_state}</span>}</div><div className="message-text">{m.text}</div>{m.initiative&&m.contact_id&&<div className="contact-actions"><button onClick={()=>{setReplyTo(m.contact_id);draftRef.current?.focus();}}>Reply to this topic</button><button onClick={()=>{void api('/api/contact/decline',{contactId:m.contact_id}).then(load).catch(e=>setError(e.message));}}>Decline this topic</button></div>}{m.role!=='operator'&&<small className="source">{m.source==='codex'?'Reported advice · accuracy unverified':m.source==='file'?'Observed local source':m.source==='memory'?'Saved conversation memory':m.source}</small>}</article>)}
          {pending&&<article className="pending"><strong>{sending?'Sending…':'Not yet confirmed'}</strong><p>{pending.text}</p>{!sending&&<button onClick={()=>void send(pending)}>Retry same message</button>}</article>}
          <div ref={bottom}/>
        </div>
        {jump&&<button className="jump" onClick={()=>{follow.current=true;setJump(false);const element=thread.current;if(element)element.scrollTop=element.scrollHeight;}}>New messages ↓</button>}
        <form className="composer" onSubmit={e=>{e.preventDefault();void send();}}>{replyTo&&<div className="reply-topic">Replying to an initiated topic <button type="button" onClick={()=>setReplyTo(undefined)}>Cancel reply</button></div>}<label htmlFor="message" className="sr-only">Message Citta</label><textarea ref={draftRef} id="message" rows={2} value={draft} maxLength={6000} placeholder="Share a thought… in English" disabled={sending||!!pending} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing&&e.keyCode!==229){e.preventDefault();void send();}}}/><div className="composer-footer"><small>Enter to send · Shift + Enter for a new line{state?.agent.control!=='running'?' · Processing is paused; messages remain saved.':''}</small><button className="primary" disabled={!draft.trim()||sending||!!pending}>{sending?'Sending…':'Send ↑'}</button></div></form>
      </section>}
      {view==='activity'&&<ActivityPage state={state} busy={busy} onControl={(action,goalId)=>control(action,goalId)}/>}
      {view==='mind'&&<MindPage state={state} onReviewed={load} onActivity={id=>{location.hash='/activity/'+id;setView('activity');}}/>}
      {view==='memory'&&<section className="workspace"><div className="note">Saved records for this conversation and shared memories. Each record retains its source; corrections preserve the earlier version.</div><MemoryRecords memories={state?.memories||[]} onCorrection={text=>{setDraft(text);setView('inbox');draftRef.current?.focus();}}/></section>}
      {view==='catalog'&&<section className="workspace"><div className="note">Doctrinal reference is separate from the application runtime. Myanmar descriptions are drafts pending terminology review.</div><div className="catalog-tools"><label>Catalog<select aria-label="Catalog" value={catalogType} onChange={e=>setCatalogType(e.target.value)}><option value="citta">Citta</option><option value="cetasikas">Cetasikas</option><option value="functions">Functions</option></select></label>{catalogType==='citta'&&<label>View<select aria-label="View" value={projection} onChange={e=>setProjection(e.target.value)}><option value="summary">89 citta</option><option value="detailed">121 citta</option></select></label>}<label>Search<input aria-label="Search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="English / မြန်မာ"/></label><span>{filtered.length} entries</span></div><div className="catalog-grid">{filtered.map((row,i)=><article className="card" key={String(row.id||i)}><span className="eyebrow">{String(row.id||'')} · {String(row.group||row.category||'')}</span><h3>{String(row.label||row.name||row.pali||row.id||'')}</h3><p lang="my">{String(row.labelMy||'')}</p>{!!row.meaning&&<p>{String(row.meaning)}</p>}<details><summary>Reference fields</summary><pre>{JSON.stringify(row,null,2)}</pre></details></article>)}</div></section>}
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
