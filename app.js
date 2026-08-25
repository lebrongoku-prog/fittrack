// ═══════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// MULTI-PLAN DATA MODEL
// ═══════════════════════════════════════════════
// ft_plans = Liste aller Trainingspläne (jeder mit eigenen trainingDays + weekPlan).
// editingPlanId = ID des Plans der gerade bearbeitet wird (Plan-Detail-View).
//                 null = bearbeite den aktuell aktiven Plan (per Datum).
// Migration: Beim ersten App-Start mit Multi-Plan-Code wird ft_program + ft_plan2 +
// ft_weekplan automatisch in einen einzigen ersten Plan überführt.

let editingPlanId = null;

function _resolveEditPlan() {
  const plans = DB.getPlans();
  if (editingPlanId) return plans.find(p => p.id === editingPlanId);
  return _findActivePlanIn(plans);
}
function _findActivePlanIn(plans) {
  const now = Date.now();
  return plans.find(p => !p.archived && p.startDate <= now && now <= p.endDate) || null;
}
// Aktiver Plan inkl. aufgelöster Tage. trainingDays wird live aus dem globalen
// Tag-Store (ft_trainingdays) über plan.dayIds resolved — Referenz-Modell.
// Rückgabe ist eine flache Kopie (read-only Nutzung; Schreiben läuft über editingPlanId/DB.savePlan).
function getActivePlan() {
  const p = _findActivePlanIn(DB.getPlans());
  if (!p) return null;
  return Object.assign({}, p, { trainingDays: resolvePlanDays(p) });
}

// ── Tag-Modell v2: Tage sind geteilte Einheiten (wie Übungen). Ein Plan REFERENZIERT
// Tage über plan.dayIds; der Tag selbst liegt im globalen Store ft_trainingdays.
// Archivierte Pläne sind EINGEFROREN: ihre Tage liegen als Snapshot in plan.archivedDays
// und sind von späteren Bibliotheks-Änderungen unberührt.
// resolvePlanDays liefert für jeden Plan das passende Tag-Array (read).
function resolvePlanDays(plan) {
  if (!plan) return [];
  if (plan.archived && Array.isArray(plan.archivedDays)) return plan.archivedDays;
  if (Array.isArray(plan.dayIds)) {
    const lib = DB.getTrainingDays();
    const byId = {};
    lib.forEach(d => { byId[d.id] = d; });
    return plan.dayIds.map(id => byId[id]).filter(Boolean);
  }
  // Back-Compat: alte Plan-Form mit eingebetteten trainingDays (vor Tag-Modell-v2 /
  // frisch aus der Cloud gezogen, bevor migrateDayModelV2 lief).
  if (Array.isArray(plan.trainingDays)) return plan.trainingDays;
  return [];
}

// Einmalige Bereinigung nach dem Entfernen des Cardio-Konzepts: Cardio-Übungen lagen
// unsichtbar in den Daten (die App legte beim ersten Start vier Lauf-Einträge an). Ohne
// diese Migration tauchten sie nach dem Umbau als gewöhnliche Übungen im Katalog auf —
// ohne Muskelgruppe und ohne Sätze. Entfernt werden: die Übungen selbst, ihre Verweise in
// Trainingstagen und ihre Einträge in gespeicherten Einheiten. Eine Kopie der entfernten
// Daten bleibt unter ft_cardio_removed liegen, falls doch etwas gebraucht wird.
function migrateRemoveCardio() {
  if (localStorage.getItem('ft_cardio_purged') === '1') return;
  const istCardio = (e) => e && e.type === 'cardio';

  const exs = DB.getExercises();
  const cardioIds = new Set(exs.filter(istCardio).map(e => e.id));
  const gesichert = { exercises: exs.filter(istCardio), workoutEntries: [] };

  if (cardioIds.size) {
    DB.saveExercises(exs.filter(e => !istCardio(e)));

    const days = DB.getTrainingDays();
    let tageGeaendert = false;
    days.forEach(d => {
      const vorher = (d.exercises || []).length;
      d.exercises = (d.exercises || []).filter(pe => !cardioIds.has(pe.exId));
      if (d.exercises.length !== vorher) tageGeaendert = true;
    });
    if (tageGeaendert) DB.saveTrainingDays(days);

    const ws = DB.getWorkouts();
    let einheitenGeaendert = false;
    ws.forEach(w => {
      const behalten = (w.exercises || []).filter(we => {
        const raus = we.type === 'cardio' || cardioIds.has(we.exId || we.id);
        if (raus) gesichert.workoutEntries.push({ workoutId: w.id, eintrag: we });
        return !raus;
      });
      if (behalten.length !== (w.exercises || []).length) { w.exercises = behalten; einheitenGeaendert = true; }
    });
    // Einheiten, die nur aus Cardio bestanden, verschwinden mit
    const wsBehalten = ws.filter(w => (w.exercises || []).length > 0);
    if (einheitenGeaendert || wsBehalten.length !== ws.length) DB.saveWorkouts(wsBehalten);

    try { localStorage.setItem('ft_cardio_removed', JSON.stringify(gesichert)); } catch {}
  }

  // Nicht mehr benötigte Schlüssel des alten Konzepts
  ['ft_cardio_seeded', 'ft_ex_mode', 'ft_stats_vol_mode', 'ft_stats_muscle_mode', 'ft_stats_pr_mode']
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('ft_cardio_purged', '1');
}

function migrateToMultiPlan() {
  if (localStorage.getItem('ft_plans')) return; // schon migriert
  const oldProgramRaw = localStorage.getItem('ft_program');
  const oldPlanRaw = localStorage.getItem('ft_plan2');
  const oldWeekplanRaw = localStorage.getItem('ft_weekplan');
  // Frische Installation → leere Liste
  if (!oldProgramRaw && !oldPlanRaw && !oldWeekplanRaw) {
    localStorage.setItem('ft_plans', JSON.stringify([]));
    return;
  }
  let prog = { ...DEFAULT_PROGRAM };
  try { if (oldProgramRaw) prog = JSON.parse(oldProgramRaw); } catch {}
  let trainingDays = [];
  try { if (oldPlanRaw) trainingDays = JSON.parse(oldPlanRaw); } catch {}
  let weekPlan = JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  try { if (oldWeekplanRaw) weekPlan = JSON.parse(oldWeekplanRaw); } catch {}
  const startDate = prog.startDate || Date.now();
  const weeksTotal = prog.weeksTotal || 12;
  const endDate = prog.endDate || (startDate + weeksTotal * 7 * 24 * 3600 * 1000);
  const plan = {
    id: 'plan_' + Date.now(),
    name: prog.name || 'Mein Trainingsplan',
    weeksTotal, startDate, endDate,
    trainingDays, weekPlan,
    archived: false,
    createdAt: Date.now(),
  };
  localStorage.setItem('ft_plans', JSON.stringify([plan]));
  // ft_program/ft_plan2/ft_weekplan bleiben als Notfall-Backup erhalten
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

  // Multi-Plan: Raw-Zugriff
  getPlans() {
    const s = localStorage.getItem('ft_plans');
    return s ? JSON.parse(s) : [];
  },
  savePlans(plans) {
    localStorage.setItem('ft_plans', JSON.stringify(plans));
    markLocalChange();
  },

  // Backwards-Compat: getPlan/savePlan/getProgram/saveProgram/getWeekPlan/saveWeekPlan
  // operieren auf dem aktuell bearbeiteten Plan (editingPlanId) bzw. fallback aktiver Plan.
  // Damit funktionieren alle existierenden Mutator-Funktionen ohne Signatur-Änderung.
  getPlan() {
    const p = _resolveEditPlan();
    return p ? resolvePlanDays(p) : JSON.parse(JSON.stringify(DEFAULT_PLAN));
  },
  // savePlan bekommt das (resolvte) Tag-Array des aktuell bearbeiteten Plans und schreibt es zurück.
  // Referenz-Modell: jeder Tag wird in den globalen Store ft_trainingdays geschrieben (upsert) —
  // dadurch wirkt eine Änderung an einem Tag in ALLEN Plänen, die ihn referenzieren. Der Plan
  // selbst hält nur die Reihenfolge/Zuordnung als dayIds. Archivierte Pläne sind eingefroren →
  // Bearbeitung bleibt plan-lokal in archivedDays (propagiert NICHT in die Bibliothek).
  savePlan(trainingDays) {
    const targetId = editingPlanId || (getActivePlan()?.id);
    if (!targetId) return;
    const plans = this.getPlans();
    const p = plans.find(pl => pl.id === targetId);
    if (!p) return;
    if (p.archived) {
      p.archivedDays = trainingDays;
      delete p.trainingDays;
      this.savePlans(plans);
      return;
    }
    const lib = this.getTrainingDays();
    const idx = {};
    lib.forEach((d, i) => { idx[d.id] = i; });
    trainingDays.forEach(day => {
      if (idx[day.id] !== undefined) lib[idx[day.id]] = day;
      else { idx[day.id] = lib.length; lib.push(day); }
    });
    this.saveTrainingDays(lib);
    p.dayIds = trainingDays.map(d => d.id);
    delete p.trainingDays;
    this.savePlans(plans);
  },
  getProgram() {
    const p = _resolveEditPlan();
    if (!p) return { name: 'Mein Trainingsplan', weeksTotal: 12, startDate: Date.now(), endDate: Date.now() + 12*7*24*3600*1000 };
    return { name: p.name, weeksTotal: p.weeksTotal, startDate: p.startDate, endDate: p.endDate };
  },
  saveProgram(prog) {
    const targetId = editingPlanId || (getActivePlan()?.id);
    if (!targetId) return;
    const plans = this.getPlans();
    const p = plans.find(pl => pl.id === targetId);
    if (!p) return;
    p.name = prog.name;
    p.weeksTotal = prog.weeksTotal;
    p.startDate = prog.startDate;
    p.endDate = prog.endDate;
    this.savePlans(plans);
  },
  getWeekPlan() {
    const p = _resolveEditPlan();
    return p ? p.weekPlan : JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  },
  saveWeekPlan(wp) {
    const targetId = editingPlanId || (getActivePlan()?.id);
    if (!targetId) return;
    const plans = this.getPlans();
    const p = plans.find(pl => pl.id === targetId);
    if (!p) return;
    p.weekPlan = wp;
    this.savePlans(plans);
  },

  // Trainingstage-Bibliothek: planunabhaengiger Speicher fuer eigenstaendige Trainingstage.
  // Ein Lib-Tag: { id, name, color?, exercises:[{exId,targetSets,targetReps}], notes, archived, createdAt }
  getTrainingDays() { const s = localStorage.getItem('ft_trainingdays'); return s ? JSON.parse(s) : []; },
  saveTrainingDays(v) { localStorage.setItem('ft_trainingdays', JSON.stringify(v)); markLocalChange(); },

  getWorkouts() { const s = localStorage.getItem('ft_workouts'); return s ? JSON.parse(s) : []; },
  saveWorkouts(v) { localStorage.setItem('ft_workouts', JSON.stringify(v)); markLocalChange(); },
  addWorkout(w) { const ws = this.getWorkouts(); ws.unshift(w); this.saveWorkouts(ws); },
  getActive() { const s = localStorage.getItem('ft_active'); return s ? JSON.parse(s) : null; },
  saveActive(v) { localStorage.setItem('ft_active', JSON.stringify(v)); },
  clearActive() { localStorage.removeItem('ft_active'); },

  // Papierkorb: gelöschte Einheiten, Pläne, Trainingstage und Übungen liegen hier
  // TRASH_KEEP_DAYS lang, bevor sie endgültig verschwinden.
  getTrash() { const s = localStorage.getItem('ft_trash'); return s ? JSON.parse(s) : []; },
  saveTrash(v) { localStorage.setItem('ft_trash', JSON.stringify(v)); markLocalChange(); },
};

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function getEx(id) { return DB.getExercises().find(e => e.id === id); }
function muscleName(m) { return (MUSCLE_META[m] && MUSCLE_META[m].name) || m; }
function muscleColor(m) { return (MUSCLE_META[m] && MUSCLE_META[m].color) || '#0066ff'; }
function muscleBg(m) { return (MUSCLE_META[m] && MUSCLE_META[m].bg) || '#e8f0ff'; }

function fmtTimer(s) { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60; return h>0?`${h}:${pad(m)}:${pad(ss)}`:`${pad(m)}:${pad(ss)}`; }
function fmtDur(s) { if(!s)return'0 min'; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}min`:`${m} min`; }
function pad(n) { return String(n).padStart(2,'0'); }
function fmtDate(ts) { return new Date(ts).toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
function fmtDateShort(ts) { return new Date(ts).toLocaleDateString('de-DE',{day:'numeric',month:'short'}); }
// Volumenangaben ab einer Tonne in „t" — fünfstellige Kilogramm-Zahlen liest niemand.
// Liefert den Wert MIT Einheit, weil die Einheit von der Größe abhängt.
function fmtVol(kg) {
  if (Math.abs(kg) < 1000) return Math.round(kg) + ' kg';
  return (kg / 1000).toFixed(1).replace('.0', '') + ' t';
}

// Beschriftung der Volumen-Achse. Die Einheit gilt für die GANZE Achse (entschieden am
// größten Wert) — gemischt stünde „500 kg" neben „1,5 t" und die Skala wäre unlesbar.
function volAchsenWert(v, inTonnen) {
  if (!v) return '0';
  return inTonnen
    ? (v / 1000).toFixed(1).replace('.0', '') + ' t'
    : Math.round(v) + ' kg';
}
// Get current program week based on startDate of the ACTIVE plan (not editing context)
function getProgramWeek() {
  const active = getActivePlan();
  if (!active) return { num: 0, total: 0, name: 'Kein aktiver Trainingsplan' };
  const start = active.startDate || Date.now();
  const monStart = new Date(start);
  monStart.setHours(0,0,0,0);
  monStart.setDate(monStart.getDate() - ((monStart.getDay()+6)%7)); // Mon of start-week
  const diffMs = Date.now() - monStart.getTime();
  const week = Math.floor(diffMs / (7*24*3600*1000)) + 1;
  return { num: Math.min(Math.max(week,1), active.weeksTotal), total: active.weeksTotal, name: active.name };
}

// Programm-Woche für EINEN bestimmten Plan (für die Plan-Karten-Vorschau im Trainingsplan-Tab).
function _planProgramWeek(p) {
  const start = p.startDate || Date.now();
  const monStart = new Date(start); monStart.setHours(0,0,0,0);
  monStart.setDate(monStart.getDate() - ((monStart.getDay()+6)%7));
  const week = Math.floor((Date.now() - monStart.getTime()) / (7*24*3600*1000)) + 1;
  const total = p.weeksTotal || 12;
  return { num: Math.min(Math.max(week,1), total), total };
}

// Build the 7-day list starting Monday for the current week — uses ACTIVE plan, not edit context
function getCurrentWeekDays() {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = (today.getDay()+6) % 7;   // 0=Mon
  const mon = new Date(today); mon.setDate(mon.getDate() - todayIdx);
  const active = getActivePlan();
  const wp = active ? active.weekPlan : JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  const plan = active ? active.trainingDays : [];
  const ws = DB.getWorkouts();
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

// Workouts completed in the current Mon-Sun week — uses ACTIVE plan
function getWeekStatus() {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = (today.getDay()+6) % 7;
  const mon = new Date(today); mon.setDate(mon.getDate() - todayIdx);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  const ws = DB.getWorkouts();
  const done = ws.filter(w => w.startTs >= mon.getTime() && w.startTs <= sun.getTime()).length;
  const active = getActivePlan();
  const wp = active ? active.weekPlan : [];
  const planned = wp.filter(d => d.planDayId).length;
  return { done, planned };
}

// Wie viele Wochen in Folge wurde das Wochenpensum erreicht? Die laufende Woche zählt nur
// mit, wenn sie schon voll ist — sonst würde die Serie mitten in der Woche „abreißen".
// Gezählt wird ab der letzten abgeschlossenen Woche rückwärts.
function getWeekStreak() {
  const active = getActivePlan();
  if (!active) return 0;
  const planned = (active.weekPlan || []).filter(d => d.planDayId).length;
  if (!planned) return 0;
  const ws = DB.getWorkouts();
  if (!ws.length) return 0;

  const today = new Date(); today.setHours(0,0,0,0);
  const mon = new Date(today); mon.setDate(mon.getDate() - ((today.getDay()+6) % 7));

  const countIn = (start) => {
    const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    return ws.filter(w => w.startTs >= start.getTime() && w.startTs <= end.getTime()).length;
  };

  let streak = 0;
  // Laufende Woche nur zählen, wenn das Pensum bereits erreicht ist
  if (countIn(mon) >= planned) streak++;
  for (let i = 1; i <= 52; i++) {
    const start = new Date(mon); start.setDate(mon.getDate() - 7 * i);
    if (start.getTime() < (active.startDate || 0)) break;
    if (countIn(start) >= planned) streak++;
    else break;
  }
  return streak;
}

function calcVolume(workout) {
  return workout.exercises.reduce((acc, ex) => {
    if (!Array.isArray(ex.sets)) return acc;
    return acc + ex.sets.reduce((a, s) => a + (parseFloat(s.weight)||0) * (parseInt(s.reps)||0), 0);
  }, 0);
}

function calcMuscleVolume(workouts) {
  const vol = {};
  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      if (!Array.isArray(ex.sets)) return;
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
    const maxW = Math.max(...(ex.sets || []).map(s => parseFloat(s.weight)||0));
    if (!maxW) return;
    let prevMax = 0;
    allPrevWorkouts.forEach(w => {
      const match = (w.exercises || []).find(e => (e.exId||e.id) === (ex.exId||ex.id));
      if (match && Array.isArray(match.sets)) {
        const m = Math.max(...match.sets.map(s => parseFloat(s.weight)||0));
        if (m > prevMax) prevMax = m;
      }
    });
    if (maxW > prevMax) {
      prs.push({ exId: ex.exId||ex.id, name: ex.name, kind: 'strength', weight: maxW, prev: prevMax });
    }
  });
  return prs;
}

function getLastExData(exId) {
  const ws = DB.getWorkouts();
  for (const w of ws) {
    const ex = w.exercises.find(e => (e.exId||e.id) === exId);
    if (ex && Array.isArray(ex.sets) && ex.sets.length) {
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

// Vier Haupt-Tabs. „Mehr" (Sicherung, Import/Export, Diagnose) ist kein Tab mehr, sondern
// ein Overlay hinter dem Zahnrad in der Übersicht — es wird selten und nie im Training gebraucht.
const TAB_ORDER = ['overview', 'workouts', 'exercises', 'plans'];

// Wenn JS gerade einen Scroll programmatisch ausloest, soll der Scroll-Listener
// nicht zusaetzlich currentScreen/Theme/Renderer triggern (vermeidet Doppel-Render).
let _suppressScrollSync = false;

// Programmatic scroll des Tab-Containers zum Tab `name`.
// Verwendet behavior:'auto' (instant) entsprechend der Nutzer-Praeferenz "direkt springen".
function _scrollTabContainerTo(name) {
  const container = document.getElementById('tab-container');
  if (!container) return;
  const idx = TAB_ORDER.indexOf(name);
  if (idx < 0) return;
  const target = idx * container.clientWidth;
  _suppressScrollSync = true;
  container.scrollTo({ left: target, behavior: 'auto' });
  // Sync-Flag nach Frame wieder freigeben (scrollend-Event kommt nicht zuverlaessig auf allen Browsern).
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { _suppressScrollSync = false; });
  });
}

// Setzt body-Theme-Klasse + Bottom-Nav-Highlight + ruft den Renderer fuer den Tab auf.
// Two-Layer Background-Crossfade fuer den Tab-Theme-Wechsel.
// CSS-`transition: background-image` greift in iOS-Safari nicht zuverlaessig
// zwischen zwei linear-gradient-Strings. Stattdessen liegen zwei fixed Layer
// hinter dem App-Container und werden per Opacity-Animation getauscht.
const THEME_GRADIENTS = {
  overview:  'linear-gradient(135deg, #0C4A6E, #0891B2)',
  workouts:  'linear-gradient(135deg, #064E3B, #10B981)',
  plans:     'linear-gradient(135deg, #78350F, #F59E0B)',
  exercises: 'linear-gradient(135deg, #172554, #1E40AF)',
  mehr:      'linear-gradient(135deg, #DBEAFE, #DBEAFE)',   // solid hellblau, kein sichtbarer Verlauf
};
// Swipe-gebundener Background-Uebergang.
// Layer A traegt den FROM-Theme-Gradient, Layer B den TO-Theme-Gradient.
// Die Opacities interpolieren kontinuierlich mit der Scroll-Position des Tab-Containers
// (`progress` = scrollLeft / clientWidth, also der Tab-Index als Float).
// Beim Tableisten-Klick wird `setThemeBackground(name)` statt der Swipe-Logik
// aufgerufen — instant Wechsel ohne Crossfade.
function updateBackgroundForSwipe(progress) {
  const fromIdx = Math.max(0, Math.min(TAB_ORDER.length - 1, Math.floor(progress)));
  const toIdx   = Math.max(0, Math.min(TAB_ORDER.length - 1, Math.ceil(progress)));
  const t = progress - fromIdx;
  const fromName = TAB_ORDER[fromIdx];
  const toName   = TAB_ORDER[toIdx];
  const fromBg = THEME_GRADIENTS[fromName] || '';
  const toBg   = THEME_GRADIENTS[toName]   || '';
  const layerA = document.getElementById('bg-fade-a');
  const layerB = document.getElementById('bg-fade-b');
  if (!layerA || !layerB) return;
  // Pro Frame: keine CSS-Animation, Layer folgen 1:1 dem Finger
  layerA.classList.add('no-anim');
  layerB.classList.add('no-anim');
  if (layerA.dataset.theme !== fromName) {
    layerA.style.backgroundImage = fromBg;
    layerA.dataset.theme = fromName;
  }
  if (layerB.dataset.theme !== toName) {
    layerB.style.backgroundImage = toBg;
    layerB.dataset.theme = toName;
  }
  layerA.style.opacity = String(1 - t);
  layerB.style.opacity = String(t);
}

// Instant Set fuer Tableisten-Klick und App-Start.
// Setzt Layer A auf das neue Theme mit opacity 1, Layer B opacity 0 — ohne Animation.
function setThemeBackground(themeName) {
  const newBg = THEME_GRADIENTS[themeName] !== undefined ? THEME_GRADIENTS[themeName] : '';
  const layerA = document.getElementById('bg-fade-a');
  const layerB = document.getElementById('bg-fade-b');
  if (!layerA || !layerB) return;
  layerA.classList.add('no-anim');
  layerB.classList.add('no-anim');
  layerA.style.backgroundImage = newBg;
  layerA.dataset.theme = themeName;
  layerA.style.opacity = newBg ? '1' : '0';
  layerB.style.backgroundImage = '';
  layerB.style.opacity = '0';
  layerB.dataset.theme = '';
  void layerA.offsetWidth;  // force reflow, damit der instant Wechsel sicher greift
}

// Synchronisiert <meta name="theme-color"> mit der aktuellen Tab-Akzentfarbe.
// Wirkt sich in Safari (Browser-Modus) auf die Browser-Chrome-Farbe aus und
// gibt iOS einen Hinweis fuer den Status-Bar-Bereich im PWA-Modus.
function updateThemeColorMeta() {
  const metaEl = document.querySelector('meta[name="theme-color"]');
  if (!metaEl) return;
  const cs = getComputedStyle(document.body);
  // Auf themed Tabs: --accent-dark (deckt die Gradient-Oberkante besser),
  // auf mehr-tab: --accent (deckt den Pseudo-Element-Strip).
  const dark = cs.getPropertyValue('--accent-dark').trim();
  const accent = cs.getPropertyValue('--accent').trim();
  metaEl.setAttribute('content', dark || accent || '#0a2a6b');
}

function _applyTabState(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navEl = document.getElementById('nav-'+name);
  if (navEl) navEl.classList.add('active');

  // Body-Theme: plan-detail UND day-detail teilen sich Theme + Akzentfarbe mit der Plans-Liste (Amber).
  const themeName = (name === 'plan-detail' || name === 'day-detail') ? 'plans' : name;
  document.body.className = 'theme-' + themeName;
  // _applyTabState wird bei Tableisten-Klick + initialem App-Start aufgerufen —
  // dort ist KEIN Crossfade gewuenscht (sofortiger Wechsel). Beim Swipe-Snap
  // ruft der scroll-Handler in initTabScrollSync setThemeBackground mit Animation.
  setThemeBackground(themeName);
  updateThemeColorMeta();

  // Edit-Kontext (editingPlanId) ist NUR auf dem Plan-Detail-Screen gültig. Beim Wechsel zu
  // JEDEM anderen Screen zurücksetzen — sonst lesen edit-bewusste Funktionen (DB.getPlan/
  // getWeekPlan, Übungen-nach-Plan) weiter den editierten Plan statt des aktiven (z.B. nach
  // „Plan bearbeiten → Bottom-Nav Workouts" würde sonst der editierte Zukunftsplan erscheinen).
  if (name !== 'plan-detail') editingPlanId = null;

  if (name === 'overview') renderOverview();
  else if (name === 'workouts') renderWorkoutsScreen();
  else if (name === 'exercises') renderExercisesScreen();
  else if (name === 'plans') renderPlansScreen();
  else if (name === 'plan-detail') renderPlanDetail();
  else if (name === 'day-detail') renderLibDayDetail();
  else if (name === 'mehr') renderMehr();

  ensureTimerActive();

  // Bottom-Nav-Zustand wird beim Tab-Wechsel BEWUSST NICHT zurückgesetzt (Leonard-Wunsch):
  // ist die Leiste ausgeblendet, bleibt sie es auch beim Tabwechsel. Wieder einblenden nur
  // über Hintergrund-Tipp (Toggle) oder Hochscrollen (beides in initScrollHideNav).
}

function showScreen(name) {
  // Plan-Detail, Trainingstag-Detail UND Einstellungen sind Vollbild-Overlays UEBER dem Tab-Container.
  const planDetailEl = document.getElementById('screen-plan-detail');
  const dayDetailEl = document.getElementById('screen-day-detail');
  const mehrEl = document.getElementById('screen-mehr');
  const tabContainer = document.getElementById('tab-container');

  if (name === 'mehr') {
    currentScreen = 'mehr';
    if (planDetailEl) planDetailEl.classList.remove('active');
    if (dayDetailEl) dayDetailEl.classList.remove('active');
    if (mehrEl) { mehrEl.classList.add('active'); mehrEl.scrollTop = 0; }
    _applyTabState('mehr');
    return;
  }
  if (mehrEl && mehrEl.classList.contains('active')) mehrEl.classList.remove('active');

  if (name === 'plan-detail') {
    currentScreen = 'plan-detail';
    if (mehrEl) mehrEl.classList.remove('active');
    if (dayDetailEl) dayDetailEl.classList.remove('active');
    if (planDetailEl) {
      planDetailEl.classList.add('active');
      planDetailEl.scrollTop = 0;   // oben starten, nicht alte Scroll-Position zeigen
    }
    _applyTabState('plan-detail');
    return;
  }
  if (name === 'day-detail') {
    currentScreen = 'day-detail';
    if (mehrEl) mehrEl.classList.remove('active');
    if (planDetailEl) planDetailEl.classList.remove('active');
    if (dayDetailEl) {
      dayDetailEl.classList.add('active');
      dayDetailEl.scrollTop = 0;
    }
    _applyTabState('day-detail');
    return;
  }

  // Wechsel von einem Overlay zurueck zu einem normalen Tab → beide Overlays schliessen
  if (planDetailEl && planDetailEl.classList.contains('active')) planDetailEl.classList.remove('active');
  if (dayDetailEl && dayDetailEl.classList.contains('active')) dayDetailEl.classList.remove('active');

  // Wenn der Ziel-Tab nicht in der TAB_ORDER ist, ignorieren
  if (!TAB_ORDER.includes(name)) return;

  currentScreen = name;
  // Programmatisch zum Tab scrollen (instant, kein smooth — Nutzer-Praeferenz)
  if (tabContainer) _scrollTabContainerTo(name);

  _applyTabState(name);
}

// Einstellungen (früher der Tab „Mehr") schließen → zurück zur Übersicht.
function closeMehr() { showScreen('overview'); }

// Tableisten-Klick. Tippt man den bereits sichtbaren Tab erneut an, scrollt dessen
// Inhalt smooth nach oben. Sonst normaler Tab-Wechsel via showScreen.
// (Eigener Handler, damit NUR die Bottom-Nav dieses Verhalten hat — andere
//  showScreen-Aufrufer wie "Plan bearbeiten"-Links bleiben unveraendert.)
function onNavTap(name) {
  const planDetailEl = document.getElementById('screen-plan-detail');
  const planDetailOpen = planDetailEl && planDetailEl.classList.contains('active');
  if (!planDetailOpen && name === currentScreen) {
    const screenEl = document.getElementById('screen-' + name);
    if (screenEl) screenEl.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  showScreen(name);
}

// ═══════════════════════════════════════════════
// SCREEN: ÜBERSICHT
// ═══════════════════════════════════════════════

function renderOverview() {
  // Aktiver Plan (per Datum) — kein Edit-Kontext/DEFAULT-Fallback. Ohne aktiven Plan: leer,
  // damit der "X von Y"-Zähler unten nicht auf DEFAULT_PLAN.length zurückfällt.
  const active = getActivePlan();
  const plan = active ? active.trainingDays : [];
  const week7 = getCurrentWeekDays();
  const todayEntry = week7.find(d => d.isToday) || week7[0];
  const wStatus = getWeekStatus();
  const prog = getProgramWeek();
  const activeWo = DB.getActive();

  // ─ Header subline ─
  const subEl = document.getElementById('ov-week-info');
  subEl.innerHTML = `Woche ${prog.num} • <span class="ph-sub-accent">${wStatus.done} von ${wStatus.planned||plan.length}</span> Einheiten absolviert`;

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
      label: 'LAUFENDE EINHEIT',
    });
  } else if (todayEntry.planDay && !todayEntry.dayDone) {
    wrap.innerHTML = buildSessionCard(null, todayEntry.planDay, todayEntry, true, {
      label: 'NÄCHSTE EINHEIT',
      previewOnClick: `requestStartFromOverview('${todayEntry.planDay.id}')`,
    });
  } else {
    // Today is rest day (or already done) → compact Ruhetag hero
    wrap.innerHTML = buildRestHero(true);
  }
  ensureTimerActive();

  // ─ Aktiver Plan als Dashboard-Karte (ersetzt „Trainingswoche"-Karte + separaten Wochenplan-Strip) ─
  const planCardEl = document.getElementById('ov-plan-card');
  if (planCardEl) {
    planCardEl.innerHTML = active
      ? buildPlanCard(active, "showScreen('plans')", /*hideToday*/ false, /*hideStatus*/ true, /*hideMeta*/ true)
      : `<div class="plan-card-v2" onclick="showScreen('plans')" style="cursor:pointer">
           <div class="ppv-name" style="color:var(--text2)">Kein aktiver Trainingsplan</div>
           <div class="ppv-meta">Tippe, um einen Plan anzulegen oder zu aktivieren.</div>
         </div>`;
  }

  // ─ Hinweis auf das Plan-Ende + Sicherungs-Status ─
  renderPlanEndNotice(active);
  renderBackupLine();

  // ─ Trainingskalender (ganzes Kalenderjahr) ─
  // Wird hier gerendert, nicht in renderStatsPage: die Auswertungen liegen seit dem
  // Umbau im Übungen-Tab, der Kalender bleibt in der Übersicht.
  renderTrainingCalendar();

  // ─ Letzte Einheiten (kompakt, 3 jüngste) ─

}

// Läuft der aktive Plan bald aus, rechtzeitig darauf hinweisen. Ohne diesen Hinweis fällt die
// Übersicht am Tag nach dem Enddatum ohne Vorwarnung auf „Kein aktiver Trainingsplan" zurück.
function renderPlanEndNotice(activePlan) {
  const el = document.getElementById('ov-plan-end-notice');
  if (!el) return;
  if (!activePlan || !activePlan.endDate) { el.innerHTML = ''; el.className = ''; return; }
  const daysLeft = Math.ceil((activePlan.endDate - Date.now()) / 86400000);
  if (daysLeft < 0 || daysLeft > 7) { el.innerHTML = ''; el.className = ''; return; }
  const when = daysLeft === 0 ? 'heute' : (daysLeft === 1 ? 'morgen' : `in ${daysLeft} Tagen`);
  el.className = 'plan-end-notice';
  el.innerHTML = `
    <div class="pen-text"><strong>Dein Plan endet ${when}.</strong> Verlängere ihn oder lege einen neuen an.</div>
    <div class="pen-actions">
      <button class="btn btn-ghost btn-sm" onclick="extendActivePlan(4)">4 Wochen dran</button>
      <button class="btn btn-ghost btn-sm" onclick="showScreen('plans')">Pläne öffnen</button>
    </div>`;
}

// Aktiven Plan um n Wochen verlängern (Enddatum + Gesamtdauer).
function extendActivePlan(weeks) {
  const plans = DB.getPlans();
  const p = _findActivePlanIn(plans);
  if (!p) { showToast('Kein aktiver Plan'); return; }
  p.endDate = (p.endDate || Date.now()) + weeks * 7 * 24 * 3600 * 1000;
  p.weeksTotal = (p.weeksTotal || 0) + weeks;
  DB.savePlans(plans);
  renderOverview();
  showToast(`Plan um ${weeks} Wochen verlängert`);
}

// Zeile „zuletzt gesichert" auf der Übersicht. Ohne eingerichtete Sicherung liegen alle
// Daten nur im Browser-Speicher dieses Geräts — das soll sichtbar sein, bevor es weh tut.
// Sicherungs-Status als kompaktes Chip neben dem Titel „FitTrack" (früher eine eigene
// Kachel weiter unten). Der Platz im Kopf ist knapp, deshalb kurze Texte — die
// ausführliche Fassung steht in den Einstellungen, die ein Tipp darauf öffnet.
function renderBackupLine() {
  const el = document.getElementById('ov-backup-line');
  if (!el) return;
  const enabled = driveIsEnabled();
  const last = driveGetLastPushed();
  let cls = 'backup-chip', txt, title;

  if (enabled && driveReauthNeeded()) {
    // Abgelaufene Anmeldung schlägt jede Zeitangabe: seitdem wird nichts mehr gesichert.
    cls += ' warn';
    txt = 'Anmeldung nötig';
    title = 'Google-Anmeldung abgelaufen — es wird nichts mehr gesichert. Tippen zum neu Verbinden.';
  } else if (enabled && last) {
    const days = Math.floor((Date.now() - last) / 86400000);
    txt = days <= 0 ? 'Heute gesichert' : (days === 1 ? 'Gestern gesichert' : `Vor ${days} Tagen`);
    title = `Google Drive · ${days <= 0 ? 'heute' : days === 1 ? 'gestern' : 'vor ' + days + ' Tagen'} gesichert`;
    if (days > 7) cls += ' warn';
  } else if (enabled) {
    cls += ' warn';
    txt = 'Nicht gesichert';
    title = 'Google Drive verbunden, aber noch nichts gesichert';
  } else {
    // Ohne eingerichtete Sicherung nie grün melden — das läse sich wie „alles in Ordnung".
    const n = DB.getWorkouts().length;
    txt = 'Keine Sicherung';
    title = 'Keine Sicherung — alles liegt nur auf diesem Gerät';
    cls += n >= 10 ? ' warn' : ' idle';
  }
  el.className = cls;
  el.title = title;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', title + ' — Einstellungen öffnen');
  el.innerHTML = `<span class="backup-dot"></span><span class="backup-txt">${txt}</span>`;
  el.onclick = () => showScreen('mehr');
}

// Einmaliger Hinweis, wenn nach zehn Einheiten immer noch keine Sicherung eingerichtet ist.
function maybePromptBackup() {
  if (driveIsEnabled()) return;
  if (localStorage.getItem('ft_backup_prompted') === '1') return;
  if (DB.getWorkouts().length < 10) return;
  localStorage.setItem('ft_backup_prompted', '1');
  setTimeout(() => {
    confirmAction('Deine Einheiten sichern?',
      'Du hast inzwischen zehn Einheiten aufgezeichnet. Sie liegen bisher nur auf diesem Gerät — beim Zurücksetzen des Browsers oder einem Gerätewechsel wären sie weg. Sicherung über Google Drive jetzt einrichten?',
      () => showScreen('mehr'),
      { confirmLabel: 'Einrichten' });
  }, 900);
}

// Die drei letzten Einheiten als Einstieg in die Detailansicht. Steht seit dem
// 20.08.2026 auf der Stats-Seite des Uebungen-Tabs, nicht mehr auf der Uebersicht.
function renderRecentSessions() {
  const container = document.getElementById('ov-recent-sessions-list');
  if (!container) return;
  const ws = DB.getWorkouts()
    .slice(0, 3);
  if (!ws.length) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text3);padding:8px 0;text-align:center;margin:0">Noch keine Einheiten</p>';
    return;
  }
  // Tagname vergangener Sessions aus dem GLOBALEN Tag-Store auflösen (nicht aus dem aktiven
  // Plan / DEFAULT-Fallback) — robust, da der Tag in irgendeinem Plan oder nur in der Bibliothek
  // liegen kann. Fällt sonst auf den gespeicherten Snapshot-Namen zurück.
  const allDays = DB.getTrainingDays();
  container.innerHTML = ws.map((w, i) => {
    const day = allDays.find(d => d.id === w.planDayId);
    const dayName = day ? day.name : (w.planDayName || 'Freies Training');
    return `<div class="sess-v2-row" onclick="showHistDetail(${i})">
      <div class="sess-v2-info">
        <div class="sess-v2-name">${pd(dayName)}</div>
        <div class="sess-v2-meta">${fmtDateShort(w.startTs)} • ${fmtDur(w.duration)}</div>
      </div>
      <div class="sess-v2-arrow">›</div>
    </div>`;
  }).join('');
}

// Ausgewählter Tag im Übersicht-Wochenplan-Strip (null = heute). Persistiert wie im Workouts-Tab.
let selectedOverviewDayIdx = null;
function selectOverviewDay(idx) {
  selectedOverviewDayIdx = idx;
  renderNext7Strip(getCurrentWeekDays());
}
function renderNext7Strip(days) {
  const root = document.getElementById('ov-next7-strip');
  if (!root) return;
  const todayIdx = days.findIndex(d => d.isToday);
  const selIdx = (selectedOverviewDayIdx !== null && selectedOverviewDayIdx >= 0 && selectedOverviewDayIdx < days.length)
    ? selectedOverviewDayIdx : todayIdx;
  root.innerHTML = days.map((d, i) => buildWpCol(d, i, /*isWorkoutsTab*/ false, i === selIdx)).join('');
  // Info-Zeile zeigt den AUSGEWÄHLTEN Tag (Tippen aktualisiert sie); „Heute"/„Morgen" für heute/morgen.
  const info = document.getElementById('ov-wp-info');
  if (info) info.innerHTML = buildWpInfo(days, selIdx, /*useHeuteLabel*/ true);
}

// Eine einzelne Spalte (= ein Tag) im Wochenplan-Strip.
function buildWpCol(d, i, isWorkoutsTab, isOverviewSelected) {
  const classes = ['wp-col'];
  if (d.isToday) classes.push('today');
  if (d.isRest) classes.push('rest'); else classes.push('training');
  if (d.dayDone && d.planDay) classes.push('done');
  if (isWorkoutsTab && i === selectedWorkoutDayIdx) classes.push('selected');
  if (!isWorkoutsTab && isOverviewSelected) classes.push('selected');
  // Übersicht: Tippen wählt den Tag aus → Info-Zeile darunter aktualisiert sich (analog Workouts-Strip).
  const onclick = isWorkoutsTab ? `onclick="selectWorkoutDay(${i})"` : `onclick="selectOverviewDay(${i})"`;
  // Kein Trainingstag-Name mehr im Strip (Leonard-Wunsch): geplante Tage werden allein durch den
  // eingefärbten Kreis um den Wochentag markiert — Akzentfarbe = geplant, grün = erledigt,
  // Ring = heute. Den Namen des ausgewählten Tags zeigt die Info-Zeile (buildWpInfo) bzw. die
  // Session-Karte darunter.
  return `<div class="${classes.join(' ')}" ${onclick}>
    <span class="wp-letter">${d.label}</span>
  </div>`;
}

// Info-Zeile unter dem Wochenplan. Format:
//   Trainingstag: "Heute · Push · 5 Übungen" (mit "✓" wenn dayDone)
//   Ruhetag:      "Heute · Ruhetag · nächstes Training: Mittwoch"
// useHeuteLabel: bei true wird "Heute" / "Morgen" / "Gestern" geschrieben statt Wochentag-Name.
function buildWpInfo(days, focusIdx, useHeuteLabel) {
  if (focusIdx < 0 || focusIdx >= days.length) return '';
  const d = days[focusIdx];
  let label;
  if (useHeuteLabel && d.isToday) label = 'Heute';
  else if (useHeuteLabel && d.isTomorrow) label = 'Morgen';
  else label = dayFullName(d.dayKey);
  if (!d.planDay) {
    // Ruhetag → KEIN „nächstes Training: …"-Hinweis mehr (Leonard-Wunsch)
    return `<strong>${label}</strong> · Ruhetag`;
  }
  const exCount = (d.planDay.exercises || []).length;
  const exLabel = exCount === 1 ? 'Übung' : 'Übungen';
  const doneMark = d.dayDone ? ' <span class="wp-info-done">✓</span>' : '';
  return `<strong>${label}</strong> · ${escapeHtml(d.planDay.name)} · ${exCount} ${exLabel}${doneMark}`;
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

// Keep the active-session timer running across tabs (but not while paused).
function ensureTimerActive() {
  syncWorkoutActiveUI();
  const wo = DB.getActive();
  const shouldRun = !!wo && !wo.paused;
  if (shouldRun && !timerInterval) startTimer();
  if (!shouldRun && timerInterval) stopTimer();
}

// ═══════════════════════════════════════════════
// STARTING A WORKOUT
// ═══════════════════════════════════════════════

// Build sets for a fresh workout exercise: copy from last workout per-set, fall back to targetReps
// ─── Pro-Satz-Ziele (Plan) ──────────────────────────────────────────────
// Ein Plan-/Bibliotheks-Tag-Übungseintrag speichert seine Ziele pro Satz in pe.sets =
// [{reps, weight}, …] (weight als String, '' = leer). Für Abwärtskompatibilität bleiben die
// Skalare targetSets/targetReps/targetWeight in Sync (= sets.length / sets[0]). peSets()
// leitet bei alten Einträgen ohne pe.sets lazy aus den Skalaren ab (ohne zu persistieren).
function peSets(pe) {
  if (Array.isArray(pe.sets) && pe.sets.length) return pe.sets;
  const n = Math.max(1, pe.targetSets || 1);
  const reps = String(pe.targetReps != null ? pe.targetReps : 8);
  const w = (pe.targetWeight != null && pe.targetWeight !== '') ? String(pe.targetWeight) : '';
  return Array.from({ length: n }, () => ({ reps, weight: w }));
}
function _syncPeScalars(pe) {
  if (!Array.isArray(pe.sets) || !pe.sets.length) return;
  pe.targetSets = pe.sets.length;
  pe.targetReps = parseInt(pe.sets[0].reps) || 1;
  const w0 = pe.sets[0].weight;
  if (w0 !== '' && w0 != null && !isNaN(parseFloat(w0))) pe.targetWeight = parseFloat(w0);
}

// Baut die Workout-Sätze für eine Übung. Priorität pro Satz: letztes Workout → Plan-Ziel (pro Satz)
// → letztes Max → leer. `planSets` = peSets(pe) (Pro-Satz-Plan-Ziele).
function buildSetsForExercise(exId, planSets) {
  const last = getLastExData(exId);
  const sets = (Array.isArray(planSets) && planSets.length) ? planSets : [{ reps: '8', weight: '' }];
  return sets.map((pt, idx) => {
    const lastSet = last && last.sets && last.sets[idx];
    let weight = '';
    if (lastSet && lastSet.weight) weight = String(lastSet.weight);
    else if (pt.weight) weight = String(pt.weight);
    else if (last) weight = String(last.maxWeight);
    return {
      weight,
      reps: (lastSet && lastSet.reps) ? String(lastSet.reps) : String(pt.reps),
      done: false,
    };
  });
}

// Passt die Satzanzahl eines Plan-Übungseintrags an die tatsächlich trainierten Sätze an.
// Zusätzliche Sätze übernehmen die trainierten Werte, überzählige fallen weg.
// Gibt true zurück, wenn sich etwas geändert hat.
function _setzeSatzanzahl(pe, trainierteSaetze) {
  const base = peSets(pe).map(s => ({ ...s }));
  const before = base.length;
  const after = trainierteSaetze.length;
  if (before === after) return false;
  if (after > before) {
    for (let i = before; i < after; i++) {
      const s = trainierteSaetze[i] || {};
      base.push({
        reps: String(s.reps || (base[base.length - 1] || {}).reps || '8'),
        weight: String(s.weight != null ? s.weight : ''),
      });
    }
    pe.sets = base;
  } else {
    pe.sets = base.slice(0, after);
  }
  _syncPeScalars(pe);
  return true;
}

// Einmalige Nachführung: Trainingstage, deren Satzanzahl noch von vor der automatischen
// Übernahme stammt, an die letzte tatsächlich absolvierte Einheit angleichen. Ohne das
// zeigte die Vorschau weiter die alte Planzahl (z. B. 2), obwohl zuletzt 3 Sätze
// trainiert wurden — die Übernahme greift sonst erst ab der nächsten Einheit.
function migrateSetCountsFromHistory() {
  if (localStorage.getItem('ft_setcounts_synced') === '1') return;
  const days = DB.getTrainingDays();
  let geaendert = false;
  days.forEach(day => {
    (day.exercises || []).forEach(pe => {
      const last = getLastExData(pe.exId);
      if (!last || !Array.isArray(last.sets) || !last.sets.length) return;
      if (_setzeSatzanzahl(pe, last.sets)) geaendert = true;
    });
  });
  if (geaendert) DB.saveTrainingDays(days);
  localStorage.setItem('ft_setcounts_synced', '1');
}

// Übernimmt die TATSÄCHLICHE Satzanzahl einer abgeschlossenen Einheit in den Trainingstag.
// Ohne das startet die nächste Einheit wieder mit der ursprünglich geplanten Anzahl — wer
// dauerhaft einen Satz mehr macht, müsste ihn jedes Mal neu hinzufügen.
// Achtung: Trainingstage sind GETEILT — die Änderung wirkt in allen Plänen, die den Tag
// referenzieren. Das ist dieselbe Regel, nach der auch im Training hinzugefügte Übungen
// im Trainingstag landen (addExToWorkout).
// Rückgabe: Liste der Änderungen für die Abschlussansicht.
function syncSetCountsToPlanDay(planDayId, exercises) {
  if (!planDayId) return [];
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === planDayId);
  if (!day || !Array.isArray(day.exercises)) return [];

  const changes = [];
  exercises.forEach(we => {
    if (we.skipped || !Array.isArray(we.sets) || !we.sets.length) return;
    const pe = day.exercises.find(p => p.exId === (we.exId || we.id));
    if (!pe) return;
    const before = peSets(pe).length;
    const after = we.sets.length;
    if (!_setzeSatzanzahl(pe, we.sets)) return;
    changes.push({ name: we.name, before, after });
  });

  if (changes.length) DB.saveTrainingDays(days);
  return changes;
}

// ─── Plan ↔ Active-Workout Sync ───────────────────────
// Wenn der Plan eines Trainingstags mutiert wird (Übung hinzufügen/entfernen,
// targetSets/targetReps ändern, etc.) UND gerade ein aktives Workout läuft, das
// auf genau diesen Trainingstag verweist, werden die Plan-Änderungen auf das
// aktive Workout angewendet.
//
// Regeln (per User-Entscheidung):
// • Neue Plan-Übung → ans Ende des aktiven Workouts anhängen
// • Plan-Übung entfernt → aus aktivem Workout auch entfernen (Confirm bei Daten via
//   confirmActiveWorkoutDataLoss vor dem Entfernen)
// • targetSets erhöht → fehlende Sätze anhängen. Verringert → nichts ändern (Schutz)
// • targetReps → wird übernommen (cosmetic, beeinflusst nur künftige Sätze)
// • Reihenfolge im Plan ändert sich → aktive Reihenfolge bleibt unberührt
function syncActiveWorkoutWithPlanDay(planDayId) {
  const wo = DB.getActive();
  if (!wo || wo.planDayId !== planDayId) return;
  const plan = DB.getPlan();
  const planDay = plan.find(d => d.id === planDayId);
  if (!planDay) return;

  const planExIds = new Set(planDay.exercises.map(pe => pe.exId));
  // 1) Übungen aus aktivem Workout entfernen, die nicht mehr im Plan sind
  wo.exercises = wo.exercises.filter(ae => planExIds.has(ae.exId));

  // 2) Existierende Übungen updaten (targetReps + Sätze auffüllen, nie kürzen)
  const activeMap = {};
  wo.exercises.forEach(ae => { activeMap[ae.exId] = ae; });
  for (const pe of planDay.exercises) {
    const ae = activeMap[pe.exId];
    if (!ae) continue;
    ae.targetReps = pe.targetReps;
    if (pe.targetSets > ae.targetSets) {
      const diff = pe.targetSets - ae.targetSets;
      const newSets = Array.from({length: diff}, () => ({
        weight: pe.targetWeight ? String(pe.targetWeight) : '',
        reps: String(pe.targetReps),
        done: false,
      }));
      ae.sets = ae.sets.concat(newSets);
      ae.targetSets = pe.targetSets;
    }
  }

  // 3) Neue Übungen aus dem Plan anhängen
  const activeIds = new Set(wo.exercises.map(ae => ae.exId));
  for (const pe of planDay.exercises) {
    if (activeIds.has(pe.exId)) continue;
    const ex = getEx(pe.exId);
    if (!ex) continue;
    wo.exercises.push({
      exId: pe.exId, id: pe.exId, name: ex.name,
      targetSets: pe.targetSets, targetReps: pe.targetReps,
      sets: buildSetsForExercise(pe.exId, peSets(pe)),
      notes: '', done: false,
    });
  }

  DB.saveActive(wo);
  if (currentScreen === 'workouts') renderWorkoutsScreen();
}

// Vor dem Entfernen einer/mehrerer Übungen aus dem Plan checken, ob im aktiven
// Workout (falls vorhanden + gleicher Trainingstag) bereits Daten zu diesen
// Übungen eingetragen wurden. Falls ja → Bestätigungs-Dialog vor dem Löschen.
function confirmActiveWorkoutDataLoss(planDayId, exIdsToRemove, onConfirm) {
  const wo = DB.getActive();
  if (!wo || wo.planDayId !== planDayId) { onConfirm(); return; }
  const ids = new Set(exIdsToRemove);
  const affected = wo.exercises.filter(ae => {
    if (!ids.has(ae.exId)) return false;
    return (ae.sets || []).some(s => s.weight || s.reps);
  });
  if (!affected.length) { onConfirm(); return; }
  const names = affected.map(ae => `„${ae.name}"`).join(', ');
  confirmAction(
    'Übung mit eingetragenen Daten entfernen?',
    `${names} hat in der laufenden Einheit schon eingetragene Sätze. Beim Entfernen aus dem Plan wird die Übung auch aus der laufenden Einheit gestrichen — die Daten gehen verloren. Trotzdem entfernen?`,
    onConfirm,
    { danger: true, confirmLabel: 'Entfernen' }
  );
}

function startWorkout(dayId) {
  if (DB.getActive()) {
    confirmAction('Es läuft bereits eine Einheit',
      'Es läuft noch eine Einheit. Neu starten? Die aktuelle wird verworfen.',
      () => { stopTimer(); DB.clearActive(); _doStartWorkout(dayId); },
      { danger: true, confirmLabel: 'Neu starten' }
    );
    return;
  }
  _doStartWorkout(dayId);
}

function _doStartWorkout(dayId) {
  // Workout-Start: Card-Collapse-State zuruecksetzen, damit keine Reste vom letzten Workout uebrig sind
  if (typeof expandedAexIds !== 'undefined') expandedAexIds.clear();
  // Workout-Start läuft immer auf den aktiven Plan (nicht den Edit-Kontext)
  const active = getActivePlan();
  if (!active) { showToast('Kein aktiver Trainingsplan'); return; }
  const plan = active.trainingDays;
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
      sets: buildSetsForExercise(pe.exId, peSets(pe)),
      notes: '',
      done: false
    };
  }).filter(Boolean);

  // dayIdx = Wochentag, an dem TATSÄCHLICH trainiert wird (0=Mo … 6=So). Ohne dieses Feld
  // wurde der Wochentag über die Trainingstag-Kennung gesucht und traf bei einem Tag, der
  // zweimal pro Woche im Plan steht (z. B. Push an Mo und Sa), immer den ersten Treffer.
  const wo = {
    id:'wo_'+Date.now(), planDayId: dayId, planDayName: day ? day.name : 'Freies Training',
    startTs: Date.now(), dayIdx: (new Date().getDay()+6) % 7, exercises,
  };
  DB.saveActive(wo);
  // Erste Übung offen starten — im Training will man sofort eintragen können,
  // nicht erst zwei Mal tippen. Alle weiteren bleiben zu.
  expandedAexIds.clear();
  _aexUserClosedAll = false;
  const firstEx = exercises[0];
  if (firstEx) expandedAexIds.add(firstEx.exId || firstEx.id);
  selectedWorkoutDayIdx = wo.dayIdx;
  showScreen('workouts');
}

// ═══════════════════════════════════════════════
// ACTIVE WORKOUT
// ═══════════════════════════════════════════════

let timerInterval = null;
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

// Mittlere Dauer der bisher absolvierten Einheiten dieses Trainingstags. Vor der ersten
// Einheit gibt es nichts zu mitteln — dann null, und die Herocard laesst die Angabe weg.
function avgDauerFuerTag(planDayId) {
  if (!planDayId) return null;
  const ws = DB.getWorkouts().filter(w => w.planDayId === planDayId && w.duration > 0);
  if (!ws.length) return null;
  return Math.round(ws.reduce((summe, w) => summe + w.duration, 0) / ws.length);
}

function buildSessionCard(active, planDay, selDay, isPreview, opts) {
  opts = opts || {};
  const totalSets = active
    ? active.exercises.reduce((a,e) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0)
    : (planDay
        ? planDay.exercises.reduce((a,e) => a + (e.targetSets || 0), 0)
        : 0);
  const exCount = active ? active.exercises.length : (planDay ? planDay.exercises.length : 0);
  const doneEx = active ? active.exercises.filter(e=>e.done).length : 0;
  const processedEx = active ? active.exercises.filter(e=>e.done || e.skipped).length : 0;
  // Ohne Trainingstag (freies Training) den Namen der Einheit anhängen statt nur den Wochentag.
  const titleSuffix = planDay ? escapeHtml(planDay.name) : (active && active.planDayName ? escapeHtml(active.planDayName) : '');
  const title = `${dayFullName(selDay.dayKey)}${titleSuffix ? ': ' + titleSuffix : ''}`;
  // Die Vorschau traegt kein Etikett mehr — „Vorschau" / „Naechste Einheit" sagte nichts,
  // was der Titel nicht schon zeigt (Leonard-Wunsch 20.08.2026). Die laufende Einheit behaelt es.
  const label = isPreview ? '' : (opts.label || 'LAUFENDE EINHEIT');
  const meta = `${exCount} Übungen • ${totalSets} Sätze`;
  const pct = !isPreview && active && active.exercises.length
    ? (processedEx / active.exercises.length * 100) : 0;
  const timerBlock = (!isPreview && active)
    ? `<div class="hero-v2-timer">${fmtTimer(Math.floor(getElapsedMs(active)/1000))}</div>`
    : '';

  const avgDauer = planDay ? avgDauerFuerTag(planDay.id) : null;
  const metaPreview = `<div class="hero-v2-meta">
        <span style="display:inline-flex;gap:5px;align-items:center">
          <svg viewBox="0 0 24 24"><path d="M6 9v6M4 7v10M18 9v6M20 7v10M9 12h6"/></svg>
          ${exCount} Übungen</span>
        <span class="dot"></span>
        <span style="display:inline-flex;gap:5px;align-items:center">
          <svg viewBox="0 0 24 24"><polyline points="12 2 22 8 12 14 2 8 12 2"/><polyline points="2 12 12 18 22 12"/><polyline points="2 16 12 22 22 16"/></svg>
          ${totalSets} Sätze</span>
        ${avgDauer ? `<span class="hero-v2-meta-avg">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
          Ø ${fmtDur(avgDauer)}</span>` : ''}
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
      ${label ? `<div class="hero-v2-label">${label}</div>` : ''}
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
    // Läuft irgendwo eine Einheit, die nicht genau diese hier ist (gleicher Trainingstag UND
    // gleicher Wochentag), darf hier kein zweiter Start angeboten werden.
    const elsewhereActive = DB.getActive();
    const blockedByOther = !!elsewhereActive && !(
      elsewhereActive.planDayId === planDay.id &&
      (selDay ? woDayIdx(elsewhereActive) === selDay.idx : true)
    );
    const bottomHTML = blockedByOther
      ? `<div class="hero-v2-running-notice">Es läuft gerade eine andere Einheit. Bitte zuerst beenden.</div>`
      : `<button class="hero-v2-btn stretch" onclick="${previewOnClick}">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
           Einheit starten
         </button>`;
    return `<div class="hero-v2 col-layout">
      ${topRow}
      <div class="hero-v2-bottom">
        ${bottomHTML}
      </div>
    </div>`;
  }

  // Active mode — same outer structure as preview; bottom is only the button row
  const paused = !!(active && active.paused);
  const pauseLabel = paused ? 'Fortsetzen' : 'Pausieren';
  const pauseIcon = paused
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  // Pause-Button hat nur Sinn, wenn ueberhaupt eine Kraft-Uebung im Workout steckt
  const hasStrengthEx = !!(active && active.exercises.length);
  const pauseBtn = hasStrengthEx
    ? `<button class="hero-v2-btn-pause" onclick="togglePauseWorkout()" aria-label="${pauseLabel}">
          ${pauseIcon}
          ${pauseLabel}
        </button>`
    : '';

  return `<div class="hero-v2 col-layout active-mode">
    ${topRow}
    <div class="hero-v2-bottom">
      <div class="hero-v2-button-row">
        ${pauseBtn}
        <button class="hero-v2-btn-danger" onclick="confirmFinish()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>
          Beenden
        </button>
      </div>
    </div>
  </div>`;
}

// Einstieg ins freie Training — sichtbar an Ruhetagen und wenn gar kein Plan aktiv ist.
// Ohne ihn führt jeder Weg ins Training über einen Trainingstag im Wochenplan.
function freeWorkoutBtn() {
  if (DB.getActive()) return '';
  return `<button class="btn btn-ghost btn-full free-wo-btn" onclick="startFreeWorkout()">+ Freies Training starten</button>`;
}

function buildRestHero(isToday) {
  return `<div class="hero-v2 rest-mode">
    <div class="hero-v2-text" style="flex:1">
      <div class="hero-v2-label">RUHETAG</div>
      <div class="hero-v2-title">${isToday ? 'Heute ist Ruhetag' : 'Kein Training geplant'}</div>
      ${freeWorkoutBtn()}
    </div>
    <div class="hero-v2-art">
      ${heroDumbbellSvg()}
    </div>
  </div>`;
}

function buildRestCard(selDay) {
  const isToday = !!(selDay && selDay.isToday);
  return `<div class="session-card-v2" style="background:linear-gradient(135deg,#f5f7fa 0%,#fafbfc 100%)">
    <div class="scv2-pill" style="border-color:var(--text3);color:var(--text2)">RUHETAG</div>
    <div class="scv2-row">
      <div style="flex:1">
        <div class="scv2-title">${dayFullName(selDay.dayKey)}</div>
        <div class="scv2-meta"><span>An diesem Tag ist kein Training geplant.</span></div>
      </div>
      <div class="scv2-icon-circle" style="border-color:var(--border)">
        <svg viewBox="0 0 24 24" style="stroke:var(--text3);fill:none;stroke-width:1.8;width:30px;height:30px"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      </div>
    </div>
    ${isToday ? freeWorkoutBtn() : ''}
  </div>`;
}

// Freies Training: Einheit ohne Trainingstag, Übungen werden unterwegs hinzugefügt.
function startFreeWorkout() {
  if (DB.getActive()) { showToast('Es läuft bereits eine Einheit'); return; }
  const wo = {
    id: 'wo_' + Date.now(), planDayId: null, planDayName: 'Freies Training',
    startTs: Date.now(), dayIdx: (new Date().getDay()+6) % 7, exercises: [],
  };
  DB.saveActive(wo);
  expandedAexIds.clear();
  _aexUserClosedAll = false;
  selectedWorkoutDayIdx = wo.dayIdx;
  showScreen('workouts');
  showToast('Freies Training gestartet — füge Übungen hinzu');
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
    // Wochentag der laufenden Einheit: bevorzugt das beim Start gespeicherte dayIdx,
    // sonst aus dem Startdatum abgeleitet (Einheiten von vor dieser Änderung).
    const idx = woDayIdx(wo);
    if (idx >= 0) { selectedWorkoutDayIdx = idx; return; }
  }
  selectedWorkoutDayIdx = todayIdx;
}

// Wochentag (0=Mo … 6=So), an dem eine Einheit stattfindet bzw. stattgefunden hat.
function woDayIdx(wo) {
  if (!wo) return -1;
  if (typeof wo.dayIdx === 'number' && wo.dayIdx >= 0 && wo.dayIdx <= 6) return wo.dayIdx;
  if (wo.startTs) return (new Date(wo.startTs).getDay()+6) % 7;
  return -1;
}

function selectWorkoutDay(idx) {
  selectedWorkoutDayIdx = idx;
  renderWorkoutsScreen();
}

// Aus der Plan-Karte (Übersicht) in den Trainings-Tab auf einen bestimmten Wochentag springen.
function jumpToWorkoutDay(idx) {
  selectedWorkoutDayIdx = idx;
  showScreen('workouts');
  renderWorkoutsScreen();
}

function renderWorkoutWeekStrip() {
  ensureSelectedDayIdx();
  const days = getCurrentWeekDays();
  const root = document.getElementById('wo-week-strip');
  if (root) root.innerHTML = days.map((d, i) => buildWpCol(d, i, /*isWorkoutsTab*/ true)).join('');
  // Info-Zeile bezieht sich auf den SELEKTIERTEN Tag (nicht heute)
  const info = document.getElementById('wo-wp-info');
  if (info) {
    info.innerHTML = buildWpInfo(days, selectedWorkoutDayIdx, /*useHeuteLabel*/ false);
  }
}

function renderWorkoutsScreen() {
  ensureSelectedDayIdx();
  // WICHTIG: Der Workouts-Tab zeigt IMMER den AKTIVEN Plan (per Datum) — niemals den Edit-Kontext
  // (editingPlanId) und niemals den DEFAULT_PLAN/DEFAULT_WEEKPLAN-Fallback von DB.getPlan/getWeekPlan.
  // getCurrentWeekDays() ist getActivePlan-basiert (identische Quelle wie der Wochenplan-Strip), damit
  // Hero/Vorschau und Strip nie widersprechen. Ohne aktiven Plan ist jeder Tag ein Ruhetag.
  const weekDays = getCurrentWeekDays();
  const selDay = weekDays[selectedWorkoutDayIdx];
  const planDay = selDay ? (selDay.planDay || null) : null;
  const active = DB.getActive();
  // Die laufende Einheit gehört zu GENAU EINEM Wochentag — der Vergleich mit woDayIdx genügt,
  // damit sie nicht an jedem Tag auftaucht, an dem derselbe Trainingstag im Plan steht.
  // Bewusst NICHT zusätzlich gegen planDay geprüft: Wer sein Training auf einen Ruhetag
  // verschiebt (oder frei trainiert), soll die laufende Einheit trotzdem hier sehen.
  const activeOnSelected = !!(active && woDayIdx(active) === selectedWorkoutDayIdx);

  // Header subtitle
  const dotEl = document.getElementById('wo-sub-dot');
  const subEl = document.getElementById('wo-sub-text');
  if (activeOnSelected) {
    dotEl.style.display = 'inline-block';
    subEl.textContent = 'Laufende Einheit';
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
  const addWrap = document.getElementById('wo-add-ex-wrap');
  if (activeOnSelected) {
    renderActiveWorkout();
    // Active-Mode: Button schreibt in Workout + Plan-Tag (wie bisher)
    addWrap.style.display = '';
    addWrap.innerHTML = `<button class="btn btn-ghost btn-full" onclick="openAddExModal('active')">+ Übung hinzufügen</button>`;
    if (!timerInterval) startTimer();
  } else if (planDay) {
    renderPreviewWorkout(planDay);
    // Preview-Mode: Button schreibt nur in den Plan-Tag (kein aktives Workout vorhanden)
    addWrap.style.display = '';
    addWrap.innerHTML = `<button class="btn btn-ghost btn-full" onclick="openAddExModal('preview')">+ Übung zum Trainingstag hinzufügen</button>`;
    stopTimer();
  } else {
    document.getElementById('ex-tab-bar').innerHTML = '';
    document.getElementById('active-ex-list').innerHTML = '';
    addWrap.style.display = 'none';
    stopTimer();
  }

  syncWorkoutActiveUI();
  checkStickyBar();
}

// Zeilenzahl fuer die zweispaltige Uebungsliste im Querformat. Das Grid fuellt
// spaltenweise; ohne diesen Wert wuesste es nicht, wo die erste Spalte endet.
// Im Hochformat ohne Wirkung, dort ist die Liste kein Grid.
function _setzeUebungsSpalten(container, anzahl) {
  if (container) container.style.setProperty('--ex-rows', Math.max(1, Math.ceil(anzahl / 2)));
}

function renderPreviewWorkout(planDay, mode = 'preview', containerId = 'active-ex-list') {
  // (Mini-Kacheln im Workouts-Tab wurden entfernt)
  if (mode !== 'libday') document.getElementById('ex-tab-bar').innerHTML = '';

  // Cards (read-only target view). mode='libday' rendert dieselben Cards für einen
  // Bibliotheks-Trainingstag in den Container `containerId` (Drag&Drop/Add routen zum Lib-Tag).
  _setzeUebungsSpalten(document.getElementById(containerId), planDay.exercises.length);
  document.getElementById(containerId).innerHTML = planDay.exercises.map((pe, ei) => {
    const ex = getEx(pe.exId);
    if (!ex) return '';
    const col = colorForExercise({ exId: pe.exId });
    const last = getLastExData(pe.exId);
    const lastStr = last ? `Zuletzt: ${last.sets.length}×${last.sets[0]?.reps||'?'} @ ${last.maxWeight} kg` : '';
    const exIdKey = pe.exId;
    const collapsedCls = isAexExpanded(exIdKey) ? '' : 'collapsed';
    // Pro-Satz-Tabelle als ZEILEN (je Satz eine Zeile: Wdh | kg). Werte: „letzte Einheit gewinnt"
    // (displaySetsForPe); Übernahme auf nachfolgende Sätze ist feld-spezifisch (Wdh→Wdh, kg→kg).
    const ptSets = displaySetsForPe(pe, last);
    const ptRows = ptSets.map((s, si) => `<div class="aex-v2-srow">
            <span class="aex-v2-snum">${si+1}</span>
            <div class="aex-v2-inp" style="--c:${col.c}" role="button" tabindex="0"
                 data-np-ctx="preview" data-np-day="${planDay.id}" data-np-mode="${mode}" data-np-ei="${ei}" data-np-si="${si}" data-np-field="reps" data-np-label="${escapeHtml(ex.name)}"
                 aria-label="Wiederholungen Satz ${si+1}" onclick="openNumpadFromInput(this)">${s.reps === '' ? '–' : s.reps}</div>
            <div class="aex-v2-inp" style="--c:${col.c}" role="button" tabindex="0"
                 data-np-ctx="preview" data-np-day="${planDay.id}" data-np-mode="${mode}" data-np-ei="${ei}" data-np-si="${si}" data-np-field="weight" data-np-label="${escapeHtml(ex.name)}"
                 aria-label="Gewicht Satz ${si+1}" onclick="openNumpadFromInput(this)">${s.weight === '' ? '–' : s.weight}</div>
          </div>`).join('');
    return `<div class="aex-v2 ${collapsedCls}" id="aex-${ei}" style="--c:${col.c};--c-bg:${col.bg}"
                 ondragstart="aexDragStart(event,${ei},'${mode}','${planDay.id}')"
                 ondragend="aexDragEnd(event)"
                 ondragover="aexDragOver(event,${ei})"
                 ondragleave="aexDragLeave(event)"
                 ondrop="aexDrop(event,${ei})">
      <div class="aex-v2-header" onclick="toggleAexCollapse('${exIdKey}', event)">
        <span class="aex-drag-handle"
              onpointerdown="event.currentTarget.closest('.aex-v2').draggable=true"
              onpointerup="event.currentTarget.closest('.aex-v2').draggable=false">≡</span>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
        <div class="aex-v2-num">${ei+1}</div>
        <div class="aex-v2-info">
          <div class="aex-v2-name">${ex.name}</div>
          ${lastStr ? `<div class="aex-v2-last">${lastStr}</div>` : ''}
        </div>
      </div>
      <div class="aex-v2-body">
        <div class="aex-v2-table">
          <div class="aex-v2-srow head"><span>Satz</span><span>Wdh.</span><span>kg</span></div>
          ${ptRows}
        </div>
        <div class="aex-v2-notes-col">
          <button class="aex-v2-details" onclick="openExDetail('${ex.id}')">Details<span>›</span></button>
          <div class="aex-v2-notes">
            <textarea class="aex-v2-notes-area" data-ex-id="${ex.id}" placeholder="Notizen"
                      onchange="saveExerciseNote('${ex.id}', this.value)">${ex.notes || ''}</textarea>
          </div>
        </div>
      </div>
      <div class="aex-v2-actions">
        <button class="btn btn-ghost btn-sm" onclick="addPreviewSet('${planDay.id}',${ei},'${mode}')">+ Satz</button>
        ${ptSets.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="removePreviewSet('${planDay.id}',${ei},'${mode}')">− Satz</button>` : ''}
        ${mode === 'libday' ? `<button class="btn btn-ghost btn-sm aex-skip-btn" onclick="removeLibDayExercise(${ei})">Übung entfernen</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

// Pro-Satz-Ziel editieren (Wdh/kg) in den Vorschau-Karten (Workouts-Vorschau + Trainingstag-Detail).
// Vorbefüllen: der geänderte Wert wird auf alle NACHFOLGENDEN Sätze übernommen (bleiben einzeln
// editierbar). Beide Modi editieren denselben globalen Bibliothek-Tag (planDay.id = globale Tag-ID).
// Anzeige-Werte der Pro-Satz-Tabelle in Vorschau/Bibliothek: „letzte Einheit gewinnt", solange die
// letzte ABGESCHLOSSENE Einheit neuer ist als die letzte manuelle Bearbeitung (pe.setsUpdatedAt) —
// sonst die gespeicherten Tag-Werte. Satz-Anzahl = die des Tags; je Satz aus der letzten Einheit
// vorbefüllt (sonst gespeicherter Wert). last = getLastExData(pe.exId).
function displaySetsForPe(pe, last) {
  const base = peSets(pe);
  const useLast = last && Array.isArray(last.sets) && (last.date || 0) > (pe.setsUpdatedAt || 0);
  if (!useLast) return base.map(s => ({ reps: s.reps, weight: s.weight }));
  return base.map((s, i) => {
    const ls = last.sets[i];
    return {
      reps:   (ls && ls.reps   != null && String(ls.reps)   !== '') ? String(ls.reps)   : s.reps,
      weight: (ls && ls.weight != null && String(ls.weight) !== '') ? String(ls.weight) : s.weight,
    };
  });
}
function _withPreviewDayEx(dayId, ei, fn, mode) {
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === dayId);
  if (!day || !Array.isArray(day.exercises) || !day.exercises[ei]) return;
  fn(day.exercises[ei]);
  DB.saveTrainingDays(days);
  syncActiveWorkoutWithPlanDay(dayId);
  if (mode === 'libday') renderLibDayDetail();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
}
function updatePreviewSetTarget(dayId, ei, si, field, value, mode) {
  const v = (field === 'reps')
    ? String(value).replace(/[^\d]/g, '')
    : String(value).replace(',', '.').replace(/[^\d.]/g, '');
  _withPreviewDayEx(dayId, ei, (pe) => {
    // aktuelle Anzeige (letzte Einheit bzw. gespeichert) als Basis fixieren, dann Änderung anwenden →
    // ab jetzt „gewinnen" die eigenen Werte (setsUpdatedAt = jetzt), bis es eine neuere Einheit gibt.
    pe.sets = displaySetsForPe(pe, getLastExData(pe.exId)).map(s => ({ reps: s.reps, weight: s.weight }));
    if (!pe.sets[si]) return;
    pe.sets[si][field] = v;
    for (let k = si + 1; k < pe.sets.length; k++) pe.sets[k][field] = v; // NUR dasselbe Feld (Wdh→Wdh, kg→kg)
    pe.setsUpdatedAt = Date.now();
    _syncPeScalars(pe);
  }, mode);
}
function addPreviewSet(dayId, ei, mode) {
  _withPreviewDayEx(dayId, ei, (pe) => {
    pe.sets = displaySetsForPe(pe, getLastExData(pe.exId)).map(s => ({ reps: s.reps, weight: s.weight }));
    if (pe.sets.length >= 12) return;
    const lastS = pe.sets[pe.sets.length - 1] || { reps: '8', weight: '' };
    pe.sets.push({ reps: lastS.reps, weight: lastS.weight });
    pe.setsUpdatedAt = Date.now();
    _syncPeScalars(pe);
  }, mode);
}
function removePreviewSet(dayId, ei, mode) {
  _withPreviewDayEx(dayId, ei, (pe) => {
    pe.sets = displaySetsForPe(pe, getLastExData(pe.exId)).map(s => ({ reps: s.reps, weight: s.weight }));
    if (pe.sets.length <= 1) return;
    pe.sets.pop();
    pe.setsUpdatedAt = Date.now();
    _syncPeScalars(pe);
  }, mode);
}

function renderActiveWorkout() {
  const wo = DB.getActive();
  if (!wo) return;

  // (Mini-Kacheln im Workouts-Tab wurden entfernt)
  document.getElementById('ex-tab-bar').innerHTML = '';

  // Ist keine Karte offen (frisch gestartet oder App zwischendurch neu geladen), die nächste
  // unerledigte Übung aufklappen. Der Klappzustand lebt nur im Speicher — ohne das stünde man
  // nach einem Neustart mitten im Training wieder vor lauter zugeklappten Karten.
  ensureActiveExpanded(wo);

  // Exercise cards
  _setzeUebungsSpalten(document.getElementById('active-ex-list'), wo.exercises.length);
  document.getElementById('active-ex-list').innerHTML = wo.exercises.map((ex, ei) => {
    const col = colorForExercise(ex);
    const last = getLastExData(ex.exId || ex.id);
    const lastStr = last ? `Zuletzt: ${last.sets.length}×${last.sets[0]?.reps||'?'} @ ${last.maxWeight} kg` : '';
    // Einordnung der heutigen Eingaben: Bestleistung der Übung und — sobald das heutige
    // Höchstgewicht über der letzten Einheit liegt — die Differenz dazu. Progressive
    // Steigerung ist der Zweck des Tagebuchs; das Rechnen dafür gehört nicht in den Kopf.
    const prW = getExercisePR(ex.exId || ex.id);
    const todayMax = Math.max(0, ...(ex.sets || []).map(s => parseFloat(s.weight) || 0));
    const diffToLast = (last && todayMax > 0) ? +(todayMax - last.maxWeight).toFixed(1) : 0;
    const cmpParts = [];
    if (prW) cmpParts.push(`<span class="aex-cmp-pr">Best ${prW} kg</span>`);
    if (diffToLast > 0) cmpParts.push(`<span class="aex-cmp-up">+${diffToLast} kg zur letzten Einheit</span>`);
    else if (diffToLast < 0) cmpParts.push(`<span class="aex-cmp-down">${diffToLast} kg zur letzten Einheit</span>`);
    const cmpStr = cmpParts.length ? `<div class="aex-v2-cmp">${cmpParts.join('')}</div>` : '';
    // Pro-Satz-Tabelle als ZEILEN: je Satz eine Zeile (Wdh | kg | Haken); erledigte Sätze sind
    // gesperrt/markiert. Der Haken ist im Training die wichtigste Interaktion — er beantwortet
    // „welcher Satz kommt jetzt?" und startet die Satzpause.
    const setRows = ex.sets.map((s, si) => `<div class="aex-v2-srow${s.done ? ' set-done' : ''}">
            <span class="aex-v2-snum">${si+1}</span>
            <div class="aex-v2-inp ${s.done?'done-inp is-disabled':''}" style="--c:${col.c}" role="button" tabindex="${s.done?-1:0}"
                 data-np-ctx="active" data-np-ei="${ei}" data-np-si="${si}" data-np-field="reps" data-np-label="${escapeHtml(ex.name)}"
                 aria-label="Wiederholungen Satz ${si+1}" onclick="openNumpadFromInput(this)">${s.reps === '' ? '–' : s.reps}</div>
            <div class="aex-v2-inp ${s.done?'done-inp is-disabled':''}" style="--c:${col.c}" role="button" tabindex="${s.done?-1:0}"
                 data-np-ctx="active" data-np-ei="${ei}" data-np-si="${si}" data-np-field="weight" data-np-label="${escapeHtml(ex.name)}"
                 aria-label="Gewicht Satz ${si+1}" onclick="openNumpadFromInput(this)">${s.weight === '' ? '–' : s.weight}</div>
            <button class="aex-v2-setcheck${s.done ? ' on' : ''}" onclick="event.stopPropagation();toggleSetDone(${ei},${si})"
                    aria-label="Satz ${si+1} ${s.done ? 'wieder öffnen' : 'als erledigt markieren'}" aria-pressed="${s.done ? 'true' : 'false'}">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>`).join('');

    const stateCls = ex.done ? 'done' : (ex.skipped ? 'skipped' : '');
    const exIdKey = ex.exId || ex.id;
    const collapsedCls = isAexExpanded(exIdKey) ? '' : 'collapsed';
    return `<div class="aex-v2 ${stateCls} ${collapsedCls}" id="aex-${ei}" style="--c:${col.c};--c-bg:${col.bg}"
                 ondragstart="aexDragStart(event,${ei},'active')"
                 ondragend="aexDragEnd(event)"
                 ondragover="aexDragOver(event,${ei})"
                 ondragleave="aexDragLeave(event)"
                 ondrop="aexDrop(event,${ei})">
      <div class="aex-v2-header" onclick="toggleAexCollapse('${exIdKey}', event)">
        <span class="aex-drag-handle"
              onpointerdown="event.currentTarget.closest('.aex-v2').draggable=true"
              onpointerup="event.currentTarget.closest('.aex-v2').draggable=false">≡</span>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
        <div class="aex-v2-num">${ei+1}</div>
        <div class="aex-v2-info">
          <div class="aex-v2-name">${ex.name}</div>
          ${lastStr ? `<div class="aex-v2-last">${lastStr}</div>` : ''}
          ${cmpStr}
        </div>
        <label class="aex-v2-done ${ex.done?'checked':''}" title="Ganze Übung als erledigt markieren">
          <input type="checkbox" aria-label="Ganze Übung als erledigt markieren" ${ex.done?'checked':''} onchange="toggleExDone(${ei},this.checked)">
          <div class="aex-v2-done-box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
        </label>
      </div>
      <div class="aex-v2-body">
        <div class="aex-v2-table">
          <div class="aex-v2-srow head"><span>Satz</span><span>Wdh.</span><span>kg</span><span></span></div>
          ${setRows}
        </div>
        <div class="aex-v2-notes-col">
          <button class="aex-v2-details" onclick="openExDetail('${ex.exId || ex.id}')">Details<span>›</span></button>
          <div class="aex-v2-notes">
            <textarea class="aex-v2-notes-area" data-ex-id="${ex.exId || ex.id}" placeholder="Notizen"
                      onchange="updateNotes(${ei},this.value)">${(getEx(ex.exId || ex.id)?.notes) || ''}</textarea>
          </div>
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

// ─── Ein/Aus-Klapp-State der Workout-Tab-Cards ─────────────────────
// Default: alle Cards eingeklappt. Klick auf den Card-Header togglet
// fuer die jeweilige Uebung (per exId). State ist in-memory pro Session.
const expandedAexIds = new Set();
function isAexExpanded(exId) { return expandedAexIds.has(exId); }
// Hat der Nutzer die letzte offene Karte selbst zugeklappt, bleibt alles zu — sonst würde
// sich die Karte sofort wieder öffnen und ließe sich nicht schließen.
let _aexUserClosedAll = false;
// Sorgt dafür, dass im laufenden Training die nächste unerledigte Übung offen ist.
function ensureActiveExpanded(wo) {
  if (!wo || !Array.isArray(wo.exercises) || _aexUserClosedAll) return;
  const open = wo.exercises.some(e => expandedAexIds.has(e.exId || e.id));
  if (open) return;
  const next = wo.exercises.find(e => !e.done && !e.skipped);
  if (next) expandedAexIds.add(next.exId || next.id);
}
function toggleAexCollapse(exId, ev) {
  if (ev) {
    // Klicks auf Drag-Handle / Erledigt-Checkbox sollen NICHT togglen
    const t = ev.target;
    if (t.closest && (t.closest('.aex-drag-handle') || t.closest('.aex-v2-done'))) return;
  }
  if (expandedAexIds.has(exId)) expandedAexIds.delete(exId);
  else expandedAexIds.add(exId);
  // Merken, ob der Nutzer bewusst alles zugeklappt hat (siehe ensureActiveExpanded)
  _aexUserClosedAll = expandedAexIds.size === 0;
  if (currentScreen === 'workouts') renderWorkoutsScreen();
  else if (currentScreen === 'day-detail') renderLibDayDetail();
}
// SVG-Chevron-Snippet fuer die Card-Header (gemeinsame Konstante)
const AEX_CHEV_SVG = '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';

// ─── Zahlenblock ───────────────────────────────────────────────────
// Eigener Eingabeblock statt der iOS-Tastatur: große Tasten, Schnellschritte und
// keine Systemtastatur, die den halben Bildschirm verdeckt. Die Felder selbst sind
// readonly — ein Tipp öffnet dieses Sheet, der Wert wird beim Schließen übernommen.
let npState = null;   // { field, value, fresh, commit }

function openNumpadFromInput(el) {
  // Die Felder sind bewusst <div> und kein <input>: iOS zoomt beim Fokussieren eines
  // Eingabefelds automatisch hinein. Ohne Eingabefeld gibt es nichts zu fokussieren.
  if (!el || el.classList.contains('is-disabled')) return;
  const d = el.dataset;
  const field = d.npField;                       // 'reps' | 'weight'
  const isWeight = field === 'weight';
  const ctx = d.npCtx;                           // 'active' | 'preview'
  const ei = parseInt(d.npEi), si = parseInt(d.npSi);

  const commit = (val) => {
    if (ctx === 'active') {
      updateSet(ei, si, field, val);
      renderWorkoutsScreen();
    } else {
      updatePreviewSetTarget(d.npDay, ei, si, field, val, d.npMode);
    }
  };

  const shown = (el.textContent || '').trim();
  npState = { field, value: (shown === '–' ? '' : shown), fresh: true, commit };
  document.getElementById('np-title').textContent = d.npLabel || '';
  document.getElementById('np-sub').textContent =
    `Satz ${si + 1} · ${isWeight ? 'Gewicht' : 'Wiederholungen'}`;
  document.getElementById('np-unit').textContent = isWeight ? 'kg' : '×';
  document.getElementById('np-key-dot').style.visibility = isWeight ? '' : 'hidden';

  const steps = isWeight ? [-5, -2.5, 2.5, 5] : [-2, -1, 1, 2];
  document.getElementById('np-quick').innerHTML = steps.map(s =>
    `<button class="np-quick-btn" onclick="npStep(${s})">${s > 0 ? '+' : '−'}${Math.abs(s)}</button>`
  ).join('');

  npRenderValue();
  openModal('modal-numpad');
}

function npRenderValue() {
  const el = document.getElementById('np-value');
  if (el && npState) el.textContent = (npState.value === '' ? '–' : npState.value);
}

function npTap(key) {
  if (!npState) return;
  if (key === 'del') {
    npState.value = npState.value.slice(0, -1);
    npState.fresh = false;
  } else if (key === '.') {
    if (npState.fresh) { npState.value = '0'; npState.fresh = false; }
    if (!npState.value.includes('.')) npState.value += '.';
  } else {
    // Erste Ziffer ersetzt den alten Wert — beim Ändern von 60 auf 65 will niemand erst löschen.
    if (npState.fresh) { npState.value = ''; npState.fresh = false; }
    const dot = npState.value.indexOf('.');
    const decimals = dot >= 0 ? npState.value.length - dot - 1 : 0;
    if (decimals >= 2) return;                                  // höchstens zwei Nachkommastellen
    if (npState.value.replace('.', '').length < 5) npState.value += key;
  }
  npRenderValue();
}

function npStep(delta) {
  if (!npState) return;
  const cur = parseFloat(npState.value.replace(',', '.')) || 0;
  const next = Math.max(0, Math.round((cur + delta) * 100) / 100);
  npState.value = String(next);
  // Der Schritt schließt die Eingabe ab: Eine danach getippte Ziffer beginnt neu,
  // sonst entstünde aus „+2.5" und einer 6 der Unsinnswert 82.56.
  npState.fresh = true;
  npRenderValue();
}

function closeNumpad() {
  const st = npState;
  npState = null;
  closeModal('modal-numpad');
  if (!st) return;
  // Trailing-Punkt abschneiden ("62." → "62")
  let v = st.value.replace(',', '.');
  if (v.endsWith('.')) v = v.slice(0, -1);
  st.commit(v);
}

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
  // Nachfolgende (nicht erledigte) Felder ohne Full-Re-Render aktualisieren (Fokus bleibt erhalten).
  // Neues Zeilen-Layout: je Satz zwei Inputs in DOM-Reihenfolge [Wdh, kg] → idx/2 = Satz, idx%2: 0=Wdh, 1=kg.
  document.querySelectorAll(`.aex-v2[id="aex-${ei}"] .aex-v2-inp`).forEach((inp, idx) => {
    const setIdx = Math.floor(idx / 2);
    const isReps = (idx % 2 === 0);
    if (setIdx <= si) return;                               // frühere/aktuellen Satz nicht anfassen
    if (!ex.sets[setIdx] || ex.sets[setIdx].done) return;   // erledigte Sätze nicht anfassen
    const shown = (value === '' ? '–' : value);
    if (isReps && field === 'reps')    inp.textContent = shown;
    if (!isReps && field === 'weight') inp.textContent = shown;
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
  // Alle Sätze mit abhaken bzw. wieder öffnen
  if (Array.isArray(wo.exercises[ei].sets)) {
    wo.exercises[ei].sets.forEach(s => s.done = checked);
  }
  // Card-Collapse-Flow: erledigte Card einklappen (User-Wunsch),
  // bei checked=false (Erledigt-Haekchen rausnehmen) keine Aenderung am Set.
  if (checked) {
    const exId = wo.exercises[ei].exId || wo.exercises[ei].id;
    expandedAexIds.delete(exId);
  }
  DB.saveActive(wo);
  renderWorkoutsScreen();

  // Auto-Expand der naechsten unerledigten Card — KEIN Scroll mehr (User-Wunsch).
  if (checked) {
    setTimeout(() => { expandNextExercise(); }, 50);
  }
}

// Einzelnen Satz abhaken. Kern-Interaktion im Training: markiert den Satz als erledigt,
// startet die Satzpause und hakt die Übung automatisch ab, sobald alle Sätze stehen.
function toggleSetDone(ei, si) {
  const wo = DB.getActive();
  if (!wo) return;
  const ex = wo.exercises[ei];
  if (!ex || !Array.isArray(ex.sets) || !ex.sets[si]) return;
  const nowDone = !ex.sets[si].done;
  ex.sets[si].done = nowDone;

  const allDone = ex.sets.length > 0 && ex.sets.every(s => s.done);
  ex.done = allDone;
  if (allDone) ex.skipped = false;
  const exId = ex.exId || ex.id;
  if (allDone) expandedAexIds.delete(exId);

  // Bestleistung feiern, sobald die ÜBUNG komplett steht — nicht nach jedem einzelnen
  // Satz. Zwischen den Sätzen wäre die Animation eine Unterbrechung; am Ende der Übung
  // ist sie der Abschluss. Gewertet wird der schwerste Satz der Übung.
  if (allDone && !ex.prCelebrated) {
    const best = ex.sets.reduce((m, s) => Math.max(m, parseFloat(String(s.weight).replace(',', '.')) || 0), 0);
    const prevBest = getExercisePR(exId) || 0;   // bestes Gewicht aus GESPEICHERTEN Einheiten
    if (best > 0 && best > prevBest) {
      ex.prCelebrated = true;
      celebratePR(ex.name, best, prevBest);
    }
  }

  DB.saveActive(wo);
  renderWorkoutsScreen();

  // Satzpause läuft nur ZWISCHEN Sätzen einer Übung. Nach dem letzten Satz gibt es nichts
  // mehr abzuwarten — dort folgt der Wechsel zur nächsten Übung, nicht die nächste Wdh.
  const stillOpen = ex.sets.some(s => !s.done);
  if (nowDone && stillOpen) startRestTimer(exId, ex.name);
  else if (allDone) stopRestTimer(true);   // letzten Satz früher abgehakt → laufende Pause beenden
  // Übung fertig → nächste offene Card aufklappen (gleiche Mechanik wie beim Erledigt-Haken)
  if (allDone) setTimeout(() => { expandNextExercise(); }, 50);
}

// ─── Bestleistungs-Moment ──────────────────────────────────────────
// Kurze Feier direkt beim Abhaken des Satzes. Der Rekord passiert im Training,
// nicht in der Auswertung — also gehört die Rückmeldung auch dorthin.
function celebratePR(name, weight, prev) {
  if (navigator.vibrate) navigator.vibrate([40, 60, 120]);
  const diff = prev > 0 ? weight - prev : 0;
  showToast(`Bestleistung: ${fmtKg(weight)} kg${diff > 0 ? ` (+${fmtKg(diff)})` : ''} — ${name}`);

  // Wer Bewegung reduziert haben möchte, bekommt nur die Meldung.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const burst = document.createElement('div');
  burst.className = 'pr-burst';
  const colors = ['#F59E0B', '#10B981', '#0EA5E9', '#F43F5E', '#FACC15'];
  let html = '';
  for (let i = 0; i < 22; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.35;
    const dur = 1.1 + Math.random() * 0.7;
    const rot = Math.floor(Math.random() * 360);
    const c = colors[i % colors.length];
    const size = 6 + Math.floor(Math.random() * 6);
    html += `<i style="left:${left}%;background:${c};width:${size}px;height:${size * 1.6}px;
             animation-delay:${delay}s;animation-duration:${dur}s;transform:rotate(${rot}deg)"></i>`;
  }
  burst.innerHTML = html;
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 2200);
}

// Gewichtsangabe mit Punkt als Dezimaltrenner (Leonard-Wunsch, 20.08.2026) — deshalb
// bewusst KEIN toLocaleString('de-DE'), das würde ein Komma setzen.
function fmtKg(v) {
  return String(Math.round(v * 100) / 100);
}

// Bestleistung als Bild sichern/teilen. Auf dem iPhone öffnet das das Teilen-Menü,
// sonst wird die Datei heruntergeladen.
function sharePRCard(name, weight, prev, dateTs) {
  const W = 1080, H = 1350;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');

  c.fillStyle = '#0F172A'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#10B981';
  c.fillRect(0, 0, W, 10);

  c.textAlign = 'center';
  c.fillStyle = '#5DBBA8';
  c.font = '600 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  c.fillText('N E U E   B E S T L E I S T U N G', W/2, 300);

  c.fillStyle = '#FFFFFF';
  c.font = '800 190px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  c.fillText(`${fmtKg(weight)} kg`, W/2, 500);

  c.fillStyle = '#CBD5E1';
  c.font = '500 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  // Lange Übungsnamen umbrechen statt abschneiden
  const words = String(name).split(' ');
  let line = '', y = 590;
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (c.measureText(test).width > W - 160 && line) { c.fillText(line, W/2, y); y += 60; line = word; }
    else line = test;
  });
  if (line) c.fillText(line, W/2, y);

  c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(120, y + 90); c.lineTo(W - 120, y + 90); c.stroke();

  const diff = prev > 0 ? weight - prev : 0;
  c.fillStyle = '#94A3B8';
  c.font = '500 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  c.fillText(diff > 0 ? `+${fmtKg(diff)} kg zum bisherigen Rekord` : 'Erster Eintrag für diese Übung', W/2, y + 170);
  c.fillText(new Date(dateTs || Date.now()).toLocaleDateString('de-DE', { day:'numeric', month:'long', year:'numeric' }), W/2, y + 240);

  c.fillStyle = '#475569';
  c.font = '700 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  c.fillText('FitTrack', W/2, H - 90);

  cv.toBlob(async (blob) => {
    if (!blob) { showToast('Bild konnte nicht erstellt werden'); return; }
    const file = new File([blob], 'bestleistung.png', { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (e) { /* Teilen abgebrochen → auf Download zurückfallen */ }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bestleistung.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

// ─── Satzpause ─────────────────────────────────────────────────────
// Läuft nach jedem abgehakten Satz und startet IMMER bei 1:30. −30/+30 und „Reset"
// wirken nur auf die gerade laufende Pause; der nächste Satz beginnt wieder bei 1:30.
const REST_DEFAULT_SEC = 90;
let restState = null;     // { exId, name, endTs, total, interval }

function startRestTimer(exId, name) {
  hideRestDone();
  const total = REST_DEFAULT_SEC;
  stopRestTimer(/*silent*/ true);
  restState = { exId, name: name || '', endTs: Date.now() + total * 1000, total, interval: null };
  renderRestBar();
  restState.interval = setInterval(tickRestTimer, 250);
}

// ── Signal am Ende der Satzpause ──────────────────────────────────────────────
// ACHTUNG: `navigator.vibrate` gibt es auf dem iPhone NICHT — Safari unterstuetzt die
// Vibration-API auf keiner Plattform. Dort traegt allein der Ton, und der schweigt, wenn
// der Klingelschalter auf lautlos steht. Deshalb zusaetzlich eine sichtbare Meldung:
// Eines der drei Signale erreicht praktisch jede Situation.
let _audioCtx = null;
function _audioContext() {
  if (_audioCtx) return _audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try { _audioCtx = new AC(); } catch { return null; }
  return _audioCtx;
}

// iOS gibt Ton erst frei, wenn der Audio-Kontext aus einer echten Nutzergeste heraus
// entsperrt wurde. Darum bei jeder Beruehrung nachfassen, solange er schlaeft — der
// erste Satz-Haken einer Einheit erledigt das lange vor der ersten Pause.
function initAudioUnlock() {
  document.addEventListener('pointerdown', () => {
    const ctx = _audioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }, { passive: true });
}

// Kurzer Zweiklang statt eines einzelnen Piepsers: zwischen Musik und Geraetelaerm geht
// ein einzelner Ton unter.
function playRestDoneSound() {
  const ctx = _audioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const t0 = ctx.currentTime;
  [[880, 0], [1320, 0.17]].forEach(([hz, versatz]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.0001, t0 + versatz);
    gain.gain.exponentialRampToValueAtTime(0.3, t0 + versatz + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + versatz + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t0 + versatz);
    osc.stop(t0 + versatz + 0.16);
  });
}

// „Pause vorbei" bleibt kurz stehen — ohne das verschwindet die Leiste kommentarlos und
// man weiss nicht, ob die Pause abgelaufen oder versehentlich abgebrochen wurde.
let _restDoneTimeout = null;
const REST_DONE_MS = 5000;
function showRestDone() {
  const bar = document.getElementById('rest-bar');
  if (!bar) return;
  bar.innerHTML = `
    <div class="rest-bar-inner rest-bar-done-row">
      <span class="rest-bar-time">Pause vorbei</span>
      <button class="rest-bar-btn rest-bar-close" onclick="hideRestDone()" aria-label="Ausblenden">✕</button>
    </div>`;
  bar.classList.add('show', 'done');
  clearTimeout(_restDoneTimeout);
  _restDoneTimeout = setTimeout(hideRestDone, REST_DONE_MS);
}
function hideRestDone() {
  clearTimeout(_restDoneTimeout);
  _restDoneTimeout = null;
  const bar = document.getElementById('rest-bar');
  if (bar) { bar.classList.remove('show', 'done'); bar.innerHTML = ''; }
}

function tickRestTimer() {
  if (!restState) return;
  const left = Math.round((restState.endTs - Date.now()) / 1000);
  if (left <= 0) {
    if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
    playRestDoneSound();
    stopRestTimer(true);
    showRestDone();
    return;
  }
  renderRestBar();
}

function stopRestTimer(silent) {
  if (restState && restState.interval) clearInterval(restState.interval);
  restState = null;
  renderRestBar();
  if (!silent) { /* Ende ohne Toast — die Vibration reicht, der Blick ist auf der Hantel */ }
}

// Laufende Pause verlängern/verkürzen — gilt nur für diese eine Pause.
function adjustRest(deltaSec) {
  if (!restState) return;
  const left = Math.max(0, Math.round((restState.endTs - Date.now()) / 1000));
  const newLeft = Math.max(5, left + deltaSec);
  restState.endTs = Date.now() + newLeft * 1000;
  restState.total = Math.max(restState.total, newLeft);
  renderRestBar();
}

// Laufende Pause auf die Vorgabe (1:30) zurücksetzen.
function resetRest() {
  if (!restState) return;
  restState.endTs = Date.now() + REST_DEFAULT_SEC * 1000;
  restState.total = REST_DEFAULT_SEC;
  renderRestBar();
}

function renderRestBar() {
  const bar = document.getElementById('rest-bar');
  if (!bar) return;
  if (!restState) { bar.classList.remove('show'); bar.innerHTML = ''; return; }
  const left = Math.max(0, Math.round((restState.endTs - Date.now()) / 1000));
  const pct = restState.total > 0 ? Math.max(0, Math.min(100, left / restState.total * 100)) : 0;
  bar.classList.remove('done');
  bar.innerHTML = `
    <div class="rest-bar-fill" style="width:${pct}%"></div>
    <div class="rest-bar-inner">
      <span class="rest-bar-time">${fmtTimer(left)}</span>
      <button class="rest-bar-btn" onclick="adjustRest(-30)" aria-label="30 Sekunden kürzer">−30</button>
      <button class="rest-bar-btn" onclick="adjustRest(30)" aria-label="30 Sekunden länger">+30</button>
      <button class="rest-bar-btn" onclick="resetRest()" aria-label="Pause auf 1:30 zurücksetzen">Reset</button>
      <button class="rest-bar-btn rest-bar-close" onclick="stopRestTimer()" aria-label="Pause beenden">✕</button>
    </div>`;
  bar.classList.add('show');
}

function skipExercise(ei) {
  const wo = DB.getActive();
  if (!wo) return;
  wo.exercises[ei].skipped = true;
  wo.exercises[ei].done = false;     // mutually exclusive
  // Card-Collapse: uebersprungene Card analog zu Erledigt zuklappen
  const exId = wo.exercises[ei].exId || wo.exercises[ei].id;
  expandedAexIds.delete(exId);
  DB.saveActive(wo);
  renderWorkoutsScreen();
  // Auto-Expand der naechsten unerledigten Card — KEIN Scroll (analog zu Erledigt).
  setTimeout(() => { expandNextExercise(); }, 50);
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
  } else if (aexDragState.mode === 'libday' && aexDragState.dayId) {
    const days = DB.getTrainingDays();
    const day = days.find(d => d.id === aexDragState.dayId);
    if (day) {
      const [moved] = day.exercises.splice(fromIdx, 1);
      if (insertIdx > day.exercises.length) insertIdx = day.exercises.length;
      day.exercises.splice(insertIdx, 0, moved);
      DB.saveTrainingDays(days);
    }
  }
  const wasLibday = aexDragState.mode === 'libday';
  aexDragState = null;
  if (wasLibday) renderLibDayDetail();
  else renderWorkoutsScreen();
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

// Klappt die naechste unerledigte/nicht-uebersprungene Card auf (falls noch zu).
// Re-rendert nur wenn sich der Collapse-State tatsaechlich aendert. Kein Scroll.
function expandNextExercise() {
  const wo = DB.getActive();
  if (!wo) return -1;
  const nextIdx = wo.exercises.findIndex(e => !e.done && !e.skipped);
  if (nextIdx < 0) return -1;
  const nextEx = wo.exercises[nextIdx];
  const nextExId = nextEx.exId || nextEx.id;
  if (!isAexExpanded(nextExId)) {
    expandedAexIds.add(nextExId);
    renderWorkoutsScreen();
  }
  return nextIdx;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
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
  syncWorkoutActiveUI();
  const wo = DB.getActive();
  if (!wo) { stopTimer(); return; }
  const elapsed = Math.floor(getElapsedMs(wo) / 1000);
  const t = '• ' + fmtTimer(elapsed);
  document.querySelectorAll('.hero-v2-timer').forEach(el => el.textContent = t);
}

// App-weite "Workout läuft"-Signale (Mini-Leiste + Akzent-Glow) mit dem Aktiv-Status
// synchron halten. Status-Klasse auf <html>, da body.className bei jedem Tab-Wechsel neu
// gesetzt wird (eine body-Klasse ginge verloren).
function _woTimerText() {
  const wo = DB.getActive();
  return wo ? fmtTimer(Math.floor(getElapsedMs(wo) / 1000)) : '';
}

// Zeit in der Laufanzeige: Der Doppelpunkt steckt in einem eigenen Element und blinkt
// im Sekundentakt — er ersetzt den früher dauerhaft pulsierenden Punkt.
// ACHTUNG: Die Anzeige wird JEDE SEKUNDE aufgefrischt. Würde dabei das innerHTML neu
// geschrieben, entstünde jedes Mal ein neues Element und die Blink-Animation begänne von
// vorn — sichtbar als Stottern. Darum wird die Struktur nur bei einem Formatwechsel
// (m:ss ↔ h:mm:ss) neu gebaut, sonst nur der Text der Ziffernfelder gesetzt.
function _woTimerRender(el) {
  const teile = _woTimerText().split(':');
  if (el.children.length !== teile.length * 2 - 1) {
    el.innerHTML = teile.map(() => '<span></span>').join('<span class="wab-colon">:</span>');
  }
  let i = 0;
  for (const kind of el.children) {
    if (!kind.classList.contains('wab-colon')) kind.textContent = teile[i++];
  }
}

// Abgehakte Sätze der laufenden Einheit gegen die Gesamtzahl — die Pille zeigt damit
// den Stand, ohne dass man in den Trainings-Tab wechseln muss.
function _woSatzStand(wo) {
  let gesamt = 0, fertig = 0;
  (wo.exercises || []).forEach(ex => {
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    gesamt += sets.length;
    fertig += sets.filter(s => s.done).length;
  });
  return gesamt ? `${fertig}/${gesamt}` : '';
}
function syncWorkoutActiveUI() {
  const wo = DB.getActive();
  const active = !!wo;
  document.documentElement.classList.toggle('workout-active', active);
  // Läuft eine Einheit, blendet der Workouts-Tab den Wochenplan aus (Platz für die Sätze).
  document.documentElement.classList.toggle('wo-running', active && currentScreen === 'workouts');
  const barTimer = document.getElementById('wab-timer');
  if (active && barTimer) _woTimerRender(barTimer);
  const barSets = document.getElementById('wab-sets');
  if (active && barSets) barSets.textContent = _woSatzStand(wo);
  const sbTimer = document.getElementById('wsb-timer');
  if (active && sbTimer) sbTimer.textContent = _woTimerText();
  const sbTitle = document.getElementById('wsb-title');
  if (active && sbTitle && !sbTitle.textContent) sbTitle.textContent = wo.planDayName || 'Einheit';
  if (!active) updateStickyBar(false);
}

// Kopfleiste der laufenden Einheit ein-/ausblenden. Sichtbar, sobald die Session-Karte
// nach oben aus dem Blickfeld gescrollt ist.
function updateStickyBar(show) {
  const bar = document.getElementById('wo-sticky-bar');
  if (bar) bar.classList.toggle('show', !!show);
}
function checkStickyBar() {
  const wo = DB.getActive();
  if (!wo || currentScreen !== 'workouts') { updateStickyBar(false); return; }
  const card = document.getElementById('wo-session-card-wrap');
  if (!card) { updateStickyBar(false); return; }
  const r = card.getBoundingClientRect();
  updateStickyBar(r.bottom < 90);
  const sbTitle = document.getElementById('wsb-title');
  if (sbTitle) sbTitle.textContent = wo.planDayName || 'Einheit';
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

// wenn der User dort gerade in einem Modus arbeitet.
// Context bestimmt, wo die Uebung beim Klick landet.
// 'active'  → in den aktiven Workout-Eintrag + verlinkten Plan-Tag (wie bisher)
// 'preview' → nur in den Plan-Tag des im Workouts-Tab gerade selektierten Tages (kein Workout aktiv)
let addExContext = 'active'; // 'active' | 'preview'

function openAddExModal(context) {
  // Kontext speichern — Default 'active' fuer Rueckwaerts-Kompatibilitaet
  addExContext = (context === 'preview' || context === 'libday') ? context : 'active';
  document.getElementById('add-ex-search').value = '';
  renderAddExList('');
  openModal('modal-add-ex');
}
function filterAddEx() { renderAddExList(document.getElementById('add-ex-search').value); }

// Eigener Collapse-State fürs Add-Ex-Modal (unabhängig vom Übungen-Tab).
// Default: alle Muskelgruppen aufgeklappt (Set bleibt leer).
const collapsedAddExGroups = new Set();
function toggleAddExGroup(muscleKey) {
  if (collapsedAddExGroups.has(muscleKey)) collapsedAddExGroups.delete(muscleKey);
  else collapsedAddExGroups.add(muscleKey);
  renderAddExList(document.getElementById('add-ex-search').value);
}

function renderAddExList(q) {
  const exs = DB.getExercises();
  const query = (q || '').trim().toLowerCase();
  const byType = exs;
  // Dann optional nach Suchtext filtern
  const filtered = query
    ? byType.filter(e => e.name.toLowerCase().includes(query))
    : byType;

  // Gruppieren nach Muskelgruppe (in MUSCLE_ORDER-Reihenfolge), innerhalb alphabetisch
  const byMuscle = {};
  MUSCLE_ORDER.forEach(m => byMuscle[m] = []);
  filtered.forEach(e => { if (byMuscle[e.muscle]) byMuscle[e.muscle].push(e); });
  MUSCLE_ORDER.forEach(m => byMuscle[m].sort((a,b) => a.name.localeCompare(b.name, 'de')));

  const hasResults = MUSCLE_ORDER.some(m => byMuscle[m].length);
  if (!hasResults) {
    document.getElementById('add-ex-list').innerHTML =
      '<p style="color:var(--text3);text-align:center;padding:20px">Keine Übung gefunden</p>';
    return;
  }

  // Bei aktiver Suche: alle Gruppen mit Treffern automatisch aufgeklappt anzeigen
  // (damit Treffer sichtbar sind, ohne dass der User erst expandieren muss).
  // Ohne Suche: Standard-Collapse-State pro Gruppe respektieren.
  const groupsHTML = MUSCLE_ORDER.map(m => {
    const items = byMuscle[m];
    if (!items.length) return '';
    const meta = MUSCLE_META[m];
    const isCollapsed = !query && collapsedAddExGroups.has(m);
    const itemsHTML = items.map(e => {
      const col = muscleColor(e.muscle);
      return `<div class="sheet-item muscle-coded" style="--c:${col}" onclick="addExToWorkout('${e.id}')">
        <div><div class="sheet-item-name">${e.name}</div><div class="sheet-item-sub">${muscleName(e.muscle)}</div></div>
        <span style="color:var(--accent);font-size:20px">+</span>
      </div>`;
    }).join('');
    return `<div class="sheet-ex-group${isCollapsed ? ' collapsed' : ''}" style="--mc:${meta.color}">
      <div class="ex-group-title" onclick="toggleAddExGroup('${m}')">
        <span class="dot"></span>
        ${meta.name}
        <span class="count">(${items.length})</span>
        <span class="ex-group-arrow">${isCollapsed ? '▸' : '▾'}</span>
      </div>
      <div class="sheet-ex-group-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  document.getElementById('add-ex-list').innerHTML = groupsHTML;
}
function addExToWorkout(exId) {
  const ex = getEx(exId); if (!ex) return;

  // Preview-Kontext: Workouts-Tab zeigt einen Plan-Tag in der Vorschau (kein laufendes Workout).
  // Uebung NUR in den Plan-Tag eintragen, kein DB.saveActive.
  if (addExContext === 'libday') {
    // Trainingstag-Bibliothek: Uebung dem aktuell bearbeiteten Lib-Tag hinzufuegen.
    const days = DB.getTrainingDays();
    const day = days.find(d => d.id === editingLibDayId);
    if (!day) { closeModal('modal-add-ex'); showToast('Trainingstag nicht gefunden'); return; }
    if ((day.exercises || []).some(pe => pe.exId === exId)) {
      closeModal('modal-add-ex'); showToast(`${ex.name} ist bereits im Trainingstag`); return;
    }
    day.exercises = day.exercises || [];
    day.exercises.push({ exId, targetSets: 3, targetReps: 8 });
    DB.saveTrainingDays(days);
    closeModal('modal-add-ex');
    renderLibDayDetail();
    showToast(`${ex.name} zum Trainingstag hinzugefügt`);
    return;
  }

  if (addExContext === 'preview') {
    // Aktiver Plan (per Datum), nicht Edit-Kontext/DEFAULT-Fallback — siehe renderWorkoutsScreen.
    const weekDays = getCurrentWeekDays();
    const selDay = weekDays[selectedWorkoutDayIdx];
    const planDayId = selDay && selDay.planDayId;
    if (!planDayId) {
      closeModal('modal-add-ex');
      showToast('Kein Trainingstag ausgewählt');
      return;
    }
    // Referenz-Modell: planDayId ist eine globale Bibliothek-Tag-ID → direkt dort editieren
    const days = DB.getTrainingDays();
    const day = days.find(d => d.id === planDayId);
    if (!day) {
      closeModal('modal-add-ex');
      showToast('Trainingstag nicht gefunden');
      return;
    }
    if ((day.exercises || []).some(pe => pe.exId === exId)) {
      closeModal('modal-add-ex');
      showToast(`${ex.name} ist bereits im Trainingstag`);
      return;
    }
    day.exercises.push({ exId, targetSets: 3, targetReps: 8 });
    DB.saveTrainingDays(days);
    // Falls trotz Preview-Kontext zufaellig ein passendes Active-Workout laeuft, mitziehen
    syncActiveWorkoutWithPlanDay(planDayId);
    closeModal('modal-add-ex');
    renderWorkoutsScreen();
    showToast(`${ex.name} zum Trainingstag hinzugefügt`);
    return;
  }

  // Active-Kontext (Default): Uebung dem laufenden Workout + dem verlinkten Plan-Tag hinzufuegen.
  const wo = DB.getActive();
  if (!wo) {
    // Defensive: openAddExModal('active') ohne laufendes Workout — abbrechen
    closeModal('modal-add-ex');
    showToast('Keine laufende Einheit');
    return;
  }
  // 1) Übung dem aktiven Workout hinzufügen
  wo.exercises.push({
    exId, id:exId, name:ex.name, targetSets:3, targetReps:8,
    sets: buildSetsForExercise(exId, [{reps:'8',weight:''},{reps:'8',weight:''},{reps:'8',weight:''}]),
    notes:'', done:false
  });
  DB.saveActive(wo);
  // 2) Übung auch in den Plan-Trainingstag eintragen (sofern verlinkt, nicht doppelt)
  // → künftige Workouts dieses Tags enthalten die Übung automatisch
  if (wo.planDayId) {
    const plan = DB.getPlan();
    const day = plan.find(d => d.id === wo.planDayId);
    if (day && !day.exercises.some(pe => pe.exId === exId)) {
      day.exercises.push({ exId, targetSets: 3, targetReps: 8 });
      DB.savePlan(plan);
    }
  }
  closeModal('modal-add-ex');
  renderWorkoutsScreen();
  showToast(`${ex.name} hinzugefügt`);
}

function confirmFinish() { openModal('modal-finish'); }

function finishWorkout() {
  const wo = DB.getActive();
  if (!wo) return;
  stopTimer();
  // Card-Collapse-State leeren — die erste Übung der nächsten Einheit wird beim Start geöffnet
  expandedAexIds.clear();
  stopRestTimer(true);
  const duration = Math.floor(getElapsedMs(wo) / 1000);
  // Leere Sätze verwerfen; Übungen ganz ohne eingetragene Sätze fallen aus der Einheit
  const cleanEx = wo.exercises
    .map(ex => ({ ...ex, sets: (ex.sets || []).filter(s => s.weight || s.reps) }))
    .filter(ex => ex.sets.length > 0);

  const prevWorkouts = DB.getWorkouts();
  const prs = detectPRs({ ...wo, exercises: cleanEx }, prevWorkouts);
  // Satzanzahl in den Trainingstag übernehmen, damit die nächste Einheit damit startet
  const setChanges = syncSetCountsToPlanDay(wo.planDayId, cleanEx);

  const finalWo = { ...wo, exercises: cleanEx, duration, endTs: Date.now(), prs };
  DB.addWorkout(finalWo);
  DB.clearActive();
  stopTimer();
  syncWorkoutActiveUI();

  closeModal('modal-finish');

  // Aktuellen Tab neu rendern — egal ob Workouts oder Übersicht, der Active-Mode endet sofort
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();

  // Abschluss zeigen statt nur einer kurzen Einblendung: Dauer, Volumen, Sätze, Rekorde
  // und der Vergleich zur letzten Einheit desselben Trainingstags.
  renderWorkoutSummary(finalWo, prevWorkouts, setChanges);
  // Nach zehn Einheiten einmalig an die Sicherung erinnern, falls keine eingerichtet ist.
  maybePromptBackup();

  // Drive-Sync: einziger automatischer Auslöser ist das Workout-Ende.
  // Bei dieser Gelegenheit landen ALLE aufgelaufenen lokalen Änderungen
  // (auch reine Plan-/Übungs-/Wochenplan-Änderungen seit dem letzten Sync) in der Cloud.
  if (driveIsEnabled()) driveTriggerSync('Einheit beendet');
}

// Abschlussansicht einer gespeicherten Einheit.
// prevWorkouts = Verlauf OHNE diese Einheit (für den Vergleich mit der letzten gleichen).
// setChanges = im Trainingstag angepasste Satzanzahlen (syncSetCountsToPlanDay).
function renderWorkoutSummary(wo, prevWorkouts, setChanges) {
  const body = document.getElementById('summary-body');
  const titleEl = document.getElementById('summary-title');
  if (!body) return;

  const vol = calcVolume(wo);
  const setCount = (wo.exercises || []).reduce((a, e) => a + ((e.sets || []).length), 0);
  const exCount = (wo.exercises || []).length;
  const prs = wo.prs || [];

  // Letzte Einheit desselben Trainingstags für den Volumenvergleich
  const prevSame = (prevWorkouts || []).find(w => w.planDayId === wo.planDayId);
  let deltaHTML = '';
  if (prevSame) {
    const prevVol = calcVolume(prevSame);
    const diff = vol - prevVol;
    if (prevVol > 0 && Math.abs(diff) >= 1) {
      const up = diff > 0;
      deltaHTML = `<div class="sum-delta ${up ? 'up' : 'down'}">
        ${up ? '▲' : '▼'} ${fmtVol(Math.abs(diff))} Volumen gegenüber der letzten Einheit</div>`;
    } else if (prevVol > 0) {
      deltaHTML = `<div class="sum-delta flat">Gleiches Volumen wie bei der letzten Einheit</div>`;
    }
  }

  // Stärkster Kraft-PR bekommt eine eigene Karte zum Sichern/Teilen.
  const topPR = prs.slice().sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
  const prCardHTML = topPR
    ? `<div class="pr-card">
         <div class="pr-card-lbl">Neue Bestleistung</div>
         <div class="pr-card-val">${fmtKg(topPR.weight)} kg</div>
         <div class="pr-card-name">${escapeHtml(topPR.name)}</div>
         <div class="pr-card-foot">${topPR.prev > 0 ? `+${fmtKg(topPR.weight - topPR.prev)} kg zum bisherigen Rekord` : 'Erster Eintrag für diese Übung'}</div>
         <button class="pr-card-btn" onclick="sharePRCard('${escapeHtml(String(topPR.name)).replace(/'/g, "\\'")}',${topPR.weight},${topPR.prev || 0},${wo.startTs})">Als Bild sichern</button>
       </div>`
    : '';

  // Der auf der Karte gezeigte Rekord taucht in der Liste nicht noch einmal auf.
  const restPRs = prs.filter(p => p !== topPR);
  const prHTMLBlock = prs.length
    ? `${prCardHTML}
       ${restPRs.length ? `<div class="sum-pr-head">${restPRs.length === 1 ? 'Außerdem' : 'Außerdem'}</div>` : ''}
       <div class="sum-pr-list">${restPRs.map(p => {
         const prev = p.prev > 0 ? ` <span class="sum-pr-prev">statt ${p.prev} kg</span>` : '';
         return `<div class="sum-pr-row"><span class="sum-pr-name">${escapeHtml(p.name)}</span>
                 <span class="sum-pr-val">${p.weight} kg${prev}</span></div>`;
       }).join('')}</div>`
    : '';

  // Sichtbar machen, wenn sich der Trainingstag durch diese Einheit geändert hat —
  // eine stille Planänderung wäre eine unangenehme Überraschung beim nächsten Mal.
  const setChangeHTML = (setChanges && setChanges.length)
    ? `<div class="sum-planupd">
         <div class="sum-planupd-head">Trainingstag angepasst</div>
         ${setChanges.map(c => `<div class="sum-planupd-row">${escapeHtml(c.name)}: <strong>${c.after} ${c.after === 1 ? 'Satz' : 'Sätze'}</strong> statt ${c.before} — gilt ab der nächsten Einheit</div>`).join('')}
       </div>`
    : '';

  if (titleEl) titleEl.textContent = prs.length ? 'Stark — neue Bestleistung' : 'Einheit abgeschlossen';

  body.innerHTML = `
    <div class="sum-day">${pd(escapeHtml(wo.planDayName || 'Freies Training'))}</div>
    <div class="sum-stats">
      <div class="sum-stat"><span class="sum-stat-val">${fmtDur(wo.duration)}</span><span class="sum-stat-lbl">Dauer</span></div>
      <div class="sum-stat"><span class="sum-stat-val">${fmtVol(vol)}</span><span class="sum-stat-lbl">Volumen</span></div>
      <div class="sum-stat"><span class="sum-stat-val">${setCount}</span><span class="sum-stat-lbl">${setCount === 1 ? 'Satz' : 'Sätze'}</span></div>
      <div class="sum-stat"><span class="sum-stat-val">${exCount}</span><span class="sum-stat-lbl">${exCount === 1 ? 'Übung' : 'Übungen'}</span></div>
    </div>
    ${deltaHTML}
    ${prHTMLBlock}
    ${setChangeHTML}`;
  openModal('modal-summary');
}

function discardWorkout() {
  // Erst das aktuell offene Finish-Modal schließen, sonst überdeckt es das Confirm-Modal
  closeModal('modal-finish');
  setTimeout(() => {
    confirmAction('Einheit verwerfen?',
      'Die laufende Einheit wirklich verwerfen? Alle Eingaben gehen verloren.',
      () => {
        stopTimer();
        stopRestTimer(true);
        DB.clearActive();
        syncWorkoutActiveUI();
        expandedAexIds.clear();   // Card-Collapse-State leeren — naechstes Workout startet sauber
        showToast('Einheit verworfen');
        if (currentScreen === 'overview') renderOverview();
        else if (currentScreen === 'workouts') renderWorkoutsScreen();
      },
      { danger: true, confirmLabel: 'Verwerfen' }
    );
  }, 80);
}

// ═══════════════════════════════════════════════
// SCREEN: VERLAUF
// ═══════════════════════════════════════════════

let volumeChart = null;
let histRangeDays = 30;
let volumeUnit = 'kg';   // 'kg' | 'sets'

// ueber App-Restart hinweg merkt.

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
  renderStatsPage();
}

// Kg oder Sätze — beide Möglichkeiten stehen nebeneinander, statt sich einen Knopf zu
// teilen, der bei jedem Tipp umschlägt (Leonard-Wunsch, 20.08.2026).
function setVolumeUnit(unit) {
  volumeUnit = (unit === 'sets') ? 'sets' : 'kg';
  document.querySelectorAll('#vol-unit-toggle .stats-mode-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.unit === volumeUnit);
  });
  renderVolumeChart(filterWorkoutsByRange(DB.getWorkouts(), histRangeDays));
}

function filterWorkoutsByRange(ws, days) {
  const cutoff = Date.now() - days*24*3600*1000;
  return ws.filter(w => w.startTs >= cutoff);
}

// Rendert die 3 Stats-Karten (Volumenentwicklung, Muskelgruppen-Volumen, PRs) in der Übersicht.
// Wird aus renderOverview aufgerufen — der frühere Verlauf-Tab existiert nicht mehr.
function renderStatsPage() {
  const allWs = DB.getWorkouts();
  const ws = filterWorkoutsByRange(allWs, histRangeDays);

  // ── Karte 1: Volumenentwicklung ──
  renderVolumeChart(ws);

  // ── Karte 2: Volumen pro Muskelgruppe ──
  const volEl = document.getElementById('muscle-bars');
  if (volEl) {
    if (ws.length) renderMuscleMap(calcMuscleVolume(ws), volEl);
    else volEl.innerHTML = '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
  }

  // ── Karte 3: Letzte Einheiten ──
  renderRecentSessions();

  // ── Karte 4: PR-Liste ──
  const prEl = document.getElementById('hist-pr-list');
  if (prEl) {
    const prs = getAllPRs();
    prEl.innerHTML = prs.length
      ? prs.slice(0,10).map((pr, idx) => prHTML(pr, idx+1)).join('')
      : '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine PRs</p>';
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
  // Einteilung richtet sich nach dem gewählten Zeitraum: Kalenderwochen-Nummern („W30")
  // sagten wenig und passten bei „7 Tage" gar nicht — dort gab es nur ein bis zwei Punkte,
  // während „Letztes Jahr" trotzdem auf acht Wochen gekappt wurde.
  const grouping = histRangeDays <= 7 ? 'day' : (histRangeDays >= 365 ? 'month' : 'week');
  const maxPoints = grouping === 'day' ? 7 : (grouping === 'month' ? 12 : (histRangeDays >= 90 ? 13 : 6));

  const bucketOf = (d) => {
    if (grouping === 'day')   { const x = new Date(d); x.setHours(0,0,0,0); return x; }
    if (grouping === 'month') return new Date(d.getFullYear(), d.getMonth(), 1);
    const x = new Date(d); x.setHours(0,0,0,0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));   // Montag der Woche
    return x;
  };
  const labelOf = (start, prev) => {
    if (grouping === 'day')   return start.toLocaleDateString('de-DE', { weekday: 'short' });
    if (grouping === 'month') return start.toLocaleDateString('de-DE', { month: 'short' });
    // Wochen: bei langen Zeiträumen nur den Monatswechsel beschriften, sonst das Datum
    if (histRangeDays >= 90) {
      return (!prev || prev.getMonth() !== start.getMonth())
        ? start.toLocaleDateString('de-DE', { month: 'long' }) : '';
    }
    return start.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  const buckets = {};
  ws.forEach(w => {
    const start = bucketOf(new Date(w.startTs));
    const key = start.getTime();
    const val = volumeUnit === 'kg'
      ? calcVolume(w)
      : w.exercises.reduce((a,e) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0);
    if (!buckets[key]) buckets[key] = { start, val: 0, ts: w.startTs };
    buckets[key].val += val;
    if (w.startTs < buckets[key].ts) buckets[key].ts = w.startTs;
  });
  // Chronologisch AUFSTEIGEND (älteste links, neueste rechts)
  const sortedKeys = Object.keys(buckets).sort((a,b) => buckets[a].start - buckets[b].start).slice(-maxPoints);
  let _prevStart = null;
  const xLabels = sortedKeys.map(k => {
    const lbl = labelOf(buckets[k].start, _prevStart);
    _prevStart = buckets[k].start;
    return lbl;
  });
  // Volle Datumsangabe für die Kopfzeile beim Antippen eines Punktes
  const xTitles = sortedKeys.map(k => {
    const s = buckets[k].start;
    if (grouping === 'day')   return s.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' });
    if (grouping === 'month') return s.toLocaleDateString('de-DE', { month:'long', year:'numeric' });
    const e = new Date(s); e.setDate(s.getDate() + 6);
    return `Woche ${s.toLocaleDateString('de-DE',{day:'numeric',month:'short'})} – ${e.toLocaleDateString('de-DE',{day:'numeric',month:'short'})}`;
  });
  const lastIdx = sortedKeys.length - 1;
  const ctx = canvas.getContext('2d');
  const isKg = volumeUnit === 'kg';
  const achseInTonnen = isKg && sortedKeys.some(k => buckets[k].val >= 1000);
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
      labels: xLabels,
      datasets: [{
        data: sortedKeys.map(k => Math.round(buckets[k].val)),
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
      // Tooltip an der ganzen Spalte auslösen, nicht nur exakt auf dem Punkt: Ein Tipp
      // irgendwo unter dem Punkt (in der gefüllten Fläche) genügt. Auf dem Touchscreen
      // ist der 5px-Punkt sonst kaum zu treffen.
      interaction: { mode: 'index', intersect: false },

      // Top-Padding gibt dem Custom-Label-Plugin (lastPointLabel) Platz, damit das Badge
      // ueber dem letzten Punkt nicht am oberen Chart-Rand abgeschnitten wird.
      layout: { padding: { top: 28 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            title: (items) => (items && items.length) ? (xTitles[items[0].dataIndex] || '') : '',
            label: c => isKg ? fmtVol(c.raw) : (c.raw+' Sätze'),
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          // Reserve ~10% ueber dem Max-Wert, damit der letzte Punkt nicht direkt am Top liegt
          grace: '10%',
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
          ticks: { callback: v => isKg ? volAchsenWert(v, achseInTonnen) : v, font:{size:11} }
        },
        // Im Wochen-Modus sind viele Labels absichtlich leer (nur Monatswechsel beschriftet) —
        // dort darf Chart.js nichts wegskippen. Bei Tagen/Monaten schon, sonst überlappen
        // zwölf Monatsnamen auf iPhone-Breite.
        x: { grid: { display: false }, ticks: { font:{size:11}, autoSkip: grouping !== 'week', maxRotation: 0 } }
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
        const txt = isKg ? fmtVol(val) : (val+' Sätze');
        const c = chart.ctx;
        c.save();
        c.font = '600 12px -apple-system, sans-serif';
        const w = c.measureText(txt).width + 14;
        const h = 22;
        // In die Zeichenfläche einpassen: Beim letzten Punkt liegt die Hälfte des Badges
        // sonst außerhalb und wird am Kartenrand abgeschnitten (sichtbar ab „1 Jahr",
        // wo der letzte Punkt ganz rechts sitzt).
        const ca = chart.chartArea;
        const x = Math.min(Math.max(last.x - w/2, ca.left), ca.right - w);
        const y = Math.max(last.y - h - 8, 2);
        c.fillStyle = accent;
        c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
        c.fillStyle = '#fff';
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillText(txt, x + w/2, y + h/2);   // Mitte des Kastens, nicht des Punktes
        c.restore();
      }
    }]
  });
}

// ─── Trainingskalender ─────────────────────────────────────────────
// Ein Kästchen pro Tag der letzten 52 Wochen, eingefärbt nach Tagesvolumen.
// Zeigt Regelmäßigkeit und Lücken auf einen Blick — das sieht man in keinem Diagramm.

function _dayKeyOf(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Volumen + Einheiten pro Kalendertag über den gesamten Verlauf.
function buildCalendarData() {
  const byDay = {};
  DB.getWorkouts().forEach(w => {
    const key = _dayKeyOf(w.startTs);
    if (!byDay[key]) byDay[key] = { vol: 0, count: 0, names: [] };
    byDay[key].vol += calcVolume(w);
    byDay[key].count += 1;
    const nm = w.planDayName || 'Freies Training';
    if (!byDay[key].names.includes(nm)) byDay[key].names.push(nm);
  });
  return byDay;
}

// Plan-Zeitraeume fuer die Kalender-Rekonstruktion. Auch archivierte Plaene zaehlen:
// sie behalten ihren Wochenplan, also laesst sich fuer jeden vergangenen Tag sagen, ob
// damals ein Training vorgesehen war.
function _calPlanIndex() {
  return DB.getPlans()
    .filter(p => p && p.startDate)
    .map(p => ({
      start: p.startDate,
      end: p.endDate || Infinity,
      wp: (p.weekPlan && p.weekPlan.length) ? p.weekPlan : DEFAULT_WEEKPLAN,
      days: resolvePlanDays(p),
      plan: p,
    }))
    .sort((a, b) => a.start - b.start);
}

// War an diesem Datum ein Training geplant? known=false heisst: kein Plan deckt den Tag ab
// (vor dem ersten Plan oder in einer Luecke) — dann wird keine Flaeche gezeichnet.
function _calPlanInfo(date, index) {
  const ts = date.getTime();
  const p = index.find(x => ts >= x.start && ts <= x.end);
  if (!p) return { known: false, planned: false, name: null, plan: null };
  const entry = p.wp[(date.getDay() + 6) % 7];
  if (!entry || !entry.planDayId) return { known: true, planned: false, name: null, plan: p.plan };
  const d = p.days.find(x => x && x.id === entry.planDayId);
  return { known: true, planned: true, name: d ? d.name : null, plan: p.plan };
}

// Kalender-Innenleben. Eine Quelle fuer beide Einbauorte (Uebersicht + Plaene-Tab);
// die IDs bekommen ein Praefix, damit zwei Instanzen nebeneinander bestehen koennen.
function calendarInnerHTML(id) {
  return `<div class="chart-card-v2-head">
      <span class="chart-card-v2-title">Trainingskalender</span>
      <span class="cal-head-right">
        <span class="cal-stats" id="${id}-stats"></span>
        <button class="info-btn" onclick="openModal('modal-cal-info')" aria-label="Was bedeuten die Farben?">i</button>
      </span>
    </div>
    <div class="cal-scroll" id="${id}-scroll">
      <div class="cal-inner">
        <div class="cal-months" id="${id}-months"></div>
        <div class="cal-body">
          <div class="cal-daylabels"><span>Mo</span><span></span><span>Mi</span><span></span><span>Fr</span><span></span><span>So</span></div>
          <div class="cal-gridwrap">
            <div class="cal-bands" id="${id}-bands"></div>
            <div class="cal-grid" id="${id}-grid"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="cal-foot">
      <div class="cal-detail" id="${id}-detail"></div>
    </div>`;
}

// Wie viel vom Plan ist bislang erfüllt? Verglichen werden ABSOLVIERTE EINHEITEN im
// Zeitraum gegen die bis dahin GEPLANTEN Trainingstage. Bezug ist immer nur die
// Vergangenheit (bei laufenden Plänen bis heute) — sonst läge die Quote zwangsläufig
// niedrig, solange der Plan noch läuft. Einheiten an nicht geplanten Tagen zählen mit,
// damit ein nachgeholtes Training die Quote nicht drückt (beides Leonard-Entscheidung).
function planErfuellung(plan) {
  if (!plan || !plan.startDate) return null;
  const heute = new Date(); heute.setHours(23, 59, 59, 999);
  const bis = Math.min(plan.endDate || heute.getTime(), heute.getTime());
  if (bis < plan.startDate) return null;

  const wp = (plan.weekPlan && plan.weekPlan.length) ? plan.weekPlan : DEFAULT_WEEKPLAN;
  let geplant = 0;
  const d = new Date(plan.startDate); d.setHours(0, 0, 0, 0);
  while (d.getTime() <= bis) {
    const e = wp[(d.getDay() + 6) % 7];
    if (e && e.planDayId) geplant++;
    d.setDate(d.getDate() + 1);
  }
  const absolviert = DB.getWorkouts().filter(w => w.startTs >= plan.startDate && w.startTs <= bis).length;
  if (!geplant) return null;
  return { geplant, absolviert, prozent: Math.round(absolviert / geplant * 100) };
}

function renderTrainingCalendar(id, cardId) {
  id = id || 'cal';
  cardId = cardId || 'ov-cal-card';
  const card = document.getElementById(cardId);
  if (card && !document.getElementById(id + '-grid')) card.innerHTML = calendarInnerHTML(id);
  const grid = document.getElementById(id + '-grid');
  if (!grid) return;
  const byDay = buildCalendarData();

  // Immer das ganze Kalenderjahr: 1. Januar bis 31. Dezember. Das Raster beginnt am Montag
  // der Woche, in der der 1. Januar liegt, damit die Wochentagszeilen durchgehend stimmen.
  const today = new Date(); today.setHours(0,0,0,0);
  const jahr = today.getFullYear();
  const jan1 = new Date(jahr, 0, 1);
  const dez31 = new Date(jahr, 11, 31);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - ((jan1.getDay() + 6) % 7));
  const wochen = Math.ceil((Math.round((dez31 - start) / 86400000) + 1) / 7);

  // Plan-Zeitraeume einmal vorbereiten (statt pro Tag aufzuloesen).
  const planIndex = _calPlanIndex();

  let cells = '';
  let months = '';
  let lastMonth = -1;
  for (let w = 0; w < wochen; w++) {
    const weekStart = new Date(start); weekStart.setDate(start.getDate() + w * 7);
    // Monatsbeschriftung, sobald eine Woche einen neuen Monat beginnt
    const m = weekStart.getMonth();
    const showLabel = m !== lastMonth && weekStart.getDate() <= 7;
    months += `<span class="cal-month">${showLabel ? weekStart.toLocaleDateString('de-DE',{month:'short'}) : ''}</span>`;
    if (showLabel) lastMonth = m;

    cells += '<div class="cal-week">';
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart); day.setDate(weekStart.getDate() + d);
      const key = _dayKeyOf(day.getTime());
      const entry = byDay[key];
      const future = day.getTime() > today.getTime();
      const isToday = day.getTime() === today.getTime();
      const ausserhalb = day.getFullYear() !== jahr;   // Rand-Tage der ersten/letzten Woche
      // Flaeche = war laut damaligem Plan ein Trainingstag, Kern = tatsaechlich trainiert.
      const plan = _calPlanInfo(day, planIndex);
      const cls = ['cal-day'];
      if (ausserhalb) cls.push('outside');
      if (plan.planned && !ausserhalb) cls.push('planned');
      if (entry && !ausserhalb) cls.push('done');
      if (future) cls.push('future');
      if (isToday) cls.push('today');
      const zustand = entry
        ? (plan.planned ? 'geplant und trainiert' : 'zusaetzlich trainiert')
        : (plan.planned ? (future ? 'geplant' : 'geplant, nicht trainiert') : 'Ruhetag');
      cells += `<span class="${cls.join(' ')}"
                      data-key="${key}" onclick="showCalDay('${key}','${id}')"
                      role="button" tabindex="0"
                      aria-label="${day.toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'})}, ${zustand}"></span>`;
    }
    cells += '</div>';
  }
  grid.innerHTML = cells;
  // Mit den Zellen verschwindet die Markierung — die Tagesbeschreibung darf nicht
  // stehenbleiben, sonst gehoert sie sichtbar zu keinem Tag mehr.
  const detailEl = document.getElementById(id + '-detail');
  if (detailEl) detailEl.innerHTML = '';
  const monthsEl = document.getElementById(id + '-months');
  if (monthsEl) monthsEl.innerHTML = months;

  // Kennzahlen: Einheiten im Zeitraum + aktuelle Wochenserie
  const inRange = DB.getWorkouts().filter(w => new Date(w.startTs).getFullYear() === jahr).length;
  const streak = getWeekStreak();
  const statsEl = document.getElementById(id + '-stats');
  if (statsEl) {
    statsEl.textContent = `${jahr} · ${inRange} ${inRange === 1 ? 'Einheit' : 'Einheiten'}`
      + (streak > 0 ? ` · Serie ${streak} ${streak === 1 ? 'Woche' : 'Wochen'}` : '');
  }

  // Kaestchengroesse an die verfuegbare Breite anpassen: im Querformat fehlten sonst wenige
  // Pixel und das ganze Jahr musste trotzdem gescrollt werden. Kleiner als 10px wird nicht
  // gegangen — dann bleibt es bei 13px und scrollt (Hochformat).
  // 16/13 statt frueher 13/10 — rund ein Viertel groesser (Leonard-Wunsch 20.08.2026).
  // Ganze Pixel, damit die Kaestchenkanten scharf bleiben.
  const CAL_GAP = 3, CAL_CELL_DEFAULT = 16, CAL_CELL_MIN = 13;
  const scrollerEl = document.getElementById(id + '-scroll');
  let zelle = CAL_CELL_DEFAULT;
  if (scrollerEl && scrollerEl.clientWidth > 0) {
    const cs = getComputedStyle(scrollerEl);
    // 23 = Breite der Wochentagsspalte (--cal-label-w) + Abstand (--cal-label-gap).
    const frei = scrollerEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 23;
    const passt = (z) => wochen * (z + CAL_GAP) <= frei;
    if (!passt(CAL_CELL_DEFAULT)) {
      for (let z = CAL_CELL_DEFAULT - 1; z >= CAL_CELL_MIN; z--) { if (passt(z)) { zelle = z; break; } }
    }
  }
  if (card) card.style.setProperty('--cal-cell', zelle + 'px');
  const SPALTE = zelle + CAL_GAP;

  // Plan-Laufzeiten: je eine senkrechte Linie am Anfang und am Ende, der Name darunter.
  // Bewusst KEIN gefuellter Balken — das Raster soll die Hauptsache bleiben.
  const bandsEl = document.getElementById(id + '-bands');
  if (bandsEl) {
    // Spalte NICHT über Millisekunden-Division bestimmen: Zwischen Winter- und Sommerzeit
    // fehlt eine Stunde, wodurch ein Datum genau auf einer Wochengrenze in die Vorwoche
    // rutschte (die Startlinie stand eine Woche zu früh). Über ganze Tage gerundet stimmt es.
    const spalteFuer = (ts) => {
      const d = new Date(ts); d.setHours(0, 0, 0, 0);
      return Math.floor(Math.round((d - start) / 86400000) / 7);
    };
    const rasterEnde = new Date(start.getTime());
    rasterEnde.setDate(rasterEnde.getDate() + wochen * 7);
    rasterEnde.setMilliseconds(-1);
    const sichtbar = DB.getPlans()
      .filter(p => p && p.startDate && p.startDate <= rasterEnde.getTime() && (p.endDate || Infinity) >= start.getTime())
      .sort((a, b) => a.startDate - b.startDate);

    // Umrandung um die Wochenspalten des Zeitraums — ohne Füllung, damit die Kästchen
    // ungestört bleiben. Farbe: --cal-plan-color in style.css. Eine Beschriftung mit dem
    // Plannamen gibt es nicht mehr (Leonard-Wunsch 20.08.2026) — der Name steht beim
    // Antippen eines Tages in der Beschreibung darunter.
    let bands = '';
    sichtbar.forEach((p) => {
      const von = Math.max(0, spalteFuer(p.startDate));
      const bis = Math.min(wochen - 1, spalteFuer(p.endDate || rasterEnde.getTime()));
      if (bis < von) return;
      const cls = p.archived ? ' archived' : '';
      const links = von * SPALTE - 2;
      const breite = (bis - von + 1) * SPALTE - 3 + 4;
      bands += `<span class="cal-band${cls}" style="left:${links}px;width:${breite}px"></span>`;
    });
    bandsEl.innerHTML = bands;
  }

  // Zur laufenden Woche scrollen (nicht ans Jahresende — der Dezember ist noch leer).
  const scroller = document.getElementById(id + '-scroll');
  if (scroller) requestAnimationFrame(() => {
    const heuteSpalte = Math.floor(Math.round((today - start) / 86400000) / 7);
    scroller.scrollLeft = Math.max(0, heuteSpalte * SPALTE - scroller.clientWidth * 0.7);
  });
}

// Tippen auf ein Kästchen: Tag in der Fußzeile beschreiben.
function showCalDay(key, id) {
  id = id || 'cal';
  const el = document.getElementById(id + '-detail');
  if (!el) return;
  const entry = buildCalendarData()[key];
  const [y, m, d] = key.split('-').map(Number);
  const dateStr = new Date(y, m-1, d).toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' });
  const scope = document.getElementById(id + '-grid');
  if (scope) {
    scope.querySelectorAll('.cal-day.sel').forEach(c => c.classList.remove('sel'));
    const cell = scope.querySelector(`.cal-day[data-key="${key}"]`);
    if (cell) cell.classList.add('sel');
  }
  // Neben dem Ergebnis auch nennen, was fuer den Tag vorgesehen war — sonst bliebe
  // unklar, ob ein leerer Tag ein Ruhetag oder eine ausgefallene Einheit ist.
  const plan = _calPlanInfo(new Date(y, m-1, d), _calPlanIndex());
  let txt;
  if (entry) {
    // An diesem Tag wurde trainiert → direkter Weg in die Detailansicht der Einheit.
    // getWorkouts() ist neueste-zuerst; bei mehreren Einheiten am selben Tag oeffnet
    // der Verweis die zuletzt begonnene.
    const woIdx = DB.getWorkouts().findIndex(w => _dayKeyOf(w.startTs) === key);
    const link = woIdx >= 0
      ? ` <a class="cal-detail-link" onclick="event.stopPropagation();showHistDetail(${woIdx})">(zur Einheit)</a>`
      : '';
    txt = `<strong>${dateStr}</strong>: ${entry.names.join(', ')}${link}`;
    if (plan.known && !plan.planned) txt += ' · zusätzlich trainiert';
  } else if (plan.planned) {
    const heute = new Date(); heute.setHours(0,0,0,0);
    const kommt = new Date(y, m-1, d).getTime() > heute.getTime();
    txt = `<strong>${dateStr}</strong> · geplant: ${plan.name ? escapeHtml(plan.name) : 'Training'}`
        + (kommt ? '' : ' · nicht trainiert');
  } else {
    txt = `<strong>${dateStr}</strong> · ${plan.known ? 'Ruhetag' : 'kein Training'}`;
  }
  // Zweite Zeile: der Plan selbst mit Laufzeit. Dritte Zeile: sein Stand bis hierher.
  if (plan.plan) {
    const wochen = planWochen(plan.plan);
    const spanne = wochen ? ` (${wochen} Wochen)` : '';
    txt += `<div class="cal-detail-plan">${escapeHtml(plan.plan.name)}${spanne}</div>`;
    const q = planErfuellung(plan.plan);
    if (q) {
      txt += `<div class="cal-detail-plan">${q.absolviert} von ${q.geplant} geplanten Einheiten (${q.prozent}%)</div>`;
    }
  }
  el.innerHTML = txt;
}

// Muskel-Landkarte: zwei Silhouetten (vorne/hinten), deren Regionen nach Volumenanteil
// eingefärbt sind. Ersetzt die frühere Balkenliste — Ungleichgewichte sieht man als Bild
// schneller als in einer Rangliste. Die Zahlen stehen darunter als Legende.
// (Hieß früher renderMuscleBars; die Klassen .muscle-bars-v2 im Markup stammen noch daher.)
// Vorne: Schultern, Brust, Bizeps, Bauch, Oberschenkel. Hinten: Rücken, Trizeps, Waden.
function muscleMapSvg(vol, maxVol) {
  // Anteil → Deckkraft der Muskelfarbe (0 = unbenutzt, grau)
  const fillFor = (m) => {
    const v = vol[m] || 0;
    if (!v || !maxVol) return { fill: 'var(--border)', op: 1 };
    const r = v / maxVol;
    const op = r >= 0.75 ? 1 : r >= 0.5 ? 0.78 : r >= 0.25 ? 0.55 : 0.32;
    return { fill: muscleColor(m), op };
  };
  const p = (m) => { const f = fillFor(m); return `fill="${f.fill}" fill-opacity="${f.op}"`; };

  const front = `<svg viewBox="0 0 100 190" class="mmap-svg" role="img" aria-label="Vorderansicht: eingefärbte Muskelgruppen">
    <circle cx="50" cy="15" r="10.5" fill="var(--border)"/>
    <rect x="35" y="28" width="30" height="8" rx="4" ${p('shoulders')}/>
    <rect x="19" y="31" width="12" height="12" rx="6" ${p('shoulders')}/>
    <rect x="69" y="31" width="12" height="12" rx="6" ${p('shoulders')}/>
    <rect x="34" y="38" width="32" height="25" rx="7" ${p('chest')}/>
    <rect x="19" y="45" width="11" height="26" rx="5.5" ${p('biceps')}/>
    <rect x="70" y="45" width="11" height="26" rx="5.5" ${p('biceps')}/>
    <rect x="36" y="65" width="28" height="26" rx="6" ${p('core')}/>
    <rect x="20" y="73" width="10" height="24" rx="5" fill="var(--border)"/>
    <rect x="70" y="73" width="10" height="24" rx="5" fill="var(--border)"/>
    <rect x="35" y="94" width="13" height="46" rx="6" ${p('legs')}/>
    <rect x="52" y="94" width="13" height="46" rx="6" ${p('legs')}/>
    <rect x="36" y="143" width="11" height="33" rx="5" ${p('legs')}/>
    <rect x="53" y="143" width="11" height="33" rx="5" ${p('legs')}/>
  </svg>`;

  const back = `<svg viewBox="0 0 100 190" class="mmap-svg" role="img" aria-label="Rückansicht: eingefärbte Muskelgruppen">
    <circle cx="50" cy="15" r="10.5" fill="var(--border)"/>
    <rect x="35" y="28" width="30" height="8" rx="4" ${p('shoulders')}/>
    <rect x="19" y="31" width="12" height="12" rx="6" ${p('shoulders')}/>
    <rect x="69" y="31" width="12" height="12" rx="6" ${p('shoulders')}/>
    <rect x="34" y="38" width="32" height="32" rx="7" ${p('back')}/>
    <rect x="19" y="45" width="11" height="26" rx="5.5" ${p('triceps')}/>
    <rect x="70" y="45" width="11" height="26" rx="5.5" ${p('triceps')}/>
    <rect x="36" y="72" width="28" height="19" rx="6" ${p('back')}/>
    <rect x="20" y="73" width="10" height="24" rx="5" fill="var(--border)"/>
    <rect x="70" y="73" width="10" height="24" rx="5" fill="var(--border)"/>
    <rect x="35" y="94" width="13" height="46" rx="6" ${p('legs')}/>
    <rect x="52" y="94" width="13" height="46" rx="6" ${p('legs')}/>
    <rect x="36" y="143" width="11" height="33" rx="5" ${p('legs')}/>
    <rect x="53" y="143" width="11" height="33" rx="5" ${p('legs')}/>
  </svg>`;

  return `<div class="mmap-figures">
    <div class="mmap-fig">${front}<span class="mmap-cap">Vorne</span></div>
    <div class="mmap-fig">${back}<span class="mmap-cap">Hinten</span></div>
  </div>`;
}

function renderMuscleMap(vol, container) {
  const values = MUSCLE_ORDER.map(m => vol[m] || 0);
  const maxVol = Math.max(0, ...values);
  if (!maxVol) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
    return;
  }
  const legend = MUSCLE_ORDER.map(m => {
    const v = vol[m] || 0;
    const dim = v ? '' : ' mmap-legend-off';
    return `<div class="mmap-legend-row${dim}">
      <span class="mmap-dot" style="background:${v ? muscleColor(m) : 'var(--border)'}"></span>
      <span class="mmap-legend-name">${muscleName(m)}</span>
      <span class="mmap-legend-val">${v ? fmtVol(v) : '–'}</span>
    </div>`;
  }).join('');
  container.innerHTML = muscleMapSvg(vol, maxVol) + `<div class="mmap-legend">${legend}</div>`;
}

function getAllPRs() {
  const ws = DB.getWorkouts();
  // Pro Übung alle Höchstgewichte je Einheit sammeln
  const histMap = {};
  ws.forEach(w => {
    w.exercises.forEach(ex => {
      if (!Array.isArray(ex.sets)) return;
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
  // Hervorgehoben ist die Bestleistung selbst; die Steigerung steht grau in Klammern
  // am Ende der Beschreibung (Leonard-Wunsch).
  const zunahme = (pr.prev && pr.weight > pr.prev)
    ? ` <span class="pr-v2-delta">(+${fmtKg(pr.weight - pr.prev)} kg)</span>` : '';
  // Einheit nur einmal nennen — sonst bricht die Zeile auf dem iPhone um
  const verlauf = pr.prev ? ` • ${fmtKg(pr.prev)} → ${fmtKg(pr.weight)} kg` : '';
  return `<div class="pr-v2-row no-icon" style="--mc:${valColor};--mc-bg:${muscleBg(muscleKey)}" onclick="showHistDetailForEx('${pr.exId}', ${pr.date || 0})">
    <div class="pr-v2-num">${num}</div>
    <div>
      <div class="pr-v2-name">${pr.name}</div>
      <div class="pr-v2-sub">${setsStr}${verlauf}${zunahme}</div>
    </div>
    <div class="pr-v2-val" style="color:${valColor}">${fmtKg(pr.weight)} kg</div>
    <span class="pr-v2-arrow">›</span>
  </div>`;
}

// Öffnet die Einheit, in der die Bestleistung aufgestellt wurde (nicht die neueste mit
// dieser Übung) — nur dann zeigt die hervorgehobene Übung auch wirklich den Bestwert.
function showHistDetailForEx(exId, bestTs) {
  const ws = DB.getWorkouts();
  const hatUebung = w => w.exercises.some(e => (e.exId || e.id) === exId);
  let idx = bestTs ? ws.findIndex(w => w.startTs === bestTs && hatUebung(w)) : -1;
  if (idx < 0) idx = ws.findIndex(hatUebung);
  if (idx >= 0) showHistDetail(idx, exId);
}

// Schwerster Satz einer Übung innerhalb einer Einheit (0 = kein Gewicht eingetragen).
function _maxGewicht(ex) {
  const sets = Array.isArray(ex.sets) ? ex.sets : [];
  return Math.max(0, ...sets.map(s => parseFloat(s.weight) || 0));
}

// Höchstgewicht derselben Übung in der letzten Einheit DAVOR. ws ist neueste-zuerst,
// ältere Einheiten stehen also HINTER abIndex. null = die Übung war vorher nie dabei.
function _maxDerVorherigenEinheit(ws, abIndex, exId) {
  for (let k = abIndex + 1; k < ws.length; k++) {
    const ex = (ws[k].exercises || []).find(e => (e.exId || e.id) === exId);
    if (!ex) continue;
    const m = _maxGewicht(ex);
    if (m > 0) return m;
  }
  return null;
}

// Eine Zeile Einordnung: Wie steht der schwerste Satz zur letzten Einheit? Das ist die
// Frage, für die man eine vergangene Einheit überhaupt aufmacht — die reinen Zahlen
// stehen ohnehin darunter.
function _fortschrittZeile(jetzt, vorher) {
  if (!jetzt) return '';                                   // Körpergewichtsübung
  if (vorher === null) return '<div class="hd-delta hd-delta-flat">erste Einheit mit dieser Übung</div>';
  const d = Math.round((jetzt - vorher) * 100) / 100;
  if (d > 0) return `<div class="hd-delta hd-delta-up">▲ +${fmtKg(d)} kg zur letzten Einheit</div>`;
  if (d < 0) return `<div class="hd-delta hd-delta-down">▼ ${fmtKg(d)} kg zur letzten Einheit</div>`;
  return '';   // gleich geblieben: keine Zeile (Leonard-Wunsch) — nur Veränderung ist eine Meldung wert
}

function showHistDetail(i, highlightExId) {
  const ws = DB.getWorkouts();
  const w = ws[i];
  if (!w) return;
  const plan = DB.getPlan();
  const day = plan.find(d => d.id === w.planDayId);
  document.getElementById('hist-detail-title').textContent =
    `${day ? day.name : (w.planDayName || 'Freies Training')} — ${fmtDate(w.startTs)}`;

  // PR-Marker pro Übung (gewichtsbasiert).
  const prByExId = {};
  (w.prs || []).forEach(p => { prByExId[p.exId] = p; });

  const uebungen = w.exercises || [];
  const saetze = uebungen.reduce((n, ex) => n + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0);
  const kopf = `<div class="hd-stats">
    <div class="hd-stat"><b>${fmtDur(w.duration)}</b><span>Dauer</span></div>
    <div class="hd-stat"><b>${fmtVol(calcVolume(w))}</b><span>Volumen</span></div>
    <div class="hd-stat"><b>${saetze}</b><span>Sätze</span></div>
  </div>`;

  const schritte = uebungen.map((ex, idx) => {
    const id = ex.exId || ex.id;
    const exData = getEx(id);
    const farbe = muscleColor(exData ? exData.muscle : 'chest');
    const pr = prByExId[id];
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    // Reihenfolge Wiederholungen × Gewicht — so wird der Satz gesprochen („8 mal 92 Kilo").
    // Ohne Gewicht (Körpergewichtsübung) nur die Wiederholungen.
    const chips = sets.map(s => s.weight
      ? `<span class="hd-chip">${s.reps || '–'}<i>×</i>${s.weight}<i> kg</i></span>`
      : `<span class="hd-chip">${s.reps || '–'}<i> Wdh.</i></span>`).join('');
    const prChip = pr ? `<span class="hd-pr">🏆 PR ${pr.weight} kg</span>` : '';
    const delta = _fortschrittZeile(_maxGewicht(ex), _maxDerVorherigenEinheit(ws, i, id));
    // Die Umrandung sitzt auf dem Inhalt, nicht auf dem ganzen Schritt — sonst liefe sie
    // um die Nummernscheibe herum, die links auf der Linie sitzt.
    const hervor = (highlightExId && id === highlightExId) ? ' hd-step-hl' : '';
    return `<div class="hd-step" style="--mc:${farbe}">
      <div class="hd-step-num">${idx + 1}</div>
      <div class="hd-step-body${hervor}">
        <div class="hd-step-title">${ex.name}${prChip}</div>
        ${delta}
        <div class="hd-cols">
          <div class="hd-chips">${chips}</div>
          <div class="hd-right">
            ${ex.notes ? `<div class="hd-note">${ex.notes}</div>` : ''}
            ${exChartHTML(id, `hd-chart-${idx}`, { collapsible: true })}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('hist-detail-body').innerHTML =
    kopf +
    `<div class="hd-rail">
       <button class="hd-toggle-all" id="hd-toggle-all" onclick="toggleAllHdCharts()">Alle einklappen</button>
       ${schritte}
     </div>` +
    `<button class="btn btn-danger btn-full" style="margin-top:18px" onclick="deleteSession(${i})">🗑 Einheit löschen</button>`;
  openModal('modal-hist-detail');
  _renderHdCharts();
}

// ── Verlaufsdiagramme in der Einheiten-Detailansicht ────────────────────────────
// Eine Instanz je Uebung; alle zusammen verwaltet, weil sie beim Umschalten des Modus
// und beim Auf-/Zuklappen gemeinsam neu gezeichnet werden.
let _hdCharts = [];
function _renderHdCharts() {
  _hdCharts.forEach(c => c.destroy());
  _hdCharts = [];
  document.querySelectorAll('#hist-detail-body .ex-chart-block:not(.collapsed) canvas').forEach(cv => {
    const chart = _zeichneExDiagramm(cv, cv.dataset.ex);
    if (chart) _hdCharts.push(chart);
  });
}

// Ein Knopf fuer alle: Sind alle zu, klappt er alle auf — sonst klappt er alle zu.
function toggleAllHdCharts() {
  const bloecke = [...document.querySelectorAll('#hist-detail-body .ex-chart-block')];
  if (!bloecke.length) return;
  const alleZu = bloecke.every(b => b.classList.contains('collapsed'));
  bloecke.forEach(b => b.classList.toggle('collapsed', !alleZu));
  if (alleZu) _renderHdCharts();
  _syncHdToggleAllLabel();
}

// Beschriftung folgt dem tatsaechlichen Zustand — auch wenn einzelne Diagramme
// ueber ihre eigene Ueberschrift umgeschaltet wurden.
function _syncHdToggleAllLabel() {
  const btn = document.getElementById('hd-toggle-all');
  if (!btn) return;
  const bloecke = [...document.querySelectorAll('#hist-detail-body .ex-chart-block')];
  const alleZu = bloecke.length > 0 && bloecke.every(b => b.classList.contains('collapsed'));
  btn.textContent = alleZu ? 'Alle ausklappen' : 'Alle einklappen';
}

function deleteSession(i) {
  const ws = DB.getWorkouts();
  const w = ws[i];
  if (!w) return;
  const plan = DB.getPlan();
  const day = plan.find(d => d.id === w.planDayId);
  const dayName = day ? day.name : (w.planDayName || 'Freies Training');
  const dateStr = fmtDate(w.startTs);
  // Erst hist-detail-Modal schließen, dann confirmAction öffnen (z-index/DOM-Order-Schutz)
  closeModal('modal-hist-detail');
  setTimeout(() => {
    confirmAction(
      'Einheit löschen?',
      `${dayName} vom ${dateStr} wirklich löschen? Volumen und Bestleistungen werden neu berechnet.`,
      () => {
        const ws2 = DB.getWorkouts();
        const [removed] = ws2.splice(i, 1);
        DB.saveWorkouts(ws2); // löst markLocalChange → Drive-Sync aus
        trashPut('workout', `${dayName} · ${dateStr}`, removed);
        // Aktuellen Screen neu rendern, damit Stats/Charts/Listen aktualisiert werden
        if (currentScreen === 'overview') renderOverview();
        showUndoToast('Einheit gelöscht', () => {
          const ws3 = DB.getWorkouts();
          ws3.splice(i, 0, removed);
          DB.saveWorkouts(ws3);
          DB.saveTrash(DB.getTrash().filter(t => !(t.type === 'workout' && t.payload.id === removed.id)));
          if (currentScreen === 'overview') renderOverview();
          showToast('Wiederhergestellt');
        });
      },
      { danger: true, confirmLabel: 'Löschen' }
    );
  }, 80);
}

// ═══════════════════════════════════════════════
// SCREEN: MEHR
// ═══════════════════════════════════════════════

let editingDayIdx = null;
 // Toggle für die kollabierbare "Andere Trainingstage"-Sektion

function renderMehr() {
  renderAppVersion();
  // Einstellungen-Overlay: Cloud-Sync, Papierkorb, Daten & Sicherheit.
  // Trainingsplan-Daten/Wochenplan/Trainingstage sind in den Plan-Detail-Screen umgezogen.
  if (typeof renderDriveStatus === 'function') renderDriveStatus();
  renderTrash();
}

// ═══════════════════════════════════════════════
// SCREEN: TRAININGSPLÄNE (Liste + Detail)
// ═══════════════════════════════════════════════

// Auto-archivierung: Pläne deren Enddatum > 30 Tage in der Vergangenheit liegt
// werden automatisch als archived markiert (wenn nicht schon). Wird beim Rendern der Liste aufgerufen.
function autoArchiveOldPlans() {
  const plans = DB.getPlans();
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  let dirty = false;
  for (const p of plans) {
    if (!p.archived && p.endDate && p.endDate < cutoff) {
      // Tag-Modell v2: beim (Auto-)Archivieren die Tage EINFRIEREN (Snapshot), damit der
      // Rückblick nicht von späteren Bibliotheks-Änderungen verändert wird.
      p.archivedDays = JSON.parse(JSON.stringify(resolvePlanDays(p)));
      p.archived = true;
      dirty = true;
    }
  }
  if (dirty) DB.savePlans(plans);
}

// Status eines Plans relativ zu heute
function planStatus(p) {
  if (p.archived) return 'archived';
  const now = Date.now();
  if (p.startDate > now) return 'future';
  if (p.endDate < now) return 'past';
  return 'active';
}
const PLAN_STATUS_LABEL = { active: 'Aktuell', future: 'Zukunft', past: 'Beendet', archived: 'Archiviert' };

// Laufzeit in Wochen. Faellt auf die Rechnung aus Start/Ende zurueck — aeltere Plaene
// haben kein weeksTotal, sonst stuende dort „undefined Wochen".
function planWochen(p) {
  if (!p) return null;
  if (p.weeksTotal) return p.weeksTotal;
  if (!p.startDate || !p.endDate) return null;
  return Math.max(1, Math.round((p.endDate - p.startDate) / (7 * 24 * 3600 * 1000)));
}

function fmtDateRange(start, end) {
  const fmt = (ts) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

// Dashboard-Karte eines Plans (Trainingsplan-Liste UND Übersicht-Tab). Reine Vorschau —
// Tippen öffnet den Plan-Detail. Fortschritt/Adhärenz nur beim aktiven Plan (laufende Woche).
function buildPlanCard(p, onTap, hideToday, hideStatus, hideMeta) {
  const todayIdx = (new Date().getDay()+6) % 7;
  const status = planStatus(p);
  const isCurrent = status === 'active';
  const weekDone = isCurrent ? getCurrentWeekDays() : null;   // erledigte Trainings dieser Woche (nur aktiver Plan)
  const days = resolvePlanDays(p);
  const byId = {}; days.forEach(d => { byId[d.id] = d; });
  const wp = (p.weekPlan && p.weekPlan.length) ? p.weekPlan : DEFAULT_WEEKPLAN;
  // Nur Wochentage, keine Trainingstag-Namen (Leonard-Wunsch): geplante Tage stehen in einem
  // eingefärbten Kreis (Akzentfarbe = geplant, grün = diese Woche erledigt, Ring = heute).
  // Die konkreten Tagnamen zeigt die Plan-Detailansicht.
  const strip = wp.map((w, i) => {
    const d = w.planDayId ? byId[w.planDayId] : null;
    const today = isCurrent && i === todayIdx && !hideToday;
    const done = d && weekDone && weekDone[i] && weekDone[i].dayDone;
    const cls = ['ppv-col'];
    if (d) cls.push('training');
    if (done) cls.push('done');
    if (today) cls.push('today');
    // Beim aktiven Plan springt ein Tipp auf einen Wochentag in den Trainings-Tab auf genau
    // diesen Tag — sonst wäre der Streifen auf der Übersicht reine Anzeige.
    const tap = isCurrent
      ? ` onclick="event.stopPropagation();jumpToWorkoutDay(${i})" role="button" tabindex="0" aria-label="${w.label} öffnen"`
      : '';
    return `<div class="${cls.join(' ')}"${tap}><span class="ppv-wd">${w.label}</span></div>`;
  }).join('');
  let progress = '';
  if (isCurrent) {
    const pw = _planProgramWeek(p);
    const ws = getWeekStatus();
    const pct = Math.round(pw.num / (pw.total || 1) * 100);
    const streak = getWeekStreak();
    progress = `<div class="ppv-progress">
      <span class="ppv-wk">Woche ${pw.num} / ${pw.total}</span>
      <div class="ppv-bar"><div class="ppv-bar-fill" style="width:${Math.min(100,pct)}%"></div></div>
      <span class="ppv-adh">${ws.done}/${ws.planned} diese Woche</span>
    </div>
    ${streak >= 2 ? `<div class="ppv-streak">${streak} Wochen in Folge vollständig</div>` : ''}`;
  }
  return `<div class="plan-card-v2 plan-status-${status}${isCurrent ? ' active' : ''}" onclick="${onTap || `openPlanDetail('${p.id}')`}">
    <div class="ppv-head">
      <div class="ppv-name">${escapeHtml(p.name)}</div>
      ${hideStatus ? '' : `<span class="plan-status-chip plan-status-chip-${status}">${PLAN_STATUS_LABEL[status]}</span>`}
    </div>
    ${hideMeta ? '' : `<div class="ppv-meta">${fmtDateRange(p.startDate, p.endDate)}${planWochen(p) ? ` · ${planWochen(p)} Wochen` : ''}</div>`}
    ${progress}
    <div class="ppv-strip">${strip}</div>
  </div>`;
}

let plansArchiveExpanded = false; // Toggle für die kollabierbare "Archivierte Pläne"-Sektion
function togglePlansArchive() {
  plansArchiveExpanded = !plansArchiveExpanded;
  renderPlans();
}

function renderPlans() {
  autoArchiveOldPlans();
  const plans = DB.getPlans();
  const active = plans.filter(p => !p.archived).sort((a,b) => a.startDate - b.startDate);
  const archived = plans.filter(p => p.archived).sort((a,b) => b.startDate - a.startDate);

  const subEl = document.getElementById('plans-subline');
  if (subEl) {
    if (!plans.length) subEl.textContent = 'Noch keine Trainingspläne erstellt';
    else subEl.textContent = `${active.length} aktiv${archived.length ? ` • ${archived.length} archiviert` : ''}`;
  }

  // Nicht direkt an map() geben: das reicht (element, index, array) durch, der Index
  // landete als onTap und erzeugte ab dem zweiten Plan ein totes onclick="1".
  // Der laufende Plan wird EXAKT wie in der Uebersicht gezeichnet (ohne Laufzeitzeile und
  // ohne Status-Chip). Alle anderen behalten beides — sonst waeren mehrere Karten
  // untereinander nicht mehr auseinanderzuhalten (Leonard-Entscheidung 20.08.2026).
  // Der Tipp bleibt unterschiedlich: hier fuehrt er in die Bearbeitung (Standard-onTap),
  // in der Uebersicht auf diesen Tab.
  const renderRow = (p) => planStatus(p) === 'active'
    ? buildPlanCard(p, null, /*hideToday*/ false, /*hideStatus*/ true, /*hideMeta*/ true)
    : buildPlanCard(p, null, /*hideToday*/ true);

  let html = '';
  if (!active.length && !archived.length) {
    html = `<div class="plan-day-empty" style="margin:24px 14px">Noch keine Trainingspläne — tippe auf das + oben rechts, um deinen ersten Plan anzulegen.</div>`;
  } else {
    html += active.map(renderRow).join('');
    if (archived.length) {
      const expanded = plansArchiveExpanded;
      html += `<div class="plans-list-archive-header${expanded ? ' expanded' : ''}" onclick="togglePlansArchive()">
        <span class="plan-day-collapse-arrow">${expanded ? '▾' : '▸'}</span>
        <span class="plan-day-collapse-label">Archivierte Pläne</span>
        <span class="plan-day-collapse-count">${archived.length}</span>
      </div>`;
      if (expanded) html += archived.map(renderRow).join('');
    }
  }
  document.getElementById('plans-list').innerHTML = html;
}

function renderPlanDetail() {
  const plans = DB.getPlans();
  const plan = plans.find(p => p.id === editingPlanId);
  if (!plan) { showScreen('plans'); return; }

  // Header
  document.getElementById('plan-detail-title').textContent = plan.name;
  const status = planStatus(plan);
  document.getElementById('plan-detail-subline').innerHTML =
    `${fmtDateRange(plan.startDate, plan.endDate)} <span class="plan-status-chip plan-status-chip-${status}" style="margin-left:8px">${PLAN_STATUS_LABEL[status]}</span>`;

  // Program form
  document.getElementById('prog-name').value = plan.name || '';
  const progNotesEl = document.getElementById('prog-notes');
  if (progNotesEl) progNotesEl.value = plan.notes || '';
  document.getElementById('prog-weeks').value = plan.weeksTotal || 12;
  document.getElementById('prog-start').value = _msToDate(plan.startDate);
  document.getElementById('prog-end').value   = _msToDate(plan.endDate);

  // Weekplan dropdowns
  const wp = plan.weekPlan || JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  const trainingDays = resolvePlanDays(plan);
  const today = new Date(); const todayIdx = (today.getDay()+6)%7;
  // Wochenplan als Mo–So-LISTE (eine Zeile pro Wochentag). Anders als die kompakten Strips in
  // Übersicht/Workouts zeigt die Detailansicht die VOLLEN Trainingstag-Namen — daher Zeilen statt
  // 7 Spalten, sonst müssten lange Namen abgeschnitten werden. Tippen auf eine Zeile öffnet ein
  // natives Dropdown (overlaid <select>) zum Zuweisen eines Trainingstags bzw. Ruhetag.
  document.getElementById('mehr-weekplan').innerHTML = `<div class="wpe-list">` + wp.map((d, i) => {
    const assigned = d.planDayId ? trainingDays.find(td => td.id === d.planDayId) : null;
    const options = `<option value="" ${!d.planDayId ? 'selected' : ''}>Ruhetag</option>` +
      trainingDays.map(td => `<option value="${td.id}" ${d.planDayId === td.id ? 'selected' : ''}>${escapeHtml(td.name)}</option>`).join('');
    const cls = 'wpe-row' + (i === todayIdx ? ' today' : '') + (assigned ? ' training' : '');
    return `<div class="${cls}">
      <span class="wpe-day">${d.label}</span>
      ${assigned ? `<span class="pd-name wpe-name">${escapeHtml(assigned.name)}</span>` : `<span class="wpe-rest">Ruhetag</span>`}
      <span class="wpe-chev">›</span>
      <select class="wpe-select" onchange="saveWeekPlanDay(${i}, this.value)" aria-label="Trainingstag für ${d.label}">${options}</select>
    </div>`;
  }).join('') + `</div>`;

  // Bearbeiten-Button (Lösch-Auswahl) im Trainingstage-Header; „+ Trainingstag" im Edit-Modus ausblenden
  const daysEditSlot = document.getElementById('plan-days-edit-slot');
  if (daysEditSlot) daysEditSlot.innerHTML = trainingDays.length ? delEditBtn('plan-days') : '';
  const addDayBtn = document.getElementById('plan-add-day-btn');
  if (addDayBtn) addDayBtn.style.display = delEditActive('plan-days') ? 'none' : '';

  // Wochentag-Zuordnung je Tag (für Chips + Sortierung)
  const dayLabelsFor = {};
  const earliestDayIdx = {};
  wp.forEach((w, idx) => {
    if (w.planDayId) {
      if (!dayLabelsFor[w.planDayId]) { dayLabelsFor[w.planDayId] = []; earliestDayIdx[w.planDayId] = idx; }
      dayLabelsFor[w.planDayId].push(w.label);
    }
  });
  const dayChips = (d) => {
    const usedOn = dayLabelsFor[d.id] || [];
    return usedOn.length
      ? `<div class="pdr-days">${usedOn.map(lbl => `<span class="pdr-day-chip">${lbl}</span>`).join('')}</div>` : '';
  };
  // Reihenfolge: zugewiesene Tage zuerst (nach frühestem Wochentag), dann unzugewiesene — ALLE sichtbar
  // (kein einklappbarer „Andere Trainingstage"-Abschnitt mehr; Hinzufügen nur via „+ Trainingstag hinzufügen").
  const orderedDays = trainingDays
    .map((d, i) => ({ d, i, sort: dayLabelsFor[d.id] != null && earliestDayIdx[d.id] != null ? earliestDayIdx[d.id] : 99 }))
    .sort((a, b) => a.sort - b.sort);

  if (delEditActive('plan-days')) {
    // Bearbeiten-Modus: GLEICHE Darstellung (pinke Pille) + Auswahl-Kästchen, keine Aktions-Buttons
    // (Leonard-Wunsch: kein Layout-Wechsel, kein oranger Streifen).
    const rows = orderedDays.map(({ d }) => {
      const checked = _delSel.has(String(d.id));
      const setCount = d.exercises.reduce((a,e) => a+e.targetSets, 0);
      return `<div class="plan-day-row del-select${checked ? ' sel' : ''}" onclick="toggleDelSel('${d.id}')">
        <span class="del-check">${checked ? '✓' : ''}</span>
        <div class="pdr-info">
          <div class="pdr-name">${pd(d.name)}</div>
          <div class="pdr-sub">${d.exercises.length} Übungen • ${setCount} Sätze</div>
        </div>
        ${dayChips(d)}
      </div>`;
    }).join('');
    const n = _delSel.size;
    const bar = n > 0
      ? `<button class="del-confirm-btn" onclick="confirmDelEdit()">✕ Löschen (${n})</button>`
      : `<div class="del-edit-hint">Tippe die Trainingstage an, die du aus dem Plan entfernen möchtest.</div>`;
    document.getElementById('mehr-plan-list').innerHTML =
      (rows || '<div class="plan-day-empty">Noch keine Trainingstage erstellt</div>') + bar;
  } else {
    const renderDayRow = ({ d, i }) => {
      const isActive = !!dayLabelsFor[d.id];
      const setCount = d.exercises.reduce((a,e) => a+e.targetSets, 0);
      return `<div class="plan-day-row${isActive ? ' active' : ''}">
        <div class="pdr-info" onclick="openPlanDayModal(${i})" style="cursor:pointer">
          <div class="pdr-name">${pd(d.name)}</div>
          <div class="pdr-sub">${d.exercises.length} Übungen • ${setCount} Sätze</div>
        </div>
        ${dayChips(d)}
        <div class="plan-day-actions">
          <button onclick="event.stopPropagation();openPlanDayModal(${i})" title="Bearbeiten">✎</button>
          <button class="del" onclick="event.stopPropagation();deletePlanDay(${i})" title="Löschen">✕</button>
        </div>
      </div>`;
    };
    document.getElementById('mehr-plan-list').innerHTML = orderedDays.length
      ? orderedDays.map(renderDayRow).join('')
      : '<div class="plan-day-empty">Noch keine Trainingstage erstellt</div>';
  }

  // Archiv-Label aktualisieren
  document.getElementById('plan-archive-label').textContent = plan.archived ? 'Aus Archiv holen' : 'Plan archivieren';
}

// ─── Plan CRUD ───────────────────────────────────────
function createNewPlan() {
  promptForName('Name des neuen Trainingsplans', 'Neuer Trainingsplan', (name) => {
    const plans = DB.getPlans();
    const startDate = Date.now();
    const weeksTotal = 12;
    const endDate = startDate + weeksTotal * 7 * 24 * 3600 * 1000;
    const newPlan = {
      id: 'plan_' + Date.now() + '_' + Math.floor(Math.random()*10000),
      name, weeksTotal, startDate, endDate,
      notes: '',
      dayIds: [],
      weekPlan: JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN)),
      archived: false,
      createdAt: Date.now(),
    };
    plans.push(newPlan);
    DB.savePlans(plans);
    showToast(`Trainingsplan "${name}" erstellt`);
    openPlanDetail(newPlan.id);
  });
}

function openPlanDetail(planId) {
  editingPlanId = planId;
  resetDelEdit();
  showScreen('plan-detail');
}

function closePlanDetail() {
  editingPlanId = null;
  showScreen('plans');
}

function togglePlanArchive() {
  const plans = DB.getPlans();
  const plan = plans.find(p => p.id === editingPlanId);
  if (!plan) return;
  if (!plan.archived) {
    // → Archivieren: Tage EINFRIEREN (Snapshot). Ab jetzt unberührt von Bibliotheks-Änderungen,
    //   damit der Plan ein korrekter Rückblick bleibt.
    plan.archivedDays = JSON.parse(JSON.stringify(resolvePlanDays(plan)));
    plan.archived = true;
  } else {
    // → Aus Archiv holen: Snapshot „losgelöst" behalten — die eingefrorenen Tage werden als
    //   frische, plan-eigene Bibliothek-Tage übernommen, damit der Plan exakt seinen
    //   eingefrorenen Stand weiterführt (kein automatisches Re-Sharing alter geteilter Tage).
    const snap = Array.isArray(plan.archivedDays) ? plan.archivedDays : resolvePlanDays(plan);
    const lib = DB.getTrainingDays();
    const idMap = {};
    const fresh = snap.map((d, i) => {
      const newId = 'libday_' + Date.now() + '_' + Math.floor(Math.random()*100000) + '_' + i;
      idMap[d.id] = newId;
      return {
        id: newId, name: d.name, color: d.color || null,
        exercises: JSON.parse(JSON.stringify(d.exercises || [])),
        notes: d.notes || '', archived: false, createdAt: Date.now(),
      };
    });
    if (fresh.length) { lib.push(...fresh); DB.saveTrainingDays(lib); }
    plan.dayIds = fresh.map(d => d.id);
    (plan.weekPlan || []).forEach(w => {
      w.planDayId = (w.planDayId && idMap[w.planDayId]) ? idMap[w.planDayId] : null;
    });
    delete plan.archivedDays;
    plan.archived = false;
  }
  DB.savePlans(plans);
  showToast(plan.archived ? 'Plan archiviert' : 'Plan aus Archiv geholt');
  renderPlanDetail();
}

function deleteCurrentPlan() {
  const plans = DB.getPlans();
  const plan = plans.find(p => p.id === editingPlanId);
  if (!plan) return;
  confirmAction(
    'Trainingsplan löschen?',
    `"${plan.name}" und alle zugehörigen Trainingstage werden unwiderruflich gelöscht. Bereits absolvierte Einheiten bleiben im Verlauf erhalten.`,
    () => {
      const deletedId = editingPlanId;
      const removed = DB.getPlans().find(p => p.id === deletedId);
      withUndo('Plan gelöscht', () => {
        const ps = DB.getPlans().filter(p => p.id !== deletedId);
        DB.savePlans(ps);
        if (removed) trashPut('plan', removed.name || 'Plan', removed);
        editingPlanId = null;
        showScreen('plans');
      }, () => renderPlansScreen());
    },
    { danger: true, confirmLabel: 'Löschen' }
  );
}

// Hilfs-Helper: nach jeder Plan-Edit-Aktion den Plan-Detail-Screen neu rendern,
// damit Header / Status-Chip / Wochenplan-Strip / Trainingstage-Liste konsistent
// zu den frisch gespeicherten Daten stehen. Wirkt nur, wenn der User aktuell auf
// dem Plan-Detail-Screen ist — sonst no-op (nichts unnoetiges re-rendern).
function _renderAfterPlanEdit() {
  if (currentScreen === 'plan-detail') renderPlanDetail();
}

function saveProgramForm() {
  const p = DB.getProgram();
  p.name = document.getElementById('prog-name').value.trim() || 'Mein Trainingsplan';
  DB.saveProgram(p);
  _renderAfterPlanEdit();
}

// Notizen eines Trainingsplans speichern (plan.notes). Kein Re-Render noetig (Textarea behaelt Wert).
function savePlanNotes() {
  const el = document.getElementById('prog-notes');
  if (!el) return;
  const plans = DB.getPlans();
  const p = plans.find(pl => pl.id === editingPlanId);
  if (!p) return;
  p.notes = el.value;
  DB.savePlans(plans);
}

// ═══════════════════════════════════════════════
// TRAININGSTAGE-BIBLIOTHEK (planunabhaengige Tage)
// ═══════════════════════════════════════════════
let plansViewMode = 'plans';   // 'plans' | 'days' — aktive Unteransicht im Trainingsplan-Tab
let editingLibDayId = null;     // aktuell im Tag-Detail bearbeiteter Bibliotheks-Tag
let libDaysArchiveExpanded = false;

function setPlansView(mode) {
  if (mode !== 'plans' && mode !== 'days') return;
  plansViewMode = mode;
  renderPlansScreen();
}
function onPlansAdd() {
  if (plansViewMode === 'days') createNewLibDay();
  else openPlanSourceModal();
}

// ─── Schnellstart: Plan-Quelle wählen (Leer / Vorlage / Bestehenden kopieren) ───
function openPlanSourceModal() { openModal('modal-plan-create-source'); }
function createEmptyPlanFromChooser() { closeModal('modal-plan-create-source'); createNewPlan(); }

// Fertige Plan-Vorlagen. Jede Vorlage: Trainingstage (mit Übungen + Ziel-Sätze/Wdh.) +
// Wochenzuordnung (week[i] = Index in days, 0=Mo … 6=So; null = Ruhetag).
const PLAN_TEMPLATES = {
  ppl: {
    name: 'Push / Pull / Legs', desc: '3er-Split: Drücken · Ziehen · Beine (Mo/Mi/Fr)', weeks: 12,
    days: [
      { name: 'Push', exercises: [
        { exId:'bench_press', targetSets:3, targetReps:8 },
        { exId:'incline_bench', targetSets:3, targetReps:10 },
        { exId:'shoulder_press', targetSets:3, targetReps:10 },
        { exId:'lateral_raise', targetSets:3, targetReps:12 },
        { exId:'tricep_pushdown', targetSets:3, targetReps:12 },
      ]},
      { name: 'Pull', exercises: [
        { exId:'deadlift', targetSets:3, targetReps:6 },
        { exId:'lat_pulldown', targetSets:3, targetReps:10 },
        { exId:'cable_row', targetSets:3, targetReps:10 },
        { exId:'face_pull', targetSets:3, targetReps:15 },
        { exId:'bicep_curl', targetSets:3, targetReps:12 },
      ]},
      { name: 'Legs', exercises: [
        { exId:'squat', targetSets:3, targetReps:8 },
        { exId:'leg_press', targetSets:3, targetReps:10 },
        { exId:'rdl', targetSets:3, targetReps:10 },
        { exId:'leg_curl', targetSets:3, targetReps:12 },
        { exId:'calf_raise', targetSets:4, targetReps:15 },
      ]},
    ],
    week: [0, null, 1, null, 2, null, null],
  },
  upperlower: {
    name: 'Oberkörper / Unterkörper', desc: 'Upper/Lower-Split, 4 Tage (Mo/Di/Do/Fr)', weeks: 12,
    days: [
      { name: 'Oberkörper', exercises: [
        { exId:'bench_press', targetSets:3, targetReps:8 },
        { exId:'barbell_row', targetSets:3, targetReps:8 },
        { exId:'shoulder_press', targetSets:3, targetReps:10 },
        { exId:'lat_pulldown', targetSets:3, targetReps:10 },
        { exId:'tricep_pushdown', targetSets:3, targetReps:12 },
        { exId:'bicep_curl', targetSets:3, targetReps:12 },
      ]},
      { name: 'Unterkörper', exercises: [
        { exId:'squat', targetSets:3, targetReps:8 },
        { exId:'rdl', targetSets:3, targetReps:10 },
        { exId:'leg_press', targetSets:3, targetReps:10 },
        { exId:'leg_curl', targetSets:3, targetReps:12 },
        { exId:'calf_raise', targetSets:4, targetReps:15 },
      ]},
    ],
    week: [0, 1, null, 0, 1, null, null],
  },
  fullbody: {
    name: 'Ganzkörper', desc: 'Full-Body, 3 Tage/Woche (Mo/Mi/Fr)', weeks: 12,
    days: [
      { name: 'Ganzkörper', exercises: [
        { exId:'squat', targetSets:3, targetReps:8 },
        { exId:'bench_press', targetSets:3, targetReps:8 },
        { exId:'barbell_row', targetSets:3, targetReps:8 },
        { exId:'shoulder_press', targetSets:3, targetReps:10 },
        { exId:'leg_curl', targetSets:3, targetReps:12 },
        { exId:'bicep_curl', targetSets:2, targetReps:12 },
      ]},
    ],
    week: [0, null, 0, null, 0, null, null],
  },
};
const PLAN_TEMPLATE_ORDER = ['ppl', 'upperlower', 'fullbody'];

function openPlanTemplateModal() {
  closeModal('modal-plan-create-source');
  const html = PLAN_TEMPLATE_ORDER.map(key => {
    const t = PLAN_TEMPLATES[key];
    const dayNames = t.days.map(d => d.name).join(' · ');
    const trainDays = t.week.filter(x => x !== null && x !== undefined).length;
    return `<div class="plan-list-row" onclick="applyPlanTemplate('${key}')" style="cursor:pointer">
      <div class="plan-list-info">
        <div class="plan-list-name">${escapeHtml(t.name)}</div>
        <div class="plan-list-meta">${escapeHtml(t.desc)}</div>
        <div class="plan-list-meta" style="margin-top:2px;opacity:0.85">${escapeHtml(dayNames)} • ${trainDays} Trainingstage/Woche</div>
      </div>
      <div class="plan-list-action">›</div>
    </div>`;
  }).join('');
  document.getElementById('plan-template-list').innerHTML = html;
  openModal('modal-plan-template');
}

function applyPlanTemplate(key) {
  const t = PLAN_TEMPLATES[key];
  if (!t) return;
  closeModal('modal-plan-template');
  // 1) Trainingstage als eigenständige Bibliothek-Tage anlegen (Referenz-Modell)
  const lib = DB.getTrainingDays();
  const dayIds = [];
  t.days.forEach((d, i) => {
    const id = 'libday_' + Date.now() + '_' + Math.floor(Math.random()*100000) + '_' + i;
    lib.push({ id, name: d.name, color: null, exercises: d.exercises.map(e => ({ ...e })), notes: '', archived: false, createdAt: Date.now() });
    dayIds.push(id);
  });
  DB.saveTrainingDays(lib);
  // 2) Wochenplan aus der Vorlage bauen
  const weekPlan = JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  weekPlan.forEach((slot, wi) => {
    const di = t.week[wi];
    slot.planDayId = (di === null || di === undefined) ? null : (dayIds[di] || null);
  });
  // 3) Plan anlegen + öffnen
  const plans = DB.getPlans();
  const startDate = Date.now();
  const weeksTotal = t.weeks || 12;
  const endDate = startDate + weeksTotal * 7 * 24 * 3600 * 1000;
  const np = { id: 'plan_' + Date.now() + '_' + Math.floor(Math.random()*10000), name: t.name, weeksTotal, startDate, endDate, notes: '', dayIds, weekPlan, archived: false, createdAt: Date.now() };
  plans.push(np);
  DB.savePlans(plans);
  showToast(`Vorlage „${t.name}" erstellt`);
  openPlanDetail(np.id);
}

// ─── Bestehenden Plan als Vorlage kopieren (UNABHÄNGIGE Kopie) ───
function openPlanCopyModal() {
  closeModal('modal-plan-create-source');
  renderPlanCopyList();
  openModal('modal-plan-copy');
}
function renderPlanCopyList() {
  const plans = DB.getPlans().slice().sort((a,b) => (a.archived?1:0)-(b.archived?1:0) || (b.startDate||0)-(a.startDate||0));
  const html = plans.map(p => {
    const n = resolvePlanDays(p).length;
    const tag = p.archived ? ' · archiviert' : '';
    return `<div class="plan-list-row" onclick="copyExistingPlan('${p.id}')" style="cursor:pointer">
      <div class="plan-list-info">
        <div class="plan-list-name">${escapeHtml(p.name)}</div>
        <div class="plan-list-meta">${n} Trainingstag${n===1?'':'e'}${tag}</div>
      </div>
      <div class="plan-list-action">›</div>
    </div>`;
  }).join('');
  document.getElementById('plan-copy-list').innerHTML = html ||
    '<p style="color:var(--text3);text-align:center;padding:20px">Noch keine Pläne zum Kopieren vorhanden.</p>';
}
function copyExistingPlan(planId) {
  const src = DB.getPlans().find(p => p.id === planId);
  if (!src) return;
  closeModal('modal-plan-copy');
  // Unabhängige Kopie: frische Bibliothek-Tage (neue IDs), damit Bearbeiten das Original nicht ändert.
  const srcDays = resolvePlanDays(src); // archiviert → Snapshot, aktiv → resolvte Tage
  const lib = DB.getTrainingDays();
  const idMap = {};
  const newDayIds = [];
  srcDays.forEach((d, i) => {
    const id = 'libday_' + Date.now() + '_' + Math.floor(Math.random()*100000) + '_' + i;
    idMap[d.id] = id;
    lib.push({ id, name: d.name, color: d.color || null, exercises: JSON.parse(JSON.stringify(d.exercises || [])), notes: d.notes || '', archived: false, createdAt: Date.now() });
    newDayIds.push(id);
  });
  DB.saveTrainingDays(lib);
  const weekPlan = JSON.parse(JSON.stringify(src.weekPlan || DEFAULT_WEEKPLAN));
  weekPlan.forEach(slot => { slot.planDayId = (slot.planDayId && idMap[slot.planDayId]) ? idMap[slot.planDayId] : null; });
  const plans = DB.getPlans();
  const startDate = Date.now();
  const weeksTotal = src.weeksTotal || 12;
  const endDate = startDate + weeksTotal * 7 * 24 * 3600 * 1000;
  const np = { id: 'plan_' + Date.now() + '_' + Math.floor(Math.random()*10000), name: src.name + ' (Kopie)', weeksTotal, startDate, endDate, notes: src.notes || '', dayIds: newDayIds, weekPlan, archived: false, createdAt: Date.now() };
  plans.push(np);
  DB.savePlans(plans);
  showToast(`„${src.name}" als neuer Plan kopiert`);
  openPlanDetail(np.id);
}
// Rendert die im Plans-Tab aktive Unteransicht (Pläne ODER Trainingstage-Bibliothek).
function renderPlansScreen() {
  const segP = document.getElementById('seg-plans');
  const segD = document.getElementById('seg-days');
  if (segP) segP.classList.toggle('active', plansViewMode === 'plans');
  if (segD) segD.classList.toggle('active', plansViewMode === 'days');
  const plansList = document.getElementById('plans-list');
  const daysList = document.getElementById('libdays-list');
  const h1 = document.getElementById('plans-h1');
  const calCard = document.getElementById('plans-cal-card');
  if (plansViewMode === 'days') {
    if (plansList) plansList.style.display = 'none';
    if (daysList) daysList.style.display = '';
    if (calCard) calCard.style.display = 'none';   // gehoert zum Plan, nicht zur Tage-Bibliothek
    if (h1) h1.textContent = 'Trainingstage';
    renderLibDays();
  } else {
    if (plansList) plansList.style.display = '';
    if (daysList) daysList.style.display = 'none';
    if (calCard) { calCard.style.display = ''; renderTrainingCalendar('pcal', 'plans-cal-card'); }
    if (h1) h1.textContent = 'Trainingsplan';
    renderPlans();
  }
}

function toggleLibDaysArchive() { libDaysArchiveExpanded = !libDaysArchiveExpanded; renderLibDays(); }

function renderLibDays() {
  const days = DB.getTrainingDays();
  // Tage des aktuell aktiven Plans bekommen das grüne „Im aktuellen Plan"-Tag (wie im Übungen-Tab)
  // und werden in der Liste zuoberst einsortiert.
  const ap = getActivePlan();
  const activeDayIds = new Set(ap ? (ap.trainingDays || []).map(d => d.id) : []);
  const active = days.filter(d => !d.archived).sort((a,b) => {
    const ai = activeDayIds.has(a.id) ? 0 : 1, bi = activeDayIds.has(b.id) ? 0 : 1;
    if (ai !== bi) return ai - bi;                 // im aktuellen Plan zuerst
    return (a.createdAt||0) - (b.createdAt||0);
  });
  const archived = days.filter(d => d.archived).sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
  const subEl = document.getElementById('plans-subline');
  if (subEl) subEl.textContent = days.length
    ? `${active.length} Trainingstag${active.length===1?'':'e'}${archived.length ? ` • ${archived.length} archiviert` : ''}`
    : 'Noch keine Trainingstage erstellt';
  const renderRow = (d) => {
    const setCount = (d.exercises||[]).reduce((a,e) => a + (e.targetSets||0), 0);
    // Chip unter den Namen statt daneben — nebeneinander riss es bei mittellangen Namen
    // mitten im Wort auf zwei Zeilen auseinander.
    const planTag = activeDayIds.has(d.id)
      ? '<span class="ex-item-plan-tag">Im aktuellen Plan</span>' : '';
    return `<div class="plan-list-row" onclick="openLibDayDetail('${d.id}')">
      <div class="plan-list-info">
        <div class="plan-list-name">${pd(escapeHtml(d.name))}</div>
        <div class="plan-list-meta">${(d.exercises||[]).length} Übungen • ${setCount} Sätze</div>
        ${planTag ? `<div class="plan-list-tags">${planTag}</div>` : ''}
      </div>
      <div class="plan-list-action">›</div>
    </div>`;
  };
  // (Kein Import-Button mehr nötig: im Referenz-Modell SIND alle Plan-Tage Bibliothek-Tage.
  //  Bestehende Pläne werden einmalig per migrateDayModelV2 verknüpft.)
  let html = '';
  if (!active.length && !archived.length) {
    html = `<div class="plan-day-empty" style="margin:24px 14px">Noch keine Trainingstage — tippe auf das + oben rechts oder importiere bestehende Plan-Tage.</div>`;
  } else {
    html += active.map(renderRow).join('');
    if (archived.length) {
      const expanded = libDaysArchiveExpanded;
      html += `<div class="plans-list-archive-header${expanded ? ' expanded' : ''}" onclick="toggleLibDaysArchive()">
        <span class="plan-day-collapse-arrow">${expanded ? '▾' : '▸'}</span>
        <span class="plan-day-collapse-label">Archivierte Trainingstage</span>
        <span class="plan-day-collapse-count">${archived.length}</span>
      </div>`;
      if (expanded) html += archived.map(renderRow).join('');
    }
  }
  document.getElementById('libdays-list').innerHTML = html;
}

function createNewLibDay() {
  promptForName('Name des neuen Trainingstags', 'Neuer Trainingstag', (name) => {
    const days = DB.getTrainingDays();
    const newDay = {
      id: 'libday_' + Date.now() + '_' + Math.floor(Math.random()*10000),
      name, exercises: [], notes: '', archived: false, createdAt: Date.now(),
    };
    days.push(newDay);
    DB.saveTrainingDays(days);
    showToast(`Trainingstag "${name}" erstellt`);
    openLibDayDetail(newDay.id);
  });
}

function openLibDayDetail(id) { editingLibDayId = id; resetDelEdit(); showScreen('day-detail'); }
function closeLibDayDetail() { editingLibDayId = null; showScreen('plans'); }
function _getEditingLibDay() { return DB.getTrainingDays().find(d => d.id === editingLibDayId) || null; }

// In welchen Trainingsplänen ist DIESER Tag? Im Referenz-Modell ist das ein trivialer,
// vollständiger Lookup über plan.dayIds (aktive Pläne) bzw. archivedDays (eingefrorene Pläne).
function getPlansContainingLibDay(libDayId) {
  if (!libDayId) return [];
  return DB.getPlans().filter(p => {
    if (p.archived && Array.isArray(p.archivedDays)) return p.archivedDays.some(d => d.id === libDayId);
    if (Array.isArray(p.dayIds)) return p.dayIds.includes(libDayId);
    // Back-Compat (alte Plan-Form, noch nicht migriert)
    if (Array.isArray(p.trainingDays)) return p.trainingDays.some(d => d.id === libDayId || d.sourceLibDayId === libDayId);
    return false;
  });
}

function renderLibDayDetail() {
  const day = _getEditingLibDay();
  if (!day) { showScreen('plans'); return; }
  document.getElementById('day-detail-title').textContent = day.name;
  const setCount = (day.exercises||[]).reduce((a,e) => a + (e.targetSets||0), 0);
  document.getElementById('day-detail-subline').textContent =
    `${(day.exercises||[]).length} Übungen • ${setCount} Sätze${day.archived ? ' • archiviert' : ''}`;
  const nameEl = document.getElementById('day-name'); if (nameEl) nameEl.value = day.name || '';
  const notesEl = document.getElementById('day-notes'); if (notesEl) notesEl.value = day.notes || '';

  // In welchen Trainingsplänen ist dieser Tag (analog „Verwendet in" bei Übungen). EXAKT verknüpft
  // über sourceLibDayId — nur ab jetzt via Bibliothek hinzugefügte Tage; Altbestand/Import zeigen nichts.
  const usedInEl = document.getElementById('day-used-in');
  if (usedInEl) {
    const inPlans = getPlansContainingLibDay(day.id);
    usedInEl.innerHTML = inPlans.length
      ? `<label>In Trainingsplänen</label><div class="ex-item-using-list">${inPlans.map(p => `<span class="ex-item-day-chip">${escapeHtml(p.name)}${p.archived ? ' (archiviert)' : ''}</span>`).join('')}</div>`
      : `<label>In Trainingsplänen</label><div class="ex-item-using-empty">Noch in keinem Trainingsplan eingefügt.</div>`;
  }

  // Aktions-Button-Reihe: Archivieren-Label je nach Status
  const archBtn = document.getElementById('day-archive-btn');
  if (archBtn) archBtn.textContent = day.archived ? '📦 Aus Archiv holen' : '📦 Archivieren';

  // Übungen im Workout-Tab-Stil: dieselben aex-v2-Preview-Cards via renderPreviewWorkout(mode='libday').
  // KEIN weißer mehr-card-Hintergrund — die Cards sitzen direkt auf dem Tab-Gradient (wie im Workouts-Tab).
  const addWrap = document.getElementById('day-add-ex-wrap');
  const exEditSlot = document.getElementById('day-ex-edit-slot');
  const visExs = (day.exercises || []);
  // Nur bei vorhandenen Übungen „Bearbeiten" anbieten
  const hasVis = visExs.some(pe => !!getEx(pe.exId));
  if (exEditSlot) exEditSlot.innerHTML = hasVis ? delEditBtn('libday-ex') : '';

  if (delEditActive('libday-ex')) {
    if (addWrap) addWrap.style.display = 'none';
    const items = visExs.map((pe, i) => {
      const ex = getEx(pe.exId); if (!ex) return null;
      return { id: i, name: ex.name, color: muscleColor(ex.muscle) };
    }).filter(Boolean);
    document.getElementById('day-ex-list').innerHTML = `<div style="padding:0 14px">${buildDelEditList(items)}</div>`;
  } else {
    if (addWrap) addWrap.style.display = '';
    if (visExs.length) {
      renderPreviewWorkout(day, 'libday', 'day-ex-list');
    } else {
      document.getElementById('day-ex-list').innerHTML =
        `<div class="plan-day-empty" style="color:rgba(255,255,255,0.85);background:transparent;margin:0 14px">Noch keine Übungen — tippe unten auf „+ Übung zum Trainingstag hinzufügen".</div>`;
    }
  }
}

function saveLibDayName() {
  const el = document.getElementById('day-name'); if (!el) return;
  const days = DB.getTrainingDays();
  const d = days.find(x => x.id === editingLibDayId); if (!d) return;
  d.name = el.value.trim() || 'Trainingstag';
  DB.saveTrainingDays(days);
  document.getElementById('day-detail-title').textContent = d.name;
}
function saveLibDayNotes() {
  const el = document.getElementById('day-notes'); if (!el) return;
  const days = DB.getTrainingDays();
  const d = days.find(x => x.id === editingLibDayId); if (!d) return;
  d.notes = el.value;
  DB.saveTrainingDays(days);
}
function toggleLibDayArchive() {
  const days = DB.getTrainingDays();
  const d = days.find(x => x.id === editingLibDayId); if (!d) return;
  d.archived = !d.archived;
  DB.saveTrainingDays(days);
  showToast(d.archived ? 'Trainingstag archiviert' : 'Trainingstag aus Archiv geholt');
  renderLibDayDetail();
}
function deleteCurrentLibDay() {
  const d = _getEditingLibDay(); if (!d) return;
  confirmAction('Trainingstag löschen?',
    `"${d.name}" wird aus der Bibliothek gelöscht. Bereits in Pläne kopierte Tage bleiben dort erhalten.`,
    () => {
      const deletedId = editingLibDayId;
      const removed = DB.getTrainingDays().find(x => x.id === deletedId);
      withUndo('Trainingstag gelöscht', () => {
        const days = DB.getTrainingDays().filter(x => x.id !== deletedId);
        DB.saveTrainingDays(days);
        if (removed) trashPut('day', removed.name || 'Trainingstag', removed);
        editingLibDayId = null;
        showScreen('plans');
      }, () => renderPlansScreen());
    },
    { danger: true, confirmLabel: 'Löschen' });
}

// Referenz-Modell: Plan REFERENZIERT den Bibliothek-Tag über plan.dayIds (keine Kopie).
// Eine Änderung am Tag wirkt damit in allen referenzierenden Plänen. Idempotent.
// OHNE Wochentag-Zuweisung (Wochentag wird optional später im Plan-Detail zugewiesen).
function _addLibDayToPlanRef(plan, libDay) {
  plan.dayIds = plan.dayIds || [];
  if (!plan.dayIds.includes(libDay.id)) plan.dayIds.push(libDay.id);
}

// Enthält dieser Plan den Tag bereits? (dayIds / Back-Compat trainingDays)
function _planHasLibDay(p, dayId) {
  if (Array.isArray(p.dayIds)) return p.dayIds.includes(dayId);
  if (Array.isArray(p.trainingDays)) return p.trainingDays.some(d => d.id === dayId || d.sourceLibDayId === dayId);
  return false;
}
// Entfernt die Tag-Referenz aus einem Plan (inkl. Wochenplan-Zuweisung).
function _removeLibDayFromPlan(plan, dayId) {
  plan.dayIds = (plan.dayIds || []).filter(id => id !== dayId);
  (plan.weekPlan || []).forEach(w => { if (w.planDayId === dayId) w.planDayId = null; });
}

// „Zu Trainingsplan"-Modal: AUSWÄHLEN-dann-SPEICHERN (Leonard-Wunsch). Enthaltene Pläne sind
// vorausgewählt (orange hervorgehoben); Tippen toggelt. Erst „Speichern" schreibt die Änderungen
// (volle Verwaltung/Sync: ausgewählt → Tag wird referenziert, abgewählt → Referenz + Wochentag entfernt).
let dayToPlanSel = new Set();
function openDayToPlanModal() {
  const day = _getEditingLibDay();
  if (!day) return;
  dayToPlanSel = new Set(DB.getPlans().filter(p => !p.archived && _planHasLibDay(p, day.id)).map(p => p.id));
  document.getElementById('modal-day-to-plan-title').textContent = `„${day.name}" zu welchen Trainingsplänen?`;
  renderDayToPlanList();
  openModal('modal-day-to-plan');
}
function toggleDayToPlanSel(planId) {
  if (dayToPlanSel.has(planId)) dayToPlanSel.delete(planId);
  else dayToPlanSel.add(planId);
  renderDayToPlanList();
}
function renderDayToPlanList() {
  const plans = DB.getPlans().filter(p => !p.archived).sort((a,b) => a.startDate - b.startDate);
  const html = plans.map(p => {
    const sel = dayToPlanSel.has(p.id);
    const cls = `day-pick-row${sel ? ' in-day' : ' not-in-day'}`;
    const actions = sel ? `<span class="day-pick-icon done">✓</span>` : `<span class="day-pick-icon">+</span>`;
    const sub = `${resolvePlanDays(p).length} Trainingstage${sel ? ' · Ausgewählt' : ''}`;
    return `<div class="${cls}" onclick="toggleDayToPlanSel('${p.id}')">
      <div class="day-pick-info">
        <div class="day-pick-name">${escapeHtml(p.name)}</div>
        <div class="day-pick-sub">${sub}</div>
      </div>
      <div class="day-pick-actions">${actions}</div>
    </div>`;
  }).join('');
  document.getElementById('day-to-plan-list').innerHTML = html ||
    '<p style="color:var(--text3);text-align:center;padding:20px">Noch keine Trainingspläne.</p>';
}
function saveDayToPlan() {
  const day = _getEditingLibDay();
  if (!day) { closeModal('modal-day-to-plan'); return; }
  const plans = DB.getPlans();
  plans.filter(p => !p.archived).forEach(p => {
    const want = dayToPlanSel.has(p.id);
    const has = _planHasLibDay(p, day.id);
    if (want && !has) _addLibDayToPlanRef(p, day);
    else if (!want && has) _removeLibDayFromPlan(p, day.id);
  });
  DB.savePlans(plans);
  closeModal('modal-day-to-plan');
  renderLibDayDetail();
  showToast('Gespeichert');
}

// Entfernt EINE Übung aus dem aktuell bearbeiteten Bibliotheks-Trainingstag — mit Sicherheits-Dialog.
function removeLibDayExercise(ei) {
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === editingLibDayId);
  if (!day || !day.exercises || !day.exercises[ei]) return;
  const exName = (getEx(day.exercises[ei].exId) || {}).name || 'Übung';
  confirmAction('Übung entfernen?', `„${exName}" wird aus dem Trainingstag entfernt.`,
    () => {
      const d2 = DB.getTrainingDays();
      const dd = d2.find(d => d.id === editingLibDayId);
      if (!dd || !dd.exercises || !dd.exercises[ei]) return;
      dd.exercises.splice(ei, 1);
      DB.saveTrainingDays(d2);
      renderLibDayDetail();
    },
    { danger: true, confirmLabel: 'Entfernen' });
}

// ═══════════════════════════════════════════════
// BEARBEITEN-MODUS / LÖSCH-AUSWAHL (Auswählen-dann-Löschen)
// Pro Liste ein „Bearbeiten"-Button → Einträge werden ankreuzbar → „Löschen (N)"
// → kurzer Sicherheits-Dialog. KEIN globaler Entwurf; nur der Lösch-Vorgang wird gesammelt.
// Kontexte: 'libday-ex' (Trainingstag-Detail-Übungen), 'plan-days' (Plan-Detail-Tage),
// 'planday-ex' (Übungen im modal-plan-day). IDs: Übungen=Array-Index, Tage=day.id.
// ═══════════════════════════════════════════════
let _delCtx = null;
let _delSel = new Set();
function delEditActive(ctx) { return _delCtx === ctx; }
function _rerenderDelCtx(ctx) {
  if (ctx === 'libday-ex') renderLibDayDetail();
  else if (ctx === 'plan-days') renderPlanDetail();
  else if (ctx === 'planday-ex') { const plan = DB.getPlan(); if (plan[editingDayIdx]) renderPlanDayExList(plan[editingDayIdx]); }
}
function enterDelEdit(ctx) { _delCtx = ctx; _delSel = new Set(); _rerenderDelCtx(ctx); }
function exitDelEdit() { const c = _delCtx; _delCtx = null; _delSel = new Set(); if (c) _rerenderDelCtx(c); }
function resetDelEdit() { _delCtx = null; _delSel = new Set(); }
function toggleDelSel(id) {
  id = String(id);
  if (_delSel.has(id)) _delSel.delete(id); else _delSel.add(id);
  if (_delCtx) _rerenderDelCtx(_delCtx);
}
// „Bearbeiten"/„Fertig"-Umschalter für eine Liste
function delEditBtn(ctx) {
  const active = delEditActive(ctx);
  return `<button class="del-edit-toggle${active ? ' active' : ''}" onclick="${active ? 'exitDelEdit()' : `enterDelEdit('${ctx}')`}">${active ? 'Fertig' : 'Bearbeiten'}</button>`;
}
// Baut die ankreuzbare Liste + „Löschen (N)"-Leiste. items: [{id, name, color}]
function buildDelEditList(items) {
  const rows = (items || []).map(it => {
    const checked = _delSel.has(String(it.id));
    return `<div class="del-row${checked ? ' sel' : ''}" onclick="toggleDelSel('${it.id}')">
      <span class="del-check">${checked ? '✓' : ''}</span>
      <span class="del-row-stripe" style="background:${it.color}"></span>
      <span class="del-row-name">${escapeHtml(it.name)}</span>
    </div>`;
  }).join('');
  const n = _delSel.size;
  const bar = n > 0
    ? `<button class="del-confirm-btn" onclick="confirmDelEdit()">✕ Löschen (${n})</button>`
    : `<div class="del-edit-hint">Tippe die Einträge an, die du löschen möchtest.</div>`;
  return `<div class="del-edit-list">${rows || '<div class="del-edit-hint">Keine Einträge.</div>'}</div>${bar}`;
}
// „Löschen (N)" → Sicherheits-Dialog → löscht die markierten Einträge je Kontext
function confirmDelEdit() {
  const n = _delSel.size;
  if (!n) return;
  const ctx = _delCtx;
  const noun = (ctx === 'plan-days') ? `Trainingstag${n > 1 ? 'e' : ''}` : `Übung${n > 1 ? 'en' : ''}`;
  const msg = (ctx === 'plan-days')
    ? 'Die markierten Trainingstage werden aus diesem Plan entfernt (bleiben in der Bibliothek).'
    : 'Die markierten Übungen werden entfernt.';
  confirmAction(`${n} ${noun} wirklich löschen?`, msg,
    () => withUndo(`${n} ${noun} gelöscht`, () => _applyDelEdit(ctx), () => _rerenderDelCtx(ctx)),
    { danger: true, confirmLabel: 'Löschen' });
}
function _applyDelEdit(ctx) {
  const sel = _delSel;
  if (ctx === 'libday-ex') {
    const days = DB.getTrainingDays();
    const day = days.find(d => d.id === editingLibDayId);
    if (day && Array.isArray(day.exercises)) {
      day.exercises = day.exercises.filter((_, i) => !sel.has(String(i)));
      DB.saveTrainingDays(days);
    }
  } else if (ctx === 'plan-days') {
    const plan = DB.getPlan();
    const removeIds = new Set(plan.filter(d => sel.has(String(d.id))).map(d => d.id));
    const p = plan.filter(d => !removeIds.has(d.id));
    DB.savePlan(p);
    const wp = DB.getWeekPlan();
    let ch = false;
    wp.forEach(d => { if (removeIds.has(d.planDayId)) { d.planDayId = null; ch = true; } });
    if (ch) DB.saveWeekPlan(wp);
  } else if (ctx === 'planday-ex') {
    const plan = DB.getPlan();
    const day = plan[editingDayIdx];
    if (day && Array.isArray(day.exercises)) {
      day.exercises = day.exercises.filter((_, i) => !sel.has(String(i)));
      DB.savePlan(plan);
      syncActiveWorkoutWithPlanDay(day.id);
    }
  }
  _delCtx = null; _delSel = new Set();
  _rerenderDelCtx(ctx);
  if (ctx === 'planday-ex') _renderAfterPlanEdit();
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
  _renderAfterPlanEdit();
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
  _renderAfterPlanEdit();
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
  _renderAfterPlanEdit();
}

function saveWeekPlanDay(i, value) {
  const wp = DB.getWeekPlan();
  if (!wp[i]) return;
  wp[i].planDayId = value || null;
  DB.saveWeekPlan(wp);
  _renderAfterPlanEdit();
}

// Visueller Wochenplaner: Wochentag antippen → Picker (Trainingstage des Plans + Ruhetag).
function openPlanDayModal(idx) {
  editingDayIdx = idx;
  resetDelEdit();
  const plan = DB.getPlan();
  const day = plan[idx];
  document.getElementById('plan-day-modal-title').innerHTML = `${escapeHtml(day.name)} bearbeiten`;
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

// "+ Trainingstag hinzufügen": zeigt ein Source-Modal (Neu erstellen ODER aus der Bibliothek
// per Referenz hinzufügen). Gibt es keine noch nicht referenzierten Bibliothek-Tage, springt
// es direkt in den Neu-Erstellen-Flow.
function addNewPlanDay() {
  const plan = _resolveEditPlan();
  const inPlan = new Set(plan ? resolvePlanDays(plan).map(d => d.id) : []);
  const hasLibrarySources = DB.getTrainingDays().some(d => !d.archived && !inPlan.has(d.id));
  if (!hasLibrarySources) {
    addNewPlanDayFromScratch();
    return;
  }
  const btn = document.getElementById('copy-plan-day-btn');
  if (btn) btn.disabled = false;
  openModal('modal-plan-day-source');
}

function addNewPlanDayFromScratch() {
  closeModal('modal-plan-day-source');
  promptForName('Name des neuen Trainingstags', 'Neuer Tag', (name) => {
    const plan = DB.getPlan();
    const id = 'day_' + Date.now();
    plan.push({ id, name, color: null, exercises: [] });
    DB.savePlan(plan);
    if (currentScreen === 'plan-detail') renderPlanDetail();
    showToast(`${escapeHtml(name)} hinzugefügt`);
    openPlanDayModal(plan.length - 1);
  });
}

// Multi-Select Bibliothek-Picker: alle Bibliothek-Tage, die im aktuellen Plan noch nicht
// referenziert sind. Auswahl fügt sie dem Plan per REFERENZ hinzu (Referenz-Modell).
// Inline-Aufklappen zeigt die Übungs-Vorschau (read-only).
let _copyPlanDaySources = []; // Cached: [{day}, ...]
let _copyPlanDaySelected = new Set();
let _copyPlanDayExpanded = new Set();

function openCopyPlanDayPicker() {
  closeModal('modal-plan-day-source');
  _copyPlanDaySources = [];
  _copyPlanDaySelected.clear();
  _copyPlanDayExpanded.clear();
  const plan = _resolveEditPlan();
  const inPlan = new Set(plan ? resolvePlanDays(plan).map(d => d.id) : []);
  DB.getTrainingDays()
    .filter(d => !d.archived && !inPlan.has(d.id))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .forEach(d => { _copyPlanDaySources.push({ day: d }); });
  renderCopyPlanDayList();
  openModal('modal-copy-plan-day');
}

function renderCopyPlanDayList() {
  const exs = DB.getExercises();
  const exMap = {};
  exs.forEach(e => { exMap[e.id] = e; });
  const list = document.getElementById('copy-plan-day-list');
  if (!_copyPlanDaySources.length) {
    list.innerHTML = '<p style="color:var(--text3);text-align:center;padding:20px">Keine weiteren Bibliothek-Tage verfügbar</p>';
    document.getElementById('copy-plan-day-confirm').disabled = true;
    document.getElementById('copy-plan-day-confirm').textContent = 'Hinzufügen';
    return;
  }
  list.innerHTML = _copyPlanDaySources.map((it, idx) => {
    const dayCount = it.day.exercises.length;
    const setCount = it.day.exercises.reduce((a,e) => a + (e.targetSets||0), 0);
    const selected = _copyPlanDaySelected.has(idx);
    const expanded = _copyPlanDayExpanded.has(idx);
    const exList = expanded ? `
      <div class="copy-day-ex-list">
        ${dayCount === 0
          ? '<div class="copy-day-ex-empty">Keine Übungen in diesem Trainingstag</div>'
          : it.day.exercises.map(pe => {
              const ex = exMap[pe.exId];
              const name = ex ? ex.name : '(unbekannte Übung)';
              const weightStr = pe.targetWeight ? ` @ ${pe.targetWeight} kg` : '';
              return `<div class="copy-day-ex-row">
                <span class="copy-day-ex-name">${escapeHtml(name)}</span>
                <span class="copy-day-ex-meta">${pe.targetSets}×${pe.targetReps}${weightStr}</span>
              </div>`;
            }).join('')
        }
      </div>` : '';
    return `<div class="copy-day-row${selected ? ' selected' : ''}${expanded ? ' expanded' : ''}">
      <div class="copy-day-head" onclick="toggleCopyPlanDaySelection(${idx})">
        <div class="copy-day-info">
          <div class="copy-day-name">${escapeHtml(it.day.name)}</div>
          <div class="copy-day-sub">${dayCount} Übungen • ${setCount} Sätze</div>
        </div>
        <button class="copy-day-expand" onclick="event.stopPropagation();toggleCopyPlanDayExpand(${idx})" aria-label="Übungen anzeigen">
          ${expanded ? '▾' : '▸'}
        </button>
        <span class="copy-day-checkbox" aria-label="Auswahl">${selected ? '●' : '○'}</span>
      </div>
      ${exList}
    </div>`;
  }).join('');
  // Footer-Button aktualisieren
  const btn = document.getElementById('copy-plan-day-confirm');
  const n = _copyPlanDaySelected.size;
  btn.disabled = n === 0;
  btn.textContent = n === 0 ? 'Hinzufügen' : (n === 1 ? '1 Trainingstag hinzufügen' : `${n} Trainingstage hinzufügen`);
}

function toggleCopyPlanDaySelection(idx) {
  if (_copyPlanDaySelected.has(idx)) _copyPlanDaySelected.delete(idx);
  else _copyPlanDaySelected.add(idx);
  renderCopyPlanDayList();
}
function toggleCopyPlanDayExpand(idx) {
  if (_copyPlanDayExpanded.has(idx)) _copyPlanDayExpanded.delete(idx);
  else _copyPlanDayExpanded.add(idx);
  renderCopyPlanDayList();
}

function confirmCopyPlanDays() {
  if (_copyPlanDaySelected.size === 0) return;
  // Zielreihenfolge: in Reihenfolge der Sources (nicht in Auswahl-Klickreihenfolge)
  const selectedIdxs = [..._copyPlanDaySelected].sort((a,b) => a - b);
  const plan = DB.getPlan(); // resolvtes Tag-Array des Editing-Plans
  for (const idx of selectedIdxs) {
    const src = _copyPlanDaySources[idx];
    if (!src) continue;
    // Referenz hinzufügen: den Bibliothek-Tag selbst anhängen (savePlan upsertet idempotent + setzt dayIds)
    if (!plan.some(d => d.id === src.day.id)) plan.push(src.day);
  }
  DB.savePlan(plan);
  closeModal('modal-copy-plan-day');
  if (currentScreen === 'plan-detail') renderPlanDetail();
  const n = selectedIdxs.length;
  showToast(n === 1 ? 'Trainingstag hinzugefügt ✓' : `${n} Trainingstage hinzugefügt ✓`);
  _copyPlanDaySelected.clear();
  _copyPlanDayExpanded.clear();
}

// ═══════════════════════════════════════════════
// SCREEN: ÜBUNGEN (Catalog)
// ═══════════════════════════════════════════════
let openExerciseId = null;   // currently expanded exercise in catalog
let exCatalogSearch = ''; // Suchtext im Übungen-Tab (filtert nach Name, klappt Treffer-Gruppen auf)
function filterExerciseCatalog() {
  const el = document.getElementById('ex-catalog-search');
  exCatalogSearch = (el ? el.value : '').trim().toLowerCase();
  renderExercises();
}
function _exMatchesSearch(ex) {
  if (!exCatalogSearch) return true;
  return (ex.name || '').toLowerCase().includes(exCatalogSearch);
}
const collapsedExGroups = new Set(); // Set of group keys (muscle-key oder planDay-id) die eingeklappt sind
// Default: Muskelgruppen EINGEKLAPPT (Leonard-Wunsch). Plan-Gruppierung bleibt aufgeklappt.
MUSCLE_ORDER.forEach(m => collapsedExGroups.add('muscle:' + m));

function toggleExGroup(key) {
  if (collapsedExGroups.has(key)) collapsedExGroups.delete(key);
  else collapsedExGroups.add(key);
  renderExercises();
}

// Gruppen-Keys der aktuell sichtbaren Übungen-Ansicht (Muskelgruppen).
function _currentExGroupKeys() {
  return MUSCLE_ORDER.map(m => 'muscle:' + m);
}

// Alle Gruppen auf einen Schlag ein-/ausklappen (Toggle): sind alle eingeklappt → ausklappen, sonst alle einklappen.
function toggleAllExGroups() {
  const keys = _currentExGroupKeys();
  if (!keys.length) return;
  const allCollapsed = keys.every(k => collapsedExGroups.has(k));
  if (allCollapsed) keys.forEach(k => collapsedExGroups.delete(k));
  else keys.forEach(k => collapsedExGroups.add(k));
  renderExercises();
}

// "Im aktuellen Plan"-Logik: sucht IMMER im aktiven Plan (per Datum), nie im Edit-Kontext.
// Wenn der User gerade einen neuen Plan editiert, soll der Übungen-Tab trotzdem zeigen,
// in welchen Trainingstagen des AKTIVEN Plans (= heute laufender Plan) eine Übung verwendet wird.
function getPlanDaysUsingExercise(exId) {
  const active = getActivePlan();
  if (!active) return [];
  return active.trainingDays.filter(d => d.exercises.some(e => e.exId === exId));
}


// Bestleistung + letzte Ausfuehrung. Gemeinsamer Baustein von Uebungskatalog und
// Detail-Modal, damit beide nicht auseinanderlaufen.
function exStatsHTML(exId) {
  const pr = getExercisePR(exId);
  const last = getLastExData(exId);
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
  return `<div class="ex-item-stats">
    <div class="ex-stat ex-stat-pr">
      <div class="ex-stat-key">Bestleistung</div>
      ${prVal}
    </div>
    <div class="ex-stat ex-stat-last">
      <div class="ex-stat-key">Letzte Ausführung</div>
      ${lastVal}
    </div>
  </div>`;
}

// Entwicklung der Uebung — umschaltbar zwischen schwerstem Satz und Gesamtwiederholungen.
// Die Wahl bleibt je Uebung gespeichert (getExChartMode). Erst ab zwei Einheiten sinnvoll:
// ein einzelner Punkt ist keine Entwicklung. Gezeichnet wird ueber _zeichneExDiagramm().
function exChartHTML(exId, canvasId, opts) {
  opts = opts || {};
  const mode = getExChartMode(exId);
  const enough = exHistPoints(exId, mode).length >= 2;
  // Einklappbare Variante (Einheiten-Detailansicht): die Ueberschrift wird zur Schaltflaeche.
  const kopf = opts.collapsible
    ? `<button class="ex-chart-collapse" onclick="toggleChartBlock(this)"><span class="ex-chart-chev">▾</span>Entwicklung</button>`
    : '<span>Entwicklung</span>';
  return `<div class="ex-chart-block">
    <div class="ex-item-body-label ex-chart-head">
      ${kopf}
      <div class="stats-mode-toggle ex-chart-toggle" data-ex="${exId}">
        <div class="stats-mode-pill${mode === 'weight' ? ' active' : ''}" data-mode="weight"
             onclick="setExChartMode('${exId}','weight')">Gewicht</div>
        <div class="stats-mode-pill${mode === 'reps' ? ' active' : ''}" data-mode="reps"
             onclick="setExChartMode('${exId}','reps')">Wdh.</div>
      </div>
    </div>
    <div class="ex-chart-body">
      <div class="ex-chart-wrap" data-ex="${exId}"${enough ? '' : ' style="display:none"'}><canvas id="${canvasId}" data-ex="${exId}"></canvas></div>
      <div class="ex-chart-empty" data-ex="${exId}"${enough ? ' style="display:none"' : ''}>${exChartEmptyText(mode)}</div>
    </div>
  </div>`;
}

// Ein-/Ausklappen eines einzelnen Diagramms. Beim Aufklappen neu zeichnen: Ein verstecktes
// Canvas hat keine Breite, Chart.js behielte sonst die alten Masse.
function toggleChartBlock(btn) {
  const block = btn.closest('.ex-chart-block');
  if (!block) return;
  block.classList.toggle('collapsed');
  if (!block.classList.contains('collapsed')) _renderHdCharts();
  _syncHdToggleAllLabel();
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
    ? '<span class="ex-item-plan-tag">Im aktuellen Plan</span>' : '';
  const usingBlock = usingDays.length
    ? `<div class="ex-item-using">
         <div class="ex-item-using-label">Verwendet in:</div>
         <div class="ex-item-using-list">
           ${usingDays.map(d => `<span class="ex-item-day-chip">${escapeHtml(d.name)}</span>`).join('')}
         </div>
       </div>`
    : `<div class="ex-item-using">
         <div class="ex-item-using-empty">Wird aktuell in keinem Trainingstag verwendet.</div>
       </div>`;

  const statsBlock = exStatsHTML(ex.id);
  const chartBlock = !isOpen ? '' : exChartHTML(ex.id, 'ex-chart-' + uniqueKey);

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
      ${chartBlock}
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
  // Alle-ein/ausklappen-Button: nur bei gruppierter Ansicht zeigen, Icon nach Zustand
  const filterBtn = document.getElementById('ex-plan-filter-btn');
  if (filterBtn) filterBtn.classList.toggle('active', exPlanFilterAn);
  const collBtn = document.getElementById('ex-collapse-all-btn');
  if (collBtn) {
    const keys = _currentExGroupKeys();
    collBtn.style.display = keys.length ? '' : 'none';
    collBtn.dataset.state = (keys.length && keys.every(k => collapsedExGroups.has(k))) ? 'collapsed' : 'expanded';
  }
  renderExercisesByMuscle();
  // Diagramm der aufgeklappten Übung zeichnen (das Markup steht erst nach dem Render im DOM)
  _renderOpenExerciseChart();
}

// Seiten des Übungen-Tabs: Katalog oder Stats (Aufbau analog zum Pläne-Tab).
let exercisesViewMode = 'list';   // 'list' | 'stats'
function setExercisesView(mode) {
  exercisesViewMode = (mode === 'stats') ? 'stats' : 'list';
  renderExercisesScreen();
}
function renderExercisesScreen() {
  const stats = exercisesViewMode === 'stats';
  const segL = document.getElementById('seg-ex-list');
  const segS = document.getElementById('seg-ex-stats');
  if (segL) segL.classList.toggle('active', !stats);
  if (segS) segS.classList.toggle('active', stats);
  const viewL = document.getElementById('ex-view-list');
  const viewS = document.getElementById('ex-view-stats');
  if (viewL) viewL.style.display = stats ? 'none' : '';
  if (viewS) viewS.style.display = stats ? '' : 'none';
  // Kopfzeilen-Knöpfe gehören zum Katalog, nicht zu den Auswertungen. Sie werden
  // unsichtbar geschaltet statt ausgeblendet — sonst schrumpft der Kopf um ihre Höhe
  // und der Seitenwechsler springt beim Wechsel auf die Stats-Seite nach oben.
  const kopfAktionen = document.getElementById('ex-head-actions');
  if (kopfAktionen) kopfAktionen.style.visibility = stats ? 'hidden' : '';
  if (stats) renderStatsPage();
  else renderExercises();
}

// Gewichtsentwicklung einer Übung: pro Einheit das höchste Gewicht, chronologisch.
// Verlauf einer Übung je Einheit: schwerster Satz (maxW) und Gesamtzahl der
// Wiederholungen (reps, Summe über alle Sätze). Welche Reihe gezeichnet wird, entscheidet
// der Umschalter in der Übungskarte — deshalb liefert die Funktion beide Werte.
function getExerciseHistory(exId) {
  const ws = DB.getWorkouts().slice().sort((a, b) => a.startTs - b.startTs);
  const out = [];
  ws.forEach(w => {
    const we = (w.exercises || []).find(e => (e.exId || e.id) === exId);
    if (!we || !Array.isArray(we.sets) || !we.sets.length) return;
    const maxW = Math.max(...we.sets.map(s => parseFloat(s.weight) || 0));
    const reps = we.sets.reduce((a, s) => a + (parseInt(s.reps) || 0), 0);
    if (maxW > 0 || reps > 0) out.push({ ts: w.startTs, maxW, reps, setCount: we.sets.length });
  });
  return out;
}

// Punkte für den gewählten Modus — Einheiten ohne Wert in dieser Größe fallen raus
// (Körpergewichtsübungen haben kein Gewicht, hätten dort also eine Nulllinie).
function exHistPoints(exId, mode) {
  const key = mode === 'reps' ? 'reps' : 'maxW';
  return getExerciseHistory(exId).filter(h => h[key] > 0).map(h => ({ ts: h.ts, v: h[key], setCount: h.setCount }));
}

// ─── Anzeigemodus des Verlaufsdiagramms je Übung ───────────────────
// Bleibt pro Übung gespeichert, damit Einklappen oder ein Tabwechsel die Auswahl nicht
// zurücksetzt. Eigener Key statt eines Felds an der Übung: reine Anzeige-Einstellung,
// die weder in die Trainingsdaten noch in die Cloud-Sicherung gehört.
function getExChartMode(exId) {
  try {
    const m = JSON.parse(localStorage.getItem('ft_ex_chart_modes') || '{}');
    return m[exId] === 'reps' ? 'reps' : 'weight';
  } catch { return 'weight'; }
}
function setExChartMode(exId, mode) {
  let m = {};
  try { m = JSON.parse(localStorage.getItem('ft_ex_chart_modes') || '{}'); } catch {}
  m[exId] = (mode === 'reps' ? 'reps' : 'weight');
  try { localStorage.setItem('ft_ex_chart_modes', JSON.stringify(m)); } catch {}
  // Nur die betroffene Karte auffrischen — ein Neuaufbau der Liste würde die Karte
  // zuklappen und die Scrollposition verlieren.
  document.querySelectorAll(`.ex-chart-toggle[data-ex="${exId}"] .stats-mode-pill`).forEach(p => {
    p.classList.toggle('active', p.dataset.mode === m[exId]);
  });
  // querySelectorAll, nicht querySelector: Katalogkarte und Detail-Modal koennen gleichzeitig
  // offen sein — sonst bliebe eines der beiden auf dem alten Modus stehen.
  const enough = exHistPoints(exId, m[exId]).length >= 2;
  document.querySelectorAll(`.ex-chart-empty[data-ex="${exId}"]`).forEach(hint => {
    hint.style.display = enough ? 'none' : '';
    hint.textContent = exChartEmptyText(m[exId]);
  });
  document.querySelectorAll(`.ex-chart-wrap[data-ex="${exId}"]`).forEach(wrap => {
    wrap.style.display = enough ? '' : 'none';
  });
  _renderOpenExerciseChart();
  _renderExDetailChart();
  _renderHdCharts();
}
function exChartEmptyText(mode) {
  return mode === 'reps'
    ? 'Ab der zweiten Einheit mit dieser Übung erscheint hier die Entwicklung der Wiederholungen.'
    : 'Ab der zweiten Einheit mit dieser Übung erscheint hier die Gewichtsentwicklung.';
}

// Farbe mit Transparenz versehen — akzeptiert „#rrggbb" und „rgb(r, g, b)".
function _withAlpha(color, alpha) {
  const c = (color || '').trim();
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const rgb = c.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1].split(',').map(s => s.trim());
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }
  return `rgba(0, 0, 0, ${alpha})`;
}

let _exChart = null;
function _renderOpenExerciseChart() {
  if (_exChart) { _exChart.destroy(); _exChart = null; }
  if (!openExerciseId) return;
  const exId = openExerciseId.includes('__') ? openExerciseId.split('__')[1] : openExerciseId;
  _exChart = _zeichneExDiagramm(document.getElementById('ex-chart-' + openExerciseId), exId);
}

// Zeichnet den Verlauf einer Uebung in ein beliebiges Canvas und gibt die Chart-Instanz
// zurueck (oder null). Genutzt vom Katalog UND vom Detail-Modal — beide halten ihre
// eigene Instanz, sonst wuerde das eine das andere zerstoeren.
function _zeichneExDiagramm(canvas, exId) {
  if (!canvas || typeof Chart === 'undefined') return null;
  const mode = getExChartMode(exId);
  const hist = exHistPoints(exId, mode);
  if (hist.length < 2) return null;
  const unit = mode === 'reps' ? 'Wdh.' : 'kg';
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#1E40AF';
  // getComputedStyle liefert je nach Browser „#1E40AF" ODER „rgb(30, 64, 175)" — ein
  // angehängtes Alpha-Suffix wäre im zweiten Fall ungültig und die Fläche würde schwarz.
  const accentFill = _withAlpha(accent, 0.14);
  return new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: hist.map(h => fmtDateShort(h.ts)),
      datasets: [{
        data: hist.map(h => h.v),
        borderColor: accent,
        backgroundColor: accentFill,
        fill: true, tension: 0.3,
        pointRadius: 3, pointBackgroundColor: accent, borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          // Bei Wiederholungen die Sätze mitnennen — „30 Wdh." allein sagt nicht,
          // ob das 3×10 oder 5×6 war.
          label: (c) => {
            const p = hist[c.dataIndex];
            return mode === 'reps'
              ? `${c.parsed.y} Wdh.${p && p.setCount ? ` (${p.setCount} ${p.setCount === 1 ? 'Satz' : 'Sätze'})` : ''}`
              : `${c.parsed.y} kg`;
          },
        } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkipPadding: 12 } },
        y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 10 }, precision: 0, callback: (v) => v + ' ' + unit } },
      },
    },
  });
}

// Katalog-Filter „nur aus dem aktiven Plan". Bewusst NICHT gespeichert: ein Filter, der
// einen Neustart überlebt, lässt den Katalog später unerklärlich leer wirken.
let exPlanFilterAn = false;

// ── Detailansicht einer Uebung als Modal ────────────────────────────────────────
// Zeigt dieselben Bausteine wie die aufgeklappte Karte im Uebungskatalog (Bestleistung,
// letzte Ausfuehrung, Entwicklung mit Umschalter). Erreichbar ueber „Details" in der
// aufgeklappten Uebungskarte — dort ist der Katalog sonst nur ueber einen Tabwechsel zu haben.
let _exDetailId = null;
let _exDetailChart = null;

function openExDetail(exId) {
  const ex = getEx(exId);
  if (!ex) return;
  _exDetailId = exId;
  document.getElementById('exd-title').textContent = ex.name;
  document.getElementById('exd-body').innerHTML = exStatsHTML(exId) + exChartHTML(exId, 'exd-chart');
  openModal('modal-ex-detail');
  // Direkt zeichnen: openModal blendet synchron ein, das Canvas hat seine Breite sofort.
  // Ein Umweg ueber requestAnimationFrame waere unnoetig und in Hintergrund-Tabs unzuverlaessig.
  _renderExDetailChart();
}

function _renderExDetailChart() {
  if (_exDetailChart) { _exDetailChart.destroy(); _exDetailChart = null; }
  if (!_exDetailId) return;
  _exDetailChart = _zeichneExDiagramm(document.getElementById('exd-chart'), _exDetailId);
}

// Übungs-IDs, die im aktiven Plan über irgendeinen Trainingstag vorkommen.
function exIdsImAktivenPlan() {
  const plan = getActivePlan();
  const ids = new Set();
  if (plan) plan.trainingDays.forEach(d => d.exercises.forEach(e => ids.add(e.exId)));
  return ids;
}

function toggleExPlanFilter() {
  exPlanFilterAn = !exPlanFilterAn;
  if (exPlanFilterAn && !exIdsImAktivenPlan().size) {
    exPlanFilterAn = false;
    showToast(getActivePlan() ? 'Im aktiven Plan sind keine Übungen hinterlegt.' : 'Es gibt gerade keinen aktiven Trainingsplan.');
    return;
  }
  // Beim Filtern die Gruppen mit aufklappen — sonst bleibt die verkürzte Liste hinter
  // zugeklappten Kopfzeilen verborgen und der Filter sieht wirkungslos aus.
  if (exPlanFilterAn) collapsedExGroups.clear();
  renderExercises();
}

function renderExercisesByMuscle() {
  const planIds = exPlanFilterAn ? exIdsImAktivenPlan() : null;
  const exs = DB.getExercises()
    .filter(_exMatchesSearch)
    .filter(e => !planIds || planIds.has(e.id));
  const byMuscle = {};
  MUSCLE_ORDER.forEach(m => byMuscle[m] = []);
  exs.forEach(e => { if (byMuscle[e.muscle]) byMuscle[e.muscle].push(e); });

  const groupsHTML = MUSCLE_ORDER.map(m => {
    const meta = MUSCLE_META[m];
    const items = byMuscle[m].sort((a,b) => a.name.localeCompare(b.name, 'de'));
    if (!items.length) return '';
    const itemsHTML = items.map(ex => buildExItemHTML(ex)).join('');
    const isCollapsed = !exCatalogSearch && collapsedExGroups.has('muscle:' + m);
    return `<div class="ex-group${isCollapsed ? ' collapsed' : ''}" style="--mc:${meta.color}">
      <div class="ex-group-title" onclick="toggleExGroup('muscle:${m}')">
        <span class="dot"></span>
        ${meta.name}
        <span class="count">(${items.length})</span>
        <span class="ex-group-arrow">${isCollapsed ? '▸' : '▾'}</span>
      </div>
      <div class="ex-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  const leerText = exCatalogSearch ? 'Keine Treffer.'
    : exPlanFilterAn ? 'Keine Übung aus dem aktiven Plan gefunden.'
    : 'Keine Übungen vorhanden. Füge eine neue Übung hinzu.';
  document.getElementById('exercises-groups').innerHTML = groupsHTML
    || `<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">${leerText}</p>`;
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
  document.getElementById('new-ex-muscle').value = ex.muscle || 'chest';
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
    withUndo('Übung gelöscht', () => {
      if (usedInPlan) {
        const p = DB.getPlan();
        p.forEach(d => { d.exercises = d.exercises.filter(e => e.exId !== id); });
        DB.savePlan(p);
      }
      const exs = DB.getExercises().filter(e => e.id !== id);
      DB.saveExercises(exs);
      trashPut('exercise', ex.name || 'Übung', ex);
      if (openExerciseId === id) openExerciseId = null;
      renderExercises();
    }, () => renderExercises());
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
  const dayId = plan[dayIdx].id;
  const exId = exerciseToAddId;
  confirmActiveWorkoutDataLoss(dayId, [exId], () => {
    const p = DB.getPlan();
    if (!p[dayIdx]) return;
    const before = p[dayIdx].exercises.length;
    p[dayIdx].exercises = p[dayIdx].exercises.filter(e => e.exId !== exId);
    if (p[dayIdx].exercises.length === before) return;
    DB.savePlan(p);
    syncActiveWorkoutWithPlanDay(p[dayIdx].id);
    const ex = DB.getExercises().find(e => e.id === exId);
    showToast(`„${ex?.name||'Übung'}" aus ${escapeHtml(p[dayIdx].name)} entfernt`);
    renderExToDayList();       // Modal-Liste neu zeichnen
    renderExercises();         // Übungen-Tab im Hintergrund aktualisieren
  });
}

function addExerciseToPlanDay(dayIdx) {
  if (!exerciseToAddId) return;
  const plan = DB.getPlan();
  if (!plan[dayIdx]) return;
  plan[dayIdx].exercises.push({ exId: exerciseToAddId, targetSets: 3, targetReps: 8 });
  DB.savePlan(plan);
  syncActiveWorkoutWithPlanDay(plan[dayIdx].id);
  const ex = DB.getExercises().find(e => e.id === exerciseToAddId);
  const dayName = plan[dayIdx].name;
  closeModal('modal-ex-to-day');
  exerciseToAddId = null;
  showToast(`„${ex?.name||'Übung'}" zu ${escapeHtml(dayName)} hinzugefügt`);
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
        showToast(`„${ex?.name||'Übung'}" zu ${escapeHtml(name)} hinzugefügt`);
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
  // Referenz-Modell: „Entfernen" löst nur die Referenz aus diesem Plan — der Trainingstag
  // selbst bleibt in der Bibliothek erhalten (und in anderen Plänen, die ihn referenzieren).
  confirmAction('Trainingstag aus Plan entfernen?',
    `„${day.name}" wird aus diesem Trainingsplan und seinem Wochenplan entfernt. Der Trainingstag bleibt in der Bibliothek erhalten.`,
    () => {
      const p = DB.getPlan();
      const removedId = day.id;
      p.splice(idx, 1);
      DB.savePlan(p);
      const wp = DB.getWeekPlan();
      let wpChanged = false;
      wp.forEach(d => { if (d.planDayId === removedId) { d.planDayId = null; wpChanged = true; } });
      if (wpChanged) DB.saveWeekPlan(wp);
      // Aktuellen Screen neu rendern — Trainingstage-Liste wohnt jetzt im Plan-Detail-Screen
      if (currentScreen === 'plan-detail') renderPlanDetail();
      else if (currentScreen === 'mehr') renderMehr();
      showToast('Aus Plan entfernt');
    },
    { danger: true, confirmLabel: 'Entfernen' }
  );
}

function renderPlanDayExList(day) {
  // Bearbeiten-Button (Lösch-Auswahl) im Modal-Übungen-Header; „+ Hinzufügen" im Edit-Modus ausblenden
  const editSlot = document.getElementById('planday-ex-edit-slot');
  const addBtn = document.getElementById('planday-add-ex-btn');
  const hasVis = day.exercises.some(pe => !!getEx(pe.exId));
  if (editSlot) editSlot.innerHTML = hasVis ? delEditBtn('planday-ex') : '';
  if (addBtn) addBtn.style.display = delEditActive('planday-ex') ? 'none' : '';

  if (delEditActive('planday-ex')) {
    const items = day.exercises.map((pe, i) => {
      const ex = getEx(pe.exId); if (!ex) return null;
      return { id: i, name: ex.name, color: muscleColor(ex.muscle) };
    }).filter(Boolean);
    document.getElementById('plan-day-ex-list').innerHTML = buildDelEditList(items);
    return;
  }
  // Layout wie das „Übungen zum Plan hinzufügen"-Modal: Muskelfarben-Streifen + Name,
  // ohne Sätze×Wdh.-Felder (Ziele werden im Trainingstag-Detail/Vorschau editiert).
  // Reihenfolge = Tag-Reihenfolge; Drag-Sortierung + ✕-Entfernen bleiben erhalten.
  const html = day.exercises.map((pe, i) => {
    const ex = getEx(pe.exId);
    if (!ex) return '';
    const col = muscleColor(ex.muscle);
    return `<div class="ex-item plan-ex-item" style="--mc:${col}" data-idx="${i}"
                 ondragstart="planExDragStart(event,${i})"
                 ondragend="planExDragEnd(event)"
                 ondragover="planExDragOver(event,${i})"
                 ondragleave="planExDragLeave(event)"
                 ondrop="planExDrop(event,${i})">
      <div class="ex-item-head">
        <span class="plan-ex-handle" draggable="true"
              onpointerdown="event.currentTarget.closest('.ex-item').draggable=true"
              onpointerup="event.currentTarget.closest('.ex-item').draggable=false">≡</span>
        <div class="ex-item-stripe"></div>
        <div class="ex-item-name">${ex.name}</div>
        <button class="plan-ex-del" onclick="removePlanEx(${i})">✕</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('plan-day-ex-list').innerHTML = html
    ? `<div class="ex-list">${html}</div>`
    : '<p style="color:var(--text3);font-size:14px;padding:8px 0">Noch keine Übungen</p>';
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
  document.querySelectorAll('.plan-ex-item').forEach(r =>
    r.classList.remove('drop-target-above','drop-target-below')
  );
  planExDraggedIdx = null;
}

function removePlanEx(exIdx) {
  const plan = DB.getPlan();
  if (!plan[editingDayIdx] || !plan[editingDayIdx].exercises[exIdx]) return;
  const exName = (getEx(plan[editingDayIdx].exercises[exIdx].exId) || {}).name || 'Übung';
  confirmAction('Übung entfernen?', `„${exName}" wird aus diesem Trainingstag entfernt.`,
    () => {
      const p = DB.getPlan();
      if (!p[editingDayIdx] || !p[editingDayIdx].exercises[exIdx]) return;
      p[editingDayIdx].exercises.splice(exIdx, 1);
      DB.savePlan(p);
      syncActiveWorkoutWithPlanDay(p[editingDayIdx].id);
      renderPlanDayExList(p[editingDayIdx]);
      _renderAfterPlanEdit();
    },
    { danger: true, confirmLabel: 'Entfernen' });
}

function savePlanDay() {
  const plan = DB.getPlan();
  plan[editingDayIdx].name = document.getElementById('plan-day-name-input').value.trim() || plan[editingDayIdx].name;
  DB.savePlan(plan);
  closeModal('modal-plan-day');
  _renderAfterPlanEdit();
  showToast('Plan gespeichert');
}

let planAddSelection = new Set();

// Ziel des Mehrfach-Auswahl-Add-Modals: 'planday' (Plan-Detail-Tag, via editingDayIdx) ODER
// 'libday' (Trainingstag-Detail, via editingLibDayId). Beide editieren denselben globalen Tag.
let planAddTarget = 'planday';
// Liefert die aktuellen Übungen des Ziel-Tags (für „bereits enthalten").
function _planAddTargetDay() {
  if (planAddTarget === 'libday') return DB.getTrainingDays().find(d => d.id === editingLibDayId) || null;
  const plan = DB.getPlan();
  return plan[editingDayIdx] || null;
}
function openAddToPlanModal(target) {
  planAddTarget = (target === 'libday') ? 'libday' : 'planday';
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
  const _push = (day) => {
    let added = 0;
    planAddSelection.forEach(exId => {
      day.exercises.push({ exId, targetSets: 3, targetReps: 8 });
      added++;
    });
    return added;
  };
  let added = 0, dayId = null;
  if (planAddTarget === 'libday') {
    // Trainingstag-Detail: direkt den globalen Bibliothek-Tag editieren
    const days = DB.getTrainingDays();
    const day = days.find(d => d.id === editingLibDayId);
    if (!day) return;
    added = _push(day);
    DB.saveTrainingDays(days);
    dayId = day.id;
  } else {
    const plan = DB.getPlan();
    if (!plan[editingDayIdx]) return;
    added = _push(plan[editingDayIdx]);
    DB.savePlan(plan);
    dayId = plan[editingDayIdx].id;
  }
  syncActiveWorkoutWithPlanDay(dayId);
  planAddSelection.clear();
  closeModal('modal-add-to-plan');
  if (planAddTarget === 'libday') {
    renderLibDayDetail();
  } else {
    const plan = DB.getPlan();
    if (plan[editingDayIdx]) renderPlanDayExList(plan[editingDayIdx]);
    _renderAfterPlanEdit();
  }
  showToast(`${added} Übung${added>1?'en':''} hinzugefügt`);
}

function renderPlanAddList(q) {
  const exs = DB.getExercises();
  const targetDay = _planAddTargetDay();
  const existing = new Set((targetDay?.exercises || []).map(e => e.exId));
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
        ? '<span class="ex-item-plan-tag">Im aktuellen Plan</span>'
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

let editingExerciseId = null;
let newExContext = 'plan'; // 'plan' | 'exercises' | 'edit-from-catalog'

function openNewExModal(context) {
  newExContext = context || 'plan';
  editingExerciseId = null;
  document.getElementById('new-ex-name').value = '';
  document.getElementById('new-ex-muscle').value = 'chest';
  const titleEl = document.querySelector('#modal-new-ex .sheet-title');
  if (titleEl) titleEl.textContent = 'Neue Übung erstellen';
  openModal('modal-new-ex');
}

function saveNewEx() {
  const name = document.getElementById('new-ex-name').value.trim();
  if (!name) { showToast('Bitte Namen eingeben'); return; }
  const exs = DB.getExercises();

  // Edit-mode (from exercises catalog)
  if (editingExerciseId) {
    const ex = exs.find(e => e.id === editingExerciseId);
    if (ex) {
      ex.name = name;
      const muscle = document.getElementById('new-ex-muscle').value;
      ex.muscle = muscle;
      ex.category = muscle === 'legs' ? 'legs'
                  : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                  : 'push';
      DB.saveExercises(exs);
    }
    editingExerciseId = null;
    closeModal('modal-new-ex');
    if (currentScreen === 'exercises') renderExercisesScreen();
    showToast('Übung aktualisiert');
    return;
  }

  // Create new
  const id = 'custom_' + Date.now();
  const muscle = document.getElementById('new-ex-muscle').value;
  const cat = muscle === 'legs' ? 'legs'
            : (muscle === 'back' || muscle === 'biceps') ? 'pull'
            : 'push';
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
          showToast(`${data.workouts.length} Einheiten importiert ✓`);
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
    const dayCount = data.trainingDays.length;
    const totalEx = data.trainingDays.reduce((s, d) => s + d.exercises.length, 0);
    const tp = data.trainingPlan || data.program;
    const tpName = tp?.name ? `"${escapeHtml(tp.name)}"` : '"Importierter Plan"';
    const tpWeeks = tp?.weeksTotal || 12;
    document.getElementById('plan-import-summary').innerHTML =
      `Ein neuer Trainingsplan ${tpName} mit <strong>${dayCount}</strong> Trainingstagen und insgesamt <strong>${totalEx}</strong> Übungen wird erstellt (Dauer ${tpWeeks} Wochen). Bestehende Pläne bleiben unverändert.`;
    openModal('modal-plan-import');
  };
  reader.readAsText(file);
}

function cancelPlanImport() {
  closeModal('modal-plan-import');
  pendingPlanImport = null;
}

function confirmPlanImport() {
  closeModal('modal-plan-import');
  applyPlanImport();
}

function applyPlanImport() {
  const data = pendingPlanImport;
  pendingPlanImport = null;
  if (!data) return;

  const exs = DB.getExercises();
  let newExCount = 0;
  let reusedExCount = 0;

  const findExByName = (name) => {
    const norm = name.trim().toLowerCase();
    return exs.find(e => e.name.trim().toLowerCase() === norm);
  };

  let _idCounter = 0;
  const genId = (prefix) => `${prefix}_${Date.now()}_${_idCounter++}`;

  const importedDays = data.trainingDays.map(day => {
    const exercises = (day.exercises || []).map(ie => {
      let ex = findExByName(ie.name);
      if (ex) {
        reusedExCount++;
      } else {
        const muscle = VALID_MUSCLES.includes(ie.muscle) ? ie.muscle : inferMuscleFromName(ie.name);
        const category = muscle === 'legs' ? 'legs'
                       : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                       : 'push';
        ex = {
          id: genId('custom'),
          name: ie.name.trim(),
          muscle, category,
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
    return { id: genId('day'), name: day.name.trim(), color: null, exercises };
  });

  // Plan-Metadaten extrahieren (oder Defaults)
  const tp = data.trainingPlan || data.program;
  const planName = tp?.name?.trim() || 'Importierter Trainingsplan';
  const weeksTotal = Number.isFinite(+tp?.weeksTotal) && +tp.weeksTotal > 0 ? +tp.weeksTotal : 12;
  const startDate = tp?.startDate ? (_dateToMs(tp.startDate) || Date.now()) : Date.now();
  const endDate = startDate + weeksTotal * 7 * 24 * 3600 * 1000;

  // weekPlan: Default, oder ueberschrieben durch JSON-Block (by-name-Mapping auf trainingDays)
  let weekPlan = JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
  const wpFromJson = tp?.weekPlan || data.weekPlan;
  if (Array.isArray(wpFromJson)) {
    // trainingDay-Name → erzeugte ID
    const dayIdByName = {};
    importedDays.forEach(d => { dayIdByName[d.name.trim().toLowerCase()] = d.id; });
    weekPlan = weekPlan.map(slot => {
      const match = wpFromJson.find(w => w && w.dayKey === slot.dayKey);
      if (!match) return slot;
      // null/leer/false → expliziter Ruhetag
      const name = (typeof match.trainingDay === 'string') ? match.trainingDay.trim() : '';
      if (!name) return { ...slot, planDayId: null };
      const id = dayIdByName[name.toLowerCase()];
      return { ...slot, planDayId: id || null };
    });
  }

  // Referenz-Modell: importierte Tage werden zu geteilten Bibliothek-Tagen; der Plan
  // referenziert sie über dayIds. (weekPlan zeigt bereits auf dieselben importedDays-IDs.)
  const lib = DB.getTrainingDays();
  importedDays.forEach(d => {
    lib.push({ id: d.id, name: d.name, color: d.color || null,
               exercises: d.exercises, notes: '', archived: false, createdAt: Date.now() });
  });
  DB.saveTrainingDays(lib);

  // Neuen Plan erstellen
  const plans = DB.getPlans();
  const newPlan = {
    id: 'plan_' + Date.now() + '_' + Math.floor(Math.random()*10000),
    name: planName,
    weeksTotal, startDate, endDate,
    dayIds: importedDays.map(d => d.id),
    weekPlan,
    archived: false,
    createdAt: Date.now(),
  };
  plans.push(newPlan);
  DB.savePlans(plans);
  DB.saveExercises(exs);

  // UI-Refresh
  if (currentScreen === 'plans') renderPlans();
  else if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'exercises') renderExercises();

  const parts = [
    `Trainingsplan "${planName}" erstellt`,
    `${importedDays.length} Trainingstage`,
    newExCount ? `${newExCount} neue Übung${newExCount === 1 ? '' : 'en'}` : null,
    reusedExCount ? `${reusedExCount} existierende wiederverwendet` : null,
  ].filter(Boolean);
  showToast(parts.join(' • ') + ' ✓');
}

// ─── Uebungs-Import (nur in die Library, ohne Plan-Wrap) ──────────────
// Format: { format: 'fittrack-exercises-import', version: 1, exercises: [...] }
// Ein Eintrag: { name, muscle?, notes? } — Übungen gleichen Namens werden übersprungen.

let pendingExercisesImport = null;

function importExercises(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    event.target.value = '';
    let data;
    try { data = JSON.parse(e.target.result); }
    catch { showToast('Datei ist kein gültiges JSON'); return; }
    if (data.format !== 'fittrack-exercises-import') {
      showToast('Falsches Format — erwartet "fittrack-exercises-import"');
      return;
    }
    if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
      showToast('Import enthält keine Übungen');
      return;
    }
    for (const ex of data.exercises) {
      if (!ex.name || typeof ex.name !== 'string' || !ex.name.trim()) {
        showToast('Übung ohne Name gefunden — Import abgebrochen');
        return;
      }
    }

    // Preview-Statistik fuer das Confirm-Modal: wie viele neu, wie viele schon da
    const existing = DB.getExercises();
    let willCreate = 0, willReuse = 0;
    for (const ie of data.exercises) {
      const norm = ie.name.trim().toLowerCase();
      if (existing.some(e => e.name.trim().toLowerCase() === norm)) willReuse++;
      else willCreate++;
    }

    pendingExercisesImport = data;
    const total = data.exercises.length;
    const lines = [
      `Insgesamt <strong>${total}</strong> Übung${total === 1 ? '' : 'en'} im Import.`,
      willCreate ? `<strong>${willCreate}</strong> werden neu angelegt.` : null,
      willReuse ? `<strong>${willReuse}</strong> existieren bereits in deiner Library und werden übersprungen.` : null,
    ].filter(Boolean);
    document.getElementById('exercises-import-summary').innerHTML = lines.join('<br>');
    openModal('modal-exercises-import');
  };
  reader.readAsText(file);
}

function cancelExercisesImport() {
  closeModal('modal-exercises-import');
  pendingExercisesImport = null;
}

function confirmExercisesImport() {
  closeModal('modal-exercises-import');
  applyExercisesImport();
}

function applyExercisesImport() {
  const data = pendingExercisesImport;
  pendingExercisesImport = null;
  if (!data) return;

  const exs = DB.getExercises();
  let newExCount = 0;
  let reusedExCount = 0;
  let _idCounter = 0;
  const genId = (prefix) => `${prefix}_${Date.now()}_${_idCounter++}`;

  for (const ie of data.exercises) {
    const norm = ie.name.trim().toLowerCase();
    if (exs.some(e => e.name.trim().toLowerCase() === norm)) {
      reusedExCount++;
      continue;
    }
    const muscle = VALID_MUSCLES.includes(ie.muscle) ? ie.muscle : inferMuscleFromName(ie.name);
    const category = muscle === 'legs' ? 'legs'
                   : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                   : 'push';
    exs.push({
      id: genId('custom'),
      name: ie.name.trim(),
      muscle, category,
      isCustom: true,
      notes: (typeof ie.notes === 'string' ? ie.notes : ''),
    });
    newExCount++;
  }
  DB.saveExercises(exs);

  // UI-Refresh: wenn der User aktuell im Uebungen-Tab ist, dort neu rendern
  if (currentScreen === 'exercises') renderExercisesScreen();

  const parts = [
    newExCount ? `${newExCount} neue Übung${newExCount === 1 ? '' : 'en'}` : null,
    reusedExCount ? `${reusedExCount} bereits vorhanden` : null,
  ].filter(Boolean);
  showToast((parts.length ? parts.join(' • ') : 'Nichts zu importieren') + ' ✓');
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
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  // Das Diagramm der Uebungs-Detailansicht hier abraeumen: Geschlossen wird das Modal
  // ueber den Hintergrund-Tipp oder die Wischgeste, beide landen in dieser Funktion.
  if (id === 'modal-ex-detail' && _exDetailChart) { _exDetailChart.destroy(); _exDetailChart = null; }
  if (id === 'modal-hist-detail') { _hdCharts.forEach(c => c.destroy()); _hdCharts = []; }
}

// Swipe-down-to-dismiss für ALLE Bottom-Sheet-Modals (.overlay > .sheet).
// Zieht das Sheet fingergebunden nach unten; ab Schwelle schließt es, sonst schnappt es zurück.
// Greift nur, wenn der Inhalt oben ist (kein nach-oben-scrollbarer Bereich offen) → stört das Scrollen nicht.
function _sheetScrolledDown(fromEl, sheet) {
  let el = fromEl;
  while (el && el !== sheet.parentElement) {
    if (el.scrollHeight > el.clientHeight + 1 && el.scrollTop > 0) return true;
    if (el === sheet) break;
    el = el.parentElement;
  }
  return false;
}
function initSheetSwipeDismiss() {
  document.querySelectorAll('.overlay > .sheet').forEach(sheet => {
    const overlay = sheet.closest('.overlay');
    let startY = 0, dy = 0, dragging = false, decided = false;
    sheet.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      dy = 0; dragging = false; decided = false;
      sheet.style.transition = 'none';
    }, { passive: true });
    sheet.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      const delta = e.touches[0].clientY - startY;
      if (!decided) {
        if (Math.abs(delta) < 6) return;
        decided = true;
        // Nur nach unten + nur wenn nichts nach oben scrollbar offen ist
        dragging = delta > 0 && !_sheetScrolledDown(e.target, sheet);
      }
      if (!dragging) return;
      dy = Math.max(0, delta);
      e.preventDefault();
      sheet.style.transform = `translateY(${dy}px)`;
      if (overlay) overlay.style.background = `rgba(0,0,0,${Math.max(0, 0.4 - dy / 700)})`;
    }, { passive: false });
    const end = () => {
      if (!dragging) { sheet.style.transform = ''; sheet.style.transition = ''; return; }
      dragging = false;
      sheet.style.transition = 'transform .22s ease';
      if (dy > 110) {
        sheet.style.transform = 'translateY(100%)';
        const id = overlay && overlay.id;
        setTimeout(() => {
          if (id) closeModal(id);
          sheet.style.transition = ''; sheet.style.transform = '';
          if (overlay) overlay.style.background = '';
        }, 200);
      } else {
        sheet.style.transform = 'translateY(0)';
        if (overlay) overlay.style.background = '';
        setTimeout(() => { sheet.style.transition = ''; sheet.style.transform = ''; }, 220);
      }
    };
    sheet.addEventListener('touchend', end);
    sheet.addEventListener('touchcancel', end);
  });
}

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════

let toastTmr;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.remove('with-undo');
  t.classList.add('show');
  t.onclick = null;
  clearTimeout(toastTmr);
  toastTmr = setTimeout(() => t.classList.remove('show'), 2500);
}

// Einblendung mit „Rückgängig" — die Sicherheitsabfrage fängt den Fehlgriff ab, nicht die
// Fehlentscheidung. Sechs Sekunden reichen, um ein versehentliches Löschen zurückzunehmen.
let _undoAction = null;
function showUndoToast(msg, undoFn) {
  const t = document.getElementById('toast');
  _undoAction = undoFn;
  t.innerHTML = `<span class="toast-msg">${msg}</span><button class="toast-undo" onclick="runUndo()">Rückgängig</button>`;
  t.classList.add('show', 'with-undo');
  clearTimeout(toastTmr);
  toastTmr = setTimeout(() => { t.classList.remove('show', 'with-undo'); _undoAction = null; }, 6000);
}
function runUndo() {
  const fn = _undoAction;
  _undoAction = null;
  const t = document.getElementById('toast');
  t.classList.remove('show', 'with-undo');
  clearTimeout(toastTmr);
  if (typeof fn === 'function') fn();
}

// ─── Papierkorb ────────────────────────────────────────────────────
// Zweite Sicherung neben „Rückgängig": Die Einblendung fängt den Fehlgriff ab, der
// Papierkorb die Fehlentscheidung von vorgestern. Gelöschtes bleibt 30 Tage liegen.
const TRASH_KEEP_DAYS = 30;
const TRASH_LABELS = { workout: 'Einheit', plan: 'Plan', day: 'Trainingstag', exercise: 'Übung' };

function trashPut(type, label, payload) {
  const trash = DB.getTrash();
  trash.unshift({
    id: 'tr_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    type, label, payload, deletedAt: Date.now(),
  });
  DB.saveTrash(trash);
}

// Abgelaufene Einträge entfernen (läuft beim App-Start).
function purgeTrash() {
  const cutoff = Date.now() - TRASH_KEEP_DAYS * 86400000;
  const trash = DB.getTrash();
  const kept = trash.filter(t => t.deletedAt >= cutoff);
  if (kept.length !== trash.length) DB.saveTrash(kept);
}

function trashRestore(id) {
  const trash = DB.getTrash();
  const idx = trash.findIndex(t => t.id === id);
  if (idx < 0) return;
  const entry = trash[idx];
  const item = entry.payload;

  if (entry.type === 'workout') {
    const ws = DB.getWorkouts();
    if (!ws.some(w => w.id === item.id)) {
      ws.push(item);
      ws.sort((a, b) => b.startTs - a.startTs);
      DB.saveWorkouts(ws);
    }
  } else if (entry.type === 'plan') {
    const ps = DB.getPlans();
    if (!ps.some(p => p.id === item.id)) { ps.push(item); DB.savePlans(ps); }
  } else if (entry.type === 'day') {
    const ds = DB.getTrainingDays();
    if (!ds.some(d => d.id === item.id)) { ds.push(item); DB.saveTrainingDays(ds); }
  } else if (entry.type === 'exercise') {
    const es = DB.getExercises();
    if (!es.some(e => e.id === item.id)) { es.push(item); DB.saveExercises(es); }
  }

  trash.splice(idx, 1);
  DB.saveTrash(trash);
  renderTrash();
  if (currentScreen === 'overview') renderOverview();
  showToast(`${TRASH_LABELS[entry.type] || 'Eintrag'} wiederhergestellt`);
}

function trashDeleteForever(id) {
  const entry = DB.getTrash().find(t => t.id === id);
  if (!entry) return;
  confirmAction('Endgültig löschen?',
    `„${entry.label}" wird unwiderruflich entfernt. Das lässt sich nicht mehr rückgängig machen.`,
    () => {
      DB.saveTrash(DB.getTrash().filter(t => t.id !== id));
      renderTrash();
      showToast('Endgültig gelöscht');
    },
    { danger: true, confirmLabel: 'Endgültig löschen' });
}

function emptyTrash() {
  const n = DB.getTrash().length;
  if (!n) return;
  confirmAction('Papierkorb leeren?',
    `${n} ${n === 1 ? 'Eintrag wird' : 'Einträge werden'} unwiderruflich entfernt.`,
    () => { DB.saveTrash([]); renderTrash(); showToast('Papierkorb geleert'); },
    { danger: true, confirmLabel: 'Leeren' });
}

// ─── App-Version + Update ──────────────────────────────────────────
// Die PWA übernimmt einen neuen Stand erst beim zweiten Start (erster Start
// installiert den Service Worker, zweiter aktiviert ihn). Diese beiden Helfer
// machen sichtbar, was läuft, und holen das Update auf Wunsch sofort.
async function renderAppVersion() {
  const el = document.getElementById('app-version');
  if (!el) return;
  try {
    const keys = await caches.keys();
    const eigene = keys.filter(k => k.startsWith('fittrack-v'))
                       .sort((a, b) => parseInt(a.slice(10), 10) - parseInt(b.slice(10), 10));
    el.textContent = eigene.length ? eigene[eigene.length - 1].replace('fittrack-', '') : 'unbekannt';
  } catch { el.textContent = 'unbekannt'; }
}

function updateJetzt() {
  confirmAction('Jetzt aktualisieren?',
    'Die App lädt den neuesten Stand vom Server und startet neu. Deine Daten bleiben unberührt.',
    async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      } catch {}
      location.reload();
    },
    { confirmLabel: 'Aktualisieren' });
}

// Liste im Einstellungen-Overlay.
function renderTrash() {
  const wrap = document.getElementById('trash-card');
  const head = document.getElementById('trash-head-action');
  if (!wrap) return;
  const trash = DB.getTrash();
  if (head) head.innerHTML = trash.length
    ? `<a onclick="emptyTrash()" style="font-size:13px;color:var(--red);cursor:pointer">Leeren</a>` : '';
  if (!trash.length) {
    wrap.innerHTML = `<div class="trash-empty">Nichts gelöscht. Was du löschst, liegt hier ${TRASH_KEEP_DAYS} Tage lang und lässt sich zurückholen.</div>`;
    return;
  }
  wrap.innerHTML = trash.map(t => {
    const daysLeft = Math.max(0, TRASH_KEEP_DAYS - Math.floor((Date.now() - t.deletedAt) / 86400000));
    return `<div class="trash-row">
      <div class="trash-info">
        <div class="trash-name">${escapeHtml(t.label)}</div>
        <div class="trash-meta">${TRASH_LABELS[t.type] || 'Eintrag'} · gelöscht am ${fmtDateShort(t.deletedAt)} · noch ${daysLeft} ${daysLeft === 1 ? 'Tag' : 'Tage'}</div>
      </div>
      <button class="trash-btn" onclick="trashRestore('${t.id}')">Zurückholen</button>
      <button class="trash-btn trash-btn-del" onclick="trashDeleteForever('${t.id}')" aria-label="Endgültig löschen">✕</button>
    </div>`;
  }).join('');
}

// Löschen mit Sicherheitsnetz: Zustand der Datenspeicher vor der Aktion festhalten und
// über „Rückgängig" komplett zurückschreiben. Bewusst grob (ganze Stores statt einzelner
// Objekte) — dafür stimmen auch Folgeänderungen wie gelöste Wochenplan-Zuweisungen wieder.
function _snapshotStores() {
  return {
    plans: JSON.parse(JSON.stringify(DB.getPlans())),
    days: JSON.parse(JSON.stringify(DB.getTrainingDays())),
    exercises: JSON.parse(JSON.stringify(DB.getExercises())),
    workouts: JSON.parse(JSON.stringify(DB.getWorkouts())),
    // Papierkorb mitsichern: sonst bliebe nach einem „Rückgängig" der Eintrag dort liegen
    // und dasselbe Objekt existierte zweimal.
    trash: JSON.parse(JSON.stringify(DB.getTrash())),
  };
}
function _restoreStores(snap) {
  DB.savePlans(snap.plans);
  DB.saveTrainingDays(snap.days);
  DB.saveExercises(snap.exercises);
  DB.saveWorkouts(snap.workouts);
  DB.saveTrash(snap.trash || []);
}
function withUndo(label, fn, afterRestore) {
  const snap = _snapshotStores();
  fn();
  showUndoToast(label, () => {
    _restoreStores(snap);
    if (typeof afterRestore === 'function') afterRestore();
    showToast('Wiederhergestellt');
  });
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
const DRIVE_LOG_MAX = 50;

// In-memory state
let driveTokenClient = null;       // GIS Token Client (lazy init)
let driveTokenExpiry = 0;          // ms-Timestamp when current token expires
let driveSyncTimer = null;         // debounce timer for auto-sync
let driveSyncInFlight = false;     // prevents parallel syncs
let driveSyncStartedAt = 0;        // Startzeit des laufenden Syncs (Hänger-Erkennung)
const DRIVE_SYNC_STUCK_MS = 120000;
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
    // Ablauf mitspeichern: die Variable allein ist nach einem App-Neustart 0, obwohl der
    // Token im sessionStorage noch gültig sein kann — das erzwang jedes Mal einen Refresh.
    sessionStorage.setItem('ft_drive_token_exp', String(driveTokenExpiry));
  } catch {}
  driveSetReauthNeeded(false);
}
function driveGetTokenExpiry() {
  if (driveTokenExpiry) return driveTokenExpiry;
  try { return parseInt(sessionStorage.getItem('ft_drive_token_exp') || '0', 10); } catch { return 0; }
}
function driveClearToken() {
  try { sessionStorage.removeItem('ft_drive_token'); sessionStorage.removeItem('ft_drive_token_exp'); } catch {}
  driveTokenExpiry = 0;
}
// Merkt, dass die stille Verlängerung fehlgeschlagen ist. Ohne diesen Zustand drehte die
// Anzeige weiter, ohne je zu sagen, dass eine neue Anmeldung nötig ist.
function driveReauthNeeded() { return localStorage.getItem('ft_drive_reauth') === '1'; }
function driveSetReauthNeeded(v) {
  if (v) localStorage.setItem('ft_drive_reauth', '1');
  else localStorage.removeItem('ft_drive_reauth');
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
// Markiert den Änderungs-Zeitpunkt für die Konflikt-Erkennung UND stößt die Sicherung an.
// Früher lief die Sicherung nur am Ende einer Einheit — wer eine Weile nur Pläne pflegte,
// sicherte nie. Der Trigger ist entprellt (DRIVE_DEBOUNCE_MS), es entsteht also ein Upload
// pro Bearbeitungsphase, nicht pro Tastendruck.
function markLocalChange() {
  localStorage.setItem('ft_drive_last_local_change', String(Date.now()));
  if (driveIsEnabled()) driveTriggerSync('Änderung');
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
    callback: () => {},       // wird pro Request überschrieben
    error_callback: () => {}, // dito — ohne diesen Kanal bleiben Popup-Fehler stumm
  });
  driveGisReady = true;
}

// ─── Token holen (interaktiv oder silent) ─────────────
// WICHTIG: Diese Anfrage MUSS in jedem Fall enden. Google Identity Services ruft in
// manchen Situationen (blockiertes Popup, abgelaufene Google-Sitzung, installierte PWA)
// weder callback noch error_callback auf. Ohne Zeitgrenze blieb die Promise dann für
// immer offen — der Sync stand auf „läuft", finally lief nie, und jeder weitere Sync
// wurde mit „läuft bereits" abgewiesen, bis die App neu gestartet wurde.
const DRIVE_TOKEN_TIMEOUT_MS = 45000;

function driveRequestToken({ interactive = true } = {}) {
  return new Promise((resolve, reject) => {
    if (!driveTokenClient) return reject(new Error('Token-Client nicht initialisiert'));
    let settled = false;
    const done = (fn, arg) => { if (settled) return; settled = true; clearTimeout(timer); fn(arg); };
    const timer = setTimeout(() => done(reject, new Error(
      interactive
        ? 'Zeitüberschreitung bei der Google-Anmeldung'
        : 'Google-Anmeldung abgelaufen — bitte in den Einstellungen neu verbinden'
    )), DRIVE_TOKEN_TIMEOUT_MS);

    driveTokenClient.callback = (resp) => {
      if (resp.error) return done(reject, new Error(`OAuth-Fehler: ${resp.error}${resp.error_description ? ' — ' + resp.error_description : ''}`));
      driveSetToken(resp.access_token, resp.expires_in);
      done(resolve, resp.access_token);
    };
    driveTokenClient.error_callback = (err) => {
      const t = (err && (err.type || err.message)) || 'unbekannt';
      done(reject, new Error(`Google-Anmeldung nicht möglich (${t})`));
    };

    try {
      driveTokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
    } catch (err) { done(reject, err); }
  });
}

// Sicherstellen, dass wir einen gültigen Token haben (silent refresh wenn möglich)
async function driveGetValidToken() {
  const cached = driveGetToken();
  if (cached && Date.now() < driveGetTokenExpiry()) return cached;
  await driveEnsureGisReady();
  try {
    return await driveRequestToken({ interactive: !cached }); // bei erstem Token wirklich interaktiv
  } catch (err) {
    // Stille Verlängerung gescheitert: Zustand merken, damit die Oberfläche zur neuen
    // Anmeldung auffordert, statt weiter „synchronisiert…" anzuzeigen.
    driveClearToken();
    driveSetReauthNeeded(true);
    renderBackupLine();
    renderDriveStatus();
    throw err;
  }
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
    version: 4,
    exportedAt: new Date().toISOString(),
    lastLocalChange: driveGetLastLocalChange(),
    exercises: DB.getExercises(),
    plans: DB.getPlans(),
    workouts: DB.getWorkouts(),
    trainingDays: DB.getTrainingDays(),   // v4: planunabhängige Trainingstage-Bibliothek
  };
}

// Validierung + Anwendung von Cloud-Daten. Akzeptiert sowohl neues Multi-Plan-Format (v2)
// als auch altes Single-Plan-Format (v1) — letzteres wird beim Anwenden in v2 migriert.
function driveApplyCloudData(data) {
  if (!data || typeof data !== 'object') throw new Error('Cloud-Daten leer');
  if (!Array.isArray(data.exercises)) throw new Error('Cloud-Daten: exercises fehlt/ungültig');
  if (!Array.isArray(data.workouts)) throw new Error('Cloud-Daten: workouts fehlt/ungültig');

  let plansArray;
  if (Array.isArray(data.plans)) {
    plansArray = data.plans;
  } else if (Array.isArray(data.plan)) {
    // Legacy v1: einzelner Plan/Program/Weekplan → in einen Plan migrieren
    const prog = data.program || {};
    const wp = Array.isArray(data.weekplan) ? data.weekplan : JSON.parse(JSON.stringify(DEFAULT_WEEKPLAN));
    const startDate = prog.startDate || Date.now();
    const weeksTotal = prog.weeksTotal || 12;
    plansArray = [{
      id: 'plan_' + Date.now(),
      name: prog.name || 'Mein Trainingsplan',
      weeksTotal, startDate,
      endDate: prog.endDate || (startDate + weeksTotal * 7 * 24 * 3600 * 1000),
      trainingDays: data.plan,
      weekPlan: wp,
      archived: false,
      createdAt: Date.now(),
    }];
  } else {
    throw new Error('Cloud-Daten: weder plans noch plan vorhanden');
  }

  // Apply
  localStorage.setItem('ft_exercises', JSON.stringify(data.exercises));
  localStorage.setItem('ft_plans', JSON.stringify(plansArray));
  localStorage.setItem('ft_workouts', JSON.stringify(data.workouts));
  // v4: Trainingstage-Bibliothek nur überschreiben, wenn in der Cloud vorhanden
  // (ältere Backups ohne dieses Feld lassen die lokale Bibliothek unangetastet).
  if (Array.isArray(data.trainingDays)) localStorage.setItem('ft_trainingdays', JSON.stringify(data.trainingDays));
  // Legacy-Keys bei v1-Migration sauber halten (sonst würde migrateToMultiPlan beim nächsten App-Start nochmal greifen)
  if (Array.isArray(data.plan)) {
    localStorage.removeItem('ft_program');
    localStorage.removeItem('ft_plan2');
    localStorage.removeItem('ft_weekplan');
  }
  // Lokale Änderungs-Marke zurücksetzen
  localStorage.setItem('ft_drive_last_local_change', '0');
  // Tag-Modell v2: frisch gezogene Cloud-Pläne ggf. noch in alter (eingebetteter) Form →
  // erzwungen ins Referenz-Modell überführen (idempotent).
  migrateDayModelV2(true);
}

// ─── Haupt-Sync-Funktion ─────────────────────────────
async function driveSync(reason = 'manuell') {
  // Sicherheitsnetz: Ein Sync, der länger als DRIVE_SYNC_STUCK_MS „läuft", gilt als hängen
  // geblieben und blockiert nicht länger alle weiteren Versuche. Ohne das half nur noch
  // ein App-Neustart.
  if (driveSyncInFlight) {
    const runningFor = Date.now() - driveSyncStartedAt;
    if (runningFor < DRIVE_SYNC_STUCK_MS) {
      driveLog('info', `Sync übersprungen (läuft bereits, Grund: ${reason})`);
      return;
    }
    driveLog('warn', `Vorheriger Sync hängt seit ${Math.round(runningFor/1000)}s — wird verworfen`);
  }
  if (!driveIsEnabled()) { driveLog('info', 'Sync übersprungen — nicht verbunden'); return; }
  driveSyncInFlight = true;
  driveSyncStartedAt = Date.now();
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
      driveLog('ok', `Aus Cloud geladen ✓ (${(data.workouts || []).length} Einheiten)`);
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
  const localMeta = `${(local.workouts || []).length} Einheiten<br>Stand: ${new Date(driveGetLastLocalChange()).toLocaleString('de-DE')}`;
  const cloudMetaStr = `${(cloud.workouts || []).length} Einheiten<br>Stand: ${new Date(cloudMeta.modifiedTime).toLocaleString('de-DE')}`;
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
      if (driveReauthNeeded()) {
        // Ohne diesen Hinweis sähe man nur einen alten Zeitstempel und wüsste nicht,
        // dass die Sicherung seitdem nicht mehr läuft.
        sub.innerHTML = `<span style="color:var(--red);font-weight:600">Anmeldung abgelaufen — tippe auf „Jetzt synchronisieren", um dich neu anzumelden.</span>`
          + (last ? `<br>Letzte Sicherung: ${new Date(last).toLocaleString('de-DE')}` : '');
      } else {
        sub.textContent = last ? `Letzter Sync: ${new Date(last).toLocaleString('de-DE')}` : 'Letzter Sync: noch nie';
      }
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
// Iteriert durch ALLE Pläne und reinigt jeweils deren weekPlan, falls dort eine
// Trainingstag-ID referenziert wird, die im trainingDays-Array nicht (mehr) existiert.
function cleanupOrphanWeekplan() {
  const plans = DB.getPlans();
  let dirty = false;
  for (const plan of plans) {
    const dayIds = new Set(resolvePlanDays(plan).map(d => d.id));
    for (const d of (plan.weekPlan || [])) {
      if (d.planDayId && !dayIds.has(d.planDayId)) {
        d.planDayId = null;
        dirty = true;
      }
    }
  }
  if (dirty) DB.savePlans(plans);
  return dirty;
}

// ── Tag-Modell v2-Migration ──────────────────────────────────────────────
// Einmalig (gegatet über ft_daymodel_v2_done): wandelt die alte Plan-Form (eingebettete
// plan.trainingDays = Kopien) in das Referenz-Modell um:
//  • aktive Pläne: eingebettete Tage in den globalen Store ft_trainingdays heben (oder per
//    sourceLibDayId/id auf bereits vorhandene Bibliothek-Tage referenzieren → kein Duplikat),
//    plan.dayIds setzen, weekPlan-Referenzen remappen.
//  • archivierte Pläne: Tage als eingefrorener Snapshot (plan.archivedDays) belassen — sie
//    landen NICHT in der lebendigen Bibliothek (Rückblick bleibt korrekt).
// Idempotent + force-bar (für Cloud-Pull alter Daten).
function migrateDayModelV2(force) {
  if (!force && localStorage.getItem('ft_daymodel_v2_done')) return;
  const plans = DB.getPlans();
  if (!plans.length) { localStorage.setItem('ft_daymodel_v2_done', '1'); return; }
  const lib = DB.getTrainingDays();
  const libById = {};
  lib.forEach(d => { libById[d.id] = d; });
  let libChanged = false, plansChanged = false;

  plans.forEach(plan => {
    if (!Array.isArray(plan.trainingDays)) return; // schon migriert
    const embedded = plan.trainingDays;

    if (plan.archived) {
      plan.archivedDays = embedded.map(d => JSON.parse(JSON.stringify(d)));
      plan.dayIds = [];
      delete plan.trainingDays;
      plansChanged = true;
      return;
    }

    const dayIds = [];
    const seen = new Set();
    const idMap = {}; // alte eingebettete id → referenzierte globale id
    embedded.forEach(d => {
      let targetId;
      if (d.sourceLibDayId && libById[d.sourceLibDayId]) {
        targetId = d.sourceLibDayId;
      } else if (libById[d.id]) {
        targetId = d.id;
      } else {
        const promoted = {
          id: d.id,
          name: d.name,
          color: d.color || null,
          exercises: JSON.parse(JSON.stringify(d.exercises || [])),
          notes: d.notes || '',
          archived: false,
          createdAt: d.createdAt || Date.now(),
        };
        lib.push(promoted);
        libById[promoted.id] = promoted;
        libChanged = true;
        targetId = promoted.id;
      }
      idMap[d.id] = targetId;
      if (!seen.has(targetId)) { seen.add(targetId); dayIds.push(targetId); }
    });
    plan.dayIds = dayIds;
    (plan.weekPlan || []).forEach(w => {
      if (w.planDayId && idMap[w.planDayId]) w.planDayId = idMap[w.planDayId];
    });
    delete plan.trainingDays;
    plansChanged = true;
  });

  if (libChanged) DB.saveTrainingDays(lib);
  if (plansChanged) DB.savePlans(plans);
  localStorage.setItem('ft_daymodel_v2_done', '1');
}

// Horizontal-Snap-Scroll-Sync: Wenn der Nutzer per Wisch-Geste auf einen anderen Tab
// snappt, erkennen wir den neuen Tab via scrollLeft und triggern den Renderer / Theme.
// Programmatische Scrolls (showScreen) werden via _suppressScrollSync uebergangen.
function initTabScrollSync() {
  const container = document.getElementById('tab-container');
  if (!container) return;
  let ticking = false;
  let lastReported = currentScreen;
  let settleTimer = null;

  // Wisch-Synchronisation. Die Geste selbst macht jetzt der Browser NATIV (CSS
  // scroll-snap am #tab-container + scroll-snap-stop:always an .screen = Momentum,
  // Einrasten, max. ein Tab pro Wisch — Dashboard-Gefuehl). Hier wird NUR scrollLeft
  // ausgelesen, um den Hintergrund-Crossfade + Theme + Nav-Highlight fingergebunden
  // mitzufuehren und im Settle den Renderer auszuloesen.
  // (Frueheres JS-Flick-/Paging-/Commit-System wurde 2026-05-29 bewusst entfernt.)
  container.addEventListener('scroll', () => {
    if (_suppressScrollSync) return;   // programmatischer Scroll (showScreen) → ignorieren
    if (ticking) return;               // pro Frame nur einmal verarbeiten
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (_suppressScrollSync) return; // Race-Schutz: Commit kam zwischen Event und Frame
      const w = container.clientWidth;
      if (w <= 0) return;
      // a) Hintergrund-Crossfade fingergebunden pro Frame mitfuehren.
      const progress = container.scrollLeft / w;
      updateBackgroundForSwipe(progress);
      // b) Aktiven Tab an der 50%-Schwelle bestimmen (das Einrasten macht CSS-Snap).
      const idx = Math.max(0, Math.min(TAB_ORDER.length - 1, Math.round(progress)));
      const name = TAB_ORDER[idx];
      // Theme + Nav-Highlight schon WAEHREND des Snaps wechseln (responsiv);
      // der "schwere" Renderer kommt erst im Settle.
      if (name !== lastReported) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const navEl = document.getElementById('nav-'+name);
        if (navEl) navEl.classList.add('active');
        const themeName = (name === 'plan-detail') ? 'plans' : name;
        document.body.className = 'theme-' + themeName;
        updateThemeColorMeta();
        lastReported = name;
      }
      // c) Settle: ~90 ms nach dem letzten Scroll-Tick. CSS-Snap hat dann i.d.R. schon
      //    exakt eingerastet — wir korrigieren nur Restdrift (instant) und rufen den Renderer.
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const exact = idx * w;
        if (Math.abs(container.scrollLeft - exact) > 1) {
          _suppressScrollSync = true;
          container.scrollTo({ left: exact, behavior: 'auto' });
          requestAnimationFrame(() => { _suppressScrollSync = false; });
        }
        if (currentScreen !== name) {
          currentScreen = name;
          _applyTabState(name);
        } else {
          // Zurueck-Snap zum selben Tab: Background final setzen, falls die Layer
          // mitten in der Interpolation stehen blieben.
          const themeName = (name === 'plan-detail') ? 'plans' : name;
          setThemeBackground(themeName);
        }
      }, 90);
    });
  }, { passive: true });

  // Beim Resize Snap-Position neu berechnen (Tab-Breiten haengen an clientWidth).
  window.addEventListener('resize', () => {
    if (!TAB_ORDER.includes(currentScreen)) return;
    _scrollTabContainerTo(currentScreen);
  });
}

// Auto-Hide der Bottom-Nav beim vertikalen Scrollen IM AKTIVEN TAB.
// Jeder Tab hat seinen eigenen scrollContainer → wir haengen den Listener an alle 5 Tabs an,
// reagieren aber nur, wenn der Listener vom aktuell aktiven Tab feuert.
// _navLastScrollY ist module-level, damit ein programmatisch verursachter scrollTop-Sprung
// nicht faelschlich als "User scrollt runter" interpretiert wird.
let _navLastScrollY = 0;
// Kalender bei Groessenaenderung (Drehen des Geraets) neu rechnen — die Kaestchengroesse
// haengt an der verfuegbaren Breite.
let _calResizeTimer = null;
function initCalendarResize() {
  window.addEventListener('resize', () => {
    if (_calResizeTimer) clearTimeout(_calResizeTimer);
    _calResizeTimer = setTimeout(() => {
      _calResizeTimer = null;
      if (document.getElementById('cal-grid')) renderTrainingCalendar('cal', 'ov-cal-card');
      const pc = document.getElementById('plans-cal-card');
      if (pc && pc.style.display !== 'none' && document.getElementById('pcal-grid')) {
        renderTrainingCalendar('pcal', 'plans-cal-card');
      }
    }, 180);
  });
}

// Tipp ausserhalb des Kalenders hebt die Tagesauswahl wieder auf.
function initCalendarDeselect() {
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.cal-scroll')) return;   // im Raster: Auswahl behalten
    // KEIN Vorab-Abbruch, wenn gerade keine Zelle markiert ist: Beim Neuzeichnen des
    // Rasters verliert die Zelle ihr .sel, die Beschreibung darunter bleibt aber stehen.
    // Ein Abbruch liess den Text dann fuer immer stehen.
    document.querySelectorAll('.cal-day.sel').forEach(c => c.classList.remove('sel'));
    document.querySelectorAll('.cal-detail').forEach(el => { el.innerHTML = ''; });
  });
}

function initScrollHideNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const bar = document.getElementById('workout-active-bar');
  const rest = document.getElementById('rest-bar');
  // Laufanzeige UND Satzpause folgen der Nav: die Pille rueckt nach, die Pausenleiste
  // nimmt bei ausgeblendeter Nav deren Platz ein.
  const setNavHidden = (h) => {
    nav.classList.toggle('nav-hidden', h);
    if (bar) bar.classList.toggle('nav-hidden', h);
    if (rest) rest.classList.toggle('nav-hidden', h);
  };
  const _navTickingByTab = new Map();

  function attachToScreen(screenEl, tabName) {
    if (!screenEl) return;
    // Tipp auf den LEEREN Tab-Hintergrund (nicht auf Karten/Buttons) toggelt die Bottom-Nav
    // ein/aus — same Mechanik wie das Runterscrollen (Leonard-Wunsch). e.target===screenEl
    // trifft nur den Hintergrund (Kinder/Karten bubblen, sind aber !== screenEl).
    screenEl.addEventListener('click', (e) => {
      if (currentScreen !== tabName) return;
      // Tipp auf eine NICHT-interaktive Stelle (Hintergrund ODER „tote" Karte ohne Aktion) toggelt die
      // Bottom-Nav. Interaktive Elemente (Buttons/Links/Inputs/onclick/role=button/drag) lösen ihre
      // eigene Aktion aus → NICHT toggeln. composedPath() = der Event-Pfad zum Klick-Zeitpunkt (robust,
      // auch wenn ein Handler die DOM danach neu rendert).
      const path = e.composedPath ? e.composedPath() : [e.target];
      for (const el of path) {
        if (el === screenEl) break;
        if (el.nodeType === 1 && el.matches &&
            el.matches('a, button, input, select, textarea, label, [onclick], [role="button"], [draggable="true"]')) return;
      }
      setNavHidden(!nav.classList.contains('nav-hidden'));
    });
    screenEl.addEventListener('scroll', () => {
      // Nur reagieren, wenn dieser Tab gerade der sichtbare ist
      if (currentScreen !== tabName) return;
      if (_navTickingByTab.get(tabName)) return;
      _navTickingByTab.set(tabName, true);
      requestAnimationFrame(() => {
        const cur = screenEl.scrollTop;
        const delta = cur - _navLastScrollY;
        // Scrollen blendet die Nav nur noch AUS, nie wieder ein (Leonard-Entscheidung,
        // 20.08.2026) — auch nicht am Seitenanfang. Zurück holt sie ausschließlich der
        // Tipp auf eine nicht-interaktive Fläche. Die 60px-Grenze bleibt, damit ein
        // kleiner Wisch ganz oben die Leiste nicht sofort wegnimmt.
        if (cur >= 60 && delta > 5) setNavHidden(true);
        _navLastScrollY = cur;
        _navTickingByTab.set(tabName, false);
        if (tabName === 'workouts') checkStickyBar();
      });
    }, { passive: true });
  }

  TAB_ORDER.forEach(tabName => {
    attachToScreen(document.getElementById('screen-'+tabName), tabName);
  });
  // Overlays haben eigenes Scrollen — Nav-Hide auch dort.
  const planDetail = document.getElementById('screen-plan-detail');
  if (planDetail) attachToScreen(planDetail, 'plan-detail');
  const dayDetail = document.getElementById('screen-day-detail');
  if (dayDetail) attachToScreen(dayDetail, 'day-detail');
  const mehrEl = document.getElementById('screen-mehr');
  if (mehrEl) attachToScreen(mehrEl, 'mehr');
}

// Alle Tab-Inhalte einmal im Hintergrund rendern (App-Start), damit beim Wischen KEIN
// leerer Tab kurz aufblitzt, bevor _applyTabState ihn beim Ankommen rendert. Die Tabs
// liegen alle (off-screen) im DOM mit voller Breite → Charts etc. messen korrekt.
function prerenderAllTabs() {
  try { renderOverview(); }       catch (e) { console.warn('prerender overview', e); }
  try { renderWorkoutsScreen(); } catch (e) { console.warn('prerender workouts', e); }
  try { renderExercisesScreen(); } catch (e) { console.warn('prerender exercises', e); }
  try { renderPlansScreen(); }    catch (e) { console.warn('prerender plans', e); }
  try { renderMehr(); }           catch (e) { console.warn('prerender mehr', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  // Daten-Migration: altes ft_program/ft_plan2/ft_weekplan in neue ft_plans-Struktur
  initAudioUnlock();
  migrateRemoveCardio();
  migrateToMultiPlan();
  // Tag-Modell v2: eingebettete Plan-Tage in geteilte Bibliothek-Referenzen überführen (einmalig)
  migrateDayModelV2();
  // Daten-Hygiene: verwaiste Wochenplan-Referenzen entfernen (legacy fallback, falls noch
  // jemand auf den ft_weekplan-Key zugreift — mit Multi-Plan sind die weekPlans pro Plan)
  cleanupOrphanWeekplan();
  // Satzanzahl der Trainingstage einmalig an die letzte absolvierte Einheit angleichen
  migrateSetCountsFromHistory();
  // Papierkorb ausmisten: Einträge älter als TRASH_KEEP_DAYS verschwinden endgültig
  purgeTrash();
  const activeWo = DB.getActive();
  if (activeWo) {
    showScreen('workouts');
  } else {
    showScreen('overview');
  }
  // Alle uebrigen Tabs vorab im Hintergrund rendern → kein leeres Aufblitzen beim ersten Wischen.
  prerenderAllTabs();
  // Drive-Sync initialisieren (versucht stillen Auto-Login, lädt Cloud-Daten falls verbunden)
  driveInit();
  // Bottom-Nav versteckt sich beim Runterscrollen, taucht beim Hochscrollen wieder auf
  initScrollHideNav();
  // Kalender: Kaestchengroesse beim Drehen neu rechnen, Auswahl bei Tipp daneben aufheben
  initCalendarResize();
  initCalendarDeselect();
  // Tab-Wechsel per nativem horizontalem Snap-Scroll am Tab-Container
  initTabScrollSync();
  // Bottom-Sheet-Modals nach unten wegswipen
  initSheetSwipeDismiss();
  // Edge-Swipe-Back im Plan-Detail (vom linken Bildschirmrand mit Finger nach rechts ziehen)
  initOverlayEdgeSwipe('screen-plan-detail', closePlanDetail);
  initOverlayEdgeSwipe('screen-day-detail', closeLibDayDetail);
  initOverlayEdgeSwipe('screen-mehr', closeMehr);
});

// Edge-Swipe-Back fuer Plan-Detail-Overlay.
// Touchstart in den ersten EDGE_PX vom linken Bildschirmrand startet das Tracking.
// Anschliessend folgt das Overlay finger-controlled der horizontalen Fingerbewegung.
// Bei Touchend wird entschieden: ueber Threshold (40% Bildschirmbreite) oder schnelle Velocity
// => Overlay schliessen via closePlanDetail(); sonst Snap-Back nach links.
function initOverlayEdgeSwipe(overlayId, closeFn) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  const EDGE_PX = 24;
  const DIR_LOCK_THRESHOLD = 8;     // Pixels Bewegung bis Richtung gelockt wird
  const CLOSE_RATIO = 0.4;          // 40% Bildschirmbreite => schliessen
  const CLOSE_VELOCITY = 0.6;       // px/ms Flick-Schwelle => schliessen
  const ANIM_MS = 290;

  let startX = 0, startY = 0, startTime = 0;
  let tracking = false;
  let viewportW = 0;
  let lockedDir = null;             // null | 'h' | 'v'

  overlay.addEventListener('touchstart', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    if (t.clientX > EDGE_PX) return;                  // nur linker Rand
    startX = t.clientX;
    startY = t.clientY;
    startTime = Date.now();
    viewportW = window.innerWidth;
    tracking = true;
    lockedDir = null;
    overlay.style.transition = 'none';                // Drag soll instant folgen
  }, { passive: true });

  overlay.addEventListener('touchmove', (e) => {
    if (!tracking || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (!lockedDir) {
      if (Math.abs(dx) < DIR_LOCK_THRESHOLD && Math.abs(dy) < DIR_LOCK_THRESHOLD) return;
      lockedDir = (Math.abs(dx) > Math.abs(dy)) ? 'h' : 'v';
      if (lockedDir === 'v') {
        // Vertikales Scrollen erlaubt — Tracking abbrechen
        tracking = false;
        overlay.style.transform = '';
        overlay.style.transition = '';
        return;
      }
    }

    // Horizontaler Drag: Browser-Scroll unterbinden + Overlay finger-gesteuert verschieben
    if (e.cancelable) e.preventDefault();
    const x = Math.max(0, dx);
    overlay.style.transform = `translateX(${x}px)`;
  }, { passive: false });

  overlay.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dt = Date.now() - startTime;
    const velocity = dx / Math.max(1, dt);
    const shouldClose = dx > viewportW * CLOSE_RATIO || velocity > CLOSE_VELOCITY;

    overlay.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1)';

    if (shouldClose) {
      overlay.style.transform = 'translateX(100%)';
      setTimeout(() => {
        overlay.style.transition = '';
        overlay.style.transform = '';
        closeFn();
      }, ANIM_MS);
    } else {
      overlay.style.transform = 'translateX(0)';
      setTimeout(() => {
        overlay.style.transition = '';
        overlay.style.transform = '';
      }, ANIM_MS);
    }
  }, { passive: true });

  overlay.addEventListener('touchcancel', () => {
    if (!tracking) return;
    tracking = false;
    overlay.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1)';
    overlay.style.transform = 'translateX(0)';
    setTimeout(() => {
      overlay.style.transition = '';
      overlay.style.transform = '';
    }, ANIM_MS);
  }, { passive: true });
}
