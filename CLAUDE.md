# FitTrack — Projektkontext für Claude Code

Persönliche Fitness-PWA von Leonard (iPhone-first), Ersatz für iPhone-Notizen: Krafttraining
(„Gym") und Laufen. Vanilla JS, **kein Framework, kein Build-Step**, Daten in `localStorage`,
optional Google-Drive-Sicherung. UI-Sprache Deutsch.

Antworten an Leonard auf Deutsch, knapp und direkt. Leonard programmiert nicht selbst — Fachbegriffe
übersetzen. Bei mehrdeutigen Anweisungen präzise zurückfragen. Bei Gestaltungsfragen zeichnet Claude
meist mehrere Varianten (A/B/C/D), Leonard wählt.

**Diese Datei beschreibt den AKTUELLEN Stand.** Die vollständige Entstehungsgeschichte (jede Version
seit Juli 2026, Messwerte, verworfene Varianten) steht in `.claude/historie.md` (wird nicht
automatisch geladen). Dort nachschlagen, bevor etwas geändert wird, das schon einmal anders war —
per `grep -n "<Bezeichner>" .claude/historie.md`.

---

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` (~1025 Z.) | Markup, alle Screens + Fenster (Modals) |
| `style.css` (~4380 Z.) | gesamtes Styling, Theme-Variablen |
| `app.js` (~12650 Z.) | komplette Logik — **eine Datei, keine Module** |
| `sw.js` | Service Worker, Cache-Version `fittrack-vNN` (aktuell **v562**) |
| `manifest.json`, `icon*.png`, `icon.svg`, `apple-touch-icon.png` | PWA |
| `.claude/devserver.py` | Testserver ohne Caching, Port 8123 (`.claude/launch.json`: „fittrack") |
| `.claude/historie.md` | Vorgeschichte (früher CLAUDE.md, Stand v557) |

Die früheren lokalen Altdateien (`app.js.bak-daymodel`, `Trainings JSONs/`,
`prompt-farbuebergang-tabs.md`) liegen seit dem 11.11.2026 im macOS-Papierkorb.

## Deploy

Repo `https://github.com/lebrongoku-prog/fittrack` (`origin`, Branch `main`), live über GitHub
Pages: **https://lebrongoku-prog.github.io/fittrack/**. Deploy = `git push`.
**Claude committet UND pusht selbst, ohne Rückfrage** (Leonard, 26.07.2026; Token im
macOS-Keychain). Nach dem Push sofort melden, nicht auf die Live-Seite warten.
Ausnahmen, in denen gefragt wird: (1) nicht lauffähig/ungeprüft (Konsolenfehler, CSS-Klammern
unausgeglichen, halbfertig) → melden statt pushen; (2) heikle Eingriffe (`push --force`, Branch
löschen, versehentlich mitcommittete Zugangsdaten).

## Workflow bei JEDER Änderung

1. **`sw.js`: `const CACHE = 'fittrack-vNN'` hochzählen** — sonst liefert die PWA die alten Dateien.
2. **Alle geänderten Dateien committen, v. a. `sw.js`**, dann pushen.
3. **In CLAUDE.md einen kurzen Eintrag unter „Änderungsprotokoll" ergänzen** (Version, Datum,
   Leonard-Wunsch/-Entscheidung, was gemessen wurde). Nur Dauerhaftes in die Abschnitte darüber.
4. **Verifizieren vor Abschluss:**
   - Syntax: `jsc` (siehe unten). **`node` ist NICHT installiert.**
   - Laufzeit nur im Browser: `preview_start` „fittrack", vor JEDEM Neuladen Service Worker
     deregistrieren und Caches löschen (sonst läuft alte `app.js`). Konsole prüfen. Hochformat mit
     375×812 messen, Querformat mit 1100px, Glas-Modus mitprüfen.
   - CSS-Klammerbalance prüfen. Beim Löschen von CSS NIE eine ganze Selektorliste entfernen, nur
     weil EIN Selektor tot ist — nur den toten Teil.
   - Bei Umbauten ohne Verhaltensänderung: alte Fassung (`git show HEAD:…`) in einen Unterordner
     von `.claude/` legen, beide mit denselben Daten laden, gerenderte Ausgaben vergleichen.
     Die CSP verbietet `eval` — Prüfskripte als `<script src>` (gleicher Ursprung) einhängen.
   - `exportData` im Vorschau-Browser speichert eine Datei im Projektordner — danach löschen.
5. **Updates greifen erst nach dem ZWEITEN App-Neustart.** Einstellungen → „App-Version" zeigt die
   installierte Version (`renderAppVersion`), „Jetzt aktualisieren" (`updateJetzt`) erzwingt es.
   Bei Fehlermeldungen zuerst die Version abfragen.

## Nützliche Befehle
```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -e 'try{ new Function(readFile("app.js")); print("OK") }catch(e){ print(e) }'
python3 -c "s=open('style.css').read(); print(s.count('{'), s.count('}'))"
grep -n "fittrack-v" sw.js
```

---

## Sprache in der Oberfläche

- **Plan** (Zeitraum) · **Gymtag** (Trainingstag, Vorlage bzw. Kopie im Plan) · **Gym Session(s)**
  (absolvierte Krafteinheit, seit v519 überall, auch Einzahl). Laufplan-Detail: „Läufe".
  Im Code heißt es weiter „Einheit"/`workout`. „Workout" und „Ruhetag" kommen in der UI NICHT vor:
  „Kein Gym"/„Kein Lauf" (kurz), „Kein Gym geplant"/„Kein Lauf geplant" (lang).
- Tableiste: **Übersicht · Training · Plan**. Training-Seiten **Gym · Laufen** (Tabtitel `#wo-h1`
  nennt die Seite). Plan-Seiten **Gymplan · Laufplan**.
- Dezimaltrenner ist der **Punkt** (kein `toLocaleString('de-DE')` für Zahlen). `fmtVol` liefert
  ab 1000 kg Tonnen inkl. Einheit. Pace-Format `5'54'' /km` (`fmtPace`, erst auf ganze Sekunden
  runden).

---

## Architektur

### Daten & Speicher
- `const DB = {…}` kapselt `localStorage`. Lesen/Schreiben über `_speicherLesen(key, leer)` /
  `_speicherSchreiben(key, wert)`; Letzteres ruft `markLocalChange()` (Drive-Sync) und
  `_entwurfPruefen()`. Ohne Sync-Anstoß bewusst: `saveActive` (laufende Session), `saveRuns`.
- Wichtige Keys: `ft_plans`, `ft_trainingdays`, `ft_exercises`, `ft_workouts`, `ft_active`,
  `ft_runplans`, `ft_runs_cache`, `ft_races`, `ft_manual_days`, `ft_run_favs`,
  `ft_koerpergewicht`, `ft_trash`. Reine Anzeige-Einstellungen (`ft_glas`, `ft_ex_chart_modes`,
  `ft_rueckblick_zu`) gehören NICHT in die Sicherung.
- Zeitspannen nur über `TAG_MS` / `WOCHE_MS`.
- `getEx(id)` ist gegen den Rohtext von `ft_exercises` zwischengespeichert (`_exNachId`) — das
  gelieferte Übungsobjekt NICHT verändern, sondern Liste holen, ändern, `DB.saveExercises`.
- Einmal-Migrationen (`migrate*`, Merker `ft_*_v1` usw.) und `DEFAULT_PLAN`/`DEFAULT_WEEKPLAN`
  bleiben: `driveApplyCloudData` ruft die Migrationen erzwungen für alte Sicherungen auf.
- Tabellen wie `OVERLAY_SCREENS`, `PLANS_SEITEN`, `ARCHIV_SEITEN`, `SEITEN_LEISTE` stehen weit oben;
  Einträge, die Zustand lesen, sind **Funktionen** (sonst temporale Todeszone von `let` weiter unten).
  Aus demselben Grund ist `_entwurf` ein `var`.

### Gympläne und Gymtage (Modell seit v460)
- **VORLAGE** = Gymtag in `ft_trainingdays` OHNE `planId` (`_istVorlage`); nur Vorlagen stehen auf
  der Seite „Gymtage". **PLAN-KOPIE** = Tag MIT `planId` (Besitzer) und meist `vorlageId`.
  Jeder Plan hat eigene Kopien (`_tagKopieren`); Änderungen am Plan wirken nicht in andere Pläne.
- Ein Plan besteht GENAU aus den Tagen seines Wochenplans (`saveWeekPlanDay` → `_wochenplanSetzen`
  → `_planKopienAufraeumen`); eine Kopie ohne Wochentag fliegt raus, außer eine Session zeigt auf
  sie. Eine aussortierte Kopie derselben Vorlage wird beim erneuten Wählen WIEDER eingesetzt.
- Plan-Detail: Chips „Wochentage" (`plan.wochentage`, `toggleGymWochentag`), darunter „Wochenplan"
  mit einer Zeile je gewähltem Tag; Tipp öffnet `openGymtagWahl(i)` („In diesem Plan" / „Weitere
  Gymtage" / „Kein Gymtag"). Abschnitt „Wochenvolumen" (`renderPlanVolumen`).
- Gymtage werden NUR in ihrer Detailansicht bearbeitet (`renderLibDayDetail`). Einzige Ausnahme:
  `syncSetCountsToPlanDay` übernimmt beim Beenden die trainierte Satzanzahl.
- **Rest Weeks** (v559): `plan.restWeeks = [Planwoche, …]` (1-basiert ab dem Montag der
  Startwoche, wie „Woche N / M"). Geprüft über `_istRestWoche(plan, datum)` / `_planWocheNr`.
  In einer Rest Week ist kein Gymtag geplant — eingebaut in `getCurrentWeekDays` (Feld
  `restWeek`), `getWeekStatus`, `getWeekStreak` (überspringt, bricht nicht ab), `_calPlanInfo`
  (`rest: true`), `_calPlanStand`, Kombi-Karte, `buildPlanCard` (laufende Woche), rote Wochen,
  Ø-Wochenvolumen (`rest` in den Wochendaten). Knopf/Fußzeile/Wochenkarte sagen „Rest Week",
  im Kalender steht „Rest" unter dem Gym-Balken (`.cal-rest`). Einstellen im Gymplan-Detail über
  die Chip-Reihe „Rest Weeks" unter „Wochentage" (`_restWochenZeichnen`, `toggleRestWoche`,
  `.rw-reihe`, Chips `.lp-tagwahl` „W1 … Wn", sieben je Zeile). Wochenzählung und
  Planende bleiben unverändert; Laufen ist nicht betroffen. Neue Stellen, die „geplant" für Gym
  rechnen, MÜSSEN `_istRestWoche` beachten.
- Gymtag hat Muskelgruppen (`day.muscles`, Reihenfolge `MUSCLE_ORDER`, nicht aus Übungen abgeleitet).
- **Entwurf** in Gym-/Laufplan-Detail bestehender Pläne: Alles speichert sofort, der Stand beim
  Öffnen wird gemerkt (`_entwurfBeginnen`); Leiste „Speichern / Änderungen verwerfen"
  (`entwurfSpeichern`, `entwurfVerwerfen`), Nachfrage beim Verlassen. Neue Pläne (`_neuePlaene`)
  starten ohne Entwurf.
- Zeiträume rechnen in **Kalendertagen inkl. erstem und letztem Tag** (`_planHatBegonnen`,
  `_planIstVorbei`, `_calLokalTag`). Gymplan speichert UTC-Mitternacht, Laufplan lokale
  Mitternacht — nicht halb angleichen. Laufplan-Datum nie per `toISOString()` zurücklesen.
- Beendete Pläne wandern von selbst ins Archiv (`autoArchivBeendetePlaene`, einmal je Enddatum);
  archivierte Gympläne frieren ihre Tage in `archivedDays` ein.
- `getActivePlan()` / `getCurrentWeekDays()` in Anzeigepfaden nutzen — `DB.getPlan()` fällt ohne
  Plan auf `DEFAULT_PLAN` zurück (Phantom-Tage).
- Gleichnamige Gymtage sind technisch harmlos (alles über Ids); neu entstehende bekommen „(2)"
  (`eindeutigerTagName`).

### Gym Sessions
- `pe.sets = [{reps, weight}]` (weight String). Start: Anzahl aus dem Gymtag, Werte aus der letzten
  Session (`buildSetsForExercise`, `displaySetsForPe`, `getLastExData`).
- `wo.dayIdx` (0=Mo…6=So) beim Start setzen, lesen über `woDayIdx(wo)`. Wochentag NIE über
  `weekPlan.findIndex(planDayId)` bestimmen. Freies Training: `planDayId === null`.
- Unterstützte Übungen (`ex.assisted`): gerechnet mit bewegter Last = Körpergewicht − Unterstützung
  (`satzKg`, `wo.bw` je Session, `_bwVon`).
- Verschobene Sessions (an anderem Tag derselben Woche) decken ihren Plantag ab, Zuordnung über
  `planDayId` (`_verschobeneZuordnen`, `_calGymVerschiebungen`).
- Satzpause startet immer bei 1:30 (`REST_DEFAULT_SEC`), nur wenn danach noch ein Satz offen ist.
  Ende: Vibration (nicht auf iOS), WebAudio-Ton, Meldung.
- Bestleistung wird gefeiert, sobald die Übung komplett abgehakt ist (`celebratePR`).
- Löschen: `withUndo` (6 s Rückgängig) + Papierkorb `ft_trash` (30 Tage).

### Laufen
- Gelaufene Einheiten kommen NUR aus Leonards Google-Tabelle „Workout Data" (`RUN_SHEET_ID`,
  nur lesen, Spalten über die Kopfzeile). Zwischenspeicher `ft_runs_cache`, nicht in der Sicherung.
  „Hochintensives Intervalltraining" zählt mit (`istHiit`, `art: 'hiit'`).
- Eigener OAuth-Bereich und Token-Client (`RUN_SCOPE`, `runRequestToken`), getrennt von Drive.
  `sheets.googleapis.com` MUSS in der CSP (`connect-src`) UND in `NO_CACHE_HOSTS` (sw.js) stehen.
- Abruf nur über „Aktualisieren" (Einstellungen → Laufdaten) bzw. die Laufknöpfe
  (`runLaeufeLaden`). KEIN automatischer Abruf, KEINE Kopplung an den Drive-Sync (beides war da und
  ist auf Leonards Wunsch zurückgenommen — nicht ohne Frage wieder einbauen).
- Laufplan `{ id, name, notes, startDate, endDate, runDays:[0..6], archived, raceDate,
  units:[{week, dayIdx, km, minutes, note, skipped}] }`; Datum einer Einheit wird gerechnet
  (`runEinheitDatum`). Geplante Tage nur innerhalb der Laufzeit (`runGeplanteTage`).
  Herzfrequenzzonen sind seit v470 überall entfallen.
- Vorgezogene/nachgeholte Läufe: `runVerschiebungen(mo)` paart Läufe mit offenen Plantagen
  (nur Plantage vor heute). Übersprungene Läufe (`unit.skipped`, `openRunSkip`) sehen aus wie
  verpasste (rot), zählen aber als geplant.
- Wettkämpfe: `ft_races` = `{date, name}` (Getter sortiert aufsteigend) plus `plan.raceDate`.
  Werte kommen aus dem Lauf des Tages. Vollbildseite mit Liste/Zeitstrahl.
- Favoriten `ft_run_favs` (Stern in `showRunDetail`, Seite „lauf-favoriten").

### Sicherung
- Drive (`driveSync`, `collectLocalData`/`driveApplyCloudData`, Format version 4). Token-Anfragen
  MÜSSEN enden (`DRIVE_TOKEN_TIMEOUT_MS`), hängende Syncs werden nach 2 min verworfen,
  Token-Ablauf in `sessionStorage`. Neue Daten-Stores in `collectLocalData`, `driveApplyCloudData`,
  `_snapshotStores`/`_restoreStores` UND ggf. Papierkorb eintragen.
- „Daten exportieren/importieren" nutzt seit v557 dasselbe Format; alte Dateien (`plan`) gehen noch.

---

## Navigation & Screens

- **Drei Tabs** (`TAB_ORDER`): `overview`, `workouts`, `plans` — nebeneinander in `#tab-container`
  mit CSS-Scroll-Snap. `.screen.active` steht FEST an `#screen-overview` (nur Marker) — Selektoren
  wie `#screen-workouts.active` greifen nie; `#screen-xy.screen` nehmen.
- **Vollbildseiten** über `OVERLAY_SCREENS`: `plan-detail`, `day-detail`, `runplan-detail`, `mehr`
  (Einstellungen, Zahnrad in der Übersicht), `gymtage`, `wettkaempfe`, `lauf-favoriten`,
  `exercises` (Übungskatalog), `stats`. Zurück-Pfeil und Wischen vom linken Rand. Wer eine ergänzt,
  prüft die drei Stellen in `_applyTabState` (Theme, Edit-Kontext, Renderer).
  Gymtag-Detail lässt die aufrufende Seite als `.darunter` liegen.
- Knöpfe oben rechts im Plan-Tab: Gymplan → Hantel (Gymtage), Liste (Übungen), Säulen (Stats),
  Archiv, „+"; Laufplan → Stern (Favoriten), Pokal (Wettkämpfe), Archiv, „+". Archiv-Knopf nur, wenn
  es Archiviertes gibt (`ARCHIV_SEITEN`, `syncPlansArchivBtn`).
- **Seitenschalter unten** (`#seitenleiste`, `SEITEN_LEISTE`): aktiv/passiv (70 %, 50 % Deckkraft),
  passiv beim Scrollen, Tabwechsel oder Tipp daneben; schaltet an der 50-%-Schwelle des Wischs um.
- **Bottom-Nav**: startet eingeklappt, jeder Tabwechsel blendet sie aus, Scrollen nur aus; zurück
  nur per Tipp auf den blanken Tab-Hintergrund.
- `showScreen` = harter Wechsel; `wischeZuTab` = Wischbewegung (`_tabFahrt`, Snap währenddessen aus,
  Notbremse).
- Theme je Tab über `body.theme-*` und `THEME_GRADIENTS` (Übersicht Cyan, Training Grün — grau,
  wenn auf der gezeigten Seite heute nichts ansteht —, Plan Amber, Einstellungen Hellblau). Alle
  Vollbildseiten außer `mehr` tragen das Plan-Theme.

### ⚠️ AM WISCHEN NICHTS ÄNDERN
Ohne Gegenprüfung auf dem iPhone nichts an Tab-Wisch, Scroll-Snap oder dem Scroll-Handler von
`initTabScrollSync` ändern. Das Loslassen selbst zu führen ist ZWEIMAL gescheitert (08.09.2026) —
nicht ein drittes Mal versuchen. `#tab-container` trägt `-webkit-overflow-scrolling: auto`.
Wischen ist auf diesem Rechner nicht prüfbar. Scrollbereiche in Karten (Kalender, Wochenkarten)
brauchen `overscroll-behavior-x: contain`, keinen `transform` am Vorfahren (bricht die Geste auf
iOS ab) und das unsichtbare sticky Kind `.cal-sticky-anchor`.

---

## Was wo steht (aktueller Aufbau)

**Übersicht** (`renderOverview`): Trainingskalender zuoberst (`#ov-cal-card`, einklappbar,
startet zu) · Rückblick „Letzte Woche" (`renderRueckblick`, ab Montag) · Wochenkarte
(`#ov-week-card`, Titel = Filter Trainingswoche/Gymwoche/Laufwoche, Tipp auf Wochentag wählt Tag)
· „Heute" (`#ov-diese-woche`, `renderUebersichtWoche`: Startblock mit Gym- und Laufknopf für den
gewählten Tag, Titel klappt die Tageszeilen auf). Keine Herocard mehr.

**Training → Gym**: Herocard „Heute" (`buildHeuteHero`, Knopf nennt den Gymtag, Titel klappt die
Übungsvorschau auf) · „Diese Woche" (`renderGymWoche`, wischbar über die Planwochen, Diagramm
„Wochenvolumen" per Tipp auf die Karte, offene Tage öffnen `showGymtagVorschau`). Keine
Wochenplan-Karte, keine Tagesauswahl (Hülle `#wo-week-card` und `_woWocheFahren` seit v558
entfernt). Laufende Session: `buildSessionCard`, Übungskarten `.aex-v2`.
**Training → Laufen**: Herocard · „Diese Woche" (`laufWochenListe`, wischbar,
„Wochenkilometer").

**Plan-Tab**: Trainingskalender des Plans + Planliste (`buildPlanCard` / `buildRunPlanCard` mit
`nurPlan`), Archiv.

### Herocard / Knöpfe
- Knöpfe nennen den Inhalt: geplant „Push" / „8 km", erledigt grau („Push" mit Haken, „8.2 km"),
  nichts geplant grau „Kein Gym" (fragt vor freiem Training) / „Kein Lauf". Während einer Session
  führt der Gymknopf „Zur laufenden Gym Session". Gym-Verlauf `#0B4F49→#14B8A6`, Lauf
  `#15803D→#4ADE80`, neutral `#475569`, Beenden rot.
- Zu lange Beschriftungen: `_knopfSchriftAnpassen` verkleinert 18 → 15 → 13px.
- Farbwechsel der Knöpfe beim Tagwechsel blendet (`mitHeroFarbwechsel`).
- Start/Ende einer Session auf der Seite „Gym" laufen mit Übergang (`_woUebergang*`).

### Wochenzeichen & Farben
- **Gym = Quadrat in #0F766E, Lauf = Quadrat in #4ADE80** (seit v500/v501), Tag ohne Einheit rund.
  Gefüllt = absolviert, Umriss = geplant/offen, rot = verpasst, grau = verschoben/übersprungen.
  Beide Sportarten an einem Tag: diagonal geteilt (oben links Gym, unten rechts Lauf); geplante
  Hälfte = Randstück. Kombi-Karte zeichnet nur `.ppv-k-reihe.beide`.
- Wettkampf im Kalender: goldenes Quadrat `#EAB308`.
- **Transparenz-Modus** (`html.glas`, `toggleGlasModus`, Überblendung per View Transitions):
  Karten durchscheinend, Sportfarben in Wochen- und Kalenderkarten werden weiß (Gym 60 %, Lauf
  ~92 %). Farbig bleiben Warnrot, Wettkampf, Muskelgruppenfarben. `.mehr-card` bleibt weiß.
  `glasAktiv()` liest den Speicher, nicht die Klasse.

### Trainingskalender
- `renderTrainingCalendar(id, cardId)`, drei Instanzen (`cal` Übersicht, `pcal` Plan-Tab,
  `dcal` Gymplan-Detail in `#pd-cal-card` — immer Gymkalender über den Zeitraum des BEARBEITETEN
  Plans, ohne Zeitraum-Wechsler, Spalten mit „W1 … Wn" beschriftet, zeigt NUR den Plan
  (gewählte Wochentage außer Rest Weeks als Umriss, nichts Absolviertes, keine roten Wochen,
  Tage nicht antippbar, Kennzahl „N Gym Sessions geplant"), Titel klappt auf/zu über
  `toggleDetailKalender`, gemeinsamer Klapp-Kern `_kalKarteKlappen`),
  `_calModus(id)`: Übersicht folgt dem Titel-Filter (Trainings-/Gym-/Laufkalender), Plan-Tab der
  Seite. Startet immer bei „Aktuell" (laufender Plan), Zeitraum-Wechsler Aktuell → Jahre.
- `--cal-cell` / `--cal-gap` sind die einzige Quelle für Maße (JS liest sie). `.cal-scroll` muss
  ein gewöhnlicher Block bleiben.
- Fußzeile mit Kachel je Sportart (`_calKachel`), zweiter Tipp schließt.
- Rote Wochen (kein Training) nur in Einzelkalendern, nur abgelaufene Wochen.
- Tipp auf Monatsnamen tönt jeden zweiten Monat (`toggleCalMonate`).

### Diagramme (Chart.js 4.4.1 vom CDN)
- Wochenkilometer/Wochenvolumen: Wert über jeder Säule (`_balkenWertePlugin`), Tooltip nur per
  Klick, zweiter Tipp auf dieselbe Säule schließt (`_tooltipZweiterTipp`), Ø-Linie per Tipp auf den
  Ø-Wert (`toggleSchnittLinie`, gemeinsamer Zustand), Säulen-Tipp wischt die Wochenkarte dorthin.
- Farben nach Untergrund, nicht nach globalem Glas-Modus (`canvas.closest('.screen:not(#screen-mehr)')`).
- Verstecktes Canvas hat keine Breite — erst aufklappen, dann zeichnen.

---

## Gestaltungsregeln

- **Schriftskala, fünf Stufen:** `--fs-etikett` 11 · `--fs-neben` 13 · `--fs-text` 15 ·
  `--fs-titel` 16 (Kartentitel) · `--fs-betont` 18. Keine neuen Größen; lieber eine Stufe höher.
  Ausnahmen nur große Einzelanzeigen (und 12px im Quadrat-Wochentag, ausdrücklicher Wunsch).
- Eingabefelder mindestens **16px** (sonst zoomt iOS). Zahleneingabe über den eigenen Zahlenblock
  (`#modal-numpad`, Felder sind `div role="button"`). Schalt-Texte `user-select: none`.
- **Kartenpolster 14px**; im Querformat (ab 1024px) steht der seitliche Rand in EINER Selektorliste
  — neue Karten dort eintragen. Senkrechter Abstand kommt immer von der Karte darüber.
- Wochenplan-Karten und Herocards 157.3px; Knöpfe 63.6px.
- Tab-Kopfzeilen gleich hoch (`--ph-h`), Knöpfe oben rechts 38px (`--ph-btn`).
- **Ein Ausklapp-Pfeil** für die App (`.aex-v2-chev` + `AEX_CHEV_SVG`), rechts, zugeklappt nach
  unten, aufgeklappt 180°. Viele Stellen klappen inzwischen ohne Pfeil über den Titel.
- **Bewegung:** Klappen 200ms über `_klappBewegung` / `_boxFahren` (Höhe UND Polster), immer mit
  Notbremse (Timer), weil `onfinish`/rAF bei verdeckter Seite nie kommen; Token gegen schnelle
  Doppeltipps. Seitenwechsel gestaffelt (`_seitenWechsel`, `_kartenStaffelFahren`),
  Ansichtswechsel `_ansichtWechsel`, Listenzeile löschen `_zeileWegKlappen`, Blätter fahren beim
  Schließen hinunter (`closeModal`, `MODAL_AUS_MS`). Bei `prefers-reduced-motion` sofort.
  Kein `animationend` als Auslöser verwenden.
- Statusleiste bleibt `black-translucent`; in der installierten App rückt der Inhalt um
  `--schleier-t` (20px) nach unten (iOS-27-Schleier).
- Karten mit eigenem Scrollbereich und reine Formulare haben keine Tipp-Animation.
- Kein `backdrop-filter` auf dem Seitenschalter (dunkle Linie auf iOS).

---

## Verworfen — nicht ohne Leonards Frage wieder einbauen

Loslassen beim Tab-Wisch selbst führen · Akzentfarben-Blende beim Wisch · Statusleiste `black` ·
Kalender-Rad (Commit 3fd3f9a) · feste Höhe der Kalenderkarte beim Filterwechsel · gespeicherte
Kalenderansicht · automatischer Laufdaten-Abruf (Commit e9e07a6) · Laufdaten-Sync an Drive
gekoppelt · Kreis-Animation beim Glas-Wechsel (Commit 7fb92af) · Herzfrequenzzonen · Sportsymbole
in Knöpfen/Titeln/Seitenschalter · Herocard in der Übersicht · Wochenplan-Karte im Trainings-Tab ·
Sicherungs-Chip im Kopf · Plan-/Übungs-JSON-Import · Cardio-Übungen.

---

## Gotchas & Testhinweise

- In der verdeckten Browser-Ansicht feuern rAF, Transitions, View Transitions und Scroll-Ereignisse
  nicht; Animationen enden nur über die Notbremse (≥ 600ms warten). Weiches `scrollTo` bleibt
  stehen → `_bewegungReduziert` vorübergehend auf true. Chart-Klicks direkt über
  `chart._eventHandler({type:'click', x, y, native})`. `tabs_context` zeigt, ob die Ansicht
  verdeckt ist; bei schmaler Ansicht ist `clientWidth` 0 und Bewegungen nehmen den Schnellpfad.
- Absolut positionierte Bedienelemente mit `document.elementFromPoint` prüfen, nicht mit `.click()`.
- `getComputedStyle` während einer Transition liefert den Startwert → `transition: none` setzen.
- Bestätigungsdialog heißt `confirmAction` (nicht `confirmDialog`).
- `array.map(buildPlanCard)` reicht den Index als `onTap` durch — immer Lambda.
- Laufende Session: `html.wo-running` nur, wenn Session läuft, Training-Tab + Seite Gym offen und
  der Tag passt. `syncWorkoutActiveUI` läuft jede Sekunde — dort nichts neu aufbauen.
- `--accent` ist per `@property` als `<color>` registriert und kommt als `rgb(…)` zurück
  (`_hexZuRgb` kann beides).
- Nav-Symbole: Punkte sind `fill="currentColor"` — `color` mitsetzen, nicht nur `stroke`.
- Beim Suchen nach totem CSS: zur Laufzeit zusammengesetzte Klassen (`theme-*`,
  `plan-status-chip-*`, `drive-log-*`, `cal-stat-*`, `rd-w-*`, `hero-farbe-von-*`) sind lebendig;
  Klassen mit Präfix-Gleichheit (`chart-card` vs. `chart-card-v2`) mit Wortgrenze suchen; Ketten
  toter Funktionen lösen sich erst nacheinander auf.

---

## Änderungsprotokoll

Ältere Einträge (bis v557) in `.claude/historie.md`. Neue Einträge hier kurz anhängen.

- **v557 (11.11.2026):** Durchsicht. Manuelle Sicherung exportiert/importiert alles (Format der
  Drive-Sicherung, altes Format lesbar). `openModal` hängt nur einen Hintergrund-Zuhörer an. Tote
  Reste entfernt (alte Tagesauswahl im Trainings-Tab, `DB.getWeekPlan/saveWeekPlan/saveManualDays`,
  `#wo-sub`, `theme-exercises`, Zwei-Reihen-Regeln der Kombi-Karte). CLAUDE.md auf den aktuellen
  Stand gekürzt, Vorgeschichte nach `.claude/historie.md`.
- **v558 (11.11.2026):** Restliste der Durchsicht. Reste der Wochenplan-Karte im Trainings-Tab
  entfernt (`#wo-week-card`, `renderWorkoutWeekStrip`, `_woWocheFahren`, ihre CSS-Regeln; der
  Start/Ende-Übergang läuft mit Welle und Kartenstaffel weiter). `getEx` zwischengespeichert
  (gemessen mit 241 Sessions: Übersicht 45 → 24ms, Katalog 102 → 56ms, Plan 19 → 8ms; vorher bis
  7364 Katalog-Lesungen je Bildschirm). Körpergewicht „entfernt" (`null`) wird beim Einspielen
  übernommen. manifest: Beschreibung „Gym und Laufen", `theme_color` wie die Meta-Angabe.
  `--screen-pad` und drei Klassen ohne Regel entfernt. Querformat Gym: Herocard volle Breite.
- **v559 (11.11.2026, Leonard-Wahl „Variante D"):** Rest Weeks im Gymplan (siehe Architektur).
  Wochenleiste unter „Wochentage" (sechs Quadrate je Zeile, vergangen kräftig, laufende mit Ring,
  kommende blass, Rest hell-amber mit „Rest"), Schriftzug „Rest" im Kalender (Leonard-Wunsch),
  Wochen zählen normal weiter. GEMESSEN (375px, Plan 12 Wochen, Rest 3 und 6, heute in Woche 6):
  diese Woche 0 geplant, Knopf „Rest Week" in Übersicht und Seite „Gym", Fußzeile „Rest Week",
  Gym-Wochenkarte „Rest Week", Serie 4 (Woche 3 übersprungen), Kennzahl 17/16, Ø-Volumen ohne
  Rest Weeks, keine roten Wochen, „Rest" unter beiden Spalten (Glas weiß), Umschalten per Tipp
  mit Entwurfsleiste und Verwerfen; keine Konsolenfehler.
- **v560 (11.11.2026, Leonard-Wunsch):** Variante D (Wochenleiste mit Quadraten) zurückgenommen,
  stattdessen Variante A: Chips „W1 … Wn" wie „Wochentage", gewählt in der Tabfarbe, Datum im
  `title`. GEMESSEN (375px, 12 Wochen): Chips 42.7px = Wochentag-Chips, bündig, kein Überlauf,
  Tipp schaltet W8 um; keine Konsolenfehler. Logik und Anzeigen aus v559 unverändert.
- **v561 (11.11.2026, Leonard-Wunsch):** Ein- und ausklappbarer Gymkalender im Gymplan-Detail
  zwischen „Trainingsplandaten" und „Wochenvolumen" (`dcal`, startet eingeklappt, nicht
  gespeichert). Über den Spalten die Planwochen „W1 … Wn" (Rest Weeks in der Tabfarbe), darunter
  „Rest"; ein Tipp auf einen Rest-Week-Chip zeichnet ihn sofort neu. GEMESSEN (375px): zu 70px,
  auf 403px, 12 Spalten für 12 Wochen, Wochennummern passend zu den Chips, „Mo" bündig zur
  ersten Zeile, anderer Plan → 8 Spalten; Übersichts- und Plan-Tab-Kalender unverändert; keine
  Konsolenfehler.
- **v562 (11.11.2026, Leonard-Wunsch):** Der Gymkalender im Gymplan-Detail zeigt nur noch den
  Plan: jeder gewählte Wochentag (`plan.wochentage`) im Planzeitraum ist „geplant" (Umriss),
  außer in Rest Weeks; Absolviertes, Verschobenes, Verpasstes und rote Wochen fallen dort weg,
  die Tage sind nicht antippbar (`planZelle` in `_calRasterHTML`). Kennzahl „N Gym Sessions
  geplant". GEMESSEN: Mo/Mi/Fr/So, 12 Wochen, Rest 3+6 → 40 Umrisse, 0 gefüllt trotz 12
  Sessions; Di dazu → 50; Übersicht und Plan-Tab zeigen weiter 12 absolvierte Tage; keine
  Konsolenfehler.
