(() => {
const data = window.CADERNO_DATA;
const view = document.getElementById('view');
const searchInput = document.getElementById('searchInput');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const toast = document.getElementById('toast');
const resetBtn = document.getElementById('resetBtn');
const areaNav = document.getElementById('areaNav');
const KEY='caderno-livre:v1';
const AREAS=['Linguagens','Humanas','Natureza','Matemática'];
let state = loadState();

function loadState(){
  try { return Object.assign({done:{},favorites:{},last:null}, JSON.parse(localStorage.getItem(KEY)||'{}')); }
  catch { return {done:{},favorites:{},last:null}; }
}
function saveState(){ localStorage.setItem(KEY,JSON.stringify(state)); }
function keyOf(sid,n){return sid+':'+n}
function esc(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slugText(s=''){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function pct(subject){const total=subject.topics.length||1;const done=subject.topics.filter(t=>state.done[keyOf(subject.id,t.number)]).length;return Math.round(done/total*100)}
function totals(){const topics=data.subjects.reduce((n,s)=>n+s.topics.length,0);const done=Object.values(state.done).filter(Boolean).length;return {topics,done,pct:topics?Math.round(done/topics*100):0}}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1700)}
function findSubject(id){return data.subjects.find(s=>s.id===id)}
function findTopic(subject,n){return subject?.topics.find(t=>t.number===Number(n))}
function setActive(route){document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.route===route));document.querySelectorAll('.area-link').forEach(b=>b.classList.remove('active'))}

function areaCount(area){const ss=data.subjects.filter(s=>s.area===area);return {subjects:ss.length,topics:ss.reduce((n,s)=>n+s.topics.length,0)}}
function renderAreaNav(){areaNav.innerHTML=AREAS.map(a=>`<button class="area-link" data-area="${esc(a)}">${esc(a)}</button>`).join('');areaNav.querySelectorAll('button').forEach(b=>b.onclick=()=>{location.hash='#/area/'+encodeURIComponent(b.dataset.area);sidebar.classList.remove('open')})}

function subjectCard(s){const p=pct(s);return `<button class="subject-card" data-subject="${s.id}"><div class="subject-top"><span class="subject-icon">${esc(s.icon)}</span><span class="meta-chip">${s.topics.length} tópicos</span></div><h3>${esc(s.name)}</h3><p>${esc(s.area)}</p><div class="subject-progress"><div class="progress-track"><span style="width:${p}%"></span></div><small>${p}%</small></div></button>`}
function bindSubjectCards(){document.querySelectorAll('[data-subject]').forEach(b=>b.onclick=()=>{location.hash='#/materia/'+b.dataset.subject})}

function home(){setActive('home');const t=totals();const last = state.last ? (()=>{const s=findSubject(state.last.sid);const tp=findTopic(s,state.last.n);return s&&tp?{s,tp}:null})() : null;
view.innerHTML=`<section class="hero"><div class="hero-main"><span class="eyebrow">● Preparação para o ENEM</span><h1>Estude no seu ritmo. Sem conta, sem distração.</h1><p>Todo o conteúdo dos seus cadernos organizado por matéria e tópico. O progresso fica salvo apenas neste navegador.</p><div class="hero-actions"><button class="primary-btn" id="startBtn">Começar a estudar</button>${last?'<button class="secondary-btn" id="resumeBtn">Continuar de onde parei</button>':''}</div></div><div class="hero-stats"><div class="stat-big"><strong>${t.pct}%</strong><span>do conteúdo concluído</span></div><div class="progress-track"><span style="width:${t.pct}%"></span></div><div class="mini-grid"><div class="mini-stat"><strong>${t.done}</strong><span>tópicos concluídos</span></div><div class="mini-stat"><strong>${t.topics}</strong><span>tópicos disponíveis</span></div></div></div></section>
${last?`<section class="resume-card"><div><h3>Continue estudando</h3><p>${esc(last.s.name)} · ${last.tp.number}. ${esc(last.tp.title)}</p></div><button class="primary-btn" id="resumeCardBtn">Continuar</button></section>`:''}
<div class="section-head"><div><h2>Áreas do ENEM</h2><p>Escolha uma área para ver as matérias.</p></div></div><section class="area-grid">${AREAS.map(a=>{const c=areaCount(a);return `<button class="area-card" data-area-card="${esc(a)}"><span class="area-icon">${a==='Matemática'?'∑':a==='Natureza'?'⚛':a==='Humanas'?'⌘':'Aa'}</span><strong>${esc(a)}</strong><span>${c.subjects} matérias · ${c.topics} tópicos</span></button>`}).join('')}</section>
<div class="section-head"><div><h2>Todas as matérias</h2><p>11 disciplinas organizadas a partir dos cadernos.</p></div><button class="text-link" id="allSubjects">Ver todas →</button></div><section class="subject-grid">${data.subjects.slice(0,6).map(subjectCard).join('')}</section>`;
document.getElementById('startBtn').onclick=()=>location.hash='#/materias'; if(last){const go=()=>location.hash=`#/materia/${last.s.id}/${last.tp.number}`;document.getElementById('resumeBtn').onclick=go;document.getElementById('resumeCardBtn').onclick=go}document.getElementById('allSubjects').onclick=()=>location.hash='#/materias';document.querySelectorAll('[data-area-card]').forEach(b=>b.onclick=()=>location.hash='#/area/'+encodeURIComponent(b.dataset.areaCard));bindSubjectCards();}

function subjectsPage(area=null){setActive('subjects');const list=area?data.subjects.filter(s=>s.area===area):data.subjects;view.innerHTML=`<div class="page-title"><div><button class="back-btn" onclick="location.hash='#/'">← Início</button><h1>${area?esc(area):'Matérias'}</h1><p>${area?'Conteúdos desta área do ENEM.':'Todos os conteúdos disponíveis no Caderno Livre.'}</p></div><span class="meta-chip">${list.reduce((n,s)=>n+s.topics.length,0)} tópicos</span></div><section class="subject-grid">${list.map(subjectCard).join('')}</section>`;bindSubjectCards();}

function topicList(s,current){return `<aside class="topic-list">${s.topics.map(t=>`<button data-topic="${t.number}" class="${t.number===current?'active':''} ${state.done[keyOf(s.id,t.number)]?'done':''}"><span class="topic-number">${state.done[keyOf(s.id,t.number)]?'✓':t.number}</span><span>${esc(t.title)}</span></button>`).join('')}</aside>`}
function blocksHtml(topic){let html='';let exercisesOpen=false;for(const b of topic.blocks){if(b.type==='section'){if(exercisesOpen){html+='</div>';exercisesOpen=false}const label=esc(b.text);html+=`<div class="callout ${b.kind}"><strong>${label}</strong></div>`;if(b.kind==='exercises'){html+='<div class="exercise-list">';exercisesOpen=true}}else if(b.type==='exercise'){if(!exercisesOpen){html+='<div class="exercise-list">';exercisesOpen=true}html+=`<label class="exercise-item"><input type="checkbox" class="exercise-check" /> <span>${esc(b.text)}</span></label>`}else{if(exercisesOpen){html+='</div>';exercisesOpen=false}html+=b.type==='h3'?`<h3>${esc(b.text)}</h3>`:`<p>${esc(b.text)}</p>`}}if(exercisesOpen)html+='</div>';return html}
function subjectPage(sid,n=null){const s=findSubject(sid);if(!s){return notFound()}const topic=findTopic(s,n)||s.topics[0];state.last={sid:s.id,n:topic.number};saveState();setActive('subjects');const k=keyOf(s.id,topic.number);const done=!!state.done[k];const fav=!!state.favorites[k];view.innerHTML=`<div class="page-title"><div><button class="back-btn" id="backSubjects">← Matérias</button><h1>${esc(s.name)}</h1><p>${esc(s.area)} · ${s.topics.length} tópicos · ${pct(s)}% concluído</p></div><span class="subject-icon">${esc(s.icon)}</span></div><div class="topic-layout">${topicList(s,topic.number)}<article class="lesson"><header class="lesson-head"><span class="lesson-kicker">Tópico ${topic.number} de ${s.topics.length}</span><h1>${esc(topic.title)}</h1><div class="lesson-actions"><button id="doneBtn" class="pill-btn ${done?'active':''}">${done?'✓ Concluído':'Marcar como concluído'}</button><button id="favBtn" class="pill-btn ${fav?'active':''}">${fav?'★ Favorito':'☆ Favoritar'}</button></div></header><div class="lesson-body">${blocksHtml(topic)}</div></article></div>`;
document.getElementById('backSubjects').onclick=()=>location.hash='#/materias';document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>location.hash=`#/materia/${s.id}/${b.dataset.topic}`);document.getElementById('doneBtn').onclick=()=>{state.done[k]=!state.done[k];saveState();showToast(state.done[k]?'Tópico concluído ✓':'Conclusão removida');subjectPage(s.id,topic.number)};document.getElementById('favBtn').onclick=()=>{state.favorites[k]=!state.favorites[k];saveState();showToast(state.favorites[k]?'Adicionado aos favoritos':'Removido dos favoritos');subjectPage(s.id,topic.number)};}

function favorites(){setActive('favorites');const items=[];for(const s of data.subjects)for(const t of s.topics)if(state.favorites[keyOf(s.id,t.number)])items.push({s,t});view.innerHTML=`<div class="page-title"><div><button class="back-btn" onclick="location.hash='#/'">← Início</button><h1>Favoritos</h1><p>Seus tópicos salvos neste navegador.</p></div><span class="meta-chip">${items.length}</span></div>${items.length?`<section class="favorites-list">${items.map(({s,t})=>`<button class="search-result" data-go="${s.id}:${t.number}"><small>${esc(s.name)}</small><strong>${t.number}. ${esc(t.title)}</strong><p>${esc(s.area)}</p></button>`).join('')}</section>`:'<div class="empty"><strong>Nenhum favorito ainda.</strong><br>Abra uma aula e clique em “☆ Favoritar”.</div>'}`;bindGo();}
function bindGo(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const [sid,n]=b.dataset.go.split(':');location.hash=`#/materia/${sid}/${n}`})}
function search(q){q=q.trim();if(!q){home();return}setActive('');const nq=slugText(q);const results=[];for(const s of data.subjects){for(const t of s.topics){const text=[t.title,...t.blocks.map(b=>b.text)].join(' ');if(slugText(text).includes(nq)){const idx=slugText(text).indexOf(nq);const plain=text;const start=Math.max(0,idx-70);results.push({s,t,snippet:plain.slice(start,start+210)})}}}view.innerHTML=`<div class="page-title"><div><h1>Busca</h1><p>Resultados para “${esc(q)}”.</p></div><span class="meta-chip">${results.length} encontrados</span></div>${results.length?`<section class="search-results">${results.slice(0,60).map(r=>`<button class="search-result" data-go="${r.s.id}:${r.t.number}"><small>${esc(r.s.name)} · ${esc(r.s.area)}</small><strong>${r.t.number}. ${esc(r.t.title)}</strong><p>${esc(r.snippet)}…</p></button>`).join('')}</section>`:'<div class="empty">Nada encontrado. Tente outra palavra.</div>'}`;bindGo();}
function notFound(){view.innerHTML='<div class="empty"><strong>Página não encontrada.</strong><br><button class="primary-btn" onclick="location.hash=\'#/\'" style="margin-top:15px">Voltar ao início</button></div>'}

function route(){sidebar.classList.remove('open');const raw=location.hash.replace(/^#\/?/,'');const parts=raw.split('/').filter(Boolean);if(!parts.length){home();return}if(parts[0]==='materias'||parts[0]==='subjects'){subjectsPage();return}if(parts[0]==='area'){subjectsPage(decodeURIComponent(parts.slice(1).join('/')));return}if(parts[0]==='materia'){subjectPage(parts[1],parts[2]);return}if(parts[0]==='favoritos'||parts[0]==='favorites'){favorites();return}notFound()}

document.querySelectorAll('.nav-link').forEach(b=>b.onclick=()=>{const r=b.dataset.route;location.hash=r==='home'?'#/':r==='subjects'?'#/materias':'#/favoritos';sidebar.classList.remove('open')});
menuBtn.onclick=()=>sidebar.classList.toggle('open');
searchInput.addEventListener('input',()=>search(searchInput.value));
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==searchInput){e.preventDefault();searchInput.focus()}});
resetBtn.onclick=()=>{if(confirm('Apagar todo o progresso, favoritos e histórico deste navegador?')){localStorage.removeItem(KEY);state=loadState();showToast('Progresso zerado');route()}};
window.addEventListener('hashchange',()=>{searchInput.value='';route()});
renderAreaNav();route();
})();
