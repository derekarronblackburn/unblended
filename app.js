/* Unblended - an IFS unblending walkthrough.
   No dependencies, no network, no accounts. Everything lives in localStorage.

   The session follows Richard Schwartz's 6 Fs (Find, Focus, Flesh out, Feel
   toward, beFriend, Fear), with a grounding breath as the entry step. The
   pivotal one is "Feel toward": if you feel anything other than curious, warm
   or calm toward the part, you are blended with a *second* part, and that one
   has to be asked to step back before the work can continue. That branch is the
   whole mechanism, so it is built in rather than mentioned.

   Deliberate scope limit: this tool stays with protectors. It never directs
   anyone toward an exile. That is correct IFS practice for unguided work. */

'use strict';

const KEY = 'unblended.v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ------------------------------------------------------------------ store */

const blank = () => ({ version: 1, settings: { theme: 'auto' }, parts: [], entries: [], draft: null });

let db = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return Object.assign(blank(), parsed);
  } catch (e) {
    console.warn('Could not read saved data, starting fresh.', e);
    return blank();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    toast('Could not save. Storage may be full or private mode is on.');
    console.warn(e);
  }
}

/* ------------------------------------------------------------------ steps */

const FEELINGS_OPEN = ['Curious', 'Warm toward it', 'Calm, neutral'];
const FEELINGS_BLENDED = ['Irritated by it', 'Afraid of it', 'I want it gone'];

const STEPS = [
  {
    key: 'find',
    kicker: 'Step 1 of 6 - Find',
    title: 'Where is it?',
    body: 'Something is loud. Find where you actually notice it: chest, jaw, gut, a pressure behind the eyes, a pull to get up and leave the room. If it is not in your body, it might be just around you. Either is fine.',
    label: 'Where do you notice it?',
    ph: 'Tight band across the chest. Heat at the back of the neck.'
  },
  {
    key: 'focus',
    kicker: 'Step 2 of 6 - Focus',
    title: 'Stay with it',
    body: 'Keep your attention on that spot for a few breaths. You are not fixing anything yet, and you do not have to make it smaller. Just notice whether it gets stronger, softer, or moves somewhere else.',
    label: 'What happened when you stayed?',
    ph: 'Got heavier for a second, then eased off a little.'
  },
  {
    key: 'flesh',
    kicker: 'Step 3 of 6 - Flesh it out',
    title: 'Give it some shape',
    body: 'If it had an age, a posture, a tone of voice, what would they be? Some people get a picture, some get a sentence, some only get a texture. All of it counts, and none of it has to make sense yet.',
    label: 'What is it like?',
    ph: 'Young. Braced. Talks fast, like it is trying to get out ahead of something.'
  },
  {
    key: 'feel',
    kicker: 'Step 4 of 6 - Feel toward',
    title: 'How do you feel toward it?',
    body: 'Not how the part feels. How you feel toward the part. This is the step the whole thing turns on, so answer honestly rather than well.',
    label: 'Anything else you notice?',
    ph: 'Optional',
    choices: true
  },
  {
    key: 'befriend',
    kicker: 'Step 5 of 6 - Befriend',
    title: 'Let it know you heard it',
    body: 'Tell it, inwardly, that you can see it has been working hard. Then ask what it wants you to know, and wait instead of answering for it. This is not a trick for getting rid of it. A part that feels heard usually turns its own volume down.',
    label: 'What does it want you to know?',
    ph: 'That nobody was going to catch it if it stopped.'
  },
  {
    key: 'fear',
    kicker: 'Step 6 of 6 - Fear',
    title: 'What is it afraid of?',
    body: 'Ask what it thinks would happen if it stopped doing this job. This is usually the most useful sentence in the session, and the answer is often much older than today.',
    label: 'What is it afraid would happen?',
    ph: 'That everything falls apart and it is my fault.'
  },
  {
    key: 'choose',
    kicker: 'Closing',
    title: 'Now choose',
    body: 'There is a bit of room now. From here rather than from the part: what is the one thing you actually want to do next? Small counts. Saying nothing counts.',
    label: 'What are you going to do?',
    ph: 'Go back in and finish the conversation without the edge in my voice.',
    naming: true
  }
];

/* ------------------------------------------------------------------ learn */

const LEARN = [
  ['What is a part?',
   `A part is a piece of you with its own agenda, feelings and history. Not a metaphor and not a disorder: Internal Family Systems takes the ordinary experience of "part of me wants to go, part of me wants to stay" completely literally, and works with it.
   <p>Parts are not the problem. A part becomes a problem when it is stuck in an old job it took on a long time ago and never got released from.</p>`],

  ['What is Self?',
   `The thing underneath the parts. IFS says everyone has one and it cannot be damaged, only obscured. You know it is present by how it feels: <strong>calm, curious, compassionate, clear, courageous, confident, creative, connected</strong>.
   <p>You do not have to build Self. You unblend from what is covering it.</p>`],

  ['What does blended mean?',
   `Blended is when a part's feelings and beliefs are so completely yours that there is no gap. You do not think "a part of me is furious", you think <strong>"I am furious"</strong>, and you act from there.
   <p>The tell is disproportion. When the size of your reaction does not match the size of what happened, the trigger is not the cause, and something older just got recruited.</p>`],

  ['The three jobs',
   `<p><strong>Managers</strong> run ahead of trouble. Planning, perfecting, pleasing, criticising you before anyone else can. Their job is that nothing bad gets close.</p>
    <p><strong>Firefighters</strong> arrive after something breaks through. Numbing, scrolling, bingeing, raging, leaving. They are not reckless for the sake of it; they are trying to end the pain right now, at any cost.</p>
    <p><strong>Exiles</strong> are the young parts carrying the hurt that the other two are working around. Both kinds of protector exist because of them.</p>
    <p>Managers and firefighters often loathe each other, which is why you can feel torn in half by two things you did not choose.</p>`],

  ['The move that actually works',
   `Ask how <em>you</em> feel toward the part. If the answer is curious, warm or calm, Self is present and you can carry on.
   <p>If the answer is irritated, frightened, or "I just want it gone", that is not a failure. It means a <strong>second part</strong> has shown up, and it is now driving. So you turn and speak to that one: ask it to give you a little room, and promise you are not going to let the first part take over. Then check again.</p>
   <p>That loop is unblending. Everything else in this app is scaffolding around it.</p>`],

  ['Why this app stops at protectors',
   `It never sends you looking for an exile, on purpose. Going to the young, wounded parts is powerful and it is also the part of this work that can knock you flat if it happens without support.
   <p>Protectors are where unguided practice belongs, and getting to know them well is not a consolation prize. It is most of the work.</p>`],

  ['Where this comes from',
   `Internal Family Systems was developed by <strong>Richard Schwartz</strong> in the 1980s. The session here follows his six Fs: Find, Focus, Flesh out, Feel toward, beFriend, and Fear.
   <p>This app is a practice aid built by someone doing the work, not a certified anything. If it interests you, the source material is worth going to directly.</p>`]
];

/* ------------------------------------------------------------------ router */

const VIEWS = ['unblend', 'session', 'breath', 'parts', 'part-edit', 'journal', 'entry', 'learn'];
const TITLES = {
  unblend: 'Unblended', session: 'Unblending', breath: 'Unblending',
  parts: 'Parts', 'part-edit': 'Part', journal: 'Journal', entry: 'Entry', learn: 'Learn'
};
const TABS = { unblend: 'unblend', session: 'unblend', breath: 'unblend', parts: 'parts', 'part-edit': 'parts', journal: 'journal', entry: 'journal', learn: 'learn' };

let view = 'unblend';
let backTo = null;

function show(name, opts = {}) {
  view = name;
  VIEWS.forEach(v => $('#view-' + v).classList.toggle('is-active', v === name));
  $('#title').textContent = opts.title || TITLES[name];
  $$('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.tab === TABS[name]));
  backTo = opts.back || null;
  $('#backBtn').hidden = !backTo;
  $('#tabbar').hidden = (name === 'session' || name === 'breath');
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------ session */

let session = null;   // { i, answers, feeling }
let breathStop = false;

function startSession(resume) {
  session = resume
    ? { i: db.draft.i, answers: { ...db.draft.answers }, feeling: db.draft.feeling || '' }
    : { i: 0, answers: {}, feeling: '' };
  if (resume) { renderStep(); show('session'); }
  else runBreath();
}

const wait = ms => new Promise(r => setTimeout(r, ms));

async function runBreath() {
  breathStop = false;
  show('breath');
  const circle = $('#breathCircle'), word = $('#breathWord'), count = $('#breathCount');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IN = reduce ? 1600 : 4000, OUT = reduce ? 2400 : 6000;

  for (let r = 1; r <= 4; r++) {
    if (breathStop) return;
    count.textContent = `Round ${r} of 4`;
    word.textContent = 'In';
    circle.style.transitionDuration = IN + 'ms';
    circle.classList.add('inhale');
    await wait(IN);
    if (breathStop) return;
    word.textContent = 'Out';
    circle.style.transitionDuration = OUT + 'ms';
    circle.classList.remove('inhale');
    await wait(OUT);
  }
  if (!breathStop) endBreath();
}

function endBreath() {
  breathStop = true;
  $('#breathCircle').classList.remove('inhale');
  renderStep();
  show('session');
}

function renderStep() {
  const s = STEPS[session.i];
  $('#stepKicker').textContent = s.kicker;
  $('#stepTitle').textContent = s.title;
  $('#stepBody').textContent = s.body;
  $('#stepLabel').textContent = s.label;

  const input = $('#stepInput');
  input.placeholder = s.ph;
  input.value = session.answers[s.key] || '';

  $('#progress').innerHTML = STEPS.map((_, i) => `<i class="${i <= session.i ? 'done' : ''}"></i>`).join('');
  $('#prevStep').hidden = session.i === 0;
  $('#nextStep').innerHTML = session.i === STEPS.length - 1
    ? 'Finish <svg class="ico"><use href="#i-check"/></svg>'
    : 'Next <svg class="ico"><use href="#i-next"/></svg>';

  const extra = $('#stepExtra');
  extra.innerHTML = '';
  if (s.choices) renderFeelingCheck(extra);
  if (s.naming) renderNaming(extra);
}

function renderFeelingCheck(host) {
  const chosen = session.feeling;
  const blended = FEELINGS_BLENDED.includes(chosen);

  host.innerHTML = `
    <div class="row" id="feelRow">
      ${[...FEELINGS_OPEN, ...FEELINGS_BLENDED].map(f =>
        `<button class="btn sm ${f === chosen ? 'primary' : ''}" data-feel="${f}">${f}</button>`).join('')}
    </div>
    ${chosen && !blended ? `
      <div class="note">
        <p><strong>That is Self.</strong> Curiosity toward a part is the signal that you are not inside it any more. Carry on.</p>
      </div>` : ''}
    ${blended ? `
      <div class="note warn">
        <p><strong>That is a second part talking.</strong> Nothing has gone wrong. The one that wants the first part gone is itself a part, and right now it is the one driving.</p>
        <p>So turn to that one instead. Inwardly: <em>I can see you do not want this. Would you give me a little room? I am not going to let it take over.</em></p>
        <p>Wait a moment, then ask again: how do you feel toward the first part now?</p>
      </div>` : ''}
  `;

  $$('#feelRow [data-feel]', host).forEach(b => b.onclick = () => {
    collectStep();          // renderStep repaints from answers, so bank the textarea first
    session.feeling = b.dataset.feel;
    persistDraft();
    renderStep();
  });
}

function renderNaming(host) {
  const names = db.parts.map(p => p.name);
  host.innerHTML = `
    <label class="field">
      <span class="label">Does this part have a name? (optional)</span>
      <input type="text" id="partName" list="partNames" placeholder="The one that goes quiet"
             value="${escapeAttr(session.answers.partName || '')}">
      <datalist id="partNames">${names.map(n => `<option value="${escapeAttr(n)}">`).join('')}</datalist>
    </label>
    <p class="muted sm">Naming it is what lets you recognise it next time instead of becoming it. New names get saved to your Parts list.</p>
  `;
}

function collectStep() {
  const s = STEPS[session.i];
  session.answers[s.key] = $('#stepInput').value.trim();
  if (s.naming) {
    const el = $('#partName');
    if (el) session.answers.partName = el.value.trim();
  }
}

function persistDraft() {
  db.draft = { i: session.i, answers: session.answers, feeling: session.feeling };
  save();
}

function nextStep() {
  collectStep();
  if (session.i < STEPS.length - 1) {
    session.i++;
    persistDraft();
    renderStep();
    window.scrollTo(0, 0);
  } else {
    finishSession();
  }
}

function prevStep() {
  collectStep();
  persistDraft();
  session.i--;
  renderStep();
  window.scrollTo(0, 0);
}

function finishSession(partial) {
  collectStep();
  const answered = Object.values(session.answers).some(v => v && v.trim());
  if (!answered && !session.feeling) {
    db.draft = null; save(); session = null;
    show('unblend'); refreshHome();
    return;
  }

  const name = (session.answers.partName || '').trim();
  if (name && !db.parts.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    db.parts.push({
      id: uid(), name,
      protects: session.answers.fear || '',
      trigger: '', cue: session.answers.find || '',
      created: Date.now(), updated: Date.now()
    });
  }

  db.entries.unshift({
    id: uid(),
    created: Date.now(),
    partName: name,
    feeling: session.feeling,
    partial: !!partial,
    answers: { ...session.answers }
  });

  db.draft = null;
  save();
  session = null;
  toast(partial ? 'Saved where you got to.' : 'Saved.');
  renderJournal();
  show('journal');
  refreshHome();
}

/* ------------------------------------------------------------------ parts */

let editingId = null;

function renderParts() {
  const host = $('#partsList');
  if (!db.parts.length) {
    host.innerHTML = `<div class="empty">No parts yet.<br>They tend to introduce themselves during a session.</div>`;
    return;
  }
  host.innerHTML = db.parts.map(p => `
    <div class="card tap" data-part="${p.id}">
      <h4>${escapeHtml(p.name)}</h4>
      ${p.protects ? `<p class="sm muted">Protects: ${escapeHtml(p.protects)}</p>` : ''}
      ${p.cue ? `<p class="sm"><span class="pill">Tell</span> ${escapeHtml(p.cue)}</p>` : ''}
    </div>`).join('');
  $$('[data-part]', host).forEach(el => el.onclick = () => editPart(el.dataset.part));
}

function editPart(id) {
  editingId = id;
  const p = id ? db.parts.find(x => x.id === id) : null;
  $('#pName').value = p ? p.name : '';
  $('#pProtects').value = p ? p.protects : '';
  $('#pTrigger').value = p ? p.trigger : '';
  $('#pCue').value = p ? p.cue : '';
  $('#deletePart').hidden = !p;
  show('part-edit', { back: 'parts', title: p ? p.name : 'New part' });
}

function savePart() {
  const name = $('#pName').value.trim();
  if (!name) { toast('Give it a name first.'); return; }
  const data = {
    name,
    protects: $('#pProtects').value.trim(),
    trigger: $('#pTrigger').value.trim(),
    cue: $('#pCue').value.trim(),
    updated: Date.now()
  };
  if (editingId) Object.assign(db.parts.find(p => p.id === editingId), data);
  else db.parts.push(Object.assign({ id: uid(), created: Date.now() }, data));
  save(); renderParts(); show('parts'); toast('Saved.');
}

/* ------------------------------------------------------------------ journal */

function renderJournal() {
  const host = $('#journalList');
  if (!db.entries.length) {
    host.innerHTML = `<div class="empty">Nothing here yet.<br>Finished sessions land here so you can look back.</div>`;
    return;
  }
  host.innerHTML = db.entries.map(e => `
    <div class="card tap" data-entry="${e.id}">
      <h4>${escapeHtml(e.partName || 'A session')}</h4>
      <p class="meta">${when(e.created)}${e.partial ? ' - stopped early' : ''}</p>
      ${e.feeling ? `<p class="sm"><span class="pill ${FEELINGS_BLENDED.includes(e.feeling) ? 'clay' : ''}">${escapeHtml(e.feeling)}</span></p>` : ''}
      ${e.answers.fear ? `<p class="sm muted">${escapeHtml(trim(e.answers.fear, 90))}</p>` : ''}
    </div>`).join('');
  $$('[data-entry]', host).forEach(el => el.onclick = () => openEntry(el.dataset.entry));
}

function openEntry(id) {
  const e = db.entries.find(x => x.id === id);
  if (!e) return;
  const rows = STEPS.filter(s => (e.answers[s.key] || '').trim()).map(s => `
    <h3>${escapeHtml(s.label)}</h3>
    <p class="entry-answer">${escapeHtml(e.answers[s.key])}</p>`).join('');

  $('#entryBody').innerHTML = `
    <p class="step-kicker">${when(e.created)}</p>
    <h2 class="step-title">${escapeHtml(e.partName || 'A session')}</h2>
    ${e.feeling ? `<p><span class="pill ${FEELINGS_BLENDED.includes(e.feeling) ? 'clay' : ''}">Felt ${escapeHtml(e.feeling.toLowerCase())} toward it</span></p>` : ''}
    ${rows || '<p class="muted">Nothing was written down in this one.</p>'}
    <button class="btn ghost wide danger sm" id="delEntry"><svg class="ico"><use href="#i-trash"/></svg> Delete this entry</button>`;

  $('#delEntry').onclick = () => {
    if (!confirm('Delete this entry? It cannot be recovered.')) return;
    db.entries = db.entries.filter(x => x.id !== id);
    save(); renderJournal(); show('journal'); toast('Deleted.');
  };
  show('entry', { back: 'journal', title: 'Entry' });
}

/* ------------------------------------------------------------------ data io */

function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `unblended-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const incoming = JSON.parse(fr.result);
      if (!incoming || !Array.isArray(incoming.entries) || !Array.isArray(incoming.parts)) {
        throw new Error('shape');
      }
      const seen = new Set(db.entries.map(e => e.id));
      incoming.entries.forEach(e => { if (!seen.has(e.id)) db.entries.push(e); });
      const names = new Set(db.parts.map(p => p.name.toLowerCase()));
      incoming.parts.forEach(p => { if (!names.has((p.name || '').toLowerCase())) db.parts.push(p); });
      db.entries.sort((a, b) => b.created - a.created);
      save(); renderJournal(); renderParts();
      toast('Merged in.');
    } catch (e) {
      toast('That file did not look like an Unblended export.');
    }
  };
  fr.readAsText(file);
}

/* ------------------------------------------------------------------ helpers */

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escapeAttr = escapeHtml;
const trim = (s, n) => s.length > n ? s.slice(0, n).trimEnd() + '...' : s;

function when(ts) {
  const d = new Date(ts), now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return 'Today, ' + time;
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday, ' + time;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' }) + ', ' + time;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function applyTheme() {
  const mode = db.settings.theme;
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', mode);
  const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  // setAttribute, not innerHTML: innerHTML on an SVG element is a namespace trap.
  $('#themeBtn use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
}

function refreshHome() {
  $('#resumeCard').hidden = !db.draft;
}

function renderLearn() {
  $('#learnBody').innerHTML = `
    <p class="lede">A short guide</p>
    ${LEARN.map(([q, a]) => `
      <details class="qa"><summary>${q}</summary><div class="qa-body">${a}</div></details>`).join('')}
    <div class="note warn">
      <p><strong>This is a practice aid, not therapy and not a crisis service.</strong> If you are in danger or thinking about harming yourself, contact your local emergency number, or in the US call or text 988.</p>
    </div>
    <p class="foot">Everything you write stays in this browser. Nothing is uploaded, and there is no account.</p>`;
}

/* ------------------------------------------------------------------ wiring */

$$('.tab').forEach(t => t.onclick = () => {
  const name = t.dataset.tab;
  if (name === 'unblend') refreshHome();
  if (name === 'parts') renderParts();
  if (name === 'journal') renderJournal();
  show(name);
});

$('#backBtn').onclick = () => show(backTo);
$('#themeBtn').onclick = () => {
  const order = ['auto', 'light', 'dark'];
  db.settings.theme = order[(order.indexOf(db.settings.theme) + 1) % 3];
  save(); applyTheme();
  toast(`Theme: ${db.settings.theme}`);
};

$('#startSession').onclick = () => startSession(false);
$('#resumeBtn').onclick = () => startSession(true);
$('#discardBtn').onclick = () => { db.draft = null; save(); refreshHome(); toast('Cleared.'); };
$('#skipBreath').onclick = endBreath;
$('#nextStep').onclick = nextStep;
$('#prevStep').onclick = prevStep;
$('#bailStep').onclick = () => finishSession(true);

$('#addPart').onclick = () => editPart(null);
$('#savePart').onclick = savePart;
$('#cancelPart').onclick = () => show('parts');
$('#deletePart').onclick = () => {
  if (!confirm('Delete this part?')) return;
  db.parts = db.parts.filter(p => p.id !== editingId);
  save(); renderParts(); show('parts'); toast('Deleted.');
};

$('#exportBtn').onclick = exportData;
$('#importBtn').onclick = () => $('#importFile').click();
$('#importFile').onchange = e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; };

addEventListener('scroll', () => $('.topbar').classList.toggle('scrolled', scrollY > 4), { passive: true });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

applyTheme();
refreshHome();
renderLearn();
renderParts();
renderJournal();
show('unblend');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
