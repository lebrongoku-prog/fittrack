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
| `sw.js` | Service Worker, Cache-Version `fittrack-vNN` (aktuell **v602**) |
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
     375×812 messen (seit v581 `resize_window` Preset „mobile“ —
     nur so gilt die Viewport-Vergrößerung, die App rechnet dann mit 326px), Querformat mit 1100px, Glas-Modus mitprüfen.
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
- Tableiste: **Übersicht · Training · Plan**. Training-Seiten **Gym · Laufen**, Plan-Seiten
  **Gymplan · Laufplan**. Seit v572 zeigen die drei Tabs im Kopf statt eines Titels das Symbol
  ihres Tabs aus der Tableiste (`.ph-tab-titel`/`.ph-tab-ic`, seit v573 38.4px weiß); der Name steht nur noch
  für Screenreader (`.sr-only`, `#wo-h1-text`, `#plans-h1-text`). Vollbildseiten behalten Titel.
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
- Reihenfolge im Gymplan-Detail: Trainingsplandaten · Gymkalender · Wochenplan ·
  Wochenvolumen. Archivieren und Löschen sind seit v569 quadratische Knöpfe rechts in der
  Titelzeile (Gym- und Laufplan, `.plan-archiv-knopf` gefüllt = archiviert über
  `_archivKnopfSetzen`, `.plan-loesch-knopf` rotes Symbol); der Abschnitt „Aktionen" ist weg.
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
  Planende bleiben unverändert. Laufpläne haben eigene Rest Weeks (v568, siehe Laufen) — dort
  bedeuten sie etwas anderes. Neue Stellen, die „geplant" für Gym
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
  (`runEinheitDatum`). Geplant werden die Läufe seit v566 in der Fußzeile des Laufkalenders im
  Laufplan-Detail (`lcal`): Tipp auf einen Tag → Läufe seiner Woche (`_lcalFussHTML`, Zeilen
  `_lpEinheitHTML` mit km/min/Notiz/Längenbalken), Pfeile `lcalWocheSchritt` oder Wischen
  (`_lcalWischEinrichten` → `_laufWochenWischEinrichten`), Woche im Kalender `.wk-hl`
  (`_lcalWocheZeigen`). Speichern ohne Neuaufbau (`setRunUnit` → `_lpEinheitenNachziehen`).
  Der Abschnitt „Läufe" samt Auf-/Zuklappen ist entfallen.
- **Rest Weeks im Laufplan** (v568): `runPlan.restWeeks`, Chips „W1 … Wn" unter „Lauftage"
  (`_lpRestWochenHTML`, `toggleRunRestWoche`). Eine Rest Week ist beim Laufen eine Woche mit
  REDUZIERTEN km, nicht ohne Lauf — die Markierung ändert an der Planung nichts (Läufe bleiben
  geplant, zählen in Kennzahlen und Wochenkilometer). Sichtbar: „Wn" in der Tabfarbe, „Rest"
  unter dem Lauf-Balken in allen Kalendern (`.cal-rest.lauf`), Kopf der Fußzeile
  „Woche N · Rest" in der Tabfarbe. Reihenfolge Laufplan-Detail:
  Laufplandaten · Laufkalender · Geplante · Gelaufene Wochenkilometer (Archivieren/Löschen im
  Kopf, `runPlanArchivUmschalten`, `deleteRunPlan(editingRunPlanId)`). Geplante Tage nur innerhalb der Laufzeit (`runGeplanteTage`).
  Herzfrequenzzonen sind seit v470 überall entfallen.
- Vorgezogene/nachgeholte Läufe: `runVerschiebungen(mo)` paart Läufe mit offenen Plantagen
  (nur Plantage vor heute). Übersprungene Läufe (`unit.skipped`, `openRunSkip`) sehen aus wie
  verpasste (rot), zählen aber als geplant.
- Wettkämpfe: `ft_races` = `{date, name}` (Getter sortiert aufsteigend) plus `plan.raceDate`.
  Werte kommen aus dem Lauf des Tages. Vollbildseite mit Liste/Zeitstrahl.
- Favoriten `ft_run_favs` (Stern in `showRunDetail`, Seite „lauf-favoriten").

### Strichmännchen im Übungskatalog (v597)
- Jede Katalogzeile zeigt links eine kleine, laufende Figur (`svg.ex-fig`); Tipp öffnet
  `#modal-figur` (groß, Ziehen dreht; seit v601 ohne Ansichtsknöpfe).
  Stil „Gliederpuppe“ (graue runde Glieder), trainierte Abschnitte in den `MUSCLE_META`-Farben,
  Hantel/Gerät und Umgebung (Bank, Stange, Barren, Polster, Fußplatte) mitgezeichnet.
- KEINE Bilddateien: `FIG_BEWEGUNG` = 39 Bewegungsmuster (Stand v601) mit 2–3 Stellungen in 3D (`f(opt)`),
  gezeichnet live in `figSVG` (Projektion, Tiefensortierung); `_figAusschnitt` schneidet das Bild
  zu (klein: um alle Stellungen; Blatt: um alle Drehungen). Standardübungen über `FIG_STANDARD`,
  eigene über `ex.bewegung`/`ex.geraet`/`ex.bank` (Dialog „Übung bearbeiten“, Vorschlag aus dem
  Namen `figBewegungVorschlag`, `figDialog*`). Ohne Muster: neutrale Figur + „Bewegung wählen“.
- EINE Animationsschleife (`_figSchleife`, ~30 fps), läuft nur solange Katalog, Blatt oder Dialog
  offen sind, zeichnet nur sichtbare Figuren (IntersectionObserver).
- Seit v598: Drehen in alle Richtungen (waagerecht = Drehung, senkrecht = Neigung ±89°,
  `figSVG(e, t, blick, neigung, fein)`); im Blatt dreht sich die Figur
  von selbst im Uhrzeigersinn (12°/s, steht beim Festhalten). Gewichtsturm mit sich hebendem
  Block bei Kabelzug und Maschinen, Hebel mit Polster bei Beinstrecker/-beuger, Schlitten-Schienen
  bei der Beinpresse. Kabelrolle wählbar (`ex.kabel` oben/mitte/unten, nur gespeichert, wenn sie
  von der natürlichen Höhe abweicht, `_figKabelStandard`), einarmig bei Mustern mit `einarm`
  (`ex.einarmig`; linker Arm hängt, nur rechte Hand trägt Gerät).
- Seit v599: Ausführungsvarianten je Muster (`varianten`, `ex.variante`, Dialogfeld „Ausführung“;
  bisher Latzug vor die Brust / hinter den Kopf), Seitlage über `rolle` (Seitstütz: Stellung
  bauchab bauen, dann um die Längsachse gerollt), `nurRechts` (Seitbeugen: Gerät nur rechts).
- Seit v600/v602: Bewegungsliste im Dialog nach Muskelgruppe gefiltert (`_figBewegungsListe`:
  AUSSCHLIESSLICH Muster der Gruppe; bei Bizeps/Trizeps innerhalb „Arme“ nur, was diesen Muskel
  einfärbt; eine gewählte Bewegung außerhalb steht unter „Gewählt“). Waagerechtes Ziehen dreht gespiegelt (nach rechts
  ziehen = Blickwinkel steigt). Bewegungsnamen ohne Klammerzusätze.
- Seit v601: Im Blatt zeichnet `figSVG` mit `fein` — jede Linie in ~9er-Stücke zerlegt und
  einzeln nach Tiefe sortiert, damit sich Glieder, Bank und Hantel beim Drehen nicht plötzlich
  falsch überlappen. Kleine Figuren bleiben grob (Leistung). Katalogzeilen und Übungsauswahl
  ohne den farbigen Streifen links (`.ex-item-stripe` entfernt).

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
- **Seitenschalter unten** (`#seitenleiste`, `SEITEN_LEISTE`): nie über einer offenen Vollbildseite (v593,
  `seitenleisteAktualisieren` prüft die sichtbare Seite); aktiv/passiv (70 %, 50 % Deckkraft),
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
Wischen ist auf diesem Rechner nicht prüfbar. Einzige Änderung seit dem 08.09.2026: v594 — der Scroll-Handler tut
nichts, solange eine Vollbildseite sichtbar ist (`_vollbildOffen()`, eine Zeile, auf Leonards
Auftrag; iPhone-Gegenprüfung durch Leonard am 27.11.2026 bestanden). Scrollbereiche in Karten (Kalender, Wochenkarten)
brauchen `overscroll-behavior-x: contain`, keinen `transform` am Vorfahren (bricht die Geste auf
iOS ab) und das unsichtbare sticky Kind `.cal-sticky-anchor`.

---

## Was wo steht (aktueller Aufbau)

**Übersicht** (`renderOverview`): Rückblick „Letzte Woche" (`renderRueckblick`, ab Montag) · Wochenkarte
(`#ov-week-card`, Titel = Filter Trainingswoche/Gymwoche/Laufwoche, Tipp auf Wochentag wählt Tag)
· „Heute" (`#ov-diese-woche`, `renderUebersichtWoche`: Startblock mit Gym- und Laufknopf für den
gewählten Tag, Titel klappt die Tageszeilen auf) · Trainingskalender als LETZTER Abschnitt (v571;
`#ov-cal-card` in `#ov-cal-abschnitt`, einklappbar über den Titel — eingeklappt ist die Karte
ganz weg, startet zu; Kennzahl oben rechts seit v595 NUR bei laufendem Plan: die Quote der
Sportart(en) mit Plan, sonst und in Jahresansichten leer). Keine Herocard mehr.

**Training → Gym**: Herocard „Heute" (`buildHeuteHero`, Knopf nennt den Gymtag, Titel klappt die
Übungsvorschau auf) · „Diese Woche" (`renderGymWoche`, wischbar über die Planwochen, Diagramm
„Wochenvolumen" per Tipp auf die Karte, offene Tage öffnen `showGymtagVorschau`). Keine
Wochenplan-Karte, keine Tagesauswahl (Hülle `#wo-week-card` und `_woWocheFahren` seit v558
entfernt). Laufende Session: `buildSessionCard`, Übungskarten `.aex-v2` (seit v590 Inhalt auf 100 % per
`zoom: 1/1.15` der Kinder in `#active-ex-list` und seit v591 `#day-ex-list` (Gymtag-Detail): Schrift 11/13/15/18, Abstände, Satz-Häkchen;
auf 110 % nur Satzfelder, Nummernkreis, Haken „Übung erledigt“, Pfeil, Notizhöhe, Knopfpolster;
Titel 19).
**Training → Laufen**: Herocard · „Diese Woche" (`laufWochenListe`, wischbar,
„Wochenkilometer").
In „Diese Woche" (Gym und Laufen) stehen die Wochenpunkte bzw. die Leiste nur in der
AUFGEKLAPPTEN Karte (Hülle `.wochen-anzeige`, fährt in `_wochenDiagrammKlappen` mit); Karten
ohne Diagramm zeigen sie nie (v578).

**Plan-Tab**: Trainingskalender des Plans · Abschnitt „Aktueller Gymplan"/„Aktueller Laufplan"
(laufender Plan, `_aktuellerPlanAbschnitt`, Karte als `.abschnitt-karte`) · künftige Pläne ohne
Titel darunter (`buildPlanCard` / `buildRunPlanCard` mit `nurPlan`) · Archiv.

### Herocard / Knöpfe
- Knöpfe nennen den Inhalt: geplant „Push" / „8 km", erledigt grau („Push" mit Haken, „8.2 km"),
  nichts geplant grau „Kein Gym" (fragt vor freiem Training) / „Kein Lauf". Während einer Session
  führt der Gymknopf „Zur laufenden Gym Session". Gym-Verlauf `#0B4F49→#14B8A6`, Lauf
  `#15803D→#4ADE80`, neutral `#475569`, Beenden rot.
- Zu lange Beschriftungen: `_knopfSchriftAnpassen` verkleinert 18 → 15 → 13px.
- „Pausieren“/„Beenden“ der laufenden Session (v586) so groß und in derselben Schrift wie die
  Gym-/Lauf-Knöpfe der Übersicht (63.6px, Stufe „Betont“); die Karte hat dann keine feste Höhe.
- Farbwechsel der Knöpfe beim Tagwechsel blendet (`mitHeroFarbwechsel`).
- Start/Ende einer Session auf der Seite „Gym" laufen mit Übergang (`_woUebergang*`).

### Wochenzeichen & Farben
- **Gym = Quadrat in #0F766E, Lauf = Quadrat in #4ADE80** (seit v500/v501), Tag ohne Einheit rund.
  Gefüllt = absolviert, Umriss = geplant/offen, rot = verpasst, grau = verschoben/übersprungen.
  Beide Sportarten an einem Tag: diagonal geteilt (oben links Gym, unten rechts Lauf); geplante
  Hälfte = Randstück. Kombi-Karte zeichnet nur `.ppv-k-reihe.beide`.
- Wettkampf im Kalender: goldenes Quadrat `#EAB308`.
- **Transparenz-Modus** (`html.glas`, `toggleGlasModus`, Überblendung per View Transitions),
  seit v596 DREI Stufen wie im Health Command Center (`glasStufe()` 0/1/2 in `ft_glas`, ein Tipp
  schaltet weiter, Knopf `aria-pressed` false/mixed/true mit heller werdender Fläche):
  deckend · halb transparent (12-%-Weiß mit Schatten, Klasse `glas`) · ganz transparent ohne
  Fläche, Schatten und Rand (zusätzlich `glas-voll`, Inhalte direkt auf dem Tab-Hintergrund).
  `glasAktiv()` = Stufe 1 oder 2. Alter Wert '1' wurde einmalig zu '2' (`ft_glas_v3`). Gilt nicht in `#screen-mehr`, `#screen-plan-detail`, `#screen-runplan-detail`
  (Präfix `html.glas .screen:not(#screen-mehr, #screen-plan-detail, #screen-runplan-detail)`,
  ebenso die Diagramm-Abfragen in app.js), Sportfarben in Wochen- und Kalenderkarten werden weiß (Gym 60 %, Lauf
  ~92 %). Farbig bleiben Warnrot, Wettkampf, Muskelgruppenfarben. `.mehr-card` bleibt weiß.
  `glasAktiv()` liest den Speicher, nicht die Klasse.

### Trainingskalender
- `renderTrainingCalendar(id, cardId)`, drei Instanzen (`cal` Übersicht, `pcal` Plan-Tab,
  `dcal` Gymplan-Detail in `#pd-cal-card` — immer Gymkalender über den Zeitraum des BEARBEITETEN
  Plans, ohne Zeitraum-Wechsler, NICHT einklappbar, Spalten mit „W1 … Wn" beschriftet, zeigt NUR den Plan
  (gewählte Wochentage außer Rest Weeks als Umriss, nichts Absolviertes, keine roten Wochen,
  Kennzahl „N Gym Sessions geplant"; Tipp auf einen Tag nennt in der Fußzeile nur den Plan:
  Gymtag → Vorschau, „Rest Week", „Kein Gymtag gewählt" oder „Kein Gym geplant"). Titel
  (`#dcal-titel`) und Kennzahl (`#dcal-stats`) stehen im Abschnittskopf ÜBER der Karte wie bei
  den anderen Abschnitten. Ohne Kopf in der Karte rückt `.cal-body` oben 7.5px und unten 5px
  heraus, damit sichtbar genau die 14px Kartenpolster bleiben; `--cal-months-gap` dort 2px.
  Bei Plänen, die schon begonnen haben (laufend oder abgeschlossen), blendet ein Tipp auf den
  Titel (`dcal`/`lcal`) die ABSOLVIERTEN Einheiten ein (`toggleKalIst`, `_kalIstAn`, v580):
  Zellen, rote Wochen, Fußzeile wie in den übrigen Kalendern, Kennzahl „x/y"; startet
  ausgeblendet, nicht gespeichert; künftige Pläne ohne Schalter.
  Übersichts-Kalender klappt über `toggleOvKalender` (Karte fährt ganz weg)),
  `_calModus(id)`: Übersicht folgt dem Titel-Filter (Trainings-/Gym-/Laufkalender), Plan-Tab der
  Seite. Startet immer bei „Aktuell" (laufender Plan), Zeitraum-Wechsler Aktuell → Jahre.
- `--cal-cell` / `--cal-gap` sind die einzige Quelle für Maße (JS liest sie, deshalb reine Zahlen).
  Seit v586 steht das Raster samt Marken und Monatsschrift (17) auf 110 % des Ausgangswerts
  (× 1.10 / `--skala`), nicht auf den 115 % der übrigen App. `.cal-scroll` muss
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

- **Anzeige 115 % (v581 110 %, v582 120 %, seit v585 115 %):** Viewport-Angabe
  `initial-scale=1.15` OHNE `width=device-width` (nur so wird die Seitenbreite Gerätebreite/1.15
  = ~326px statt seitlich zu schieben); `--skala` in style.css und der `zoom` der Einstellungen
  MÜSSEN dazu passen. **Einstellungen (`#screen-mehr`) stehen auf 100 %**: ihre Kinder tragen
  `zoom: 1/1.15`, die Schriftstufen dort die alten Werte, `--safe-*` × 1.15 (sonst rutscht der
  Kopf unter die Statusleiste); der Screen selbst bleibt ungezoomt (Zurückwischen);
  ALLE Breitenschwellen sind durch die Skala geteilt (Querformat-Raster ab 890.43px statt 1024,
  auch in den beiden `matchMedia`-Abfragen in app.js; 560→486.96, 480→417.39, 460→400), damit
  sie auf denselben Geräten greifen wie vor der Vergrößerung. Im Browser-Test entspricht ein
  Fenster von 957px einem Gerät mit 1100 Punkten; Sicherung
  `anzeigeGroesseSichern` am Anfang von app.js fällt auf 100 % zurück, falls ein Browser nur
  vergrößert. Alle Maße bleiben in CSS-Pixeln wie bisher. Was auf ~341px nicht passt, wird im
  Block `@media (max-width: 380px)` am Ende von style.css gezielt angepasst (bisher: Übungskarten
  `.aex-v2` breiter, Namen zweizeilig mit Silbentrennung, Knopfzeile enger; Titel der
  Vollbildseiten 28 statt 32; Muskelgruppen-Chips im Gymtag-Detail Schrift 11 — Leonard-Wahl).
  Neue Engstellen dort eintragen; Schrift nur nach Rückfrage verkleinern.
- **Schriftskala, fünf Stufen** (seit v585 als Bildschirmgröße bei 115 %, im CSS
  `calc(Npx / var(--skala))`): `--fs-etikett` 13 · `--fs-neben` 15 · `--fs-text` 18 ·
  `--fs-titel` 19 (Kartentitel) · `--fs-betont` 21 (Original 11/13/15/16/18 × 1.15, aufgerundet). Jede Schriftgröße ergibt auf dem Bildschirm
  eine GANZE Zahl (Leonard-Wunsch, immer aufgerundet); neue feste Größen genauso schreiben. Keine neuen Größen; lieber eine Stufe höher.
  Ausnahmen nur große Einzelanzeigen (und 12px im Quadrat-Wochentag, ausdrücklicher Wunsch).
- Eingabefelder mindestens **16px** (sonst zoomt iOS). Zahleneingabe über den eigenen Zahlenblock
  (`#modal-numpad`, Felder sind `div role="button"`). Schalt-Texte `user-select: none`.
- **Abschnitte statt Kartenköpfe (v570, ganze App):** Jede Karte mit Titel steht in einem
  `.mehr-section`; Titel (11px, fett, Großbuchstaben, weiß auf dem Tab-Hintergrund, in den
  Einstellungen grau) und rechte Angaben (Kennzahl, Datum, Knöpfe) im `.mehr-section-kopf
  .abschnitt-kopf` darüber, Karte `.abschnitt-karte` ohne Außenabstand, Radius `--radius`.
  Statisch im Markup: Kalender `#ov-cal-abschnitt`/`#plans-cal-abschnitt` (Kopf `#cal-kopf`/
  `#pcal-kopf`, gefüllt von `calendarInnerHTML`), Stats. Dynamisch: `_alsAbschnitt(karte, kopf)`
  verschiebt den Kopf nach dem Zeichnen (Rückblick, Wochenkarte, „Heute" der Übersicht,
  Herocards Gym/Laufen — AUSNAHME laufende Gym Session: Name des Gymtags und Uhr bleiben seit
  v587 als Kartentitel IN der Karte, Abschnitt ohne Kopf, 8px Abstand oben, „Diese Woche"). Titel, die Schalter waren,
  bleiben Schalter. Neue Karten mit Titel genauso bauen. Im Glas-Modus bleiben die Karten
  durchscheinend. Ausgenommen: Plan- und Wettkampfkarten in Listen (Name = Eintrag).
- **Kartenpolster 14px**; im Querformat (ab 1024px) steht der seitliche Rand in EINER Selektorliste
  — neue Karten dort eintragen. Senkrechter Abstand kommt immer von der Karte darüber.
- **Sichtbares Kartenpolster überall 14px** (v574 nachgemessen: Inhalt bis Kartenrand oben und
  unten). Wochenplan-Karten (`.plan-card-v2`) haben keine Mindesthöhe mehr, sondern 14px Polster
  und 10px zwischen den Blöcken; die der Übersicht ist fest 111.6px (alle drei Filter gleich,
  kein Springen). Planlisten unten 5.75px (die Wochentagsspalte hält 8.25px für das Heute-Feld
  frei). Herocard-Knöpfe 63.6px. Ausnahme: „Volumen pro Muskelgruppe" ist auf die Höhe der
  Volumenkarte gestreckt und deshalb oben/unten 25px.
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
- **v563 (11.11.2026, Leonard-Wunsch):** Gymkalender im Gymplan-Detail: Tage wieder antippbar
  (Fußzeile mit dem geplanten Gymtag samt Tipp zur Vorschau, Rest Week oder kein Gym); Titel
  und Kennzahl außerhalb der Karte im Abschnittskopf wie die übrigen Abschnitte, Karte so
  breit und rund wie `.mehr-card`; Abschnitt „Wochenplan" steht jetzt über „Wochenvolumen".
  GEMESSEN (375px): Reihenfolge stimmt, Karte bündig mit Wochenplan (12/363px), Titel 11px
  weiß in Großbuchstaben wie „Wochenplan", vier Fußzeilen-Fälle richtig, Kachel → Vorschau
  „Push — Mo., 12. Okt. 2026", Klappen dreimal schnell endet sauber; Übersichts-Kalender
  unverändert; keine Konsolenfehler.
- **v564 (11.11.2026, Leonard-Wunsch):** Gymkalender im Gymplan-Detail nicht mehr einklappbar
  (Titel ist reiner Text, `toggleDetailKalender`/`_pdKalOffen` entfallen). Leerraum entfernt:
  GEMESSEN Kartenkante → Monatsschrift 21.5 → 14.0px, „Rest" → Unterkante 19 → 14.0px, Monat →
  „W1" 9 → 6.0px, „Mo" weiter mittig zur ersten Zeile (0.4px), Karte mit Fußzeile unten 14.0px;
  keine Konsolenfehler.
- **v565 (11.11.2026, Leonard-Wunsch):** Laufkalender im Laufplan-Detail analog zum Gymplan
  (`lcal`, Karte `#lp-cal-card`, `.pd-kal-karte`), über „Geplante Wochenkilometer": nur der Plan
  (Lauftage als Lauf-Umriss, Wettkampftag golden), Spalten „W1 … Wn", Kennzahl „N Läufe geplant",
  Tipp → Fußzeile mit Vorgabe/Notiz/übersprungen, Kachel öffnet `openRunSkip`. GEMESSEN (375px):
  24 Umrisse, 0 gelaufen trotz 9 Läufen, Polster 14/14px, Lauftag Sa dazu → 32; keine Konsolenfehler.
- **v566 (12.11.2026, Leonard-Wahl „Variante D mit Längenbalken"):** Läufe werden im Laufkalender
  geplant (siehe Laufen): Fußzeile mit „‹ Woche N · Spanne · km ›", Zeilen wie früher „Läufe",
  angetippter Tag getönt, Woche im Kalender hervorgehoben (Spalte getönt, „Wn" gefüllt), Wechsel
  per Pfeil oder Wischen wie „Diese Woche" der Seite „Laufen". Abschnitt „Läufe" und
  `toggleRunWoche`/`toggleAlleRunWochen`/`_lpWocheKlappen`/`_laufOffeneWochen` samt CSS entfernt.
  Dabei behoben: `initCalendarResize` zeichnet nur noch bei BREITENänderung neu (vorher schloss
  jede Größenänderung eine offene Fußzeile); `lcal` bleibt mit offener Fußzeile stehen.
  GEMESSEN (375px, 8 Wochen Di/Do/So): 8 Seiten, Tipp W2 → Spalte/„W2" hervorgehoben, km ändern
  speichert und zieht Balken und Wochensumme nach ohne Neuaufbau, Tipp ins Feld schließt nicht,
  Pfeil → W3, Wischen schaltet an der 50-%-Schwelle, Tipp auf W7-Tag springt und tönt die Zeile,
  Tipp daneben schließt ohne Reste; Glas-Modus „Wn" bernstein auf Weiß; keine Konsolenfehler.
  NICHT gesehen: das Wischen mit dem Finger auf dem iPhone.
- **v567 (12.11.2026, Leonard-Wunsch):** In der Fußzeile des Laufkalenders haben die
  Wochentag-Zeichen Form und Einzug wie in „Diese Woche" der Seite „Laufen" (Quadrat 24.93px,
  Radius 4.16px, 3px-Ring, 12px/600; Farbe bleibt Tabfarbe). GEMESSEN (375px), beide Stellen
  gleich: Zeichen 23px vom Kartenrand, Zeichen → Feld bzw. Text 10px, Zeile endet 18px vor dem
  Rand; Zeichen mittig zu den Feldern (0.0px), auch in der getönten Zeile; keine Konsolenfehler.
- **v568 (12.11.2026, Leonard-Wunsch):** Rest Weeks auch im Laufplan, Darstellung wie im
  Gymplan-Detail; Bedeutung: Woche mit reduzierten km (reine Markierung, keine automatische
  Kürzung). GEMESSEN (375px, 8 Wochen): Chips 8, W4 + W7 markiert → gespeichert, „W4"/„W7" in
  der Tabfarbe, zweimal „Rest" unter dem Lauf-Balken, Plan-Tab-Kalender ebenso, Kennzahl
  unverändert 24 Läufe, Fußzeile „Woche 4 · Rest" orange, Woche 5 normal; hervorgehobene
  Rest-Woche „W4" weiß auf Orange (Glas: braun auf Weiß); keine Konsolenfehler.
- **v569 (12.11.2026, Leonard-Wunsch):** „Plan archivieren" und „Plan löschen" in Gym- und
  Laufplan-Detail als Knöpfe oben rechts auf der Titelzeile (Archiv-Symbol, gefüllt wenn
  archiviert; Papierkorb in Rot), Abschnitt „Aktionen" entfernt. GEMESSEN (375px): Zurück-Knopf,
  Titel und beide Knöpfe auf derselben Mitte (43px), Knöpfe 38x38, 14px vom Rand; Archivieren →
  gefüllt, Tooltip „Aus dem Archiv holen", zurück → leer; Löschen fragt nach und führt zur
  Liste; keine Konsolenfehler.
- **v570 (13.11.2026, Leonard-Wunsch/-Entscheidungen):** Darstellung der Plan-Detailansichten
  für die ganze App: Kartentitel als Abschnittstitel über der Karte (siehe Gestaltungsregeln).
  Umfang „alle Karten mit Titel", Glas-Modus bleibt durchscheinend, Titel bleiben Schalter.
  Übersichts-Kalender: eingeklappt nur noch Kopf, Karte weg. `_kalKarteKlappen` entfernt.
  Behoben beim Testen: Titel „Diese Woche" fand seine Karte nicht mehr (`wochenTitelTipp` sucht
  im Abschnitt), Uhr der laufenden Session weiß auf weiß, lange Kennzahl überlappte den Titel
  (Kopf bricht um). GEMESSEN (375px): Übersicht 4 Abschnitte, Kalender auf 327px mit 14px bis
  zur Monatsschrift, Filter/Klappen/Fußzeile/Rückblick ✕ funktionieren; Gym, Laufen (Diagramm per
  Titel, Wischen + Kreispfeil), laufende Session, Plan-Tab Gym/Lauf, Stats (Volumen- und
  Muskelkarte 228/228px); Querformat 1100px ohne Überlauf; Glas-Modus; keine Konsolenfehler.
- **v571 (13.11.2026, Leonard-Wunsch):** Trainingskalender in der Übersicht als letzter Abschnitt
  (vorher zuoberst); im Querformat entfällt sein `order: -1`. GEMESSEN: Reihenfolge Kopf ·
  Trainingswoche · Heute · Kalender in 375px und 1100px, Auf-/Zuklappen funktioniert; keine
  Konsolenfehler.
- **v572 (13.11.2026, Leonard-Wunsch):** Tab-Symbol statt Tabtitel in Übersicht, Training und Plan.
  GEMESSEN (375px): Symbol 32x32 weiß, 14px vom Rand, Mitte auf Höhe der Kopfknöpfe (45px),
  Kopfhöhe unverändert 64px; Seitenwechsel setzt den Screenreader-Namen (Gym/Laufen,
  Gymplan/Laufplan); keine Konsolenfehler.
- **v573 (13.11.2026, Leonard-Wunsch):** Tab-Symbole im Kopf 20 % größer (32 → 38.4px, mittig
  zu den Kopfknöpfen ohne Zusatzabstand). Wochenkarte der Übersicht mit normalem Kartenpolster
  statt Mindesthöhe und verteilten Abständen. GEMESSEN (375px): Symbol 38.4px, Mitte 44.8 gegen
  Knopfmitte 45.0, Kopf 64px; Karte „Trainingswoche" oben/unten 14.0px in allen drei
  Filterzuständen (vorher 36–38 bzw. 21–23px), Höhe 157 → 115/112px; keine Konsolenfehler.
- **v574 (13.11.2026, Leonard-Wunsch):** Trainingswoche springt beim Filterwechsel nicht mehr
  (fest 111.6px). Polster aller Karten auf sichtbar 14px angeglichen: Herocards Gym/Laufen und
  laufende Session (15.4 bzw. 20.6 → 14), „Diese Woche" oben (22 → 14), Planlisten-Karten unten
  (24.7 → 14), Stats „PRs" (30/34 → 14) und „Letzte Gym Sessions" (28/26 → 16/14). Die verteilten
  `auto`-Abstände der Wochenplan-Karten sind entfallen. GEMESSEN (375px): alle Abschnittskarten
  von Übersicht, Gym, Laufen, Plan-Tab, Stats 14/14 (Ausnahme Muskelkarte, siehe oben); drei
  Filterzustände je 111.59px; keine Konsolenfehler.
- **v575 (13.11.2026, Leonard-Wahl „Variante C"):** Kreispfeil „zurück zur aktuellen Ansicht" im
  Abschnittskopf so klein wie die 11px-Angaben (13px, nur das weiße Zeichen, unsichtbarer 37px-
  Tippbereich über `::before`). Vorher 19px hoch — die Kopfzeile wuchs beim Erscheinen um ~5px
  und der Abschnitt sprang (Kalender aufgeklappt, „Diese Woche" Gym/Laufen andere Woche).
  GEMESSEN (375px): Kopfzeile in allen drei Fällen mit und ohne Knopf 15px, Karte bleibt auf
  223.59px; Tipp 10px neben dem Zeichen trifft; Rücksprung zur aktuellen Woche funktioniert;
  keine Konsolenfehler. Muskelkarte bleibt gestreckt (Leonard-Entscheidung).
- **v576 (13.11.2026, Leonard-Wunsch):** In „Diese Woche" (Gym/Laufen) steht der Kreispfeil wie im
  Trainingskalender ganz rechts, 8px hinter dem Datum (vorher links davor). GEMESSEN (375px):
  Knopf bündig am rechten Rand des Kopfes in Kalender, Gym und Laufen; Datum → Knopf 8px; ohne
  Knopf steht das Datum rechtsbündig; Kopf 15px; keine Konsolenfehler.
- **v577 (13.11.2026, Leonard-Wunsch):** Transparenz-Modus: Karten ohne Fläche/Schatten/Rand,
  Inhalte direkt auf dem Tab-Hintergrund (auch Planlisten- und Gymtag-Karten). Gym- und
  Laufplan-Detail übernehmen den Modus gar nicht mehr (Kalender weiß wie die übrigen
  Abschnitte). Punkte im Übungskatalog-Symbol weiß (`color` fehlte, Punkte sind `currentColor`).
  GEMESSEN (375px, Glas an): Übersicht/Plan-Tab ohne Kartenflächen, Symbolpunkte rgb(255,255,255),
  `#lp-cal-card`/`#pd-cal-card` weiß, Kästchen grau, Abschnittstitel weiß; Querformat 1100px;
  keine Konsolenfehler (außer Offline-CDN).
- **v578 (16.11.2026, Leonard-Wunsch):** „Diese Woche" (Gym/Laufen): Wochenpunkte bzw. -leiste
  nur noch in der aufgeklappten Karte, klappen mit dem Diagramm (`_wochenAnzeigeHuelle`,
  `_wochenAnzeigeKlappen`). GEMESSEN (375px, Test-Laufplan 10 Wochen): zu → Hülle `display:none`,
  Liste → Kartenrand 14px; auf → 10 Punkte, 6. aktiv, 19px hoch; dreimal schnell umgeschaltet
  endet sauber; keine Konsolenfehler. Gym nutzt denselben Weg, mangels Testdaten nicht live gesehen.
- **v579 (16.11.2026, Leonard-Wunsch):** Auf „Gymplan" und „Laufplan" steht der laufende Plan als
  eigener Abschnitt „Aktueller Gymplan" bzw. „Aktueller Laufplan" unter dem Kalender; künftige
  Pläne folgen wie bisher ohne Titel. GEMESSEN (375px, je ein laufender und ein künftiger
  Testplan): Kopf 15px, Kopf → Karte 8px wie alle Abschnitte, Karte 12–363px und Radius 14px wie
  der Kalender, nächste Karte 14px darunter; Querformat 1100px und Glas-Modus sauber; keine
  Konsolenfehler.
- **v580 (16.11.2026, Leonard-Wunsch/-Entscheidungen):** Gym- und Laufkalender im Plan-Detail:
  Tipp auf den Abschnittstitel blendet die absolvierten Einheiten ein/aus — bei laufenden und
  abgeschlossenen Plänen, Darstellung wie die übrigen Kalender, startet ausgeblendet.
  GEMESSEN (375px): Gymplan Mo/Sa 8 Wochen → aus „16 Gym Sessions geplant", an 7 gefüllt,
  „7/16 Gym Sessions (44 %)", 3 rote Wochen, Fußzeile zeigt die Session, wieder aus = Plan;
  Laufplan Di/Do/So → an 15 gelaufen, „15/24 Läufe (63 %)", Fußzeile zeigt den Lauf statt der
  Planung; künftiger Plan ohne Schalter; keine Konsolenfehler. Hinweis: Im eingeblendeten Zustand
  zählt ein Wochentag ohne gewählten Gymtag nicht als geplant (wie in allen übrigen Kalendern).
- **v581 (25.11.2026, Leonard-Wahl „Variante A“, „gezielt verkleinern“, „überall“):** Ganze App
  10 % größer über die Viewport-Angabe (siehe Gestaltungsregeln). Einzige Engstelle: Übungskarten
  der laufenden Session (Name „Bankdrüc…“, „Überspringen“ zu breit) → unter 380px wieder so
  breit wie vorher auf 375px. GEMESSEN (Preset mobile, 340px, Maßstab 1.10): Übersicht, Gym mit
  Session, Laufen, Gymplan, Laufplan, beide Plan-Details samt Lauf-Fußzeile, Stats, Übungen,
  Gymtage, Einstellungen, Zahlenblock — automatischer Vergleich alt/neu ohne neue Überläufe oder
  Kürzungen; keine Konsolenfehler. NICHT gesehen: das echte iPhone (ob iOS die Angabe in der
  installierten App übernimmt; sonst greift die Rückfall-Sicherung). iPad im Querformat unter
  ~1130 Punkten zeigt das Querformat-Raster nicht mehr (1024px-Schwelle).
- **v582 (25.11.2026, Leonard-Wahl „120 %“, „immer aufrunden“, „alle Texte“):** Anzeige 120 %
  statt 110 %; alle Schriftgrößen ergeben auf dem Bildschirm ganze Zahlen (Stufen 14/16/18/20/22,
  29 feste Größen ebenso, Diagrammschriften nur mitvergrößert). Engstellen auf 312px: Titel der
  Vollbildseiten („Wettkämpfe“ stieß an die Knöpfe, Planname dreizeilig) → 28; Übungskarten der
  Session 18px Einzug, Namen zweizeilig mit Silbentrennung statt „…“, Knopfzeile 4px Abstand.
  GEMESSEN (Preset mobile, 312px, Maßstab 1.20; Abschnittstitel 11.67px CSS = 14px): Vergleich
  alt/neu für Übersicht, Gym, Gymplan, Laufplan, Plan-Details, Stats, Übungen, Gymtage,
  Wettkämpfe, Einstellungen; Session („Überspringen“ 99/99, Namen 1–2 Zeilen), Zahlenblock passt
  (Fertig 12px über dem Rand); keine Konsolenfehler. Bewusst gelassen: „Aktuelles Körpergewicht“
  bricht in den Einstellungen zweizeilig um. NICHT gesehen: echtes iPhone.
- **v583 (25.11.2026, Leonard-Meldung):** Im Querformat nutzten die Karten nach v582 nicht mehr
  die volle Breite — das Gerät lag mit 120 % unter der 1024px-Schwelle und fiel ins mittige
  520px-Raster. Alle Breitenschwellen durch 1.2 geteilt (CSS und `matchMedia` in app.js).
  GEMESSEN (Fenster 917px = 1100 Punkte bei 120 %): Querformat-Abfrage greift, Karten in
  Übersicht, Training und Plan 14–903px (volle Breite); keine Konsolenfehler. NICHT gesehen:
  das Gerät selbst.
- **v584 (25.11.2026, Leonard-Wunsch):** Kennzahl im Kopf des Kalenders auf „Gymplan“/„Laufplan“:
  „Serie 7W“ statt „Serie 7 Wochen“ (auch bei 1: „Serie 1W“). GEMESSEN (Preset mobile, Serie
  vorgegeben): „24 Gym Sessions · Serie 7W“, „0 Läufe · Serie 1W“; keine Konsolenfehler. Der Kopf
  bricht auf 312px weiterhin zweizeilig um (Titel + Jahr 138px, Kennzahl 164px, Platz 284px).
- **v585 (25.11.2026, Leonard-Wunsch):** Anzeige 115 % statt 120 % (Viewport, `--skala`,
  Schriften neu aus den Originalwerten × 1.15 aufgerundet: 13/15/18/19/21, feste Größen ebenso;
  Breitenschwellen / 1.15). Seite „Einstellungen“ wieder auf 100 % (siehe Gestaltungsregeln).
  Die Schmal-Anpassungen aus v582 (Übungskarten, Titel 28) bleiben. GEMESSEN (Preset mobile,
  326px, Maßstab 1.15): Übersicht Abschnittstitel 13; Einstellungen Titel 26.0, Abschnitt 11,
  Zeile 15, Untertitel 13, Karte 351 Punkte breit, kein seitlicher Überlauf; Fenster 957px:
  Querformat greift, Karten volle Breite, Einstellungen zweispaltig; keine Konsolenfehler. NICHT
  gesehen: echtes iPhone, Zurückwischen der Einstellungen mit dem Finger.
- **v586 (26.11.2026, Leonard-Wunsch):** Trainingskalender: Raster und Monatsangaben auf 110 % des
  Ausgangswerts statt 115 % (Kästchen 30.24 → 28.925px, Abstand 4.32 → 4.132px, Marken/Ringe
  mit, Monatsschrift 18 → 17 auf dem Bildschirm). Laufende Gym Session: „Pausieren“/„Beenden“
  so groß wie die Knöpfe der Übersicht. GEMESSEN (Preset mobile, Maßstab 1.15): Kästchen 33.27
  Punkte (= 30.24 × 1.1), Spalte 38.01, Monat 17, Planbalken bündig mit der ersten Spalte;
  Session-Knöpfe 149.5 × 73.2, Schrift 21 = Übersicht-Knöpfe 149.5 × 73.2, Schrift 21; Karte
  138.3 statt 180.9 Punkte hoch, unten 14px Polster; keine Konsolenfehler.
- **v587 (26.11.2026, Leonard-Entscheidungen „Uhr mit in die Karte“, „a: wie ein Kartentitel“):**
  Laufende Gym Session: Name des Gymtags und Uhr stehen wieder in der Karte (Name 19, fett,
  dunkel, normale Schreibweise; Uhr rechts als Zahl in der Tabfarbe wie vor v570). Die Karte
  bleibt in einem Abschnitt ohne Kopf, 8px unter der Tab-Kopfzeile. GEMESSEN (Preset mobile):
  Name in der Karte, 19 Punkte, rgb(15,23,42), keine Großbuchstaben; Uhr 28; Abstand zur
  Kopfzeile 9.2 Punkte; ohne Session weiter „HEUTE“ über der Karte; keine Konsolenfehler.
- **v588 (26.11.2026, Leonard-Wunsch):** Übungskarten der laufenden Gym Session samt Inhalt auf
  110 % des Ausgangswerts, außer den Kartentiteln (Übungsnamen bleiben 19). Umsetzung: `zoom`
  1.10/1.15 auf die Kinder der Karte, Schriftstufen dort neu aufgerundet aus Original × 1.10.
  GEMESSEN (Preset mobile): Name 19, Nummernkreis 35.2 (= 32 × 1.1), Satzfeld 41.8 hoch
  (= 38 × 1.1), Feldschrift 17, Kopf/Satznummer/Knöpfe/Notiz 15; Karte bleibt 333.6 breit;
  „Schulterdrücken“ wieder einzeilig; Auf-/Zuklappen (65 ↔ 371 px) und Zahlenblock per Tipp ins
  Feld funktionieren; keine Konsolenfehler.
- **v589 (26.11.2026, Leonard-Wahl „Original (100 %)“):** Schrift in den Übungskarten der
  laufenden Session wieder auf den ursprünglichen Werten; Felder, Kreise, Abstände bleiben auf
  110 %, Übungsname 19. GEMESSEN (Preset mobile): Satzfeld 15 (Feld 41.8 hoch), Nummer 15
  (Kreis 35.2), Spaltenköpfe/Satznummern/Knöpfe/Notiz 13, Name 19; keine Konsolenfehler.
- **v590 (26.11.2026, Leonard-Wunsch):** Übungskarten der laufenden Session: Abstände und das
  Häkchen-Feld je Satz wieder in Originalgröße. Umbau: Kinder der Karte auf `zoom: 1/1.15`
  (100 %), nur Satzfelder, Nummernkreis, Haken „Übung erledigt“, Ausklapp-Pfeil, Notizhöhe und
  senkrechtes Knopfpolster gezielt × 1.10. GEMESSEN (Preset mobile): Satz-Häkchen 40 × 40,
  Polster links/oben 14, Zeilenabstand 8 (alle Original); Satzfeld 41.8 hoch, Kreis 35.2,
  Übungs-Haken 44, Pfeil 20.9, Notiz 66 (alle 110 %); Schrift Name 19 / Feld 15 / Kopf 13;
  kein Überlauf; Abhaken eines Satzes und Zuklappen funktionieren; keine Konsolenfehler.
- **v591 (26.11.2026, Leonard-Wunsch):** Die Maße der Übungskarten aus v588–v590 gelten 1:1 auch
  für die Übungskarten im Gymtag-Detail (`#day-ex-list`, Selektoren `:is(#active-ex-list,
  #day-ex-list) .aex-v2`). GEMESSEN (Preset mobile): Werte identisch zur Session — Feld 41.8,
  Kreis 35.2, Pfeil 20.9, Notiz 66, Knopf 32.6 hoch, Polster 14, Zeilenabstand 8, Schrift
  19/15/13, Karte 333.6, kein Überlauf; keine Konsolenfehler. Aufgefallen, nicht geändert: die
  Muskelgruppen-Chips im Gymtag-Detail sind auf 326px gekürzt („Rüc…“, „Schul…“).
- **v592 (26.11.2026, Leonard-Wahl „eine Zeile, Schrift 11“):** Muskelgruppen-Chips im
  Gymtag-Detail wieder alle sieben ungekürzt in einer Zeile: unter 380px Schrift 11 auf dem
  Bildschirm (Original), seitlich 1px statt 2px Innenabstand, Lücke 2px. GEMESSEN (Preset
  mobile): 7 Chips in 1 Zeile, keiner gekürzt („Schultern“ 49/49), bündig mit dem Namensfeld
  (0/0), Chip 33.4 hoch; keine Konsolenfehler.
- **v593 (27.11.2026, Leonard-Meldung):** Im Querformat erschien der Seitenschalter über Gym-/
  Laufplan-Detail. Ursache: Beim Drehen ändert sich die Breite von `#tab-container`, sein
  Scroll-Ereignis meldet den Tab darunter (bzw. durch die neue Breite einen anderen) und
  `seitenleisteAktualisieren` blendete den Schalter ein. Jetzt blendet sie ihn aus, solange
  eine Vollbildseite aus `OVERLAY_SCREENS` sichtbar ist (am Scroll-Handler selbst NICHTS
  geändert). GEMESSEN: echtes Drehen 957 → 500 → 957px mit offenem Gymplan-Detail → Schalter aus;
  nachgestelltes Dreh-Ereignis für alle 9 Vollbildseiten (Plan-, Laufplan-, Gymtag-Detail,
  Gymtage, Übungen, Stats, Wettkämpfe, Favoriten, Einstellungen) → überall aus; nach dem
  Schließen auf dem Plan-Tab wieder sichtbar; keine Konsolenfehler. OFFEN: Dasselbe Ereignis
  setzt weiterhin `currentScreen` und das Tab-Theme auf den Tab darunter (Einstellungen könnten
  nach dem Drehen die Hintergrundfarbe wechseln) — Behebung läge im Scroll-Handler, nur mit
  iPhone-Gegenprüfung.
- **v594 (27.11.2026, Leonard-Auftrag „mit iPhone-Test“):** Ursache aus v593 behoben: Der
  Scroll-Handler von `initTabScrollSync` kehrt sofort zurück, solange eine Vollbildseite sichtbar
  ist (`_vollbildOffen()`, auch von `seitenleisteAktualisieren` genutzt). Beim Drehen bleiben
  `currentScreen`, Theme und Seitenschalter jetzt unverändert. GEMESSEN: nachgestelltes Drehen
  (Scroll auf Tab 0/1/2) bei allen 9 Vollbildseiten → `currentScreen` = Vollbildseite, Theme
  unverändert, Schalter aus; nach dem Schließen Tab, Theme, Scrollposition (1914 = 2 × 957)
  und Schalter korrekt; Gymtag-Detail über Gymtage schließt zurück auf Gymtage; echtes Drehen
  957 → 500 → 957px: bleibt „plan-detail“; normales Wischen ohne Vollbildseite wechselt weiter
  Tab, Theme und Schalter; keine Konsolenfehler. NICHT gesehen: Wischen und Drehen auf dem iPhone.
- **v595 (27.11.2026, Leonard-Wünsche):** Einstellungen: Sync-Log einklappbar wie die Debug-Info
  („Sync-Log anzeigen“, `toggleDriveLog`, startet zu, „Leeren“ im aufgeklappten Teil).
  Übersicht, Trainingskalender: oben rechts ohne laufenden Plan nichts (vorher „24 Gym Sessions ·
  0 Läufe“); mit Plan nur die Quote der Sportart(en), für die ein Plan läuft. GEMESSEN: ohne Plan
  „“; nur Gymplan → Trainingskalender „Gym 0 %“, Gymkalender „0/16 Gym Sessions (0 %)“,
  Laufkalender „“; beide Pläne → „Gym 0 % · Lauf 0 %“, „0/16 …“, „0/4 Läufe (0 %)“; nur
  Laufplan spiegelbildlich; Sync-Log zu → auf (Pfeil 180°) → zu; keine Konsolenfehler. Der iPhone-
  Test zu v594 (Drehen/Wischen) ist laut Leonard bestanden.
- **v596 (27.11.2026, Leonard-Wunsch, 1:1 aus dem Health Command Center):** Transparenz-Knopf mit
  drei Stufen: deckend → halb transparent (wie bis v576) → ganz transparent (wie seit v577) →
  deckend. GEMESSEN (Preset mobile): gespeichertes '1' nach dem Update → Stufe 2 „ganz
  transparent“ (keine Umstellung sichtbar); Tipp 1 → deckend, Karte weiß, Knopf „false“ 18 %;
  Tipp 2 → halb, Karte rgba(255,255,255,.12) mit Schatten, Knopf „mixed“ 28 %; Tipp 3 → ganz,
  Karte transparent ohne Schatten, Knopf „true“ 48 %; Titel je Stufe; Plan-Tab (Kalender- und
  Plankarte) halb transparent im Bild geprüft; Gymplan-Detail bleibt weiß; keine Konsolenfehler.
- **v597 (27.11.2026, Leonard-Wahl „Stil B, Variante A“, Bewegung wählbar mit Vorschlag):**
  Strichmännchen im Übungskatalog (siehe Architektur). 27 Bewegungsmuster inkl. Crunch und
  Unterarmstütz, alle 29 Standardübungen zugeordnet. GEMESSEN (Preset mobile): 29 Figuren im
  Katalog gezeichnet, Start- und Endstellung aller 29 im Raster geprüft; Tipp auf die Figur
  öffnet das Blatt, Zeile bleibt zu; Ziehen dreht (65° → 155°), Animation läuft; Dialog: „Kurzhantel
  Schrägbankdrücken“ → Drücken liegend · Kurzhanteln · Bank schräg, gespeichert; „Superübung“ →
  keine Bewegung, Blatt zeigt neutrale Figur (Bauch violett) und „Bewegung wählen“; Schleife
  stoppt nach dem Verlassen des Katalogs; keine Konsolenfehler. NICHT gesehen: iPhone (Ziehen mit
  dem Finger, Flüssigkeit der Animation).
- **v598 (27.11.2026, Leonard-Wünsche):** Strichmännchen: Drehen in alle Richtungen, Selbstdrehung
  im Uhrzeigersinn im Blatt, Maschinen bewegen sich mit, Kabelzug oben/Mitte/unten wählbar,
  einarmig bei Armübungen (siehe Architektur). GEMESSEN: 16 Fälle im Raster (Pushdown, Latzug,
  Kabelrudern, Kabel-Fly oben/unten/Mitte, Kabel-Curl unten, Curl einarmig, Seitheben einarmig am
  Kabel, Beinpresse, Beinstrecker, Beinbeuger, Schulterpresse Maschine, Blick von oben/unten,
  Face Pull) — Turm, Block hebt sich am Ende, Hebel schwenken; Blatt: Selbstdrehung 30.8° → 23.0°
  in 1.5 s (verdeckte Ansicht), steht beim Festhalten, Ziehen nach unten → Neigung 67°, vier
  Ansichtsknöpfe passen in eine Zeile; Dialog „Einarmiger Kabel Curl“ → Curl · Kabelzug, Felder
  Kabel/Einarmig sichtbar, Bank verborgen, gespeichert mit `einarmig`; keine Konsolenfehler.
  NICHT gesehen: iPhone.
- **v599 (27.11.2026, Leonard-Wunsch):** Neue Bewegungen: Rückenstrecker, Reverse Flies,
  Preacher Curl, Skull Crusher, Beinheben hängend, Decline Crunch, Klappmesser, Seitbeugen
  (Kurzhantel/Kabel/…), Bicycle Crunch, Seitstütz, Bulgarian Split Squat; Latzug mit Ausführung
  „Vor die Brust“/„Hinter den Kopf“, Turm jetzt VOR der Figur. Namensvorschläge für alle
  (23 Testnamen richtig, u. a. „Latzug hinter dem Nacken“ → hinter, „French Press“ → Skull
  Crusher, „Seitbeugen Kabelzug“ → Kabel). GEMESSEN: Start/Ende aller 14 neuen Fälle im Raster,
  Seitstütz aus 4 Richtungen (Start 300°); Dialog Latzug → Feld „Ausführung“ mit 2 Optionen,
  „hinter“ gespeichert, Blatt „Latzug sitzend · Kabelzug · Hinter den Kopf“; keine
  Konsolenfehler. NICHT gesehen: iPhone.
- **v600 (27.11.2026, Leonard-Wunsch):** Bewegungsnamen ohne Klammern (Rückenstrecker, Preacher
  Curl, Klappmesser, Seitstütz); Liste der Bewegungen im Dialog nach Muskelgruppe gefiltert;
  waagerechtes Drehen gespiegelt. GEMESSEN: Bizeps → Curl, Preacher Curl + Klimmzug, Latzug,
  2× Rudern; Trizeps → Drücken liegend, Drücken über Kopf, Pushdown, Trizeps über Kopf, Dips,
  Skull Crusher; Bauch → 8 Bauchbewegungen; „Hammer Curl“ bei Muskelgruppe Brust → Curl unter
  „Gewählt“; 0 Namen mit Klammern; Ziehen 50px nach rechts → 65° → 110°; keine Konsolenfehler.
- **v601 (27.11.2026, Leonard-Wunsch):** Neue Bewegung „Kurzhantel-Rudern einarmig“ (Knie und
  Hand auf der Bank, `kh_rudern`, Vorschlag bei „Dumbbell Row“/„Kurzhantelrudern“); farbige
  Streifen in den Übungszeilen (Katalog und Auswahl „Zum Gymtag hinzufügen“) entfernt;
  Ansichtsknöpfe Vorne/Seite/Hinten/Oben entfernt; feine Tiefensortierung gegen falsches
  Überlappen beim Drehen. GEMESSEN: Rudern Start/Ende aus 6 Richtungen plausibel; Bankdrücken bei
  160°/250° grob gegen fein verglichen (Rumpf, Arm, Hantel jetzt in richtiger Reihenfolge); Blatt
  66 Linienstücke, nur noch Knopf „Bewegung wählen“ (verborgen); 0 Streifen im Katalog; keine
  Konsolenfehler. NICHT gesehen: iPhone.
- **v602 (27.11.2026, Leonard-Meldung mit Bildschirmfoto):** Bei Muskelgruppe Rücken standen auch
  Schultern (Face Pull) und Beine (Rum. Kreuzheben) in der Bewegungsliste — der Filter nahm auch
  fremde Gruppen auf, die den Muskel nur mit einfärben. Jetzt nur noch die eigene Gruppe.
  GEMESSEN: alle 7 Muskelgruppen → je genau eine Gruppe in der Liste (Rücken 8, Brust 3,
  Schultern 5, Bizeps 2, Trizeps 4, Beine 9, Bauch 8); keine Konsolenfehler.
