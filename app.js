// ═══════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════
// Cardio app-weit AUSGEBLENDET (Leonard-Wunsch). Code + gespeicherte Daten bleiben vollständig
// erhalten — nur die UI ist ausgeblendet. Auf `true` setzen, um Cardio wieder zu aktivieren.
const CARDIO_ENABLED = false;

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

// Cardio-Heuristik fuer den Plan-Import: wenn das JSON kein explizites type-Feld setzt,
// versuchen wir den Typ aus dem Uebungsnamen abzuleiten. Faengt typische Cardio-Begriffe
// auf Deutsch + Englisch ab (Laufen, Run, Bike, Rudern, Schwimmen, etc.).
// `\b...\w*\b` matched Wortanfang + optionale Endungen (Intervalle, Laufen, …).
function inferTypeFromName(name) {
  const n = (name||'').toLowerCase();
  if (/\b(lauf|laufen|run|jog|sprint|cardio|tempo|interval)\w*\b/i.test(n)) return 'cardio';
  if (/\b(bike|fahrrad|radfahren|spinning)\w*\b/i.test(n)) return 'cardio';
  if (/\b(schwimm|swim)\w*\b/i.test(n)) return 'cardio';
  if (/\b(ruder|rower|rowing)\w*\b/i.test(n)) return 'cardio';
  if (/\b(crosstrainer|ellipt)\w*\b/i.test(n)) return 'cardio';
  if (/\b(seilspring|jump\s*rope)\w*\b/i.test(n)) return 'cardio';
  return 'strength';
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
    // Migrate type-Feld: Bestands-Uebungen ohne type bekommen 'strength' (Cardio kommt erst neu dazu)
    if (list.some(ex => ex.type === undefined)) {
      list = list.map(ex => ex.type === undefined ? { ...ex, type: 'strength' } : ex);
      migrated = true;
    }
    // Cardio-Seeds beim ersten Aufruf einmalig anlegen (4 Standard-Lauf-Eintraege).
    // ft_cardio_seeded = '1' verhindert Re-Seed nach Loeschen.
    if (!localStorage.getItem('ft_cardio_seeded')) {
      const hasCardio = list.some(ex => ex.type === 'cardio');
      if (!hasCardio) {
        const seeds = [
          { id: 'cd-easy-run',     name: 'Easy Run',   type: 'cardio', notes: '' },
          { id: 'cd-tempo-run',    name: 'Tempo Run',  type: 'cardio', notes: '' },
          { id: 'cd-long-run',     name: 'Long Run',   type: 'cardio', notes: '' },
          { id: 'cd-intervals',    name: 'Intervalle', type: 'cardio', notes: '' },
        ];
        list = [...list, ...seeds];
        migrated = true;
      }
      localStorage.setItem('ft_cardio_seeded', '1');
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
  // Ein Lib-Tag: { id, name, color?, exercises:[{exId,targetSets,targetReps} | {exId} cardio], notes, archived, createdAt }
  getTrainingDays() { const s = localStorage.getItem('ft_trainingdays'); return s ? JSON.parse(s) : []; },
  saveTrainingDays(v) { localStorage.setItem('ft_trainingdays', JSON.stringify(v)); markLocalChange(); },

  getWorkouts() { const s = localStorage.getItem('ft_workouts'); return s ? JSON.parse(s) : []; },
  saveWorkouts(v) { localStorage.setItem('ft_workouts', JSON.stringify(v)); markLocalChange(); },
  addWorkout(w) { const ws = this.getWorkouts(); ws.unshift(w); this.saveWorkouts(ws); },
  getActive() { const s = localStorage.getItem('ft_active'); return s ? JSON.parse(s) : null; },
  saveActive(v) { localStorage.setItem('ft_active', JSON.stringify(v)); },
  clearActive() { localStorage.removeItem('ft_active'); },
};

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function getEx(id) { return DB.getExercises().find(e => e.id === id); }
function muscleName(m) { return (MUSCLE_META[m] && MUSCLE_META[m].name) || m; }
function muscleColor(m) { return (MUSCLE_META[m] && MUSCLE_META[m].color) || '#0066ff'; }
function muscleBg(m) { return (MUSCLE_META[m] && MUSCLE_META[m].bg) || '#e8f0ff'; }

// ─── Cardio-Helpers ───
// Type-Check fuer Uebung. Default 'strength' (Bestands-Uebungen ohne type).
function exType(exOrId) {
  const ex = (typeof exOrId === 'string') ? getEx(exOrId) : exOrId;
  return (ex && ex.type === 'cardio') ? 'cardio' : 'strength';
}
function isCardioEx(exOrId) { return exType(exOrId) === 'cardio'; }
// Workout-Exercise-Instance kann ihren Type lokal halten (workout-exercises[].type) ODER
// implizit ueber exId via Stamm-Uebung. Diese Funktion nimmt beides:
function woExType(we) {
  if (we && we.type) return we.type;
  return exType(we && (we.exId || we.id));
}
function isWoExCardio(we) { return woExType(we) === 'cardio'; }
// Plan-Day: enthaelt mindestens eine Cardio-Uebung?
function planDayHasCardio(day) {
  if (!day || !day.exercises) return false;
  return day.exercises.some(e => isCardioEx(e.id || e));
}
// Plan-Day: ist eine reine Cardio-Session (keine Kraft-Uebungen)?
function planDayIsPureCardio(day) {
  if (!day || !day.exercises || day.exercises.length === 0) return false;
  return day.exercises.every(e => isCardioEx(e.id || e));
}
// Pace berechnen (Sekunden pro Kilometer). Liefert {min,sek} oder null.
function calcPace(durationSec, distanceKm) {
  if (!durationSec || !distanceKm || distanceKm <= 0) return null;
  const secPerKm = durationSec / distanceKm;
  const min = Math.floor(secPerKm / 60);
  const sek = Math.round(secPerKm % 60);
  return { min, sek, secPerKm };
}
function formatPace(durationSec, distanceKm) {
  const p = calcPace(durationSec, distanceKm);
  if (!p) return null;
  return `${p.min}:${String(p.sek).padStart(2,'0')}/km`;
}
function formatDuration(durationSec) {
  if (!durationSec || durationSec < 0) return '0:00';
  const min = Math.floor(durationSec / 60);
  const sek = Math.round(durationSec % 60);
  return `${min}:${String(sek).padStart(2,'0')}`;
}
function formatDistance(km) {
  if (!km && km !== 0) return '–';
  return km.toFixed(km < 10 ? 2 : 1).replace('.', ',') + ' km';
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
  // Aktiver Plan (per Datum), kein Edit-Kontext/DEFAULT-Fallback. Ohne aktiven Plan: total 0.
  const active = getActivePlan();
  const plan = active ? active.trainingDays : [];
  if (ws.length === 0) return { weekNum:1, doneThisWeek:0, total:plan.length };
  const first = [...ws].sort((a,b) => a.startTs - b.startTs)[0];
  const diffWeeks = Math.floor((Date.now() - first.startTs) / (7*24*3600*1000));
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay()+6)%7)); mon.setHours(0,0,0,0);
  const done = ws.filter(w => w.startTs >= mon.getTime()).length;
  return { weekNum: diffWeeks+1, doneThisWeek: done, total: plan.length };
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

// Get current ISO calendar week
function isoWeekNum(d=new Date()) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - ((date.getDay()+6)%7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date-week1)/86400000 - 3 + ((week1.getDay()+6)%7))/7);
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

function getNextPlanDay() {
  const active = getActivePlan();
  if (!active) return null;
  const plan = active.trainingDays;
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
  return workout.exercises.reduce((acc, ex) => {
    if (isWoExCardio(ex) || !Array.isArray(ex.sets)) return acc;
    return acc + ex.sets.reduce((a, s) => a + (parseFloat(s.weight)||0) * (parseInt(s.reps)||0), 0);
  }, 0);
}

function calcMuscleVolume(workouts) {
  const vol = {};
  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      if (isWoExCardio(ex) || !Array.isArray(ex.sets)) return;
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
    if (isWoExCardio(ex)) {
      const cd = ex.cardio || {};
      const dist = parseFloat(cd.distance);
      const dur = parseFloat(cd.duration);
      if (!(dist > 0) && !(dur > 0)) return;
      // Vergleichswerte: bisher laengste Distanz + schnellste Pace (Pace nur ab >=1km Distanz)
      let prevLongest = 0;
      let prevFastest = null; // sec/km
      allPrevWorkouts.forEach(w => {
        (w.exercises || []).forEach(we => {
          if ((we.exId||we.id) !== (ex.exId||ex.id)) return;
          if (!isWoExCardio(we)) return;
          const pcd = we.cardio || {};
          const pdist = parseFloat(pcd.distance);
          const pdur = parseFloat(pcd.duration);
          if (pdist > prevLongest) prevLongest = pdist;
          if (pdist >= 1 && pdur > 0) {
            const p = calcPace(pdur, pdist);
            if (p && (prevFastest == null || p.secPerKm < prevFastest)) prevFastest = p.secPerKm;
          }
        });
      });
      const newPace = (dist >= 1 && dur > 0) ? calcPace(dur, dist) : null;
      const isDistPR = dist > 0 && dist > prevLongest;
      const isPacePR = !!(newPace && (prevFastest == null || newPace.secPerKm < prevFastest));
      if (isDistPR || isPacePR) {
        prs.push({
          exId: ex.exId||ex.id, name: ex.name, kind: 'cardio',
          distance: dist || 0,
          duration: dur || 0,
          secPerKm: newPace ? newPace.secPerKm : null,
          prevLongest, prevFastest,
          isDistPR, isPacePR,
        });
      }
      return;
    }
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
    if (ex && !isWoExCardio(ex) && Array.isArray(ex.sets) && ex.sets.length) {
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

const TAB_ORDER = ['overview', 'workouts', 'exercises', 'plans', 'mehr'];

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
  else if (name === 'exercises') renderExercises();
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
  // Plan-Detail UND Trainingstag-Detail sind Vollbild-Overlays UEBER dem Tab-Container.
  const planDetailEl = document.getElementById('screen-plan-detail');
  const dayDetailEl = document.getElementById('screen-day-detail');
  const tabContainer = document.getElementById('tab-container');

  if (name === 'plan-detail') {
    currentScreen = 'plan-detail';
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

  // ─ Stats-Karten (Volumenentwicklung, Muskelgruppen-Volumen, PRs) ─
  // Diese 3 Karten wurden vom alten Verlauf-Tab in die Übersicht verschoben.
  renderHomeStats();
}

function renderRecentSessionsOnOverview() {
  const container = document.getElementById('ov-recent-sessions-list');
  if (!container) return;
  // Cardio ausgeblendet → reine Cardio-Sessions nicht in „Letzte Sessions" zeigen.
  const ws = DB.getWorkouts()
    .filter(w => CARDIO_ENABLED || !((w.exercises||[]).length && (w.exercises||[]).every(e => isWoExCardio(e))))
    .slice(0, 3);
  if (!ws.length) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text3);padding:8px 0;text-align:center;margin:0">Noch keine Workouts</p>';
    return;
  }
  // Tagname vergangener Sessions aus dem GLOBALEN Tag-Store auflösen (nicht aus dem aktiven
  // Plan / DEFAULT-Fallback) — robust, da der Tag in irgendeinem Plan oder nur in der Bibliothek
  // liegen kann. Fällt sonst auf den gespeicherten Snapshot-Namen zurück.
  const allDays = DB.getTrainingDays();
  container.innerHTML = ws.map((w, i) => {
    const day = allDays.find(d => d.id === w.planDayId);
    const dayName = day ? day.name : (w.planDayName || 'Freestyle');
    const allCardio = (w.exercises || []).length > 0 && (w.exercises || []).every(e => isWoExCardio(e));
    const someCardio = CARDIO_ENABLED && !allCardio && (w.exercises || []).some(e => isWoExCardio(e));
    // Cardio-Session: 🏃-Icon und Distanz/Pace statt Sets-Hantel
    if (allCardio) {
      const totalDist = (w.exercises || []).reduce((acc, we) => acc + (parseFloat(we.cardio && we.cardio.distance) || 0), 0);
      const totalDur = (w.exercises || []).reduce((acc, we) => acc + (parseInt(we.cardio && we.cardio.duration) || 0), 0);
      const distStr = totalDist > 0 ? formatDistance(totalDist) : '';
      const paceStr = (totalDist >= 1 && totalDur > 0)
        ? ` · ${formatPace(totalDur, totalDist)}/km`
        : '';
      const metaCardio = distStr
        ? `<span class="recent-cardio-meta">${distStr}${paceStr}</span>`
        : (totalDur > 0 ? `<span class="recent-cardio-meta">${formatDuration(totalDur)}</span>` : '');
      return `<div class="sess-v2-row" onclick="showHistDetail(${i})">
        <div class="sess-v2-icon recent-cardio-icon">🏃</div>
        <div class="sess-v2-info">
          <div class="sess-v2-name">${pd(dayName)}</div>
          <div class="sess-v2-meta">${fmtDateShort(w.startTs)} • ${metaCardio || fmtDur(w.duration)}</div>
        </div>
        <div class="sess-v2-arrow">›</div>
      </div>`;
    }
    // Mixed-Day mit Cardio-Anteil: kleines Cardio-Chip in der Meta
    const cardioBadge = someCardio ? ' · 🏃' : '';
    return `<div class="sess-v2-row" onclick="showHistDetail(${i})">
      <div class="sess-v2-icon">
        <svg viewBox="0 0 24 24"><path d="M6 9v6M4 7v10M18 9v6M20 7v10M9 12h6"/></svg>
      </div>
      <div class="sess-v2-info">
        <div class="sess-v2-name">${pd(dayName)}</div>
        <div class="sess-v2-meta">${fmtDateShort(w.startTs)} • ${fmtDur(w.duration)}${cardioBadge}</div>
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
  if (CARDIO_ENABLED && d.planDay && planDayIsPureCardio(d.planDay)) classes.push('cardio');
  if (isWorkoutsTab && i === selectedWorkoutDayIdx) classes.push('selected');
  if (!isWorkoutsTab && isOverviewSelected) classes.push('selected');
  // Übersicht: Tippen wählt den Tag aus → Info-Zeile darunter aktualisiert sich (analog Workouts-Strip).
  const onclick = isWorkoutsTab ? `onclick="selectWorkoutDay(${i})"` : `onclick="selectOverviewDay(${i})"`;
  return `<div class="${classes.join(' ')}" ${onclick}>
    <span class="wp-letter">${d.label}</span>
    <span class="wp-bar"></span>
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
    // Ruhetag → naechsten Trainingstag finden (zuerst rest der Woche, sonst von Anfang)
    const next = days.slice(focusIdx + 1).find(x => x.planDay)
              || days.slice(0, focusIdx).find(x => x.planDay);
    const trail = next ? ` · nächstes Training: ${dayFullName(next.dayKey)}` : '';
    return `<strong>${label}</strong> · Ruhetag${trail}`;
  }
  const exCount = (d.planDay.exercises || []).length;
  const exLabel = exCount === 1 ? 'Übung' : 'Übungen';
  const doneMark = d.dayDone ? ' <span class="wp-info-done">✓</span>' : '';
  return `<strong>${label}</strong> · ${escapeHtml(d.planDay.name)} · ${exCount} ${exLabel}${doneMark}`;
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
    // Cardio-Eintraege haben keine Sets/targetReps — Sync ist hier ein no-op
    if (isWoExCardio(ae)) continue;
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
    if (exType(ex) === 'cardio') {
      wo.exercises.push({
        exId: pe.exId, id: pe.exId, name: ex.name, type: 'cardio',
        cardio: { duration: '', distance: '', notes: '' },
        notes: '', done: false,
      });
    } else {
      wo.exercises.push({
        exId: pe.exId, id: pe.exId, name: ex.name,
        targetSets: pe.targetSets, targetReps: pe.targetReps,
        sets: buildSetsForExercise(pe.exId, pe.targetSets, pe.targetReps, pe.targetWeight),
        notes: '', done: false,
      });
    }
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
    if (isWoExCardio(ae)) {
      const cd = ae.cardio || {};
      return !!(cd.duration || cd.distance || (cd.notes && cd.notes.length));
    }
    return (ae.sets || []).some(s => s.weight || s.reps);
  });
  if (!affected.length) { onConfirm(); return; }
  const names = affected.map(ae => `„${ae.name}"`).join(', ');
  confirmAction(
    'Übung mit eingetragenen Daten entfernen?',
    `${names} hat im laufenden Workout schon eingetragene Sätze. Beim Entfernen aus dem Plan wird die Übung auch aus dem aktiven Workout gestrichen — die Daten gehen verloren. Trotzdem entfernen?`,
    onConfirm,
    { danger: true, confirmLabel: 'Entfernen' }
  );
}

function startWorkout(dayId) {
  // Pure-Cardio-Tage laufen ueber Quick-Log und brauchen den Active-Workout-Slot nicht
  // — der laufende Active-Workout darf in diesem Fall ungestoert weiterlaufen.
  const ap = getActivePlan();
  const dayObj = ap ? (ap.trainingDays || []).find(d => d.id === dayId) : null;
  if (CARDIO_ENABLED && dayObj && planDayIsPureCardio(dayObj)) {
    openCardioQuickLog(dayId);
    return;
  }
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
  // Workout-Start: Card-Collapse-State zuruecksetzen, damit keine Reste vom letzten Workout uebrig sind
  if (typeof expandedAexIds !== 'undefined') expandedAexIds.clear();
  // Workout-Start läuft immer auf den aktiven Plan (nicht den Edit-Kontext)
  const active = getActivePlan();
  if (!active) { showToast('Kein aktiver Trainingsplan'); return; }
  const plan = active.trainingDays;
  const day = plan.find(d => d.id === dayId);

  // Pure-Cardio-Tage gehen am Active-Mode vorbei in den Quick-Log-Flow.
  // (Mixed-Days + reine Kraft-Tage laufen weiter unten als regulaeres Active-Workout.)
  if (CARDIO_ENABLED && day && planDayIsPureCardio(day)) {
    openCardioQuickLog(dayId);
    return;
  }

  // Cardio ausgeblendet → Cardio-Übungen aus dem zu startenden Workout filtern.
  const exercises = (day ? day.exercises : []).filter(pe => CARDIO_ENABLED || exType(pe.exId) !== 'cardio').map(pe => {
    const ex = getEx(pe.exId);
    if (!ex) return null;
    if (exType(ex) === 'cardio') {
      // Cardio-Workout-Eintrag: cardio-Objekt statt sets
      return {
        exId: pe.exId,
        id: pe.exId,
        name: ex.name,
        type: 'cardio',
        cardio: { duration: '', distance: '', notes: '' },
        notes: '',
        done: false,
      };
    }
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
  // Sets nur fuer Kraft-Eintraege zaehlen — Cardio hat keine Sets
  const totalSets = active
    ? active.exercises.reduce((a,e) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0)
    : (planDay
        ? planDay.exercises.reduce((a,e) => a + (exType(e.exId) === 'cardio' ? 0 : (e.targetSets || 0)), 0)
        : 0);
  const exCount = active ? active.exercises.length : (planDay ? planDay.exercises.length : 0);
  const doneEx = active ? active.exercises.filter(e=>e.done).length : 0;
  const processedEx = active ? active.exercises.filter(e=>e.done || e.skipped).length : 0;
  const title = `${dayFullName(selDay.dayKey)}${planDay ? ' — ' + escapeHtml(planDay.name) : ''}`;
  const label = opts.label || (isPreview ? 'VORSCHAU' : 'AKTIVE SESSION');
  // Reine Cardio-Tage zaehlen Sets nicht — labeln stattdessen die Einheit als Cardio
  const isPureCardio = CARDIO_ENABLED && !!(planDay && planDayIsPureCardio(planDay));
  const meta = isPureCardio
    ? `${exCount} Cardio-Einheit${exCount === 1 ? '' : 'en'}`
    : `${exCount} Übungen • ${totalSets} Sätze`;
  const pct = !isPreview && active && active.exercises.length
    ? (processedEx / active.exercises.length * 100) : 0;
  const timerBlock = (!isPreview && active)
    ? `<div class="hero-v2-timer">${fmtTimer(Math.floor(getElapsedMs(active)/1000))}</div>`
    : '';

  const metaPreview = isPureCardio
    ? `<div class="hero-v2-meta">
        <span style="display:inline-flex;gap:5px;align-items:center">
          <span style="font-size:14px">🏃</span>
          ${exCount} Cardio-Einheit${exCount === 1 ? '' : 'en'}</span>
      </div>`
    : `<div class="hero-v2-meta">
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
  // Pause-Button hat nur Sinn, wenn ueberhaupt eine Kraft-Uebung im Workout steckt
  // (Pace wird bei Cardio nicht durch Pause beeinflusst, Timer waere irrelevant).
  const hasStrengthEx = !!(active && active.exercises.some(e => !isWoExCardio(e)));
  const pauseBtn = hasStrengthEx
    ? `<button class="hero-v2-btn-pause" onclick="togglePauseWorkout()" aria-label="${pauseLabel}">
          ${pauseIcon}
          ${pauseLabel}
        </button>`
    : '';

  return `<div class="hero-v2 col-layout active-mode">
    ${topRow}
    <div class="hero-v2-bottom">
      <div class="${rowClass}">
        ${nextBtn}
        ${pauseBtn}
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
}

function renderPreviewWorkout(planDay, mode = 'preview', containerId = 'active-ex-list') {
  // (Mini-Kacheln im Workouts-Tab wurden entfernt)
  if (mode !== 'libday') document.getElementById('ex-tab-bar').innerHTML = '';

  // Cards (read-only target view). mode='libday' rendert dieselben Cards für einen
  // Bibliotheks-Trainingstag in den Container `containerId` (Drag&Drop/Add routen zum Lib-Tag).
  document.getElementById(containerId).innerHTML = planDay.exercises.map((pe, ei) => {
    const ex = getEx(pe.exId);
    if (!ex) return '';
    if (!CARDIO_ENABLED && exType(ex) === 'cardio') return '';   // Cardio ausgeblendet
    // Cardio-Preview: zeigt die letzte Cardio-Session als Vorschau
    if (exType(ex) === 'cardio') return buildPreviewCardioCardHTML(ex, ei, planDay.id, mode);
    const col = colorForExercise({ exId: pe.exId });
    const last = getLastExData(pe.exId);
    const targetW = last ? `${last.maxWeight} kg` : '–';
    const lastStr = last ? `Zuletzt: ${last.sets.length}×${last.sets[0]?.reps||'?'} @ ${last.maxWeight} kg` : '';
    const exIdKey = pe.exId;
    const collapsedCls = isAexExpanded(exIdKey) ? '' : 'collapsed';
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
        <div class="aex-v2-table aex-target-table">
          <div class="aex-target-row">
            <span class="ax-lbl">Sätze</span>
            <div class="aex-set-stepper">
              <button type="button" class="aex-step-btn" onclick="stepPreviewSets('${planDay.id}',${ei},-1,'${mode}')" aria-label="Satz weniger">−</button>
              <span class="aex-step-val">${pe.targetSets}</span>
              <button type="button" class="aex-step-btn" onclick="stepPreviewSets('${planDay.id}',${ei},1,'${mode}')" aria-label="Satz mehr">+</button>
            </div>
          </div>
          <div class="aex-target-row">
            <span class="ax-lbl">Wdh.</span>
            <input class="aex-target-cell" type="number" inputmode="numeric" min="1" max="99" value="${pe.targetReps}"
                   onchange="updatePreviewTarget('${planDay.id}',${ei},'targetReps',this.value,'${mode}')" aria-label="Ziel-Wiederholungen">
          </div>
          <div class="aex-target-row">
            <span class="ax-lbl">kg</span>
            <span class="aex-target-ref">${last ? last.maxWeight + ' kg · zuletzt' : '–'}</span>
          </div>
        </div>
        <div class="aex-v2-notes">
          <textarea class="aex-v2-notes-area" data-ex-id="${ex.id}" placeholder="Notizen"
                    onchange="saveExerciseNote('${ex.id}', this.value)">${ex.notes || ''}</textarea>
        </div>
      </div>
      ${mode === 'libday' ? `<div class="aex-libday-actions"><button class="aex-libday-remove" onclick="removeLibDayExercise(${ei})">Übung entfernen</button></div>` : ''}
    </div>`;
  }).join('');
}

// Inline-Editing der Ziel-Sätze/Wdh. direkt in den Vorschau-Karten (Workouts-Vorschau +
// Trainingstag-Detail). Beide Modi editieren denselben globalen Bibliothek-Tag, da planDay.id
// im Referenz-Modell eine globale Tag-ID ist. (kg bleibt als Verlaufs-Referenz read-only.)
function updatePreviewTarget(dayId, ei, field, value, mode) {
  const max = field === 'targetSets' ? 12 : 99;
  const v = Math.max(1, Math.min(max, parseInt(value) || 1));
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === dayId);
  if (!day || !Array.isArray(day.exercises) || !day.exercises[ei]) return;
  day.exercises[ei][field] = v;
  DB.saveTrainingDays(days);
  // Läuft gerade ein Workout auf genau diesem Tag → mitziehen (Sätze auffüllen, nie kürzen).
  syncActiveWorkoutWithPlanDay(dayId);
  if (mode === 'libday') renderLibDayDetail();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
}

// Satz-Anzahl per Stepper in der Vorschau-Tabelle ändern (1–12).
function stepPreviewSets(dayId, ei, delta, mode) {
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === dayId);
  if (!day || !Array.isArray(day.exercises) || !day.exercises[ei]) return;
  const cur = day.exercises[ei].targetSets || 1;
  const v = Math.max(1, Math.min(12, cur + delta));
  if (v === cur) return;
  day.exercises[ei].targetSets = v;
  DB.saveTrainingDays(days);
  syncActiveWorkoutWithPlanDay(dayId);
  if (mode === 'libday') renderLibDayDetail();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
}

// Preview-Variante einer Cardio-Card im Workouts-Tab. Read-only, zeigt die letzten Werte
// als Vorschau und ist nicht editierbar (Inputs greifen erst beim Start des Workouts).
function buildPreviewCardioCardHTML(ex, ei, planDayId, mode = 'preview') {
  const last = getLastCardio(ex.id);
  const lastStr = last
    ? `Zuletzt: ${formatDistance(last.distance)} in ${formatDuration(last.duration)}`
    : 'Noch keine Daten';
  const pr = getCardioPR(ex.id);
  const prStr = (pr && pr.longestDist)
    ? `Best: ${formatDistance(pr.longestDist)}` +
      (pr.fastestPace ? ` · ${formatPace(pr.fastestPace, 1)}/km` : '')
    : '';
  const exIdKey = ex.id;
  const collapsedCls = isAexExpanded(exIdKey) ? '' : 'collapsed';
  return `<div class="aex-v2 aex-cardio ${collapsedCls}" id="aex-${ei}"
               ondragstart="aexDragStart(event,${ei},'${mode}','${planDayId}')"
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
        <div class="aex-v2-last">${lastStr}</div>
      </div>
    </div>
    <div class="aex-cardio-form">
      <div class="aex-cardio-pace ${pr ? '' : 'empty'}">${prStr || 'Pace-Daten kommen mit dem ersten Lauf'}</div>
      ${ex.notes ? `<div class="aex-v2-notes" style="margin-top:10px"><textarea class="aex-v2-notes-area" data-ex-id="${ex.id}" placeholder="Notizen" onchange="saveExerciseNote('${ex.id}', this.value)">${ex.notes}</textarea></div>` : ''}
    </div>
    ${mode === 'libday' ? `<div class="aex-libday-actions"><button class="aex-libday-remove" onclick="removeLibDayExercise(${ei})">Übung entfernen</button></div>` : ''}
  </div>`;
}

function renderActiveWorkout() {
  const wo = DB.getActive();
  if (!wo) return;

  // (Mini-Kacheln im Workouts-Tab wurden entfernt)
  document.getElementById('ex-tab-bar').innerHTML = '';

  // Exercise cards
  document.getElementById('active-ex-list').innerHTML = wo.exercises.map((ex, ei) => {
    if (!CARDIO_ENABLED && isWoExCardio(ex)) return '';   // Cardio ausgeblendet
    // Cardio-Karte rendert vollkommen anders (Form statt Sets-Tabelle)
    if (isWoExCardio(ex)) return buildActiveCardioCardHTML(ex, ei);
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
            <span class="ax-lbl">Wdh.</span>${repInputs}
          </div>
          <div class="aex-v2-row" style="grid-template-columns:${gridCols}">
            <span class="ax-lbl">kg</span>${kgInputs}
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

// ─── Ein/Aus-Klapp-State der Workout-Tab-Cards ─────────────────────
// Default: alle Cards eingeklappt. Klick auf den Card-Header togglet
// fuer die jeweilige Uebung (per exId). State ist in-memory pro Session.
const expandedAexIds = new Set();
function isAexExpanded(exId) { return expandedAexIds.has(exId); }
function toggleAexCollapse(exId, ev) {
  if (ev) {
    // Klicks auf Drag-Handle / Erledigt-Checkbox sollen NICHT togglen
    const t = ev.target;
    if (t.closest && (t.closest('.aex-drag-handle') || t.closest('.aex-v2-done'))) return;
  }
  if (expandedAexIds.has(exId)) expandedAexIds.delete(exId);
  else expandedAexIds.add(exId);
  if (currentScreen === 'workouts') renderWorkoutsScreen();
  else if (currentScreen === 'day-detail') renderLibDayDetail();
}
// SVG-Chevron-Snippet fuer die Card-Header (gemeinsame Konstante)
const AEX_CHEV_SVG = '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';

// ─── Active-Workout: Cardio-Card ───────────────────────────────────
// Cardio-Variante der Active-Exercise-Card. Verzichtet auf die Sets-Tabelle und
// rendert stattdessen ein Form-Layout (Dauer / Distanz / Pace + Notiz).
function buildActiveCardioCardHTML(ex, ei) {
  const cd = ex.cardio || {};
  const durSecAll = parseInt(cd.duration, 10) || 0;
  const durMin = Math.floor(durSecAll / 60);
  const durSec = durSecAll % 60;
  const distVal = (cd.distance !== '' && cd.distance != null) ? cd.distance : '';
  const notesVal = cd.notes || '';

  const durNum = parseFloat(cd.duration);
  const distNum = parseFloat(cd.distance);
  const hasPace = durNum > 0 && distNum > 0;
  const paceText = hasPace ? `${formatPace(durNum, distNum)} min/km` : 'Pace —';
  const paceCls = hasPace ? '' : 'empty';

  const last = getLastCardio(ex.exId || ex.id);
  const lastStr = last
    ? `Zuletzt: ${formatDistance(last.distance)} in ${formatDuration(last.duration)}`
    : '';

  const stateCls = ex.done ? 'done' : (ex.skipped ? 'skipped' : '');
  const dis = ex.done ? 'disabled' : '';
  const checkSvg = ex.done
    ? '<svg width="12" height="12" viewBox="0 0 24 24" stroke="white" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
    : '';

  // Notizen-Quelle: globale Uebungsnotiz (single source of truth, wird beim Speichern gespiegelt)
  const globalNotes = (getEx(ex.exId || ex.id)?.notes) || '';
  const notesShown = notesVal || globalNotes;

  const exIdKey = ex.exId || ex.id;
  const collapsedCls = isAexExpanded(exIdKey) ? '' : 'collapsed';
  return `<div class="aex-v2 aex-cardio ${stateCls} ${collapsedCls}" id="aex-${ei}"
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
      </div>
      <label class="aex-v2-done ${ex.done?'checked':''}">
        <input type="checkbox" ${ex.done?'checked':''} onchange="toggleExDone(${ei},this.checked)">
        <div class="aex-v2-done-box">${checkSvg}</div>
        <span>Erledigt</span>
      </label>
    </div>
    <div class="aex-cardio-form">
      <div class="aex-cardio-row">
        <div class="aex-cardio-field">
          <span class="aex-cardio-field-label">Dauer</span>
          <div class="aex-cardio-duration">
            <input type="number" inputmode="numeric" min="0" placeholder="min"
                   value="${durMin || ''}"
                   onchange="updateCardioDuration(${ei}, this.value, null)" ${dis}>
            <span class="colon">:</span>
            <input type="number" inputmode="numeric" min="0" max="59" placeholder="sek"
                   value="${durSec ? String(durSec).padStart(2,'0') : ''}"
                   onchange="updateCardioDuration(${ei}, null, this.value)" ${dis}>
          </div>
        </div>
        <div class="aex-cardio-field">
          <span class="aex-cardio-field-label">Distanz (km)</span>
          <div class="aex-cardio-distance">
            <input type="number" inputmode="decimal" step="0.01" min="0" placeholder="–"
                   value="${distVal}"
                   onchange="updateCardioField(${ei}, 'distance', this.value)" ${dis}>
          </div>
        </div>
      </div>
      <div class="aex-cardio-pace ${paceCls}">${paceText}</div>
      <div class="aex-cardio-notes" style="margin-top:10px">
        <textarea placeholder="Notiz (Strecke, Pace-Strategie, Empfindung …)"
                  onchange="updateCardioNotes(${ei}, this.value)" ${dis}>${notesShown}</textarea>
      </div>
    </div>
    ${ex.done ? '' : (ex.skipped
      ? `<div class="aex-v2-actions">
           <button class="btn btn-ghost btn-sm" onclick="unskipExercise(${ei})">↻ Wieder aktiv setzen</button>
         </div>`
      : `<div class="aex-v2-actions">
           <button class="btn btn-ghost btn-sm aex-skip-btn" onclick="skipExercise(${ei})">» Überspringen</button>
         </div>`)}
  </div>`;
}

// Schreibt einen einzelnen Cardio-Eingabewert. Re-rendert ausschliesslich die Pace-Pille,
// damit der Input-Fokus auf dem aktuellen Feld nicht verloren geht.
function updateCardioField(ei, field, value) {
  const wo = DB.getActive();
  if (!wo) return;
  const ex = wo.exercises[ei];
  if (!ex) return;
  if (!ex.cardio) ex.cardio = { duration: '', distance: '', notes: '' };
  if (field === 'distance') {
    const v = (value === '' || value == null) ? '' : String(parseFloat(value) || '');
    ex.cardio.distance = v;
  }
  DB.saveActive(wo);
  refreshCardioPace(ei);
}

// Dauer-Updates erfolgen feld-getrennt (min, sec). Wir lesen das jeweils andere Feld
// direkt aus dem DOM, damit der Speicherwert immer in Sekunden konsistent bleibt.
function updateCardioDuration(ei, minStr, secStr) {
  const wo = DB.getActive();
  if (!wo) return;
  const ex = wo.exercises[ei];
  if (!ex) return;
  if (!ex.cardio) ex.cardio = { duration: '', distance: '', notes: '' };
  const inputs = document.querySelectorAll(`#aex-${ei} .aex-cardio-duration input`);
  const minEl = inputs[0], secEl = inputs[1];
  let min = (minStr !== null && minStr !== undefined)
    ? (parseInt(minStr) || 0)
    : (minEl ? (parseInt(minEl.value) || 0) : 0);
  let sec = (secStr !== null && secStr !== undefined)
    ? (parseInt(secStr) || 0)
    : (secEl ? (parseInt(secEl.value) || 0) : 0);
  if (min < 0) min = 0;
  if (sec < 0) sec = 0;
  if (sec > 59) sec = 59;
  const totalSec = min*60 + sec;
  ex.cardio.duration = totalSec ? String(totalSec) : '';
  DB.saveActive(wo);
  refreshCardioPace(ei);
}

function updateCardioNotes(ei, value) {
  const wo = DB.getActive();
  if (!wo) return;
  const ex = wo.exercises[ei];
  if (!ex) return;
  if (!ex.cardio) ex.cardio = { duration: '', distance: '', notes: '' };
  ex.cardio.notes = value;
  ex.notes = value; // Workout-Instance spiegelt die Notiz mit, konsistent zu Kraft-Notizen
  // mirror auch auf die globale Uebungsnotiz (single source of truth)
  const exs = DB.getExercises();
  const id = ex.exId || ex.id;
  const gex = exs.find(e => e.id === id);
  if (gex) { gex.notes = value; DB.saveExercises(exs); }
  DB.saveActive(wo);
}

// ─── Quick-Log: reine Cardio-Tage ──────────────────────────────────
// Reine Cardio-Tage (planDayIsPureCardio === true) springen am Active-Mode
// vorbei in dieses Modal. Hier werden Dauer/Distanz/Notiz pro Uebung erfasst
// und beim Speichern direkt als Workout-Eintrag in ft_workouts geschrieben.
let cardioQuickLogState = null; // { dayId, dayName, entries: [{exId, name, duration, distance, notes}] }

function openCardioQuickLog(dayId) {
  const plan = DB.getPlan();
  const day = plan.find(d => d.id === dayId);
  if (!day) return;
  const entries = day.exercises.map(pe => {
    const ex = getEx(pe.exId);
    return ex ? { exId: pe.exId, name: ex.name, duration: '', distance: '', notes: '' } : null;
  }).filter(Boolean);
  if (!entries.length) { showToast('Keine Cardio-Einheiten in diesem Tag'); return; }
  cardioQuickLogState = { dayId, dayName: day.name, entries };
  const titleEl = document.getElementById('cardio-qlog-title');
  if (titleEl) titleEl.textContent = day.name;
  renderCardioQuickLog();
  openModal('modal-cardio-qlog');
}

function renderCardioQuickLog() {
  const list = document.getElementById('cardio-qlog-list');
  if (!list || !cardioQuickLogState) return;
  list.innerHTML = cardioQuickLogState.entries.map((entry, idx) => {
    const last = getLastCardio(entry.exId);
    const lastStr = last
      ? `Zuletzt: ${formatDistance(last.distance)} in ${formatDuration(last.duration)}`
      : '';
    const durSecAll = parseInt(entry.duration, 10) || 0;
    const durMin = Math.floor(durSecAll / 60);
    const durSec = durSecAll % 60;
    const durNum = parseFloat(entry.duration);
    const distNum = parseFloat(entry.distance);
    const hasPace = durNum > 0 && distNum > 0;
    const paceText = hasPace ? `${formatPace(durNum, distNum)} min/km` : 'Pace —';
    const paceCls = hasPace ? '' : 'empty';
    return `<div class="cardio-qlog-card" id="qlog-card-${idx}">
      <div class="cardio-qlog-head">
        <div class="cardio-qlog-icon">🏃</div>
        <div style="flex:1;min-width:0">
          <div class="cardio-qlog-name">${entry.name}</div>
          ${lastStr ? `<div style="font-size:12px;color:var(--text3);margin-top:2px">${lastStr}</div>` : ''}
        </div>
      </div>
      <div class="cardio-qlog-body">
        <div class="aex-cardio-row">
          <div class="aex-cardio-field">
            <span class="aex-cardio-field-label">Dauer</span>
            <div class="aex-cardio-duration">
              <input type="number" inputmode="numeric" min="0" placeholder="min"
                     value="${durMin || ''}"
                     onchange="updateQlogDuration(${idx}, this.value, null)">
              <span class="colon">:</span>
              <input type="number" inputmode="numeric" min="0" max="59" placeholder="sek"
                     value="${durSec ? String(durSec).padStart(2,'0') : ''}"
                     onchange="updateQlogDuration(${idx}, null, this.value)">
            </div>
          </div>
          <div class="aex-cardio-field">
            <span class="aex-cardio-field-label">Distanz (km)</span>
            <div class="aex-cardio-distance">
              <input type="number" inputmode="decimal" step="0.01" min="0" placeholder="–"
                     value="${entry.distance}"
                     onchange="updateQlogField(${idx}, 'distance', this.value)">
            </div>
          </div>
        </div>
        <div class="aex-cardio-pace ${paceCls}">${paceText}</div>
        <div class="aex-cardio-notes" style="margin-top:10px">
          <textarea placeholder="Notiz (Strecke, Pace-Strategie, Empfindung …)"
                    onchange="updateQlogNotes(${idx}, this.value)">${entry.notes || ''}</textarea>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateQlogField(idx, field, value) {
  if (!cardioQuickLogState) return;
  const e = cardioQuickLogState.entries[idx];
  if (!e) return;
  if (field === 'distance') {
    e.distance = (value === '' || value == null) ? '' : String(parseFloat(value) || '');
  }
  refreshQlogPace(idx);
}

function updateQlogDuration(idx, minStr, secStr) {
  if (!cardioQuickLogState) return;
  const e = cardioQuickLogState.entries[idx];
  if (!e) return;
  const card = document.getElementById(`qlog-card-${idx}`);
  const inputs = card ? card.querySelectorAll('.aex-cardio-duration input') : null;
  const minEl = inputs ? inputs[0] : null;
  const secEl = inputs ? inputs[1] : null;
  let min = (minStr !== null && minStr !== undefined)
    ? (parseInt(minStr) || 0)
    : (minEl ? (parseInt(minEl.value) || 0) : 0);
  let sec = (secStr !== null && secStr !== undefined)
    ? (parseInt(secStr) || 0)
    : (secEl ? (parseInt(secEl.value) || 0) : 0);
  if (min < 0) min = 0;
  if (sec < 0) sec = 0;
  if (sec > 59) sec = 59;
  const totalSec = min*60 + sec;
  e.duration = totalSec ? String(totalSec) : '';
  refreshQlogPace(idx);
}

function updateQlogNotes(idx, value) {
  if (!cardioQuickLogState) return;
  const e = cardioQuickLogState.entries[idx];
  if (!e) return;
  e.notes = value;
}

function refreshQlogPace(idx) {
  if (!cardioQuickLogState) return;
  const e = cardioQuickLogState.entries[idx];
  if (!e) return;
  const card = document.getElementById(`qlog-card-${idx}`);
  const el = card ? card.querySelector('.aex-cardio-pace') : null;
  if (!el) return;
  const dur = parseFloat(e.duration);
  const dist = parseFloat(e.distance);
  if (dur > 0 && dist > 0) {
    el.classList.remove('empty');
    el.textContent = `${formatPace(dur, dist)} min/km`;
  } else {
    el.classList.add('empty');
    el.textContent = 'Pace —';
  }
}

function cancelCardioQuickLog() {
  // Wenn Werte eingetragen wurden, vor dem Abbruch nochmal nachfragen.
  const hasData = cardioQuickLogState && cardioQuickLogState.entries.some(e =>
    e.duration || e.distance || (e.notes && e.notes.length)
  );
  const close = () => {
    cardioQuickLogState = null;
    closeModal('modal-cardio-qlog');
  };
  if (!hasData) { close(); return; }
  closeModal('modal-cardio-qlog');
  setTimeout(() => {
    confirmAction(
      'Cardio-Session verwerfen?',
      'Eingetragene Werte gehen verloren. Trotzdem abbrechen?',
      close,
      { danger: true, confirmLabel: 'Verwerfen', onCancel: () => openModal('modal-cardio-qlog') }
    );
  }, 80);
}

function finishCardioQuickLog() {
  if (!cardioQuickLogState) return;
  const filled = cardioQuickLogState.entries.filter(e => e.duration || e.distance);
  if (!filled.length) {
    showToast('Bitte mindestens eine Dauer oder Distanz eintragen');
    return;
  }
  // Workout-Eintrag bauen (Schema-kompatibel zu Active-Workouts)
  const startTs = Date.now();
  const workoutExs = filled.map(e => ({
    exId: e.exId, id: e.exId, name: e.name, type: 'cardio',
    cardio: { duration: e.duration || '', distance: e.distance || '', notes: e.notes || '' },
    notes: e.notes || '',
    done: true,
  }));
  const prevWorkouts = DB.getWorkouts();
  const fake = { exercises: workoutExs };
  const prs = detectPRs(fake, prevWorkouts);
  const totalDur = workoutExs.reduce((acc, we) => acc + (parseInt(we.cardio.duration, 10) || 0), 0);
  const wo = {
    id: 'wo_' + startTs,
    planDayId: cardioQuickLogState.dayId,
    planDayName: cardioQuickLogState.dayName,
    startTs,
    endTs: Date.now(),
    duration: totalDur,
    exercises: workoutExs,
    prs,
    isCardioQuickLog: true,
  };
  DB.addWorkout(wo);
  cardioQuickLogState = null;
  closeModal('modal-cardio-qlog');
  if (prs.length) showToast(`${prs.length} neuer PR! 🏆`);
  else showToast('Cardio-Session gespeichert! 🏃');
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
  if (driveIsEnabled()) driveTriggerSync('Cardio-Session beendet');
}

function refreshCardioPace(ei) {
  const wo = DB.getActive();
  if (!wo) return;
  const ex = wo.exercises[ei];
  if (!ex) return;
  const el = document.querySelector(`#aex-${ei} .aex-cardio-pace`);
  if (!el) return;
  const dur = parseFloat(ex.cardio && ex.cardio.duration);
  const dist = parseFloat(ex.cardio && ex.cardio.distance);
  if (dur > 0 && dist > 0) {
    el.classList.remove('empty');
    el.textContent = `${formatPace(dur, dist)} min/km`;
  } else {
    el.classList.add('empty');
    el.textContent = 'Pace —';
  }
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
  // Mark all sets as done/undone (nur fuer Kraft — Cardio hat keine Sets)
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

function scrollToEx(i) {
  const el = document.getElementById('aex-'+i);
  if (!el) return;
  // Use scroll-margin-top via scrollIntoView — works with the CSS setting we added.
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Update active tab highlight
  document.querySelectorAll('.ex-tab-v2').forEach((t,idx) => t.classList.toggle('active', idx===i));
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

// "Naechste Uebung"-Button im Hero: expand + scroll. Wird genutzt vom continueOnClick.
function scrollToNextExercise() {
  const nextIdx = expandNextExercise();
  if (nextIdx < 0) return;
  // Im naechsten Frame zur (ggf. frisch expandierten) Card scrollen
  requestAnimationFrame(() => scrollToEx(nextIdx));
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
function syncWorkoutActiveUI() {
  const active = !!DB.getActive();
  document.documentElement.classList.toggle('workout-active', active);
  const barTimer = document.getElementById('wab-timer');
  if (active && barTimer) barTimer.textContent = _woTimerText();
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

// Add-Ex-Modal kann Kraft oder Cardio listen. Default vom letzten Aufruf des Uebungen-Tabs uebernehmen,
// wenn der User dort gerade in einem Modus arbeitet.
let addExMode = 'strength'; // 'strength' | 'cardio'
// Context bestimmt, wo die Uebung beim Klick landet.
// 'active'  → in den aktiven Workout-Eintrag + verlinkten Plan-Tag (wie bisher)
// 'preview' → nur in den Plan-Tag des im Workouts-Tab gerade selektierten Tages (kein Workout aktiv)
let addExContext = 'active'; // 'active' | 'preview'

function setAddExMode(mode) {
  if (mode !== 'strength' && (mode !== 'cardio' || !CARDIO_ENABLED)) return;
  if (addExMode === mode) return;
  addExMode = mode;
  document.querySelectorAll('#modal-add-ex .ex-mode-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`add-ex-pill-${mode}`);
  if (activePill) activePill.classList.add('active');
  renderAddExList(document.getElementById('add-ex-search').value || '');
}

function openAddExModal(context) {
  // Kontext speichern — Default 'active' fuer Rueckwaerts-Kompatibilitaet
  addExContext = (context === 'preview' || context === 'libday') ? context : 'active';
  // Initialer Modus: wenn der User gerade im Cardio-Modus im Uebungen-Tab ist, dort starten.
  addExMode = (exMode === 'cardio') ? 'cardio' : 'strength';
  document.querySelectorAll('#modal-add-ex .ex-mode-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`add-ex-pill-${addExMode}`);
  if (activePill) activePill.classList.add('active');
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
  // Erst nach Modus filtern (Kraft-Modus zeigt nur strength, Cardio-Modus nur cardio)
  const byType = exs.filter(e => exType(e) === addExMode);
  // Dann optional nach Suchtext filtern
  const filtered = query
    ? byType.filter(e => e.name.toLowerCase().includes(query))
    : byType;

  // Cardio-Modus: flache alphabetische Liste, keine Muskelgruppen
  if (addExMode === 'cardio') {
    if (!filtered.length) {
      document.getElementById('add-ex-list').innerHTML =
        '<p style="color:var(--text3);text-align:center;padding:20px">Keine Cardio-Einheit gefunden</p>';
      return;
    }
    const sorted = filtered.slice().sort((a,b) => a.name.localeCompare(b.name, 'de'));
    const c = 'var(--cardio)';
    const items = sorted.map(e => `
      <div class="sheet-item muscle-coded" style="--c:${c}" onclick="addExToWorkout('${e.id}')">
        <div>
          <div class="sheet-item-name">${e.name}</div>
          <div class="sheet-item-sub">Cardio</div>
        </div>
        <span style="color:var(--cardio);font-size:20px">+</span>
      </div>`).join('');
    document.getElementById('add-ex-list').innerHTML = items;
    return;
  }

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
  const isCardio = exType(ex) === 'cardio';

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
    day.exercises.push(isCardio ? { exId } : { exId, targetSets: 3, targetReps: 8 });
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
    day.exercises.push(isCardio ? { exId } : { exId, targetSets: 3, targetReps: 8 });
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
    showToast('Kein laufendes Workout');
    return;
  }
  // 1) Übung dem aktiven Workout hinzufügen
  if (isCardio) {
    wo.exercises.push({
      exId, id:exId, name:ex.name, type: 'cardio',
      cardio: { duration: '', distance: '', notes: '' },
      notes:'', done:false
    });
  } else {
    wo.exercises.push({
      exId, id:exId, name:ex.name, targetSets:3, targetReps:8,
      sets: buildSetsForExercise(exId, 3, 8),
      notes:'', done:false
    });
  }
  DB.saveActive(wo);
  // 2) Übung auch in den Plan-Trainingstag eintragen (sofern verlinkt, nicht doppelt)
  // → künftige Workouts dieses Tags enthalten die Übung automatisch
  if (wo.planDayId) {
    const plan = DB.getPlan();
    const day = plan.find(d => d.id === wo.planDayId);
    if (day && !day.exercises.some(pe => pe.exId === exId)) {
      // Cardio-Eintraege im Plan-Day brauchen keine targetSets/targetReps
      day.exercises.push(isCardio ? { exId } : { exId, targetSets: 3, targetReps: 8 });
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
  // Card-Collapse-State leeren — beim naechsten Workout starten alle Cards eingeklappt
  expandedAexIds.clear();
  const duration = Math.floor(getElapsedMs(wo) / 1000);
  // Clean: bei Kraft leere Saetze entfernen, bei Cardio Eintrag nur behalten wenn Dauer ODER Distanz gesetzt
  const cleanEx = wo.exercises.map(ex => {
    if (isWoExCardio(ex)) return ex;
    return { ...ex, sets: (ex.sets || []).filter(s => s.weight || s.reps) };
  }).filter(ex => {
    if (isWoExCardio(ex)) {
      const cd = ex.cardio || {};
      return !!(cd.duration || cd.distance);
    }
    return (ex.sets || []).length > 0;
  });

  const prevWorkouts = DB.getWorkouts();
  const prs = detectPRs({ ...wo, exercises: cleanEx }, prevWorkouts);

  const finalWo = { ...wo, exercises: cleanEx, duration, endTs: Date.now(), prs };
  DB.addWorkout(finalWo);
  DB.clearActive();
  stopTimer();
  syncWorkoutActiveUI();

  closeModal('modal-finish');

  if (prs.length) showToast(`${prs.length} neuer PR! 🏆`);
  else showToast('Workout gespeichert! 💪');

  // Aktuellen Tab neu rendern — egal ob Workouts oder Übersicht, der Active-Mode endet sofort
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();

  // Drive-Sync: einziger automatischer Auslöser ist das Workout-Ende.
  // Bei dieser Gelegenheit landen ALLE aufgelaufenen lokalen Änderungen
  // (auch reine Plan-/Übungs-/Wochenplan-Änderungen seit dem letzten Sync) in der Cloud.
  if (driveIsEnabled()) driveTriggerSync('Workout beendet');
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
        syncWorkoutActiveUI();
        expandedAexIds.clear();   // Card-Collapse-State leeren — naechstes Workout startet sauber
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

// Per-Karte-Toggle Kraft/Cardio. Persistiert in localStorage, damit sich der Modus
// ueber App-Restart hinweg merkt.
let statsVolMode    = (CARDIO_ENABLED && localStorage.getItem('ft_stats_vol_mode')    === 'cardio') ? 'cardio' : 'strength';
let statsMuscleMode = (CARDIO_ENABLED && localStorage.getItem('ft_stats_muscle_mode') === 'cardio') ? 'cardio' : 'strength';
let statsPrMode     = (CARDIO_ENABLED && localStorage.getItem('ft_stats_pr_mode')     === 'cardio') ? 'cardio' : 'strength';

function _applyStatsToggleUI(group, mode) {
  document.querySelectorAll(`#${group}-pill-strength, #${group}-pill-cardio`).forEach(p => p.classList.remove('active'));
  const pill = document.getElementById(`${group}-pill-${mode}`);
  if (pill) pill.classList.add('active');
}

function setStatsVolMode(mode) {
  if (mode !== 'strength' && (mode !== 'cardio' || !CARDIO_ENABLED)) return;
  if (statsVolMode === mode) return;
  statsVolMode = mode;
  localStorage.setItem('ft_stats_vol_mode', mode);
  _applyStatsToggleUI('vol', mode);
  // Kg/Saetze-Toggle nur im Kraft-Modus sinnvoll
  const unitToggle = document.getElementById('vol-unit-toggle');
  if (unitToggle) unitToggle.style.display = (mode === 'cardio') ? 'none' : '';
  const titleEl = document.getElementById('vol-card-title');
  if (titleEl) titleEl.textContent = mode === 'cardio' ? 'Distanzentwicklung' : 'Volumenentwicklung';
  renderHomeStats();
}
function setStatsMuscleMode(mode) {
  if (mode !== 'strength' && (mode !== 'cardio' || !CARDIO_ENABLED)) return;
  if (statsMuscleMode === mode) return;
  statsMuscleMode = mode;
  localStorage.setItem('ft_stats_muscle_mode', mode);
  _applyStatsToggleUI('muscle', mode);
  const titleEl = document.getElementById('muscle-card-title');
  if (titleEl) titleEl.textContent = mode === 'cardio' ? 'Distanz pro Cardio-Einheit' : 'Volumen pro Muskelgruppe';
  renderHomeStats();
}
function setStatsPrMode(mode) {
  if (mode !== 'strength' && (mode !== 'cardio' || !CARDIO_ENABLED)) return;
  if (statsPrMode === mode) return;
  statsPrMode = mode;
  localStorage.setItem('ft_stats_pr_mode', mode);
  _applyStatsToggleUI('pr', mode);
  const titleEl = document.getElementById('pr-card-title');
  if (titleEl) titleEl.textContent = mode === 'cardio' ? 'Cardio-Bestleistungen' : 'PRs & Bestleistungen';
  renderHomeStats();
}

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
  renderHomeStats();
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

// Rendert die 3 Stats-Karten (Volumenentwicklung, Muskelgruppen-Volumen, PRs) in der Übersicht.
// Wird aus renderOverview aufgerufen — der frühere Verlauf-Tab existiert nicht mehr.
function renderHomeStats() {
  const allWs = DB.getWorkouts();
  const ws = filterWorkoutsByRange(allWs, histRangeDays);
  // Karten-Toggle-UI initial spiegeln (defensiv)
  _applyStatsToggleUI('vol',    statsVolMode);
  _applyStatsToggleUI('muscle', statsMuscleMode);
  _applyStatsToggleUI('pr',     statsPrMode);
  const unitToggle = document.getElementById('vol-unit-toggle');
  if (unitToggle) unitToggle.style.display = (statsVolMode === 'cardio') ? 'none' : '';

  // ── Karte 1: Volumen-/Distanzentwicklung ──
  if (statsVolMode === 'cardio') renderCardioDistanceChart(ws);
  else renderVolumeChart(ws);

  // ── Karte 2: Muskelgruppen / Cardio-Verteilung ──
  const volEl = document.getElementById('muscle-bars');
  if (volEl) {
    if (statsMuscleMode === 'cardio') {
      renderCardioPerExerciseBars(ws, volEl);
    } else if (ws.length) {
      const vol = calcMuscleVolume(ws);
      renderMuscleBars(vol, volEl);
    } else {
      volEl.innerHTML = '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
    }
  }

  // ── Karte 3: PR-Liste ──
  const prEl = document.getElementById('hist-pr-list');
  if (prEl) {
    if (statsPrMode === 'cardio') {
      const cprs = getAllCardioPRs();
      prEl.innerHTML = cprs.length
        ? cprs.slice(0,10).map((pr, idx) => cardioPrHTML(pr, idx+1)).join('')
        : '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Cardio-PRs</p>';
    } else {
      const prs = getAllPRs();
      prEl.innerHTML = prs.length
        ? prs.slice(0,10).map((pr, idx) => prHTML(pr, idx+1)).join('')
        : '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine PRs</p>';
    }
  }
}

// ── Karte 1 (Cardio): Distanz pro Woche als Bar-Chart, ISO-KW ──
function renderCardioDistanceChart(ws) {
  if (volumeChart) { volumeChart.destroy(); volumeChart = null; }
  const canvas = document.getElementById('volume-chart');
  if (!canvas) return;
  // Aggregiere Distanz pro ISO-Kalenderwoche
  const weekMap = {};
  let any = false;
  ws.forEach(w => {
    (w.exercises || []).forEach(we => {
      if (!isWoExCardio(we)) return;
      const dist = parseFloat(we.cardio && we.cardio.distance);
      if (!(dist > 0)) return;
      const d = new Date(w.startTs);
      const key = `W${getISOWeek(d)}`;
      weekMap[key] = (weekMap[key] || 0) + dist;
      any = true;
    });
  });
  const ctx = canvas.getContext('2d');
  if (!any) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  const sortedKeys = Object.keys(weekMap).slice(-8);
  const lastIdx = sortedKeys.length - 1;
  const cardioCol = (getComputedStyle(document.documentElement).getPropertyValue('--cardio').trim()) || '#14B8A6';
  const cardioRGB = (() => {
    const h = cardioCol.replace('#','');
    if (h.length !== 6) return '20,184,166';
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)].join(',');
  })();
  volumeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedKeys,
      datasets: [{
        data: sortedKeys.map(k => Math.round((weekMap[k] || 0) * 10) / 10),
        backgroundColor: `rgba(${cardioRGB},0.85)`,
        borderColor: cardioCol,
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 500 },
      // Top-Padding fuer das Last-Bar-Label-Plugin
      layout: { padding: { top: 28 } },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true, callbacks: { label: c => `${c.raw} km` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          grace: '10%',
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
          ticks: { callback: v => `${v}` , font:{size:11} }
        },
        x: { grid: { display: false }, ticks: { font:{size:11} } }
      }
    },
    plugins: [{
      id:'lastBarLabel',
      afterDatasetsDraw(chart) {
        const ds = chart.data.datasets[0];
        if (!ds || !ds.data.length) return;
        const meta = chart.getDatasetMeta(0);
        const last = meta.data[lastIdx];
        if (!last) return;
        const txt = `${ds.data[lastIdx]} km`;
        const c = chart.ctx;
        c.save();
        c.font = '600 12px -apple-system, sans-serif';
        const w = c.measureText(txt).width + 14;
        const h = 22;
        const x = last.x - w/2;
        const y = last.y - h - 6;
        c.fillStyle = cardioCol;
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

// ── Karte 2 (Cardio): Distanz pro Cardio-Uebung im Range, als horizontale Balken ──
function renderCardioPerExerciseBars(ws, container) {
  const totals = {}; // exId → { name, dist }
  ws.forEach(w => {
    (w.exercises || []).forEach(we => {
      if (!isWoExCardio(we)) return;
      const id = we.exId || we.id;
      const dist = parseFloat(we.cardio && we.cardio.distance);
      if (!(dist > 0)) return;
      if (!totals[id]) totals[id] = { name: we.name || (getEx(id) && getEx(id).name) || id, dist: 0 };
      totals[id].dist += dist;
    });
  });
  const arr = Object.values(totals).sort((a,b) => b.dist - a.dist);
  if (!arr.length) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Cardio-Daten</p>';
    return;
  }
  const maxDist = Math.max(1, ...arr.map(a => a.dist));
  container.innerHTML = arr.map(it => {
    const pct = Math.round(it.dist / maxDist * 100);
    return `<div class="muscle-bar-v2-row" style="--mc:var(--cardio);--mc-bg:var(--cardio-bg)">
      <div class="muscle-icon-wrap" style="background:var(--cardio-bg);color:var(--cardio);display:flex;align-items:center;justify-content:center;font-weight:700">🏃</div>
      <span class="muscle-bar-v2-name">${it.name}</span>
      <div class="muscle-bar-v2-bar"><div class="muscle-bar-v2-fill" style="width:${pct}%"></div></div>
      <span class="muscle-bar-v2-val">${formatDistance(it.dist)}</span>
    </div>`;
  }).join('');
}

// ── Karte 3 (Cardio): PR-Liste fuer alle Cardio-Uebungen ──
function getAllCardioPRs() {
  const exs = DB.getExercises().filter(e => exType(e) === 'cardio');
  const out = [];
  exs.forEach(ex => {
    const pr = getCardioPR(ex.id);
    if (!pr || (pr.longestDist == null && pr.fastestPace == null)) return;
    out.push({ exId: ex.id, name: ex.name, longestDist: pr.longestDist || 0, fastestPace: pr.fastestPace || null });
  });
  out.sort((a,b) => (b.longestDist || 0) - (a.longestDist || 0));
  return out;
}

function cardioPrHTML(pr, number) {
  const distStr = pr.longestDist ? formatDistance(pr.longestDist) : '–';
  const paceStr = pr.fastestPace ? `${formatPace(pr.fastestPace, 1)}/km` : '';
  return `<div class="pr-v2-row" style="--mc:var(--cardio);--mc-bg:var(--cardio-bg)" onclick="showHistDetailForEx('${pr.exId}')">
    <div class="pr-v2-icon" style="background:var(--cardio-bg);color:var(--cardio);display:flex;align-items:center;justify-content:center;font-weight:700">🏃</div>
    <div class="pr-v2-num">${number}</div>
    <div>
      <div class="pr-v2-name">${pr.name}</div>
      <div class="pr-v2-sub">${paceStr || 'Beste Distanz'}</div>
    </div>
    <div class="pr-v2-val" style="color:var(--cardio)">${distStr}</div>
    <span class="pr-v2-arrow">›</span>
  </div>`;
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
    const val = volumeUnit === 'kg'
      ? calcVolume(w)
      : w.exercises.reduce((a,e) => a + (Array.isArray(e.sets) ? e.sets.length : 0), 0);
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
      // Top-Padding gibt dem Custom-Label-Plugin (lastPointLabel) Platz, damit das Badge
      // ueber dem letzten Punkt nicht am oberen Chart-Rand abgeschnitten wird.
      layout: { padding: { top: 28 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: { label: c => isKg ? (fmtNum(c.raw)+' kg') : (c.raw+' Sätze') }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          // Reserve ~10% ueber dem Max-Wert, damit der letzte Punkt nicht direkt am Top liegt
          grace: '10%',
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
          ticks: { callback: v => isKg ? (fmtNum(v)+'k') : v, font:{size:11} }
        },
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
    return `<div class="muscle-bar-v2-row no-icon" style="--mc:${muscleColor(m)};--mc-bg:${muscleBg(m)}">
      <span class="muscle-bar-v2-name">${muscleName(m)}</span>
      <div class="muscle-bar-v2-bar"><div class="muscle-bar-v2-fill" style="width:${pct}%"></div></div>
      <span class="muscle-bar-v2-val">${fmtNum(v)} kg</span>
    </div>`;
  }).filter(Boolean).join('');
  container.innerHTML = html || '<p style="font-size:13px;color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
}

function getAllPRs() {
  const ws = DB.getWorkouts();
  // For each exercise, collect all max-weights per workout (Kraft only — Cardio hat eigene PRs)
  const histMap = {};
  ws.forEach(w => {
    w.exercises.forEach(ex => {
      if (isWoExCardio(ex) || !Array.isArray(ex.sets)) return;
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
  return `<div class="pr-v2-row no-icon" style="--mc:${valColor};--mc-bg:${muscleBg(muscleKey)}" onclick="showHistDetailForEx('${pr.exId}')">
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

  // PR-Marker pro Uebung (Kraft: gewichtsbasiert; Cardio: distance/pace).
  const prByExId = {};
  (w.prs || []).forEach(p => { prByExId[p.exId] = p; });

  const blocks = (w.exercises || []).map(ex => {
    const id = ex.exId || ex.id;
    const pr = prByExId[id];
    if (isWoExCardio(ex)) {
      const cd = ex.cardio || {};
      const durSec = parseInt(cd.duration, 10) || 0;
      const dist = parseFloat(cd.distance) || 0;
      const hasPace = durSec > 0 && dist > 0;
      const paceStr = hasPace ? `${formatPace(durSec, dist)} min/km` : '—';
      const prChip = pr
        ? `<span class="hist-pr-chip" title="${pr.isDistPR ? 'Distanz-PR ' : ''}${pr.isPacePR ? 'Pace-PR' : ''}" style="background:var(--cardio-bg);color:var(--cardio);padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;margin-left:8px">🏆 PR</span>`
        : '';
      return `<div class="hist-ex-block" style="border-left:3px solid var(--cardio);padding-left:10px">
        <div class="hist-ex-title">🏃 ${ex.name}${prChip}</div>
        <div class="hist-set-row"><span>Dauer:</span><span>${durSec > 0 ? formatDuration(durSec) : '–'}</span></div>
        <div class="hist-set-row"><span>Distanz:</span><span>${dist > 0 ? formatDistance(dist) : '–'}</span></div>
        <div class="hist-set-row"><span>Pace:</span><span>${paceStr}</span></div>
        ${(cd.notes || ex.notes) ? `<div style="font-size:12px;color:var(--text3);margin-top:4px">📝 ${cd.notes || ex.notes}</div>` : ''}
      </div>`;
    }
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    const setsStr = sets.map((s,si) => `<div class="hist-set-row"><span>Satz ${si+1}:</span><span>${s.weight||'–'} kg × ${s.reps||'–'} Wdh.</span></div>`).join('');
    const prChip = pr
      ? `<span class="hist-pr-chip" style="background:var(--accent-bg);color:var(--accent);padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;margin-left:8px">🏆 PR ${pr.weight} kg</span>`
      : '';
    return `<div class="hist-ex-block"><div class="hist-ex-title">${ex.name}${prChip}</div>${setsStr}${ex.notes?`<div style="font-size:12px;color:var(--text3);margin-top:4px">📝 ${ex.notes}</div>`:''}</div>`;
  }).join('');

  document.getElementById('hist-detail-body').innerHTML =
    `<p style="color:var(--text3);font-size:13px;margin-bottom:14px">Dauer: ${fmtDur(w.duration)} • ${w.exercises.length} Übung${w.exercises.length===1?'':'en'}</p>` +
    blocks +
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
        if (currentScreen === 'overview') renderOverview();
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
  // Trainingstage-Liste wird jetzt im Plan-Detail-Screen gerendert, nicht mehr im Mehr-Tab.
  if (currentScreen === 'plan-detail') renderPlanDetail();
  else if (currentScreen === 'mehr') renderMehr();
}

function renderMehr() {
  // Mehr-Tab enthält jetzt nur noch Cloud-Sync + Daten&Sicherheit.
  // Trainingsplan-Daten/Wochenplan/Trainingstage sind in den Plan-Detail-Screen umgezogen.
  if (typeof renderDriveStatus === 'function') renderDriveStatus();
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

function fmtDateRange(start, end) {
  const fmt = (ts) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
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

  const todayIdx = (new Date().getDay()+6) % 7;
  const renderRow = (p) => {
    const status = planStatus(p);
    const isCurrent = status === 'active';
    // Wochenplan-Strip: pro Wochentag der zugewiesene Trainingstag als Pille (zentriert).
    const days = resolvePlanDays(p);
    const byId = {}; days.forEach(d => { byId[d.id] = d; });
    const wp = (p.weekPlan && p.weekPlan.length) ? p.weekPlan : DEFAULT_WEEKPLAN;
    const strip = wp.map((w, i) => {
      const d = w.planDayId ? byId[w.planDayId] : null;
      const today = isCurrent && i === todayIdx;
      return `<div class="ppv-col${today ? ' today' : ''}">
        <div class="ppv-wd">${w.label}</div>
        ${d ? `<span class="pd-name ppv-pill">${escapeHtml(d.name)}</span>` : '<span class="ppv-rest">–</span>'}
      </div>`;
    }).join('');
    // Fortschritt + Adhärenz nur für den aktiven Plan (laufende Woche existiert nur dort).
    let progress = '';
    if (isCurrent) {
      const pw = _planProgramWeek(p);
      const ws = getWeekStatus();
      const pct = Math.round(pw.num / (pw.total || 1) * 100);
      progress = `<div class="ppv-progress">
        <span class="ppv-wk">Woche ${pw.num} / ${pw.total}</span>
        <div class="ppv-bar"><div class="ppv-bar-fill" style="width:${Math.min(100,pct)}%"></div></div>
        <span class="ppv-adh">${ws.done}/${ws.planned} diese Woche</span>
      </div>`;
    }
    return `<div class="plan-card-v2 plan-status-${status}${isCurrent ? ' active' : ''}" onclick="openPlanDetail('${p.id}')">
      <div class="ppv-head">
        <div class="ppv-name">${escapeHtml(p.name)}</div>
        <span class="plan-status-chip plan-status-chip-${status}">${PLAN_STATUS_LABEL[status]}</span>
      </div>
      <div class="ppv-meta">${fmtDateRange(p.startDate, p.endDate)} · ${p.weeksTotal} Wochen</div>
      ${progress}
      <div class="ppv-strip">${strip}</div>
    </div>`;
  };

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
  document.getElementById('mehr-weekplan').innerHTML = wp.map((d, i) => {
    // Tippen zum Zuweisen: ganze Zeile öffnet den Wochentag-Picker (statt Dropdown).
    const assigned = d.planDayId ? trainingDays.find(td => td.id === d.planDayId) : null;
    const valCls = assigned ? 'weekplan-pick-value' : 'weekplan-pick-value rest';
    const valTxt = assigned ? escapeHtml(assigned.name) : 'Ruhetag';
    return `<div class="weekplan-row weekplan-row-tap" onclick="openWeekdayPicker(${i})">
      <span class="weekplan-day-name ${i===todayIdx?'today':''}">${d.label}</span>
      <span class="${valCls}">${valTxt}</span>
      <span class="weekplan-pick-chev">›</span>
    </div>`;
  }).join('');

  // Trainingstage-Liste mit aktiv/inaktiv-Split (analog zu altem renderMehr)
  const dayLabelsFor = {};
  const earliestDayIdx = {};
  wp.forEach((w, idx) => {
    if (w.planDayId) {
      if (!dayLabelsFor[w.planDayId]) { dayLabelsFor[w.planDayId] = []; earliestDayIdx[w.planDayId] = idx; }
      dayLabelsFor[w.planDayId].push(w.label);
    }
  });
  const renderDayRow = (d, i, isActive) => {
    const setCount = d.exercises.reduce((a,e) => a+e.targetSets, 0);
    const usedOn = dayLabelsFor[d.id] || [];
    const chips = usedOn.length
      ? `<div class="pdr-days">${usedOn.map(lbl => `<span class="pdr-day-chip">${lbl}</span>`).join('')}</div>` : '';
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
  const activeBucket = [], inactiveRows = [];
  trainingDays.forEach((d, i) => {
    if (dayLabelsFor[d.id]) activeBucket.push({ sortIdx: earliestDayIdx[d.id], html: renderDayRow(d, i, true) });
    else inactiveRows.push(renderDayRow(d, i, false));
  });
  activeBucket.sort((a, b) => a.sortIdx - b.sortIdx);
  const activeRows = activeBucket.map(r => r.html);
  let listHtml;
  if (activeRows.length === 0) {
    listHtml = inactiveRows.length
      ? inactiveRows.join('')
      : '<div class="plan-day-empty">Noch keine Trainingstage erstellt</div>';
  } else if (inactiveRows.length === 0) {
    listHtml = activeRows.join('');
  } else {
    const expanded = mehrInactivePlanExpanded;
    listHtml = activeRows.join('') +
      `<div class="plan-day-collapse-header${expanded ? ' expanded' : ''}" onclick="toggleMehrInactivePlans()">
         <span class="plan-day-collapse-arrow">${expanded ? '▾' : '▸'}</span>
         <span class="plan-day-collapse-label">Andere Trainingstage</span>
         <span class="plan-day-collapse-count">${inactiveRows.length}</span>
       </div>` + (expanded ? inactiveRows.join('') : '');
  }
  document.getElementById('mehr-plan-list').innerHTML = listHtml;

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
    `"${plan.name}" und alle zugehörigen Trainingstage werden unwiderruflich gelöscht. Bereits absolvierte Workouts bleiben im Verlauf erhalten.`,
    () => {
      const ps = DB.getPlans().filter(p => p.id !== editingPlanId);
      DB.savePlans(ps);
      editingPlanId = null;
      showScreen('plans');
      showToast('Trainingsplan gelöscht');
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

const WEEKDAYS = [
  { key:'mon', label:'Montag' }, { key:'tue', label:'Dienstag' }, { key:'wed', label:'Mittwoch' },
  { key:'thu', label:'Donnerstag' }, { key:'fri', label:'Freitag' }, { key:'sat', label:'Samstag' }, { key:'sun', label:'Sonntag' },
];

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
  if (plansViewMode === 'days') {
    if (plansList) plansList.style.display = 'none';
    if (daysList) daysList.style.display = '';
    if (h1) h1.textContent = 'Trainingstage';
    renderLibDays();
  } else {
    if (plansList) plansList.style.display = '';
    if (daysList) daysList.style.display = 'none';
    if (h1) h1.textContent = 'Trainingsplan';
    renderPlans();
  }
}

function toggleLibDaysArchive() { libDaysArchiveExpanded = !libDaysArchiveExpanded; renderLibDays(); }

function renderLibDays() {
  const days = DB.getTrainingDays();
  const active = days.filter(d => !d.archived).sort((a,b) => (a.createdAt||0) - (b.createdAt||0));
  const archived = days.filter(d => d.archived).sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
  const subEl = document.getElementById('plans-subline');
  if (subEl) subEl.textContent = days.length
    ? `${active.length} Trainingstag${active.length===1?'':'e'}${archived.length ? ` • ${archived.length} archiviert` : ''}`
    : 'Noch keine Trainingstage erstellt';
  const renderRow = (d) => {
    const setCount = (d.exercises||[]).reduce((a,e) => a + (e.targetSets||0), 0);
    return `<div class="plan-list-row" onclick="openLibDayDetail('${d.id}')">
      <div class="plan-list-info">
        <div class="plan-list-name"><span class="pd-name">${escapeHtml(d.name)}</span></div>
        <div class="plan-list-meta">${(d.exercises||[]).length} Übungen • ${setCount} Sätze</div>
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

function openLibDayDetail(id) { editingLibDayId = id; showScreen('day-detail'); }
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
  if (addWrap) addWrap.style.display = '';
  if ((day.exercises || []).length) {
    renderPreviewWorkout(day, 'libday', 'day-ex-list');
  } else {
    document.getElementById('day-ex-list').innerHTML =
      `<div class="plan-day-empty" style="color:rgba(255,255,255,0.85);background:transparent;margin:0 14px">Noch keine Übungen — tippe unten auf „+ Übung zum Trainingstag hinzufügen".</div>`;
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
      const days = DB.getTrainingDays().filter(x => x.id !== editingLibDayId);
      DB.saveTrainingDays(days);
      editingLibDayId = null;
      showScreen('plans');
      showToast('Trainingstag gelöscht');
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

// Entfernt eine Übung aus dem aktuell bearbeiteten Bibliotheks-Trainingstag.
function removeLibDayExercise(ei) {
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === editingLibDayId);
  if (!day || !day.exercises || !day.exercises[ei]) return;
  day.exercises.splice(ei, 1);
  DB.saveTrainingDays(days);
  renderLibDayDetail();
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
let _weekdayPickIdx = null;
function openWeekdayPicker(i) {
  _weekdayPickIdx = i;
  const plan = _resolveEditPlan();
  const days = plan ? resolvePlanDays(plan) : [];
  const wp = (plan && plan.weekPlan) || [];
  const cur = wp[i] ? wp[i].planDayId : null;
  const label = wp[i] ? wp[i].label : '';
  const titleEl = document.getElementById('weekday-pick-title');
  if (titleEl) titleEl.textContent = `${label}: Trainingstag wählen`;
  const restRow = `<div class="day-pick-row ${!cur ? 'in-day' : 'not-in-day'}" onclick="pickWeekday('')">
      <div class="day-pick-info"><div class="day-pick-name">Ruhetag</div></div>
      <div class="day-pick-actions">${!cur ? '<span class="day-pick-icon done">✓</span>' : '<span class="day-pick-icon">+</span>'}</div>
    </div>`;
  const dayRows = days.map(d => {
    const sel = cur === d.id;
    const setCount = (d.exercises || []).reduce((a,e) => a + (e.targetSets || 0), 0);
    return `<div class="day-pick-row ${sel ? 'in-day' : 'not-in-day'}" onclick="pickWeekday('${d.id}')">
      <div class="day-pick-info">
        <div class="day-pick-name">${escapeHtml(d.name)}</div>
        <div class="day-pick-sub">${(d.exercises || []).length} Übungen · ${setCount} Sätze</div>
      </div>
      <div class="day-pick-actions">${sel ? '<span class="day-pick-icon done">✓</span>' : '<span class="day-pick-icon">+</span>'}</div>
    </div>`;
  }).join('');
  const empty = days.length ? '' : '<p style="color:var(--text3);text-align:center;padding:16px 8px;font-size:13px">Noch keine Trainingstage in diesem Plan. Lege unten welche an.</p>';
  document.getElementById('weekday-pick-list').innerHTML = restRow + dayRows + empty;
  openModal('modal-weekday-pick');
}
function pickWeekday(dayId) {
  if (_weekdayPickIdx === null) return;
  saveWeekPlanDay(_weekdayPickIdx, dayId || '');
  closeModal('modal-weekday-pick');
  _weekdayPickIdx = null;
}

function openPlanDayModal(idx) {
  editingDayIdx = idx;
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
let exSortMode = 'muscle';   // 'muscle' | 'plan' — im Cardio-Modus = 'alpha' | 'plan'
let exMode = (CARDIO_ENABLED && localStorage.getItem('ft_ex_mode') === 'cardio') ? 'cardio' : 'strength'; // 'strength' | 'cardio'
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

function setExMode(mode) {
  if (mode !== 'strength' && (mode !== 'cardio' || !CARDIO_ENABLED)) return;
  if (exMode === mode) return;
  exMode = mode;
  localStorage.setItem('ft_ex_mode', mode);
  openExerciseId = null;
  // Toggle-Pill-Highlight aktualisieren
  document.querySelectorAll('.ex-mode-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.querySelector(`.ex-mode-pill.mode-${mode}`);
  if (activePill) activePill.classList.add('active');
  renderExercises();
}

function toggleExGroup(key) {
  if (collapsedExGroups.has(key)) collapsedExGroups.delete(key);
  else collapsedExGroups.add(key);
  renderExercises();
}

// Gruppen-Keys der aktuell sichtbaren Übungen-Ansicht (Muskelgruppen bzw. Plan-Tage).
// Cardio-Flachliste hat keine Gruppen → leeres Array.
function _currentExGroupKeys() {
  if (exSortMode === 'plan') {
    const active = getActivePlan();
    return (active ? active.trainingDays : []).map(d => 'plan:' + d.id);
  }
  if (exMode === 'strength') return MUSCLE_ORDER.map(m => 'muscle:' + m);
  return [];
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

// Cardio-Stats-Helpers: ueber alle Workouts iterieren, Cardio-Eintraege fuer diese Uebung sammeln.
function getCardioHistoryForEx(exId) {
  const ws = DB.getWorkouts();
  const out = [];
  ws.forEach(w => {
    (w.exercises || []).forEach(we => {
      const id = we.exId || we.id;
      if (id !== exId) return;
      if (!isWoExCardio(we)) return;
      const cd = we.cardio || {};
      if (!cd.duration || !cd.distance) return; // unvollstaendige Eintraege ignorieren
      const pace = calcPace(cd.duration, cd.distance);
      out.push({
        date: w.endTs || w.startTs,
        duration: cd.duration,
        distance: cd.distance,
        notes: cd.notes || '',
        secPerKm: pace ? pace.secPerKm : null,
      });
    });
  });
  return out.sort((a,b) => (b.date||0) - (a.date||0));
}
// Cardio-PRs pro Uebung: laengste Distanz + schnellste Pace (Pace nur ab >=1km Distanz).
function getCardioPR(exId) {
  const hist = getCardioHistoryForEx(exId);
  if (!hist.length) return null;
  let longestDist = null, fastestPace = null;
  hist.forEach(h => {
    if (longestDist == null || h.distance > longestDist) longestDist = h.distance;
    if (h.distance >= 1 && h.secPerKm && (fastestPace == null || h.secPerKm < fastestPace)) {
      fastestPace = h.secPerKm;
    }
  });
  return { longestDist, fastestPace };
}
function getLastCardio(exId) {
  const hist = getCardioHistoryForEx(exId);
  return hist[0] || null;
}

// "Im aktuellen Plan"-Logik: sucht IMMER im aktiven Plan (per Datum), nie im Edit-Kontext.
// Wenn der User gerade einen neuen Plan editiert, soll der Übungen-Tab trotzdem zeigen,
// in welchen Trainingstagen des AKTIVEN Plans (= heute laufender Plan) eine Übung verwendet wird.
function getPlanDaysUsingExercise(exId) {
  const active = getActivePlan();
  if (!active) return [];
  return active.trainingDays.filter(d => d.exercises.some(e => e.exId === exId));
}

function toggleExSortMode() {
  exSortMode = exSortMode === 'muscle' ? 'plan' : 'muscle';
  const btn = document.getElementById('ex-sort-btn');
  if (btn) btn.dataset.mode = exSortMode;
  renderExercises();
}

function buildExItemHTML(ex, context) {
  if (exType(ex) === 'cardio') return buildExItemCardioHTML(ex, context);
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

function buildExItemCardioHTML(ex, context) {
  const uniqueKey = (context && context.dayId) ? `${context.dayId}__${ex.id}` : ex.id;
  const isOpen = uniqueKey === openExerciseId;
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
  const pr = getCardioPR(ex.id);
  const last = getLastCardio(ex.id);
  const longestVal = pr && pr.longestDist != null
    ? `<div class="ex-stat-val">${formatDistance(pr.longestDist)}</div>`
    : `<div class="ex-stat-val muted">Noch keine</div>`;
  const paceVal = pr && pr.fastestPace != null
    ? `<div class="ex-stat-val">${formatPace(pr.fastestPace, 1)}</div>`
    : `<div class="ex-stat-val muted">Noch keine</div>`;
  let lastVal;
  if (last) {
    const dateStr = new Date(last.date).toLocaleDateString('de-DE',
      { day:'numeric', month:'long', year:'2-digit' });
    lastVal = `<div class="ex-stat-val">${formatDistance(last.distance)} in ${formatDuration(last.duration)}<span class="date">· ${dateStr}</span></div>`;
  } else {
    lastVal = `<div class="ex-stat-val muted">Noch keine</div>`;
  }
  const statsBlock = `<div class="ex-item-stats">
    <div class="ex-stat ex-stat-pr">
      <div class="ex-stat-key">Längste Distanz</div>
      ${longestVal}
    </div>
    <div class="ex-stat ex-stat-pr">
      <div class="ex-stat-key">Schnellste Pace</div>
      ${paceVal}
    </div>
    <div class="ex-stat ex-stat-last">
      <div class="ex-stat-key">Letzte Ausführung</div>
      ${lastVal}
    </div>
  </div>`;
  // --mc fuer den linken Stripe + Name-Farbe ist die Cardio-Akzentfarbe
  return `<div class="ex-item ${isOpen?'open':''}" id="ex-item-${uniqueKey}" style="--mc:var(--cardio)">
    <div class="ex-item-head" onclick="toggleExItem('${uniqueKey}')">
      <div class="ex-item-stripe"></div>
      <div class="ex-item-name">${ex.name}</div>
      ${planTag}
      <span class="ex-item-chev">▾</span>
    </div>
    <div class="ex-item-body">
      ${statsBlock}
      <div class="ex-item-body-label">Notizen</div>
      <textarea class="ex-notes-area" placeholder="z. B. Strecke, Wetter, Schuhe…"
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
  // Alle-ein/ausklappen-Button: nur bei gruppierter Ansicht zeigen, Icon nach Zustand
  const collBtn = document.getElementById('ex-collapse-all-btn');
  if (collBtn) {
    const keys = _currentExGroupKeys();
    collBtn.style.display = keys.length ? '' : 'none';
    collBtn.dataset.state = (keys.length && keys.every(k => collapsedExGroups.has(k))) ? 'collapsed' : 'expanded';
  }
  // Toggle-Pill state spiegeln (defensiv, falls vor initialem Render gerufen)
  document.querySelectorAll('.ex-mode-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.querySelector(`.ex-mode-pill.mode-${exMode}`);
  if (activePill) activePill.classList.add('active');

  const subEl = document.getElementById('ex-subline');
  if (subEl) {
    if (exMode === 'cardio') {
      subEl.textContent = exSortMode === 'plan'
        ? 'Cardio-Einheiten sortiert nach Trainingstagen'
        : 'Cardio-Einheiten alphabetisch';
    } else {
      subEl.textContent = exSortMode === 'plan'
        ? 'Übungskatalog sortiert nach Trainingstagen'
        : 'Übungskatalog sortiert nach Muskelgruppen';
    }
  }
  if (exSortMode === 'plan') {
    renderExercisesByPlan();
  } else if (exMode === 'cardio') {
    renderExercisesCardioFlat();
  } else {
    renderExercisesByMuscle();
  }
}

// Cardio-Modus, Sort='muscle': flache alphabetische Liste, keine Muskelgruppen.
function renderExercisesCardioFlat() {
  const exs = DB.getExercises().filter(e => exType(e) === 'cardio').filter(_exMatchesSearch);
  exs.sort((a,b) => a.name.localeCompare(b.name, 'de'));
  if (!exs.length) {
    document.getElementById('exercises-groups').innerHTML = exCatalogSearch
      ? '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Keine Treffer.</p>'
      : '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Noch keine Cardio-Einheiten vorhanden. Füge eine neue hinzu.</p>';
    return;
  }
  const itemsHTML = exs.map(ex => buildExItemHTML(ex)).join('');
  // Eine virtuelle Gruppe ohne Gruppen-Header, damit das CSS-Layout (ex-list) gleich bleibt
  document.getElementById('exercises-groups').innerHTML =
    `<div class="ex-group" style="--mc:var(--cardio)"><div class="ex-list">${itemsHTML}</div></div>`;
}

function renderExercisesByPlan() {
  // Immer der AKTIVE Plan (per Datum) — kein Edit-Kontext (editingPlanId) und kein
  // DEFAULT_PLAN-Fallback. Konsistent mit "Im Plan"/"Verwendet in" (getActivePlan).
  // Ohne aktiven Plan: leer (statt der fest einprogrammierten Default-Tage).
  const active = getActivePlan();
  const plan = active ? active.trainingDays : [];
  const exMap = {};
  DB.getExercises().forEach(e => exMap[e.id] = e);

  const groupsHTML = plan.map(day => {
    // Plan-Reihenfolge beibehalten; Übungen die im Plan stehen aber nicht mehr existieren überspringen.
    // Nach exMode filtern (Kraft-Modus zeigt nur strength-Eintraege, Cardio-Modus nur cardio).
    const items = day.exercises.map(pe => exMap[pe.exId])
      .filter(Boolean)
      .filter(ex => exType(ex) === exMode)
      .filter(_exMatchesSearch);
    if (!items.length) return '';
    const itemsHTML = items.map(ex => buildExItemHTML(ex, { dayId: day.id })).join('');
    const isCollapsed = !exCatalogSearch && collapsedExGroups.has('plan:' + day.id);
    return `<div class="ex-group${isCollapsed ? ' collapsed' : ''}">
      <div class="ex-group-title" onclick="toggleExGroup('plan:${day.id}')">
        <span class="dot" style="background:rgba(255,255,255,0.7)"></span>
        ${pd(day.name)}
        <span class="count">(${items.length})</span>
        <span class="ex-group-arrow">${isCollapsed ? '▸' : '▾'}</span>
      </div>
      <div class="ex-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  document.getElementById('exercises-groups').innerHTML = groupsHTML || (exCatalogSearch
    ? '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Keine Treffer.</p>'
    : '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Noch keine Trainingstage mit Übungen vorhanden.</p>');
}

function renderExercisesByMuscle() {
  // Im Cardio-Modus wuerde diese Funktion gar nicht erst aufgerufen werden
  // (renderExercises() routet zu renderExercisesCardioFlat). Defensiv filtern wir aber trotzdem.
  const exs = DB.getExercises().filter(e => exType(e) === 'strength').filter(_exMatchesSearch);
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

  document.getElementById('exercises-groups').innerHTML = groupsHTML || (exCatalogSearch
    ? '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Keine Treffer.</p>'
    : '<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">Keine Übungen vorhanden. Füge eine neue Übung hinzu.</p>');
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
  newExType = exType(ex);
  document.getElementById('new-ex-name').value = ex.name;
  if (newExType === 'strength') {
    document.getElementById('new-ex-muscle').value = ex.muscle || 'chest';
  }
  document.querySelector('#modal-new-ex .sheet-title').textContent =
    newExType === 'cardio' ? 'Cardio-Einheit bearbeiten' : 'Übung bearbeiten';
  _applyNewExModalTypeUI();
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
  const isCardio = exType(exerciseToAddId) === 'cardio';
  plan[dayIdx].exercises.push(isCardio
    ? { exId: exerciseToAddId }
    : { exId: exerciseToAddId, targetSets: 3, targetReps: 8 });
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
        const isCardio = exType(exId) === 'cardio';
        plan.push({ id, name, color: null, exercises: [isCardio ? { exId } : { exId, targetSets: 3, targetReps: 8 }] });
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
  // Layout wie das „Übungen zum Plan hinzufügen"-Modal: Muskelfarben-Streifen + Name,
  // ohne Sätze×Wdh.-Felder (Ziele werden im Trainingstag-Detail/Vorschau editiert).
  // Reihenfolge = Tag-Reihenfolge; Drag-Sortierung + ✕-Entfernen bleiben erhalten.
  const html = day.exercises.map((pe, i) => {
    const ex = getEx(pe.exId);
    if (!ex) return '';
    if (!CARDIO_ENABLED && exType(ex) === 'cardio') return '';   // Cardio ausgeblendet
    const col = exType(ex) === 'cardio' ? 'var(--cardio)' : muscleColor(ex.muscle);
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

function updatePlanTarget(exIdx, field, value) {
  const plan = DB.getPlan();
  plan[editingDayIdx].exercises[exIdx][field] = parseInt(value) || 1;
  DB.savePlan(plan);
  syncActiveWorkoutWithPlanDay(plan[editingDayIdx].id);
  _renderAfterPlanEdit();
}

function removePlanEx(exIdx) {
  const plan = DB.getPlan();
  if (!plan[editingDayIdx] || !plan[editingDayIdx].exercises[exIdx]) return;
  const dayId = plan[editingDayIdx].id;
  const exId = plan[editingDayIdx].exercises[exIdx].exId;
  confirmActiveWorkoutDataLoss(dayId, [exId], () => {
    const p = DB.getPlan();
    p[editingDayIdx].exercises.splice(exIdx, 1);
    DB.savePlan(p);
    syncActiveWorkoutWithPlanDay(p[editingDayIdx].id);
    renderPlanDayExList(p[editingDayIdx]);
    _renderAfterPlanEdit();
  });
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
// Plan-Add-Sheet kann Kraft oder Cardio listen — analog zum Add-to-Workout-Modal.
// Beim Oeffnen vom Uebungen-Tab-Modus (exMode) initialisiert, danach lokal toggle-bar.
let planAddMode = 'strength'; // 'strength' | 'cardio'

function setPlanAddMode(mode) {
  if (mode !== 'strength' && (mode !== 'cardio' || !CARDIO_ENABLED)) return;
  if (planAddMode === mode) return;
  planAddMode = mode;
  document.querySelectorAll('#modal-add-to-plan .ex-mode-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`plan-add-pill-${mode}`);
  if (activePill) activePill.classList.add('active');
  renderPlanAddList(document.getElementById('plan-add-search').value || '');
}

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
  // Initialer Modus: wenn der User im Uebungen-Tab gerade Cardio anschaut, dort starten
  planAddMode = (exMode === 'cardio') ? 'cardio' : 'strength';
  document.querySelectorAll('#modal-add-to-plan .ex-mode-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`plan-add-pill-${planAddMode}`);
  if (activePill) activePill.classList.add('active');
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
      const isCardio = exType(exId) === 'cardio';
      day.exercises.push(isCardio ? { exId } : { exId, targetSets: 3, targetReps: 8 });
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

  // Cardio-Modus: flache alphabetische Liste, keine Muskelgruppen
  if (planAddMode === 'cardio') {
    const cardios = exs
      .filter(e => exType(e) === 'cardio')
      .filter(e => !query || e.name.toLowerCase().includes(query))
      .sort((a,b) => a.name.localeCompare(b.name, 'de'));
    if (!cardios.length) {
      document.getElementById('plan-add-list').innerHTML =
        '<p style="color:var(--text3);text-align:center;padding:20px">Keine Cardio-Einheit gefunden</p>';
      return;
    }
    const c = 'var(--cardio)';
    const itemsHTML = cardios.map(ex => {
      const usingDays = getPlanDaysUsingExercise(ex.id);
      const planTag = usingDays.length
        ? '<span class="ex-item-plan-tag">Im aktuellen Plan</span>'
        : '';
      const inCurrent = existing.has(ex.id);
      const selected = planAddSelection.has(ex.id);
      const cls = `ex-item${inCurrent ? ' in-current-day' : ''}`;
      const checkCls = inCurrent ? 'in-day' : (selected ? 'checked' : '');
      const onclickAttr = inCurrent ? '' : `onclick="togglePlanAddSelection('${ex.id}')"`;
      return `<div class="${cls}" style="--mc:${c}" ${onclickAttr}>
        <div class="ex-item-head">
          <div class="ex-item-stripe"></div>
          <div class="ex-item-name">${ex.name}</div>
          ${planTag}
          <span class="plan-add-check ${checkCls}">✓</span>
        </div>
      </div>`;
    }).join('');
    document.getElementById('plan-add-list').innerHTML =
      `<div class="ex-group" style="--mc:${c}"><div class="ex-list">${itemsHTML}</div></div>`;
    return;
  }

  // Kraft-Modus: gruppiert nach Muskelgruppe (wie bisher)
  const byMuscle = {};
  MUSCLE_ORDER.forEach(m => byMuscle[m] = []);
  exs.forEach(e => {
    if (exType(e) !== 'strength') return;
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

function addToPlanDay(exId) {
  const plan = DB.getPlan();
  plan[editingDayIdx].exercises.push({ exId, targetSets:3, targetReps:8 });
  DB.savePlan(plan);
  syncActiveWorkoutWithPlanDay(plan[editingDayIdx].id);
  closeModal('modal-add-to-plan');
  renderPlanDayExList(plan[editingDayIdx]);
  const ex = getEx(exId);
  if (ex) showToast(`${ex.name} hinzugefügt`);
}

let editingExerciseId = null;
let newExContext = 'plan'; // 'plan' | 'exercises' | 'edit-from-catalog'
let newExType = 'strength'; // 'strength' | 'cardio' — Type des Neuen Eintrags

// Im Modal Muskel-Dropdown ein-/ausblenden je nach Type
function _applyNewExModalTypeUI() {
  const muscleField = document.querySelector('#modal-new-ex .form-field-muscle');
  if (muscleField) muscleField.style.display = (newExType === 'cardio') ? 'none' : '';
}

function openNewExModal(context) {
  newExContext = context || 'plan';
  editingExerciseId = null;
  // Type bestimmen: im Uebungen-Tab folgt der Type dem aktuellen Toggle.
  // In Plan-Add-Kontexten (Trainingstag-Bearbeitung) defaultet auf Kraft, weil Cardio dort selten neu angelegt wird.
  newExType = (newExContext === 'exercises' && exMode === 'cardio') ? 'cardio' : 'strength';
  document.getElementById('new-ex-name').value = '';
  document.getElementById('new-ex-muscle').value = 'chest';
  const titleEl = document.querySelector('#modal-new-ex .sheet-title');
  if (titleEl) titleEl.textContent = newExType === 'cardio'
    ? 'Neue Cardio-Einheit erstellen' : 'Neue Übung erstellen';
  _applyNewExModalTypeUI();
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
      if (exType(ex) === 'cardio') {
        // Type bleibt cardio, kein Muskel/Kategorie
      } else {
        const muscle = document.getElementById('new-ex-muscle').value;
        const cat = muscle === 'legs' ? 'legs'
                  : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                  : 'push';
        ex.muscle = muscle;
        ex.category = cat;
      }
      DB.saveExercises(exs);
    }
    editingExerciseId = null;
    closeModal('modal-new-ex');
    if (currentScreen === 'exercises') renderExercises();
    showToast('Übung aktualisiert');
    return;
  }

  // Create new
  const id = (newExType === 'cardio' ? 'cd_' : 'custom_') + Date.now();
  if (newExType === 'cardio') {
    exs.push({ id, name, type: 'cardio', isCustom: true, notes: '' });
  } else {
    const muscle = document.getElementById('new-ex-muscle').value;
    const cat = muscle === 'legs' ? 'legs'
              : (muscle === 'back' || muscle === 'biceps') ? 'pull'
              : 'push';
    exs.push({ id, name, muscle, category: cat, type: 'strength', isCustom: true, notes: '' });
  }
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

  // By-name-Match ist type-aware: bei Cardio nur unter Cardio-Eintraegen suchen
  // (sonst koennte eine Cardio-Uebung versehentlich auf eine gleichnamige Kraft-Uebung gemappt werden).
  const findExByName = (name, type) => {
    const norm = name.trim().toLowerCase();
    return exs.find(e =>
      e.name.trim().toLowerCase() === norm &&
      (!type || exType(e) === type)
    );
  };

  let _idCounter = 0;
  const genId = (prefix) => `${prefix}_${Date.now()}_${_idCounter++}`;

  const importedDays = data.trainingDays.map(day => {
    const exercises = (day.exercises || []).map(ie => {
      // Type bestimmen: explizit aus JSON, sonst per Namens-Heuristik
      const declaredType = (ie.type === 'cardio' || ie.type === 'strength') ? ie.type : null;
      const wantType = declaredType || inferTypeFromName(ie.name);
      const isCardio = wantType === 'cardio';

      let ex = findExByName(ie.name, wantType);
      if (ex) {
        reusedExCount++;
      } else if (isCardio) {
        // Neue Cardio-Uebung anlegen (kein muscle, kein category, type:'cardio')
        ex = {
          id: genId('cd'),
          name: ie.name.trim(),
          type: 'cardio',
          isCustom: true,
          notes: (typeof ie.notes === 'string' ? ie.notes : ''),
        };
        exs.push(ex);
        newExCount++;
      } else {
        // Neue Kraft-Uebung wie bisher
        const muscle = VALID_MUSCLES.includes(ie.muscle) ? ie.muscle : inferMuscleFromName(ie.name);
        const category = muscle === 'legs' ? 'legs'
                       : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                       : 'push';
        ex = {
          id: genId('custom'),
          name: ie.name.trim(),
          muscle, category,
          type: 'strength',
          isCustom: true,
          notes: (typeof ie.notes === 'string' ? ie.notes : ''),
        };
        exs.push(ex);
        newExCount++;
      }

      // Plan-Day-Eintrag: Cardio ohne targetSets/Reps/Weight
      if (isCardio) {
        return { exId: ex.id };
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
// Ein Eintrag: { type?: 'cardio'|'strength', name, muscle?, notes? }
// Type fehlt → inferTypeFromName(name). By-name-Match ist type-aware:
// Kraft- und Cardio-Variante gleichen Namens werden NICHT zusammengefuehrt.

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
    let willCreate = 0, willReuse = 0, cardioNew = 0, strengthNew = 0;
    for (const ie of data.exercises) {
      const wantType = (ie.type === 'cardio' || ie.type === 'strength')
        ? ie.type
        : inferTypeFromName(ie.name);
      const norm = ie.name.trim().toLowerCase();
      const match = existing.find(e =>
        e.name.trim().toLowerCase() === norm && exType(e) === wantType
      );
      if (match) willReuse++;
      else {
        willCreate++;
        if (wantType === 'cardio') cardioNew++; else strengthNew++;
      }
    }

    pendingExercisesImport = data;
    const total = data.exercises.length;
    const breakdown = [];
    if (cardioNew) breakdown.push(`${cardioNew} Cardio`);
    if (strengthNew) breakdown.push(`${strengthNew} Kraft`);
    const newDetail = breakdown.length ? ` (${breakdown.join(', ')})` : '';
    const lines = [
      `Insgesamt <strong>${total}</strong> Übung${total === 1 ? '' : 'en'} im Import.`,
      willCreate ? `<strong>${willCreate}</strong> werden neu angelegt${newDetail}.` : null,
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
    const declaredType = (ie.type === 'cardio' || ie.type === 'strength') ? ie.type : null;
    const wantType = declaredType || inferTypeFromName(ie.name);
    const norm = ie.name.trim().toLowerCase();
    const existing = exs.find(e =>
      e.name.trim().toLowerCase() === norm && exType(e) === wantType
    );
    if (existing) {
      reusedExCount++;
      continue;
    }
    if (wantType === 'cardio') {
      exs.push({
        id: genId('cd'),
        name: ie.name.trim(),
        type: 'cardio',
        isCustom: true,
        notes: (typeof ie.notes === 'string' ? ie.notes : ''),
      });
    } else {
      const muscle = VALID_MUSCLES.includes(ie.muscle) ? ie.muscle : inferMuscleFromName(ie.name);
      const category = muscle === 'legs' ? 'legs'
                     : (muscle === 'back' || muscle === 'biceps') ? 'pull'
                     : 'push';
      exs.push({
        id: genId('custom'),
        name: ie.name.trim(),
        muscle, category,
        type: 'strength',
        isCustom: true,
        notes: (typeof ie.notes === 'string' ? ie.notes : ''),
      });
    }
    newExCount++;
  }
  DB.saveExercises(exs);

  // UI-Refresh: wenn der User aktuell im Uebungen-Tab ist, dort neu rendern
  if (currentScreen === 'exercises') renderExercises();

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
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

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
// Markiert nur den Änderungs-Zeitpunkt für die Konflikt-Erkennung.
// Drive-Sync wird NICHT automatisch bei jeder Änderung getriggert — nur explizit
// am Ende eines Workouts (`finishWorkout`) oder manuell via "Jetzt synchronisieren".
function markLocalChange() {
  localStorage.setItem('ft_drive_last_local_change', String(Date.now()));
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
    // v3 = Multi-Plan + Cardio (exercises haben type, workouts haben optional cardio-Block)
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

  // Schema-Migration v1→v2→v3 (idempotent, laeuft bei jedem Load).
  // v2→v3: exercises bekommen type:'strength' wenn fehlt. Workouts bleiben kompatibel
  // (Cardio-Eintraege haben type:'cardio'+cardio-Block, neue Felder lassen alte Clients
  // einfach ignorieren).
  const cloudVersion = parseInt(data.version, 10) || 1;
  if (cloudVersion < 3) {
    data.exercises = data.exercises.map(ex =>
      (ex && ex.type === undefined) ? { ...ex, type: 'strength' } : ex
    );
  }

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
function initScrollHideNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const bar = document.getElementById('workout-active-bar');
  // Mini-Leiste mit der Nav zusammen aus-/einblenden.
  const setNavHidden = (h) => { nav.classList.toggle('nav-hidden', h); if (bar) bar.classList.toggle('nav-hidden', h); };
  const _navTickingByTab = new Map();

  function attachToScreen(screenEl, tabName) {
    if (!screenEl) return;
    // Tipp auf den LEEREN Tab-Hintergrund (nicht auf Karten/Buttons) toggelt die Bottom-Nav
    // ein/aus — same Mechanik wie das Runterscrollen (Leonard-Wunsch). e.target===screenEl
    // trifft nur den Hintergrund (Kinder/Karten bubblen, sind aber !== screenEl).
    screenEl.addEventListener('click', (e) => {
      if (currentScreen !== tabName) return;
      if (e.target !== screenEl) return;
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
        if (cur < 60) {
          setNavHidden(false);
        } else if (Math.abs(delta) > 5) {
          setNavHidden(delta > 0);
        }
        _navLastScrollY = cur;
        _navTickingByTab.set(tabName, false);
      });
    }, { passive: true });
  }

  TAB_ORDER.forEach(tabName => {
    attachToScreen(document.getElementById('screen-'+tabName), tabName);
  });
  // Plan-Detail- + Trainingstag-Detail-Overlay haben eigenes Scrollen — Nav-Hide auch dort.
  const planDetail = document.getElementById('screen-plan-detail');
  if (planDetail) attachToScreen(planDetail, 'plan-detail');
  const dayDetail = document.getElementById('screen-day-detail');
  if (dayDetail) attachToScreen(dayDetail, 'day-detail');
}

// Alle Tab-Inhalte einmal im Hintergrund rendern (App-Start), damit beim Wischen KEIN
// leerer Tab kurz aufblitzt, bevor _applyTabState ihn beim Ankommen rendert. Die Tabs
// liegen alle (off-screen) im DOM mit voller Breite → Charts etc. messen korrekt.
function prerenderAllTabs() {
  try { renderOverview(); }       catch (e) { console.warn('prerender overview', e); }
  try { renderWorkoutsScreen(); } catch (e) { console.warn('prerender workouts', e); }
  try { renderExercises(); }      catch (e) { console.warn('prerender exercises', e); }
  try { renderPlansScreen(); }    catch (e) { console.warn('prerender plans', e); }
  try { renderMehr(); }           catch (e) { console.warn('prerender mehr', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  // Cardio app-weit ausgeblendet → Klasse auf <html> (überlebt Tab-Wechsel, anders als body.className)
  if (!CARDIO_ENABLED) document.documentElement.classList.add('no-cardio');
  // Daten-Migration: altes ft_program/ft_plan2/ft_weekplan in neue ft_plans-Struktur
  migrateToMultiPlan();
  // Tag-Modell v2: eingebettete Plan-Tage in geteilte Bibliothek-Referenzen überführen (einmalig)
  migrateDayModelV2();
  // Daten-Hygiene: verwaiste Wochenplan-Referenzen entfernen (legacy fallback, falls noch
  // jemand auf den ft_weekplan-Key zugreift — mit Multi-Plan sind die weekPlans pro Plan)
  cleanupOrphanWeekplan();
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
  // Tab-Wechsel per nativem horizontalem Snap-Scroll am Tab-Container
  initTabScrollSync();
  // Bottom-Sheet-Modals nach unten wegswipen
  initSheetSwipeDismiss();
  // Edge-Swipe-Back im Plan-Detail (vom linken Bildschirmrand mit Finger nach rechts ziehen)
  initOverlayEdgeSwipe('screen-plan-detail', closePlanDetail);
  initOverlayEdgeSwipe('screen-day-detail', closeLibDayDetail);
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
