/* Unblended - an IFS unblending walkthrough.
   No dependencies, no network, no accounts. Everything lives in localStorage.

   The session follows Richard Schwartz's 6 Fs (Find, Focus, Flesh out, Feel
   toward, beFriend, Fear). The pivotal one is "Feel toward": if you feel
   anything other than curious, warm or calm toward the part, you are blended
   with a *second* part, and that one has to be asked to step back before the
   work can continue. That branch is the whole mechanism, so it is built in
   rather than mentioned.

   Deliberate scope limit: the walkthrough stays with protectors and never
   directs anyone toward an exile. A part can be *classified* as an exile, which
   is useful self-knowledge, and doing so surfaces a note about support rather
   than a deeper prompt. */

'use strict';

const KEY = 'unblended.v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ------------------------------------------------------------------ store */

const blank = () => ({
  version: 2,
  settings: { theme: 'auto', introSeen: false },
  parts: [], entries: [], draft: null
});

let db = migrate(load());

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    const base = blank();
    return Object.assign(base, parsed, { settings: Object.assign(base.settings, parsed.settings) });
  } catch (e) {
    console.warn('Could not read saved data, starting fresh.', e);
    return blank();
  }
}

// v1 entries had no title/severity. Backfill so old journals still render well.
function migrate(d) {
  if (d.version === 1 || !d.version) {
    d.entries.forEach(e => { if (!e.title) e.title = titleFor(e); });
    d.version = 2;
  }
  return d;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    toast('Could not save. Storage may be full, or private mode is on.');
    console.warn(e);
  }
}

/* ------------------------------------------------------------------ vocab */

const SEVERITY = ['Barely there', 'Noticeable', 'Loud', 'Very loud', 'Overwhelming'];

const MAINTENANCE = [
  { key: 'sleep',    q: 'Sleep',    ok: 'Slept alright',  poor: 'Slept badly' },
  { key: 'food',     q: 'Food',     ok: 'Eaten today',    poor: 'Barely eaten' },
  { key: 'movement', q: 'Movement', ok: 'Moved my body',  poor: 'Not really' }
];

const JOBS = [
  { key: 'manager', name: 'Manager',
    blurb: 'Runs ahead of trouble. Planning, perfecting, pleasing, getting critical of you before anyone else can.' },
  { key: 'firefighter', name: 'Firefighter',
    blurb: 'Arrives after something has already broken through. Numbing, scrolling, bingeing, raging, leaving the room.' },
  { key: 'exile', name: 'Exile',
    blurb: 'Young, and carrying the hurt that the other two are working around.' },
  { key: 'unsure', name: 'Not sure yet',
    blurb: 'Perfectly fine. It often becomes obvious after you have met it a few times.' }
];

const FEELINGS_OPEN = ['Curious', 'Warm toward it', 'Calm, neutral'];
const FEELINGS_BLENDED = ['Irritated by it', 'Afraid of it', 'I want it gone'];

/* ------------------------------------------------------------------ steps */

const STEPS = [
  { key: 'find', f: 'Find',
    title: 'Where is it?',
    body: 'Something is loud. Find where you actually notice it: chest, jaw, gut, a pressure behind the eyes, a pull to get up and leave the room. If it is not in your body it might be just around you. Either is fine.',
    label: 'Where do you notice it?',
    ph: 'Tight band across the chest. Heat at the back of the neck.' },

  { key: 'focus', f: 'Focus',
    title: 'Stay with it',
    body: 'Keep your attention on that spot for a few breaths. You are not fixing anything yet and you do not have to make it smaller. Just notice whether it gets stronger, softer, or moves.',
    label: 'What happened when you stayed?',
    ph: 'Got heavier for a second, then eased off a little.' },

  { key: 'flesh', f: 'Flesh it out',
    title: 'Give it some shape',
    body: 'If it had an age, a posture, a tone of voice, what would they be? Some people get a picture, some get a sentence, some only get a texture. All of it counts and none of it has to make sense yet.',
    label: 'What is it like?',
    ph: 'Young. Braced. Talks fast, like it is getting out ahead of something.' },

  { key: 'feel', f: 'Feel toward', extra: 'feel',
    title: 'How do you feel toward it?',
    body: 'Not how the part feels. How you feel toward the part. This is the step the whole thing turns on, so answer honestly rather than well.',
    label: 'Anything else you notice?',
    ph: 'Optional' },

  { key: 'befriend', f: 'Befriend',
    title: 'Let it know you heard it',
    body: 'Tell it, inwardly, that you can see it has been working hard. Then ask what it wants you to know, and wait instead of answering for it. This is not a trick for getting rid of it. A part that feels heard usually turns its own volume down.',
    label: 'What does it want you to know?',
    ph: 'That nobody was going to catch it if it stopped.' },

  { key: 'fear', f: 'Fear',
    title: 'What is it afraid of?',
    body: 'Ask what it thinks would happen if it stopped doing this job. This is usually the most useful sentence in the session, and the answer is often much older than today.',
    label: 'What is it afraid would happen?',
    ph: 'That everything falls apart and it is my fault.' },

  { key: 'choose', f: 'Closing', closing: true, extra: 'after',
    title: 'Now choose',
    body: 'There is a bit of room now. From here rather than from the part: what is the one thing you actually want to do next? Small counts. Saying nothing counts.',
    label: 'What are you going to do?',
    ph: 'Go back in and finish the conversation without the edge in my voice.' },

  { key: 'name', f: 'Closing', closing: true, extra: 'naming', noField: true,
    title: 'Give it a name',
    body: 'This is what turns a bad hour into something you recognise next time. A name does not have to be clever, it has to be yours.',
    label: '' }
];

const QUICK_KEYS = ['find', 'feel', 'fear', 'choose', 'name'];

/* ------------------------------------------------------------------ learn */

const LEARN = [
  ['Is this a replacement for therapy?',
   `<strong>No, and it is not trying to be.</strong> This is a tool for the moment you are in, and for understanding yourself a bit better between sessions.
   <p>What it cannot do: know your history, notice the thing you are steering around, catch a pattern you cannot see, or be present when something opens up and you need another person there. A good therapist does all four. If you have access to one, this works best alongside them, not instead.</p>
   <p>If you are in danger or thinking about harming yourself, contact your local emergency number, or in the US call or text <strong>988</strong>.</p>`],

  ['What is a part?',
   `A part is a piece of you with its own agenda, feelings and history. Not a metaphor and not a disorder: Internal Family Systems takes the ordinary experience of "part of me wants to go, part of me wants to stay" completely literally, and works with it.
   <p>Parts are not the problem. A part becomes a problem when it is stuck in an old job it took on a long time ago and never got released from.</p>`],

  ['What is Self?',
   `The thing underneath the parts. IFS says everyone has one and that it cannot be damaged, only obscured. You know it is present by how it feels: <strong>calm, curious, compassionate, clear, courageous, confident, creative, connected</strong>.
   <p>You do not have to build Self. You unblend from whatever is covering it.</p>`],

  ['What does blended mean?',
   `Blended is when a part's feelings and beliefs are so completely yours that there is no gap. You do not think "a part of me is furious", you think <strong>"I am furious"</strong>, and you act from there.
   <p>The tell is disproportion. When the size of your reaction does not match the size of what happened, the trigger is not the cause, and something older just got recruited.</p>`],

  ['The three jobs',
   `<p><strong>Managers</strong> run ahead of trouble. Planning, perfecting, pleasing, criticising you before anyone else can. Their job is that nothing bad gets close.</p>
    <p><strong>Firefighters</strong> arrive after something breaks through. Numbing, scrolling, bingeing, raging, leaving. They are not reckless for its own sake; they are trying to end pain right now, at any cost.</p>
    <p><strong>Exiles</strong> are the young parts carrying the hurt that the other two work around. Both kinds of protector exist because of them.</p>
    <p>Managers and firefighters often loathe each other, which is why you can feel torn in half by two things you never chose.</p>`],

  ['The move that actually works',
   `Ask how <em>you</em> feel toward the part. Curious, warm or calm means Self is present and you can carry on.
   <p>Irritated, frightened, or "I just want it gone" is not a failure. It means a <strong>second part</strong> has shown up and is now driving. So you turn and speak to that one: ask it for a little room, and promise you are not going to let the first part take over. Then check again.</p>
   <p>That loop is unblending. Everything else here is scaffolding around it.</p>`],

  ['Why sleep, food and movement are in here',
   `Because they change the volume on everything else, and it is worth knowing that <em>before</em> you conclude something about your character.
   <p>A part that feels unbearable on four hours of sleep and no lunch is often ordinary on eight and a proper meal. That is not a reason to dismiss it. It is a reason to be accurate about what you are measuring, and to fix the cheap thing first when the cheap thing is the problem.</p>`],

  ['Why the walkthrough stops at protectors',
   `It never sends you looking for an exile, on purpose. Going to the young, wounded parts is powerful, and it is the part of this work that can knock you flat when it happens without support.
   <p>You can still label a part as an exile here, because knowing is useful. The prompts just will not take you further in. Protectors are where unguided practice belongs, and getting to know them well is not a consolation prize; it is most of the work.</p>`],

  ['Where this comes from',
   `Internal Family Systems was developed by <strong>Richard Schwartz</strong> in the 1980s. The session here follows his six Fs: Find, Focus, Flesh out, Feel toward, beFriend, and Fear.
   <p>This app is a practice aid built by someone doing the work, not by a clinician. If it interests you, the source material is worth going to directly.</p>`]
];

/* ------------------------------------------------------------------ router */

const VIEWS = ['intro', 'unblend', 'checkin', 'session', 'breath', 'parts', 'part-edit', 'journal', 'entry', 'learn'];
const TITLES = {
  intro: 'Unblended', unblend: 'Unblended', checkin: 'Unblending', session: 'Unblending',
  breath: 'Unblending', parts: 'Parts', 'part-edit': 'Part', journal: 'Journal',
  entry: 'Entry', learn: 'Learn'
};
const TABS = {
  intro: 'unblend', unblend: 'unblend', checkin: 'unblend', session: 'unblend', breath: 'unblend',
  parts: 'parts', 'part-edit': 'parts', journal: 'journal', entry: 'journal', learn: 'learn'
};
const CHROMELESS = ['intro', 'checkin', 'session', 'breath'];

let view = 'unblend';
let backTo = null;

function show(name, opts = {}) {
  view = name;
  VIEWS.forEach(v => $('#view-' + v).classList.toggle('is-active', v === name));
  $('#title').textContent = opts.title || TITLES[name];
  $$('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.tab === TABS[name]));
  backTo = opts.back || null;
  $('#backBtn').hidden = !backTo;
  $('#tabbar').hidden = CHROMELESS.includes(name);
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------ session */

let session = null;
let breathStop = false;

const activeSteps = () => session.quick ? STEPS.filter(s => QUICK_KEYS.includes(s.key)) : STEPS;

function newSession(quick) {
  session = { i: 0, quick: !!quick, answers: {}, feeling: '', sevBefore: 0, sevAfter: 0, maint: {}, job: '' };
  renderCheckin();
  show('checkin');
}

function resumeSession() {
  session = Object.assign({ i: 0, quick: false, answers: {}, feeling: '', sevBefore: 0, sevAfter: 0, maint: {}, job: '' }, db.draft);
  renderStep();
  show('session');
}

/* ---- check in ---- */

function renderCheckin() {
  $('#sevBefore').innerHTML = SEVERITY.map((_, i) =>
    `<button class="lvl ${session.sevBefore === i + 1 ? 'on' : ''}" data-sev="${i + 1}">${i + 1}</button>`).join('');
  $('#sevBeforeWord').textContent = session.sevBefore ? SEVERITY[session.sevBefore - 1] : ' ';
  $$('#sevBefore [data-sev]').forEach(b => b.onclick = () => {
    session.sevBefore = +b.dataset.sev;
    renderCheckin();
  });

  $('#maintenance').innerHTML = MAINTENANCE.map(m => `
    <div class="mrow">
      <span class="mlabel">${m.q}</span>
      <div class="chips">
        <button class="chip ${session.maint[m.key] === 'ok' ? 'on' : ''}" data-m="${m.key}" data-v="ok">${m.ok}</button>
        <button class="chip ${session.maint[m.key] === 'poor' ? 'on warn' : ''}" data-m="${m.key}" data-v="poor">${m.poor}</button>
      </div>
    </div>`).join('');

  $$('#maintenance [data-m]').forEach(b => b.onclick = () => {
    const k = b.dataset.m;
    session.maint[k] = session.maint[k] === b.dataset.v ? '' : b.dataset.v;
    renderCheckin();
  });

  const poor = Object.values(session.maint).filter(v => v === 'poor').length;
  $('#maintenanceNote').innerHTML = poor >= 2 ? `
    <div class="note">
      <p><strong>Worth holding onto:</strong> with ${poor} of those running low, whatever you are about to meet is louder than it would otherwise be. That does not make it fake. It means part of the fix may be a meal and a night's sleep rather than anything you have to understand.</p>
    </div>` : '';

  if (session.sevBefore === 5) {
    $('#maintenanceNote').innerHTML += `
      <div class="note warn">
        <p>Overwhelming is a lot to carry alone. This can help you get some room, and it is not a substitute for a person. If you are in danger, contact your local emergency number, or in the US call or text <strong>988</strong>.</p>
      </div>`;
  }
}

/* ---- breath ---- */

const wait = ms => new Promise(r => setTimeout(r, ms));

async function runBreath() {
  breathStop = false;
  show('breath');
  const circle = $('#breathCircle'), word = $('#breathWord'), count = $('#breathCount');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IN = reduce ? 1600 : 4000, OUT = reduce ? 2400 : 6000;
  const rounds = session.quick ? 2 : 4;

  for (let r = 1; r <= rounds; r++) {
    if (breathStop) return;
    count.textContent = `Round ${r} of ${rounds}`;
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

/* ---- steps ---- */

function renderStep() {
  const steps = activeSteps();
  const s = steps[session.i];
  const fSteps = steps.filter(x => !x.closing);
  const n = fSteps.indexOf(s) + 1;

  $('#stepKicker').textContent = s.closing
    ? 'Closing'
    : `${session.quick ? 'Short' : 'Step'} ${n} of ${fSteps.length} - ${s.f}`;
  $('#stepTitle').textContent = s.title;
  $('#stepBody').textContent = s.body;
  $('#stepLabel').textContent = s.label;
  $('#stepField').hidden = !!s.noField;

  const input = $('#stepInput');
  input.placeholder = s.ph || '';
  input.value = session.answers[s.key] || '';

  $('#progress').innerHTML = steps.map((_, i) => `<i class="${i <= session.i ? 'done' : ''}"></i>`).join('');
  $('#prevStep').hidden = session.i === 0;
  $('#nextStep').innerHTML = session.i === steps.length - 1
    ? 'Save <svg class="ico"><use href="#i-check"/></svg>'
    : 'Next <svg class="ico"><use href="#i-next"/></svg>';

  $('#stepExtraTop').innerHTML = '';
  $('#stepExtra').innerHTML = '';
  if (s.extra === 'feel') renderFeelingCheck($('#stepExtraTop'));
  if (s.extra === 'after') renderSeverityAfter($('#stepExtra'));
  if (s.extra === 'naming') renderNaming($('#stepExtra'));
}

function renderFeelingCheck(host) {
  const chosen = session.feeling;
  const blended = FEELINGS_BLENDED.includes(chosen);

  host.innerHTML = `
    <div class="chips" id="feelRow">
      ${[...FEELINGS_OPEN, ...FEELINGS_BLENDED].map(f =>
        `<button class="chip ${f === chosen ? 'on' : ''}" data-feel="${f}">${f}</button>`).join('')}
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
      </div>` : ''}`;

  $$('#feelRow [data-feel]', host).forEach(b => b.onclick = () => {
    collectStep();          // renderStep repaints from answers, so bank the textarea first
    session.feeling = b.dataset.feel;
    persistDraft();
    renderStep();
  });
}

function renderSeverityAfter(host) {
  host.innerHTML = `
    <h3>How loud is it now?</h3>
    <div class="scale" id="sevAfter">
      ${SEVERITY.map((_, i) => `<button class="lvl ${session.sevAfter === i + 1 ? 'on' : ''}" data-sev="${i + 1}">${i + 1}</button>`).join('')}
    </div>
    <p class="scale-word">${session.sevAfter ? SEVERITY[session.sevAfter - 1] : '&nbsp;'}</p>
    ${deltaNote()}`;

  $$('#sevAfter [data-sev]', host).forEach(b => b.onclick = () => {
    collectStep();
    session.sevAfter = +b.dataset.sev;
    persistDraft();
    renderStep();
  });
}

function deltaNote() {
  const { sevBefore: a, sevAfter: b } = session;
  if (!a || !b) return '';
  if (b < a) return `<div class="note"><p><strong>${SEVERITY[a - 1]} to ${SEVERITY[b - 1]}.</strong> That is the part turning its own volume down because it got listened to. Worth remembering next time it says nothing helps.</p></div>`;
  if (b === a) return `<div class="note"><p>No change in volume, and the session was still worth doing. You know what it is afraid of now, which you did not an hour ago. Some parts need to be met several times before they believe you.</p></div>`;
  return `<div class="note warn"><p>Louder than when you started. That happens, and it usually means something real got close. Be gentle with the rest of today, and this is the kind of thing worth taking to a therapist rather than sitting with alone.</p></div>`;
}

function renderNaming(host) {
  const names = db.parts.map(p => p.name);
  const chosen = session.job;
  host.innerHTML = `
    <label class="field">
      <span class="label">What do you call it?</span>
      <input type="text" id="partName" list="partNames" placeholder="The one that goes quiet"
             value="${escapeAttr(session.answers.partName || '')}">
      <datalist id="partNames">${names.map(n => `<option value="${escapeAttr(n)}">`).join('')}</datalist>
    </label>

    <div class="field">
      <span class="label">What is its job?</span>
      <div class="chips" id="jobRow">
        ${JOBS.map(j => `<button class="chip ${j.key === chosen ? 'on' : ''}" data-job="${j.key}">${j.name}</button>`).join('')}
      </div>
      ${chosen ? `<p class="muted sm" style="margin-top:.5rem">${JOBS.find(j => j.key === chosen).blurb}</p>` : `
        <p class="muted sm" style="margin-top:.5rem">Managers run ahead of trouble. Firefighters clean up after it. Exiles carry what both are working around.</p>`}
      ${chosen === 'exile' ? `
        <div class="note warn">
          <p>Good to know, and worth being careful with. Exiles are where this work goes deep, and it is the part that is much better done with a therapist alongside you. The prompts here will keep working with the protectors around it.</p>
        </div>` : ''}
    </div>

    <p class="muted sm">Saved to your Parts list, so next time it shows up you recognise it instead of becoming it.</p>`;

  $$('#jobRow [data-job]', host).forEach(b => b.onclick = () => {
    collectStep();
    session.job = session.job === b.dataset.job ? '' : b.dataset.job;
    persistDraft();
    renderStep();
  });
}

function collectStep() {
  const s = activeSteps()[session.i];
  if (!s.noField) session.answers[s.key] = $('#stepInput').value.trim();
  const el = $('#partName');
  if (el) session.answers.partName = el.value.trim();
}

function persistDraft() {
  db.draft = {
    i: session.i, quick: session.quick, answers: session.answers,
    feeling: session.feeling, sevBefore: session.sevBefore,
    sevAfter: session.sevAfter, maint: session.maint, job: session.job
  };
  save();
}

function nextStep() {
  collectStep();
  const steps = activeSteps();
  if (session.i < steps.length - 1) {
    session.i++;
    persistDraft();
    renderStep();
    window.scrollTo(0, 0);
  } else {
    finishSession(false);
  }
}

function prevStep() {
  collectStep();
  persistDraft();
  session.i--;
  renderStep();
  window.scrollTo(0, 0);
}

/* ---- titles ---- */

// Collapse to one line, keep up to n chars, break on a word boundary.
// Splitting on the first sentence was tried and produced titles like "Young."
function firstBit(s, n) {
  if (!s) return '';
  const one = String(s).replace(/\s+/g, ' ').trim();
  if (!one) return '';
  if (one.length <= n) return one.replace(/[.,;:]$/, '');
  const cut = one.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.5 ? cut.slice(0, sp) : cut).replace(/[.,;:]$/, '') + '...';
}

// A journal that says "A session" eight times is not a journal. Fall back down
// a chain of increasingly generic sources so every entry gets a real handle.
function titleFor(e) {
  const a = e.answers || {};
  return (e.partName && e.partName.trim())
    || firstBit(a.flesh, 46)
    || firstBit(a.fear, 46)
    || firstBit(a.find, 46)
    || firstBit(a.choose, 46)
    || firstBit(a.befriend, 46)
    || (e.feeling ? `Felt ${e.feeling.toLowerCase()} toward it` : '')
    || 'A session';
}

function finishSession(partial) {
  collectStep();
  const wrote = Object.values(session.answers).some(v => v && v.trim());
  if (!wrote && !session.feeling && !session.sevBefore) {
    db.draft = null; save(); session = null;
    show('unblend'); refreshHome();
    return;
  }

  const name = (session.answers.partName || '').trim();
  let partId = '';
  if (name) {
    const existing = db.parts.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      partId = existing.id;
      if (session.job) existing.job = session.job;
      if (!existing.protects && session.answers.fear) existing.protects = session.answers.fear;
      if (!existing.cue && session.answers.find) existing.cue = session.answers.find;
      existing.updated = Date.now();
    } else {
      partId = uid();
      db.parts.push({
        id: partId, name, job: session.job || '',
        protects: session.answers.fear || '',
        trigger: '', cue: session.answers.find || '',
        created: Date.now(), updated: Date.now()
      });
    }
  }

  const entry = {
    id: uid(), created: Date.now(),
    partName: name, partId, job: session.job || '',
    feeling: session.feeling,
    sevBefore: session.sevBefore, sevAfter: session.sevAfter,
    maint: { ...session.maint },
    quick: session.quick, partial: !!partial,
    answers: { ...session.answers }
  };
  entry.title = titleFor(entry);
  db.entries.unshift(entry);

  db.draft = null;
  save();

  const drop = session.sevBefore && session.sevAfter ? session.sevBefore - session.sevAfter : 0;
  session = null;
  toast(drop > 0 ? `Saved. ${SEVERITY[entry.sevBefore - 1]} to ${SEVERITY[entry.sevAfter - 1]}.`
                 : partial ? 'Saved where you got to.' : 'Saved.');
  renderJournal(); renderParts();
  show('journal');
  refreshHome();
}

/* ------------------------------------------------------------------ parts */

let editingId = null;

function jobPill(job) {
  if (!job || job === 'unsure') return '';
  const j = JOBS.find(x => x.key === job);
  return `<span class="pill ${job === 'exile' ? 'clay' : ''}">${j.name}</span>`;
}

function renderParts() {
  const host = $('#partsList');
  if (!db.parts.length) {
    host.innerHTML = `<div class="empty">No parts yet.<br>They tend to introduce themselves during a session.</div>`;
    return;
  }
  host.innerHTML = db.parts.map(p => {
    const seen = db.entries.filter(e => e.partId === p.id || (p.name && e.partName === p.name)).length;
    return `
    <div class="card tap" data-part="${p.id}">
      <h4>${escapeHtml(p.name)} ${jobPill(p.job)}</h4>
      ${p.protects ? `<p class="sm muted">Protects: ${escapeHtml(trim(p.protects, 90))}</p>` : ''}
      ${p.cue ? `<p class="sm">Tell: ${escapeHtml(trim(p.cue, 70))}</p>` : ''}
      ${seen ? `<p class="meta">${seen} session${seen > 1 ? 's' : ''}</p>` : ''}
    </div>`;
  }).join('');
  $$('[data-part]', host).forEach(el => el.onclick = () => editPart(el.dataset.part));
}

let editJob = '';

function editPart(id) {
  editingId = id;
  const p = id ? db.parts.find(x => x.id === id) : null;
  $('#pName').value = p ? p.name : '';
  $('#pProtects').value = p ? p.protects : '';
  $('#pTrigger').value = p ? p.trigger : '';
  $('#pCue').value = p ? p.cue : '';
  editJob = p ? (p.job || '') : '';
  renderJobPicker();
  $('#deletePart').hidden = !p;

  const host = $('#partHistory');
  const mine = p ? db.entries.filter(e => e.partId === p.id || e.partName === p.name) : [];
  host.innerHTML = mine.length ? `
    <h3>When it has shown up</h3>
    ${mine.slice(0, 8).map(e => `
      <div class="card tap slim" data-hist="${e.id}">
        <p class="meta">${when(e.created)}${e.sevBefore && e.sevAfter ? ` - ${SEVERITY[e.sevBefore - 1]} to ${SEVERITY[e.sevAfter - 1]}` : ''}</p>
        ${e.answers.fear ? `<p class="sm">${escapeHtml(trim(e.answers.fear, 80))}</p>` : ''}
      </div>`).join('')}` : '';
  $$('[data-hist]', host).forEach(el => el.onclick = () => openEntry(el.dataset.hist, 'part-edit'));

  show('part-edit', { back: 'parts', title: p ? p.name : 'New part' });
}

function renderJobPicker() {
  $('#pJob').innerHTML = `<div class="chips" id="pJobRow">
    ${JOBS.map(j => `<button class="chip ${j.key === editJob ? 'on' : ''}" data-pjob="${j.key}">${j.name}</button>`).join('')}
  </div>`;
  const j = JOBS.find(x => x.key === editJob);
  $('#pJobNote').innerHTML = j
    ? `<p class="muted sm" style="margin-top:.5rem">${j.blurb}</p>
       ${editJob === 'exile' ? `<div class="note warn"><p>Exiles are where this work goes deep, and it is much better done with a therapist alongside you.</p></div>` : ''}`
    : '';
  $$('#pJobRow [data-pjob]').forEach(b => b.onclick = () => {
    editJob = editJob === b.dataset.pjob ? '' : b.dataset.pjob;
    renderJobPicker();
  });
}

function savePart() {
  const name = $('#pName').value.trim();
  if (!name) { toast('Give it a name first.'); return; }
  const data = {
    name, job: editJob,
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

function renderPatterns() {
  const host = $('#patterns');
  const es = db.entries;
  if (es.length < 3) { host.innerHTML = ''; return; }

  const counts = {};
  es.forEach(e => { if (e.partName) counts[e.partName] = (counts[e.partName] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  const withBoth = es.filter(e => e.sevBefore && e.sevAfter);
  const avgDrop = withBoth.length
    ? (withBoth.reduce((n, e) => n + (e.sevBefore - e.sevAfter), 0) / withBoth.length) : null;

  const rough = es.filter(e => Object.values(e.maint || {}).filter(v => v === 'poor').length >= 2);
  const roughAvg = rough.length ? rough.reduce((n, e) => n + (e.sevBefore || 0), 0) / rough.length : null;
  const restedSet = es.filter(e => e.sevBefore && !rough.includes(e));
  const restedAvg = restedSet.length ? restedSet.reduce((n, e) => n + e.sevBefore, 0) / restedSet.length : null;

  host.innerHTML = `
    <div class="card soft">
      <h4>What is showing up</h4>
      <p class="sm">${es.length} sessions.${top && top[1] > 1 ? ` <strong>${escapeHtml(top[0])}</strong> the most, ${top[1]} times.` : ''}</p>
      ${avgDrop !== null ? `<p class="sm">Average drop in volume: <strong>${avgDrop > 0 ? avgDrop.toFixed(1) : 'none yet'}</strong>${avgDrop > 0 ? ' points' : ''}.</p>` : ''}
      ${roughAvg !== null && restedAvg !== null && rough.length >= 2 ? `
        <p class="sm">On days the basics were low it started at <strong>${roughAvg.toFixed(1)}</strong>, against <strong>${restedAvg.toFixed(1)}</strong> otherwise.${roughAvg > restedAvg + .4 ? ' Worth taking seriously as a lever.' : ''}</p>` : ''}
    </div>`;
}

function renderJournal() {
  renderPatterns();
  const host = $('#journalList');
  if (!db.entries.length) {
    host.innerHTML = `<div class="empty">Nothing here yet.<br>Finished sessions land here so you can look back.</div>`;
    return;
  }
  host.innerHTML = db.entries.map(e => `
    <div class="card tap" data-entry="${e.id}">
      <h4>${escapeHtml(e.title || titleFor(e))} ${jobPill(e.job)}</h4>
      <p class="meta">${when(e.created)}${e.quick ? ' - short' : ''}${e.partial ? ' - stopped early' : ''}</p>
      ${e.sevBefore ? `<p class="sm"><span class="pill ${e.sevAfter && e.sevAfter < e.sevBefore ? '' : 'clay'}">${SEVERITY[e.sevBefore - 1]}${e.sevAfter ? ' to ' + SEVERITY[e.sevAfter - 1] : ''}</span></p>` : ''}
      ${e.answers.fear ? `<p class="sm muted">${escapeHtml(trim(e.answers.fear, 90))}</p>` : ''}
    </div>`).join('');
  $$('[data-entry]', host).forEach(el => el.onclick = () => openEntry(el.dataset.entry, 'journal'));
}

function openEntry(id, back) {
  const e = db.entries.find(x => x.id === id);
  if (!e) return;
  const rows = STEPS.filter(s => !s.noField && (e.answers[s.key] || '').trim()).map(s => `
    <h3>${escapeHtml(s.label)}</h3>
    <p class="entry-answer">${escapeHtml(e.answers[s.key])}</p>`).join('');

  const maint = Object.entries(e.maint || {}).filter(([, v]) => v);
  $('#entryBody').innerHTML = `
    <p class="step-kicker">${when(e.created)}${e.quick ? ' - short version' : ''}</p>
    <h2 class="step-title">${escapeHtml(e.title || titleFor(e))}</h2>
    <p>
      ${jobPill(e.job)}
      ${e.feeling ? `<span class="pill ${FEELINGS_BLENDED.includes(e.feeling) ? 'clay' : ''}">Felt ${escapeHtml(e.feeling.toLowerCase())}</span>` : ''}
      ${e.sevBefore ? `<span class="pill">${SEVERITY[e.sevBefore - 1]}${e.sevAfter ? ' to ' + SEVERITY[e.sevAfter - 1] : ''}</span>` : ''}
    </p>
    ${maint.length ? `<p class="sm muted">Basics that day: ${maint.map(([k, v]) => {
      const m = MAINTENANCE.find(x => x.key === k);
      return escapeHtml(v === 'ok' ? m.ok : m.poor);
    }).join(', ')}</p>` : ''}
    ${rows || '<p class="muted">Nothing was written down in this one.</p>'}
    <button class="btn ghost wide danger sm" id="delEntry"><svg class="ico"><use href="#i-trash"/></svg> Delete this entry</button>`;

  $('#delEntry').onclick = () => {
    if (!confirm('Delete this entry? It cannot be recovered.')) return;
    db.entries = db.entries.filter(x => x.id !== id);
    save(); renderJournal(); renderParts(); show('journal'); toast('Deleted.');
  };
  show('entry', { back: back || 'journal', title: 'Entry' });
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
      if (!incoming || !Array.isArray(incoming.entries) || !Array.isArray(incoming.parts)) throw new Error('shape');
      const seen = new Set(db.entries.map(e => e.id));
      incoming.entries.forEach(e => { if (!seen.has(e.id)) db.entries.push(Object.assign({ title: titleFor(e) }, e)); });
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
const trim = (s, n) => String(s).length > n ? String(s).slice(0, n).trimEnd() + '...' : String(s);

function when(ts) {
  const d = new Date(ts), now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return 'Today, ' + time;
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday, ' + time;
  return d.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  }) + ', ' + time;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function applyTheme() {
  const mode = db.settings.theme;
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', mode);
  const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  // setAttribute, not innerHTML: innerHTML on an SVG element is a namespace trap.
  $('#themeBtn use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
}

function refreshHome() { $('#resumeCard').hidden = !db.draft; }

function renderLearn() {
  $('#learnBody').innerHTML = `
    <p class="lede">A short guide</p>
    ${LEARN.map(([q, a]) => `<details class="qa"><summary>${q}</summary><div class="qa-body">${a}</div></details>`).join('')}
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
  save(); applyTheme(); toast(`Theme: ${db.settings.theme}`);
};

$('#introOk').onclick = () => { db.settings.introSeen = true; save(); show('unblend'); };
$('#whyLink').onclick = () => { renderLearn(); show('learn'); $('.qa').open = true; };

$('#startSession').onclick = () => newSession(false);
$('#startQuick').onclick = () => newSession(true);
$('#resumeBtn').onclick = resumeSession;
$('#discardBtn').onclick = () => { db.draft = null; save(); refreshHome(); toast('Cleared.'); };

$('#checkinNext').onclick = () => { persistDraft(); runBreath(); };
$('#checkinSkip').onclick = () => { session.sevBefore = 0; session.maint = {}; persistDraft(); runBreath(); };

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
show(db.settings.introSeen ? 'unblend' : 'intro');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
