'use strict';

// 관세율 카드 챌린지: 프레임워크 및 서버가 필요 없는 순수 JavaScript 게임.
// 교육 기준: 관세법 제50조, FTA관세법 제5조 (2026-11-23 확인).

const STORAGE_KEY = 'tariff-lab-progress-v1';

const MATCH_ITEMS = [
  { id: 'basic', term: '기본관세율', def: '관세법의 관세율표에 정해진 기본적인 세율' },
  { id: 'fta', term: 'FTA 협정관세율', def: '협정의 원산지 요건 등을 충족하면 적용할 수 있는 특혜세율' },
  { id: 'dump', term: '덤핑방지관세', def: '덤핑수입으로 인한 국내산업 피해에 대응하기 위해 추가 부과하는 관세' },
  { id: 'counter', term: '상계관세', def: '수출국 보조금으로 인한 국내산업 피해에 대응하기 위해 부과하는 관세' },
  { id: 'emergency', term: '긴급관세', def: '수입 급증으로 국내산업에 심각한 피해 등이 발생할 때 부과하는 관세' },
  { id: 'quota', term: '할당관세', def: '일정한 수입물량 등을 기준으로 세율을 달리 적용하는 관세' },
  { id: 'adval', term: '종가세율', def: '수입물품의 과세가격을 기준으로 일정 비율을 적용하는 세율' },
  { id: 'specific', term: '종량세율', def: '수입물품의 수량·중량 등 물리적 단위를 기준으로 부과하는 세율' },
];
const TERM_ORDER = ['quota', 'dump', 'adval', 'basic', 'counter', 'specific', 'fta', 'emergency'];
const DEF_ORDER = ['specific', 'fta', 'emergency', 'adval', 'counter', 'basic', 'quota', 'dump'];

// 1~4순위: 관세법 제50조 제2항의 각 호. 5~6순위: 제50조 제1항의 잠정/기본세율 비교.
const PRIORITY_ITEMS = [
  {
    id: 'first', name: '덤핑방지·상계·보복·긴급관세 등',
    explanation: '제51·57·63·65·67조의2·68조 및 제69조제2호 등에 따른 세율이 첫 번째 그룹입니다. 해당 부과 요건을 충족해야 합니다.'
  },
  {
    id: 'second', name: '국제협력관세·편익관세',
    explanation: '제73·74조에 따른 세율로, 원칙적으로 기본·잠정세율과 후순위 세율보다 낮을 때 우선합니다. 일부 농림축산물 양허세율은 예외입니다.'
  },
  {
    id: 'third', name: '일부 조정관세·할당관세·계절관세',
    explanation: '제69조제1·3·4호, 제71·72조에 따른 세율입니다. 할당관세는 일반특혜관세보다 낮은 경우에만 우선합니다.'
  },
  {
    id: 'fourth', name: '일반특혜관세',
    explanation: '제76조의 일반특혜관세는 법률에 정해진 특혜대상 국가·물품 및 적용 요건을 충족해야 합니다.'
  },
  {
    id: 'fifth', name: '잠정관세율',
    explanation: '기본세율과 잠정세율 중에는 잠정세율이 우선합니다(관세법 제50조 제1항).'
  },
  {
    id: 'sixth', name: '기본관세율',
    explanation: '다른 법정 우선 적용 세율이 없는 경우 기준이 되는 세율입니다.'
  }
];
const PRIORITY_CHOICE_ORDER = ['third','sixth','first','fourth','second','fifth'];

const CASES = [
  {
    title: '기본세율과 잠정세율',
    question: '어떤 수입물품의 기본세율은 8%, 잠정세율은 6%입니다. 다른 특별세율은 적용되지 않습니다. 적용세율은 얼마일까요?',
    options: ['기본세율 8%', '잠정세율 6%', '평균세율 7%', '합산세율 14%'],
    answer: 1,
    hint: '관세법 제50조 제1항에서 잠정세율과 기본세율의 관계를 확인해 보세요.',
    explanation: '관세법 제50조 제1항에 따라 잠정세율을 기본세율보다 우선 적용하므로, 이 사례의 적용세율은 6%입니다.'
  },
  {
    title: '국제협력관세의 적용 조건',
    question: '일반 공산품의 국제협력관세율은 10%, 기본세율은 8%, 잠정세율은 7%입니다. 그 밖의 특별세율은 없습니다. 적용세율은 무엇일까요?',
    options: ['국제협력관세율 10%', '잠정세율 7%', '기본세율 8%', '합산세율 17%'],
    answer: 1,
    hint: '국제협력관세는 순위가 높더라도 낮은 세율 요건을 검토해야 합니다.',
    explanation: '일반적인 국제협력관세는 기본·잠정세율 등보다 낮은 경우에만 우선합니다. 10%는 7%보다 높으므로 적용되지 않고, 잠정세율 7%가 기본세율 8%보다 우선합니다. 농림축산물 특례는 이 사례에 해당하지 않습니다.'
  },
  {
    title: '할당관세와 일반특혜관세',
    question: '어떤 물품에 할당관세율 12%, 일반특혜관세율 8%, 기본세율 16%가 모두 적용 가능한 상황입니다. 다른 특별세율은 없습니다. 적용세율은 무엇일까요?',
    options: ['할당관세율 12%', '일반특혜관세율 8%', '기본세율 16%', '합산세율 20%'],
    answer: 1,
    hint: '할당관세는 일반특혜관세보다 낮은 경우에만 우선한다는 조건을 생각해 보세요.',
    explanation: '관세법 제50조 제3항에 따라 할당관세는 일반특혜관세보다 낮을 때만 우선합니다. 12%는 8%보다 높으므로 이 사례에서는 일반특혜관세율 8%를 적용합니다.'
  },
  {
    title: 'FTA 협정세율과 관세법상 세율',
    question: '원산지 등 FTA 적용 요건을 모두 충족한 물품의 FTA 협정세율은 10%, 관세법 제50조에 따른 적용세율은 5%입니다. 별도 특별관세는 없습니다. 적용세율은 무엇일까요?',
    options: ['FTA 협정세율 10%', '관세법상 적용세율 5%', '합산세율 15%', '평균세율 7.5%'],
    answer: 1,
    hint: 'FTA관세법 제5조는 협정세율이 관세법상 적용세율보다 높거나 같은 경우를 따로 규정합니다.',
    explanation: 'FTA관세법 제5조 제1항에 따라 협정세율이 관세법 제50조의 적용세율보다 같거나 높은 경우에는 관세법상 적용세율이 우선합니다. 따라서 5%입니다.'
  },
  {
    title: 'FTA와 덤핑방지관세',
    question: 'FTA 협정세율이 0%인 물품에 덤핑방지관세 부과조치가 적법하게 적용되고 있습니다. 다음 중 옳은 설명은 무엇일까요?',
    options: [
      'FTA 세율이 0%라면 모든 관세가 면제된다.',
      'FTA 세율이 0%라도 덤핑방지관세는 별도 적용될 수 있다.',
      '기본세율과 FTA 세율을 항상 합산한다.',
      '덤핑방지관세 대신 할당관세를 자동 적용한다.'
    ],
    answer: 1,
    hint: '일반적인 관세 인하와 불공정무역에 대응하는 무역구제 조치의 역할을 구별하세요.',
    explanation: 'FTA관세법 제5조 제2항은 덤핑방지관세 등을 협정관세보다 우선하도록 규정합니다. 따라서 FTA 협정세율이 0%여도 요건을 충족하는 덤핑방지관세는 별도로 부과될 수 있습니다.'
  }
];

function freshState() {
  return {
    tab: 'match',
    match: { done: [], selected: null, mistakes: 0, message: '왼쪽의 관세율 카드를 선택한 뒤 오른쪽에서 맞는 설명을 고르세요.', tone: '' },
    priority: { done: [], mistakes: 0, message: '가장 먼저 적용되는 관세율 그룹부터 선택하세요.', tone: '' },
    cases: { index: 0, done: [], mistakes: 0, showHint: false, showSummary: false, message: '' }
  };
}
function validIds(ids, source) { return Array.from(new Set((Array.isArray(ids) ? ids : []).filter(id => source.some(s => s.id === id)))); }
function loadState() {
  const base = freshState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return base;
    if (['match','priority','cases'].includes(saved.tab)) base.tab = saved.tab;
    base.match.done = validIds(saved.match?.done, MATCH_ITEMS);
    base.priority.done = Array.isArray(saved.priority?.done) ? saved.priority.done.filter((x,i) => PRIORITY_ITEMS[i]?.id === x) : [];
    // 저장 값의 우선순위 목록은 올바른 연속 순서만 인정한다.
    const count = base.priority.done.length;
    base.priority.done = PRIORITY_ITEMS.slice(0,count).map(p=>p.id).filter((id,i)=> saved.priority.done[i] === id);
    base.cases.done = Array.from(new Set((Array.isArray(saved.cases?.done) ? saved.cases.done : []).filter(i => Number.isInteger(i) && i >= 0 && i < CASES.length)));
    base.cases.index = Math.min(CASES.length - 1, Math.max(0, Number.isInteger(saved.cases?.index) ? saved.cases.index : 0));
    base.cases.showSummary = saved.cases?.showSummary === true;
    for (const k of ['match','priority','cases']) base[k].mistakes = Math.max(0, Number.isInteger(saved[k]?.mistakes) ? saved[k].mistakes : 0);
    return base;
  } catch { return base; }
}
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* 로컬 저장이 차단돼도 게임은 계속 가능 */ } }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function element(id) { return document.getElementById(id); }
const app = element('round-content');
let state = loadState();
function totalDone() { return state.match.done.length + state.priority.done.length + state.cases.done.length; }
function totalMistakes() { return state.match.mistakes + state.priority.mistakes + state.cases.mistakes; }
function score() { return Math.max(0, state.match.done.length*10 + state.priority.done.length*15 + state.cases.done.length*20 - totalMistakes()*2); }
function announce(msg) { element('announcer').textContent = msg; }
function progress() {
  element('score').innerHTML = `${score()} <small>/ 270</small>`;
  element('completed').innerHTML = `${totalDone()} <small>/ 19</small>`;
  element('mistakes').innerHTML = `${totalMistakes()} <small>회</small>`;
  const pct = Math.round(totalDone()/19*100);
  element('progress-percent').textContent = `${pct}%`;
  element('progress-fill').style.width = `${pct}%`;
  element('tab-match-state').textContent = `${state.match.done.length}/8`;
  element('tab-priority-state').textContent = `${state.priority.done.length}/6`;
  element('tab-cases-state').textContent = `${state.cases.done.length}/5`;
  document.querySelectorAll('[data-tab]').forEach(btn => {
    const active = btn.dataset.tab === state.tab;
    btn.classList.toggle('active',active);
    if (active) btn.setAttribute('aria-current','step');
    else btn.removeAttribute('aria-current');
  });
}
function notice(message,tone='') { return `<div class="game-notice ${tone}">${esc(message)}</div>`; }
function panelHead(n,title,description,complete,max) {
  return `<div class="panel-head"><div><div class="section-eyebrow">ROUND ${n}</div><h2>${esc(title)}</h2><p>${esc(description)}</p></div><span class="stage-count">${complete} / ${max} 완료</span></div>`;
}
function completion(title,desc) { return `<div class="completion"><span class="completion-icon" aria-hidden="true">✓</span><div><strong>${esc(title)}</strong><p>${esc(desc)}</p></div></div>`; }
function matchCard(id,side,index) {
  const p = MATCH_ITEMS.find(x=>x.id === id);
  const s = state.match;
  const done = s.done.includes(id);
  const selected = side === 'term' && s.selected === id;
  const cardClass = side === 'term' ? 'term-card' : 'definition-card';
  return `<button type="button" class="option-card ${cardClass}${done?' matched':''}${selected?' selected':''}" data-action="match-${side}" data-id="${id}" ${done?'disabled':''} aria-pressed="${selected?'true':'false'}"><span class="card-symbol" aria-hidden="true">${side === 'term' ? String(index+1).padStart(2,'0') : String.fromCharCode(65+index)}</span><span class="card-text">${esc(side==='term'?p.term:p.def)}</span>${done?'<span class="card-check" aria-hidden="true">✓</span>':''}</button>`;
}
function renderMatch() {
  const s = state.match;
  app.innerHTML = `${panelHead('01','관세율의 종류 맞히기','왼쪽 관세율을 선택하고, 그 뜻에 해당하는 오른쪽 카드를 클릭하세요.',s.done.length,8)}
    ${s.done.length===8?completion('첫 번째 라운드 완료!','관세율 8개와 설명을 모두 연결했습니다. 다음 라운드에서 적용 순서를 배워보세요.'):''}
    ${notice(s.message,s.tone)}
    <div class="card-grid">
      <div class="card-column"><div class="column-label">관세율 카드 <span>선택 1</span></div>${TERM_ORDER.map((id,i)=>matchCard(id,'term',i)).join('')}</div>
      <div class="card-column"><div class="column-label">설명 카드 <span>선택 2</span></div>${DEF_ORDER.map((id,i)=>matchCard(id,'definition',i)).join('')}</div>
    </div><div class="bottom-actions"><span class="tiny-note">정답 카드 1개당 10점 · 오답 1회당 2점 감점</span>${s.done.length===8?'<button class="primary-button" data-action="next-priority">2라운드로 이동 →</button>':'<button class="secondary-button" data-action="reset-match">이 라운드 다시 시작</button>'}</div>`;
}
function renderPriority() {
  const s = state.priority;
  app.innerHTML = `${panelHead('02','관세율 적용 우선순위','법에 따른 우선 적용 그룹을 1순위부터 차례대로 선택하세요.',s.done.length,6)}
    ${s.done.length===6?completion('두 번째 라운드 완료!','우선순위를 맞혔습니다. 실전 사례에서는 세율 비교의 예외도 판단해야 합니다.'):''}
    ${notice(s.message,s.tone)}
    <div class="priority-slots">${PRIORITY_ITEMS.map((item,i)=>`<div class="priority-slot"><span class="priority-number">${i+1}순위</span><div class="slot-fill ${s.done.includes(item.id)?'filled':''}">${s.done.includes(item.id)?`<span class="tick" aria-hidden="true">✓</span>${esc(item.name)}`:'해당 그룹을 선택하세요'}</div></div>`).join('')}</div>
    ${s.done.length<6?`<div class="priority-choices">${PRIORITY_CHOICE_ORDER.map(id=>{const p=PRIORITY_ITEMS.find(x=>x.id===id);const used=s.done.includes(id);return `<button class="option-card priority-choice${used?' used':''}" data-action="priority-choice" data-id="${id}" ${used?'disabled':''}>${esc(p.name)}</button>`;}).join('')}</div>`:''}
    <div class="bottom-actions"><span class="tiny-note">올바른 순서 선택 시 15점 · 오답 1회당 2점 감점</span>${s.done.length===6?'<button class="primary-button" data-action="next-cases">3라운드로 이동 →</button>':'<button class="secondary-button" data-action="reset-priority">이 라운드 다시 시작</button>'}</div>
    <div class="explain-box"><h3>우선순위 학습 포인트</h3><ol><li>1~4순위 그룹은 관세법 제50조 제2항에 따릅니다.</li><li>잠정세율은 기본세율보다 우선합니다.</li><li>국제협력관세·할당관세 등의 세율 비교 조건을 반드시 확인해야 합니다.</li><li>FTA 협정관세율의 우선 적용 관계는 FTA관세법 제5조를 별도로 확인합니다.</li></ol></div>`;
}
function renderCases() {
  const s=state.cases;
  if (s.done.length === CASES.length && s.showSummary) {
    app.innerHTML = `${panelHead('03','실전 적용세율 판단','모든 실전 사례를 완료했습니다.',5,5)}${completion('전체 학습 완료!','관세율의 종류, 적용 순서, 세율 비교와 FTA 특례까지 학습했습니다.')}
    <div class="explain-box"><h3>학습 결과</h3><div class="final-score">${score()} / 270점</div><p>총 ${totalDone()}문제 완료 · 오답 ${totalMistakes()}회</p><p class="tiny-note">점수 = 정답 기본점수 − 오답 1회당 2점 (0점 미만 없음)</p></div>
    <div class="bottom-actions"><button class="secondary-button" data-action="review-cases">사례 해설 다시 보기</button><button class="primary-button" data-action="reset-all">새 게임 시작 →</button></div>`;
    return;
  }
  const idx=s.index;
  const c=CASES[idx];
  const answered=s.done.includes(idx);
  app.innerHTML = `${panelHead('03','실전 적용세율 판단','가상의 수입통관 상황에서 실제 적용할 세율이나 올바른 판단을 고르세요.',s.done.length,5)}
    <div class="case-dots" aria-label="사례 진행 현황">${CASES.map((_,i)=>`<span class="case-dot${s.done.includes(i)?' done':''}${i===idx?' current':''}" title="사례 ${i+1}"></span>`).join('')}</div>
    <div class="case-meta">CASE ${String(idx+1).padStart(2,'0')} / 05 · ${esc(c.title)}</div>
    <h3 class="case-question">${esc(c.question)}</h3>
    <div class="case-options">${c.options.map((option,i)=>`<button type="button" class="option-card case-option${answered&&i===c.answer?' correct':''}" data-action="case-answer" data-index="${i}" ${answered?'disabled':''}><span class="card-symbol" aria-hidden="true">${String.fromCharCode(65+i)}</span><span class="card-text">${esc(option)}</span>${answered&&i===c.answer?'<span class="card-check" aria-hidden="true">✓</span>':''}</button>`).join('')}</div>
    ${answered?`<div class="answer-explain"><strong>정답 해설</strong><p>${esc(c.explanation)}</p></div>`:s.message?notice(s.message,'bad'):''}
    ${s.showHint&&!answered?`<div class="hint-box">힌트: ${esc(c.hint)}</div>`:''}
    <div class="bottom-actions"><span class="tiny-note">정답 1개당 20점 · 오답 1회당 2점 감점</span>${answered?`<button class="primary-button" data-action="next-case">${s.done.length===5?'최종 결과 보기 →':'다음 사례 →'}</button>`:`<button class="secondary-button" data-action="toggle-hint">${s.showHint?'힌트 접기':'힌트 보기'}</button>`}</div>`;
}
function render() {
  progress();
  if (state.tab==='match') renderMatch();
  else if (state.tab==='priority') renderPriority();
  else renderCases();
  save();
}
function switchTab(tab) { state.tab=tab;render();announce(`${tab==='match'?'관세율 종류':tab==='priority'?'적용 우선순위':'실전 판단'} 라운드`); }
function resetRound(name) {
  if (!window.confirm('이 라운드의 정답 기록과 점수를 초기화할까요?')) return;
  state[name]=freshState()[name];
  render();announce('라운드가 초기화되었습니다.');
}
function resetAll() {
  if (!window.confirm('모든 라운드의 학습 기록과 점수를 초기화할까요?')) return;
  state=freshState();render();announce('전체 학습 기록을 초기화했습니다.');
}
function action(name,data) {
  if (name==='match-term') {
    if (state.match.done.includes(data.id)) return;
    state.match.selected=data.id;
    state.match.message='이 관세율에 맞는 오른쪽 설명 카드를 선택하세요.';
    state.match.tone='';
    render();announce(state.match.message);
    return;
  }
  if (name==='match-definition') {
    const s=state.match;
    if (s.done.includes(data.id)) return;
    if (!s.selected) {s.message='왼쪽 관세율 카드부터 선택하세요.';s.tone='bad';}
    else if (s.selected===data.id) {
      s.done.push(data.id);
      s.message=`정답! ${MATCH_ITEMS.find(x=>x.id===data.id).term}과 설명을 연결했습니다.`;
      s.selected=null;s.tone='good';
    } else {s.mistakes++;s.message='아쉽습니다. 선택한 관세율을 다시 생각하고 설명 카드를 골라보세요.';s.tone='bad';}
    render();announce(s.message);
    return;
  }
  if (name==='priority-choice') {
    const s=state.priority;const next=PRIORITY_ITEMS[s.done.length];
    if (!next || s.done.includes(data.id)) return;
    if (data.id===next.id) {
      s.done.push(data.id);
      s.message=`${s.done.length}순위 정답! ${next.explanation}`;s.tone='good';
    } else {s.mistakes++;s.message='적용 순서가 다릅니다. 아직 빈칸인 가장 높은 순위부터 다시 선택하세요.';s.tone='bad';}
    render();announce(s.message);
    return;
  }
  if (name==='case-answer') {
    const s=state.cases;const idx=s.index;const c=CASES[idx];
    if (s.done.includes(idx)) return;
    if (Number(data.index)===c.answer) {
      s.done.push(idx);s.message='';s.showHint=false;
      announce('정답입니다. '+c.explanation);
    } else {s.mistakes++;s.message='오답입니다. 선택지와 법적 조건을 다시 검토해 보세요.';announce(s.message);}
    render();
    return;
  }
  if (name==='next-case') {
    const s=state.cases;
    if (!s.done.includes(s.index)) return;
    if (s.done.length===CASES.length) {s.showSummary=true;render();return;}
    s.index=CASES.findIndex((_,i)=>!s.done.includes(i));
    s.message='';s.showHint=false;render();return;
  }
  if (name==='toggle-hint') {state.cases.showHint=!state.cases.showHint;render();return;}
  if (name==='next-priority') {switchTab('priority');return;}
  if (name==='next-cases') {switchTab('cases');return;}
  if (name==='reset-match') {resetRound('match');return;}
  if (name==='reset-priority') {resetRound('priority');return;}
  if (name==='reset-all') {resetAll();return;}
  if (name==='review-cases') {
    state.cases.done=[];state.cases.index=0;state.cases.message='';state.cases.showHint=false;state.cases.showSummary=false;render();announce('실전 사례 라운드를 다시 시작합니다.');
  }
}

app.addEventListener('click', e => {
  const btn=e.target.closest('button[data-action]');
  if (!btn) return;
  action(btn.dataset.action,btn.dataset);
});
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
element('reset-all').addEventListener('click',resetAll);
element('toggle-notes').addEventListener('click',() => {
  const content=element('notes-content');
  content.hidden=!content.hidden;
  const open=!content.hidden;
  element('toggle-notes').setAttribute('aria-expanded',String(open));
  element('toggle-notes').innerHTML=open?'학습 노트 접기 <span aria-hidden="true">−</span>':'학습 노트 펼치기 <span aria-hidden="true">＋</span>';
});
render();
