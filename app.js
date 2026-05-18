// ═══════════════════════════════════════════════
// DATA LAYER
// ═══════════════════════════════════════════════

const DEFAULT_EXERCISES = [
  // Push
  { id:'bench_press',     name:'Bankdrücken',           muscle:'chest',     category:'push', isCustom:false },
  { id:'incline_bench',   name:'Schrägbankdrücken',     muscle:'chest',     category:'push', isCustom:false },
  { id:'chest_fly',       name:'Butterfly / Chest Fly', muscle:'chest',     category:'push', isCustom:false },
  { id:'cable_fly',       name:'Kabelzug Butterfly',    muscle:'chest',     category:'push', isCustom:false },
  { id:'shoulder_press',  name:'Schulterdrücken',       muscle:'shoulders', category:'push', isCustom:false },
  { id:'lateral_raise',   name:'Seitheben',             muscle:'shoulders', category:'push', isCustom:false },
  { id:'front_raise',     name:'Frontheben',            muscle:'shoulders', category:'push', isCustom:false },
  { id:'tricep_pushdown', name:'Trizeps Pushdown',      muscle:'triceps',   category:'push', isCustom:false },
  { id:'tricep_overhead', name:'Trizeps Overhead',      muscle:'triceps',   category:'push', isCustom:false },
  { id:'dips',            name:'Dips',                  muscle:'triceps',   category:'push', isCustom:false },
  // Pull
  { id:'deadlift',        name:'Kreuzheben',            muscle:'back',      category:'pull', isCustom:false },
  { id:'pullup',          name:'Klimmzüge',             muscle:'back',      category:'pull', isCustom:false },
  { id:'lat_pulldown',    name:'Latzug',                muscle:'back',      category:'pull', isCustom:false },
  { id:'cable_row',       name:'Kabelzug Rudern',       muscle:'back',      category:'pull', isCustom:false },
  { id:'barbell_row',     name:'Langhantel Rudern',     muscle:'back',      category:'pull', isCustom:false },
  { id:'face_pull',       name:'Face Pull',             muscle:'back',      category:'pull', isCustom:false },
  { id:'shrug',           name:'Schulterziehen',        muscle:'shoulders', category:'pull', isCustom:false },
  { id:'bicep_curl',      name:'Bizeps Curls',          muscle:'biceps',    category:'pull', isCustom:false },
  { id:'hammer_curl',     name:'Hammer Curls',          muscle:'biceps',    category:'pull', isCustom:false },
  { id:'chin_up',         name:'Chin-ups',              muscle:'biceps',    category:'pull', isCustom:false },
  // Legs
  { id:'squat',           name:'Kniebeuge',             muscle:'legs',      category:'legs', isCustom:false },
  { id:'leg_press',       name:'Beinpresse',            muscle:'legs',      category:'legs', isCustom:false },
  { id:'rdl',             name:'Romanian Deadlift',     muscle:'legs',      category:'legs', isCustom:false },
  { id:'leg_curl',        name:'Beinbeuger',            muscle:'legs',      category:'legs', isCustom:false },
  { id:'leg_extension',   name:'Beinstrecker',          muscle:'legs',      category:'legs', isCustom:false },
  { id:'calf_raise',      name:'Wadenheben',            muscle:'legs',      category:'legs', isCustom:false },
  { id:'lunges',          name:'Ausfallschritte',       muscle:'legs',      category:'legs', isCustom:false },
  { id:'hip_thrust',      name:'Hip Thrust',            muscle:'legs',      category:'legs', isCustom:false },
  { id:'goblet_squat',    name:'Goblet Squat',          muscle:'legs',      category:'legs', isCustom:false },
];

const DEFAULT_PLAN = [
  { id:'push', name:'Push', color:'#ff8c00', exercises:[
    { exId:'bench_press',     targetSets:3, targetReps:8 },
    { exId:'shoulder_press',  targetSets:3, targetReps:8 },
    { exId:'lateral_raise',   targetSets:3, targetReps:12 },
    { exId:'tricep_pushdown', targetSets:3, targetReps:12 },
  ]},
  { id:'pull', name:'Pull', color:'#28a745', exercises:[
    { exId:'lat_pulldown',    targetSets:3, targetReps:8 },
    { exId:'cable_row',       targetSets:3, targetReps:8 },
    { exId:'face_pull',       targetSets:3, targetReps:15 },
    { exId:'bicep_curl',      targetSets:3, targetReps:12 },
  ]},
  { id:'legs', name:'Legs', color:'#7b2fff', exercises:[
    { exId:'squat',           targetSets:3, targetReps:8 },
    { exId:'leg_press',       targetSets:3, targetReps:10 },
    { exId:'rdl',             targetSets:3, targetReps:10 },
    { exId:'leg_curl',        targetSets:3, targetReps:12 },
  ]},
];

const DEFAULT_PROGRAM = {
  name: 'Mein Trainingsplan',
  weeksTotal: 12,
  startDate: null,   // ms timestamp; set on first save
  endDate: null,     // ms timestamp; recomputed from start + weeksTotal if missing
};

function _msToDate(ms) { return ms ? new Date(ms).toISOString().slice(0,10) : ''; }
function _dateToMs(str) { return str ? new Date(str).getTime() : null; }
function _weeksBetween(startMs, endMs) {
  if (!startMs || !endMs) return 0;
  return Math.max(1, Math.round((endMs - startMs) / (7*24*3600*1000)));
}

// Mo, Di, Mi, Do, Fr, Sa, So
const DEFAULT_WEEKPLAN = [
  { dayKey:'mon', label:'Mo', planDayId:'push' },
  { dayKey:'tue', label:'Di', planDayId:'pull' },
  { dayKey:'wed', label:'Mi', planDayId:'legs' },
  { dayKey:'thu', label:'Do', planDayId:null   },
  { dayKey:'fri', label:'Fr', planDayId:'push' },
  { dayKey:'sat', label:'Sa', planDayId:'pull' },
  { dayKey:'sun', label:'So', planDayId:null   },
];

// Muscle metadata (icons + colors for Verlauf and PR cards)
const MUSCLE_META = {
  chest:     { name:'Brust',     color:'#0066ff', bg:'#e8f0ff', icon:'chest' },
  back:      { name:'Rücken',    color:'#4F46E5', bg:'#E0E7FF', icon:'back' },
  biceps:    { name:'Bizeps',    color:'#ef4444', bg:'#fee2e2', icon:'biceps' },
  triceps:   { name:'Trizeps',   color:'#ff8c00', bg:'#fff3e0', icon:'triceps' },
  shoulders: { name:'Schultern', color:'#06b6d4', bg:'#cffafe', icon:'shoulders' },
  legs:      { name:'Beine',     color:'#8b6b3d', bg:'#f3e8d8', icon:'leg' },
  core:      { name:'Bauch',     color:'#7b2fff', bg:'#f3ecff', icon:'core' },
};
const MUSCLE_ORDER = ['chest','back','shoulders','biceps','triceps','core','legs'];

// Map old 'arms' / unknown exercises to specific muscle (by id keyword fallback)
function inferMuscleFromName(name) {
  const n = (name||'').toLowerCase();
  if (/tricep|triz|pushdown|dip|skullcrusher/i.test(n)) return 'triceps';
  if (/bicep|curl|chin|biz/i.test(n)) return 'biceps';
  return 'triceps';
}

// Color for a workout exercise card – based on its muscle group
function colorForExercise(workoutEx) {
  const ex = getEx(workoutEx.exId || workoutEx.id);
  const muscleKey = ex ? ex.muscle : 'chest';
  return { c: muscleColor(muscleKey), bg: muscleBg(muscleKey) };
}

// Migration helpers
const ARMS_TO_NEW = {
  'tricep_pushdown':'triceps','tricep_overhead':'triceps','dips':'triceps',
  'bicep_curl':'biceps','hammer_curl':'biceps','chin_up':'biceps',
};
function migrateExerciseMuscle(ex) {
  if (ex.muscle === 'arms') {
    ex.muscle = ARMS_TO_NEW[ex.id] || inferMuscleFromName(ex.name);
  }
  return ex;
}

const DB = {
  getExercises() {
    const s = localStorage.getItem('ft_exercises');
    let list = s ? JSON.parse(s) : DEFAULT_EXERCISES.map(e => ({...e}));
    let migrated = false;
    list = list.map(ex => {
      if (ex.muscle === 'arms') { migrated = true; return migrateExerciseMuscle({...ex}); }
      return ex;
    });
    // Migrate notes: if any exercise lacks a notes field, populate from the most recent workout note.
    if (list.some(ex => ex.notes === undefined)) {
      const ws = JSON.parse(localStorage.getItem('ft_workouts') || '[]');
      const latestNote = {};
      [...ws].sort((a,b) => b.startTs - a.startTs).forEach(w => {
        (w.exercises || []).forEach(we => {
          const id = we.exId || we.id;
          if (we.notes && !latestNote[id]) latestNote[id] = we.notes;
        });
      });
      list = list.map(ex => ex.notes === undefined ? { ...ex, notes: latestNote[ex.id] || '' } : ex);
      migrated = true;
    }
    if (migrated) localStorage.setItem('ft_exercises', JSON.stringify(list));
    return list;
  },
  saveExercises(v) { localStorage.setItem('ft_exercises', JSON.stringify(v)); markLocalChange(); },
  getPlan() { const s = localStorage.getItem('ft_plan2'); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_PLAN)); },
  savePlan(v) { localStorage.setItem('ft_plan2', JSON.stringify(v)); markLocalChange(); },
  getWorkouts() { const s = localStorage.getItem('ft_workouts'); return s ? JSON.parse(s) : []; },
  saveWorkouts(v) { localStorage.setItem('ft_workouts', JSON.stringify(v)); markLocalChange(); },
  addWorkout(w) { const ws = this.getWorkouts(); ws.unshift(w); this.saveWorkouts(ws); },
  getActive() { const s = localStorage.getItem('ft_active'); return s ? JSON.parse(s) : null; },
  saveActive(v) { localStorage.setItem('ft_active', JSON.stringify(v)); },
  clearActive() { localStorage.removeItem('ft_active'); },
  getProgram() {
    const s = localStorage.getItem('ft_program');
    let p = s ? JSON.parse(s) : { ...DEFAULT_PROGRAM };
    if (!p.startDate) p.startDate = Date.now();
    if (!p.endDate)   p.endDate   = p.startDate + (p.weeksTotal||12) * 7*24*3600*1000;
    return p;
  },
  saveProgram(v) { localStorage.setItem('ft_program', JSON.stringify(v)); markLocalChange(); },
  getWeekPlan() {
    const s = localStorage.getItem('ft_weekplan');
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  },
  saveWeekPlan(v) { localStorage.setItem('ft_weekplan', JSON.stringify(v)); markLocalChange(); },
};

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function getEx(id) { return DB.getExercises().find(e => e.id === id); }
function muscleName(m) { return (MUSCLE_META[m] && MUSCLE_META[m].name) || m; }
function muscleColor(m) { return (MUSCLE_META[m] && MUSCLE_META[m].color) || '#0066ff'; }
function muscleBg(m) { return (MUSCLE_META[m] && MUSCLE_META[m].bg) || '#e8f0ff'; }

// Compact muscle icons (SVG path content – inserted inside a 24x24 viewBox)
function muscleIconSvg(muscleKey, size = 16) {
  const m = MUSCLE_META[muscleKey];
  const color = m ? m.color : '#0066ff';
  const paths = {
    chest:        '<path d="M6 6h4l1 2h2l1-2h4v5a4 4 0 0 1-3 4l-1 2h-4l-1-2a4 4 0 0 1-3-4z"/>',
    back:         '<path d="M8 4h8l2 4-1 4v4l-2 2-1-3h-4l-1 3-2-2v-4l-1-4z"/>',
    shoulders:    '<path d="M4 11c2-4 5-5 8-5s6 1 8 5"/><circle cx="6" cy="13" r="2"/><circle cx="18" cy="13" r="2"/><path d="M9 14h6"/>',
    biceps:       '<path d="M5 14l3-2 1-3 3-3 4 1-1 3 2 1-2 3-1 4-3-1-3 1z"/><circle cx="14" cy="9" r="1"/>',
    triceps:      '<path d="M4 8l3 3 2 1 2 4 2 4h3l1-2 2-1-1-3-3-3-2-1-3-3-2-2z"/>',
    legs:         '<path d="M9 3h6l-1 9-1 4-1 5h-2l-1-9-1-4z"/><path d="M9 12h6"/>',
    core:         '<path d="M7 5h10v4H7zM7 11h10v4H7zM7 17h10v3H7z"/>',
  };
  const path = paths[muscleKey] || paths.chest;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="stroke:${color};fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round">${path}</svg>`;
}

function typeCls(t) { return 'type-' + (t || 'free'); }
function fmtTimer(s) { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60; return h>0?`${h}:${pad(m)}:${pad(ss)}`:`${pad(m)}:${pad(ss)}`; }
function fmtDur(s) { if(!s)return'0 min'; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}min`:`${m} min`; }
function pad(n) { return String(n).padStart(2,'0'); }
function fmtDate(ts) { return new Date(ts).toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
function fmtDateShort(ts) { return new Date(ts).toLocaleDateString('de-DE',{day:'numeric',month:'short'}); }
function fmtDateDay(ts) { return new Date(ts).toLocaleDateString('de-DE',{weekday:'long'}); }
function fmtNum(n) { return n >= 1000 ? (n/1000).toFixed(1)+'k' : String(Math.round(n)); }
function dayOfWeek(ts) { const d=new Date(ts); return d.toLocaleDateString('de-DE',{weekday:'long'}); }

function getWeekInfo() {
  const ws = DB.getWorkouts();
  const plan = DB.getPlan();
  if (ws.length === 0) return { weekNum:1, doneThisWeek:0, total:plan.length };
  const first = [...ws].sort((a,b) => a.startTs - b.startTs)[0];
  const diffWeeks = Math.floor((Date.now() - first.startTs) / (7*24*3600*1000));
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay()+6)%7)); mon.setHours(0,0,0,0);
  const done = ws.filter(w => w.startTs >= mon.getTime()).length;
  return { weekNum: diffWeeks+1, doneThisWeek: done, total: plan.length };
}

// Get current program week based on startDate
function getProgramWeek() {
  const p = DB.getProgram();
  const start = p.startDate || Date.now();
  const monStart = new Date(start);
  monStart.setHours(0,0,0,0);
  monStart.setDate(monStart.getDate() - ((monStart.getDay()+6)%7)); // Mon of start-week
  const diffMs = Date.now() - monStart.getTime();
  const week = Math.floor(diffMs / (7*24*3600*1000)) + 1;
  return { num: Math.min(Math.max(week,1), p.weeksTotal), total: p.weeksTotal, name: p.name };
}

// Get current ISO calendar week
function isoWeekNum(d=new Date()) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay()+6)%7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date-week1)/86400000 - 3 + ((week1.getDay()+6)%7))/7);
}

// Build the 7-day list starting Monday for the current week
function getCurrentWeekDays() {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = (today.getDay()+6) % 7;   // 0=Mon
  const mon = new Date(today); mon.setDate(mon.getDate() - todayIdx);
  const wp = DB.getWeekPlan();
  const ws = DB.getWorkouts();
  const plan = DB.getPlan();
  const out = [];
  for (let i=0; i<7; i++) {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    const dEnd = new Date(d); dEnd.setHours(23,59,59,999);
    const wpEntry = wp[i] || { planDayId:null, label:'?', dayKey:'' };
    const planDay = wpEntry.planDayId ? plan.find(p => p.id === wpEntry.planDayId) : null;
    // Did we already do this planDay today/this week (any workout that day)?
    const dayDone = ws.some(w => w.startTs >= d.getTime() && w.startTs <= dEnd.getTime());
    const isToday = i === todayIdx;
    const isPast  = i < todayIdx;
    const isFuture= i > todayIdx;
    const isTomorrow = i === todayIdx + 1;
    out.push({
      idx: i, date: d, label: wpEntry.label, dayKey: wpEntry.dayKey,
      planDay, planDayId: wpEntry.planDayId,
      isToday, isPast, isFuture, isTomorrow, dayDone,
      // Ruhetag wenn: kein planDayId zugewiesen ODER die zugewiesene ID existiert nicht
      // mehr (verwaiste Referenz nach Plan-Import mit "Ersetzen")
      isRest: !planDay,
    });
  }
  return out;
}

// Workouts completed in the current Mon-Sun week
function getWeekStatus() {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = (today.getDay()+6) % 7;
  const mon = new Date(today); mon.setDate(mon.getDate() - todayIdx);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  const ws = DB.getWorkouts();
  const done = ws.filter(w => w.startTs >= mon.getTime() && w.startTs <= sun.getTime()).length;
  const wp = DB.getWeekPlan();
  const planned = wp.filter(d => d.planDayId).length;
  return { done, planned };
}

function getNextPlanDay() {
  const plan = DB.getPlan();
  const ws = DB.getWorkouts();
  if (plan.length === 0) return null;
  if (ws.length === 0) return plan[0];
  const lastDayId = ws[0].planDayId;
  const idx = plan.findIndex(d => d.id === lastDayId);
  if (idx === -1) return plan[0];
  return plan[(idx + 1) % plan.length];
}

function getLastWorkout() { const ws = DB.getWorkouts(); return ws.length ? ws[0] : null; }

function calcVolume(workout) {
  return workout.exercises.reduce((acc, ex) =>
    acc + ex.sets.reduce((a, s) => a + (parseFloat(s.weight)||0) * (parseInt(s.reps)||0), 0), 0
  );
}

function calcMuscleVolume(workouts) {
  const vol = {};
  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      const exData = getEx(ex.exId || ex.id);
      const muscle = exData ? exData.muscle : 'other';
      const exVol = ex.sets.reduce((a,s) => a + (parseFloat(s.weight)||0)*(parseInt(s.reps)||0), 0);
      vol[muscle] = (vol[muscle] || 0) + exVol;
    });
  });
  return vol;
}

function detectPRs(workout, allPrevWorkouts) {
  const prs = [];
  workout.exercises.forEach(ex => {
    const maxW = Math.max(...ex.sets.map(s => parseFloat(s.weight)||0));
    if (!maxW) return;
    let prevMax = 0;
    allPrevWorkouts.forEach(w => {
      const match = w.exercises.find(e => (e.exId||e.id) === (ex.exId||ex.id));
      if (match) {
        const m = Math.max(...match.sets.map(s => parseFloat(s.weight)||0));
        if (m > prevMax) prevMax = m;
      }
    });
    if (maxW > prevMax) {
      prs.push({ exId: ex.exId||ex.id, name: ex.name, weight: maxW, prev: prevMax });
    }
  });
  return prs;
}

function getLastExData(exId) {
  const ws = DB.getWorkouts();
  for (const w of ws) {
    const ex = w.exercises.find(e => (e.exId||e.id) === exId);
    if (ex && ex.sets.length) {
      const maxW = Math.max(...ex.sets.map(s => parseFloat(s.weight)||0));
      const repsStr = ex.sets.map(s => s.reps||'?').join('/');
      return { maxWeight: maxW, sets: ex.sets, repsStr, date: w.startTs };
    }
  }
  return null;
}

// Compact format for the last-execution row.
// Uniform sets → "3×12 @ 10 kg". Varying → "12@10, 10@8, 8@6 kg".
function formatLastSets(sets) {
  if (!sets || !sets.length) return null;
  const n = sets.length;
  const w0 = String(sets[0].weight || '');
  const r0 = String(sets[0].reps || '');
  const uniform = sets.every(s => String(s.weight || '') === w0 && String(s.reps || '') === r0);
  if (uniform) {
    return `${n}×${r0 || '–'} @ ${w0 || '–'} kg`;
  }
  return sets.map(s => `${s.reps || '–'}@${s.weight || '–'}`).join(', ') + ' kg';
}

// Highest weight ever lifted for an exercise across all workouts.
function getExercisePR(exId) {
  const ws = DB.getWorkouts();
  let maxW = 0;
  ws.forEach(w => {
    w.exercises.forEach(we => {
      if ((we.exId || we.id) !== exId) return;
      we.sets.forEach(s => {
        const v = parseFloat(s.weight) || 0;
        if (v > maxW) maxW = v;
      });
    });
  });
  return maxW > 0 ? maxW : null;
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════

let currentScreen = 'overview';

function showScreen(name) {
  currentScreen = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  const navEl = document.getElementById('nav-'+name);
  if (navEl) navEl.classList.add('active');

  // Switch body theme class so CSS variables (accent / gradient / tint) update per tab
  document.body.className = 'theme-' + name;

  if (name === 'overview') renderOverview();
  if (name === 'workouts') renderWorkoutsScreen();
  if (name === 'exercises') renderExercises();
  if (name === 'history') renderHistory();
  if (name === 'mehr') renderMehr();

  ensureTimerActive();
}

// ═══════════════════════════════════════════════
// SCREEN: ÜBERSICHT
// ═══════════════════════════════════════════════

function renderOverview() {
  const plan = DB.getPlan();
  const week7 = getCurrentWeekDays();
  const todayEntry = week7.find(d => d.isToday) || week7[0];
  const wStatus = getWeekStatus();
  const prog = getProgramWeek();
  const activeWo = DB.getActive();

  // ─ Header subline ─
  const subEl = document.getElementById('ov-week-info');
  subEl.innerHTML = `Woche ${prog.num} • <span class="ph-sub-accent">${wStatus.done} von ${wStatus.planned||plan.length}</span> Workouts absolviert`;

  // ─ Hero card ─
  // Decision tree:
  //   1. Active workout → full hero in active mode
  //   2. Today is a training day (not done) → preview hero for today's plan day
  //   3. Today is a rest day OR done → compact Ruhetag hero (today's status)
  //   4. No plan at all → "Kein Workout geplant" rest-hero
  const wrap = document.getElementById('ov-hero-wrap');
  if (activeWo) {
    const heroDay = plan.find(d => d.id === activeWo.planDayId);
    wrap.innerHTML = buildSessionCard(activeWo, heroDay, todayEntry, false, {
      label: 'AKTIVE SESSION',
      continueOnClick: 'heroActionContinue()',
    });
  } else if (todayEntry.planDay && !todayEntry.dayDone) {
    wrap.innerHTML = buildSessionCard(null, todayEntry.planDay, todayEntry, true, {
      label: 'NÄCHSTE SESSION',
      previewOnClick: `requestStartFromOverview('${todayEntry.planDay.id}')`,
    });
  } else {
    // Today is rest day (or already done) → compact Ruhetag hero
    wrap.innerHTML = buildRestHero(true);
  }
  ensureTimerActive();

  // ─ Program card ─
  document.getElementById('ov-program-num').textContent = prog.num;
  document.getElementById('ov-program-total').textContent = prog.total;
  const segbar = document.getElementById('ov-program-segbar');
  // Show up to 12 segments, mark first `prog.num` as done. If total > 12, show 12 representative segments.
  const segCount = Math.min(12, prog.total);
  const doneFrac = prog.num / prog.total;
  const segDone = Math.round(doneFrac * segCount);
  segbar.innerHTML = Array.from({length: segCount}, (_,i) =>
    `<div class="program-card-seg ${i < segDone ? 'done':''}"></div>`).join('');
  document.getElementById('ov-program-side').innerHTML =
    `KW ${isoWeekNum()}<br>${prog.name||'Trainingsplan'}`;
  document.getElementById('ov-program-label').textContent = 'TRAININGSWOCHE';

  // ─ 7-day strip ─
  renderNext7Strip(week7);

  // ─ Letzte Sessions (kompakt, 3 jüngste) ─
  renderRecentSessionsOnOverview();
}

function renderRecentSessionsOnOverview() {
  const container = document.getElementById('ov-recent-sessions-list');
  if (!container) return;
  const ws = DB.getWorkouts().slice(0, 3);
  if (!ws.length) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text3);padding:8px 0;text-align:center;margin:0">Noch keine Workouts</p>';
    return;
  }
  const plan = DB.getPlan();
  container.innerHTML = ws.map((w, i) => {
    const day = plan.find(d => d.id === w.planDayId);
    const dayName = day ? day.name : (w.planDayName || 'Freestyle');
    return `<div class="sess-v2-row" onclick="showHistDetail(${i})">
      <div class="sess-v2-icon">
        <svg viewBox="0 0 24 24"><path d="M6 9v6M4 7v10M18 9v6M20 7v10M9 12h6"/></svg>
      </div>
      <div class="sess-v2-info">
        <div class="sess-v2-name">${pd(dayName)}</div>
        <div class="sess-v2-meta">${fmtDateShort(w.startTs)} • ${fmtDur(w.duration)}</div>
      </div>
      <div class="sess-v2-arrow">›</div>
    </div>`;
  }).join('');
}

function dayLabel(label) {
  // Get today/morning label
  const today = new Date();
  const todayIdx = (today.getDay()+6) % 7;
  const labels = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
  return labels[todayIdx] || label;
}

function renderNext7Strip(days) {
  const root = document.getElementById('ov-next7-strip');
  root.innerHTML = days.map((d, i) => {
    const classes = ['next7-chip'];
    if (d.isToday) classes.push('today');
    if (d.isRest) classes.push('rest'); else classes.push('training');
    if (d.dayDone && d.planDay) classes.push('done');
    const topLabel = d.isToday ? 'Heute' : (d.isTomorrow ? 'Morgen' : '');
    const mid = d.planDay ? pd(d.planDay.name) : 'Ruhe';
    const onclick = d.planDay && d.isToday && !d.dayDone
      ? `onclick="startWorkout('${d.planDay.id}')"` : '';
    return `<div class="${classes.join(' ')}" ${onclick}>
      <div class="n7-top">${topLabel ? `<span class="lbl">${topLabel}</span>`:''}${d.label}</div>
      <div class="n7-mid">${mid}</div>
    </div>`;
  }).join('');
}

function heroAction() {
  // Legacy entry point kept for safety; new flow goes through requestStartFromOverview().
  const activeWo = DB.getActive();
  if (activeWo) { resumeWorkout(); return; }
  const week7 = getCurrentWeekDays();
  const todayEntry = week7.find(d => d.isToday);
  const upcoming = (todayEntry && todayEntry.planDay) ? todayEntry
                : week7.find(d => d.isFuture && d.planDay);
  const targetId = (upcoming && upcoming.planDay) ? upcoming.planDay.id
                : (getNextPlanDay() ? getNextPlanDay().id : null);
  if (targetId) requestStartFromOverview(targetId);
}

// Ask the user before starting a workout from the Übersicht hero.
let pendingStartDayId = null;
function requestStartFromOverview(dayId) {
  pendingStartDayId = dayId;
  const day = DB.getPlan().find(d => d.id === dayId);
  if (day) {
    const exCount = day.exercises.length;
    const setCount = day.exercises.reduce((a,e)=>a+e.targetSets, 0);
    document.getElementById('modal-confirm-start-info').textContent =
      `${day.name} — ${exCount} Übungen • ${setCount} Sätze`;
  }
  openModal('modal-confirm-start');
}
function confirmStartYes() {
  closeModal('modal-confirm-start');
  if (pendingStartDayId) {
    const id = pendingStartDayId;
    pendingStartDayId = null;
    startWorkout(id); // already navigates to Workouts tab
  }
}
function confirmStartNo() {
  closeModal('modal-confirm-start');
  pendingStartDayId = null;
}

// "Nächste Übung" auf der Hero — navigiert + scrollt zur nächsten unerledigten Übung.
function heroActionContinue() {
  if (currentScreen === 'overview') {
    showScreen('workouts');
    // Workouts-Tab hat gerade gerendert; im nächsten Frame zur nächsten Übung scrollen
    requestAnimationFrame(() => scrollToNextExercise());
  } else {
    scrollToNextExercise();
  }
}

// Keep the active-session timer running across tabs (but not while paused).
function ensureTimerActive() {
  const wo = DB.getActive();
  const shouldRun = !!wo && !wo.paused;
  if (shouldRun && !timerInterval) startTimer();
  if (!shouldRun && timerInterval) stopTimer();
}

// ═══════════════════════════════════════════════
// STARTING A WORKOUT
// ═══════════════════════════════════════════════

// Build sets for a fresh workout exercise: copy from last workout per-set, fall back to targetReps
function buildSetsForExercise(exId, targetSets, targetReps, targetWeight) {
  const last = getLastExData(exId);
  return Array.from({length: targetSets}, (_, idx) => {
    const lastSet = last && last.sets && last.sets[idx];
    // Gewichts-Fallback-Kette: letzter Satz → letztes Workout max → Plan-Zielgewicht → leer
    let weight = '';
    if (lastSet && lastSet.weight) weight = String(lastSet.weight);
    else if (last) weight = String(last.maxWeight);
    else if (targetWeight) weight = String(targetWeight);
    return {
      weight,
      reps:   lastSet && lastSet.reps   ? String(lastSet.reps)   : String(targetReps),
      done: false,
    };
  });
}

function startWorkout(dayId) {
  if (DB.getActive()) {
    confirmAction('Workout läuft bereits',
      'Es läuft noch ein Workout. Neu starten? Die aktuelle Session wird verworfen.',
      () => { stopTimer(); DB.clearActive(); _doStartWorkout(dayId); },
      { danger: true, confirmLabel: 'Neu starten' }
    );
    return;
  }
  _doStartWorkout(dayId);
}

function _doStartWorkout(dayId) {
  const plan = DB.getPlan();
  const day = plan.find(d => d.id === dayId);
  const exercises = (day ? day.exercises : []).map(pe => {
    const ex = getEx(pe.exId);
    if (!ex) return null;
    return {
      exId: pe.exId,
      id: pe.exId,
      name: ex.name,
      targetSets: pe.targetSets,
      targetReps: pe.targetReps,
      sets: buildSetsForExercise(pe.exId, pe.targetSets, pe.targetReps, pe.targetWeight),
      notes: '',
      done: false
    };
  }).filter(Boolean);

  const wo = { id:'wo_'+Date.now(), planDayId: dayId, planDayName: day ? day.name : 'Freestyle', startTs: Date.now(), exercises };
  DB.saveActive(wo);
  // Set selected day to match
  const wp = DB.getWeekPlan();
  const idx = wp.findIndex(d => d.planDayId === dayId);
  if (idx >= 0) selectedWorkoutDayIdx = idx;
  showScreen('workouts');
}

function resumeWorkout() { showScreen('workouts'); }

// ═══════════════════════════════════════════════
// ACTIVE WORKOUT
// ═══════════════════════════════════════════════

let timerInterval = null;
let timerPaused = false;

function heroDumbbellSvg() {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="color:var(--accent)">
    <rect x="36" y="55" width="48" height="10" rx="3" fill="currentColor" opacity="0.95"/>
    <rect x="18" y="38" width="22" height="44" rx="5" fill="currentColor"/>
    <rect x="20" y="40" width="6" height="40" rx="3" fill="#fff" opacity="0.4"/>
    <rect x="10" y="44" width="12" height="32" rx="4" fill="currentColor" opacity="0.8" style="filter:brightness(0.7)"/>
    <rect x="80" y="38" width="22" height="44" rx="5" fill="currentColor"/>
    <rect x="82" y="40" width="6" height="40" rx="3" fill="#fff" opacity="0.4"/>
    <rect x="98" y="44" width="12" height="32" rx="4" fill="currentColor" opacity="0.8" style="filter:brightness(0.7)"/>
    <rect x="38" y="56" width="44" height="2" rx="1" fill="#fff" opacity="0.4"/>
  </svg>`;
}

function buildSessionCard(active, planDay, selDay, isPreview, opts) {
  opts = opts || {};
  const totalSets = active
    ? active.exercises.reduce((a,e)=>a+e.sets.length, 0)
    : (planDay ? planDay.exercises.reduce((a,e)=>a+e.targetSets, 0) : 0);
  const exCount = active ? active.exercises.length : (planDay ? planDay.exercises.length : 0);
  const doneEx = active ? active.exercises.filter(e=>e.done).length : 0;
  const processedEx = active ? active.exercises.filter(e=>e.done || e.skipped).length : 0;
  const title = `${dayFullName(selDay.dayKey)}${planDay ? ' — ' + pd(planDay.name) : ''}`;
  const label = opts.label || (isPreview ? 'VORSCHAU' : 'AKTIVE SESSION');
  const meta = `${exCount} Übungen • ${totalSets} Sätze`;
  const pct = !isPreview && active && active.exercises.length
    ? (processedEx / active.exercises.length * 100) : 0;
  const timerBlock = (!isPreview && active)
    ? `<div class="hero-v2-timer">${fmtTimer(Math.floor(getElapsedMs(active)/1000))}</div>`
    : '';

  const metaPreview = `<div class="hero-v2-meta">
    <span style="display:inline-flex;gap:5px;align-items:center">
      <svg viewBox="0 0 24 24"><path d="M6 9v6M4 7v10M18 9v6M20 7v10M9 12h6"/></svg>
      ${exCount} Übungen</span>
    <span class="dot"></span>
    <span style="display:inline-flex;gap:5px;align-items:center">
      <svg viewBox="0 0 24 24"><polyline points="12 2 22 8 12 14 2 8 12 2"/><polyline points="2 12 12 18 22 12"/><polyline points="2 16 12 22 22 16"/></svg>
      ${totalSets} Sätze</span>
  </div>`;

  // Active-mode meta is more compact: progress label + thin bar replace the meta row
  const metaActive = `<div class="hero-v2-meta">
    <span>${doneEx} von ${active ? active.exercises.length : exCount} Übungen abgeschlossen</span>
  </div>
  <div class="hero-v2-progress-bar-thin"><div class="hero-v2-progress-fill-thin" style="width:${pct}%"></div></div>`;

  // Title-row in both modes so the title's top position stays stable
  const titleBlock = `<div class="hero-v2-title-row">
    <div class="hero-v2-title">${title}</div>
    ${timerBlock}
  </div>`;

  const topRow = `<div class="hero-v2-top">
    <div class="hero-v2-text">
      <div class="hero-v2-label">${label}</div>
      ${titleBlock}
      ${isPreview ? metaPreview : metaActive}
    </div>
    <div class="hero-v2-art">
      <div class="glow"></div>
      ${heroDumbbellSvg()}
    </div>
  </div>`;

  if (isPreview) {
    const previewOnClick = opts.previewOnClick || `startWorkout('${planDay.id}')`;
    // Wenn an einem anderen Tag bereits ein Workout aktiv ist, soll der Start-Button hier verschwinden.
    const elsewhereActive = DB.getActive();
    const blockedByOther = elsewhereActive && elsewhereActive.planDayId !== planDay.id;
    const bottomHTML = blockedByOther
      ? `<div class="hero-v2-running-notice">Aktuell läuft ein anderes Workout. Bitte zuerst beenden.</div>`
      : `<button class="hero-v2-btn stretch" onclick="${previewOnClick}">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
           Workout starten
         </button>`;
    return `<div class="hero-v2 col-layout">
      ${topRow}
      <div class="hero-v2-bottom">
        ${bottomHTML}
      </div>
    </div>`;
  }

  // Active mode — same outer structure as preview; bottom is only the button row
  const continueOnClick = opts.continueOnClick || 'scrollToNextExercise()';
  const paused = !!(active && active.paused);
  const pauseLabel = paused ? 'Workout fortsetzen' : 'Workout pausieren';
  const pauseIcon = paused
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  const allDone = active && active.exercises.length > 0 && active.exercises.every(e => e.done || e.skipped);
  const nextBtn = allDone ? '' : `
        <button class="hero-v2-btn hero-v2-btn-next" onclick="${continueOnClick}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2.6" height="16" rx="1"/></svg>
          Nächste Übung
        </button>`;
  const rowClass = allDone ? 'hero-v2-button-row two-buttons' : 'hero-v2-button-row';

  return `<div class="hero-v2 col-layout active-mode">
    ${topRow}
    <div class="hero-v2-bottom">
      <div class="${rowClass}">
        ${nextBtn}
        <button class="hero-v2-btn-pause" onclick="togglePauseWorkout()" aria-label="${pauseLabel}">
          ${pauseIcon}
          ${pauseLabel}
        </button>
        <button class="hero-v2-btn-danger" onclick="confirmFinish()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
          Beenden
        </button>
      </div>
    </div>
  </div>`;
}

function buildRestHero(isToday) {
  return `<div class="hero-v2 rest-mode">
    <div class="hero-v2-text" style="flex:1">
      <div class="hero-v2-label">RUHETAG</div>
      <div class="hero-v2-title">${isToday ? 'Heute ist Ruhetag' : 'Kein Workout geplant'}</div>
    </div>
    <div class="hero-v2-art">
      ${heroDumbbellSvg()}
    </div>
  </div>`;
}

function buildRestCard(selDay) {
  return `<div class="session-card-v2" style="background:linear-gradient(135deg,#f5f7fa 0%,#fafbfc 100%)">
    <div class="scv2-pill" style="border-color:var(--text3);color:var(--text2)">RUHETAG</div>
    <div class="scv2-row">
      <div style="flex:1">
        <div class="scv2-title">${dayFullName(selDay.dayKey)}</div>
        <div class="scv2-meta"><span>Heute ist kein Training geplant.</span></div>
      </div>
      <div class="scv2-icon-circle" style="border-color:var(--border)">
        <svg viewBox="0 0 24 24" style="stroke:var(--text3);fill:none;stroke-width:1.8;width:30px;height:30px"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      </div>
    </div>
  </div>`;
}

function dayFullName(key) {
  return ({mon:'Montag',tue:'Dienstag',wed:'Mittwoch',thu:'Donnerstag',fri:'Freitag',sat:'Samstag',sun:'Sonntag'})[key] || key;
}

let selectedWorkoutDayIdx = null;

function ensureSelectedDayIdx() {
  if (selectedWorkoutDayIdx !== null) return;
  const today = new Date(); const todayIdx = (today.getDay()+6)%7;
  const wo = DB.getActive();
  if (wo) {
    const wp = DB.getWeekPlan();
    const idx = wp.findIndex(d => d.planDayId === wo.planDayId);
    if (idx >= 0) { selectedWorkoutDayIdx = idx; return; }
  }
  selectedWorkoutDayIdx = todayIdx;
}

function selectWorkoutDay(idx) {
  selectedWorkoutDayIdx = idx;
  renderWorkoutsScreen();
}

function renderWorkoutWeekStrip() {
  ensureSelectedDayIdx();
  const days = getCurrentWeekDays();
  document.getElementById('wo-week-strip').innerHTML = days.map((d, i) => {
    const classes = ['next7-chip'];
    if (d.isToday) classes.push('today');
    // Selected: any day the user picked (incl. today)
    if (i === selectedWorkoutDayIdx) classes.push('selected');
    if (d.isRest) classes.push('rest'); else classes.push('training');
    if (d.dayDone && d.planDay) classes.push('done');
    const topLabel = d.isToday ? 'Heute' : (d.isTomorrow ? 'Morgen' : '');
    const mid = d.planDay ? pd(d.planDay.name) : 'Ruhe';
    return `<div class="${classes.join(' ')}" onclick="selectWorkoutDay(${i})">
      <div class="n7-top">${topLabel ? `<span class="lbl">${topLabel}</span>`:''}${d.label}</div>
      <div class="n7-mid">${mid}</div>
    </div>`;
  }).join('');
}

function renderWorkoutsScreen() {
  ensureSelectedDayIdx();
  const wp = DB.getWeekPlan();
  const plan = DB.getPlan();
  const selDay = wp[selectedWorkoutDayIdx];
  const planDay = selDay && selDay.planDayId ? plan.find(d => d.id === selDay.planDayId) : null;
  const active = DB.getActive();
  const activeOnSelected = active && planDay && active.planDayId === planDay.id;

  // Header subtitle
  const dotEl = document.getElementById('wo-sub-dot');
  const subEl = document.getElementById('wo-sub-text');
  if (activeOnSelected) {
    dotEl.style.display = 'inline-block';
    subEl.textContent = 'Aktive Session';
  } else if (planDay) {
    dotEl.style.display = 'none';
    subEl.textContent = 'Vorschau';
  } else {
    dotEl.style.display = 'none';
    subEl.textContent = 'Wochenplan';
  }

  // Week strip
  renderWorkoutWeekStrip();

  // Session card
  const wrap = document.getElementById('wo-session-card-wrap');
  if (activeOnSelected) {
    wrap.innerHTML = buildSessionCard(active, planDay, selDay, false);
  } else if (planDay) {
    wrap.innerHTML = buildSessionCard(null, planDay, selDay, true);
  } else {
    wrap.innerHTML = buildRestCard(selDay);
  }

  // Tabs + cards
  if (activeOnSelected) {
    renderActiveWorkout();
    document.getElementById('wo-add-ex-wrap').style.display = '';
    if (!timerInterval) startTimer();
  } else if (planDay) {
    renderPreviewWorkout(planDay);
    document.getElementById('wo-add-ex-wrap').style.display = 'none';
    stopTimer();
  } else {
    document.getElementById('ex-tab-bar').innerHTML = '';
    document.getElementById('active-ex-list').innerHTML = '';
    document.getElementById('wo-add-ex-wrap').style.display = 'none';
    stopTimer();
  }
}

function renderPreviewWorkout(planDay) {
  // (Mini-Kacheln im Workouts-Tab wurden entfernt)
  document.getElementById('ex-tab-bar').innerHTML = '';

  // Cards (read-only target view)
  document.getElementById('active-ex-list').innerHTML = planDay.exercises.map((pe, ei) => {
    const ex = getEx(pe.exId);
    if (!ex) return '';
    const col = colorForExercise({ exId: pe.exId });
    const last = getLastExData(pe.exId);
    const targetW = last ? `${last.maxWeight} kg` : '–';
    const lastStr = last ? `Zuletzt: ${last.sets.length}×${last.sets[0]?.reps||'?'} @ ${last.maxWeight} kg` : '';
    return `<div class="aex-v2" id="aex-${ei}" style="--c:${col.c};--c-bg:${col.bg}"
                 ondragstart="aexDragStart(event,${ei},'preview','${planDay.id}')"
                 ondragend="aexDragEnd(event)"
                 ondragover="aexDragOver(event,${ei})"
                 ondragleave="aexDragLeave(event)"
                 ondrop="aexDrop(event,${ei})">
      <div class="aex-v2-header">
        <span class="aex-drag-handle"
              onpointerdown="event.currentTarget.closest('.aex-v2').draggable=true"
              onpointerup="event.currentTarget.closest('.aex-v2').draggable=false">≡</span>
        <div class="aex-v2-num">${ei+1}</div>
        <div class="aex-v2-info">
          <div class="aex-v2-name">${ex.name}</div>
          ${lastStr ? `<div class="aex-v2-last">${lastStr}</div>` : ''}
        </div>
      </div>
      <div class="aex-v2-body">
        <div class="aex-v2-table">
          <div class="aex-v2-row head" style="grid-template-columns:50px ${Array(pe.targetSets).fill('1fr').join(' ')}">
            <span class="ax-lbl">Satz</span>${Array.from({length:pe.targetSets},(_,si)=>`<span class="num-cell">${si+1}</span>`).join('')}
          </div>
          <div class="aex-v2-row" style="grid-template-columns:50px ${Array(pe.targetSets).fill('1fr').join(' ')}">
            <span class="ax-lbl">kg</span>${Array(pe.targetSets).fill(`<div class="aex-v2-inp" style="background:var(--bg);color:var(--text3);display:flex;align-items:center;justify-content:center">${last?last.maxWeight:'–'}</div>`).join('')}
          </div>
          <div class="aex-v2-row" style="grid-template-columns:50px ${Array(pe.targetSets).fill('1fr').join(' ')}">
            <span class="ax-lbl">Wdh.</span>${Array(pe.targetSets).fill(`<div class="aex-v2-inp" style="background:var(--bg);color:var(--text3);display:flex;align-items:center;justify-content:center">${pe.targetReps}</div>`).join('')}
          </div>
        </div>
        <div class="aex-v2-notes">
          <textarea class="aex-v2-notes-area" data-ex-id="${ex.id}" placeholder="Notizen"
                    onchange="saveExerciseNote('${ex.id}', this.value)">${ex.notes || ''}</textarea>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderActiveWorkout() {
  const wo = DB.getActive();
  if (!wo) return;

  // (Mini-Kacheln im Workouts-Tab wurden entfernt)
  document.getElementById('ex-tab-bar').innerHTML = '';

  // Exercise cards
  document.getElementById('active-ex-list').innerHTML = wo.exercises.map((ex, ei) => {
    const col = colorForExercise(ex);
    const last = getLastExData(ex.exId || ex.id);
    const lastStr = last ? `Zuletzt: ${last.sets.length}×${last.sets[0]?.reps||'?'} @ ${last.maxWeight} kg` : '';
    const targetW = last ? `${last.maxWeight} kg` : '–';
    const nSets = ex.sets.length;
    const gridCols = `50px ${Array(nSets).fill('1fr').join(' ')}`;
    const headerCells = ex.sets.map((_,si)=>`<span class="num-cell">${si+1}</span>`).join('');
    const kgInputs = ex.sets.map((s,si) =>
      `<input class="aex-v2-inp ${s.done?'done-inp':''}" type="number" inputmode="decimal"
              style="--c:${col.c}" placeholder="–" value="${s.weight}"
              onchange="updateSet(${ei},${si},'weight',this.value)" ${s.done?'disabled':''}>`
    ).join('');
    const repInputs = ex.sets.map((s,si) =>
      `<input class="aex-v2-inp ${s.done?'done-inp':''}" type="number" inputmode="numeric"
              style="--c:${col.c}" placeholder="–" value="${s.reps}"
              onchange="updateSet(${ei},${si},'reps',this.value)" ${s.done?'disabled':''}>`
    ).join('');

    const stateCls = ex.done ? 'done' : (ex.skipped ? 'skipped' : '');
    return `<div class="aex-v2 ${stateCls}" id="aex-${ei}" style="--c:${col.c};--c-bg:${col.bg}"
                 ondragstart="aexDragStart(event,${ei},'active')"
                 ondragend="aexDragEnd(event)"
                 ondragover="aexDragOver(event,${ei})"
                 ondragleave="aexDragLeave(event)"
                 ondrop="aexDrop(event,${ei})">
      <div class="aex-v2-header">
        <span class="aex-drag-handle"
              onpointerdown="event.currentTarget.closest('.aex-v2').draggable=true"
              onpointerup="event.currentTarget.closest('.aex-v2').draggable=false">≡</span>
        <div class="aex-v2-num">${ei+1}</div>
        <div class="aex-v2-info">
          <div class="aex-v2-name">${ex.name}</div>
          ${lastStr ? `<div class="aex-v2-last">${lastStr}</div>` : ''}
        </div>
        <label class="aex-v2-done ${ex.done?'checked':''}">
          <input type="checkbox" ${ex.done?'checked':''} onchange="toggleExDone(${ei},this.checked)">
          <div class="aex-v2-done-box">${ex.done?'<svg width="12" height="12" viewBox="0 0 24 24" stroke="white" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':''}</div>
          <span>Erledigt</span>
        </label>
      </div>
      <div class="aex-v2-body">
        <div class="aex-v2-table">
          <div class="aex-v2-row head" style="grid-template-columns:${gridCols}">
            <span class="ax-lbl">Satz</span>${headerCells}
          </div>
          <div class="aex-v2-row" style="grid-template-columns:${gridCols}">
            <span class="ax-lbl">kg</span>${kgInputs}
          </div>
          <div class="aex-v2-row" style="grid-template-columns:${gridCols}">
            <span class="ax-lbl">Wdh.</span>${repInputs}
          </div>
        </div>
        <div class="aex-v2-notes">
          <textarea class="aex-v2-notes-area" data-ex-id="${ex.exId || ex.id}" placeholder="Notizen"
                    onchange="updateNotes(${ei},this.value)">${(getEx(ex.exId || ex.id)?.notes) || ''}</textarea>
        </div>
      </div>
      ${ex.done ? '' : (ex.skipped
        ? `<div class="aex-v2-actions">
             <button class="btn btn-ghost btn-sm" onclick="unskipExercise(${ei})">↻ Wieder aktiv setzen</button>
           </div>`
        : `<div class="aex-v2-actions">
             <button class="btn btn-ghost btn-sm" onclick="addSet(${ei})">+ Satz</button>
             ${ex.sets.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="removeSet(${ei})">− Satz</button>` : ''}
             <button class="btn btn-ghost btn-sm aex-skip-btn" onclick="skipExercise(${ei})">» Überspringen</button>
           </div>`)}
    </div>`;
  }).join('');
}

function updateBottomBar() { /* bottom bar removed in v2 */ }

function updateSet(ei, si, field, value) {
  const wo = DB.getActive();
  if (!wo) return;
  const ex = wo.exercises[ei];
  ex.sets[si][field] = value;
  // Auto-propagate to subsequent (non-done) sets only
  for (let k = si + 1; k < ex.sets.length; k++) {
    if (!ex.sets[k].done) ex.sets[k][field] = value;
  }
  DB.saveActive(wo);
  // Refresh just the affected inputs without full re-render to avoid losing focus
  document.querySelectorAll(`.aex-v2[id="aex-${ei}"] .aex-v2-inp`).forEach((inp, idx) => {
    // Each row has nSets inputs; we have 2 rows (kg + Wdh.)
    // Order in DOM: row1=kg (all sets), row2=Wdh (all sets)
    const nSets = ex.sets.length;
    const rowIsKg = idx < nSets;
    const setIdx  = idx % nSets;
    if (setIdx <= si) return;          // don't touch earlier sets
    if (ex.sets[setIdx].done) return;  // don't touch done sets
    if (rowIsKg && field === 'weight') inp.value = value;
    if (!rowIsKg && field === 'reps')  inp.value = value;
  });
}

function updateNotes(ei, value) {
  const wo = DB.getActive();
  if (!wo) return;
  const workoutEx = wo.exercises[ei];
  const id = workoutEx.exId || workoutEx.id;
  // Persist to the GLOBAL exercise note (single source of truth)
  const exs = DB.getExercises();
  const ex = exs.find(e => e.id === id);
  if (ex) { ex.notes = value; DB.saveExercises(exs); }
  // Mirror onto the workout entry so the saved session history keeps a snapshot
  workoutEx.notes = value;
  DB.saveActive(wo);
}

function toggleExDone(ei, checked) {
  const wo = DB.getActive();
  if (!wo) return;
  wo.exercises[ei].done = checked;
  if (checked) wo.exercises[ei].skipped = false; // mutually exclusive
  // Mark all sets as done/undone
  wo.exercises[ei].sets.forEach(s => s.done = checked);
  DB.saveActive(wo);
  renderWorkoutsScreen();

  // Auto-scroll
  setTimeout(() => {
    if (checked) {
      const nextIdx = wo.exercises.findIndex(e => !e.done && !e.skipped);
      if (nextIdx >= 0) {
        scrollToEx(nextIdx);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('app').scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, 50);
}

function skipExercise(ei) {
  const wo = DB.getActive();
  if (!wo) return;
  wo.exercises[ei].skipped = true;
  wo.exercises[ei].done = false;     // mutually exclusive
  DB.saveActive(wo);
  renderWorkoutsScreen();
  // Auto-scroll zum nächsten unbearbeiteten Eintrag
  setTimeout(() => {
    const nextIdx = wo.exercises.findIndex(e => !e.done && !e.skipped);
    if (nextIdx >= 0) {
      scrollToEx(nextIdx);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('app').scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
}

function unskipExercise(ei) {
  const wo = DB.getActive();
  if (!wo) return;
  wo.exercises[ei].skipped = false;
  DB.saveActive(wo);
  renderWorkoutsScreen();
}

// Drag-and-Drop für Detail-Cards im Workouts-Tab (Active + Vorschau)
let aexDragState = null; // { mode: 'active'|'preview', dayId?: string, fromIdx: number }
function aexDragStart(e, idx, mode, dayId) {
  aexDragState = { mode, dayId: dayId || null, fromIdx: idx };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch(_){}
  }
  e.currentTarget.classList.add('dragging');
}
function aexDragOver(e, idx) {
  e.preventDefault();
  if (!aexDragState || aexDragState.fromIdx === idx) return;
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  const isAbove = (e.clientY - r.top) < r.height / 2;
  card.classList.toggle('drop-target-above', isAbove);
  card.classList.toggle('drop-target-below', !isAbove);
}
function aexDragLeave(e) {
  e.currentTarget.classList.remove('drop-target-above','drop-target-below');
}
function aexDrop(e, targetIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drop-target-above','drop-target-below');
  if (!aexDragState || aexDragState.fromIdx === targetIdx) {
    aexDragState = null;
    return;
  }
  const fromIdx = aexDragState.fromIdx;
  const r = e.currentTarget.getBoundingClientRect();
  const dropAfter = (e.clientY - r.top) >= r.height / 2;
  let insertIdx = dropAfter ? targetIdx + 1 : targetIdx;
  if (fromIdx < targetIdx) insertIdx -= 1;
  if (insertIdx < 0) insertIdx = 0;

  if (aexDragState.mode === 'active') {
    const wo = DB.getActive();
    if (wo) {
      const [moved] = wo.exercises.splice(fromIdx, 1);
      if (insertIdx > wo.exercises.length) insertIdx = wo.exercises.length;
      wo.exercises.splice(insertIdx, 0, moved);
      DB.saveActive(wo);
    }
  } else if (aexDragState.mode === 'preview' && aexDragState.dayId) {
    const plan = DB.getPlan();
    const day = plan.find(d => d.id === aexDragState.dayId);
    if (day) {
      const [moved] = day.exercises.splice(fromIdx, 1);
      if (insertIdx > day.exercises.length) insertIdx = day.exercises.length;
      day.exercises.splice(insertIdx, 0, moved);
      DB.savePlan(plan);
    }
  }
  aexDragState = null;
  renderWorkoutsScreen();
}
function aexDragEnd(e) {
  e.currentTarget.classList.remove('dragging','drop-target-above','drop-target-below');
  document.querySelectorAll('.aex-v2').forEach(c =>
    c.classList.remove('drop-target-above','drop-target-below')
  );
  e.currentTarget.draggable = false;
  aexDragState = null;
}

function addSet(ei) {
  const wo = DB.getActive();
  const lastSet = wo.exercises[ei].sets.slice(-1)[0] || {};
  wo.exercises[ei].sets.push({ weight: lastSet.weight||'', reps: lastSet.reps||'', done: false });
  DB.saveActive(wo);
  renderWorkoutsScreen();
}

function removeSet(ei) {
  const wo = DB.getActive();
  if (wo.exercises[ei].sets.length > 1) {
    wo.exercises[ei].sets.pop();
    DB.saveActive(wo);
    renderWorkoutsScreen();
  }
}

function scrollToEx(i) {
  const el = document.getElementById('aex-'+i);
  if (!el) return;
  // Use scroll-margin-top via scrollIntoView — works with the CSS setting we added.
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Update active tab highlight
  document.querySelectorAll('.ex-tab-v2').forEach((t,idx) => t.classList.toggle('active', idx===i));
}

function scrollToNextExercise() {
  const wo = DB.getActive();
  if (!wo) return;
  const nextIdx = wo.exercises.findIndex(e => !e.done && !e.skipped);
  if (nextIdx >= 0) scrollToEx(nextIdx);
}

let timerTs = null;
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerTs = null;
  updateTimerDisplay();
  timerInterval = setInterval(updateTimerDisplay, 1000);
}
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}
// (Legacy pauseTimer removed — pause is now controlled via togglePauseWorkout in the hero.)
// Effective elapsed time for a workout, taking pause periods into account.
function getElapsedMs(wo) {
  if (!wo) return 0;
  const paused = !!wo.paused;
  const pausedTotal = wo.pausedTotal || 0;
  const now = paused ? (wo.pausedAt || Date.now()) : Date.now();
  return Math.max(0, now - wo.startTs - pausedTotal);
}

function updateTimerDisplay() {
  const wo = DB.getActive();
  if (!wo) { stopTimer(); return; }
  const elapsed = Math.floor(getElapsedMs(wo) / 1000);
  const t = '• ' + fmtTimer(elapsed);
  document.querySelectorAll('.hero-v2-timer').forEach(el => el.textContent = t);
}

// Pause / resume the active workout (real freeze).
function togglePauseWorkout() {
  const wo = DB.getActive();
  if (!wo) return;
  if (wo.paused) {
    // Resume: account for the pause duration
    const pauseLen = Date.now() - (wo.pausedAt || Date.now());
    wo.pausedTotal = (wo.pausedTotal || 0) + pauseLen;
    wo.pausedAt = null;
    wo.paused = false;
  } else {
    wo.paused = true;
    wo.pausedAt = Date.now();
  }
  DB.saveActive(wo);
  ensureTimerActive();
  updateTimerDisplay();
  // Re-render so the button label updates everywhere
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
}

function openAddExModal() {
  document.getElementById('add-ex-search').value = '';
  renderAddExList('');
  openModal('modal-add-ex');
}
function filterAddEx() { renderAddExList(document.getElementById('add-ex-search').value); }
function renderAddExList(q) {
  const exs = DB.getExercises();
  const filtered = q ? exs.filter(e => e.name.toLowerCase().includes(q.toLowerCase())) : exs;
  const sorted = [...filtered].sort((a,b) => a.name.localeCompare(b.name, 'de'));
  document.getElementById('add-ex-list').innerHTML = sorted.map(e => {
    const col = muscleColor(e.muscle);
    return `<div class="sheet-item muscle-coded" style="--c:${col}" onclick="addExToWorkout('${e.id}')">
      <div><div class="sheet-item-name">${e.name}</div><div class="sheet-item-sub">${muscleName(e.muscle)}</div></div>
      <span style="color:var(--accent);font-size:20px">+</span>
    </div>`;
  }).join('') || '<p style="color:var(--text3);text-align:center;padding:20px">Keine Übung gefunden</p>';
}
function addExToWorkout(exId) {
  const ex = getEx(exId); if (!ex) return;
  const wo = DB.getActive();
  wo.exercises.push({
    exId, id:exId, name:ex.name, targetSets:3, targetReps:8,
    sets: buildSetsForExercise(exId, 3, 8),
    notes:'', done:false
  });
  DB.saveActive(wo);
  closeModal('modal-add-ex');
  renderWorkoutsScreen();
  showToast(`${ex.name} hinzugefügt`);
}

function confirmFinish() { openModal('modal-finish'); }

function finishWorkout() {
  const wo = DB.getActive();
  if (!wo) return;
  stopTimer();
  const duration = Math.floor(getElapsedMs(wo) / 1000);
  // Clean sets (remove empty ones)
  const cleanEx = wo.exercises.map(ex => ({
    ...ex,
    sets: ex.sets.filter(s => s.weight || s.reps)
  })).filter(ex => ex.sets.length > 0);

  const prevWorkouts = DB.getWorkouts();
  const prs = detectPRs({ ...wo, exercises: cleanEx }, prevWorkouts);

  const finalWo = { ...wo, exercises: cleanEx, duration, endTs: Date.now(), prs };
  DB.addWorkout(finalWo);
  DB.clearActive();
  stopTimer();

  closeModal('modal-finish');

  if (prs.length) showToast(`${prs.length} neuer PR! 🏆`);
  else showToast('Workout gespeichert! 💪');

  // Aktuellen Tab neu rendern — egal ob Workouts oder Übersicht, der Active-Mode endet sofort
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
}

function discardWorkout() {
  // Erst das aktuell offene Finish-Modal schließen, sonst überdeckt es das Confirm-Modal
  closeModal('modal-finish');
  setTimeout(() => {
    confirmAction('Workout abbrechen?',
      'Workout wirklich abbrechen und löschen? Alle Eingaben gehen verloren.',
      () => {
        stopTimer();
        DB.clearActive();
        showToast('Workout verworfen');
        if (currentScreen === 'overview') renderOverview();
        else if (currentScreen === 'workouts') renderWorkoutsScreen();
      },
      { danger: true, confirmLabel: 'Abbrechen & löschen' }
    );
  }, 80);
}

// ═══════════════════════════════════════════════
// SCREEN: VERLAUF
// ═══════════════════════════════════════════════

let volumeChart = null;
let histRangeDays = 30;
const HIST_RANGES = [7, 30, 90, 365];
let volumeUnit = 'kg';   // 'kg' | 'sets'

function openHistRangeDropdown() {
  // aktive Auswahl visuell markieren
  document.querySelectorAll('.hist-range-option').forEach(opt => {
    const v = parseInt(opt.dataset.value);
    opt.classList.toggle('active', v === histRangeDays);
  });
  openModal('modal-hist-range');
}
function setHistRange(days) {
  histRangeDays = days;
  const label = days === 365 ? '1 Jahr' : `${days} Tage`;
  document.getElementById('hist-range-label').textContent = label;
  closeModal('modal-hist-range');
  renderHistory();
}

function toggleVolumeUnit() {
  volumeUnit = volumeUnit === 'kg' ? 'sets' : 'kg';
  document.getElementById('vol-unit-label').textContent = volumeUnit === 'kg' ? 'Kg' : 'Sätze';
  renderVolumeChart(filterWorkoutsByRange(DB.getWorkouts(), histRangeDays));
}

function filterWorkoutsByRange(ws, days) {
  const cutoff = Date.now() - days*24*3600*1000;
  return ws.filter(w => w.startTs >= cutoff);
}

function showAllSessions() {
  histRangeDays = 365;
  document.getElementById('hist-range-label').textContent = '1 Jahr';
  renderHistory();
}

function renderHistory() {
  const allWs = DB.getWorkouts();
  const ws = filterWorkoutsByRange(allWs, histRangeDays);
  const prog = getProgramWeek();

  document.getElementById('hist-total-wo').textContent = ws.length;
  const rangeLabel = histRangeDays === 365 ? 'Letztes Jahr' : `Letzte ${histRangeDays} Tage`;
  document.getElementById('hist-total-sub').textContent = rangeLabel;
  document.getElementById('hist-pr-period').textContent = rangeLabel;

  // PRs in selected range
  const recentPrs = ws.filter(w => w.prs && w.prs.length).reduce((a,w) => a + w.prs.length, 0);
  document.getElementById('hist-prs').textContent = recentPrs;

  // Trainings-Programmwoche
  document.getElementById('hist-week-num').textContent = `Woche ${prog.num}`;
  document.getElementById('hist-week-sub').textContent = `${prog.total}-Wochen-Trainingsplan`;

  // Volume chart by week
  renderVolumeChart(ws);

  // Muscle bars
  const volEl = document.getElementById('muscle-bars');
  if (ws.length) {
    const vol = calcMuscleVolume(ws);
    renderMuscleBars(vol, volEl);
  } else {
    volEl.innerHTML = '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
  }

  // PR list
  const prs = getAllPRs();
  const prEl = document.getElementById('hist-pr-list');
  prEl.innerHTML = prs.length ? prs.slice(0,10).map((pr, idx) => prHTML(pr, idx+1)).join('') :
    '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine PRs</p>';

  // Sessions
  const sessEl = document.getElementById('hist-sessions');
  if (!ws.length) {
    sessEl.innerHTML = '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Workouts</p>';
  } else {
    const plan = DB.getPlan();
    sessEl.innerHTML = ws.slice(0,8).map((w,i) => {
      const day = plan.find(d => d.id === w.planDayId);
      const dayName = dayOfWeek(w.startTs);
      const title = `${dayName} — ${day ? day.name : (w.planDayName || 'Freestyle')}`;
      const totalSets = w.exercises.reduce((a,e)=>a+e.sets.length, 0);
      const dateStr = new Date(w.startTs).toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'});
      const meta = `${dateStr} • ${w.exercises.length} Übungen • ${totalSets} Sätze`;
      return `<div class="sess-v2-row" onclick="showHistDetail(${i})">
        <div class="sess-v2-icon">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="sess-v2-info">
          <div class="sess-v2-name">${title}</div>
          <div class="sess-v2-meta">${meta}</div>
        </div>
        <span class="sess-v2-arrow">›</span>
      </div>`;
    }).join('');
  }
}

function renderVolumeChart(ws) {
  if (volumeChart) { volumeChart.destroy(); volumeChart = null; }
  const canvas = document.getElementById('volume-chart');
  if (!ws.length) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    return;
  }
  // Group by week
  const weekMap = {};
  ws.forEach(w => {
    const d = new Date(w.startTs);
    const wNum = getISOWeek(d);
    const key = `W${wNum}`;
    const val = volumeUnit === 'kg' ? calcVolume(w) : w.exercises.reduce((a,e)=>a+e.sets.length, 0);
    weekMap[key] = (weekMap[key] || 0) + val;
  });
  const sortedKeys = Object.keys(weekMap).slice(-8);
  const lastIdx = sortedKeys.length - 1;
  const ctx = canvas.getContext('2d');
  const isKg = volumeUnit === 'kg';
  // Read the current theme accent (so the chart matches the active tab)
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#0066ff';
  const accentRGB = (() => {
    // Convert hex to "r,g,b" for rgba()
    const h = accent.replace('#','');
    if (h.length !== 6) return '0,102,255';
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)].join(',');
  })();
  volumeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedKeys,
      datasets: [{
        data: sortedKeys.map(k => Math.round(weekMap[k])),
        borderColor: accent,
        backgroundColor: (ctx2) => {
          const c = ctx2.chart.ctx;
          const g = c.createLinearGradient(0,0,0,200);
          g.addColorStop(0,`rgba(${accentRGB},0.22)`);
          g.addColorStop(1,`rgba(${accentRGB},0.00)`);
          return g;
        },
        borderWidth: 2.5,
        pointBackgroundColor: '#fff',
        pointBorderColor: accent,
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.35, fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: { label: c => isKg ? (fmtNum(c.raw)+' kg') : (c.raw+' Sätze') }
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, ticks: { callback: v => isKg ? (fmtNum(v)+'k') : v, font:{size:11} } },
        x: { grid: { display: false }, ticks: { font:{size:11} } }
      }
    },
    plugins: [{
      id:'lastPointLabel',
      afterDatasetsDraw(chart) {
        const ds = chart.data.datasets[0];
        if (!ds || !ds.data.length) return;
        const meta = chart.getDatasetMeta(0);
        const last = meta.data[lastIdx];
        if (!last) return;
        const val = ds.data[lastIdx];
        const txt = isKg ? (fmtNum(val)+'k kg') : (val+' Sätze');
        const c = chart.ctx;
        c.save();
        c.font = '600 12px -apple-system, sans-serif';
        const w = c.measureText(txt).width + 14;
        const h = 22;
        const x = last.x - w/2;
        const y = last.y - h - 8;
        c.fillStyle = accent;
        c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
        c.fillStyle = '#fff';
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillText(txt, last.x, y + h/2);
        c.restore();
      }
    }]
  });
}

function getISOWeek(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay()+6)%7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date-week1)/86400000 - 3 + ((week1.getDay()+6)%7))/7);
}

function renderMuscleBars(vol, container) {
  const maxVol = Math.max(1, ...Object.values(vol));
  const html = MUSCLE_ORDER.map(m => {
    const v = vol[m] || 0;
    if (!v) return '';
    const pct = Math.round(v / maxVol * 100);
    return `<div class="muscle-bar-v2-row" style="--mc:${muscleColor(m)};--mc-bg:${muscleBg(m)}">
      <div class="muscle-icon-wrap">${muscleIconSvg(m, 16)}</div>
      <span class="muscle-bar-v2-name">${muscleName(m)}</span>
      <div class="muscle-bar-v2-bar"><div class="muscle-bar-v2-fill" style="width:${pct}%"></div></div>
      <span class="muscle-bar-v2-val">${fmtNum(v)} kg</span>
    </div>`;
  }).filter(Boolean).join('');
  container.innerHTML = html || '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
}

function getAllPRs() {
  const ws = DB.getWorkouts();
  // For each exercise, collect all max-weights per workout
  const histMap = {};
  ws.forEach(w => {
    w.exercises.forEach(ex => {
      const id = ex.exId || ex.id;
      const maxW = Math.max(...ex.sets.map(s => parseFloat(s.weight)||0));
      if (!maxW) return;
      if (!histMap[id]) histMap[id] = [];
      histMap[id].push({ name: ex.name, weight: maxW, date: w.startTs, sets: ex.sets });
    });
  });
  return Object.entries(histMap).map(([id, hist]) => {
    hist.sort((a,b) => b.weight - a.weight);
    const best = hist[0];
    const prev = hist.find(h => h.weight < best.weight);
    return { exId:id, name:best.name, weight:best.weight, prev: prev ? prev.weight : 0, date: best.date, sets: best.sets };
  }).sort((a,b) => b.weight - a.weight);
}

function prHTML(pr, number) {
  const ex = getEx(pr.exId);
  const muscleKey = ex ? ex.muscle : 'chest';
  const setsStr = pr.sets ? `${pr.sets.length}×${pr.sets[0]?.reps||'?'}` : '';
  const num = number || 1;
  const valColor = muscleColor(muscleKey);
  return `<div class="pr-v2-row" style="--mc:${valColor};--mc-bg:${muscleBg(muscleKey)}" onclick="showHistDetailForEx('${pr.exId}')">
    <div class="pr-v2-icon">${muscleIconSvg(muscleKey, 18)}</div>
    <div class="pr-v2-num">${num}</div>
    <div>
      <div class="pr-v2-name">${pr.name}</div>
      <div class="pr-v2-sub">${setsStr}${pr.prev ? ` • ${pr.prev} kg → ${pr.weight} kg` : ''}</div>
    </div>
    <div class="pr-v2-val" style="color:${valColor}">${pr.prev && pr.weight > pr.prev ? `+${(pr.weight-pr.prev).toFixed(1)} kg` : `${pr.weight} kg`}</div>
    <span class="pr-v2-arrow">›</span>
  </div>`;
}

function showHistDetailForEx(exId) {
  // Find most recent workout containing this exercise
  const ws = DB.getWorkouts();
  const idx = ws.findIndex(w => w.exercises.some(e => (e.exId||e.id) === exId));
  if (idx >= 0) showHistDetail(idx);
}

function showHistDetail(i) {
  const ws = DB.getWorkouts();
  const w = ws[i];
  if (!w) return;
  const plan = DB.getPlan();
  const day = plan.find(d => d.id === w.planDayId);
  document.getElementById('hist-detail-title').textContent =
    `${day ? day.name : (w.planDayName||'Freestyle')} — ${fmtDate(w.startTs)}`;
  document.getElementById('hist-detail-body').innerHTML =
    `<p style="color:var(--text3);font-size:13px;margin-bottom:14px">Dauer: ${fmtDur(w.duration)} • ${w.exercises.length} Übungen</p>` +
    w.exercises.map(ex => {
      const setsStr = ex.sets.map((s,i) => `<div class="hist-set-row"><span>Satz ${i+1}:</span><span>${s.weight||'–'} kg × ${s.reps||'–'} Wdh.</span></div>`).join('');
      return `<div class="hist-ex-block"><div class="hist-ex-title">${ex.name}</div>${setsStr}${ex.notes?`<div style="font-size:12px;color:var(--text3);margin-top:4px">📝 ${ex.notes}</div>`:''}</div>`;
    }).join('') +
    `<button class="btn btn-danger btn-full" style="margin-top:18px" onclick="deleteSession(${i})">🗑 Session löschen</button>`;
  openModal('modal-hist-detail');
}

function deleteSession(i) {
  const ws = DB.getWorkouts();
  const w = ws[i];
  if (!w) return;
  const plan = DB.getPlan();
  const day = plan.find(d => d.id === w.planDayId);
  const dayName = day ? day.name : (w.planDayName || 'Freestyle');
  const dateStr = fmtDate(w.startTs);
  // Erst hist-detail-Modal schließen, dann confirmAction öffnen (z-index/DOM-Order-Schutz)
  closeModal('modal-hist-detail');
  setTimeout(() => {
    confirmAction(
      'Session löschen?',
      `${dayName} vom ${dateStr} wirklich löschen? Volumen und PRs werden neu berechnet.`,
      () => {
        const ws2 = DB.getWorkouts();
        ws2.splice(i, 1);
        DB.saveWorkouts(ws2); // löst markLocalChange → Drive-Sync aus
        showToast('Session gelöscht');
        // Aktuellen Screen neu rendern, damit Stats/Charts/Listen aktualisiert werden
        if (currentScreen === 'history') renderHistory();
        else if (currentScreen === 'overview') renderOverview();
      },
      { danger: true, confirmLabel: 'Löschen' }
    );
  }, 80);
}

// ═══════════════════════════════════════════════
// SCREEN: MEHR
// ═══════════════════════════════════════════════

let editingDayIdx = null;
let mehrInactivePlanExpanded = false; // Toggle für die kollabierbare "Andere Trainingstage"-Sektion

function toggleMehrInactivePlans() {
  mehrInactivePlanExpanded = !mehrInactivePlanExpanded;
  renderMehr();
}

function renderMehr() {
  const plan = DB.getPlan();
  // Map: planDayId → [Wochentag-Labels, in Reihenfolge Mo-So]
  // Wird genutzt, um aktive Trainingstage visuell hervorzuheben
  const weekPlan = DB.getWeekPlan();
  const dayLabelsFor = {};
  weekPlan.forEach(w => {
    if (w.planDayId) {
      if (!dayLabelsFor[w.planDayId]) dayLabelsFor[w.planDayId] = [];
      dayLabelsFor[w.planDayId].push(w.label);
    }
  });

  // Eine einzelne Trainingstag-Zeile rendern (Index bleibt erhalten für openPlanDayModal/deletePlanDay)
  const renderRow = (d, i, isActive) => {
    const setCount = d.exercises.reduce((a,e) => a+e.targetSets, 0);
    const usedOn = dayLabelsFor[d.id] || [];
    const chips = usedOn.length
      ? `<div class="pdr-days">${usedOn.map(lbl => `<span class="pdr-day-chip">${lbl}</span>`).join('')}</div>`
      : '';
    return `<div class="plan-day-row${isActive ? ' active' : ''}">
      <div class="pdr-info" onclick="openPlanDayModal(${i})" style="cursor:pointer">
        <div class="pdr-name">${pd(d.name)}</div>
        <div class="pdr-sub">${d.exercises.length} Übungen • ${setCount} Sätze</div>
      </div>
      ${chips}
      <div class="plan-day-actions">
        <button onclick="event.stopPropagation();openPlanDayModal(${i})" title="Bearbeiten">✎</button>
        <button class="del" onclick="event.stopPropagation();deletePlanDay(${i})" title="Löschen">✕</button>
      </div>
    </div>`;
  };

  // In aktive (Wochenplan-zugewiesen) vs inaktive Tage aufteilen — Original-Index für Edit/Delete erhalten
  const activeRows = [], inactiveRows = [];
  plan.forEach((d, i) => {
    if (dayLabelsFor[d.id]) activeRows.push(renderRow(d, i, true));
    else inactiveRows.push(renderRow(d, i, false));
  });

  // Render-Strategie:
  // - 0 aktive: Alle direkt anzeigen (keine Trennung sinnvoll)
  // - 0 inaktive: Nur aktive (kein kollabierbarer Header nötig)
  // - Beides vorhanden: Aktive oben + kollabierbarer "Andere Trainingstage (N)"-Header
  let html;
  if (activeRows.length === 0) {
    html = inactiveRows.length
      ? inactiveRows.join('')
      : '<div class="plan-day-empty">Noch keine Trainingstage erstellt</div>';
  } else if (inactiveRows.length === 0) {
    html = activeRows.join('');
  } else {
    const expanded = mehrInactivePlanExpanded;
    html = activeRows.join('') +
      `<div class="plan-day-collapse-header${expanded ? ' expanded' : ''}" onclick="toggleMehrInactivePlans()">
         <span class="plan-day-collapse-arrow">${expanded ? '▾' : '▸'}</span>
         <span class="plan-day-collapse-label">Andere Trainingstage</span>
         <span class="plan-day-collapse-count">${inactiveRows.length}</span>
       </div>` +
      (expanded ? inactiveRows.join('') : '');
  }
  document.getElementById('mehr-plan-list').innerHTML = html;

  // Program form
  const p = DB.getProgram();
  document.getElementById('prog-name').value = p.name || '';
  document.getElementById('prog-weeks').value = p.weeksTotal || 12;
  document.getElementById('prog-start').value = _msToDate(p.startDate);
  document.getElementById('prog-end').value   = _msToDate(p.endDate);

  // Weekplan
  const wp = DB.getWeekPlan();
  const today = new Date(); const todayIdx = (today.getDay()+6)%7;
  document.getElementById('mehr-weekplan').innerHTML = wp.map((d, i) => {
    const selected = d.planDayId || '';
    const options = `<option value="" ${selected===''?'selected':''}>Ruhetag</option>` +
      plan.map(p => `<option value="${p.id}" ${selected===p.id?'selected':''}>${p.name}</option>`).join('');
    return `<div class="weekplan-row">
      <span class="weekplan-day-name ${i===todayIdx?'today':''}">${d.label}</span>
      <select class="weekplan-select" onchange="saveWeekPlanDay(${i},this.value)">${options}</select>
    </div>`;
  }).join('');

  // Drive-Sync-Status refreshen (Card ist statisch in index.html, Inhalt dynamisch)
  if (typeof renderDriveStatus === 'function') renderDriveStatus();
}

function saveProgramForm() {
  const p = DB.getProgram();
  p.name = document.getElementById('prog-name').value.trim() || 'Mein Trainingsplan';
  DB.saveProgram(p);
}

// User changed Gesamtdauer → recompute Enddatum
function onWeeksChange() {
  const p = DB.getProgram();
  const weeks = Math.max(1, parseInt(document.getElementById('prog-weeks').value) || 1);
  p.weeksTotal = weeks;
  if (!p.startDate) p.startDate = Date.now();
  p.endDate = p.startDate + weeks * 7*24*3600*1000;
  DB.saveProgram(p);
  document.getElementById('prog-end').value = _msToDate(p.endDate);
  showToast('Trainingsplan aktualisiert');
}

// User changed Startdatum → keep weeks fixed, recompute Enddatum
function onStartDateChange() {
  const p = DB.getProgram();
  const start = _dateToMs(document.getElementById('prog-start').value);
  if (!start) return;
  p.startDate = start;
  p.endDate = start + (p.weeksTotal||12) * 7*24*3600*1000;
  DB.saveProgram(p);
  document.getElementById('prog-end').value = _msToDate(p.endDate);
  showToast('Trainingsplan aktualisiert');
}

// User changed Enddatum → recompute Gesamtdauer
function onEndDateChange() {
  const p = DB.getProgram();
  const end = _dateToMs(document.getElementById('prog-end').value);
  if (!end) return;
  if (!p.startDate) p.startDate = Date.now();
  if (end <= p.startDate) { showToast('Enddatum muss nach Startdatum sein'); document.getElementById('prog-end').value = _msToDate(p.endDate); return; }
  p.endDate = end;
  p.weeksTotal = _weeksBetween(p.startDate, end);
  DB.saveProgram(p);
  document.getElementById('prog-weeks').value = p.weeksTotal;
  showToast('Trainingsplan aktualisiert');
}

function saveWeekPlanDay(i, value) {
  const wp = DB.getWeekPlan();
  if (!wp[i]) return;
  wp[i].planDayId = value || null;
  DB.saveWeekPlan(wp);
  renderMehr();
}

function openPlanDayModal(idx) {
  editingDayIdx = idx;
  const plan = DB.getPlan();
  const day = plan[idx];
  document.getElementById('plan-day-modal-title').innerHTML = `${pd(day.name)} bearbeiten`;
  document.getElementById('plan-day-name-input').value = day.name;
  renderPlanDayExList(day);
  openModal('modal-plan-day');
}

// Generischer Confirm-Helper (ersetzt confirm(), das in PWA-Mode oft blockiert wird).
let _confirmActionCb = null;
let _confirmActionCancelCb = null;
function confirmAction(title, message, onConfirm, opts) {
  opts = opts || {};
  _confirmActionCb = onConfirm || null;
  _confirmActionCancelCb = opts.onCancel || null;
  document.getElementById('confirm-action-title').textContent = title;
  document.getElementById('confirm-action-msg').textContent = message;
  const btn = document.getElementById('confirm-action-yes');
  btn.textContent = opts.confirmLabel || 'Bestätigen';
  btn.className = `btn btn-full ${opts.danger ? 'btn-danger' : 'btn-primary'}`;
  openModal('modal-confirm-action');
}
function confirmActionYes() {
  const cb = _confirmActionCb;
  _confirmActionCb = null;
  _confirmActionCancelCb = null;
  closeModal('modal-confirm-action');
  if (cb) cb();
}
function confirmActionNo() {
  const cb = _confirmActionCancelCb;
  _confirmActionCb = null;
  _confirmActionCancelCb = null;
  closeModal('modal-confirm-action');
  if (cb) cb();
}

// Generischer Name-Input-Helper (ersetzt prompt(), das in PWA-Mode oft blockiert wird).
let _nameInputCallback = null;
let _nameInputCancelCb = null;
function promptForName(title, defaultValue, onConfirm, onCancel) {
  _nameInputCallback = onConfirm || null;
  _nameInputCancelCb = onCancel || null;
  document.getElementById('name-input-title').textContent = title;
  const field = document.getElementById('name-input-field');
  field.value = defaultValue || '';
  openModal('modal-name-input');
  setTimeout(() => { field.focus(); field.select(); }, 120);
  // Enter-Taste = bestätigen
  field.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmNameInput(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancelNameInput(); }
  };
}
function confirmNameInput() {
  const val = (document.getElementById('name-input-field').value || '').trim();
  const cb = _nameInputCallback;
  _nameInputCallback = null;
  _nameInputCancelCb = null;
  closeModal('modal-name-input');
  if (val && cb) cb(val);
}
function cancelNameInput() {
  const cb = _nameInputCancelCb;
  _nameInputCallback = null;
  _nameInputCancelCb = null;
  closeModal('modal-name-input');
  if (cb) cb();
}

function addNewPlanDay() {
  promptForName('Name des neuen Trainingstags', 'Neuer Tag', (name) => {
    const plan = DB.getPlan();
    const id = 'day_' + Date.now();
    plan.push({ id, name, color: null, exercises: [] });
    DB.savePlan(plan);
    renderMehr();
    showToast(`${pd(name)} hinzugefügt`);
    openPlanDayModal(plan.length - 1);
  });
}

// ═══════════════════════════════════════════════
// SCREEN: ÜBUNGEN (Catalog)
// ═══════════════════════════════════════════════
let openExerciseId = null;   // currently expanded exercise in catalog
let exSortMode = 'muscle';   // 'muscle' | 'plan'

function getPlanDaysUsingExercise(exId) {
  return DB.getPlan().filter(d => d.exercises.some(e => e.exId === exId));
}

function toggleExSortMode() {
  exSortMode = exSortMode === 'muscle' ? 'plan' : 'muscle';
  const btn = document.getElementById('ex-sort-btn');
  if (btn) btn.dataset.mode = exSortMode;
  renderExercises();
}

function buildExItemHTML(ex, context) {
  const meta = MUSCLE_META[ex.muscle] || MUSCLE_META.chest;
  // In by-plan view, an exercise may appear in multiple days — use a composite key
  // (dayId + exId) so only the tapped instance expands.
  const uniqueKey = (context && context.dayId) ? `${context.dayId}__${ex.id}` : ex.id;
  const isOpen = uniqueKey === openExerciseId;
  const noteIndicator = ''; // "Notiz"-Tag entfernt — Notiz ist im aufgeklappten Body sichtbar
  const usingDays = getPlanDaysUsingExercise(ex.id);
  const planTag = usingDays.length
    ? '<span class="ex-item-plan-tag">Im Plan</span>' : '';
  const usingBlock = usingDays.length
    ? `<div class="ex-item-using">
         <div class="ex-item-using-label">Verwendet in:</div>
         <div class="ex-item-using-list">
           ${usingDays.map(d => `<span class="ex-item-day-chip">${pd(d.name)}</span>`).join('')}
         </div>
       </div>`
    : `<div class="ex-item-using">
         <div class="ex-item-using-empty">Wird aktuell in keinem Trainingstag verwendet.</div>
       </div>`;

  // Stats
  const pr = getExercisePR(ex.id);
  const last = getLastExData(ex.id);
  const prVal = pr != null
    ? `<div class="ex-stat-val">${pr} kg</div>`
    : `<div class="ex-stat-val muted">Noch keine</div>`;
  let lastVal;
  if (last) {
    const dateStr = new Date(last.date).toLocaleDateString('de-DE',
      { day:'numeric', month:'long', year:'2-digit' });
    const fmt = formatLastSets(last.sets) || '–';
    lastVal = `<div class="ex-stat-val">${fmt}<span class="date">· ${dateStr}</span></div>`;
  } else {
    lastVal = `<div class="ex-stat-val muted">Noch keine</div>`;
  }
  const statsBlock = `<div class="ex-item-stats">
    <div class="ex-stat ex-stat-pr">
      <div class="ex-stat-key">PR</div>
      ${prVal}
    </div>
    <div class="ex-stat ex-stat-last">
      <div class="ex-stat-key">Letzte Ausführung</div>
      ${lastVal}
    </div>
  </div>`;

  return `<div class="ex-item ${isOpen?'open':''}" id="ex-item-${uniqueKey}" style="--mc:${meta.color}">
    <div class="ex-item-head" onclick="toggleExItem('${uniqueKey}')">
      <div class="ex-item-stripe"></div>
      <div class="ex-item-name">${ex.name}</div>
      ${noteIndicator}
      ${planTag}
      <span class="ex-item-chev">▾</span>
    </div>
    <div class="ex-item-body">
      ${statsBlock}
      <div class="ex-item-body-label">Notizen</div>
      <textarea class="ex-notes-area" placeholder="z. B. Form-Tipps, Hinweise, Bemerkungen…"
                onchange="saveExerciseNote('${ex.id}', this.value)">${ex.notes||''}</textarea>
      ${usingBlock}
      <div class="ex-item-actions">
        <button class="primary" onclick="openAddExerciseToPlanDay('${ex.id}')">+ Zu Trainingstag</button>
        <button onclick="editExerciseFromCatalog('${ex.id}')">✎ Bearbeiten</button>
        <button class="danger" onclick="deleteExerciseFromCatalog('${ex.id}')" title="Löschen">✕ Löschen</button>
      </div>
    </div>
  </div>`;
}

function renderExercises() {
  const btn = document.getElementById('ex-sort-btn');
  if (btn) btn.dataset.mode = exSortMode;
  const subEl = document.getElementById('ex-subline');
  if (subEl) {
    subEl.textContent = exSortMode === 'plan'
      ? 'Übungskatalog sortiert nach Trainingstagen'
      : 'Übungskatalog sortiert nach Muskelgruppen';
  }
  if (exSortMode === 'plan') {
    renderExercisesByPlan();
  } else {
    renderExercisesByMuscle();
  }
}

function renderExercisesByPlan() {
  const plan = DB.getPlan();
  const exMap = {};
  DB.getExercises().forEach(e => exMap[e.id] = e);

  const groupsHTML = plan.map(day => {
    // Plan-Reihenfolge beibehalten; Übungen die im Plan stehen aber nicht mehr existieren überspringen
    const items = day.exercises.map(pe => exMap[pe.exId]).filter(Boolean);
    if (!items.length) return '';
    const itemsHTML = items.map(ex => buildExItemHTML(ex, { dayId: day.id })).join('');
    return `<div class="ex-group">
      <div class="ex-group-title">
        <span class="dot" style="background:rgba(255,255,255,0.7)"></span>
        ${pd(day.name)}
        <span class="count">(${items.length})</span>
      </div>
      <div class="ex-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  document.getElementById('exercises-groups').innerHTML = groupsHTML ||
    '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Noch keine Trainingstage mit Übungen vorhanden.</p>';
}

function renderExercisesByMuscle() {
  const exs = DB.getExercises();
  const byMuscle = {};
  MUSCLE_ORDER.forEach(m => byMuscle[m] = []);
  exs.forEach(e => { if (byMuscle[e.muscle]) byMuscle[e.muscle].push(e); });

  const groupsHTML = MUSCLE_ORDER.map(m => {
    const meta = MUSCLE_META[m];
    const items = byMuscle[m].sort((a,b) => a.name.localeCompare(b.name, 'de'));
    if (!items.length) return '';
    const itemsHTML = items.map(ex => buildExItemHTML(ex)).join('');
    return `<div class="ex-group" style="--mc:${meta.color}">
      <div class="ex-group-title">
        <span class="dot"></span>
        ${meta.name}
        <span class="count">(${items.length})</span>
      </div>
      <div class="ex-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  document.getElementById('exercises-groups').innerHTML = groupsHTML ||
    '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Keine Übungen vorhanden. Füge eine neue Übung hinzu.</p>';
}

function toggleExItem(id) {
  openExerciseId = (openExerciseId === id) ? null : id;
  renderExercises();
}

function saveExerciseNote(id, value) {
  const exs = DB.getExercises();
  const ex = exs.find(e => e.id === id);
  if (!ex) return;
  ex.notes = value;
  DB.saveExercises(exs);
  // If we're currently viewing an active workout, refresh notes textarea(s) for this exercise
  if (DB.getActive()) {
    document.querySelectorAll(`.aex-v2-notes-area[data-ex-id="${id}"]`).forEach(t => {
      if (document.activeElement !== t) t.value = value;
    });
  }
}

function editExerciseFromCatalog(id) {
  newExContext = 'edit-from-catalog';
  editingExerciseId = id;
  const ex = DB.getExercises().find(e => e.id === id);
  if (!ex) return;
  document.getElementById('new-ex-name').value = ex.name;
  document.getElementById('new-ex-muscle').value = ex.muscle;
  document.querySelector('#modal-new-ex .sheet-title').textContent = 'Übung bearbeiten';
  openModal('modal-new-ex');
}

function deleteExerciseFromCatalog(id) {
  const ex = DB.getExercises().find(e => e.id === id);
  if (!ex) return;
  const plan = DB.getPlan();
  const usedInPlan = plan.some(d => d.exercises.some(e => e.exId === id));
  const msg = usedInPlan
    ? `„${ex.name}" wird in mindestens einem Trainingstag verwendet. Trotzdem löschen? Die Übung wird automatisch aus dem Plan entfernt.`
    : `„${ex.name}" wirklich löschen?`;
  confirmAction('Übung löschen?', msg, () => {
    if (usedInPlan) {
      const p = DB.getPlan();
      p.forEach(d => { d.exercises = d.exercises.filter(e => e.exId !== id); });
      DB.savePlan(p);
    }
    const exs = DB.getExercises().filter(e => e.id !== id);
    DB.saveExercises(exs);
    if (openExerciseId === id) openExerciseId = null;
    renderExercises();
    showToast('Übung gelöscht');
  }, { danger: true, confirmLabel: 'Löschen' });
}

// "Zum Plan hinzufügen" aus dem Übungen-Tab
let exerciseToAddId = null;

function openAddExerciseToPlanDay(exId) {
  exerciseToAddId = exId;
  const ex = DB.getExercises().find(e => e.id === exId);
  document.getElementById('modal-ex-to-day-title').textContent =
    ex ? `„${ex.name}" zu welchem Trainingstag?` : 'Zu welchem Trainingstag hinzufügen?';
  renderExToDayList();
  openModal('modal-ex-to-day');
}

function renderExToDayList() {
  const plan = DB.getPlan();
  const html = plan.map((d, i) => {
    const setCount = d.exercises.reduce((a,e)=>a+e.targetSets, 0);
    const alreadyIn = d.exercises.some(e => e.exId === exerciseToAddId);
    const cls = `day-pick-row${alreadyIn ? ' in-day' : ' not-in-day'}`;
    const onclickAttr = alreadyIn ? '' : `onclick="addExerciseToPlanDay(${i})"`;
    const subExtra = alreadyIn ? ' · Bereits enthalten' : '';
    const actions = alreadyIn
      ? `<span class="day-pick-icon done">✓</span>
         <button class="day-pick-remove" onclick="event.stopPropagation();removeExerciseFromPlanDay(${i})" aria-label="Entfernen">−</button>`
      : `<span class="day-pick-icon">+</span>`;
    return `<div class="${cls}" ${onclickAttr}>
      <div class="day-pick-info">
        <div class="day-pick-name">${pd(d.name)}</div>
        <div class="day-pick-sub">${d.exercises.length} Übungen · ${setCount} Sätze${subExtra}</div>
      </div>
      <div class="day-pick-actions">${actions}</div>
    </div>`;
  }).join('');
  document.getElementById('ex-to-day-list').innerHTML = html ||
    '<p style="color:var(--text3);text-align:center;padding:20px">Noch keine Trainingstage. Lege zuerst einen unter „Mehr" an.</p>';
}

function removeExerciseFromPlanDay(dayIdx) {
  if (!exerciseToAddId) return;
  const plan = DB.getPlan();
  if (!plan[dayIdx]) return;
  const before = plan[dayIdx].exercises.length;
  plan[dayIdx].exercises = plan[dayIdx].exercises.filter(e => e.exId !== exerciseToAddId);
  if (plan[dayIdx].exercises.length === before) return;
  DB.savePlan(plan);
  const ex = DB.getExercises().find(e => e.id === exerciseToAddId);
  showToast(`„${ex?.name||'Übung'}" aus ${pd(plan[dayIdx].name)} entfernt`);
  renderExToDayList();       // Modal-Liste neu zeichnen
  renderExercises();         // Übungen-Tab im Hintergrund aktualisieren
}

function addExerciseToPlanDay(dayIdx) {
  if (!exerciseToAddId) return;
  const plan = DB.getPlan();
  if (!plan[dayIdx]) return;
  plan[dayIdx].exercises.push({ exId: exerciseToAddId, targetSets: 3, targetReps: 8 });
  DB.savePlan(plan);
  const ex = DB.getExercises().find(e => e.id === exerciseToAddId);
  const dayName = plan[dayIdx].name;
  closeModal('modal-ex-to-day');
  exerciseToAddId = null;
  showToast(`„${ex?.name||'Übung'}" zu ${pd(dayName)} hinzugefügt`);
  renderExercises(); // refresh "Im Plan"-Tag & "Verwendet in"-Liste
}

function createNewPlanDayAndAddEx() {
  const exId = exerciseToAddId;
  if (!exId) return;
  // Erst Day-Picker schließen, dann Name-Input öffnen
  closeModal('modal-ex-to-day');
  setTimeout(() => {
    promptForName('Name des neuen Trainingstags', 'Neuer Tag',
      (name) => {
        const plan = DB.getPlan();
        const id = 'day_' + Date.now();
        plan.push({ id, name, color: null, exercises: [{ exId, targetSets: 3, targetReps: 8 }] });
        DB.savePlan(plan);
        const ex = DB.getExercises().find(e => e.id === exId);
        showToast(`„${ex?.name||'Übung'}" zu ${pd(name)} hinzugefügt`);
        exerciseToAddId = null;
        renderExercises();
      },
      () => { exerciseToAddId = null; }
    );
  }, 100);
}

function deletePlanDay(idx) {
  const plan = DB.getPlan();
  const day = plan[idx];
  if (!day) return;
  confirmAction('Trainingstag löschen?',
    `„${day.name}" wirklich löschen? Er wird auch aus dem Wochenplan entfernt.`,
    () => {
      const p = DB.getPlan();
      const removedId = day.id;
      p.splice(idx, 1);
      DB.savePlan(p);
      const wp = DB.getWeekPlan();
      let wpChanged = false;
      wp.forEach(d => { if (d.planDayId === removedId) { d.planDayId = null; wpChanged = true; } });
      if (wpChanged) DB.saveWeekPlan(wp);
      renderMehr();
      showToast('Trainingstag gelöscht');
    },
    { danger: true, confirmLabel: 'Löschen' }
  );
}

function renderPlanDayExList(day) {
  const html = day.exercises.map((pe, i) => {
    const ex = getEx(pe.exId);
    if (!ex) return '';
    return `<div class="plan-ex-row" data-idx="${i}"
                 ondragstart="planExDragStart(event,${i})"
                 ondragend="planExDragEnd(event)"
                 ondragover="planExDragOver(event,${i})"
                 ondragleave="planExDragLeave(event)"
                 ondrop="planExDrop(event,${i})">
      <span class="plan-ex-handle" draggable="true"
            onpointerdown="event.currentTarget.parentElement.draggable=true"
            onpointerup="event.currentTarget.parentElement.draggable=false">≡</span>
      <span class="plan-ex-name">${ex.name}</span>
      <div class="target-row">
        <input class="target-input" type="number" inputmode="numeric" value="${pe.targetSets}"
               min="1" max="10" onchange="updatePlanTarget(${i},'targetSets',this.value)">
        <span class="target-x">×</span>
        <input class="target-input" type="number" inputmode="numeric" value="${pe.targetReps}"
               min="1" max="50" onchange="updatePlanTarget(${i},'targetReps',this.value)">
      </div>
      <button class="plan-ex-del" onclick="removePlanEx(${i})">✕</button>
    </div>`;
  }).join('');
  document.getElementById('plan-day-ex-list').innerHTML = html ||
    '<p style="color:var(--text3);font-size:14px;padding:8px 0">Noch keine Übungen</p>';
}

// Drag-and-Drop für Plan-Day-Exercise-Reihenfolge
let planExDraggedIdx = null;
function planExDragStart(e, idx) {
  planExDraggedIdx = idx;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch(_){}
  }
  e.currentTarget.classList.add('dragging');
}
function planExDragOver(e, idx) {
  e.preventDefault();
  if (planExDraggedIdx === null || planExDraggedIdx === idx) return;
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  const row = e.currentTarget;
  const r = row.getBoundingClientRect();
  const isAbove = (e.clientY - r.top) < r.height / 2;
  row.classList.toggle('drop-target-above', isAbove);
  row.classList.toggle('drop-target-below', !isAbove);
}
function planExDragLeave(e) {
  e.currentTarget.classList.remove('drop-target-above','drop-target-below');
}
function planExDrop(e, targetIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drop-target-above','drop-target-below');
  if (planExDraggedIdx === null || planExDraggedIdx === targetIdx) return;
  const plan = DB.getPlan();
  if (!plan[editingDayIdx]) return;
  const exs = plan[editingDayIdx].exercises;
  const r = e.currentTarget.getBoundingClientRect();
  const dropAfter = (e.clientY - r.top) >= r.height / 2;
  const [moved] = exs.splice(planExDraggedIdx, 1);
  let insertIdx = dropAfter ? targetIdx + 1 : targetIdx;
  if (planExDraggedIdx < targetIdx) insertIdx -= 1;
  if (insertIdx < 0) insertIdx = 0;
  if (insertIdx > exs.length) insertIdx = exs.length;
  exs.splice(insertIdx, 0, moved);
  DB.savePlan(plan);
  planExDraggedIdx = null;
  renderPlanDayExList(plan[editingDayIdx]);
}
function planExDragEnd(e) {
  e.currentTarget.classList.remove('dragging','drop-target-above','drop-target-below');
  document.querySelectorAll('.plan-ex-row').forEach(r =>
    r.classList.remove('drop-target-above','drop-target-below')
  );
  planExDraggedIdx = null;
}

function updatePlanTarget(exIdx, field, value) {
  const plan = DB.getPlan();
  plan[editingDayIdx].exercises[exIdx][field] = parseInt(value) || 1;
  DB.savePlan(plan);
}

function removePlanEx(exIdx) {
  const plan = DB.getPlan();
  plan[editingDayIdx].exercises.splice(exIdx, 1);
  DB.savePlan(plan);
  renderPlanDayExList(plan[editingDayIdx]);
}

function savePlanDay() {
  const plan = DB.getPlan();
  plan[editingDayIdx].name = document.getElementById('plan-day-name-input').value.trim() || plan[editingDayIdx].name;
  DB.savePlan(plan);
  closeModal('modal-plan-day');
  renderMehr();
  showToast('Plan gespeichert');
}

let planAddSelection = new Set();

function openAddToPlanModal() {
  document.getElementById('plan-add-search').value = '';
  planAddSelection.clear();
  renderPlanAddList('');
  updatePlanAddSubmitBtn();
  openModal('modal-add-to-plan');
}

function filterPlanAdd() { renderPlanAddList(document.getElementById('plan-add-search').value); }

function togglePlanAddSelection(exId) {
  if (planAddSelection.has(exId)) planAddSelection.delete(exId);
  else planAddSelection.add(exId);
  renderPlanAddList(document.getElementById('plan-add-search').value);
  updatePlanAddSubmitBtn();
}

function updatePlanAddSubmitBtn() {
  const btn = document.getElementById('plan-add-confirm');
  if (!btn) return;
  const n = planAddSelection.size;
  btn.disabled = n === 0;
  btn.textContent = n === 0 ? 'Hinzufügen' : `${n} Übung${n>1?'en':''} hinzufügen`;
}

function exitPlanAddModal() {
  planAddSelection.clear();
  closeModal('modal-add-to-plan');
}

function confirmPlanAddSelection() {
  if (planAddSelection.size === 0) return;
  const plan = DB.getPlan();
  if (!plan[editingDayIdx]) return;
  let added = 0;
  planAddSelection.forEach(exId => {
    plan[editingDayIdx].exercises.push({ exId, targetSets: 3, targetReps: 8 });
    added++;
  });
  DB.savePlan(plan);
  planAddSelection.clear();
  closeModal('modal-add-to-plan');
  renderPlanDayExList(plan[editingDayIdx]);
  showToast(`${added} Übung${added>1?'en':''} hinzugefügt`);
}

function renderPlanAddList(q) {
  const exs = DB.getExercises();
  const plan = DB.getPlan();
  const existing = new Set((plan[editingDayIdx]?.exercises || []).map(e => e.exId));
  const query = (q || '').toLowerCase();

  const byMuscle = {};
  MUSCLE_ORDER.forEach(m => byMuscle[m] = []);
  exs.forEach(e => {
    if (query && !e.name.toLowerCase().includes(query)) return;
    if (byMuscle[e.muscle]) byMuscle[e.muscle].push(e);
  });

  const groupsHTML = MUSCLE_ORDER.map(m => {
    const meta = MUSCLE_META[m];
    const items = byMuscle[m].sort((a,b) => a.name.localeCompare(b.name, 'de'));
    if (!items.length) return '';
    const itemsHTML = items.map(ex => {
      const usingDays = getPlanDaysUsingExercise(ex.id);
      const planTag = usingDays.length
        ? '<span class="ex-item-plan-tag">Im Plan</span>'
        : '';
      const inCurrent = existing.has(ex.id);
      const selected = planAddSelection.has(ex.id);
      const cls = `ex-item${inCurrent ? ' in-current-day' : ''}`;
      const checkCls = inCurrent ? 'in-day' : (selected ? 'checked' : '');
      const onclickAttr = inCurrent ? '' : `onclick="togglePlanAddSelection('${ex.id}')"`;
      return `<div class="${cls}" style="--mc:${meta.color}" ${onclickAttr}>
        <div class="ex-item-head">
          <div class="ex-item-stripe"></div>
          <div class="ex-item-name">${ex.name}</div>
          ${planTag}
          <span class="plan-add-check ${checkCls}">✓</span>
        </div>
      </div>`;
    }).join('');
    return `<div class="ex-group" style="--mc:${meta.color}">
      <div class="ex-group-title">
        <span class="dot"></span>
        ${meta.name}
        <span class="count">(${items.length})</span>
      </div>
      <div class="ex-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  document.getElementById('plan-add-list').innerHTML = groupsHTML ||
    '<p style="color:var(--text3);text-align:center;padding:20px">Keine Übung gefunden</p>';
}

function addToPlanDay(exId) {
  const plan = DB.getPlan();
  plan[editingDayIdx].exercises.push({ exId, targetSets:3, targetReps:8 });
  DB.savePlan(plan);
  closeModal('modal-add-to-plan');
  renderPlanDayExList(plan[editingDayIdx]);
  const ex = getEx(exId);
  if (ex) showToast(`${ex.name} hinzugefügt`);
}

let editingExerciseId = null;
let newExContext = 'plan'; // 'plan' | 'exercises' | 'edit-from-catalog'

function openNewExModal(context) {
  newExContext = context || 'plan';
  editingExerciseId = null;
  document.getElementById('new-ex-name').value = '';
  document.getElementById('new-ex-muscle').value = 'chest';
  document.querySelector('#modal-new-ex .sheet-title').textContent = 'Neue Übung erstellen';
  openModal('modal-new-ex');
}

function saveNewEx() {
  const name = document.getElementById('new-ex-name').value.trim();
  if (!name) { showToast('Bitte Namen eingeben'); return; }
  const muscle = document.getElementById('new-ex-muscle').value;
  const exs = DB.getExercises();
  const cat = muscle === 'legs' ? 'legs'
            : (muscle === 'back' || muscle === 'biceps') ? 'pull'
            : 'push';

  // Edit-mode (from exercises catalog)
  if (editingExerciseId) {
    const ex = exs.find(e => e.id === editingExerciseId);
    if (ex) {
      ex.name = name;
      ex.muscle = muscle;
      ex.category = cat;
      DB.saveExercises(exs);
    }
    editingExerciseId = null;
    closeModal('modal-new-ex');
    if (currentScreen === 'exercises') renderExercises();
    showToast('Übung aktualisiert');
    return;
  }

  // Create new
  const id = 'custom_' + Date.now();
  exs.push({ id, name, muscle, category: cat, isCustom: true, notes: '' });
  DB.saveExercises(exs);
  closeModal('modal-new-ex');

  if (newExContext === 'exercises' || currentScreen === 'exercises') {
    openExerciseId = id;
    renderExercises();
  } else {
    // Plan-Kontext: neue Übung gleich auto-selektieren und bestehende Auswahl beibehalten
    planAddSelection.add(id);
    document.getElementById('plan-add-search').value = '';
    renderPlanAddList('');
    updatePlanAddSubmitBtn();
    openModal('modal-add-to-plan');
  }
  showToast(`"${name}" erstellt`);
}

// ═══════════════════════════════════════════════
// DATA EXPORT / IMPORT
// ═══════════════════════════════════════════════

function exportData() {
  const data = { version:2, exportedAt:new Date().toISOString(), workouts:DB.getWorkouts(), plan:DB.getPlan(), exercises:DB.getExercises() };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `fittrack-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportiert ✓');
}

function importData(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.workouts || !data.plan || !data.exercises) { showToast('Ungültige Datei'); event.target.value=''; return; }
      const exportDate = data.exportedAt ? new Date(data.exportedAt).toLocaleDateString('de-DE') : 'unbekannt';
      confirmAction('Backup importieren?',
        `Backup vom ${exportDate} importieren? Alle aktuellen Daten werden überschrieben.`,
        () => {
          DB.saveWorkouts(data.workouts);
          DB.savePlan(data.plan);
          DB.saveExercises(data.exercises);
          showToast(`${data.workouts.length} Workouts importiert ✓`);
          renderMehr();
        },
        { danger: true, confirmLabel: 'Importieren' }
      );
      event.target.value = '';
    } catch { showToast('Fehler beim Lesen der Datei'); event.target.value=''; }
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════════
// TRAININGSPLAN-IMPORT (strukturiertes JSON)
// ═══════════════════════════════════════════════
// Format: { format: 'fittrack-plan-import', version: 1, program?: {...}, trainingDays: [...] }
// Erlaubt: Plan ersetzen oder anhängen, Programm-Daten optional übernehmen,
//          existierende Übungen werden by-name wiederverwendet (case-insensitive).

const VALID_MUSCLES = ['chest','back','shoulders','biceps','triceps','legs','core'];

let pendingPlanImport = null;

function importTrainingPlan(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    event.target.value = '';
    let data;
    try { data = JSON.parse(e.target.result); }
    catch { showToast('Datei ist kein gültiges JSON'); return; }
    if (data.format !== 'fittrack-plan-import') {
      showToast('Falsches Format — erwartet "fittrack-plan-import"');
      return;
    }
    if (!Array.isArray(data.trainingDays) || data.trainingDays.length === 0) {
      showToast('Import enthält keine Trainingstage');
      return;
    }
    // Quick-Validate jedes Trainings-Tag
    for (const day of data.trainingDays) {
      if (!day.name || typeof day.name !== 'string') {
        showToast('Trainingstag ohne Name gefunden — Import abgebrochen');
        return;
      }
      if (!Array.isArray(day.exercises)) {
        showToast(`Trainingstag "${day.name}" hat keine Übungs-Liste`);
        return;
      }
    }
    pendingPlanImport = data;
    // Summary aufbauen
    const dayCount = data.trainingDays.length;
    const totalEx = data.trainingDays.reduce((s, d) => s + d.exercises.length, 0);
    // Akzeptiert `trainingPlan` (UI-konsistent) und `program` (Legacy)
    const tp = data.trainingPlan || data.program;
    const progInfo = tp
      ? `<br><br>Enthält außerdem Trainingsplan-Daten ("${escapeHtml(tp.name || 'unbenannt')}", ${tp.weeksTotal || '?'} Wochen).`
      : '';
    document.getElementById('plan-import-summary').innerHTML =
      `<strong>${dayCount}</strong> Trainingstage mit insgesamt <strong>${totalEx}</strong> Übungen werden importiert.${progInfo}<br><br>Wie soll mit deinem bestehenden Plan verfahren werden?`;
    openModal('modal-plan-import');
  };
  reader.readAsText(file);
}

function cancelPlanImport() {
  closeModal('modal-plan-import');
  pendingPlanImport = null;
}

function confirmPlanImport(mode) {
  closeModal('modal-plan-import');
  if (!pendingPlanImport) return;
  const tp = pendingPlanImport.trainingPlan || pendingPlanImport.program;
  if (tp) {
    // Step 2: Trainingsplan-Daten übernehmen?
    setTimeout(() => {
      confirmAction(
        'Trainingsplan-Daten übernehmen?',
        `Möchtest du Name, Wochenanzahl und Startdatum aus dem Import übernehmen? Bei "Abbrechen" werden nur die Trainingstage importiert (dein aktueller Trainingsplan bleibt erhalten).`,
        () => applyPlanImport(mode, true),
        {
          confirmLabel: 'Trainingsplan übernehmen',
          onCancel: () => applyPlanImport(mode, false),
        }
      );
    }, 100);
  } else {
    applyPlanImport(mode, false);
  }
}

function applyPlanImport(mode, useProgramData) {
  const data = pendingPlanImport;
  pendingPlanImport = null;
  if (!data) return;

  const exs = DB.getExercises();
  const existingPlan = DB.getPlan();
  let newExCount = 0;
  let reusedExCount = 0;

  // Hilfsfunktion: existierende Übung by-name finden (case-insensitive)
  const findExByName = (name) => {
    const norm = name.trim().toLowerCase();
    return exs.find(e => e.name.trim().toLowerCase() === norm);
  };

  // ID-Generator mit Kollisionsschutz (Date.now() + Counter)
  let _idCounter = 0;
  const genId = (prefix) => `${prefix}_${Date.now()}_${_idCounter++}`;

  // Aus dem Import die neuen Trainingstage bauen
  const importedDays = data.trainingDays.map(day => {
    const exercises = (day.exercises || []).map(ie => {
      // Existierende Übung wiederverwenden oder neu anlegen
      let ex = findExByName(ie.name);
      if (ex) {
        reusedExCount++;
      } else {
        // Neue Übung
        const muscle = VALID_MUSCLES.includes(ie.muscle) ? ie.muscle : inferMuscleFromName(ie.name);
        const category = muscle === 'legs' ? 'legs'
                       : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                       : 'push';
        ex = {
          id: genId('custom'),
          name: ie.name.trim(),
          muscle,
          category,
          isCustom: true,
          notes: (typeof ie.notes === 'string' ? ie.notes : ''),
        };
        exs.push(ex);
        newExCount++;
      }
      const planEx = {
        exId: ex.id,
        targetSets: Number.isFinite(+ie.targetSets) ? +ie.targetSets : 3,
        targetReps: Number.isFinite(+ie.targetReps) ? +ie.targetReps : 8,
      };
      if (Number.isFinite(+ie.targetWeight) && +ie.targetWeight > 0) {
        planEx.targetWeight = +ie.targetWeight;
      }
      return planEx;
    });
    return {
      id: genId('day'),
      name: day.name.trim(),
      color: null,
      exercises,
    };
  });

  // Plan zusammenfügen
  const newPlan = mode === 'replace' ? importedDays : [...existingPlan, ...importedDays];

  // Speichern (DB.save* löst auto Drive-Sync aus)
  DB.saveExercises(exs);
  DB.savePlan(newPlan);

  // Beim "Ersetzen" können im Wochenplan jetzt verwaiste Trainingstag-IDs liegen
  // → automatisch auf Ruhetag zurücksetzen
  if (mode === 'replace') cleanupOrphanWeekplan();

  // Trainingsplan-Daten ggf. übernehmen (akzeptiert sowohl `trainingPlan` als auch Legacy `program`)
  const tp = data.trainingPlan || data.program;
  if (useProgramData && tp) {
    const prog = DB.getProgram();
    if (tp.name) prog.name = String(tp.name).trim();
    if (Number.isFinite(+tp.weeksTotal) && +tp.weeksTotal > 0) {
      prog.weeksTotal = +tp.weeksTotal;
    }
    if (tp.startDate) {
      const ms = _dateToMs(tp.startDate);
      if (ms) {
        prog.startDate = ms;
        prog.endDate = ms + (prog.weeksTotal || 12) * 7 * 24 * 3600 * 1000;
      }
    }
    DB.saveProgram(prog);
  }

  // UI-Refresh
  if (currentScreen === 'mehr') renderMehr();
  else if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'exercises') renderExercises();

  // Summary-Toast
  const parts = [
    `${importedDays.length} Trainingstage ${mode === 'replace' ? 'ersetzt' : 'angehängt'}`,
    newExCount ? `${newExCount} neue Übung${newExCount === 1 ? '' : 'en'} erstellt` : null,
    reusedExCount ? `${reusedExCount} existierende wiederverwendet` : null,
  ].filter(Boolean);
  showToast(parts.join(' • ') + ' ✓');
}

// ═══════════════════════════════════════════════
// MODAL HELPERS
// ═══════════════════════════════════════════════

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.getElementById(id).addEventListener('click', function h(e) {
    if (e.target === this) { closeModal(id); this.removeEventListener('click',h); }
  });
}
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════

let toastTmr;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastTmr);
  toastTmr = setTimeout(() => t.classList.remove('show'), 2500);
}
function pd(name) { return `<span class="pd-name">${name}</span>`; }

// ═══════════════════════════════════════════════
// GOOGLE DRIVE SYNC
// ═══════════════════════════════════════════════
// Speichert eine zentrale Backup-Datei `fittrack-backup.json` im Google-Drive-Hauptordner.
// Sync wird automatisch nach jeder lokalen Änderung (debounced 2s) sowie beim App-Start ausgelöst.
// Bei Konflikten (Cloud UND lokal verändert seit letztem Sync) erscheint ein Auswahl-Dialog.

const DRIVE_CLIENT_ID = '153846550864-8pb6bdh4tgg74kqndo5aim9hod3h0vpn.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FILE_NAME = 'fittrack-backup.json';
const DRIVE_DEBOUNCE_MS = 2000;
const DRIVE_DATA_VERSION = 1;
const DRIVE_LOG_MAX = 50;

// In-memory state
let driveTokenClient = null;       // GIS Token Client (lazy init)
let driveTokenExpiry = 0;          // ms-Timestamp when current token expires
let driveSyncTimer = null;         // debounce timer for auto-sync
let driveSyncInFlight = false;     // prevents parallel syncs
let driveConflictData = null;      // staging for unresolved conflict {local, cloud}
let driveGisReady = false;         // GIS script loaded?

// ─── Persistente Helper-Keys ─────────────────────────
function driveGetToken() {
  try { return sessionStorage.getItem('ft_drive_token') || null; } catch { return null; }
}
function driveSetToken(token, expiresInSec) {
  try {
    sessionStorage.setItem('ft_drive_token', token);
    driveTokenExpiry = Date.now() + (expiresInSec || 3600) * 1000 - 60000; // 1min Sicherheitspuffer
  } catch {}
}
function driveClearToken() {
  try { sessionStorage.removeItem('ft_drive_token'); } catch {}
  driveTokenExpiry = 0;
}
function driveIsEnabled() { return localStorage.getItem('ft_drive_enabled') === '1'; }
function driveSetEnabled(v) { localStorage.setItem('ft_drive_enabled', v ? '1' : '0'); }
function driveGetFileId() { return localStorage.getItem('ft_drive_file_id') || null; }
function driveSetFileId(id) {
  if (id) localStorage.setItem('ft_drive_file_id', id);
  else localStorage.removeItem('ft_drive_file_id');
}
function driveGetLastPushed() { return parseInt(localStorage.getItem('ft_drive_last_pushed') || '0', 10); }
function driveSetLastPushed(ts) { localStorage.setItem('ft_drive_last_pushed', String(ts)); }
function driveGetLastCloudEtag() { return localStorage.getItem('ft_drive_last_cloud_etag') || null; }
function driveSetLastCloudEtag(et) {
  if (et) localStorage.setItem('ft_drive_last_cloud_etag', et);
  else localStorage.removeItem('ft_drive_last_cloud_etag');
}
function driveGetLastLocalChange() { return parseInt(localStorage.getItem('ft_drive_last_local_change') || '0', 10); }

// ─── Log ─────────────────────────────────────────────
function driveLog(level, msg) {
  let log = [];
  try { log = JSON.parse(localStorage.getItem('ft_drive_log') || '[]'); } catch {}
  log.unshift({ t: Date.now(), level, msg });
  if (log.length > DRIVE_LOG_MAX) log = log.slice(0, DRIVE_LOG_MAX);
  try { localStorage.setItem('ft_drive_log', JSON.stringify(log)); } catch {}
  renderDriveLog();
}
function clearDriveLog() {
  localStorage.removeItem('ft_drive_log');
  renderDriveLog();
}

// ─── markLocalChange (hook aus DB.save*) ──────────────
function markLocalChange() {
  localStorage.setItem('ft_drive_last_local_change', String(Date.now()));
  if (driveIsEnabled()) driveTriggerSync('lokale Änderung');
}

// ─── Debounced trigger ───────────────────────────────
function driveTriggerSync(reason) {
  if (driveSyncTimer) clearTimeout(driveSyncTimer);
  driveSyncTimer = setTimeout(() => {
    driveSyncTimer = null;
    driveSync(reason).catch(err => driveLog('error', `Sync-Fehler: ${err.message || err}`));
  }, DRIVE_DEBOUNCE_MS);
}

// ─── GIS Initialisierung ─────────────────────────────
function driveEnsureGisReady() {
  return new Promise((resolve, reject) => {
    if (driveGisReady && driveTokenClient) return resolve();
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      // GIS-Script noch nicht geladen → warten (max 5s)
      let attempts = 0;
      const iv = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
          clearInterval(iv);
          _initTokenClient();
          resolve();
        } else if (attempts > 50) {
          clearInterval(iv);
          reject(new Error('Google Identity Services konnte nicht geladen werden (Netzwerkproblem oder CSP?)'));
        }
      }, 100);
    } else {
      _initTokenClient();
      resolve();
    }
  });
}
function _initTokenClient() {
  if (driveTokenClient) return;
  driveTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: DRIVE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: () => {}, // wird pro Request überschrieben
  });
  driveGisReady = true;
}

// ─── Token holen (interaktiv oder silent) ─────────────
function driveRequestToken({ interactive = true } = {}) {
  return new Promise((resolve, reject) => {
    if (!driveTokenClient) return reject(new Error('Token-Client nicht initialisiert'));
    driveTokenClient.callback = (resp) => {
      if (resp.error) return reject(new Error(`OAuth-Fehler: ${resp.error}${resp.error_description ? ' — ' + resp.error_description : ''}`));
      driveSetToken(resp.access_token, resp.expires_in);
      resolve(resp.access_token);
    };
    try {
      driveTokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
    } catch (err) { reject(err); }
  });
}

// Sicherstellen, dass wir einen gültigen Token haben (silent refresh wenn möglich)
async function driveGetValidToken() {
  const cached = driveGetToken();
  if (cached && Date.now() < driveTokenExpiry) return cached;
  await driveEnsureGisReady();
  return await driveRequestToken({ interactive: !cached }); // bei erstem Token wirklich interaktiv
}

// ─── Drive-API Wrapper ───────────────────────────────
// Mit Timeout (30s default, 60s für Uploads) via AbortController.
// Verhindert, dass hängende fetch()-Calls den Sync-State dauerhaft blockieren.
async function driveApi(path, opts = {}) {
  const token = await driveGetValidToken();
  const url = path.startsWith('http') ? path : `https://www.googleapis.com/drive/v3/${path}`;
  const headers = Object.assign({ Authorization: `Bearer ${token}` }, opts.headers || {});
  const timeoutMs = opts.timeout || (opts.method === 'PATCH' || opts.method === 'POST' ? 60000 : 30000);

  const doFetch = async (authHeader) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const fetchOpts = Object.assign({}, opts, {
        headers: Object.assign({}, headers, authHeader ? { Authorization: authHeader } : {}),
        signal: ctrl.signal,
      });
      return await fetch(url, fetchOpts);
    } catch (err) {
      if (err.name === 'AbortError') throw new Error(`Drive-Request Timeout nach ${timeoutMs/1000}s`);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };

  let resp = await doFetch();
  if (resp.status === 401) {
    // Token abgelaufen → einmal neu holen und wiederholen
    driveClearToken();
    const token2 = await driveGetValidToken();
    resp = await doFetch(`Bearer ${token2}`);
  }
  if (!resp.ok) throw new Error(`Drive ${resp.status}: ${await resp.text().catch(()=>resp.statusText)}`);
  return resp;
}

// Sucht die FitTrack-Backup-Datei im Drive
async function driveFindFile() {
  const q = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const resp = await driveApi(`files?q=${q}&fields=files(id,name,modifiedTime)&spaces=drive&pageSize=10`);
  const data = await resp.json();
  return (data.files && data.files[0]) || null;
}

// Datei-Inhalt + Metadaten laden
async function driveDownloadFile(id) {
  const meta = await driveApi(`files/${id}?fields=id,name,modifiedTime,size`).then(r => r.json());
  const content = await driveApi(`files/${id}?alt=media`).then(r => r.text());
  let parsed;
  try { parsed = JSON.parse(content); } catch { throw new Error('Cloud-Datei ist kein gültiges JSON'); }
  return { meta, data: parsed };
}

// Datei hochladen (PATCH oder neue Datei)
async function driveUploadFile(id, payload) {
  const body = JSON.stringify(payload);
  const metadata = { name: DRIVE_FILE_NAME, mimeType: 'application/json' };
  const boundary = '-------ft' + Math.random().toString(36).slice(2);
  const delim = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;
  const multipart =
    delim + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) +
    delim + 'Content-Type: application/json\r\n\r\n' + body +
    closeDelim;
  const url = id
    ? `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart&fields=id,modifiedTime`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime`;
  const resp = await driveApi(url, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: multipart,
  });
  return await resp.json();
}

// ─── Daten-Bundle (lokal → Cloud) ────────────────────
function collectLocalData() {
  return {
    version: DRIVE_DATA_VERSION,
    exportedAt: new Date().toISOString(),
    lastLocalChange: driveGetLastLocalChange(),
    exercises: DB.getExercises(),
    plan: DB.getPlan(),
    workouts: DB.getWorkouts(),
    program: DB.getProgram(),
    weekplan: DB.getWeekPlan(),
  };
}

// Validierung + Anwendung von Cloud-Daten
function driveApplyCloudData(data) {
  // Hartes Schema-Check
  if (!data || typeof data !== 'object') throw new Error('Cloud-Daten leer');
  if (!Array.isArray(data.exercises)) throw new Error('Cloud-Daten: exercises fehlt/ungültig');
  if (!Array.isArray(data.plan)) throw new Error('Cloud-Daten: plan fehlt/ungültig');
  if (!Array.isArray(data.workouts)) throw new Error('Cloud-Daten: workouts fehlt/ungültig');
  // Apply ohne markLocalChange-Trigger
  localStorage.setItem('ft_exercises', JSON.stringify(data.exercises));
  localStorage.setItem('ft_plan2', JSON.stringify(data.plan));
  localStorage.setItem('ft_workouts', JSON.stringify(data.workouts));
  if (data.program) localStorage.setItem('ft_program', JSON.stringify(data.program));
  if (data.weekplan) localStorage.setItem('ft_weekplan', JSON.stringify(data.weekplan));
  // Wichtig: lokale Änderungs-Marke auf 0 zurücksetzen — sonst denkt der Sync, wir hätten lokale Änderungen
  localStorage.setItem('ft_drive_last_local_change', '0');
}

// ─── Haupt-Sync-Funktion ─────────────────────────────
async function driveSync(reason = 'manuell') {
  if (driveSyncInFlight) { driveLog('info', `Sync übersprungen (läuft bereits, Grund: ${reason})`); return; }
  if (!driveIsEnabled()) { driveLog('info', 'Sync übersprungen — nicht verbunden'); return; }
  driveSyncInFlight = true;
  driveSetSyncIndicator(true);
  try {
    driveLog('info', `Sync gestartet (${reason})`);

    // 1) Cloud-Datei suchen
    let fileId = driveGetFileId();
    let cloudMeta = null;
    if (fileId) {
      try {
        const r = await driveApi(`files/${fileId}?fields=id,name,modifiedTime`);
        cloudMeta = await r.json();
      } catch (err) {
        driveLog('warn', `Gespeicherte Datei-ID nicht gefunden — Suche per Name…`);
        fileId = null;
      }
    }
    if (!fileId) {
      const found = await driveFindFile();
      if (found) { fileId = found.id; cloudMeta = found; driveSetFileId(fileId); driveLog('info', `Cloud-Datei gefunden (ID: ${fileId.slice(0,8)}…)`); }
    }

    // 2) Erstauf: noch keine Cloud-Datei → neu anlegen
    if (!fileId) {
      driveLog('info', 'Keine Cloud-Datei vorhanden — erstelle neu');
      const uploaded = await driveUploadFile(null, collectLocalData());
      driveSetFileId(uploaded.id);
      driveSetLastCloudEtag(uploaded.modifiedTime);
      driveSetLastPushed(Date.now());
      driveLog('ok', 'Erste Cloud-Datei erstellt ✓');
      renderDriveStatus();
      return;
    }

    // 3) Conflict-Detection
    const localChanged = driveGetLastLocalChange() > driveGetLastPushed();
    const lastEtag = driveGetLastCloudEtag();
    const cloudChanged = !lastEtag || cloudMeta.modifiedTime !== lastEtag;

    driveLog('info', `Diff: local=${localChanged ? 'JA' : 'nein'} cloud=${cloudChanged ? 'JA' : 'nein'}`);

    if (!localChanged && !cloudChanged) {
      driveLog('info', 'Keine Änderungen — nichts zu tun');
      return;
    }
    if (localChanged && !cloudChanged) {
      // Push
      const uploaded = await driveUploadFile(fileId, collectLocalData());
      driveSetLastCloudEtag(uploaded.modifiedTime);
      driveSetLastPushed(Date.now());
      driveLog('ok', `Hochgeladen → Cloud aktualisiert ✓`);
      renderDriveStatus();
      return;
    }
    if (!localChanged && cloudChanged) {
      // Pull
      const { data } = await driveDownloadFile(fileId);
      driveApplyCloudData(data);
      driveSetLastCloudEtag(cloudMeta.modifiedTime);
      driveSetLastPushed(Date.now());
      driveLog('ok', `Aus Cloud geladen ✓ (${(data.workouts || []).length} Workouts)`);
      // UI neu rendern
      try { showScreen(currentScreen || 'overview'); } catch {}
      renderDriveStatus();
      return;
    }
    // Konflikt
    driveLog('warn', 'Konflikt: beide Seiten geändert — Auswahl erforderlich');
    const { data: cloudData } = await driveDownloadFile(fileId);
    driveConflictData = {
      local: collectLocalData(),
      cloud: cloudData,
      cloudMeta,
    };
    driveShowConflictDialog();
  } catch (err) {
    driveLog('error', err.message || String(err));
  } finally {
    driveSyncInFlight = false;
    driveSetSyncIndicator(false);
    // Wenn während des Syncs neue lokale Änderungen kamen → einen Folge-Sync planen
    if (driveIsEnabled() && driveGetLastLocalChange() > driveGetLastPushed()) {
      if (driveSyncTimer) clearTimeout(driveSyncTimer);
      driveSyncTimer = setTimeout(() => {
        driveSyncTimer = null;
        driveSync('Folge-Sync nach Änderung während laufendem Sync').catch(() => {});
      }, DRIVE_DEBOUNCE_MS);
    }
  }
}

// ─── Conflict-Dialog ─────────────────────────────────
function driveShowConflictDialog() {
  if (!driveConflictData) return;
  const { local, cloud, cloudMeta } = driveConflictData;
  const localMeta = `${(local.workouts || []).length} Workouts<br>Stand: ${new Date(driveGetLastLocalChange()).toLocaleString('de-DE')}`;
  const cloudMetaStr = `${(cloud.workouts || []).length} Workouts<br>Stand: ${new Date(cloudMeta.modifiedTime).toLocaleString('de-DE')}`;
  document.getElementById('conflict-local-meta').innerHTML = localMeta;
  document.getElementById('conflict-cloud-meta').innerHTML = cloudMetaStr;
  openModal('modal-drive-conflict');
}
async function driveResolveConflict(choice) {
  closeModal('modal-drive-conflict');
  if (!driveConflictData) return;
  if (choice === 'cancel') {
    driveLog('info', 'Konflikt-Auflösung verschoben');
    driveConflictData = null;
    return;
  }
  const fileId = driveGetFileId();
  try {
    if (choice === 'local') {
      const uploaded = await driveUploadFile(fileId, driveConflictData.local);
      driveSetLastCloudEtag(uploaded.modifiedTime);
      driveSetLastPushed(Date.now());
      driveLog('ok', 'Konflikt: lokale Version hochgeladen ✓');
    } else if (choice === 'cloud') {
      driveApplyCloudData(driveConflictData.cloud);
      driveSetLastCloudEtag(driveConflictData.cloudMeta.modifiedTime);
      driveSetLastPushed(Date.now());
      driveLog('ok', 'Konflikt: Cloud-Version übernommen ✓');
      try { showScreen(currentScreen || 'overview'); } catch {}
    }
    renderDriveStatus();
  } catch (err) {
    driveLog('error', `Konflikt-Auflösung fehlgeschlagen: ${err.message || err}`);
  }
  driveConflictData = null;
}

// ─── Public UI-Actions ───────────────────────────────
async function driveConnect() {
  try {
    driveLog('info', 'Verbindungsaufbau gestartet…');
    await driveEnsureGisReady();
    await driveRequestToken({ interactive: true });
    driveSetEnabled(true);
    driveLog('ok', 'Mit Google verbunden ✓');
    renderDriveStatus();
    await driveSync('Erstverbindung');
  } catch (err) {
    driveLog('error', `Verbindung fehlgeschlagen: ${err.message || err}`);
    showToast('Verbindung fehlgeschlagen');
  }
}
function driveDisconnect() {
  confirmAction('Verbindung trennen?',
    'Deine Daten bleiben lokal und in der Cloud erhalten. Nur die Sync-Verknüpfung wird entfernt.',
    () => {
      driveClearToken();
      driveSetEnabled(false);
      driveSetFileId(null);
      driveSetLastCloudEtag(null);
      localStorage.removeItem('ft_drive_last_pushed');
      driveLog('info', 'Verbindung getrennt');
      renderDriveStatus();
      showToast('Verbindung getrennt');
    }
  );
}
async function driveManualSync() {
  await driveSync('manuell');
}
async function driveTestConnection() {
  try {
    driveLog('info', 'Verbindungstest…');
    const r = await driveApi('about?fields=user(emailAddress,displayName),storageQuota(usage,limit)');
    const info = await r.json();
    const email = info.user && info.user.emailAddress;
    driveLog('ok', `Test OK — angemeldet als ${email}`);
    showToast(`Verbunden als ${email}`);
    renderDriveStatus();
  } catch (err) {
    driveLog('error', `Test fehlgeschlagen: ${err.message || err}`);
    showToast('Test fehlgeschlagen');
  }
}
function toggleDriveDebug() {
  const el = document.getElementById('drive-debug');
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  document.getElementById('drive-debug-state').textContent = open ? '▸' : '▾';
  if (!open) renderDriveDebug();
}

// ─── UI Rendering ────────────────────────────────────
function renderDriveStatus() {
  const offEl = document.getElementById('drive-disconnected');
  const onEl = document.getElementById('drive-connected');
  if (!offEl || !onEl) return;
  if (driveIsEnabled()) {
    offEl.style.display = 'none';
    onEl.style.display = 'block';
    const sub = document.getElementById('drive-status-sub');
    if (sub) {
      const last = driveGetLastPushed();
      sub.textContent = last ? `Letzter Sync: ${new Date(last).toLocaleString('de-DE')}` : 'Letzter Sync: noch nie';
    }
    renderDriveDebug();
    renderDriveLog();
  } else {
    offEl.style.display = 'block';
    onEl.style.display = 'none';
  }
}
function driveSetSyncIndicator(active) {
  const el = document.getElementById('drive-sync-indicator');
  if (!el) return;
  el.classList.toggle('active', active);
}
function renderDriveLog() {
  const el = document.getElementById('drive-log');
  if (!el) return;
  let log = [];
  try { log = JSON.parse(localStorage.getItem('ft_drive_log') || '[]'); } catch {}
  if (!log.length) { el.innerHTML = '<div class="drive-log-empty">Keine Einträge</div>'; return; }
  el.innerHTML = log.map(e => {
    const cls = `drive-log-entry drive-log-${e.level}`;
    const time = new Date(e.t).toLocaleTimeString('de-DE');
    return `<div class="${cls}"><span class="drive-log-time">${time}</span><span class="drive-log-msg">${escapeHtml(e.msg)}</span></div>`;
  }).join('');
}
function renderDriveDebug() {
  const el = document.getElementById('drive-debug-grid');
  if (!el) return;
  const tok = driveGetToken();
  const tokRemaining = driveTokenExpiry ? Math.max(0, Math.round((driveTokenExpiry - Date.now()) / 60000)) : 0;
  const rows = [
    ['Verbunden', driveIsEnabled() ? 'ja' : 'nein'],
    ['Token vorhanden', tok ? 'ja' : 'nein'],
    ['Token-Restlaufzeit', tok ? `${tokRemaining} min` : '—'],
    ['Datei-ID', driveGetFileId() ? driveGetFileId().slice(0,12)+'…' : '—'],
    ['Letzte Cloud-Modifizierung', driveGetLastCloudEtag() || '—'],
    ['Letzter erfolgreicher Push', driveGetLastPushed() ? new Date(driveGetLastPushed()).toLocaleString('de-DE') : '—'],
    ['Letzte lokale Änderung', driveGetLastLocalChange() ? new Date(driveGetLastLocalChange()).toLocaleString('de-DE') : '—'],
    ['Lokale Workouts', String(DB.getWorkouts().length)],
  ];
  el.innerHTML = rows.map(([k,v]) => `<div class="drive-debug-row"><span class="drive-debug-k">${k}</span><span class="drive-debug-v">${escapeHtml(String(v))}</span></div>`).join('');
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

// ─── Init beim App-Start ─────────────────────────────
async function driveInit() {
  renderDriveStatus();
  if (!driveIsEnabled()) return;
  try {
    await driveEnsureGisReady();
    // Silent token request — funktioniert nur wenn der Browser noch eine aktive Google-Session hat
    await driveRequestToken({ interactive: false });
    driveLog('info', 'Auto-Login erfolgreich');
    await driveSync('App-Start');
  } catch (err) {
    driveLog('warn', `Auto-Login fehlgeschlagen — bitte erneut "Mit Google verbinden" antippen. (${err.message || err})`);
    renderDriveStatus();
  }
}

// ═══════════════════════════════════════════════
// PWA
// ═══════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
// Daten-Hygiene: verwaiste Wochenplan-Referenzen entfernen.
// Kann nach einem Plan-Import mit "Ersetzen" passieren, wenn der Wochenplan
// noch auf alte (jetzt gelöschte) Trainingstag-IDs zeigt.
function cleanupOrphanWeekplan() {
  const wp = DB.getWeekPlan();
  const plan = DB.getPlan();
  const planIds = new Set(plan.map(p => p.id));
  let dirty = false;
  for (const d of wp) {
    if (d.planDayId && !planIds.has(d.planDayId)) {
      d.planDayId = null;
      dirty = true;
    }
  }
  if (dirty) DB.saveWeekPlan(wp); // löst markLocalChange → Drive-Sync aus
  return dirty;
}

document.addEventListener('DOMContentLoaded', () => {
  // Erst Daten-Hygiene, dann rendern — verhindert, dass UI verwaiste Referenzen
  // kurzzeitig anzeigt, bevor der Render-Fix sie als Ruhetag interpretiert.
  cleanupOrphanWeekplan();
  const activeWo = DB.getActive();
  if (activeWo) {
    showScreen('workouts');
  } else {
    showScreen('overview');
  }
  // Drive-Sync initialisieren (versucht stillen Auto-Login, lädt Cloud-Daten falls verbunden)
  driveInit();
});
