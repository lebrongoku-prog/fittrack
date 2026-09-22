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
| `sw.js` | Service Worker; Cache-Version `fittrack-vNN` (aktuell **v380**) |
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

### Gymtage werden AUSSCHLIESSLICH in ihrer Detailansicht angepasst
13.09.2026, Leonard-Entscheidung. Vorher gab es VIER Stellen, an denen sich ein Trainingstag
aendern liess — und weil Tage GETEILT sind (siehe Referenz-Tag-Modell), wirkte jede davon in
allen Plaenen, die den Tag verwenden. Wer auf der Seite „Gym" eine Zahl antippte, aenderte
seinen Plan, ohne es zu merken. Jetzt gibt es genau EINE Bearbeitungsflaeche:
**die Detailansicht des Trainingstags** (`#screen-day-detail`, `renderLibDayDetail`).

ZWEI Wege fuehren dorthin, beide oeffnen dieselbe Seite:
1. Plan-Tab → Seite „Gymtage" → Kachel antippen.
2. Plan-Tab → Seite „Gymplan" → Plan oeffnen → Abschnitt „Trainingstage" → Zeile oder ✎.

Weg 2 braucht einen RUECKWEG: `_applyTabState` raeumt `editingPlanId` ab, sobald man das
Plan-Detail verlaesst. `openLibDayDetail(id, 'plan-detail')` merkt sich den Plan in
`_libDayZurueck`, `closeLibDayDetail` setzt ihn vor dem `showScreen` wieder — ohne das
landete der Zurueck-Pfeil in der Plan-LISTE, und der Plan waere nicht mehr der bearbeitete.
Gilt auch fuer die Wischgeste vom linken Rand (`initOverlayEdgeSwipe` ruft dieselbe Funktion).
Ein NEUER Trainingstag aus dem Plan heraus (`addNewPlanDayFromScratch`) fuehrt ebenfalls
direkt dorthin — ein leerer Tag ohne Weiterleitung waere eine Sackgasse.

WAS DABEI ENTFALLEN IST:
- **Der Bearbeiten-Dialog des Plan-Details** (`#modal-plan-day`, „‹Name› bearbeiten") samt
  `openPlanDayModal`, `savePlanDay`, `renderPlanDayExList`, `removePlanEx`, den fuenf
  `planEx*`-Drag-Funktionen, `editingDayIdx`, dem delEdit-Kontext `'planday-ex'` und den
  CSS-Regeln `.plan-ex-item` / `.plan-ex-handle` / `.plan-ex-del`.
  Das Uebung-hinzufuegen-Modal (`modal-add-to-plan`) hatte deshalb zwei Ziele; `planAddTarget`
  und der 'planday'-Zweig sind mit weg, es schreibt nur noch in `editingLibDayId`.
- **Die Bearbeitbarkeit der Vorschau auf der Seite „Gym"** (Trainings-Tab). Dieselbe Karte
  wird dort jetzt NUR ZUM LESEN gezeichnet: `renderPreviewWorkout` haengt Zahlenblock und
  die Knoepfe „+ Satz" / „− Satz" / „Uebung entfernen" an `mode === 'libday'`. Die Zellen
  tragen `.aex-v2-inp-lesen` (kein Zeigefinger, kein Aufleuchten beim Beruehren) — ohne das
  versprachen sie eine Eingabe, die es dort nicht mehr gibt. „Details" bleibt.
- **Das Mitschreiben beim „+ Uebung hinzufuegen" der LAUFENDEN Einheit.** Die Uebung landet
  nur noch in dieser einen Einheit; vorher trug sie sich zugleich in den Trainingstag ein und
  tauchte damit in jedem kuenftigen Training dieses Tags auf.

WAS BLEIBT — die EINZIGE Stelle, die den Tag ausserhalb seiner Detailansicht noch aendert:
`syncSetCountsToPlanDay` beim BEENDEN einer Einheit uebernimmt die tatsaechlich trainierte
Satzanzahl (Leonard-Bestaetigung 13.09.2026). Das ist keine Bedienoberflaeche, sondern haelt
den Plan auf Stand; ohne sie startete die naechste Einheit wieder mit der alten Planzahl. Die
Abschlussansicht weist die Aenderung aus.
NICHT betroffen sind ausserdem: Tage dem Plan hinzufuegen und aus ihm entfernen, die Zuordnung
zu Wochentagen im Wochenplaner und der Bearbeiten-Modus „Trainingstage aus Plan entfernen"
(Kontext `'plan-days'`) — das ist Planpflege, kein Aendern des Tages.

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
Nav-Labels: Übersicht · Training · Übungen · Plan.
Das Wort **„Ruhetag" kommt in der UI NICHT mehr vor** (06.09.2026, Leonard-Wunsch): Ein Tag ohne
Krafttraining heisst „Kein Gym" bzw. „Kein Gym geplant", einer ohne Lauf „Kein Lauf" bzw.
„Kein Lauf geplant". Die kurze Form steht dort, wo der Platz knapp ist (Herocard, Wochenplaner),
die lange in Beschreibungen (Kalender-Fusszeile). Im CODE heissen Variablen und Kommentare
weiter „Ruhetag" — das ist der eingebuergerte Begriff fuer den Zustand.
Seiten im Plan-Tab: **Gymplan** · **Gymtage** · **Laufplan** (umbenannt 01.09.2026) ·
**Wettkämpfe** (neu 06.09.2026).
Seiten im Trainings-Tab: **Gym** · **Laufen**.

---

## UI-Konventionen

- **Tabs (4):** `overview` (Übersicht), `workouts` (Nav-Label „Training"), `exercises` (Übungen), `plans` (Nav-Label „Pläne"). Drei davon haben Unterseiten, umgeschaltet über den `.seg-toggle` — der steht seit dem 08.09.2026 nicht mehr im Kopf des Tabs, sondern unten am Bildschirm in der **Seitenleiste** (`#seitenleiste`, siehe eigenen Abschnitt): Training = Gym | Laufen (`setWorkoutsView`), Übungen = Katalog | Stats (`setExercisesView`/`renderExercisesScreen`, Container `#ex-view-list`/`#ex-view-stats`), Pläne = VIER Seiten (`setPlansView`/`renderPlansScreen`).
  **Die vier Plan-Seiten stehen in EINER Tabelle** (`PLANS_SEITEN`, 06.09.2026 — vorher drei Zweige nebeneinander): Schluessel → Knopf-Id, Titel, Listen-Id und Sportsymbol. `renderPlansScreen` laeuft nur noch darueber, `setPlansView` prueft dagegen. Wer eine fuenfte Seite ergaenzt, traegt sie dort ein und legt Knopf plus Liste im Markup an; alles Weitere folgt.
  Der Kalender gehoert nur zu `plans` und `runplans`; `days` und `races` haben keinen.
  Die BESCHRIFTUNG setzt `renderPlansScreen` aus `PLANS_SEITEN` — die Knoepfe im Markup sind deshalb LEER.
  Bei VIER Knoepfen traegt der Umschalter `.seg-vier` (12px statt 13px, engeres Polster): Auf 375px bleiben je Knopf 82px, und „Wettkämpfe" braucht bei 13px 84px. So sind alle vier gleich breit und einzeilig. Die Enge hat der Umzug nach unten NICHT geloest — der Schalter ist dort genauso breit wie frueher im Kopf (die ZWEISEITIGEN sind seither 30 % schmaler, `.seg-zwei`; der vierseitige nutzt die volle Zeile). Eine FUENFTE Seite passt weiterhin nicht hinein; sie wuerde jetzt aber sauber mit „…" gekuerzt, statt den Schalter zu sprengen (`min-width: 0`, siehe Seitenleiste).
  **KEINE Sportsymbole im Seitenschalter** (06.09.2026): Sie standen einen halben Tag lang erst am Tab-Titel, dann im Schalter, und sind auf Leonards Wunsch wieder entfallen. Mit Symbol brauchte „Wettkämpfe" 12+4+66 = 82px, der Schalter musste auf 11.5px und die Knoepfe waren nicht mehr gleich breit (79/79/79/89) — ein Flex-Kind schrumpft nicht unter seinen Inhalt. Der Platzgrund ist mit der Seitenleiste entfallen, der Wunsch bleibt. `.ppv-name-ic` LEBT weiter: Die Wochenplan-Karten tragen ihre Symbole unveraendert. Vollbild-Overlays: `plan-detail`, `day-detail` und **`mehr`** (Einstellungen — kein Tab mehr, erreichbar über das Zahnrad `.ph-gear` in der Übersicht, zurück via `closeMehr()`). Steuerung über `showScreen(name)` + `_applyTabState(name)`.
- **Kopf des Übungen-Tabs:** Die Knopfleiste rechts (`.ph-actions` / `#ex-head-actions`) wird auf der Stats-Seite per
  `visibility:hidden` unsichtbar geschaltet, NICHT ausgeblendet — sonst schrumpft der Kopf um ihre Höhe (36px gegen 30,5px Titel)
  und der Seitenwechsler springt beim Seitenwechsel nach oben. Unterzeilen (`.ph-sub`) hat dieser Tab keine mehr.
- **Per-Tab-Theming** via `body.theme-*` (Akzent-CSS-Variablen): Übersicht=Cyan, Workouts=Emerald/Grün, Trainings=Amber, Übungen=Marineblau, Mehr=Hellblau.
- **Tab-Hintergrund** = Two-Layer-Crossfade (`.bg-fade-layer`, IDs `bg-fade-a`/`bg-fade-b`), swipe-gebunden; natives CSS-Scroll-Snap fürs Paging. (Umgeht iOS-Safari-Bug bei `transition: background-image` zwischen Gradienten → Hex pro Theme statt `var()`.)
  **Der TRAININGS-Tab wird GRAU, wenn auf der gezeigten Seite heute nichts ansteht**
  (`'workouts-grau'`, `themeBgKey()`, `trainingHeuteGeplant()`, Leonard-Wunsch 08.09.2026):
  gleicher Winkel, gleicher Hell-Dunkel-Sprung, nur ohne Farbe. Je SEITE getrennt — kein Gym,
  aber ein Lauf geplant → Seite „Gym" grau, Seite „Laufen" gruen. Das Gruen ist ein
  Versprechen; ohne Training gibt es keins.
  Bezug ist HEUTE, nicht der im Wochenplan gewaehlte Tag: Der Hintergrund ist ein ruhiges
  Tagessignal und soll nicht bei jedem Tipp auf einen anderen Wochentag umspringen.
  ZWEI Fallen: (1) Der Schluessel aus `themeBgKey` wird AUCH als `dataset.theme` der Layer
  benutzt — er MUSS die Variante enthalten, sonst haelt der Crossfade Grau und Gruen fuer
  denselben Zustand und zeichnet beim Wechsel nicht neu. (2) `setWorkoutsView` ruft
  `setThemeBackground` selbst nach; ohne das bliebe der Hintergrund nach dem Seitenwechsel
  auf der Farbe der alten Seite stehen.
- **`.weitere-btn`** — Ausklapp-Knopf auf farbigem Tab-Hintergrund, uebernommen aus der Health-Command-Center-App
  (28.08.2026). Im Einsatz bei den Muskelgruppen-Koepfen im Katalog (`.ex-group-btn`) und „Archivierte Plaene"
  (`.archiv-btn`). Sein erster Einsatzort, „Uebung zum Trainingstag hinzufuegen" auf der Seite „Gym", ist am
  08.09.2026 ENTFALLEN (siehe unten).
  KEIN Rahmen, dafuer ein weicher Schatten; weisse Schrift auf 12-%-Weiss — setzt einen FARBIGEN Grund voraus, auf
  einer weissen Karte waere er unlesbar (dort dunkle Schrift auf `rgba(0,0,0,.06)`).
  `font:inherit` MUSS vor den Schrift-Angaben stehen, sonst gewinnt die Browser-Standardschrift fuer `<button>`.
  Es MUSS ein `<button>` sein: `initScrollHideNav` nimmt echte Bedienelemente von der „Tableiste wieder
  einblenden"-Erkennung aus — ein `<div>` wuerde die Nav bei jedem Tipp zurueckholen.
  Der Archiv-Knopf ist am 05.09.2026 aus `.weitere-btn` ausgeschieden — siehe „Archiv-Knopf"
  weiter unten.
- **Archiv-Knopf: EINE Bauform fuer alle drei Listen** (`.plans-list-archive-header`,
  vereinheitlicht 05.09.2026 nach dem Vorbild des Gymtage-Archivs). Weisse Karte mit Schatten,
  Beschriftung links (`.plan-day-collapse-label`), Anzahl als Pille (`.plan-day-collapse-count`)
  und Ausklapp-Pfeil rechts. Im Einsatz auf drei Seiten mit je eigener Beschriftung:
  „Archivierte Gympläne" (Gymplan) · „Archivierte Gymtage" (Gymtage) · „Archivierte Laufpläne"
  (Laufplan). Alle drei sind `<button>` und brauchen deshalb `width: calc(100% - 28px)` — bei
  `width:auto` schrumpft ein Button auf seinen Inhalt, auch als Block-Element; die 28px sind die
  beiden 14px-Raender. Vorher war es auf zwei Seiten ein `.weitere-btn.archiv-btn` (transparent,
  Pfeil links neben der Beschriftung, mittig) und nur im Gymtage-Archiv die weisse Karte.
  Der Zustand steht als KLASSE `.expanded` UND als `aria-expanded` am Knopf — die Drehregel
  fragt beides ab, damit sie unabhaengig vom Aufrufer greift.
  Im TRANSPARENZ-MODUS traegt er dieselben Werte wie `.plan-list-row` daneben
  (`rgba(255,255,255,.12)` plus die vier Farbtoken). Ohne diese Regel blieb er als einziges
  Element der Seite deckend weiss stehen und sprang heraus (Leonard-Meldung 09.09.2026) —
  er ist eben eine Karte, und Karten sind dort durchscheinend.
  Die ANZAHL-PILLE braucht dabei eine EIGENE Angabe: Sie liest `background: var(--card)`,
  und `--card` steht in der Regel darueber nicht mit drin. Sie blieb deshalb deckend weiss
  — mit einer 65-%-weissen Ziffer darin, also ein leerer weisser Fleck (Leonard-Meldung
  09.09.2026 mit Screenshot). Jetzt `rgba(255,255,255,.25)` mit weisser Ziffer. Betraf
  ALLE DREI Knoepfe, sie teilen sich die Klasse.
- **SCHRIFTSKALA: FUENF STUFEN FUER ALLEN TEXT** (21.09.2026, Leonard-Wunsch „zu viele
  verschiedene Schriftgroessen"). Vorher standen im Stylesheet 32 Werte: jeder Pixel von 10 bis
  18 belegt, dazu krumme Werte aus den 10-/20-%-Vergroesserungen (12.1, 14.3, 15.4, 15.6, 15.84,
  17.6 …), die neben ihrem runden Nachbarn nicht zu unterscheiden waren.
  Die Stufen stehen als Variablen in `:root`:
  `--fs-etikett` 11px (Chips, Pillen, Grossbuchstaben-Beschriftungen, Tableiste, Achsen) ·
  `--fs-neben` 13px (Metazeilen, Hinweise, Notizen, kleine Knoepfe, Seitenschalter) ·
  `--fs-text` 15px (Listen, Werte, Knoepfe, Wochentage, Kalender) ·
  `--fs-titel` 16px (Kartentitel) · `--fs-betont` 18px (Kennzahlen, Herocard-Knoepfe).
  AUSNAHMEN nur fuer grosse Einzelanzeigen: Tabtitel (26/28), Uhr der Einheit (24px, vorher
  24.2), Zahlenblock, Bestleistungskarte, Kacheln der Abschlussansicht, Leer-Symbol.
  REGELN: Keine neuen Groessen ausserhalb der Skala. Wer etwas groesser will, geht EINE STUFE
  hoeher, statt um Prozente zu skalieren. Die Rolle entscheidet, nicht der alte Zahlenwert —
  Chips sind Etikett, auch wenn sie vorher 12.1px hatten.
  UMSTELLUNG IN ETAPPEN, je einzeln ausgeliefert:
  1. **Uebersicht und Training** (v372): Wochenplan- und Kombi-Karte, Herocard (auch laufende
     Einheit), Kalender (auch der im Plan-Tab — dieselben Klassen), Uebungskarten samt
     Verlaufsdiagramm (auch im Katalog), Satzpause, Kopfleiste der Einheit, Laufanzeige-Pille,
     Seite „Laufen", Tableiste, Toast, Sicherungs-Chip, `.btn`/`.btn-sm`, zweiseitiger
     Seitenschalter. Achsenschrift des Uebungsdiagramms (Chart.js, fest im JS) 10 → 11px.
  2. **Uebungen und Plan** (v373): Katalog (Muskelgruppen-Knopf, Uebungszeilen, Kennzahlen,
     Verwendung, Aktionsknoepfe), Stats-Seite (PR-Liste, Letzte Einheiten, Muskel-Landkarte,
     Zeitraum-Knopf, Leermeldungen auch inline im JS/HTML), Gymplan- und Laufplan-Liste,
     Gymtage-Kacheln, Archiv-Knoepfe, Statuschips, Wettkaempfe (Liste und Zeitstrahl) und die
     drei Vollbild-Ansichten Plan-Detail, Gymtag-Detail, Laufplan-Detail (Wochenplan-Editor,
     Loesch-Modus, Formularbeschriftungen, Laufplan-Einheiten).
     MIT DRIN, weil dieselben Klassen: `.mehr-section-title` (Abschnittsbeschriftung in
     Grossbuchstaben, 12 → 11px) und `.mehr-row-label`/`-sub` — die stehen auch in den
     EINSTELLUNGEN, dort hat sich das also schon mit geaendert.
     ROLLE VOR ZAHL: Chips werden Etikett (Tag-Chip in der Uebungszeile und Pille „Steht noch an"
     12 → 11px), Beschriftungen in Grossbuchstaben ebenso (`.ex-item-body-label`).
     AUSNAHME: Der Seitenschalter mit VIER Seiten bleibt bei 12px (`.seg-vier`). „Wettkämpfe"
     misst bei 13px 77px, der Knopf hat auf 375px 79px — mit zusammengerueckten Knoepfen blieben
     2px Luft je Seite, im hervorgehobenen Knopf sah das gedraengt aus.
     NACHGEZOGEN: In den Einheiten des Laufplans (`.lp-einheit`) liefen Datum („28.09.26" =
     46.8px) und „km" (15.7px) bei 11 statt 10px ueber — Tages- und km-Spalte sind jetzt 48/16
     statt 44/14px, die Notiz-Vorschau 75 statt 81px. Datum und Wochenzahl in der Datenzeile
     des Laufplans (`.lp-datenzeile`) sind 13px statt 14 (15 passt nicht, siehe dort).
     GEMESSEN (375px und 1100px, Vorher/Nachher): Gymtage-Kacheln bleiben 113px, „Ganzkörper"
     einzeilig; Seiten und Karten wachsen nur um Bruchteile (Plan-Detail +10px Gesamthoehe).
     VORHER SCHON DA, nicht angefasst: „+ Zu Trainingstag"/„+ Zu Trainingsplan" (Katalog und
     Gymtag-Detail) laufen 3 bzw. 6px ueber ihren Knopf, „Schultern" in der Legende der
     Muskel-Landkarte 5px.
  3. **Dialoge und Einstellungen** (v374): alle Blaetter (Titel 17 → 18px, Eintraege,
     Formularbeschriftungen), Abschlussansicht samt Bestleistungskarte, Einheiten-Detail
     (Zeitstrahl, Satz-Chips, Kacheln), Lauf-Detail, Zahlenblock (Titel, Unterzeile,
     Schnellschritt-Tasten), Lesehilfen, Papierkorb, Cloud-Sync, Laufdaten-Karte, die
     Absatztexte der Dialoge (inline in index.html) und die Leermeldungen.
     `.hd-stat` (Kachel: Wert 16 → 18px, Beschriftung 9.5 → 11px) steckt AUCH in den
     Wettkampf-Karten des Plan-Tabs — die Karte mit Werten ist dadurch 4.5px hoeher.
     Bei Eingabefeldern (`.ex-notes-area`, `.ex-search-bar`, `.program-form-row input/textarea`)
     standen 14/15px, die nie wirkten (die Regel `input, select, textarea` erzwingt 16px) —
     dort steht jetzt 16px, sichtbar aendert sich nichts.
  ERGEBNIS: Von 32 verschiedenen Groessen sind 15 uebrig. Davon sind Text: die fuenf Stufen
  plus 12px im vierseitigen Seitenschalter. Der Rest: Symbolzeichen (14px in zwei 30px-Knoepfen,
  16/18/22px ✕ › + ✓), Eingabefelder (16px Pflicht) und die grossen Einzelanzeigen
  (20/24/26/28/38/40/44px). FESTE px-WERTE SIND DAMIT NUR NOCH AUSNAHMEN — wer eine neue Groesse
  braucht, nimmt eine Stufe.
  UEBERLAEUFE, die schon VOR der Skala da waren und mit Etappe 3 behoben sind:
  - „+ Zu Trainingstag" (Katalog, 3px) und „+ Zu Trainingsplan" (Gymtag-Detail, 6px):
    `.ex-item-actions button` hat `flex: 1 1 auto` statt `flex: 1` — die Knoepfe sind nicht
    mehr gleich breit, sondern so breit wie ihre Beschriftung plus einem gleichen Anteil am Rest.
  - „Schultern" in der Legende der Muskel-Landkarte (5px): Einzug der Figuren 2 statt 10px,
    dazu „…" als Notbremse am Namen.
  - Knopfzeile im Wettkampf-Dialog (Loeschen · Abbrechen · Speichern, 2px): Innenabstand 10
    statt 18px, alle drei gleich breit.
  GEMESSEN (375px, Vorher/Nachher): 24 Dialoge und die Einstellungen ohne Ueberlauf, Blaetter
  0–23px hoeher bzw. die beiden Lesehilfen 33/38px flacher (Fliesstext 13.5 → 13px); Etappe 1
  und 2 nachgemessen unveraendert sauber; keine Konsolenfehler.
  Aeltere Groessenangaben in dieser Datei (17.6, 15.84, 15.6, 15.4, 14.3, 12.1px …) sind
  Vorgeschichte.
  SICHTBARSTE AENDERUNGEN in Etappe 1: Nebentexte 12 → 13px (Zuletzt-Zeile, Satzkoepfe, Notizen,
  Kennzahl des Kalenders, Laufliste), Tableiste 10 → 11px, Herocard-Knoepfe 17.6 → 18px,
  Kalender-Fusszeile 16 → 15px (sie ist Text, kein Titel), Statuschip der Planliste 12.1 → 11px.
  NACHGEZOGEN: Die Aktionsleiste der Uebungskarte (vier Knoepfe) passte bei 13px nicht mehr —
  „» Überspringen" lief um 2px ueber. Ihr seitlicher Innenabstand ist deshalb 7 statt 9px.
  GEMESSEN (375px, Vorher/Nachher aller Karten): Wochenplan-, Kombi- und Herocards bleiben
  157.3px, nirgends Ueberlauf (auch Querformat 1100px); „Freies Training" und „Einheit starten"
  passen bei 18px zweizeilig in den 155x64-Knopf, „Lauf erledigt" einzeilig; „Mo" steht weiter
  buendig zur ersten Rasterzeile.
  FOLGE fuer die Kopfzeile des Uebersichts-Kalenders: Die Kennzahl ist breiter, der Gymkalender
  bricht jetzt auch mit kleinen Zahlen („2/9 Einheiten (22 %)") zweizeilig um. Mit realistischen
  Zahlen gemessen: Trainings- und Gymkalender zweizeilig (46px Kopf), Laufkalender
  („12/15 Läufe (80 %)") weiter einzeilig (19px) — dasselbe Muster wie vorher.
- **Alle Kartentitel sind 16px** (01.09.2026, Vorbild „Trainingskalender"): `.chart-card-v2-title`,
  `.plan-section-head h3`, `.ppv-name`, `.scv2-title`, `.hero-v2-title` (auch in `rest-mode` und
  `active-mode` — deren eigene Groessenangaben sind entfallen). `.mehr-section-title` ist KEIN
  Kartentitel, sondern eine Abschnittsbeschriftung ueber der Karte, und bleibt.
- **Muskelgruppen-Knopf ist wie die eingeklappte Uebungskarte gebaut** (`.ex-group-btn` gegen
  `.ex-item-head`): gleiche Hoehe (`--ex-row-h`, 44px als `min-height` auf beiden), gleiches
  seitliches Polster (14px — davon haengt ab, wie weit der Pfeil vom Rand steht) und gleicher
  Abstand zur Farbmarke (12px). Der Farbpunkt ist 12px (01.09.2026 um die Haelfte vergroessert).
  **Der Knopf zeigt NUR den Namen, auch ausgeklappt** (21.09.2026, Leonard-Wunsch). Vom
  01.09. bis 21.09.2026 erschien im ausgeklappten Zustand die Anzahl in Klammern („(4)"); sie ist
  samt ihrer Regel `.ex-group-btn .count` entfallen. NICHT betroffen: die Muskelgruppen-Titel in
  den Dialogen „Uebung hinzufuegen" (`.ex-group-title`) — dort steht die Anzahl weiter. Dasselbe gilt fuer „Archivierte Plaene" im Plaene-Tab, der
  ausserdem die Tipp-Animation der Karten traegt und dasselbe 14px-Polster bekommen hat.
  **Der Muskelgruppen-Knopf hat KEINEN Ausklapp-Pfeil** (01.09.2026) — ebensowenig die Uebungen im
  Katalog. Ob eine Gruppe offen ist, zeigt die Liste darunter. Damit sind `.weitere-pfeil` und
  `.ex-item-chev` restlos entfallen.
  **Nur der Archiv-Knopf im Plaene-Tab traegt einen Pfeil**, und zwar dieselbe Klasse wie die
  Uebungskarten des TRAININGS-Tabs (`.aex-v2-chev` mit `AEX_CHEV_SVG`) — bewusst kein Nachbau, damit
  Form, Groesse und Drehung nicht auseinanderlaufen (32x32-Box, 19px-SVG, 14px vom Rand). Angepasst ist
  nur die Farbe (`color: inherit`, weil der Knopf auf farbigem Grund steht); gedreht wird ueber
  `[aria-expanded="false"]` statt ueber `.collapsed`. Pfeil und Beschriftung stehen ZUSAMMEN mittig
  im Knopf (beide im Fluss, Zentrierung aus `.weitere-btn`); der Pfeil lag zwischenzeitlich absolut
  am linken Rand, das wurde am 01.09.2026 zurueckgenommen. Als Variable, weil der Knopf eine andere
  Schriftgroesse traegt (16px gegen 15px) und sonst 5px flacher waere. Sein Pfeil ist in Form und
  Groesse der `.ex-item-chev` nachgebaut: immer „▾", 14px, per `[aria-expanded="true"]` um 180 Grad
  gedreht (die frueher im JS getauschten Zeichen „▸/▾" sind weg). Die Farbe bleibt weiss —
  der Knopf steht auf farbigem Grund. `.archiv-btn` behaelt den alten Pfeil.
- **EIN Ausklapp-Pfeil fuer die ganze App** (`.aex-v2-chev` + `AEX_CHEV_SVG`). Am 01.09.2026 aus
  Uebungskarten und Muskelgruppen ENTFERNT, am 05.09.2026 auf Leonards Wunsch wieder eingefuehrt —
  diesmal mit festen Regeln, die ueberall gelten:
  1. Er steht GANZ RECHTS im Kopf bzw. Knopf (in den Uebungskarten des aktiven Modus also hinter
     dem Erledigt-Kaestchen).
  2. Zugeklappt zeigt er nach UNTEN.
  3. Aufgeklappt dreht er sich um 180 Grad — das Menue oeffnet nach unten, der Pfeil zeigt dorthin.
  Am 05.09.2026 auf ALLE neun Ausklapp-Stellen der App ausgeweitet — es gibt seither keine
  Textpfeile („▸/▾") mehr, die frueheren Sonderklassen `.ex-group-arrow`, `.plan-day-collapse-arrow`
  und `.ex-chart-chev` sind entfallen:
  Uebungskarten (`.aex-v2`, beide Fassungen) · Muskelgruppen im Katalog (`.ex-group-btn`) ·
  Uebungszeilen im Katalog (`.ex-item-head`) · alle drei Archiv-Knoepfe
  (`.plans-list-archive-header`) · Muskelgruppen im Uebung-hinzufuegen-Dialog
  (`.ex-group-title`) · Wochenbloecke im Laufplan (`.lp-woche-btn`) · „Entwicklung" in der
  Einheiten-Detailansicht (`.ex-chart-collapse`) · „Debug-Info" in den Einstellungen
  (`.drive-row`).
  Der Zustand kommt je nach Stelle aus einer KLASSE (`.collapsed`, `.open`, `.expanded`) oder aus
  `aria-expanded` — daher mehrere Drehregeln fuer dieselbe Sache. Beim Archiv-Knopf und den
  Laufplan-Wochen war die Drehung frueher −90 Grad; seit dem 05.09.2026 sind es ueberall 180.
  Die Kastengroesse variiert bewusst, weil sie die Zeilenhoehe bestimmt: 32px in den Karten,
  20px in den Knoepfen mit 44px-Zeile, 18px bei den Laufplan-Wochen, 14px im Archiv-Knopf.
  Auf- und zugeklappt wird weiterhin per Tipp auf den ganzen Kopf, nicht nur auf den Pfeil.
  BUG, der dabei auffiel: `toggleDriveDebug` haelt in `open` den Zustand VOR dem Umschalten fest —
  der neue ist `!open`. Die erste Fassung setzte `aria-expanded` deshalb verkehrt herum.
  TESTHINWEIS: Die Debug-Zeile liegt in `#drive-connected`, das ohne Drive-Verbindung
  `display:none` ist. Darin liefert `getComputedStyle` keine brauchbaren Werte — zum Messen den
  Block einblenden UND `transition: none` setzen, sonst misst man die laufende Animation.
- **Uebungskarten klappen mit Bewegung auf und zu** (`_aexKlappAnimieren`, 200ms,
  12.09.2026, Leonard-Wunsch — manuell wie automatisch).
  WARUM VON HAND und nicht per CSS-Transition: Das Umschalten baut die ganze Kartenliste neu
  auf (`renderWorkoutsScreen`). Eine Transition auf `.collapsed` liefe deshalb NIE — das
  Element ist beim ersten Zeichnen bereits im Endzustand. Gefahren wird darum die HOEHE DER
  KARTE ueber die Web Animations API, und der Neuaufbau kommt erst danach (`danach`-Rueckruf).
  Das erfasst alles auf einmal — Koerper, Aktionsleiste, Diagramm, die Zeile „Zuletzt" und das
  Polster des Kopfes —, ohne dass das Markup umgebaut werden muss. Der Inhalt springt sofort
  in seine Endlage und wird von `overflow: hidden` beschnitten; genau so sieht ein Akkordeon aus.
  DREI Dinge, die daran haengen:
  1. **Beim ZUklappen** wird `.collapsed` nur zum MESSEN gesetzt und sofort wieder entfernt —
     dazwischen zeichnet der Browser nicht, es ist also unsichtbar. Ohne das waere der Inhalt
     schon weg, bevor sich die Karte bewegt, und es schrumpfte eine leere Flaeche.
  2. **NOTBREMSE** (`setTimeout`, 500ms): Die Zeitleiste des Dokuments steht still, solange die
     Seite nicht sichtbar ist. `onfinish` kaeme dann NIE — die Karte bliebe mit fester Hoehe
     und `overflow: hidden` stehen, und die Liste wuerde nie neu gezeichnet. GEMESSEN: In der
     versteckten Browser-Ansicht greift ausschliesslich der Wecker, und der Endzustand stimmt.
     Dieselbe Vorsichtsmassnahme wie in `_tabFahrt`.
  3. Die Karte wird ueber `data-ex` gefunden (`_aexKarte`), nicht ueber `id="aex-<index>"` —
     der Index verschiebt sich beim Sortieren, die Uebungs-Id nicht. Beide Kartenbauer setzen
     das Attribut.
  Das AUTOMATISCHE Aufklappen der naechsten Uebung (`expandNextExercise`, nach dem letzten
  abgehakten Satz) nutzt dieselbe Funktion: Die Karte steht dort noch eingeklappt im DOM, weil
  `renderWorkoutsScreen` lief, bevor die Id im Satz war.
  Bei `prefers-reduced-motion` wird nur umgeschaltet und neu gezeichnet.
  Die Bewegung selbst samt Notbremse steckt seit dem 13.09.2026 in `_klappBewegung(el,
  keyframes, fertig)` (Dauer `KLAPP_MS`, vorher `AEX_KLAPP_MS`) — die Muskelgruppen nutzen sie mit.
- **DIE MUSKELGRUPPEN IM KATALOG KLAPPEN MIT DERSELBEN BEWEGUNG** (`_gruppeKlappAnimieren`,
  13.09.2026, Leonard-Wunsch): gleiche 200ms, gleiche Kurve, gleiche Notbremse. Die Gruppe
  traegt dafuer `data-gruppe="muscle:…"` (`_exGruppe(key)`).
  ANDERS als bei den Uebungskarten wird die LISTE (`.ex-list`) gefahren, nicht die Gruppe:
  Mit `overflow: hidden` auf der Gruppe waeren waehrend der Bewegung die weichen Schatten von
  Knopf und Liste abgeschnitten. Die Liste hat `overflow: hidden` schon, ihr eigener Schatten
  liegt ausserhalb davon.
  FALLE ABSTAND: Zwischen Knopf und Liste liegen 11.2px (`margin-bottom` des Knopfes).
  EINGEKLAPPT verschmilzt dieser Abstand mit dem 14px-Abstand unter der Gruppe — die Gruppe ist
  dann nur so hoch wie ihr Knopf. Eine Liste mit Hoehe 0, die noch im Fluss steht, haelt die
  11.2px dagegen fest; es sprang zu Beginn des Aufklappens und am Ende des Zuklappens um genau
  diesen Betrag. Deshalb faehrt die Liste ihren `margin-top` von −11.2px bis 0 mit (der Wert
  wird am Knopf gelesen). GEMESSEN mit angehaltener Animation: Abstand Knopf → naechste Gruppe
  bei t=0 genau 14px (= eingeklappt), am Ende genau 212.2px (= aufgeklappt), in beiden
  Richtungen.
  Der KOPF springt sofort in den neuen Zustand (`aria-expanded` → der Pfeil dreht sich mit der
  Bewegung), der Rest folgt mit dem Neuaufbau. (Bis zum 21.09.2026 erschien bzw. verschwand
  dabei auch die Anzahl „(4)".)
  „Alle ein-/ausklappen" (`toggleAllExGroups`) bewegt alle Gruppen, deren Zustand sich aendert,
  GLEICHZEITIG und zeichnet EINMAL neu, wenn alle fertig sind.
  KEINE Bewegung waehrend einer Suche: Dort sind alle Treffergruppen zwangsweise offen, der
  Neuaufbau zoege eine gerade zugeklappte Gruppe sofort wieder auf.
- **AUCH DIE EINZELNEN UEBUNGEN IM KATALOG KLAPPEN MIT BEWEGUNG** (`toggleExItem` →
  `_exItemKlappen`, 13.09.2026, Leonard-Wunsch). Gefahren wird die Hoehe der ZEILE (`.ex-item`),
  wie bei den Uebungskarten. Es ist immer nur EINE Uebung offen — tippt man eine andere an,
  schliesst die alte und oeffnet die neue GLEICHZEITIG, danach wird EINMAL neu gezeichnet.
  ZWEI Besonderheiten:
  1. Eine zugeklappte Zeile enthaelt KEIN Diagramm (`exChartHTML` wird nur fuer die offene
     gebaut). Beim Aufklappen fehlten seine rund 162px in der Zielhoehe, die Zeile spraenge am
     Ende genau darum. Deshalb setzt `_exItemKlappen` den Diagrammblock VOR dem Messen hinter
     `.ex-item-stats` ein — noch leer (`.ex-chart-wrap` hat eine feste Hoehe, gezeichnet wird er
     erst mit dem Neuaufbau; vorher gezeichnet, begaenne seine Einblendung ein zweites Mal).
     GEMESSEN: Endhoehe der Bewegung = Hoehe nach dem Neuaufbau (524.9 = 524.9px; beim Wechsel
     46 = 46 und 525.9 = 525.9px).
  2. Beim ZUklappen bleibt `.open` bis zum Ende stehen (der Inhalt schrumpft sichtbar). Damit
     der Pfeil trotzdem sofort zurueckdreht, kommt `.zuklappend` dazu
     (`.ex-item.open.zuklappend > .ex-item-head > .aex-v2-chev { transform: none }`).
  TESTHINWEIS: `getComputedStyle` auf den Pfeil liefert waehrend einer laufenden Transition den
  STARTwert — zum Pruefen `transition: none` setzen.
- **DIE DREI ARCHIVE IM PLAN-TAB KLAPPEN EBENSO** (`_archivKlappen`, 18.09.2026, Leonard-Wunsch):
  „Archivierte Gympläne", „Archivierte Gymtage" und „Archivierte Laufpläne" — gleiche 200ms,
  gleiche Kurve, gleiche Notbremse (`_klappBewegung`) wie Muskelgruppen und Uebungskarten.
  Die archivierten Eintraege stehen dafuer in EINER Huelle hinter dem Knopf (`.archiv-inhalt`),
  gefahren wird deren Hoehe. Bei den Gymtagen baut die Huelle dasselbe Dreier-Raster noch einmal
  (`#libdays-list > .archiv-inhalt`) — Spalten und Abstaende sind unveraendert (gemessen:
  14/133/252px, je 109px breit, 18px unter dem Knopf wie vorher; in den Planlisten 8px).
  BESCHNITTEN PER `clip-path`, NICHT per `overflow: hidden`: Die Kacheln stossen seitlich direkt an
  die Huelle, ihre Schatten waeren waehrend der Bewegung abgeschnitten und am Ende aufgeblitzt.
  Der Ausschnitt reicht seitlich und oben ueber die Huelle hinaus, nur seine Unterkante folgt der
  Hoehe. Das Archiv steht immer ZULETZT in seiner Liste; die Hoehe faehrt trotzdem mit, damit die
  Seite beim Zuklappen weit unten gleichmaessig nachzieht statt am Ende zu springen.
  Der Knopf springt sofort in den neuen Zustand, der Pfeil dreht sich mit. Beim AUFklappen steht
  er nach dem Neuzeichnen schon gedreht da und wird kurz in die alte Lage gesetzt, damit die
  Drehung laeuft. TOKEN `_archivNr` an der Liste: Ein weiterer Tipp waehrend des Zuklappens
  entwertet dessen Neuzeichnen am Ende.
  `_staffelKarten` (Seitenwechsel) steigt in `.archiv-inhalt` hinab — die archivierten Kacheln
  kommen dort einzeln, nicht als ein Block.
  GEMESSEN: auf/zu in allen drei Listen, Standbild bei 45ms (Kacheln halb aufgedeckt, Schatten
  seitlich heil), dreimal in 60ms-Abstand getippt → Endzustand stimmt ohne Reste.
- **KALENDER-FUSSZEILE UND WETTKAMPFKARTE IM ZEITSTRAHL KLAPPEN EBENSO** (13.09.2026,
  Leonard-Wunsch). Beide sind Kaesten, die aus dem NICHTS erscheinen bzw. ganz verschwinden —
  dafuer gibt es `_boxFahren(el, von, bis, fertig)`: Es faehrt die Hoehe UND das senkrechte
  Polster. Noetig wegen `box-sizing: border-box` (global): Ein Kasten kann nicht flacher werden
  als sein Polster; ohne das bliebe bei Hoehe 0 der 12px-Streifen der Fusszeile stehen.
  **Fusszeile** (`_calFussSetzen(el, html)`, beide Kalender): Aufklappen beim ersten Tipp,
  Zuklappen beim zweiten Tipp UND beim Tipp daneben (`initCalendarDeselect`), und beim Wechsel
  auf einen anderen Tag gleitet sie auf dessen Hoehe. Leerer Inhalt = zuklappen: Der ALTE Inhalt
  bleibt waehrend der Bewegung stehen und wird erst am Ende geleert (sonst schrumpfte eine leere
  Flaeche und `:empty` blendete die Zeile sofort aus). Das Leeren beim NEUAUFBAU des Rasters
  (Jahr, Tabwechsel) bleibt bewusst sofort.
  **Wettkampfkarte** (`_wkKarteKlappen(p, an)`): Oeffnen, Schliessen per zweitem Tipp, beim Wechsel
  auf einen anderen Wettkampf (beide gleichzeitig) und beim Scrollen. Gefahren wird die HUELLE
  `.wk-punkt-karte`, nicht der Eintrag — dessen Marke sitzt links AUSSERHALB auf der Linie und waere
  mit `overflow: hidden` abgeschnitten. `.zuklappend` haelt die Karte bis zum Ende sichtbar; Marke
  und `aria-expanded` wechseln sofort.
  FALLE AUSSENABSTAND: Die Karte trug `margin: 4px 0 12px`. Aussenabstaende verrechnen sich mit den
  Nachbarn, aber nicht mehr, sobald die Huelle `overflow: hidden` traegt — am Anfang und Ende der
  Bewegung haette es gesprungen. Sie stehen jetzt als POLSTER der Huelle (`4px 0 2px`, beim
  letzten Eintrag unten 12px) und bilden die alte Lage EXAKT nach (gemessen vor/nach dem Umbau fuer
  alle fuenf Eintraege: Kopf → Karte 4px, → naechster Eintrag 12px, → Jahreszahl 26px, → Strahlende
  20px). Die Jahreszahl ist `inline-block` — ihr `margin-top` verrechnet sich NICHT mit.
  TOKEN-SCHUTZ (beide): Tippt man waehrend einer Bewegung erneut, bricht die alte ab und die neue
  beginnt an der aktuellen Hoehe. Jede Bewegung merkt sich eine laufende Nummer am Element; ihr
  Abschluss tut nichts, wenn inzwischen eine neuere laeuft — sonst leerte das „am Ende leeren" den
  gerade neu gesetzten Inhalt. GEMESSEN: auf → zu → anderer Tag in einem Zug endet mit dem Inhalt
  des letzten Tags, markierter Zelle und ohne `overflow`-Rest.
  TESTHINWEIS: In der versteckten Browser-Ansicht meldet sich das Ende einer Bewegung erst ueber
  die Notbremse (500ms) — `finish()` allein loest den Abschluss dort NICHT aus. Mindestens 600ms
  warten, bevor der Endzustand gemessen wird.
- **Uebungskarten (`.aex-v2`) haben KEINEN sichtbaren Drag-Griff mehr** (die drei Striche `≡`,
  entfernt 01.09.2026). Das Sortieren haengt jetzt am ganzen Kartenkopf: `.aex-v2-header` traegt
  `onpointerdown`/`onpointerup` und schaltet `draggable` der Karte. Der Klick zum Auf-/Zuklappen
  laeuft unveraendert daneben. ACHTUNG: HTML5-Drag gibt es auf iOS ohnehin nicht — das Sortieren
  war und ist eine Maus-Funktion. Der Griff im Plan-Detail-Modal (`.plan-ex-handle`) ist am
  13.09.2026 mit diesem Modal entfallen.
- **Trainingstag-Namen** = kräftiger Text mit 3px-Balken links (`.pd-name`, KEINE Flächenfarbe) via Helper `pd(name)`. Sonderfall `.ex-group-title .pd-name`: im Übungen-Tab stehen die Gruppentitel auf dem farbigen Tab-Hintergrund → dort hell; im Add-Übung-Modal (`.sheet-ex-group`) wieder dunkel.
- **Zugeklappte Uebungskarte** zeigt nur den Namen: `.aex-v2-last` und `.aex-cmp-pr` sind ausgeblendet, und
  `.aex-v2-info` bekommt `min-height:32px` mit zentriertem Inhalt, damit der Name auf einer Linie mit der
  Nummernscheibe steht. ZUGEKLAPPT richtet der Kopf mittig aus (`.aex-v2.collapsed .aex-v2-header
  { align-items: center }`, 05.09.2026): Im aktiven Modus ist das Erledigt-Kaestchen mit 40px das
  hoechste Element der Zeile, oben ausgerichtet sassen Name und Scheibe dadurch 4px ueber der
  Kartenmitte. AUFGEKLAPPT bleibt es bei `flex-start` — sonst wanderte die Scheibe beim Aufklappen
  mit den neuen Textzeilen nach unten.
- **Übungs-Karten** `.aex-v2` (Vorschau, laufende Einheit, Bibliothek-Tag-Detail) — Pro-Satz-Tabelle als ZEILEN pro Satz (`.aex-v2-srow`: Satz | Wdh. | kg | **Haken**). Notizfeld `.aex-v2-notes` rechts daneben, unter 460px darunter. Die DIFFERENZ zur letzten Einheit haengt seit dem
  05.09.2026 an der „Zuletzt"-Zeile (sie vergleicht ja mit genau dieser Einheit) und ist dort auf
  „+2 kg" gekuerzt — „zur letzten Einheit" waere neben „Zuletzt:" doppelt gemoppelt und die Zeile
  auf iPhone-Breite zu lang. In `.aex-v2-cmp` steht nur noch die Bestleistung; **zugeklappt bleibt die Karte ruhig**: `.aex-cmp-pr` ist dann ausgeblendet, eine Notiz-Vorschau gibt es nicht (Leonard-Wunsch).
- **Herocard an einem Trainingstag ist bewusst kompakt** (`.hero-v2.col-layout`, 01.09.2026): Abstand zum
  Knopf 8px (vorher 14px) und Hantel 48px (vorher 72px). Die Hantel bestimmte als hoechstes Element die
  Hoehe des oberen Blocks; der Text darin wurde mittig zentriert, wodurch ueber dem Titel Leerraum entstand.
  Jetzt steht der Text oben an und die Hantel mittig daneben. Ziel war die Hoehe der Wochenplan-Karte:
  im Querformat erreicht (129 gegen 128), im Hochformat bleiben 17px Unterschied — dort passen Uebungen,
  Saetze und Dauer nicht in eine Zeile, und die zweite Zeile kostet genau diese 17px.
  Die Ruhetag-Karte (`.rest-mode`) ist davon NICHT betroffen, ihre Hantel bleibt 80px.
- **Herocard der Vorschau** zeigt Uebungen, Saetze und — sobald mindestens eine Einheit dieses Trainingstags
  abgeschlossen ist — deren mittlere Dauer (`avgDauerFuerTag(planDayId)`, Einheiten ohne `duration` zaehlen nicht mit).
  Die Dauer steht seit 01.09.2026 in DERSELBEN Zeile wie Uebungen und Saetze (Leonard-Wunsch — spart in der
  Herocard eine Zeile, damit sie im Querformat so hoch ist wie die Wochenplan-Karte daneben). Auf iPhone-Breite
  passen die drei Angaben nicht nebeneinander, dort bricht die Dauer weiterhin um — jetzt aber von selbst statt
  per `flex-basis:100%`. Der Trennpunkt liegt INNERHALB von `.hero-v2-meta-avg` (wandert beim Umbruch mit, statt
  am Zeilenende haengenzubleiben) und ist unterhalb von 1024px ausgeblendet, weil er als erstes Zeichen einer
  umgebrochenen Zeile sinnlos waere.
  Die Hoehe der Karte bestimmt die Hantel (`.hero-v2-art`, 72px) — die zweite Zeile kostet daher nichts.
- **Hero der laufenden Einheit** hat nur noch zwei Knoepfe: Pausieren und Beenden, beide `flex:1` in einer Zeile.
  „Naechste Uebung" wurde am 20.08.2026 entfernt — mit ihm fielen `heroActionContinue`, `scrollToNextExercise`,
  `scrollToEx`, die Option `continueOnClick` und die Klassen `.hero-v2-btn-next` / `.two-buttons` weg.
  `expandNextExercise` bleibt: es klappt nach jedem abgehakten Satz weiter (kein Scroll mehr).
- **Laufende Einheit:** `toggleSetDone(ei, si)` hakt einen einzelnen Satz ab (Feld `sets[].done`),
  setzt eine PAUSIERTE Einheit automatisch fort (05.09.2026 — wer abhakt, trainiert wieder; nur beim
  Setzen des Hakens, nicht beim Zuruecknehmen, sonst startete ein Fehlklick die Uhr).
  ACHTUNG Reihenfolge: `ensureTimerActive` liest den Zustand aus dem Speicher, es muss also NACH
  `DB.saveActive` laufen. Es hakt die Übung automatisch ab, wenn alle Sätze stehen, und startet die **Satzpause** (`startRestTimer`, Leiste `#rest-bar`) — aber NUR, wenn danach noch ein Satz der Übung offen ist. Nach dem letzten Satz läuft keine Pause mehr (eine ggf. laufende wird gestoppt): dort folgt der Übungswechsel, keine weitere Wiederholung. Die Pause startet IMMER bei 1:30 (`REST_DEFAULT_SEC`); `adjustRest(±30)` und `resetRest()` wirken nur auf die laufende Pause und werden NICHT als Vorgabe gemerkt. Kopf ist im aktiven Zustand kompakt (`.hero-v2.active-mode`), der Wochenplan ist ausgeblendet (`html.wo-running`, siehe unten), beim Scrollen erscheint `#wo-sticky-bar` — aber NUR im Trainings-Tab: Der Riegel
  (`body.theme-workouts #wo-sticky-bar.show`) liegt im CSS, damit sie beim Tabwechsel sofort verschwindet und nicht
  erst beim naechsten Scroll- oder Sekundentakt; `_applyTabState` raeumt zusaetzlich die `.show`-Klasse ab. `ensureActiveExpanded()` hält die nächste unerledigte Übung offen (`_aexUserClosedAll` respektiert bewusstes Zuklappen).
- **WECHSEL NORMAL ↔ AKTIV AUF DER SEITE „GYM" MIT BEWEGUNG** (15.09.2026, Leonard-Wunsch,
  „Variante D" aus einer interaktiven Vorschau). Beim START einer Einheit und rueckwaerts beim
  BEENDEN und beim VERWERFEN laufen drei Bewegungen zugleich:
  1. `_woWocheFahren`: Die Wochenplan-Karte klappt weg (280ms) bzw. wieder auf. Gefahren wird die
     Huelle `#wo-week-card` mit `.wo-woche-faehrt` (haelt sie trotz `wo-running` sichtbar,
     `overflow: hidden`). Mit `overflow: hidden` liegt der 12px-Aussenabstand der Karte IN der
     Huelle — gemessen: die Herocard steht mit und ohne Klasse bei exakt 241.3px, kein Sprung.
  2. `_woHeroWelle`: Aus der Mitte des ausloesenden Knopfs waechst eine Welle in SEINER Farbe
     (computed `background-image` bzw. `background-color`) ueber die Herocard (380ms), darunter
     wechselt der Inhalt, dann verblasst sie (260ms). Start: „Einheit starten"/„Freies Training"
     (`[data-sport="gym"]`), Ende: „Beenden" (`.hero-v2-btn-danger`, rot).
     Die NEUE Karte steht schon im DOM, ihr Inhalt ist nur unsichtbar (`.hero-ueb-verdeckt`);
     darueber liegt eine Kopie des ALTEN Inhalts (`.hero-ueb-alt`, dieselben Klassen, Flaeche,
     Schatten, Rand und Hoehe INLINE entfernt, damit die Glas-Regel sie nicht zurueckholt).
     Unsichtbar statt ueberdeckt, weil die Karte im Transparenz-Modus durchscheint. Kopie und
     Welle haengen HINTER dem echten Inhalt — `updateTimerDisplay` schreibt in alle
     `.hero-v2-timer`. Klassen `hero-farbe-von-*` werden in der Kopie entfernt, sonst liefe die
     Farbblende eines frueheren Tagwechsels noch einmal.
  3. `_woUebungenStaffel`: Die NEUEN Karten (schon gebaut, samt Diagrammen) werden kurz aus der
     Liste genommen, die ALTEN Knoten wieder eingesetzt (ohne Tipps). Alte gleiten von unten nach
     oben hinaus (150ms, je 40ms versetzt), neue von oben nach unten herein (280ms, je 80ms,
     ab der fuenften Karte gedeckelt). Karten unterhalb des Bildschirms bewegen sich nicht.
     „+ Übung hinzufügen" blendet mit der letzten Karte ein.
  ABLAUF: Der Ausloeser merkt den Wechsel vor (`_woUebergangVormerken('start'|'ende')`) und laesst
  zeichnen. `_renderGymSeite` haelt VOR dem Zeichnen den alten Stand fest (`_woUebergangVorher`)
  und spielt DANACH die Bewegung (`_woUebergangSpielen`). Verbraucht wird die Vormerkung nur,
  wenn Trainings-Tab UND Seite „Gym" gerade sichtbar sind; nach `WO_UEB_FRIST_MS` (3s) verfaellt
  sie. Nur vom passenden Ausgangszustand aus (alte Karte `.hero-aktiv` genau beim Ende).
  TOKEN: Jede Zeichnung zaehlt `_woUebergangNr` hoch und raeumt die laufende Bewegung ab
  (`_woUebergangAufraeumen`); Fortsetzungen pruefen die Nummer, die Staffel zusaetzlich, ob die
  alten Knoten noch in der Liste stecken. NOTBREMSE: `_woAnim` endet spaetestens per Wecker.
  DREI AUSLOESER, Leonard-Entscheidungen vom 15.09.2026:
  - START auf der Seite „Gym": `_woStartZeigen` → `showScreen('workouts')` zeichnet und spielt.
  - START aus der UEBERSICHT (Bestaetigung „Einheit starten" bzw. „Freies Training"): Der Tab
    WISCHT herein und die Bewegung laeuft beim ANKOMMEN. Dafuer zeichnet `_woStartVorbereiten`
    den Trainings-Tab VOR `DB.saveActive` noch im normalen Zustand des heutigen Tags — er
    wandert also mit „Einheit starten" herein; der Settle von `initTabScrollSync` ruft
    `_applyTabState` → Zeichnung → Bewegung. Vorher sprang `showScreen` hart.
    `_woStartZeigen` setzt ausserdem `workoutsViewMode = 'gym'` (vorher blieb eine zuletzt
    offene Seite „Laufen" stehen).
  - BEENDEN: Nach „Beenden" liegen „Einheit beenden?" und die Abschlussansicht ueber dem Tab.
    `_woEndeHalten` laesst die Seite bis zum SCHLIESSEN der Abschlussansicht im aktiven Zustand
    stehen (`finishWorkout` zeichnet nicht neu, `syncWorkoutActiveUI` behaelt `wo-running`);
    `closeModal('modal-summary')` spielt dann die Bewegung — fuer „Fertig", Tipp daneben und
    Herunterwischen. `_woEndeHalten` MUSS vor `DB.clearActive` bestimmt werden.
  - VERWERFEN: dieselbe Rueckwaerts-Bewegung, vorgemerkt im Bestaetigungs-Rueckruf VOR
    `DB.clearActive`; sie laeuft, sobald der Bestaetigungsdialog zu ist.
  KEINE Bewegung bei `prefers-reduced-motion` und im Querformat ab 1024px (Wochenplan und
  Herocard stehen dort nebeneinander, die Herocard wechselt die Breite) — dort weiter der
  sofortige Wechsel, auch ohne Halten beim Beenden (gemessen).
  GEMESSEN (375px): Start auf der Seite, Start aus der Uebersicht (freies Training und
  geplanter Tag, Settle von Hand ausgeloest), Beenden mit Halten und Bewegung nach dem Schliessen,
  Verwerfen — jeweils Endzustand ohne Reste (keine Kopie, keine Welle, keine Klasse, keine
  Inline-Sichtbarkeit), erste Uebung offen, `wo-running` korrekt. Standbild bei 190ms zeigt
  Welle, fast zugeklappte Wochenkarte und ausblendende Karten.
  RANDFALL: Die einmalige Frage „Deine Einheiten sichern?" (`maybePromptBackup`) oeffnet zugleich
  mit der Abschlussansicht; ist sie beim Schliessen der Abschlussansicht noch offen, laeuft die
  Bewegung dahinter.
  NICHT pruefbar hier: das Gefuehl der Bewegung und das Wischen aus der Uebersicht auf dem Geraet.
- **`html.wo-running` heisst: die laufende Einheit steht GERADE auf dem Bildschirm**
  (praezisiert 05.09.2026). Die Klasse verlangt vier Dinge zugleich: Es laeuft eine Einheit,
  der Trainings-Tab ist offen, die Seite „Gym" ist gewaehlt UND
  `woDayIdx(wo) === selectedWorkoutDayIdx`. Vorher genuegten die ersten beiden.
  An ihr haengen: das Ausblenden der Wochenplan-Karte, das Querformat-Grid des Trainings-Tabs
  und das Ausblenden der schwebenden Pille.
  VORGESCHICHTE (Leonard-Meldung 05.09.2026): Tippte man waehrend einer laufenden Einheit im
  Plan-Tab auf einen anderen Wochentag, landete man im Trainings-Tab auf DIESEM Tag — die
  Einheit war weg, die Wochenplan-Karte ausgeblendet und die Pille ebenfalls. Aus dem Tab
  heraus gab es keinen Weg zurueck; nur ueber die Wochenplan-Karte eines anderen Tabs.
  Drei Wege fuehren jetzt zurueck: die wieder sichtbare Wochenplan-Karte, der Knopf „Zur
  laufenden Einheit" im Hinweis der Vorschau (`.hero-v2-running-notice`, vorher reiner Text)
  und die Pille. Alle drei nutzen `oeffneLaufendeEinheit()` bzw. `jumpToWorkoutDay` — ein
  blosses `showScreen('workouts')` genuegt NICHT, es liesse den fremden Tag stehen.
  `oeffneLaufendeEinheit` WISCHT seit dem 12.09.2026 in den Trainings-Tab, statt zu springen
  (Leonard-Wunsch): erst `renderWorkoutsScreen()`, dann `wischeZuTab('workouts')` — dieselbe
  Reihenfolge wie in `jumpToWorkoutDay`, damit der Tab schon richtig aussieht, waehrend er
  hereinwandert. Aus einem Vollbild-Overlay heraus faellt `wischeZuTab` von selbst auf den
  harten Wechsel zurueck.
  `setWorkoutsView` ruft `syncWorkoutActiveUI()` selbst nach, sonst zoege die Klasse beim
  Seitenwechsel Gym|Laufen erst beim naechsten Sekundentakt nach.
  NICHT angefasst: Die Sticky-Leiste beim Scrollen erscheint weiterhin, sobald eine Einheit
  laeuft und man im Trainings-Tab scrollt — auch auf einem fremden Tag. Sie ist keine
  Sackgasse (ihr „Beenden" funktioniert dort), zeigt aber Titel und Uhr der laufenden Einheit
  ueber einer fremden Vorschau.
- **Textauswahl auf Schalt-Texten unterbinden.** `.seg-btn`, `.cal-filter-btn` und
  `.cal-detail-tag` tragen `user-select: none`. Ohne das loest ein Tipp auf iOS die Textauswahl
  aus — sichtbar als kurze Striche unter einzelnen Buchstaben (gemeldet 01.09.2026). Dasselbe
  Verhalten wie beim Zahlenblock; in Chrome NICHT reproduzierbar.
- **`.seg-toggle` hat KEINEN `backdrop-filter`.** Der Weichzeichner zeichnete auf iOS eine
  dunkle Linie an der Oberkante, sobald sich der Inhalt dahinter aenderte (Seitenwechsel im
  Plaene-Tab, gemeldet 01.09.2026). Gilt unveraendert weiter, seit der Schalter unten steht —
  sein Vorbild in „Health Command Center" ist durchscheinend MIT
  Weichzeichner, hier ist die Flaeche stattdessen deckend.
- **Kein Zoom:** `viewport` in index.html trägt `maximum-scale=1.0, user-scalable=no` (greift in der installierten PWA), zusätzlich erzwingt die letzte Regel in style.css `input, select, textarea { font-size: 16px !important }` — unter 16px zoomt iOS beim Fokussieren automatisch hinein. Beim Anheben einer Schriftgröße in einem Eingabefeld also nie unter 16px gehen.
- **Zahlenblock:** Der ganze Block (`#modal-numpad .sheet` und alle Teile) hat `user-select: none`. Ohne das loesten
  zwei schnelle Tipps auf eine Zifferntaste auf iOS die Textauswahl aus — sichtbar als senkrechter Strich
  (Einfuegemarke) in der Anzeige. Bei den +/- Knoepfen trat es nicht auf, weil man die einzeln tippt.
  `#np-value` traegt zusaetzlich kein negatives `letter-spacing` und eine feste `min-width` (die Box soll beim
  Tippen nicht schrumpfen). Beides in Chrome NICHT reproduzierbar — nur auf iOS.
- **Zahleneingabe** (Wdh./kg) läuft NICHT über die iOS-Tastatur: Die Felder sind **`<div role="button">`, kein `<input>`** (ein Eingabefeld würde Fokus bekommen → iOS-Zoom) und tragen `data-np-*`-Attribute; ein Tipp öffnet `#modal-numpad` (`openNumpadFromInput` → `npTap`/`npStep`/`closeNumpad`). Übernahme erst beim Schließen. Erste Ziffer ersetzt den alten Wert (`npState.fresh`), auch nach einem Schnellschritt (+2,5 usw.). Gilt für laufende Einheit (`ctx=active` → `updateSet`) und Vorschau/Trainingstag (`ctx=preview` → `updatePreviewSetTarget`).
- **Abschluss** einer Einheit: `renderWorkoutSummary()` → `#modal-summary` (Dauer, Volumen, Sätze, Übungen, Volumenvergleich, neue Bestleistungen). Der stärkste Kraft-PR steht als dunkle `.pr-card` mit „Als Bild sichern" (`sharePRCard` → Canvas 1080×1350 → `navigator.share`, sonst Download); die restlichen PRs listet „Außerdem" darunter.
- **DIE ABSCHLUSSANSICHT KOMMT IN BEWEGUNG** (`_sumBelebung`, 16.09.2026, Leonard-Wunsch):
  Die vier Kacheln zaehlen von null auf ihren Wert hoch (`_zahlHoch`, 900ms, ease-out), und
  Vergleichszeile, Bestleistungs-Karte, „Ausserdem"-Liste und der Hinweis auf den angepassten
  Trainingstag kommen nacheinander von unten herein — derselbe Baustein wie beim Seitenwechsel
  (`_kartenStaffelFahren`, jetzt mit optionalem Vorlauf).
  ALLES BEGINNT ERST NACH `SUM_START_MS` (260ms): So lange faehrt das Blatt selbst herein
  (`slideUp`), davor liefe die Bewegung dahinter.
  NICHT bewegt werden der Name des Trainingstags und die Kachelzeile — sie sind der Rahmen, in
  dem gezaehlt wird.
  DIE ZAHLEN STEHEN FERTIG IM MARKUP (`data-zaehl`/`data-ziel`) und werden erst beim Start auf
  null gesetzt: Bei `prefers-reduced-motion` und wenn sonst etwas schiefgeht, steht immer der
  richtige Wert da. Formatiert wird bei jedem Schritt mit derselben Funktion wie am Ende
  (`fmtDur`, `fmtVol`, ganze Zahl) — das Volumen wechselt unterwegs also sauber von kg auf t.
  ZWEI NOTBREMSEN: `_zahlHoch` schreibt den Endwert spaetestens per Wecker (rAF ruht, solange die
  Seite nicht sichtbar ist), und die Staffel raeumt ihre Animationen am Ende ab — ohne das bliebe
  eine Karte bei `fill: 'backwards'` auf Deckkraft 0 stehen.
  GEMESSEN (kuenstliche Abschlussansicht): Start bei „0 min / 0 kg / 0 / 0", Ende bei
  „1h 4min / 6.8 t / 15 / 5"; alle vier Bloecke danach bei Deckkraft 1 ohne Restanimation;
  kurze Fassung ohne Bestleistung und ohne Planaenderung ebenso.
- **DAS KAESTCHEN PULST BEIM ABHAKEN EINES SATZES** (`_satzHakenPuls`, 16.09.2026,
  Leonard-Wunsch): kurz auf 118 % und zurueck (260ms) — eine Rueckmeldung, dass der Tipp sass.
  NUR beim SETZEN des Hakens, nicht beim Zuruecknehmen: Ein Puls waere dort eine Belohnung fuer
  das Gegenteil.
  Die Karte wird beim Abhaken neu gebaut, das Kaestchen wird deshalb NACH dem Zeichnen gesucht —
  ueber `data-ex` die Karte, darin das `si`-te `.aex-v2-setcheck`. Ist die Uebung damit komplett,
  klappt die Karte zu; dann gibt es nichts zu pulsen (Hoehe 0) und der Abschluss hat mit Konfetti
  und Satzpause ohnehin seinen eigenen Moment.
  GEMESSEN: erster Satz abgehakt → eine Bewegung mit den Keyframes scale(1) → 1.18 → 1, danach
  `transform: none` ohne Restanimation; Haken zuruecknehmen → keine Bewegung.
- **Bestleistungs-Moment:** `celebratePR(name, weight, prev)` läuft, sobald die ÜBUNG komplett abgehakt ist (in `toggleSetDone`, Zweig `allDone`) — nicht nach jedem Satz und nicht erst in der Abschlussansicht. Gewertet wird der schwerste Satz der Übung gegen `getExercisePR()` (gespeicherte Einheiten). Konfetti (`.pr-burst`, respektiert `prefers-reduced-motion`) + Vibration + Toast; `ex.prCelebrated` verhindert eine zweite Feier derselben Übung.
- **PLAN-ZEITRAEUME ZAEHLEN IN KALENDERTAGEN, erster und letzter Tag eingeschlossen**
  (18.09.2026). Vorher wurde in Millisekunden gegen `Date.now()` verglichen, und die beiden
  Plan-Arten speichern verschieden: der Gymplan UTC-Mitternacht (`_dateToMs`, in Mitteleuropa
  02:00 des Tags), der Laufplan lokale Mitternacht. DREI Fehler daraus (1 und 2 gemessen, 3 aus
  dem Code abgeleitet):
  1. Am LETZTEN Plantag galt ein Gymplan ab 02:00, ein Laufplan sogar ab 00:00 als beendet —
     Chip „Beendet", kein laufender Plan in Uebersicht, Training und Herocard.
  2. Der Kalender zaehlte den ERSTEN Tag eines Gymplans nicht zum Plan (00:00 lag vor 02:00).
  3. Die Wochenserie liess die erste Planwoche aus, wenn der Plan an einem Montag begann.
  Jetzt bilden `_planHatBegonnen`, `_planIstVorbei` und `_planEndetAm` beide Speicherformen ueber
  `_calLokalTag` auf denselben lokalen Tag ab. Umgestellt: `_findActivePlanIn` und
  `runPlanAktiv` (beide ueber `_laufenderPlanIn`), `planStatus` (`runPlanStatus` ruft es nur
  noch auf), `_planBeendet`, `_calPlanIndex`, `_laufplanDeckt` und der Abbruch der beiden
  Wochenserien. Die SPEICHERFORMATE sind unveraendert (Drive-Sicherung, Altdaten).
  WECHSELTAG: Beginnt am letzten Tag eines Plans schon der naechste, gehoert der Tag dem NEUEN
  — so war es auch vorher, als der alte um 02:00 bzw. 00:00 endete. Unabhaengig von der
  Reihenfolge im Speicher (gemessen).
  Ein Gymplan braucht weiterhin ein Ende, ein Laufplan darf offen enden — wie vorher.
  Nicht angefasst: `getProgramWeek`/`_planProgramWeek` (rechneten schon in Tagen) und die
  Sichtbarkeitspruefung der Planbalken im Kalender (`imBild`, grosszuegig genug).
  GEMESSEN (heute Fr 18.09., 15:42): Gym- und Laufplan mit Ende heute → laufend, „Woche 3 / 3"
  in Uebersicht und Training, kein Chip im Plan-Tab, beim Start NICHT archiviert; Ende gestern
  → „Beendet"; Kalender: Tag vor Beginn und nach Ende ausserhalb, erster und letzter Tag drin.
- **BEENDETE PLAENE WANDERN VON SELBST INS ARCHIV** (`autoArchivBeendetePlaene`, 18.09.2026,
  Leonard-Wunsch) — Gym- UND Laufplaene, sobald ihr letzter Tag vorbei ist. Vorher nur
  Gymplaene und erst 30 Tage nach dem Ende (`autoArchiveOldPlans`, entfallen); Laufplaene gar
  nicht. Laeuft beim App-Start und vor dem Zeichnen beider Planlisten (`renderPlans`,
  `renderLaufVerwaltung`).
  „Beendet" rechnet in KALENDERTAGEN (`_planBeendet`, siehe auch „Plan-Zeitraeume in
  Kalendertagen"): Der Gymplan speichert sein Ende als
  UTC-Mitternacht (in Mitteleuropa 02:00 des letzten Tags), der Laufplan als lokale Mitternacht;
  `_calLokalTag` macht aus beidem denselben Tag. Ein Vergleich mit `Date.now()` hielte den
  Gymplan schon am Morgen seines letzten Tags fuer beendet.
  NUR EINMAL JE ENDDATUM (`autoArchivEnde` am Plan): Wer einen beendeten Plan von Hand aus dem
  Archiv holt, behaelt ihn draussen — beim Gymplan legt das Zurueckholen sogar frische Kopien
  seiner Trainingstage an, jeder Rueckfall haette neue Tage erzeugt. Wird das Ende verschoben
  und ist auch das neue vorbei, wird wieder archiviert.
  Der Gymplan friert dabei seine Tage ein (`archivedDays`), wie beim Archivieren von Hand.
  GEMESSEN: Gym- und Laufplan mit Ende vorgestern → beim Start archiviert (Gym mit Snapshot);
  Laufplan mit Ende heute → bleibt; beide von Hand zurueckgeholt → bleiben draussen.
- **BEENDETE PLAENE ZEIGEN IHRE QUOTE in der Beschreibungszeile ihrer Karte** (`planMetaZeile`,
  18.09.2026, Leonard-Wunsch, Wortlaut „84 % der Einheiten" — auch beim Laufplan). Gerechnet
  wie die Kennzahl des Kalenders (`_calPlanStand`): absolvierte gegen geplante Einheiten vom
  ersten bis zum LETZTEN Plantag, ueber 100 % moeglich, ohne geplante Einheit keine Quote.
  `_calPlanStand` zaehlt dafuer seit diesem Tag auch das Absolvierte nur bis zum Planende —
  vorher bis heute, was beim laufenden Plan dasselbe ist, beim beendeten aber spaetere
  Einheiten mitgezaehlt haette.
  Auf 375px passt die Quote NICHT mehr in die Zeile. Sie ist deshalb ein eigener Teil
  (`.ppv-meta-teil`, `nowrap`) und rutscht als Ganzes in die zweite Zeile; der Trennpunkt davor
  verschwindet dann, weil er links ausserhalb der Zeile liegt (`.ppv-meta-in` ist um seine
  Breite nach links geschoben, `.ppv-meta.mit-quote` schneidet ab). Auf breiteren Bildschirmen
  steht alles in einer Zeile mit Punkt dazwischen (gemessen bei 520px).
  GEMESSEN: Gym 5/5 und Lauf 5/5 = 100 %, unabhaengig nachgezaehlt; die Einheit einen Tag nach
  Planende zaehlt nicht mit; Plan ohne Einheiten 0 %; laufender und heute endender Plan ohne
  Quote.
- **`buildPlanCard(p, onTap, hideToday, hideStatus, hideMeta)`** rendert die Plan-Kachel in BEIDEN Tabs.
  Der Plaene-Tab nutzt sie ueber den Alias `renderRow` — der muss eine Lambda bleiben (`p => buildPlanCard(p, ...)`),
  denn `array.map(buildPlanCard)` reicht (element, index, array) durch: Der Index landete als `onTap` und erzeugte
  ab der zweiten Karte ein totes `onclick="1"` (Fehler gefunden und behoben 20.08.2026).
  `hideMeta` blendet die Laufzeitzeile aus. Der LAUFENDE Plan wird in beiden Tabs identisch gezeichnet
  (ohne Laufzeit, ohne Status-Chip); archivierte und kommende Plaene behalten beides, sonst waeren mehrere
  Karten untereinander nicht unterscheidbar (Leonard-Entscheidung 20.08.2026). Unterschiedlich bleibt nur der
  Tipp: Uebersicht → `showScreen('plans')`, Plaene-Tab → `openPlanDetail(p.id)`.
- **Nachgetragene Trainingstage ohne Einheit** (`ft_manual_days`, Liste von `'YYYY-MM-DD'`): Tage, an denen
  trainiert wurde, zu denen aber KEINE Aufzeichnung existiert. `migrateImportManualDays()` hat am 01.09.2026
  einmalig 24 Daten aus Leonards alter Liste eingetragen (Merker `ft_manual_days_imported`).
  Bewusst KEINE Einheiten anlegen — die haetten weder Uebungen noch Saetze noch Volumen und wuerden Verlauf,
  Statistik und PRs verfaelschen. `buildCalendarData()` mischt sie ein (nur wo keine echte Einheit liegt),
  sie faerben also das Kaestchen und zaehlen in der Kennzahl des Kalenders sowie in `planErfuellung` mit.
  `getWeekStreak` laesst sie bewusst aussen vor (die Serie speist sich aus echten Einheiten).
  In der Tagesbeschreibung stehen sie als „Training (ohne Aufzeichnung)" und ohne Verweis „zur Einheit".
  Sie liegen in der Drive-Sicherung (`manualDays`).
- **Trainingskalender** (Übersicht, `#ov-cal-card`): `renderTrainingCalendar()` zeichnet 52 Wochen à 7 Kästchen (`.cal-day`).
  KEINE Volumen-Abstufung — zwei Schichten im gleich grossen Quadrat (`inset: 3.5px`):
  `.leer-woche` faerbt die Kaestchen einer Woche OHNE Training hellrot (`#FECACA`, 05.09.2026).
  EINZIGE Einschraenkung: nur ABGELAUFENE Wochen — in einer laufenden Woche ist noch nichts
  versaeumt. Ob ein Plan lief, spielt AUSDRUECKLICH keine Rolle (eine erste Fassung hatte Wochen
  ohne Plan ausgenommen, das wurde noch am selben Tag zurueckgenommen).
  Im Transparenz-Modus braucht es eine eigene Regel — `html.glas … .cal-day` faerbt sonst jedes
  Kaestchen weiss und das Rot verschwaende. Dort ist es kraeftiger (55 % statt Vollton), sonst
  geht es im Farbverlauf dahinter unter. Was als Training zaehlt, folgt dem Modus des Kalenders:
  Gymkalender = Krafteinheiten samt nachgetragener Tage, Laufkalender = Laeufe, gemeinsam = beides.
  Die Regel steht VOR den Zustandsregeln, die Marken zeichnen sich also darauf.
  `.wettkampf` faerbt das GANZE Kaestchen hellgruen — der auffaelligste Zustand im Kalender
  (04.09.2026). Nur dort, wo der Kalender Laeufe zeigt; der Gymkalender kennt ihn nicht.
  Im Transparenz-Modus braucht er eine EIGENE Regel (`rgba(74,222,128,.55)`, ergaenzt
  06.09.2026 nach Leonards Meldung): Er war der einzige Zustand ohne eine solche, und die
  allgemeine Regel `html.glas … .cal-day` faerbte ihn deshalb weiss wie jedes andere
  Kaestchen — der Wettkampf war dort unsichtbar. Sie steht NACH der roten Woche, damit ein
  Wettkampf in einer trainingsfreien Woche als Wettkampf erscheint (im hellen Modus stehen
  die beiden Regeln in derselben Reihenfolge). Dieselbe Deckkraft wie das Rot: Voll deckend
  uebertoente das Gruen die Marken darin. Gilt fuer BEIDE Kalender, die Regel haengt an
  `.cal-day`.
  ZWEI QUELLEN (06.09.2026): das `raceDate` eines Laufplans UND die eigenstaendige Liste
  `ft_races` (`DB.getRaces`/`saveRaces`, Datumsstrings 'YYYY-MM-DD' wie `ft_manual_days`).
  Die Liste war noetig, weil Leonards Wettkaempfe aus Jahren stammen, in denen es noch gar
  keine Laufplaene gab — an ein `plan.raceDate` waeren sie nicht zu haengen, und fuenf
  Schein-Plaene anzulegen haette die Laufplan-Liste verschmutzt.
  Ein Eintrag ist `{ date: 'YYYY-MM-DD', name }`. Die WERTE eines Wettkampfs stehen NICHT
  darin — sie kommen aus dem Lauf, der an dem Tag in der Tabelle steht. `ft_races` haelt nur,
  WELCHER Tag ein Wettkampf war und wie er hiess.
  `migrateImportRaces()` hat Leonards fuenf Termine eingetragen (Konstante `WETTKAMPF_IMPORT`,
  dieselbe Bauart wie `migrateImportManualDays`). Sie traegt ZWEI Merker: Die erste Fassung
  (v288) kannte nur Daten ohne Namen und setzte `ft_races_imported`; die Namen kamen einen Tag
  spaeter dazu und brauchten deshalb einen zweiten Durchlauf unter `ft_races_imported_v2`.
  Ein selbst vergebener Name bleibt dabei stehen, ueberschrieben wird nur ein leerer.
  Der GETTER hebt Altbestand (reine Datumsstrings) auf Objekte und sortiert neueste zuerst —
  Aufrufer duerfen sich darauf verlassen.
  Eine Oberflaeche zum Pflegen gibt es BEWUSST nicht, genau wie bei den nachgetragenen Tagen;
  weitere Termine kommen ueber denselben Weg dazu.
  Beim Zusammenbauen der Marken kommen die PLAENE ZULETZT, damit ihr Name gewinnt, wenn ein
  Datum in beiden steht. In der Tagesbeschreibung steht deshalb „🏁 Wettkampf · Planname"
  beim Plan-Wettkampf und nur „🏁 Wettkampf" beim eigenstaendigen.
  `ft_races` haengt in der Drive-Sicherung (Feld `races`), in `_snapshotStores`/`_restoreStores`
  („Rueckgaengig") und in `calJahre()` — ein Jahr mit Wettkampf soll waehlbar sein.
  `.planned::before` = laut damaligem Plan vorgesehen, nur UMRANDET; `.done::before` =
  tatsächlich trainiert, GEFUELLT. Seit 04.09.2026 dieselbe Logik wie beim Lauf, wo der geplante
  Kreis leer und der gelaufene gefuellt ist (Leonard-Wunsch); vorher faerbte „geplant" das ganze
  Kaestchen hellgruen (`#CDE7E1`). `.done::before` steht SPAETER in der Datei und gewinnt damit
  bei gleicher Spezifitaet — ein geplanter und absolvierter Tag ist gefuellt. Mit der Flaeche
  entfiel auch die Glas-Sonderregel dafuer. Im Transparenz-Modus sind Umrandung und Fuellung seit
  dem 18.09.2026 halbweiss (siehe „Keine Sportfarben im Transparenz-Modus“).
  STRICHSTAERKE: 2,52px gegen 1,68px beim Laufkreis. Absolut gleich dick wirkten sie NICHT gleich —
  das Quadrat ist mit 16,8px 1,5-mal so gross wie der 11,2px-Kreis. 1,68 × 16,8/11,2 = 2,52px stellt
  das Verhaeltnis her (Leonard-Meldung 04.09.2026); beim Aendern der Insets nachrechnen.
  (Bis zum 12.09.2026 waren es 2,1 gegen 1,4px bei einem 21px-Kaestchen — dieselbe Rechnung,
  nur 20 % kleiner.)
  `_calPlanIndex()`/`_calPlanInfo()` rekonstruieren den Plan je Datum aus `startDate`/`endDate`/`weekPlan` ALLER Pläne (auch archivierter — die behalten ihren Wochenplan);
  ohne abdeckenden Plan wird keine Fläche gezeichnet, kommende Tage sind blass (`.future`). Antippen beschreibt den Tag in `#cal-detail`, inklusive der geplanten Einheit.
  **Aufbau der Fusszeile:** Zeile 1 nur Wochentag und Datum (`.cal-detail-datum`), darunter
  ZWEI SPALTEN (`.cal-detail-spalten`, 06.09.2026 — vorher standen Gym und Lauf untereinander):
  links das Gym in DUNKELGRUEN, rechts der Lauf in HELLGRUEN. Die Farbe benennt die Sportart,
  Text und Knopf sind unveraendert; der Pfeil-Knopf erbt die Farbe. Zeigt der Kalender nur eine
  Sportart, steht deren Spalte allein ueber die volle Breite (`repeat(auto-fit, minmax(0,1fr))`).
  Steht in einer Spalte nichts an, nennt sie den Grund — aber NUR innerhalb des jeweiligen
  Plans: „Kein Gym geplant" bei `plan.known`, „Kein Lauf geplant" bei `_laufplanDeckt(key)`
  (das Gegenstueck fuer die Laufplaene, 06.09.2026 ergaenzt). Ohne abdeckenden Plan bleibt die
  Spalte leer — sonst stuende das halbe Jahr „Kein …" da. Der Wettkampf-Hinweis steht ueber den
  Spalten, er gehoert zu keiner von beiden.
  **Eine LEERE Spalte wird gar nicht erst gezeichnet** (06.09.2026, Leonard-Wunsch): Ein leeres
  `<div>` haelt im Grid seinen Platz, die Laufinfo stuende dann RECHTS, obwohl links nichts steht
  — ein Tag mit Lauf, aber ohne Gym sah dadurch aus, als fehle etwas. `showCalDay` filtert die
  Spalten deshalb vor dem Zusammensetzen (`.filter(Boolean)`); bleibt nur eine uebrig, nimmt sie
  ueber `auto-fit` die volle Breite und beginnt damit wieder links. Bleibt keine, entfaellt auch
  der Behaelter `.cal-detail-spalten`.
  Zeile 2 der Trainingstag. Wurde an dem Tag aufgezeichnet, ist Zeile 2 ein KNOPF
  (`.cal-detail-tag`) und oeffnet die bestehende Detailansicht `#modal-hist-detail` —
  wie vor dem Umbau der Fusszeile. Ein zwischenzeitlich gebauter Inline-Ausklappblock wurde
  wieder entfernt (Leonard-Wunsch: das Einheiten-Fenster bleibt).
  Der Handler MUSS `event.stopPropagation()` rufen, sonst raeumt `initCalendarDeselect` die
  Beschreibung im selben Klick weg.
  Ein Tag OHNE abdeckenden Plan bekommt gar keine zweite Zeile — der fruehere Text „kein Training"
  ist am 04.09.2026 entfallen (Leonard-Wunsch). „Ruhetag" bleibt, wo ein Plan den Tag abdeckt. Nachgetragene Tage ohne Aufzeichnung und Ruhetage bleiben
  gewoehnlicher Text — ohne Einheit gibt es nichts aufzuklappen.
  Die frueheren Zeilen zum Trainingsplan (Name, Laufzeit) und zur Erfuellungsquote sind ENTFALLEN
  (Leonard-Wunsch); `planErfuellung` lebt weiter, wird vom Kalender aber nicht mehr genutzt.
  Gehoert der Tag zu einem Plan, folgen zwei Zeilen: Planname mit Laufzeit und Wochenzahl (`planWochen` rechnet
  sie aus Start/Ende, falls `weeksTotal` fehlt) sowie der Stand (`planErfuellung`). Eine Hinweiszeile gibt es nicht mehr.
  **Das JAHR ist waehlbar** (06.09.2026, `_calJahre`, `calJahr(id)`, `setCalJahr(jahr, id)`,
  `calJahre()`): Es steht als
  Auswahlfeld direkt HINTER dem Kartentitel („Trainingskalender 2026 ⌄") und ist damit aus der
  Kennzahl oben rechts verschwunden, die frueher mit „2026 · …" begann. Sichtbar sind Text und
  Pfeil, darueber liegt ein unsichtbares `<select>` (dasselbe Muster wie `.wpe-select` und
  `.lp-zone`) — 74x39px Trefferflaeche statt der 41x19px des blossen Textes.
  **SEIT DEM 14.09.2026 KEIN AUSWAHLFELD MEHR, SONDERN EIN WECHSLER** wie der Titel (Leonard-Wunsch;
  `wechselCalJahr(id)`, `.cal-jahr` ist ein `<button>`): Jeder Tipp schaltet eine Stufe weiter —
  Aktuell → 2026 → 2025 → 2024 → Aktuell, also vom aktuellsten Zeitraum zum aeltesten Jahr und
  zurueck. Das unsichtbare `<select>` (`.cal-jahr-sel`) und der Pfeil sind entfallen — ein Pfeil
  versprach eine Liste, die es nicht mehr gibt. Die Trefferflaeche ist gleich gross geblieben
  (Polster 10/8px, per negativem Rand herausgerechnet; gemessen 71x39px, Lage unveraendert).
  OHNE laufenden Plan fehlt „Aktuell" in der Folge; der Zustand 'aktuell' zeigt dann das laufende
  Jahr, und von dort geht es zu 2025 weiter. Der Rueckweg an den Anfang setzt wieder `'aktuell'`
  statt der Jahreszahl — so kehrt die Ansicht von selbst zurueck, sobald wieder ein Plan laeuft
  (gemessen: 2026 [aktuell] → 2025 → 2024 → 2026 [aktuell]).
  **DAS RAD VOM 14.09.2026 IST WIEDER WEG** (v338 eingebaut, v340 zurueckgenommen, Leonard-Wunsch
  15.09.2026): Ein Blatt von unten mit zwei Drehraedern (Kalender | Zeitraum), geoeffnet ueber Titel
  oder Zeitraum. Entfernt samt `openCalRad`, `_calRad*`, `#modal-cal-rad`, `.rad-*`, dem Haken in
  `closeModal` und der Rad-Ausnahme in `initSheetSwipeDismiss`. In der Uebersicht gilt wieder: Titel
  antippen = `toggleCalFilter`, Zeitraum antippen = `wechselCalJahr('cal')`. Wer es erneut will: Der
  Stand steckt im Commit 3fd3f9a.
  **DIE ZULETZT ANGESCHAUTE ANSICHT BLEIBT UEBER EINEN NEUSTART ERHALTEN** (15.09.2026,
  Leonard-Wunsch; vorher startete der Kalender bei jedem App-Start bei „Trainingskalender · Aktuell").
  Gespeichert in `ft_cal_ansicht` = `{ filter, jahre: { cal, pcal } }`: der Filter der Uebersicht UND
  der Zeitraum BEIDER Kalender (Uebersicht und Plan-Tab). Geschrieben von `_calAnsichtSpeichern` in
  `toggleCalFilter`, `setCalJahr` (damit auch in `wechselCalJahr`) und `calZurAktuellenAnsicht` — der
  Kreispfeil setzt also auch den GESPEICHERTEN Stand zurueck. Gelesen einmal beim Laden
  (`_calAnsichtLaden`); unbrauchbare Werte fallen auf 'beide' bzw. 'aktuell' zurueck (gemessen mit
  `{"filter":"quatsch","jahre":{"cal":"x","pcal":1999}}`).
  NICHT gespeichert (Leonard-Entscheidungen): die SCROLLPOSITION — nach einem Neustart beginnt das
  Raster an der Startposition der Ansicht — und der Filter der WOCHENKARTE der Uebersicht, der weiter
  bei „Trainingswoche" startet. Eine reine Anzeige-Einstellung: NICHT in der Drive-Sicherung.
  FOLGE: Ein gewaehltes Jahr bleibt auch nach dem Jahreswechsel stehen (2026 bleibt 2026), „Aktuell"
  passt sich selbst an. Die Saetze „BEWUSST nicht gespeichert" weiter unten beim Jahr und beim
  Filter sind damit Vorgeschichte.
  GEMESSEN: Titel-Folge Trainings- → Gym- → Laufkalender, Zeitraum Aktuell → 2026 → 2025; nach
  Neuladen „Laufkalender · 2025" und im Plan-Tab 2026; Kreispfeil schreibt „beide/aktuell".
  Die Beschreibung darunter zum „Auswahlfeld" ist Vorgeschichte; die Liste der Jahre gilt weiter.
  Zur Auswahl stehen alle Jahre, zu denen es Einheiten, nachgetragene Tage oder Laeufe gibt,
  plus das laufende — sonst koennte man in ein garantiert leeres Jahr springen. Die Liste ist
  fuer BEIDE Kalender dieselbe und folgt NICHT dem angezeigten Sport: Im Gymkalender stehen
  daher auch Jahre zur Wahl, in denen es nur Laeufe gab (bei Leonard 2024 und 2025) — dort ist
  das Raster dann vollstaendig rot. Bewusst so, weil der Uebersichts-Kalender sich im
  Gym-Filter genauso verhaelt und eine mitlaufende Liste im Gymkalender auf eine einzige
  Option zusammenschrumpfte.
  **Beide Kalender fuehren ihr EIGENES Jahr** (`_calJahre` ist ein Objekt je Kalender-Id, genau
  wie `_calPositioniert`/`_calScrollPos`; seit dem 06.09.2026 auch im Plan-Tab waehlbar, vorher
  stand dort fest das laufende Jahr). Ein Sprung nach 2024 im Plan-Tab zieht die Uebersicht
  NICHT mit. Innerhalb eines Kalenders gilt das Jahr fuer alle Zustaende: in der Uebersicht fuer
  alle drei Filter, im Plan-Tab fuer Gymplan und Laufplan gemeinsam (es ist dieselbe Karte).
  `setCalJahr` nimmt die Id als ZWEITEN Parameter und faellt ohne sie auf `'cal'` zurueck.
  BEWUSST nicht gespeichert — dieselbe Ueberlegung wie beim Sportart-Filter.
  Zwei Dinge haengen am gewaehlten Jahr: Die WOCHENSERIE erscheint nur im laufenden Jahr (sie
  beschreibt den Stand von heute), und die Scrollposition springt in einem vergangenen Jahr an
  den Jahresanfang statt zur „aktuellen Woche", die es dort nicht gibt. `setCalJahr` setzt dafuer
  `_calPositioniert[id]` zurueck — sonst bliebe die Spalte des alten Jahres stehen.
  **ANSICHT „AKTUELL" — und sie ist die ERSTANSICHT** (14.09.2026, Leonard-Wunsch; `calJahr(id)`
  liefert seither eine Jahreszahl ODER `'aktuell'`, Standard `'aktuell'`). Sie ist die erste Stufe
  des Zeitraum-Wechslers, der Titel lautet dann „Trainingskalender Aktuell". Das Raster zeigt NUR
  die Wochen des laufenden Plans (`_calAktuellePlaene(modus)`): Gymkalender → laufender Gymplan,
  Laufkalender → laufender Laufplan, gemeinsamer Trainingskalender → vom frueheren Beginn bis zum
  spaeteren Ende beider (beide laufen heute, eine Luecke kann es nicht geben). Gilt fuer beide
  Kalender; der im Plan-Tab folgt der Seite (Gymplan/Laufplan).
  Der Renderer rechnet seither mit einem ZEITRAUM `von`/`bis` statt mit dem Jahr — `imBereich(tag)`
  ersetzt ueberall `tag.getFullYear() === jahr` (Randtage, rote Wochen, Monatsbeschriftung).
  VIER Regeln, alle Leonard-Entscheidung:
  1. KEIN laufender Plan fuer den Modus → das laufende Jahr wie bisher, „Aktuell" steht gar nicht
     in der Auswahl. Der gespeicherte Zustand bleibt `'aktuell'` — kommt ein Plan dazu, ist die
     Ansicht von selbst zurueck, solange niemand ein Jahr gewaehlt hat.
  2. Tage VOR Planbeginn bzw. NACH Planende in der ersten/letzten Spalte sind ausgegraut und nicht
     antippbar (`.outside`) — dieselbe Regel wie die Tage des Vor- und Folgejahres.
  3. Die KENNZAHL zeigt absolviert/geplant BIS EINSCHLIESSLICH HEUTE, je Sportart gegen ihren
     eigenen Plan (`_calPlanStand` rechnet, `_calPlanStandText` formatiert). Seit dem 14.09.2026
     (Leonard-Wunsch) im gemeinsamen Trainingskalender NUR in Prozent — „Gym 87 % · Lauf 80 %" —,
     im Gym- und Laufkalender absolut MIT Prozent in Klammern — „20/23 Einheiten (87 %)", dahinter
     die Serie. Zwischen Zahl und „%" steht ein geschuetztes Leerzeichen (kein Umbruch dazwischen).
     Noch nichts geplant (Plan beginnt heute an einem freien Tag): im gemeinsamen Kalender „–", im
     Einzelkalender entfaellt die Klammer. Ueber 100 % ist moeglich (zusaetzliche Einheiten). „Absolviert" zaehlt wie die Jahressumme (Einheiten plus nachgetragene
     Tage bzw. Laeufe inkl. Intervall), auch an ungeplanten Tagen. „Geplant" zaehlt die Wochentage
     mit Trainingstag (`weekPlan`) bzw. die Lauftage (`runDays`) ab Planbeginn. Laeuft im
     gemeinsamen Kalender fuer eine Sportart kein Plan, steht fuer sie nur die Anzahl im Zeitraum.
  4. Die Startposition ist Spalte 0 — heute bleibt wie im Jahr sichtbar (gleiche Regel wie oben).
  Monatsbeschriftung: Beginnt der Plan mitten im Monat, traegt die ERSTE Spalte den Monat des
  Planbeginns — aber nur, wenn der naechste Monatserste mindestens zwei Spalten weiter liegt
  (sonst ueberlappten die Namen). Ueber den Jahreswechsel laufen die Monate einfach weiter.
  NEU POSITIONIEREN bei geaendertem Zeitraum (`_calBereich[id]`): Wechselt der Filter oder die
  Plan-Seite, zeigt „Aktuell" einen anderen Zeitraum — die gemerkte Scrollposition passte nicht mehr.
  Im Jahr bleibt der Zeitraum beim Filterwechsel gleich, dort bleibt auch die Position stehen.
  GEMESSEN (Gymplan Mi 22.07.–So 22.11., Laufplan Mo 10.08.–So 18.10., heute 14.09.2026):
  Trainings- und Gymkalender 18 Spalten mit Mo/Di 20./21.07. grau, Laufkalender 10 Spalten ohne
  Grau; Kennzahlen 20/23 und 12/15 (unabhaengig nachgezaehlt); ohne Laufplan „20/23 Einheiten ·
  15 Läufe"; Laufkalender ohne Plan = Jahr 2026 ohne „Aktuell"; Gymplan bis 10.02.2027 = 30
  Spalten, Monate bis „Feb", 4 graue Tage hinten.
  **Die MONATSBESCHRIFTUNG steht ueber der Spalte, in der der ERSTE des Monats liegt**
  (13.09.2026, Leonard-Wunsch). Vorher stand sie ueber der ersten Woche, die IM neuen Monat
  BEGINNT — faellt der Monatserste auf einen Dienstag oder spaeter, war das die Woche danach
  und die Beschriftung stand bis zu sechs Tage zu weit rechts (gemessen: „Sep" 2026 sass auf
  Spalte 36 statt 35).
  Gezaehlt wird nur der Erste des ANGEZEIGTEN Jahres: Die erste Rasterwoche reicht in den
  Dezember davor, die letzte in den Januar danach — ohne die Pruefung stuende „Jan" zweimal
  da. Gemessen fuer 2024, 2025 und 2026 sowie beide Kalender: je 12 Beschriftungen, alle auf
  der Spalte ihres Monatsersten.
  Rand-Tage der ersten/letzten Woche tragen `.outside` (ausgegraut, nicht antippbar).
  **Beim ERSTEN Rendern beginnt die Ansicht beim START DES LAUFENDEN PLANS** (13.09.2026,
  Leonard-Entscheidung; vorher stand die aktuelle Woche bei 70 % der Breite). Drei Stufen,
  in dieser Reihenfolge:
  1. Der Beginn des laufenden Plans, sofern er im ANGEZEIGTEN Jahr liegt. JEDER Kalender
     folgt dabei SEINER Sportart: Gymkalender dem Gymplan, Laufkalender dem Laufplan, der
     gemeinsame Trainingskalender dem frueheren von beiden. Sonst begaenne der Laufkalender
     beim Start eines Gymplans, dessen Daten er gar nicht zeigt.
  2. Sonst die Spalte des aktuellen Monats — aber nur im laufenden Jahr.
  3. Sonst der Jahresanfang (vergangenes Jahr; dort gibt es kein „heute").
  **HEUTE muss trotzdem sichtbar bleiben:** Ein 18-Wochen-Plan ist breiter als die rund zehn
  sichtbaren Spalten — beim Planbeginn stehend waere die aktuelle Woche aus dem Bild und man
  muesste jedes Mal nach rechts scrollen (Leonard-Entscheidung). Liegt heute rechts ausserhalb,
  wird nur so weit nachgeschoben, dass sein Kaestchen gerade hineinpasst.
  GEMESSEN auf 375px (Gymplan ab Spalte 26, Laufplan ab 32, heute 36, Monatserster 35):
  Trainingskalender und Gymkalender starten bei 26.88 (heute gerade noch rechts im Bild),
  Laufkalender bei genau 32, ohne aktiven Plan bei 35, im Vorjahr bei 0. Ein Plan, der schon
  im Vorjahr begann, faellt korrekt auf den aktuellen Monat zurueck.
  Danach bleibt die Position des Nutzers stehen (`_calPositioniert` und `_calScrollPos` je
  Kalender). Ohne das sprang das Raster bei jedem Tabwechsel zurueck, weil `_applyTabState`
  den Renderer erneut aufruft (Leonard-Meldung 01.09.2026).
  Als „positioniert" gilt der Kalender erst, wenn `clientWidth > 0` war — im unsichtbaren Tab waere die
  Position sonst sinnlos eingefroren.
  ACHTUNG: Die aktuelle Position fuehrt ein Scroll-Listener in `_calScrollPos` nach; sie darf NICHT zu
  Beginn des Renderns als Momentaufnahme genommen werden. Beim App-Start laeuft der Renderer zweimal
  dicht hintereinander (`prerenderAllTabs` + `_applyTabState`) — die zweite Runde haette dann den Stand
  VOR dem ersten Positionieren festgehalten und das Raster wieder auf Null gezogen.
- **Plan-Laufzeiten: Name OBEN, Balken UNTEN** (04.09.2026, Leonard-Entscheidung „Variante A+D").
  Der fruehere Rahmen um die Wochenspalten (`.cal-bands`/`.cal-band`, samt `--cal-band-over`) ist
  ERSATZLOS entfallen — er zeigte nur, DASS ein Plan lief, nicht welcher, und zwei ueberlappende
  Rahmen lagen fast aufeinander. Jetzt: `.cal-plannames` ueber dem Raster (Planname, 11px, fett)
  und ZWEIMAL `.cal-planlanes` mit 5px-Balken: einmal direkt unter dem Namen
  (`.cal-planlanes-oben`, ueber dem Raster) und einmal darunter (04.09.2026 ergaenzt). Alle drei
  Zeilen liegen auf GENAU denselben Wochenspalten — zusammen klammern sie den Zeitraum ein, ohne
  die Kaestchen zu beruehren.
  Im gemeinsamen Kalender (Filter „Trainingskalender", also `modus.kraft && modus.lauf`) bleiben
  die NAMEN weg und nur die Balken stehen — mit Gym- und Laufplaenen gleichzeitig waeren es bis zu
  vier Zeilen Text ueber dem Raster (Leonard-Wunsch 04.09.2026). In den Einzelansichten
  (Gymkalender, Laufkalender, beide Plan-Tab-Seiten) erscheinen sie unveraendert. `--cal-names-h`
  laesst die Namenszeile dann aus der Rechnung.
  SPUREN: Jede Sportart bekommt ihre eigene; ueberschneiden sich zwei Plaene DERSELBEN Sportart,
  oeffnet der zweite eine weitere (einfaches Intervall-Packing in `renderTrainingCalendar`).
  Name und Balken eines Plans stehen dadurch immer in derselben Spur uebereinander.
  Farbe wie ueberall: Gym #0F766E (`--cal-plan-color`), Lauf #4ADE80; archivierte Plaene mit
  `opacity: .5`. Im Transparenz-Modus seit dem 18.09.2026 WEISS (vorher farbig) — im gemeinsamen
  Kalender unterscheidet die beiden Balken dann nur ihre Lage (Gym-Spur oben, Lauf-Spur unten).
  ACHTUNG WOCHENTAGSSPALTE: Die Namenszeile schiebt das Raster nach unten, `.cal-daylabels` liegt
  aber ABSOLUT ueber dem Kalender. `renderTrainingCalendar` setzt deshalb `--cal-names-h` auf der
  KARTE (0px, wenn kein Plan im Bild ist), und der `top`-Wert der Spalte rechnet es mit. Der Wert
  ist die Summe aus Namenszeile, oberer Balkenzeile und beiden Abstaenden. Ohne das steht „Mo"
  nicht mehr auf einer Linie mit der ersten Rasterzeile — beim Aendern der Zeilenhoehen
  (NAME_H/NAME_GAP/SPUR_H/SPUR_GAP im JS) hier mitziehen.
  Beide Zeilen sind reine Positionsflaechen: Ihre Kinder sitzen absolut, deshalb setzt das JS auch
  ihre Hoehe — im Fluss haetten sie keine.
  (Zwischen dem 20.08. und dem 04.09.2026 gab es GAR KEINE Beschriftung — der Name stand nur in
  der Tagesbeschreibung. Genau das war Leonards Kritik: Man sah nicht, welcher Plan wann lief.)
  Beim Antippen eines Tages innerhalb eines Plans nennt eine zweite Zeile den Stand des Plans (`planErfuellung`): absolvierte Einheiten gegen
  bis dahin geplante Trainingstage samt Prozent. Bezug ist immer nur die Vergangenheit (laufender Plan: bis heute), Einheiten an nicht geplanten
  Tagen zählen mit — ein nachgeholtes Training soll die Quote nicht drücken (beides Leonard-Entscheidung). Rahmen und Beschriftung nutzen dieselbe Farbe
  (`--cal-plan-color` auf `.cal-scroll`, dasselbe Grün wie die trainierten Kerne) — die Farbe liegt im CSS, nicht im JS.
  ACHTUNG Zeitzone: Die Spalte eines Datums wird über GANZE TAGE gerechnet (`spalteFuer`, `Math.round` auf Tagesdifferenz), nicht über Millisekunden-Division —
  zwischen Winter- und Sommerzeit fehlt sonst eine Stunde und ein Datum genau auf der Wochengrenze landet eine Woche zu früh.
  `SPALTE` (Kaestchen + Abstand) steuert Plan-Umrandungen und Scrollposition. `initCalendarResize()` rechnet beim Drehen neu, `initCalendarDeselect()` hebt die Tagesauswahl auf,
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
- **Ruhetag-Herocard** (`buildRestHero`) wird von der Uebersicht UND vom Trainings-Tab genutzt (seit
  01.09.2026 — vorher hatte der Trainings-Tab mit `buildRestCard` eine eigene, flachere Karte).
  Die Karte ist in beiden Tabs IDENTISCH (Leonard-Wunsch 01.09.2026) — gleiche Hoehe, gleiche Lage der
  Hantel, und „Freies Training starten" steht immer da. Zweiter Parameter ist der Wochentagsname: Im
  Trainings-Tab kann ein anderer Tag als heute gewaehlt sein, dann steht sein Name im Titel statt
  „Heute ist Ruhetag". `buildRestCard` und die ganze `.session-card-v2`/`.scv2-*`-Familie sind damit entfallen —
  sie hatten danach keinen Aufrufer mehr.
- **Ruhetag-Herocard** (`buildRestHero`): `_ruhetagHeroAusrichten()` richtet BEIDE Vorkommen aus
  (Uebersicht gegen `#ov-plan-card`, Trainings-Tab gegen `#wo-week-card`) — die eigentliche Arbeit macht
  `_ruhetagHeroEinrichten(heroSel, planSel)`. Aufgerufen am Ende von `renderOverview()`, beim Zeichnen der
  Ruhetag-Karte in `renderWorkoutsScreen()` und im Resize-Handler. Gesetzt wird die `min-height` auf die GEMESSENE Hoehe der Wochenplan-Karte darueber und
  verschiebt die Hantel per `transform: translateY(...)` auf die Mitte des Knopfes „Freies Training
  starten" (Leonard-Wunsch 01.09.2026). Gemessen statt fest verdrahtet, weil die Plan-Karte um die
  Serien-Zeile („N Wochen in Folge") waechst. Die Hantel MUSS per `transform` wandern, nicht per
  Abstand: Ein transform veraendert das Layout nicht und kann die Kartenhoehe deshalb nicht
  zurueckwirkend beeinflussen — sonst schaukelten sich Hoehe und Versatz gegenseitig auf.
  Bei Hoehe 0 (Vorab-Rendern im unsichtbaren Tab) wird nichts gesetzt. Laeuft auch im Resize-Handler.
- **„Details" in der Uebungskarte** ist ein Knopf in der Aktionsleiste (`.aex-v2-details`, ganz rechts, graue Box mit
  Akzentfarbe). Er sitzt per `margin-left:auto` IMMER am rechten Rand — sonst wandert er mit der Zahl der uebrigen
  Knoepfe (in der laufenden Einheit kommt „Ueberspringen" hinzu) und stuende in Vorschau und aktivem
  Modus an verschiedenen Stellen. Er klappt das Verlaufsdiagramm AM ENDE der Karte auf (`.aex-v2-chart`, unter „+ Satz / − Satz").
  Standard ist zu; `aexChartOffen` (Set der Kartenschluessel) haelt den Zustand, `toggleAexCollapse` loescht den
  Eintrag beim Zuklappen der Karte — das Diagramm ist danach wieder geschlossen (Leonard-Wunsch 28.08.2026).
  Gezeichnet wird ueber `_renderAexCharts()` nach jedem Rendern der Kartenliste; die Instanzen liegen in `_aexCharts`.
  Die vier Knoepfe passen nur einzeilig, weil `.aex-v2-actions .btn-sm` Polster und Schrift verkleinert.
  Das frueher hier verlinkte Modal `#modal-ex-detail` wurde ersatzlos entfernt.
- **Diagrammfarben richten sich nach dem UNTERGRUND, nicht nach dem globalen Glas-Modus.** `_zeichneExDiagramm`
  prueft `canvas.closest('.screen:not(#screen-mehr)')` — genau die Flaechen, auf die der Glas-Modus im CSS wirkt.
  Nur dort werden Linie und Achsen weiss; in Modalfenstern und den Einstellungen (weisser Grund) bleiben sie
  dunkel. Die Farben stehen ausdruecklich in den Optionen, weil `Chart.defaults` global auf den Glas-Modus
  eingestellt ist — ohne das war das Diagramm in der Detailansicht einer Einheit weiss auf weiss (01.09.2026).
- **Kein Zucken beim Diagramm-Tipp:** `_initKeineTippAnimationAufDiagramm` haengt die Klasse `.keine-tipp-anim`
  an die umgebende Karte, solange ein `<canvas>` beruehrt wird (pointerdown/-up/-cancel, capture). Ein Tipp ins
  Diagramm zeigt nur den Messwert, die Karte soll dabei ruhig bleiben. Bewusst NICHT `:has(canvas:active)` —
  ob Safari einem `<canvas>` ueberhaupt `:active` gibt, haengt an Details der Trefferpruefung.
- **Der pulsierende Rahmen am Bildschirmrand waehrend einer Einheit ist weg** (`#workout-glow`, 01.09.2026,
  Leonard-Wunsch). Mit ihm fiel `@keyframes wo-breathe`. `html.workout-active` bleibt — daran haengen die
  Laufanzeige-Pille und das zusaetzliche Polster der Tabs.
- **Verlauf je Übung** (Übungen-Tab, aufgeklappte Karte): `getExerciseHistory` liefert pro Einheit `maxW` (schwerster Satz) UND `reps` (Summe aller Wiederholungen); `exHistPoints(exId, mode)` filtert daraus die Punkte des gewählten Modus (Einträge ohne Wert fallen raus — Körpergewichtsübungen haben kein Gewicht). Umschalter `.ex-chart-toggle` (Gewicht/Wdh.), Auswahl je Übung in `ft_ex_chart_modes` — bewusst ein eigener localStorage-Key statt eines Felds an der Übung, damit reine Anzeige-Einstellungen nicht in den Trainingsdaten und der Drive-Sicherung landen. `setExChartMode` frischt nur die betroffene Karte auf (ein Neuaufbau der Liste würde sie zuklappen). `.ex-chart-toggle` nutzt die Pillen-Optik von `.stats-mode-toggle` mit; die frühere `html.no-cardio`-Ausnahme ist mit dem Cardio-Ausbau entfallen.
- **Muskel-Landkarte:** `renderMuscleMap()` zeichnet zwei SVG-Silhouetten (`muscleMapSvg`, vorne/hinten) mit nach
  Volumenanteil abgestufter Deckkraft plus Zahlen-Legende. Seit 01.09.2026 stehen die Figuren LINKS und die
  Legende RECHTS daneben (`.mmap-body`, Flex-Zeile) — untenliegend machte sie die Karte deutlich hoeher als die
  Volumenentwicklung. Die Figuren sind 84px breit und um 10px EINGERUECKT (`padding-left`) — das nimmt der Legende
  Breite weg, wodurch Muskelname und Wert eng zusammenruecken (7px statt vorher rund 60px).
  84px ist praktisch das Maximum: Groesser, und „Schultern" samt Wert bricht um.
  Die Karte traegt `.muscle-card` (Flex-Spalte); `#muscle-bars` waechst in den durch die
  min-height entstandenen Raum und sitzt darin senkrecht mittig — sonst bliebe unten ein Loch.
  `_gleicheHoeheStatsKarten()` am Ende von `renderStatsPage()` setzt im HOCHFORMAT die `min-height` der
  Muskelkarte auf die gemessene Hoehe der Volumenkarte (Leonard-Wunsch: gleich hoch). Gemessen statt fest
  verdrahtet, weil der Kopf der Volumenkarte je nach Breite ein- oder zweizeilig ist. Im Querformat wird nichts
  gesetzt — dort haelt das Grid die beiden ueber `stretch` von selbst gleich hoch.
- **EINE LISTENZEILE KLAPPT BEIM LOESCHEN WEG** (`_zeileWegKlappen`, 16.09.2026,
  Leonard-Wunsch): Vorher verschwand sie und alles darunter sprang hoch. Gefahren werden Hoehe,
  senkrechtes Polster UND die Aussenabstaende (220ms): Bei `box-sizing: border-box` kann ein
  Kasten nicht flacher werden als sein Polster, und der Abstand zur naechsten Zeile bliebe sonst
  als Luecke stehen. `overflow: hidden` schneidet den Inhalt ab; aufgeraeumt wird nicht, weil der
  Aufrufer direkt danach neu zeichnet. Gegenstueck: `_zeileEinblenden` fuer eine NEU
  dazugekommene Zeile (nutzt `_kartenStaffelFahren` mit einer einzigen Karte).
  IM EINSATZ an den Stellen, an denen die Liste beim Loeschen SICHTBAR bleibt:
  Uebung im Katalog (`deleteExerciseFromCatalog` → `_exLoeschenAusfuehren`, Zeile
  `#ex-item-<exId>`), Papierkorb (Zurueckholen und endgueltig Loeschen, Zeile
  `.trash-row[data-trash]`) und Wettkampf (`#races-list [data-date]` — dieselbe Kennung traegt
  der Punkt im Zeitstrahl UND die Karte in der Liste, `wettkampfKarte` hat sie dafuer bekommen).
  Ein NEUER Wettkampf kommt umgekehrt herein (`saveRaceFromDialog`).
  NICHT eingebaut bei Gymplan, Gymtag und Laufplan: Die drei werden aus ihrer DETAILANSICHT
  heraus geloescht, die Seite wird dabei verlassen — es gibt keine Zeile, die wegklappen koennte.
  `trashRestore` ruft sich nach der Bewegung SELBST noch einmal auf; `data-faehrt` an der Zeile
  verhindert die Endlosschleife und schluckt zugleich einen zweiten Tipp waehrend der Bewegung.
  GEMESSEN: Uebung geloescht (29 → 28, Eintrag im Papierkorb), Zeile mit `overflow: hidden` und
  laufender Bewegung; Zurueckholen aus dem Papierkorb (Liste leer, Uebung wieder da); Wettkampf
  angelegt (kommt herein, danach Deckkraft 1) und wieder geloescht (Punkt klappt weg, danach
  aus dem Zeitstrahl verschwunden).
- **Löschen ist zweifach abgesichert:** (1) `withUndo(label, fn, afterRestore)` + `showUndoToast()` — sichert die Stores vorab, „Rückgängig" 6 s lang. (2) **Papierkorb** (`ft_trash`, `trashPut/trashRestore/trashDeleteForever/emptyTrash/purgeTrash`, Liste via `renderTrash()` im Einstellungen-Overlay): gelöschte Einheiten, Pläne, Trainingstage und Übungen liegen `TRASH_KEEP_DAYS` = 30 Tage dort. `_snapshotStores` sichert `ft_trash` mit, sonst läge ein Objekt nach „Rückgängig" doppelt vor.
- **Auswertungen** (Volumenentwicklung, Volumen pro Muskelgruppe, Letzte Einheiten, PRs und Bestleistungen) liegen auf der Stats-Seite des Übungen-Tabs, NICHT mehr in der Übersicht. „Letzte Einheiten" (`renderRecentSessions`, Karte `#ov-recent-sessions-card`) ist am 20.08.2026 dorthin gewandert — die ID behielt ihr `ov-`Präfix.
  Reihenfolge auf der Stats-Seite: Volumenentwicklung, Volumen pro Muskelgruppe, PRs & Bestleistungen, Letzte Einheiten (01.09.2026). `renderStatsPage()` füllt sie. Der Trainingskalender wird dagegen von `renderOverview()` gerendert — er gehört zur Übersicht. ACHTUNG: Vor dem Umbau hing sein Aufruf in `renderHomeStats()`; wandert er wieder dorthin, bleibt die Kalenderkarte in der Übersicht leer.
- **PR-Liste:** hervorgehoben ist der Bestwert selbst, die Steigerung steht grau in Klammern in der Unterzeile (`.pr-v2-delta`).
  Die Unterzeile nennt nur noch den Verlauf („37.5 → 40 kg") plus die Steigerung — die Satzangabe („3×6")
  ist am 01.09.2026 entfallen (Leonard-Wunsch), damit auch das fuehrende Trennzeichen davor.
  `.pr-v2-name` braucht ein eigenes `color: var(--text)`: Eine Schriftfarbe wird als FERTIGER Wert vererbt,
  ohne eigene Angabe erbt der Name die am `<body>` ausgerechnete dunkle Farbe und das Umdefinieren von
  `--text` auf der Glas-Karte erreicht ihn gar nicht.
  Ein Tipp auf die Zeile öffnet über `showHistDetailForEx(exId, bestTs)` die Einheit, in der der Rekord AUFGESTELLT wurde (nicht die
  neueste mit dieser Übung) und hebt die Übung dort per `.hd-step-hl` farbig umrandet hervor.
- **Vollbild-Overlays laufen ueber eine TABELLE, nicht ueber Zweige** (`OVERLAY_SCREENS`,
  Name → Element-ID; 04.09.2026). Vier Stueck: `plan-detail`, `day-detail`, `runplan-detail`,
  `mehr`. `showScreen` raeumt erst alle ab, setzt dann das gefragte auf `.active` und ruft
  `_applyTabState`. Wer ein weiteres Overlay ergaenzt, traegt es dort ein UND prueft die drei
  Stellen in `_applyTabState`: Theme-Zuordnung, Zuruecksetzen des Edit-Kontexts und Renderer.
- **ACHTUNG `.screen.active`:** Die Klasse steht FEST im Markup an `#screen-overview` und wandert NIE
  zu einem anderen Tab — `_applyTabState` fasst sie nicht an, sie ist nur ein Marker. Ein Selektor wie
  `#screen-workouts.active` greift deshalb NIE (Fehler vom 01.09.2026). Fuer andere Tabs `#screen-xy.screen`
  nehmen: passt immer und hat dieselbe Spezifitaet.
- **Querformat (ab 1024px):** Auch der TRAININGS-Tab ist ein 2-Spalten-Grid — Wochenplan links,
  Herocard rechts in derselben Zeile, genau wie in der Uebersicht (Leonard-Wunsch 01.09.2026).
  Dort ist `align-items` ABSICHTLICH nicht auf `start` gesetzt (anders als in der Uebersicht): Die
  Grid-Vorgabe `stretch` haelt beide Karten gleich hoch, an Ruhe- wie an Trainingstagen. Damit die Hoehe
  bis zur Karte durchreicht, sind die Wrapper (`#wo-week-card`, `#wo-session-card-wrap`) Flex-Spalten mit
  `flex:1` am Kind; der Inhalt der Wochenplan-Karte sitzt dabei senkrecht mittig, sonst bliebe unten ein Loch.
  Kopfzeile, Uebungsliste und „Uebung hinzufuegen" spannen ueber beide Spalten. Waehrend einer
  laufenden Einheit ist die Wochenplan-Karte ausgeblendet (`html.wo-running`) — der Kopf der Einheit
  bekommt dann `grid-column: 1 / -1`, sonst bliebe die linke Spalte leer.
  ACHTUNG: Das Ausblenden muss IM Media-Query wiederholt werden. Die globale Regel
  `html.wo-running #wo-week-card { display:none }` hat nur eine ID, die Grid-Regel
  `#screen-workouts.screen > #wo-week-card` hat zwei und gewinnt sonst — die Karte blieb im
  Querformat waehrend der Einheit stehen (Leonard-Meldung 01.09.2026).
  Die STATS-Seite (`#ex-view-stats`) ist ebenfalls ein 2-Spalten-Grid: Volumenentwicklung und Volumen
  pro Muskelgruppe teilen sich die erste Zeile, alles Weitere spannt ueber beide. Dort ist
  `align-items` BEWUSST nicht gesetzt — die Grid-Vorgabe `stretch` haelt die beiden Karten gleich hoch.
  Die Zuordnung laeuft ueber `:nth-child`, nicht ueber die alten `lg-*`-Klassen (die wirken nur im
  Uebersichts-Grid).
- **Querformat (ab 1024px):** Uebersicht ist ein 2-Spalten-Grid — Wochenplan links, Herocard rechts in DERSELBEN
  Zeile (seit 20.08.2026, vorher spannte die Herocard ueber beide Spalten). `align-content: start` ist Pflicht,
  sonst verteilt das Grid die uebrige Bildschirmhoehe auf die Zeilen und zwischen den Karten klaffen ~100px.
  Die FUGE zwischen den beiden Herocard-Knoepfen stand auf 28px, damit sie genau ueber der
  Fuge zwischen den beiden Wochenplan-Karten darunter liegt (Leonard-Wunsch 07.09.2026).
  ACHTUNG: Diese Fuge gibt es seit dem Umbau auf EINE Wochenkarte (07.09.2026) nicht mehr —
  die 28px richten sich an nichts mehr aus und stehen nur noch aus Gewohnheit.
  NUR die Herocard der Uebersicht, sie ist die einzige, die ueber beide Spalten spannt — auf
  der Seite „Laufen" und in der laufenden Einheit steht die Karte in EINER Spalte.
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
  **Rastergroesse (01.09.2026 angehoben, nur das Raster — Titel und Kennzahl der Karte blieben
  unveraendert; am 12.09.2026 auf Leonards Wunsch noch einmal um 20 % vergroessert):**
  Kaestchen 25,2px, Abstand 3,6px, Wochentagsspalte 28,8px, Schrift der Wochentage und
  Monate 15,6px. Rund 10 Wochen sind gleichzeitig sichtbar (vorher 12).
  Die 20 % gelten fuer ALLES im Raster, nicht nur fuer das Kaestchen: Abstand, Wochentagsspalte,
  Monatszeile, die beiden Schriften UND die Marken darin (Insets und Strichstaerken). Nur so
  bleiben die Groessenverhaeltnisse, die weiter unten ausgerechnet sind, unveraendert — ein
  groesseres Kaestchen mit unveraendertem Kern haette den Lauf-Kreis darin verschwinden lassen.
  NICHT mitgewachsen: `--cal-pad-x`/`--cal-pad-y` (Polster, kein Raster) und die Plan-Spuren
  darueber (NAME_H/SPUR_H im JS) — sie gehoeren zur Beschriftung, nicht zum Raster.
  Die Groesse ist FEST und passt sich der Bildschirmbreite NICHT mehr an (Leonard-Wunsch): Das Raster
  ist im Querformat genauso gross wie im Hochformat und scrollt auch dort waagerecht. Die frueheren
  Konstanten `CAL_CELL_DEFAULT`/`CAL_CELL_MIN` und die Schleife, die das Kaestchen bis zum Hineinpassen
  des ganzen Jahres verkleinerte, sind damit entfallen.
  `--cal-cell` und `--cal-gap` sind die EINZIGEN Quellen fuer Kaestchen und Abstand:
  `renderTrainingCalendar` LIEST beide per `getComputedStyle` (setzt `--cal-cell` also nicht mehr selbst)
  und rechnet daraus die Spaltenbreite fuer Plan-Umrandungen und Scrollposition. Standen die Werte
  doppelt da (CSS + JS-Konstante), verschoben sich die Umrandungen gegenueber den Spalten, sobald die
  Seiten auseinanderliefen — je weiter rechts, desto staerker.
  Masse als Variablen in `:root` — beim Aendern NUR die Variable anfassen:
  `--cal-pad-x` (1px, seitliches Polster) → `.cal-body`, `.cal-scroll`, `.cal-detail`;
  `--cal-cell` (25,2px) / `--cal-gap` (3,6px) → die Raster-Regeln UND das JS (beide werden dort gelesen);
  `--cal-pad-y` (5px, Polster oben/unten im Scroller) → `.cal-scroll` UND der obere Abstand der Wochentagsspalte;
  `--cal-label-w` (28,8px) / `--cal-label-gap` (4,8px) → Breite der Spalte und ihr Abstand zum Scroller;
  `--cal-band-over` (4px) = Ueberstand der Plan-Umrandung ueber das Raster → `.cal-band` top/bottom, muss in
  `--cal-pad-y` passen, sonst schneidet `overflow-y: hidden` die Kante ab;
  `--cal-months-h` (19,2px) = feste Hoehe der Monatszeile, `--cal-months-gap` (12px) = ihr Abstand zum Raster.
  Beide zusammen (plus `--cal-pad-y`) sind der obere Abstand der Wochentagsspalte — nur so liegen „Mo" und die
  erste Rasterzeile auf einer Linie. Deshalb eine FESTE Hoehe statt einer gemessenen Schrifthoehe.
  ACHTUNG Platzrechnung: `renderTrainingCalendar` misst `scrollerEl.clientWidth`. Der ist bereits um die
  Wochentagsspalte verkuerzt — sie darf dort NICHT noch einmal abgezogen werden (frueher `- 23`).
  **`.cal-scroll` MUSS ein gewoehnlicher Block bleiben** (in `.cal-body`, ebenfalls ein Block). Kein Flex,
  kein Grid. Platz fuer die Wochentagsspalte macht ein `margin-left`; die Spalte selbst liegt ABSOLUT
  darueber. Vorgeschichte (26.08.-01.09.2026): Als Flex-Kind und danach als Grid-Kind stockte das Wischen
  auf dem iPhone mitten in der Geste. Ein Flex-/Grid-Kind bekommt seine Breite vom Layout-Algorithmus des
  Elternteils, ein Block schlicht vom umgebenden Kasten — nur Letzteres war je erprobt.
  `.cal-scroll` traegt `overscroll-behavior-x: contain`: Ohne das reicht die Wischgeste an
  `#tab-container` (Snap-Scroller) weiter, der Tab wandert mit, rastet zurueck und die Kalenderbewegung
  bricht ab. Preis: Aus dem Kalender heraus laesst sich der Tab nicht per Wisch wechseln.
  `.cal-sticky-anchor` ist ein unsichtbares `position: sticky`-Kind IM Scroller (0x0). Vor dem Umbau sass
  dort die Wochentagsspalte als sticky Element; ein klebendes Kind zwingt WebKit, den Scrollbereich auf
  der Compositor-Ebene zu fuehren. Ohne so ein Kind kann er auf den Hauptthread zurueckfallen und bleibt
  stehen, sobald dort etwas laeuft. NICHT entfernen, ohne auf dem iPhone gegenzupruefen.
  KEIN `touch-action` auf dem Scroller: Der Versuch mit `pan-x` (01.09.2026) hat das Stocken nicht
  behoben und nimmt der Geste in Tabs mit senkrecht scrollender Seite zusaetzlich den Ausweg.
  TESTHINWEIS: Die Scrollposition wird in einem `requestAnimationFrame` gesetzt — in einem versteckten
  Browser-Tab feuert das nie. Zum Pruefen `requestAnimationFrame` voruebergehend synchron machen.
  Wischen selbst ist auf diesem Rechner NICHT pruefbar: Mausgesten loesen es nicht aus, die Browser-
  Ansicht laesst sich nicht einblenden und Xcode (iOS-Simulator, `simctl`) ist nicht installiert.
- **Kalenderkarten sind von der Tipp-Animation ausgenommen** (`#ov-cal-card:active`/`#plans-cal-card:active`
  → `transform: none`, dazu `transition: none`). Ein `transform` auf dem Vorfahren bricht auf iOS die laufende
  Wischgeste in einem Scrollbereich darin ab — das Raster liess sich dadurch gar nicht mehr waagerecht scrollen
  (gefunden 01.09.2026). Gilt fuer jede Karte, die kuenftig einen eigenen Scrollbereich bekommt.
- **Intervalltraining zaehlt zum Laufbereich** (04.09.2026): Die Tabelle „Workout Data" fuehrt neben den
  Laufeinheiten die Kategorie „Hochintensives Intervalltraining" (Spalte `Type`). `istHiit(typ)`
  (`/intervalltraining|hochintensiv|hiit/i`) erkennt sie, `runZeileLesen` laesst sie durch und setzt
  `art: 'hiit'` (sonst `'lauf'`). Im Kalender bekommen diese Tage denselben hellgruenen Kreis wie ein Lauf
  und zaehlen in die Kennzahl der Laeufe mit. Unterschiedlich ist nur die BESCHRIFTUNG, weil eine Strecke
  fehlt: Die Fusszeile zeigt „HIIT: 28min · max. 182 bpm" (Dauer aus `Duration (min)`, Puls aus
  `Max HR`) statt Strecke und Zeit.
  ACHTUNG: `istLauf` allein reicht NICHT — „Hochintensives Intervalltraining" enthaelt keines seiner
  Stichwoerter und wurde vorher stillschweigend weggefiltert.
- **Kennzahl des Kalenders nennt beide Sportarten** (04.09.2026): Zeigt der Kalender beide (Filter
  „Trainingskalender"), steht dort „2026 · 25 Einheiten · 3 Laeufe". In den Einzelansichten bleibt es bei
  einer Zahl (Gymkalender: Einheiten, Laufkalender: Laeufe). Die Zahl der Laeufe wird IMMER gerechnet,
  angehaengt aber nur bei `modus.kraft && modus.lauf`.
- **Der Kalendertitel traegt die Farbe der angezeigten Sportart** (06.09.2026):
  Gymkalender #0F766E, Laufkalender #4ADE80, „Trainingskalender" (beide) in der normalen
  Textfarbe. Gesetzt wird eine KLASSE (`.cal-titel-gym` / `.cal-titel-lauf`) in
  `renderTrainingCalendar`, keine Inline-Farbe — die schluege sonst die Glas-Regel, die den
  Titel im Transparenz-Modus weiss setzt (dort bleibt er bewusst weiss, Dunkelgruen waere auf
  dem Schleier kaum lesbar). Die CSS-Regeln MUESSEN hinter `.cal-filter-btn` stehen: Dessen
  `color: inherit` hat dieselbe Spezifitaet und gewaenne sonst allein durch die Reihenfolge.
  Gilt fuer beide Kalender, auch den im Plan-Tab.
  **AUCH DIE KENNZAHL OBEN RECHTS TRAEGT DIE SPORTFARBEN — nur in der UEBERSICHT** (19.09.2026,
  Leonard-Wunsch): je TEIL eine eigene Farbe — „Gym 83 %" dunkelgruen, „Lauf 92 %" hellgruen, der
  Trennpunkt in der Grundfarbe; im Gym- bzw. Laufkalender die ganze Zahl in der Farbe seiner
  Sportart, ebenso in der Jahresansicht („0 Einheiten · 1 Lauf"). `renderTrainingCalendar`
  setzt die Teile dafuer als Spans (`.cal-stat-gym` / `.cal-stat-lauf`, `innerHTML` statt
  `textContent`, die Texte laufen durch `escapeHtml`); gefaerbt wird nur in `#ov-cal-card`.
  Der Kalender im PLAN-TAB bleibt grau — dort war es nicht verlangt, die Spans sind ohne Wirkung.
  Im Transparenz-Modus setzt eine Glas-Regel die Farbe zurueck (`inherit`), die Kennzahl bleibt
  dort wie vorher (keine Sportfarben, siehe „Keine Sportfarben im Transparenz-Modus").
  GEMESSEN: alle drei Filter in „Aktuell" und 2025 — Text unveraendert, Gym rgb(15,118,110),
  Lauf rgb(74,222,128); Plan-Tab grau; Glas 65-%-Weiss wie der Rest der Kennzahl.
- **DER WECHSEL DER KALENDERANSICHT BLENDET EIN** (`_calRasterBlende`, 16.09.2026, seit dem
  18.09.2026 in dieser Form — Leonard-Entscheidung „Nur einblenden"): Ein Tipp auf den Titel
  (Filter) oder den Zeitraum zeichnet SOFORT neu, und alles UNTER der Kopfzeile blendet aus dem
  Durchsichtigen ein (`CAL_EIN_MS` 300ms, schnell anlaufende Kurve `CAL_EIN_KURVE`). Es gibt KEIN
  Ausblenden vorher und damit keinen leeren Moment.
  VORGESCHICHTE: Vom 16. bis 18.09.2026 blendete der alte Kalender erst aus (110 → 80ms) und der
  neue dann ein (190 → 140ms) — das las sich wie ein Blinzeln. `CAL_BLENDE_AUS_MS` ist entfallen.
  Titel, Zeitraum und Kennzahl bleiben stehen — sie sind der Schalter, den man antippt.
  Gefahren werden die Kinder der Kalenderkarte AUSSER `.chart-card-v2-head`, also `.cal-body`
  (Wochentagsspalte, Raster, Planbeschriftung) und `.cal-foot`.
  NUR die Deckkraft: Ein Schub waere im Raster unruhig, und ein `transform` auf dem Vorfahren
  bricht auf iOS die Wischgeste im Scrollbereich ab (siehe „Kalenderkarten sind von der
  Tipp-Animation ausgenommen").
  Im Einsatz bei `toggleCalFilter`, `setCalJahr` (also auch `wechselCalJahr`) und
  `calZurAktuellenAnsicht` — in BEIDEN Kalendern. Jeder andere Aufruf von
  `renderTrainingCalendar` (Tabwechsel, Datenaenderung) zeichnet weiterhin ohne Blende.
  Ein weiterer Tipp bricht die laufende Blende ab und beginnt neu. Der gemeinsame Kern ist seit
  dem 18.09.2026 `_neuZeichnenEinblenden(schluessel, huelle, teile, zeichnen)` — ihn nutzt auch
  die Wochenplankarte der Uebersicht (siehe dort); `_calBlendeNr` ist in dessen Nummer je
  Schluessel aufgegangen.
  GEMESSEN (echte Tipps): Titel sofort „Gymkalender", `.cal-body` und `.cal-foot` je eine
  Bewegung 0 → 1 in 300ms, Kopf ohne Bewegung; dreimal in 50ms-Abstand → Endzustand sauber.
- **DIE HOEHE DER KALENDERKARTE IN DER UEBERSICHT BLEIBT, WIE SIE IST — sie darf beim
  Filterwechsel springen** (Leonard-Entscheidung 18.09.2026). Am 18.09.2026 gab es ZWEI Anlaeufe,
  beide noch am selben Tag komplett zurueckgenommen (v355 und v356, Rueckbau in v357):
  1. Platz freihalten fuer die voellste Ansicht aller Filter und Jahre (`_calZonenReserve`,
     Luft ueber den Monatsnamen) — „die Karte ist sehr hoch, die Inhalte nicht mehr kompakt".
  2. Nur die Kennzahl immer in eine eigene zweite Zeile (`#ov-cal-card .cal-head-right
     { flex-basis: 100% }`) — „das gefaellt mir nicht".
  Mit ihnen fielen die Hilfsfunktionen `_calRaster`, `_calPlanStuecke`, `_calZonen` und
  `CAL_SPUR_MASSE` wieder weg; der Renderer steht wie vor dem 18.09.2026.
  URSACHEN des Sprungs, falls das Thema wiederkommt (gemessen auf 375px, je ein Gym- und ein
  Laufplan): Die KOPFZEILE bricht nur um, wenn Titel und Kennzahl nicht nebeneinander passen —
  der Laufkalender ist einzeilig (337px), Trainings- und Gymkalender zweizeilig (362/364px).
  Dazu die PLANZEILEN: ueber dem Raster 19px (zwei Balken ohne Namen) gegen 29px (Name plus ein
  Balken), darunter 20 gegen 12px — netto 2px, das Raster rueckt um 10px.
  NICHT erneut angehen, ohne Leonard vorher eine Loesung zu zeigen.
- **Lesehilfe im Trainingskalender:** `.info-btn` neben der Kennzahl oben rechts (`.cal-head-right` fasst beide
  zusammen) oeffnet `#modal-cal-info`. **Seit dem 14.09.2026 NUR NOCH IM PLAN-TAB** (Leonard-Wunsch).
  In der UEBERSICHT steht an derselben Stelle ein Knopf ZURUECK ZUR ERSTANSICHT (`.cal-reset-btn`,
  `calZurAktuellenAnsicht`): dieselbe runde 19px-Form mit einem Kreispfeil (`CAL_RESET_SVG`). Ein Tipp
  setzt Filter „Trainingskalender", Zeitraum „Aktuell" UND die Startposition — auch wenn Filter und
  Zeitraum schon stimmen, man hat vielleicht weggescrollt. Ohne laufenden Plan landet er beim laufenden
  Jahr (so zeigt 'aktuell' dann). `calendarInnerHTML` waehlt den Knopf nach der Kalender-Id.
  Ebenfalls seit dem 14.09.2026 zeigt die Uebersicht KEINE Wochenserie mehr in der Kennzahl
  (`id === 'cal'` in der `streak`-Bedingung) — sie steht nur noch im Kalender des Plan-Tabs. Die Farb-Legende steht NUR dort, nicht mehr in der Karte — dadurch ist die
  Karte rund 100px flacher. Das Polster des Fussbereichs sitzt auf `.cal-detail`, damit die Karte ohne ausgewaehlten
  Tag direkt unter dem Raster endet.
- **Lesehilfe „Volumen pro Muskelgruppe":** `.info-btn` neben dem Kartentitel öffnet `#modal-muscle-info`.
  `margin-right:auto` hält den Knopf am Titel — `.chart-card-v2-head` verteilt seine Kinder sonst auf beide Ränder.
- **Katalog-Filter „nur aus dem aktiven Plan":** `toggleExPlanFilter()` / `exPlanFilterAn` / `exIdsImAktivenPlan()`,
  Knopf `#ex-plan-filter-btn` links neben „Alle ein-/ausklappen". Der Zustand wird BEWUSST nicht gespeichert — ein Filter, Beim Einschalten werden die Gruppen mit aufgeklappt
  (`collapsedExGroups.clear()`) — sonst bliebe die verkuerzte Liste hinter zugeklappten Kopfzeilen verborgen.
  der einen Neustart überlebt, lässt den Katalog später unerklärlich leer wirken.
- **Gymtage stehen als DREIER-RASTER, nicht als volle Zeilen** (`#libdays-list` als Grid mit
  `repeat(3, minmax(0, 1fr))`, Leonard-Wunsch 07.09.2026). Das Raster sitzt auf der LISTE, die
  Kacheln (`.pld-kachel`) verlieren dafuer ihren eigenen Seitenrand — nur so sind alle drei
  exakt gleich breit (109px auf 375px) und der Abstand zum Bildschirmrand bleibt bei 14px.
  `minmax(0, 1fr)` ist Pflicht: Ein blosses `1fr` ist `minmax(auto, 1fr)` und laesst die Spalte
  auf die Mindestbreite ihres Inhalts wachsen — „Shoulder/Legs" sprengte damit seine Spalte
  (130 statt 111px) und schob die dritte Kachel ueber den rechten Rand.
  Archiv-Knopf und Leermeldung spannen ueber alle drei Spalten und muessen ihre eigene Breite
  samt Raendern zuruecksetzen (der Archiv-Knopf traegt sonst `width: calc(100% - 28px)`).
  HOEHE 113px — 20% mehr als die fruehere vollbreite Karte (94px), und die Schriften darin
  wachsen im selben Verhaeltnis mit: Name 12→14,4px, Meta 11→13,2px (Leonard-Wunsch
  07.09.2026; die erste Fassung behielt die 94px).
  Was auf 109px NICHT mehr hineinpasst und deshalb entfallen ist: der Pfeil „›" (kostet Breite,
  sagt nichts) und der Chip „Im aktuellen Plan" (95px Text) — Letzterer ist ein PUNKT
  (`.pld-dot`) UNTEN rechts geworden, mit der Langfassung im `title`. Unten, weil er oben dem
  Namen 12px nahm und „Ganzkörper" damit auf den Pixel genau nicht mehr passte.
  Uebungen und Saetze stehen UNTEREINANDER statt durch „•" getrennt — nebeneinander braechen
  sie ohnehin um, aber an beliebiger Stelle.
  TEXTUMBRUCH, vier Fallen auf einmal: (1) `.pd-name` ist `inline-block` — ein zu langes Wort
  macht die BOX breiter, statt umzubrechen, und lief sichtbar aus der Karte; in der Kachel
  deshalb `display: block`. (2) `.pd-name` bringt neben dem 3px-Balken 9px Innenabstand mit —
  in der Kachel auf 5px reduziert, sonst bleiben nur 81px Text. (3) `overflow-wrap: break-word`
  trennt notfalls mitten im Wort; das ist seit der hoeheren Kachel vertretbar (Platz fuer zwei
  Zeilen), bei 94px war es das nicht und dort stand `normal` samt Abschneiden. (4) Ein
  Schraegstrich ist KEINE Trennstelle: „Shoulder/Legs" gilt als ein Wort und brach als
  „Shoulder/Leg | s". Das JS setzt deshalb nach jedem Schraegstrich ein `<wbr>` — reine
  Anzeigesache, gespeichert bleibt der Name unveraendert. Die Reihenfolge ist wichtig:
  ERST `escapeHtml`, DANN das `<wbr>` einsetzen.
  Dazu `hyphens: auto` fuer ein ueberlanges Einzelwort ohne Trennstelle — trennt nach
  deutschen Regeln mit Bindestrich („Ganzkörper-krafttraining"), moeglich weil
  `<html lang="de">` gesetzt ist.
- **Übungskatalog:** nur noch Gruppierung nach Muskelgruppen — Sortierung nach Trainingstagen samt Umschalter wurde entfernt.
- **Die Uebungsliste hat KEINE Tipp-Animation** (12.09.2026, Leonard-Wunsch): `.ex-list` ist
  aus der Sammelregel `.card, … { transition: transform }` / `:active { transform: scale(.995) }`
  herausgenommen. Sie ist die Karte um ALLE Uebungen einer Muskelgruppe — ein Tipp auf eine
  einzelne Zeile stauchte damit den ganzen Block, obwohl sich nur diese eine Zeile auf- oder
  zuklappt. Der Muskelgruppen-Knopf darueber (`.ex-group-btn`) BEHAELT seine Animation, er ist
  ein einzelnes Bedienelement.
  Betrifft alle drei Stellen mit `.ex-list`: Katalog, Uebungsliste im Trainingstag-Modal und
  der Uebung-hinzufuegen-Dialog. In `TIPP_ANIM_KARTEN` steht `.ex-list` weiter drin — sie dort
  zu fuehren kostet nichts, seit sie keine Animation mehr hat.
- **Kopf der Uebersicht:** Reihenfolge rechts = Sicherungs-Chip, Zahnrad (Einstellungen), Glas-Knopf
  (Leonard-Wunsch 01.09.2026, vorher umgekehrt). Beide Knoepfe sind `.ph-gear`.
- **DER WECHSEL IN DEN TRANSPARENZ-MODUS UND ZURUECK BLENDET UEBER** (`toggleGlasModus`,
  21.09.2026, Leonard-Wunsch): Der ganze Bildschirm blendet in 0.3s vom alten in den neuen Modus
  — die Variante „Ueberblendung", die am 18.09.2026 neben dem Kreis zur Wahl stand.
  GEBAUT MIT DER VIEW TRANSITIONS API: `document.startViewTransition(umschalten)` fotografiert den
  alten Zustand, `umschalten` setzt den Modus und zeichnet die Diagramme neu, und die
  STANDARD-Kreuzblende des Browsers blendet vom einen ins andere. Die Klasse `glas-blende` setzt
  nur deren Dauer (`html.glas-blende::view-transition-old/new(root) { animation-duration: 300ms;
  animation-timing-function: ease }`, `GLAS_BLENDE_MS` im JS muss dazu passen) und haengt nur
  fuer diesen einen Wechsel am Dokument; eine Notbremse raeumt sie spaetestens nach 700ms ab.
  `vt.ready.catch(() => {})` ist Pflicht: Ueberspringt der Browser den Uebergang (verdeckte
  Seite), scheitert `ready`, und unbehandelt stuende das als Fehler in der Konsole.
  Waehrend der 0.3s nimmt die Seite keine Tipps an (die Ebene des Browsers liegt darueber).
  RUECKFALL: Ohne die API (iOS vor 18) und bei `prefers-reduced-motion` springt es.
  VORGESCHICHTE (18.–21.09.2026): Der neue Modus breitete sich als wachsender Kreis aus dem
  Glas-Knopf aus (`clip-path: circle()` auf `::view-transition-new(root)`, `GLAS_KREIS_MS` 500ms,
  Klasse `glas-kreis` mit abgeschalteter Standard-Blende). Wer ihn zurueck will: Commit 7fb92af.
  GEPRUEFT: Regel greift, Modus schaltet hin und zurueck, Knopf und Speicher folgen, Klasse danach
  weg, keine Konsolenfehler. NICHT gesehen: die Blende selbst — die Browser-Ansicht war verdeckt,
  und dann ueberspringt der Browser jede View Transition (TESTHINWEIS: `document.visibilityState`
  pruefen; bei 'hidden' laeuft keine).
- **KEINE SPORTFARBEN IM TRANSPARENZ-MODUS in Wochenplan- und Kalenderkarten** (18.09.2026,
  Leonard-Wunsch „um die Sichtbarkeit zu erhoehen" — Dunkelgruen und Hellgruen gingen auf dem
  Farbverlauf unter). Im EINZELNEN:
  - KOMBI-KARTE der Uebersicht: absolviert in BEIDEN Reihen weiss gefuellt (92 %), offen mit
    weissem Ring — dieselben Werte wie die Kreise der Einzelkarten. Welche Reihe welcher Sport
    ist, sagen die Symbole davor.
  - Die EINZELKARTEN (Gym-/Laufwoche, Plan-Tab) waren schon weiss. Der Wochentag IM weissen
    Kreis bleibt farbig (`--accent-dark`) — weiss auf weiss waere er unlesbar.
    NACHTRAG 21.09.2026 (Leonard-Wunsch): Auch ein absolvierter Tag OHNE Plan (Lauf oder freies
    Training an einem ungeplanten Tag, nur `.done`, kein `.training`) ist jetzt weiss — er blieb
    als einziger Kreis hell- bzw. dunkelgruen. Dabei fiel ein zweiter Fehler auf: Ist dieser Tag
    HEUTE, setzte `.ppv-col.today:not(.training) .ppv-wd` seine Schriftfarbe — hell Akzentgruen
    auf der gruenen Scheibe, im Glas-Modus weiss auf weiss. Beide Fassungen tragen jetzt
    zusaetzlich `:not(.done)`. GEMESSEN (Datum auf Di gesetzt, Di ungeplant und gelaufen): hell
    #4ADE80 mit weisser Schrift, Glas 92-%-Weiss mit #059669.
  - KALENDER: Gym-Quadrat (geplant = Umriss, absolviert = Fuellung) HALBWEISS (60 %), Laufkreis
    (gelaufen = Fuellung, geplant = Ring) VOLL weiss. Die Abstufung ist Pflicht: Der Laufkreis
    sitzt MITTEN im Quadrat — beide voll weiss, und ein Tag mit Gym UND Lauf saehe aus wie ein
    reiner Gymtag. Dieselbe Rangfolge wie im hellen Modus, wo der Kreis heller ist als das
    Quadrat. Ein absolvierter Tag ist meist auch geplant; seine Fuellung setzt deshalb den Ring
    ab (`box-shadow: none`), sonst laege er als hellerer Rand auf der Flaeche.
  - Planname und Planbalken ueber und unter dem Raster WEISS (Leonard-Entscheidung), ebenso die
    beiden Spalten der Kalender-Fusszeile. Der Kalendertitel war schon weiss.
  - FARBIG BLEIBEN (Leonard-Entscheidung): der Wettkampftag (hellgruenes Kaestchen) und die
    rote Woche ohne Training — beide faerben das ganze Kaestchen und tragen eine eigene Aussage.
    Die Herocards gehoerten nicht zum Wunsch und behalten ihre Knopffarben.
  GEMESSEN/GESEHEN: Trainings- und Gymkalender samt Fusszeile und Planbalken, Kombi-Karte; ein
  Tag mit Gym und Lauf zeigt den weissen Kreis im halbweissen Quadrat.
- **Einheitliches Kartenpolster: 14px** (01.09.2026, Vorbild „Trainingskalender"). Gilt fuer jede
  Karte, die die volle Breite einnimmt — auch fuer die Zeilen INNERHALB einer Karte, die ihr Polster
  selbst tragen (`.plan-day-row`, `.mehr-row`, `.plan-day-empty`, `.trash-empty`, `.program-form-row`,
  `#drive-disconnected`/`#drive-connected`, `.aex-v2-body`, `.ex-item-body`). Vorher standen dort
  12px, 16px und 18px nebeneinander.
  ACHTUNG bei Listen, die IN einer bereits gepolsterten Karte liegen (`.pr-list-v2`,
  `.muscle-bars-v2`): Die brauchen seitlich 0 — mit eigenen 16px stuenden ihre Zeilen 30px vom
  Kartenrand und damit weiter innen als der Titel darueber.
  Die Wochenplan-Karte (`.plan-card-v2`) hat denselben Eckenradius wie die uebrigen grossen Karten
  (18px statt frueher 14px). 14px behalten bewusst die Listen-Karten: `.ex-list`, `.mehr-card`,
  `.aex-v2`, `.plan-list-row`.
  **Im QUERFORMAT (ab 1024px) steht der seitliche Rand in EINER Regel** — der Selektorliste mit
  `max-width: none; margin-left/right: 14px`. Jede Karte, die dort in einer Spalte steht, MUSS
  darin aufgefuehrt sein; fehlt sie, faellt sie auf das 12px-Polster ihres Grids zurueck und steht
  2px weiter aussen als ihre Nachbarin. Genau so war `.plan-card-v2` durchgerutscht
  (Leonard-Meldung 06.09.2026). Im Hochformat faellt so etwas NICHT auf, weil dort nie zwei Karten
  nebeneinander liegen — beim Ergaenzen einer neuen Karte also im Querformat gegenmessen.
- **Abstaende ZWISCHEN Karten im Querformat: Margins kollabieren im Grid NICHT** (06.09.2026).
  Im Hochformat verschmelzen der untere Abstand der oberen und der obere Abstand der unteren Karte
  zu einem einzigen Zwischenraum, im Grid addieren sie sich. Auf der Seite „Laufen" standen so
  24px zwischen `.chart-card-v2` und `.lauf-tag-karte`, waehrend alle anderen Paare 12px hatten.
  REGEL: Der senkrechte Abstand kommt IMMER von der Karte DARUEBER (`margin-bottom`), eine Karte
  setzt sich keinen eigenen `margin-top` (`.lauf-tag-karte { margin-top: 0 }`).
- **Herocards (`.hero-v2`) haben KEINE Kontur** (01.09.2026) — im Glas-Modus zog sie eine weisse Linie
  um die Karte. Abgegrenzt wird allein ueber den Schatten.
- **Alle vier TAB-Kopfzeilen sind gleich hoch** (`--ph-h`, 64px als `min-height` auf
  `.ph:not(.plan-detail-ph):not(.ph-with-back)`, 01.09.2026). Ohne das richtete sich jede nach ihrem
  Inhalt — Uebersicht 64px, Uebungen/Plaene 60px, Training 54,5px — und die erste Karte bzw. der
  Seitenschalter darunter sprang beim Tabwechsel um bis zu 10px. Der Wert ist die natuerliche Hoehe
  der Uebersicht: 16px Polster + 38px Knopf + 2px Rand + 8px. Die Vollbild-Overlays sind ausgenommen.
  **Alle Knoepfe oben rechts sind gleich gross und stehen an derselben Stelle** (01.09.2026):
  `--ph-btn` (38px) gilt fuer `.ph-gear` (Zahnrad, Glas), `.ex-sort-btn` (Filter, Alle ein-/ausklappen),
  `.ex-add-btn` (Neu) und als `min-height` fuer den Sicherungs-Chip — vorher standen 36px und 38px
  nebeneinander. `--ph-h` haengt an diesem Wert (16 + 38 + 2 + 8).
  Die Tab-Kopfzeile richtet ihre Kinder ueber `align-items: flex-end` an der UNTERKANTE aus: Damit
  liegen Knoepfe und Tab-Titel auf einer Linie und sitzen in jedem Tab an derselben Stelle (Knopf-
  und Titel-Unterkante bei 64px ab Screen-Oberkante, erste Karte bei 72px).
  `.ph-right` und `.ph-gear` haben dafuer ihre eigenen `margin-top` verloren — mit `flex-end` haetten
  sie keine Wirkung mehr, und vorher sassen die Knoepfe dadurch 1px tiefer als der Chip.
  ACHTUNG: Die Unterzeilen (`.ph-sub`) sind in allen vier Tabs per Inline-Style ausgeblendet und
  werden nie eingeblendet (das JS setzt nur ihren Text). Wuerde eine sichtbar, waere SIE buendig mit
  den Knoepfen und der Titel rutschte nach oben.
- **Reihenfolge in den Einstellungen** (05.09.2026, Leonard-Vorgabe): Cloud-Sync · Laufdaten ·
  App-Version · Papierkorb · Daten & Sicherheit. Im QUERFORMAT steht Cloud-Sync allein in der
  linken Spalte, die vier uebrigen stapeln rechts — dieselbe Reihenfolge wie im Hochformat.
  Die Spalten sind je ein BEHAELTER (`.mehr-spalte` in `.mehr-spalten`), KEIN gemeinsames Grid
  auf dem Screen. Im gemeinsamen Grid lagen linke und rechte Karte in derselben ZEILE, deren
  Hoehe die hoehere von beiden bestimmt: Unter der kurzen „Laufdaten"-Karte klaffte eine Luecke
  bis zur Unterkante von Cloud-Sync, und die drei folgenden Karten begannen erst darunter
  (Leonard-Meldung 05.09.2026). Mit eigenen Behaeltern stapelt jede Spalte fuer sich.
  Im Hochformat sind beide gewoehnliche Bloecke — die Reihenfolge im Markup ist damit auch die
  Reihenfolge auf dem Bildschirm. Die Klassen `lg-col1`/`lg-col2` gelten seither NUR noch im
  Uebersichts-Grid.
- **Übersicht:** Sicherungs-Status als Chip im Kopf neben dem Titel (`renderBackupLine` → `#ov-backup-line` in `.ph-right`, Klasse `.backup-chip`; kurze Texte wegen des knappen Platzes, ausführliche Fassung im `title`-Attribut), Einstieg ins freie Training (`startFreeWorkout`, Einheit ohne `planDayId`).
- **ENTFERNT am 06.09.2026 (Leonard-Wunsch, ersatzlos):** der Hinweis „Dein Plan endet in N Tagen"
  (`renderPlanEndNotice`, `extendActivePlan`, `#ov-plan-end-notice`, `.plan-end-notice`) und die
  Zeile „N Wochen in Folge vollstaendig" in der Wochenplan-Karte (`.ppv-streak`).
- **Die Wochenserie steht im KALENDER der jeweiligen Sportart** (06.09.2026): Gymkalender zeigt
  `getWeekStreak()` (Krafteinheiten gegen die geplanten Trainingstage), Laufkalender
  `getRunWeekStreak()` (Laeufe gegen die Lauftage des aktiven Laufplans — neu, gleiches Prinzip,
  eigene Funktion, weil die Datenmodelle nichts teilen). Im gemeinsamen Trainingskalender bleibt
  sie WEG: Dort stuenden zwei Serien nebeneinander, ohne dass erkennbar waere, welche welche ist.
- **Ende der Satzpause** meldet sich dreifach: Vibration, Ton und sichtbare Meldung „Pause vorbei" (5 s, `.done`).
  Grund fuer den Aufwand: `navigator.vibrate` gibt es auf dem iPhone NICHT (Safari unterstuetzt die Vibration-API auf
  keiner Plattform), und der Ton schweigt bei aktivem Klingelschalter. Der Ton ist ein Zweiklang aus dem WebAudio-
  Oszillator (`playRestDoneSound`); `initAudioUnlock` faengt jeden `pointerdown` ab und weckt den Audio-Kontext —
  iOS gibt Ton nur nach einer echten Nutzergeste frei. KEINE Audiodatei, damit nichts nachgeladen werden muss.
- **BLAETTER SCHLIESSEN SICH MIT BEWEGUNG** (16.09.2026, Leonard-Wunsch): Bis dahin fuhren die
  Bottom-Sheets beim Oeffnen herein (`@keyframes slideUp`) und verschwanden beim Schliessen
  schlagartig — nur das Herunterwischen hatte eine Bewegung. Jetzt faehrt das Blatt hinunter und
  der Schleier blendet aus (`.overlay.schliesst`, `@keyframes slideDown`/`ov-aus`, 200ms).
  `closeModal(id, ohneBewegung)` setzt die Klasse und erst nach `MODAL_AUS_MS` das `hidden`;
  `_modalZu` macht das eigentliche Schliessen SAMT der Nacharbeit (Diagramme der
  Einheiten-Detailansicht abraeumen, Modus-Uebergang nach der Abschlussansicht) — die laeuft
  damit erst, wenn das Blatt weg ist.
  VIER Dinge, die daran haengen:
  1. KEIN `animationend`: Bei `prefers-reduced-motion` laeuft keine Animation, das Ereignis kaeme
     nie und das Blatt bliebe stehen (dieselbe Falle wie bei der Seitenleiste). Es ist ein
     Wecker, und `MODAL_AUS_MS` MUSS zur `animation`-Angabe im CSS passen.
  2. Das HERUNTERWISCHEN ruft `closeModal(id, true)` — das Blatt liegt schon unten, eine zweite
     Fahrt liesse es erst wieder nach oben springen.
  3. `openModal` schliesst ein gerade abfahrendes Blatt SOFORT ab (`_modalZu`): Sonst laegen zwei
     Schleier uebereinander (z. B. „Einheit beenden?" und die Abschlussansicht direkt danach),
     und der Wecker des alten traefe das neue.
  4. Ein Token am Element (`ov._zuNr`) entwertet einen laufenden Wecker, wenn dasselbe Blatt
     inzwischen wieder geoeffnet wurde.
  GEMESSEN: Klasse gesetzt und `pointer-events: none` sofort, `hidden` nach der Fahrt, danach
  keine Reste; erneutes Oeffnen sauber; Wischweg schliesst ohne Fahrt.
- **DIE SATZPAUSE FAEHRT EIN UND AUS** (16.09.2026, Leonard-Wunsch) — vorher erschien und
  verschwand sie schlagartig (`display: none` ↔ `block`). Jetzt steht sie immer im Fluss, ist aber
  nach unten geschoben und unsichtbar (`transform: translateY(110%)`, `visibility: hidden`);
  `.show` faehrt sie in 260ms herein. `visibility` schaltet ueber eine VERZOEGERTE Transition
  (`visibility 0s linear .26s`) erst am Ende der Fahrt um — ohne das waere sie waehrend des
  Abfahrens schon weg. Dasselbe Muster wie bei den Vollbild-Overlays.
  Der INHALT wird erst nach der Fahrt geleert (`_restLeisteAus`, `REST_FAHRT_MS` — muss zur
  Transition passen): Sonst faehrt ein leerer gruener Streifen ab. Kommt die Pause vorher zurueck
  (`renderRestBar`, `showRestDone`), wird der Wecker abgebrochen.
  GEMESSEN: Ruhezustand `translateY(66px)` und `visibility: hidden`; laufende Pause sitzt exakt
  ueber dem unteren Rand (752–812px bei eingeklappter Nav, 60px hoch); nach dem Stoppen bleibt der
  Inhalt 260ms stehen und ist danach leer.
  TESTHINWEIS: In der versteckten Browser-Ansicht laufen Transitions nicht — `visibility` bleibt
  dort auf `visible` stehen. Zum Pruefen der Endlage `transition: none` setzen und einen Reflow
  erzwingen.
- **Satzpause** (`#rest-bar`) hat exakt die Geometrie der Bottom-Nav: volle Breite, Hoehe `--nav-h`, gleiche Notch-Polster.
  Nav sichtbar → sitzt buendig darueber; Nav ausgeblendet → `.nav-hidden` setzt sie auf `bottom:0` und ergaenzt das
  `--safe-b`-Polster, sie nimmt also den Platz der Nav ein. `setNavHidden` in `initScrollHideNav` schaltet die Klasse
  auf Nav, Laufanzeige UND Pausenleiste.
  Die Pille steht IMMER darueber: ein einziger Wert (`--nav-h * 2 + --safe-b + 10px`) genuegt fuer beide Nav-Zustaende,
  weil ihre eigene `.nav-hidden`-Verschiebung sie um genau die Nav-Hoehe mitnimmt.
- **Laufanzeige waehrend einer Einheit** (`#workout-active-bar`, sichtbar nur AUSSERHALB des Workouts-Tabs):
  ERSCHEINT UND VERSCHWINDET SEIT DEM 18.09.2026 MIT BEWEGUNG (Leonard-Wunsch): Beim Tabwechsel
  taucht sie von unten auf und blendet ein (250ms) bzw. taucht ab und blendet aus (200ms). Vorher
  `display: none`. Gefahren wird `translate` (18px) — `transform` gehoert dem Mitwandern mit der
  Bottom-Nav. `visibility` schaltet verzoegert erst am Ende um. Beim Wisch AUS dem Trainings-Tab
  erscheint sie an der 50-%-Schwelle (Theme-Klasse am body), beim Wisch HINEIN verschwindet sie
  beim Einrasten (`wo-running` aus `syncWorkoutActiveUI`). Start und Ende einer Einheit schalten
  weiter ohne Bewegung (`html.workout-active` → `display`).
  GEMESSEN: im Trainings-Tab Deckkraft 0 und `hidden`; nach dem Wechsel in die Uebersicht laufen
  Deckkraft und Versatz (250ms), danach 1/none/visible; zurueck laufen sie in 200ms, danach
  0/18px/hidden.
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
  gefuellt von `renderWorkoutWeekStrip`) und Plaene-Tab. Unterschiedlich ist nur, was ein Tipp
  ausloest — gesteuert ueber `opts`.
  **Ein Wochentag hat NUR dann einen eigenen Tipp, wenn der Aufrufer einen nennt**
  (`opts.dayOnTap`; vereinheitlicht 06.09.2026 — vorher fiel die Funktion ohne Angabe auf
  `jumpToWorkoutDay` zurueck). Genau dieselbe Regel gilt in `buildRunPlanCard`; die beiden
  Karten verhalten sich damit gleich. Ohne Angabe faellt der Klick auf die KARTE durch, die
  ganze Kachel ist EIN Ziel. Das ist der Normalfall — nur eine von drei Stellen setzt `dayOnTap`:

  | Ort | Tipp auf die Karte | Tipp auf einen Wochentag |
  |---|---|---|
  | Uebersicht, Gym | Trainings-Tab, Seite „Gym" | wie Karte |
  | Uebersicht, Lauf | Trainings-Tab, Seite „Laufen" | wie Karte |
  | Uebersicht, LEER (kein Plan) | Plan-Tab — dort legt man einen an | wie Karte |
  | Trainings-Tab | **nichts** | waehlt den Tag AUS (`selectWorkoutDay` / `selectRunDay`) |
  | Plaene-Tab | Detailansicht des Plans | wie Karte |

  Die Uebersicht fuehrt seit dem 09.09.2026 in den TRAININGS-Tab (vorher in den Plan-Tab,
  Leonard-Wunsch). Damit verhalten sich alle drei Zustaende der Wochenkarte gleich — der
  gemeinsame Zustand fuehrt seine Reihen schon seit dem 08.09.2026 dorthin. Aus der
  Wochenuebersicht will man zum Training, nicht in die Planbearbeitung.
  AUSNAHME sind die LEEREN Karten: Dort steht „Tippe, um einen Plan anzulegen", und anlegen
  kann man ihn nur im Plan-Tab. `buildRunPlanCard` zeichnet ihre leere Fassung selbst und
  faellt auf ihr Standardziel zurueck, wenn kein Ziel genannt ist — `renderWochenKarte`
  nennt deshalb nur bei vorhandenem Plan eines.

  Im Trainings-Tab wird der gewaehlte Tag zusaetzlich markiert (`opts.selectedIdx` →
  `.ppv-col.selected`) — die Auswahl steuert dort, welcher Tag darunter erscheint. Nur deshalb
  braucht diese eine Stelle den eigenen Tipp: Man ist schon auf der Seite, die den Tag zeigt.
  **Die Karte selbst ist dort STUMM** (`onTap: false`, 06.09.2026, Leonard-Wunsch): Sie ist
  hier der Tagesumschalter, ein Tipp auf den Balken soll nicht in den Plan-Tab wischen.
  `onTap === false` ist der einzige Weg, den Karten-Tipp ganz wegzulassen — `null` und
  Weglassen bedeuten „Standardziel". Beide Kartenbauer kennen die Regel.
  Eine stumme Karte bekommt die Klasse `.karte-inert`, die ihr Zeigefinger UND Tipp-Animation
  nimmt (`cursor: default`, `:active { transform: none }`, zwei Klassen — schlaegt die
  Sammelregel fuer alle Karten). Ohne das staucht sich die Karte bei jedem Tipp daneben,
  obwohl nichts geschieht; das liest sich wie ein kaputter Knopf. Ihre WOCHENTAGE behalten
  den Zeigefinger ueber `.karte-inert .ppv-col[role="button"]`.
  AUSNAHME: Die LEERE Karte („Kein aktiver Laufplan / Trainingsplan") bleibt immer antippbar,
  auch bei `onTap: false` — sie ist eine Aufforderung zum Anlegen, stumm gestellt gaebe es
  von dort keinen Weg weiter.
  BEIDE Aenderungen gehen auf Leonard zurueck (06.09.2026). In der Uebersicht sprang ein Tipp
  auf einen Wochentag vorher in den Trainings-Tab, waehrend die Karte selbst auf der ZULETZT
  gewaehlten Plan-Seite landete — zwei Ziele in einer Kachel, und keines davon vorhersehbar.
  Im Plaene-Tab wischte der Wochentag in einen FREMDEN Tab, obwohl jede andere Stelle der
  Liste die Bearbeitung oeffnet.
  Die Uebersicht setzt ausserdem die Zielseite selbst (`setPlansView(seite);wischeZuTab('plans')`),
  sonst landete man auf der zuletzt offenen Plan-Seite statt auf der zur Sportart passenden.
  Der frueher eigene Streifen (`buildWpCol`/`buildWpInfo`/`renderNext7Strip`/`selectOverviewDay`, Klassen `.wp-*`)
  wurde am 20.08.2026 entfernt — er hatte danach keinen Aufrufer mehr. ACHTUNG beim Aufraeumen: Die Regel fuer den
  Erledigt-Haken war eine Selektorliste (`.ppv-col.done …, .wp-col.done …`) — dort durfte nur der tote Teil weg.
- **SEITENWECHSEL INNERHALB EINES TABS: KARTEN IN STAFFEL** (`_seitenWechsel`, 16.09.2026,
  Leonard-Wunsch, „Variante C" aus einer interaktiven Vorschau). Gym ↔ Laufen, Uebungen ↔ Stats
  und die vier Plan-Seiten wechseln nicht mehr hart: Die GANZE Flaeche unter der Kopfzeile
  blendet in 120ms aus, dann wird gezeichnet, dann kommen die Karten der neuen Seite
  NACHEINANDER von unten herein — je 80ms versetzt, dieselbe Formensprache wie beim Wechsel in
  den aktiven Modus auf der Seite „Gym".
  VORGESCHICHTE, alles am 16.09.2026: Zuerst „Variante B" (die ganze Flaeche als EIN Stueck,
  130/240ms), dann auf Leonards Wunsch schneller (90/170ms), dann das Einblenden geteilt („die
  Karten erscheinen zu ploetzlich"), schliesslich der Wechsel auf diese Staffel. Das seitliche
  Schieben („Variante A") war nie eingebaut.
  WAS EINE KARTE IST, entscheidet `_staffelElemente`: Es laeuft vom Screen abwaerts und nimmt das
  erste Element mit eigener KLASSE. Reine Huellen OHNE Klasse (`#wo-view-gym`, `#active-ex-list`,
  `#plans-list`, `#exercises-groups` …) sind keine Karten, dort geht es eine Ebene tiefer — sonst
  waere die ganze Uebungsliste EIN Schritt. Elemente mit Hoehe 0 fallen raus, sie kosteten sonst
  einen unsichtbaren Schritt (der leere `#active-ex-list` der Vorschau war genau so ein Fall).
  Karten UNTERHALB des Bildschirms bewegen sich nicht, und ab der sechsten Karte ist die
  Verzoegerung gedeckelt (`SEITEN_STAFFEL_MAX`) — im Katalog stuenden sonst zwanzig Gruppen in
  der Warteschlange. Findet sich gar keine Karte, faehrt die Flaeche selbst herein.
  JE KARTE ZWEI BEWEGUNGEN mit verschiedenen Dauern UND Kurven — das geht nur getrennt, eine
  Web-Animation kennt genau EINE Kurve fuer alle ihre Eigenschaften: Deckkraft 220ms
  gleichmaessig anlaufend (`SEITEN_EIN_MS`/`SEITEN_EIN_KURVE`), Schub 14px in 260ms ausrollend
  (`SEITEN_SCHUB_MS`/`SEITEN_SCHUB_KURVE`). GEMESSEN mit angehaltener Animation: Deckkraft bei
  0/25/50/75/100 % der Zeit = 0 · 0.18 · 0.60 · 0.91 · 1. Eine reine Ease-out-Kurve stand nach
  einem Viertel der Zeit schon bei 0.78 — genau das war „zu ploetzlich".
  NACH OBEN SCROLLEN gehoert dazu (Leonard-Entscheidung): `screen.scrollTop = 0` liegt im
  unsichtbaren Moment zwischen Aus- und Einblenden (gemessen: Katalog von 600 auf 0).
  KEINE Bewegung, wenn der Tab gerade NICHT sichtbar ist — die Uebersicht ruft `setPlansView`,
  bevor sie in den Plan-Tab wischt — sowie bei `prefers-reduced-motion` und ohne Breite.
  BAUART: `setWorkoutsView`/`setExercisesView`/`setPlansView` pruefen nur noch, ob sich die Seite
  aendert, und reichen das eigentliche Umschalten als Rueckruf (`_setWorkoutsView` usw.) an
  `_seitenWechsel(screenId, tabName, setzen)`. Wer die Reihenfolge im Umschalter aendert, fasst
  nur den Rueckruf an. Die Bewegung selbst laeuft ueber `_animFahren` (bis 15.09.2026 `_woAnim`) —
  dieselbe Promise mit Notbremse wie beim Modus-Uebergang.
  TOKEN (`_seitenNr`): Wer waehrend der Bewegung weiterschaltet, bricht die laufende ab — die alte
  Kette hoert auf, BEVOR sie zeichnet. Zusaetzlich raeumt jeder Start die Animationen ALLER
  Elemente im Screen ab (`querySelectorAll('*')`), sonst faehrt eine Einblendung gegen die
  naechste Ausblendung. GEMESSEN: dreimal in 50ms-Abstand weitergeschaltet → Endzustand ist die
  zuletzt gewaehlte Seite, Deckkraft 1, keine Restanimation.
  GEMESSEN ausserdem: Seite „Laufen" = 4 Karten mit 0/80/160/240ms; Katalog = 7 Karten,
  Verzoegerungen 0…400ms (Deckel greift); Plan-Tab Gymplan = Kalenderkarte UND Plankarte.
  TESTHINWEIS: In der versteckten Browser-Ansicht steht die Zeitleiste; beide Phasen enden erst
  ueber ihre Wecker. Vor dem Messen des Endzustands mindestens 1,5 Sekunden warten — sonst steht
  eine Karte noch auf Deckkraft 0 (`fill: 'backwards'`). Ausserdem: Ist die Browser-Ansicht
  schmal, meldet `.screen` `clientWidth` 0 und der Wechsel nimmt den Schnellpfad OHNE Bewegung —
  vor dem Messen also die Ansicht auf 375px stellen.
  **DIESELBE STAFFEL BEIM ANSICHTSWECHSEL INNERHALB EINER SEITE** (`_ansichtWechsel(behaelter,
  zeichnen)`, 18.09.2026, Leonard-Wunsch): der Katalogfilter „nur aus dem aktiven Plan" auf der
  Seite „Übungen" (`toggleExPlanFilter`, Behaelter `#exercises-groups`) und Liste ↔ Zeitstrahl der
  Wettkaempfe (`toggleWettkampfAnsicht`, `#races-list`). Nur der BEHAELTER blendet aus (120ms)
  und kommt gestaffelt wieder — Kopfzeile, Suchfeld und der Knopf bleiben stehen, und der Knopf
  zeigt seinen neuen Zustand SOFORT (der Aufrufer setzt ihn vor dem Wechsel). KEIN Sprung nach
  oben, man bleibt auf derselben Seite. Die Karten sucht `_staffelKarten` (der Kern von
  `_staffelElemente`, jetzt mit beliebigen Wurzeln); der Zeitstrahl ist EINE Karte.
  TOKEN `_ansichtNr`; ein neuer Wechsel blendet von der aktuellen Deckkraft aus.
  GEMESSEN: Filter an → eine Gruppe, aus → sechs Gruppen, die sichtbaren mit 0/80/160ms; Wechsel
  zur Liste → zwei Karten mit 0/80ms; dreimal in 50ms-Abstand → Endzustand stimmt, Deckkraft 1,
  keine Restanimation.
  NICHT ANGETASTET: die Wischgeste. Seiten wechselt man weiterhin nur ueber den Schalter unten;
  ein seitlicher Wisch gehoert den Tabs (siehe „AM WISCHEN NICHTS AENDERN").
  **DIESELBE STAFFEL BEIM WOCHENTAG-WECHSEL auf der Seite „Gym"** (`selectWorkoutDay` →
  `_kartenStaffelEin`, 16.09.2026, Leonard-Wunsch): Tippt man in der Wochenplan-Karte einen
  anderen Tag an, kommen die Uebungskarten des neuen Tags gestaffelt herein.
  ERST ZEICHNEN, DANN STAFFELN — ohne Abgang der alten Karten: Die Markierung des Wochentags und
  die Herocard sollen sofort umspringen, ein 120ms-Abgang liesse den Tipp traege wirken.
  Wochenplan-Karte und Herocard bewegen sich NICHT mit: Die eine ist der Umschalter, den man
  gerade antippt, die andere hat mit der Farbblende ihres Knopfes (`mitHeroFarbwechsel`) schon
  ihre eigene Bewegung.
  `_kartenStaffelFahren(karten)` ist der gemeinsame Kern von Seitenwechsel und Tagwechsel;
  `_kartenStaffelEin(behaelter)` nimmt zusaetzlich die sichtbaren Kinder eines Behaelters und
  raeumt vorher laufende Bewegungen ab (schneller zweiter Tipp).
  GEMESSEN (echte Tipps auf die Wochentage): Donnerstag = 5 Karten mit 0/80/160/240/320ms,
  Wochentag sofort markiert; drei Tipps in 60ms-Abstand enden sauber (Deckkraft 1, keine
  Restanimation); ein Tag OHNE Training hat keine Karten und wirft nichts.
  **DASSELBE AUF DER SEITE „LAUFEN"** (`selectRunDay`, 16.09.2026) — SEIT DEM 21.09.2026
  ENTFALLEN, mit der Tageskarte selbst (siehe „Laeufe dieser Woche" im Abschnitt Laufen).
  Vorgeschichte: Die Tageskarte unter „Diese Woche" kam ebenso von unten herein. Es ist EINE Karte, die Staffel hat dort also nur einen
  Schritt. Die Huelle `#wo-lauftag-card` wird bei jedem Zeichnen neu gebaut — sie muss deshalb
  NACH dem Zeichnen frisch gesucht werden.
  GEMESSEN (echter Tipp auf Freitag): eine Karte (`.aex-v2.lauf-tag-karte`) ohne Verzoegerung,
  Wochentag sofort markiert, Endzustand sauber; zwei Tipps in 60ms-Abstand ebenfalls.
- **Seitenleiste: der Seitenschalter steht UNTEN am Bildschirm** (`#seitenleiste`,
  08.09.2026, Leonard-Wunsch). Der Schalter selbst ist der GEWOHNTE (`.seg-toggle` mit
  `.seg-btn`) — er steht nur nicht mehr im Kopf des Tabs, sondern fest unten, und macht
  dort einen aktiven und einen passiven Modus mit. Beides — Position und passiver Modus —
  ist aus der **Zeitleiste der App „Health Command Center"** uebernommen.
  Sichtbar in Training, Uebungen und Plan; die Uebersicht hat keine Seiten, die
  Vollbild-Overlays auch nicht.
  ZWISCHENSTAND vom selben Tag, der wieder WEG ist: Zuerst war auch die BAUFORM aus HCC
  uebernommen — Pfeil, Pille mit dem Seitennamen, Pfeil, darueber eine aufklappbare
  Auswahl (`.sl-pille`, `.sl-pfeil`, `.sl-optionen`, `.sl-opt`, `seitenleisteSchritt`,
  `seitenleisteAuswahl`). Leonard wollte die gewohnte Optik zurueck; das ist alles
  ersatzlos entfallen. Wer es erneut versucht, faengt bei Null an.
  **Welche Seiten ein Tab hat, steht in EINER Tabelle** (`SEITEN_LEISTE`) — wie schon
  `PLANS_SEITEN` und `OVERLAY_SCREENS`. Wer einem Tab eine Seite gibt, traegt sie dort
  ein; der Schalter folgt von selbst, inklusive `.seg-vier` ab vier Knoepfen.
  ACHTUNG: `seiten`, `aktiv` und `setzen` sind FUNKTIONEN, keine Werte. Die Tabelle steht
  weit VOR `PLANS_SEITEN` in der Datei — ein Array-Literal liefe in dessen temporale
  Todeszone (derselbe Fehler wie einst bei `_datenStand` vor dem DB-Objekt).
  Funktionen: `seitenleisteBauen` (einmal beim Start, haengt das Markup an `body`),
  `seitenleisteAktualisieren` (fuellt den Schalter neu — laeuft in `_applyTabState` und in
  allen drei `set*View`), `seitenleistePassiv`, `initSeitenleiste` (EIN Klick-Handler am
  Dokument).
  **FARBE UND TRANSPARENZ SIND 1:1 AUS HCC UEBERNOMMEN** (08.09.2026, Leonard-Wunsch) —
  dort `.zl-pille` und `.zl-reihe`:

  | | HCC | FitTrack |
  |---|---|---|
  | Flaeche | `color-mix(in srgb, var(--card) 78%, transparent)` | `rgba(255,255,255,.78)` |
  | Rahmen | `1px solid var(--border)` | derselbe Wert (#E2E8F0) |
  | Schatten | `var(--shadow)` | derselbe Wert |
  | Schrift | `var(--txt2)` | `var(--text2)` (#64748B) |
  | aktive Seite | `var(--tab-color)`, Schrift #fff | `var(--accent)`, Schrift #fff |
  | passiv | `transform: scale(.7); opacity: .5` | dieselben Werte |

  Die Token heissen in beiden Apps verschieden, haben aber DIESELBEN Werte.
  AUSGESCHRIEBEN statt `color-mix`: FitTrack nutzt die Funktion nirgends sonst, und ihr
  Fehlschlag waere hier besonders teuer — eine nicht verstandene `background`-Angabe
  faellt ersatzlos weg, der Schalter waere durchsichtig und seine Schrift auf einer
  weissen Karte unlesbar. Mit `--card: #fff` ist der Wert ohnehin identisch.
  NICHT uebernommen: `backdrop-filter: blur(16px)`. Der Weichzeichner zeichnete in
  FitTrack auf iOS eine dunkle Linie an der Oberkante des Seitenschalters, sobald sich
  der Inhalt dahinter aenderte (gemeldet 01.09.2026) — und unten aendert er sich bei
  jedem Scrollen. Wer ihn doch will, prueft genau das auf dem Geraet gegen.
  WARUM der Schalter ueberhaupt einen eigenen Grund traegt: Im Kopf lag dahinter immer
  der farbige Tab-Hintergrund. Unten liegt dahinter der scrollende Inhalt — ohne eigene
  Flaeche verschwand die Schrift der nicht gewaehlten Seiten auf einer weissen Karte
  (von vier Seiten war nur die aktive lesbar, gesehen 08.09.2026).
  ZWEI Zwischenstaende an demselben Tag, beide WEG: (1) deckend dunkel in beiden Modi
  (`rgba(15,23,42,.72)`), (2) deckend hell im aktiven und dunkel durchsichtig im
  passiven Modus. Davor war eine Fassung in `var(--accent)` verworfen worden, weil der
  Trainings-Tab GRAU wird, wenn heute nichts ansteht (`themeBgKey`) — der Schalter
  leuchtete dort gruen aus einem grauen Hintergrund und widerspraeche dem Signal, das
  das Grau setzt. Wer wieder eine Tabfarbe als FLAECHE einsetzen will, muss diesen Fall
  loesen; die aktive PILLE traegt sie unbedenklich, sie ist nur ein Knopf.
  FOLGE: Die Glas-Sonderregel fuer die aktive Pille ist entfallen — der Schalter sieht
  in beiden Farbmodi gleich aus.
  **DIE ZWEISEITIGEN SCHALTER SIND 30 % SCHMALER** (`.seg-zwei`, Training: Gym|Laufen,
  Uebungen: Katalog|Stats; Leonard-Wunsch 08.09.2026). Zwei Knoepfe brauchen die volle
  Zeile nicht, und schmaler wirkt der Schalter weniger wie eine zweite Tableiste.
  Gerechnet von derselben Grundbreite wie sonst (volle Zeile minus die beiden
  14px-Raender), also `calc((100% - 28px) * 0.7)` und mittig: auf 375px 243 statt 347px.
  Der Plan-Tab mit vier Seiten behaelt die volle Breite — dort ist der Platz knapp.
  Die 30 % gelten in BEIDEN Modi, weil sie an der Grundbreite haengen und `scale(.7)`
  obendrauf kommt (passiv gemessen: 170px).
  Die Klasse setzt `seitenleisteAktualisieren` nach der Zahl der Seiten, genau wie
  `.seg-vier` — eine kuenftige dreiseitige Leiste bekaeme also automatisch keine von
  beiden.
  **SIE TAUCHT VON UNTEN AUF UND WIEDER AB** (`.sl-rein`/`.sl-raus` +
  `@keyframes sl-auftauchen`/`sl-abtauchen`, je 0,3s — am 21.09.2026 kurz 0,2s und 0,25s, auf
  Leonards Wunsch („noch langsamer") zurueck auf den alten Wert; der Gewinn an Tempo kommt seither
  allein aus dem frueheren Start an der 50-%-Schwelle —, dieselbe
  Kurve; Leonard-Wunsch 08.09.2026). Kommt man aus einem Tab OHNE Leiste (Uebersicht, Vollbild-Overlays), faehrt
  sie vom unteren Bildschirmrand herein; geht man dorthin zurueck, faehrt sie ebenso wieder
  hinaus — dieselbe Bewegungsrichtung, mit der die Bottom-Nav ein- und ausgleitet.
  Zwischen zwei Tabs MIT Leiste taucht sie NICHT ab — dort BLENDET der Schalter seit dem
  18.09.2026 ueber (siehe naechster Absatz). `seitenleisteAktualisieren` unterscheidet drei
  Faelle: Auftauchen (Leiste war versteckt), Ueberblenden (anderer Tab, Leiste stand schon) und
  schlichtes Neuzeichnen (derselbe Tab, also ein Seitenwechsel — nur die aktive Pille wandert).
  **UEBERBLENDEN ZWISCHEN ZWEI TABS MIT LEISTE** (`_slUeberblenden`, 18.09.2026, Leonard-
  Entscheidung „Ueberblenden" gegen „Ab- und Auftauchen" und „Mitschieben"): Vorher sprang der
  Schalter beim Wischen z. B. von „Gym | Laufen" auf „Übungen | Stats" schlagartig um. Jetzt
  bleibt er stehen, die alten Beschriftungen blenden aus (110ms), die neuen nach 40ms ein
  (140ms), und die BREITE gleitet auf die neue Knopfzahl (180ms; zweiseitig 243px ↔ vierseitig
  347px auf 375px). Welcher Tab zuletzt im Schalter stand, merkt `_slTab`.
  AUSGELOEST beim WISCH seit dem 21.09.2026 an der 50-%-SCHWELLE (siehe unten), beim Tipp auf
  die Tableiste ueber `_applyTabState`.
  **SEIT DEM 21.09.2026 SCHNELLER** (Leonard-Wunsch „schneller auftauchen bzw. schneller an den
  naechsten Tab anpassen"), zwei Hebel, beide ohne Eingriff in die Geste:
  1. `seitenleisteAktualisieren` laeuft in `_applyTabState` VOR dem Renderer statt danach —
     vorher wartete die Leiste zusaetzlich auf das Neuzeichnen des ganzen Tabs. Sie braucht
     nichts davon (nur Seiten-Tabelle und gewaehlte Seite, die kein Renderer setzt).
  2. Alle Dauern rund 30 % kuerzer: Auf-/Abtauchen 300 → 200ms (`SL_ANIM_MS` und CSS; noch am
     selben Tag ueber 250ms zurueck auf 300ms, Leonard: „etwas langsamer", „noch langsamer"),
     Ueberblenden 260/160/200/60 → 180/110/140/40ms (Breite/aus/ein/Vorlauf).
  3. **UMSCHALTEN AN DER 50-%-SCHWELLE** (v368, am selben Tag auf Leonards AUSDRUECKLICHEN
     Auftrag, EINZELN ausgeliefert): Der Scroll-Handler von `initTabScrollSync` ruft
     `seitenleisteAktualisieren(name)` dort, wo er schon Theme, Nav und das Ausblenden der
     Tableiste umschaltet — Auftauchen, Abtauchen und Ueberblenden beginnen mitten im Wisch statt
     nach dem Einrasten. Die Funktion nimmt dafuer den kommenden Tab als Parameter (`ziel`),
     weil `currentScreen` erst beim Einrasten wechselt.
     Der Aufruf steht BEWUSST VOR dem Wechsel der Theme-Klasse am body: Die Leiste misst ihre
     Breite und erzwingt damit ein Layout — auf dem noch sauberen Dokument ist das billig, nach
     dem Klassenwechsel muesste der Browser dafuer sofort die Stile der ganzen Seite rechnen.
     Das Einrasten ruft die Funktion ueber `_applyTabState` NOCHMAL mit demselben Stand. Damit
     die laufende Einblendung dann nicht abbricht, traegt der Schalter eine KENNUNG
     (`box.dataset.kennung` = Tab, Seiten, gewaehlte Seite); bei gleicher Kennung wird nicht neu
     gefuellt. Wisch ueber 50 % und wieder zurueck blendet einfach zurueck (Token `_slBlendeNr`).
     GEMESSEN mit dem ECHTEN Scroll-Handler (rAF synchron, Snap aus, Scroll-Ereignis von Hand):
     30 % = nichts; 60 % Uebersicht → Training taucht auf, waehrend `currentScreen` noch
     'overview' ist; Training → Uebungen blendet an der Schwelle, beim Einrasten derselbe
     Knopf-Knoten (kein zweites Fuellen); Uebungen → Plan ueber 50 % und zurueck endet bei
     „Übungen | Stats", 243px, ohne Reste; rueckwaerts in die Uebersicht taucht an der Schwelle
     ab; Seitenwechsel im Plan-Tab setzt die Pille weiter um; keine Fehler.
     NICHT PRUEFBAR HIER: ob das Wischen auf dem iPhone fluessig bleibt. ZURUECKNEHMEN: die eine
     Zeile `seitenleisteAktualisieren(name);` im Scroll-Handler entfernen — der Rest (Parameter,
     Kennung) ist harmlos und kann stehen bleiben.
  GEMESSEN: Reihenfolge „Leiste, dann Renderer"; Auftauchen und Abtauchen 0.2s, `hidden` danach;
  Training → Uebungen Blenden 110/140ms (+40ms Vorlauf); Uebungen → Plan Breite 180ms, Ende
  347px ohne Reste.
  BAUART: Die alten Knoepfe wandern in eine Ebene ueber dem Schalter (`.sl-alt`, absolut, in
  ihrer ALTEN Breite und mittig) — so stehen sie beim Ausblenden still, waehrend der Schalter
  um sie herum seine Breite aendert. Ihre Schrift und ihr seitliches Polster werden eingefroren
  (inline), weil der Schalter schon die Klassen des neuen Tabs traegt (`.seg-vier` = 12 statt
  13px). `overflow: hidden` beschneidet die alte Ebene, wenn der Schalter schmaler wird;
  `margin: auto` (inline) haelt ihn waehrend der Bewegung mittig — der vierseitige steht sonst
  ueber `margin: 0 14px` links an.
  FALLE: Die Breitenbewegung traegt `fill: 'forwards'` und wird erst im Aufraeumen ZUSAMMEN mit
  dem Inline-`margin: auto` entfernt. Endete sie vorher, stuende der vierseitige Schalter einen
  Moment mit `width: auto` + `margin: auto` da — also OHNE seine 14px-Raender (gemessen: 375
  statt 347px).
  Ein weiterer Wechsel waehrend der Bewegung raeumt die alte Ebene ab und startet von der
  aktuellen Breite (Token `_slBlendeNr`). Notbremse wie ueberall: Die Zeitleiste steht, solange
  die Seite nicht sichtbar ist — nach 660ms wird in jedem Fall aufgeraeumt.
  GEMESSEN (Zeit von Hand gesetzt, die Zeitleiste der Testansicht stand still): Breite
  243 → 303 → 343 → 347px bei 0/100/200/260ms, alte Beschriftung 1 → 0.11 → 0, neue
  0 → 0.13 → 0.94 → 1; danach keine Ebene, keine Inline-Angabe, keine Restanimation.
  Seitenwechsel im selben Tab und Rueckkehr aus der Uebersicht blenden NICHT; zweimal schnell
  weitergeschaltet endet beim richtigen Tab. NICHT pruefbar hier: der echte Wisch.
  Die Animationsklasse muss vorher entfernt und nach einem erzwungenen Reflow
  (`void el.offsetWidth`) neu gesetzt werden — sonst startet die Animation beim zweiten Mal
  nicht.
  Der Weg steht in `--sl-weg` und haengt am Nav-Zustand (eigene Hoehe plus Abstand zum
  unteren Rand; gemessen 109px bei sichtbarer, 51px bei eingeklappter Nav); mit einem festen
  Wert faehrt sie in einem der beiden Zustaende zu weit.
  Eine KEYFRAME-Animation statt einer Transition: Letztere braeuchte einen Startwert im DOM,
  die Animation startet von selbst.
  VIER Dinge am ABTAUCHEN, die leicht schiefgehen:
  1. `hidden` darf erst NACH der Bewegung gesetzt werden, sonst ist die Leiste sofort weg.
     Dafuer `SL_ANIM_MS` (300) und `_slAusTimer` — die Zahl MUSS zur `animation`-Angabe von
     `.sl-raus` passen, sonst springt sie am Ende oder bleibt kurz stehen.
  2. KEIN `animationend`: Bei `prefers-reduced-motion` laeuft gar keine Animation, das
     Ereignis kaeme nie und die Leiste bliebe fuer immer stehen. Dort setzt das CSS
     stattdessen `visibility: hidden`, damit sie die 0,3s nicht sichtbar herumsteht.
  3. Wer waehrend des Abtauchens zurueckwischt, bekommt die Leiste SOFORT wieder — der Timer
     wird abgebrochen und `.sl-raus` entfernt. Ohne das haette sie sich mitten in der
     Rueckkehr noch ausgeblendet.
  4. `html.sl-an` (und damit `--sl-off`, die Ausweichhoehe von Laufanzeige-Pille und Toast)
     faellt erst am ENDE der Bewegung weg. Sofort abgeschaltet fiele die Pille durch die noch
     abtauchende Leiste hindurch.
  Waehrend des Abtauchens nimmt der Schalter keine Tipps mehr an (`pointer-events: none`) —
  er gehoert schon zum verlassenen Tab, ein Tipp wuerde dort eine Seite umschalten, die man
  gar nicht mehr sieht.
  **TIPP AUF EINE ANDERE SEITE: DIE PILLE GLEITET HINUEBER** (`_slSchalterGleiten`, 21.09.2026,
  Leonard-Wunsch). Vorher sprang die Markierung, und zwar erst nach dem Ausblenden der alten Seite
  (120ms) — `seitenleisteAktualisieren` laeuft erst, wenn die `set*View` die neue Seite gesetzt
  haben. Jetzt verschiebt der Klick-Handler die Klasse `.active` SOFORT (ohne neu zu fuellen), und
  eine eigene Flaeche `.seg-gleiter` in der Farbe der aktiven Pille faehrt HINTER den
  Beschriftungen von der alten zur neuen Stelle (`SL_GLEIT_MS` 260ms, dieselbe Kurve wie die
  uebrigen Bewegungen). Die Seite wechselt unveraendert mit ihrer Staffel darunter.
  VIER Dinge, die daran haengen:
  1. Die KENNUNG des Schalters wird im selben Moment auf die neue Seite gesetzt — sonst saehe der
     spaetere Aufruf aus `_setXView` einen Unterschied und fuellte den Schalter neu (Pille weg).
     Aus demselben Grund ruft der Klick-Handler NICHT mehr selbst `seitenleisteAktualisieren()`
     hinter `tab.setzen(...)`: Das lief, solange die Seite noch die alte war.
  2. Waehrend der Bewegung hat der neue Knopf keinen eigenen Grund (`.seg-gleitet`), und
     `.seg-toggle.gleitet` schaltet die Hintergrund-Transition der Knoepfe ab (sonst blendete der
     alte Grund 0.15s neben der gleitenden Pille aus) und laesst die Schriftfarben in 0.26s
     umblenden. Am Ende kehrt ERST der Grund des Knopfs zurueck (erzwungener Reflow), DANN wird
     aufgeraeumt — in einem Rutsch blendete der Grund sonst noch einmal ein.
  3. Die Knoepfe liegen eine Ebene ueber der Pille (`.seg-toggle > .seg-btn { z-index: 1 }`).
  4. Ein zweiter Tipp waehrend der Bewegung beginnt dort, wo die Pille gerade steht (Token
     `_slGleitNr`); gerechnet in LAYOUT-Koordinaten, damit der passive Modus (`scale(.7)`) nicht
     hineinspielt.
  GEMESSEN (echte Klicks): Gymplan → Laufplan: `.active` und Kennung sofort neu, Seite noch die
  alte; Pille von 4px um 171px; nach 130ms bei 132.6px (Ease-out); danach eigener Grund
  rgb(245,158,11), keine Pille, kein Rest, derselbe Knopf-Knoten (nicht neu gefuellt). Zweiter
  Tipp nach 60ms startet exakt an der aktuellen Stelle (25.43px); Endzustand Wettkaempfe. Seite
  „Gym" → „Laufen" 118px. Ueberblenden zwischen Tabs unveraendert ohne Reste.
  NICHT gesehen: das Umblenden der Schriftfarben — CSS-Transitionen laufen in der verdeckten
  Browser-Ansicht nicht (die Angabe `color 0.26s` greift, gemessen).
  **AKTIVER und PASSIVER Modus:** Der Schalter schrumpft auf **70 %** und geht auf **50 %
  Deckkraft**, sobald man scrollt (in BEIDE Richtungen, Schwelle 2px gegen iOS'
  Nachfedern), **in einen anderen Tab wischt** oder irgendwo neben ihn tippt. Ein Tipp auf
  ihn holt ihn zurueck.
  Der WISCH braucht einen EIGENEN Ausloeser im Scroll-Handler des `#tab-container` — er
  erzeugt keinen Klick. Beim Tabwechsel per Tableiste greift dagegen die Regel „Tipp
  neben die Leiste" (die Nav liegt ausserhalb von `#seitenleiste`); beide Wege enden im
  selben Zustand.
  Geschrumpft wird ueber `transform: scale(.7)` mit `transform-origin: bottom center` —
  so bleibt die **Unterkante exakt stehen** (gemessen 746px bei sichtbarer Nav, in beiden
  Zustaenden) und Hoehe, Schrift, Polster und Rundungen schrumpfen im selben Verhaeltnis.
  Kleinere Masse einzeln zu setzen brachte in HCC Umbruch-Risiko.
  Die Deckkraft sitzt am SCHALTER, nicht an den Knoepfen einzeln — so verblassen Flaeche,
  Rahmen, Schatten und Schrift gleichmaessig. Auf die Tippflaeche wirkt sie nicht.
  **Anders als die Bottom-Nav verschwindet er NIE** — er ist das einzige Bedienelement
  fuer die Seite und muss erreichbar bleiben (43px werden zu 30px).
  **Die Kuerzung mit „…"** (Leonard-Wunsch) haengt an `.seg-btn`: `min-width: 0` plus
  `text-overflow: ellipsis`. Die 0 ist der eigentliche Schalter — ohne sie schrumpft ein
  Flex-Kind NICHT unter seinen Inhalt (genau das machte die Knoepfe frueher verschieden
  breit, siehe die Sportsymbol-Notiz weiter oben). Mit ihr sind alle Knoepfe exakt gleich
  breit und ein Name, der nicht passt, endet mit „…" statt den Schalter ueber den Rand zu
  schieben. Gemessen: alle vier Plan-Seiten passen bei 12px in je 82px, es wird nichts
  gekuerzt; ein kuenstlich langer Name wurde korrekt bei 82px abgeschnitten.
  **VIER Dinge, die daran haengen:**
  1. `pointer-events: none` auf der Leiste, `auto` erst auf dem Schalter. Sie spannt ueber
     die volle Breite; ohne das faengt der Streifen links und rechts die Tipps ab, mit
     denen man die Bottom-Nav wieder einblendet.
  2. KEIN `backdrop-filter` — siehe die Vorgeschichte von `.seg-toggle` (iOS zeichnete
     damit eine dunkle Linie an der Oberkante, sobald sich der Inhalt dahinter aenderte).
     Das war auch der Grund, ihn beim HCC-Zwischenstand wegzulassen.
  3. Die Hoehe steht in `--sl-h` (43px) und wird an zwei weiteren Stellen gebraucht:
     `--sl-pad` im `padding-bottom` der drei Tabs (sonst verschwindet die unterste Karte
     unter dem Schalter) und `--sl-off` als Ausweichhoehe. GEMESSEN: 43px bei zwei
     Knoepfen (13px Schrift), 42px bei vier (`.seg-vier`, 12px) — hier steht der
     groessere Wert. Beim Aendern von Schriftgroesse, Polster oder Rahmen nachmessen.
  4. `seitenleisteAktualisieren` liest `currentScreen`. Das ist sicher, weil sowohl
     `showScreen` als auch der Settle in `initTabScrollSync` die Variable IMMER setzen,
     bevor sie `_applyTabState` rufen.
  **DIE STAPELUNG AM UNTEREN RAND ist die eigentliche Arbeit** — vier Dinge teilen sich
  dort den Platz. Von unten: Bottom-Nav · Satzpause (`#rest-bar`) · Seitenleiste ·
  Laufanzeige-Pille. Nachgemessen bei 375x812:

  | Zustand | Satzpause | Seitenleiste | Pille |
  |---|---|---|---|
  | Nav sichtbar, Einheit laeuft | – | 706–746 | 659–695 |
  | dazu Satzpause | 692–752 | 646–686 | 599–635 |
  | Nav weg, beides | 752–812 | 704–744 | 659–695 |

  Die Zuschlaege der Pille sind VARIABLEN (`--rest-off`, `--sl-off`) und werden addiert.
  Als getrennte `bottom`-Regeln haetten sie sich per Spezifitaet verdraengt, und bei
  laufender Satzpause im Plan-Tab laege die Pille auf der Seitenleiste. Der Toast rechnet
  `--sl-off` ebenfalls mit.
  `--sl-off` haengt an `html.sl-an`, gesetzt von `seitenleisteAktualisieren` — also an der
  TATSAECHLICHEN Sichtbarkeit und NICHT am Theme: Die Vollbild-Overlays tragen das Theme
  ihres Tabs, haben aber keine Leiste. `--sl-pad` haengt dagegen fest an den drei
  Screen-Ids, damit sich das Polster eines Tabs nie aendert, waehrend man in einem anderen
  steht (sonst spraenge deren gemerkte Scrollposition).
  Die Leiste weicht der Satzpause ueber `#rest-bar.show ~ #seitenleiste` aus — ein
  Geschwister-Selektor genuegt, weil `seitenleisteBauen` sie an `body` anhaengt und sie
  damit hinter `#rest-bar` steht.
  NICHT auf diesem Rechner pruefbar: der passive Modus beim WISCH in einen anderen Tab.
  Wischgesten und die Scroll-Ereignisse des `#tab-container` gibt es hier nicht (siehe
  „AM WISCHEN NICHTS AENDERN"). Alles Uebrige ist gemessen.
- **Der Knopf „Uebung zum Trainingstag hinzufuegen" auf der Seite „Gym" ist ENTFALLEN**
  (08.09.2026, Leonard-Wunsch, ersatzlos). Uebungen kommen ueber die Seite „Gymtage" im
  Plan-Tab dazu. Der Knopf der LAUFENDEN Einheit („+ Uebung hinzufuegen", schreibt in die
  Einheit UND den Trainingstag) bleibt, ebenso der gleichnamige Knopf in der
  Trainingstag-Detailansicht (`openAddToPlanModal('libday')`).
  Folge: `openAddExModal('preview')` hatte keinen Aufrufer mehr. Der Zweig
  `addExContext === 'preview'` stand danach ein Jahr lang als Rueckweg da und ist am
  13.09.2026 ENTFALLEN — er waere heute ein Rueckweg in eine Regel, die es nicht mehr gibt
  (siehe „Gymtage werden ausschliesslich in ihrer Detailansicht angepasst").
  `addExContext` kennt nur noch 'active' und 'libday'.
- **Vier Elemente sind am 08.09.2026 SCHMALER geworden** (Leonard-Wunsch). Alle vier ueber
  `width` + `margin-left/right: auto` statt ueber groessere Raender — so bleibt der Bezug
  die bisherige Breite, und im Querformat rechnet die Prozentangabe gegen die Spalte statt
  gegen den ganzen Screen. Gemessen auf 375px:

  | Element | vorher | jetzt | Regel |
  |---|---|---|---|
  | Hero-Knopf im Trainings-Tab | 323px | ~~258px (−20 %)~~ **seit 13.09.2026 wieder 323px** | Regel entfallen, siehe unten |
  | Uebungskarte (Seite „Gym" + Gymtag-Detail) | 323px | **291px** (−10 %) | `.aex-v2:not(.lauf-tag-karte)` |
  | Archiv-Knopf (alle drei Listen) | 347px | **173px** (−50 %) | `.plans-list-archive-header` |

  **DER HERO-KNOPF IST SEIT DEM 13.09.2026 WIEDER VOLL BREIT** (Leonard-Wunsch): Auf den Seiten
  „Gym" und „Laufen" fuellt er die Karte zwischen den 14px-Polstern — dieselben Aussenabstaende
  wie „Freies Training" und „Lauf erledigt" in der Uebersicht (gemessen: links und rechts je
  14px, 323px breit, kein Ueberlauf). Die 80-%-Regel ist ersatzlos entfallen.
  DREI Fallen, die dabei steckten (die erste ist mit der Regel erledigt):
  1. `.hero-heute-spalten.einzeln` traegt AUCH die Karte der laufenden Einheit, sobald sie
     ohne Uebungen dasteht. `:not(.hero-aktiv)` war deshalb Pflicht — sonst schrumpften
     „Pausieren" und „Beenden" mit.
  2. Die Tageskarte der Seite „Laufen" borgt sich die Klassen der Uebungskarte, ist aber
     keine — `.lauf-tag-karte` ist ausgenommen und bleibt bei 323px.
  3. Im Gymtage-Raster setzt `#libdays-list > .plans-list-archive-header` die Breite auf
     `auto` zurueck (der Knopf spannt dort ueber alle drei Spalten). Die halbe Breite muss
     danach NOCHMAL gesetzt werden, sonst ist dieser eine Knopf voll breit.
- **Kuenftige Trainingstage in der kombinierten Wochenkarte sind hellgrau GEFUELLT plus Ring**
  (08.09.2026, Leonard-Wunsch — vorher `background: transparent`). Damit kennt die Karte drei
  Zustaende in EINER Formensprache:
  hellgrau ohne Ring = nichts geplant · hellgrau MIT Ring = geplant, steht noch an ·
  voll in der Sportfarbe = war schon (Haken, wenn absolviert).
  Das Hellgrau ist dasselbe `--card2` wie beim leeren Kreis. Vorher lag der Ring auf dem
  Tab-Hintergrund und die kuenftigen Tage wirkten wie Loecher.
  Im Transparenz-Modus entsprechend `rgba(255,255,255,.22)` — dieselbe Flaeche wie der leere
  Kreis dort. Gilt NUR fuer die Kombi-Karte (`.ppv-k-dot`): In den Einzelkarten hat ein Tag
  ohne Training gar keine Fuellung, dort gaebe es kein Grau zu uebernehmen.
- **VERSCHOBENE EINHEITEN werden in allen Wochenplan-Karten beruecksichtigt**
  (08.09.2026, Leonard-Wunsch „A und B"). Wer die Einheit vom Dienstag am Montag vorzieht,
  sah davon in den Karten nichts: Montag blieb leer, Dienstag blieb offen.
  ZWEI getrennte Aenderungen, beide noetig:
  1. **„Erledigt" haengt am TAG, nicht am Plan.** In `buildPlanCard` und `buildWochenKombi`
     stand `const done = d && …` — ein Training an einem ungeplanten Tag war dadurch
     unsichtbar. Das `d &&` ist weg. Es war streng genommen ein FEHLER: `getWeekStatus`
     zaehlt seit jeher ALLE Einheiten der Woche, der Zaehler im Kartenkopf zeigte das
     Training also laengst an, waehrend die Kreise darunter es verschwiegen. Die Laufkarte
     verhielt sich immer schon so (`gelaufenAmTag` kennt keine Planpruefung).
  2. **Die Verschiebung wird zugeordnet** (`_verschobeneZuordnen`, neues Feld `verschoben`
     an `getCurrentWeekDays()`). Zugeordnet wird ueber `wo.planDayId` — die Einheit weiss,
     zu welchem Trainingstag sie gehoert. NICHT ueber den Wochentag: Derselbe Trainingstag
     kann zweimal in der Woche stehen (dieselbe Falle wie bei `weekPlan.findIndex`).
     Zwei Schritte, damit nichts doppelt zaehlt: Erst verbraucht jede Einheit, die am
     RICHTIGEN Tag lief, ihren eigenen Platz; was uebrig bleibt, fuellt die noch offenen
     Plaetze DESSELBEN Trainingstags, der frueheste zuerst.
     Ein freies Training (`planDayId === null`) passt zu keinem Platz und bleibt der Haken
     an seinem eigenen Tag — ebenso die Einheit eines Trainingstags, der gar nicht in der
     Woche steht.
  **Der verschobene Plantag wirkt GRAU ABGEHAKT** (`.verschoben`, Leonard-Entscheidung):
  hellgraue Fuellung, grauer Haken. Der FARBIGE Haken gehoert allein dem Tag, an dem
  wirklich trainiert wurde — so gehoert zu jeder Einheit genau ein farbiger Haken und die
  Karte behauptet nicht, es seien zwei gewesen. Der Zustand verdraengt `.zukunft`: Das
  setzt schon das JS (`&& !verschoben`), sonst gewaenne die Kontur per Spezifitaet.
  Die CSS-Regeln MUESSEN hinter `.ppv-col.training .ppv-wd` stehen, und die
  `.run-plan`-Fassung braucht ihre eigene Zeile (die dortige Trainingsregel traegt eine
  Klasse mehr).
  **BEIM LAUFEN ist die Zuordnung GEZAEHLT, nicht erkannt** (`runVerschobeneTage`): Ein Lauf
  kommt aus der Google-Tabelle und weiss NICHT, zu welchem geplanten Lauftag er gehoert —
  das Modell kennt nur `runDays: [0..6]` und die gelaufenen Daten. Laeufe an nicht geplanten
  Tagen decken deshalb offene Lauftage ab, der frueheste zuerst, und BEWUSST nur
  VERGANGENE: Beim Gym ist die Verschiebung sicher, hier ist sie geraten — einen kuenftigen
  Lauftag abzuhaken, weil man vorher zusaetzlich gelaufen ist, waere eine Behauptung.
  GEPRUEFT (heute = Di, Push an Di+Do geplant): eine Einheit am Mo → Mo farbiger Haken,
  Di grau abgehakt, Do bleibt offen · zwei Einheiten am Mo → Di UND Do grau abgehakt ·
  freies Training am Mi → nur Mi, kein Plantag · Einheit eines fremden Trainingstags → nur
  ihr eigener Tag · Lauf: geplant Mo+Do, gelaufen Di → Mo grau abgehakt, Do bleibt offen.
- **SEIT DEM 13.09.2026 SIND ES 157.3px — WOCHENPLAN-KARTEN UND HEROCARDS SAMT INHALT +10 %**
  (Leonard-Wunsch, „alle in allen Tabs"). Betrifft JEDE `.plan-card-v2` (Uebersicht in allen
  drei Filterzustaenden, Trainings-Tab Gym/Laufen, beide Listen im Plan-Tab samt kommender und
  archivierter Plaene) und JEDE `.hero-v2` (Heute in Uebersicht, Gym und Laufen, laufende
  Einheit). Die 143px im Abschnitt darunter sind der Stand davor; die Regeln gelten unveraendert.
  Gewachsen sind: Hoehe (`min-height`/`height` 157.3px), Polster OBEN/UNTEN (15.4px),
  Wochentagskreise (39.6px/15.4px), Kennzahlen, Balken, Statuschip (nur in der Karte,
  `.plan-card-v2 .plan-status-chip`), alle Abstaende, die ganze Kombi-Karte, Beschriftungen,
  Knoepfe (17.6px), Uhr und Fortschrittsbalken der laufenden Einheit.
  BEWUSST NICHT gewachsen:
  - Das SEITLICHE Polster (14px) und damit auch der Abstand ZWISCHEN den Herocard-Knoepfen —
    sonst stuende der Inhalt 1.4px weiter rechts als in jeder anderen Karte.
  - Eckenradius und Schatten der Karte (die grossen Karten der App teilen sich 18px).
  - Die KARTENTITEL (16px, Leonard-Entscheidung): „Trainingswoche", „Gymwoche", „Heute" und
    der Name der laufenden Einheit bleiben so gross wie jeder andere Kartentitel. FOLGE: Die
    Knopfschrift (17.6px) ist seither GROESSER als der Titel — die Gleichheit vom 12.09.2026
    gilt nicht mehr.
  GEMESSEN (Vorher/Nachher-Vergleich jedes Elements in 11 Kartenfassungen): alle Karten
  143 → 157.3px (×1.100), alle Schriften ×1.1 ausser den Titeln, 20 feste Karten in beiden
  Farbmodi ohne Ueberlauf. Einzeilige Texte wachsen in der HOEHE um 13 % statt 10 % (15 → 17px)
  — das ist die ganzzahlige Rundung von `line-height: normal`, kein Fehler.
  FOLGE fuer die Uebersicht: Die langen Knopfbeschriftungen passten nicht mehr (siehe
  „Knopfschrift" weiter unten) und heissen seither „Freies Training" und „Lauf erledigt".
- **DER INHALT DER WOCHENPLAN-KARTEN IST SENKRECHT GLEICHMAESSIG VERTEILT** (13.09.2026,
  Leonard-Wunsch: unter der Lauf-Reihe der Kombi-Karte und unter den Wochentagen der
  Gym-/Laufkarte war zu viel Luft). Vorher standen die Bloecke mit festen Abstaenden oben
  aneinander und der gesamte Freiraum der festen Hoehe lag unter der letzten Kreisreihe.
  Jetzt ist `.plan-card-v2` eine FLEX-SPALTE: Der Titel bleibt an seiner Stelle (gemessen
  unveraendert, alle Fassungen), und der Freiraum darunter verteilt sich ueber gleich grosse
  `auto`-Abstaende — vor jedem Block nach dem Titel und nach dem letzten (`::after` statt
  `padding-bottom`).
  Ein BLOCK ist der ganze Kasten, bei Kreisreihen also INKLUSIVE des Feldes fuer heute bzw.
  den gewaehlten Tag. GEMESSEN (157.3px):

  | Karte | Abstand zwischen den Bloecken und zum Rand | unter den Kreisen |
  |---|---|---|
  | Kombi | 9.2px | 20.5 → **12.5px** |
  | Gym/Lauf (Uebersicht, Trainings-Tab, laufender Plan in der Liste) | 16.6px | 29.5 → **24.9px** |
  | Plan-Liste mit Laufzeitzeile (kommend/archiviert) | 21.3px | 35.5 → **29.6px** |

  In der Gym-/Laufkarte ist der Abstand UNTER den Kreisen jetzt genau so gross wie der ueber
  ihnen (beide 24.9px, weil das Spaltenpolster symmetrisch ist).
  Nicht verteilt werden: die Laufzeitzeile (`.ppv-meta`, gehoert zum Titel) und der Abstand
  ZWISCHEN den Kombi-Reihen (4.95px) — an ihm haengt die Naht des durchgehenden Heute-Feldes
  (gemessen: Luecke 0).
  UNTERGRENZE 8px: Jeder verteilte Block traegt 8px `padding-top`, `::after` ist 8px hoch.
  Waechst eine Listenkarte ueber ihre Mindesthoehe (langer Planname, gemessen 183.9px), faellt
  `auto` auf 0 — die Bloecke stehen dann 8px auseinander statt aneinander. Die 8px duerfen
  nicht ueber 9.2px steigen, sonst passt die Kombi-Karte nicht mehr in ihre Hoehe.
  FALLE, die dabei zuschlug: `.ppv-name` traegt `flex: 1` fuer die waagerechte Kopfzeile. In
  der LEEREN Karte („Kein aktiver Trainingsplan") steht der Name aber direkt in der Karte und
  wuchs in der Flex-Spalte senkrecht — die Hinweiszeile rutschte an den unteren Rand.
  `.plan-card-v2 > .ppv-name { flex: none }` verhindert das.
  Im Querformat identisch gemessen. Die Regel `justify-content: center` fuer die Wochenkarte im
  Querformat-Grid des Trainings-Tabs ist dadurch wirkungslos geworden (die `auto`-Abstaende
  nehmen den Freiraum), aber unschaedlich.
- **ALLE WOCHENPLAN-KARTEN UND HEROCARDS SIND GENAU 143px HOCH** (09.09.2026,
  Leonard-Wunsch). Kombi-Karte, Gym- und Laufwochenplan in allen drei Tabs, die Herocard
  „Heute" in Uebersicht und Trainings-Tab und die Karte der laufenden Einheit — alle gleich.
  ZWEI verschiedene Angaben, mit Absicht:
  - `.plan-card-v2` bekommt `min-height`. In der LISTE des Plan-Tabs tragen archivierte und
    kommende Plaene eine Statuszeile mehr und sind natuerlicherweise hoeher; die duerfen
    wachsen, abgeschnitten waeren sie kaputt.
  - `.hero-v2` bekommt `height`. Die Herocard der Uebersicht war mit ihren zweizeiligen
    Knoepfen 154px hoch und musste SCHRUMPFEN — `min-height` haette daran nichts geaendert.
  Damit die feste Hoehe bis zu den Knoepfen durchreicht, ist `.hero-heute` eine
  FLEX-SPALTE (vorher `display: block`) und `.hero-heute-spalten`/`.hero-heute-spalte`
  tragen `flex: 1`. Ohne das blieb unten Leerraum stehen und die Knoepfe waren mit 33.5px
  KLEINER als vor der ganzen Aenderung (41.5px). Jetzt: 49px im Trainings-Tab, 51px in der
  Uebersicht. Das Knopfpolster steht wieder bei 8px — es ist nur noch die Untergrenze, die
  Hoehe kommt aus der Karte.
  **Die einzelnen Gym- und Laufkarten holen ihre Hoehe aus den KREISEN**, nicht aus Luft
  darueber (Leonard-Wunsch, ausdruecklich): `.ppv-wd` ist von 30 auf **36px** gewachsen, die
  Schrift darin von 12 auf 14px. Die letzten Pixel zur Zielhoehe holt das Polster von
  `.ppv-col` (5 → 7.5px). `.ppv-strip` steht wieder bei 14px.
  36px und nicht 40px: Mit 40px war die Einzelkarte NATUERLICH schon 143px hoch, also genau
  am Deckel — jede Kleinigkeit mehr im Kopf schob sie darueber, waehrend die Kombi-Karte bei
  142 blieb, und beim Umschalten des Filters sprang die Karte (Leonard-Meldung 09.09.2026).
  Mit 36px liegt sie natuerlich bei 139px. ZUSAETZLICH tragen die drei WOCHENKARTEN
  (`#ov-week-card`, `#wo-week-card`, `#wo-view-laufen`) die 143px als `height` statt nur als
  `min-height` — damit ist ein Sprung strukturell unmoeglich, egal was der Kopf zeigt.
  Die KOMBI-Karte behaelt ihre Loesung von gestern: 6.5px Abstand ueber jeder der beiden
  Reihen (`.ppv-k-reihe`).
- **KEINE Erledigt-Haken mehr an den Wochentagskreisen** (09.09.2026, Leonard-Wunsch): Der
  gefuellte Kreis sagt schon, dass trainiert wurde. Entfallen sind `.ppv-col.done
  .ppv-wd::before` samt Lauf-Variante und `.ppv-k-col.done .ppv-k-dot::before` samt
  Lauf-Variante — in allen Karten, allen Tabs.
  PREIS: In der VERGANGENHEIT sieht ein geplanter, aber ausgefallener Tag jetzt aus wie ein
  absolvierter — beide sind voll in der Sportfarbe. Unterscheidbar bleiben nur kuenftige
  Tage (nur umrandet) und verschobene (grau).
  Am 09.09.2026 ist auch der graue Haken der VERSCHOBENEN Tage entfallen (Leonard-Wunsch).
  FOLGE, die man kennen muss: In der KOMBI-Karte ist ein verschobener Tag jetzt von einem
  Tag ohne Training nicht mehr zu unterscheiden — beide tragen dasselbe `--card2`. In den
  EINZELKARTEN bleibt er erkennbar (hellgrau gefuellt gegen gar keine Fuellung).
  **IN DER KOMBI-KARTE HEISST GEFUELLT SEIT DEM 12.09.2026 „ABSOLVIERT"** (Leonard-Meldung
  mit Screenshot: Der fuer heute GEPLANTE Lauf war voll eingefaerbt und sah aus wie gelaufen,
  waehrend der gemeinsame Kalender darunter richtig nichts zeigte). Der Ring haengt jetzt
  daran, ob die Einheit absolviert ist — nicht mehr am Datum (`i > todayIdx`); die Klasse
  heisst deshalb `.offen` statt `.zukunft`. Drei Zustaende:
    hellgrau, kein Ring    = nichts geplant
    hellgrau mit Ring      = geplant, nicht absolviert (heute, kuenftig ODER ausgefallen)
    voll in der Sportfarbe = absolviert
  PREIS: Ein ausgefallener Tag der Vergangenheit sieht aus wie einer, der noch aussteht. Das
  ist die kleinere Unwahrheit — „gefuellt" behauptete vorher ein Training, das es nie gab.
  **SEIT DEM 13.09.2026 GILT DIESELBE REGEL IN DEN EINZELKARTEN** (Gym- und Laufwoche in
  Uebersicht und Trainings-Tab, Leonard-Wunsch): `.ppv-col.offen` ersetzt `.zukunft`, das am
  Datum hing (`i > todayIdx`). Das AUSSEHEN ist das der Kombi-Karte — hellgrau (`--card2`) mit
  2.2px-Ring in der Sportfarbe —, der Wochentag bleibt im Kreis stehen, in der Sportfarbe.
  Im Transparenz-Modus 22-%-Weiss mit weissem Ring; der Ring gewinnt dort auch gegen
  `.selected .ppv-wd { box-shadow: none }` (eine Klasse mehr, gemessen).
  GEMESSEN (heute So, Gym Mo/Di/Do/Fr/So geplant, Einheiten Mo und Mi mit dem Pull vom Di):
  Mo gefuellt · Di grau (verschoben) · Mi gefuellt (ungeplant, erledigt) · Do, Fr und So
  hellgrau mit Ring. Lauf: So (heute, geplant, nicht gelaufen) mit Ring.
- **IM PLAN-TAB ZEIGEN DIE WOCHENPLAN-KARTEN DEN PLAN, NICHT DIE LAUFENDE WOCHE**
  (`opts.nurPlan` in `buildPlanCard` und `buildRunPlanCard`, Leonard-Wunsch 13.09.2026).
  Gesetzt von beiden Listen (Gymplan: `renderRow`, Laufplan: `zeile` in `renderLaufVerwaltung`).
  Dort gibt es KEINE Unterscheidung mehr zwischen geplant, absolviert, verschoben und offen:
  Die geplanten Tage des Plans sind schlicht gefuellt, alle anderen leer — wann in dieser
  Woche trainiert wurde, zeigt die Karte nicht. `getCurrentWeekDays`, `runWochenStatus` und
  `runVerschobeneTage` werden dafuer gar nicht erst gerufen.
  ENTFALLEN ist dort auch „x/y diese Woche" rechts neben dem Balken (`.ppv-adh`). „Woche 8 / 9"
  links und der Balken BLEIBEN — sie beschreiben, wo der Plan steht. Der Balken fuellt dadurch
  die freie Breite bis zum rechten Rand (`flex: 1`).
  Das Heute-Feld war im Plan-Tab schon seit dem 12.09.2026 aus (`hideToday`); `nurPlan` ist
  eine eigene Option, weil „kein Heute-Feld" und „keine Woche" zwei verschiedene Aussagen sind.
- **Der Abstand unter dem Titel „Heute" ist von 10 auf 2px** (09.09.2026, Leonard-Wunsch:
  zwischen Titel und der mittigen Beschriftung stand zu viel Luft). Weil die Karte 143px FEST
  hoch ist und die Knoepfe `flex: 1` tragen, landen die gesparten 8px automatisch in der
  KNOPFHOEHE — genau dort, wo sie hin sollten. Gemessen: Knoepfe 49 → **57px** in beiden
  Herocards.
  ACHTUNG, hier steckt eine Falle: Der sichtbare Abstand zwischen Titel und Namenszeile ist
  NICHT nur dieser `margin-bottom`. Die Karte ist eine Flex-Spalte und erbt von `.hero-v2`
  einen `gap: 12px` — zusammen also 14px. Wer dort etwas holen will, muss den GAP anfassen;
  am Titelabstand allein sind nur 2px zu gewinnen (genau dieser Irrtum kostete einen
  Anlauf).
  **„Einheit starten" ist genauso hoch wie „Freies Training starten"**
  (`.hero-heute.hero-mit-meta { gap: 4px }`, Leonard-Wunsch 09.09.2026). Vorher war er
  8.1px flacher: Die Zusatzzeile kostet 12.1px, der engere Spaltenabstand gibt nur 4px
  zurueck. Die fehlenden 8px kommen jetzt aus eben jenem Gap (14 → 6px) — die Karte bleibt
  bei 143px, beide Knoepfe messen 57px (56.9 gegen 57.0, also 0.1px auseinander).
  NUR im Meta-Fall: Ohne Zusatzzeile bleibt der Abstand bei 14px. Kuerzte man ihn dort
  auch, waere „Freies Training starten" wieder hoeher und die Gleichheit dahin. Die Sonderregel `hero-mit-meta` hat ihre Titelzeile dabei verloren (sie setzte
  dieselben 2px noch einmal); der Rest des Blocks bleibt, er haelt den Textblock der Seite
  „Gym" zusammen und laesst dem Knopf dort dieselbe Hoehe wie auf „Laufen".
- **Die Knopfschrift der Gym- und Lauf-Herocard ist 18px** (seit 21.09.2026 Stufe `--fs-betont`,
  vorher 17.6px; nachgemessen, siehe Schriftskala) (`.hero-heute:not(.hero-aktiv)
  .hero-v2-btn`) — in ALLEN Tabs derselbe Wert. Am 12.09.2026 war sie auf die Titelgroesse
  (16px) gesetzt worden, am 13.09.2026 ist sie mit der Karte um 10 % gewachsen, der Titel aber
  NICHT (beides Leonard-Entscheidung). Knopf und Titel sind seither verschieden gross.
  **DIE KNOEPFE HEISSEN „Freies Training" und „Lauf erledigt"** (13.09.2026, vorher „Freies
  Training starten" und „Lauf abgeschlossen", Leonard-Entscheidung fuer ALLE Tabs). Bei 17.6px
  hat ein Knopf in der Uebersicht 111.6px Textplatz: „Freies Training starten" brach auf DREI
  Zeilen um (Knopf 83.6px, die Karte laesst nur 64px — unten abgeschnitten), und
  „abgeschlossen" (126.7px) stiess ueber den Knopfrand. 16px war die groesste Schrift, bei der
  die alten Texte noch passten. Gemessen jetzt: alle Knoepfe 64px, kein Ueberlauf, in
  Uebersicht (heute und drei gewaehlte Tage), Gym (frei/geplant) und Laufen.
  Beim naechsten Anheben der Schrift ZUERST das breiteste Wort gegen den Textplatz rechnen:
  Knopfbreite − 2 × Polster − Symbol (1em) − Luecke.
  `:not(.hero-aktiv)` nimmt die Karte der LAUFENDEN Einheit aus (gemessen: „Beenden" bleibt bei
  14px) — „Pausieren" und „Beenden" benennen keine Sportart.
  Das Symbol im Knopf ist `1em` und waechst von selbst mit.
  ENGSTELLE ist die UEBERSICHT: Dort teilen sich zwei Knoepfe die Zeile, und die Knopfhoehe ist
  ueber `flex: 1` an die Resthoehe der Karte gebunden — beim Anheben der Schrift also auf
  Ueberlauf pruefen (siehe oben).
- **HEUTE ist EIN durchgehendes Feld ueber beide Reihen der Kombi-Karte** (09.09.2026,
  Leonard-Wunsch — vorher zwei getrennte Felder mit sichtbarer Fuge). Beide Reihen tragen
  weiterhin ihr eigenes Feld (sie sind getrennte Rasterzeilen, ein einzelnes Element koennte
  sie nicht ueberspannen), aber sie stossen nahtlos aneinander: Die obere zieht ihr Feld um
  die 6.5px des Zwischenraums nach unten (`padding-bottom: 9.5px` plus
  `margin-bottom: -9.5px`, damit das Layout sich nicht verschiebt) und rundet nur oben, die
  untere rundet nur unten. Gemessen: Unterkante Gym = Oberkante Lauf, Luecke 0.
  ACHTUNG: Das setzt die Reihenfolge Gym → Lauf voraus (so baut `buildWochenKombi` sie
  immer) und den Reihenabstand. Wer den aendert, zieht die Naht mit — Stand 13.09.2026:
  3.3px eigenes Polster + 4.95px Abstand = 8.25px.
- **DER INHALT DER KOMBI-KARTE IST AM 12.09.2026 UM 20 % GEWACHSEN** (Leonard-Wunsch):
  Wochentagsschrift 12 → 14.4px, Kreise 22 → 26.4px, Sportsymbole 19 → 22.8px (mit ihnen
  `--ppv-k-lead` 20 → 24px, sonst passt das Symbol nicht in seine Spalte) und der Ring der
  offenen Tage 3 → 3.6px.
  DIE HOEHE KOMMT AUS DEN ABSTAENDEN, nicht aus der Karte: Sie ist FEST 143px (09.09.2026),
  die groesseren Inhalte kosten aber 10.6px. Geholt sind sie ueber der Wochentagszeile
  (12 → 5px) und ueber jeder der beiden Reihen (6.5 → 4.5px). Gemessen: Inhalt 142.8px, kein
  Ueberlauf. Wer weiter vergroessern will, hat hier nichts mehr zu holen — dann muss die
  Karte hoeher werden, und das betrifft ALLE Wochenplan-Karten und Herocards.
  Mit dem kleineren Reihenabstand wandert auch die Naht des Heute-Feldes mit: 9.5 → 7.5px
  (3px eigenes Polster + 4.5px Abstand).
  Am 13.09.2026 mit der ganzen Karte noch einmal +10 %: Kreise 29.04px, Symbole 25.08px,
  `--ppv-k-lead` 26.4px, Wochentage 15.84px, Ring 3.96px, Naht 8.25px. Die Karte ist dabei
  selbst mitgewachsen (157.3px) — der Satz „hier ist nichts mehr zu holen" bezog sich auf 143px.
- **DIE SPORTSYMBOLE DER KOMBI-KARTE WAREN BIS ZUM 13.09.2026 NIE SO GROSS WIE EINGESTELLT.**
  Das SVG steckt in der Reihe in einem `.ppv-name-ic` (dieselbe Konstante `PPV_ICON_HANTEL`/
  `PPV_ICON_LAEUFER` wie vor den Kartentiteln), und der ist `width: 1em` — fest die 16px der
  geerbten Schrift. Die Vergroesserungen vom 09.09. (15 → 19px) und 12.09.2026 (→ 22.8px)
  wuchsen deshalb nur den unsichtbaren Rahmen `.ppv-k-ic`; SICHTBAR blieb das Symbol 16px und
  sass oben links darin. Die frueheren Messungen hatten den Rahmen gemessen, nicht das SVG.
  Seit `.ppv-k-ic .ppv-name-ic { width: 100%; height: 100% }` fuellt es den Rahmen: sichtbar
  25.08px und senkrecht exakt auf Hoehe der Kreise (Leonard-Entscheidung, nachgemessen).
  LEHRE: Bei Symbolen immer das `svg` selbst messen, nicht den umgebenden Kasten.
- **Die Sportsymbole der Kombi-Karte stehen mittig** zwischen dem AEUSSEREN Kartenrand und dem
  ersten Wochentagskreis (09.09.2026, Leonard-Wunsch; vorher linksbuendig in ihrer Spalte).
  Nachgemessen auf 375px nach der Vergroesserung: Kartenrand bei x=12, erster Kreis bei
  x=60.2, Mitte also 36.1 — `justify-self: center` in der 24px-Spalte landet bei 38, also
  1.9px daneben. Der Versatz ist eine Folge des Rasterabstands (4px) und laesst sich ueber
  `--ppv-k-lead` NICHT wegbekommen: Schrumpft die Spalte, wandert der erste Kreis mit und der
  Sollwert mit ihm (gemessen bei 20, 21 und 24px — immer dieselben ~1.9px). Nur ein fester
  Versatz am Symbol koennte es, der haengt aber an der Bildschirmbreite.
  FALLE, die dabei zuschlug: In der Beschriftungszeile steht an derselben Stelle ein LEERER
  `.ppv-k-ic` als Platzhalter fuer das Raster. Mit 19px zog er die Zeile von 15 auf 19px und
  die ganze Karte um 4px mit. Er traegt deshalb `height: 0` — die Breite kommt ohnehin aus
  `--ppv-k-lead`.
- **KEINE roten Wochen im gemeinsamen „Trainingskalender"** (09.09.2026, Leonard-Wunsch).
  `wocheOhneTraining` gibt bei `zeigtKraft && zeigtLaeufe` sofort `false` zurueck. Im Gym- und
  im Laufkalender bleiben sie unveraendert — dort ist „diese Woche nichts" eine klare Aussage
  ueber genau eine Sportart, im gemeinsamen Kalender uebertoente das Rot nur die Marken.
  Gemessen: Trainingskalender 0, Gymkalender 165, Laufkalender 249 rote Kaestchen.
- **Ein ZWEITER Tipp auf denselben Tag schliesst die Kalender-Fusszeile wieder**
  (09.09.2026, Leonard-Wunsch). `showCalDay` prueft als Erstes, ob die Zelle schon `.sel`
  traegt — dann nimmt es die Markierung weg, leert `#<id>-detail` und kehrt zurueck.
  Gilt automatisch in BEIDEN Kalendern, weil beide dieselbe Funktion nutzen. Der Tipp auf
  einen ANDEREN Tag schaltet weiterhin normal um.
- **Der Details-Knopf bleibt bei ERLEDIGTEN Uebungen stehen** (09.09.2026, Leonard-Wunsch).
  `renderActiveWorkout` warf bei `ex.done` die ganze Aktionsleiste weg — mit ihr das
  Verlaufsdiagramm, ausgerechnet nachdem man die Uebung abgeschlossen hatte. Jetzt bekommt
  eine erledigte Uebung eine Leiste mit NUR diesem Knopf: „+ Satz", „− Satz" und
  „Ueberspringen" ergeben dort nichts mehr.
- **AM WISCHEN NICHTS AENDERN, ohne auf dem iPhone gegenzupruefen** (Leonard-Meldung
  08.09.2026). An dem Tag wurden drei Eingriffe gebaut und noch am selben Tag komplett
  zurueckgenommen — das Wischen war danach „gar nicht mehr fluessig":
  1. Das Loslassen selbst zu Ende fuehren (eigene Fahrt in 200ms statt der Schwungphysik des
     Geraets, `scroll-snap-type` waehrend der Fahrt auf `none`). Das war der Hauptverdaechtige:
     Die Uebernahme kaempft auf iOS gegen den noch laufenden Momentum-Scroll.
  2. Eine 130ms-Blende auf den Akzentfarben beim Umschalten bei 50%. (Dieselbe Sache war
     frueher schon einmal mit 450ms da und wurde ebenfalls abgeschaltet — inzwischen ZWEIMAL
     verworfen.)
  3. Den Neuaufbau des angekommenen Tabs ueberspringen, wenn sich nichts geaendert hat.
  Welcher der drei es war, ist NICHT geklaert — sie wurden zusammen ausgeliefert und zusammen
  zurueckgenommen. Wer einen davon erneut versucht, liefert ihn EINZELN aus.
  EIN NEUER EINGRIFF IM SCROLL-HANDLER seit dem 21.09.2026 (v368, einzeln, auf Leonards Auftrag):
  Die Seitenleiste schaltet an der 50-%-Schwelle um (siehe Seitenleiste, Punkt 3). Meldet
  Leonard danach ein schlechteres Wischgefuehl, ist das der erste Verdaechtige.
  **Das Loslassen selbst zu fuehren ist ZWEIMAL gescheitert** (08.09.2026, beide Male von
  Leonard zurueckgewiesen) — mit zwei verschiedenen Mechanismen:
    1. Fassung: Scrollposition Bild fuer Bild selbst schreiben, `scroll-snap-type` waehrend
       der Fahrt auf `none`.
    2. Fassung: nur EIN `scrollTo(..., behavior:'smooth')` beim Loslassen, Snap unangetastet.
  Beide fuehlten sich schlechter an als der native Snap. Die Vermutung, es liege am
  Bild-fuer-Bild-Schreiben, hat sich damit NICHT bestaetigt — offenbar ist jede Uebernahme des
  Loslassens schlechter als die Geraetephysik, weil sie deren Momentum abwuergt.
  NICHT ein drittes Mal versuchen, ohne dass Leonard ausdruecklich darauf besteht.
  STATTDESSEN am 08.09.2026 umgesetzt: `-webkit-overflow-scrolling: auto` am `#tab-container`
  (nur dort — alle anderen Scrollbereiche behalten `touch`). Damit entfaellt die Schwungphase
  von iOS und es bleibt nur die kurze Einrast-Animation des Browsers. Anders als die beiden
  gescheiterten Versuche greift dabei NICHTS ins Scrollen ein; der Browser bleibt allein
  zustaendig, ihm wird nur eine Phase abgenommen.
  WICHTIG fuer kuenftige Wuensche wie „Auslaufen um X% verkuerzen": Es gibt KEINEN Regler.
  Weder CSS noch JS geben die Bremsstaerke frei — es gibt nur „mit Schwung" oder „ohne".
  Jeder Zwischenwert liefe auf eine eigene Fahrt hinaus, und die ist zweimal gescheitert.
  GRUND, warum das hier so leicht schiefgeht: Weder Geste noch Animation sind auf dem Rechner
  pruefbar (rAF feuert in der versteckten Ansicht nie, Timer werden auf ~1s gedrosselt, und
  Mausgesten loesen den Wisch gar nicht aus). Alles, was das Wischgefuehl betrifft, kann nur
  Leonard auf dem Geraet beurteilen.
- **Die Fahrt von Tab zu Tab bei einem PROGRAMMATISCHEN Wechsel laeuft seit dem 12.09.2026 von
  Hand** (`_tabFahrt`, 320ms, ease-out). Vorher stand dort `scrollTo({ behavior: 'smooth' })` —
  seit `#tab-container` am 08.09.2026 `-webkit-overflow-scrolling: auto` traegt (die Schwungphase
  sollte weg), faellt WebKits eigene weiche Fahrt aber auf einen harten Sprung zurueck. Genau das
  hat Leonard am 12.09.2026 gemeldet („der Wechsel geschieht nicht ueber die Wischanimation").
  Beides zugleich gibt es nicht: Entweder der Browser fuehrt den Scroller (dann mit Schwung) oder
  wir fuehren ihn.
  ABGRENZUNG zu den zwei gescheiterten Versuchen vom 08.09.2026 (siehe die Wisch-Warnung weiter
  unten): Die wollten das LOSLASSEN einer Wischgeste uebernehmen und kaempften gegen den noch
  laufenden Momentum-Scroll. Hier liegt kein Finger auf dem Glas und es gibt kein Momentum — die
  GESTE selbst ist unangetastet.
  DREI Dinge, die daran haengen:
  1. `scroll-snap-type` muss waehrend der Fahrt auf `none`. Bei `mandatory` zieht WebKit nach
     jedem Schreiben von `scrollLeft` sofort auf den naechsten Rastpunkt. Am Ende landet die
     Fahrt exakt auf einem Rastpunkt, das Wiedereinschalten ruckelt also nicht.
  2. NOTBREMSE (`setTimeout`, 720ms): `requestAnimationFrame` ruht, solange die Seite nicht
     sichtbar ist. Ohne sie bliebe die Fahrt auf halbem Weg stehen UND `scroll-snap-type` auf
     `none` — der Container haette danach gar kein Einrasten mehr.
  3. Ein `pointerdown` waehrend der Fahrt bricht sie ab; wer selbst wischt, bekommt seinen Wisch.
  NICHT auf diesem Rechner pruefbar (rAF feuert in der versteckten Ansicht nie — dort greift
  immer die Notbremse). Zum ZURUECKNEHMEN genuegt es, den Aufruf in `wischeZuTab` wieder durch
  `container.scrollTo({ left: …, behavior: 'smooth' })` zu ersetzen.
- **Tabwechsel per Wischbewegung aus der App heraus:** `wischeZuTab(name)` scrollt `#tab-container`
  OHNE `_suppressScrollSync` — dadurch fuehrt der Handler aus `initTabScrollSync`
  Hintergrund-Crossfade, Theme und Nav waehrend der Bewegung mit und ruft im Settle `_applyTabState`,
  genau wie bei einer echten Wischgeste. `showScreen` bleibt der harte Sprung (`behavior:'auto'` plus
  unterdrueckter Handler) und ist die Rueckfallebene: aus Vollbild-Overlays heraus, bei unbekanntem Ziel
  und bei `prefers-reduced-motion`. Im Einsatz bei der Wochenplan-Karte: Tipp auf einen Wochentag
  (`jumpToWorkoutDay`) wischt in den Trainings-Tab, Tipp auf die Karte selbst in den Plaene-Tab
  (Leonard-Wunsch 01.09.2026). Gilt in ALLEN Tabs, die diese Karte zeigen — sie ist bewusst ueberall dieselbe.
  TESTHINWEIS: In einer versteckten Browser-Ansicht (`visibilityState:'hidden'`) laeuft weder die weiche
  Scrollbewegung noch feuern ueberhaupt `scroll`-Ereignisse — der ganze Tab-Sync ist dort nicht pruefbar.
- **Die Karte „Trainingsplan-Daten" ist wie „Laufplan-Daten" aufgebaut** (04.09.2026,
  Leonard-Wunsch): Zeile 1 Name, Zeile 2 Start | Ende | Wochen (`.lp-datenzeile.sp3`,
  `#prog-datenzeile`, von `renderPlanDetail()` gefuellt), Zeile 3 Notizen. Beide Karten tragen
  `.plan-form-card`, damit sie sich dieselben Regeln teilen.
  ACHTUNG, VERHALTENSAENDERUNG: Start und Ende sind jetzt UNABHAENGIG. Vorher schob ein neues
  Startdatum das Enddatum mit, und die Gesamtdauer war ein eigenes Eingabefeld (`#prog-weeks`,
  `onWeeksChange` — beide entfallen). Die Wochenzahl wird aus beiden Daten abgeleitet.
  `weeksTotal` bleibt trotzdem GESPEICHERT, weil ein Dutzend Stellen es liest (Vorlagen,
  Sicherung, `getActivePlan`); `_planDauerNachziehen` haelt es bei jeder Datumsaenderung auf
  Stand. `_planProgramWeek` rechnet die Gesamtzahl jetzt ebenfalls aus Start und Ende — sonst
  stand in der Karte „Woche 5 / 12", waehrend die Detailansicht „9 Wochen" nannte (Plaene ohne
  `weeksTotal` fielen dort auf die 12 aus `getActivePlan` zurueck).
  Die Datumsfelder nutzen dasselbe `lpDatumFeld`-Muster wie der Laufplan (sichtbarer Kasten,
  unsichtbares `<input type="date"` darueber). Deren IDs `prog-start`/`prog-end` bleiben, damit
  `onStartDateChange`/`onEndDateChange` unveraendert weiterlesen. Zeitzonen gehen auf: Der
  Gymplan speichert UTC-Mitternacht, und in Mitteleuropa liefern die LOKALEN Datumsteile davon
  denselben Kalendertag.
- **Der heutige Wochentag wird in der Plan-Detailansicht NICHT hervorgehoben** (01.09.2026). Die Klasse
  `.wpe-row.today` steht weiter im Markup, hat aber keine Regeln mehr — dort wird ein Plan bearbeitet,
  das aktuelle Datum spielt keine Rolle und die eingefaerbte Zeile las sich wie eine Auswahl.
  **Seit dem 12.09.2026 gilt dasselbe fuer die WOCHENPLAN-KARTEN der Seiten „Gymplan" und
  „Laufplan"** (Leonard-Wunsch): Dort ist das Heute-Feld hinter dem Wochentag abgeschaltet —
  im Plan-Tab verwaltet man Plaene, nicht den heutigen Tag. In der UEBERSICHT (alle drei
  Filterzustaende) und im TRAININGS-Tab bleibt es unveraendert stehen.
  Geschaltet wird es ueber den Parameter `hideToday` von `buildPlanCard`; `buildRunPlanCard`
  hat dafuer am selben Tag `opts.hideToday` als Gegenstueck bekommen (die Funktion nimmt ihre
  Schalter ueber `opts`, nicht ueber Positionsparameter).
- **Wochenplan in der Plan-Detailansicht:** `.wpe-list`/`.wpe-row` = eine Zeile pro Wochentag (nicht 7 Spalten), damit lange Tagnamen vollständig umbrechen können; unsichtbares `<select>`-Overlay pro Zeile weist den Tag zu.
- **Löschen** = „Bearbeiten"-Modus (Kästchen auswählen → „Löschen (N)" → Sicherheits-Dialog) via `_delCtx`/`_delSel`/`buildDelEditList`; inline ✕ fragt ebenfalls nach. **Hinzufügen** = Multi-Select-Modals mit „Hinzufügen (N)".
- **Bottom-Nav**: Beim APP-START ist sie EINGEKLAPPT (`setNavHidden(true)` am Ende von
  `initScrollHideNav`, Leonard-Wunsch 07.09.2026) — bewusst ueber `setNavHidden`, damit
  Laufanzeige und Pausenleiste denselben Zustand mitbekommen.
  **JEDER TABWECHSEL BLENDET SIE AUS** (12.09.2026, Leonard-Wunsch „beim Swipen und Wechseln
  zwischen den Tabs soll die Tableiste verschwinden"). ZWEI Ausloeser, weil es zwei Wege gibt:
  der Wisch (und die programmatische Fahrt aus `wischeZuTab`) meldet sich im Scroll-Handler
  von `initTabScrollSync` an der 50-%-Schwelle, der harte Wechsel in `showScreen`.
  `setNavHidden` ist eine LOKALE Funktion in `initScrollHideNav`; damit `showScreen` sie
  erreicht, steht der Zeiger darauf in `_navVerstecken` (vor dem Einrichten eine leere
  Funktion).
  Zwei Faelle sind ausdruecklich AUSGENOMMEN: derselbe Tab noch einmal angetippt (`onNavTap`
  scrollt dann nur nach oben und kommt gar nicht bis `showScreen`) und die Rueckkehr aus
  einem Vollbild-Overlay (`closeMehr`, Plan-Detail) — das ist kein Tabwechsel, deshalb prueft
  `showScreen` zusaetzlich, ob der VORHERIGE Bildschirm ueberhaupt ein Tab war. Beides
  gemessen.
  Scrollen blendet sie nur AUS (ab 60px Scrolltiefe, Runterwisch > 5px) und NIE wieder ein — auch nicht
  am Seitenanfang (Leonard-Entscheidung, 20.08.2026; vorher holte sie jeder Hochwisch zurueck). Zurueck kommt sie
  ausschliesslich durch einen Tipp auf den BLANKEN Tab-Hintergrund: `e.target === screenEl` in `initScrollHideNav`
  (Leonard-Entscheidung 01.09.2026). Die fruehere Pruefung ueber `e.composedPath()` liess auch Tipps auf „tote"
  Karten ohne eigene Aktion durch — unerwuenscht. Folge: In einem Tab, dessen Inhalt den Bildschirm restlos
  fuellt, gibt es keine Flaeche zum Zurueckholen; dort hilft nur ein Tabwechsel.
  ACHTUNG beim Testen: Der Scroll-Handler laeuft in `requestAnimationFrame` — in einem versteckten Tab feuert der nie,
  die Sperre `_navTickingByTab` bleibt dann auf `true` haengen und JEDES weitere Scroll-Ereignis wird verworfen.
- Übersicht hat eine Plan-Dashboard-Karte (`buildPlanCard`) + „Letzte Sessions" + Volumen-Chart (`renderVolumeChart`, Chart.js).

## Laufen

Uebernommen aus der App „Health Command Center" (01.09.2026, Leonard-Entscheidung).
**KEIN eigener Tab** — der fuenfte Tab wurde am 01.09.2026 wieder entfernt und der Inhalt auf zwei
bestehende Tabs verteilt (Leonard-Wunsch):
- **Trainings-Tab**, Seitenschalter `Gym | Laufen` (`setWorkoutsView`, `workoutsViewMode`,
  Huellen `#wo-view-gym` / `#wo-view-laufen`). Gym = das bisherige Krafttraining,
  Laufen = der Ueberblick ueber die gelaufenen Einheiten (`renderLaufKalenderSeite`).
- **Plaene-Tab**, DRITTE Seite `Laufplan` (`setPlansView('runplans')`, Liste `#runplans-list`,
  `renderLaufVerwaltung`). Das „+" im Kopf legt dort einen Laufplan an (`onPlansAdd`).
  Der Trainingskalender gehoert zur Seite „Trainingsplan" und ist auf den anderen beiden aus.
ACHTUNG: Das Querformat-Grid des Trainings-Tabs haengt seit dem Seitenschalter an
`#wo-view-gym`, NICHT mehr am Screen — Wochenplan und Herocard sind keine direkten Kinder
des Screens mehr.
**Zwei Quellen, streng getrennt:**
- Die **gelaufenen Einheiten** kommen aus Leonards Google-Tabelle „Workout Data" (Ordner
  „health auto export", `RUN_SHEET_ID`). FitTrack **liest nur** und schreibt dort nie hinein.
  BEWUSST nur diese eine Datei — HCC zieht die Pace zusaetzlich aus einem zweiten Health-Blatt,
  hier reicht die Spalte `Speed (km/h)` derselben Zeile. Die Spalten werden ueber die KOPFZEILE
  gesucht, nicht ueber feste Positionen: Health Auto Export haengt neue Spalten hinten an.
  Gelesene Laeufe liegen in `ft_runs_cache` (mit Zeitstempel), damit der Tab offline etwas zeigt;
  sie sind BEWUSST NICHT in der Drive-Sicherung — die Daten gehoeren der Tabelle.
- Die **Laufplaene** liegen lokal in `ft_runplans` wie alle FitTrack-Daten und sind in der
  Drive-Sicherung (`runPlans`).

**Eigener OAuth-Bereich, eigener Token-Client** (`RUN_SCOPE` = `spreadsheets.readonly`,
`runRequestToken`). Bewusst getrennt vom Drive-Zugang: Haengte man den Tabellen-Bereich an den
bestehenden Client, verlangte Google fuer die Sicherung eine neue Zustimmung — und solange der
Bereich im Google-Projekt nicht freigeschaltet ist, waere die Drive-Sicherung mit kaputt.
VORAUSSETZUNG: Der Bereich muss im Google-Cloud-Projekt von FitTrack freigeschaltet sein.
ACHTUNG, zwei Stellen, die den Abruf sonst STILL blockieren (beide am 01.09.2026 aufgetreten):
1. Die **Content-Security-Policy** in `index.html` (`connect-src`) muss `https://sheets.googleapis.com`
   auflisten — sonst blockt der Browser die Anfrage, bevor sie rausgeht, und Safari meldet nur
   „Load failed". `www.googleapis.com` reicht NICHT, die Sheets-API laeuft auf einem eigenen Host.
2. Der Host muss in `sw.js` in `NO_CACHE_HOSTS` stehen. Sonst faellt der Abruf in den
   Cache-first-Zweig: Der Zugangs-Schluessel im Kopf landete im Zwischenspeicher und die
   Laufdaten waeren eingefroren.

**Datenmodell Laufplan:** `{ id, name, notes, startDate, endDate, runDays:[0..6], archived,
raceDate, units:[{week, dayIdx, km, minutes, zone, note}] }`. `note` ist die Notiz zu EINER
geplanten Einheit (04.09.2026). In der Planzeile steht nur eine gekuerzte Vorschau — sie muss
einzeilig bleiben —, geschrieben wird in `#modal-run-note` (`openRunNote`/`saveRunNote`).
Der Knopf `.lp-notiz` ist bewusst KEIN Eingabefeld: Ein Feld bekaeme auf iOS den Fokus und die
Tastatur ginge ueber einer einzigen sichtbaren Zeile auf. Nach dem Speichern zieht
`saveRunNote` die Vorschau von Hand nach, statt die Seite neu zu bauen (sonst verlieren die
Nachbarfelder ihre offenen Eingaben — dieselbe Ueberlegung wie bei `setRunZone`).
ACHTUNG `setRunUnit`: `zone` UND `note` sind TEXT, nur km und Minuten werden als Zahl gelesen.
Die Notiz erscheint auch in der Detailansicht eines Laufs (`showRunDetail`), sofern der Tag zu
einer geplanten Einheit gehoert.
Mit dem Notizfeld hat `.lp-einheit` sieben Spalten und fuellt die Zeile voll aus — der fruehere
Einzug der Tagesspalte ist entfallen, fuer beides zusammen reicht der Platz auf 375px nicht. Notizen speichern sich STILL (ohne
Re-Render) — sonst verliert das Feld beim Tippen den Fokus.
ACHTUNG: Der Bestaetigungsdialog heisst `confirmAction`, NICHT `confirmDialog` — ein Aufruf unter
dem falschen Namen scheitert still, das Loeschen tat monatelang nichts (gefunden 01.09.2026).
**Sicherung und Loeschschutz wie bei den Trainingsplaenen:** `ft_runplans` steckt in
`collectLocalData()`/`driveApplyCloudData` (Feld `runPlans`), in `_snapshotStores`/`_restoreStores`
(„Rueckgaengig") und im Papierkorb (`trashPut('runplan', …)`, Label in `TRASH_LABELS`, eigener
Zweig in `trashRestore`). Der Zwischenspeicher der gelesenen Laeufe (`ft_runs_cache`) ist BEWUSST
in keinem davon — die Daten gehoeren der Tabelle und werden beim naechsten Abruf neu geholt. Ein Laufplan ist ein DATIERTER Ablauf (Woche 1..N ab
dem Montag der Startwoche), kein Wochenmuster wie die Trainingsplaene — die Einheiten sind deshalb
EINGEBETTET und nicht wie die Trainingstage geteilte Bausteine. Das Datum einer Einheit wird
GERECHNET (`runEinheitDatum`), nicht gespeichert: Verschiebt man den Plan, wandert alles mit.

**Die Verbindung zur Tabelle steht in den EINSTELLUNGEN**, oberhalb des Papierkorbs
(Abschnitt „Laufdaten", `#run-source-card`, gefuellt von `renderRunSourceCard()`) — seit dem
04.09.2026, vorher als Karte auf der Seite „Laufen" im Trainings-Tab. Es ist eine
Einrichtungssache, keine Trainingsinformation (Leonard-Wunsch). Aufgefrischt wird sie in
`renderMehr()` und an beiden Enden von `runLaeufeLaden`. Mit ihr wanderte NICHTS anderes:
Die Seite „Laufen" zeigt jetzt nur noch Laufwochenplan und „Diese Woche"; die Karte
„Letzte Laeufe" ist am selben Tag ersatzlos entfallen (mit ihr die CSS-Regeln
`.lauf-liste`/`.lauf-row*`).
`.mehr-card` bringt KEIN Polster mit — `#run-source-card .lauf-quelle` setzt die 14px selbst.

**Die Laeufe haengen an KEINEM Sync** (04.09.2026 ausdruecklich so entschieden): „Jetzt
synchronisieren" sichert nur nach Drive, `markLocalChange`/`driveInit` ebenso. Die Tabelle wird
allein ueber „Aktualisieren" in der Laufdaten-Karte gelesen. Eine Kopplung war kurz eingebaut und
wurde auf Leonards Wunsch wieder entfernt — nicht erneut einbauen, ohne zu fragen.

**Der Laufplan wird auf einer EIGENEN SEITE bearbeitet** (`#screen-runplan-detail`, 04.09.2026,
Leonard-Wunsch) — vorher klappte er in der Liste auf. Der Ablauf ist vom Gymplan kopiert:
`openRunPlanDetail(id)` setzt `editingRunPlanId` und ruft `showScreen('runplan-detail')`,
`closeRunPlanDetail()` fuehrt zurueck in den Plaene-Tab, der Zurueck-Pfeil oben links ist
derselbe `.sheet-back-btn` und `initOverlayEdgeSwipe` gibt der Seite dieselbe Wischgeste vom
linken Bildschirmrand. Ein neuer Plan landet direkt in seiner Detailseite.
`_laufOffenePlaene`, `toggleRunPlan` und `runPlanKarte` sind entfallen.
Die Abschnitte stehen auf `.mehr-card`, NICHT auf `.chart-card-v2` — `.mehr-card` fehlt in der
Glas-Liste und bleibt deshalb auch im Transparenz-Modus weiss, genau wie das Gymplan-Detail
(das war der Anlass). Damit ist auch die kurzzeitige Glas-Ausnahme fuer die aufgeklappte Karte
wieder weg.
ACHTUNG: Nach einer Aenderung muss der SICHTBARE Bildschirm neu gezeichnet werden — mal die
Liste, mal die Detailseite. Das entscheidet `_laufNeuZeichnen()`; ein direkter Aufruf von
`renderLaufVerwaltung()` liesse die Detailseite veraltet stehen.
- **Start | Ende | Wochen | Wettkampf in EINER Zeile** (`.lp-datenzeile.sp4`, seit 04.09.2026
  vier Spalten; der GYMPLAN nutzt dieselbe Zeile mit `.sp3`, ohne Wettkampf). Die Wochenzahl ist ABGELEITET (`runPlanWochen`) und deshalb kein Eingabefeld, sondern
  `.lp-wochen-v` — sieht aus wie eines, gleiche Hoehe. Der Abschnittstitel heisst nur noch
  „Lauftage", das Wettkampffeld nur noch „Wettkampf" (fuer „(optional)" ist kein Platz).
  Ein GRID (`.sp4` = `1fr 1fr 46px 1fr`, `.sp3` = `1fr 1fr 46px`, gap 6px), weil die Breiten bei
  vier Spalten auf den Punkt aufgehen muessen:
  323px Zeile − 46px − 3×6px = 86,3px je Datumsfeld, abzueglich 2×3px Polster und 2×1px Rand
  bleiben 78,3px Text. „03.09.2026" misst bei 14px 75px, bei 15px schon 79,6px — deshalb sind
  Datum und Wochenzahl in dieser Zeile NICHT 15px (seit 21.09.2026 13px = Stufe „Nebentext" der
  Schriftskala, vorher 14px). Das UNSICHTBARE Eingabefeld darunter bleibt bei
  16px, sonst zoomt iOS hinein. Die Beschriftungen laufen auf 11px: „Wochen" misst bei 12px 47px
  und stiess ohne Luecke an „Wettkampf".
- **Datum und Herzzone sind KEINE nativen Bedienelemente mehr** (04.09.2026). Sichtbar ist je ein
  gewoehnlicher Kasten (`.lp-datum` / `.lp-zone`), das native `<input type="date">` bzw. `<select>`
  liegt unsichtbar darueber (`opacity:0`, `position:absolute; inset:0`) — dasselbe Muster wie
  `.wpe-select` im Plan-Detail. Grund: Die Masse eines nativen Datumsfeldes und eines Auswahlfeldes
  legt der BROWSER fest, auf iOS anders als in Chrome. Auf dem iPhone schob sich „Ende" dadurch in
  die Wochenspalte und „Wettkampf" lief ueber den Kartenrand hinaus, obwohl in Chrome alles passte.
  Jetzt bestimmt allein das CSS die Breite. Die unsichtbaren Bedienelemente MUESSEN 16px tragen,
  sonst zoomt iOS beim Fokussieren hinein. Der Text der Zone wird von `setRunZone` von Hand
  nachgezogen — ein Neuaufbau der Karte naehme den Feldern darueber die offenen Eingaben.
  `.program-form-row input[type="date"] { font-family: inherit }` bleibt fuer den GYMPLAN noetig,
  der weiter native Datumsfelder nutzt (der Browser setzt sie sonst auf Monospace).
- **ZEITZONEN-Falle bei den Laufplan-Daten** (gefunden 04.09.2026): `setRunPlan` speichert LOKALE
  Mitternacht (`new Date(wert + 'T00:00:00')`). Wer das mit `toISOString()` zurueckliest, bekommt in
  Mitteleuropa 22:00 des VORTAGS — das Feld zeigte einen Tag zu frueh, und jedes erneute Speichern
  schob das Datum ein weiteres Mal zurueck. `lpDatumFeld` liest deshalb die LOKALEN Datumsteile.
  Die Trainingsplaene sind nicht betroffen: `_msToDate`/`_dateToMs` rechnen beide in UTC und
  bleiben unter sich stimmig — beim Angleichen der beiden Seiten also nicht halb umstellen.
- **Die Formularkarte hat KEINE Tipp-Animation** (04.09.2026): `.mehr-card.plan-form-card` setzt
  `transition: none` und `:active { transform: none }` — jeder Tipp in ein Feld liess sie sonst
  zucken. Drei Klassen, damit `.mehr-card:active` verliert. Die KACHEL in der Liste behaelt die
  Animation, dort oeffnet der Tipp ja die Detailseite.
- **km, min und Zone haben eine feste gemeinsame Hoehe** (38px, `box-sizing: border-box`). Ohne die
  war die Zone 2px hoeher: Ein `<select>` rechnet seine Zeilenhoehe anders als ein `<input>`.
- **`.lp-einheit` hat feste, schmalere Felder** (60px statt mitwachsend) und `justify-content:
  center`. Dadurch ist die Tagesspalte gegenueber den Formularfeldern darueber um 14px
  eingerueckt (Leonard-Wunsch).
- **Die Detailseite nimmt den Transparenz-Modus NICHT an** (04.09.2026, Leonard-Wunsch) — das
  ergibt sich von selbst daraus, dass ihre Abschnitte auf `.mehr-card` stehen. Die KACHEL in der
  Liste bleibt durchsichtig, genau wie die Gymplan-Kacheln. Eine kurzzeitig gebaute
  Ueberschreibung (`html.glas … .lauf-plan.offen` mit `inherit` auf allen Farbtoken) ist mit dem
  Umzug auf die eigene Seite wieder entfallen, ebenso die Sonderregel fuer `.lp-tagwahl.an`.

**Die Seite „Laufen" hat eine Tagesauswahl wie die Seite „Gym"** (04.09.2026, Leonard-Wunsch):
Ein Tipp auf einen Wochentag im Laufwochenplan waehlt ihn aus (`selectRunDay`,
`selectedRunDayIdx`, vorbelegt mit heute) — `buildRunPlanCard` nimmt dafuer `opts.selectedIdx`
und `opts.dayOnTap` entgegen, genau wie `buildPlanCard`. Die Auswahl steuert seit dem
21.09.2026 NUR NOCH DIE HEROCARD.

**LAEUFE DIESER WOCHE als Liste in der Karte „Diese Woche"** (`laufWochenListe(mo)`,
21.09.2026, Leonard-Entscheidung „Variante A" aus vier gezeichneten Vorschlaegen — Zeitstrahl,
Kacheln und Strecke im Wochenplan waren die anderen). Unter den drei Summen steht eine Zeile je
Tag der laufenden Woche mit geplantem ODER gelaufenem Lauf — UNABHAENGIG vom gewaehlten Tag.
Auch schon gelaufene Tage und Laeufe an ungeplanten Tagen stehen drin (Leonard-Entscheidung).
Aufbau einer Zeile: Scheibe mit dem Wochentag · Vorgabe („8 km · 45min") mit Zonen-Pille,
darunter die Notiz der Einheit · rechts das Ist („8.1 km gelaufen", beim Intervalltraining
„HIIT 28min"), sonst „verschoben".
HEUTE steht seit dem 22.09.2026 NICHT mehr als Wort rechts, sondern als dasselbe gruene Feld
hinter der Scheibe, das die Wochenplan-Karte darueber fuer den heutigen Tag nutzt (`.ppv-col.today`,
Leonard-Wunsch): `.lauf-wz-feld.heute` mit `var(--accent-bg)`, im Transparenz-Modus 18-%-Weiss.
Das Polster des Feldes reicht ueber die Scheibe hinaus und wird per negativem Aussenabstand wieder
herausgerechnet — die Zeile bleibt genauso hoch und die Scheibe steht, wo sie stand (gemessen:
alle Scheiben weiter bei 26px, Zeilenhoehen unveraendert). Ohne Vorgabe steht „Ohne Vorgabe", ein Lauf an
einem ungeplanten Tag heisst „Nicht geplant".
Die Scheibe traegt DIESELBEN Zustaende wie der Wochentagskreis der Karte darueber: gefuellt
(#4ADE80) = gelaufen, hellgrau mit Ring = geplant und offen, grau = verschoben
(`runVerschobeneTage`). Die Vorgabe kommt aus `runGeplanteTage` — derselben Quelle wie die
Kennzahl „geplant" daneben.
**JEDE ZEILE HAT EINEN LAENGENBALKEN** (`_laufWzBalken`, 22.09.2026, Leonard-Entscheidung
„Variante A" gegen eine kurze Saeule in der Zeile und einen Balken hinter dem Text): eine 4px
hohe Leiste UNTER den Angaben, eingerueckt auf die Textspalte (30px Scheibe + 10px Abstand), in
voller Zeilenbreite. HELL = die Vorgabe (62 % der Lauffarbe; bis zum 22.09.2026 38 %, Leonard: „weniger blass"),
KRAEFTIG = die tatsaechlich gelaufene Strecke; ist der
kraeftige Teil laenger, war der Lauf laenger als geplant.
BEZUG ist der laengste Lauf des GANZEN Plans (`_laufBezugKm`, Leonard-Entscheidung) — so lassen
sich die Wochen beim Wischen vergleichen; in einer lockeren Woche sind eben alle Balken kurz.
Die tatsaechlich gelaufenen Strecken zaehlen in den Bezug mit, sonst stiesse ein Lauf, der laenger
war als jede Vorgabe, an den Rand. Mindestbreite 3 %, damit ein sehr kurzer Lauf sichtbar bleibt.
KEIN Balken ohne Kilometer: Intervalltraining (`art: 'hiit'`) und Lauftage ohne Vorgabe.
Die Zeile hat dafuer zwei Ebenen (`.lauf-wz-oben` + Balken); `.lauf-wz` ist kein Flex mehr.
GEMESSEN (Bezug 21 km): 6 km = 28.6 %, Ist 6.2 km = 29.5 %, 8 km = 38.1 %, 14 km = 66.7 %, „Ohne
Vorgabe" ohne Balken; ein Lauf UNTER der Vorgabe (8 km geplant, 5.4 km gelaufen) zeigt beide
Teile (108px hell, 73px kraeftig). Glas-Modus: Spur 20-%-, Vorgabe 45-%-, Ist 92-%-Weiss.

Ein GELAUFENER Tag ist ein `<button>` und oeffnet `showRunDetail(key)`; er traegt denselben
kleinen Pfeil-Knopf wie die Kalender-Fusszeile (`.cal-detail-chev`, die Regel gilt jetzt fuer
beide). Ein Tipp auf eine Zeile waehlt den Tag NICHT aus.
Transparenz-Modus: keine Sportfarben — gelaufen weiss gefuellt, offen weiss umrandet, wie die
Wochentagskreise der Einzelkarten. Der Wochentag im weissen Kreis ist FEST #059669 (das
`--accent-dark` des Trainings-Tabs), weil `--accent-dark` auf der Glas-Karte selbst weiss ist.
DIE TAGESKARTE DES GEWAEHLTEN TAGS IST ENTFALLEN (Leonard-Wunsch): `buildLaufTagKarte`,
`#wo-lauftag-card`, ihre Staffel in `selectRunDay` und die Regeln `.lauf-tag-*`. Ihre Angaben
(Vorgabe, Zone, Notiz, Ist, Weg zur Detailansicht) stehen jetzt in der Liste.
`.aex-v2:not(.lauf-tag-karte)` bleibt BEWUSST stehen — das `:not()` traegt die Spezifitaet.
GEMESSEN (375px, Datum kuenstlich auf Do gesetzt): Mo verschoben, Di HIIT an ungeplantem Tag,
Mi gelaufen mit Notiz, Fr ohne Vorgabe, So offen — Zustaende identisch mit den Kreisen der
Wochenkarte; Tipp auf Mi oeffnet die Detailansicht; mit echtem Datum (Mo) steht „heute";
Glas-Modus ohne Sportfarben; Querformat 1100px: Karte ueber beide Spalten; keine
Konsolenfehler.
VORGESCHICHTE der Tageskarte (04.09.–21.09.2026): Unter „Diese Woche" erschien
`buildLaufTagKarte(idx)`: Sie borgt sich die Klassen der AUSGEKLAPPTEN UEBUNGSKARTE (`.aex-v2`
mit Kopf, Scheibe, Tabelle und Notizspalte), damit beide Seiten des Trainings-Tabs gleich
aussehen. Angepasst ist nur, was die Laufwerte brauchen: drei gleich breite Spalten statt
Satz|Wdh|kg|Haken (`.lauf-tag-srow`), eine hellgruene Scheibe mit dem Wochentag statt einer
Nummer und die Notiz auf einer EIGENEN Zeile unter den Werten statt in der rechten Spalte —
die Tabelle ist hier nur eine Zeile hoch, daneben saehe die Notiz verloren aus. Wurde der Tag gelaufen, steht das in der Aktionsleiste mit einem Knopf zu
`showRunDetail`.

**DIE WOCHENKARTE IST WAAGERECHT WISCHBAR** (`_laufWochenWischEinrichten`, 22.09.2026,
Leonard-Entscheidung „Variante A" gegen Pfeile im Kopf). Alle Wochen des LAUFENDEN Laufplans
liegen nebeneinander in einem Scroller mit CSS-Scroll-Snap; eine Seite = eine Woche, gebaut von
`laufWochenSeite(mo, istAktuell)` (Summen `_laufWochenWerte` + Liste `laufWochenListe`).
GEBAUT WIE DER TRAININGSKALENDER — die Geste fuehrt allein der Browser. Eine selbst gefahrene
Wischbewegung ist in dieser App zweimal gescheitert (siehe „AM WISCHEN NICHTS AENDERN").
PREIS, bekannt vom Kalender: `overscroll-behavior-x: contain` haelt die Geste in der Karte, also
laesst sich ueber ihr der Tab nicht per Wisch wechseln. Ohne das wandert der Tab mit und die
Bewegung bricht ab. Dazu `.lauf-wochen-karte:active { transform: none }` (ein transform am
Vorfahren bricht die Geste auf iOS ab) und der `.cal-sticky-anchor` im Scroller.
KOPF: Titel und Datum stehen AUSSERHALB des Scrollers und werden beim Scrollen mitgefuehrt
(`_laufWochenAnzeige`, an der 50-%-Schwelle wie beim Tabwechsel): „Diese Woche" · „Nächste
Woche" · „Letzte Woche", weiter weg „Woche 6"; daneben die Spanne „21.–27. Sep" bzw. ueber den
Monatswechsel „28. Sep – 4. Okt" (`_laufWochenSpanne`).
ZURUECK ZUR LAUFENDEN WOCHE fuehren ZWEI Wege: der Titel (er ist ein Knopf) und seit dem
22.09.2026 ein eigener Knopf LINKS NEBEN DEM DATUM (Leonard-Wunsch). Er erscheint erst, sobald
eine andere Woche im Bild ist, und traegt dieselbe runde Form mit Kreispfeil wie der Knopf im
Kopf des Uebersichts-Kalenders (`.info-btn.cal-reset-btn`, `CAL_RESET_SVG`) — die App kennt nur
EIN Zeichen fuer „zurueck zur aktuellen Ansicht". Beim Erscheinen waechst er kurz auf
(`.kommt`, 180ms).
FALLE: `hidden` allein blendet ihn NICHT aus — `.info-btn` setzt `display: flex`, und eine
Autoren-Regel schlaegt das `display: none` des Browsers. Dafuer gibt es
`.lauf-wochen-zurueck[hidden] { display: none }`.
POLSTER 18px statt der ueblichen 14px (22.09.2026, Leonard: „das Polster wirkt hier zu klein").
GEMESSEN vorher: Die Karte hatte auf allen vier Seiten dieselben 14px wie der Kalender und die
uebrigen `.chart-card-v2` (Wochenplan- und Herocard: 14px seitlich, 15.4px oben/unten) — es war
also kein Unterschied, sondern der Inhalt: Kennzahlen, Trennlinien und Laengenbalken enden
buendig an der Polsterkante, waehrend in den Nachbarkarten Kreise und Knoepfe sichtbar
eingerueckt sitzen. NUR diese Karte traegt deshalb `.lauf-wochen-karte { padding: 18px }`.
SEITENANZEIGE: Punkte bis 14 Wochen, darueber ein schmaler Strich mit Marke — 30 Punkte passen
auf 375px nicht nebeneinander.
DIE HOEHE FOLGT DER GEZEIGTEN WOCHE (Leonard-Entscheidung „darf springen"): Der Scroller braucht
eine feste Hoehe, weil `overflow-x: auto` die Y-Achse mit beschneidet. WAEHREND der Geste gilt
die GROESSERE der beiden sichtbaren Wochen — sonst wird die naechste angeschnitten —, nach dem
Einrasten die der gezeigten.
NACH EINER BREITENAENDERUNG (Drehen) werden Hoehen UND Position neu gesetzt
(`_laufWochenBreitePruefen` → `sc._neuMessen`): `scrollLeft` fuehrt der Browser in PIXELN, eine
Seite ist danach aber anders breit, und es stuende eine andere Woche da. ZWEI Ausloeser, weil
keiner allein reicht: ein `ResizeObserver` am Scroller und das `resize`-Ereignis
(`initLaufWochenResize`, 150ms entprellt).
ZUSTAND: `_laufWochenNr` (Planwoche 1..N) gilt nur, solange man auf der Seite steht — der
Seitenwechsel auf „Gym" und das Verlassen des Tabs setzen sie zurueck, die Karte steht dann
wieder auf dieser Woche. Ein Neuzeichnen der Seite (Tagesauswahl, Laufdaten) behaelt sie.
„heute" und „verschoben" gibt es NUR in der laufenden Woche (`laufWochenListe(mo, istAktuell)`):
`runVerschobeneTage` rechnet ausschliesslich fuer sie.
OHNE laufenden Laufplan bleibt es bei EINER Seite, ohne Punkte und mit dem Titel als Text.
GEMESSEN (375px, Plan mit 8 Wochen, heute in Woche 3): Start auf Seite 3 mit „Diese Woche ·
21.–27. Sep"; Wischen auf Seite 4 → „Nächste Woche · 28. Sep – 4. Okt", Seite 2 → „Letzte
Woche", Seite 6 → „Woche 6"; Hoehe folgt (229/236px), zwischen zwei Seiten die groessere; Tipp
auf den Titel springt auf Seite 3 zurueck; Tagesauswahl behaelt die Woche, Seitenwechsel setzt
zurueck; Querformat 1100px ohne Ueberlauf; Glas-Modus: Punkte 28-%-Weiss, aktiver 92-%-Weiss.
NICHT PRUEFBAR HIER: die Geste selbst und beide Resize-Ausloeser — in der verdeckten
Browser-Ansicht liefert weder `ResizeObserver` noch das `resize`-Ereignis. Mit einem von Hand
ausgeloesten `resize` stimmt das Ergebnis (Seite und Hoehe wieder richtig).

**„Alle aufklappen / Alle zuklappen" ueber dem Abschnitt „Einheiten"** (`toggleAlleRunWochen`,
`#lp-alle-btn`, 13.09.2026, Leonard-Wunsch). Sind ALLE Wochen offen, klappt er alle zu, sonst
alle auf — dieselbe Regel wie im Uebungskatalog. Die Beschriftung folgt dem echten Zustand, auch
nach einzelnen Tipps auf eine Woche (`_syncAlleRunWochenBtn`, gerufen aus `toggleRunWoche`).
WIE `toggleRunWoche` OHNE Neuaufbau — gemessen: Eine gerade getippte, noch nicht gespeicherte
Eingabe in einem km-Feld bleibt beim Umschalten stehen.
Der Titel steht dafuer in einer Zeile mit dem Knopf (`.mehr-section-kopf`, wiederverwendbar fuer
jeden Abschnitt mit Knopf; der untere Abstand wandert vom Titel auf die Zeile). Der Knopf ist eine
Pille in 18-%-Weiss auf dem farbigen Grund der Detailseite, mit dem App-weiten Pfeil.
Die Wochen selbst klappen weiterhin OHNE Bewegung.

**Oberflaeche:** Seitenschalter `Laufkalender | Laufplanverwaltung` (`setLaufView`, `_laufSeite`).
Auf- und Zuklappen einer Woche laeuft OHNE Neuaufbau (`toggleRunWoche` schaltet nur `display`) und
die Einheiten sichern sich beim Verlassen des Feldes ohne Re-Render — sonst verlieren die
Kopffelder darueber (Name, Datum) ihre noch nicht gespeicherten Eingaben und den Fokus.
Der Wochenkopf ist NICHT `.weitere-btn`: Der setzt weisse Schrift auf farbigem Grund voraus, hier
steht er auf einer weissen Karte.

**Gemeinsamer Kalender:** Nur der Kalender in der UEBERSICHT (`id === 'cal'`) zeigt zusaetzlich
die Laeufe — der im Plaene-Tab bleibt vorerst reines Krafttraining. DREI Schichten im selben
Kaestchen: Flaeche (laut Plan vorgesehen) · gruener Kern `::before` (Kraft absolviert) ·
kleiner KREIS `::after` mittig in hellem Gruen (#4ADE80; geplant = nur Kontur). Bewusst fest
verdrahtet und nicht `var(--accent)`: Der Lauf soll in jedem Kalender gleich aussehen, auch wenn
die Karte spaeter in einem anders eingefaerbten Tab steht.
An einem Tag mit beidem bleibt so beides sichtbar.
GROESSENVERHAELTNIS (Leonard-Vorgabe 01.09.2026): Das Lauf-Quadrat verhaelt sich zum Kern wie der
Kern zum ganzen Kaestchen. Kaestchen 25,2px, Kern 16,8px (inset 4,2) → 16,8 x 16,8/25,2 = 11,2px,
also inset 7px. CSS kann nicht durch eine Laenge teilen, der Wert steht deshalb FEST — beim Aendern
von `--cal-cell` oder dem Kern-Inset hier nachrechnen.
Die Lauf-Zeile steht ZUUNTERST in der Tagesbeschreibung, nach dem Plan-Stand, und erbt Groesse
UND Farbe von `.cal-detail` — sie sieht damit aus wie die Angaben zur Trainingseinheit darueber.
Sie nennt nur Strecke und Zeit; Pace und Puls sind am 01.09.2026 entfallen (Leonard-Wunsch).
Sie ist seit dem 04.09.2026 ein KNOPF wie der Trainingstag darueber und oeffnet
`showRunDetail(key)` → `#modal-run-detail`: Kacheln (`.hd-stats`) mit Strecke, Dauer, Pace,
Tempo, Ø- und Maximalpuls sowie Hoehenmetern, darunter Kategorie und — falls vorhanden — die
geplante Einheit. Fehlende Werte bleiben WEG statt als „–" dazustehen; ein Intervalltraining hat
weder Strecke noch Tempo, deshalb `grid-template-columns: repeat(auto-fit, …)` statt drei fester
Spalten. `stopPropagation` im Handler ist Pflicht, sonst raeumt `initCalendarDeselect` die
Beschreibung im selben Klick weg.
**Welcher Kalender welche Sportart zeigt, entscheidet `_calModus(id)`:** Die Uebersicht (`cal`)
folgt dem Filter im Titel, der Plan-Tab (`pcal`) der gewaehlten Seite — Gymplan zeigt den
**Gymkalender** (nur Krafttraining), Laufplan den **Laufkalender** (nur Laeufe), Gymtage keinen.
Der Titel wird beim Rendern gesetzt (`#cal-filter-btn` bzw. `#pcal-titel`), nicht im Markup.
**Der Titel des Uebersichts-Kalenders ist ein FILTER** (`toggleCalFilter`, `_calFilter`; vom 14. bis
15.09.2026 kurz ueber ein Rad gewaehlt, das wieder entfallen ist):
beide → nur Training → nur Laeufe → beide. Er steuert die Marken im Raster UND die Zeilen in der
Tagesbeschreibung. Der Titel BENENNT den Zustand statt ihn anzuhaengen: „Trainingskalender" /
„Gymkalender" / „Laufkalender" (`_CAL_FILTER_TITEL`). Seit dem 15.09.2026 GESPEICHERT
(`ft_cal_ansicht`, Leonard-Wunsch) — vorher startete er immer bei „beide". Im Plaene-Tab ist der Titel kein Knopf.

---

### Laufwochenplan
`buildRunPlanCard(onTap, plan)` ist das Gegenstueck zu `buildPlanCard` — gleiche Klassen,
gleiche Masse, gleiche Bedienung, nur andere Quelle (Lauftage statt Trainingstage, gelaufene
Einheiten statt Krafteinheiten). BEWUSST eine eigene Funktion: Die beiden Datenmodelle haben
ausser der Woche nichts gemeinsam. Ohne `plan` zeichnet sie den LAUFENDEN Plan, mit `plan` einen
bestimmten — daraus besteht seit dem 04.09.2026 die ganze Liste auf der Seite „Laufplan",
aufgebaut wie `renderPlans()` beim Gymplan: Nur der laufende Plan zeigt Fortschrittsbalken und
Haken, alle uebrigen tragen Statuschip (`runPlanStatus`) und Laufzeit. Das Archiv haengt hinter
demselben Ausklapp-Knopf (`.archiv-btn`, `runplansArchiveExpanded`/`toggleRunplansArchive`).
Steht ausserdem in der **Uebersicht** unter dem Gymwochenplan (`#ov-runplan-card`; im Querformat
teilen sich beide eine Zeile, die Herocard rutscht darunter ueber die volle Breite) und im
**Trainings-Tab auf der Seite „Laufen" zuoberst**. Im QUERFORMAT teilen sich dort Wochenplan
und Herocard eine Zeile — dieselbe Aufteilung wie auf der Seite „Gym" (`#wo-view-laufen` als
Grid, 06.09.2026); „Diese Woche" spannt darunter ueber beide Spalten (die Tageskarte ist
am 21.09.2026 entfallen).
DREI ZUSTAENDE eines Wochentagskreises (praezisiert 08.09.2026, Leonard-Wunsch):
gefuellt = war schon (Vergangenheit oder erledigt) · nur UMRANDET = steht in dieser Woche
noch an (`.zukunft`, gesetzt fuer `i > todayIdx`) · leer = nichts geplant. HEUTE zaehlt
bewusst NICHT zur Zukunft, der Tag laeuft ja gerade. Die Kontur ist 2px, nicht die 15% des
Kalenders: In diesem Kreis steht der Wochentag, eine 4,5px-Kontur liesse dafuer kaum Platz.
Im Transparenz-Modus braucht `.zukunft` eine EIGENE Regel — sonst gewinnt
`html.glas … .ppv-col.training .ppv-wd` (id im `:not()`) und fuellt den Kreis weiss.
**HEUTE ist ein transparentes FELD hinter der Spalte, kein Ring um den Kreis** (08.09.2026):
dieselbe Form und Deckkraft wie das Feld eines ausgewaehlten Tages (`.ppv-col.selected`),
damit die Karte nur EINE Art Hervorhebung kennt. Der fruehere Ring (`.ppv-wd::after` samt
seinen Sonderfaellen fuer erledigte Gym- und Lauftage und seiner Glas-Regel) ist ersatzlos
entfallen. Gilt in den Wochenplan-Karten UND in der kombinierten Karte der Uebersicht.
FARBE der Wochentagskreise (geplant WIE erledigt), des Hakens und des Fortschrittsbalkens
(`.ppv-bar-fill`, alles seit 04.09.2026): Gym #0F766E (wie die trainierten Kalender-Kaestchen),
Lauf #4ADE80 (wie die Laufkreise) — `.run-plan` als Modifikator. Die Karte folgt damit der
SPORTART statt der Tabfarbe; vorher stand bei „geplant" `var(--accent)`, in der Uebersicht also
Cyan. Geplant und erledigt trennt der HAKEN (`.ppv-col.done .ppv-wd::before`) — den gab es schon
vorher, weil im Trainings-Tab die Akzentfarbe selbst gruen war. Im Transparenz-Modus bleiben die
Kreise weiss (bestehende Glas-Regel), wie auch der Fortschrittsbalken. Der Balken folgt damit der SPORTART, nicht der
Tabfarbe, und sieht in Uebersicht, Trainings-Tab und Plaene-Tab gleich aus. Im Transparenz-Modus
bleibt er WEISS — dafuer sorgt die bestehende Glas-Regel, die spaeter steht und gewinnt.
Die **Kennzahl** des Kalenders zaehlt im Laufkalender Laeufe statt Krafteinheiten.

### Seite „Wettkämpfe" (Plan-Tab)
`renderWettkaempfe()` fuellt `#races-list` mit je einer Karte pro Eintrag aus `ft_races`,
AUFSTEIGEND — aeltester zuerst, anstehende Termine am Ende (Leonard-Wunsch 06.09.2026; die
Sortierung liefert schon `DB.getRaces()`, anders als jede andere Liste der App).
Im QUERFORMAT stehen zwei Karten nebeneinander (`#races-list` als 2-Spalten-Grid ab 1024px,
`column-gap: 0` und die 14px der Karten — dieselbe Machart wie die uebrigen Querformat-Grids).
`align-items: start` ist Pflicht: Eine Karte ohne Werte ist flacher, `stretch` zoege sie sonst
auf die Hoehe der Nachbarin.
Aufbau einer Karte (`wettkampfKarte`): Kopf mit Name und ausgeschriebenem Datum (OHNE
Sportsymbol — es war kurzzeitig da und ist am 06.09.2026 wieder entfallen, wie im
Seitenschalter), darunter die Werte in denselben Kacheln wie die Laufdetailansicht
(`.hd-stats`) —
Strecke, Zeit, Pace, Ø Puls, Max Puls, Hoehenmeter. BEWUSST kein eigenes Kacheldesign: Ein
Wettkampf ist ein Lauf und soll auch so aussehen.
Die WERTE kommen aus `runNachTag()[date]`, also aus der Tabelle — nicht aus `ft_races`.
Liegt zu dem Tag kein Lauf vor (Daten noch nicht abgerufen, oder der Lauf fehlt in der
Tabelle), steht statt der Kacheln ein Hinweis. Fehlende EINZELwerte fallen einfach weg,
statt als „–" dazustehen; das Raster fuellt die Luecke.
**VIER Zustaende einer Karte** (Leonard-Entscheidung 06.09.2026, „Variante D": automatisch
mit Notausgang). Entschieden wird allein aus dem Datum und der Frage, ob an dem Tag ein Lauf
in der Tabelle steht — es gibt KEIN Feld „absolviert", nichts abzuhaken, nichts zu vergessen:
  1. Lauf vorhanden → Ergebniskarte mit den sechs Kacheln. Sie entsteht von SELBST, sobald der
     Lauf da ist; das ist der Normalweg.
  2. Datum kuenftig → Pille „Steht noch an" (`.wk-anstehend`, Karte gedaempft via
     `.wk-kuenftig`). KEIN Abruf-Knopf — es gibt nichts zu holen.
  3. Datum vorbei, hoechstens `WK_KULANZ_TAGE` (7) her → „Noch keine Laufdaten" plus
     Abruf-Knopf (`.wk-wartet`), ruhig gehalten. Normalfall direkt nach dem Rennen: FitTrack
     liest die Tabelle nur auf Anforderung.
  4. Datum ueber 7 Tage her → NOTAUSGANG „Werte fehlen" in Rot (`.wk-fehlt`, Karte `.wk-offen`)
     mit Tagesangabe und Abruf-Knopf. So lange sollte es nicht dauern; hier stimmt etwas nicht
     (Lauf nie aufgezeichnet, andere Kategorie in der Tabelle, Termin verschoben).
  Die Kulanzfrist ist bewusst grosszuegig — eine Woche ohne App soll keine Warnung ausloesen.
Der Abruf-Knopf ruft `runLaeufeLaden({interactive:true})`, dieselbe Funktion wie
„Aktualisieren" in den Einstellungen, und MUSS `event.stopPropagation()` rufen: Sonst oeffnet
sein Tipp zugleich den Bearbeiten-Dialog der Karte darunter.
`runLaeufeLaden` frischt am Ende auch DIESE Seite auf (`plansViewMode === 'races'`) — sonst
bliebe sie nach dem eigenen „Laufdaten holen" unveraendert stehen.
Im Transparenz-Modus ist die Glas-Regel fuer den Knopf auf `.wk-fehlt .wk-hol-btn` eingeengt:
Ungefiltert faerbte sie auch den ruhigen Knopf der Kulanzphase rot.
**Eintragen und Bearbeiten:** Das „+" oben rechts oeffnet `openRaceDialog()` (`#modal-race`,
Name + Datum); ein Tipp auf eine Karte oeffnet denselben Dialog gefuellt, dort steht auch
„Löschen" (Sicherheitsfrage + `withUndo`). Ohne den Bearbeiten-Weg gaebe es keine Moeglichkeit,
einen Vertipper zu berichtigen — ein Hinzufuegen-Knopf ohne Korrekturweg ist eine Falle.
Der SCHLUESSEL ist das DATUM: `saveRaceFromDialog` wirft sowohl den alten Eintrag
(`_raceEditDate`) als auch einen etwaigen Eintrag am neuen Datum weg, bevor es schreibt —
sonst laege nach dem Verschieben eines Termins ein Duplikat vor.
`_wettkampfNeuZeichnen()` frischt nach jeder Aenderung die Liste UND beide Kalender auf; ein
neuer Termin waere sonst erst nach einem Tabwechsel im Raster zu sehen.
Die Karten tragen deshalb NICHT mehr `.karte-inert` (sie sind antippbar). Die Klasse selbst
gilt seit dem 06.09.2026 fuer JEDE Karte, nicht mehr nur fuer `.plan-card-v2`.
Im Transparenz-Modus brauchen Datum, Hinweistext und die Kachelflaechen eigene Regeln —
`.hd-stat b` war schon erfasst, die Beschriftung darunter nicht.

### Seite „Wettkämpfe": ZWEITE Ansicht als Zeitstrahl
09.09.2026, Leonard-Wunsch. Neben der gewohnten Liste gibt es einen senkrechten Zeitstrahl.
Umgeschaltet wird ueber einen Knopf LINKS neben dem „+" oben rechts (`#races-view-btn` in
`.ph-actions`); er steht NUR auf dieser Seite und sein Symbol zeigt, wohin er fuehrt —
Zeitstrahl-Symbol in der Liste, Listen-Symbol im Zeitstrahl (`syncWkAnsichtBtn`, gerufen aus
`renderPlansScreen`).
`_wkAnsicht` ('liste' | 'strahl') wird BEWUSST nicht gespeichert — wie jeder Ansichtszustand
der App. **Standard ist seit dem 12.09.2026 der ZEITSTRAHL** (Leonard-Wunsch; vorher die
Liste): Nach einem Neustart steht er wieder da, die Liste erreicht man ueber den Knopf.
Die DATUMSANGABE rechts an jeder Marke (`.wk-punkt-datum`, „26. Oktober") ist am selben Tag
ERSATZLOS entfallen (Leonard-Wunsch) — auf der Zeitachse steht nur noch der Name. Das
vollstaendige Datum nennt weiterhin die aufgeklappte Karte darunter.
**Bauform:** `.hd-rail` aus der Einheiten-Detailansicht, nachgebaut als `.wk-strahl` —
senkrechte Linie, Marken daneben, Jahreszahl als Pille AUF der Linie. Gruppiert wird nach
Jahr, aufsteigend wie die Liste (bei Leonard beginnt es 2024).
DREI Zustaende an der Marke, dieselbe Aussage wie in den Karten: gelaufen = gefuellt in
#4ADE80 · steht noch an = nur umrandet (`.kuenftig`) · vorbei ohne Werte = blass (`.fehlt`).
FALLE, die dabei zuschlug: Der dritte Zustand hiess zuerst `offen` — genau wie die Klasse fuer
den HERVORGEHOBENEN Eintrag. Beim Umschalten standen dadurch alle fuenf Karten sofort offen.
**Genau EINER kann hervorgehoben sein** (`_wkOffen`, `wkStrahlWaehlen`). Ein zweiter Tipp auf
denselben schliesst ihn wieder — dieselbe Regel wie bei der Fusszeile des Kalenders.
Seit dem 13.09.2026 mit Ausklapp-Bewegung (`_wkKarteKlappen`, siehe „Kalender-Fusszeile und
Wettkampfkarte klappen ebenso").
**SCROLLEN klappt ihn wieder zu** (`initWettkampfStrahl`, Listener auf `#screen-plans`).
Die Karte jedes Wettkampfs steht dafuer IMMER im Markup und wird nur per Klasse ein- und
ausgeblendet: Auf- und Zuklappen ist ein Klassenwechsel, kein Neuaufbau — ein Neuaufbau
mitten in der Scrollbewegung wuerde ruckeln.
Die KARTE selbst ist unveraendert `wettkampfKarte()`, dieselbe wie in der Liste. Nur ihr
Seitenrand ist im Strahl auf 0 gesetzt, sie sitzt dort schon eingerueckt.
TESTHINWEIS: Das Zuklappen beim Scrollen ist auf dem Rechner nur ueber ein von Hand
ausgeloestes `scroll`-Ereignis pruefbar — in der versteckten Browser-Ansicht feuert das
Setzen von `scrollTop` keines (siehe die uebrigen Testhinweise).

---

### Wochenplankarte der Uebersicht: EINE Karte fuer beide Sportarten
07.09.2026, Leonard-Entscheidung „Variante A". `#ov-week-card` ersetzt die frueher getrennten
Karten `#ov-plan-card` (Gym) und `#ov-runplan-card` (Lauf) — beide IDs gibt es nicht mehr.
Gefuellt von `renderWochenKarte()`.
**Der TITEL ist ein Filter wie beim Trainingskalender** (`_wochenFilter`, `toggleWochenFilter`,
`_WOCHEN_FILTER_TITEL`): beide → Gym → Lauf → beide.
**DER WECHSEL BLENDET EIN wie beim Kalender** (18.09.2026, Leonard-Wunsch „die gleiche
Animation"): Die neue Karte steht sofort da, alles unter dem Titel (`.ppv-head` bleibt stehen)
blendet in 300ms aus dem Durchsichtigen ein — derselbe Kern `_neuZeichnenEinblenden`, dieselbe
Dauer und Kurve (`CAL_EIN_MS`, `CAL_EIN_KURVE`). Da die Karte bei jedem Wechsel NEU gebaut wird,
liefert `teile` die Kinder der neuen Karte erst nach dem Zeichnen. Die Karte hat eine feste
Hoehe (157.3px), es springt nichts. Die Herocard darunter zeichnet ohne Blende neu.
GEMESSEN: Titel wechselt sofort; Gym-/Laufwoche blenden `.ppv-progress` und `.ppv-strip`,
die Kombi-Karte `.ppv-k-labels` und beide Reihen, je 0 → 1 in 300ms; Hoehe 157px vor und nach;
dreimal in 50ms-Abstand → Endzustand sauber, keine Restanimation. Er BENENNT den Zustand
(„Trainingswoche" / „Gymwoche" / „Laufwoche") statt den Plannamen zu zeigen — sonst wechselte
die Beschriftung zwischen Zustandsname und Eigenname und liesse sich nicht als Schalter lesen.
Der Planname steht dafuer nur noch im Plan-Tab. BEWUSST nicht gespeichert, wie jeder Filter
der App.
In den EINZELZUSTAENDEN zeichnen `buildPlanCard`/`buildRunPlanCard` unveraendert weiter
(Fortschrittsbalken, „Woche 11 / 26", Wochentagskreise) — sie bekommen nur `opts.filterOnTap`
und tauschen dafuer den Plannamen gegen den Filterknopf. Auch die LEEREN Karten („Kein aktiver
Trainingsplan/Laufplan") tragen ihn, sonst steckte man ohne Plan in dem Zustand fest.
Der GEMEINSAME Zustand (`buildWochenKombi`) hat eine eigene Bauform: eine Wochentagszeile,
darunter zwei Reihen KREISE (Gym #0F766E, Lauf #4ADE80), je mit Sportsymbol davor. Senkrecht
liest man ab, was an einem Tag ansteht. Gefuellt = geplant, Haken oben rechts = absolviert.
Kuenftige Tage dieser Woche sind nur UMRANDET und heute traegt ein transparentes Feld —
dieselbe Regel wie in den Wochenplan-Karten (08.09.2026, siehe dort).
VERWORFEN (07.09.2026, am selben Tag eingebaut und zurueckgenommen): die Zeichen des
Trainingskalenders — Quadrat fuers Gym, Kreis fuer den Lauf, absolviert gefuellt, dafuer ohne
Haken. Nicht erneut einbauen, ohne zu fragen.
ENTFERNT am 08.09.2026 (Leonard-Wunsch): die Zeile mit der Wochenzahl je Plan
(„Woche 8 / 9  Woche 3 / 4") unter dem Titel, samt `.ppv-k-wochen`/`.ppv-k-wk` und der nur
dafuer gebauten Funktion `runKombiWoche`. In den EINZELZUSTAENDEN steht die Wochenzahl
unveraendert im Fortschrittsblock.
ENTFERNT am 13.09.2026 (Leonard-Wunsch): auch das Zahlenpaar „0/3 · 1/3" oben rechts im
Kopf, samt `.ppv-k-adh` und dessen Glas-Regel — der Kopf der Kombi-Karte traegt seither nur
noch den Filtertitel. Mit ihm fiel der Aufruf von `getWeekStatus()` in `buildWochenKombi`
weg (die Funktion selbst lebt weiter, die Einzelkarten nutzen sie). Die EINZELZUSTAENDE
behalten ihre Zeile „2/5 diese Woche" (`.ppv-adh`, andere Klasse) unveraendert.
**JEDER WOCHENTAG IST EIN EIGENES TIPP-ZIEL** (12.09.2026, Leonard-Wunsch;
`waehleKombiTag(sport, idx)`, Zustand `_kombiWahl`). Die Herocard direkt darunter zeigt
daraufhin DIESEN Tag — Titel, Beschriftung und Knopf.
Gewaehlt ist ein TAG, keine Sportart (`_kombiTag`, ein Index 0..6): Der Tipp markiert denselben
Wochentag in BEIDEN Reihen, und BEIDE Spalten der Herocard springen mit. Eine erste Fassung vom
selben Tag liess nur die getippte Sportart mitgehen — dann sprach der Titel („Dienstag") aber
nur fuer die halbe Karte, waehrend die andere Spalte weiter heute zeigte. Leonard hat das noch
am 12.09.2026 korrigiert.
Ein ZWEITER Tipp auf denselben Kreis hebt die Auswahl auf, wie bei der Kalender-Fusszeile und
dem Wettkampf-Zeitstrahl. Ein Filterwechsel setzt sie ebenfalls zurueck (die Kombi-Karte, zu
der sie gehoert, ist dann gar nicht mehr im Bild). BEWUSST nicht gespeichert, wie jeder
Ansichtszustand.
Die Markierung ist DASSELBE transparente Feld wie bei „heute", inklusive des durchgehenden
Felds ueber beide Reihen — `.today` und `.selected` teilen sich die Regeln. Faellt die Auswahl
auf heute, tragen beide Klassen dieselben Werte, es gibt also nichts zu entscheiden.
**DIE REIHEN SIND DAMIT STUMM** (12.09.2026). Bis dahin fuehrte ein Tipp auf die Reihe in den
Trainings-Tab auf die Seite ihrer Sportart (08.09.2026). Mit antippbaren Kreisen laegen zwei
Ziele in einer Kachel — genau das hat Leonard am 06.09.2026 abgelehnt. Zum Training kommt man
aus der Kombi-Ansicht jetzt ueber den KNOPF der Herocard darunter; in den Einzelzustaenden
(Gymwoche/Laufwoche) fuehrt die Karte weiter dorthin.
Entfallen sind damit `cursor: pointer` und das Tipp-Aufleuchten der Reihe (`.ppv-k-reihe:active`
samt Glas-Fassung); die KARTE traegt jetzt `.karte-inert`, und `.ppv-k-col` hat den Zeigefinger.
Der Filterknopf braucht weiterhin `stopPropagation`.
WENN EINE EINHEIT LAEUFT, zeigt die Herocard die laufende Einheit — die Auswahl wirkt dann
nicht auf sie (die Markierung in der Karte bleibt sichtbar).
Die Karte steht in der Uebersicht seit dem 08.09.2026 UEBER der Herocard.
`runKombiWoche(p)` rechnet „Woche 3 / 4" des Laufplans nach; in `buildRunPlanCard` steckt
dieselbe Rechnung eingebettet im Fortschrittsblock und ist von aussen nicht zu holen.
FALLE Rasterausrichtung: Beschriftungszeile und beide Reihen liegen auf demselben Grid
(`var(--ppv-k-lead)` + 7 Spalten). Die REIHEN tragen zusaetzlich `margin: 0 -6px; padding: 3px 6px`
als Tipp-Flaeche — die Beschriftung braucht dieselben Werte, sonst sind die INHALTSBOXEN
verschieden breit, sobald die Breite gekappt ist, und die Wochentage driften gegen ihre Kreise
(im Querformat gemessen bis 11px).
QUERFORMAT: Die Karte spannt ueber beide Spalten wie die Herocard, das Wochenraster nutzt die
VOLLE Breite. Eine erste Fassung kappte es bei 480px (die Marken stehen sonst weit
auseinander); Leonard hat das am 07.09.2026 zurueckgenommen — die Breite soll ausgenutzt
werden, die Wochentagsbeschriftung darueber haelt die Zeile lesbar.
TRANSPARENZ-MODUS: Seit dem 18.09.2026 KEINE Sportfarben mehr — absolviert ist in beiden Reihen
weiss gefuellt, offen weiss umrandet, leer 22-%-Weiss (siehe „Keine Sportfarben im
Transparenz-Modus“). Vorher blieben die Sportfarben und nur der leere Kreis wurde weiss. Die
Glas-Regel fuer den LEEREN Kreis muss auf `:not(.training):not(.done)` eingeengt sein —
ungefiltert schlaegt sie (id-Selektor im `:not()`) jede andere Regel, und geplant sah aus wie leer.

### Herocard „Heute"
`buildHeuteHero(planDay, selDay, opts)` ersetzt seit dem 06.09.2026 die frueheren Vorschau- und
Ruhetag-Karten UND die eigene Karte der Seite „Laufen" (`buildRestHero`, `buildLaufHero`,
`heroLaufZeile`, `heroLaufBtn`, `freeWorkoutBtn` sind alle entfallen). Aufbau nach
Leonard-Vorgabe:
- **Der Titel ist „Heute", ausser ein anderer Tag ist gewaehlt** (`opts.titel`, 12.09.2026):
  In der Uebersicht schiebt ein Tipp auf einen Wochentagskreis der Kombi-Karte die Karte auf
  diesen Tag, und der Titel nennt ihn dann ausgeschrieben („Dienstag"). Faellt die Auswahl auf
  heute, bleibt es bei „Heute" — der Wochentag saehe dort wie ein Fehler aus.
  BEIDE Spalten folgen dem gewaehlten Tag, der Titel gilt also fuer die ganze Karte.
  Der Trainings-Tab nutzt `opts.titel` NICHT: Dort steht weiter „Heute", auch wenn im
  Wochenplan ein anderer Tag gewaehlt ist.
  MIT Auswahl gilt ausserdem die Regel des Trainings-Tabs — der Trainingstag steht da,
  unabhaengig davon, ob er schon absolviert ist. OHNE Auswahl bleibt es bei der alten Regel
  der Uebersicht: Ist die heutige Einheit erledigt, steht dort „Kein Gym" und der Knopf bietet
  freies Training an.
- **Kein Obertitel** (das fruehere `RUHETAG` / `NAECHSTE EINHEIT`)
  und kein Untertitel (Wochentag, Uebungen/Saetze, Ø-Dauer). Er steht an derselben Stelle wie
  jeder andere Kartentitel: 16px, 14px vom Rand, 10px Abstand nach unten.
- **Je Sportart eine Spalte** aus mittiger Beschriftung und Knopf. Gym: Name des Trainingstags
  bzw. „Ruhetag". Lauf: das ZIEL des Tages, km und Zeit OHNE Zone.
- **Die Knoepfe fuellen die Karte.** Abstand zum Kartenrand = Kartenpolster = 14px, und der
  Abstand ZWISCHEN ihnen ist derselbe Wert (`gap: 14px`, nicht die 6px der uebrigen
  Knopfzeilen).
- **Symbol vor dem Text, in Textgroesse** (`.hero-btn-ic`, `1em`): HANTEL beim Gym (seit
  06.09.2026, vorher ein Play-Dreieck — die Hantel benennt die Sportart statt der Aktion und
  ist damit das Gegenstueck zum Laeufer), Laeufer beim Lauf. Beide sind STRICHZEICHNUNGEN;
  die alte Regel `.hero-v2-btn svg { fill: #fff !important }` musste deshalb auf
  `> svg` eingeengt werden, sonst wird die Hantel zum schwarzen Klumpen.
  Eigene, vereinfachte Zeichnung (`HERO_ICON_HANTEL`) — `heroDumbbellSvg()` ist fuer 72px
  gebaut und bei 14px nur noch ein grauer Fleck.
- **Farbe nach Sportart, Verlauf wie gehabt** (06.09.2026): Gym
  `linear-gradient(135deg, #0B4F49, #14B8A6)`, Lauf `linear-gradient(135deg, #15803D, #4ADE80)`,
  beide mit WEISSER Schrift und demselben deutlichen Hell-Dunkel-Sprung. Zwei Zwischenstaende
  waren zu flau und wurden verworfen: #22C55E→#4ADE80 beim Lauf und #0B4F49→#0F766E beim Gym.
  „Pausieren" bleibt GRAU (#475569) — es ist kein Start, sondern ein Zwischenhalt; „Beenden"
  rot. Beide Regeln muessen HINTER der Gym-Farbregel stehen, gleiche Spezifitaet.
  Vorher trug der Gym-Knopf die
  TABFARBE (`--gradient`). ACHTUNG Spezifitaet: Die Laufregel braucht ebenfalls zwei Klassen
  (`.hero-heute .hero-v2-btn-lauf`), sonst gewinnt die Gym-Regel.
- **Die Beschriftung sitzt mittig zwischen Titel und Knopf**: Der Titel hat
  `margin-bottom: 10px`, die Spalte deshalb `gap: 10px` — mit den vorherigen 6px klebte sie
  am Knopf.
- Die Beschriftung darf UMBRECHEN: „Lauf abgeschlossen" braucht bei 14px 135px, in den 155px
  eines halben Knopfes bleiben nach Polster, Symbol und Abstand nur 114px. `flex:1` haelt beide
  Knoepfe trotzdem gleich hoch. Kleiner setzen waere die Alternative gewesen — dann stuende der
  wichtigste Knopf der Uebersicht in 12px da.
- **Die Karte steht in der Uebersicht ZUOBERST** (06.09.2026), ueber den Wochenplaenen; im
  Querformat spannt sie ueber beide Spalten, darunter teilen sich Gym- und Laufwochenplan die
  naechste Zeile.
- **Ist an dem Tag NICHTS geplant, ist der Knopf GRAU und ohne Verlauf** (`.hero-v2-btn-grau`,
  #475569, Leonard-Wunsch 07.09.2026) — je Sportart getrennt: kein Gym, aber ein Lauf geplant
  → Gymknopf grau, Laufknopf hellgruen. Die Sportfarbe gehoert dem Tag, an dem etwas ansteht.
  Bedienbar bleiben beide (freies Training bzw. Laufdaten holen). Dasselbe Grau wie
  „Pausieren", damit die App nur EIN neutrales Knopfgrau kennt. Die Regel MUSS hinter den
  beiden Sportfarben stehen — gleiche Spezifitaet, es entscheidet die Reihenfolge.
- **ZWEITE ZEILE unter dem Trainingstag, nur auf der Seite „Gym"** (`.hero-heute-meta`,
  `gymTagUmfang()`, Leonard-Wunsch 07.09.2026): Uebungen, Saetze und — sobald eine Einheit
  dieses Tags abgeschlossen ist — deren mittlere Dauer („5 Übungen · 16 Sätze · Ø 1h 6min").
  Die Dauer gab es schon einmal (`avgDauerFuerTag`, mit dem Herocard-Umbau am 06.09.2026
  entfallen); Einheiten OHNE `duration` zaehlen weiterhin nicht mit.
  In der UEBERSICHT steht sie NICHT — dort teilen sich zwei Sportarten die Breite.
  **Die Karte darf dadurch nicht hoeher werden UND der Knopf nicht flacher** (Leonard-Vorgabe,
  praezisiert 07.09.2026 — eine erste Fassung nahm dem Knopf 4px Polster). Die Zeile kostet
  15px, die `hero-mit-meta` von OBEN zurueckholt: Titelabstand 10→2, Spaltenabstand 10→6,
  Abstand der beiden Textzeilen 2→0, dazu 1px engere Zeilenhoehe. Titel und Name ruecken also
  zusammen, der ganze Textblock sitzt hoeher; der Knopf bleibt bei 41,5px.
  Gemessen: 123,6px mit Zeile gegen 123,5px ohne, Knopf in beiden Faellen 41,5px.
  Die Klasse setzt `buildHeuteHero` nur, wenn die Zeile wirklich drin ist — die Uebersicht
  behaelt ihre Masse. ACHTUNG Spezifitaet: `.hero-heute .hero-v2-btn` setzt das Knopfpolster
  und steht WEITER UNTEN, die Kompaktregeln brauchen deshalb drei Klassen.
- **Die Wochenplan-Karten tragen das Sportsymbol vor dem Titel** (`.ppv-name-ic`, `1em` = die
  16px des Titels): Hantel beim Gym, Laeufer beim Lauf. Farbe `inherit` — sie folgen dem TITEL
  (Leonard-Wunsch 06.09.2026, vorher in den Sportartfarben) und sind damit im Transparenz-Modus
  automatisch weiss.
- `opts.runIdx` waehlt den TAG der Laufspalte: Auf der Seite „Laufen" folgt die Karte dem im
  Wochenplan gewaehlten Wochentag, genau wie die Gymkarte auf der Nachbarseite
  (Leonard-Wunsch 06.09.2026). Ohne Angabe gilt heute.
- `opts.sport`: 'beide' (Uebersicht) · 'gym' (Trainings-Tab, Seite Gym) · 'lauf' (Seite Laufen,
  Karte `#wo-lauf-hero` direkt unter dem Wochenplan). Bei einer Sportart wird die Spalte zur
  vollen Breite (`.hero-heute-spalten.einzeln`).
- Laeuft anderswo bereits eine Einheit, fuehrt der Gym-Knopf dorthin („Zur laufenden Einheit")
  statt eine zweite zu starten.
- **WECHSELT EIN KNOPF SEINE FARBE, VERBLASST DIE ALTE** (13.09.2026, Leonard-Wunsch) — grau ↔
  Sportfarbe, wenn man in der Wochenplan-Karte einen anderen Tag antippt. Gilt fuer die
  Kombi-Karte der Uebersicht (`waehleKombiTag`) und die Tagesauswahlen der Seiten „Gym"
  (`selectWorkoutDay`) und „Laufen" (`selectRunDay`). Alle drei zeichnen ueber
  `mitHeroFarbwechsel(huelle, zeichnen)`.
  WARUM SO: Die Karte wird bei jedem Tipp NEU GEBAUT — eine Transition auf `background` liefe
  nie, und Verlaeufe lassen sich ohnehin nicht ueberblenden. Stattdessen merkt sich die Funktion
  vor dem Neubau die Farbe jedes Knopfs (Schluessel `data-sport` gym/lauf, Farbe 'grau' | 'gym' |
  'lauf' aus `_heroKnopfFarbe`) und haengt danach an jeden Knopf, dessen Farbe sich geaendert hat,
  `.hero-farbe-von-<alt>`. Die ALTE Flaeche liegt dann als `::before` ueber dem Knopfgrund und
  blendet in 0.35s aus (`@keyframes hero-farbe-verblassen`); die neue kommt darunter hervor.
  `isolation: isolate` am Knopf ist Pflicht: Nur im eigenen Stapelkontext malt sich das
  `z-index: -1` UEBER den Knopfgrund und UNTER Symbol und Schrift (gemessen: die Knopfmitte
  trifft weiterhin den Knopf, im Bild liegt die Schrift oben).
  Bleibt die Farbe gleich, passiert nichts. Bei `prefers-reduced-motion` springt sie wie bisher.
  Die drei Flaechen in `.hero-farbe-von-*::before` wiederholen die Knopffarben — aendert sich
  eine Knopffarbe, dort mitziehen.
  TESTHINWEIS: In der versteckten Browser-Ansicht laeuft die Animation nicht, der Knopf bliebe
  dort optisch in der ALTEN Farbe stehen. Zum Ansehen die Animation per `getAnimations()`
  anhalten und `currentTime` setzen.
  **DER TEXT DER KARTE BLENDET MIT** (16.09.2026, Leonard-Meldung „Titel und Beschriftung
  springen, waehrend nur die Knopffarbe blendet"): `mitHeroFarbwechsel` laesst nach dem Neubau
  `.hero-heute-titel` und jede `.hero-heute-kopf` in `HERO_TEXT_MS` (180ms) einblenden.
  BEWUSST KEINE Kreuzblende mit einer Kopie des alten Textes — die Karte wird bei jedem Tipp neu
  gebaut, eine Kopie waere hier deutlich mehr Aufwand als der Gewinn. Die KNOEPFE bleiben aussen
  vor, sie haben mit der Farbblende schon ihre eigene Bewegung.
  Gilt an allen drei Stellen, die ueber `mitHeroFarbwechsel` zeichnen: Kombi-Karte der Uebersicht,
  Seite „Gym" und Seite „Laufen".
  GEMESSEN (echter Tipp auf Donnerstag in der Uebersicht): Titel wechselt auf „Donnerstag",
  Titel und Kopf blenden je einmal, danach Deckkraft 1 ohne Restanimation.

„Lauf abgeschlossen" ruft `runLaeufeLaden({interactive:true})` — dieselbe Funktion wie
„Aktualisieren" in den Einstellungen. FitTrack fuehrt keine Laeufe selbst; der Knopf kann nur
nachschauen, was Health Auto Export inzwischen in die Tabelle geschrieben hat. `runLaeufeLaden`
frischt deshalb auch den Trainings-Tab auf, nicht nur Uebersicht und Einstellungen.

**Die LAUFENDE Einheit hat dieselbe Bauform** (`buildSessionCard`, `.hero-heute.hero-aktiv`,
angeglichen 06.09.2026): Titel = Name des TRAININGSTAGS — aber NUR, wenn die Einheit auch zu
ihm gehoert (`active.planDayId === planDay.id`, korrigiert 13.09.2026). Die Seite „Gym" reicht
den Trainingstag des GEWAEHLTEN Wochentags an die Karte weiter; ein FREIES Training an einem
Tag, dessen geplante Einheit schon absolviert ist, trug dadurch faelschlich deren Namen
(„Push" statt „Freies Training", Leonard-Meldung). Gespeichert war die Einheit immer korrekt —
nur der Titel waehrend des Trainings war falsch. Sonst: Uhr rechts in derselben Zeile,
darunter der Fortschrittsbalken und dann die Knoepfe „Pausieren"/„Fortsetzen" und „Beenden" —
volle Breite, 14px zum Rand, 14px dazwischen, Symbol in Textgroesse. Ueber den Knoepfen steht
KEIN Text; wo die Karte „Heute" ihre Beschriftungen hat, liegt hier der Balken.
Weggefallen sind dabei: Etikett „LAUFENDE EINHEIT", die Zeile „N von M Uebungen abgeschlossen",
die grosse Hantel-Grafik (`heroDumbbellSvg`), der Vorschau-Zweig (`isPreview`, `metaPreview`)
und die Ausrichtung der Ruhetag-Karte (`_ruhetagHeroAusrichten`/`_ruhetagHeroEinrichten`).
„Beenden" bleibt ROT — es ist die Abbruchaktion. Seine Regel MUSS hinter der Gym-Farbregel
stehen, beide haben zwei Klassen und es entscheidet die Reihenfolge.
Bewusst weiterhin OHNE Laufteil: Waehrend eines Trainings ist die Karte der Bedienstand DIESER
Einheit, nicht die Tagesuebersicht.

---

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
- **STATUSLEISTE BLEIBT `black-translucent` — trotz des Schleiers von iOS 27** (Leonard-Entscheidung
  19.09.2026). Seit iOS 26 legt das System ueber alles, was eine Web-App UNTER Uhrzeit und Akku
  zeichnet, einen „Liquid Glass"-Schleier; iOS 27 hat ihn deutlich verstaerkt (heller Verlauf
  ueber Kopf und „FitTrack", Symbole der Statusleiste schwarz statt weiss). Es gibt KEINEN CSS-
  oder Meta-Schalter dagegen; ein deckendes Element oben, `backdrop-filter`-Ueberlagerungen und
  `theme-color` helfen laut mehreren Projekten nicht. Nur eine DECKENDE Statusleiste
  (`black`/`default`) verhindert ihn, weil die Web-Ansicht dann darunter beginnt.
  Genau das war in v360 eingebaut (`black`, `#statusbar-scrim` entfernt) und ist in v361 auf
  Leonards Wunsch wieder zurueckgenommen — der Farbverlauf laeuft wie vorher unter die Uhr.
  **STATTDESSEN RUECKT DER INHALT 20px NACH UNTEN** (`--schleier-t`; v362 mit 40px, v363 mit
  30px, seit v364 mit 20px — zweimal auf Leonards Wunsch um 10px verringert. Die Knoepfe stehen
  damit bei rund 106 App-px, noch im Auslauf des Schleiers, der deutlich bis rund 118 px reicht;
  Leonard nimmt einen schwachen Rest zugunsten von weniger Luft oben in Kauf). Der
  Schleier liegt dann nur noch ueber leerem Hintergrund. Die Variable ist 0 und wird NUR in der
  installierten App im Hochformat 20px (`@media (display-mode: standalone) and (orientation:
  portrait)`); sie steckt im oberen Polster von `.screen` und `.plan-detail-overlay` (alle
  Vollbild-Ansichten). Im Safari-Tab zeichnet die Seite nicht unter die Statusleiste, im
  Querformat tritt der Schleier laut Berichten nicht auf.
  GEMESSEN AUS LEONARDS SCREENSHOT (923x2000 Bildpunkte): Den Tab-Verlauf der Uebersicht
  (#0C4A6E → #0891B2, 135°, t = (x+y)/(Breite+Hoehe)) je Bildpunkt nachgerechnet und abgezogen —
  an freien Stellen weiter unten stimmte er auf 1–2 Stufen. Der Rest ist der Schleier: deutlich
  bis Bildzeile 206, ganz weg bei 218. Umrechnung ueber bekannte Groessen (Knopf 38px = 66,
  Karte 157.3px = 274, Kalenderspalte 28.8px = 50.7 Bildpunkte) → 1 App-px ≈ 1.75 Bildpunkte.
  Knoepfe der Titelzeile bei 86 App-px, Schleierende bei 125 → 38px, aufgerundet auf 40.
  NEBENBEFUND: Mit diesem Massstab ist der Bildschirm rund 527 App-px breit — breiter als jedes
  iPhone (390–440pt). Die App scheint auf Leonards Geraet verkleinert gerendert zu werden; die
  Ursache ist nicht geklaert.
  NICHT verschoben: die gruene Kopfleiste der laufenden Einheit (`#wo-sticky-bar`, fest oben mit
  deckender Flaeche) und der Verlauf `#statusbar-scrim` der Einstellungen.
  GEMESSEN im Browser mit von Hand gesetzter Variable: Kopf der Uebersicht, des Trainings-Tabs,
  der Einstellungen und des Plan-Details 8 → 48px, erste Karte 72 → 112px, „Mo" im Kalender
  weiter buendig; ohne installierte App bleibt alles bei 8px. Wer es erneut will: Commit 52339ab. Dabei beachten, dass iOS die Angabe nach
  Berichten nur beim Hinzufuegen zum Home-Bildschirm liest; eine Neuinstallation loescht den
  `localStorage` (vorher Drive-Sicherung pruefen, danach beim Konflikt „Cloud" waehlen).
- **`currentColor` in den Nav-Symbolen:** Die drei Punkte im Uebungen-Symbol sind gefuellte Kreise
  mit `fill="currentColor"`, alle uebrigen Formen sind Striche mit `stroke`. Wer nur `stroke`
  faerbt, laesst die Punkte die Textfarbe des Bodys erben — dunkel, im Transparenz-Modus also
  schwarz auf farbigem Grund (gemeldet 04.09.2026). Alle vier Regeln (`.nav-btn svg`,
  `.nav-btn.active svg` und ihre beiden Glas-Fassungen) setzen deshalb `color` MIT.

- **GLEICHNAMIGE GYMTAGE sind technisch harmlos, aber nicht unterscheidbar** (geprueft
  13.09.2026 auf Leonards Frage). Alles Interne laeuft ueber die ID: Plaene (`dayIds`),
  Wochenplan (`planDayId`), Einheiten, verschobene Einheiten, Satzanzahl-Rueckmeldung,
  Volumenvergleich, Ø-Dauer. Keine Stelle ordnet einen Tag ueber den Namen zu, und es gibt beim
  Anlegen oder Umbenennen KEINE Pruefung auf Doppelte.
  DOPPELTE ENTSTEHEN VON SELBST: „Bestehenden Plan als Vorlage kopieren" (`copyExistingPlan`)
  legt fuer die Kopie NEUE Gymtage mit DENSELBEN Namen an (gewollt: unabhaengige Kopie).
  EINZIGE Namens-Zuordnung: der JSON-Plan-Import (`applyPlanImport`) verknuepft den Wochenplan der
  Datei ueber den Tagnamen (ohne Gross-/Kleinschreibung). Stehen in EINER Datei zwei Tage gleichen
  Namens, zeigen beide Wochentage auf den LETZTEN davon.
  Sichtbar wird es in allen Listen und Auswahlen, die nur den Namen zeigen: Gymtage-Raster,
  Wochenplan-Auswahl im Plan-Detail, Bibliothek-Auswahl, Kalender-Fusszeile, Herocard.
- **Eine Einheit gehört zu genau EINEM Wochentag:** `wo.dayIdx` (0=Mo … 6=So) wird beim Start gesetzt, `woDayIdx(wo)` liest ihn (Rückfallebene `startTs`). NIEMALS den Wochentag über `weekPlan.findIndex(planDayId)` bestimmen — bei einem Trainingstag, der zweimal pro Woche im Plan steht, trifft das immer den ersten Treffer.
- `activeOnSelected` in `renderWorkoutsScreen` prüft NUR `woDayIdx(active) === selectedWorkoutDayIdx` — bewusst nicht zusätzlich gegen `planDay`. Sonst verschwindet eine Einheit, die an einem Ruhetag läuft (Training verschoben), komplett aus dem Tab.
- Freies Training hat `planDayId === null`; Anzeigepfade müssen darauf vorbereitet sein (`activeOnSelected` in `renderWorkoutsScreen`).
- `DB.getPlan()`/`getWeekPlan()` fallen ohne aktiven Plan auf hartkodierte `DEFAULT_PLAN`/`DEFAULT_WEEKPLAN` zurück → in Anzeige-Pfaden `getActivePlan()`/`getCurrentWeekDays()` nutzen (sonst Phantom-Tage).
- Volumen-Chart gruppiert je nach gewaehltem Zeitraum (`histRangeDays`): 7 Tage = pro Tag (Wochentag),
  30/90 Tage = pro Woche (Datum des Wochenbeginns; ab 90 Tagen nur der Monatswechsel beschriftet),
  1 Jahr = pro Monat. Frueher immer Kalenderwochen mit Label "WNN" und hart auf 8 Punkte gekappt —
  dadurch zeigte "Letztes Jahr" nur zwei Monate. `autoSkip` ist im Wochen-Modus AUS, weil dort
  Labels absichtlich leer sind; sonst an. X-Achse aufsteigend (aelteste links).
- Aufraeum-Stand (06.09.2026, zweiter Durchgang): Vollstaendige Suche nach Leichen in JS UND
  CSS. Gefunden und entfernt: fuenf Funktionen ohne Aufrufer — `avgDauerFuerTag` (die mittlere
  Dauer stand nur in der alten Vorschau-Herocard), `calZeigtKraft`/`calZeigtLauf` (durch
  `_calModus` abgeloest), `planErfuellung` (stand seit dem Fusszeilen-Umbau nirgends mehr) und
  `manuelleTageIm`, das erst durch das Entfernen von `planErfuellung` frei wurde.
  ACHTUNG: Solche Ketten loesen sich erst nacheinander auf — nach dem Loeschen NOCHMAL suchen,
  bis nichts mehr uebrig bleibt. Dazu fuenf CSS-Regeln (`.cal-detail-plan`, `.cal-detail-row`
  samt `:active`, `.program-form-row-2col` und dessen `> div`) und die Variable
  `--card-accent-border` mitsamt ihrer `@property`-Deklaration und den fuenf Theme-Zuweisungen —
  sie wurde nirgends per `var()` gelesen.
  NICHT angetastet: 17 ID-Attribute ohne Verweis (`drive-card`, `wo-seg`, `plans-seg`,
  `pr-card-title` …). Sie sind blosse Anker im Markup, kosten nichts, und `nav-overview` &
  Geschwister werden zur Laufzeit als `'nav-' + name` zusammengesetzt — eine reine Textsuche
  haelt sie faelschlich fuer tot.
- Aufraeum-Stand (06.09.2026): Nach dem Umbau der Herocards 113 Zeilen totes CSS entfernt —
  `hero-v2-text`, `-label`, `-title`, `-title-row`, `-meta`, `-meta-avg`, `-top`, `-bottom`,
  `-art`, `-button-row`, `-running-notice`, `-progress-bar`/`-fill` (die `-thin`-Varianten
  LEBEN weiter), `.col-layout`, `.active-mode` und `.hero-v2-btn.stretch`.
  Zwei GEMISCHTE Selektorlisten im Glas-Block (`… .chart-card-v2-title, … .hero-v2-title, …`
  und `… .hero-v2-label, … .ppv-adh, …`) haben nur ihren toten Eintrag verloren — genau der
  Fall, vor dem der Workflow-Abschnitt warnt.
  ACHTUNG bei so einem Durchgang: Ein rein maschineller Regex-Durchlauf hinterlaesst
  `}/* Kommentar */` ohne Zeilenumbruch, leere `@media`-Bloecke und Kommentare ohne die Regel,
  die sie erklaeren. Besser die Bloecke SAMT ihrer Kommentare als ganze Textstuecke ersetzen
  und den Diff durchsehen — hier waren es am Ende 113 geloeschte und 1 eingefuegte Zeile.
  Stehen geblieben (unveraendert, nicht Teil dieses Umbaus): der leere Block
  `.plan-day-row.active { }`.
- Aufraeum-Stand (01.09.2026): Nach dem Umbau der Ausklapp-Pfeile und der Plan-Umrandungen wurden
  `.ex-item-chev` (2 Regeln) und eine ungenutzte Variable in der Band-Schleife entfernt. Zusaetzlich
  fielen 11 alte Klassennamen aus gemischten Selektorlisten der beiden Responsive-Bloecke:
  `.hero-card`, `.ov-ex-card`, `.chart-card`, `.aex-card`, `.session-card`, `.program-card`,
  `.stats-row`, `.stats-row-v2`, `.two-col-grid`, `.info-row`, `.plan-carousel`, `.ex-tab-bar`.
  ACHTUNG bei so einer Pruefung: `.chart-card` und `.session-card` sehen in einer einfachen Textsuche
  lebendig aus, weil `chart-card-v2` bzw. `session-card-v2` sie als Praefix enthalten — es braucht eine
  Suche mit Wortgrenze, die ein folgendes `-` ausschliesst. Umgekehrt sah `.ex-tab-bar` benutzt aus,
  ist aber die ID des Elements; seine KLASSE heisst `ex-tab-v2-bar`.
  Stehen geblieben (bewusst): `.ex-tab-v2-bar { padding-left: … }` in beiden Responsive-Bloecken hat
  keine Wirkung, weil die spaetere Basisregel `padding: 0 12px 12px` bei gleicher Spezifitaet gewinnt.
  Das zu reparieren waere eine Layout-AENDERUNG, kein Aufraeumen.
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
