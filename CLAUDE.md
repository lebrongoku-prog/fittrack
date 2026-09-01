# FitTrack — Projektkontext für Claude Code

Persönliche Fitness-Tracking-PWA von Leonard (iPhone-first), als Ersatz für iPhone-Notizen.
Vanilla JS, **kein Framework, kein Build-Step**. Daten in `localStorage`, optional Google-Drive-Sync.
Wird als statische PWA betrieben (Deploy nach GitHub). Sprache der UI: Deutsch.

Antworten an Leonard bitte auf Deutsch, knapp und direkt. Bei mehrdeutigen Anweisungen präzise Rückfragen stellen.

---

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` (~905 Z.) | Markup, alle Screens + Modals |
| `style.css` (~2090 Z.) | gesamtes Styling + Theme-Variablen |
| `app.js` (~7040 Z.) | komplette Logik — **eine Datei, keine Module** |
| `sw.js` | Service Worker; Cache-Version `fittrack-vNN` (aktuell **v127**) |
| `manifest.json` | PWA-Manifest |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App-Icon (Hantel-Logo, weiß auf blauem Verlauf, zentriert) |

`.claude/devserver.py` = lokaler Test-Server ohne Caching (`python3 .claude/devserver.py`, Port 8123).
Nötig, weil der Browser sonst beim Prüfen weiter die alte `app.js` ausliefert.

**Cruft (in `.gitignore` oder löschen):** `app.js.bak-daymodel`, `Trainings JSONs/`, `prompt-farbuebergang-tabs.md`.

---

## Deploy

Git-Repo: `https://github.com/lebrongoku-prog/fittrack` (Remote `origin`, Branch `main`).
Live via GitHub Pages aus `main` / `/ (root)`: **https://lebrongoku-prog.github.io/fittrack/**
Deploy = `git push`. **Claude committet UND pusht selbst, ohne Rückfrage** (Leonard-Entscheidung, 26.07.2026) — das Personal Access Token liegt im macOS-Keychain, der Credential-Helper liefert es an git, ohne dass es sichtbar wird.

Regel: Nach jeder abgeschlossenen Umsetzung direkt hochladen und das Ergebnis melden. Zwei Ausnahmen, in denen weiterhin gefragt wird:
1. **Nicht lauffähig / nicht geprüft** — Konsolenfehler, unausgeglichene CSS-Klammern, halbfertiger Stand: nicht pushen, sondern melden was klemmt.
2. **Nicht umkehrbare oder heikle Eingriffe** — Überschreiben der Remote-History (`push --force`), Löschen von Branches, versehentlich mitcommittete Zugangsdaten.

---

## ⚠️ Workflow bei JEDER Änderung (wichtig!)

1. **SW-Cache-Version in `sw.js` hochzählen** (`const CACHE = 'fittrack-vNN'` → NN+1). Ohne das liefert die PWA weiter die alten, gecachten Dateien aus — die Änderung erscheint gar nicht.
2. **Alle geänderten Dateien committen und pushen — v. a. `sw.js`** (löst den Cache-Refresh aus). Fehlt `sw.js`, kommt kein Update an.
3. **Verifizieren vor Abschluss:**
   - Bei CSS-Aufräumarbeiten NIE eine Regel nur deshalb löschen, weil EIN Selektor tot ist — Regeln mit
     Selektorlisten (`.a, .b, .c { … }`) verlieren sonst lebende Teile. So verschwand beim Cardio-Ausbau
     `.aex-v2.collapsed .aex-v2-body` und die Übungskarten ließen sich nicht mehr zuklappen.
   - **`node` ist auf dem Rechner NICHT installiert** — statt `node --check app.js` die App über
     `.claude/devserver.py` im Browser laden und die Konsole auf Fehler prüfen (das deckt auch
     Laufzeitfehler ab). Beim Testen vorher Service Worker + Caches löschen, sonst läuft alter Code.
   - CSS-Klammerbalance: `python3 -c "s=open('style.css').read(); print(s.count('{'), s.count('}'))"` (muss gleich sein)
   - gezielte Greps auf neu/entfernte Bezeichner
4. **Updates greifen erst nach dem ZWEITEN App-Neustart** (1. Start installiert den neuen SW, 2. Start aktiviert ihn).
   Die Einstellungen zeigen unter „App-Version" die installierte Cache-Version (`renderAppVersion` liest sie aus `caches.keys()`);
   „Jetzt aktualisieren" (`updateJetzt`) deregistriert den SW, leert die Caches und lädt neu — damit greift ein Update sofort.
   Bei gemeldeten Fehlern zuerst dort die Version abfragen, bevor der Code durchsucht wird.

---

## Architektur

### Daten- & DB-Schicht
- Zentrales `const DB = { … }` kapselt alle `localStorage`-Zugriffe. `markLocalChange()` triggert die Drive-Sync.
- Keys u. a.: `ft_plans`, `ft_trainingdays`, `ft_exercises`, `ft_workouts`, `ft_active`.
- Wichtige DB-Methoden: `getPlans/savePlans`, `getPlan()/savePlan(arr)` (operieren via `editingPlanId` bzw. aktiver Plan), `getTrainingDays/saveTrainingDays`, `getExercises/saveExercises`, `getWorkouts/saveWorkouts`, `getActive/saveActive`, `getProgram/saveProgram`, `getWeekPlan/saveWeekPlan`.

### Referenz-Tag-Modell v2 (zentral!)
- **Trainingstage sind GETEILTE Entitäten** im globalen Store `ft_trainingdays` (analog Übungen). Ein Plan REFERENZIERT Tage über `plan.dayIds` (keine eingebetteten Kopien). Eine Tag-Änderung wirkt in ALLEN referenzierenden Plänen.
- `resolvePlanDays(plan)` löst `dayIds` → Tag-Objekte auf. Archivierte Pläne halten einen eingefrorenen Snapshot in `plan.archivedDays`.
- `getActivePlan()` = aktiver Plan (per Datum) mit aufgelösten `trainingDays`. `getCurrentWeekDays()` = 7 Tage Mo–So mit `dayDone`/`planDay`/`isToday`.
- Multi-Plan: `ft_plans`-Array; aktiver Plan per Datum. `editingPlanId` = aktuell im Plan-Detail bearbeiteter Plan (wird beim Verlassen des Screens zurückgesetzt, `_applyTabState`).

### Pro-Satz-Datenmodell
- Plan-Übungseintrag: `pe.sets = [{reps, weight}]` (weight als String, `''`=leer); Skalare `targetSets/targetReps/targetWeight` bleiben in Sync.
- Helper: `peSets(pe)`, `_syncPeScalars`.
- Vorschau-/Bibliothek-Tabellen zeigen „letzte Einheit gewinnt" via `displaySetsForPe(pe, last)`, gesteuert durch Zeitstempel `pe.setsUpdatedAt` (eigene Eingaben gelten bis zur nächsten abgeschlossenen Einheit).
- `getLastExData(exId)` = Sätze der letzten ABGESCHLOSSENEN Einheit. `buildSetsForExercise` seedet den Workout-Start: die ANZAHL kommt aus dem Trainingstag, die Werte pro Satz aus der letzten Einheit.
- **Satzanzahl wandert zurück in den Trainingstag:** `_setzeSatzanzahl(pe, saetze)` ist die gemeinsame Regel; `migrateSetCountsFromHistory()` hat sie einmalig
  rückwirkend auf alle Trainingstage angewandt (Merker `ft_setcounts_synced`), weil Tage aus der Zeit vor dem Feature sonst weiter die alte Planzahl zeigten.
- `syncSetCountsToPlanDay(planDayId, cleanEx)` läuft in `finishWorkout` und übernimmt die tatsächlich trainierte Anzahl (in beide Richtungen; übersprungene Übungen bleiben unangetastet). Die Abschlussansicht weist die Änderung aus. Ohne das startete die nächste Einheit wieder mit der alten Planzahl — ein dauerhaft ergänzter Satz wäre jedes Mal neu nötig. Achtung: Trainingstage sind geteilt, die Änderung wirkt in allen referenzierenden Plänen.

### Kein Cardio mehr
- Das Cardio-Konzept wurde am 26.07.2026 vollständig entfernt (vorher über `CARDIO_ENABLED=false` nur ausgeblendet).
  Weg sind: 27 Cardio-Funktionen, der Quick-Log-Dialog, die Kraft/Cardio-Umschalter in Übungen-Tab, Statistik-Karten und beiden Auswahl-Dialogen,
  die Typ-Helfer (`exType`, `isCardioEx`, `isWoExCardio`, `planDayIsPureCardio`), das Feld `ex.type` und die `--cardio`-Farben.
- `migrateRemoveCardio()` läuft einmalig beim Start (Merker `ft_cardio_purged`) und räumt die Altdaten auf: Cardio-Übungen aus dem Katalog,
  ihre Verweise in Trainingstagen, ihre Einträge in Einheiten sowie reine Cardio-Einheiten. Eine Kopie liegt unter `ft_cardio_removed`.
  Nötig, weil die App früher beim ersten Start vier Lauf-Übungen anlegte — die wären nach dem Umbau als gewöhnliche Übungen im Katalog aufgetaucht.
- Nachlese: Mit Cardio fielen `getISOWeek`, `getNextPlanDay`, `resumeWorkout` sowie die Konstanten `DRIVE_DATA_VERSION`, `HIST_RANGES`, `WEEKDAYS`,
  `mehrInactivePlanExpanded` und `timerPaused` weg — sie hatten danach keinen Aufrufer mehr. `ft_cardio_removed` wird bewusst nur geschrieben (Sicherung).

---

## Sprache in der Oberfläche

Drei Begriffe, konsequent durchgehalten — nicht mischen:
**Plan** (der Zeitraum) · **Trainingstag** (die wiederverwendbare Vorlage) · **Einheit** (eine absolvierte Trainingseinheit).
„Session" und „Workout" kommen in der UI NICHT mehr vor (Bezeichner im Code heißen weiter `workout`/`wo`).
Nav-Labels: Übersicht · Training · Übungen · Pläne.

---

## UI-Konventionen

- **Tabs (4):** `overview` (Übersicht), `workouts` (Nav-Label „Training"), `exercises` (Übungen), `plans` (Nav-Label „Pläne"). Die Tabs `exercises` und `plans` haben je zwei Seiten über einen `.seg-toggle`: Übungen = Katalog | Stats (`setExercisesView`/`renderExercisesScreen`, Container `#ex-view-list`/`#ex-view-stats`), Pläne = Trainingsplan | Trainingstage (`setPlansView`/`renderPlansScreen`). Vollbild-Overlays: `plan-detail`, `day-detail` und **`mehr`** (Einstellungen — kein Tab mehr, erreichbar über das Zahnrad `.ph-gear` in der Übersicht, zurück via `closeMehr()`). Steuerung über `showScreen(name)` + `_applyTabState(name)`.
- **Kopf des Übungen-Tabs:** Die Knopfleiste rechts (`.ph-actions` / `#ex-head-actions`) wird auf der Stats-Seite per
  `visibility:hidden` unsichtbar geschaltet, NICHT ausgeblendet — sonst schrumpft der Kopf um ihre Höhe (36px gegen 30,5px Titel)
  und der Seitenwechsler springt beim Seitenwechsel nach oben. Unterzeilen (`.ph-sub`) hat dieser Tab keine mehr.
- **Per-Tab-Theming** via `body.theme-*` (Akzent-CSS-Variablen): Übersicht=Cyan, Workouts=Emerald/Grün, Trainings=Amber, Übungen=Marineblau, Mehr=Hellblau.
- **Tab-Hintergrund** = Two-Layer-Crossfade (`.bg-fade-layer`, IDs `bg-fade-a`/`bg-fade-b`), swipe-gebunden; natives CSS-Scroll-Snap fürs Paging. (Umgeht iOS-Safari-Bug bei `transition: background-image` zwischen Gradienten → Hex pro Theme statt `var()`.)
- **`.weitere-btn`** — Ausklapp-Knopf auf farbigem Tab-Hintergrund, uebernommen aus der Health-Command-Center-App
  (28.08.2026). Im Einsatz bei: „Uebung zum Trainingstag hinzufuegen" (Trainings-Tab), den Muskelgruppen-Koepfen im
  Katalog (`.ex-group-btn`) und „Archivierte Plaene" (`.archiv-btn`).
  KEIN Rahmen, dafuer ein weicher Schatten; weisse Schrift auf 12-%-Weiss — setzt einen FARBIGEN Grund voraus, auf
  einer weissen Karte waere er unlesbar (dort dunkle Schrift auf `rgba(0,0,0,.06)`).
  `font:inherit` MUSS vor den Schrift-Angaben stehen, sonst gewinnt die Browser-Standardschrift fuer `<button>`.
  Es MUSS ein `<button>` sein: `initScrollHideNav` nimmt echte Bedienelemente von der „Tableiste wieder
  einblenden"-Erkennung aus — ein `<div>` wuerde die Nav bei jedem Tipp zurueckholen.
  `.archiv-btn` braucht `width: calc(100% - 28px)`: Ein `<button>` schrumpft bei `width:auto` auf seinen Inhalt,
  auch als Block-Element.
  NICHT umgestellt (bewusst, weil nicht beauftragt): das Archiv der Trainingstage (`.plans-list-archive-header`)
  und die Gruppenkoepfe im Uebung-hinzufuegen-Dialog (`.ex-group-title`).
- **Trainingstag-Namen** = kräftiger Text mit 3px-Balken links (`.pd-name`, KEINE Flächenfarbe) via Helper `pd(name)`. Sonderfall `.ex-group-title .pd-name`: im Übungen-Tab stehen die Gruppentitel auf dem farbigen Tab-Hintergrund → dort hell; im Add-Übung-Modal (`.sheet-ex-group`) wieder dunkel.
- **Zugeklappte Uebungskarte** zeigt nur den Namen: `.aex-v2-last` und `.aex-cmp-pr` sind ausgeblendet, und
  `.aex-v2-info` bekommt `min-height:32px` mit zentriertem Inhalt, damit der Name auf einer Linie mit der
  Nummernscheibe steht. Der Kopf bleibt oben ausgerichtet (`align-items:flex-start`) — sonst wanderte die
  Scheibe beim Aufklappen.
- **Übungs-Karten** `.aex-v2` (Vorschau, laufende Einheit, Bibliothek-Tag-Detail) — Pro-Satz-Tabelle als ZEILEN pro Satz (`.aex-v2-srow`: Satz | Wdh. | kg | **Haken**). Notizfeld `.aex-v2-notes` rechts daneben, unter 460px darunter. `.aex-v2-cmp` zeigt Bestleistung + Differenz zur letzten Einheit; **zugeklappt bleibt die Karte ruhig**: `.aex-cmp-pr` ist dann ausgeblendet, eine Notiz-Vorschau gibt es nicht (Leonard-Wunsch).
- **Herocard der Vorschau** zeigt Uebungen, Saetze und — sobald mindestens eine Einheit dieses Trainingstags
  abgeschlossen ist — deren mittlere Dauer (`avgDauerFuerTag(planDayId)`, Einheiten ohne `duration` zaehlen nicht mit).
  Die Dauer steht per `.hero-v2-meta-avg` (`flex-basis:100%`) BEWUSST auf einer eigenen Zeile und ohne Trennpunkt:
  Zu dritt passen die Angaben auf iPhone-Breite nicht in eine Zeile, und beim Umbruch bliebe sonst ein Punkt haengen.
  Die Hoehe der Karte bestimmt die Hantel (`.hero-v2-art`, 72px) — die zweite Zeile kostet daher nichts.
- **Hero der laufenden Einheit** hat nur noch zwei Knoepfe: Pausieren und Beenden, beide `flex:1` in einer Zeile.
  „Naechste Uebung" wurde am 20.08.2026 entfernt — mit ihm fielen `heroActionContinue`, `scrollToNextExercise`,
  `scrollToEx`, die Option `continueOnClick` und die Klassen `.hero-v2-btn-next` / `.two-buttons` weg.
  `expandNextExercise` bleibt: es klappt nach jedem abgehakten Satz weiter (kein Scroll mehr).
- **Laufende Einheit:** `toggleSetDone(ei, si)` hakt einen einzelnen Satz ab (Feld `sets[].done`), hakt die Übung automatisch ab, wenn alle Sätze stehen, und startet die **Satzpause** (`startRestTimer`, Leiste `#rest-bar`) — aber NUR, wenn danach noch ein Satz der Übung offen ist. Nach dem letzten Satz läuft keine Pause mehr (eine ggf. laufende wird gestoppt): dort folgt der Übungswechsel, keine weitere Wiederholung. Die Pause startet IMMER bei 1:30 (`REST_DEFAULT_SEC`); `adjustRest(±30)` und `resetRest()` wirken nur auf die laufende Pause und werden NICHT als Vorgabe gemerkt. Kopf ist im aktiven Zustand kompakt (`.hero-v2.active-mode`), der Wochenplan ist ausgeblendet (`html.wo-running`), beim Scrollen erscheint `#wo-sticky-bar` — aber NUR im Trainings-Tab: Der Riegel
  (`body.theme-workouts #wo-sticky-bar.show`) liegt im CSS, damit sie beim Tabwechsel sofort verschwindet und nicht
  erst beim naechsten Scroll- oder Sekundentakt; `_applyTabState` raeumt zusaetzlich die `.show`-Klasse ab. `ensureActiveExpanded()` hält die nächste unerledigte Übung offen (`_aexUserClosedAll` respektiert bewusstes Zuklappen).
- **Kein Zoom:** `viewport` in index.html trägt `maximum-scale=1.0, user-scalable=no` (greift in der installierten PWA), zusätzlich erzwingt die letzte Regel in style.css `input, select, textarea { font-size: 16px !important }` — unter 16px zoomt iOS beim Fokussieren automatisch hinein. Beim Anheben einer Schriftgröße in einem Eingabefeld also nie unter 16px gehen.
- **Zahlenblock:** Der ganze Block (`#modal-numpad .sheet` und alle Teile) hat `user-select: none`. Ohne das loesten
  zwei schnelle Tipps auf eine Zifferntaste auf iOS die Textauswahl aus — sichtbar als senkrechter Strich
  (Einfuegemarke) in der Anzeige. Bei den +/- Knoepfen trat es nicht auf, weil man die einzeln tippt.
  `#np-value` traegt zusaetzlich kein negatives `letter-spacing` und eine feste `min-width` (die Box soll beim
  Tippen nicht schrumpfen). Beides in Chrome NICHT reproduzierbar — nur auf iOS.
- **Zahleneingabe** (Wdh./kg) läuft NICHT über die iOS-Tastatur: Die Felder sind **`<div role="button">`, kein `<input>`** (ein Eingabefeld würde Fokus bekommen → iOS-Zoom) und tragen `data-np-*`-Attribute; ein Tipp öffnet `#modal-numpad` (`openNumpadFromInput` → `npTap`/`npStep`/`closeNumpad`). Übernahme erst beim Schließen. Erste Ziffer ersetzt den alten Wert (`npState.fresh`), auch nach einem Schnellschritt (+2,5 usw.). Gilt für laufende Einheit (`ctx=active` → `updateSet`) und Vorschau/Trainingstag (`ctx=preview` → `updatePreviewSetTarget`).
- **Abschluss** einer Einheit: `renderWorkoutSummary()` → `#modal-summary` (Dauer, Volumen, Sätze, Übungen, Volumenvergleich, neue Bestleistungen). Der stärkste Kraft-PR steht als dunkle `.pr-card` mit „Als Bild sichern" (`sharePRCard` → Canvas 1080×1350 → `navigator.share`, sonst Download); die restlichen PRs listet „Außerdem" darunter.
- **Bestleistungs-Moment:** `celebratePR(name, weight, prev)` läuft, sobald die ÜBUNG komplett abgehakt ist (in `toggleSetDone`, Zweig `allDone`) — nicht nach jedem Satz und nicht erst in der Abschlussansicht. Gewertet wird der schwerste Satz der Übung gegen `getExercisePR()` (gespeicherte Einheiten). Konfetti (`.pr-burst`, respektiert `prefers-reduced-motion`) + Vibration + Toast; `ex.prCelebrated` verhindert eine zweite Feier derselben Übung.
- **`buildPlanCard(p, onTap, hideToday, hideStatus, hideMeta)`** rendert die Plan-Kachel in BEIDEN Tabs.
  Der Plaene-Tab nutzt sie ueber den Alias `renderRow` — der muss eine Lambda bleiben (`p => buildPlanCard(p, ...)`),
  denn `array.map(buildPlanCard)` reicht (element, index, array) durch: Der Index landete als `onTap` und erzeugte
  ab der zweiten Karte ein totes `onclick="1"` (Fehler gefunden und behoben 20.08.2026).
  `hideMeta` blendet die Laufzeitzeile aus. Der LAUFENDE Plan wird in beiden Tabs identisch gezeichnet
  (ohne Laufzeit, ohne Status-Chip); archivierte und kommende Plaene behalten beides, sonst waeren mehrere
  Karten untereinander nicht unterscheidbar (Leonard-Entscheidung 20.08.2026). Unterschiedlich bleibt nur der
  Tipp: Uebersicht → `showScreen('plans')`, Plaene-Tab → `openPlanDetail(p.id)`.
- **Trainingskalender** (Übersicht, `#ov-cal-card`): `renderTrainingCalendar()` zeichnet 52 Wochen à 7 Kästchen (`.cal-day`).
  KEINE Volumen-Abstufung — zwei Schichten: Fläche (`.planned`) = laut damaligem Plan vorgesehen, Kern (`.done::before`) = tatsächlich trainiert.
  `_calPlanIndex()`/`_calPlanInfo()` rekonstruieren den Plan je Datum aus `startDate`/`endDate`/`weekPlan` ALLER Pläne (auch archivierter — die behalten ihren Wochenplan);
  ohne abdeckenden Plan wird keine Fläche gezeichnet, kommende Tage sind blass (`.future`). Antippen beschreibt den Tag in `#cal-detail`, inklusive der geplanten Einheit.
  Wurde an dem Tag trainiert, fuehrt `.cal-detail-link` („zur Einheit") in die Detailansicht — der Handler MUSS
  `event.stopPropagation()` rufen, sonst raeumt `initCalendarDeselect` die Beschreibung im selben Klick weg.
  Gehoert der Tag zu einem Plan, folgen zwei Zeilen: Planname mit Laufzeit und Wochenzahl (`planWochen` rechnet
  sie aus Start/Ende, falls `weeksTotal` fehlt) sowie der Stand (`planErfuellung`). Eine Hinweiszeile gibt es nicht mehr.
  Zeigt IMMER das laufende Kalenderjahr (1.1.–31.12.); Rand-Tage der ersten/letzten Woche tragen `.outside` (ausgegraut, nicht antippbar).
  Beim Rendern wird zur laufenden Woche gescrollt. Plan-Laufzeiten sind als Rahmen OHNE Füllung um die Wochenspalten gezeichnet
  (`.cal-bands`/`.cal-band`, `z-index:0`, Raster darüber mit `z-index:1`); archivierte Pläne sind blasser.
  Eine Beschriftung mit dem Plannamen unter dem Raster gibt es NICHT mehr (entfernt 20.08.2026) — der Name steht
  beim Antippen eines Tages in der Beschreibung darunter, dort mit der Wochenzahl in Klammern (ohne Datumsspanne).
  Beim Antippen eines Tages innerhalb eines Plans nennt eine zweite Zeile den Stand des Plans (`planErfuellung`): absolvierte Einheiten gegen
  bis dahin geplante Trainingstage samt Prozent. Bezug ist immer nur die Vergangenheit (laufender Plan: bis heute), Einheiten an nicht geplanten
  Tagen zählen mit — ein nachgeholtes Training soll die Quote nicht drücken (beides Leonard-Entscheidung). Rahmen und Beschriftung nutzen dieselbe Farbe
  (`--cal-plan-color` auf `.cal-scroll`, dasselbe Grün wie die trainierten Kerne) — die Farbe liegt im CSS, nicht im JS.
  ACHTUNG Zeitzone: Die Spalte eines Datums wird über GANZE TAGE gerechnet (`spalteFuer`, `Math.round` auf Tagesdifferenz), nicht über Millisekunden-Division —
  zwischen Winter- und Sommerzeit fehlt sonst eine Stunde und ein Datum genau auf der Wochengrenze landet eine Woche zu früh.
  Die Kästchengröße ist dynamisch: `renderTrainingCalendar` misst die freie Breite und verkleinert die Zelle von 16px bis minimal 13px,
  wenn das Jahr sonst knapp nicht passt (Querformat). Gesetzt wird sie als CSS-Variable `--cal-cell` auf der Karte; `SPALTE` (Zelle + 3px Abstand)
  steuert Plan-Balken und Scrollposition. `initCalendarResize()` rechnet beim Drehen neu, `initCalendarDeselect()` hebt die Tagesauswahl auf,
  sobald außerhalb von `.cal-scroll` getippt wird.
  Zwei Instanzen: Übersicht (`cal`/`#ov-cal-card`) und Pläne-Tab (`pcal`/`#plans-cal-card`), Markup aus `calendarInnerHTML(id)`.
  `.cal-scroll` setzt `overflow-x: auto` UND `overflow-y: hidden`: Ohne die zweite Angabe macht der Browser aus der
  Y-Achse ebenfalls `auto` und das Raster liesse sich senkrecht verschieben. Das Polster muss dabei OBEN UND UNTEN
  je 4px betragen — `.cal-band` reicht mit `top:-3px; bottom:-3px` ueber das Raster hinaus, und ohne das untere
  Polster schneidet `overflow-y: hidden` die untere Kante der Plan-Umrandung ab.
  Beide Karten sind per ID von der 520px-Grenze ab 560px ausgenommen, damit im Querformat mehr Wochen ohne Scrollen passen.
- **Verlaufsdiagramme in der Einheiten-Detailansicht:** Jede Uebung bekommt ihr Diagramm ueber
  `exChartHTML(exId, canvasId, {collapsible:true})` — dieselbe Funktion wie Katalog und Uebungs-Modal, nur mit
  klickbarer Ueberschrift. Standardmaessig ausgeklappt; `toggleChartBlock` schaltet eines, `toggleAllHdCharts`
  alle (Beschriftung folgt via `_syncHdToggleAllLabel` dem echten Zustand, auch nach Einzel-Klicks).
  Die Diagramme liegen in `_hdCharts` (ein Array, nicht eine Instanz) und werden von `_renderHdCharts()` neu
  gezeichnet — beim Aufklappen NOETIG, weil ein verstecktes Canvas keine Breite hat und Chart.js sonst die
  alten Masse behaelt. Der Knopf „Alle ein-/ausklappen" sitzt absolut im `.hd-rail` (top/right 0), damit er
  rechtsbuendig unter der Saetze-Kachel und auf Hoehe des ersten Uebungstitels steht, ohne die Zeitleiste
  nach unten zu schieben. Er braucht dabei zwingend ein `z-index`: Die `.hd-step`s sind fuer die Nummernscheibe
  ebenfalls positioniert und stehen im Markup NACH dem Knopf — ohne eigene Ebene liegt der erste Uebungstitel
  darueber und schluckt den Tipp (gefunden 25.08.2026).
  Die Satz-Kaestchen stehen IMMER oben in ihrer Zeile und bewegen sich beim Auf-/Zuklappen der Diagramme nicht
  (Leonard-Entscheidung 28.08.2026). Eine frueher eingebaute Ausrichtung ihrer Unterkante auf die X-Achse des
  Diagramms (`_richteHdSaetzeAus`, per gemessenem `margin-top`) wurde wieder entfernt: Sie liess die Kaestchen beim
  Umschalten springen. Beides zusammen geht nicht — die Achse liegt tiefer als der Zeilenanfang.
  TESTHINWEIS: `btn.click()` umgeht die Trefferpruefung und haette das nicht gezeigt — bei absolut
  positionierten Bedienelementen immer mit `document.elementFromPoint` pruefen, wer an der Stelle wirklich liegt.
- **„Details" in der Uebungskarte** ist ein Knopf in der Aktionsleiste (`.aex-v2-details`, ganz rechts, graue Box mit
  Akzentfarbe). Er klappt das Verlaufsdiagramm AM ENDE der Karte auf (`.aex-v2-chart`, unter „+ Satz / − Satz").
  Standard ist zu; `aexChartOffen` (Set der Kartenschluessel) haelt den Zustand, `toggleAexCollapse` loescht den
  Eintrag beim Zuklappen der Karte — das Diagramm ist danach wieder geschlossen (Leonard-Wunsch 28.08.2026).
  Gezeichnet wird ueber `_renderAexCharts()` nach jedem Rendern der Kartenliste; die Instanzen liegen in `_aexCharts`.
  Die vier Knoepfe passen nur einzeilig, weil `.aex-v2-actions .btn-sm` Polster und Schrift verkleinert.
  Das frueher hier verlinkte Modal `#modal-ex-detail` wurde ersatzlos entfernt.
- **Verlauf je Übung** (Übungen-Tab, aufgeklappte Karte): `getExerciseHistory` liefert pro Einheit `maxW` (schwerster Satz) UND `reps` (Summe aller Wiederholungen); `exHistPoints(exId, mode)` filtert daraus die Punkte des gewählten Modus (Einträge ohne Wert fallen raus — Körpergewichtsübungen haben kein Gewicht). Umschalter `.ex-chart-toggle` (Gewicht/Wdh.), Auswahl je Übung in `ft_ex_chart_modes` — bewusst ein eigener localStorage-Key statt eines Felds an der Übung, damit reine Anzeige-Einstellungen nicht in den Trainingsdaten und der Drive-Sicherung landen. `setExChartMode` frischt nur die betroffene Karte auf (ein Neuaufbau der Liste würde sie zuklappen). `.ex-chart-toggle` nutzt die Pillen-Optik von `.stats-mode-toggle` mit; die frühere `html.no-cardio`-Ausnahme ist mit dem Cardio-Ausbau entfallen.
- **Muskel-Landkarte:** `renderMuscleMap()` zeichnet zwei SVG-Silhouetten (`muscleMapSvg`, vorne/hinten) mit nach Volumenanteil abgestufter Deckkraft plus Zahlen-Legende.
- **Löschen ist zweifach abgesichert:** (1) `withUndo(label, fn, afterRestore)` + `showUndoToast()` — sichert die Stores vorab, „Rückgängig" 6 s lang. (2) **Papierkorb** (`ft_trash`, `trashPut/trashRestore/trashDeleteForever/emptyTrash/purgeTrash`, Liste via `renderTrash()` im Einstellungen-Overlay): gelöschte Einheiten, Pläne, Trainingstage und Übungen liegen `TRASH_KEEP_DAYS` = 30 Tage dort. `_snapshotStores` sichert `ft_trash` mit, sonst läge ein Objekt nach „Rückgängig" doppelt vor.
- **Auswertungen** (Volumenentwicklung, Volumen pro Muskelgruppe, Letzte Einheiten, PRs und Bestleistungen) liegen auf der Stats-Seite des Übungen-Tabs, NICHT mehr in der Übersicht. „Letzte Einheiten" (`renderRecentSessions`, Karte `#ov-recent-sessions-card`) ist am 20.08.2026 dorthin gewandert — die ID behielt ihr `ov-`Präfix. `renderStatsPage()` füllt sie. Der Trainingskalender wird dagegen von `renderOverview()` gerendert — er gehört zur Übersicht. ACHTUNG: Vor dem Umbau hing sein Aufruf in `renderHomeStats()`; wandert er wieder dorthin, bleibt die Kalenderkarte in der Übersicht leer.
- **PR-Liste:** hervorgehoben ist der Bestwert selbst, die Steigerung steht grau in Klammern in der Unterzeile (`.pr-v2-delta`).
  Ein Tipp auf die Zeile öffnet über `showHistDetailForEx(exId, bestTs)` die Einheit, in der der Rekord AUFGESTELLT wurde (nicht die
  neueste mit dieser Übung) und hebt die Übung dort per `.hd-step-hl` farbig umrandet hervor.
- **Querformat (ab 1024px):** Uebersicht ist ein 2-Spalten-Grid — Wochenplan links, Herocard rechts in DERSELBEN
  Zeile (seit 20.08.2026, vorher spannte die Herocard ueber beide Spalten). `align-content: start` ist Pflicht,
  sonst verteilt das Grid die uebrige Bildschirmhoehe auf die Zeilen und zwischen den Karten klaffen ~100px.
  Die Uebungsliste (`#active-ex-list`) fuellt SPALTENWEISE (`grid-auto-flow: column`): links 1-4, rechts 5-8.
  Dafuer setzt `_setzeUebungsSpalten` beim Rendern die Inline-Variable `--ex-rows` = ceil(Anzahl/2) — ohne sie
  wuesste das Grid nicht, wo die erste Spalte endet. Im Hochformat wirkungslos (dort kein Grid).
  ACHTUNG: iPhone-Querformat ist maximal 932px breit, diese Regeln greifen dort also NICHT.
- **Detailansicht einer vergangenen Einheit** (`showHistDetail(i, highlightExId)` → `#modal-hist-detail`) ist ein ZEITSTRAHL
  (Variante C, Leonard-Entscheidung 20.08.2026): Kopf mit drei Kacheln (Dauer / Volumen / Sätze, `.hd-stats`), darunter eine
  senkrechte Linie (`.hd-rail`) mit nummerierten Scheiben in der Muskelgruppenfarbe (`.hd-step-num`, `--mc` je Schritt).
  Je Übung: Name + PR-Chip, eine Fortschrittszeile gegen die letzte Einheit derselben Übung (`_fortschrittZeile`,
  `_maxDerVorherigenEinheit` — ws ist neueste-zuerst, ältere stehen also HINTER dem Index), Sätze als Chips, Notiz.
  Saetze stehen untereinander, die Notiz rechts daneben (`.hd-cols`) — derselbe Aufbau wie in der aufgeklappten
  Uebungskarte, inklusive Umbruch untereinander unter 460px. Saetze ohne Gewicht zeigen nur die Wiederholungen. Die Hervorhebung sitzt auf `.hd-step-body`, NICHT auf `.hd-step` —
  sonst liefe der Rahmen um die Nummernscheibe herum, die links außerhalb auf der Linie sitzt.
  Der Einzug von `.hd-rail` (30px) muss zur `left: -30px` der Scheiben passen. Ersetzt die alten `.hist-ex-*`-Klassen.
- **Dezimaltrenner ist der PUNKT, nicht das Komma** (Leonard-Wunsch, 20.08.2026) — gilt fuer die ganze Oberflaeche:
  `fmtKg`, `fmtVol`, `volAchsenWert`, Zahlenblock-Anzeige und dessen Schnellschritt-Tasten (`+2.5`); auch die Dezimaltaste
  selbst traegt einen Punkt. Deshalb bewusst KEIN `toLocaleString('de-DE')` fuer Zahlen — das setzt ein Komma.
  Die `replace(',', '.')`-Stellen beim EINLESEN bleiben: Altbestaende koennen noch Kommawerte enthalten.
- **Volumenangaben:** `fmtVol(kg)` liefert Volumen ab 1000 kg in Tonnen („2,8 t"), darunter in Kilogramm — inklusive Einheit,
  Aufrufer hängen also KEIN „ kg" mehr an. Genutzt in Volumenentwicklung (Tooltip, Badge), Muskel-Legende und Abschlussansicht.
  Das Badge am letzten Punkt (`lastPointLabel`) wird per `Math.min/max` in `chart.chartArea` eingepasst — ohne das ragte
  es im Zeitraum 1 Jahr rechts aus der Karte heraus. Der Text folgt dem Kasten (`x + w/2`), nicht dem Punkt.
  Kg/Saetze ist ein zweiteiliger Umschalter (`#vol-unit-toggle`, `setVolumeUnit(unit)`) in der Pillen-Optik von
  `.stats-mode-toggle` — vorher ein Knopf, der bei jedem Tipp umschlug.
  Die Y-Achse nutzt `volAchsenWert(v, inTonnen)`: die Einheit gilt für die GANZE Achse (entschieden am größten Wert),
  sonst stünde „500 kg" neben „1,5 t". Der frühere `fmtNum` („2.8k") ist damit entfallen.
- **Diagramm-Tooltips** (Volumenentwicklung und Verlauf je Übung) laufen auf `interaction: { mode:'index', intersect:false }` —
  ein Tipp irgendwo in der Spalte unter dem Punkt genügt. Ohne das musste der 5px-Punkt exakt getroffen werden.
- **Wochentagsspalte im Kalender steht AUSSERHALB des Scrollers** (Umbau 01.09.2026). `.cal-body` ist die aeussere
  Zeile: links die feste `.cal-daylabels`, rechts `.cal-scroll` (`flex:1 1 auto; min-width:0` — ohne `min-width:0`
  waechst ein Flex-Kind auf seinen Inhalt statt zu scrollen). Die Kaestchen verschwinden dadurch an der linken Kante
  des Scrollers wirklich, statt von einer Flaeche ueberdeckt zu werden.
  Vorher war die Spalte `position: sticky` INNERHALB des Scrollers und malte eine deckende Maske (`::before`).
  Das brauchte eine Farbe — im Transparenz-Modus gibt es keine, dort schienen die Kaestchen durch die Spalte
  hindurch. Mit dem Umbau entfielen die Maske, `--cal-mask-over` und der Einzug der Monatszeile.
  Masse als Variablen in `:root` — beim Aendern NUR die Variable anfassen:
  `--cal-pad-x` (1px, seitliches Polster) → `.cal-body`, `.cal-scroll`, `.cal-detail`;
  `--cal-pad-y` (4px, Polster oben/unten im Scroller) → `.cal-scroll` UND der obere Abstand der Wochentagsspalte;
  `--cal-label-w` (20px) / `--cal-label-gap` (3px) → Breite der Spalte und ihr Abstand zum Scroller;
  `--cal-band-over` (3px) = Ueberstand der Plan-Umrandung ueber das Raster → `.cal-band` top/bottom, muss in
  `--cal-pad-y` passen, sonst schneidet `overflow-y: hidden` die Kante ab;
  `--cal-months-h` (13px) = feste Hoehe der Monatszeile, `--cal-months-gap` (8px) = ihr Abstand zum Raster.
  Beide zusammen (plus `--cal-pad-y`) sind der obere Abstand der Wochentagsspalte — nur so liegen „Mo" und die
  erste Rasterzeile auf einer Linie. Deshalb eine FESTE Hoehe statt einer gemessenen Schrifthoehe.
  ACHTUNG Platzrechnung: `renderTrainingCalendar` misst `scrollerEl.clientWidth`. Der ist bereits um die
  Wochentagsspalte verkuerzt — sie darf dort NICHT noch einmal abgezogen werden (frueher `- 23`).
  `.cal-body` ist ein GRID mit `minmax(0, 1fr)`, bewusst kein Flex: Ein Flex-Kind mit `flex-basis:auto`
  bemisst sich zuerst an seiner max-content-Breite, der Browser rechnet also bei jedem Layout die volle
  Breite aller 371 Kaestchen aus und staucht den Scroller danach wieder zusammen — das Wischen stockte.
  `.cal-scroll` traegt zusaetzlich `overscroll-behavior-x: contain`: Ohne das reicht die Wischgeste an
  `#tab-container` (Snap-Scroller) weiter, der Tab wandert mit, rastet zurueck und die Kalenderbewegung
  bricht ab. Preis dieser Entscheidung: Aus dem Kalender heraus laesst sich der Tab nicht wechseln.
- **Kalenderkarten sind von der Tipp-Animation ausgenommen** (`#ov-cal-card:active`/`#plans-cal-card:active`
  → `transform: none`, dazu `transition: none`). Ein `transform` auf dem Vorfahren bricht auf iOS die laufende
  Wischgeste in einem Scrollbereich darin ab — das Raster liess sich dadurch gar nicht mehr waagerecht scrollen
  (gefunden 01.09.2026). Gilt fuer jede Karte, die kuenftig einen eigenen Scrollbereich bekommt.
- **Lesehilfe im Trainingskalender:** `.info-btn` neben der Kennzahl oben rechts (`.cal-head-right` fasst beide
  zusammen) oeffnet `#modal-cal-info`. Die Farb-Legende steht NUR dort, nicht mehr in der Karte — dadurch ist die
  Karte rund 100px flacher. Das Polster des Fussbereichs sitzt auf `.cal-detail`, damit die Karte ohne ausgewaehlten
  Tag direkt unter dem Raster endet.
- **Lesehilfe „Volumen pro Muskelgruppe":** `.info-btn` neben dem Kartentitel öffnet `#modal-muscle-info`.
  `margin-right:auto` hält den Knopf am Titel — `.chart-card-v2-head` verteilt seine Kinder sonst auf beide Ränder.
- **Katalog-Filter „nur aus dem aktiven Plan":** `toggleExPlanFilter()` / `exPlanFilterAn` / `exIdsImAktivenPlan()`,
  Knopf `#ex-plan-filter-btn` links neben „Alle ein-/ausklappen". Der Zustand wird BEWUSST nicht gespeichert — ein Filter, Beim Einschalten werden die Gruppen mit aufgeklappt
  (`collapsedExGroups.clear()`) — sonst bliebe die verkuerzte Liste hinter zugeklappten Kopfzeilen verborgen.
  der einen Neustart überlebt, lässt den Katalog später unerklärlich leer wirken.
- **Übungskatalog:** nur noch Gruppierung nach Muskelgruppen — Sortierung nach Trainingstagen samt Umschalter wurde entfernt.
- **Übersicht:** Sicherungs-Status als Chip im Kopf neben dem Titel (`renderBackupLine` → `#ov-backup-line` in `.ph-right`, Klasse `.backup-chip`; kurze Texte wegen des knappen Platzes, ausführliche Fassung im `title`-Attribut), Hinweis vor Plan-Ende (`renderPlanEndNotice` + `extendActivePlan`), Wochenserie (`getWeekStreak` → `.ppv-streak`), Einstieg ins freie Training (`startFreeWorkout`, Einheit ohne `planDayId`).
- **Ende der Satzpause** meldet sich dreifach: Vibration, Ton und sichtbare Meldung „Pause vorbei" (5 s, `.done`).
  Grund fuer den Aufwand: `navigator.vibrate` gibt es auf dem iPhone NICHT (Safari unterstuetzt die Vibration-API auf
  keiner Plattform), und der Ton schweigt bei aktivem Klingelschalter. Der Ton ist ein Zweiklang aus dem WebAudio-
  Oszillator (`playRestDoneSound`); `initAudioUnlock` faengt jeden `pointerdown` ab und weckt den Audio-Kontext —
  iOS gibt Ton nur nach einer echten Nutzergeste frei. KEINE Audiodatei, damit nichts nachgeladen werden muss.
- **Satzpause** (`#rest-bar`) hat exakt die Geometrie der Bottom-Nav: volle Breite, Hoehe `--nav-h`, gleiche Notch-Polster.
  Nav sichtbar → sitzt buendig darueber; Nav ausgeblendet → `.nav-hidden` setzt sie auf `bottom:0` und ergaenzt das
  `--safe-b`-Polster, sie nimmt also den Platz der Nav ein. `setNavHidden` in `initScrollHideNav` schaltet die Klasse
  auf Nav, Laufanzeige UND Pausenleiste.
  Die Pille steht IMMER darueber: ein einziger Wert (`--nav-h * 2 + --safe-b + 10px`) genuegt fuer beide Nav-Zustaende,
  weil ihre eigene `.nav-hidden`-Verschiebung sie um genau die Nav-Hoehe mitnimmt.
- **Laufanzeige waehrend einer Einheit** (`#workout-active-bar`, sichtbar nur AUSSERHALB des Workouts-Tabs):
  schwebende Pille statt vollem Streifen (Leonard-Entscheidung 20.08.2026). Der Rahmen bleibt volle Breite, nimmt aber
  keine Tipps an (`pointer-events:none`) — nur `.wab-pill` ist antippbar, damit der Inhalt daneben bedienbar bleibt.
  Inhalt: ruhender Punkt, Zeit, Satzstand (`_woSatzStand`, abgehakte/gesamte Saetze), Pfeil.
  Der frueher dauerhaft pulsierende Punkt ist ersetzt durch den **blinkenden Doppelpunkt der Uhr** (`.wab-colon`, 1 s).
  ACHTUNG: `syncWorkoutActiveUI` laeuft JEDE SEKUNDE. `_woTimerRender` schreibt deshalb NICHT das innerHTML neu, sondern
  nur den Text der Ziffernfelder — ein neu erzeugtes Element wuerde die Blink-Animation jede Sekunde neu starten.
  Die Struktur wird nur bei einem Formatwechsel (m:ss <-> h:mm:ss) neu gebaut.
  Positionen: normal `nav-h + safe-b + 10px`, mit laufender Satzpause `+58px`, bei ausgeblendeter Nav um `nav-h` nach unten
  (bewusst NICHT zusaetzlich um die 10px, sonst klebt sie am Rand).
- **Erledigt-Box der Uebungskarte** (`.aex-v2-done-box`) ist 40x40 wie die Satz-Haken (`.aex-v2-setcheck`) — gleiche Groesse,
  gleicher Radius, gleiches Icon; beide werden mit feuchten Haenden getroffen.
- **Wochenplan** ist in ALLEN DREI Tabs dieselbe Karte (`buildPlanCard`): Uebersicht, Trainings-Tab (`#wo-week-card`,
  gefuellt von `renderWorkoutWeekStrip`) und Plaene-Tab. Nur zwei Dinge unterscheiden sich, beide ueber `opts`:
  Im Trainings-Tab waehlt ein Tipp den Tag AUS (`opts.dayOnTap: 'selectWorkoutDay'`) und der gewaehlte Tag wird
  markiert (`opts.selectedIdx` → `.ppv-col.selected`) — die Auswahl steuert dort, welcher Tag darunter erscheint.
  Sonst springt der Tipp per `jumpToWorkoutDay` in den Trainings-Tab.
  Der frueher eigene Streifen (`buildWpCol`/`buildWpInfo`/`renderNext7Strip`/`selectOverviewDay`, Klassen `.wp-*`)
  wurde am 20.08.2026 entfernt — er hatte danach keinen Aufrufer mehr. ACHTUNG beim Aufraeumen: Die Regel fuer den
  Erledigt-Haken war eine Selektorliste (`.ppv-col.done …, .wp-col.done …`) — dort durfte nur der tote Teil weg.
- **Wochenplan in der Plan-Detailansicht:** `.wpe-list`/`.wpe-row` = eine Zeile pro Wochentag (nicht 7 Spalten), damit lange Tagnamen vollständig umbrechen können; unsichtbares `<select>`-Overlay pro Zeile weist den Tag zu.
- **Löschen** = „Bearbeiten"-Modus (Kästchen auswählen → „Löschen (N)" → Sicherheits-Dialog) via `_delCtx`/`_delSel`/`buildDelEditList`; inline ✕ fragt ebenfalls nach. **Hinzufügen** = Multi-Select-Modals mit „Hinzufügen (N)".
- **Bottom-Nav**: Scrollen blendet sie nur AUS (ab 60px Scrolltiefe, Runterwisch > 5px) und NIE wieder ein — auch nicht
  am Seitenanfang (Leonard-Entscheidung, 20.08.2026; vorher holte sie jeder Hochwisch zurueck). Zurueck kommt sie
  ausschliesslich durch einen Tipp auf eine nicht-interaktive Flaeche (`e.composedPath()`-Check in `initScrollHideNav`).
  ACHTUNG beim Testen: Der Scroll-Handler laeuft in `requestAnimationFrame` — in einem versteckten Tab feuert der nie,
  die Sperre `_navTickingByTab` bleibt dann auf `true` haengen und JEDES weitere Scroll-Ereignis wird verworfen.
- Übersicht hat eine Plan-Dashboard-Karte (`buildPlanCard`) + „Letzte Sessions" + Volumen-Chart (`renderVolumeChart`, Chart.js).

## Google-Drive-Sync
- **Token-Anfragen müssen IMMER enden.** `driveRequestToken` hat `error_callback` + 45-s-Timeout (`DRIVE_TOKEN_TIMEOUT_MS`), weil Google Identity Services in der installierten PWA gelegentlich weder `callback` noch `error_callback` aufruft. Ohne das blieb die Promise offen, `driveSync` erreichte sein `finally` nie, `driveSyncInFlight` blieb `true` — die Sicherung „lief" endlos und jeder weitere Versuch wurde abgewiesen, bis die App neu gestartet wurde. Beim Ändern dieses Codes die Zeitgrenze NICHT entfernen.
- `driveSync` erkennt zusätzlich hängende Läufe (`driveSyncStartedAt` + `DRIVE_SYNC_STUCK_MS` = 2 min) und lässt danach einen neuen Sync zu.
- Scheitert die stille Verlängerung, setzt `driveSetReauthNeeded(true)` einen sichtbaren Zustand: Chip im Kopf zeigt „Anmeldung nötig", die Drive-Karte fordert zum Neuverbinden auf. `driveSetToken` löscht das Flag wieder.
- Token-Ablauf liegt in `sessionStorage` (`ft_drive_token_exp`), nicht nur in der Variablen `driveTokenExpiry` — sonst gilt der Token nach jedem App-Start als abgelaufen.
- Optional; `collectLocalData` / `driveApplyCloudData` (inkl. `ft_trainingdays`). Auth-Hosts sind vom SW-Cache ausgenommen.
- `markLocalChange()` stößt die Sicherung bei JEDER Änderung an (entprellt), zusätzlich läuft sie beim App-Start (`driveInit`). Früher lief sie nur am Ende einer Einheit.
- Status auf der Übersicht: `renderBackupLine()`; nach zehn Einheiten ohne Sicherung fragt `maybePromptBackup()` einmalig nach (`ft_backup_prompted`).

---

## Gotchas
- **Eine Einheit gehört zu genau EINEM Wochentag:** `wo.dayIdx` (0=Mo … 6=So) wird beim Start gesetzt, `woDayIdx(wo)` liest ihn (Rückfallebene `startTs`). NIEMALS den Wochentag über `weekPlan.findIndex(planDayId)` bestimmen — bei einem Trainingstag, der zweimal pro Woche im Plan steht, trifft das immer den ersten Treffer.
- `activeOnSelected` in `renderWorkoutsScreen` prüft NUR `woDayIdx(active) === selectedWorkoutDayIdx` — bewusst nicht zusätzlich gegen `planDay`. Sonst verschwindet eine Einheit, die an einem Ruhetag läuft (Training verschoben), komplett aus dem Tab.
- Freies Training hat `planDayId === null`; Anzeigepfade müssen darauf vorbereitet sein (`activeOnSelected` in `renderWorkoutsScreen`).
- `DB.getPlan()`/`getWeekPlan()` fallen ohne aktiven Plan auf hartkodierte `DEFAULT_PLAN`/`DEFAULT_WEEKPLAN` zurück → in Anzeige-Pfaden `getActivePlan()`/`getCurrentWeekDays()` nutzen (sonst Phantom-Tage).
- Volumen-Chart gruppiert je nach gewaehltem Zeitraum (`histRangeDays`): 7 Tage = pro Tag (Wochentag),
  30/90 Tage = pro Woche (Datum des Wochenbeginns; ab 90 Tagen nur der Monatswechsel beschriftet),
  1 Jahr = pro Monat. Frueher immer Kalenderwochen mit Label "WNN" und hart auf 8 Punkte gekappt —
  dadurch zeigte "Letztes Jahr" nur zwei Monate. `autoSkip` ist im Wochen-Modus AUS, weil dort
  Labels absichtlich leer sind; sonst an. X-Achse aufsteigend (aelteste links).
- Aufräum-Stand (25.08.2026): CSS ist frei von toten Klassen — 55 Regeln ohne Markup entfernt (alte Ziel-Tabelle der
  Uebungskarten `.aex-target-*`/`.aex-v2-target-*`, Uebungs-Tableiste `.ex-tab-v2-num`/`-name`, `.next7-*`-Streifen,
  `.weekplan-*`, `.plan-ex-row`, `.pause-btn-v2`, `.num-badge`, `.tc-card-head` u. a.).
  PRUEFVERFAHREN, das dabei taugt: Eine Regel darf nur weg, wenn JEDER ihrer Selektoren mindestens eine Klasse
  enthaelt, die in app.js/index.html nirgends vorkommt. Ein Selektor wie `.aex-v2.done .aex-v2-target` ist tot,
  obwohl `.aex-v2` lebt. Umgekehrt bleiben gemischte Listen stehen und es faellt nur der tote Selektor heraus
  (so geschehen bei `.plan-ex-item…, .plan-ex-row…, .aex-v2…`). Zur Laufzeit zusammengesetzte Praefixe
  (`theme-`, `plan-status-`, `drive-log-`, `hd-delta-`, `ex-stat-`, `np-`, `mmap-`, `k-`) sind NICHT tot.
- Aufräum-Stand (26.07.2026): 16 Funktionen ohne Aufrufer, der tote Wochentag-Dialog (`modal-weekday-pick`) und 95 CSS-Regeln ohne Markup wurden entfernt.
  Beim Suchen nach totem CSS beachten: Klassen wie `theme-*`, `plan-status-chip-*` oder `drive-log-*` werden zur Laufzeit zusammengesetzt und sind NICHT tot.

---

## Nützliche Befehle
```bash
node --check app.js
python3 -c "s=open('style.css').read(); print(s.count('{'), s.count('}'))"
grep -n "fittrack-v" sw.js
```
