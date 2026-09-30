(function main(){
  const data=window.CADERNO_DATA;
  const view=document.getElementById("view");
  const searchInput=document.getElementById("searchInput");
  const toast=document.getElementById("toast");
  const menuBtn=document.getElementById("menuBtn");
  const mobileNav=document.getElementById("mobileNav");
  const resetBtn=document.getElementById("resetBtn");
  const resetBtnMobile=document.getElementById("resetBtnMobile");
  const KEY="caderno-livre:v2";
  const LEGACY_KEY="caderno-livre:v1";
  const AREAS=["Linguagens","Humanas","Natureza","Matemática"];
  const AREA_INFO={
    "Linguagens":{color:"#7c3aed",label:"Linguagens"},
    "Humanas":{color:"#ea580c",label:"Ciências Humanas"},
    "Natureza":{color:"#0f9f73",label:"Ciências da Natureza"},
    "Matemática":{color:"#2563eb",label:"Matemática"}
  };
  let state=loadState();

  function loadState(){
    try{
      const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||"{}";
      return Object.assign({done:{},favorites:{},last:null,exerciseDone:{}},JSON.parse(raw));
    }catch{
      return {done:{},favorites:{},last:null,exerciseDone:{}};
    }
  }
  function saveState(){localStorage.setItem(KEY,JSON.stringify(state))}
  function keyOf(sid,n){return sid+":"+n}
  function exKey(sid,n,i){return sid+":"+n+":"+i}
  function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function slugText(s=""){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
  function areaClass(area){return "area-"+slugText(area).replace(/\s+/g,"-")}
  function subjectById(id){return data.subjects.find(s=>s.id===id)}
  function topicByNumber(subject,n){return subject?.topics.find(t=>t.number===Number(n))}
  function subjectPct(subject){
    const total=subject.topics.length||1;
    const done=subject.topics.filter(t=>state.done[keyOf(subject.id,t.number)]).length;
    return Math.round(done/total*100);
  }
  function totals(){
    const topics=data.subjects.reduce((n,s)=>n+s.topics.length,0);
    const done=data.subjects.reduce((n,s)=>n+s.topics.filter(t=>state.done[keyOf(s.id,t.number)]).length,0);
    return {topics,done,pct:topics?Math.round(done/topics*100):0};
  }
  function showToast(msg){
    toast.textContent=msg;toast.classList.add("show");clearTimeout(showToast.t);
    showToast.t=setTimeout(()=>toast.classList.remove("show"),1700);
  }
  function setNav(route){
    document.querySelectorAll("[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===route));
  }
  function go(hash){location.hash=hash}
  function closeMobile(){mobileNav.classList.remove("open");mobileNav.setAttribute("aria-hidden","true")}
  function areaCount(area){
    const list=data.subjects.filter(s=>s.area===area);
    return {subjects:list.length,topics:list.reduce((n,s)=>n+s.topics.length,0)};
  }

  function subjectCard(s){
    const p=subjectPct(s);
    return `<button class="subject-card ${areaClass(s.area)}" data-subject="${esc(s.id)}">
      <div class="subject-card-top">
        <span class="subject-icon">${esc(s.icon)}</span>
        <span class="subject-count">${s.topics.length} tópicos</span>
      </div>
      <h3>${esc(s.name)}</h3>
      <p>${esc(AREA_INFO[s.area]?.label||s.area)}</p>
      <div class="subject-progress">
        <div class="progress-track"><span style="width:${p}%"></span></div>
        <small>${p}%</small>
      </div>
    </button>`;
  }
  function bindSubjectCards(){
    document.querySelectorAll("[data-subject]").forEach(b=>b.onclick=()=>go("#/materia/"+b.dataset.subject));
  }

  function home(){
    setNav("home");
    const t=totals();
    const last=state.last?(()=>{
      const s=subjectById(state.last.sid),tp=topicByNumber(s,state.last.n);
      return s&&tp?{s,tp}:null;
    })():null;

    view.innerHTML=`
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Caderno Livre · ENEM</span>
          <h1>Escolha uma matéria e comece.</h1>
          <p>Conteúdo separado por tópicos e organizado para estudar sem cadastro, sem menus confusos e sem transformar a aula em um PDF gigante na tela.</p>
          <div class="hero-actions">
            <button class="primary-btn" id="browseBtn">Ver matérias</button>
            ${last?'<button class="soft-btn" id="continueBtn">Continuar estudando</button>':""}
          </div>
        </div>
        <aside class="progress-panel">
          <div>
            <span class="label">Seu progresso</span>
            <div class="progress-number">${t.pct}%</div>
            <div class="progress-caption">do conteúdo marcado como concluído</div>
          </div>
          <div>
            <div class="progress-track"><span style="width:${t.pct}%"></span></div>
            <div class="progress-meta">
              <div><strong>${t.done}</strong><span>concluídos</span></div>
              <div><strong>${t.topics}</strong><span>tópicos no site</span></div>
            </div>
          </div>
        </aside>
      </section>

      ${last?`<section class="resume-strip">
        <div><small>Continue de onde parou</small><strong>${esc(last.s.name)}</strong><p>${last.tp.number}. ${esc(last.tp.title)}</p></div>
        <button class="primary-btn" id="resumeBtn">Continuar</button>
      </section>`:""}

      <section class="section">
        <div class="section-head"><div><h2>Áreas do ENEM</h2><p>Entre por área ou vá direto para uma matéria.</p></div></div>
        <div class="area-grid">
          ${AREAS.map(a=>{
            const c=areaCount(a),color=AREA_INFO[a].color;
            return `<button class="area-card" data-area="${esc(a)}"><div class="area-dot" style="background:${color}"></div><strong>${esc(AREA_INFO[a].label)}</strong><span>${c.subjects} matérias · ${c.topics} tópicos</span></button>`;
          }).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><div><h2>Matérias</h2><p>Abra uma disciplina para ver os tópicos em ordem.</p></div><button class="link-btn" id="seeAllBtn">Ver todas</button></div>
        <div class="subject-grid">${data.subjects.slice(0,6).map(subjectCard).join("")}</div>
      </section>`;

    document.getElementById("browseBtn").onclick=()=>go("#/materias");
    document.getElementById("seeAllBtn").onclick=()=>go("#/materias");
    document.querySelectorAll("[data-area]").forEach(b=>b.onclick=()=>go("#/area/"+encodeURIComponent(b.dataset.area)));
    if(last){
      const resume=()=>go(`#/materia/${last.s.id}/${last.tp.number}`);
      document.getElementById("continueBtn").onclick=resume;
      document.getElementById("resumeBtn").onclick=resume;
    }
    bindSubjectCards();
  }

  function subjectsPage(area=null){
    setNav("subjects");
    const list=area?data.subjects.filter(s=>s.area===area):data.subjects;
    view.innerHTML=`
      <div class="page-head">
        <div>
          <div class="crumbs"><button data-home>Início</button> / ${area?esc(AREA_INFO[area]?.label||area):"Matérias"}</div>
          <h1>${area?esc(AREA_INFO[area]?.label||area):"Todas as matérias"}</h1>
          <p>${area?"Escolha uma disciplina desta área.":"As 11 disciplinas do Caderno Livre organizadas por área."}</p>
        </div>
        <span class="page-badge">${list.reduce((n,s)=>n+s.topics.length,0)} tópicos</span>
      </div>
      <div class="area-tabs">
        <button data-filter="" class="${!area?"active":""}">Todas</button>
        ${AREAS.map(a=>`<button data-filter="${esc(a)}" class="${area===a?"active":""}">${esc(AREA_INFO[a].label)}</button>`).join("")}
      </div>
      <div class="subject-grid">${list.map(subjectCard).join("")}</div>`;

    document.querySelector("[data-home]").onclick=()=>go("#/");
    document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>b.dataset.filter?go("#/area/"+encodeURIComponent(b.dataset.filter)):go("#/materias"));
    bindSubjectCards();
  }

  function groupBlocks(topic){
    const groups={lesson:[],enem:[],trap:[],formula:[],exercises:[],order:[]};
    let current="lesson";
    for(const b of topic.blocks){
      if(b.type==="section"){
        current=groups[b.kind]?b.kind:"lesson";
        continue;
      }
      groups[current].push(b);
    }
    return groups;
  }
  function tabLabel(tab){
    return {lesson:"Aula",enem:"Como cai no ENEM",trap:"Pegadinhas",formula:"Fórmulas",exercises:"Exercícios",order:"Ordem de estudo"}[tab]||tab;
  }
  function renderBlocks(blocks,sid,n,tab){
    if(!blocks.length)return `<div class="empty">Não há conteúdo separado para esta seção.</div>`;
    let exIndex=0;
    const prefix=tab==="enem"?'<div class="lesson-note">Aqui fica só a parte do caderno que explica como este assunto costuma aparecer no ENEM.</div>':
      tab==="trap"?'<div class="lesson-note trap">Erros comuns e confusões que vale revisar antes da prova.</div>':
      tab==="formula"?'<div class="lesson-note formula">Fórmulas e relações importantes deste tópico.</div>':
      tab==="exercises"?'<div class="lesson-note exercise">Marque os exercícios conforme for fazendo. Eles ficam salvos neste navegador.</div>':"";
    return prefix+blocks.map(b=>{
      if(b.type==="h3")return `<h3>${esc(b.text)}</h3>`;
      if(b.type==="exercise"){
        const k=exKey(sid,n,exIndex++);
        return `<label class="exercise-item"><input type="checkbox" data-ex="${esc(k)}" ${state.exerciseDone[k]?"checked":""}><span>${esc(b.text)}</span></label>`;
      }
      return `<p>${esc(b.text)}</p>`;
    }).join("");
  }

  function lessonPage(sid,n=null){
    const s=subjectById(sid);
    if(!s||!s.topics.length)return notFound();
    const topic=topicByNumber(s,n)||s.topics[0];
    const groups=groupBlocks(topic);
    const available=["lesson","enem","trap","formula","exercises","order"].filter(k=>groups[k].length);
    let activeTab=available[0]||"lesson";
    const topicIndex=s.topics.findIndex(t=>t.number===topic.number);
    const prev=s.topics[topicIndex-1]||null,next=s.topics[topicIndex+1]||null;
    const k=keyOf(s.id,topic.number);
    state.last={sid:s.id,n:topic.number};saveState();
    setNav("subjects");

    view.innerHTML=`
      <div class="page-head">
        <div>
          <div class="crumbs"><button data-home>Início</button> / <button data-subjects>Matérias</button> / ${esc(s.name)}</div>
          <h1>${esc(s.name)}</h1>
          <p>${esc(AREA_INFO[s.area]?.label||s.area)} · ${s.topics.length} tópicos · ${subjectPct(s)}% concluído</p>
        </div>
        <span class="page-badge">Tópico ${topic.number} de ${s.topics.length}</span>
      </div>

      <div class="lesson-shell">
        <aside class="topic-rail">
          <div class="rail-head"><strong>Conteúdo da matéria</strong><span>Escolha um tópico</span></div>
          ${s.topics.map(t=>`<button data-topic="${t.number}" class="${t.number===topic.number?"active":""} ${state.done[keyOf(s.id,t.number)]?"done":""}">
            <span class="topic-index">${state.done[keyOf(s.id,t.number)]?"✓":t.number}</span><span>${esc(t.title)}</span>
          </button>`).join("")}
        </aside>

        <div class="lesson-main">
          <article class="lesson-card ${areaClass(s.area)}">
            <header class="lesson-top">
              <span class="lesson-kicker">${esc(s.name)} · tópico ${topic.number}</span>
              <h1>${esc(topic.title)}</h1>
              <div class="lesson-actions">
                <button id="doneBtn" class="chip-btn ${state.done[k]?"active":""}">${state.done[k]?"✓ Concluído":"Marcar como concluído"}</button>
                <button id="favBtn" class="chip-btn ${state.favorites[k]?"active":""}">${state.favorites[k]?"★ Favorito":"☆ Favoritar"}</button>
              </div>
            </header>
            <nav class="lesson-tabs" id="lessonTabs">
              ${available.map(tab=>`<button data-tab="${tab}" class="${tab===activeTab?"active":""}">${tabLabel(tab)}</button>`).join("")}
            </nav>
            <div class="lesson-content" id="lessonContent"></div>
          </article>

          <div class="lesson-nav">
            <button id="prevBtn" ${prev?"":"disabled"}>← ${prev?esc(prev.title):"Primeiro tópico"}</button>
            <button id="nextBtn" ${next?"":"disabled"}>${next?esc(next.title):"Último tópico"} →</button>
          </div>
        </div>
      </div>`;

    const content=document.getElementById("lessonContent");
    function paintTab(tab){
      activeTab=tab;
      content.innerHTML=renderBlocks(groups[tab],s.id,topic.number,tab);
      document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
      content.querySelectorAll("[data-ex]").forEach(cb=>cb.onchange=()=>{
        state.exerciseDone[cb.dataset.ex]=cb.checked;saveState();
      });
    }
    paintTab(activeTab);

    document.querySelector("[data-home]").onclick=()=>go("#/");
    document.querySelector("[data-subjects]").onclick=()=>go("#/materias");
    document.querySelectorAll("[data-topic]").forEach(b=>b.onclick=()=>go(`#/materia/${s.id}/${b.dataset.topic}`));
    document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>paintTab(b.dataset.tab));
    document.getElementById("doneBtn").onclick=()=>{
      state.done[k]=!state.done[k];saveState();
      showToast(state.done[k]?"Tópico concluído ✓":"Conclusão removida");
      lessonPage(s.id,topic.number);
    };
    document.getElementById("favBtn").onclick=()=>{
      state.favorites[k]=!state.favorites[k];saveState();
      showToast(state.favorites[k]?"Adicionado aos favoritos":"Removido dos favoritos");
      lessonPage(s.id,topic.number);
    };
    if(prev)document.getElementById("prevBtn").onclick=()=>go(`#/materia/${s.id}/${prev.number}`);
    if(next)document.getElementById("nextBtn").onclick=()=>go(`#/materia/${s.id}/${next.number}`);
  }

  function favoritesPage(){
    setNav("favorites");
    const items=[];
    for(const s of data.subjects)for(const t of s.topics)if(state.favorites[keyOf(s.id,t.number)])items.push({s,t});
    view.innerHTML=`
      <div class="page-head"><div><div class="crumbs"><button data-home>Início</button> / Favoritos</div><h1>Favoritos</h1><p>Assuntos que você separou para revisar depois.</p></div><span class="page-badge">${items.length}</span></div>
      ${items.length?`<div class="search-results">${items.map(({s,t})=>`<button class="search-result" data-go="${s.id}:${t.number}"><small>${esc(s.name)} · ${esc(AREA_INFO[s.area]?.label||s.area)}</small><strong>${t.number}. ${esc(t.title)}</strong></button>`).join("")}</div>`:'<div class="empty"><strong>Nenhum favorito ainda.</strong><br>Abra uma aula e marque ☆ Favoritar.</div>'}`;
    document.querySelector("[data-home]").onclick=()=>go("#/");
    bindGo();
  }

  function search(q){
    const query=q.trim();
    if(!query){route();return}
    setNav("");
    const nq=slugText(query),results=[];
    for(const s of data.subjects){
      for(const t of s.topics){
        const full=[t.title,...t.blocks.map(b=>b.text)].join(" ");
        if(slugText(full).includes(nq))results.push({s,t,snippet:full.slice(0,190)});
      }
    }
    view.innerHTML=`
      <div class="page-head"><div><h1>Busca</h1><p>Resultados para “${esc(query)}”.</p></div><span class="page-badge">${results.length} encontrados</span></div>
      ${results.length?`<div class="search-results">${results.slice(0,80).map(r=>`<button class="search-result" data-go="${r.s.id}:${r.t.number}"><small>${esc(r.s.name)} · ${esc(AREA_INFO[r.s.area]?.label||r.s.area)}</small><strong>${r.t.number}. ${esc(r.t.title)}</strong><p>${esc(r.snippet)}…</p></button>`).join("")}</div>`:'<div class="empty">Nada encontrado. Tente outra palavra.</div>'}`;
    bindGo();
  }
  function bindGo(){
    document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{
      const [sid,n]=b.dataset.go.split(":");go(`#/materia/${sid}/${n}`);
    });
  }
  function notFound(){
    setNav("");
    view.innerHTML='<div class="empty"><strong>Página não encontrada.</strong><br><button class="primary-btn" id="home404" style="margin-top:14px">Voltar ao início</button></div>';
    document.getElementById("home404").onclick=()=>go("#/");
  }
  function route(){
    closeMobile();
    const raw=location.hash.replace(/^#\/?/,""),parts=raw.split("/").filter(Boolean);
    if(!parts.length){home();return}
    if(parts[0]==="materias"){subjectsPage();return}
    if(parts[0]==="area"){subjectsPage(decodeURIComponent(parts.slice(1).join("/")));return}
    if(parts[0]==="materia"){lessonPage(parts[1],parts[2]);return}
    if(parts[0]==="favoritos"){favoritesPage();return}
    notFound();
  }

  function bindRouteButtons(root=document){
    root.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{
      const r=b.dataset.route;
      go(r==="home"?"#/":r==="subjects"?"#/materias":"#/favoritos");
      closeMobile();
    });
  }
  function resetProgress(){
    if(confirm("Apagar todo o progresso, favoritos e exercícios salvos neste navegador?")){
      localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY);
      state=loadState();showToast("Progresso zerado");route();
    }
  }

  bindRouteButtons(document);
  menuBtn.onclick=()=>{
    const open=!mobileNav.classList.contains("open");
    mobileNav.classList.toggle("open",open);
    mobileNav.setAttribute("aria-hidden",String(!open));
  };
  searchInput.addEventListener("input",()=>search(searchInput.value));
  document.addEventListener("keydown",e=>{
    if(e.key==="/"&&document.activeElement!==searchInput){e.preventDefault();searchInput.focus()}
  });
  resetBtn.onclick=resetProgress;
  resetBtnMobile.onclick=resetProgress;
  window.addEventListener("hashchange",()=>{searchInput.value="";route()});
  route();
})();
