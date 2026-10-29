(() => {
  'use strict';

  const STORAGE_KEY = 'rep_treinos_v1';
  const SOURCE = window.TREINO_INICIAL;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const h = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const attr = h;
  const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const parseDate = (value) => new Date(`${value || today()}T12:00:00`);
  const dateText = (value, options = {day:'2-digit',month:'short',year:'numeric'}) => parseDate(value).toLocaleDateString('pt-BR', options);
  const decimal = (value) => String(value ?? '').replace('.', ',');
  const asNumber = (value) => { const n = Number(String(value).replace(',', '.')); return value !== '' && value != null && Number.isFinite(n) ? n : null; };
  const fmt = (value, fallback = '—') => value == null || value === '' ? fallback : decimal(value);
  const getSession = (sessionId) => state.sessoes.find(s => s.id === sessionId);
  const currentCompletion = (entry) => entry.sets.length > 0 && entry.sets.every(set => set.done);
  const doneSets = (draft) => draft.exercises.reduce((sum, entry) => sum + entry.sets.filter(set => set.done).length, 0);
  const totalSets = (draft) => draft.exercises.reduce((sum, entry) => sum + entry.sets.length, 0);
  const completeExercises = (draft) => draft.exercises.filter(currentCompletion).length;
  const sortHistory = (list) => [...list].sort((a,b) => (b.date || '').localeCompare(a.date || '') || (b.finishedAt || '').localeCompare(a.finishedAt || ''));

  const icons = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
    dumbbell:'<path d="m6.5 6.5 11 11M4 9l5-5M15 20l5-5M3 7l4-4M17 21l4-4M2 10l8-8M14 22l8-8"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    chart:'<path d="M3 3v18h18M7 16l4-5 3 3 6-8"/>',
    sliders:'<path d="M4 7h16M4 17h16M9 4v6M15 14v6"/>',
    arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    layers:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
    file:'<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h8M9 17h8"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4M12 14v5m-4 2h8"/>',
    edit:'<path d="M12 20h9M16 4l4 4-11 11-5 1 1-5L16 4z"/>',
    trash:'<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v7M14 11v7"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    down:'<path d="m6 9 6 6 6-6"/>',
    up:'<path d="m6 15 6-6 6 6"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    upload:'<path d="M12 17V5m-5 5 5-5 5 5M4 17v4h16v-4"/>',
    close:'<path d="M5 5l14 14M19 5 5 19"/>',
    repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
    shield:'<path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    spark:'<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z"/>',
    minus:'<path d="M5 12h14"/>'
  };
  const icon = (key) => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7">${icons[key] || icons.info}</svg>`;

  function defaultState() { return {schemaVersion:1,sessoes:clone(SOURCE.sessoes),historico:[],rascunho:null,restPreferences:{},vibrarDescanso:true}; }
  function readState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultState();
      const parsed = JSON.parse(stored);
      if (!parsed || !Array.isArray(parsed.sessoes) || !Array.isArray(parsed.historico) || !parsed.sessoes.every(s=>s && Array.isArray(s.exercicios))) throw new Error('Formato inválido');
      return parsed;
    } catch (error) { console.warn('Não foi possível recuperar os treinos salvos:',error); return defaultState(); }
  }
  let state = readState();
  const ui = {view:'home', chosenSession:state.sessoes[0]?.id || '', historyFilter:'todos', progressExercise:'', modal:null};
  let toastTimeout;
  let restInterval = null;
  let restEnd = 0;
  let restTick = null;
  const canVibrate = typeof navigator.vibrate === 'function';

  function saveState() {
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}
    catch(error){ console.error('Falha ao salvar:',error); toast('Não foi possível salvar: verifique o espaço do navegador.');return false; }
  }
  function toast(message) {
    const root = document.getElementById('toast-root');
    root.innerHTML = `<div class="toast">${h(message)}</div>`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(()=>{root.innerHTML='';},3200);
  }
  const btn = (text, action, variant='btn-primary', extra='') => `<button type="button" class="btn ${variant}" data-action="${action}" ${extra}>${text}</button>`;
  const heading = (eyebrow,title,desc='',right='') => `<div class="eyebrow">${h(eyebrow)}</div><div class="page-intro"><div><h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div>${right}</div>`;
  const progressInfo = (draft) => {
    const total = totalSets(draft); const done=doneSets(draft);
    return {done,total,percentage:total ? Math.round(100*done/total):0};
  };
  function render() {
    const name={home:'Início',training:'Treinar',history:'Histórico',progress:'Evolução',routine:'Minha ficha'};
    document.querySelectorAll('[data-nav]').forEach(el=>{
      const active = el.dataset.nav===ui.view;
      el.classList.toggle('active',active);
      if(active) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
    });
    document.getElementById('current-page-name').textContent=name[ui.view];
    document.getElementById('today-label').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
    const app=document.getElementById('app');
    app.innerHTML = ({home:renderHome,training:renderTraining,history:renderHistory,progress:renderProgress,routine:renderRoutine}[ui.view] || renderHome)();
    if(ui.modal) renderModal();
  }
  function navigate(view){ui.view=view;render();window.scrollTo({top:0,behavior:'instant'});}

  function sessionCard(session,index) {
    const resuming=state.rascunho?.sessionId===session.id;
    return `<article class="session-card"><div class="session-card-head"><div><span class="session-code">SESSÃO ${String(index+1).padStart(2,'0')}</span><h3>${h(session.nome)}</h3></div><div class="session-icon">${icon(index===1?'bolt':'dumbbell')}</div></div><p class="session-subtitle">${h(session.subtitulo || '')}</p><div class="session-details"><span>${icon('layers')} ${session.exercicios.length} exercícios</span><span>${icon('target')} Hipertrofia</span></div>${btn(`${resuming?'Continuar':'Iniciar'} ${icon('arrow')}`,'start','btn-primary btn-block',`data-session="${attr(session.id)}"`)}</article>`;
  }
  function renderSessions(){return `<div class="session-grid">${state.sessoes.map(sessionCard).join('')}</div>`;}
  function renderHome() {
    const last=sortHistory(state.historico);
    const finishedLast30=state.historico.filter(r=>{const d=parseDate(r.date); const diff=Date.now()-d.getTime();return diff>=-86400000 && diff < 30*86400000;}).length;
    const completedSets=state.historico.reduce((n,r)=>n+doneSets(r),0);
    const resume=state.rascunho ? btn(`Continuar ${h(state.rascunho.sessionName)} ${icon('arrow')}`,'resume') : btn(`Escolher treino ${icon('arrow')}`,'choose-training');
    return `<section class="hero"><div class="eyebrow">SEU PRÓXIMO PASSO</div><h1>Cada série conta.<br><em>Cada evolução também.</em></h1><p>Registre seus treinos, acompanhe suas cargas e descubra o quanto você avançou.</p>${resume}</section>
    <section class="stat-grid"><div class="stat-card"><div class="stat-top">Treinos salvos ${icon('calendar')}</div><div><div class="stat-value">${state.historico.length}</div><div class="stat-caption">no histórico</div></div></div><div class="stat-card"><div class="stat-top">Últimos 30 dias ${icon('bolt')}</div><div><div class="stat-value">${finishedLast30}</div><div class="stat-caption">sessões realizadas</div></div></div><div class="stat-card"><div class="stat-top">Séries concluídas ${icon('check')}</div><div><div class="stat-value">${completedSets}</div><div class="stat-caption">séries registradas</div></div></div></section>
    <div class="section-heading"><div><h2>Seu plano de treino</h2><p>Rotina: ${h(SOURCE.nome)} · ${h(SOURCE.nivel)}</p></div><button class="mini-link" data-action="open-routine">Ver ficha ${icon('arrow')}</button></div>${renderSessions()}
    <div class="summary-grid"><section class="card"><div class="card-title">Últimas sessões</div>${last.length?last.slice(0,3).map(r=>`<div class="recent-row"><div><div class="title">${h(r.sessionName)}</div><div class="subtitle">${dateText(r.date)}</div></div><div class="right"><strong>${completeExercises(r)}/${r.exercises.length}</strong><span>exercícios concluídos</span></div></div>`).join(''):`<div class="empty-state">${icon('calendar')}<h3>A jornada começa aqui</h3><p>Depois do primeiro treino salvo, suas sessões aparecem neste espaço.</p></div>`}</section><section class="card"><div class="card-title">Seu espaço, seus dados</div><div class="info-strip" style="margin:0">${icon('shield')}<div><p><strong>Sem cadastro ou assinatura.</strong></p><p>Seus registros são armazenados neste navegador. Faça backups periódicos em Minha ficha para não perder o histórico ao trocar de aparelho.</p></div></div><button class="mini-link" data-action="open-routine" style="margin-top:12px">Gerenciar ficha e backup ${icon('arrow')}</button></section></div>`;
  }

  function makeEntry(exercise) {
    const ex=clone(exercise);
    const set = () => {
      if(ex.tipo==='cardio') return {done:false,minutos:ex.minutos ?? '',nivel:ex.nivel ?? '',inclinacao:ex.inclinacao ?? '',velocidade:ex.velocidade ?? '',intensidade:ex.intensidade ?? ''};
      if(ex.tipo==='tempo') return {done:false,segundos:ex.segundos ?? '',carga:ex.carga ?? ''};
      return {done:false,reps:ex.reps ?? '',carga:ex.carga ?? ''};
    };
    return {exercise:ex,sets:Array.from({length:Math.max(1,Math.min(30,Number(ex.series)||1))},set)};
  }
  function startTraining(sessionId) {
    const session=getSession(sessionId);
    if(!session){toast('Sessão não encontrada.');return;}
    if(state.rascunho) {
      if(state.rascunho.sessionId===sessionId){navigate('training');return;}
      if(!confirm(`Existe um treino de ${state.rascunho.sessionName} em andamento. Descartá-lo e começar ${session.nome}?`))return;
    }
    state.rascunho={id:makeId(),sessionId:session.id,sessionName:session.nome,date:today(),startedAt:new Date().toISOString(),exercises:session.exercicios.map(makeEntry),note:''};
    saveState();navigate('training');toast('Treino iniciado. O rascunho é salvo automaticamente.');
  }
  function renderTraining() {
    const draft=state.rascunho;
    if(!draft) return `${heading('HORA DE TREINAR','Qual sessão é hoje?','Escolha a sessão. Cada série ficará pronta para você registrar carga, repetições ou duração.')}${renderSessions()}<div class="info-strip">${icon('info')}<div>Os campos começam com as metas do PDF, mas você pode ajustar o que realizou em cada série. Marque como concluído para contar no treino.</div></div>`;
    const info=progressInfo(draft);
    let priorGroup=null;
    const exercises=draft.exercises.map((entry,index)=>{
      const ex=entry.exercise;
      let banner='';
      if(ex.grupo && ex.grupo!==priorGroup) banner=`<div class="combo-banner">${icon('repeat')}<div><strong>Exercícios combinados</strong><span>Alterne esses exercícios — conforme a ficha original</span></div></div>`;
      priorGroup=ex.grupo || null;
      return banner+renderExercise(entry,index);
    }).join('');
    return `${heading('TREINO EM ANDAMENTO',h(draft.sessionName),`${draft.exercises.length} exercícios · os dados são salvos automaticamente`,btn(`${icon('close')} Descartar treino`,'discard','btn-plain'))}
      <div class="training-toolbar"><div class="toolbar-info"><div><strong>${info.percentage}% concluído</strong><small style="display:block">${info.done} de ${info.total} séries</small></div><div><strong>${completeExercises(draft)}/${draft.exercises.length}</strong><small style="display:block">exercícios completos</small></div></div><div class="date-field"><label for="workout-date">Data</label><input id="workout-date" type="date" data-draft-field="date" value="${attr(draft.date)}"></div></div>
      <div class="training-options"><label class="vibrate-label"><input type="checkbox" id="rest-vibrate-toggle" ${state.vibrarDescanso!==false?'checked':''} ${canVibrate?'':'disabled'}> ${icon('bolt')} Vibrar ao terminar o descanso</label>${canVibrate?'<small>Disponível neste dispositivo, com a página ativa.</small>':'<small>Vibração não suportada neste navegador.</small>'}</div>
      <div class="progress-track" aria-label="Progresso do treino"><div class="progress-fill" style="width:${info.percentage}%"></div></div><div class="progress-caption">${info.total-info.done} séries restantes. Marque cada série conforme terminar.</div>
      <section class="exercise-list">${exercises}</section>
      <section class="session-footer"><label for="workout-note">Anotações do treino (opcional)<textarea id="workout-note" data-draft-field="note" placeholder="Como foi o treino? Alguma observação?">${h(draft.note)}</textarea></label>${btn(`${icon('check')} Salvar treino`,'save-workout','btn-primary')}</section>`;
  }
  function renderExerciseMeta(ex) {
    const rows=[`<p><strong>${h(ex.campoPrescricao||'Séries')}:</strong> ${h(ex.prescricao || '—')}</p>`];
    (ex.outrosCampos || []).forEach(item=>rows.push(`<p><strong>${h(item.rotulo)}:</strong> ${h(item.valor)}</p>`));
    if(ex.cargaOriginal)rows.push(`<p><strong>Carga:</strong> ${h(ex.cargaOriginal)}</p>`);
    if(ex.intervaloOriginal)rows.push(`<p><strong>Intervalo:</strong> ${h(ex.intervaloOriginal)}</p>`);
    if(ex.instrucao)rows.push(`<p><strong>Instruções:</strong> ${h(ex.instrucao)}</p>`);
    return `<div class="exercise-notes">${rows.join('')}</div>`;
  }
  function setRow(ex,entry,index,setIndex) {
    const set=entry.sets[setIndex];
    const cols=ex.tipo==='tempo' ? [{label:'Tempo (s)',field:'segundos',value:set.segundos},{label:'Carga',field:'carga',value:set.carga}] : [{label:'Carga (kg)',field:'carga',value:set.carga},{label:'Repetições',field:'reps',value:set.reps}];
    const head=setIndex===0?`<div class="set-table-head"><span>SÉRIE</span><span>${h(cols[0].label.toUpperCase())}</span><span>${h(cols[1].label.toUpperCase())}</span><span>FEITA</span></div>`:'';
    return `${head}<div class="set-row ${set.done?'done':''}"><span class="set-index">${String(setIndex+1).padStart(2,'0')}</span>${cols.map(c=>`<input aria-label="${h(c.label)} da série ${setIndex+1} de ${h(ex.nome)}" type="number" inputmode="decimal" min="0" ${c.field==='reps'?'step="1"':'step="any"'} placeholder="—" value="${attr(c.value)}" data-set-ex="${index}" data-set-index="${setIndex}" data-set-field="${c.field}">`).join('')}<button type="button" aria-label="${set.done?'Desmarcar':'Concluir'} série ${setIndex+1}" aria-pressed="${set.done}" class="tick ${set.done?'checked':''}" data-action="toggle-set" data-ex="${index}" data-set="${setIndex}">${icon('check')}</button></div>`;
  }
  function cardioFields(entry,index) {
    const ex=entry.exercise;
    const set=entry.sets[0];
    const inputs=[['minutos','Duração (min)','number',set.minutos],['nivel','Nível','text',set.nivel]];
    if(ex.inclinacao != null)inputs.push(['inclinacao','Inclinação (%)','number',set.inclinacao]);
    if(ex.velocidade != null)inputs.push(['velocidade','Velocidade (km/h)','number',set.velocidade]);
    if(ex.intensidade != null)inputs.push(['intensidade','Intensidade','text',set.intensidade]);
    const form=inputs.map(([field,label,type,value])=>`<label class="${field==='intensidade'?'wide':''}"><span>${h(label)}</span><input type="${type}" ${type==='number'?'min="0" step="any" inputmode="decimal"':''} value="${attr(value)}" placeholder="—" data-set-ex="${index}" data-set-index="0" data-set-field="${field}" aria-label="${h(label)} de ${h(ex.nome)}"></label>`).join('');
    return `<div class="cardio-grid">${form}</div><div class="exercise-footer"><span class="hint">Registre tempo e nível/intensidade realmente realizados.</span><button type="button" class="btn btn-small ${set.done?'btn-primary':'btn-plain'}" data-action="toggle-set" data-ex="${index}" data-set="0">${icon('check')} ${set.done?'Concluído':'Concluir atividade'}</button></div>`;
  }
  function renderExercise(entry,index) {
    const ex=entry.exercise;
    const completed=currentCompletion(entry);
    const metric=ex.tipo==='cardio'?'CARDIO':ex.tipo==='tempo'?'ISOMETRIA':'MUSCULAÇÃO';
    const controls=ex.tipo==='cardio'?cardioFields(entry,index):`<div class="set-table">${entry.sets.map((_,i)=>setRow(ex,entry,index,i)).join('')}</div><div class="exercise-footer"><span class="hint">${ex.intervalo != null?`Intervalo: ${h(ex.intervaloOriginal||`${ex.intervalo}s`)}`:'Sem intervalo informado'}</span><div class="exercise-actions">${ex.intervalo != null?`<div class="rest-config"><label><span>Descanso (s)</span><input type="number" inputmode="numeric" min="1" max="3600" step="1" value="${attr(state.restPreferences?.[ex.id] ?? ex.intervalo)}" data-rest-seconds="${attr(ex.id)}" aria-label="Tempo de descanso, em segundos, para ${attr(ex.nome)}"></label>${btn(`${icon('clock')} Iniciar descanso`,'rest','btn-plain btn-small',`data-rest-ex="${attr(ex.id)}" data-default-seconds="${Number(ex.intervalo)||0}"`)}</div>`:''}${btn(`${icon('check')} ${completed?'Desmarcar':'Concluir exercício'}`,'toggle-exercise',`btn-small ${completed?'btn-primary':'btn-ghost'}`,`data-ex="${index}"`)}</div></div>`;
    return `<article class="exercise-card ${completed?'is-complete':''}" id="entry-${index}"><div class="exercise-header"><div><div class="exercise-number">EXERCÍCIO ${String(index+1).padStart(2,'0')} · ${metric}</div><div class="exercise-name">${h(ex.nome)}</div></div><span class="tag ${completed?'tag-accent':''}">${completed?icon('check'):icon('layers')} ${completed?'Feito':`${entry.sets.length} ${entry.sets.length===1?'bloco':'séries'}`}</span></div>${renderExerciseMeta(ex)}${controls}</article>`;
  }

  function renderHistory(){
    const histories=sortHistory(state.historico.filter(r=>ui.historyFilter==='todos'||r.sessionId===ui.historyFilter));
    const filters=`<div class="filter-line"><div class="selector-row" style="margin:0"><button data-action="filter-history" data-value="todos" class="chip ${ui.historyFilter==='todos'?'active':''}">Todos</button>${state.sessoes.map(s=>`<button data-action="filter-history" data-value="${attr(s.id)}" class="chip ${ui.historyFilter===s.id?'active':''}">${h(s.nome)}</button>`).join('')}</div><span class="small muted">${histories.length} ${histories.length===1?'treino':'treinos'}</span></div>`;
    return `${heading('SEU HISTÓRICO','Treinos registrados.','Cada sessão salva mantém os exercícios e valores daquele dia, mesmo se você editar a ficha depois.')}${filters}${histories.length?`<div class="history-list">${histories.map(renderHistoryEntry).join('')}</div>`:`<div class="empty-state">${icon('calendar')}<h3>Nenhuma sessão por aqui</h3><p>Selecione um treino, registre suas séries e salve para visualizar seus resultados.</p>${btn('Iniciar treino','choose-training')}</div>`}`;
  }
  function renderHistoryEntry(record){
    const count=completeExercises(record);
    const details=record.exercises.map(entry=>{
      const ex=entry.exercise;
      const completed=entry.sets.filter(s=>s.done);
      const sets=completed.map((s,i)=>{
        if(ex.tipo==='cardio')return `${fmt(s.minutos)} min${s.nivel?` · nível ${h(s.nivel)}`:''}${s.intensidade?` · ${h(s.intensidade)}`:''}${s.inclinacao!==''&&s.inclinacao!=null?` · inclinação ${h(s.inclinacao)}%`:''}${s.velocidade!==''&&s.velocidade!=null?` · ${h(s.velocidade)} km/h`:''}`;
        if(ex.tipo==='tempo')return `${fmt(s.segundos)}s${s.carga!==''&&s.carga!=null?` · ${fmt(s.carga)} kg`:''}`;
        return `${fmt(s.reps)} rep · ${fmt(s.carga)} kg`;
      });
      return `<div class="history-exercise"><strong>${h(ex.nome)}</strong><small>${completed.length}/${entry.sets.length} ${ex.tipo==='cardio'?'atividade': 'séries'} concluídas${sets.length?` · ${sets.join(' | ')}`:''}</small></div>`;
    }).join('');
    return `<article class="history-item"><div class="history-row"><div><div class="history-date">${dateText(record.date,{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div><div class="history-title">${h(record.sessionName)}</div><div class="history-badges"><span class="tag">${doneSets(record)} séries/atividades</span><span class="tag tag-accent">${count}/${record.exercises.length} exercícios</span></div></div><div class="history-actions"><button class="btn btn-danger btn-small" data-action="delete-history" data-id="${attr(record.id)}">${icon('trash')} Excluir</button></div></div><details><summary>Ver exercícios e resultados ${icon('down')}</summary><div class="history-detail">${record.note?`<div class="exercise-notes"><strong>Observações:</strong> ${h(record.note)}</div>`:''}${details}</div></details></article>`;
  }

  function getExerciseList(){
    const found=new Map();
    [...state.sessoes.flatMap(s=>s.exercicios),...state.historico.flatMap(r=>r.exercises.map(e=>e.exercise))].forEach(e=>{if(e.tipo==='reps' && !found.has(e.id))found.set(e.id,e);});
    return [...found.values()];
  }
  function getSeries(exerciseId){
    return sortHistory(state.historico).reverse().flatMap(record=>record.exercises.filter(e=>e.exercise.id===exerciseId).flatMap(entry=>{
      const loads=entry.sets.filter(s=>s.done).map(s=>asNumber(s.carga)).filter(v=>v!==null);
      return loads.length?[{date:record.date,max:Math.max(...loads),title:record.sessionName}]:[];
    }));
  }
  function drawChart(points) {
    if(!points.length)return `<div class="empty-state" style="padding:38px 20px">${icon('chart')}<h3>Sem dados para o gráfico</h3><p>Conclua e salve ao menos uma série deste exercício.</p></div>`;
    const W=720,H=260,L=46,R=17,T=18,B=39,innerW=W-L-R,innerH=H-T-B;
    const high=Math.max(1,...points.map(p=>p.max));
    const max=Math.ceil(high*1.17/5)*5 || 5;
    const x=i=>L+(points.length===1?innerW/2:innerW*i/(points.length-1));
    const y=value=>T+innerH-(value/max)*innerH;
    const grid=[0,.25,.5,.75,1].map(f=>`<line x1="${L}" y1="${y(f*max)}" x2="${W-R}" y2="${y(f*max)}" class="chart-grid"/><text class="axis-label" text-anchor="end" x="${L-10}" y="${y(f*max)+4}">${decimal(+(f*max).toFixed(1))}</text>`).join('');
    const line=points.map((p,i)=>`${i===0?'M':'L'} ${x(i)} ${y(p.max)}`).join(' ');
    const area=`${line} L ${x(points.length-1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
    const indices=[0,Math.floor((points.length-1)/2),points.length-1].filter((v,i,a)=>a.indexOf(v)===i);
    const dates=indices.map(i=>`<text class="axis-label" text-anchor="middle" x="${x(i)}" y="${H-10}">${h(dateText(points[i].date,{day:'2-digit',month:'short'}))}</text>`).join('');
    const dots=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.max)}" r="${i===points.length-1?6:4.5}" class="chart-point"><title>${h(dateText(p.date))}: ${h(decimal(p.max))} kg</title></circle>`).join('');
    return `<div class="chart-shell"><svg role="img" aria-label="Gráfico de evolução das cargas em quilogramas ao longo dos treinos" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfff77" stop-opacity=".24"/><stop offset="1" stop-color="#dfff77" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" class="chart-area"/><path d="${line}" class="chart-line"/>${dots}${dates}</svg></div>`;
  }
  function renderProgress(){
    const all=getExerciseList();
    if(!all.some(e=>e.id===ui.progressExercise)){
      const first=all.find(e=>getSeries(e.id).length)||all[0];
      ui.progressExercise=first?.id || '';
    }
    const current=all.find(e=>e.id===ui.progressExercise);
    const points=current?getSeries(current.id):[];
    const first=points[0]?.max;
    const last=points[points.length-1]?.max;
    const max=points.length?Math.max(...points.map(p=>p.max)):null;
    const diff=points.length>1?+(last-first).toFixed(2):null;
    const select=`<label class="chart-selector"><span class="field-label">EXERCÍCIO</span><select id="progress-select" aria-label="Selecionar exercício para ver evolução">${all.map(e=>`<option value="${attr(e.id)}" ${e.id===ui.progressExercise?'selected':''}>${h(e.nome)}</option>`).join('')}</select></label>`;
    return `${heading('ACOMPANHE SUA EVOLUÇÃO','O progresso nos detalhes.','O gráfico usa a maior carga de uma série concluída em cada sessão salva. Cargas de pares e cargas por lado seguem os valores registrados, sem conversão automática.')}
    ${select}<div class="chart-layout"><section class="card chart-card"><div class="chart-header"><div><div class="chart-title">Maior carga registrada</div><div class="chart-peak">${max===null?'—':`${decimal(max)} <span style="font-size:15px;letter-spacing:0;color:#95aab4">kg</span>`}</div><div class="chart-note">${current?h(current.nome):'Escolha um exercício'}</div></div><span class="tag">${points.length} ${points.length===1?'sessão':'sessões'} com dados</span></div>${drawChart(points)}</section><aside class="card chart-summary"><div class="card-title">Resumo do exercício</div><div class="mini-stat"><small>Primeiro registro</small><strong>${first==null?'—':`${decimal(first)} kg`}</strong></div><div class="mini-stat"><small>Último registro</small><strong>${last==null?'—':`${decimal(last)} kg`}</strong></div><div class="mini-stat"><small>Variação entre registros</small><strong class="${diff>=0?'success-text':'text-danger'}">${diff==null?'—':`${diff>0?'+':''}${decimal(diff)} kg`}</strong></div><p class="small muted">O gráfico considera apenas séries marcadas como concluídas. A carga é a que você registrou, não necessariamente uma carga total do equipamento.</p></aside></div>`;
  }

  function renderRoutine(){
    return `${heading('SUA ROTINA','Minha ficha de treino.','Ficha inicial transcrita do PDF. Você pode editar exercícios e metas; os treinos já salvos não são alterados.')}
    <div class="info-strip">${icon('file')}<div><strong>Fonte original: ${h(SOURCE.fonte)}</strong><p>Rotina ${h(SOURCE.nome)} · ${h(SOURCE.objetivo)} · ${h(SOURCE.nivel)}. Exercícios combinados, instruções e prescrições originais são mantidos abaixo.</p></div></div>
    ${state.sessoes.map(s=>`<section><div class="routine-header"><div><h2>${h(s.nome)}</h2><div class="routine-count">${h(s.subtitulo || '')} · ${s.exercicios.length} exercícios</div></div>${btn(`${icon('plus')} Adicionar`,'add-exercise','btn-ghost btn-small',`data-session="${attr(s.id)}"`)}</div>${s.exercicios.map((ex,i)=>`<div class="routine-row"><div class="routine-left"><strong>${String(i+1).padStart(2,'0')} · ${h(ex.nome)}</strong><div class="routine-meta">${h(ex.campoPrescricao||'Séries')}: ${h(ex.prescricao||'—')} ${ex.cargaOriginal?` · Carga: ${h(ex.cargaOriginal)}`:''} ${ex.intervaloOriginal?` · Descanso: ${h(ex.intervaloOriginal)}`:''}${ex.instrucao?`<br>Instruções: ${h(ex.instrucao)}`:''}${(ex.outrosCampos||[]).map(c=>`<br>${h(c.rotulo)}: ${h(c.valor)}`).join('')}${ex.grupo?'<br><span class="success-text">Combinado: alternar com o exercício do mesmo grupo</span>':''}</div></div><div class="routine-controls"><button class="btn btn-plain btn-small btn-icon" aria-label="Editar exercício" title="Editar exercício" data-action="edit-exercise" data-session="${attr(s.id)}" data-index="${i}">${icon('edit')}</button><button class="btn btn-plain btn-small btn-icon" title="Mover para cima" aria-label="Mover exercício para cima" data-action="move-exercise" data-dir="-1" data-session="${attr(s.id)}" data-index="${i}" ${i===0?'disabled':''}>${icon('up')}</button><button class="btn btn-plain btn-small btn-icon" title="Mover para baixo" aria-label="Mover exercício para baixo" data-action="move-exercise" data-dir="1" data-session="${attr(s.id)}" data-index="${i}" ${i===s.exercicios.length-1?'disabled':''}>${icon('down')}</button></div></div>`).join('')}</section>`).join('')}
    <section class="card backup-card"><div><h3>Backup e manutenção</h3><p>Exporte suas sessões, ficha e histórico para um arquivo JSON; importe quando trocar de navegador ou dispositivo. O backup contém também um treino em andamento, se existir.</p></div><div class="backup-actions">${btn(`${icon('download')} Exportar`,'export-backup','btn-primary btn-small')}${btn(`${icon('upload')} Importar`,'import-backup','btn-ghost btn-small')}</div><input id="backup-file" type="file" accept=".json,application/json" class="hidden-file-input"></section><div style="margin:16px 0 30px">${btn(`${icon('repeat')} Restaurar ficha original do PDF`,'reset-routine','btn-plain btn-small')}</div>`;
  }

  function openEditModal(sessionId,index) {
    const session=getSession(sessionId);
    if(!session)return;
    const edit=index!=null && Number.isInteger(index);
    const ex=edit?session.exercicios[index]:{id:makeId(),nome:'',tipo:'reps',series:3,reps:12,carga:null,prescricao:'',cargaOriginal:'',intervalo:60,intervaloOriginal:'',grupo:'',instrucao:''};
    if(!ex)return;
    ui.modal={sessionId,index:edit?index:null,original:clone(ex)};
    renderModal();
  }
  function renderModal() {
    const modal=ui.modal;
    if(!modal){document.getElementById('modal-root').innerHTML='';return;}
    const ex=modal.original;
    const isNew=modal.index===null;
    const value=(v)=>attr(v ?? '');
    document.getElementById('modal-root').innerHTML=`<div class="modal-backdrop" data-action="close-modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow">EDIÇÃO DA FICHA</div><h2 id="modal-title">${isNew?'Adicionar exercício':'Editar exercício'}</h2><p>As alterações valerão para os próximos treinos.</p></div><button type="button" class="btn btn-plain btn-icon" data-action="close-modal" aria-label="Fechar">${icon('close')}</button></div><form id="edit-exercise-form" class="modal-form"><label class="full"><span class="field-label">Nome do exercício</span><input name="nome" required maxlength="150" value="${value(ex.nome)}"></label><label><span class="field-label">Tipo</span><select name="tipo"><option value="reps" ${ex.tipo==='reps'?'selected':''}>Séries e repetições</option><option value="tempo" ${ex.tipo==='tempo'?'selected':''}>Séries por tempo</option><option value="cardio" ${ex.tipo==='cardio'?'selected':''}>Cardio por tempo/nível</option></select></label><label><span class="field-label">Séries ou blocos</span><input type="number" name="series" required min="1" max="30" step="1" value="${value(ex.series)}"></label><label><span class="field-label">Repetições por série</span><input type="number" name="reps" min="0" step="1" value="${value(ex.reps)}" placeholder="Só para repetições"></label><label><span class="field-label">Segundos por série</span><input type="number" name="segundos" min="0" step="1" value="${value(ex.segundos)}" placeholder="Só para isometria"></label><label><span class="field-label">Minutos (cardio)</span><input type="number" name="minutos" min="0" step="any" value="${value(ex.minutos)}"></label><label><span class="field-label">Carga padrão (valor numérico)</span><input type="number" name="carga" min="0" step="any" value="${value(ex.carga)}"></label><label><span class="field-label">Intervalo de descanso (seg)</span><input type="number" name="intervalo" min="0" step="1" value="${value(ex.intervalo)}" placeholder="Não informado"></label><label><span class="field-label">Nível (cardio)</span><input name="nivel" value="${value(ex.nivel)}"></label><label><span class="field-label">Inclinação (%)</span><input name="inclinacao" value="${value(ex.inclinacao)}"></label><label><span class="field-label">Velocidade (km/h)</span><input name="velocidade" value="${value(ex.velocidade)}"></label><label class="full"><span class="field-label">Prescrição apresentada na ficha</span><input name="prescricao" value="${value(ex.prescricao)}" placeholder="Ex.: 4x12"></label><label class="full"><span class="field-label">Descrição da carga / intensidade</span><input name="cargaOriginal" value="${value(ex.cargaOriginal)}" placeholder="Ex.: par de 10 kg"></label><label class="full"><span class="field-label">Instruções adicionais</span><textarea name="instrucao" rows="2">${h(ex.instrucao || '')}</textarea></label><label class="full"><span class="field-label">Texto livre de intensidade para cardio</span><input name="intensidade" value="${value(ex.intensidade)}" placeholder="Ex.: moderada"></label><label class="full"><span class="field-label">Grupo combinado (mesmo identificador para os exercícios que alternam)</span><input name="grupo" value="${value(ex.grupo)}" placeholder="Deixe vazio para exercício individual"></label><div class="modal-note">As anotações originais fora desses campos, como “Inclinação: 3 séries de 60 seg” da prancha, são preservadas ao editar um exercício existente.</div><div class="modal-footer"><div>${!isNew?btn(`${icon('trash')} Excluir`,'delete-exercise','btn-danger btn-small'):''}</div><div style="display:flex;gap:8px">${btn('Cancelar','close-modal','btn-plain') }<button class="btn btn-primary" type="submit">${icon('check')} Salvar alterações</button></div></div></form></div></div>`;
    document.getElementById('edit-exercise-form').addEventListener('submit',handleExerciseSubmit);
    document.getElementById('edit-exercise-form').querySelector('input[name=nome]').focus();
  }
  function changeFirstNumber(text,value) {return String(text||'').replace(/\d+(?:[.,]\d+)?/,String(value));}
  function handleExerciseSubmit(event) {
    event.preventDefault();
    if(!ui.modal)return;
    const {sessionId,index,original}=ui.modal;
    const data=new FormData(event.currentTarget);
    const ex=clone(original);
    const get=name=>String(data.get(name)||'').trim();
    const oldType=ex.tipo;
    ex.nome=get('nome');
    if(!ex.nome){toast('O exercício precisa ter um nome.');return;}
    ex.tipo=get('tipo');
    ex.series=Math.max(1,Math.min(30,Number(get('series'))||1));
    const optionalNum=name=>get(name)===''?null:Number(get(name));
    ex.reps=optionalNum('reps');ex.segundos=optionalNum('segundos');ex.minutos=optionalNum('minutos');
    ex.carga=optionalNum('carga');ex.intervalo=optionalNum('intervalo');
    ex.nivel=get('nivel');ex.inclinacao=get('inclinacao');ex.velocidade=get('velocidade');ex.intensidade=get('intensidade');
    ex.grupo=get('grupo');ex.instrucao=get('instrucao');
    ex.prescricao=get('prescricao');ex.cargaOriginal=get('cargaOriginal');
    // Se o usuário só alterar as quantidades, sincronizamos a descrição com a nova meta.
    if(index!==null && ex.prescricao===original.prescricao && (ex.series!==original.series || ex.reps!==original.reps || ex.minutos!==original.minutos || ex.segundos!==original.segundos || ex.tipo!==oldType)){
      if(ex.tipo==='cardio' && oldType==='cardio' && /\d+\s*min/.test(ex.prescricao)){
        ex.prescricao=ex.prescricao.replace(/\d+(?=\s*min)/,String(fmt(ex.minutos,0)));
      } else if(ex.tipo==='reps' && oldType==='reps' && /^\s*\d+\s+\d+\/?\s+(sendo|com pico)/i.test(ex.prescricao)){
        // Preserva as instruções de 7+7+7 da extensora e o pico da adução ao editar metas.
        ex.prescricao=ex.prescricao.replace(/^\s*\d+\s+\d+\/?/,`${ex.series} ${fmt(ex.reps,0)}`);
      } else {
        ex.prescricao=ex.tipo==='cardio'?`${fmt(ex.minutos,0)} min`:ex.tipo==='tempo'?`${fmt(ex.segundos,0)}s`:`${ex.series}x${fmt(ex.reps,0)}`;
      }
    }
    if(!ex.prescricao)ex.prescricao=ex.tipo==='cardio'?`${fmt(ex.minutos,0)} min`:ex.tipo==='tempo'?`${fmt(ex.segundos,0)}s`:`${ex.series}x${fmt(ex.reps,0)}`;
    if(index!==null && ex.cargaOriginal===original.cargaOriginal && ex.carga!==original.carga && ex.carga!==null && original.cargaOriginal){ex.cargaOriginal=changeFirstNumber(ex.cargaOriginal,ex.carga);}
    if(index===null && !ex.cargaOriginal && ex.carga!==null && ex.tipo!=='cardio')ex.cargaOriginal=`${ex.carga}kg`;
    if(index===null || ex.intervalo!==original.intervalo)ex.intervaloOriginal=ex.intervalo===null?'':`${ex.intervalo}s`;
    const session=getSession(sessionId);
    if(!session)return;
    if(index===null)session.exercicios.push(ex);
    else session.exercicios[index]=ex;
    ui.modal=null;document.getElementById('modal-root').innerHTML='';saveState();render();toast('Ficha atualizada.');
  }

  function exportBackup(){
    const json=JSON.stringify({app:'REP',exportedAt:new Date().toISOString(),schemaVersion:1,...state},null,2);
    const link=document.createElement('a');const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    link.href=url;link.download=`rep-backup-${today()}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exportado.');
  }
  async function importBackup(file){
    if(!file)return;
    if(file.size>10*1024*1024){toast('O arquivo excede o limite de 10 MB.');return;}
    try{
      const parsed=JSON.parse(await file.text());
      if(parsed.schemaVersion!==1||!Array.isArray(parsed.sessoes)||!Array.isArray(parsed.historico)||parsed.sessoes.length<1||!parsed.sessoes.every(s=>s && typeof s.id==='string' && typeof s.nome==='string' && Array.isArray(s.exercicios)))throw new Error('O arquivo não é um backup REP válido.');
      if(!confirm('Importar este backup substituirá a ficha, o histórico e o treino em andamento deste navegador. Deseja continuar?'))return;
      state={schemaVersion:1,sessoes:parsed.sessoes,historico:parsed.historico,rascunho:parsed.rascunho||null};
      saveState();ui.progressExercise='';ui.historyFilter='todos';render();toast('Backup importado com sucesso.');
    }catch(err){toast(`Falha ao importar: ${err.message}`);}
  }
  function startRest(seconds) {
    if(!Number.isInteger(seconds) || seconds<1 || seconds>3600){toast('Informe um descanso de 1 a 3600 segundos.');return;}
    clearInterval(restInterval);
    restEnd=Date.now()+seconds*1000;
    let element=document.getElementById('rest-timer');
    if(!element){element=document.createElement('div');element.id='rest-timer';element.setAttribute('role','status');element.setAttribute('aria-live','polite');document.body.appendChild(element);}
    let finished=false;
    const tick=()=>{
      if(restEnd===0 || !element.isConnected)return;
      const left=Math.max(0,Math.ceil((restEnd-Date.now())/1000));
      element.className=`rest-timer ${left===0?'rest-finished':''}`;
      element.innerHTML=`<small>${left===0?'TEMPO ENCERRADO':'DESCANSO'}</small><strong>${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}</strong><button type="button" class="btn btn-small" data-action="stop-rest">Fechar</button>`;
      if(left===0 && !finished){
        finished=true;
        clearInterval(restInterval);
        restInterval=null;
        // Vibração é uma API opcional, geralmente disponível no Android; pode falhar com a página em segundo plano.
        if(state.vibrarDescanso!==false && canVibrate){try{navigator.vibrate([250,130,250,130,450]);}catch(error){console.warn('Vibração indisponível:',error);}}
      }
    };
    restTick=tick;
    tick();
    if(!finished)restInterval=setInterval(tick,250);
  }

  document.addEventListener('input',event=>{
    const input=event.target;
    if(input.matches('[data-rest-seconds]')){
      const seconds=Number(input.value);
      if(input.value!=='' && Number.isInteger(seconds) && seconds>=1 && seconds<=3600){
        if(!state.restPreferences)state.restPreferences={};
        state.restPreferences[input.dataset.restSeconds]=seconds;
        saveState();
      }
      return;
    }
    if(!state.rascunho)return;
    if(input.dataset.draftField){
      if(input.dataset.draftField==='date' && !input.value)return;
      state.rascunho[input.dataset.draftField]=input.value;saveState();return;
    }
    if(input.dataset.setEx!==undefined){
      const entry=state.rascunho.exercises[Number(input.dataset.setEx)];
      const set=entry?.sets[Number(input.dataset.setIndex)];
      if(!set)return;
      const field=input.dataset.setField;
      if(!['reps','carga','segundos','minutos','nivel','velocidade','inclinacao','intensidade'].includes(field))return;
      set[field]=input.type==='number'? (input.value===''?'':Number(input.value)):input.value;
      saveState();
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='rest-vibrate-toggle'){state.vibrarDescanso=event.target.checked;saveState();return;}
    if(event.target.id==='progress-select'){ui.progressExercise=event.target.value;render();}
    if(event.target.id==='backup-file'){importBackup(event.target.files[0]);event.target.value='';}
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden && restTick)restTick();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&ui.modal){ui.modal=null;document.getElementById('modal-root').innerHTML='';}});
  function openInstagramFromCredit(event, link) {
    const ua = navigator.userAgent || '';
    const android = /Android/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const mobile = android || ios || Boolean(navigator.userAgentData?.mobile);
    // No desktop, preserve o link comum (target=_blank). O Chrome pode
    // capturá-lo para um aplicativo instalado; isso depende da preferência local.
    if (!mobile) return;

    event.preventDefault();
    const fallbackUrl = 'https://www.instagram.com/macflayyy/';

    // O Chrome no Android oferece fallback nativo quando o Instagram não está instalado.
    if (android && /Chrome\/\d+/i.test(ua) && !/EdgA|OPR\/|SamsungBrowser/i.test(ua)) {
      window.location.assign('intent://www.instagram.com/macflayyy/#Intent;scheme=https;package=com.instagram.android;S.browser_fallback_url=https%3A%2F%2Fwww.instagram.com%2Fmacflayyy%2F;end');
      return;
    }

    let openedApp = false;
    const markHidden = () => { if (document.hidden) openedApp = true; };
    const markLeaving = () => { openedApp = true; };
    document.addEventListener('visibilitychange', markHidden);
    window.addEventListener('pagehide', markLeaving, {once:true});

    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', markHidden);
      window.removeEventListener('pagehide', markLeaving);
      if (!openedApp && !document.hidden) window.location.assign(fallbackUrl);
    }, 1600);

    // O navegador pode impedir links de aplicativo; nesse caso usamos o perfil HTTPS.
    window.location.assign('instagram://user?username=macflayyy');
  }

  document.addEventListener('click',event=>{
    const instagramLink = event.target.closest('a[data-instagram-profile]');
    if (instagramLink) { openInstagramFromCredit(event, instagramLink); return; }
    const nav=event.target.closest('[data-nav]');if(nav){navigate(nav.dataset.nav);return;}
    const el=event.target.closest('[data-action]');if(!el)return;
    const action=el.dataset.action;
    if(action==='close-modal-backdrop' && event.target!==el)return;
    if(action==='start'){startTraining(el.dataset.session);return;}
    if(action==='resume'){navigate('training');return;}
    if(action==='choose-training'){navigate('training');return;}
    if(action==='open-routine'){navigate('routine');return;}
    if(action==='filter-history'){ui.historyFilter=el.dataset.value;render();return;}
    if(action==='close-modal'||action==='close-modal-backdrop'){ui.modal=null;document.getElementById('modal-root').innerHTML='';return;}
    if(action==='stop-rest'){clearInterval(restInterval);restInterval=null;restTick=null;restEnd=0;document.getElementById('rest-timer')?.remove();return;}
    if(action==='rest'){
      const input=el.parentElement.querySelector('[data-rest-seconds]');
      const seconds=Number(input?.value);
      if(!input || input.value.trim()==='' || !Number.isInteger(seconds) || seconds<1 || seconds>3600){toast('Escolha um descanso de 1 a 3600 segundos.');input?.focus();return;}
      startRest(seconds);return;
    }
    if(action==='toggle-set'||action==='toggle-exercise'){
      if(!state.rascunho)return;
      const entry=state.rascunho.exercises[Number(el.dataset.ex)];if(!entry)return;
      if(action==='toggle-set'){const set=entry.sets[Number(el.dataset.set)];if(set)set.done=!set.done;}
      else{const value=!currentCompletion(entry);entry.sets.forEach(set=>set.done=value);}
      saveState();render();return;
    }
    if(action==='save-workout'){
      const draft=state.rascunho;if(!draft)return;
      if(doneSets(draft)===0){toast('Marque pelo menos uma série ou atividade como concluída.');return;}
      state.historico.push({...clone(draft),finishedAt:new Date().toISOString()});state.rascunho=null;
      saveState();navigate('history');toast('Treino salvo no histórico!');return;
    }
    if(action==='discard'){
      if(confirm('Descartar o treino em andamento? Os registros deste rascunho serão perdidos.')){state.rascunho=null;saveState();navigate('training');toast('Rascunho descartado.');}
      return;
    }
    if(action==='delete-history'){
      if(confirm('Excluir este treino do histórico? Esta ação não pode ser desfeita.')){state.historico=state.historico.filter(r=>r.id!==el.dataset.id);saveState();render();toast('Treino excluído.');}
      return;
    }
    if(action==='add-exercise'||action==='edit-exercise'){
      openEditModal(el.dataset.session,action==='add-exercise'?null:Number(el.dataset.index));return;
    }
    if(action==='delete-exercise'){
      if(!ui.modal)return;
      const {sessionId,index}=ui.modal;const session=getSession(sessionId);
      if(index!=null && session && confirm('Excluir este exercício da ficha? O histórico já salvo continuará intacto.')){
        session.exercicios.splice(index,1);ui.modal=null;document.getElementById('modal-root').innerHTML='';saveState();render();toast('Exercício removido.');
      }return;
    }
    if(action==='move-exercise'){
      const session=getSession(el.dataset.session);const i=Number(el.dataset.index), j=i+Number(el.dataset.dir);
      if(!session||j<0||j>=session.exercicios.length)return;
      [session.exercicios[i],session.exercicios[j]]=[session.exercicios[j],session.exercicios[i]];saveState();render();return;
    }
    if(action==='export-backup'){exportBackup();return;}
    if(action==='import-backup'){document.getElementById('backup-file')?.click();return;}
    if(action==='reset-routine'){
      if(confirm('Restaurar exatamente a ficha inicial do PDF? As edições da ficha serão perdidas, mas o histórico e o treino em andamento permanecerão salvos.')){
        state.sessoes=clone(SOURCE.sessoes);saveState();render();toast('Ficha original restaurada.');
      }
    }
  });
  document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
  render();
})();