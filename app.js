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
// ZEITRAUM EINES PLANS IN KALENDERTAGEN (18.09.2026). Vorher wurde in Millisekunden gegen
// `Date.now()` verglichen — und die beiden Plan-Arten speichern ihre Daten verschieden: Der
// Gymplan UTC-Mitternacht (`_dateToMs`, in Mitteleuropa 02:00 des Tags), der Laufplan lokale
// Mitternacht. Folge: Am LETZTEN Plantag galt ein Gymplan ab 02:00 und ein Laufplan ab 00:00
// schon als beendet (Chip „Beendet", kein laufender Plan in Uebersicht und Training), und der
// Kalender zaehlte den ERSTEN Tag eines Gymplans nicht mit (00:00 lag vor 02:00).
// `_calLokalTag` bildet beide Speicherformen auf denselben lokalen Tag ab; erster und letzter
// Tag gehoeren jetzt zum Plan. Die SPEICHERFORMATE sind unveraendert (Drive-Sicherung, Altdaten).
function _planHatBegonnen(p, heute) { return !!p.startDate && _calLokalTag(p.startDate) <= heute; }
function _planIstVorbei(p, heute)   { return !!p.endDate && _calLokalTag(p.endDate) < heute; }
function _planEndetAm(p, heute)     { return !!p.endDate && _calLokalTag(p.endDate).getTime() === heute.getTime(); }
// Laufende Plaene einer Liste. Beginnt am letzten Tag eines Plans schon der naechste, gehoert der
// Tag dem NEUEN — so war es auch vor der Umstellung, als der alte um 02:00 bzw. 00:00 endete.
function _laufenderPlanIn(liste, mitEnde) {
  const heute = _calLokalTag(Date.now());
  const laufend = liste.filter(p => !p.archived && (!mitEnde || p.endDate)
                                  && _planHatBegonnen(p, heute) && !_planIstVorbei(p, heute));
  return laufend.find(p => !_planEndetAm(p, heute)) || laufend[0] || null;
}
// Ein Gymplan braucht ein Ende (wie vorher: `now <= undefined` war nie wahr).
function _findActivePlanIn(plans) {
  return _laufenderPlanIn(plans, true);
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

  // Nachgetragene Trainingstage OHNE Einheit: nur ein Datum ('YYYY-MM-DD'), keine Uebungen,
  // keine Saetze, kein Volumen. Sie faerben das Kaestchen im Trainingskalender und zaehlen
  // in dessen Kennzahlen mit — mehr steht ueber sie nicht zur Verfuegung.
  getManualDays() { const s = localStorage.getItem('ft_manual_days'); return s ? JSON.parse(s) : []; },
  saveManualDays(v) { localStorage.setItem('ft_manual_days', JSON.stringify(v)); markLocalChange(); },

  // EIGENSTAENDIGE Wettkaempfe: `{ date: 'YYYY-MM-DD', name }`, ohne zugehoerigen Laufplan.
  // Das Gegenstueck zu `plan.raceDate` — noetig fuer Wettkaempfe aus Jahren, in denen es noch
  // gar keine Laufplaene gab (Leonard-Liste 06.09.2026, 2024 bis 2026).
  // Die WERTE des Wettkampfs (Strecke, Zeit, Puls …) stehen NICHT hier: Sie kommen aus dem
  // Lauf, der an dem Tag in der Tabelle steht. Hier liegt nur, WELCHER Tag ein Wettkampf war
  // und wie er hiess.
  // Der Getter hebt Altbestand aus der ersten Fassung (reine Datumsstrings) auf Objekte und
  // sortiert AUFSTEIGEND — aeltester Wettkampf zuerst (Leonard-Wunsch 06.09.2026). Damit
  // liest sich die Seite wie eine Laufbahn und die anstehenden Termine stehen am Ende.
  // Andere Listen der App sind neueste-zuerst; hier ist es bewusst umgekehrt.
  getRaces() {
    const s = localStorage.getItem('ft_races');
    const arr = s ? JSON.parse(s) : [];
    return arr.map(r => (typeof r === 'string' ? { date: r, name: '' } : r))
              .filter(r => r && r.date)
              .sort((a, b) => a.date.localeCompare(b.date));
  },
  saveRaces(v) { localStorage.setItem('ft_races', JSON.stringify(v)); markLocalChange(); },

  // ── Laufen ──────────────────────────────────────────────────────
  // Laufplaene liegen LOKAL wie alle FitTrack-Daten (Drive-Sicherung inklusive). Aus der
  // Google-Tabelle kommen ausschliesslich die tatsaechlich gelaufenen Einheiten — FitTrack
  // liest sie nur und schreibt nichts hinein.
  getRunPlans() { const s = localStorage.getItem('ft_runplans'); return s ? JSON.parse(s) : []; },
  saveRunPlans(v) { localStorage.setItem('ft_runplans', JSON.stringify(v)); markLocalChange(); },
  // Zwischenspeicher der gelesenen Laeufe: FitTrack ist offline-faehig, der Lauf-Tab soll
  // also auch ohne Netz etwas zeigen. BEWUSST nicht in der Drive-Sicherung — die Daten
  // gehoeren der Tabelle, nicht FitTrack.
  getRuns() { const s = localStorage.getItem('ft_runs_cache'); return s ? (JSON.parse(s).runs || []) : []; },
  getRunsStand() { const s = localStorage.getItem('ft_runs_cache'); return s ? (JSON.parse(s).fetchedAt || 0) : 0; },
  saveRuns(runs) {
    localStorage.setItem('ft_runs_cache', JSON.stringify({ fetchedAt: Date.now(), runs }));
  },

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
  // Dieselbe Quelle wie die Detailansicht: aus Start und Ende gerechnet, mit `weeksTotal`
  // nur als Rueckfallebene. Sonst stand in der Karte „Woche 5 / 12", waehrend die
  // Detailansicht „9 Wochen" nannte (04.09.2026).
  const total = _weeksBetween(p.startDate, p.endDate) || p.weeksTotal || 12;
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
      // Wurde die hier geplante Einheit an einem ANDEREN Tag dieser Woche gemacht?
      // Wird gleich unten nachgetragen — dafuer braucht es erst alle sieben Tage.
      verschoben: false,
      // Ruhetag wenn: kein planDayId zugewiesen ODER die zugewiesene ID existiert nicht
      // mehr (verwaiste Referenz nach Plan-Import mit "Ersetzen")
      isRest: !planDay,
    });
  }
  _verschobeneZuordnen(out, ws, mon);
  return out;
}

// VERSCHOBENE EINHEITEN (08.09.2026, Leonard-Wunsch): Wer die Einheit vom Dienstag am Montag
// vorzieht, soll das in den Wochenplan-Karten sehen — der Montag bekommt seinen Haken (das
// macht `dayDone`), und der Dienstag darf nicht laenger offen aussehen.
//
// Zugeordnet wird ueber `wo.planDayId` — die Einheit weiss, zu welchem Trainingstag sie
// gehoert. NICHT ueber den Wochentag: Derselbe Trainingstag kann zweimal in der Woche stehen.
//
// Zwei Schritte, damit nichts doppelt zaehlt:
//   1. Jede Einheit, die AM RICHTIGEN Tag lief, verbraucht ihren eigenen Platz.
//   2. Was uebrig bleibt, fuellt die noch offenen Plaetze DESSELBEN Trainingstags — der
//      frueheste zuerst. Ein freies Training (`planDayId === null`) passt zu keinem Platz
//      und bleibt einfach der Haken an seinem eigenen Tag.
function _verschobeneZuordnen(tage, ws, mon) {
  const so = new Date(mon); so.setDate(so.getDate() + 6); so.setHours(23, 59, 59, 999);
  const uebrig = [];
  ws.forEach(w => {
    if (w.startTs < mon.getTime() || w.startTs > so.getTime()) return;
    if (!w.planDayId) return;                       // freies Training — keinem Platz zuzuordnen
    const idx = woDayIdx(w);
    // Lief sie an dem Tag, an dem genau dieser Trainingstag geplant war? Dann ist ihr Platz
    // besetzt und sie steht fuer eine Verschiebung nicht mehr zur Verfuegung.
    if (idx >= 0 && tage[idx] && tage[idx].planDayId === w.planDayId) return;
    uebrig.push(w.planDayId);
  });
  if (!uebrig.length) return;
  tage.forEach(t => {
    if (!t.planDayId || t.dayDone) return;          // kein Platz bzw. an dem Tag lief etwas
    const i = uebrig.indexOf(t.planDayId);
    if (i === -1) return;
    uebrig.splice(i, 1);                            // Einheit ist vergeben, zaehlt nur einmal
    t.verschoben = true;
  });
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

// Wochenserie fuer die LAUFPLAENE — dasselbe Prinzip wie `getWeekStreak` beim Gymplan, nur
// zaehlt es Laeufe gegen die Zahl der geplanten Lauftage (06.09.2026). Eigene Funktion, weil
// die beiden Datenmodelle ausser der Woche nichts gemeinsam haben.
function getRunWeekStreak() {
  const plan = runPlanAktiv();
  if (!plan) return 0;
  const geplant = (plan.runDays || []).length;
  if (!geplant) return 0;
  const laeufe = DB.getRuns();
  if (!laeufe.length) return 0;

  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const mon = new Date(heute); mon.setDate(mon.getDate() - ((heute.getDay() + 6) % 7));
  const zaehleAb = (start) => {
    const ende = new Date(start); ende.setDate(start.getDate() + 6);
    return laeufe.filter(l => {
      const [y, m, d] = l.date.split('-').map(Number);
      const t = new Date(y, m - 1, d).getTime();
      return t >= start.getTime() && t <= ende.getTime();
    }).length;
  };

  let serie = 0;
  if (zaehleAb(mon) >= geplant) serie++;         // laufende Woche nur, wenn schon voll
  for (let i = 1; i <= 52; i++) {
    const start = new Date(mon); start.setDate(mon.getDate() - 7 * i);
    if (start < _calLokalTag(plan.startDate || 0)) break;   // Kalendertage, siehe `_planHatBegonnen`
    if (zaehleAb(start) >= geplant) serie++;
    else break;
  }
  return serie;
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
    if (start < _calLokalTag(active.startDate || 0)) break;   // Kalendertage, siehe `_planHatBegonnen`
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
  // Steht an dem Tag auf der gezeigten Seite nichts an, wird derselbe Verlauf GRAU
  // (Leonard-Wunsch 08.09.2026). Gleicher Winkel, gleicher Hell-Dunkel-Sprung — nur die
  // Farbe faellt weg. Das Gruen ist ein Versprechen; ohne Training gibt es keins.
  'workouts-grau': 'linear-gradient(135deg, #334155, #94A3B8)',
  plans:     'linear-gradient(135deg, #78350F, #F59E0B)',
  exercises: 'linear-gradient(135deg, #172554, #1E40AF)',
  mehr:      'linear-gradient(135deg, #DBEAFE, #DBEAFE)',   // solid hellblau, kein sichtbarer Verlauf
};

// Ist auf der GERADE GEZEIGTEN Seite des Trainings-Tabs fuer HEUTE etwas geplant?
// Bezug ist bewusst HEUTE und nicht der im Wochenplan gewaehlte Tag: Der Hintergrund ist ein
// ruhiges Tagessignal („heute steht hier nichts an") und soll nicht bei jedem Tipp auf einen
// anderen Wochentag umspringen.
function trainingHeuteGeplant() {
  const todayIdx = (new Date().getDay() + 6) % 7;
  if (workoutsViewMode === 'laufen') {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return !!runGeplanteTage()[_dayKeyOf(t.getTime())];
  }
  const woche = getCurrentWeekDays();
  return !!(woche[todayIdx] && woche[todayIdx].planDay);
}

// Welcher Verlauf gilt fuer diesen Tab? Fuer alle ausser dem Trainings-Tab schlicht der Name.
// Der Schluessel wird AUCH als `dataset.theme` der Layer benutzt — er muss die Variante
// enthalten, sonst haelt der Crossfade Grau und Gruen faelschlich fuer denselben Zustand und
// zeichnet beim Wechsel nicht neu.
function themeBgKey(name) {
  return (name === 'workouts' && !trainingHeuteGeplant()) ? 'workouts-grau' : name;
}
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
  const fromName = themeBgKey(TAB_ORDER[fromIdx]);
  const toName   = themeBgKey(TAB_ORDER[toIdx]);
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
  themeName = themeBgKey(themeName);
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

// Screens, die als Vollbild-Overlay UEBER dem Tab-Container liegen (Name → Element-ID).
const OVERLAY_SCREENS = {
  'plan-detail':    'screen-plan-detail',
  'day-detail':     'screen-day-detail',
  'runplan-detail': 'screen-runplan-detail',
  'mehr':           'screen-mehr',
};

function _applyTabState(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navEl = document.getElementById('nav-'+name);
  if (navEl) navEl.classList.add('active');

  // Body-Theme: plan-detail UND day-detail teilen sich Theme + Akzentfarbe mit der Plans-Liste (Amber).
  const themeName = (name === 'plan-detail' || name === 'day-detail' || name === 'runplan-detail') ? 'plans' : name;
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
  if (name !== 'runplan-detail') editingRunPlanId = null;

  // Kopfzeile der laufenden Einheit gehoert zum Trainings-Tab: Zustand beim Verlassen
  // zuruecksetzen, damit sie beim Zurueckkehren nicht faelschlich sofort wieder steht.
  if (name !== 'workouts') updateStickyBar(false);
  if (name !== 'workouts') _laufWochenNr = null;   // gewischte Woche der Laufseite, siehe `_setWorkoutsView`

  // Seitenleiste unten: zeigt die Seiten des NEUEN Tabs (oder verschwindet, wenn er
  // keine hat). Seit dem 21.09.2026 VOR dem Renderer (Leonard-Wunsch „schneller"): Vorher
  // wartete ihr Auftauchen bzw. Ueberblenden zusaetzlich auf das Neuzeichnen des ganzen Tabs.
  // Sie braucht nichts davon — nur die Seiten-Tabelle und die gewaehlte Seite, und die setzt
  // kein Renderer.
  seitenleisteAktualisieren();

  if (name === 'overview') renderOverview();
  else if (name === 'workouts') renderWorkoutsScreen();
  else if (name === 'exercises') renderExercisesScreen();
  else if (name === 'plans') renderPlansScreen();
  else if (name === 'plan-detail') renderPlanDetail();
  else if (name === 'day-detail') renderLibDayDetail();
  else if (name === 'runplan-detail') renderRunPlanDetail();
  else if (name === 'mehr') renderMehr();

  ensureTimerActive();

  // Bottom-Nav-Zustand wird beim Tab-Wechsel BEWUSST NICHT zurückgesetzt (Leonard-Wunsch):
  // ist die Leiste ausgeblendet, bleibt sie es auch beim Tabwechsel. Wieder einblenden nur
  // über Hintergrund-Tipp (Toggle) oder Hochscrollen (beides in initScrollHideNav).
}

// Die Bottom-Nav ausblenden, von ausserhalb von `initScrollHideNav` aus. Dort ist
// `setNavHidden` eine lokale Funktion; hier steht der Zeiger darauf, damit der Tabwechsel
// sie erreicht (12.09.2026, Leonard-Wunsch: „beim Swipen und Wechseln zwischen den Tabs soll
// die Tableiste verschwinden"). Vor dem Einrichten tut sie nichts.
let _navVerstecken = () => {};

function showScreen(name) {
  // Vollbild-Overlays UEBER dem Tab-Container. Als Tabelle statt als Kette von Zweigen —
  // mit dem Laufplan-Detail waere es der vierte gleichlautende Block gewesen (04.09.2026).
  const tabContainer = document.getElementById('tab-container');
  const overlayEls = Object.values(OVERLAY_SCREENS).map(id => document.getElementById(id)).filter(Boolean);
  overlayEls.forEach(el => el.classList.remove('active'));
  if (OVERLAY_SCREENS[name]) {
    currentScreen = name;
    const el = document.getElementById(OVERLAY_SCREENS[name]);
    if (el) { el.classList.add('active'); el.scrollTop = 0; }  // oben starten, nicht die alte Position zeigen
    _applyTabState(name);
    return;
  }

  // Wenn der Ziel-Tab nicht in der TAB_ORDER ist, ignorieren
  if (!TAB_ORDER.includes(name)) return;

  // Tabwechsel blendet die Tableiste aus (Leonard-Wunsch 12.09.2026). NUR zwischen zwei
  // Tabs — die Rueckkehr aus einem Vollbild-Overlay (Einstellungen, Plan-Detail) ist kein
  // Tabwechsel und soll die Leiste stehen lassen. Der Wisch hat seinen eigenen Ausloeser in
  // `initTabScrollSync`; beide enden im selben Zustand.
  if (currentScreen !== name && TAB_ORDER.includes(currentScreen)) _navVerstecken(true);

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

  // ─ Hero card ─ (eigene Funktion, siehe `renderUebersichtHero`)
  renderUebersichtHero();
  ensureTimerActive();

  // ─ EINE Wochenplankarte fuer beide Sportarten ─ (siehe `renderWochenKarte`)
  renderWochenKarte();

  // ─ Hinweis auf das Plan-Ende + Sicherungs-Status ─
  renderBackupLine();

  // ─ Trainingskalender (ganzes Kalenderjahr) ─
  // Wird hier gerendert, nicht in renderStatsPage: die Auswertungen liegen seit dem
  // Umbau im Übungen-Tab, der Kalender bleibt in der Übersicht.
  renderTrainingCalendar();

}

// ─── Wochenplankarte der Uebersicht: EINE Karte fuer beide Sportarten ───────────────
// Leonard-Wunsch 07.09.2026 („Variante A"). Sie ersetzt die frueher getrennten Karten
// #ov-plan-card und #ov-runplan-card. Der TITEL ist ein Filter wie beim Trainingskalender:
// beide → nur Gym → nur Lauf → beide. In den Einzelzustaenden zeichnen die bestehenden
// Kartenbauer unveraendert weiter (samt Planname, Fortschrittsbalken und Statuschip); nur
// der gemeinsame Zustand hat eine eigene Bauform.
// BEWUSST nicht gespeichert — dieselbe Ueberlegung wie beim Kalender- und Katalogfilter:
// Ein Zustand, der einen Neustart ueberlebt, laesst die Karte spaeter unerklaerlich
// unvollstaendig wirken.
let _wochenFilter = 'beide';
const _WOCHEN_FILTER_TITEL = { beide: 'Trainingswoche', gym: 'Gymwoche', lauf: 'Laufwoche' };
// DER WECHSEL BLENDET EIN wie beim Kalender (18.09.2026, Leonard-Wunsch „die gleiche Animation"):
// Die neue Karte steht sofort da, alles UNTER dem Titel blendet in 300ms aus dem Durchsichtigen
// ein (`_neuZeichnenEinblenden`). Der Titel (`.ppv-head`) bleibt stehen — er ist der Schalter.
// Die Karte hat eine FESTE Hoehe, es springt also nichts.
function toggleWochenFilter() {
  _wochenFilter = _wochenFilter === 'beide' ? 'gym' : _wochenFilter === 'gym' ? 'lauf' : 'beide';
  _kombiTag = null;            // die Auswahl gehoert zur Kombi-Karte, die es hier nicht mehr gibt
  const huelle = document.getElementById('ov-week-card');
  _neuZeichnenEinblenden('woche', huelle, () => {
    const karte = huelle && huelle.querySelector(':scope > .plan-card-v2');
    return karte ? [...karte.children].filter(el => !el.classList.contains('ppv-head')) : [];
  }, renderWochenKarte);
  renderUebersichtHero();
}

// ─── Tagesauswahl in der Kombi-Wochenplankarte (12.09.2026, Leonard-Wunsch) ───────────
// Jeder Wochentagskreis der beiden Reihen ist ein eigenes Tipp-Ziel; die Herocard direkt
// darunter zeigt daraufhin DIESEN Tag. `null` heisst „nichts gewaehlt" — dann steht dort
// wie bisher heute.
// Gewaehlt ist ein TAG, keine Sportart: Ein Tipp auf einen Kreis markiert denselben Wochentag
// in BEIDEN Reihen, und BEIDE Spalten der Herocard springen mit (Leonard-Entscheidung
// 12.09.2026 — eine erste Fassung am selben Tag liess nur die getippte Sportart mitgehen, dann
// sprach der Titel aber nur fuer die halbe Karte).
// Ein ZWEITER Tipp auf denselben Kreis hebt die Auswahl wieder auf — dieselbe Regel wie bei
// der Kalender-Fusszeile und dem Wettkampf-Zeitstrahl.
// BEWUSST nicht gespeichert, wie jeder Ansichtszustand der App.
// FOLGE: Die REIHEN sind damit stumm geworden. Vorher fuehrte ein Tipp auf die Reihe in den
// Trainings-Tab; mit den antippbaren Kreisen laegen zwei Ziele in einer Kachel, und genau
// das hat Leonard am 06.09.2026 abgelehnt. Zum Training kommt man ueber den Knopf der
// Herocard darunter (Leonard-Entscheidung 12.09.2026).
let _kombiTag = null;   // 0..6 oder null (= heute)
function waehleKombiTag(idx) {
  _kombiTag = (_kombiTag === idx) ? null : idx;
  renderWochenKarte();
  mitHeroFarbwechsel('#ov-hero-wrap', renderUebersichtHero);
}

// ─── Herocard-Knoepfe wechseln ihre Farbe weich (13.09.2026, Leonard-Wunsch) ─────────
// Tippt man in der Wochenplan-Karte auf einen anderen Tag, kann ein Knopf von Grau (nichts
// geplant) auf seine Sportfarbe springen oder umgekehrt. Die Karte wird dabei NEU GEBAUT — eine
// CSS-Transition auf `background` liefe nie, und Verlaeufe lassen sich ohnehin nicht
// ueberblenden. Deshalb: vor dem Neubau die Farbe jedes Knopfs merken (`data-sport` gym/lauf
// als Schluessel), danach bekommt jeder Knopf, dessen Farbe sich geaendert hat, die Klasse
// `.hero-farbe-von-<alt>`. Sie legt die ALTE Flaeche als `::before` ueber den Knopfgrund und
// laesst sie ausblenden (CSS `hero-farbe-verblassen`) — die neue Farbe erscheint darunter.
// Genutzt von der Kombi-Karte der Uebersicht und den Tagesauswahlen der Seiten „Gym" und
// „Laufen". Bei `prefers-reduced-motion` springt die Farbe wie bisher.
function _heroKnopfFarbe(btn) {
  return btn.classList.contains('hero-v2-btn-grau') ? 'grau' : btn.dataset.sport;
}
function mitHeroFarbwechsel(huelle, zeichnen) {
  const vorher = {};
  document.querySelectorAll(huelle + ' .hero-v2-btn[data-sport]')
    .forEach(b => { vorher[b.dataset.sport] = _heroKnopfFarbe(b); });
  zeichnen();
  if (_bewegungReduziert()) return;
  document.querySelectorAll(huelle + ' .hero-v2-btn[data-sport]').forEach(b => {
    const alt = vorher[b.dataset.sport];
    if (alt && alt !== _heroKnopfFarbe(b)) b.classList.add('hero-farbe-von-' + alt);
  });
  // Der TEXT der Karte sprang bisher um, waehrend nur die Knopffarbe blendete (Leonard-Meldung
  // 16.09.2026). Titel und Beschriftung blenden deshalb kurz ein — bewusst KEINE Kreuzblende mit
  // einer Kopie des alten Textes: Die Karte wird bei jedem Tipp neu gebaut, und eine Kopie waere
  // hier deutlich mehr Aufwand als der Gewinn. Die KNOEPFE bleiben aussen vor, sie haben mit der
  // Farbblende schon ihre eigene Bewegung.
  document.querySelectorAll(huelle + ' .hero-heute-titel, ' + huelle + ' .hero-heute-kopf')
    .forEach(el => _animFahren(el, [{ opacity: 0 }, { opacity: 1 }],
                               { duration: HERO_TEXT_MS, easing: SEITEN_EIN_KURVE, fill: 'backwards' })
                     .then(() => el.getAnimations().forEach(a => a.cancel())));
}
const HERO_TEXT_MS = 180;

// Herocard der Uebersicht. Eigene Funktion, weil die Tagesauswahl sie einzeln neu zeichnet —
// ein voller `renderOverview()` baute auch den Kalender neu und liesse ihn an den
// Jahresanfang springen.
function renderUebersichtHero() {
  const wrap = document.getElementById('ov-hero-wrap');
  if (!wrap) return;
  const week7 = getCurrentWeekDays();
  const todayIdx = Math.max(0, week7.findIndex(d => d.isToday));
  const activeWo = DB.getActive();
  if (activeWo) {
    const aktiv = getActivePlan();
    const heroDay = (aktiv ? aktiv.trainingDays : []).find(d => d.id === activeWo.planDayId);
    wrap.innerHTML = buildSessionCard(activeWo, heroDay, week7[todayIdx], { label: 'LAUFENDE EINHEIT' });
    return;
  }
  // Der Tag, der gilt: der gewaehlte, sonst heute. Er gilt fuer BEIDE Spalten.
  const gewaehlt = _kombiTag != null;
  const idx = gewaehlt ? _kombiTag : todayIdx;
  const eintrag = week7[idx] || week7[todayIdx];
  // OHNE Auswahl bleibt die bisherige Regel: Ist die heutige Einheit schon absolviert, zeigt
  // die Karte „Kein Gym" und bietet freies Training an — heute ist erledigt.
  // MIT Auswahl gilt die Regel des Trainings-Tabs (`_renderGymSeite`): dort steht der
  // Trainingstag unabhaengig davon, ob er schon gelaufen ist. Leonard wollte beide Stellen
  // gleich (12.09.2026), und „Kein Gym" an einem Tag, an dem man trainiert hat, waere falsch.
  const tag = gewaehlt ? (eintrag.planDay || null)
                       : ((eintrag.planDay && !eintrag.dayDone) ? eintrag.planDay : null);
  wrap.innerHTML = buildHeuteHero(tag, eintrag, {
    previewOnClick: tag ? `requestStartFromOverview('${tag.id}')` : null,
    runIdx: gewaehlt ? _kombiTag : null,
    // Der Titel nennt den gewaehlten Tag statt „Heute" (Leonard-Entscheidung 12.09.2026).
    // Ist heute gewaehlt, bleibt es bei „Heute" — der Wochentag saehe dort wie ein Fehler aus.
    titel: (gewaehlt && idx !== todayIdx) ? WOCHENTAGE_LANG[idx] : 'Heute',
  });
}

function renderWochenKarte() {
  const el = document.getElementById('ov-week-card');
  if (!el) return;
  // Jede Karte ist EIN Ziel und fuehrt in den TRAININGS-Tab auf die Seite IHRER Sportart
  // (Leonard-Wunsch 09.09.2026 — vorher in den Plan-Tab auf die Planbearbeitung). Damit
  // verhalten sich jetzt ALLE drei Zustaende der Karte gleich: Der gemeinsame Zustand fuehrt
  // seine Reihen schon seit dem 08.09.2026 dorthin. Aus der Wochenuebersicht will man zum
  // Training, nicht in die Planbearbeitung.
  // AUSNAHME: Die LEEREN Karten fuehren weiter in den Plan-Tab — dort steht „Tippe, um einen
  // Plan anzulegen", und anlegen kann man ihn nur da. Der Trainings-Tab haette ohne Plan
  // nichts zu zeigen.
  const zurPlanSeite = (seite) => `setPlansView('${seite}');wischeZuTab('plans')`;
  const zurTrainingsSeite = (seite) => `setWorkoutsView('${seite}');wischeZuTab('workouts')`;
  if (_wochenFilter === 'gym') {
    const active = getActivePlan();
    el.innerHTML = active
      ? buildPlanCard(active, zurTrainingsSeite('gym'), /*hideToday*/ false, /*hideStatus*/ true,
                      /*hideMeta*/ true, { filterOnTap: 'toggleWochenFilter' })
      : leereWochenKarte('Kein aktiver Trainingsplan',
          'Tippe, um einen Plan anzulegen oder zu aktivieren.', zurPlanSeite('plans'));
  } else if (_wochenFilter === 'lauf') {
    // `buildRunPlanCard` zeichnet die leere Karte selbst und faellt dort auf ihr Standardziel
    // zurueck, wenn kein Ziel genannt ist — deshalb hier nur bei vorhandenem Plan eines setzen.
    el.innerHTML = buildRunPlanCard(runPlanAktiv() ? zurTrainingsSeite('laufen') : null, null,
                                    { filterOnTap: 'toggleWochenFilter' });
  } else {
    el.innerHTML = buildWochenKombi();
  }
}

// Leere Karte im Gym-Zustand — der Filtertitel muss auch dann erreichbar bleiben, sonst
// steckte man ohne aktiven Plan im Gym-Zustand fest.
function leereWochenKarte(titel, text, onTap) {
  return `<div class="plan-card-v2" onclick="${onTap}" style="cursor:pointer">
    <div class="ppv-head">${wochenFilterTitel('ppv-name')}</div>
    <div class="ppv-name" style="color:var(--text2);margin-top:6px">${escapeHtml(titel)}</div>
    <div class="ppv-meta">${escapeHtml(text)}</div>
  </div>`;
}

// Der Filtertitel als Knopf. `stopPropagation` ist Pflicht: Sonst loeste sein Tipp zugleich
// den Sprung der Karte in den Plan-Tab aus.
function wochenFilterTitel(extraKlasse) {
  return `<button class="${extraKlasse} ppv-filter-btn" onclick="event.stopPropagation();toggleWochenFilter()"
    aria-label="Zwischen Gym, Läufen und beidem umschalten">${_WOCHEN_FILTER_TITEL[_wochenFilter]}</button>`;
}

// Gemeinsamer Zustand: EINE Wochentagszeile, darunter zwei Reihen Kreise (Gym dunkelgruen,
// Lauf hellgruen). Senkrecht liest man damit ab, was an einem Tag ansteht.
// Statt zweier Fortschrittszeilen — die Plaene stehen in verschiedenen Wochen und liessen
// sich ohnehin nicht zu einer Zahl verrechnen — nur die Woche je Sportart.
function buildWochenKombi() {
  const todayIdx = (new Date().getDay() + 6) % 7;

  // ── Gym ──
  const gp = getActivePlan();
  const gymTage = [];
  if (gp) {
    const byId = {}; resolvePlanDays(gp).forEach(d => { byId[d.id] = d; });
    const wp = (gp.weekPlan && gp.weekPlan.length) ? gp.weekPlan : DEFAULT_WEEKPLAN;
    const weekDone = getCurrentWeekDays();
    wp.forEach((w, i) => {
      const d = w.planDayId ? byId[w.planDayId] : null;
      // „Erledigt" haengt am TAG, nicht am Plan — siehe `buildPlanCard`. `verschoben` heisst:
      // Die hier geplante Einheit lief an einem anderen Tag dieser Woche.
      gymTage[i] = { geplant: !!d,
                     erledigt: !!(weekDone[i] && weekDone[i].dayDone),
                     verschoben: !!(weekDone[i] && weekDone[i].verschoben) };
    });
  }
  // ── Lauf ──
  const rp = runPlanAktiv();
  const rs = runWochenStatus();
  const gelaufen = {};
  (rs.gelaufen || []).forEach(l => {
    const [y, m, d] = l.date.split('-').map(Number);
    gelaufen[(new Date(y, m - 1, d).getDay() + 6) % 7] = true;
  });
  const laufVerschoben = rp ? runVerschobeneTage() : {};
  const laufTage = WOCHENTAGE_KURZ.map((_, i) => ({
    geplant: !!(rp && (rp.runDays || []).includes(i)), erledigt: !!gelaufen[i],
    verschoben: !!(laufVerschoben[i] && !gelaufen[i]),
  }));

  // Jeder Wochentagskreis ist ein eigenes Tipp-Ziel und schiebt die Herocard darunter auf
  // diesen Tag (siehe `waehleKombiTag`). Die REIHE selbst ist stumm — zwei Ziele in einer
  // Kachel hat Leonard abgelehnt.
  const reihe = (tage, sport, icon, sportName) => {
    const punkte = tage.map((t, i) => {
      const cls = ['ppv-k-col'];
      if (t.geplant) cls.push('training');
      if (t.erledigt) cls.push('done');
      if (t.verschoben) cls.push('verschoben');
      if (i === todayIdx) cls.push('today');
      // GEFUELLT heisst „absolviert", sonst nichts (Leonard-Meldung 12.09.2026). Alles, was
      // geplant und noch nicht absolviert ist, traegt den Ring — heute genauso wie ein
      // kuenftiger oder ein ausgefallener Tag. Vorher hing der Ring am Datum
      // (`i > todayIdx`): Ein geplanter Lauf von HEUTE war damit voll eingefaerbt und sah
      // aus wie gelaufen, obwohl er noch anstand.
      if (t.geplant && !t.erledigt && !t.verschoben) cls.push('offen');
      if (_kombiTag === i) cls.push('selected');
      return `<div class="${cls.join(' ')}" onclick="waehleKombiTag(${i})"
                   role="button" tabindex="0" aria-label="${sportName} am ${WOCHENTAGE_LANG[i]}">
        <span class="ppv-k-dot"></span></div>`;
    }).join('');
    return `<div class="ppv-k-reihe ${sport}">
      <span class="ppv-k-ic">${icon}</span>${punkte}
    </div>`;
  };

  return `<div class="plan-card-v2 ppv-kombi karte-inert">
    <div class="ppv-head">
      ${wochenFilterTitel('ppv-name')}
    </div>
    <div class="ppv-k-labels">
      <span class="ppv-k-ic"></span>
      ${WOCHENTAGE_KURZ.map(l => `<span>${l}</span>`).join('')}
    </div>
    ${reihe(gymTage.length ? gymTage : WOCHENTAGE_KURZ.map(() => ({})), 'gym', PPV_ICON_HANTEL, 'Gym')}
    ${reihe(laufTage, 'lauf', PPV_ICON_LAEUFER, 'Laufen')}
  </div>`;
}

// Die Ausrichtung der Ruhetag-Karte an der Wochenplan-Karte (`_ruhetagHeroAusrichten` /
// `_ruhetagHeroEinrichten`) ist am 06.09.2026 mit der Ruhetag-Karte selbst entfallen: Die
// Herocard „Heute" hat kein Symbol mehr, das auf einen Knopf auszurichten waere.

// Der Hinweis „Dein Plan endet in N Tagen" samt `extendActivePlan` ist am 06.09.2026
// ersatzlos entfallen (Leonard-Wunsch) — mit ihm die Karte `#ov-plan-end-notice`.

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
    container.innerHTML = '<p style="font-size:var(--fs-neben);color:var(--text3);padding:8px 0;text-align:center;margin:0">Noch keine Einheiten</p>';
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
  // Start AUSSERHALB des Trainings-Tabs (Uebersicht): Der Tab wird zuerst noch im NORMALEN
  // Zustand des heutigen Tags gezeichnet — so wischt er mit „Einheit starten" herein, und beim
  // Ankommen laeuft der Uebergang in den aktiven Modus (Leonard-Entscheidung 15.09.2026).
  // MUSS vor `DB.saveActive` stehen, sonst zeichnete er schon die laufende Einheit.
  const vonAussen = _woStartVorbereiten();

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
  _woStartZeigen(vonAussen);
}

// Gemeinsamer Rahmen fuer „Einheit starten" und „Freies Training" (15.09.2026):
// `_woStartVorbereiten` VOR dem Speichern der Einheit, `_woStartZeigen` danach.
function _woStartVorbereiten() {
  const vonAussen = currentScreen !== 'workouts';
  if (vonAussen) {
    selectedWorkoutDayIdx = (new Date().getDay() + 6) % 7;
    workoutsViewMode = 'gym';
    renderWorkoutsScreen();
  }
  return vonAussen;
}
function _woStartZeigen(vonAussen) {
  workoutsViewMode = 'gym';
  _woUebergangVormerken('start');
  // Von aussen WISCHEN (der Settle zeichnet und spielt den Uebergang), auf der Seite selbst
  // genuegt das Neuzeichnen ueber `showScreen`.
  if (vonAussen) wischeZuTab('workouts'); else showScreen('workouts');
}

// ═══════════════════════════════════════════════
// ACTIVE WORKOUT
// ═══════════════════════════════════════════════

let timerInterval = null;
// ── Laufwochenplan ─────────────────────────────────────────────────
// Baugleich mit `buildPlanCard` (gleiche Klassen, gleiche Masse, gleiche Bedienung) — nur
// die Quelle ist eine andere: Lauftage statt Trainingstage, gelaufene Einheiten statt
// Krafteinheiten. Bewusst eine eigene Funktion statt eines Schalters in buildPlanCard:
// Die beiden Datenmodelle haben nichts gemeinsam ausser der Woche.
function runWochenStatus() {
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const mo = new Date(heute); mo.setDate(mo.getDate() - ((heute.getDay() + 6) % 7));
  const so = new Date(mo); so.setDate(so.getDate() + 6); so.setHours(23, 59, 59, 999);
  const gelaufen = DB.getRuns().filter(l => {
    const [y, m, d] = l.date.split('-').map(Number);
    const t = new Date(y, m - 1, d).getTime();
    return t >= mo.getTime() && t <= so.getTime();
  });
  const p = runPlanAktiv();
  return { done: gelaufen.length, planned: p ? (p.runDays || []).length : 0, mo, gelaufen };
}

// Gegenstueck zu `_verschobeneZuordnen` fuer die LAEUFE — mit einem wichtigen Unterschied:
// Ein Lauf kommt aus der Google-Tabelle und weiss NICHT, zu welchem geplanten Lauftag er
// gehoert (das Datenmodell kennt nur `runDays: [0..6]` und die gelaufenen Daten). Eine echte
// Zuordnung wie beim Gym ist damit unmoeglich; gezaehlt wird stattdessen:
// Laeufe an nicht geplanten Tagen decken offene Lauftage ab, der frueheste zuerst.
// BEWUSST nur VERGANGENE Lauftage: Beim Gym ist die Verschiebung sicher (die Einheit nennt
// ihren Trainingstag), hier ist sie geraten. Einen kuenftigen Lauftag deshalb abzuhaken,
// weil man vorher einmal zusaetzlich gelaufen ist, waere eine Behauptung — der Tag kann
// noch kommen.
function runVerschobeneTage() {
  const p = runPlanAktiv();
  if (!p) return {};
  const geplant = p.runDays || [];
  if (!geplant.length) return {};
  const st = runWochenStatus();
  const proTag = {};
  (st.gelaufen || []).forEach(l => {
    const [y, m, d] = l.date.split('-').map(Number);
    const i = (new Date(y, m - 1, d).getDay() + 6) % 7;
    proTag[i] = (proTag[i] || 0) + 1;
  });
  // Jeder geplante Tag mit eigenem Lauf verbraucht einen davon.
  let uebrig = Object.values(proTag).reduce((a, b) => a + b, 0);
  geplant.forEach(i => { if (proTag[i]) uebrig--; });
  if (uebrig <= 0) return {};
  const todayIdx = (new Date().getDay() + 6) % 7;
  const out = {};
  for (let i = 0; i < todayIdx && uebrig > 0; i++) {
    if (!geplant.includes(i) || proTag[i]) continue;   // nicht geplant bzw. selbst gelaufen
    out[i] = true; uebrig--;
  }
  return out;
}

// Dieselbe Regel wie beim Gymplan, in Kalendertagen (siehe `_planHatBegonnen`).
function runPlanStatus(p) {
  return planStatus(p);
}

// Gegenstueck zu `buildPlanCard`. Ohne `plan` zeichnet sie den LAUFENDEN Plan (Uebersicht und
// Trainings-Tab), mit `plan` einen bestimmten — so entsteht die Liste im Plaene-Tab, in der
// nur der laufende Plan Fortschritt und Wochentagsstreifen mit Haken zeigt und alle anderen
// Statuschip und Laufzeit tragen (04.09.2026, eins zu eins wie beim Gymplan).
function buildRunPlanCard(onTap, plan, opts) {
  opts = opts || {};
  const p = plan || runPlanAktiv();
  if (!p) {
    // Die LEERE Karte bleibt immer antippbar — auch bei `onTap === false` (`false || …` faellt
    // auf das Standardziel zurueck). Sie ist eine Aufforderung („Tippe, um …"); stumm gestellt
    // stuende der Nutzer ohne Weg zum Anlegen da.
    return `<div class="plan-card-v2 run-plan" onclick="${onTap || "setPlansView('runplans');wischeZuTab('plans')"}" style="cursor:pointer">
      ${opts.filterOnTap ? `<div class="ppv-head">${wochenFilterTitel('ppv-name')}</div>` : ''}
      <div class="ppv-name" style="color:var(--text2)${opts.filterOnTap ? ';margin-top:6px' : ''}">Kein aktiver Laufplan</div>
      <div class="ppv-meta">Tippe, um einen Laufplan anzulegen.</div>
    </div>`;
  }
  const status = runPlanStatus(p);
  const laeuft = status === 'active';
  const todayIdx = (new Date().getDay() + 6) % 7;
  // Die Zustaende gelten der LAUFENDEN Woche — bei einem beendeten oder kuenftigen Plan waeren
  // sie sinnlos, und im Plan-Tab zeigt die Karte den Plan selbst (`opts.nurPlan`, dieselbe
  // Regel wie bei `buildPlanCard`).
  const zeigtWoche = laeuft && !opts.nurPlan;
  const st = zeigtWoche ? runWochenStatus() : null;
  const gelaufenAmTag = {};
  if (st) st.gelaufen.forEach(l => {
    const [y, m, d] = l.date.split('-').map(Number);
    gelaufenAmTag[(new Date(y, m - 1, d).getDay() + 6) % 7] = true;
  });
  const verschobenTage = zeigtWoche ? runVerschobeneTage() : {};
  const strip = WOCHENTAGE_KURZ.map((label, i) => {
    const cls = ['ppv-col'];
    const geplant = (p.runDays || []).includes(i);
    if (geplant) cls.push('training');
    if (gelaufenAmTag[i]) cls.push('done');
    // Lauftag, der durch einen Lauf an einem anderen Tag abgedeckt ist (`runVerschobeneTage`).
    if (verschobenTage[i] && !gelaufenAmTag[i]) cls.push('verschoben');
    // `opts.hideToday` ist das Gegenstueck zum gleichnamigen Parameter von `buildPlanCard`
    // — die Seite „Laufplan" im Plan-Tab schaltet das Heute-Feld damit ab.
    if (laeuft && i === todayIdx && !opts.hideToday) cls.push('today');
    // Gefuellt heisst „gelaufen", geplant und noch nicht gelaufen ist umrandet — siehe
    // `buildPlanCard` (13.09.2026).
    if (zeigtWoche && geplant && !gelaufenAmTag[i] && !verschobenTage[i]) cls.push('offen');
    if (opts.selectedIdx === i) cls.push('selected');
    // Auf der Seite „Laufen" waehlt ein Tipp den Tag aus — genau wie beim Gymwochenplan
    // (Leonard-Wunsch 04.09.2026). Ohne `dayOnTap` bleibt der Streifen reine Anzeige.
    const tap = (laeuft && opts.dayOnTap)
      ? ` onclick="event.stopPropagation();${opts.dayOnTap}(${i})" role="button" tabindex="0" aria-label="${label} öffnen"`
      : '';
    return `<div class="${cls.join(' ')}"${tap}><span class="ppv-wd">${label}</span></div>`;
  }).join('');
  // Woche N von M — gerechnet wie beim Trainingsplan, ab dem Montag der Startwoche.
  const wochen = runPlanWochen(p);
  let progress = '';
  if (laeuft) {
    const monStart = new Date(p.startDate); monStart.setHours(0, 0, 0, 0);
    monStart.setDate(monStart.getDate() - ((monStart.getDay() + 6) % 7));
    const num = Math.min(Math.max(Math.floor((Date.now() - monStart.getTime()) / (7 * 864e5)) + 1, 1), wochen || 1);
    const pct = Math.round(num / (wochen || 1) * 100);
    progress = `<div class="ppv-progress">
      <span class="ppv-wk">Woche ${num} / ${wochen}</span>
      <div class="ppv-bar"><div class="ppv-bar-fill" style="width:${Math.min(100, pct)}%"></div></div>
      ${st ? `<span class="ppv-adh">${st.done}/${st.planned} diese Woche</span>` : ''}
    </div>`;
  }
  // `onTap === false` = stumme Karte, siehe `buildPlanCard`.
  const inert = onTap === false;
  const kartenTipp = inert ? ''
    : ` onclick="${onTap || "setPlansView('runplans');wischeZuTab('plans')"}"`;
  return `<div class="plan-card-v2 run-plan plan-status-${status}${laeuft ? ' active' : ''}${inert ? ' karte-inert' : ''}"${kartenTipp}>
    <div class="ppv-head">
      ${opts.filterOnTap ? wochenFilterTitel('ppv-name')
        : `<div class="ppv-name">${PPV_ICON_LAEUFER}${escapeHtml(p.name || 'Laufplan')}</div>`}
      ${laeuft ? '' : `<span class="plan-status-chip plan-status-chip-${status}">${PLAN_STATUS_LABEL[status]}</span>`}
    </div>
    ${laeuft ? '' : planMetaZeile('lauf', p, `${fmtDateRange(p.startDate, p.endDate)}${wochen ? ` · ${wochen} Wochen` : ''}`)}
    ${progress}
    <div class="ppv-strip">${strip}</div>
  </div>`;
}



// Laufsymbol fuer die Herocard — Gegenstueck zu `heroDumbbellSvg`, nach Leonards Vorlage
// (Strichfigur im Laufschritt mit drei Tempolinien).
function heroRunnerSvg() {
  // KEINE Farbe im SVG: Der Aufrufer bestimmt sie ueber `color` (in der Herocard das
  // Hellgruen der Laufkreise). Beim Hantel-Symbol steht dort `var(--accent)`, weil es der
  // Tabfarbe folgen soll — der Lauf hat seine eigene Farbe.
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <circle cx="82" cy="26" r="11" fill="currentColor"/>
    <path d="M74 44 L92 38 L104 52" stroke="currentColor" stroke-width="11"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M74 44 L52 52 L58 70 L44 96" stroke="currentColor" stroke-width="12"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M58 70 L80 78 L86 100" stroke="currentColor" stroke-width="12"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M24 40 h20 M12 56 h30 M24 72 h20" stroke="currentColor" stroke-width="8"
          stroke-linecap="round" fill="none" opacity="0.85"/>
  </svg>`;
}

// `heroDumbbellSvg()` ist am 06.09.2026 entfallen — die grosse Hantel-Grafik gab es nur in
// der alten Herocard. Im Knopf steht jetzt `HANTEL_SVG`, eine fuer 14px gebaute Zeichnung.



// Karte der LAUFENDEN Einheit. Seit dem 06.09.2026 gibt es hier keinen Vorschau-Modus mehr —
// Vorschau und Ruhetag laufen ueber `buildHeuteHero`. Bewusst OHNE Laufteil: Waehrend eines
// Trainings ist die Karte der Bedienstand dieser Einheit, nicht die Tagesuebersicht.
function buildSessionCard(active, planDay, selDay, opts) {
  opts = opts || {};
  const processedEx = active ? active.exercises.filter(e=>e.done || e.skipped).length : 0;
  // Ohne Trainingstag (freies Training) den Namen der Einheit anhängen statt nur den Wochentag.
  // Der uebergebene `planDay` ist der Trainingstag des GEWAEHLTEN Wochentags — er gehoert nicht
  // zwangslaeufig zu dieser Einheit. Ein freies Training an einem Tag, dessen geplante Einheit
  // schon absolviert ist, trug deshalb faelschlich deren Namen im Titel („Push" statt „Freies
  // Training", Leonard-Meldung 13.09.2026). Der Name des Tags gilt nur, wenn die Einheit
  // wirklich zu ihm gehoert.
  const gehoertZumTag = !!(planDay && active && active.planDayId === planDay.id);
  const titleSuffix = gehoertZumTag ? escapeHtml(planDay.name)
    : (active && active.planDayName ? escapeHtml(active.planDayName)
    : (planDay ? escapeHtml(planDay.name) : ''));
  // Titel ist der TRAININGSTAG (Leonard-Wunsch 06.09.2026) — nicht mehr „Wochentag: Tag" mit
  // dem Etikett „LAUFENDE EINHEIT" darueber. Dass die Einheit laeuft, sagt die Uhr daneben.
  const titel = titleSuffix || dayFullName(selDay.dayKey);
  const pct = active && active.exercises.length
    ? (processedEx / active.exercises.length * 100) : 0;

  const paused = !!(active && active.paused);
  const pauseLabel = paused ? 'Fortsetzen' : 'Pausieren';
  const pauseIcon = paused ? HERO_ICON_PLAY : HERO_ICON_PAUSE;
  // Pause-Knopf hat nur Sinn, wenn ueberhaupt eine Kraft-Uebung im Workout steckt.
  const hatUebungen = !!(active && active.exercises.length);

  // Gleicher Aufbau wie die Karte „Heute": Titel links, darunter die Knoepfe ueber die volle
  // Breite mit 14px zum Rand und 14px dazwischen. Wo dort die Beschriftungen stehen, steht
  // hier der Fortschrittsbalken — Text ueber den Knoepfen gibt es keinen mehr
  // (Leonard-Wunsch 06.09.2026). Hantel-Grafik und Etikett sind mit dem Umbau entfallen.
  return `<div class="hero-v2 hero-heute hero-aktiv">
    <div class="hero-heute-titel hero-aktiv-titel">
      <span class="hero-aktiv-name">${titel}</span>
      <span class="hero-v2-timer">${fmtTimer(Math.floor(getElapsedMs(active)/1000))}</span>
    </div>
    <div class="hero-v2-progress-bar-thin"><div class="hero-v2-progress-fill-thin" style="width:${pct}%"></div></div>
    <div class="hero-heute-spalten${hatUebungen ? '' : ' einzeln'}">
      ${hatUebungen ? `<div class="hero-heute-spalte">
        <button class="hero-v2-btn hero-v2-btn-pause" onclick="togglePauseWorkout()">${pauseIcon}${pauseLabel}</button>
      </div>` : ''}
      <div class="hero-heute-spalte">
        <button class="hero-v2-btn hero-v2-btn-danger" onclick="confirmFinish()">${HERO_ICON_STOP}Beenden</button>
      </div>
    </div>
  </div>`;
}

// Herocard „Heute" (06.09.2026, Leonard-Vorgabe). Sie loest die frueheren Vorschau- und
// Ruhetag-Karten ab und behandelt Gym und Laufen als zwei gleichwertige Spalten:
// Titel „Heute" an derselben Stelle wie jeder andere Kartentitel, darunter je Sportart eine
// mittige Beschriftung mit der Einheit und darunter ein Knopf. Kein Ober- oder Untertitel und
// kein Symbol mehr — die Karte sagt in zwei Zeilen, was heute ansteht und was man tun kann.
// Die LAUFENDE Einheit hat weiter ihre eigene Karte (`buildSessionCard` im aktiven Modus):
// Dort gehoeren Uhr, Fortschritt und „Pausieren/Beenden" hin, nicht „Heute".
//
// `sport`: 'beide' (Uebersicht) · 'gym' (Trainings-Tab, Seite Gym) · 'lauf' (Seite Laufen).
// Umfang eines Trainingstags fuer die zweite Zeile der Gym-Herocard: Uebungen, Saetze und —
// sobald mindestens eine Einheit dieses Tags abgeschlossen ist — deren mittlere Dauer.
// Die Dauer stand frueher schon einmal in der Vorschau-Herocard (`avgDauerFuerTag`) und ist
// mit deren Umbau am 06.09.2026 entfallen; hier kommt sie zurueck.
// Einheiten OHNE `duration` zaehlen nicht mit — sonst zoege eine abgebrochene Aufzeichnung
// den Schnitt nach unten.
function gymTagUmfang(planDay) {
  const ex = planDay.exercises || [];
  if (!ex.length) return '';
  const saetze = ex.reduce((a, e) => a + peSets(e).length, 0);
  const dauern = DB.getWorkouts()
    .filter(w => w.planDayId === planDay.id && w.duration)
    .map(w => w.duration);
  const teile = [`${ex.length} ${ex.length === 1 ? 'Übung' : 'Übungen'}`, `${saetze} Sätze`];
  if (dauern.length) teile.push('Ø ' + fmtDur(Math.round(dauern.reduce((a, b) => a + b, 0) / dauern.length)));
  return teile.join(' · ');
}

function buildHeuteHero(planDay, selDay, opts) {
  opts = opts || {};
  const sport = opts.sport || 'beide';
  const spalten = [];

  if (sport !== 'lauf') {
    // Laeuft anderswo bereits eine Einheit, fuehrt der Knopf dorthin statt eine zweite zu starten.
    const anderswo = DB.getActive();
    const blockiert = !!anderswo && !(planDay && anderswo.planDayId === planDay.id
      && (selDay ? woDayIdx(anderswo) === selDay.idx : true));
    const laufIdx = anderswo ? woDayIdx(anderswo) : -1;
    let knopf;
    if (blockiert) {
      knopf = laufIdx >= 0
        ? `<button class="hero-v2-btn" data-sport="gym" onclick="jumpToWorkoutDay(${laufIdx})">
             ${HERO_ICON_HANTEL}Zur laufenden Einheit</button>`
        : `<button class="hero-v2-btn" data-sport="gym" disabled>${HERO_ICON_HANTEL}Einheit läuft</button>`;
    } else if (planDay) {
      const start = opts.previewOnClick || `startWorkout('${planDay.id}')`;
      knopf = `<button class="hero-v2-btn" data-sport="gym" onclick="${start}">${HERO_ICON_HANTEL}Einheit starten</button>`;
    } else {
      // KEIN Gym geplant: grauer Knopf ohne Verlauf (Leonard-Wunsch 07.09.2026). Die
      // Sportfarbe ist ein Versprechen — sie gehoert dem Tag, an dem etwas ansteht.
      // Bedienbar bleibt er trotzdem, freies Training geht immer.
      // „Freies Training" statt „Freies Training starten" (13.09.2026, Leonard-Entscheidung):
      // Mit der um 10 % groesseren Knopfschrift brach die lange Fassung in der Uebersicht auf
      // drei Zeilen um und wurde von der Karte abgeschnitten. Gilt in allen Tabs.
      knopf = `<button class="hero-v2-btn hero-v2-btn-grau" data-sport="gym" onclick="startFreeWorkout()">${HERO_ICON_HANTEL}Freies Training</button>`;
    }
    // Zweite Zeile unter dem Namen: Umfang des Tages (Leonard-Wunsch 07.09.2026). Sie steht
    // NUR auf der Seite „Gym" im Trainings-Tab (`opts.sport === 'gym'`) — in der Uebersicht
    // teilen sich zwei Sportarten die Breite, dort ist dafuer kein Platz.
    const meta = (opts.sport === 'gym' && planDay) ? gymTagUmfang(planDay) : '';
    spalten.push(`<div class="hero-heute-spalte">
      <div class="hero-heute-kopf">
        <div class="hero-heute-einheit">${planDay ? escapeHtml(planDay.name) : 'Kein Gym'}</div>
        ${meta ? `<div class="hero-heute-meta">${meta}</div>` : ''}
      </div>
      ${knopf}
    </div>`);
  }

  if (sport !== 'gym') {
    // Ueber dem Laufknopf steht das ZIEL des Tages — km und Zeit, ohne Zone
    // (Leonard-Vorgabe 06.09.2026). Welcher Tag gemeint ist, sagt `opts.runIdx`: Auf der Seite
    // „Laufen" folgt die Karte dem im Wochenplan gewaehlten Tag, genau wie die Gymkarte auf der
    // Nachbarseite (Leonard-Wunsch 06.09.2026). Ohne Angabe gilt heute.
    const tagD = new Date(); tagD.setHours(0, 0, 0, 0);
    if (opts.runIdx != null) tagD.setDate(tagD.getDate() - ((tagD.getDay() + 6) % 7) + opts.runIdx);
    const gepl = runGeplanteTage()[_dayKeyOf(tagD.getTime())];
    const u = gepl && gepl.einheit;
    const ziel = u ? [u.km ? fmtKm(u.km) : null, u.minutes ? fmtMin(u.minutes) : null].filter(Boolean).join(' · ') : '';
    // Kein Lauf geplant → grauer Knopf ohne Verlauf, dieselbe Regel wie beim Gym.
    spalten.push(`<div class="hero-heute-spalte">
      <div class="hero-heute-einheit">${ziel || (gepl ? 'Lauftag' : 'Kein Lauf')}</div>
      <button class="hero-v2-btn hero-v2-btn-lauf${gepl ? '' : ' hero-v2-btn-grau'}" data-sport="lauf"
              onclick="runLaeufeLaden({interactive:true})"
              ${runLaden ? 'disabled' : ''}>
        ${HERO_ICON_LAEUFER}${runLaden ? 'Lese …' : 'Lauf erledigt'}
      </button>
    </div>`);
  }

  // `hero-mit-meta` schaltet die enger gesetzte Fassung frei — sie holt genau den Platz
  // wieder herein, den die Zusatzzeile kostet (siehe CSS). Nur wo die Zeile wirklich steht.
  const hatMeta = spalten.some(sp => sp.includes('hero-heute-meta'));
  return `<div class="hero-v2 hero-heute${hatMeta ? ' hero-mit-meta' : ''}">
    <div class="hero-heute-titel">${escapeHtml(opts.titel || 'Heute')}</div>
    <div class="hero-heute-spalten${spalten.length === 1 ? ' einzeln' : ''}">${spalten.join('')}</div>
  </div>`;
}

// Symbole im Knopf, in Textgroesse. Als Konstanten, damit alle Knoepfe dasselbe nutzen.
// Die HANTEL loest am 06.09.2026 das Play-Dreieck ab (Leonard-Wunsch): Sie benennt die
// Sportart statt der Aktion und ist damit das Gegenstueck zum Laeufer im Nachbarknopf.
// Eigene, vereinfachte Zeichnung: Die fruehere grosse Hantel war fuer 72px gebaut und waere
// bei 14px zu einem grauen Fleck geworden.
const HANTEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 9v6M3.5 10.5v3M17.5 9v6M20.5 10.5v3M8 12h8"/></svg>';
const HERO_ICON_HANTEL  = `<span class="hero-btn-ic">${HANTEL_SVG}</span>`;
const HERO_ICON_LAEUFER = `<span class="hero-btn-ic">${heroRunnerSvg()}</span>`;
const HERO_ICON_PLAY  = '<span class="hero-btn-ic"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg></span>';
const HERO_ICON_PAUSE = '<span class="hero-btn-ic"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></span>';
const HERO_ICON_STOP  = '<span class="hero-btn-ic"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg></span>';
// Dieselben Symbole vor dem Titel der Wochenplan-Karten (Leonard-Wunsch 06.09.2026) — sie
// sagen auf einen Blick, welche Sportart die Karte zeigt. Eigene Klasse, weil sie dort der
// TITELgroesse folgen (16px) statt der Knopfschrift.
const PPV_ICON_HANTEL  = `<span class="ppv-name-ic">${HANTEL_SVG}</span>`;
const PPV_ICON_LAEUFER = `<span class="ppv-name-ic">${heroRunnerSvg()}</span>`;


// `buildRestHero` und `buildLaufHero` sind am 06.09.2026 entfallen — die Herocard „Heute"
// (`buildHeuteHero`) deckt Vorschau, Ruhetag und die Seite „Laufen" gemeinsam ab.

// Freies Training: Einheit ohne Trainingstag, Übungen werden unterwegs hinzugefügt.
function startFreeWorkout() {
  if (DB.getActive()) { showToast('Es läuft bereits eine Einheit'); return; }
  const vonAussen = _woStartVorbereiten();
  const wo = {
    id: 'wo_' + Date.now(), planDayId: null, planDayName: 'Freies Training',
    startTs: Date.now(), dayIdx: (new Date().getDay()+6) % 7, exercises: [],
  };
  DB.saveActive(wo);
  expandedAexIds.clear();
  _aexUserClosedAll = false;
  selectedWorkoutDayIdx = wo.dayIdx;
  _woStartZeigen(vonAussen);
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
  mitHeroFarbwechsel('#wo-session-card-wrap', renderWorkoutsScreen);
  // Die Uebungskarten des neuen Tags kommen gestaffelt herein (16.09.2026, Leonard-Wunsch) —
  // dieselbe Bewegung wie beim Seitenwechsel. Wochenplan-Karte und Herocard bleiben stehen: Die
  // eine ist der Umschalter, den man gerade antippt, die andere hat mit der Farbblende ihres
  // Knopfes (`mitHeroFarbwechsel`) schon ihre eigene Bewegung.
  // ERST zeichnen, DANN staffeln: Die Markierung des Wochentags und die Herocard sollen sofort
  // umspringen — ein Abgang der alten Karten haette den Tipp traege wirken lassen.
  _kartenStaffelEin(document.getElementById('active-ex-list'));
}

// Aus der Plan-Karte (Übersicht) in den Trainings-Tab auf einen bestimmten Wochentag springen.
// Tabwechsel MIT der Wischbewegung statt hartem Sprung (Leonard-Wunsch 01.09.2026).
// Bewusst OHNE `_suppressScrollSync`: Genau dadurch laeuft der Scroll-Handler aus
// `initTabScrollSync` mit und fuehrt Hintergrund-Crossfade, Theme und Nav waehrend der
// Bewegung nach; im Settle ruft er `_applyTabState` — dasselbe wie bei einer echten
// Wischgeste. `showScreen` dagegen scrollt hart (`behavior:'auto'`) und unterdrueckt den
// Handler, weil es fuer Sprunge aus Overlays und beim Start gedacht ist.
function wischeZuTab(name) {
  const container = document.getElementById('tab-container');
  const idx = TAB_ORDER.indexOf(name);
  // Aus einem Vollbild-Overlay heraus gibt es nichts zu wischen (der Tab-Container liegt
  // darunter) — dort bleibt es beim harten Wechsel.
  const imOverlay = ['plan-detail', 'day-detail', 'mehr'].includes(currentScreen);
  if (!container || idx < 0 || imOverlay || container.clientWidth <= 0) { showScreen(name); return; }
  if (currentScreen === name) return;
  // Wer Bewegung reduziert haben moechte, bekommt den Sprung.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showScreen(name); return;
  }
  _tabFahrt(container, idx * container.clientWidth);
}

// Die Fahrt von Tab zu Tab bei einem PROGRAMMATISCHEN Wechsel (Tipp auf eine Karte, auf die
// Laufanzeige-Pille, auf „Zur laufenden Einheit"). NICHT die Wischgeste — die macht
// weiterhin allein der Browser, hier fasst nichts sie an.
//
// WARUM VON HAND (12.09.2026, Leonard-Meldung „der Wechsel geschieht nicht ueber die
// Wischanimation"): Vorher stand hier `scrollTo({ behavior: 'smooth' })`. Seit dem
// 08.09.2026 traegt `#tab-container` aber `-webkit-overflow-scrolling: auto` (die
// Schwungphase sollte weg) — und damit faellt WebKits eigene weiche Fahrt auf einen harten
// Sprung zurueck. Beides zugleich gibt es nicht: entweder der Browser fuehrt den Scroller
// (dann mit Schwung) oder wir.
// ABGRENZUNG zu den zwei gescheiterten Versuchen vom 08.09.2026 (siehe CLAUDE.md): Die
// wollten das LOSLASSEN einer Wischgeste uebernehmen und kaempften dabei gegen den noch
// laufenden Momentum-Scroll des Geraets. Hier liegt kein Finger auf dem Glas und es gibt
// kein Momentum abzuwuergen — es ist eine reine Ansteuerung.
// ZUM ZURUECKNEHMEN genuegt es, den Aufruf oben wieder durch
// `container.scrollTo({ left: …, behavior: 'smooth' })` zu ersetzen.
const WISCH_MS = 320;
let _wischRaf = null;
function _tabFahrt(container, ziel) {
  if (_wischRaf) { cancelAnimationFrame(_wischRaf); _wischRaf = null; }
  const start = container.scrollLeft;
  const weg = ziel - start;
  if (!weg) return;
  // Das Einrasten muss waehrend der Fahrt aus sein: Bei `mandatory` zieht WebKit nach JEDEM
  // Schreiben von `scrollLeft` sofort auf den naechsten Rastpunkt und die Fahrt springt.
  // Am Ende landen wir exakt auf einem Rastpunkt, das Wiedereinschalten ruckelt also nicht.
  const snapVorher = container.style.scrollSnapType;
  container.style.scrollSnapType = 'none';
  // NOTBREMSE: `requestAnimationFrame` ruht, solange die Seite nicht sichtbar ist (App im
  // Hintergrund, versteckte Browser-Ansicht). Ohne sie bliebe die Fahrt auf halbem Weg
  // stehen UND `scroll-snap-type` auf `none` — der Tab-Container haette danach gar kein
  // Einrasten mehr. Der Wecker holt beides nach.
  let notbremse = null;
  const beenden = () => {
    if (_wischRaf) { cancelAnimationFrame(_wischRaf); _wischRaf = null; }
    if (notbremse) { clearTimeout(notbremse); notbremse = null; }
    container.style.scrollSnapType = snapVorher;
    container.removeEventListener('pointerdown', abbrechen);
  };
  // Wer waehrend der Fahrt selbst wischt, bekommt seinen Wisch: Die Fahrt bricht ab und der
  // Browser uebernimmt wieder. Ohne das schriebe die Animation gegen den Finger.
  const abbrechen = () => beenden();
  container.addEventListener('pointerdown', abbrechen, { once: true });
  notbremse = setTimeout(() => { container.scrollLeft = ziel; beenden(); }, WISCH_MS + 400);
  const t0 = performance.now();
  const schritt = (jetzt) => {
    const p = Math.min(1, (jetzt - t0) / WISCH_MS);
    container.scrollLeft = start + weg * (1 - Math.pow(1 - p, 3));   // ease-out
    if (p < 1) { _wischRaf = requestAnimationFrame(schritt); return; }
    container.scrollLeft = ziel;
    beenden();
  };
  _wischRaf = requestAnimationFrame(schritt);
}

// Von ueberall her zurueck zur laufenden Einheit: Tab, Seite UND Wochentag stellen sich
// gemeinsam auf sie ein. `showScreen('workouts')` allein genuegt NICHT — es liesse einen zuvor
// gewaehlten fremden Tag stehen und die Einheit bliebe unsichtbar (Leonard-Meldung 05.09.2026).
function oeffneLaufendeEinheit() {
  const wo = DB.getActive();
  if (!wo) return showScreen('workouts');
  const idx = woDayIdx(wo);
  if (idx >= 0) selectedWorkoutDayIdx = idx;
  workoutsViewMode = 'gym';
  // Erst zeichnen, dann wischen — dieselbe Reihenfolge wie in `jumpToWorkoutDay`: Der Tab
  // liegt schon (ausserhalb des Bildes) im DOM und zeigt die laufende Einheit bereits
  // richtig, waehrend er hereinwandert (Leonard-Wunsch 12.09.2026: die Pille soll wischen,
  // nicht springen). `wischeZuTab` faellt aus einem Vollbild-Overlay heraus von selbst auf
  // den harten Wechsel zurueck.
  renderWorkoutsScreen();
  wischeZuTab('workouts');
}

function jumpToWorkoutDay(idx) {
  selectedWorkoutDayIdx = idx;
  // Erst zeichnen, dann wischen: Der Trainings-Tab liegt bereits (ausserhalb des Bildes)
  // im DOM, der gewaehlte Tag ist also schon richtig, waehrend er hereinwandert.
  renderWorkoutsScreen();
  wischeZuTab('workouts');
}

// Wochenplan im Trainings-Tab: dieselbe Karte wie in Uebersicht und Plaene-Tab
// (Leonard-Wunsch 20.08.2026). Einziger Unterschied: Der angetippte Tag bleibt markiert,
// weil die Auswahl hier steuert, welcher Tag darunter angezeigt wird.
function renderWorkoutWeekStrip() {
  ensureSelectedDayIdx();
  const root = document.getElementById('wo-week-card');
  if (!root) return;
  const plan = getActivePlan();
  // Die Karte selbst tut hier NICHTS (`onTap: false`, Leonard-Wunsch 06.09.2026): Auf dieser
  // Seite ist sie der Tagesumschalter, ein Tipp daneben soll nicht in den Plan-Tab wischen.
  root.innerHTML = plan
    ? buildPlanCard(plan, /*onTap*/ false, /*hideToday*/ false, /*hideStatus*/ true, /*hideMeta*/ true,
                    { selectedIdx: selectedWorkoutDayIdx, dayOnTap: 'selectWorkoutDay' })
    : `<div class="plan-card-v2" onclick="showScreen('plans')" style="cursor:pointer">
         <div class="ppv-name" style="color:var(--text2)">Kein aktiver Trainingsplan</div>
         <div class="ppv-meta">Tippe, um einen Plan anzulegen oder zu aktivieren.</div>
       </div>`;
}

// Trainings-Tab: „Gym" (Krafttraining) und „Laufen" (gelaufene Einheiten).
let workoutsViewMode = 'gym';
function setWorkoutsView(mode) {
  const neu = (mode === 'laufen') ? 'laufen' : 'gym';
  if (neu !== workoutsViewMode) { _seitenWechsel('screen-workouts', 'workouts', () => _setWorkoutsView(neu)); return; }
  _setWorkoutsView(neu);
}
function _setWorkoutsView(mode) {
  // Die gewischte Woche der Laufseite gilt nur, solange man dort steht (Leonard-Entscheidung):
  // Beim Verlassen steht die Karte wieder auf dieser Woche.
  if (mode !== 'laufen') _laufWochenNr = null;
  workoutsViewMode = mode;
  renderWorkoutsScreen();
  // Der Tabhintergrund haengt an der gewaehlten SEITE (grau, wenn dort heute nichts ansteht) —
  // ohne diesen Aufruf bliebe er nach dem Seitenwechsel auf der Farbe der alten Seite stehen.
  if (currentScreen === 'workouts') setThemeBackground('workouts');
  // `wo-running` haengt an der gewaehlten Seite — ohne diesen Aufruf zoege die Klasse erst
  // beim naechsten Sekundentakt nach, und der Wochenplan blitzte kurz falsch auf.
  syncWorkoutActiveUI();
  seitenleisteAktualisieren();
}

function renderWorkoutsScreen() {
  // Welche Seite gewaehlt ist, zeigt die Seitenleiste unten — der fruehere
  // `.seg-toggle` im Kopf ist entfallen (08.09.2026).
  const vG = document.getElementById('wo-view-gym');
  const vL = document.getElementById('wo-view-laufen');
  if (vG) vG.style.display = workoutsViewMode === 'gym' ? '' : 'none';
  if (vL) vL.style.display = workoutsViewMode === 'laufen' ? '' : 'none';
  if (workoutsViewMode === 'laufen') { renderLaufKalenderSeite(); return; }
  _renderGymSeite();
}

function _renderGymSeite() {
  // Wechsel normal ↔ aktiv: Den ALTEN Stand festhalten, BEVOR er ueberschrieben wird
  // (siehe „Uebergang" direkt darunter). Jede Zeichnung beendet ausserdem eine noch laufende
  // Bewegung sauber.
  const uebergang = _woUebergangVorher();
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
    wrap.innerHTML = buildSessionCard(active, planDay, selDay);
  } else if (planDay) {
    wrap.innerHTML = buildHeuteHero(planDay, selDay, { sport: 'gym' });
  } else {
    // Seite „Gym" — die Laufhaelfte steht drueben auf der Seite „Laufen".
    wrap.innerHTML = buildHeuteHero(null, selDay, { sport: 'gym' });
    // Hoehe und Hantel wie in der Uebersicht ausrichten — die Karte soll dort und hier
    // identisch aussehen.
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
    // KEIN Knopf „Uebung zum Trainingstag hinzufuegen“ mehr auf der Seite „Gym“
    // (Leonard-Wunsch 08.09.2026). Uebungen kommen ueber die Seite „Gymtage“ im Plan-Tab
    // dazu; der Knopf der LAUFENDEN Einheit („+ Uebung hinzufuegen“) bleibt, der schreibt
    // in die Einheit selbst. Damit hat `openAddExModal('preview')` keinen Aufrufer mehr.
    addWrap.style.display = 'none';
    addWrap.innerHTML = '';
    stopTimer();
  } else {
    document.getElementById('ex-tab-bar').innerHTML = '';
    document.getElementById('active-ex-list').innerHTML = '';
    addWrap.style.display = 'none';
    stopTimer();
  }

  syncWorkoutActiveUI();
  checkStickyBar();
  if (uebergang) _woUebergangSpielen(uebergang);
}

// ── Uebergang normal ↔ aktiv auf der Seite „Gym" (15.09.2026, Leonard-Wunsch, Variante D) ──
// Beim START einer Einheit und beim BEENDEN (auch „Verwerfen") laufen drei Bewegungen zugleich:
//   1. Die Wochenplan-Karte klappt weg (Start) bzw. wieder auf (Ende) — `_woWocheFahren`.
//   2. Aus dem Knopf, der den Wechsel ausloest, breitet sich eine Welle in seiner Farbe ueber
//      die Herocard aus; darunter steht dann der neue Inhalt, und die Welle verblasst
//      (`_woHeroWelle`). Start: aus „Einheit starten"/„Freies Training", Ende: aus „Beenden".
//   3. Die alten Uebungskarten gleiten nacheinander hinaus, die neuen nacheinander herein
//      (`_woUebungenStaffel`).
// ABLAUF: Wer den Wechsel ausloest, merkt ihn vor (`_woUebergangVormerken`) und laesst die Seite
// neu zeichnen. `_renderGymSeite` haelt VOR dem Zeichnen den alten Stand fest (Herocard als
// HTML, Knopfposition, die alten Kartenknoten) und spielt NACH dem Zeichnen die Bewegung ab —
// die neue Seite steht also sofort richtig im DOM, die Bewegung ist nur die Bruecke dorthin.
// Verbraucht wird die Vormerkung nur, wenn der Trainings-Tab mit der Seite „Gym" gerade der
// sichtbare Bildschirm ist: So kann der Start aus der Uebersicht erst in den Tab WISCHEN und die
// Bewegung beim ANKOMMEN abspielen (der Settle ruft `_applyTabState` → `renderWorkoutsScreen`).
// Eine Vormerkung, die nach `WO_UEB_FRIST_MS` noch niemand abgeholt hat, verfaellt — sonst
// schluege sie bei irgendeiner spaeteren Zeichnung zu.
// KEINE Bewegung bei `prefers-reduced-motion` und im Querformat ab 1024px: Dort stehen
// Wochenplan und Herocard nebeneinander, und die Herocard wechselt beim Start die Breite.
// TOKEN: Jede Zeichnung der Seite zaehlt `_woUebergangNr` hoch und raeumt eine laufende Bewegung
// ab (`_woUebergangAufraeumen`). Die Fortsetzungen pruefen die Nummer — sonst fuegte eine
// verspaetete Staffel ihre Karten in eine inzwischen neu gezeichnete Liste ein.
// NOTBREMSE wie ueberall: Jede Teilbewegung endet spaetestens ueber einen Wecker, auch wenn die
// Zeitleiste des Dokuments steht (App im Hintergrund, versteckte Browser-Ansicht).
const WO_UEB_FRIST_MS = 3000;
const WO_UEB_KURVE = 'cubic-bezier(.2,.8,.2,1)';
let _woUebergang = null;          // vorgemerkt: { art: 'start' | 'ende', zeit }
let _woUebergangNr = 0;
let _woUebergangAufraeumen = [];
// Beim BEENDEN liegen erst „Einheit beenden?" und dann die Abschlussansicht ueber dem Tab — eine
// Bewegung dahinter saehe man nicht. Solange die Abschlussansicht offen ist, bleibt die Seite
// deshalb im aktiven Zustand stehen (`wo-running` bleibt gesetzt, es wird nicht neu gezeichnet);
// erst ihr Schliessen spielt die Bewegung (`closeModal`, Leonard-Entscheidung 15.09.2026).
let _woEndeHalten = false;

function _woUebergangVormerken(art) { _woUebergang = { art, zeit: Date.now() }; }

// Kann auf der Seite ueberhaupt eine Bewegung laufen? Fuer das Ende zusaetzlich: Die laufende
// Einheit steht gerade auf dem Bildschirm (`wo-running`).
function _woUebergangMoeglich() {
  if (_bewegungReduziert()) return false;
  if (window.matchMedia && window.matchMedia('(min-width: 1024px)').matches) return false;
  return currentScreen === 'workouts' && workoutsViewMode === 'gym';
}

function _woUebergangVorher() {
  _woUebergangNr++;
  _woUebergangAufraeumen.splice(0).forEach(f => f());
  const v = _woUebergang;
  if (!v || currentScreen !== 'workouts' || workoutsViewMode !== 'gym') return null;
  _woUebergang = null;
  if (Date.now() - v.zeit > WO_UEB_FRIST_MS || !_woUebergangMoeglich()) return null;
  const karte = document.querySelector('#wo-session-card-wrap > .hero-v2');
  // Nur vom passenden Ausgangszustand aus — steht schon der Zielzustand da (etwa weil
  // zwischendurch jemand neu gezeichnet hat), gibt es nichts zu ueberbruecken.
  if (!karte || karte.classList.contains('hero-aktiv') !== (v.art === 'ende')) return null;
  const knopfEl = karte.querySelector(v.art === 'start' ? '.hero-v2-btn[data-sport="gym"]' : '.hero-v2-btn-danger');
  let knopf = null;
  if (knopfEl) {
    const kr = karte.getBoundingClientRect(), br = knopfEl.getBoundingClientRect();
    const cs = getComputedStyle(knopfEl);
    knopf = { x: br.left + br.width / 2 - kr.left, y: br.top + br.height / 2 - kr.top,
              farbe: cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor };
  }
  const liste = document.getElementById('active-ex-list');
  return { art: v.art, nr: _woUebergangNr, knopf,
           karteKlassen: karte.className, karteInhalt: karte.innerHTML,
           uebungen: liste ? [...liste.children] : [] };
}

function _woUebergangSpielen(v) {
  Promise.all([_woWocheFahren(v), _woHeroWelle(v), _woUebungenStaffel(v)])
    .then(() => { if (v.nr === _woUebergangNr) _woUebergangAufraeumen = []; });
}

// Web-Animation als Promise, die GARANTIERT endet (Notbremse). Gemeinsamer Baustein des
// Modus-Uebergangs und des Seitenwechsels (`_seitenWechsel`).
function _animFahren(el, keyframes, opts) {
  return new Promise(res => {
    let anim;
    try { anim = el.animate(keyframes, opts); } catch (e) { res(); return; }
    let erledigt = false;
    const ende = () => { if (erledigt) return; erledigt = true; clearTimeout(wecker); res(); };
    const wecker = setTimeout(ende, (opts.duration || 0) + (opts.delay || 0) + 300);
    anim.onfinish = ende;
    anim.oncancel = ende;
  });
}

// 1. Wochenplan-Karte. Beim Start blendet `wo-running` sie sofort aus — `.wo-woche-faehrt` haelt
// sie fuer die Dauer der Bewegung sichtbar und schneidet den Inhalt ab (`overflow: hidden`).
// Gefahren wird die HUELLE `#wo-week-card`: Mit `overflow: hidden` liegt der 12px-Aussenabstand
// der Karte innerhalb der Huelle, die Hoehe umfasst also Karte UND Abstand darunter — es springt
// weder am Anfang noch am Ende.
function _woWocheFahren(v) {
  const huelle = document.getElementById('wo-week-card');
  if (!huelle || !huelle.firstElementChild) return Promise.resolve();
  huelle.classList.add('wo-woche-faehrt');
  const h = huelle.offsetHeight;
  const aufraeumen = () => {
    huelle.getAnimations().forEach(a => a.cancel());
    huelle.classList.remove('wo-woche-faehrt');
  };
  _woUebergangAufraeumen.push(aufraeumen);
  const offen = { height: h + 'px', opacity: 1 }, zu = { height: '0px', opacity: 0 };
  return _animFahren(huelle, v.art === 'start' ? [offen, zu] : [zu, offen],
                 { duration: 280, easing: WO_UEB_KURVE, fill: 'forwards' })
    .then(() => { if (v.nr === _woUebergangNr) aufraeumen(); });
}

// 2. Herocard. Die NEUE Karte steht schon im DOM; ihr Inhalt wird unsichtbar geschaltet
// (`.hero-ueb-verdeckt`), und darueber liegt eine Kopie des ALTEN Inhalts (`.hero-ueb-alt`,
// dieselben Klassen, aber ohne eigene Flaeche). Unsichtbar statt ueberdeckt: Im Transparenz-Modus
// ist die Kartenflaeche durchscheinend, der neue Inhalt schiene sonst durch den alten hindurch.
// Die Welle waechst aus der Mitte des alten Knopfs, bis sie die ganze Karte deckt (Radius = Weg
// zur fernsten Ecke); dann wechselt der Inhalt darunter und die Welle verblasst. Die Karte hat
// `overflow: hidden` und ihre Rundung schon — sie schneidet die Welle von selbst zu.
function _woHeroWelle(v) {
  const karte = document.querySelector('#wo-session-card-wrap > .hero-v2');
  if (!karte) return Promise.resolve();
  const alt = document.createElement('div');
  alt.className = v.karteKlassen + ' hero-ueb-alt';
  // Eigene Flaeche, Schatten, Aussenabstand und Hoehe weg — inline, damit auch die Glas-Regel
  // (hoehere Spezifitaet) sie nicht zurueckholt.
  alt.style.cssText = 'background:none;box-shadow:none;margin:0;height:auto';
  alt.innerHTML = v.karteInhalt;
  // Die Farbblende eines frueheren Tagwechsels (`mitHeroFarbwechsel`) haengt als Klasse am Knopf —
  // in der Kopie liefe sie sonst ein zweites Mal.
  alt.querySelectorAll('[class*="hero-farbe-von-"]').forEach(el =>
    [...el.classList].filter(c => c.startsWith('hero-farbe-von-')).forEach(c => el.classList.remove(c)));
  const w = karte.offsetWidth, hh = karte.offsetHeight;
  const k = v.knopf || { x: w / 2, y: hh / 2, farbe: 'var(--accent)' };
  const r = Math.hypot(Math.max(k.x, w - k.x), Math.max(k.y, hh - k.y));
  const welle = document.createElement('div');
  welle.className = 'hero-ueb-welle';
  Object.assign(welle.style, { left: (k.x - r) + 'px', top: (k.y - r) + 'px',
                               width: 2 * r + 'px', height: 2 * r + 'px', background: k.farbe });
  karte.classList.add('hero-ueb-verdeckt');
  // HINTER den neuen Inhalt anhaengen: `updateTimerDisplay` schreibt in ALLE `.hero-v2-timer`,
  // und wer nur den ersten sucht, findet so die echte Uhr.
  karte.append(alt, welle);
  const aufraeumen = () => { alt.remove(); welle.remove(); karte.classList.remove('hero-ueb-verdeckt'); };
  _woUebergangAufraeumen.push(aufraeumen);
  return _animFahren(welle, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
                 { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
    .then(() => {
      if (v.nr !== _woUebergangNr) return;
      alt.remove();
      karte.classList.remove('hero-ueb-verdeckt');
      return _animFahren(welle, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' });
    })
    .then(() => { if (v.nr === _woUebergangNr) aufraeumen(); });
}

// 3. Uebungskarten. Die NEUEN Karten hat die Zeichnung schon gebaut (samt Diagrammen); sie werden
// kurz aus der Liste genommen und die ALTEN Knoten wieder eingesetzt. Die alten gleiten von unten
// nach oben der Reihe nach hinaus, dann die neuen von oben nach unten herein. Karten unterhalb des
// Bildschirms bewegen sich nicht — bei acht Uebungen dauerte die Staffel sonst weit ueber eine
// Sekunde, ohne dass man etwas davon saehe. Die Verzoegerung ist deshalb auch nach der fuenften
// Karte gedeckelt.
function _woUebungenStaffel(v) {
  const liste = document.getElementById('active-ex-list');
  if (!liste) return Promise.resolve();
  const neu = [...liste.children];
  const alt = v.uebungen;
  const knopf = document.getElementById('wo-add-ex-wrap');
  if (!neu.length && !alt.length) return Promise.resolve();
  const imBild = el => el.getBoundingClientRect().top < window.innerHeight;
  neu.forEach(n => n.remove());
  alt.forEach(n => { n.style.pointerEvents = 'none'; liste.appendChild(n); });
  if (knopf) knopf.style.visibility = 'hidden';
  const aufraeumen = () => {
    [...alt, ...neu].forEach(n => n.getAnimations().forEach(a => a.cancel()));
    if (knopf) { knopf.getAnimations().forEach(a => a.cancel()); knopf.style.visibility = ''; }
  };
  _woUebergangAufraeumen.push(aufraeumen);
  const raus = alt.filter(imBild).reverse();
  alt.filter(n => !raus.includes(n)).forEach(n => { n.style.opacity = '0'; });
  return Promise.all(raus.map((n, i) => _animFahren(n,
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px)' }],
      { duration: 150, delay: i * 40, fill: 'forwards' })))
    .then(() => {
      // Hat inzwischen jemand neu gezeichnet, gehoert die Liste nicht mehr uns.
      if (v.nr !== _woUebergangNr || alt.some(n => n.parentNode !== liste)) return;
      alt.forEach(n => n.remove());
      neu.forEach(n => liste.appendChild(n));
      const rein = neu.filter(imBild);
      const verz = i => Math.min(i, 5) * 80;
      const bewegungen = rein.map((n, i) => _animFahren(n,
        [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
        { duration: 280, delay: verz(i), easing: WO_UEB_KURVE, fill: 'backwards' }));
      if (knopf) {
        knopf.style.visibility = '';
        bewegungen.push(_animFahren(knopf, [{ opacity: 0 }, { opacity: 1 }],
          { duration: 280, delay: verz(rein.length), fill: 'backwards' }));
      }
      return Promise.all(bewegungen);
    })
    .then(() => { if (v.nr === _woUebergangNr) aufraeumen(); });
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
    // BEARBEITBAR ist die Tabelle nur im Trainingstag-Detail (`mode === 'libday'`).
    // Auf der Seite „Gym" im Trainings-Tab steht dieselbe Karte NUR ZUM LESEN da
    // (13.09.2026, Leonard-Entscheidung: Gymtage werden ausschliesslich in ihrer
    // Detailansicht angepasst). Vorher oeffnete ein Tipp dort den Zahlenblock und schrieb
    // die Werte direkt in den Trainingstag — also in jeden Plan, der ihn verwendet.
    const editierbar = mode === 'libday';
    const zelle = (si, feld, wert) => editierbar
      ? `<div class="aex-v2-inp" style="--c:${col.c}" role="button" tabindex="0"
             data-np-ctx="preview" data-np-day="${planDay.id}" data-np-mode="${mode}" data-np-ei="${ei}" data-np-si="${si}" data-np-field="${feld}" data-np-label="${escapeHtml(ex.name)}"
             aria-label="${feld === 'reps' ? 'Wiederholungen' : 'Gewicht'} Satz ${si+1}"
             onclick="openNumpadFromInput(this)">${wert === '' ? '–' : wert}</div>`
      : `<div class="aex-v2-inp aex-v2-inp-lesen" style="--c:${col.c}">${wert === '' ? '–' : wert}</div>`;
    const ptRows = ptSets.map((s, si) => `<div class="aex-v2-srow">
            <span class="aex-v2-snum">${si+1}</span>
            ${zelle(si, 'reps', s.reps)}
            ${zelle(si, 'weight', s.weight)}
          </div>`).join('');
    return `<div class="aex-v2 ${collapsedCls}" id="aex-${ei}" data-ex="${exIdKey}" style="--c:${col.c};--c-bg:${col.bg}"
                 ondragstart="aexDragStart(event,${ei},'${mode}','${planDay.id}')"
                 ondragend="aexDragEnd(event)"
                 ondragover="aexDragOver(event,${ei})"
                 ondragleave="aexDragLeave(event)"
                 ondrop="aexDrop(event,${ei})">
      <div class="aex-v2-header" onclick="toggleAexCollapse('${exIdKey}', event)"
           onpointerdown="event.currentTarget.closest('.aex-v2').draggable=true"
           onpointerup="event.currentTarget.closest('.aex-v2').draggable=false">
        <div class="aex-v2-num">${ei+1}</div>
        <div class="aex-v2-info">
          <div class="aex-v2-name">${ex.name}</div>
          ${lastStr ? `<div class="aex-v2-last">${lastStr}</div>` : ''}
        </div>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
      </div>
      <div class="aex-v2-body">
        <div class="aex-v2-table">
          <div class="aex-v2-srow head"><span>Satz</span><span>Wdh.</span><span>kg</span></div>
          ${ptRows}
        </div>
        <div class="aex-v2-notes-col">
          <div class="aex-v2-notes">
            <textarea class="aex-v2-notes-area" data-ex-id="${ex.id}" placeholder="Notizen"
                      onchange="saveExerciseNote('${ex.id}', this.value)">${ex.notes || ''}</textarea>
          </div>
        </div>
      </div>
      <div class="aex-v2-actions">
        ${editierbar ? `<button class="btn btn-ghost btn-sm" onclick="addPreviewSet('${planDay.id}',${ei},'${mode}')">+ Satz</button>
        ${ptSets.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="removePreviewSet('${planDay.id}',${ei},'${mode}')">− Satz</button>` : ''}
        <button class="btn btn-ghost btn-sm aex-skip-btn" onclick="removeLibDayExercise(${ei})">Übung entfernen</button>` : ''}
        <button class="btn btn-ghost btn-sm aex-v2-details" onclick="toggleAexChart('${exIdKey}')">Details</button>
      </div>
      ${aexChartOffen.has(exIdKey) ? `<div class="aex-v2-chart">${exChartHTML(ex.id, 'aex-chart-' + exIdKey)}</div>` : ''}
    </div>`;
  }).join('');
  _renderAexCharts();
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
    const lastRoh = last ? `Zuletzt: ${last.sets.length}×${last.sets[0]?.reps||'?'} @ ${last.maxWeight} kg` : '';
    // Einordnung der heutigen Eingaben: Bestleistung der Übung und — sobald das heutige
    // Höchstgewicht über der letzten Einheit liegt — die Differenz dazu. Progressive
    // Steigerung ist der Zweck des Tagebuchs; das Rechnen dafür gehört nicht in den Kopf.
    const prW = getExercisePR(ex.exId || ex.id);
    const todayMax = Math.max(0, ...(ex.sets || []).map(s => parseFloat(s.weight) || 0));
    const diffToLast = (last && todayMax > 0) ? +(todayMax - last.maxWeight).toFixed(1) : 0;
    // Die Differenz gehoert zur ZULETZT-Zeile — sie vergleicht ja mit genau dieser Einheit
    // (Leonard-Wunsch 05.09.2026). „Best" steht allein auf der Zeile darunter.
    const diffStr = diffToLast > 0
      ? `<span class="aex-cmp-up">+${diffToLast} kg</span>`
      : (diffToLast < 0 ? `<span class="aex-cmp-down">${diffToLast} kg</span>` : '');
    const cmpStr = prW ? `<div class="aex-v2-cmp"><span class="aex-cmp-pr">Best ${prW} kg</span></div>` : '';
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
    return `<div class="aex-v2 ${stateCls} ${collapsedCls}" id="aex-${ei}" data-ex="${exIdKey}" style="--c:${col.c};--c-bg:${col.bg}"
                 ondragstart="aexDragStart(event,${ei},'active')"
                 ondragend="aexDragEnd(event)"
                 ondragover="aexDragOver(event,${ei})"
                 ondragleave="aexDragLeave(event)"
                 ondrop="aexDrop(event,${ei})">
      <div class="aex-v2-header" onclick="toggleAexCollapse('${exIdKey}', event)"
           onpointerdown="event.currentTarget.closest('.aex-v2').draggable=true"
           onpointerup="event.currentTarget.closest('.aex-v2').draggable=false">
        <div class="aex-v2-num">${ei+1}</div>
        <div class="aex-v2-info">
          <div class="aex-v2-name">${ex.name}</div>
          ${lastRoh ? `<div class="aex-v2-last">${lastRoh}${diffStr ? ` ${diffStr}` : ''}</div>` : ''}
          ${cmpStr}
        </div>
        <label class="aex-v2-done ${ex.done?'checked':''}" title="Ganze Übung als erledigt markieren">
          <input type="checkbox" aria-label="Ganze Übung als erledigt markieren" ${ex.done?'checked':''} onchange="toggleExDone(${ei},this.checked)">
          <div class="aex-v2-done-box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
        </label>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
      </div>
      <div class="aex-v2-body">
        <div class="aex-v2-table">
          <div class="aex-v2-srow head"><span>Satz</span><span>Wdh.</span><span>kg</span><span></span></div>
          ${setRows}
        </div>
        <div class="aex-v2-notes-col">
          <div class="aex-v2-notes">
            <textarea class="aex-v2-notes-area" data-ex-id="${ex.exId || ex.id}" placeholder="Notizen"
                      onchange="updateNotes(${ei},this.value)">${(getEx(ex.exId || ex.id)?.notes) || ''}</textarea>
          </div>
        </div>
      </div>
      ${ex.done
        ? `<div class="aex-v2-actions">
             <button class="btn btn-ghost btn-sm aex-v2-details" onclick="toggleAexChart('${exIdKey}')">Details</button>
           </div>`
        : (ex.skipped
        ? `<div class="aex-v2-actions">
             <button class="btn btn-ghost btn-sm" onclick="unskipExercise(${ei})">↻ Wieder aktiv setzen</button>
           </div>`
        : `<div class="aex-v2-actions">
             <button class="btn btn-ghost btn-sm" onclick="addSet(${ei})">+ Satz</button>
             ${ex.sets.length > 1 ? `<button class="btn btn-ghost btn-sm" onclick="removeSet(${ei})">− Satz</button>` : ''}
             <button class="btn btn-ghost btn-sm aex-skip-btn" onclick="skipExercise(${ei})">» Überspringen</button>
             <button class="btn btn-ghost btn-sm aex-v2-details" onclick="toggleAexChart('${exIdKey}')">Details</button>
           </div>`)}
      ${aexChartOffen.has(exIdKey) ? `<div class="aex-v2-chart">${exChartHTML(ex.exId || ex.id, 'aex-chart-' + exIdKey)}</div>` : ''}
    </div>`;
  }).join('');
  _renderAexCharts();
}

// ─── Ein/Aus-Klapp-State der Workout-Tab-Cards ─────────────────────
// Default: alle Cards eingeklappt. Klick auf den Card-Header togglet
// fuer die jeweilige Uebung (per exId). State ist in-memory pro Session.
const expandedAexIds = new Set();
function isAexExpanded(exId) { return expandedAexIds.has(exId); }

// Aufgeklappte Verlaufsdiagramme INNERHALB der Uebungskarten (Schluessel = Kartenschluessel).
// Standard ist zu; beim Zuklappen der Karte wird der Eintrag entfernt, damit das Diagramm
// beim naechsten Aufklappen wieder geschlossen ist (Leonard-Wunsch 28.08.2026).
const aexChartOffen = new Set();
function toggleAexChart(key) {
  if (aexChartOffen.has(key)) aexChartOffen.delete(key);
  else aexChartOffen.add(key);
  if (currentScreen === 'workouts') renderWorkoutsScreen();
  else if (currentScreen === 'day-detail') renderLibDayDetail();
}

// Diagramme in den Uebungskarten neu zeichnen. Eigene Liste, damit sie unabhaengig von
// Katalog und Einheiten-Detailansicht verwaltet werden.
let _aexCharts = [];
function _renderAexCharts() {
  _aexCharts.forEach(c => c.destroy());
  _aexCharts = [];
  document.querySelectorAll('.aex-v2-chart canvas').forEach(cv => {
    const chart = _zeichneExDiagramm(cv, cv.dataset.ex);
    if (chart) _aexCharts.push(chart);
  });
}
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
// ─── Auf- und Zuklappen mit Bewegung (12.09.2026, Leonard-Wunsch) ────────────────────
// Das Umschalten baut die ganze Kartenliste neu auf — eine CSS-Transition auf `.collapsed`
// liefe deshalb NIE: Das Element ist beim ersten Zeichnen schon im Endzustand.
// Darum wird die HOEHE DER KARTE von Hand gefahren (Web Animations API) und der Neuaufbau
// erst danach ausgeloest. Das erfasst alles auf einmal — Koerper, Aktionsleiste, Diagramm,
// die Zeile „Zuletzt" und das Polster des Kopfes —, ohne dass das Markup umgebaut werden
// muesste. Der Inhalt selbst springt sofort in seine Endlage und wird von `overflow: hidden`
// beschnitten; genau so sieht ein Akkordeon aus.
// BEIM ZUKLAPPEN wird die Klasse nur zum MESSEN gesetzt und sofort wieder entfernt (dazwischen
// zeichnet der Browser nicht, es ist also unsichtbar) — sonst waere der Inhalt schon weg,
// bevor sich die Karte bewegt, und es schrumpfte eine leere Flaeche.
const KLAPP_MS = 200;
// Faehrt `keyframes` auf `el` und ruft `fertig` GENAU EINMAL — am Ende der Bewegung, bei einem
// Abbruch oder spaetestens ueber die Notbremse. Gemeinsamer Baustein der Uebungskarten und der
// Muskelgruppen im Katalog (13.09.2026).
// `fertig` zeichnet in beiden Faellen die Liste neu und setzt damit den Endzustand; das
// geschieht im selben Arbeitsschritt wie das Ende der Bewegung, es blitzt also nichts dazwischen
// auf (die Animation haelt ihren Endwert nicht — `fill` ist bewusst nicht gesetzt).
// NOTBREMSE: Die Zeitleiste des Dokuments steht still, solange die Seite nicht sichtbar ist
// (App im Hintergrund, versteckte Browser-Ansicht) — `onfinish` kaeme dann NIE, das Element
// bliebe mit fester Hoehe stehen und die Liste wuerde nie neu gezeichnet. Der Wecker holt beides
// nach. Dieselbe Vorsichtsmassnahme wie in `_tabFahrt`.
function _klappBewegung(el, keyframes, fertig) {
  const anim = el.animate(keyframes, { duration: KLAPP_MS, easing: 'ease' });
  let erledigt = false;
  const ende = () => {
    if (erledigt) return;
    erledigt = true;
    clearTimeout(wecker);
    if (anim.playState === 'running') anim.cancel();
    fertig();
  };
  const wecker = setTimeout(ende, KLAPP_MS + 300);
  anim.onfinish = ende;
  anim.oncancel = ende;
}
// Faehrt die Hoehe von `el` von `von` nach `bis` (sichtbare Rahmenhoehen wie
// `getBoundingClientRect`) — fuer Kaesten, die aus dem NICHTS erscheinen oder GANZ
// verschwinden (Kalender-Fusszeile, Wettkampfkarte im Zeitstrahl; 13.09.2026).
// Das senkrechte Polster faehrt MIT: Bei `box-sizing: border-box` (global gesetzt) kann ein
// Kasten nicht flacher werden als sein Polster — ohne das bliebe bei Hoehe 0 ein 12px-Streifen
// stehen, und es spraenge am Anfang bzw. Ende genau darum.
// `overflow: hidden` und den Endzustand setzt der AUFRUFER (er weiss, ob inzwischen eine neuere
// Bewegung laeuft).
function _boxFahren(el, von, bis, fertig) {
  const cs = getComputedStyle(el);
  const pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
  const pad = pt + pb;
  const bild = (h) => (h < pad && pad > 0)
    ? { height: h + 'px', paddingTop: (h * pt / pad) + 'px', paddingBottom: (h * pb / pad) + 'px' }
    : { height: h + 'px', paddingTop: pt + 'px', paddingBottom: pb + 'px' };
  _klappBewegung(el, [bild(von), bild(bis)], fertig);
}
function _bewegungReduziert() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function _aexKarte(exId) {
  return document.querySelector(`.aex-v2[data-ex="${CSS.escape(String(exId))}"]`);
}
function _aexKlappAnimieren(el, auf, danach) {
  if (!el || _bewegungReduziert() || !el.animate) { danach(); return; }
  const von = el.getBoundingClientRect().height;
  el.classList.toggle('collapsed', !auf);
  const bis = el.getBoundingClientRect().height;
  if (!auf) el.classList.remove('collapsed');   // Inhalt bis zum Ende stehen lassen
  if (Math.abs(bis - von) < 1) { if (!auf) el.classList.add('collapsed'); danach(); return; }
  el.style.overflow = 'hidden';
  _klappBewegung(el, [{ height: von + 'px' }, { height: bis + 'px' }],
                 () => { el.style.overflow = ''; danach(); });
}

// ─── Muskelgruppen im Katalog klappen ebenso (13.09.2026, Leonard-Wunsch) ────────────
// Gleiche Dauer, gleiche Kurve, gleiche Notbremse wie die Uebungskarten — gefahren wird hier
// aber die LISTE (`.ex-list`), nicht die Gruppe: Die Gruppe mit `overflow: hidden` zu
// beschneiden, schnitte waehrend der Bewegung den weichen Schatten des Knopfes und der Liste ab.
// Die Liste hat `overflow: hidden` ohnehin, und ihr eigener Schatten liegt ausserhalb davon.
// FALLE Abstand: Zwischen Knopf und Liste liegen 11.2px (`margin-bottom` des Knopfes). Im
// EINGEKLAPPTEN Zustand verschmilzt dieser Abstand mit dem 14px-Abstand unter der Gruppe — die
// Gruppe ist dann nur so hoch wie ihr Knopf. Eine Liste mit Hoehe 0, die noch im Fluss steht,
// haelt die 11.2px dagegen fest: Es sprang am Anfang des Aufklappens und am Ende des Zuklappens
// um genau diesen Betrag. Deshalb faehrt die Liste ihren `margin-top` mit, von −11.2px (hebt den
// Knopfabstand auf) bis 0. Gelesen wird der Wert am Knopf, nicht fest verdrahtet.
// Der KOPF springt sofort in den neuen Zustand (`aria-expanded` dreht den Pfeil) — so dreht
// sich der Pfeil mit der Bewegung statt danach. (Die Anzahl „(4)", die bis zum 21.09.2026 dabei
// erschien bzw. verschwand, ist entfallen.)
function _exGruppe(key) {
  return document.querySelector(`#ex-view-list .ex-group[data-gruppe="${CSS.escape(key)}"]`);
}
function _gruppeKlappAnimieren(gruppe, auf, danach) {
  const liste = gruppe && gruppe.querySelector(':scope > .ex-list');
  const knopf = gruppe && gruppe.querySelector(':scope > .ex-group-btn');
  if (!liste || !knopf || _bewegungReduziert() || !liste.animate) { danach(); return; }
  knopf.setAttribute('aria-expanded', auf ? 'true' : 'false');
  const luecke = parseFloat(getComputedStyle(knopf).marginBottom) || 0;
  gruppe.classList.remove('collapsed');   // Liste in BEIDE Richtungen sichtbar halten
  const hoehe = liste.getBoundingClientRect().height;
  if (hoehe < 1) { danach(); return; }
  const zu    = { height: '0px', marginTop: -luecke + 'px' };
  const offen = { height: hoehe + 'px', marginTop: '0px' };
  _klappBewegung(liste, auf ? [zu, offen] : [offen, zu], danach);
}

// ─── Die drei Archive im Plan-Tab klappen ebenso (18.09.2026, Leonard-Wunsch) ────────
// „Archivierte Gympläne", „Archivierte Gymtage" und „Archivierte Laufpläne": gleiche 200ms,
// gleiche Kurve, gleiche Notbremse wie Muskelgruppen und Uebungskarten. Die archivierten
// Eintraege stehen dafuer in EINER Huelle hinter dem Knopf (`.archiv-inhalt`), gefahren wird
// deren Hoehe.
// BESCHNITTEN WIRD PER `clip-path`, NICHT per `overflow: hidden`: Die Karten und Kacheln haben
// weiche Schatten, und die Gymtag-Kacheln stossen seitlich direkt an die Huelle — mit
// `overflow: hidden` waeren die Schatten waehrend der Bewegung abgeschnitten und am Ende
// aufgeblitzt. Der Ausschnitt reicht seitlich und oben ueber die Huelle hinaus, nur seine
// Unterkante folgt der wachsenden Hoehe.
// Das Archiv steht immer ZULETZT in seiner Liste, darunter liegt nichts, was mitwandern
// muesste. Die Hoehe faehrt trotzdem mit: Beim Zuklappen weit unten zieht die Seite so
// gleichmaessig nach, statt am Ende um die ganze Archivhoehe zu springen.
// Der KNOPF springt sofort in den neuen Zustand, sein Pfeil dreht sich mit der Bewegung. Beim
// AUFklappen steht er nach dem Neuzeichnen schon gedreht da — er wird deshalb kurz in die alte
// Lage zurueckgesetzt, damit die Drehung laeuft.
// TOKEN (`_archivNr` an der Liste): Ein zweiter Tipp waehrend des Zuklappens entwertet dessen
// Neuzeichnen am Ende — sonst raeumte es das inzwischen wieder geoeffnete Archiv ab.
function _archivKlappen(listeId, auf, zeichnen) {
  const liste = document.getElementById(listeId);
  const nr = liste ? (liste._archivNr = (liste._archivNr || 0) + 1) : 0;
  if (!liste || _bewegungReduziert() || !liste.animate || !liste.clientWidth) { zeichnen(); return; }
  const zu = { height: '0px', clipPath: 'inset(-12px -24px 0px -24px)' };
  const offen = (h) => ({ height: h + 'px', clipPath: 'inset(-12px -24px -12px -24px)' });
  const kopfSetzen = (kopf, an) => {
    kopf.classList.toggle('expanded', an);
    kopf.setAttribute('aria-expanded', an ? 'true' : 'false');
  };
  if (auf) {
    zeichnen();
    const kopf = liste.querySelector(':scope > .plans-list-archive-header');
    const inhalt = liste.querySelector(':scope > .archiv-inhalt');
    if (kopf) { kopfSetzen(kopf, false); void kopf.offsetWidth; kopfSetzen(kopf, true); }
    const h = inhalt ? inhalt.getBoundingClientRect().height : 0;
    if (h < 1) return;
    _klappBewegung(inhalt, [zu, offen(h)], () => {});
    return;
  }
  const kopf = liste.querySelector(':scope > .plans-list-archive-header');
  const inhalt = liste.querySelector(':scope > .archiv-inhalt');
  if (kopf) kopfSetzen(kopf, false);
  const h = inhalt ? inhalt.getBoundingClientRect().height : 0;
  if (h < 1) { zeichnen(); return; }
  _klappBewegung(inhalt, [offen(h), zu], () => { if (liste._archivNr === nr) zeichnen(); });
}

function toggleAexCollapse(exId, ev) {
  if (ev) {
    // Klick auf die Erledigt-Box soll NICHT togglen. (Der frueher hier mitgeprüfte
    // Drag-Griff `.aex-drag-handle` ist entfallen — das Sortieren haengt am ganzen Kopf.)
    const t = ev.target;
    if (t.closest && t.closest('.aex-v2-done')) return;
  }
  const auf = !expandedAexIds.has(exId);
  if (auf) {
    expandedAexIds.add(exId);
  } else {
    expandedAexIds.delete(exId);
    aexChartOffen.delete(exId);      // Diagramm schliesst mit und bleibt zu
  }
  // Merken, ob der Nutzer bewusst alles zugeklappt hat (siehe ensureActiveExpanded)
  _aexUserClosedAll = expandedAexIds.size === 0;
  const neuZeichnen = () => {
    if (currentScreen === 'workouts') renderWorkoutsScreen();
    else if (currentScreen === 'day-detail') renderLibDayDetail();
  };
  _aexKlappAnimieren(_aexKarte(exId), auf, neuZeichnen);
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

  // Wer einen Satz abhakt, trainiert wieder — eine laufende Pause endet damit von selbst
  // (Leonard-Wunsch 05.09.2026). Nur beim Abhaken, nicht beim Zuruecknehmen: Ein irrtuemlich
  // gesetzter Haken soll die Uhr nicht ungewollt starten.
  const pauseBeendet = nowDone && wo.paused;
  if (pauseBeendet) {
    wo.pausedTotal = (wo.pausedTotal || 0) + (Date.now() - (wo.pausedAt || Date.now()));
    wo.pausedAt = null;
    wo.paused = false;
  }

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
  // ACHTUNG Reihenfolge: `ensureTimerActive` liest den Zustand aus dem Speicher — erst nach
  // `saveActive` aufrufen, sonst sieht es die Einheit noch als pausiert.
  if (pauseBeendet) { ensureTimerActive(); updateTimerDisplay(); showToast('Einheit fortgesetzt'); }
  renderWorkoutsScreen();
  // Kurze Rueckmeldung auf den Tipp (16.09.2026, Leonard-Wunsch) — nur beim SETZEN des Hakens.
  // Beim Zuruecknehmen waere ein Puls eine Belohnung fuer das Gegenteil.
  if (nowDone) _satzHakenPuls(exId, si);

  // Satzpause läuft nur ZWISCHEN Sätzen einer Übung. Nach dem letzten Satz gibt es nichts
  // mehr abzuwarten — dort folgt der Wechsel zur nächsten Übung, nicht die nächste Wdh.
  const stillOpen = ex.sets.some(s => !s.done);
  if (nowDone && stillOpen) startRestTimer(exId, ex.name);
  else if (allDone) stopRestTimer(true);   // letzten Satz früher abgehakt → laufende Pause beenden
  // Übung fertig → nächste offene Card aufklappen (gleiche Mechanik wie beim Erledigt-Haken)
  if (allDone) setTimeout(() => { expandNextExercise(); }, 50);
}

// Das Kaestchen des gerade abgehakten Satzes pulst einmal. Die Karte wird beim Abhaken neu
// gebaut, deshalb wird das Kaestchen NACH dem Zeichnen gesucht: ueber `data-ex` die Karte, darin
// das `si`-te Kaestchen. Ist die Uebung damit komplett, klappt die Karte zu — dann gibt es
// nichts mehr zu pulsen, und der Abschluss hat ohnehin seinen eigenen Moment.
function _satzHakenPuls(exId, si) {
  if (_bewegungReduziert()) return;
  const karte = _aexKarte(exId);
  const box = karte && karte.querySelectorAll('.aex-v2-setcheck')[si];
  if (!box || !box.offsetHeight) return;
  _animFahren(box, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: .35 }, { transform: 'scale(1)' }],
              { duration: 260, easing: 'ease-out' })
    .then(() => box.getAnimations().forEach(a => a.cancel()));
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

// ── Glas-Modus ─────────────────────────────────────────────────────────────────
// Schaltet ALLE Karten der App auf den durchsichtigen Stil der `.weitere-btn`-Knoepfe um.
// Der Zustand liegt in einem EIGENEN localStorage-Key, nicht in den Trainingsdaten: Eine
// reine Anzeige-Einstellung hat in der Drive-Sicherung nichts verloren (wie ft_ex_chart_modes).
const GLAS_KEY = 'ft_glas';
function glasAktiv() { try { return localStorage.getItem(GLAS_KEY) === '1'; } catch { return false; } }

function applyGlasModus() {
  const an = glasAktiv();
  document.documentElement.classList.toggle('glas', an);
  const btn = document.getElementById('glas-btn');
  if (btn) btn.setAttribute('aria-pressed', an ? 'true' : 'false');
}

// DER WECHSEL BLENDET UEBER (21.09.2026, Leonard-Wunsch): Der ganze Bildschirm blendet in 0.3s
// vom alten in den neuen Modus — die Variante „Ueberblendung", die am 18.09.2026 neben dem
// wachsenden Kreis aus dem Glas-Knopf zur Wahl stand. Der Kreis (`glas-kreis`, clip-path) ist
// damit entfallen.
// Gebaut mit der View Transitions API: Der Browser fotografiert den alten Zustand, `umschalten`
// baut den neuen, und die STANDARD-Kreuzblende des Browsers blendet vom einen ins andere. Die
// Klasse `glas-blende` setzt nur deren Dauer (CSS, `html.glas-blende::view-transition-*`) und
// haengt nur fuer diesen einen Wechsel am Dokument.
// Waehrenddessen nimmt die Seite keine Tipps an (die Browser-Ebene liegt darueber) — bei 0.3s
// unerheblich.
// OHNE die API (iOS vor 18) und bei `prefers-reduced-motion` springt es wie frueher.
const GLAS_BLENDE_MS = 300;   // muss zur `animation-duration` in style.css passen
function toggleGlasModus() {
  const umschalten = () => {
    try { localStorage.setItem(GLAS_KEY, glasAktiv() ? '0' : '1'); } catch {}
    applyGlasModus();
    // Diagramme neu zeichnen: Achsen- und Rasterfarben kommen aus JS, nicht aus dem CSS.
    _zeichneAlleDiagrammeNeu();
  };
  if (!document.startViewTransition || _bewegungReduziert()) { umschalten(); return; }
  const html = document.documentElement;
  html.classList.add('glas-blende');
  let vt;
  try { vt = document.startViewTransition(umschalten); }
  catch (e) { html.classList.remove('glas-blende'); umschalten(); return; }
  // NOTBREMSE: Die Zeitleiste steht, solange die Seite nicht sichtbar ist — `finished` kaeme
  // dann erst spaet. Die Klasse wirkt nur auf die Blende und ist harmlos, wird aber in jedem
  // Fall abgeraeumt.
  const weg = () => html.classList.remove('glas-blende');
  // `ready` scheitert, wenn der Browser den Uebergang ueberspringt (z. B. bei verdeckter Seite) —
  // unbehandelt stuende das als Fehler in der Konsole. Umgeschaltet wird trotzdem.
  vt.ready.catch(() => {});
  vt.finished.catch(() => {}).then(weg);
  setTimeout(weg, GLAS_BLENDE_MS + 400);
}

// Chart.js liest Textfarben aus seiner eigenen Vorgabe — die muss dem Modus folgen,
// sonst stehen dunkle Achsenbeschriftungen auf dem dunklen Schleier.
function _setzeChartFarben() {
  if (typeof Chart === 'undefined') return;
  const an = glasAktiv();
  Chart.defaults.color = an ? 'rgba(255,255,255,0.8)' : '#64748B';
  Chart.defaults.borderColor = an ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)';
}

function _zeichneAlleDiagrammeNeu() {
  _setzeChartFarben();
  if (currentScreen === 'exercises') renderExercisesScreen();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
  else if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'plans') renderPlansScreen();
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
  clearTimeout(_restLeerTimer);
  clearTimeout(_restDoneTimeout);
  _restDoneTimeout = setTimeout(hideRestDone, REST_DONE_MS);
}
function hideRestDone() {
  clearTimeout(_restDoneTimeout);
  _restDoneTimeout = null;
  _restLeisteAus();
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

// Die Satzpause faehrt seit dem 16.09.2026 von unten ein und wieder hinaus (Leonard-Wunsch) —
// vorher erschien und verschwand sie schlagartig. Die Fahrt macht das CSS (`transform` +
// `visibility`); hier wird nur der INHALT erst nach der Fahrt geleert, sonst faehrt ein leerer
// gruener Streifen ab. Die Dauer MUSS zur `transition` von `#rest-bar` passen.
const REST_FAHRT_MS = 260;
let _restLeerTimer = null;
function _restLeisteAus() {
  const bar = document.getElementById('rest-bar');
  if (!bar) return;
  bar.classList.remove('show');
  clearTimeout(_restLeerTimer);
  _restLeerTimer = setTimeout(() => {
    if (!bar.classList.contains('show')) { bar.innerHTML = ''; bar.classList.remove('done'); }
  }, REST_FAHRT_MS);
}

function renderRestBar() {
  const bar = document.getElementById('rest-bar');
  if (!bar) return;
  if (!restState) { _restLeisteAus(); return; }
  clearTimeout(_restLeerTimer);                     // sie kommt zurueck, bevor sie unten war
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
    // Dieselbe Bewegung wie beim Antippen (Leonard-Wunsch 12.09.2026). Die Karte steht hier
    // noch eingeklappt im DOM — `renderWorkoutsScreen` lief, bevor die Id im Satz war.
    _aexKlappAnimieren(_aexKarte(nextExId), true, () => renderWorkoutsScreen());
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
  // `wo-running` heisst seit dem 05.09.2026: Die laufende Einheit ist GERADE ZU SEHEN.
  // Vorher genuegte „eine Einheit laeuft und wir sind im Trainings-Tab" — dadurch blieb der
  // Wochenplan auch dann ausgeblendet, wenn ein FREMDER Tag gewaehlt war, und die schwebende
  // Pille war ebenfalls weg. Die Einheit war damit aus dem Tab heraus nicht mehr erreichbar
  // (Leonard-Meldung 05.09.2026). An der Klasse haengen: das Ausblenden des Wochenplans, das
  // Querformat-Grid und — neu — das Ausblenden der Pille.
  const einheitSichtbar = (active && currentScreen === 'workouts'
    && workoutsViewMode === 'gym' && woDayIdx(wo) === selectedWorkoutDayIdx)
    // Nach „Beenden" bleibt die Seite bis zum Schliessen der Abschlussansicht im aktiven
    // Zustand stehen — erst dann laeuft der Uebergang (`_woEndeHalten`).
    || (_woEndeHalten && currentScreen === 'workouts');
  document.documentElement.classList.toggle('wo-running', !!einheitSichtbar);
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
let addExContext = 'active'; // 'active' (laufende Einheit) | 'libday' (Trainingstag-Detail)

function openAddExModal(context) {
  // Kontext speichern — Default 'active' fuer Rueckwaerts-Kompatibilitaet
  addExContext = (context === 'libday') ? 'libday' : 'active';
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
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
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

  // Active-Kontext (Default): Uebung NUR der laufenden Einheit hinzufuegen.
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
  // Die Uebung bleibt in DIESER Einheit. Sie wandert seit dem 13.09.2026 NICHT mehr in den
  // Trainingstag (Leonard-Entscheidung: Gymtage werden ausschliesslich in ihrer
  // Detailansicht angepasst) — vorher trug sie sich dort automatisch ein und tauchte damit
  // in jedem kuenftigen Training dieses Tags auf, ohne dass man es angeordnet hatte.
  // Wer sie dauerhaft will, traegt sie unter Plan → Gymtage → Tag ein.
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
  // Steht die laufende Einheit gerade auf dem Bildschirm, bleibt die Seite bis zum Schliessen
  // der Abschlussansicht so stehen und wechselt DANN mit Bewegung (15.09.2026, Leonard-Wunsch).
  // MUSS vor `DB.clearActive` stehen — danach ist `wo-running` schon weg.
  _woEndeHalten = _woUebergangMoeglich() && document.documentElement.classList.contains('wo-running');
  DB.addWorkout(finalWo);
  DB.clearActive();
  stopTimer();
  syncWorkoutActiveUI();

  closeModal('modal-finish');

  // Aktuellen Tab neu rendern — egal ob Workouts oder Übersicht, der Active-Mode endet sofort
  // (ausser die Seite wartet auf das Schliessen der Abschlussansicht, siehe oben).
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts' && !_woEndeHalten) renderWorkoutsScreen();

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
      <div class="sum-stat"><span class="sum-stat-val" data-zaehl="dauer" data-ziel="${wo.duration || 0}">${fmtDur(wo.duration)}</span><span class="sum-stat-lbl">Dauer</span></div>
      <div class="sum-stat"><span class="sum-stat-val" data-zaehl="vol" data-ziel="${vol}">${fmtVol(vol)}</span><span class="sum-stat-lbl">Volumen</span></div>
      <div class="sum-stat"><span class="sum-stat-val" data-zaehl="zahl" data-ziel="${setCount}">${setCount}</span><span class="sum-stat-lbl">${setCount === 1 ? 'Satz' : 'Sätze'}</span></div>
      <div class="sum-stat"><span class="sum-stat-val" data-zaehl="zahl" data-ziel="${exCount}">${exCount}</span><span class="sum-stat-lbl">${exCount === 1 ? 'Übung' : 'Übungen'}</span></div>
    </div>
    ${deltaHTML}
    ${prHTMLBlock}
    ${setChangeHTML}`;
  _sumBelebung(body);
  openModal('modal-summary');
}

// ── Die Abschlussansicht kommt in Bewegung (16.09.2026, Leonard-Wunsch) ────────────────
// Die vier Kacheln zaehlen von null auf ihren Wert hoch, danach kommen Vergleichszeile,
// Bestleistungs-Karte, „Ausserdem"-Liste und der Hinweis auf den angepassten Trainingstag
// nacheinander von unten herein — dieselbe Staffel wie ueberall sonst.
// ALLES BEGINNT ERST, wenn das Blatt oben ist (`SUM_START_MS` ≈ die 250ms von `slideUp`);
// vorher liefe die Bewegung hinter dem hereinfahrenden Blatt.
// Die Zahlen stehen fertig im Markup und werden hier auf null zurueckgesetzt — so steht bei
// `prefers-reduced-motion` und wenn etwas schiefgeht immer der richtige Wert da.
const SUM_START_MS = 260, SUM_ZAEHL_MS = 900;
function _sumBelebung(body) {
  if (!body || _bewegungReduziert()) return;
  const zahlen = [...body.querySelectorAll('[data-zaehl]')];
  const formate = {
    dauer: v => fmtDur(Math.round(v)),
    vol:   v => fmtVol(v),
    zahl:  v => String(Math.round(v)),
  };
  zahlen.forEach(el => { el.textContent = formate[el.dataset.zaehl](0); });
  // Kacheln und Trainingstag stehen sofort — sie sind der Rahmen, in dem gezaehlt wird.
  const bloecke = [...body.children]
    .filter(el => !el.classList.contains('sum-day') && !el.classList.contains('sum-stats'));
  // Derselbe Baustein wie beim Seiten- und Tagwechsel, nur mit Vorlauf — und mit Aufraeumen am
  // Ende: Ohne das bliebe eine Karte bei `fill: 'backwards'` auf Deckkraft 0 stehen, falls die
  // Bewegung nie laeuft (App im Hintergrund).
  _kartenStaffelFahren(bloecke, SUM_START_MS)
    .then(() => bloecke.forEach(el => el.getAnimations().forEach(a => a.cancel())));
  setTimeout(() => zahlen.forEach(el =>
    _zahlHoch(el, Number(el.dataset.ziel) || 0, formate[el.dataset.zaehl], SUM_ZAEHL_MS)), SUM_START_MS);
}
// Zaehlt `el` von null auf `ziel` (ease-out) und schreibt den Endwert GARANTIERT — auch wenn
// `requestAnimationFrame` ruht, weil die Seite nicht sichtbar ist (Notbremse wie ueberall).
function _zahlHoch(el, ziel, format, dauer) {
  const t0 = performance.now();
  let raf = null;
  const fertig = () => {
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(wecker);
    el.textContent = format(ziel);
  };
  const wecker = setTimeout(fertig, dauer + 300);
  const schritt = (jetzt) => {
    const p = Math.min(1, (jetzt - t0) / dauer);
    if (p >= 1) { fertig(); return; }
    el.textContent = format(ziel * (1 - Math.pow(1 - p, 3)));
    raf = requestAnimationFrame(schritt);
  };
  raf = requestAnimationFrame(schritt);
}

function discardWorkout() {
  // Erst das aktuell offene Finish-Modal schließen, sonst überdeckt es das Confirm-Modal
  closeModal('modal-finish');
  setTimeout(() => {
    confirmAction('Einheit verwerfen?',
      'Die laufende Einheit wirklich verwerfen? Alle Eingaben gehen verloren.',
      () => {
        // Dieselbe Rueckwaerts-Bewegung wie beim Beenden (Leonard-Entscheidung 15.09.2026) —
        // vormerken, solange `wo-running` noch steht.
        if (_woUebergangMoeglich() && document.documentElement.classList.contains('wo-running')) {
          _woUebergangVormerken('ende');
        }
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
    else volEl.innerHTML = '<p style="font-size:var(--fs-neben);color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
  }

  // ── Karte 3: Letzte Einheiten ──
  renderRecentSessions();

  // ── Karte 4: PR-Liste ──
  const prEl = document.getElementById('hist-pr-list');
  if (prEl) {
    const prs = getAllPRs();
    prEl.innerHTML = prs.length
      ? prs.slice(0,10).map((pr, idx) => prHTML(pr, idx+1)).join('')
      : '<p style="font-size:var(--fs-neben);color:var(--text3);text-align:center;padding:8px 0">Noch keine PRs</p>';
  }

  _gleicheHoeheStatsKarten();
}

// Im HOCHFORMAT stehen „Volumenentwicklung" und „Volumen pro Muskelgruppe" untereinander und
// gleichen ihre Hoehe nicht von allein aus. Sie sollen gleich hoch sein (Leonard-Wunsch
// 01.09.2026), also wird die Muskelkarte auf die GEMESSENE Hoehe der Volumenkarte gesetzt.
// Gemessen statt fest verdrahtet, weil der Kopf der Volumenkarte je nach Breite ein- oder
// zweizeilig ist (Zeitraum-Auswahl + Kg/Saetze) und damit die Hoehe schwankt.
// Im Querformat macht das Grid die Angleichung selbst — dort wird nichts gesetzt.
function _gleicheHoeheStatsKarten() {
  const karten = document.querySelectorAll('#ex-view-stats > .chart-card-v2');
  const vol = karten[0], mus = karten[1];
  if (!vol || !mus) return;
  const querformat = window.matchMedia && window.matchMedia('(min-width: 1024px)').matches;
  if (querformat) { mus.style.minHeight = ''; return; }
  mus.style.minHeight = '';
  const h = vol.getBoundingClientRect().height;
  // Hoehe 0 heisst: Die Seite ist gerade nicht sichtbar (Vorab-Rendern) — dann nichts setzen.
  if (h > 0) mus.style.minHeight = Math.round(h) + 'px';
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
  // Read the current theme accent (so the chart matches the active tab).
  // Weiss NUR auf dem Schleier (der Glas-Modus gilt bloss innerhalb der Tabs) — sonst laege
  // die Linie in der Farbe des Untergrunds.
  const aufGlas = glasAktiv() && !!canvas.closest('.screen:not(#screen-mehr)');
  const accent = aufGlas ? '#ffffff'
    : (getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#0066ff');
  // Das Badge ueber dem letzten Punkt wird sonst in derselben Farbe gefuellt wie seine
  // Schrift — auf dem Schleier also weiss auf weiss und damit unlesbar (gemeldet 01.09.2026).
  const badgeFlaeche = aufGlas ? '#ffffff' : accent;
  const badgeSchrift = aufGlas ? '#0F172A' : '#fff';
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
        c.fillStyle = badgeFlaeche;
        c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
        c.fillStyle = badgeSchrift;
        c.textBaseline = 'middle';
        c.textAlign = 'center';
        c.fillText(txt, x + w/2, y + h/2);   // Mitte des Kastens, nicht des Punktes
        c.restore();
      }
    }]
  });
}

// ═══════════════════════════════════════════════════════════════════
//  LAUFEN — Tab 5
//  Zwei Quellen, klar getrennt:
//   • Die GELAUFENEN Einheiten kommen aus Leonards Google-Tabelle „Workout Data"
//     (Ordner „health auto export"). FitTrack liest sie nur — geschrieben wird dort nie.
//     Bewusst NUR diese eine Datei: HCC zieht die Pace zusaetzlich aus einem zweiten
//     Health-Blatt, hier reicht die Geschwindigkeit aus derselben Zeile.
//   • Die LAUFPLAENE liegen lokal wie alle FitTrack-Daten (ft_runplans) und wandern in
//     die Drive-Sicherung mit.
// ═══════════════════════════════════════════════════════════════════
const RUN_SHEET_ID = '1YJ3ke8Z2jS1KdJlKOnukUStMgvqqppnktAb8UVHDdgk';
// Eigener Berechtigungsbereich und eigener Token-Client. BEWUSST getrennt vom Drive-Zugang:
// Wuerde der Tabellen-Bereich an den bestehenden Client gehaengt, verlangte Google fuer die
// Sicherung eine neue Zustimmung — und solange der Bereich im Google-Projekt nicht
// freigeschaltet ist, waere die Drive-Sicherung mit kaputt.
const RUN_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const RUN_TOKEN_KEY = 'ft_run_token_exp';

const WOCHENTAGE_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
// Ausgeschriebene Namen nach demselben Index (0=Mo). `dayFullName` geht ueber den `dayKey`
// eines Wochenplan-Eintrags — der kann bei einem selbst gebauten Plan leer sein, hier ist
// der Index die sichere Quelle.
const WOCHENTAGE_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const HERZZONEN = ['', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5'];

let runTokenClient = null, runToken = null, runTokenExp = 0;
let runLaden = false, runFehler = '';

// Erkennt eine Laufeinheit an der Typ-Spalte — dieselbe Regel wie in HCC.
function istLauf(typ) { return /lauf|ausf(ü|ue)hren|run|jog/i.test(String(typ || '')); }
// „Hochintensives Intervalltraining" gehoert ebenfalls in den Laufbereich, hat aber keine
// sinnvolle Strecke: Dort zaehlen Dauer und Maximalpuls (Leonard-Wunsch 01.09.2026).
function istHiit(typ) { return /intervalltraining|hochintensiv|hiit/i.test(String(typ || '')); }

function runVerbunden() { return !!runToken && Date.now() < runTokenExp; }

function runInit() {
  if (runTokenClient || typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) return;
  runTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: DRIVE_CLIENT_ID, scope: RUN_SCOPE, callback: () => {},
  });
  try { runTokenExp = Number(sessionStorage.getItem(RUN_TOKEN_KEY) || 0); } catch (_) {}
}

// Wie driveRequestToken: MUSS immer enden. Google Identity ruft in der installierten PWA
// gelegentlich weder callback noch error_callback auf — ohne Zeitgrenze bliebe das
// Versprechen offen und der Ladezustand haengen.
function runRequestToken({ interactive = true } = {}) {
  return new Promise((resolve, reject) => {
    runInit();
    if (!runTokenClient) return reject(new Error('Google ist noch nicht geladen'));
    let fertig = false;
    const ende = (fn, arg) => { if (fertig) return; fertig = true; clearTimeout(t); fn(arg); };
    const t = setTimeout(() => ende(reject, new Error('Zeitüberschreitung bei der Google-Anmeldung')), DRIVE_TOKEN_TIMEOUT_MS);
    runTokenClient.callback = (r) => {
      if (r.error) return ende(reject, new Error(`Zugriff verweigert (${r.error})`));
      runToken = r.access_token;
      runTokenExp = Date.now() + (Number(r.expires_in || 3600) - 60) * 1000;
      try { sessionStorage.setItem(RUN_TOKEN_KEY, String(runTokenExp)); } catch (_) {}
      ende(resolve, runToken);
    };
    runTokenClient.error_callback = (e) => ende(reject, new Error(`Google-Anmeldung nicht möglich (${(e && (e.type || e.message)) || 'unbekannt'})`));
    runTokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}

// Eine Zeile der Tabelle → Laufeinheit. Die Spalten werden ueber die KOPFZEILE gesucht,
// nicht ueber feste Positionen: Health Auto Export haengt neue Spalten hinten an, feste
// Indizes waeren beim naechsten Export falsch.
function runZeileLesen(kopf, zeile) {
  const idx = (name) => kopf.findIndex(h => String(h).trim().toLowerCase() === name.toLowerCase());
  const val = (name) => { const i = idx(name); return i >= 0 ? zeile[i] : undefined; };
  const zahl = (name) => { const v = parseFloat(String(val(name) ?? '').replace(',', '.')); return isFinite(v) ? v : null; };
  const datumRoh = String(val('Date') ?? '').trim();
  if (!datumRoh) return null;
  const d = new Date(datumRoh);
  if (isNaN(d)) return null;
  const typ = String(val('Type') ?? '').trim();
  const hiit = istHiit(typ);
  if (!istLauf(typ) && !hiit) return null;
  const p = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    typ, art: hiit ? 'hiit' : 'lauf',
    minutes: zahl('Duration (min)'), km: zahl('Distance (km)'),
    avgHR: zahl('Avg HR'), maxHR: zahl('Max HR'),
    kmh: zahl('Speed (km/h)'), elevM: zahl('Elevation (m)'),
  };
}

// Laeufe aus der Tabelle holen und zwischenspeichern.
async function runLaeufeLaden({ interactive = false } = {}) {
  if (runLaden) return;
  runLaden = true; runFehler = '';
  renderLaufVerwaltung(); renderRunSourceCard();
  if (currentScreen === 'overview') renderOverview();
  else if (currentScreen === 'workouts') renderWorkoutsScreen();
  try {
    if (!runVerbunden()) await runRequestToken({ interactive });
    const kopfR = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${RUN_SHEET_ID}?fields=sheets.properties.title`,
      { headers: { Authorization: 'Bearer ' + runToken } });
    if (!kopfR.ok) throw new Error(
      kopfR.status === 403 ? 'Google verweigert den Zugriff. Zwei mögliche Gründe: die „Google Sheets API" ist im Projekt nicht eingeschaltet, oder dein Konto darf diese Tabelle nicht lesen.'
      : kopfR.status === 401 ? 'Die Anmeldung ist abgelaufen — bitte erneut auf „Verbinden" tippen.'
      : kopfR.status === 404 ? 'Diese Tabelle gibt es nicht (oder die hinterlegte Kennung stimmt nicht).'
      : `Tabelle nicht lesbar (${kopfR.status})`);
    const meta = await kopfR.json();
    const blatt = ((meta.sheets || [])[0] || {}).properties?.title;
    if (!blatt) throw new Error('Die Tabelle enthält kein Blatt');
    const r = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${RUN_SHEET_ID}/values/${encodeURIComponent(`'${blatt.replace(/'/g, "''")}'!A1:ZZ`)}`,
      { headers: { Authorization: 'Bearer ' + runToken } });
    if (!r.ok) throw new Error(`Tabelle nicht lesbar (${r.status})`);
    const werte = (await r.json()).values || [];
    if (werte.length < 2) throw new Error('Die Tabelle enthält keine Zeilen');
    const kopf = werte[0];
    const laeufe = werte.slice(1).map(z => runZeileLesen(kopf, z)).filter(Boolean);
    DB.saveRuns(laeufe);
  } catch (e) {
    // Ein fehlgeschlagenes fetch() meldet nur „Load failed" / „Failed to fetch" — das sagt
    // niemandem etwas. Ursache ist praktisch immer, dass die Anfrage gar nicht rausging.
    const roh = e.message || String(e);
    runFehler = /load failed|failed to fetch|networkerror/i.test(roh)
      ? 'Die Anfrage kam nicht bis zu Google — kein Netz, oder die App darf die Tabellen-Adresse nicht aufrufen.'
      : roh;
  } finally {
    runLaden = false;
    renderLaufVerwaltung(); renderRunSourceCard();
    // Die Knoepfe „Lauf erledigt" stehen in den Herocards beider Tabs — beide muessen
    // den neuen Stand zeigen, nicht nur die Einstellungen (06.09.2026).
    if (currentScreen === 'overview') renderOverview();
    else if (currentScreen === 'workouts') renderWorkoutsScreen();
    // Die Wettkampfseite lebt von genau diesen Daten: Erst mit dem Abruf wird aus einem
    // eingetragenen Termin eine Karte mit Werten. Ohne das bliebe sie nach dem eigenen
    // „Laufdaten holen" unveraendert stehen (06.09.2026).
    else if (currentScreen === 'plans' && plansViewMode === 'races') renderWettkaempfe();
  }
}

// Notiz zu EINER geplanten Laufeinheit. Die Zeile im Laufplan muss einzeilig bleiben, dort
// steht deshalb nur eine gekuerzte Vorschau; geschrieben wird in einem eigenen Fenster mit
// Platz fuer mehrere Zeilen (Leonard-Wunsch 04.09.2026).
let _runNoteZiel = null;

function openRunNote(id, woche, dayIdx) {
  const p = DB.getRunPlans().find(x => x.id === id);
  if (!p) return;
  _runNoteZiel = { id, woche, dayIdx };
  const u = runEinheit(p, woche, dayIdx) || {};
  const d = runEinheitDatum(p, woche, dayIdx);
  document.getElementById('run-note-title').textContent =
    `Notiz — ${WOCHENTAGE_KURZ[dayIdx]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  document.getElementById('run-note-text').value = u.note || '';
  openModal('modal-run-note');
}

function saveRunNote() {
  if (!_runNoteZiel) return closeModal('modal-run-note');
  const { id, woche, dayIdx } = _runNoteZiel;
  const text = document.getElementById('run-note-text').value.trim();
  setRunUnit(id, woche, dayIdx, 'note', text);
  // Die Vorschau von Hand nachziehen — ein Neuaufbau der Seite naehme den Feldern daneben
  // die noch nicht gespeicherten Eingaben (dieselbe Ueberlegung wie bei `setRunZone`).
  const knopf = document.querySelector(`.lp-notiz[data-woche="${woche}"][data-tag="${dayIdx}"]`);
  if (knopf) { knopf.textContent = text || 'Notiz'; knopf.classList.toggle('leer', !text); }
  _runNoteZiel = null;
  closeModal('modal-run-note');
}

// Detailansicht eines gelaufenen Tages — Gegenstueck zu `showHistDetail` fuer die
// Krafteinheiten (Leonard-Wunsch 04.09.2026). Sie zeigt alles, was die Tabelle „Workout Data"
// zu diesem Tag hergibt; Werte, die dort fehlen, bleiben WEG statt als „–" dazustehen.
// Ein Intervalltraining hat weder Strecke noch Tempo — die Kacheln entstehen deshalb aus einer
// gefilterten Liste und nicht aus einem festen Raster.
function showRunDetail(key) {
  const l = runNachTag()[key];
  if (!l) return;
  const [y, m, d] = key.split('-').map(Number);
  const datum = new Date(y, m - 1, d).toLocaleDateString('de-DE',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hiit = l.art === 'hiit';
  document.getElementById('run-detail-title').textContent =
    `${hiit ? 'Intervalltraining' : 'Lauf'} — ${datum}`;

  const kacheln = [
    !hiit && l.km != null   ? { wert: fmtKm(l.km),               label: 'Strecke' } : null,
    l.minutes != null       ? { wert: fmtMin(l.minutes),         label: 'Dauer' } : null,
    !hiit && l.kmh          ? { wert: fmtPace(l.kmh),            label: 'Pace' } : null,
    !hiit && l.kmh          ? { wert: `${(Math.round(l.kmh * 10) / 10)} km/h`, label: 'Tempo' } : null,
    l.avgHR != null         ? { wert: `${Math.round(l.avgHR)}`,  label: 'Ø Puls' } : null,
    l.maxHR != null         ? { wert: `${Math.round(l.maxHR)}`,  label: 'Max Puls' } : null,
    !hiit && l.elevM != null? { wert: `${Math.round(l.elevM)} m`, label: 'Höhenmeter' } : null,
  ].filter(Boolean);

  const geplant = runGeplanteTage()[key];
  const soll = geplant && geplant.einheit
    ? [geplant.einheit.km ? fmtKm(geplant.einheit.km) : null,
       geplant.einheit.minutes ? fmtMin(geplant.einheit.minutes) : null,
       geplant.einheit.zone || null].filter(Boolean).join(' · ')
    : '';

  document.getElementById('run-detail-body').innerHTML =
    `<div class="hd-stats run-detail-stats">`
    + kacheln.map(k => `<div class="hd-stat"><b>${k.wert}</b><span>${k.label}</span></div>`).join('')
    + `</div>`
    + `<div class="run-detail-zeile"><span>Kategorie</span><strong>${escapeHtml(l.typ || (hiit ? 'Intervalltraining' : 'Laufen'))}</strong></div>`
    + (geplant ? `<div class="run-detail-zeile"><span>Geplant</span><strong>${soll || escapeHtml(geplant.plan.name || 'Laufplan')}</strong></div>` : '')
    + (geplant && geplant.einheit && geplant.einheit.note
        ? `<div class="run-detail-notiz"><span>Notiz</span><p>${escapeHtml(geplant.einheit.note)}</p></div>` : '')
    + `<p class="run-detail-quelle">Aus der Tabelle „Workout Data" gelesen. FitTrack ändert dort nichts.</p>`;
  openModal('modal-run-detail');
}

// ── Laufplaene ─────────────────────────────────────────────────────
// Ein Plan ist ein DATIERTER Ablauf (Woche 1..N ab dem Startdatum), kein Wochenmuster wie
// die Trainingsplaene. Die Einheiten sind deshalb EINGEBETTET und nicht — wie die
// Trainingstage — geteilte Bausteine: „Woche 2, Dienstag, 8 km" gehoert zu genau einem Plan.
function runPlanWochen(plan) {
  if (!plan || !plan.startDate || !plan.endDate) return 0;
  const a = new Date(plan.startDate); a.setHours(0, 0, 0, 0);
  a.setDate(a.getDate() - ((a.getDay() + 6) % 7));          // Montag der Startwoche
  const b = new Date(plan.endDate); b.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil((Math.round((b - a) / 86400000) + 1) / 7));
}

// Datum einer Planeinheit. Wird GERECHNET, nicht gespeichert — verschiebt man den Plan,
// wandern alle Einheiten von selbst mit.
function runEinheitDatum(plan, woche, dayIdx) {
  const a = new Date(plan.startDate); a.setHours(0, 0, 0, 0);
  a.setDate(a.getDate() - ((a.getDay() + 6) % 7));
  a.setDate(a.getDate() + (woche - 1) * 7 + dayIdx);
  return a;
}

// Ein Laufplan darf offen enden (ohne `endDate` laeuft er weiter). Kalendertage, siehe
// `_planHatBegonnen`.
function runPlanAktiv() {
  return _laufenderPlanIn(DB.getRunPlans(), false);
}

function runEinheit(plan, woche, dayIdx) {
  return (plan.units || []).find(u => u.week === woche && u.dayIdx === dayIdx) || null;
}

// Alle geplanten Lauftage als Datumsschluessel → Einheit (fuer den Kalender).
function runGeplanteTage() {
  const map = {};
  DB.getRunPlans().forEach(p => {
    if (!p.startDate) return;
    const wochen = runPlanWochen(p);
    for (let w = 1; w <= wochen; w++) {
      (p.runDays || []).forEach(di => {
        const d = runEinheitDatum(p, w, di);
        map[_dayKeyOf(d.getTime())] = { plan: p, einheit: runEinheit(p, w, di) };
      });
    }
  });
  return map;
}

// Gelaufene Einheiten als Datumsschluessel → Lauf.
function runNachTag() {
  const map = {};
  DB.getRuns().forEach(l => { map[l.date] = l; });
  return map;
}

function fmtPace(kmh) {
  if (!kmh || kmh <= 0) return '–';
  const secProKm = 3600 / kmh;
  const m = Math.floor(secProKm / 60), s = Math.round(secProKm % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}
function fmtKm(v) { return v == null ? '–' : (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '') + ' km'; }
function fmtMin(v) {
  if (v == null) return '–';
  const m = Math.round(v);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`;
}

// ── Oberflaeche ────────────────────────────────────────────────────
// Die Laufinhalte sind seit 01.09.2026 auf zwei bestehende Tabs verteilt (Leonard-Wunsch,
// der eigene Tab „Laufen" ist entfallen):
//   • Trainings-Tab, Seite „Laufen"  → Ueberblick ueber die gelaufenen Einheiten
//   • Plaene-Tab, Seite „Laufplan"   → Laufplanverwaltung
let _laufOffeneWochen = new Set();  // mehrere Wochen duerfen gleichzeitig offen sein

// Ausgewaehlter Wochentag auf der Seite „Laufen". Vorbelegt mit HEUTE — dieselbe Bedienung
// wie im Gymteil (`selectedWorkoutDayIdx`), nur fuer die Laufseite.
let selectedRunDayIdx = null;
function selectRunDay(idx) {
  selectedRunDayIdx = idx;
  // Die Auswahl steuert nur noch die Herocard. Die Tageskarte darunter (samt ihrer Staffel)
  // ist am 21.09.2026 entfallen — die Laeufe der ganzen Woche stehen in „Diese Woche".
  mitHeroFarbwechsel('#wo-lauf-hero', renderLaufKalenderSeite);
}

// Die LAEUFE DIESER WOCHE als Liste unter den Summen der Karte „Diese Woche"
// (21.09.2026, Leonard-Wunsch „Variante A"): auf einen Blick, was die Woche bringt —
// UNABHAENGIG vom gewaehlten Tag im Laufwochenplan. Ersetzt die fruehere Tageskarte des
// gewaehlten Tags (`buildLaufTagKarte`), ihre Angaben stehen jetzt hier: Vorgabe, Zone,
// Notiz und — bei einem gelaufenen Tag — das Ist samt Weg in die Detailansicht.
// Eine Zeile je Tag mit geplantem ODER gelaufenem Lauf; auch schon gelaufene und Laeufe an
// ungeplanten Tagen stehen drin (Leonard-Entscheidung), sonst behauptete die Liste weniger,
// als die Summe darueber zaehlt.
// Die Scheibe traegt DIESELBEN Zustaende wie der Wochentagskreis der Karte darueber
// (`buildRunPlanCard`): gefuellt = gelaufen, Ring = geplant und offen, grau = verschoben
// (`runVerschobeneTage`). Die Vorgabe kommt aus derselben Quelle wie die Kennzahl „geplant"
// (`runGeplanteTage`).
// BEZUGSGROESSE DER LAENGENBALKEN: der laengste Lauf des GANZEN Plans (Leonard-Entscheidung
// 22.09.2026) — so sind die Wochen beim Wischen untereinander vergleichbar; in einer lockeren
// Woche sind dann eben alle Balken kurz. Die tatsaechlich gelaufenen Strecken zaehlen mit, sonst
// stiesse ein Lauf, der laenger war als jede Vorgabe, an den Rand des Balkens.
function _laufBezugKm() {
  const p = runPlanAktiv();
  let max = 0;
  const merke = km => { const k = Number(km) || 0; if (k > max) max = k; };
  if (p) {
    (p.units || []).forEach(u => merke(u.km));
    const wochen = runPlanWochen(p);
    const von = runEinheitDatum(p, 1, 0).getTime();
    const bis = runEinheitDatum(p, wochen, 6).getTime() + 864e5 - 1;
    DB.getRuns().forEach(l => {
      const [y, m, d] = l.date.split('-').map(Number);
      const t = new Date(y, m - 1, d).getTime();
      if (t >= von && t <= bis) merke(l.km);
    });
  } else {
    DB.getRuns().forEach(l => merke(l.km));
  }
  return max;
}
// Laengenbalken einer Zeile: heller Teil = Vorgabe, kraeftiger = tatsaechlich gelaufen
// (Leonard-Entscheidung). Ohne Kilometer (Intervalltraining, Tag ohne Vorgabe) gibt es keinen.
function _laufWzBalken(sollKm, istKm, maxKm) {
  const soll = Number(sollKm) || 0, ist = Number(istKm) || 0;
  if (!maxKm || (!soll && !ist)) return '';
  const breit = km => Math.max(3, Math.min(100, km / maxKm * 100));
  return `<div class="lauf-wz-balken" aria-hidden="true">
    ${soll ? `<i class="soll" style="width:${breit(soll).toFixed(1)}%"></i>` : ''}
    ${ist ? `<i class="ist" style="width:${breit(ist).toFixed(1)}%"></i>` : ''}
  </div>`;
}

function laufWochenListe(mo, istAktuell, maxKm) {
  const geplant = runGeplanteTage();
  const gelaufen = runNachTag();
  // „verschoben" und „heute" gibt es nur in der LAUFENDEN Woche: `runVerschobeneTage` rechnet
  // ausschliesslich fuer sie, und in einer anderen Woche gibt es kein Heute.
  const verschoben = istAktuell ? runVerschobeneTage() : {};
  const todayIdx = istAktuell ? (new Date().getDay() + 6) % 7 : -1;
  const zeilen = WOCHENTAGE_KURZ.map((label, i) => {
    const d = new Date(mo); d.setDate(mo.getDate() + i);
    const key = _dayKeyOf(d.getTime());
    const gepl = geplant[key], lauf = gelaufen[key];
    if (!gepl && !lauf) return '';
    const u = gepl && gepl.einheit;
    const zustand = lauf ? 'gelaufen' : (verschoben[i] ? 'verschoben' : 'offen');
    const vorgabe = u ? [u.km ? fmtKm(u.km) : '', u.minutes ? fmtMin(u.minutes) : ''].filter(Boolean).join(' · ') : '';
    const soll = !gepl ? '<span class="lauf-wz-leer">Nicht geplant</span>'
      : vorgabe || '<span class="lauf-wz-leer">Ohne Vorgabe</span>';
    const zone = u && u.zone ? `<span class="lauf-wz-zone">${escapeHtml(u.zone)}</span>` : '';
    const notiz = u && u.note ? `<div class="lauf-wz-notiz">${escapeHtml(u.note)}</div>` : '';
    // HEUTE steht seit dem 22.09.2026 nicht mehr als Wort rechts, sondern als dasselbe gruene
    // Feld hinter der Scheibe, das die Wochenplan-Karte fuer den heutigen Tag nutzt
    // (`.ppv-col.today`, Leonard-Wunsch).
    const ist = lauf ? (lauf.art === 'hiit' ? `HIIT ${fmtMin(lauf.minutes)}` : `${fmtKm(lauf.km)} gelaufen`)
      : verschoben[i] ? 'verschoben' : '';
    // Die Zeile hat ZWEI Ebenen: oben Scheibe, Vorgabe und Ist, darunter der Laengenbalken.
    const inhalt = `<div class="lauf-wz-oben">
        <span class="lauf-wz-feld${i === todayIdx ? ' heute' : ''}"><span class="lauf-wz-tag ${zustand}">${label}</span></span>
        <div class="lauf-wz-mitte"><div class="lauf-wz-soll">${soll}${zone}</div>${notiz}</div>
        ${ist ? `<span class="lauf-wz-ist">${ist}</span>` : ''}
        {{CHEV}}
      </div>
      ${_laufWzBalken(u && u.km, lauf && lauf.km, maxKm)}`;
    // Ein gelaufener Tag ist ein KNOPF in die Detailansicht des Laufs — derselbe kleine
    // Pfeil-Knopf wie in der Kalender-Fusszeile. Ein `<button>`, damit `initScrollHideNav`
    // ihn als Bedienelement erkennt.
    return lauf
      ? `<button type="button" class="lauf-wz" onclick="showRunDetail('${key}')">${inhalt.replace('{{CHEV}}', '<span class="cal-detail-chev">▾</span>')}</button>`
      : `<div class="lauf-wz">${inhalt.replace('{{CHEV}}', '')}</div>`;
  }).filter(Boolean);
  return zeilen.length ? `<div class="lauf-wochenliste">${zeilen.join('')}</div>` : '';
}

// ── DIE WOCHENKARTE IST WAAGERECHT WISCHBAR (22.09.2026, Leonard-Wunsch „Variante A") ──
// Alle Wochen des laufenden Laufplans liegen nebeneinander in EINEM Scroller mit CSS-Scroll-Snap
// — dieselbe Machart wie der Trainingskalender, die auf dem iPhone erprobt ist. Die Geste fuehrt
// allein der Browser; jede selbst gefahrene Wischbewegung ist in dieser App zweimal gescheitert
// (siehe „AM WISCHEN NICHTS AENDERN").
// PREIS, bekannt vom Kalender: `overscroll-behavior-x: contain` verhindert, dass die Geste an den
// Tab-Scroller durchschlaegt — ueber dieser Karte laesst sich der Tab also nicht per Wisch
// wechseln. Ohne das wandert der Tab mit und die Kartenbewegung bricht ab.
// DIE HOEHE FOLGT DER GEZEIGTEN WOCHE (Leonard-Entscheidung „darf springen"): Der Scroller
// braucht eine feste Hoehe, weil `overflow-x: auto` die Y-Achse mit beschneidet. Waehrend der
// Geste gilt die GROESSERE der beiden sichtbaren Wochen (sonst wird die naechste angeschnitten),
// nach dem Einrasten die der gezeigten.
// Ein Tipp auf den Titel fuehrt zurueck zur laufenden Woche.
let _laufWochenNr = null;        // angezeigte Planwoche (1..N); null = die laufende
let _laufWochenIdx = -1;         // zuletzt angezeigte Seite, damit Kopf und Punkte nur bei Wechsel neu gesetzt werden
const MONATE_KURZ = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function _laufWochenMontag(d) {
  const m = new Date(d); m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}
// „21.–27. Sep" bzw. ueber den Monatswechsel „28. Sep – 4. Okt".
function _laufWochenSpanne(mo) {
  const so = new Date(mo); so.setDate(so.getDate() + 6);
  return mo.getMonth() === so.getMonth()
    ? `${mo.getDate()}.–${so.getDate()}. ${MONATE_KURZ[so.getMonth()]}`
    : `${mo.getDate()}. ${MONATE_KURZ[mo.getMonth()]} – ${so.getDate()}. ${MONATE_KURZ[so.getMonth()]}`;
}
function _laufWochenTitel(abstand, nr) {
  if (abstand === 0) return 'Diese Woche';
  if (abstand === 1) return 'Nächste Woche';
  if (abstand === -1) return 'Letzte Woche';
  return 'Woche ' + nr;
}
// Summen einer Woche: gelaufen (Ist) und geplant (Soll) — dieselben Quellen wie die Liste.
function _laufWochenWerte(mo) {
  const von = mo.getTime();
  const bis = von + 7 * 864e5 - 1;
  const imZeitraum = (datum) => {
    const [y, m, d] = datum.split('-').map(Number);
    const t = new Date(y, m - 1, d).getTime();
    return t >= von && t <= bis;
  };
  let km = 0, min = 0, sollKm = 0;
  DB.getRuns().forEach(l => { if (imZeitraum(l.date)) { km += l.km || 0; min += l.minutes || 0; } });
  const geplant = runGeplanteTage();
  Object.keys(geplant).forEach(k => {
    if (imZeitraum(k) && geplant[k].einheit) sollKm += Number(geplant[k].einheit.km) || 0;
  });
  return { km, min, sollKm };
}
function laufWochenSeite(mo, istAktuell, maxKm) {
  const w = _laufWochenWerte(mo);
  return `<div class="lauf-wochen-seite">
    <div class="lauf-woche">
      <div class="lauf-kennz"><span class="lauf-kennz-v">${fmtKm(w.km)}</span><span class="lauf-kennz-l">gelaufen</span></div>
      <div class="lauf-kennz"><span class="lauf-kennz-v">${fmtMin(w.min)}</span><span class="lauf-kennz-l">Zeit</span></div>
      <div class="lauf-kennz"><span class="lauf-kennz-v">${w.sollKm ? fmtKm(w.sollKm) : '–'}</span><span class="lauf-kennz-l">geplant</span></div>
    </div>
    ${laufWochenListe(mo, istAktuell, maxKm)}
  </div>`;
}
// Kopf und Seitenanzeige auf die Seite `idx` setzen.
function _laufWochenAnzeige(sc, idx) {
  const titelEl = document.getElementById('lauf-wochen-titel');
  const datumEl = document.getElementById('lauf-wochen-datum');
  const mo = sc._montage[idx];
  if (!mo) return;
  const abstand = idx - sc._aktIdx;
  if (titelEl) titelEl.textContent = _laufWochenTitel(abstand, idx + 1);
  if (datumEl) datumEl.textContent = _laufWochenSpanne(mo);
  // Der Zurueck-Knopf steht nur da, wenn eine andere Woche im Bild ist.
  const zurueckEl = document.getElementById('lauf-wochen-zurueck');
  if (zurueckEl) {
    const zeigen = abstand !== 0;
    if (zeigen && zurueckEl.hidden) { zurueckEl.hidden = false; zurueckEl.classList.remove('kommt'); void zurueckEl.offsetWidth; zurueckEl.classList.add('kommt'); }
    else if (!zeigen) { zurueckEl.hidden = true; zurueckEl.classList.remove('kommt'); }
  }
  sc.parentElement.querySelectorAll('.lauf-wochen-punkte > i').forEach((p, i) =>
    p.classList.toggle('an', i === idx));
  const marke = sc.parentElement.querySelector('.lauf-wochen-leiste > i');
  if (marke) marke.style.left = (idx / Math.max(1, sc._montage.length - 1) * 100) + '%';
  _laufKmHervorheben(mo);   // die Saeule der gezeigten Woche im Diagramm darunter
}
// Nach einer Breitenaenderung Hoehen und Position nachziehen (Drehen, Querformat-Grid).
function _laufWochenBreitePruefen() {
  const sc = document.getElementById('lauf-wochen-scroll');
  if (!sc || !sc._neuMessen) return;
  const w = sc.clientWidth;
  if (!w || w === sc._breite) return;   // nur die BREITE zaehlt — die Hoehe setzen wir selbst
  sc._breite = w;
  sc._neuMessen();
}

// Zurueck zur laufenden Woche — der Kartentitel ist dafuer ein Knopf.
function laufWocheZurueck() {
  const sc = document.getElementById('lauf-wochen-scroll');
  if (!sc || !sc.clientWidth) return;
  sc.scrollTo({ left: sc._aktIdx * sc.clientWidth, behavior: _bewegungReduziert() ? 'auto' : 'smooth' });
}
// Scroller einrichten: Hoehen messen, Startseite anfahren, Kopf mitfuehren.
function _laufWochenWischEinrichten(sc, montage, aktIdx, startIdx) {
  sc._montage = montage;
  sc._aktIdx = aktIdx;
  const seiten = [...sc.querySelectorAll(':scope > .lauf-wochen-seite')];
  let hoehen = seiten.map(s => s.offsetHeight);            // gemessen, solange die Hoehe noch `auto` ist
  const setzeHoehe = (a, b) => { sc.style.height = Math.max(hoehen[a] || 0, hoehen[b] || 0) + 'px'; };
  // Nach einer Breitenaenderung (Drehen) stimmen weder die Hoehen noch die Position: Der Browser
  // fuehrt `scrollLeft` in PIXELN, eine Seite ist danach aber anders breit — ohne das steht auf
  // einmal eine andere Woche da. Beides wird deshalb neu gesetzt; die SEITE bleibt dieselbe.
  const neuMessen = () => {
    sc.style.height = 'auto';
    hoehen = seiten.map(s => s.offsetHeight);
    const i = Math.max(0, Math.min(seiten.length - 1, _laufWochenIdx));
    setzeHoehe(i, i);
    if (sc.clientWidth) sc.scrollLeft = i * sc.clientWidth;
  };
  sc._neuMessen = neuMessen;
  sc._breite = sc.clientWidth;
  // ZWEI Ausloeser, weil keiner allein reicht: Der ResizeObserver merkt auch eine Aenderung, die
  // nicht am Fenster haengt (Seitenwechsel, Querformat-Grid); das `resize`-Ereignis greift, wo
  // der Observer nicht liefert. Beide gehen durch dieselbe Pruefung auf die BREITE.
  if (window.ResizeObserver) new ResizeObserver(() => _laufWochenBreitePruefen()).observe(sc);
  setzeHoehe(startIdx, startIdx);
  _laufWochenIdx = startIdx;
  _laufWochenAnzeige(sc, startIdx);
  if (sc.clientWidth) sc.scrollLeft = startIdx * sc.clientWidth;
  if (seiten.length < 2) return;
  let ticking = false, settle = null;
  sc.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const w = sc.clientWidth;
      if (!w) return;
      const x = sc.scrollLeft / w;
      const grenze = seiten.length - 1;
      const i0 = Math.max(0, Math.min(grenze, Math.floor(x)));
      const i1 = Math.max(0, Math.min(grenze, Math.ceil(x)));
      setzeHoehe(i0, i1);
      const idx = Math.max(0, Math.min(grenze, Math.round(x)));
      if (idx !== _laufWochenIdx) { _laufWochenIdx = idx; _laufWochenAnzeige(sc, idx); }
      // Einrasten: ~90ms nach dem letzten Scroll-Tick, wie beim Tabwechsel.
      clearTimeout(settle);
      settle = setTimeout(() => {
        const j = Math.max(0, Math.min(grenze, Math.round(sc.scrollLeft / Math.max(1, sc.clientWidth))));
        _laufWochenNr = j + 1;
        setzeHoehe(j, j);
      }, 90);
    });
  }, { passive: true });
}

// ── AUSKLAPPBARES DIAGRAMM DER GEPLANTEN WOCHENKILOMETER (22.09.2026, Leonard-Wunsch) ──
// Steht als eigene Karte UNTER der Wochenkarte und ist im Aufbau dem Diagramm „Entwicklung"
// der Uebungen nachempfunden (`exChartHTML`): dieselbe Ueberschrift in Grossbuchstaben mit
// Ausklapp-Pfeil (`.ex-chart-block` / `.ex-chart-collapse` / `.ex-chart-wrap`), dieselbe Hoehe.
// SAEULEN statt einer Linie: Der Wert gehoert zu je einer Woche, nicht zu einem Zeitpunkt.
// Die laufende Woche steht kraeftig, die uebrigen gedaempft.
// Gezeigt wird die SUMME DER GEPLANTEN Kilometer je Planwoche — Einheiten ohne Kilometer
// (Intervalltraining) zaehlen mit 0.
// Zugeklappt ist der Ausgangszustand; der Zustand haelt, solange die App laeuft (wie der
// Gewicht/Wdh.-Umschalter der Uebungen, bewusst nicht gespeichert).
let _laufKmOffen = false;      // Karte „Diese Woche" — zugeklappt
let _lpKmOffen = true;         // Laufplan-Detailansicht — AUFGEKLAPPT (Leonard-Wunsch 22.09.2026)
let _laufKmChart = null;       // Instanz in der Wochenkarte
let _lpKmChart = null;         // Instanz in der Detailansicht

// Je Planwoche: geplante Kilometer, tatsaechlich gelaufene und ob die Woche VORBEI ist.
// Eine abgeschlossene Woche zeigt im Diagramm das IST statt des Solls (Leonard-Wunsch
// 22.09.2026) — was einmal gelaufen ist, ist die interessantere Zahl; der Plan steht weiter
// im Tooltip.
// `nurPlan` (Laufplan-Detailansicht): Dort stehen IMMER die geplanten Kilometer, nie das Ist
// (Leonard-Wunsch) — die Ansicht dient dem Planen, nicht dem Nachschauen.
function _laufKmDaten(plan, nurPlan) {
  const wochen = runPlanWochen(plan);
  const heuteMo = _laufWochenMontag(new Date()).getTime();
  const runs = DB.getRuns();
  return Array.from({ length: wochen }, (_, i) => {
    const mo = runEinheitDatum(plan, i + 1, 0);
    const von = mo.getTime(), bis = von + 7 * 864e5 - 1;
    let geplant = 0, gelaufen = 0;
    (plan.units || []).forEach(u => { if (Number(u.week) === i + 1) geplant += Number(u.km) || 0; });
    runs.forEach(l => {
      const [y, m, d] = l.date.split('-').map(Number);
      const t = new Date(y, m - 1, d).getTime();
      if (t >= von && t <= bis) gelaufen += Number(l.km) || 0;
    });
    return { mo, geplant, gelaufen, vorbei: !nurPlan && von < heuteMo };
  });
}

// DASSELBE DIAGRAMM AN ZWEI STELLEN (22.09.2026): in der Karte „Diese Woche" (zugeklappt, mit
// Ist-Werten und wandernder Hervorhebung) und in der LAUFPLAN-DETAILANSICHT unter dem Abschnitt
// „Einheiten" (aufgeklappt, immer nur die geplanten Kilometer). `welches` = 'lauf' | 'lp'.
// `klappbar: false` in der Detailansicht (22.09.2026, Leonard-Wunsch): Dort steht das Diagramm
// immer offen, die Ueberschrift ist deshalb Text statt Knopf.
const KM_DIAGRAMM = {
  lauf: { block: 'lauf-km-block', canvas: 'lauf-km-chart', nurPlan: false, klappbar: true  },
  lp:   { block: 'lp-km-block',   canvas: 'lp-km-chart',   nurPlan: true,  klappbar: false },
};
function _kmOffen(welches) { return welches === 'lp' ? true : _laufKmOffen; }

function laufKmDiagrammHTML(plan, welches) {
  welches = welches || 'lauf';
  const cfg = KM_DIAGRAMM[welches];
  if (!plan) return '';
  const daten = _laufKmDaten(plan, cfg.nurPlan);
  if (!daten.some(d => d.geplant > 0 || d.gelaufen > 0)) return '';   // nichts zu zeigen
  const offen = _kmOffen(welches);
  const kopf = cfg.klappbar
    ? `<button type="button" class="ex-chart-collapse" onclick="toggleKmDiagramm('${welches}')"
               aria-expanded="${offen ? 'true' : 'false'}">Wochenkilometer<span class="aex-v2-chev">${AEX_CHEV_SVG}</span></button>`
    : '<span>Wochenkilometer</span>';
  return `<div class="ex-chart-block${offen ? '' : ' collapsed'}" id="${cfg.block}">
      <div class="ex-item-body-label ex-chart-head">
        ${kopf}
      </div>
      <div class="ex-chart-body">
        <div class="ex-chart-wrap"><canvas id="${cfg.canvas}"></canvas></div>
      </div>
    </div>`;
}

function toggleKmDiagramm(welches) {
  welches = welches || 'lauf';
  const cfg = KM_DIAGRAMM[welches];
  const offen = !_kmOffen(welches);
  if (welches === 'lp') _lpKmOffen = offen; else _laufKmOffen = offen;
  const block = document.getElementById(cfg.block);
  if (!block) return;
  block.classList.toggle('collapsed', !offen);
  const knopf = block.querySelector('.ex-chart-collapse');
  if (knopf) knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
  // Erst beim Aufklappen zeichnen: Ein verstecktes Canvas hat keine Breite, Chart.js behielte
  // sonst die alten Masse (dieselbe Regel wie bei `toggleChartBlock`).
  if (!offen) return;
  if (welches === 'lp') _zeichneLpKmDiagramm();
  else {
    const sc = document.getElementById('lauf-wochen-scroll');
    _zeichneLaufKmDiagramm(sc && sc._montage ? sc._montage[Math.max(0, _laufWochenIdx)] : null);
  }
}

// Farben der Saeulen. ZWEI Unterscheidungen zugleich:
//   TON  — abgeschlossene Wochen (sie zeigen das Ist) in einem dunkleren Gruen als die
//          geplanten (Leonard-Wunsch 22.09.2026).
//   KRAFT— die GEZEIGTE Woche voll, die uebrigen gedaempft. Die volle Farbe ist dieselbe, die
//          ein angetippter Balken traegt (`hoverBackgroundColor`).
function _laufKmPalette(aufGlas) {
  return aufGlas
    ? { vorbei: 'rgba(255,255,255,0.95)', vorbeiMatt: 'rgba(255,255,255,0.55)',
        plan:   'rgba(255,255,255,0.75)', planMatt:   'rgba(255,255,255,0.35)' }
    : { vorbei: '#22A05B', vorbeiMatt: 'rgba(34,160,91,0.55)',
        plan:   '#4ADE80', planMatt:   'rgba(74,222,128,0.55)' };
}
function _laufKmVoll(daten, p) { return daten.map(d => d.vorbei ? p.vorbei : p.plan); }
function _laufKmFarben(daten, hervorIdx, p) {
  // OHNE hervorgehobene Woche (Laufplan-Detailansicht) stehen ALLE Saeulen in voller Farbe —
  // durchgehend gedaempft saehe das Diagramm dort nur blass aus.
  if (hervorIdx < 0) return _laufKmVoll(daten, p);
  return daten.map((d, i) => i === hervorIdx ? (d.vorbei ? p.vorbei : p.plan)
                                             : (d.vorbei ? p.vorbeiMatt : p.planMatt));
}
// Beim Wischen wandert die Hervorhebung mit — gerechnet ueber den MONTAG der gezeigten Seite,
// nicht ueber den Seitenindex: Liegt heute ausserhalb des Plans, hat der Scroller eine Seite
// mehr als das Diagramm Saeulen.
function _laufKmHervorheben(mo) {
  const c = _laufKmChart;
  if (!c || !mo || !c._daten) return;
  const idx = c._daten.findIndex(d => d.mo.getTime() === mo.getTime());
  c.data.datasets[0].backgroundColor = _laufKmFarben(c._daten, idx, c._pal);
  c.update('none');
}

// Die Wochenkarte („Diese Woche") und die Detailansicht teilen sich den Kern.
function _zeichneLaufKmDiagramm(mo) {
  _laufKmChart = _zeichneKmDiagramm('lauf', runPlanAktiv(), mo, _laufKmChart);
}
function _zeichneLpKmDiagramm() {
  const p = DB.getRunPlans().find(x => x.id === editingRunPlanId);
  _lpKmChart = _zeichneKmDiagramm('lp', p, null, _lpKmChart);
}

function _zeichneKmDiagramm(welches, plan, mo, alt) {
  if (alt) alt.destroy();
  const cfg = KM_DIAGRAMM[welches];
  const canvas = document.getElementById(cfg.canvas);
  if (!canvas || !plan || typeof Chart === 'undefined' || !_kmOffen(welches)) return null;
  const daten = _laufKmDaten(plan, cfg.nurPlan);
  // Weiss NUR dort, wo die Karte im Transparenz-Modus wirklich durchscheint. Die Detailansicht
  // des Laufplans steht auf `.mehr-card` und bleibt IMMER weiss — dort waeren weisse Saeulen
  // unsichtbar (siehe „Die Detailseite nimmt den Transparenz-Modus NICHT an").
  const aufGlas = glasAktiv() && !!canvas.closest('.screen:not(#screen-mehr)')
                  && !!canvas.closest('.chart-card-v2, .card, .aex-v2, .ex-list, .plan-section-card, .hero-v2');
  // In der Laufplan-Detailansicht tragen die Saeulen die TABFARBE des Plan-Tabs (Amber,
  // 22.09.2026, Leonard-Wunsch) — dort geht es um den Plan, nicht um die Sportart. Gelesen wird
  // `--accent` vom Body, damit die Farbe an einer Stelle steht.
  const tabFarbe = (getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#F59E0B');
  const pal = cfg.nurPlan
    ? { vorbei: tabFarbe, vorbeiMatt: _withAlpha(tabFarbe, 0.55), plan: tabFarbe, planMatt: _withAlpha(tabFarbe, 0.55) }
    : _laufKmPalette(aufGlas);
  const schrift = aufGlas ? 'rgba(255,255,255,0.8)' : '#64748B';
  const raster  = aufGlas ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)';
  // Hervorgehoben wird die gezeigte Woche; in der Detailansicht gibt es keine — dort steht
  // `hervorIdx` auf -1 und alle Saeulen sind gleich.
  const zeigt = mo || (cfg.nurPlan ? null : _laufWochenMontag(new Date()));
  const hervorIdx = zeigt ? daten.findIndex(d => d.mo.getTime() === zeigt.getTime()) : -1;
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: daten.map((_, i) => 'W' + (i + 1)),
      // ABGESCHLOSSENE Wochen zeigen das IST, laufende und kuenftige das SOLL.
      datasets: [{
        data: daten.map(d => d.vorbei ? d.gelaufen : d.geplant),
        backgroundColor: _laufKmFarben(daten, hervorIdx, pal),
        hoverBackgroundColor: _laufKmVoll(daten, pal),
        borderRadius: 4, borderWidth: 0, maxBarThickness: 34,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          title: (c) => 'Woche ' + (c[0].dataIndex + 1),
          // Im Tooltip stehen BEIDE Zahlen (Leonard-Wunsch): was geplant war und was gelaufen
          // wurde. „Gelaufen" bleibt weg, solange die Woche laeuft und noch nichts drin steht.
          label: (c) => 'Geplant: ' + fmtKm(daten[c.dataIndex].geplant),
          afterLabel: (c) => {
            // In der Detailansicht geht es nur um den PLAN — dort bleibt das Ist auch im
            // Tooltip weg (Leonard-Wunsch).
            if (cfg.nurPlan) return '';
            const d = daten[c.dataIndex];
            return (d.vorbei || d.gelaufen) ? 'Gelaufen: ' + fmtKm(d.gelaufen) : '';
          },
        } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: schrift, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 8 } },
        y: { beginAtZero: true, grid: { color: raster }, ticks: { color: schrift, font: { size: 11 }, precision: 0, callback: (v) => v + ' km' } },
      },
    },
  });
  // Fuer das Nachfuehren beim Wischen am Diagramm merken.
  chart._daten = daten;
  chart._pal = pal;
  return chart;
}

// ── Seite 1: Überblick über die gelaufenen Einheiten ───────────────
function renderLaufKalenderSeite() {
  const el = document.getElementById('wo-view-laufen');
  if (!el) return;
  // Zuoberst derselbe Laufwochenplan wie in der Uebersicht (Leonard-Wunsch 01.09.2026) —
  // hier aber MIT Tagesauswahl, genau wie der Gymwochenplan auf der Nachbarseite.
  if (selectedRunDayIdx === null) selectedRunDayIdx = (new Date().getDay() + 6) % 7;
  // Karte stumm (`onTap: false`) wie auf der Nachbarseite „Gym" — sie waehlt hier nur den Tag.
  const wochenplan = `<div id="wo-runplan-card">${buildRunPlanCard(
    /*onTap*/ false, null,
    { selectedIdx: selectedRunDayIdx, dayOnTap: 'selectRunDay' })}</div>`;
  // Herocard direkt unter dem Wochenplan — dieselbe Stelle wie im Gymteil
  // (Leonard-Wunsch 06.09.2026).
  const hero = `<div id="wo-lauf-hero">${buildHeuteHero(null, null,
    { sport: 'lauf', runIdx: selectedRunDayIdx })}</div>`;
  // Die Wochenkarte: eine Seite je Woche des laufenden Laufplans, waagerecht wischbar.
  const plan = runPlanAktiv();
  const heuteMo = _laufWochenMontag(new Date());
  let montage = [heuteMo], aktIdx = 0;
  if (plan) {
    const wochen = runPlanWochen(plan);
    montage = [];
    for (let w = 1; w <= wochen; w++) montage.push(runEinheitDatum(plan, w, 0));
    aktIdx = montage.findIndex(m => m.getTime() === heuteMo.getTime());
    // Liegt heute ausserhalb des Plans (kann bei einem offen endenden Plan vorkommen), kommt die
    // laufende Woche als eigene Seite ans Ende — sonst gaebe es keine Seite fuer „Diese Woche".
    if (aktIdx < 0) { montage.push(heuteMo); montage.sort((a, b) => a - b); aktIdx = montage.findIndex(m => m.getTime() === heuteMo.getTime()); }
  }
  const startIdx = Math.max(0, Math.min(montage.length - 1, (_laufWochenNr || aktIdx + 1) - 1));
  const bezugKm = _laufBezugKm();
  const seitenHTML = montage.map(m => laufWochenSeite(m, m.getTime() === heuteMo.getTime(), bezugKm)).join('');
  // Viele Wochen ergaeben zu viele Punkte (auf 375px passen rund 14) — dann zeigt ein schmaler
  // Strich mit Marke, wo man steht.
  const anzeige = montage.length < 2 ? ''
    : montage.length <= 14
      ? `<div class="lauf-wochen-punkte" aria-hidden="true">${montage.map(() => '<i></i>').join('')}</div>`
      : '<div class="lauf-wochen-leiste" aria-hidden="true"><i></i></div>';
  const titelHTML = montage.length > 1
    ? `<button type="button" class="chart-card-v2-title lauf-wochen-titel" id="lauf-wochen-titel"
               onclick="laufWocheZurueck()">Diese Woche</button>`
    : '<span class="chart-card-v2-title" id="lauf-wochen-titel">Diese Woche</span>';
  // Zurueck-Knopf LINKS NEBEN DEM DATUM (22.09.2026, Leonard-Wunsch): Er erscheint erst, sobald
  // eine andere als die laufende Woche im Bild ist. Dieselbe runde Form mit Kreispfeil wie im
  // Kopf des Uebersichts-Kalenders (`.cal-reset-btn`) — die App kennt damit nur EIN Zeichen fuer
  // „zurueck zur aktuellen Ansicht".
  const woche = `<div class="chart-card-v2 lauf-wochen-karte">
    <div class="chart-card-v2-head">
      ${titelHTML}
      <button type="button" class="info-btn cal-reset-btn lauf-wochen-zurueck" id="lauf-wochen-zurueck"
              onclick="laufWocheZurueck()" hidden
              aria-label="Zur aktuellen Woche" title="Zur aktuellen Woche">${CAL_RESET_SVG}</button>
      <span class="lauf-wochen-datum" id="lauf-wochen-datum"></span>
    </div>
    <div class="lauf-wochen-scroll" id="lauf-wochen-scroll">
      <span class="cal-sticky-anchor" aria-hidden="true"></span>
      ${seitenHTML}
    </div>
    ${anzeige}
    ${laufKmDiagrammHTML(plan)}
  </div>`;

  // Die Tageskarte des gewaehlten Tags ist am 21.09.2026 entfallen (Leonard-Wunsch) — die
  // Laeufe der ganzen Woche stehen jetzt in „Diese Woche" (`laufWochenListe`).
  el.innerHTML = wochenplan + hero + woche;
  _laufWochenWischEinrichten(document.getElementById('lauf-wochen-scroll'), montage, aktIdx, startIdx);
  _zeichneLaufKmDiagramm(montage[startIdx]);
}

// Verbindung zur Tabelle „Workout Data". Steht seit dem 04.09.2026 in den EINSTELLUNGEN
// (oberhalb des Papierkorbs), nicht mehr im Trainings-Tab — es ist eine Einrichtungssache,
// keine Trainingsinformation (Leonard-Wunsch).
function renderRunSourceCard() {
  const el = document.getElementById('run-source-card');
  if (!el) return;
  const laeufe = DB.getRuns();
  const stand = DB.getRunsStand();
  const standTxt = stand
    ? `Zuletzt gelesen: ${new Date(stand).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
    : 'Noch nie gelesen';
  el.innerHTML = `<div class="lauf-quelle">
      <div class="lauf-quelle-txt">
        <strong>${laeufe.length} ${laeufe.length === 1 ? 'Lauf' : 'Läufe'}</strong> aus „Workout Data"<br>
        <span class="lauf-dim">${escapeHtml(standTxt)}</span>
        ${runFehler ? `<div class="lauf-fehler">${escapeHtml(runFehler)}</div>` : ''}
      </div>
      <button class="btn btn-ghost btn-sm" onclick="runLaeufeLaden({interactive:true})" ${runLaden ? 'disabled' : ''}>
        ${runLaden ? 'Lese …' : (stand ? 'Aktualisieren' : 'Verbinden')}</button>
    </div>`;
}

// ── Seite 2: Laufplanverwaltung ────────────────────────────────────
let runplansArchiveExpanded = false;  // Ausklappzustand der Archiv-Sektion
function toggleRunplansArchive() {
  runplansArchiveExpanded = !runplansArchiveExpanded;
  _archivKlappen('runplans-list', runplansArchiveExpanded, renderLaufVerwaltung);
}

// Aufbau eins zu eins wie `renderPlans()` fuer den Gymplan (04.09.2026, Leonard-Wunsch):
// Jeder Plan ist dieselbe Karte; nur der LAUFENDE zeigt Fortschritt und Haken, die uebrigen
// Statuschip und Laufzeit. Das Archiv haengt hinter demselben Ausklapp-Knopf.
function renderLaufVerwaltung() {
  const el = document.getElementById('runplans-list');
  if (!el) return;
  autoArchivBeendetePlaene();
  const plaene = DB.getRunPlans();
  const offen = plaene.filter(p => !p.archived).sort((a, b) => (a.startDate || 0) - (b.startDate || 0));
  const archiv = plaene.filter(p => p.archived).sort((a, b) => (b.startDate || 0) - (a.startDate || 0));

  if (!plaene.length) {
    el.innerHTML = `<div class="plan-day-empty" style="margin:24px 14px">Noch kein Laufplan — tippe auf das + oben rechts, um deinen ersten Plan anzulegen.</div>`;
    return;
  }
  // Ohne Heute-Feld, genau wie die Gymplan-Liste nebenan (Leonard-Wunsch 12.09.2026).
  const zeile = (p) => buildRunPlanCard(`openRunPlanDetail('${p.id}')`, p, { hideToday: true, nurPlan: true });

  let html = offen.map(zeile).join('');
  if (archiv.length) {
    const auf = runplansArchiveExpanded;
    html += `<button type="button" class="plans-list-archive-header${auf ? ' expanded' : ''}"
                     aria-expanded="${auf}" onclick="toggleRunplansArchive()">
      <span class="plan-day-collapse-label">Archivierte Laufpläne</span>
      <span class="plan-day-collapse-count">${archiv.length}</span>
      <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
    </button>`;
    if (auf) html += `<div class="archiv-inhalt">${archiv.map(zeile).join('')}</div>`;
  }
  el.innerHTML = html;
}

// Datumsfeld: sichtbar ist ein gewoehnlicher Kasten, das native `<input type="date">` liegt
// unsichtbar darueber. Grund: Die Masse eines nativen Datumsfeldes legt der BROWSER fest —
// auf iOS anders als in Chrome. Dadurch sprengte „Ende" die Spalte und „Wettkampf" lief
// ueber den Kartenrand hinaus (Leonard-Meldung 04.09.2026). So bestimmt allein das CSS die
// Breite, das Antippen oeffnet unveraendert den nativen Datumswaehler. Dasselbe Muster wie
// beim Wochenplan im Plan-Detail (`.wpe-select`).
function lpDatumFeld(ts, onChange, id) {
  // ACHTUNG Zeitzone: `setRunPlan` speichert LOKALE Mitternacht (`… + 'T00:00:00'`).
  // Mit `toISOString()` gelesen ist das in Mitteleuropa 22:00 des VORTAGS — das Feld zeigte
  // dadurch einen Tag zu frueh an, und jedes erneute Speichern schob das Datum ein weiteres
  // Mal zurueck (gefunden 04.09.2026). Beide Darstellungen kommen deshalb aus den LOKALEN
  // Datumsteilen. Die Trainingsplaene sind nicht betroffen: `_msToDate`/`_dateToMs` rechnen
  // beide in UTC und bleiben damit unter sich stimmig.
  const p2 = (n) => String(n).padStart(2, '0');
  const d = ts ? new Date(ts) : null;
  const iso = d ? `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` : '';
  const txt = d ? `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}` : '–';
  return `<div class="lp-datum${ts ? '' : ' leer'}"><span class="lp-datum-txt">${txt}</span>
    <input type="date" class="lp-datum-inp"${id ? ` id="${id}"` : ''} value="${iso}" onchange="${onChange}"></div>`;
}

// ── Laufplan-Detail: eigene Seite, kein Aufklappen mehr ────────────
// Aufbau und Bedienung sind dem Trainingsplan-Detail nachempfunden (04.09.2026,
// Leonard-Wunsch): Vollbild-Overlay, Zurueck-Knopf oben links, Abschnitte auf `.mehr-card`.
// Dass die Abschnitte auf `.mehr-card` stehen statt auf `.chart-card-v2` ist KEIN Zufall —
// `.mehr-card` fehlt in der Glas-Liste und bleibt deshalb auch im Transparenz-Modus weiss,
// genau wie das Gymplan-Detail.
let editingRunPlanId = null;

function openRunPlanDetail(id) { editingRunPlanId = id; showScreen('runplan-detail'); }
function closeRunPlanDetail() { editingRunPlanId = null; showScreen('plans'); }

function renderRunPlanDetail() {
  const p = DB.getRunPlans().find(x => x.id === editingRunPlanId);
  if (!p) { showScreen('plans'); return; }
  const wochen = runPlanWochen(p);
  const zeitraum = (p.startDate && p.endDate) ? fmtDateRange(p.startDate, p.endDate) : '—';
  document.getElementById('runplan-detail-title').textContent = p.name || 'Laufplan';
  document.getElementById('runplan-detail-subline').innerHTML =
    `${zeitraum} · ${wochen} ${wochen === 1 ? 'Woche' : 'Wochen'}`
    + (p.archived ? ` <span class="plan-status-chip plan-status-chip-archived" style="margin-left:8px">Archiviert</span>` : '');

  const tageWahl = WOCHENTAGE_KURZ.map((n, i) =>
    `<button type="button" class="lp-tagwahl${(p.runDays || []).includes(i) ? ' an' : ''}" onclick="toggleRunDay('${p.id}',${i})">${n}</button>`).join('');

  const wochenBlocks = [];
  for (let w = 1; w <= wochen; w++) {
    const auf = _laufOffeneWochen.has(p.id + ':' + w);
    const tage = (p.runDays || []).map(di => {
      const u = runEinheit(p, w, di) || {};
      const d = runEinheitDatum(p, w, di);
      return `<div class="lp-einheit">
        <div class="lp-tag"><strong>${WOCHENTAGE_KURZ[di]}</strong><span>${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span></div>
        <input class="lp-feld" type="text" inputmode="decimal" value="${u.km ?? ''}" placeholder="—"
               onchange="setRunUnit('${p.id}',${w},${di},'km',this.value)"><span class="lp-eh">km</span>
        <input class="lp-feld" type="text" value="${u.minutes ?? ''}" placeholder="—"
               onchange="setRunUnit('${p.id}',${w},${di},'minutes',this.value)"><span class="lp-eh">min</span>
        <div class="lp-zone${u.zone ? '' : ' leer'}"><span class="lp-zone-txt">${u.zone || 'Zone'}</span>
          <select class="lp-zone-sel" aria-label="Herzzone"
                  onchange="setRunZone('${p.id}',${w},${di},this)">
            ${HERZZONEN.map(z => `<option value="${z}"${(u.zone || '') === z ? ' selected' : ''}>${z || 'Zone'}</option>`).join('')}
          </select></div>
        <button type="button" class="lp-notiz${u.note ? '' : ' leer'}" aria-label="Notiz"
                data-woche="${w}" data-tag="${di}"
                onclick="openRunNote('${p.id}',${w},${di})">${escapeHtml(u.note || 'Notiz')}</button>
      </div>`;
    }).join('');
    wochenBlocks.push(`<div class="lp-woche">
      <button type="button" class="lp-woche-btn" aria-expanded="${auf}" onclick="toggleRunWoche('${p.id}',${w})">Woche ${w}<span class="aex-v2-chev">${AEX_CHEV_SVG}</span></button>
      <div class="lp-woche-body"${auf ? '' : ' style="display:none"'}>${tage || '<p class="lauf-leer">Keine Lauftage gewählt.</p>'}</div>
    </div>`);
  }

  document.getElementById('runplan-detail-body').innerHTML = `
    <div class="mehr-section">
      <div class="mehr-section-title">Laufplan-Daten</div>
      <div class="mehr-card plan-form-card">
        <div class="program-form-row"><label>Name</label>
          <input type="text" value="${escapeHtml(p.name || '')}" onchange="setRunPlan('${p.id}','name',this.value)"></div>
        <div class="program-form-row lp-datenzeile sp4">
          <div><label>Start</label>
            ${lpDatumFeld(p.startDate, `setRunPlan('${p.id}','startDate',this.value)`)}</div>
          <div><label>Ende</label>
            ${lpDatumFeld(p.endDate, `setRunPlan('${p.id}','endDate',this.value)`)}</div>
          <div class="lp-wochen"><label>Wochen</label>
            <div class="lp-wochen-v">${p.startDate && p.endDate ? wochen : '–'}</div></div>
          <div><label>Wettkampf</label>
            ${lpDatumFeld(p.raceDate, `setRunPlan('${p.id}','raceDate',this.value)`)}</div>
        </div>
        <div class="program-form-row"><label>Notizen</label>
          <textarea class="program-form-textarea" rows="2" placeholder="z. B. Ziel, Streckenprofil"
                    onchange="setRunPlan('${p.id}','notes',this.value)">${escapeHtml(p.notes || '')}</textarea></div>
        <div class="program-form-row"><label>Lauftage</label><div class="lp-tagwahl-reihe">${tageWahl}</div></div>
      </div>
    </div>

    <div class="mehr-section">
      <div class="mehr-section-kopf">
        <div class="mehr-section-title">Einheiten</div>
        ${wochen ? `<button type="button" id="lp-alle-btn" class="lp-alle-btn"
                aria-expanded="${_alleRunWochenOffen(p.id)}" onclick="toggleAlleRunWochen('${p.id}')">
          <span class="lp-alle-txt">${_alleRunWochenOffen(p.id) ? 'Alle zuklappen' : 'Alle aufklappen'}</span>
          <span class="aex-v2-chev">${AEX_CHEV_SVG}</span></button>` : ''}
      </div>
      <div class="mehr-card plan-form-card lp-wochen-karte">${wochenBlocks.join('')}</div>
    </div>

    ${laufKmDiagrammHTML(p, 'lp') ? `<div class="mehr-section">
      <div class="mehr-card lp-km-karte">${laufKmDiagrammHTML(p, 'lp')}</div>
    </div>` : ''}

    <div class="mehr-section">
      <div class="mehr-section-title">Aktionen</div>
      <div class="mehr-card">
        <div class="mehr-row" onclick="setRunPlan('${p.id}','archived',${p.archived ? 'false' : 'true'})" style="cursor:pointer">
          <div class="mehr-row-icon" style="background:var(--accent-bg)">📦</div>
          <div class="mehr-row-info">
            <div class="mehr-row-label">${p.archived ? 'Aus dem Archiv holen' : 'Plan archivieren'}</div>
            <div class="mehr-row-sub">Versteckt den Plan aus der Hauptliste, bleibt aber zugänglich</div>
          </div>
          <div class="mehr-row-action">›</div>
        </div>
        <div class="divider"></div>
        <div class="mehr-row" onclick="deleteRunPlan('${p.id}')" style="cursor:pointer">
          <div class="mehr-row-icon" style="background:var(--red-bg)">🗑</div>
          <div class="mehr-row-info">
            <div class="mehr-row-label" style="color:var(--red,#d33)">Plan löschen</div>
            <div class="mehr-row-sub">Alle geplanten Einheiten dieses Plans gehen verloren</div>
          </div>
          <div class="mehr-row-action">›</div>
        </div>
      </div>
    </div>`;
  _zeichneLpKmDiagramm();
}

// Auf- und Zuklappen einer Woche laeuft OHNE Neuaufbau: Ein Re-Render naehme den Kopffeldern
// (Name, Datum) die noch nicht gespeicherten Eingaben und den Fokus.
function toggleRunWoche(id, w) {
  const k = id + ':' + w;
  _laufOffeneWochen.has(k) ? _laufOffeneWochen.delete(k) : _laufOffeneWochen.add(k);
  const btn = document.querySelector(`.lp-woche-btn[onclick*="'${id}',${w})"]`);
  if (!btn) return _laufNeuZeichnen();
  const body = btn.nextElementSibling;
  const auf = _laufOffeneWochen.has(k);
  btn.setAttribute('aria-expanded', auf ? 'true' : 'false');
  if (body) body.style.display = auf ? '' : 'none';
  _syncAlleRunWochenBtn(id);
}

// „Alle aufklappen / Alle zuklappen" ueber dem Abschnitt „Einheiten" (13.09.2026,
// Leonard-Wunsch). Sind ALLE Wochen offen, klappt der Knopf alle zu, sonst alle auf — dieselbe
// Regel wie „Alle ein-/ausklappen" im Uebungskatalog.
// WIE `toggleRunWoche` OHNE Neuaufbau: Die Detailseite ist ein Formular, ein Neuaufbau naehme
// einem gerade bearbeiteten Feld seine noch nicht gespeicherte Eingabe.
function _alleRunWochenOffen(id) {
  const p = DB.getRunPlans().find(x => x.id === id);
  const n = p ? runPlanWochen(p) : 0;
  for (let w = 1; w <= n; w++) if (!_laufOffeneWochen.has(id + ':' + w)) return false;
  return n > 0;
}
function toggleAlleRunWochen(id) {
  const p = DB.getRunPlans().find(x => x.id === id);
  if (!p) return;
  const auf = !_alleRunWochenOffen(id);
  for (let w = 1; w <= runPlanWochen(p); w++) {
    const k = id + ':' + w;
    auf ? _laufOffeneWochen.add(k) : _laufOffeneWochen.delete(k);
  }
  document.querySelectorAll('#runplan-detail-body .lp-woche-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', auf ? 'true' : 'false');
    const body = btn.nextElementSibling;
    if (body) body.style.display = auf ? '' : 'none';
  });
  _syncAlleRunWochenBtn(id);
}
function _syncAlleRunWochenBtn(id) {
  const btn = document.getElementById('lp-alle-btn');
  if (!btn) return;
  const auf = _alleRunWochenOffen(id);
  btn.setAttribute('aria-expanded', auf ? 'true' : 'false');
  const txt = btn.querySelector('.lp-alle-txt');
  if (txt) txt.textContent = auf ? 'Alle zuklappen' : 'Alle aufklappen';
}

// Nach einer Aenderung muss der SICHTBARE Bildschirm neu gezeichnet werden — seit dem
// Umbau auf eine eigene Detailseite ist das mal die Liste, mal die Detailseite.
function _laufNeuZeichnen() {
  if (currentScreen === 'runplan-detail') renderRunPlanDetail();
  else renderLaufVerwaltung();
  if (currentScreen === 'overview') renderOverview();
}

function _runPlanAendern(id, fn) {
  const ps = DB.getRunPlans();
  const p = ps.find(x => x.id === id);
  if (!p) return;
  fn(p);
  DB.saveRunPlans(ps);
}

function setRunPlan(id, feld, wert) {
  // Notizen sichern sich still: Ein Neuaufbau naehme dem Feld den Fokus mitten im Tippen.
  const stillSpeichern = feld === 'notes';
  _runPlanAendern(id, p => {
    if (feld === 'startDate' || feld === 'endDate' || feld === 'raceDate') p[feld] = wert ? new Date(wert + 'T00:00:00').getTime() : null;
    else if (feld === 'archived') p.archived = (wert === true || wert === 'true');
    else p[feld] = wert;
  });
  if (!stillSpeichern) _laufNeuZeichnen();
  else if (currentScreen === 'overview') renderOverview();
}

function toggleRunDay(id, di) {
  _runPlanAendern(id, p => {
    p.runDays = p.runDays || [];
    const i = p.runDays.indexOf(di);
    if (i >= 0) p.runDays.splice(i, 1); else { p.runDays.push(di); p.runDays.sort((a, b) => a - b); }
  });
  _laufNeuZeichnen();
}

// Einheiten sichern sich beim Verlassen des Feldes und OHNE Neuaufbau — sonst verliert man
// beim Weitertippen den Fokus und halb getippte Werte.
// Der sichtbare Text liegt neben dem unsichtbaren <select> und muss von Hand nachgezogen
// werden — ein Neuaufbau der Karte naehme den Feldern darueber die noch offenen Eingaben.
function setRunZone(id, woche, dayIdx, sel) {
  setRunUnit(id, woche, dayIdx, 'zone', sel.value);
  const box = sel.closest('.lp-zone');
  if (!box) return;
  box.classList.toggle('leer', !sel.value);
  const txt = box.querySelector('.lp-zone-txt');
  if (txt) txt.textContent = sel.value || 'Zone';
}

function setRunUnit(id, woche, dayIdx, feld, wert) {
  _runPlanAendern(id, p => {
    p.units = p.units || [];
    let u = p.units.find(x => x.week === woche && x.dayIdx === dayIdx);
    if (!u) { u = { week: woche, dayIdx }; p.units.push(u); }
    // Zone und Notiz sind TEXT — nur km und Minuten werden als Zahl gelesen.
    if (feld === 'zone' || feld === 'note') u[feld] = wert;
    else { const v = parseFloat(String(wert).replace(',', '.')); u[feld] = isFinite(v) ? v : null; }
  });
  if (currentScreen === 'overview') renderOverview();
  // Das Diagramm der Detailansicht zeigt genau diese Zahlen — es wird von Hand nachgezogen,
  // weil die Felder bewusst OHNE Neuaufbau speichern (sonst verlieren sie den Fokus).
  if (feld === 'km' && currentScreen === 'runplan-detail') _zeichneLpKmDiagramm();
}

// Loeschen ist zweifach abgesichert wie bei den Trainingsplaenen: „Rueckgaengig" fuer 6
// Sekunden UND 30 Tage Papierkorb. Ein Laufplan steckt schnell in mehreren Wochen Arbeit.
function deleteRunPlan(id) {
  const p = DB.getRunPlans().find(x => x.id === id);
  confirmAction('Laufplan löschen?', `„${(p && p.name) || 'Laufplan'}" wird entfernt.`, () => {
    withUndo('Laufplan gelöscht', () => {
      DB.saveRunPlans(DB.getRunPlans().filter(x => x.id !== id));
      if (p) trashPut('runplan', p.name || 'Laufplan', p);
    }, () => { renderLaufVerwaltung(); if (currentScreen === 'overview') renderOverview(); });
    // Der geloeschte Plan hat keine Detailseite mehr — zurueck zur Liste.
    if (currentScreen === 'runplan-detail') closeRunPlanDetail();
    else renderLaufVerwaltung();
    if (currentScreen === 'overview') renderOverview();
  }, { danger: true, confirmLabel: 'Löschen' });
}

function neuerLaufplan() {
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const ende = new Date(heute); ende.setDate(ende.getDate() + 8 * 7 - 1);
  const p = { id: 'rp' + Date.now(), name: 'Neuer Laufplan', notes: '',
              startDate: heute.getTime(), endDate: ende.getTime(),
              runDays: [1, 5, 6], archived: false, raceDate: null, units: [] };
  const ps = DB.getRunPlans(); ps.push(p); DB.saveRunPlans(ps);
  plansViewMode = 'runplans';
  renderPlansScreen();
  openRunPlanDetail(p.id);
}

// ─── Trainingskalender ─────────────────────────────────────────────
// Ein Kästchen pro Tag der letzten 52 Wochen, eingefärbt nach Tagesvolumen.
// Zeigt Regelmäßigkeit und Lücken auf einen Blick — das sieht man in keinem Diagramm.

function _dayKeyOf(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Volumen + Einheiten pro Kalendertag über den gesamten Verlauf.
// Nachgetragene Trainingstage aus Leonards alter Liste (Screenshot, 01.09.2026). Zu diesen
// Tagen gibt es KEINE Aufzeichnung — bewusst keine Einheiten anlegen, sonst stuenden im
// Verlauf Einheiten ohne Uebungen und ohne Volumen. Laeuft genau einmal (Merker
// ft_manual_days_imported) und ergaenzt nur, was noch fehlt.
const MANUELLE_TAGE_IMPORT = [
  '2026-04-04', '2026-03-28', '2026-03-21', '2026-03-14', '2026-03-10', '2026-03-07',
  '2026-03-04', '2026-02-28', '2026-02-24', '2026-02-21', '2026-02-17', '2026-02-14',
  '2026-02-11', '2026-02-09', '2026-02-08', '2026-02-04', '2026-02-02', '2026-01-28',
  '2026-01-26', '2026-01-24', '2026-01-23', '2026-01-19', '2026-01-14', '2026-01-13',
];
function migrateImportManualDays() {
  if (localStorage.getItem('ft_manual_days_imported') === '1') return;
  const vorhanden = DB.getManualDays();
  const menge = new Set(vorhanden);
  MANUELLE_TAGE_IMPORT.forEach(d => menge.add(d));
  localStorage.setItem('ft_manual_days', JSON.stringify([...menge].sort().reverse()));
  localStorage.setItem('ft_manual_days_imported', '1');
}

// Leonards Wettkaempfe (Liste vom 06.09.2026). Sie liegen in Jahren, fuer die es keine
// Laufplaene gibt — an ein `plan.raceDate` waeren sie also gar nicht zu haengen. Deshalb
// eigenstaendig in `ft_races`. Laeuft genau einmal (Merker ft_races_imported) und ergaenzt
// nur, was noch fehlt; dieselbe Bauart wie MANUELLE_TAGE_IMPORT.
const WETTKAMPF_IMPORT = [
  { date: '2024-04-21', name: 'Zurich 10km' },
  { date: '2024-09-01', name: 'Sempacherseelauf 2024' },
  { date: '2025-04-13', name: 'Zurich Marathon 2025' },
  { date: '2025-10-26', name: 'Luzern Marathon 2025' },
  { date: '2026-05-02', name: 'Sempacherseelauf 2026' },
];
// ZWEITER Merker: Die erste Fassung (v288) hat nur die Daten ohne Namen eingetragen und
// `ft_races_imported` gesetzt. Wer die schon geladen hatte, braucht die Namen nachgereicht —
// deshalb laeuft der Import unter einem neuen Merker ein zweites Mal. Ein selbst vergebener
// Name bleibt dabei stehen, ueberschrieben wird nur ein leerer.
function migrateImportRaces() {
  if (localStorage.getItem('ft_races_imported_v2') === '1') return;
  const nachDatum = {};
  DB.getRaces().forEach(r => { nachDatum[r.date] = r; });
  WETTKAMPF_IMPORT.forEach(w => {
    const alt = nachDatum[w.date];
    nachDatum[w.date] = { date: w.date, name: (alt && alt.name) || w.name };
  });
  const liste = Object.values(nachDatum).sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem('ft_races', JSON.stringify(liste));
  localStorage.setItem('ft_races_imported', '1');
  localStorage.setItem('ft_races_imported_v2', '1');
}

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
  // Nachgetragene Tage ergaenzen — aber nur, wo keine echte Einheit liegt. Eine
  // aufgezeichnete Einheit ist immer die bessere Auskunft.
  DB.getManualDays().forEach(key => {
    if (byDay[key]) return;
    byDay[key] = { vol: 0, count: 1, names: ['Training (ohne Aufzeichnung)'], manual: true };
  });
  return byDay;
}

// Plan-Zeitraeume fuer die Kalender-Rekonstruktion. Auch archivierte Plaene zaehlen:
// sie behalten ihren Wochenplan, also laesst sich fuer jeden vergangenen Tag sagen, ob
// damals ein Training vorgesehen war.
function _calPlanIndex() {
  return DB.getPlans()
    .filter(p => p && p.startDate)
    // In LOKALEN TAGEN (18.09.2026): Der Gymplan speichert UTC-Mitternacht, in Mitteleuropa also
    // 02:00 — der Tag, der hier geprueft wird, beginnt aber um 00:00. Der erste Plantag fiel
    // dadurch aus dem Plan heraus.
    .map(p => ({
      start: _calLokalTag(p.startDate).getTime(),
      end: p.endDate ? _calLokalTag(p.endDate).getTime() : Infinity,
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
// Filter des Uebersichts-Kalenders. Bis zum 15.09.2026 startete er IMMER bei 'beide' und wurde
// bewusst nicht gespeichert. Seither behaelt der Kalender die ZULETZT angeschaute Ansicht ueber
// einen Neustart hinweg (Leonard-Wunsch): Filter der Uebersicht und Zeitraum BEIDER Kalender
// liegen in `ft_cal_ansicht`. Die SCROLLPOSITION wird NICHT gespeichert — nach einem Neustart
// beginnt das Raster an der Startposition der Ansicht (Leonard-Entscheidung), weil eine alte
// Position nach ein paar Tagen nicht mehr zu „heute" passt.
// Eine reine Anzeige-Einstellung dieses Geraets: NICHT in der Drive-Sicherung (wie
// `ft_ex_chart_modes`). Die Wochenkarte der Uebersicht behaelt ihren Filter NICHT.
function _calAnsichtLaden() {
  try {
    const a = JSON.parse(localStorage.getItem('ft_cal_ansicht') || '{}');
    return (a && typeof a === 'object') ? a : {};
  } catch (e) { return {}; }
}
function _calAnsichtSpeichern() {
  try {
    localStorage.setItem('ft_cal_ansicht', JSON.stringify({ filter: _calFilter, jahre: _calJahre }));
  } catch (e) {}
}
let _calFilter = ['beide', 'kraft', 'lauf'].includes(_calAnsichtLaden().filter)
  ? _calAnsichtLaden().filter : 'beide';           // 'beide' | 'kraft' | 'lauf'
const _CAL_FILTER_FOLGE = { beide: 'kraft', kraft: 'lauf', lauf: 'beide' };
// Der Titel BENENNT den Filter, statt ihn als Zusatz anzuhaengen (Leonard-Wunsch 01.09.2026).
const _CAL_FILTER_TITEL = { beide: 'Trainingskalender', kraft: 'Gymkalender', lauf: 'Laufkalender' };
function toggleCalFilter() {
  _calFilter = _CAL_FILTER_FOLGE[_calFilter] || 'beide';
  _calAnsichtSpeichern();
  _calRasterBlende('cal', () => renderTrainingCalendar('cal', 'ov-cal-card'));
}
// Welche Sportart zeigt WELCHER Kalender? Die Uebersicht folgt dem Filter im Titel, der
// Plaene-Tab der gewaehlten Seite: Gymplan → Krafttraining, Laufplan → Laeufe.
function _calModus(id) {
  if (id === 'pcal') {
    // Nur zwei der vier Seiten zeigen ueberhaupt einen Kalender (Gymtage und Wettkaempfe
    // nicht) — fuer die uebrigen ist der Wert gleichgueltig.
    return plansViewMode === 'runplans'
      ? { kraft: false, lauf: true,  titel: 'Laufkalender' }
      : { kraft: true,  lauf: false, titel: 'Gymkalender' };
  }
  return { kraft: _calFilter !== 'lauf', lauf: _calFilter !== 'kraft',
           titel: _CAL_FILTER_TITEL[_calFilter] || 'Trainingskalender' };
}

// Kreispfeil „zurueck" fuer den Knopf zur aktuellen Ansicht — Strich wie die uebrigen Symbole.
const CAL_RESET_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><polyline points="4.5 3.5 4.5 7.5 8.5 7.5"/></svg>';

// Der Knopf rechts im Kopf des Uebersichts-Kalenders (14.09.2026, Leonard-Wunsch): zurueck zur
// ERSTANSICHT — Filter „Trainingskalender" (beide Sportarten), Zeitraum „Aktuell" und die
// Startposition des Rasters. Auch wenn beides schon eingestellt ist, stellt ein Tipp die
// Startposition wieder her (man hat vielleicht weggescrollt).
// Ohne laufenden Plan zeigt 'aktuell' das laufende Jahr (siehe `_calAktuellePlaene`).
function calZurAktuellenAnsicht() {
  _calFilter = 'beide';
  _calJahre.cal = 'aktuell';
  _calAnsichtSpeichern();
  _calPositioniert.cal = false;
  _calScrollPos.cal = 0;
  _calRasterBlende('cal', () => renderTrainingCalendar('cal', 'ov-cal-card'));
}

// ── Einblenden beim Wechsel der Kalenderansicht (16.09.2026, Leonard-Wunsch) ────────────
// Ein Tipp auf den Titel (Filter) oder den Zeitraum stellte das Raster frueher hart um. Seit dem
// 18.09.2026 (Leonard-Entscheidung „Nur einblenden") steht der NEUE Kalender sofort an der Stelle
// des alten und blendet aus dem Durchsichtigen ein — ohne vorheriges Ausblenden, es gibt also
// keinen leeren Moment mehr. VORGESCHICHTE: vom 16. bis 18.09.2026 blendete der alte erst aus
// (zuletzt 80ms), dann der neue ein (140ms) — das las sich wie ein Blinzeln.
// Eingeblendet wird alles UNTER der Kopfzeile; Titel, Zeitraum und Kennzahl bleiben stehen, sie
// sind der Schalter, den man antippt.
// Bewegt wird NUR die Deckkraft: Ein Schub waere im Raster unruhig, und ein `transform` auf dem
// Vorfahren kann auf iOS die Wischgeste im Scrollbereich abbrechen (siehe „Kalenderkarten sind
// von der Tipp-Animation ausgenommen").
// Die Kurve laeuft SCHNELL an (ease-out), damit das Raster sofort zu ahnen ist.
// Seit dem 18.09.2026 nutzt auch die Wochenplankarte der Uebersicht dieselbe Blende
// (`toggleWochenFilter`) — der gemeinsame Kern ist `_neuZeichnenEinblenden`.
const CAL_EIN_MS = 300;
const CAL_EIN_KURVE = 'cubic-bezier(.2,.6,.3,1)';
function _calRasterBlende(id, zeichnen) {
  const karte = document.getElementById(id === 'cal' ? 'ov-cal-card' : 'plans-cal-card');
  _neuZeichnenEinblenden('kal-' + id, karte,
    () => karte ? [...karte.children].filter(el => !el.classList.contains('chart-card-v2-head')) : [],
    zeichnen);
}

// Gemeinsamer Kern von Kalender- und Wochenplankarte: SOFORT zeichnen, dann die Teile, die
// `teile()` NACH dem Zeichnen liefert, aus dem Durchsichtigen einblenden. `teile` ist eine
// Funktion, weil das Zeichnen sie neu erzeugen kann (die Wochenplankarte wird ganz neu gebaut).
// Vor dem Zeichnen werden die Blenden der noch stehenden Teile abgebrochen — ein weiterer Tipp
// beginnt die Blende neu. Die Nummer je `schluessel` entwertet das Aufraeumen einer alten Blende.
// Ohne Breite (Karte nicht sichtbar) und bei `prefers-reduced-motion` wird nur gezeichnet.
const _einblendNr = {};
function _neuZeichnenEinblenden(schluessel, huelle, teile, zeichnen) {
  const nr = _einblendNr[schluessel] = (_einblendNr[schluessel] || 0) + 1;
  const bewegen = !!huelle && !!huelle.clientWidth && !_bewegungReduziert();
  teile().forEach(el => el.getAnimations().forEach(a => a.cancel()));
  zeichnen();
  if (!bewegen) return;
  const neu = teile();
  Promise.all(neu.map(el => _animFahren(el, [{ opacity: 0 }, { opacity: 1 }],
                                        { duration: CAL_EIN_MS, easing: CAL_EIN_KURVE })))
    .then(() => {
      if (nr === _einblendNr[schluessel]) neu.forEach(el => el.getAnimations().forEach(a => a.cancel()));
    });
}

function calendarInnerHTML(id) {
  // Nur der Kalender der Uebersicht zeigt beide Sportarten — nur dort ist der Titel ein Filter.
  const titel = id === 'cal'
    ? `<button class="chart-card-v2-title cal-filter-btn" id="cal-filter-btn" onclick="toggleCalFilter()"
               aria-label="Zwischen Training, Läufen und beidem umschalten">Trainingskalender</button>`
    : `<span class="chart-card-v2-title" id="${id}-titel">Trainingskalender</span>`;
  // Der Zeitraum steht direkt hinter dem Titel und ist seit dem 14.09.2026 ein WECHSLER wie der
  // Titel selbst (Leonard-Wunsch; vorher ein Auswahlfeld mit unsichtbarem <select>): Jeder Tipp
  // schaltet eine Stufe weiter — Aktuell → neuestes Jahr → … → aeltestes Jahr → Aktuell.
  // Ein echter <button>, damit `initScrollHideNav` ihn als Bedienelement erkennt.
  const jahrFeld = `<button type="button" class="cal-jahr" id="${id}-jahr" onclick="wechselCalJahr('${id}')"
                            aria-label="Zeitraum wechseln"></button>`;
  // Rechts neben der Kennzahl: im Plan-Tab die Lesehilfe (ⓘ), in der UEBERSICHT seit dem
  // 14.09.2026 stattdessen ein Knopf zurueck zur Erstansicht (Trainingskalender, „Aktuell",
  // Startposition — `calZurAktuellenAnsicht`, Leonard-Wunsch). Dieselbe runde 19px-Form wie das ⓘ,
  // damit der Kopf in beiden Tabs gleich aussieht.
  const rechtsKnopf = id === 'cal'
    ? `<button class="info-btn cal-reset-btn" onclick="calZurAktuellenAnsicht()"
               aria-label="Zur aktuellen Ansicht" title="Zur aktuellen Ansicht">${CAL_RESET_SVG}</button>`
    : `<button class="info-btn" onclick="openModal('modal-cal-info')" aria-label="Was bedeuten die Farben?">i</button>`;
  return `<div class="chart-card-v2-head">
      <span class="cal-head-left">${titel}${jahrFeld}</span>
      <span class="cal-head-right">
        <span class="cal-stats" id="${id}-stats"></span>
        ${rechtsKnopf}
      </span>
    </div>
    <div class="cal-body">
      <div class="cal-daylabels"><span>Mo</span><span></span><span>Mi</span><span></span><span>Fr</span><span></span><span>So</span></div>
      <div class="cal-scroll" id="${id}-scroll">
        <span class="cal-sticky-anchor" aria-hidden="true"></span>
        <div class="cal-inner">
          <div class="cal-months" id="${id}-months"></div>
          <div class="cal-plannames" id="${id}-plannames"></div>
          <div class="cal-planlanes cal-planlanes-oben" id="${id}-planlanes-oben"></div>
          <div class="cal-gridwrap">
            <div class="cal-grid" id="${id}-grid"></div>
          </div>
          <div class="cal-planlanes" id="${id}-planlanes"></div>
        </div>
      </div>
    </div>
    <div class="cal-foot">
      <div class="cal-detail" id="${id}-detail"></div>
    </div>`;
}


// Je Kalender (cal | pcal): Wurde er schon einmal auf die laufende Woche gesetzt, und wo
// steht er gerade? `_calScrollPos` fuehrt ein Scroll-Listener nach — BEWUSST nicht als
// Momentaufnahme zu Beginn des Renderns: Beim App-Start laeuft der Renderer zweimal kurz
// hintereinander, und die zweite Runde haette dann den Stand VOR dem ersten Positionieren
// festgehalten und das Raster wieder auf Null gezogen (Leonard-Meldung 01.09.2026).
const _calPositioniert = {};
const _calScrollPos = {};

// Angezeigtes Kalenderjahr, JE KALENDER (Leonard-Wunsch 06.09.2026 — vorher nur in der
// Uebersicht waehlbar). Beide Kalender fuehren ihr eigenes Jahr, genau wie ihre Scrollposition:
// Ein Sprung nach 2024 im Plan-Tab soll die Uebersicht nicht mitziehen. Innerhalb EINES
// Kalenders gilt das Jahr fuer alle Zustaende — in der Uebersicht fuer alle drei Filter, im
// Plan-Tab fuer Gymplan und Laufplan gemeinsam.
// Seit dem 15.09.2026 GESPEICHERT (`ft_cal_ansicht`, siehe `_calAnsichtLaden`) — vorher bewusst
// nicht. Ein gewaehltes Jahr bleibt damit auch nach dem Jahreswechsel stehen; „Aktuell" passt
// sich wie gehabt selbst an.
// Seit dem 14.09.2026 gibt es neben den Jahren die Ansicht 'aktuell' — und sie ist der STANDARD
// (Leonard-Wunsch). Liefert deshalb eine Jahreszahl ODER den Text 'aktuell'.
// Beim Laden nur gueltige Werte uebernehmen: 'aktuell' oder eine Jahreszahl.
const _calJahre = (() => {
  const gespeichert = _calAnsichtLaden().jahre || {};
  const jahre = {};
  ['cal', 'pcal'].forEach(id => {
    const w = gespeichert[id];
    if (w === 'aktuell' || (Number.isInteger(w) && w > 2000)) jahre[id] = w;
  });
  return jahre;
})();
function calJahr(id) { return _calJahre[id] || 'aktuell'; }
// Zuletzt gezeichneter Zeitraum je Kalender — aendert er sich (anderer Filter, andere Plan-Seite,
// neuer Plan), gehoert die gemerkte Scrollposition nicht mehr dazu.
const _calBereich = {};

// ── Ansicht „Aktuell" (14.09.2026, Leonard-Wunsch) ───────────────────────────────────
// Das Raster zeigt NUR die Wochen des laufenden Plans. Welcher Plan zaehlt, folgt dem Modus:
// Gymkalender → laufender Gymplan, Laufkalender → laufender Laufplan, gemeinsamer
// Trainingskalender → beide zusammen (vom frueheren Beginn bis zum spaeteren Ende; beide laufen
// heute, eine Luecke dazwischen kann es also nicht geben).
// Gibt es fuer die Sportart KEINEN laufenden Plan, ist `bereich` null — der Kalender zeigt dann
// das laufende Jahr und bietet „Aktuell" gar nicht erst an (Leonard-Entscheidung). Kommt wieder
// ein Plan dazu, ist „Aktuell" von selbst zurueck, weil der gespeicherte Zustand weiter 'aktuell'
// lautet, solange niemand ein Jahr gewaehlt hat.
// Datumswerte auf LOKALE Mitternacht: Der Gymplan speichert UTC-Mitternacht, der Laufplan lokale —
// in Mitteleuropa ergeben beide so denselben Kalendertag.
function _calLokalTag(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d; }
function _calAktuellePlaene(modus) {
  const gym = modus.kraft ? getActivePlan() : null;
  const lauf = modus.lauf ? runPlanAktiv() : null;
  const jahresende = new Date(new Date().getFullYear(), 11, 31);
  const spannen = [gym, lauf].filter(p => p && p.startDate).map(p => ({
    von: _calLokalTag(p.startDate),
    bis: p.endDate ? _calLokalTag(p.endDate) : jahresende,
  }));
  const bereich = spannen.length ? {
    von: new Date(Math.min(...spannen.map(x => x.von.getTime()))),
    bis: new Date(Math.max(...spannen.map(x => x.bis.getTime()))),
  } : null;
  return { gym, lauf, bereich };
}

// Welche Jahre stehen zur Auswahl? Alles, wozu es Daten gibt, plus das laufende Jahr — sonst
// koennte man in ein leeres Jahr springen und faende dort nichts.
function calJahre() {
  const jahre = new Set([new Date().getFullYear()]);
  DB.getWorkouts().forEach(w => jahre.add(new Date(w.startTs).getFullYear()));
  DB.getManualDays().forEach(k => jahre.add(Number(k.slice(0, 4))));
  DB.getRuns().forEach(l => jahre.add(Number(l.date.slice(0, 4))));
  DB.getRaces().forEach(r => jahre.add(Number(r.date.slice(0, 4))));
  return [...jahre].filter(j => j > 2000).sort((a, b) => b - a);
}

// „20/24 Einheiten" bzw. „15/18 Läufe" fuer die Ansicht „Aktuell": absolvierte gegen geplante
// Einheiten VOM BEGINN DES LAUFENDEN PLANS BIS EINSCHLIESSLICH HEUTE (Leonard-Wunsch 14.09.2026).
// „Absolviert" zaehlt wie die Jahressumme: jede Krafteinheit plus nachgetragene Tage bzw. jeder
// Lauf (auch Intervalltraining) — Einheiten an ungeplanten Tagen zaehlen mit, ein nachgeholtes
// Training soll die Quote nicht druecken.
// „Geplant" zaehlt die Wochentage mit Trainingstag (Gym, `weekPlan`) bzw. die Lauftage
// (`runDays`) bis heute; ein Tag nach dem Planende zaehlt nicht mehr.
// Laeuft fuer eine der beiden Sportarten im gemeinsamen Kalender KEIN Plan, steht fuer sie nur
// die Anzahl im gezeigten Zeitraum, ohne Verhaeltnis — es gibt dann nichts, wogegen man zaehlt.
// Seit dem 18.09.2026 auch fuer BEENDETE Plaene (Quote in der Plankarte, `planMetaZeile`): Dort
// endet die Zaehlung an seinem letzten Tag — Einheiten danach gehoeren nicht mehr dazu. Fuer den
// laufenden Plan aendert das nichts, sein Ende liegt nach heute.
function _calPlanStand(sport, plan, bereichVon, today) {
  const wort = sport === 'gym' ? (n => n === 1 ? 'Einheit' : 'Einheiten') : (n => n === 1 ? 'Lauf' : 'Läufe');
  const vonDatum = plan ? _calLokalTag(plan.startDate) : bereichVon;
  const ende = (plan && plan.endDate) ? _calLokalTag(plan.endDate) : null;
  const letzter = (ende && ende < today) ? ende : today;
  const bisLetzter = new Date(letzter); bisLetzter.setHours(23, 59, 59, 999);
  const vonKey = _dayKeyOf(vonDatum.getTime()), bisKey = _dayKeyOf(letzter.getTime());
  const absolviert = sport === 'gym'
    ? DB.getWorkouts().filter(w => w.startTs >= vonDatum.getTime() && w.startTs <= bisLetzter.getTime()).length
      + DB.getManualDays().filter(k => k >= vonKey && k <= bisKey).length
    : DB.getRuns().filter(l => l.date >= vonKey && l.date <= bisKey).length;
  if (!plan) return { absolviert, geplant: null, wort };
  let geplant = 0;
  for (const d = new Date(vonDatum); d <= letzter; d.setDate(d.getDate() + 1)) {
    const wi = (d.getDay() + 6) % 7;
    if (sport === 'gym') {
      const wp = (plan.weekPlan && plan.weekPlan.length) ? plan.weekPlan : DEFAULT_WEEKPLAN;
      if (wp[wi] && wp[wi].planDayId) geplant++;
    } else if ((plan.runDays || []).includes(wi)) {
      geplant++;
    }
  }
  return { absolviert, geplant, wort };
}

// Formatiert den Planstand fuer die Kennzahl (14.09.2026, Leonard-Wunsch):
//   Trainingskalender (beide Sportarten): nur Prozent — „Gym 87 % · Lauf 80 %"
//   Gym-/Laufkalender: absolut plus Prozent in Klammern — „20/23 Einheiten (87 %)"
// Ohne laufenden Plan steht nur die Anzahl („15 Läufe"). Ist noch nichts geplant (Plan beginnt
// heute an einem Tag ohne Training), gibt es keinen Prozentwert: im gemeinsamen Kalender „–", im
// Einzelkalender entfaellt die Klammer. Mehr als 100 % sind moeglich (zusaetzliche Einheiten) und
// werden bewusst so angezeigt.
// Zwischen Zahl und Prozentzeichen steht ein geschuetztes Leerzeichen — sonst koennte die Zeile
// genau dazwischen umbrechen.
function _calPlanStandText(sport, st, kombi) {
  const prozent = st.geplant ? Math.round(st.absolviert / st.geplant * 100) + '\u00A0%' : null;
  if (st.geplant == null) return `${st.absolviert} ${st.wort(st.absolviert)}`;
  if (kombi) return `${sport === 'gym' ? 'Gym' : 'Lauf'} ${prozent || '–'}`;
  return `${st.absolviert}/${st.geplant} ${st.wort(st.geplant)}` + (prozent ? ` (${prozent})` : '');
}

// Ein Tipp auf den Zeitraum schaltet eine Stufe weiter (14.09.2026, Leonard-Wunsch):
// Aktuell → neuestes Jahr → … → aeltestes Jahr → Aktuell. Die Jahre sind dieselben wie bisher
// in der Auswahl (`calJahre`, neueste zuerst).
// „Aktuell" gehoert nur in die Folge, wenn fuer den Modus ein Plan laeuft. Ohne Plan zeigt der
// Zustand 'aktuell' das laufende Jahr — die Folge beginnt dann dort. Der Rueckweg an den Anfang
// setzt in diesem Fall wieder 'aktuell' statt der Jahreszahl: So kehrt die Ansicht „Aktuell"
// von selbst zurueck, sobald wieder ein Plan laeuft (Leonard-Entscheidung vom selben Tag).
function wechselCalJahr(id) {
  id = id || 'cal';
  const hatAktuell = !!_calAktuellePlaene(_calModus(id)).bereich;
  const folge = [...(hatAktuell ? ['aktuell'] : []), ...calJahre()];
  if (folge.length < 2) return;
  const wahl = calJahr(id);
  const angezeigt = (wahl === 'aktuell' && !hatAktuell) ? new Date().getFullYear() : wahl;
  const i = folge.indexOf(angezeigt);
  let naechste = folge[(i + 1) % folge.length];
  if (!hatAktuell && naechste === folge[0]) naechste = 'aktuell';
  setCalJahr(naechste, id);
}

function setCalJahr(jahr, id) {
  id = id || 'cal';
  const neu = jahr === 'aktuell' ? 'aktuell' : Number(jahr);
  if (!neu || neu === calJahr(id)) return;
  _calJahre[id] = neu;
  _calAnsichtSpeichern();
  // Beim Jahreswechsel neu positionieren: Die gemerkte Spalte gehoert zum alten Jahr.
  _calPositioniert[id] = false;
  _calScrollPos[id] = 0;
  _calRasterBlende(id, () => renderTrainingCalendar(id, id === 'cal' ? 'ov-cal-card' : 'plans-cal-card'));
}

function renderTrainingCalendar(id, cardId) {
  id = id || 'cal';
  cardId = cardId || 'ov-cal-card';
  const card = document.getElementById(cardId);
  if (card && !document.getElementById(id + '-grid')) card.innerHTML = calendarInnerHTML(id);
  const grid = document.getElementById(id + '-grid');
  if (!grid) return;
  const byDay = buildCalendarData();

  const today = new Date(); today.setHours(0,0,0,0);
  // Gemeinsamer Kalender: Die Laeufe kommen NUR in der Uebersicht dazu (Leonard-Entscheidung
  // 01.09.2026 — der Kalender im Plaene-Tab bleibt vorerst reines Krafttraining).
  const modus = _calModus(id);
  // ZEITRAUM: entweder ein ganzes Kalenderjahr (1. Januar bis 31. Dezember) oder — Standard seit
  // dem 14.09.2026 — nur der laufende Plan („Aktuell", siehe `_calAktuellePlaene`). Das Raster
  // beginnt immer am Montag der Woche, in der der Zeitraum beginnt, damit die Wochentagszeilen
  // durchgehend stimmen. Beide Kalender folgen ihrer eigenen Auswahl (Leonard-Wunsch 06.09.2026).
  const wahl = calJahr(id);
  const aktPlaene = _calAktuellePlaene(modus);
  const aktuell = wahl === 'aktuell' && !!aktPlaene.bereich;
  const jahr = (typeof wahl === 'number') ? wahl : today.getFullYear();
  // „Aktuell" beschreibt immer den Stand von heute — wie das laufende Jahr.
  const istLaufendesJahr = aktuell || jahr === today.getFullYear();
  const von = aktuell ? aktPlaene.bereich.von : new Date(jahr, 0, 1);
  const bis = aktuell ? aktPlaene.bereich.bis : new Date(jahr, 11, 31);
  // Ausserhalb des Zeitraums (Rand-Tage der ersten/letzten Woche) = ausgegraut und nicht
  // antippbar — im Jahr die Tage des Vor- und Folgejahres, in „Aktuell" die Tage vor Planbeginn
  // und nach Planende (Leonard-Entscheidung 14.09.2026).
  const imBereich = (tag) => tag.getTime() >= von.getTime() && tag.getTime() <= bis.getTime();
  const start = new Date(von);
  start.setDate(von.getDate() - ((von.getDay() + 6) % 7));
  const wochen = Math.ceil((Math.round((bis - start) / 86400000) + 1) / 7);
  // Hat sich der Zeitraum geaendert (anderer Filter, andere Plan-Seite, ein neuer Plan), passt die
  // gemerkte Scrollposition nicht mehr — dann wie beim ersten Zeichnen neu positionieren. Beim
  // Jahreswechsel setzt `setCalJahr` das ohnehin selbst zurueck.
  const bereichKey = von.getTime() + '-' + bis.getTime();
  if (_calBereich[id] !== undefined && _calBereich[id] !== bereichKey) {
    _calPositioniert[id] = false;
    _calScrollPos[id] = 0;
  }
  _calBereich[id] = bereichKey;

  // Plan-Zeitraeume einmal vorbereiten (statt pro Tag aufzuloesen).
  const planIndex = _calPlanIndex();
  const zeigtLaeufe = modus.lauf;
  const zeigtKraft = modus.kraft;
  const laeufeTag = zeigtLaeufe ? runNachTag() : {};
  const laufGeplant = zeigtLaeufe ? runGeplanteTage() : {};
  // Wettkampftage — das ganze Kaestchen wird hellgruen (Leonard-Wunsch 04.09.2026). Nur dort,
  // wo der Kalender ueberhaupt Laeufe zeigt. ZWEI Quellen: die eigenstaendige Liste `ft_races`
  // und das `raceDate` eines Laufplans. Die Plaene kommen ZULETZT, damit ihr Name den Vorrang
  // hat, wenn ein Datum in beiden steht (`true` heisst nur „Wettkampf, ohne Plan").
  const wettkampfTage = {};
  if (zeigtLaeufe) {
    DB.getRaces().forEach(r => { wettkampfTage[r.date] = r; });
    DB.getRunPlans().forEach(p => { if (p.raceDate) wettkampfTage[_dayKeyOf(p.raceDate)] = p; });
  }

  // Eine Woche OHNE Training bekommt hellrote Kaestchen (Leonard-Wunsch 05.09.2026).
  // Es zaehlt allein, ob in der Woche etwas stattgefunden hat — auf einen laufenden Plan kommt
  // es NICHT an (am 05.09.2026 ausdruecklich so gewuenscht; eine erste Fassung hatte Wochen
  // ohne Plan ausgenommen). Einzige Bedingung bleibt, dass die Woche VORBEI ist: In einer
  // laufenden oder kommenden Woche ist noch nichts versaeumt.
  // Was als „Training" zaehlt, folgt dem Modus des Kalenders: im Gymkalender die Krafteinheiten
  // (inklusive der nachgetragenen Tage), im Laufkalender die Laeufe, im gemeinsamen beides.
  const wocheOhneTraining = (weekStart) => {
    // NUR in den Einzelkalendern (Leonard-Wunsch 09.09.2026): Im gemeinsamen
    // „Trainingskalender" gibt es die roten Spalten nicht mehr. Dort stehen Gym und Lauf
    // nebeneinander im selben Kaestchen — eine Woche ohne BEIDES ist selten, und das Rot
    // uebertoente die Marken, statt etwas zu zeigen. Im Gym- und im Laufkalender bleibt es:
    // Dort ist „diese Woche nichts" eine klare Aussage ueber genau eine Sportart.
    if (zeigtKraft && zeigtLaeufe) return false;
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd.getTime() >= today.getTime()) return false;
    for (let d = 0; d < 7; d++) {
      const tag = new Date(weekStart); tag.setDate(weekStart.getDate() + d);
      if (!imBereich(tag)) continue;
      const k = _dayKeyOf(tag.getTime());
      if (zeigtKraft && byDay[k]) return false;
      if (zeigtLaeufe && laeufeTag[k]) return false;
    }
    return true;
  };

  let cells = '';
  let months = '';
  let lastMonth = -1;
  for (let w = 0; w < wochen; w++) {
    const weekStart = new Date(start); weekStart.setDate(start.getDate() + w * 7);
    const leereWoche = wocheOhneTraining(weekStart);
    // Die Monatsbeschriftung steht ueber der Spalte, in der der ERSTE des Monats liegt
    // (Leonard-Wunsch 13.09.2026). Vorher stand sie ueber der ersten Woche, die IM neuen
    // Monat beginnt — faellt der Monatserste auf einen Dienstag oder spaeter, war das die
    // Woche danach, und die Beschriftung stand bis zu sechs Tage zu weit rechts.
    // Nur der Erste INNERHALB des Zeitraums zaehlt: Die erste Rasterwoche reicht in den
    // Dezember davor, die letzte in den Januar danach — sonst stuende „Jan" zweimal da.
    let monatsErster = null;
    for (let d = 0; d < 7; d++) {
      const tag = new Date(weekStart); tag.setDate(weekStart.getDate() + d);
      if (tag.getDate() === 1 && imBereich(tag)) { monatsErster = tag; break; }
    }
    // In „Aktuell" beginnt der Zeitraum meist mitten im Monat — die ersten Spalten stuenden dann
    // ohne Beschriftung da. Die erste Spalte traegt deshalb den Monat des Planbeginns, sofern der
    // naechste Monatserste mindestens zwei Spalten weiter liegt (sonst ueberlappten die Namen).
    if (aktuell && w === 0 && !monatsErster) {
      const naechster = new Date(von.getFullYear(), von.getMonth() + 1, 1);
      const spalteNaechster = Math.floor(Math.round((naechster - start) / 86400000) / 7);
      if (spalteNaechster >= 2) monatsErster = von;
    }
    const showLabel = !!monatsErster && monatsErster.getMonth() !== lastMonth;
    months += `<span class="cal-month">${showLabel ? monatsErster.toLocaleDateString('de-DE',{month:'short'}) : ''}</span>`;
    if (showLabel) lastMonth = monatsErster.getMonth();

    cells += '<div class="cal-week">';
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart); day.setDate(weekStart.getDate() + d);
      const key = _dayKeyOf(day.getTime());
      const entry = byDay[key];
      const future = day.getTime() > today.getTime();
      const isToday = day.getTime() === today.getTime();
      const ausserhalb = !imBereich(day);   // Rand-Tage der ersten/letzten Woche (siehe `imBereich`)
      // Flaeche = war laut damaligem Plan ein Trainingstag, Kern = tatsaechlich trainiert.
      const plan = _calPlanInfo(day, planIndex);
      const cls = ['cal-day'];
      if (ausserhalb) cls.push('outside');
      else if (leereWoche) cls.push('leer-woche');
      if (zeigtKraft && plan.planned && !ausserhalb) cls.push('planned');
      if (zeigtKraft && entry && !ausserhalb) cls.push('done');
      const lauf = !ausserhalb && laeufeTag[key];
      const laufGepl = !ausserhalb && laufGeplant[key];
      if (lauf) cls.push('run');
      else if (laufGepl) cls.push('run-planned');
      const wettkampf = !ausserhalb && wettkampfTage[key];
      if (wettkampf) cls.push('wettkampf');
      if (future) cls.push('future');
      if (isToday) cls.push('today');
      const kraftZustand = entry
        ? (plan.planned ? 'geplant und trainiert' : 'zusaetzlich trainiert')
        : (plan.planned ? (future ? 'geplant' : 'geplant, nicht trainiert') : 'kein Gym geplant');
      const zustand = kraftZustand + (lauf ? ', gelaufen' : (laufGepl ? ', Lauf geplant' : ''))
        + (wettkampf ? ', Wettkampftag' : '') + (leereWoche && !ausserhalb ? ', Woche ohne Training' : '');
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
  // Der Laufkalender zaehlt Laeufe, der Gymkalender Krafteinheiten (Leonard-Wunsch 01.09.2026).
  // In „Aktuell" steht statt der Jahressumme das VERHAELTNIS absolviert / geplant bis heute, je
  // Sportart gegen ihren eigenen laufenden Plan (`_calPlanStand`, Leonard-Wunsch 14.09.2026).
  const inRange = modus.kraft
    ? DB.getWorkouts().filter(w => new Date(w.startTs).getFullYear() === jahr).length
      + DB.getManualDays().filter(k => Number(k.slice(0, 4)) === jahr).length
    : DB.getRuns().filter(l => Number(l.date.slice(0, 4)) === jahr).length;
  const einheitWort = modus.kraft
    ? (n => n === 1 ? 'Einheit' : 'Einheiten')
    : (n => n === 1 ? 'Lauf' : 'Läufe');
  // Zeigt der Kalender BEIDE Sportarten, gehoeren auch beide Zahlen in die Kennzahl.
  const laeufeImJahr = DB.getRuns().filter(l => Number(l.date.slice(0, 4)) === jahr).length;
  const zusatzLauf = (modus.kraft && modus.lauf)
    ? `${laeufeImJahr} ${laeufeImJahr === 1 ? 'Lauf' : 'Läufe'}` : '';
  // Die Serie gehoert zu GENAU EINER Sportart und steht deshalb nur in deren Kalender
  // (Leonard-Wunsch 06.09.2026): Gymkalender = Serie der Krafteinheiten, Laufkalender = Serie
  // der Laeufe. Im gemeinsamen Trainingskalender stuenden zwei Serien nebeneinander, ohne dass
  // erkennbar waere, welche welche ist — dort bleibt sie weg.
  // Die Serie beschreibt den STAND VON HEUTE — in einem vergangenen Jahr waere sie irrefuehrend.
  // In der UEBERSICHT steht die Serie seit dem 14.09.2026 gar nicht mehr (Leonard-Wunsch) — nur
  // noch im Kalender des Plan-Tabs.
  const streak = (id === 'cal' || !istLaufendesJahr || (modus.kraft && modus.lauf)) ? 0
    : (modus.kraft ? getWeekStreak() : getRunWeekStreak());
  const titelEl = document.getElementById(id === 'cal' ? 'cal-filter-btn' : id + '-titel');
  if (titelEl) {
    titelEl.textContent = modus.titel;
    // Der Titel traegt die Farbe der Sportart, die der Kalender zeigt (Leonard-Wunsch
    // 06.09.2026): Gym dunkelgruen, Lauf hellgruen, beide zusammen in der normalen Textfarbe.
    // Als KLASSE, nicht als Inline-Farbe — sonst schlaege sie die Glas-Regel, die den Titel
    // im Transparenz-Modus weiss setzt.
    titelEl.classList.toggle('cal-titel-gym', modus.kraft && !modus.lauf);
    titelEl.classList.toggle('cal-titel-lauf', modus.lauf && !modus.kraft);
  }
  // Das Jahr steht seit dem 06.09.2026 NEBEN dem Titel statt vorn in der Kennzahl
  // (Leonard-Wunsch) und ist in BEIDEN Kalendern ein Auswahlfeld — der Plan-Tab zeigte
  // zunaechst nur Text, seit dem 06.09.2026 kommt man auch dort in vergangene Jahre.
  // Der Wechsler zeigt nur den Zeitraum als Text — die Reihenfolge der Stufen steht in
  // `wechselCalJahr`.
  const jahrEl = document.getElementById(id + '-jahr');
  if (jahrEl) jahrEl.textContent = aktuell ? 'Aktuell' : String(jahr);
  const statsEl = document.getElementById(id + '-stats');
  if (statsEl) {
    const kombi = modus.kraft && modus.lauf;
    // Jeder Teil traegt die Klasse SEINER Sportart (19.09.2026, Leonard-Wunsch): In der
    // Uebersicht steht der Gym-Teil dunkelgruen, der Lauf-Teil hellgruen — dieselben Farben wie
    // Titel und Fusszeile. Gefaerbt wird im CSS und nur in `#ov-cal-card`; der Trennpunkt und die
    // Serie (nur im Plan-Tab) bleiben in der Grundfarbe.
    const teil = (sport, text) => `<span class="cal-stat-${sport}">${escapeHtml(text)}</span>`;
    const kennzahl = aktuell
      ? [modus.kraft ? teil('gym', _calPlanStandText('gym', _calPlanStand('gym', aktPlaene.gym, von, today), kombi)) : null,
         modus.lauf ? teil('lauf', _calPlanStandText('lauf', _calPlanStand('lauf', aktPlaene.lauf, von, today), kombi)) : null]
          .filter(Boolean).join(' · ')
      : teil(modus.kraft ? 'gym' : 'lauf', `${inRange} ${einheitWort(inRange)}`)
        + (zusatzLauf ? ' · ' + teil('lauf', zusatzLauf) : '');
    statsEl.innerHTML = kennzahl
      + (streak > 0 ? ` · Serie ${streak} ${streak === 1 ? 'Woche' : 'Wochen'}` : '');
  }

  // Kaestchengroesse und Abstand kommen BEIDE aus dem CSS (--cal-cell, --cal-gap), damit
  // jedes Mass nur an einer Stelle steht: Hier ergeben sie die Spaltenbreite fuer
  // Plan-Umrandungen und Scrollposition, im CSS die tatsaechlichen Kaestchen und Luecken.
  // Liefen die beiden Seiten auseinander, verschoeben sich die Umrandungen gegenueber den
  // Spalten — je weiter rechts, desto staerker.
  // FESTE Groesse, keine Anpassung an die Bildschirmbreite mehr (Leonard-Wunsch 01.09.2026):
  // Das Raster soll im Querformat genauso gross sein wie im Hochformat und dort ebenfalls
  // waagerecht gescrollt werden. Die frueheren Konstanten CAL_CELL_DEFAULT/CAL_CELL_MIN und
  // die Schleife, die das Kaestchen bis zum Hineinpassen des ganzen Jahres verkleinert hat,
  // sind damit entfallen.
  const wurzelStil = getComputedStyle(document.documentElement);
  const CAL_GAP = parseFloat(wurzelStil.getPropertyValue('--cal-gap')) || 3;
  const zelle = parseFloat(wurzelStil.getPropertyValue('--cal-cell')) || 19;
  const SPALTE = zelle + CAL_GAP;

  // ── Plan-Laufzeiten (Variante A + D, Leonard-Entscheidung 04.09.2026) ────────────
  // Statt eines Rahmens UM die Wochenspalten: der Planname in einer Zeile UEBER dem Raster
  // und ein farbiger Balken direkt DARUNTER. Zusammen klammern die beiden den Zeitraum ein,
  // ohne die Kaestchen zu beruehren. Der Rahmen (`.cal-band`) ist damit entfallen — er zeigte
  // nur, DASS ein Plan lief, nicht welcher, und zwei ueberlappende Rahmen lagen aufeinander.
  const namenEl = document.getElementById(id + '-plannames');
  const spurenEl = document.getElementById(id + '-planlanes');
  const spurenObenEl = document.getElementById(id + '-planlanes-oben');
  if (namenEl && spurenEl && spurenObenEl) {
    // Spalte NICHT über Millisekunden-Division bestimmen: Zwischen Winter- und Sommerzeit
    // fehlt eine Stunde, wodurch ein Datum genau auf einer Wochengrenze in die Vorwoche
    // rutschte. Über ganze Tage gerundet stimmt es.
    const spalteFuer = (ts) => {
      const d = new Date(ts); d.setHours(0, 0, 0, 0);
      return Math.floor(Math.round((d - start) / 86400000) / 7);
    };
    const rasterEnde = new Date(start.getTime());
    rasterEnde.setDate(rasterEnde.getDate() + wochen * 7);
    rasterEnde.setMilliseconds(-1);
    // Welche Plaene der Kalender zeigt, folgt seinem Modus: Gymkalender nur Trainingsplaene,
    // Laufkalender nur Laufplaene, die Uebersicht im Modus „beide" beide Arten.
    const imBild = (p) => p && p.startDate
      && p.startDate <= rasterEnde.getTime() && (p.endDate || Infinity) >= start.getTime();
    const zeitraeume = [];
    if (modus.kraft) DB.getPlans().filter(imBild).forEach(p => zeitraeume.push({ p, typ: 'gym' }));
    if (modus.lauf)  DB.getRunPlans().filter(imBild).forEach(p => zeitraeume.push({ p, typ: 'lauf' }));
    zeitraeume.sort((a, b) => (a.typ === b.typ ? a.p.startDate - b.p.startDate : (a.typ === 'gym' ? -1 : 1)));

    // Jede Sportart bekommt ihre eigene Spur, damit Gym und Lauf sich nie ueberlagern.
    // Ueberschneiden sich ZWEI Plaene derselben Sportart, oeffnet der zweite eine weitere
    // Spur — sonst stuenden zwei Namen uebereinander.
    const spuren = [];   // je Eintrag: { typ, bis }
    const stuecke = [];  // je Eintrag: { p, typ, von, bis, spur }
    zeitraeume.forEach(({ p, typ }) => {
      const von = Math.max(0, spalteFuer(p.startDate));
      const bis = Math.min(wochen - 1, spalteFuer(p.endDate || rasterEnde.getTime()));
      if (bis < von) return;
      let nr = spuren.findIndex(sp => sp.typ === typ && sp.bis < von);
      if (nr < 0) { nr = spuren.length; spuren.push({ typ, bis }); }
      else spuren[nr].bis = bis;
      stuecke.push({ p, typ, von, bis, spur: nr });
    });

    const NAME_H = 15, NAME_GAP = 3, SPUR_H = 5, SPUR_GAP = 3;
    const stil = (st) => `left:${st.von * SPALTE}px;width:${(st.bis - st.von + 1) * SPALTE - CAL_GAP}px`;
    const klasse = (st) => (st.typ === 'lauf' ? ' lauf' : '') + (st.p.archived ? ' archiviert' : '');

    // Zeigt der Kalender BEIDE Sportarten, bleiben die Namen weg (Leonard-Wunsch 04.09.2026):
    // Mit Gym- und Laufplaenen gleichzeitig standen bis zu vier Zeilen Text ueber dem Raster.
    // In den Einzelansichten (Gymkalender, Laufkalender) erscheinen sie unveraendert.
    const zeigtNamen = !(modus.kraft && modus.lauf);
    namenEl.innerHTML = zeigtNamen ? stuecke.map(st =>
      `<span class="cal-planname${klasse(st)}" style="${stil(st)};top:${st.spur * (NAME_H + NAME_GAP)}px"
             title="${escapeHtml(st.p.name || '')}">${escapeHtml(st.p.name || 'Plan')}</span>`).join('') : '';
    // Derselbe Balken OBEN wie UNTEN (Leonard-Wunsch 04.09.2026): Er steht direkt unter dem
    // Namen und noch einmal unter dem Raster — die beiden klammern den Zeitraum sichtbar ein.
    const balken = stuecke.map(st =>
      `<span class="cal-planspur${klasse(st)}" style="${stil(st)};top:${st.spur * (SPUR_H + SPUR_GAP)}px"></span>`).join('');
    spurenObenEl.innerHTML = balken;
    spurenEl.innerHTML = balken;

    // Beide Zeilen sind absolut gefuellt und haetten sonst die Hoehe null. Die Namenszeile
    // schiebt ausserdem das Raster nach unten — die Wochentagsspalte liegt ABSOLUT ueber dem
    // Kalender und muss denselben Versatz mitrechnen, sonst steht „Mo" nicht mehr auf einer
    // Linie mit der ersten Rasterzeile. Deshalb `--cal-names-h` als gemeinsame Quelle.
    const anzahl = spuren.length;
    const hNamen = (anzahl && zeigtNamen) ? anzahl * NAME_H + (anzahl - 1) * NAME_GAP : 0;
    const hBalken = anzahl ? anzahl * SPUR_H + (anzahl - 1) * SPUR_GAP : 0;
    namenEl.style.height = hNamen + 'px';
    namenEl.style.marginBottom = hNamen ? '3px' : '0';
    spurenObenEl.style.height = hBalken + 'px';
    spurenObenEl.style.marginBottom = anzahl ? '6px' : '0';
    spurenEl.style.height = hBalken + 'px';
    spurenEl.style.marginTop = anzahl ? '7px' : '0';
    // Alles, was UEBER dem Raster liegt, muss die absolut positionierte Wochentagsspalte
    // mitrechnen — sonst steht „Mo" nicht mehr auf einer Linie mit der ersten Rasterzeile.
    if (card) card.style.setProperty('--cal-names-h',
      (anzahl ? (hNamen ? hNamen + 3 : 0) + hBalken + 6 : 0) + 'px');
  }

  // Beim ERSTEN Aufbau zum Beginn des laufenden Plans scrollen (13.09.2026, Leonard-Wunsch —
  // vorher zur aktuellen Woche). Danach die Position des Nutzers HALTEN:
  // `renderTrainingCalendar` laeuft bei jedem Tabwechsel erneut (ueber `_applyTabState`), und
  // ein erneutes Setzen liess das Raster jedes Mal zurueckspringen (gemeldet 01.09.2026).
  const scroller = document.getElementById(id + '-scroll');
  if (scroller && !scroller.dataset.posMerker) {
    scroller.dataset.posMerker = '1';
    scroller.addEventListener('scroll', () => {
      if (_calPositioniert[id]) _calScrollPos[id] = scroller.scrollLeft;
    }, { passive: true });
  }
  if (scroller) requestAnimationFrame(() => {
    if (_calPositioniert[id]) { scroller.scrollLeft = _calScrollPos[id] || 0; return; }
    if (!scroller.clientWidth) return;   // im unsichtbaren Tab nicht messbar — spaeter erneut
    const spalteVon = (ts) => {
      const d = new Date(ts); d.setHours(0, 0, 0, 0);
      return Math.floor(Math.round((d - start) / 86400000) / 7);
    };
    // ── Wo faengt die Ansicht an? (13.09.2026, Leonard-Entscheidung) ──
    // 1. Beim Beginn des laufenden Plans — JEDER Kalender folgt dabei seiner eigenen
    //    Sportart: Gymkalender dem Gymplan, Laufkalender dem Laufplan, der gemeinsame
    //    Trainingskalender dem frueheren von beiden. Sonst begaenne der Laufkalender beim
    //    Start eines Gymplans, dessen Daten er gar nicht zeigt.
    // 2. Liegt dieser Beginn nicht im angezeigten Jahr (anderes Jahr gewaehlt, oder der Plan
    //    laeuft schon seit dem Vorjahr): Spalte des aktuellen Monats — aber nur im laufenden
    //    Jahr, sonst gibt es keinen „aktuellen Monat".
    // 3. Sonst der Jahresanfang.
    const starts = [];
    if (modus.kraft) { const gp = getActivePlan(); if (gp && gp.startDate) starts.push(gp.startDate); }
    if (modus.lauf)  { const rp = runPlanAktiv(); if (rp && rp.startDate) starts.push(rp.startDate); }
    const planStart = starts.length ? Math.min(...starts) : null;
    let zielSpalte = 0;
    // In „Aktuell" beginnt das Raster ohnehin beim Planbeginn — Spalte 0.
    if (aktuell) zielSpalte = 0;
    else if (planStart != null && new Date(planStart).getFullYear() === jahr) zielSpalte = spalteVon(planStart);
    else if (istLaufendesJahr) zielSpalte = spalteVon(new Date(jahr, today.getMonth(), 1).getTime());
    let ziel = Math.max(0, zielSpalte * SPALTE);
    // HEUTE muss sichtbar bleiben (Leonard-Entscheidung 13.09.2026): Ein 18-Wochen-Plan ist
    // breiter als die rund 10 sichtbaren Spalten — beim Planbeginn stehend waere die aktuelle
    // Woche aus dem Bild, und man muesste jedes Mal nach rechts scrollen. Liegt heute rechts
    // ausserhalb, wird nur so weit nachgeschoben, dass sein Kaestchen gerade hineinpasst.
    if (istLaufendesJahr) {
      const mindestens = spalteVon(today.getTime()) * SPALTE + zelle - scroller.clientWidth;
      if (ziel < mindestens) ziel = mindestens;
    }
    ziel = Math.max(0, Math.min(ziel, scroller.scrollWidth - scroller.clientWidth));
    scroller.scrollLeft = ziel;
    _calScrollPos[id] = ziel;
    _calPositioniert[id] = true;
    // KEIN `touch-action` hier. Der Versuch (01.09.2026), dem Browser mit `pan-x` die Wahl
    // zwischen senkrechtem Seiten- und waagerechtem Rasterscroll abzunehmen, hat das
    // Stocken nicht behoben — und in Tabs, deren Seite senkrecht scrollt (Uebersicht),
    // nimmt es der Geste zusaetzlich den senkrechten Ausweg. Beim Wiederaufgreifen bedenken.
  });
}

// Tippen auf ein Kästchen: Tag in der Fußzeile beschreiben.
// Setzt den Inhalt der Kalender-Fusszeile und faehrt ihre Hoehe weich nach (13.09.2026,
// Leonard-Wunsch): Aufklappen beim ersten Tipp, Zuklappen beim zweiten Tipp oder beim Tipp
// daneben, und beim Wechsel auf einen anderen Tag gleitet sie auf die neue Hoehe.
// Leerer Inhalt = zuklappen: Der ALTE Inhalt bleibt waehrend der Bewegung stehen und
// verschwindet erst am Ende (sonst schrumpfte eine leere Flaeche, und `:empty` blendete die
// Zeile sofort aus).
// TOKEN: Tippt man waehrend einer laufenden Bewegung erneut, bricht die alte ab und die neue
// beginnt an der AKTUELLEN Hoehe. Der Abschluss der alten Bewegung darf dann nichts mehr
// anfassen — sonst leerte ihr „am Ende leeren" den gerade neu gesetzten Inhalt.
function _calFussSetzen(el, html) {
  const token = (el._fussToken || 0) + 1;
  el._fussToken = token;
  const von = el.getBoundingClientRect().height;
  el.getAnimations().forEach(a => a.cancel());
  el.style.overflow = '';
  if (_bewegungReduziert() || !el.animate) { el.innerHTML = html; return; }
  const aufraeumen = (leeren) => () => {
    if (el._fussToken !== token) return;
    el.style.overflow = '';
    if (leeren) el.innerHTML = '';
  };
  if (!html) {
    if (von < 1) { el.innerHTML = ''; return; }
    el.style.overflow = 'hidden';
    _boxFahren(el, von, 0, aufraeumen(true));
    return;
  }
  el.innerHTML = html;
  const bis = el.getBoundingClientRect().height;
  if (Math.abs(bis - von) < 1) return;
  el.style.overflow = 'hidden';
  _boxFahren(el, von, bis, aufraeumen(false));
}

function showCalDay(key, id) {
  id = id || 'cal';
  const el = document.getElementById(id + '-detail');
  if (!el) return;
  const entry = buildCalendarData()[key];
  const [y, m, d] = key.split('-').map(Number);
  const dateStr = new Date(y, m-1, d).toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' });
  const scope = document.getElementById(id + '-grid');
  if (scope) {
    const cell = scope.querySelector(`.cal-day[data-key="${key}"]`);
    // Ein ZWEITER Tipp auf denselben Tag raeumt die Beschreibung wieder weg
    // (Leonard-Wunsch 09.09.2026) — derselbe Weg hinein und hinaus. Gilt fuer alle
    // Kalender, weil beide dieselbe Funktion nutzen.
    if (cell && cell.classList.contains('sel')) {
      cell.classList.remove('sel');
      _calFussSetzen(el, '');
      return;
    }
    scope.querySelectorAll('.cal-day.sel').forEach(c => c.classList.remove('sel'));
    if (cell) cell.classList.add('sel');
  }
  // Neben dem Ergebnis auch nennen, was fuer den Tag vorgesehen war — sonst bliebe
  // unklar, ob ein leerer Tag ein Ruhetag oder eine ausgefallene Einheit ist.
  const plan = _calPlanInfo(new Date(y, m-1, d), _calPlanIndex());
  // Im Lauf-Modus bleibt vom Trainingsteil nur das Datum stehen.
  const modus = _calModus(id);
  const kraft = modus.kraft;
  // Zeile 1: Wochentag und Datum. Darunter ZWEI SPALTEN — links Gym, rechts Laufen
  // (Leonard-Wunsch 06.09.2026; vorher standen sie untereinander). Jede Spalte nennt entweder
  // die absolvierte Einheit (als Knopf zur Detailansicht) oder was fuer den Tag geplant war.
  // Zeigt der Kalender nur eine Sportart, bleibt die andere Spalte weg.
  const heute0 = new Date(); heute0.setHours(0, 0, 0, 0);
  const kommt = new Date(y, m-1, d).getTime() > heute0.getTime();

  // ── Spalte Gym ───────────────────────────────────────────────────
  let gymHTML = '';
  if (modus.kraft) {
    if (entry) {
      // getWorkouts() ist neueste-zuerst; bei mehreren Einheiten am selben Tag zaehlt die
      // zuletzt begonnene.
      const woIdx = DB.getWorkouts().findIndex(w => _dayKeyOf(w.startTs) === key);
      const name = entry.names.join(', ') + (plan.known && !plan.planned ? ' · zusätzlich' : '');
      // Oeffnet die bestehende Detailansicht der Einheit (`#modal-hist-detail`).
      // `stopPropagation` ist Pflicht: Sonst raeumt initCalendarDeselect die Beschreibung im
      // selben Klick weg.
      gymHTML = woIdx >= 0
        ? `<button type="button" class="cal-detail-tag"
                   onclick="event.stopPropagation();showHistDetail(${woIdx})"><span
                   class="cal-detail-tagname">${name}</span><span
                   class="cal-detail-chev">▾</span></button>`
        : `<div class="cal-detail-tag-txt">${name}</div>`;
    } else if (plan.planned) {
      gymHTML = `<div class="cal-detail-tag-txt">geplant: ${plan.name ? escapeHtml(plan.name) : 'Training'}`
              + (kommt ? '' : ' · nicht trainiert') + '</div>';
    } else if (plan.known) {
      // Nur INNERHALB eines Plans — ohne abdeckenden Plan bleibt die Spalte leer, „kein
      // Training" sagte nichts aus (Leonard-Wunsch 04.09.2026).
      gymHTML = `<div class="cal-detail-tag-txt">Kein Gym geplant</div>`;
    }
  }

  // ── Spalte Laufen ────────────────────────────────────────────────
  let laufHTML = '';
  let wkHTML = '';
  if (modus.lauf) {
    // Ein Wettkampf AUS EINEM PLAN nennt dessen Namen; ein eigenstaendiger (`ft_races`) hat
    // keinen, dort steht nur „Wettkampf". Der Plan hat Vorrang, falls beides auf denselben Tag faellt.
    const wk = DB.getRunPlans().find(p => p.raceDate && _dayKeyOf(p.raceDate) === key);
    if (wk) wkHTML = `<div class="cal-detail-run wettkampf">🏁 Wettkampf · ${escapeHtml(wk.name || 'Laufplan')}</div>`;
    else {
      const eigen = DB.getRaces().find(r => r.date === key);
      if (eigen) wkHTML = `<div class="cal-detail-run wettkampf">🏁 Wettkampf${eigen.name ? ' · ' + escapeHtml(eigen.name) : ''}</div>`;
    }
    const lauf = runNachTag()[key];
    const gepl = runGeplanteTage()[key];
    if (lauf) {
      // Lauf: Strecke und Zeit. Intervalltraining hat keine sinnvolle Strecke — dort
      // stehen Dauer und Maximalpuls (Leonard-Wunsch 01.09.2026).
      const werte = lauf.art === 'hiit'
        ? [fmtMin(lauf.minutes), lauf.maxHR ? `max. ${Math.round(lauf.maxHR)} bpm` : null].filter(Boolean).join(' · ')
        : `${fmtKm(lauf.km)} · ${fmtMin(lauf.minutes)}`;
      const bez = lauf.art === 'hiit' ? 'HIIT: ' : '';
      laufHTML = `<button type="button" class="cal-detail-tag"
                          onclick="event.stopPropagation();showRunDetail('${key}')"><span
                          class="cal-detail-tagname">${bez}${werte}</span><span
                          class="cal-detail-chev">▾</span></button>`;
    } else if (gepl) {
      const u = gepl.einheit;
      const soll = u ? [u.km ? fmtKm(u.km) : null, u.minutes ? fmtMin(u.minutes) : null, u.zone || null].filter(Boolean).join(' · ') : '';
      laufHTML = `<div class="cal-detail-tag-txt">geplant${soll ? ': ' + soll : ''}</div>`;
    } else if (_laufplanDeckt(key)) {
      // Gegenstueck zu „Kein Gym geplant": nur INNERHALB eines Laufplans (Leonard-Wunsch
      // 06.09.2026).
      laufHTML = `<div class="cal-detail-tag-txt">Kein Lauf geplant</div>`;
    }
  }

  // Eine LEERE Spalte wird gar nicht erst gezeichnet (Leonard-Wunsch 06.09.2026): Sonst hielte
  // sie ihren Platz und die Laufinfo stuende rechts, obwohl links nichts steht — ein Tag mit
  // Lauf, aber ohne Gym sah dadurch aus, als fehle etwas. Bleibt nur eine Spalte uebrig, nimmt
  // sie die volle Breite und beginnt damit wieder links.
  const spaltenHTML = [
    (modus.kraft && gymHTML) ? `<div class="cal-detail-spalte gym">${gymHTML}</div>` : '',
    (modus.lauf && laufHTML) ? `<div class="cal-detail-spalte lauf">${laufHTML}</div>` : '',
  ].filter(Boolean);
  const spalten = spaltenHTML.length ? `<div class="cal-detail-spalten">${spaltenHTML.join('')}</div>` : '';

  _calFussSetzen(el, `<div class="cal-detail-datum"><strong>${dateStr}</strong></div>${wkHTML}${spalten}`);
}

// Liegt der Tag in der Laufzeit eines Laufplans? Gegenstueck zu `plan.known` beim Gymplan —
// nur dort steht „Kein Lauf geplant", sonst bliebe die Spalte das halbe Jahr ueber gefuellt.
function _laufplanDeckt(key) {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(y, m - 1, d).getTime();
  return DB.getRunPlans().some(p => p.startDate && p.endDate
    && t >= _calLokalTag(p.startDate).getTime() && t <= _calLokalTag(p.endDate).getTime());
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
    container.innerHTML = '<p style="font-size:var(--fs-neben);color:var(--text3);text-align:center;padding:8px 0">Noch keine Daten</p>';
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
  // Figuren links, Legende rechts daneben (Leonard-Wunsch 01.09.2026) — vorher stand die
  // Legende UNTER den Figuren, wodurch die Karte deutlich hoeher war als die
  // Volumenentwicklung daneben.
  container.innerHTML = `<div class="mmap-body">${muscleMapSvg(vol, maxVol)}<div class="mmap-legend">${legend}</div></div>`;
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
  const num = number || 1;
  const valColor = muscleColor(muscleKey);
  // Hervorgehoben ist die Bestleistung selbst; die Steigerung steht grau in Klammern
  // am Ende der Beschreibung (Leonard-Wunsch).
  const zunahme = (pr.prev && pr.weight > pr.prev)
    ? ` <span class="pr-v2-delta">(+${fmtKg(pr.weight - pr.prev)} kg)</span>` : '';
  // Einheit nur einmal nennen — sonst bricht die Zeile auf dem iPhone um.
  // Die Satzangabe („3×6") stand frueher davor und ist am 01.09.2026 entfallen
  // (Leonard-Wunsch) — deshalb hier auch kein fuehrendes Trennzeichen mehr.
  const verlauf = pr.prev ? `${fmtKg(pr.prev)} → ${fmtKg(pr.weight)} kg` : '';
  return `<div class="pr-v2-row no-icon" style="--mc:${valColor};--mc-bg:${muscleBg(muscleKey)}" onclick="showHistDetailForEx('${pr.exId}', ${pr.date || 0})">
    <div class="pr-v2-num">${num}</div>
    <div>
      <div class="pr-v2-name">${pr.name}</div>
      <div class="pr-v2-sub">${verlauf}${zunahme}</div>
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

 // Toggle für die kollabierbare "Andere Trainingstage"-Sektion

function renderMehr() {
  renderAppVersion();
  // Einstellungen-Overlay: Cloud-Sync, Papierkorb, Daten & Sicherheit.
  // Trainingsplan-Daten/Wochenplan/Trainingstage sind in den Plan-Detail-Screen umgezogen.
  if (typeof renderDriveStatus === 'function') renderDriveStatus();
  renderRunSourceCard();
  renderTrash();
}

// ═══════════════════════════════════════════════
// SCREEN: TRAININGSPLÄNE (Liste + Detail)
// ═══════════════════════════════════════════════

// Ist der Plan BEENDET, also sein letzter Tag vorbei? Gerechnet in KALENDERTAGEN, nicht in
// Millisekunden: Der Gymplan speichert sein Ende als UTC-Mitternacht (in Mitteleuropa 02:00 des
// letzten Tags), der Laufplan als lokale Mitternacht — `_calLokalTag` macht aus beidem denselben
// Kalendertag. Ein Vergleich mit `Date.now()` hielte den Gymplan schon am Morgen seines letzten
// Tags fuer beendet.
function _planBeendet(p) {
  return !!p && _planIstVorbei(p, _calLokalTag(Date.now()));
}

// BEENDETE PLAENE WANDERN VON SELBST INS ARCHIV — Gym- UND Laufplaene, sobald ihr letzter Tag
// vorbei ist (18.09.2026, Leonard-Wunsch). Vorher nur Gymplaene und erst 30 Tage nach dem Ende;
// Laufplaene gar nicht.
// Laeuft beim App-Start und vor dem Zeichnen beider Planlisten — auch eine App, die ueber
// Mitternacht offen bleibt, holt es beim naechsten Blick in die Liste nach.
// NUR EINMAL JE ENDDATUM (`autoArchivEnde`): Holt man einen beendeten Plan von Hand aus dem
// Archiv, darf er nicht beim naechsten Zeichnen sofort zurueckwandern — beim Gymplan legt das
// Zurueckholen sogar frische Kopien seiner Trainingstage an, jeder Rueckfall haette also neue
// Tage erzeugt. Verschiebt man das Ende und ist auch das neue vorbei, wird wieder archiviert.
// Der Gymplan friert beim Archivieren seine Tage ein (Snapshot, Tag-Modell v2) — genau wie beim
// Archivieren von Hand, damit der Rueckblick nicht von spaeteren Aenderungen der Tage abhaengt.
function autoArchivBeendetePlaene() {
  const ziehen = (liste, einfrieren) => {
    let geaendert = false;
    for (const p of liste) {
      if (p.archived || !_planBeendet(p) || p.autoArchivEnde === p.endDate) continue;
      if (einfrieren) p.archivedDays = JSON.parse(JSON.stringify(resolvePlanDays(p)));
      p.archived = true;
      p.autoArchivEnde = p.endDate;
      geaendert = true;
    }
    return geaendert;
  };
  const plaene = DB.getPlans();
  if (ziehen(plaene, true)) DB.savePlans(plaene);
  const laufplaene = DB.getRunPlans();
  if (ziehen(laufplaene, false)) DB.saveRunPlans(laufplaene);
}

// Quote eines BEENDETEN Plans fuer die Beschreibungszeile seiner Karte (18.09.2026,
// Leonard-Wunsch, Wortlaut „84 % der Einheiten" — auch beim Laufplan, dessen Einheiten im
// Datenmodell ebenfalls `units` heissen). Gezaehlt wird wie in der Kennzahl des Kalenders
// (`_calPlanStand`): absolvierte gegen geplante Einheiten vom ersten bis zum letzten Plantag;
// ueber 100 % ist moeglich. Ohne geplante Einheit gibt es keine Quote.
// Die Quote ist ein eigener Teil der Zeile (`.ppv-meta-teil`): Passt sie nicht mehr hinein
// (auf dem iPhone die Regel), rutscht sie als Ganzes in die zweite Zeile, und der Trennpunkt
// davor verschwindet — siehe `.ppv-meta.mit-quote` im CSS.
function planMetaZeile(sport, p, text) {
  if (!_planBeendet(p)) return `<div class="ppv-meta">${text}</div>`;
  const st = _calPlanStand(sport, p, null, new Date());
  if (!st.geplant) return `<div class="ppv-meta">${text}</div>`;
  const quote = Math.round(st.absolviert / st.geplant * 100) + '\u00A0% der Einheiten';
  return `<div class="ppv-meta mit-quote"><div class="ppv-meta-in">` +
    `<span class="ppv-meta-teil">${text}</span><span class="ppv-meta-teil">${quote}</span></div></div>`;
}

// Status eines Plans relativ zu heute
// In KALENDERTAGEN (18.09.2026, siehe `_planHatBegonnen`): am ersten und letzten Tag 'active'.
function planStatus(p) {
  if (p.archived) return 'archived';
  const heute = _calLokalTag(Date.now());
  if (p.startDate && !_planHatBegonnen(p, heute)) return 'future';
  if (_planIstVorbei(p, heute)) return 'past';
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
// opts.selectedIdx  = Wochentag, der als ausgewaehlt markiert wird (Trainings-Tab)
// opts.dayOnTap      = Funktionsname fuer den Tipp auf einen Wochentag. OHNE ihn sind die
//                      Wochentage reine Anzeige und der Tipp faellt auf die KARTE durch.
// opts.filterOnTap   = Titel wird zum Filterknopf der Uebersichts-Wochenkarte statt Planname
// opts.nurPlan       = die Karte zeigt den PLAN, nicht die laufende Woche (Plan-Tab,
//                      13.09.2026): geplante Tage gefuellt, keine Unterscheidung „geplant /
//                      absolviert / verschoben" und keine Kennzahl „x/y diese Woche".
// onTap === false    = die KARTE selbst tut nichts (`null`/weggelassen = Standardziel).
//                      Sie verliert dann auch Zeigefinger und Tipp-Animation, sonst
//                      antwortete sie sichtbar auf einen Tipp, der nichts bewirkt.
function buildPlanCard(p, onTap, hideToday, hideStatus, hideMeta, opts) {
  opts = opts || {};
  const todayIdx = (new Date().getDay()+6) % 7;
  const status = planStatus(p);
  const isCurrent = status === 'active';
  // Die Karte beschreibt die LAUFENDE WOCHE nur beim aktiven Plan — und nur dort, wo sie nicht
  // ausdruecklich den Plan selbst zeigen soll (`opts.nurPlan`, Plan-Tab).
  const zeigtWoche = isCurrent && !opts.nurPlan;
  const weekDone = zeigtWoche ? getCurrentWeekDays() : null;   // erledigte Trainings dieser Woche
  const days = resolvePlanDays(p);
  const byId = {}; days.forEach(d => { byId[d.id] = d; });
  const wp = (p.weekPlan && p.weekPlan.length) ? p.weekPlan : DEFAULT_WEEKPLAN;
  // Nur Wochentage, keine Trainingstag-Namen (Leonard-Wunsch): geplante Tage stehen in einem
  // eingefärbten Kreis (Akzentfarbe = geplant, grün = diese Woche erledigt, Ring = heute).
  // Die konkreten Tagnamen zeigt die Plan-Detailansicht.
  const strip = wp.map((w, i) => {
    const d = w.planDayId ? byId[w.planDayId] : null;
    const today = isCurrent && i === todayIdx && !hideToday;
    // „Erledigt" haengt am TAG, nicht am Plan (Leonard-Wunsch 08.09.2026): Eine Einheit an
    // einem ungeplanten Tag bekommt ihren Haken genauso. Vorher stand hier `d && …` — ein
    // vorgezogenes Training war dadurch unsichtbar, obwohl der Zaehler im Kartenkopf es
    // laengst mitzaehlte (`getWeekStatus` filtert nicht nach Plan). Die Laufkarte verhielt
    // sich schon immer so.
    const done = weekDone && weekDone[i] && weekDone[i].dayDone;
    // Die hier geplante Einheit wurde an einem anderen Tag gemacht — der Tag ist damit
    // erledigt, aber nicht hier. Siehe `_verschobeneZuordnen`.
    const verschoben = !!(weekDone && weekDone[i] && weekDone[i].verschoben);
    const cls = ['ppv-col'];
    if (d) cls.push('training');
    if (done) cls.push('done');
    if (verschoben) cls.push('verschoben');
    if (today) cls.push('today');
    // GEFUELLT heisst „absolviert" — dieselbe Regel wie in der Kombi-Karte (13.09.2026,
    // Leonard-Wunsch). Geplant und noch nicht absolviert ist UMRANDET, egal ob heute, kuenftig
    // oder ausgefallen. Vorher hing die Kontur am Datum (`.zukunft`, `i > todayIdx`), und ein
    // geplanter Tag von heute oder gestern sah aus wie erledigt.
    // Ein verschobener Tag ist erledigt, nur nicht hier — er bekommt seinen grauen Zustand,
    // keine Kontur.
    if (zeigtWoche && d && !done && !verschoben) cls.push('offen');
    if (opts.selectedIdx === i) cls.push('selected');
    // Ein Wochentag bekommt seinen EIGENEN Tipp nur, wenn der Aufrufer einen nennt
    // (`opts.dayOnTap`) — genau wie bei `buildRunPlanCard`. Ohne Angabe faellt der Klick auf
    // die Karte durch, die ganze Kachel ist damit EIN Ziel.
    // Seit dem 06.09.2026 nennt ihn nur noch der Trainings-Tab (`selectWorkoutDay`); dort
    // waehlt der Tipp den Tag aus, weil man schon auf der Seite ist, die ihn zeigt.
    // Uebersicht und Plaene-Tab lassen ihn weg (beides Leonard-Wunsch): In der Uebersicht
    // fuehrt jede Stelle der Karte auf die Plan-Seite dieser Sportart, im Plaene-Tab oeffnet
    // jede Stelle die Detailansicht. Vorher sprang der Wochentag dort in den Trainings-Tab —
    // zwei Ziele in einer Kachel, und im Plaene-Tab ein Wisch in einen fremden Tab.
    const tap = (isCurrent && opts.dayOnTap)
      ? ` onclick="event.stopPropagation();${opts.dayOnTap}(${i})" role="button" tabindex="0" aria-label="${w.label} öffnen"`
      : '';
    return `<div class="${cls.join(' ')}"${tap}><span class="ppv-wd">${w.label}</span></div>`;
  }).join('');
  let progress = '';
  if (isCurrent) {
    const pw = _planProgramWeek(p);
    const pct = Math.round(pw.num / (pw.total || 1) * 100);
    // Die Kennzahl „x/y diese Woche" gehoert zur laufenden Woche und entfaellt deshalb im
    // Plan-Tab (`opts.nurPlan`). „Woche 8 / 9" und der Balken bleiben: Sie beschreiben, wo der
    // PLAN steht, nicht was man diese Woche trainiert hat.
    const adh = opts.nurPlan ? '' : (() => { const ws = getWeekStatus();
      return `<span class="ppv-adh">${ws.done}/${ws.planned} diese Woche</span>`; })();
    progress = `<div class="ppv-progress">
      <span class="ppv-wk">Woche ${pw.num} / ${pw.total}</span>
      <div class="ppv-bar"><div class="ppv-bar-fill" style="width:${Math.min(100,pct)}%"></div></div>
      ${adh}
    </div>`;
  }
  // `onTap === false` = die Karte ist stumm (Trainings-Tab, Leonard-Wunsch 06.09.2026): Dort
  // steuert die Karte nur die Tagesauswahl, ein Tipp daneben soll NICHT in den Plan-Tab
  // wischen. `karte-inert` nimmt ihr dafuer Zeigefinger und Stauchung.
  const inert = onTap === false;
  const kartenTipp = inert ? '' : ` onclick="${onTap || `openPlanDetail('${p.id}')`}"`;
  return `<div class="plan-card-v2 plan-status-${status}${isCurrent ? ' active' : ''}${inert ? ' karte-inert' : ''}"${kartenTipp}>
    <div class="ppv-head">
      ${opts.filterOnTap ? wochenFilterTitel('ppv-name')
        : `<div class="ppv-name">${PPV_ICON_HANTEL}${escapeHtml(p.name)}</div>`}
      ${hideStatus ? '' : `<span class="plan-status-chip plan-status-chip-${status}">${PLAN_STATUS_LABEL[status]}</span>`}
    </div>
    ${hideMeta ? '' : planMetaZeile('gym', p, `${fmtDateRange(p.startDate, p.endDate)}${planWochen(p) ? ` · ${planWochen(p)} Wochen` : ''}`)}
    ${progress}
    <div class="ppv-strip">${strip}</div>
  </div>`;
}

let plansArchiveExpanded = false; // Toggle für die kollabierbare "Archivierte Pläne"-Sektion
function togglePlansArchive() {
  plansArchiveExpanded = !plansArchiveExpanded;
  _archivKlappen('plans-list', plansArchiveExpanded, renderPlans);
}

function renderPlans() {
  autoArchivBeendetePlaene();
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
  // Die GANZE Karte ist EIN Ziel (06.09.2026, Leonard-Wunsch): Auch ein Tipp auf einen
  // Wochentag oeffnet die Detailansicht, statt in den Trainings-Tab zu wischen. Man ist hier
  // zum Bearbeiten des Plans, nicht zum Trainieren — und ein Wisch in einen fremden Tab war
  // aus einer Liste heraus, in der jede andere Stelle die Bearbeitung oeffnet, ueberraschend.
  // Kein `dayOnTap` zu setzen genuegt dafuer.
  // KEIN Heute-Feld auf dieser Seite (Leonard-Wunsch 12.09.2026): Hier verwaltet man Plaene,
  // das aktuelle Datum spielt dabei keine Rolle — dieselbe Ueberlegung wie bei `.wpe-row.today`
  // in der Plan-Detailansicht (01.09.2026). In Uebersicht und Trainings-Tab bleibt es stehen.
  // Die Karten zeigen hier den PLAN, nicht den Verlauf der laufenden Woche (`nurPlan`,
  // Leonard-Wunsch 13.09.2026): geplante Tage gefuellt, keine Unterscheidung geplant /
  // absolviert, keine Kennzahl „x/y diese Woche".
  const renderRow = (p) => planStatus(p) === 'active'
    ? buildPlanCard(p, null, /*hideToday*/ true, /*hideStatus*/ true, /*hideMeta*/ true, { nurPlan: true })
    : buildPlanCard(p, null, /*hideToday*/ true, false, false, { nurPlan: true });

  let html = '';
  if (!active.length && !archived.length) {
    html = `<div class="plan-day-empty" style="margin:24px 14px">Noch keine Trainingspläne — tippe auf das + oben rechts, um deinen ersten Plan anzulegen.</div>`;
  } else {
    html += active.map(renderRow).join('');
    if (archived.length) {
      const expanded = plansArchiveExpanded;
      // Gleicher Knopf wie im Archiv der Gymtage (Leonard-Wunsch 05.09.2026) — weisse Karte,
      // Beschriftung links, Anzahl und Pfeil rechts. Der fruehere `.weitere-btn.archiv-btn` ist
      // damit ueberall abgeloest.
      html += `<button type="button" class="plans-list-archive-header${expanded ? ' expanded' : ''}"
                       aria-expanded="${expanded}" onclick="togglePlansArchive()">
        <span class="plan-day-collapse-label">Archivierte Gympläne</span>
        <span class="plan-day-collapse-count">${archived.length}</span>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
      </button>`;
      if (expanded) html += `<div class="archiv-inhalt">${archived.map(renderRow).join('')}</div>`;
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
  // Start | Ende | Wochen in EINER Zeile, gebaut wie im Laufplan-Detail (04.09.2026,
  // Leonard-Wunsch). Die Wochenzahl ist ABGELEITET und deshalb kein Eingabefeld mehr; das
  // fruehere `#prog-weeks` und `onWeeksChange` sind entfallen. Die unsichtbaren Datumsfelder
  // behalten ihre IDs, damit `onStartDateChange`/`onEndDateChange` unveraendert weiterlesen.
  const wochenZahl = _weeksBetween(plan.startDate, plan.endDate);
  document.getElementById('prog-datenzeile').innerHTML = `
    <div><label>Start</label>${lpDatumFeld(plan.startDate, 'onStartDateChange()', 'prog-start')}</div>
    <div><label>Ende</label>${lpDatumFeld(plan.endDate, 'onEndDateChange()', 'prog-end')}</div>
    <div class="lp-wochen"><label>Wochen</label>
      <div class="lp-wochen-v">${wochenZahl || '–'}</div></div>`;

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
    const options = `<option value="" ${!d.planDayId ? 'selected' : ''}>Kein Gym</option>` +
      trainingDays.map(td => `<option value="${td.id}" ${d.planDayId === td.id ? 'selected' : ''}>${escapeHtml(td.name)}</option>`).join('');
    const cls = 'wpe-row' + (i === todayIdx ? ' today' : '') + (assigned ? ' training' : '');
    return `<div class="${cls}">
      <span class="wpe-day">${d.label}</span>
      ${assigned ? `<span class="pd-name wpe-name">${escapeHtml(assigned.name)}</span>` : `<span class="wpe-rest">Kein Gym</span>`}
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
        <div class="pdr-info" onclick="openLibDayDetail('${d.id}','plan-detail')" style="cursor:pointer">
          <div class="pdr-name">${pd(d.name)}</div>
          <div class="pdr-sub">${d.exercises.length} Übungen • ${setCount} Sätze</div>
        </div>
        ${dayChips(d)}
        <div class="plan-day-actions">
          <button onclick="event.stopPropagation();openLibDayDetail('${d.id}','plan-detail')" title="Bearbeiten">✎</button>
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
let plansViewMode = 'plans';   // Schluessel aus PLANS_SEITEN — aktive Seite im Plan-Tab
let editingLibDayId = null;     // aktuell im Tag-Detail bearbeiteter Bibliotheks-Tag
let libDaysArchiveExpanded = false;

function setPlansView(mode) {
  if (!PLANS_SEITEN[mode]) return;
  if (mode !== plansViewMode) { _seitenWechsel('screen-plans', 'plans', () => _setPlansView(mode)); return; }
  _setPlansView(mode);
}
function _setPlansView(mode) {
  plansViewMode = mode;
  renderPlansScreen();
  seitenleisteAktualisieren();
}
function onPlansAdd() {
  if (plansViewMode === 'races') openRaceDialog();
  else if (plansViewMode === 'days') createNewLibDay();
  else if (plansViewMode === 'runplans') neuerLaufplan();
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
// Die vier Seiten des Plan-Tabs: Knopf-Id, Beschriftung und die Liste, die dazugehoert.
// Sportsymbole standen hier kurzzeitig (erst am Tab-Titel, dann im Seitenschalter) und sind
// am 06.09.2026 auf Leonards Wunsch wieder entfallen — der Schalter traegt nur Text.
// Das Feld `btn` (Id des Knopfes im `.seg-toggle`) ist am 08.09.2026 entfallen — den
// Schalter im Kopf gibt es nicht mehr, die Seiten stehen in der Seitenleiste unten
// (`SEITEN_LEISTE`). `titel` wird von dort gelesen und bleibt damit die EINE Stelle,
// an der die Beschriftung steht.
const PLANS_SEITEN = {
  plans:    { titel: 'Gymplan',    liste: 'plans-list'    },
  days:     { titel: 'Gymtage',    liste: 'libdays-list'  },
  runplans: { titel: 'Laufplan',   liste: 'runplans-list' },
  races:    { titel: 'Wettkämpfe', liste: 'races-list'    },
};

function renderPlansScreen() {
  const zeige = (el, an) => { if (el) el.style.display = an ? '' : 'none'; };
  Object.keys(PLANS_SEITEN).forEach(k => {
    zeige(document.getElementById(PLANS_SEITEN[k].liste), plansViewMode === k);
  });
  syncWkAnsichtBtn();
  const seite = PLANS_SEITEN[plansViewMode] || PLANS_SEITEN.plans;
  const h1 = document.getElementById('plans-h1');
  if (h1) h1.textContent = seite.titel;
  // Der Kalender gehoert zu den beiden PLAN-Seiten: Gymplan zeigt ihn mit den
  // Trainingseinheiten, Laufplan mit den Laufeinheiten. Gymtage und Wettkaempfe haben keinen —
  // dort ist die Liste selbst der Inhalt.
  const calCard = document.getElementById('plans-cal-card');
  const mitKalender = plansViewMode === 'plans' || plansViewMode === 'runplans';
  zeige(calCard, mitKalender);
  if (mitKalender && calCard) renderTrainingCalendar('pcal', 'plans-cal-card');
  if (plansViewMode === 'days') renderLibDays();
  else if (plansViewMode === 'runplans') renderLaufVerwaltung();
  else if (plansViewMode === 'races') renderWettkaempfe();
  else renderPlans();
}

// ── Seite „Wettkaempfe" ────────────────────────────────────────────
// Je Wettkampf eine Karte. Die WERTE stammen aus dem Lauf, der an dem Tag in der Tabelle
// steht (`ft_races` haelt nur Datum und Name) — deshalb kann eine Karte auch ohne Werte
// dastehen, etwa wenn die Laufdaten noch nicht abgerufen wurden.
// Die Seite „Wettkämpfe" hat ZWEI Ansichten (09.09.2026, Leonard-Wunsch): die gewohnte
// Liste und einen senkrechten Zeitstrahl. Umgeschaltet wird ueber den Knopf links neben dem
// „+" oben rechts; er steht NUR auf dieser Seite (`renderPlansScreen`).
// BEWUSST nicht gespeichert — wie jeder Ansichtszustand der App (Kalenderfilter,
// Wochenfilter, Katalogfilter). Nach einem Neustart steht wieder die Liste da.
let _wkAnsicht = 'strahl';       // 'liste' | 'strahl' — Standard ist der Zeitstrahl
                                 // (Leonard-Wunsch 12.09.2026, vorher die Liste).
let _wkOffen   = null;           // Datum des hervorgehobenen Wettkampfs im Zeitstrahl

const WK_ICON_STRAHL = `<svg viewBox="0 0 24 24"><line x1="7" y1="3" x2="7" y2="21"/><circle cx="7" cy="7" r="2.4"/><circle cx="7" cy="17" r="2.4"/><line x1="12" y1="7" x2="20" y2="7"/><line x1="12" y1="17" x2="20" y2="17"/></svg>`;
const WK_ICON_LISTE  = `<svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;

function toggleWettkampfAnsicht() {
  _wkAnsicht = (_wkAnsicht === 'liste') ? 'strahl' : 'liste';
  _wkOffen = null;               // beim Wechsel nichts hervorgehoben stehen lassen
  // Das Symbol wechselt sofort, die Liste bzw. der Zeitstrahl kommt mit der Staffel herein
  // (18.09.2026, siehe `_ansichtWechsel`).
  syncWkAnsichtBtn();
  _ansichtWechsel(document.getElementById('races-list'), renderWettkaempfe);
}

// Knopf oben rechts: nur auf der Seite „Wettkämpfe" sichtbar, und sein Symbol zeigt, WOHIN
// er fuehrt (Zeitstrahl-Symbol in der Liste, Listen-Symbol im Zeitstrahl).
function syncWkAnsichtBtn() {
  const b = document.getElementById('races-view-btn');
  if (!b) return;
  const an = plansViewMode === 'races';
  b.style.display = an ? '' : 'none';
  if (!an) return;
  const zurListe = _wkAnsicht === 'strahl';
  b.innerHTML = zurListe ? WK_ICON_LISTE : WK_ICON_STRAHL;
  b.title = zurListe ? 'Als Liste zeigen' : 'Als Zeitstrahl zeigen';
}

function renderWettkaempfe() {
  const el = document.getElementById('races-list');
  if (!el) return;
  const rennen = DB.getRaces();          // aufsteigend, sortiert der Getter
  if (!rennen.length) {
    el.innerHTML = `<div class="plan-day-empty" style="margin:24px 14px">Noch keine Wettkämpfe hinterlegt — tippe auf das + oben rechts.</div>`;
    return;
  }
  const laeufe = runNachTag();
  el.innerHTML = _wkAnsicht === 'strahl'
    ? wettkampfStrahl(rennen, laeufe)
    : rennen.map(r => wettkampfKarte(r, laeufe[r.date])).join('');
}

// Senkrechter Zeitstrahl, aelteste zuerst — dieselbe Reihenfolge wie die Liste.
// Die Bauform ist die der Einheiten-Detailansicht (`.hd-rail`/`.hd-step`): eine senkrechte
// Linie mit Marken daneben. BEWUSST kein Neubau — die App soll nur EINEN Zeitstrahl kennen.
//
// Die Karte jedes Wettkampfs steht IMMER im Markup und wird nur per Klasse ein- und
// ausgeblendet. Das Oeffnen ist damit ein Klassenwechsel statt eines Neuaufbaus: Beim
// Zuklappen durchs Scrollen (siehe `initWettkampfStrahl`) wuerde ein Neuaufbau mitten in
// der Bewegung ruckeln.
function wettkampfStrahl(rennen, laeufe) {
  let jahr = null;
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const teile = rennen.map(r => {
    const [y, m, d] = r.date.split('-').map(Number);
    const stueck = [];
    if (y !== jahr) { jahr = y; stueck.push(`<div class="wk-jahr">${y}</div>`); }
    const lauf = laeufe[r.date];
    // Drei Zustaende an der Marke, dieselbe Aussage wie in den Karten: gelaufen (gefuellt),
    // steht noch an (nur umrandet), vorbei ohne Werte (blass).
    const kuenftig = new Date(y, m - 1, d).getTime() > heute.getTime();
    // ACHTUNG: NICHT `offen` nennen — diese Klasse gehoert dem hervorgehobenen Eintrag.
    // Beim ersten Anlauf hiess der Zustand so und alle fuenf Karten standen sofort offen.
    const mk = lauf ? ' hat-lauf' : (kuenftig ? ' kuenftig' : ' fehlt');
    const offen = _wkOffen === r.date;
    return stueck.join('') + `
      <div class="wk-punkt${offen ? ' offen' : ''}${mk}" data-date="${r.date}">
        <button type="button" class="wk-punkt-kopf" onclick="wkStrahlWaehlen('${r.date}')"
                aria-expanded="${offen ? 'true' : 'false'}">
          <span class="wk-punkt-marke" aria-hidden="true"></span>
          <span class="wk-punkt-name">${escapeHtml(r.name || 'Wettkampf')}</span>
        </button>
        <div class="wk-punkt-karte">${wettkampfKarte(r, lauf)}</div>
      </div>`;
  });
  return `<div class="wk-strahl">${teile.join('')}</div>`;
}

// Genau EINER kann hervorgehoben sein. Ein zweiter Tipp auf denselben schliesst ihn wieder —
// dieselbe Regel wie bei der Fusszeile des Kalenders.
function wkStrahlWaehlen(datum) {
  _wkOffen = (_wkOffen === datum) ? null : datum;
  document.querySelectorAll('#races-list .wk-punkt').forEach(p => {
    const an = p.dataset.date === _wkOffen;
    if (an !== p.classList.contains('offen')) _wkKarteKlappen(p, an);
  });
}

// Oeffnet bzw. schliesst die Karte eines Wettkampfs mit der Ausklapp-Bewegung (13.09.2026,
// Leonard-Wunsch) — auch das Schliessen beim Wechsel auf einen anderen Wettkampf und beim
// Scrollen. Gefahren wird die KARTE (`.wk-punkt-karte`), nicht der ganze Eintrag: Dessen Marke
// sitzt links AUSSERHALB auf der Linie und waere mit `overflow: hidden` abgeschnitten.
// Beim Schliessen haelt `.zuklappend` die Karte bis zum Ende sichtbar; Marke und `aria-expanded`
// wechseln sofort. Derselbe Token-Schutz wie bei `_calFussSetzen`.
function _wkKarteKlappen(p, an) {
  const karte = p.querySelector('.wk-punkt-karte');
  const kopf = p.querySelector('.wk-punkt-kopf');
  if (kopf) kopf.setAttribute('aria-expanded', an ? 'true' : 'false');
  const token = (p._wkToken || 0) + 1;
  p._wkToken = token;
  const von = karte ? karte.getBoundingClientRect().height : 0;
  if (karte) { karte.getAnimations().forEach(a => a.cancel()); karte.style.overflow = ''; }
  p.classList.remove('zuklappend');
  p.classList.toggle('offen', an);
  if (!karte || _bewegungReduziert() || !karte.animate) return;
  if (!an) p.classList.add('zuklappend');
  const bis = an ? karte.getBoundingClientRect().height : 0;
  if (Math.abs(bis - von) < 1) { p.classList.remove('zuklappend'); return; }
  karte.style.overflow = 'hidden';
  _boxFahren(karte, von, bis, () => {
    if (p._wkToken !== token) return;
    karte.style.overflow = '';
    p.classList.remove('zuklappend');
  });
}

// Scrollen klappt den hervorgehobenen Wettkampf wieder zu (Leonard-Wunsch 09.09.2026).
// Nur ein Klassenwechsel, KEIN Neuaufbau — sonst ruckelte die Liste mitten in der Bewegung.
function initWettkampfStrahl() {
  const scr = document.getElementById('screen-plans');
  if (!scr) return;
  scr.addEventListener('scroll', () => {
    if (!_wkOffen) return;
    _wkOffen = null;
    document.querySelectorAll('#races-list .wk-punkt.offen').forEach(p => _wkKarteKlappen(p, false));
  }, { passive: true });
}

function wettkampfKarte(r, lauf) {
  const [y, m, d] = r.date.split('-').map(Number);
  const datum = new Date(y, m - 1, d).toLocaleDateString('de-DE',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  // Aus einem Termin wird eine Ergebniskarte, SOBALD an dem Tag ein Lauf in der Tabelle steht
  // — ohne Zutun (Leonard-Entscheidung 06.09.2026, „Variante D"). Zwei Zwischenzustaende
  // fangen die Faelle ab, in denen noch nichts da ist:
  //   kuenftig            → „Steht noch an", kein Knopf. Es gibt nichts zu holen.
  //   vorbei, < 8 Tage    → „Noch keine Laufdaten" samt Abruf-Knopf. Normalfall direkt nach
  //                          dem Rennen: Health Auto Export hat vielleicht schon geschrieben,
  //                          FitTrack liest aber nur auf Anforderung.
  //   vorbei, >= 8 Tage   → NOTAUSGANG „Werte fehlen", auffaellig. So lange sollte es nicht
  //                          dauern; hier stimmt etwas nicht (Lauf nie aufgezeichnet, andere
  //                          Kategorie in der Tabelle, Termin verschoben).
  // Die Grenze ist bewusst grosszuegig — eine Woche Urlaub ohne App soll keine Warnung ausloesen.
  const WK_KULANZ_TAGE = 7;
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const tag = new Date(y, m - 1, d);
  const kuenftig = tag > heute;
  const tageHer = Math.round((heute - tag) / 86400000);
  const ueberfaellig = !kuenftig && tageHer > WK_KULANZ_TAGE;

  // Dieselben Kacheln wie in der Laufdetailansicht (`.hd-stats`), damit ein Wettkampf nicht
  // anders aussieht als jeder andere Lauf. Fehlende Werte bleiben WEG statt als „–"
  // dazustehen; das Raster fuellt die Luecke von selbst auf.
  const kacheln = lauf ? [
    lauf.km      != null ? { wert: fmtKm(lauf.km),                label: 'Strecke' } : null,
    lauf.minutes != null ? { wert: fmtMin(lauf.minutes),          label: 'Zeit' } : null,
    lauf.kmh             ? { wert: fmtPace(lauf.kmh),             label: 'Pace' } : null,
    lauf.avgHR   != null ? { wert: `${Math.round(lauf.avgHR)}`,   label: 'Ø Puls' } : null,
    lauf.maxHR   != null ? { wert: `${Math.round(lauf.maxHR)}`,   label: 'Max Puls' } : null,
    lauf.elevM   != null ? { wert: `${Math.round(lauf.elevM)} m`, label: 'Höhenmeter' } : null,
  ].filter(Boolean) : [];

  // Der Abruf-Knopf ruft dieselbe Funktion wie „Aktualisieren" in den Einstellungen. Er MUSS
  // `stopPropagation` rufen, sonst oeffnet der Tipp zugleich den Bearbeiten-Dialog der Karte.
  const holKnopf = `<button class="btn btn-sm wk-hol-btn" onclick="event.stopPropagation();runLaeufeLaden({interactive:true})">`
    + `Laufdaten holen</button>`;

  const koerper = kacheln.length
    ? `<div class="hd-stats wk-stats">`
      + kacheln.map(k => `<div class="hd-stat"><b>${k.wert}</b><span>${k.label}</span></div>`).join('')
      + `</div>`
    : kuenftig
      ? `<div class="wk-leer wk-anstehend">Steht noch an</div>`
      : ueberfaellig
        ? `<div class="wk-fehlt">
             <div class="wk-fehlt-txt"><strong>Werte fehlen</strong>
               Zu diesem Tag steht kein Lauf in der Tabelle — seit ${tageHer} Tagen.</div>
             ${holKnopf}
           </div>`
        : `<div class="wk-wartet"><span class="wk-leer">Noch keine Laufdaten.</span>${holKnopf}</div>`;

  // Ein Tipp oeffnet denselben Dialog wie das „+", nur mit gefuellten Feldern — sonst gaebe es
  // keinen Weg, einen Vertipper zu berichtigen oder einen Termin wieder zu entfernen.
  const zustand = kuenftig ? ' wk-kuenftig' : (!kacheln.length && ueberfaellig ? ' wk-offen' : '');
  return `<div class="chart-card-v2 wk-card${zustand}" data-date="${r.date}"
       onclick="openRaceDialog('${r.date}')">
    <div class="wk-kopf">
      <div class="chart-card-v2-title wk-name">${escapeHtml(r.name || 'Wettkampf')}</div>
      <div class="wk-datum">${datum}</div>
    </div>
    ${koerper}
  </div>`;
}

// ── Wettkampf eintragen / bearbeiten ───────────────────────────────
// `_raceEditDate` merkt, WELCHER Eintrag bearbeitet wird (null = neuer). Das Datum ist der
// Schluessel: Pro Tag gibt es hoechstens einen Wettkampf.
let _raceEditDate = null;
function openRaceDialog(date) {
  _raceEditDate = date || null;
  const vorhanden = date ? DB.getRaces().find(r => r.date === date) : null;
  document.getElementById('race-dialog-title').textContent =
    vorhanden ? 'Wettkampf bearbeiten' : 'Wettkampf eintragen';
  document.getElementById('race-name').value = vorhanden ? (vorhanden.name || '') : '';
  document.getElementById('race-datum').value = vorhanden ? vorhanden.date : '';
  // „Löschen" gibt es nur beim Bearbeiten. `visibility` statt `display`, damit die Knopfzeile
  // in beiden Faellen gleich breit bleibt und „Speichern" nicht springt.
  document.getElementById('race-del-btn').style.visibility = vorhanden ? '' : 'hidden';
  openModal('modal-race');
}

function saveRaceFromDialog() {
  const name = document.getElementById('race-name').value.trim();
  const datum = document.getElementById('race-datum').value;   // 'YYYY-MM-DD', schon lokal
  if (!datum) { showToast('Bitte ein Datum wählen'); return; }
  const liste = DB.getRaces().filter(r => r.date !== _raceEditDate && r.date !== datum);
  liste.push({ date: datum, name: name || 'Wettkampf' });
  DB.saveRaces(liste);
  const neu = !_raceEditDate || _raceEditDate !== datum;
  _raceEditDate = null;
  closeModal('modal-race');
  _wettkampfNeuZeichnen();
  // Ein neuer Termin kommt wie eine Karte von unten herein — sonst steht er einfach da.
  if (neu) _zeileEinblenden(document.querySelector(`#races-list [data-date="${datum}"]`));
}

function deleteRaceFromDialog() {
  const datum = _raceEditDate;
  if (!datum) return;
  const r = DB.getRaces().find(x => x.date === datum);
  confirmAction('Wettkampf löschen?', `„${(r && r.name) || 'Wettkampf'}" wird aus dem Kalender entfernt.`, () => {
    _raceEditDate = null;
    closeModal('modal-race');
    // Eintrag wegklappen, dann loeschen (16.09.2026). `data-date` trifft im Zeitstrahl den
    // Punkt und in der Liste die Karte — beide tragen dieselbe Kennung.
    const zeile = document.querySelector(`#races-list [data-date="${datum}"]`);
    _zeileWegKlappen(zeile).then(() => {
      withUndo('Wettkampf gelöscht', () => {
        DB.saveRaces(DB.getRaces().filter(x => x.date !== datum));
      }, _wettkampfNeuZeichnen);
      _wettkampfNeuZeichnen();
    });
  }, { danger: true, confirmLabel: 'Löschen' });
}

// Nach jeder Aenderung: die Liste UND jeden Kalender, der den Tag zeigen koennte.
function _wettkampfNeuZeichnen() {
  renderWettkaempfe();
  if (document.getElementById('cal-grid')) renderTrainingCalendar('cal', 'ov-cal-card');
  if (document.getElementById('pcal-grid') && (plansViewMode === 'plans' || plansViewMode === 'runplans'))
    renderTrainingCalendar('pcal', 'plans-cal-card');
}

function toggleLibDaysArchive() {
  libDaysArchiveExpanded = !libDaysArchiveExpanded;
  _archivKlappen('libdays-list', libDaysArchiveExpanded, renderLibDays);
}

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
  // KOMPAKTE Kachel, drei pro Zeile (Leonard-Wunsch 07.09.2026). Auf 375px bleiben je Kachel
  // rund 109px, davon 81px Text — dafuer ist der bisherige Aufbau (Name, Meta, Chip und Pfeil
  // nebeneinander) zu breit. Deshalb:
  //   · Uebungen und Saetze stehen UNTEREINANDER statt durch „•" getrennt. Nebeneinander
  //     braechen sie ohnehin um, aber an einer beliebigen Stelle.
  //   · Der Pfeil „›" faellt weg — er kostet Breite und sagt nichts, was die Kachel nicht
  //     schon durch ihre Antippbarkeit zeigt.
  //   · „Im aktuellen Plan" wird zum PUNKT unten rechts (`.pld-dot`): Der Text misst rund
  //     95px und passt nicht. Die Langfassung steht im `title`.
  //   · Nach jedem SCHRAEGSTRICH im Namen steht ein `<wbr>`: Ohne diese Trennstelle gilt
  //     „Shoulder/Legs" als EIN Wort und der Browser bricht es mitten im Wort um
  //     („Shoulder/Leg | s"). Mit `<wbr>` trennt er sauber nach dem Strich. Betrifft nur die
  //     Anzeige — gespeichert bleibt der Name unveraendert.
  const renderRow = (d) => {
    const anzUeb = (d.exercises||[]).length;
    const setCount = (d.exercises||[]).reduce((a,e) => a + (e.targetSets||0), 0);
    const imPlan = activeDayIds.has(d.id);
    return `<div class="plan-list-row pld-kachel" onclick="openLibDayDetail('${d.id}')">
      ${imPlan ? '<span class="pld-dot" title="Im aktuellen Plan"></span>' : ''}
      <div class="plan-list-name">${pd(escapeHtml(d.name).replace(/\//g, '/<wbr>'))}</div>
      <div class="plan-list-meta">${anzUeb} ${anzUeb === 1 ? 'Übung' : 'Übungen'}<br>${setCount} Sätze</div>
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
      html += `<button type="button" class="plans-list-archive-header${expanded ? ' expanded' : ''}"
                       aria-expanded="${expanded}" onclick="toggleLibDaysArchive()">
        <span class="plan-day-collapse-label">Archivierte Gymtage</span>
        <span class="plan-day-collapse-count">${archived.length}</span>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
      </button>`;
      if (expanded) html += `<div class="archiv-inhalt">${archived.map(renderRow).join('')}</div>`;
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

// GYMTAGE WERDEN AUSSCHLIESSLICH HIER BEARBEITET (13.09.2026, Leonard-Entscheidung) — siehe
// den eigenen Abschnitt in CLAUDE.md. Zwei Wege fuehren auf diese Seite: die Kachel auf der
// Seite „Gymtage" und die Zeile im Trainingstage-Abschnitt einer Plan-Detailansicht.
// Der zweite Weg braucht einen RUECKWEG: `_applyTabState` raeumt `editingPlanId` ab, sobald
// man das Plan-Detail verlaesst — ohne diesen Merker landete der Zurueck-Pfeil in der
// Plan-LISTE statt im Plan, und der Plan waere nicht mehr der bearbeitete.
let _libDayZurueck = null;   // { screen: 'plan-detail', planId } oder null
function openLibDayDetail(id, zurueck) {
  editingLibDayId = id;
  _libDayZurueck = (zurueck === 'plan-detail' && editingPlanId)
    ? { screen: 'plan-detail', planId: editingPlanId } : null;
  resetDelEdit();
  showScreen('day-detail');
}
function closeLibDayDetail() {
  editingLibDayId = null;
  const z = _libDayZurueck; _libDayZurueck = null;
  // `editingPlanId` MUSS vor `showScreen` stehen: `_applyTabState` ruft `renderPlanDetail`,
  // und das liest den Edit-Kontext.
  if (z && z.planId) { editingPlanId = z.planId; showScreen('plan-detail'); return; }
  showScreen('plans');
}
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
// Kontexte: 'libday-ex' (Trainingstag-Detail-Übungen), 'plan-days' (Plan-Detail-Tage).
// IDs: Übungen=Array-Index, Tage=day.id. ('planday-ex' ist am 13.09.2026 mit dem
// Bearbeiten-Dialog des Plan-Details entfallen — Übungen ändert man nur noch im
// Trainingstag-Detail.)
// ═══════════════════════════════════════════════
let _delCtx = null;
let _delSel = new Set();
function delEditActive(ctx) { return _delCtx === ctx; }
function _rerenderDelCtx(ctx) {
  if (ctx === 'libday-ex') renderLibDayDetail();
  else if (ctx === 'plan-days') renderPlanDetail();
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
  }
  _delCtx = null; _delSel = new Set();
  _rerenderDelCtx(ctx);
}

// Start und Ende sind seit dem 04.09.2026 UNABHAENGIG voneinander — die Gesamtdauer wird aus
// beiden abgeleitet (Leonard-Wunsch, wie im Laufplan). Vorher schob ein neues Startdatum das
// Enddatum mit, und die Wochenzahl war ein eigenes Eingabefeld.
// `weeksTotal` bleibt GESPEICHERT, obwohl es rechnerisch redundant ist: Ein Dutzend Stellen
// lesen es (`_planProgramWeek`, Vorlagen, Sicherung). Es wird hier bei jeder Datumsaenderung
// nachgezogen, damit „Woche 5 / 12" nie den Datumsangaben widerspricht.
function _planDauerNachziehen(p) {
  if (p.startDate && p.endDate) p.weeksTotal = _weeksBetween(p.startDate, p.endDate);
}

function onStartDateChange() {
  const p = DB.getProgram();
  const start = _dateToMs(document.getElementById('prog-start').value);
  if (!start) return;
  if (p.endDate && start >= p.endDate) { showToast('Startdatum muss vor dem Enddatum liegen'); _renderAfterPlanEdit(); return; }
  p.startDate = start;
  if (!p.endDate) p.endDate = start + (p.weeksTotal || 12) * 7*24*3600*1000;
  _planDauerNachziehen(p);
  DB.saveProgram(p);
  showToast('Trainingsplan aktualisiert');
  _renderAfterPlanEdit();
}

function onEndDateChange() {
  const p = DB.getProgram();
  const end = _dateToMs(document.getElementById('prog-end').value);
  if (!end) return;
  if (!p.startDate) p.startDate = Date.now();
  if (end <= p.startDate) { showToast('Enddatum muss nach Startdatum sein'); _renderAfterPlanEdit(); return; }
  p.endDate = end;
  _planDauerNachziehen(p);
  DB.saveProgram(p);
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
    // Direkt auf die Detailseite des neuen Tags — dort und nur dort traegt man die Uebungen
    // ein (13.09.2026). Ein leerer Tag ohne Weiterleitung waere eine Sackgasse.
    openLibDayDetail(id, 'plan-detail');
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
  const auf = collapsedExGroups.has(key);
  if (auf) collapsedExGroups.delete(key);
  else collapsedExGroups.add(key);
  // Mit Bewegung (13.09.2026). NICHT waehrend einer Suche: Dort sind alle Treffergruppen
  // zwangsweise offen, der Neuaufbau zoege eine gerade zugeklappte Gruppe sofort wieder auf.
  if (exCatalogSearch) { renderExercises(); return; }
  _gruppeKlappAnimieren(_exGruppe(key), auf, renderExercises);
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
  // Nur die Gruppen bewegen, deren Zustand sich wirklich aendert — und am Ende EINMAL neu
  // zeichnen, wenn alle fertig sind (13.09.2026). Gruppen ohne Uebungen stehen gar nicht im
  // Markup; `_gruppeKlappAnimieren` ruft fuer sie sofort zurueck, der Zaehler geht trotzdem auf.
  const betroffen = keys.filter(k => allCollapsed ? collapsedExGroups.has(k) : !collapsedExGroups.has(k));
  if (allCollapsed) keys.forEach(k => collapsedExGroups.delete(k));
  else keys.forEach(k => collapsedExGroups.add(k));
  if (exCatalogSearch || !betroffen.length) { renderExercises(); return; }
  let offen = betroffen.length;
  const einmal = () => { if (--offen === 0) renderExercises(); };
  betroffen.forEach(k => _gruppeKlappAnimieren(_exGruppe(k), allCollapsed, einmal));
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
    ? `<button class="ex-chart-collapse" onclick="toggleChartBlock(this)">Entwicklung<span class="aex-v2-chev">${AEX_CHEV_SVG}</span></button>`
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
      <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
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
  const neu = (mode === 'stats') ? 'stats' : 'list';
  if (neu !== exercisesViewMode) { _seitenWechsel('screen-exercises', 'exercises', () => _setExercisesView(neu)); return; }
  _setExercisesView(neu);
}
function _setExercisesView(mode) {
  exercisesViewMode = mode;
  renderExercisesScreen();
  seitenleisteAktualisieren();
}
function renderExercisesScreen() {
  const stats = exercisesViewMode === 'stats';
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
  _renderHdCharts();
  _renderAexCharts();
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
  // Weiss NUR auf dem Schleier, nicht ueberall im Glas-Modus: Der Glas-Modus gilt bewusst
  // nur innerhalb der Tabs (`.screen:not(#screen-mehr)`, siehe CSS). Modalfenster und die
  // Einstellungen behalten ihren weissen Grund — eine weisse Linie war dort unsichtbar
  // (Detailansicht einer Einheit, gemeldet 01.09.2026). Massgeblich ist also, WO das
  // Diagramm haengt. Die Farben werden hier ausdruecklich gesetzt, weil Chart.defaults
  // global auf den Glas-Modus eingestellt ist.
  const aufGlas = glasAktiv() && !!canvas.closest('.screen:not(#screen-mehr)');
  const accent = aufGlas ? '#ffffff'
    : (getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#1E40AF');
  const schrift = aufGlas ? 'rgba(255,255,255,0.8)' : '#64748B';
  const raster  = aufGlas ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)';
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
      // Achsenschrift = Stufe „Etikett" der Schriftskala (`--fs-etikett`, 11px; bis 21.09.2026 10px).
      // Chart.js zeichnet auf ein Canvas und liest keine CSS-Variablen — der Wert steht deshalb fest.
      scales: {
        x: { grid: { display: false }, ticks: { color: schrift, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12 } },
        y: { grid: { color: raster }, ticks: { color: schrift, font: { size: 11 }, precision: 0, callback: (v) => v + ' ' + unit } },
      },
    },
  });
}

// Katalog-Filter „nur aus dem aktiven Plan". Bewusst NICHT gespeichert: ein Filter, der
// einen Neustart überlebt, lässt den Katalog später unerklärlich leer wirken.
let exPlanFilterAn = false;

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
  // Der Knopf zeigt den neuen Zustand SOFORT, die Liste folgt mit der Staffel (18.09.2026).
  const filterBtn = document.getElementById('ex-plan-filter-btn');
  if (filterBtn) filterBtn.classList.toggle('active', exPlanFilterAn);
  _ansichtWechsel(document.getElementById('exercises-groups'), renderExercises);
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
    return `<div class="ex-group${isCollapsed ? ' collapsed' : ''}" data-gruppe="muscle:${m}" style="--mc:${meta.color}">
      <button type="button" class="weitere-btn ex-group-btn" aria-expanded="${!isCollapsed}"
              onclick="toggleExGroup('muscle:${m}')">
        <span class="dot"></span>
        <span class="ex-group-name">${meta.name}</span>
        <span class="aex-v2-chev">${AEX_CHEV_SVG}</span>
      </button>
      <div class="ex-list">${itemsHTML}</div>
    </div>`;
  }).filter(Boolean).join('');

  const leerText = exCatalogSearch ? 'Keine Treffer.'
    : exPlanFilterAn ? 'Keine Übung aus dem aktiven Plan gefunden.'
    : 'Keine Übungen vorhanden. Füge eine neue Übung hinzu.';
  document.getElementById('exercises-groups').innerHTML = groupsHTML
    || `<p style="text-align:center;color:#fff;opacity:0.85;padding:32px 16px">${leerText}</p>`;
}

// Mit derselben Bewegung wie Uebungskarten und Muskelgruppen (13.09.2026, Leonard-Wunsch).
// Im Katalog ist immer nur EINE Uebung offen: Wer eine andere antippt, schliesst die alte und
// oeffnet die neue — beide bewegen sich GLEICHZEITIG, danach wird EINMAL neu gezeichnet.
function toggleExItem(id) {
  const alt = openExerciseId;
  openExerciseId = (openExerciseId === id) ? null : id;
  const zu  = alt ? document.getElementById('ex-item-' + alt) : null;
  const auf = openExerciseId ? document.getElementById('ex-item-' + openExerciseId) : null;
  if (_bewegungReduziert() || (!zu && !auf)) { renderExercises(); return; }
  let offen = (zu ? 1 : 0) + (auf ? 1 : 0);
  const einmal = () => { if (--offen === 0) renderExercises(); };
  if (zu) _exItemKlappen(zu, alt, false, einmal);
  if (auf) _exItemKlappen(auf, openExerciseId, true, einmal);
}
// Gefahren wird die Hoehe der ZEILE (Web Animations API, `_klappBewegung`), wie bei den
// Uebungskarten: Das Umschalten baut die Liste neu, eine CSS-Transition liefe nie.
// ZWEI Besonderheiten des Katalogs:
// 1. Eine ZUGEKLAPPTE Zeile enthaelt KEIN Diagramm (es wird nur fuer die offene gebaut). Beim
//    Aufklappen fehlten seine 162px in der Zielhoehe, und die Zeile spraenge am Ende um genau
//    diesen Betrag. Deshalb wird der Diagrammblock VOR dem Messen eingesetzt — noch leer; er
//    wird erst mit dem Neuaufbau gezeichnet (vorher gezeichnet, begaenne seine Einblendung beim
//    Neuaufbau ein zweites Mal).
// 2. Beim ZUklappen bleibt `.open` bis zum Ende stehen (sonst waere der Inhalt sofort weg und es
//    schrumpfte eine leere Flaeche). Den Pfeil dreht `.zuklappend` trotzdem sofort zurueck.
function _exItemKlappen(el, key, auf, fertig) {
  if (!el.animate) { fertig(); return; }
  const von = el.getBoundingClientRect().height;
  if (auf) {
    const body = el.querySelector('.ex-item-body');
    if (body && !body.querySelector('.ex-chart-block')) {
      const exId = key.includes('__') ? key.split('__')[1] : key;
      const stats = body.querySelector('.ex-item-stats');
      if (stats) stats.insertAdjacentHTML('afterend', exChartHTML(exId, 'ex-chart-' + key));
    }
    el.classList.add('open');
  } else {
    el.classList.remove('open');
  }
  const bis = el.getBoundingClientRect().height;
  if (!auf) el.classList.add('open', 'zuklappend');
  if (Math.abs(bis - von) < 1) { fertig(); return; }
  el.style.overflow = 'hidden';
  _klappBewegung(el, [{ height: von + 'px' }, { height: bis + 'px' }],
                 () => { el.style.overflow = ''; fertig(); });
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
    // Erst die Zeile wegklappen, dann loeschen und neu zeichnen (16.09.2026).
    const zeile = document.getElementById('ex-item-' + id);
    _zeileWegKlappen(zeile).then(() => _exLoeschenAusfuehren(id, ex, usedInPlan));
  }, { danger: true, confirmLabel: 'Löschen' });
}
function _exLoeschenAusfuehren(id, ex, usedInPlan) {
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

let planAddSelection = new Set();

// Das Mehrfach-Auswahl-Add-Modal hat nur noch EIN Ziel: den Trainingstag, der gerade in
// seiner Detailansicht offen ist (`editingLibDayId`). Der zweite Zweig ('planday', ueber
// `editingDayIdx` im Bearbeiten-Dialog des Plan-Details) ist am 13.09.2026 entfallen —
// Gymtage werden ausschliesslich in ihrer Detailansicht angepasst.
// Liefert die aktuellen Übungen des Ziel-Tags (für „bereits enthalten").
function _planAddTargetDay() {
  return DB.getTrainingDays().find(d => d.id === editingLibDayId) || null;
}
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
  const _push = (day) => {
    let added = 0;
    planAddSelection.forEach(exId => {
      day.exercises.push({ exId, targetSets: 3, targetReps: 8 });
      added++;
    });
    return added;
  };
  // Trainingstag-Detail: direkt den globalen Bibliothek-Tag editieren
  const days = DB.getTrainingDays();
  const day = days.find(d => d.id === editingLibDayId);
  if (!day) return;
  const added = _push(day);
  DB.saveTrainingDays(days);
  syncActiveWorkoutWithPlanDay(day.id);
  planAddSelection.clear();
  closeModal('modal-add-to-plan');
  renderLibDayDetail();
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

// Blaetter von unten fahren beim Oeffnen herein (`@keyframes slideUp`) und seit dem 16.09.2026
// beim Schliessen wieder hinaus (Leonard-Wunsch) — vorher verschwanden sie schlagartig, nur das
// Herunterwischen hatte eine Bewegung.
// KEIN `animationend`: Bei `prefers-reduced-motion` laeuft gar keine Animation, das Ereignis
// kaeme nie und das Blatt bliebe fuer immer stehen (dieselbe Falle wie bei der Seitenleiste).
// Die Dauer MUSS zur `animation`-Angabe von `.overlay.schliesst` passen.
// Die NACHARBEIT (Diagramme abraeumen, Modus-Uebergang der Seite „Gym") laeuft erst am ENDE der
// Fahrt — der Uebergang soll nicht hinter einem noch sichtbaren Blatt beginnen.
const MODAL_AUS_MS = 200;
function openModal(id) {
  // Ein Blatt, das gerade abfaehrt, sofort abschliessen — sonst liegen zwei Schleier
  // uebereinander und der Timer des alten wuerde spaeter das neue treffen.
  document.querySelectorAll('.overlay.schliesst').forEach(o => _modalZu(o));
  document.getElementById(id).classList.remove('hidden');
  document.getElementById(id).addEventListener('click', function h(e) {
    if (e.target === this) { closeModal(id); this.removeEventListener('click',h); }
  });
}
// `ohneBewegung`: Das Blatt ist schon unten (Herunterwischen) — dann nur noch ausblenden.
function closeModal(id, ohneBewegung) {
  const ov = document.getElementById(id);
  if (!ov || ov.classList.contains('hidden')) return;
  if (ohneBewegung || _bewegungReduziert()) { _modalZu(ov); return; }
  if (ov.classList.contains('schliesst')) return;          // faehrt schon
  ov.classList.add('schliesst');
  const nr = (ov._zuNr = (ov._zuNr || 0) + 1);
  setTimeout(() => { if (ov._zuNr === nr) _modalZu(ov); }, MODAL_AUS_MS);
}
// Wirklich zu: ausblenden und die Nacharbeit des jeweiligen Blattes erledigen.
function _modalZu(ov) {
  ov._zuNr = (ov._zuNr || 0) + 1;                          // laufende Fahrt entwerten
  ov.classList.remove('schliesst');
  ov.classList.add('hidden');
  const id = ov.id;
  // Das Diagramm der Uebungs-Detailansicht hier abraeumen: Geschlossen wird das Modal
  // ueber den Hintergrund-Tipp oder die Wischgeste, beide landen in dieser Funktion.
  if (id === 'modal-hist-detail') { _hdCharts.forEach(c => c.destroy()); _hdCharts = []; }
  // Abschlussansicht zu: Jetzt wechselt die Seite „Gym" mit Bewegung in den normalen Modus
  // (siehe `_woEndeHalten`). Greift fuer „Fertig", den Tipp daneben und das Herunterwischen.
  if (id === 'modal-summary' && _woEndeHalten) {
    _woEndeHalten = false;
    if (currentScreen === 'workouts') { _woUebergangVormerken('ende'); renderWorkoutsScreen(); }
    else syncWorkoutActiveUI();
  }
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
          // Das Blatt liegt schon unten — ohne Bewegung schliessen, sonst faehrt es ein
          // zweites Mal los und springt dafuer erst wieder nach oben.
          if (id) closeModal(id, true);
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
const TRASH_LABELS = { workout: 'Einheit', plan: 'Plan', day: 'Trainingstag', exercise: 'Übung', runplan: 'Laufplan' };

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
  // Die Zeile klappt weg, bevor der Eintrag zurueckwandert (16.09.2026) — sonst springt die
  // Liste. Ein zweiter Tipp waehrend der Bewegung findet den Eintrag nicht mehr und tut nichts.
  const zeile = document.querySelector(`.trash-row[data-trash="${id}"]`);
  if (zeile && !zeile.dataset.faehrt) {
    zeile.dataset.faehrt = '1';
    _zeileWegKlappen(zeile).then(() => trashRestore(id));
    return;
  }
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
  } else if (entry.type === 'runplan') {
    const rs = DB.getRunPlans();
    if (!rs.some(r => r.id === item.id)) { rs.push(item); DB.saveRunPlans(rs); }
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
      const zeile = document.querySelector(`.trash-row[data-trash="${id}"]`);
      _zeileWegKlappen(zeile).then(() => {
        DB.saveTrash(DB.getTrash().filter(t => t.id !== id));
        renderTrash();
        showToast('Endgültig gelöscht');
      });
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
    ? `<a onclick="emptyTrash()" style="font-size:var(--fs-neben);color:var(--red);cursor:pointer">Leeren</a>` : '';
  if (!trash.length) {
    wrap.innerHTML = `<div class="trash-empty">Nichts gelöscht. Was du löschst, liegt hier ${TRASH_KEEP_DAYS} Tage lang und lässt sich zurückholen.</div>`;
    return;
  }
  wrap.innerHTML = trash.map(t => {
    const daysLeft = Math.max(0, TRASH_KEEP_DAYS - Math.floor((Date.now() - t.deletedAt) / 86400000));
    return `<div class="trash-row" data-trash="${t.id}">
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
    runPlans: JSON.parse(JSON.stringify(DB.getRunPlans())),
    races: JSON.parse(JSON.stringify(DB.getRaces())),
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
  DB.saveRunPlans(snap.runPlans || []);
  DB.saveRaces(snap.races || []);
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
    manualDays: DB.getManualDays(),       // v4: nachgetragene Tage ohne Aufzeichnung
    races: DB.getRaces(),                 // v4: eigenstaendige Wettkampftage ohne Laufplan
    runPlans: DB.getRunPlans(),           // v4: Laufplaene (die Laeufe selbst stehen in der Tabelle)
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
  if (Array.isArray(data.manualDays)) localStorage.setItem('ft_manual_days', JSON.stringify(data.manualDays));
  if (Array.isArray(data.races)) localStorage.setItem('ft_races', JSON.stringify(data.races));
  if (Array.isArray(data.runPlans)) localStorage.setItem('ft_runplans', JSON.stringify(data.runPlans));
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
  // Der Pfeil ist dasselbe SVG wie ueberall; gedreht wird ueber `aria-expanded` am Zeilenknopf.
  // ACHTUNG: `open` haelt den Zustand VOR dem Umschalten fest — der neue ist also `!open`.
  const zeile = document.getElementById('drive-debug-state').closest('.drive-row');
  if (zeile) zeile.setAttribute('aria-expanded', open ? 'false' : 'true');
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
// ─── Seitenleiste: der Seitenschalter der Tabs, unten am Bildschirm ──────────
// Der Seitenschalter sieht aus wie eh und je (`.seg-toggle` mit `.seg-btn`), steht aber
// nicht mehr im Kopf des Tabs, sondern fest unten am Bildschirm — und macht dort den
// aktiven und passiven Modus mit (08.09.2026, Leonard-Wunsch; Position und passiver
// Modus sind aus der Zeitleiste der App „Health Command Center" uebernommen).
// Sichtbar in Training, Uebungen und Plan; die Uebersicht hat keine Seiten, die
// Vollbild-Overlays auch nicht.
//
// Welche Seiten ein Tab hat, steht in EINER Tabelle — wie schon `PLANS_SEITEN` und
// `OVERLAY_SCREENS`. Wer einem Tab eine Seite gibt, traegt sie hier ein; der Schalter
// folgt von selbst.
//
// ACHTUNG: `seiten` ist eine FUNKTION, kein Array. Diese Tabelle steht weit VOR
// `PLANS_SEITEN` in der Datei; ein Array-Literal wuerde dessen Wert schon beim Laden
// lesen und liefe in die temporale Todeszone von `const` (derselbe Fehler wie einst bei
// `_datenStand` vor dem DB-Objekt). Aus demselben Grund sind auch `aktiv` und `setzen`
// Funktionen.
// ── Seitenwechsel innerhalb eines Tabs (16.09.2026, Leonard-Wunsch, „Variante C: Staffel") ──
// Gym ↔ Laufen, Uebungen ↔ Stats und die vier Plan-Seiten wechseln nicht mehr hart: Die GANZE
// Flaeche unter der Kopfzeile blendet aus, dann wird gezeichnet, dann kommen die Karten der neuen
// Seite NACHEINANDER von unten herein (je 80ms versetzt) — dieselbe Formensprache wie beim
// Wechsel in den aktiven Modus auf der Seite „Gym".
// VORGESCHICHTE: Vom selben Tag stammt „Variante B" (die ganze Flaeche blendete als EIN Stueck
// ein). Sie ist auf Leonards Wunsch durch diese Staffel ersetzt worden.
// WAS EINE KARTE IST, entscheidet `_staffelElemente`: Es laeuft vom Screen abwaerts und nimmt das
// erste Element mit eigener KLASSE als Karte. Reine Huellen ohne Klasse (`#wo-view-gym`,
// `#active-ex-list`, `#plans-list`, `#exercises-groups` …) sind keine Karten, dort geht es eine
// Ebene tiefer — sonst waere die ganze Uebungsliste EIN Schritt der Staffel.
// Karten UNTERHALB des Bildschirms bewegen sich nicht, und die Verzoegerung ist ab der sechsten
// Karte gedeckelt: Im Uebungskatalog stehen sonst zwanzig Gruppen in der Warteschlange.
// EINBLENDEN IN ZWEI BEWEGUNGEN je Karte (Leonard-Meldung 16.09.2026 „die Karten erscheinen zu
// ploetzlich"): Deckkraft und Schub haben verschiedene Dauern UND Kurven, und das geht nur
// getrennt — eine Web-Animation kennt genau EINE Kurve fuer alle ihre Eigenschaften.
// NACH OBEN SCROLLEN gehoert dazu (Leonard-Entscheidung): Der Sprung liegt im unsichtbaren
// Moment zwischen Aus- und Einblenden.
// KEINE Bewegung, wenn der Tab gerade nicht sichtbar ist (die Uebersicht ruft `setPlansView`,
// bevor sie in den Plan-Tab wischt), bei `prefers-reduced-motion` und ohne Breite.
// TOKEN: Wer waehrend der Bewegung weiterschaltet, bricht die laufende ab (`_seitenNr`); die alte
// Kette hoert auf, BEVOR sie zeichnet — gezeichnet wird nur das neueste Ziel.
const SEITEN_AUS_MS = 120;        // Abgang der alten Seite, als ein Stueck
const SEITEN_EIN_MS = 220;        // Deckkraft je Karte, gleichmaessig anlaufend
const SEITEN_SCHUB_MS = 260;      // Schub je Karte, weich ausrollend
const SEITEN_STAFFEL_MS = 80;     // Abstand von Karte zu Karte
const SEITEN_STAFFEL_MAX = 5;     // ab hier warten alle weiteren gleich lang
const SEITEN_EIN_KURVE = 'cubic-bezier(.35,0,.5,1)';
const SEITEN_SCHUB_KURVE = 'cubic-bezier(.22,.7,.3,1)';
let _seitenNr = 0;

function _seitenInhalt(screen) {
  return [...screen.children].filter(el => !el.classList.contains('ph') && el.offsetParent !== null);
}
// Die Karten der Seite, eine Ebene tiefer als die Flaeche (siehe Kommentar oben).
function _staffelElemente(screen) {
  return _staffelKarten(_seitenInhalt(screen));
}
// Dieselbe Suche ab beliebigen Wurzeln — der Ansichtswechsel (`_ansichtWechsel`) setzt beim
// Behaelter an, nicht beim ganzen Screen.
// Die Huelle der archivierten Eintraege (`.archiv-inhalt`) traegt eine Klasse, ist aber genauso
// wenig eine Karte wie die klassenlosen Huellen: Die Karten darin kommen einzeln.
function _staffelKarten(wurzeln) {
  const karten = [];
  const sammeln = (el) => {
    // Hoehe 0 = nicht zu sehen (leere Liste, ausgeblendeter Block) — so ein Element wuerde sonst
    // einen unsichtbaren Schritt in der Staffel kosten.
    if (!el.offsetHeight) return;
    const huelle = !el.getAttribute('class') || el.classList.contains('archiv-inhalt');
    if (huelle && el.children.length) { [...el.children].forEach(sammeln); return; }
    karten.push(el);
  };
  wurzeln.forEach(sammeln);
  return karten;
}

// ── Ansichtswechsel innerhalb einer Seite (18.09.2026, Leonard-Wunsch) ──────────────────
// Katalogfilter „nur aus dem aktiven Plan" (Seite „Übungen") und Liste ↔ Zeitstrahl der
// Wettkaempfe: dieselbe Staffel wie beim Seitenwechsel, aber nur fuer den BEHAELTER, dessen
// Inhalt sich aendert. Kopfzeile, Suchfeld und der Knopf selbst bleiben stehen — der Knopf
// zeigt seinen neuen Zustand sofort, der Aufrufer setzt ihn VOR dem Wechsel.
// KEIN Sprung nach oben (anders als beim Seitenwechsel): Man bleibt auf derselben Seite.
// TOKEN (`_ansichtNr`): Wer waehrend der Bewegung erneut tippt, bricht die laufende ab; die alte
// Kette hoert vor dem Zeichnen auf. Die neue blendet von der AKTUELLEN Deckkraft aus, damit der
// Behaelter nicht erst auf voll zurueckspringt.
let _ansichtNr = 0;
function _ansichtWechsel(behaelter, zeichnen) {
  const nr = ++_ansichtNr;
  if (!behaelter || _bewegungReduziert() || !behaelter.clientWidth) { zeichnen(); return; }
  const abraeumen = () => {
    behaelter.getAnimations().forEach(a => a.cancel());
    behaelter.querySelectorAll('*').forEach(el => el.getAnimations().forEach(a => a.cancel()));
  };
  const von = parseFloat(getComputedStyle(behaelter).opacity);
  abraeumen();
  _animFahren(behaelter, [{ opacity: isNaN(von) ? 1 : von }, { opacity: 0 }],
              { duration: SEITEN_AUS_MS, fill: 'forwards' })
    .then(() => {
      if (nr !== _ansichtNr) return;
      behaelter.getAnimations().forEach(a => a.cancel());
      zeichnen();
      const karten = _staffelKarten([...behaelter.children])
        .filter(el => el.getBoundingClientRect().top < window.innerHeight);
      return _kartenStaffelFahren(karten.length ? karten : [behaelter]);
    })
    .then(() => { if (nr === _ansichtNr) abraeumen(); });
}

// Karten eines Behaelters gestaffelt einblenden — der gemeinsame Teil von Seitenwechsel und
// Tagwechsel auf der Seite „Gym". Die Karten stehen schon im DOM; hier kommt nur die Bewegung
// dazu. Karten unterhalb des Bildschirms bleiben aussen vor, die Verzoegerung ist gedeckelt.
// ── Eine Listenzeile klappt beim Loeschen weg (16.09.2026, Leonard-Wunsch) ─────────────
// Vorher verschwand sie und alles darunter sprang hoch. Gefahren werden Hoehe, senkrechtes
// Polster UND die Aussenabstaende: Bei `box-sizing: border-box` kann ein Kasten nicht flacher
// werden als sein Polster, und der Abstand zur naechsten Zeile bliebe sonst als Luecke stehen.
// `overflow: hidden` schneidet den Inhalt waehrenddessen ab. Aufgeraeumt wird nicht — direkt
// danach zeichnet der Aufrufer die Liste neu.
const ZEILE_WEG_MS = 220;
function _zeileWegKlappen(el) {
  if (!el || _bewegungReduziert() || !el.offsetHeight) return Promise.resolve();
  const cs = getComputedStyle(el);
  const z = (name) => parseFloat(cs[name]) || 0;
  const voll = { height: el.offsetHeight + 'px', opacity: 1,
                 marginTop: z('marginTop') + 'px', marginBottom: z('marginBottom') + 'px',
                 paddingTop: z('paddingTop') + 'px', paddingBottom: z('paddingBottom') + 'px' };
  const leer = { height: '0px', opacity: 0, marginTop: '0px', marginBottom: '0px',
                 paddingTop: '0px', paddingBottom: '0px' };
  el.style.overflow = 'hidden';
  return _animFahren(el, [voll, leer], { duration: ZEILE_WEG_MS, easing: 'ease', fill: 'forwards' });
}
// Gegenstueck: eine NEU dazugekommene Zeile kommt wie eine Karte von unten herein.
function _zeileEinblenden(el) {
  if (!el || _bewegungReduziert()) return Promise.resolve();
  return _kartenStaffelFahren([el]).then(() => el.getAnimations().forEach(a => a.cancel()));
}

function _kartenStaffelFahren(karten, grundVerzug) {
  const rein = [];
  karten.forEach((el, i) => {
    const verzug = (grundVerzug || 0) + Math.min(i, SEITEN_STAFFEL_MAX) * SEITEN_STAFFEL_MS;
    rein.push(_animFahren(el, [{ opacity: 0 }, { opacity: 1 }],
                          { duration: SEITEN_EIN_MS, delay: verzug, easing: SEITEN_EIN_KURVE, fill: 'backwards' }));
    rein.push(_animFahren(el, [{ transform: 'translateY(14px)' }, { transform: 'none' }],
                          { duration: SEITEN_SCHUB_MS, delay: verzug, easing: SEITEN_SCHUB_KURVE, fill: 'backwards' }));
  });
  return Promise.all(rein);
}
function _kartenStaffelEin(behaelter) {
  if (!behaelter || _bewegungReduziert() || !behaelter.clientWidth) return Promise.resolve();
  const karten = [...behaelter.children]
    .filter(el => el.offsetHeight && el.getBoundingClientRect().top < window.innerHeight);
  if (!karten.length) return Promise.resolve();
  // Ein schneller zweiter Tipp trifft Karten, die noch laufen — erst abraeumen, dann neu fahren.
  karten.forEach(el => el.getAnimations().forEach(a => a.cancel()));
  return _kartenStaffelFahren(karten)
    .then(() => karten.forEach(el => el.getAnimations().forEach(a => a.cancel())));
}

function _seitenWechsel(screenId, tabName, setzen) {
  const screen = document.getElementById(screenId);
  const nr = ++_seitenNr;
  if (!screen || currentScreen !== tabName || _bewegungReduziert() || screen.clientWidth <= 0) {
    setzen();
    return;
  }
  // Eine noch laufende Bewegung abraeumen — sonst faehrt sie gegen die neue.
  screen.querySelectorAll('*').forEach(el => el.getAnimations().forEach(a => a.cancel()));
  const alt = _seitenInhalt(screen);
  Promise.all(alt.map(el => _animFahren(el, [{ opacity: 1 }, { opacity: 0 }],
                                        { duration: SEITEN_AUS_MS, fill: 'forwards' })))
    .then(() => {
      if (nr !== _seitenNr) return;               // inzwischen weitergeschaltet: die neuere Kette zeichnet
      alt.forEach(el => el.getAnimations().forEach(a => a.cancel()));
      setzen();
      screen.scrollTop = 0;
      // Nur was auf dem Bildschirm steht, wird gestaffelt — der Rest ist ohnehin nicht zu sehen.
      const karten = _staffelElemente(screen).filter(el => el.getBoundingClientRect().top < window.innerHeight);
      // Ohne erkennbare Karten (leere Seite) faehrt die Flaeche selbst herein.
      const ziele = karten.length ? karten : _seitenInhalt(screen);
      return _kartenStaffelFahren(ziele);
    })
    .then(() => {
      if (nr === _seitenNr) screen.querySelectorAll('*').forEach(el => el.getAnimations().forEach(a => a.cancel()));
    });
}

const SEITEN_LEISTE = {
  workouts:  { seiten: () => [['gym', 'Gym'], ['laufen', 'Laufen']],
               aktiv:  () => workoutsViewMode,
               setzen: (k) => setWorkoutsView(k) },
  exercises: { seiten: () => [['list', 'Übungen'], ['stats', 'Stats']],
               aktiv:  () => exercisesViewMode,
               setzen: (k) => setExercisesView(k) },
  plans:     { seiten: () => Object.keys(PLANS_SEITEN).map(k => [k, PLANS_SEITEN[k].titel]),
               aktiv:  () => plansViewMode,
               setzen: (k) => setPlansView(k) },
};

let _slPassiv = false;   // Schalter geschrumpft?
// Laufendes Abtauchen. Die Dauer MUSS zur `animation`-Angabe von `.sl-raus` im CSS passen —
// stehen die beiden auseinander, verschwindet die Leiste entweder zu frueh (Sprung) oder
// bleibt nach der Bewegung noch einen Moment stehen.
// 300ms — am 21.09.2026 erst auf 200 („schneller"), dann auf 250 und schliesslich zurueck auf
// 300 („noch langsamer"). Seither beginnt die Bewegung beim Wisch aber schon an der
// 50-%-Schwelle und nicht mehr nach dem Einrasten und Neuzeichnen.
const SL_ANIM_MS = 300;
let _slAusTimer = null;

function seitenleisteBauen() {
  if (document.getElementById('seitenleiste')) return;
  const el = document.createElement('div');
  el.id = 'seitenleiste';
  el.hidden = true;   // bis `seitenleisteAktualisieren` weiss, in welchem Tab wir stehen
  el.innerHTML = `<div class="seg-toggle" role="group" aria-label="Seite"></div>`;
  document.body.appendChild(el);
  seitenleisteAktualisieren();
}

// Fuellt den Schalter mit den Seiten des GERADE sichtbaren Tabs. Laeuft bei jedem
// Tabwechsel (`_applyTabState`) und bei jedem Seitenwechsel (`set*View`).
// `ziel` (21.09.2026): Beim WISCH laeuft sie schon an der 50-%-Schwelle, wenn `currentScreen`
// noch der alte Tab ist (gesetzt wird er erst beim Einrasten) — der Scroll-Handler nennt den
// kommenden Tab deshalb ausdruecklich. Ohne Angabe gilt `currentScreen`.
function seitenleisteAktualisieren(ziel) {
  const el = document.getElementById('seitenleiste');
  if (!el) return;
  const tabName = ziel || currentScreen;
  const tab = SEITEN_LEISTE[tabName];

  // AUF- UND ABTAUCHEN am unteren Bildschirmrand (Leonard-Wunsch 08.09.2026). Nur beim
  // UEBERGANG zwischen „Tab ohne Leiste" und „Tab mit Leiste" — zwischen zwei Tabs MIT
  // Leiste bleibt sie stehen, dort waere die Bewegung nur Unruhe.
  // Die Animationsklasse muss vor dem Setzen entfernt und nach einem erzwungenen Reflow
  // neu vergeben werden, sonst startet die Animation beim zweiten Mal nicht erneut.
  const tauchtAuf = !!tab && el.hidden;
  if (tab) {
    // Ein noch laufendes Abtauchen abbrechen: Wer schnell zurueckwischt, soll die Leiste
    // sofort wiederhaben und nicht auf das Ende der alten Bewegung warten.
    if (_slAusTimer) { clearTimeout(_slAusTimer); _slAusTimer = null; }
    el.classList.remove('sl-raus');
    el.hidden = false;
    if (tauchtAuf) {
      el.classList.remove('sl-rein');
      void el.offsetWidth;
      el.classList.add('sl-rein');
    }
  } else if (!el.hidden && !_slAusTimer) {
    // Abtauchen: `hidden` erst NACH der Bewegung setzen, sonst waere die Leiste sofort weg.
    // Kein `animationend`, sondern eine Zeitgrenze — bei `prefers-reduced-motion` laeuft gar
    // keine Animation, das Ereignis kaeme nie und die Leiste bliebe fuer immer stehen.
    el.classList.remove('sl-rein');
    void el.offsetWidth;
    el.classList.add('sl-raus');
    _slAusTimer = setTimeout(() => {
      el.hidden = true;
      el.classList.remove('sl-raus');
      _slAusTimer = null;
      // Erst jetzt darf die Laufanzeige-Pille nachruecken — waehrend die Leiste noch
      // abtaucht, wuerde sie sonst durch sie hindurchfallen.
      document.documentElement.classList.remove('sl-an');
    }, SL_ANIM_MS);
  }

  // `--sl-off` (Ausweichhoehe von Laufanzeige-Pille und Toast) haengt an dieser Klasse
  // und NICHT am Theme: Die Vollbild-Overlays tragen das Theme ihres Tabs, haben aber
  // keine Leiste — die Pille schwebte dort sonst grundlos zu hoch.
  // Beim Abtauchen bleibt sie stehen, bis die Bewegung durch ist (siehe oben).
  if (tab) document.documentElement.classList.add('sl-an');
  if (!tab) return;

  const seiten = tab.seiten();
  const jetzt  = tab.aktiv();
  const box = el.querySelector('.seg-toggle');
  if (!box) return;
  // Vier Knoepfe brauchen die engere Schrift — genau wie frueher im Kopf. Zwei Knoepfe
  // brauchen umgekehrt die Breite nicht und stehen 30 % schmaler mittig (`.seg-zwei`).
  // KENNUNG des Inhalts: Beim Wisch hat die 50-%-Schwelle den Schalter schon umgestellt, und das
  // Einrasten ruft diese Funktion ueber `_applyTabState` NOCHMAL mit demselben Stand. Ein zweites
  // Fuellen braeche die laufende Einblendung der neuen Beschriftungen ab (sie stuenden
  // schlagartig da) — bei gleicher Kennung bleibt der Schalter deshalb, wie er ist.
  const kennung = tabName + '|' + seiten.map(([k, t]) => k + ':' + t).join(',') + '|' + jetzt;
  const fuellen = () => {
    box.dataset.kennung = kennung;
    box.classList.toggle('seg-vier', seiten.length >= 4);
    box.classList.toggle('seg-zwei', seiten.length === 2);
    // Eine noch ausblendende alte Beschriftung (`.sl-alt`, siehe `_slUeberblenden`) bleibt stehen.
    const alt = box.querySelector(':scope > .sl-alt');
    box.innerHTML = seiten.map(([k, titel]) =>
      `<button type="button" class="seg-btn${k === jetzt ? ' active' : ''}" data-seite="${k}">${escapeHtml(titel)}</button>`
    ).join('');
    if (alt) box.appendChild(alt);
  };
  // Wechsel zwischen zwei Tabs, die BEIDE eine Leiste haben: ueberblenden statt springen.
  // Nur wenn die Leiste schon stand (nicht beim Auftauchen) und der Tab ein anderer ist — ein
  // Seitenwechsel im selben Tab schaltet nur die aktive Pille um.
  const blenden = !tauchtAuf && _slTab && _slTab !== tabName;
  _slTab = tabName;
  if (blenden) _slUeberblenden(box, fuellen);
  else if (box.dataset.kennung !== kennung) fuellen();
}

// ── Wechsel der Seitenleiste zwischen zwei Tabs: UEBERBLENDEN (18.09.2026, Leonard-Wunsch) ──
// Vorher sprang der Schalter beim Wischen von „Gym | Laufen" auf „Übungen | Stats" schlagartig
// um, und zwar erst beim Einrasten. Jetzt bleibt er stehen, die alten Beschriftungen blenden aus,
// die neuen ein, und die BREITE gleitet auf die neue Knopfzahl (zweiseitig 70 % ↔ vierseitig
// volle Breite, `.seg-zwei`). Leonard hat das gegen „Ab- und Auftauchen" und „Mitschieben"
// gewaehlt.
// Ausgeloest wird es in `seitenleisteAktualisieren`, also beim EINRASTEN des Wischs (Settle von
// `initTabScrollSync` → `_applyTabState`) — die Geste selbst bleibt unangetastet (siehe „AM
// WISCHEN NICHTS AENDERN"). Derselbe Weg gilt fuer den Tipp auf die Tableiste.
// DIE ALTEN KNOEPFE wandern in eine eigene Ebene ueber dem Schalter (`.sl-alt`), in ihrer ALTEN
// Breite und mittig — so bleiben sie beim Ausblenden stehen, waehrend der Schalter um sie herum
// seine Breite aendert. Schrift und seitliches Polster werden eingefroren: Der Schalter traegt
// schon die Klassen des neuen Tabs (`.seg-vier` hat 12 statt 13px), und die alten Beschriftungen
// wuerden sonst im Ausblenden springen. `overflow: hidden` am Schalter beschneidet die breitere
// alte Ebene, wenn er schmaler wird.
// Waehrend der Bewegung haelt ein Inline-`margin: auto` den Schalter mittig — der vierseitige
// steht sonst ueber `margin: 0 14px` links an, und mit fester Breite waere er nicht mehr mittig.
// TOKEN `_slBlendeNr`: Ein zweiter Wechsel waehrend der Bewegung raeumt die alte Ebene ab und
// startet von der aktuellen Breite; nur die neueste Kette raeumt am Ende auf.
// Bei `prefers-reduced-motion` und ohne Breite (Leiste nicht sichtbar) wird nur umgeschaltet.
// Seit dem 21.09.2026 rund 30 % schneller (Leonard-Wunsch; vorher 260/160/200/60ms).
const SL_BLENDE_MS = 180;      // Breite
// Die beiden Blenden UEBERLAPPEN: Die neue beginnt, solange die alte noch zu sehen ist — sonst
// stuende der Schalter kurz leer da.
const SL_BLENDE_AUS_MS = 110;  // alte Beschriftungen
const SL_BLENDE_EIN_MS = 140;  // neue Beschriftungen, nach kurzem Vorlauf
const SL_BLENDE_VORLAUF_MS = 40;
let _slTab = null;             // Tab, dessen Seiten gerade im Schalter stehen
let _slBlendeNr = 0;
let _slBreiteAnim = null;

function _slUeberblenden(box, fuellen) {
  const nr = ++_slBlendeNr;
  if (_bewegungReduziert() || !box.animate || !box.offsetWidth) { fuellen(); return; }
  // Reste eines noch laufenden Wechsels abraeumen — die Breite startet dort, wo sie gerade steht.
  // `offsetWidth` ist die LAYOUT-Breite — der passive Modus (`scale(.7)`) rechnet nicht mit hinein.
  const vonBreite = box.offsetWidth;
  box.querySelectorAll(':scope > .sl-alt').forEach(x => x.remove());
  if (_slBreiteAnim) { _slBreiteAnim.cancel(); _slBreiteAnim = null; }
  const alteKnoepfe = [...box.querySelectorAll(':scope > .seg-btn')];
  alteKnoepfe.forEach(k => {
    k.getAnimations().forEach(a => a.cancel());
    const cs = getComputedStyle(k);
    k.style.fontSize = cs.fontSize;
    k.style.paddingLeft = cs.paddingLeft;
    k.style.paddingRight = cs.paddingRight;
  });
  const innen = box.clientWidth - (parseFloat(getComputedStyle(box).paddingLeft) || 0)
                                - (parseFloat(getComputedStyle(box).paddingRight) || 0);
  fuellen();
  const nachBreite = box.offsetWidth;
  const alt = document.createElement('div');
  alt.className = 'sl-alt';
  alt.setAttribute('aria-hidden', 'true');
  alt.style.width = innen + 'px';
  alteKnoepfe.forEach(k => alt.appendChild(k));
  box.appendChild(alt);
  box.style.overflow = 'hidden';
  box.style.marginLeft = 'auto';
  box.style.marginRight = 'auto';
  const kurve = 'cubic-bezier(.4,0,.2,1)';
  const ketten = [];
  if (Math.abs(nachBreite - vonBreite) > 0.5) {
    // `fill: 'forwards'`: Die Breite bleibt stehen, bis das Aufraeumen sie ZUSAMMEN mit dem
    // Inline-`margin: auto` wegnimmt. Endete sie vorher, stuende der vierseitige Schalter fuer
    // einen Moment ohne seine 14px-Raender da (`width: auto` + `margin: auto` = volle Breite).
    _slBreiteAnim = box.animate([{ width: vonBreite + 'px' }, { width: nachBreite + 'px' }],
                                { duration: SL_BLENDE_MS, easing: kurve, fill: 'forwards' });
    ketten.push(_slBreiteAnim.finished.catch(() => {}));
  }
  ketten.push(_animFahren(alt, [{ opacity: 1 }, { opacity: 0 }],
                          { duration: SL_BLENDE_AUS_MS, easing: kurve, fill: 'forwards' }));
  box.querySelectorAll(':scope > .seg-btn').forEach(k => ketten.push(
    _animFahren(k, [{ opacity: 0 }, { opacity: 1 }],
                { duration: SL_BLENDE_EIN_MS, delay: SL_BLENDE_VORLAUF_MS, easing: kurve, fill: 'backwards' })));
  // Notbremse: Die Zeitleiste steht, solange die Seite nicht sichtbar ist — `finished` kaeme dann nie.
  Promise.race([Promise.all(ketten), new Promise(r => setTimeout(r, SL_BLENDE_MS + 400))]).then(() => {
    if (nr !== _slBlendeNr) return;
    alt.remove();
    if (_slBreiteAnim) { _slBreiteAnim.cancel(); _slBreiteAnim = null; }
    box.querySelectorAll(':scope > .seg-btn').forEach(k => k.getAnimations().forEach(a => a.cancel()));
    box.style.overflow = '';
    box.style.marginLeft = '';
    box.style.marginRight = '';
  });
}

// ── Tipp auf eine andere Seite: die PILLE GLEITET hinueber (21.09.2026, Leonard-Wunsch) ──
// Vorher sprang die Markierung — und das erst nach dem Ausblenden der alten Seite (120ms), weil
// `seitenleisteAktualisieren` erst laeuft, wenn die neue Seite gesetzt ist.
// Jetzt verschiebt der Tipp die Klasse `.active` SOFORT, ohne den Schalter neu zu fuellen, und
// eine eigene Flaeche (`.seg-gleiter`, in der Farbe der aktiven Pille, HINTER den Beschriftungen)
// gleitet von der alten zur neuen Stelle. Der neue Knopf traegt so lange keinen eigenen Grund
// (`.seg-gleitet`), die Schriftfarben blenden in derselben Zeit um (`.seg-toggle.gleitet`).
// Die KENNUNG des Schalters wird gleich auf den neuen Stand gesetzt — sonst saehe der spaetere
// Aufruf von `seitenleisteAktualisieren` einen Unterschied und fuellte neu (Bewegung weg).
// Ein zweiter Tipp waehrend der Bewegung startet an der Stelle, an der die Pille gerade steht
// (Token `_slGleitNr`). Gerechnet wird in LAYOUT-Koordinaten (`offsetLeft`, berechnetes
// `transform`), damit der passive Modus (`scale(.7)`) nicht hineinspielt.
const SL_GLEIT_MS = 260;
let _slGleitNr = 0;
function _slSchalterGleiten(box, knopf) {
  const alt = box && box.querySelector(':scope > .seg-btn.active');
  if (!alt || alt === knopf) return;
  const nr = ++_slGleitNr;
  if (box.dataset.kennung) box.dataset.kennung = box.dataset.kennung.replace(/\|[^|]*$/, '|' + knopf.dataset.seite);
  // Start: dort, wo eine noch laufende Pille gerade steht — sonst am alten Knopf.
  let x0 = alt.offsetLeft, w0 = alt.offsetWidth;
  const vorige = box.querySelector(':scope > .seg-gleiter');
  if (vorige) {
    const cs = getComputedStyle(vorige);
    x0 = vorige.offsetLeft + new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform).m41;
    w0 = parseFloat(cs.width) || w0;
    vorige.getAnimations().forEach(a => a.cancel());
    vorige.remove();
  }
  box.querySelectorAll(':scope > .seg-btn.seg-gleitet').forEach(b => b.classList.remove('seg-gleitet'));
  const bewegt = !_bewegungReduziert() && box.animate && box.offsetWidth;
  if (bewegt) { box.classList.add('gleitet'); knopf.classList.add('seg-gleitet'); }
  alt.classList.remove('active');
  knopf.classList.add('active');
  if (!bewegt) { box.classList.remove('gleitet'); return; }
  const g = document.createElement('span');
  g.className = 'seg-gleiter';
  g.setAttribute('aria-hidden', 'true');
  Object.assign(g.style, { left: x0 + 'px', top: knopf.offsetTop + 'px',
                           width: w0 + 'px', height: knopf.offsetHeight + 'px' });
  box.insertBefore(g, box.firstChild);
  _animFahren(g, [{ transform: 'translateX(0)', width: w0 + 'px' },
                  { transform: `translateX(${knopf.offsetLeft - x0}px)`, width: knopf.offsetWidth + 'px' }],
              { duration: SL_GLEIT_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
    .then(() => {
      if (nr !== _slGleitNr) return;
      // Reihenfolge: erst den eigenen Grund des Knopfs zurueck (solange `.gleitet` die
      // Hintergrund-Transition noch abschaltet — sonst blendete er 0.15s nach), dann aufraeumen.
      knopf.classList.remove('seg-gleitet');
      void knopf.offsetWidth;
      g.remove();
      box.classList.remove('gleitet');
    });
}

// PASSIVER MODUS. Der Schalter steht dauerhaft ueber dem Inhalt; wer gerade liest,
// scrollt oder in einen anderen Tab wischt, braucht ihn nicht — dann schrumpft er auf
// 70 %, bleibt aber sichtbar, bedienbar und an derselben Unterkante stehen. Ein Tipp
// darauf holt ihn zurueck.
// BEWUSST anders geloest als das Ausblenden der Bottom-Nav: die verschwindet ganz und
// kommt nur ueber einen Tipp auf den blanken Tab-Hintergrund zurueck. Der Seitenschalter
// muss jederzeit erreichbar bleiben — er ist das einzige Bedienelement fuer die Seite.
function seitenleistePassiv(ja) {
  const el = document.getElementById('seitenleiste');
  if (!el || _slPassiv === !!ja) return;   // nichts tun, wenn der Zustand schon stimmt
  _slPassiv = !!ja;
  el.classList.toggle('passiv', _slPassiv);
}

// EIN Handler fuer die ganze Leiste, am Dokument.
function initSeitenleiste() {
  seitenleisteBauen();
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    // Aktiv oder passiv: Ein Tipp auf den Schalter holt ihn zurueck, ein Tipp irgendwo
    // daneben schickt ihn in den passiven Modus.
    if (t.closest('#seitenleiste')) seitenleistePassiv(false);
    else seitenleistePassiv(true);

    const knopf = t.closest('#seitenleiste .seg-btn');
    if (!knopf) return;
    const tab = SEITEN_LEISTE[currentScreen];
    if (!tab) return;
    // Die Pille gleitet SOFORT zum getippten Knopf (21.09.2026) — die Seite selbst wechselt erst
    // nach ihrem Ausblenden. Kein eigenes `seitenleisteAktualisieren()` mehr hinter `setzen`: Das
    // lief, solange die Seite noch die alte war, und haette den Schalter mitten in der Bewegung
    // neu gefuellt. Die `set*View` rufen es selbst, sobald die neue Seite gesetzt ist.
    if (!knopf.classList.contains('active')) _slSchalterGleiten(knopf.closest('.seg-toggle'), knopf);
    tab.setzen(knopf.dataset.seite);
  });
}

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
      // Der Wisch braucht einen EIGENEN Ausloeser fuer den passiven Modus der
      // Seitenleiste — er erzeugt keinen Klick, die Regel „Tipp neben die Leiste"
      // greift also nicht. Beim Tabwechsel per Tableiste tut sie es sehr wohl (die
      // Nav liegt ausserhalb von `#seitenleiste`); beide Wege enden im selben Zustand.
      seitenleistePassiv(true);
      // b) Aktiven Tab an der 50%-Schwelle bestimmen (das Einrasten macht CSS-Snap).
      const idx = Math.max(0, Math.min(TAB_ORDER.length - 1, Math.round(progress)));
      const name = TAB_ORDER[idx];
      // Theme + Nav-Highlight schon WAEHREND des Snaps wechseln (responsiv);
      // der "schwere" Renderer kommt erst im Settle.
      if (name !== lastReported) {
        // SEITENLEISTE SCHON HIER UMSCHALTEN, nicht erst beim Einrasten (21.09.2026, auf
        // Leonards ausdruecklichen Auftrag, EINZELN ausgeliefert — siehe „AM WISCHEN NICHTS
        // AENDERN"). Auftauchen, Abtauchen und Ueberblenden beginnen damit mitten im Wisch.
        // BEWUSST VOR dem Wechsel der Theme-Klasse: Die Leiste misst ihre Breite
        // (`offsetWidth`) und erzwingt damit ein Layout. Vorher ist das Dokument noch sauber und
        // das Messen billig; nach dem Klassenwechsel am body muesste der Browser dafuer sofort
        // die Stile der ganzen Seite neu rechnen — mitten in der Geste.
        // Das Einrasten ruft sie ueber `_applyTabState` noch einmal; die Kennung in
        // `seitenleisteAktualisieren` laesst den Schalter dann stehen.
        // ZURUECKNEHMEN: diese eine Zeile entfernen.
        seitenleisteAktualisieren(name);
        // Der Wisch blendet die Tableiste aus (Leonard-Wunsch 12.09.2026) — hier, weil der
        // Handler die Schwelle von 50 % ohnehin schon kennt. Deckt den Fingerwisch UND die
        // programmatische Fahrt aus `wischeZuTab` ab; der harte Wechsel ueber die Tableiste
        // selbst hat seinen Ausloeser in `showScreen`.
        _navVerstecken(true);
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
function initLaufWochenResize() {
  let t = null;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(_laufWochenBreitePruefen, 150); });
}

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

// Ein Tipp INS Diagramm zeigt nur den Messwert (Chart.js-Tooltip) — die umgebende Karte
// soll dabei nicht zucken. Waehrend der Beruehrung bekommt sie `.keine-tipp-anim`; das CSS
// setzt ihr `transform: none`. Bewusst ueber pointerdown/-up statt `:has(canvas:active)`:
// Ob Safari einem <canvas> ueberhaupt `:active` gibt, haengt an Details der Trefferpruefung.
const TIPP_ANIM_KARTEN = '.card, .plan-section-card, .chart-card-v2, ' +
  '.hero-v2, .aex-v2, .ex-list, .plan-card-v2, .plan-list-row, .mehr-card';
function _initKeineTippAnimationAufDiagramm() {
  let aktiv = null;
  const loesen = () => { if (aktiv) { aktiv.classList.remove('keine-tipp-anim'); aktiv = null; } };
  document.addEventListener('pointerdown', (e) => {
    loesen();
    const cv = e.target && e.target.closest ? e.target.closest('canvas') : null;
    if (!cv) return;
    const karte = cv.closest(TIPP_ANIM_KARTEN);
    if (!karte) return;
    aktiv = karte;
    karte.classList.add('keine-tipp-anim');
  }, { passive: true, capture: true });
  document.addEventListener('pointerup', loesen, { passive: true, capture: true });
  document.addEventListener('pointercancel', loesen, { passive: true, capture: true });
}

// Tipp ausserhalb des Kalenders hebt die Tagesauswahl wieder auf.
function initCalendarDeselect() {
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.cal-scroll')) return;   // im Raster: Auswahl behalten
    // KEIN Vorab-Abbruch, wenn gerade keine Zelle markiert ist: Beim Neuzeichnen des
    // Rasters verliert die Zelle ihr .sel, die Beschreibung darunter bleibt aber stehen.
    // Ein Abbruch liess den Text dann fuer immer stehen.
    document.querySelectorAll('.cal-day.sel').forEach(c => c.classList.remove('sel'));
    // Zuklappen mit Bewegung; eine ohnehin leere Fusszeile laesst `_calFussSetzen` in Ruhe.
    document.querySelectorAll('.cal-detail').forEach(el => { if (el.innerHTML) _calFussSetzen(el, ''); });
  });
}

function initScrollHideNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const bar = document.getElementById('workout-active-bar');
  const rest = document.getElementById('rest-bar');
  // ACHTUNG Reihenfolge im Init: `initSeitenleiste()` MUSS vorher gelaufen sein, sonst
  // ist `seitenLeiste` hier null und die Leiste bekaeme den Startzustand „Nav
  // eingeklappt" nicht mit — sie saesse auf Nav-Hoehe ueber einer Luecke.
  const seitenLeiste = document.getElementById('seitenleiste');
  // Laufanzeige, Satzpause UND Seitenleiste folgen der Nav: die Pille rueckt nach, die
  // Pausenleiste nimmt bei ausgeblendeter Nav deren Platz ein, die Leiste rutscht mit.
  const setNavHidden = (h) => {
    nav.classList.toggle('nav-hidden', h);
    if (bar) bar.classList.toggle('nav-hidden', h);
    if (rest) rest.classList.toggle('nav-hidden', h);
    if (seitenLeiste) seitenLeiste.classList.toggle('nav-hidden', h);
  };
  // Von aussen erreichbar machen — der Tabwechsel blendet die Leiste damit ebenfalls aus.
  _navVerstecken = setNavHidden;
  const _navTickingByTab = new Map();

  function attachToScreen(screenEl, tabName) {
    if (!screenEl) return;
    // Tipp auf den LEEREN Tab-Hintergrund (nicht auf Karten/Buttons) toggelt die Bottom-Nav
    // ein/aus — same Mechanik wie das Runterscrollen (Leonard-Wunsch). e.target===screenEl
    // trifft nur den Hintergrund (Kinder/Karten bubblen, sind aber !== screenEl).
    screenEl.addEventListener('click', (e) => {
      if (currentScreen !== tabName) return;
      // NUR der blanke Tab-Hintergrund holt die Bottom-Nav zurueck — ein Tipp auf eine Karte
      // nicht mehr (Leonard-Entscheidung 01.09.2026). `e.target === screenEl` trifft genau
      // das: Jedes Kind (Karte, Kopfzeile, Knopf) meldet sich selbst als Ziel, auch wenn das
      // Ereignis danach bis hierher hochblubbert. Die fruehere Pruefung ueber composedPath
      // liess auch „tote" Karten ohne eigene Aktion durch — genau das war unerwuenscht.
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
        // Scrollen blendet die Nav nur noch AUS, nie wieder ein (Leonard-Entscheidung,
        // 20.08.2026) — auch nicht am Seitenanfang. Zurück holt sie ausschließlich der
        // Tipp auf eine nicht-interaktive Fläche. Die 60px-Grenze bleibt, damit ein
        // kleiner Wisch ganz oben die Leiste nicht sofort wegnimmt.
        if (cur >= 60 && delta > 5) setNavHidden(true);
        // Die Seitenleiste geht dagegen in BEIDE Richtungen in den passiven Modus und
        // schon ab dem ersten Stueck Bewegung — wer scrollt, liest. Die 2px sind gegen
        // das Nachfedern von iOS, nicht gegen echte Gesten.
        if (Math.abs(delta) > 2) seitenleistePassiv(true);
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
  // Beim App-Start ist die Tableiste EINGEKLAPPT (Leonard-Wunsch 07.09.2026). Sie kommt wie
  // gewohnt durch einen Tipp auf den blanken Tab-Hintergrund zurueck. Bewusst ueber
  // `setNavHidden`, damit Laufanzeige und Pausenleiste denselben Zustand mitbekommen.
  setNavHidden(true);
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
  applyGlasModus();
  _setzeChartFarben();
  initAudioUnlock();
  migrateRemoveCardio();
  migrateImportManualDays();
  migrateImportRaces();
  migrateToMultiPlan();
  // Tag-Modell v2: eingebettete Plan-Tage in geteilte Bibliothek-Referenzen überführen (einmalig)
  migrateDayModelV2();
  // Daten-Hygiene: verwaiste Wochenplan-Referenzen entfernen (legacy fallback, falls noch
  // jemand auf den ft_weekplan-Key zugreift — mit Multi-Plan sind die weekPlans pro Plan)
  cleanupOrphanWeekplan();
  // Satzanzahl der Trainingstage einmalig an die letzte absolvierte Einheit angleichen
  migrateSetCountsFromHistory();
  // Beendete Gym- und Laufplaene ins Archiv (18.09.2026) — vor dem ersten Zeichnen
  autoArchivBeendetePlaene();
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
  // Zeitstrahl der Wettkaempfe: Scrollen klappt den hervorgehobenen wieder zu
  initWettkampfStrahl();
  // Seitenleiste unten (Seitenschalter der Tabs) — MUSS vor `initScrollHideNav` stehen:
  // das dortige `setNavHidden` merkt sich das Element beim Einrichten.
  initSeitenleiste();
  // Bottom-Nav versteckt sich beim Runterscrollen, taucht beim Hochscrollen wieder auf
  initScrollHideNav();
  // Kalender: Kaestchengroesse beim Drehen neu rechnen, Auswahl bei Tipp daneben aufheben
  initLaufWochenResize();
  initCalendarResize();
  initCalendarDeselect();
  _initKeineTippAnimationAufDiagramm();
  // Tab-Wechsel per nativem horizontalem Snap-Scroll am Tab-Container
  initTabScrollSync();
  // Bottom-Sheet-Modals nach unten wegswipen
  initSheetSwipeDismiss();
  // Edge-Swipe-Back im Plan-Detail (vom linken Bildschirmrand mit Finger nach rechts ziehen)
  initOverlayEdgeSwipe('screen-plan-detail', closePlanDetail);
  initOverlayEdgeSwipe('screen-day-detail', closeLibDayDetail);
  initOverlayEdgeSwipe('screen-runplan-detail', closeRunPlanDetail);
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
