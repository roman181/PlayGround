/* ============================================================
   NEXUS CLAW V7.4.1 — Hybrid AI Office
   Local-first dashboard prototype. No code execution.
   ============================================================ */
(() => {
  "use strict";

  const STORAGE_KEY = "nexus-claw-v741";

  const MODEL_SEED = [
    { id: "ollama", name: "Ollama", sub: "Lokale Modelle verwalten und nutzen", icon: "cpu", accent: "#8dff48", family: "Lokal", model: "qwen2.5-coder:1.5b", tags: ["Lokal", "Modelle", "1.5B"], status: "Verbunden", statusKind: "green" },
    { id: "deepseek", name: "DeepSeek", sub: "Reasoning & Analyse", icon: "brain", accent: "#b379ff", family: "Reasoning", model: "deepseek-r1:latest", tags: ["Text", "Code", "Analyse"], status: "Bereit", statusKind: "green" },
    { id: "codex", name: "Codex", sub: "OpenAI Agent (lokal/Cloud)", icon: "zap", accent: "#31d8ff", family: "Agent", model: "codex-latest", tags: ["Code", "Agent", "Tools"], status: "Bereit", statusKind: "green" },
    { id: "opencode", name: "OpenCode", sub: "Autonomer Coding Agent", icon: "code", accent: "#3f8dff", family: "Agent", model: "opencode-latest", tags: ["Code", "Planung", "Ausführung"], status: "Bereit", statusKind: "green" },
    { id: "copilot", name: "GitHub Copilot", sub: "Assistenz & Vorschläge", icon: "github", accent: "#8fbcff", family: "Assistenz", model: "github-copilot", tags: ["Code", "IDE"], status: "Verbunden", statusKind: "green" },
    { id: "claude", name: "Claude Code", sub: "KI-Coding Agent", icon: "sparkles", accent: "#ffa53c", family: "Agent", model: "claude-sonnet", tags: ["Code", "Agent"], status: "Bereit", statusKind: "green" }
  ];

  const PROVIDERS = [
    { id: "claude", name: "Claude Code", sub: "KI-Coding Agent", icon: "sparkles", accent: "#ffa53c", agent: "rick" },
    { id: "codex", name: "Codex", sub: "OpenAI Agent", icon: "zap", accent: "#31d8ff", agent: "stewie" },
    { id: "opencode", name: "OpenCode", sub: "Dev Agent", icon: "code", accent: "#3f8dff", agent: "stewie" },
    { id: "ollama", name: "Ollama", sub: "Lokale Modelle", icon: "cpu", accent: "#8dff48", agent: "morty" },
    { id: "deepseek", name: "DeepSeek", sub: "Reasoning Model", icon: "brain", accent: "#b379ff", agent: "morty" },
    { id: "copilot", name: "GitHub Copilot", sub: "Code Assist", icon: "github", accent: "#8fbcff", agent: "stewie" }
  ];

  const AGENT_SEED = [
    { id: "rick", name: "Rick", code: "R", role: "Strategie & Planung", focus: "Strategie und Planung", desc: "Zerlegt Ziele in prüfbare Schritte und priorisiert den nächsten Entwicklungszyklus.", accent: "#8dff48", status: "Bereit", task: "NEXUS Roadmap priorisieren" },
    { id: "peter", name: "Peter", code: "P", role: "Kreativität", focus: "Kreativität", desc: "Erzeugt alternative Lösungswege, UI-Ideen und ungewöhnliche Produktansätze.", accent: "#ffa53c", status: "Bereit", task: "UI-Konzepte für V8" },
    { id: "morty", name: "Morty", code: "M", role: "Recherche", focus: "Recherche", desc: "Sammelt Quellen, vergleicht Ansätze und bereitet technische Entscheidungen auf.", accent: "#31d8ff", status: "Aktiv", task: "Ollama-Modelle vergleichen" },
    { id: "stewie", name: "Stewie", code: "S", role: "Entwicklung", focus: "Entwicklung", desc: "Plant Codeänderungen, formuliert Tests und dokumentiert technische Schulden.", accent: "#3f8dff", status: "Aktiv", task: "Loop-Grundgerüst prüfen" },
    { id: "lois", name: "Lois", code: "L", role: "Organisation", focus: "Organisation", desc: "Hält Aufgaben, Büroräume und Übergaben zwischen Agenten konsistent.", accent: "#ff7fb0", status: "Bereit", task: "Wochenübersicht pflegen" },
    { id: "tree", name: "Happy Tree", code: "H", role: "Ideenentwicklung", focus: "Ideenentwicklung", desc: "Verbindet schwache Signale zu neuen Feature-Ideen und Experimenten.", accent: "#a8ff6a", status: "Bereit", task: "Gameplay-Ideen sammeln" },
    { id: "evil", name: "Evil Morty", code: "E", role: "Sicherheit", focus: "Sicherheit", desc: "Prüft Berechtigungen, Freigabegrenzen und riskante autonome Aktionen.", accent: "#ff5566", status: "Bereit", task: "Freigabe-Regeln auditieren" },
    { id: "archive", name: "Archive", code: "A", role: "Archivierung", focus: "Archivierung", desc: "Ordnet Ergebnisse, Snapshots und Entscheidungen im Sandmann Archiv.", accent: "#b379ff", status: "Bereit", task: "Audit-Snapshot anlegen" }
  ];

  const ROOM_SEED = [
    { id: "leitstelle", num: "01", name: "NEXUS Leitstelle", desc: "Zentrale Statusübersicht, Loop-Steuerung und Systemmeldungen.", accent: "#8dff48", occupants: ["R", "L"] },
    { id: "planung", num: "02", name: "Planungsraum", desc: "Roadmaps, Priorisierung und Zerlegung großer Ziele.", accent: "#a8ff6a", occupants: ["R", "P"] },
    { id: "entwicklung", num: "03", name: "Entwicklungsraum", desc: "Codeänderungen, Architektur und technische Umsetzung.", accent: "#3f8dff", occupants: ["S"] },
    { id: "recherche", num: "04", name: "Recherchebüro", desc: "Quellen, Modellvergleiche und Wissensaufbereitung.", accent: "#31d8ff", occupants: ["M"] },
    { id: "testlabor", num: "05", name: "Testlabor", desc: "Testpläne, Verifikation und reproduzierbare Fehlerbilder.", accent: "#ffd34e", occupants: ["S", "H"] },
    { id: "archiv", num: "06", name: "Sandmann Archiv", desc: "Snapshots, Entscheidungsprotokolle und stabile Meilensteine.", accent: "#b379ff", occupants: ["A"] },
    { id: "sicherheit", num: "07", name: "Sicherheitsbüro", desc: "Berechtigungen, Freigaben und Grenzen autonomer Aktionen.", accent: "#ff5566", occupants: ["E"] },
    { id: "privat", num: "08", name: "Persönliches Büro", desc: "Notizen, Favoriten und lokale Arbeitsmittel.", accent: "#ff7fb0", occupants: ["L"] }
  ];

  const SKILL_SEED = [
    { id: "duckgo", name: "mcp-duckgo", desc: "Websuche und Scraping über den DuckDuckGo MCP-Server.", source: "aahl/skills", tag: "Recherche", enabled: true },
    { id: "images", name: "image-search", desc: "Bildrecherche mit Größen-, Farb- und Lizenzfiltern.", source: "z0gsh1u/oh-my-writing-skill", tag: "Medien", enabled: true },
    { id: "gauntlet", name: "gauntlet-loop", desc: "Qualitätsbarren, Builder/Critic-Schleifen und blinde Vergleiche.", source: "robonuggets/gauntlet-loop", tag: "Qualität", enabled: true },
    { id: "sketchfab", name: "load-sketchfab-threejs", desc: "GLB-Assets prüfen, normalisieren und in Three.js laden.", source: "local", tag: "3D", enabled: false },
    { id: "zen", name: "opencode-zen-completions", desc: "OpenAI-kompatible Completions über die OpenCode Zen API.", source: "local", tag: "KI", enabled: true },
    { id: "review", name: "code-review", desc: "Strukturierte Prüfung von Diffs vor der Freigabe.", source: "local", tag: "Entwicklung", enabled: true },
    { id: "test", name: "test-automation", desc: "Testfälle ableiten, ausführen und Fehlerursachen eingrenzen.", source: "local", tag: "Test", enabled: false },
    { id: "audit", name: "audit-export", desc: "Audit-Protokolle filtern und als JSON exportieren.", source: "local", tag: "System", enabled: true }
  ];

  const DEMO_MODELS = [
    { name: "qwen2.5-coder:1.5b", size: "1.0 GB", installed: true },
    { name: "deepseek-r1:1.5b", size: "1.1 GB", installed: true },
    { name: "qwen2.5:3b", size: "1.9 GB", installed: true },
    { name: "llama3:8b", size: "4.7 GB", installed: true },
    { name: "nomic-embed-text", size: "274 MB", installed: false }
  ];

  const LOOP_PHASES = ["Analyse", "Planung", "Entwicklung", "Tests", "Fehlerbehebung", "Dokumentation", "Lernen"];

  const LOOP_LOG_STAGES = [
    { title: "Planung", time: "20:42", lines: [
      { tag: "NEXUS", text: "Repository analysieren …", end: "OK", tone: "green" },
      { tag: "DeepSeek", text: "Ziele und Prioritäten gesetzt" },
      { tag: "Ollama", text: "Modell: qwen2.5-coder:1.5b (lokal)" }
    ] },
    { title: "Code ändern", time: "20:44", lines: [
      { tag: "OpenCode", text: "Änderungen umgesetzt: 12 Dateien (+642/−38)" },
      { tag: "Stewie", text: "Commit: feat: add game logic and test case" },
      { tag: "Stewie", text: "Branch: nexus-dev" }
    ] },
    { title: "Tests ausführen", time: "20:45", lines: [
      { tag: "Unity", text: "10/10 Tests bestanden (Gameplay)", end: "✓", tone: "green" },
      { tag: "Performance", text: "FPS: 60  |  Memory: 512 MB" },
      { tag: "E2E", text: "Keine Fehler gefunden" }
    ] },
    { title: "Fehlerbehebung", time: "20:46", lines: [
      { tag: "NEXUS", text: "Keine kritischen Fehler" },
      { tag: "DeepSeek", text: "Code-Review erfolgreich abgeschlossen." }
    ] },
    { title: "Dokumentation", time: "20:46", lines: [
      { tag: "GitHub", text: "Protokoll aktualisiert" }
    ] }
  ];

  const LIBRARY_SEED = [
    { id: "f1", name: "app.py", type: "Python", size: "24 KB", updated: "19.10.2026", project: "NEXUS V7", status: "Aktiv", icon: "code", accent: "#31d8ff" },
    { id: "f2", name: "agent_orchestrator.py", type: "Python", size: "18 KB", updated: "18.10.2026", project: "NEXUS V7", status: "Aktiv", icon: "code", accent: "#31d8ff" },
    { id: "f3", name: "dashboard.html", type: "HTML", size: "42 KB", updated: "19.10.2026", project: "NEXUS V7", status: "Aktiv", icon: "file", accent: "#ffa53c" },
    { id: "f4", name: "loop_engine.py", type: "Python", size: "31 KB", updated: "17.10.2026", project: "NEXUS V7", status: "Entwurf", icon: "file", accent: "#ffd34e" },
    { id: "f5", name: "GameLogic.cs", type: "C#", size: "88 KB", updated: "16.10.2026", project: "Unity Game", status: "Aktiv", icon: "code", accent: "#b379ff" },
    { id: "f6", name: "player_controller.cs", type: "C#", size: "12 KB", updated: "15.10.2026", project: "Unity Game", status: "Aktiv", icon: "code", accent: "#b379ff" },
    { id: "f7", name: "horus.sh", type: "Bash", size: "7 KB", updated: "12.10.2026", project: "Horus Tools", status: "Pause", icon: "terminal", accent: "#8dff48" },
    { id: "f8", name: "proot_setup.md", type: "Markdown", size: "4 KB", updated: "11.10.2026", project: "Horus Tools", status: "Pause", icon: "note", accent: "#8dff48" },
    { id: "f9", name: "model_eval.ipynb", type: "Notebook", size: "124 KB", updated: "14.10.2026", project: "KI-Modelle Test", status: "Aktiv", icon: "file", accent: "#8dff48" },
    { id: "f10", name: "README.md", type: "Markdown", size: "3 KB", updated: "10.10.2026", project: "Experimente", status: "Archiv", icon: "note", accent: "#6f8989" }
  ];

  const ROUTES = {
    home: { title: "Übersicht", eyebrow: "NEXUS LEITSTELLE", sub: "Systemstatus, Agenten und Loop auf einen Blick." },
    status: { title: "Status", eyebrow: "SYSTEM STATUS", sub: "Messwerte, Verbindungen und aktive Sitzungen." },
    models: { title: "Modellzentrale", eyebrow: "KI-MODELLE · ROUTING", sub: "Lokale Modelle verbinden, prüfen und Aufgaben zuweisen." },
    loop: { title: "Entwicklungs-Loop", eyebrow: "AUTONOMER ZYKLUS · SIMULATION", sub: "Kontrollierter Prototyp-Zyklus ohne echte Codeausführung." },
    projects: { title: "Projekte", eyebrow: "ARBEITSBEREICHE", sub: "Aktive Vorhaben, Experimente und archivierte Meilensteine." },
    more: { title: "Mehr", eyebrow: "ALLE BEREICHE", sub: "Alle Module der NEXUS CLAW Steuerzentrale." },
    agents: { title: "KI-Agenten", eyebrow: "AGENTENPROFILE", sub: "Acht spezialisierte Profile für Planung, Entwicklung und Prüfung." },
    rooms: { title: "Digitale Büroräume", eyebrow: "BÜROSTRUKTUR", sub: "Acht thematische Räume als organisatorische Struktur." },
    skills: { title: "Skills", eyebrow: "WERKZEUGE & FÄHIGKEITEN", sub: "Verfügbare Fähigkeiten und ihre Aktivierung im Prototyp." },
    library: { title: "Bibliothek", eyebrow: "DATEIEN · READ ONLY", sub: "Projektdateien durchsuchen – ohne Schreibzugriff." },
    tasks: { title: "Aufgaben", eyebrow: "AUFGABENVERWALTUNG", sub: "Aufgaben planen, priorisieren und lokal speichern." },
    chat: { title: "Lokaler KI-Chat", eyebrow: "OLLAMA · LOKAL", sub: "Anfragen an das konfigurierte Modell senden." },
    notes: { title: "Notizen", eyebrow: "LOKAL · LOCALSTORAGE", sub: "Kurze Notizen, Ideen und technische Merkzettel." },
    settings: { title: "Einstellungen", eyebrow: "SYSTEM & SICHERHEIT", sub: "Ollama, Limits, Theme und Freigaberegeln." },
    audit: { title: "Audit-Protokoll", eyebrow: "LIVE-PROTOKOLL", sub: "Nachvollziehbare Ereignisse aus dem Prototyp." },
    terminal: { title: "Terminal (Horus Linux)", eyebrow: "SIMULIERTE SHELL", sub: "Befehle werden ausschließlich simuliert." }
  };

  const NAV_GROUPS = [
    { label: "Steuerung", items: ["home", "status", "models", "loop", "projects"] },
    { label: "KI-Betrieb", items: ["agents", "rooms", "skills", "chat"] },
    { label: "Werkzeuge", items: ["tasks", "notes", "library", "terminal", "audit"] },
    { label: "System", items: ["settings"] }
  ];

  const NAV_ICONS = {
    home: "home", status: "activity", models: "cpu", loop: "loop", projects: "folder", more: "more",
    agents: "users", rooms: "grid", skills: "tools", library: "book", tasks: "check-square",
    chat: "chat", notes: "note", settings: "settings", audit: "activity", terminal: "terminal"
  };

  const BOTTOM_NAV = ["home", "status", "loop", "settings", "more"];

  const AUDIT_STYLE = {
    mutation: { icon: "code", color: "#b379ff" },
    note: { icon: "note", color: "#8dff48" },
    personality: { icon: "users", color: "#b379ff" },
    test: { icon: "check-square", color: "#8dff48" },
    code: { icon: "code", color: "#31d8ff" },
    safety: { icon: "shield", color: "#ffa53c" },
    rollback: { icon: "refresh", color: "#ff5566" },
    system: { icon: "radio", color: "#3f8dff" },
    model: { icon: "cpu", color: "#8dff48" },
    loop: { icon: "loop", color: "#31d8ff" },
    chat: { icon: "chat", color: "#8dff48" },
    project: { icon: "folder", color: "#ffa53c" }
  };

  const PRIORITY = {
    hoch: { cls: "red", color: "var(--red)" },
    mittel: { cls: "orange", color: "var(--orange)" },
    niedrig: { cls: "green", color: "var(--green)" }
  };

  const TASK_STATUS = {
    offen: { label: "Offen", cls: "red" },
    arbeit: { label: "In Arbeit", cls: "orange" },
    erledigt: { label: "Erledigt", cls: "green" }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const icon = (name, cls = "ico") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const pad = (n) => String(n).padStart(2, "0");
  const timeNow = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const clockNow = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const isoDaysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
  const formatDate = (iso) => { const d = new Date(iso); if (Number.isNaN(d.getTime())) return "–"; return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`; };
  const relativeTime = (iso) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(ms)) return "–";
    const mins = Math.max(1, Math.round(ms / 60000));
    if (mins < 60) return `vor ${mins} Min.`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `vor ${hrs} Std.`;
    const days = Math.round(hrs / 24);
    return days === 1 ? "gestern" : `vor ${days} Tagen`;
  };
  const cleanUrl = (url) => String(url || "").trim().replace(/\/+$/, "");
  const agentById = (id) => AGENT_SEED.find((a) => a.id === id) || null;

  /* ---------- Default state ---------- */
  function freshState() {
    return {
      version: 1,
      settings: {
        ollamaUrl: "http://127.0.0.1:11434",
        model: "qwen2.5-coder:1.5b",
        language: "de",
        theme: "cyberpunk",
        safety: { controller: true, autonomous: false, codeExec: false, network: false, release: true },
        limits: { mutations: 20, cooldown: 60 }
      },
      tasks: [
        { id: "t1", title: "Unity Project einrichten", priority: "hoch", status: "offen", agent: "rick", project: "Unity Game", due: "2026-10-16" },
        { id: "t2", title: "KI-Modelle evaluieren", priority: "mittel", status: "arbeit", agent: "stewie", project: "KI-Modelle Test", due: "2026-10-19" },
        { id: "t3", title: "Gameplay testen", priority: "mittel", status: "arbeit", agent: "tree", project: "Unity Game", due: "2026-10-15" },
        { id: "t4", title: "UI verbessern", priority: "niedrig", status: "offen", agent: "peter", project: "NEXUS V7", due: "2026-10-20" },
        { id: "t5", title: "Fehleranalyse", priority: "hoch", status: "offen", agent: "morty", project: "NEXUS V7", due: "2026-10-14" },
        { id: "t6", title: "Ollama-Verbindung dokumentieren", priority: "mittel", status: "erledigt", agent: "lois", project: "NEXUS V7", due: "2026-10-13" }
      ],
      notes: [
        { id: "n1", title: "Loop-Architektur", body: "7 Phasen pro Zyklus: Analyse → Planung → Entwicklung → Tests → Fehlerbehebung → Dokumentation → Lernen.\n\nMutationen nur nach Freigabe. Jeder Zyklus erzeugt einen Audit-Eintrag.", updated: isoDaysAgo(0.08), accent: "#31d8ff" },
        { id: "n2", title: "Ollama Setup", body: "ollama serve\nOLLAMA_ORIGINS=* für Browser-Zugriff\n\nStandardmodell: qwen2.5-coder:1.5b\nDashboard: http://127.0.0.1:5000", updated: isoDaysAgo(0.22), accent: "#8dff48" },
        { id: "n3", title: "Ideen für V8", body: "• Agenten-Orchestrierung\n• Echte Sandbox mit Ressourcenlimits\n• Exportierbares Audit-Protokoll\n• Skill-Marketplace und Rollenrechte", updated: isoDaysAgo(1), accent: "#b379ff" }
      ],
      projects: [
        { id: "p1", name: "NEXUS V7", type: "Android / Python", status: "Aktiv", language: "Kotlin · Python", updated: "2026-10-16", progress: 72, accent: "#31d8ff", icon: "code", desc: "Hybrid AI Office Dashboard und lokale Agentenbasis." },
        { id: "p2", name: "Unity Game", type: "C# / Unity", status: "In Arbeit", language: "C#", updated: "2026-10-15", progress: 46, accent: "#ffa53c", icon: "grid", desc: "Gameplay-Prototyp mit modularen Systemen." },
        { id: "p3", name: "KI-Modelle Test", type: "Python", status: "Aktiv", language: "Python · Jupyter", updated: "2026-10-14", progress: 88, accent: "#8dff48", icon: "brain", desc: "Benchmarks und Routing-Vergleiche lokaler Modelle." },
        { id: "p4", name: "Horus Tools", type: "Bash / Linux", status: "Pause", language: "Bash · C", updated: "2026-10-12", progress: 63, accent: "#b379ff", icon: "terminal", desc: "Termux-Werkzeuge, proot und Shell-Integration." },
        { id: "p5", name: "Experimente", type: "Diverses", status: "Archiv", language: "Mixed", updated: "2026-10-10", progress: 100, accent: "#6f8989", icon: "archive", desc: "Archivierte Prototypen und verworfene Ansätze." }
      ],
      sessions: [
        { id: "s1", name: "NEXUS-Dev-Session", status: "Läuft", started: timeNow() },
        { id: "s2", name: "DeepSeek-Analyse", status: "Bereit", started: timeNow() }
      ],
      skills: Object.fromEntries(SKILL_SEED.map((s) => [s.id, s.enabled])),
      chat: {
        agent: "nexus",
        messages: [
          { id: "m1", role: "assistant", text: "NEXUS CLAW online. Ich bin die lokale Chat-Schnittstelle.\n\nVerbinde Ollama in der Modellzentrale, um echte Antworten zu erhalten. Ohne Verbindung antworte ich im klar gekennzeichneten Demo-Modus.", time: "14:35", demo: true }
        ]
      },
      loop: {
        running: false, paused: false, cycle: 3, total: 10, progress: 100, phaseIndex: 6,
        task: "Unity-Gameplay verbessern", owner: "Morty",
        steps: ["Projekt analysieren", "Code-Änderungen erstellen", "Tests ausführen", "Fehler beheben"]
      },
      audit: [
        { id: "a1", time: "14:35:12", type: "mutation", actor: "Rick", text: "/ Portal-Mathe Lv. 8 → 9" },
        { id: "a2", time: "14:33:45", type: "note", actor: "note_create", text: "Unity Project eingerichtet" },
        { id: "a3", time: "14:31:27", type: "personality", actor: "personality_change", text: "Morty → rotzig" },
        { id: "a4", time: "14:28:11", type: "test", actor: "test_run", text: "18/18 Tests erfolgreich" },
        { id: "a5", time: "14:24:09", type: "code", actor: "code_change", text: "game_logic.py (#42/38)" },
        { id: "a6", time: "14:20:33", type: "safety", actor: "safety_change", text: "Freigaberegeln aktiviert" },
        { id: "a7", time: "14:18:55", type: "rollback", actor: "rollback", text: "mutation #a1b2c3d4" },
        { id: "a8", time: "14:16:02", type: "note", actor: "note_update", text: "Gameplay testen" },
        { id: "a9", time: "14:12:37", type: "system", actor: "system", text: "Server gestartet" },
        { id: "a10", time: "14:10:22", type: "model", actor: "model_change", text: "deepseek-r1:latest" }
      ],
      connection: { status: "unbekannt", checkedAt: 0, models: DEMO_MODELS },
      terminal: [
        { kind: "sys", text: "NEXUS CLAW · Horus Linux Runtime v7.4.1" },
        { kind: "dim", text: "Simulierte Shell · keine echte Codeausführung" },
        { kind: "dim", text: 'Tippe "help" für verfügbare Befehle.' }
      ],
      customModels: [],
      ui: { projectFilter: "alle", taskFilter: "alle", auditFilter: "alle", noteQuery: "", libraryQuery: "" }
    };
  }

  function mergeDefaults(saved, defaults) {
    if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;
    if (defaults && typeof defaults === "object") {
      const out = { ...defaults };
      if (saved && typeof saved === "object") {
        for (const key of Object.keys(saved)) {
          out[key] = key in defaults ? mergeDefaults(saved[key], defaults[key]) : saved[key];
        }
      }
      return out;
    }
    return saved === undefined ? defaults : saved;
  }

  const DEFAULTS = freshState();
  let state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? mergeDefaults(JSON.parse(raw), DEFAULTS) : freshState();
  } catch {
    state = freshState();
  }

  const ui = {
    loopTimer: null,
    chatTyping: false,
    connectionTesting: false,
    lastRoute: null,
    metrics: { storage: 96.8, ram: 2.0, battery: 96 },
    modalReturnFocus: null
  };

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }

  function addAudit(type, text, actor = "system") {
    state.audit.unshift({ id: uid("a"), time: timeNow(), type, actor, text });
    state.audit = state.audit.slice(0, 140);
    save();
  }

  function toast(message, kind = "ok") {
    const stack = $("#toastStack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = `toast ${kind === "ok" ? "" : kind}`;
    el.innerHTML = `${icon(kind === "err" || kind === "warn" ? "alert" : "check")}<span>${esc(message)}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(12px)";
      el.style.transition = "opacity 180ms ease, transform 180ms ease";
      setTimeout(() => el.remove(), 220);
    }, 3200);
  }

  /* ---------- Routing ---------- */
  const getRoute = () => {
    const match = location.hash.match(/^#\/([a-z-]+)/);
    return match && ROUTES[match[1]] ? match[1] : "home";
  };

  function navigate(route) {
    if (!ROUTES[route]) route = "home";
    if (location.hash === `#/${route}`) renderRoute();
    else location.hash = `#/${route}`;
  }

  function buildNav() {
    const side = $("#sideNav");
    side.innerHTML = NAV_GROUPS.map((group) => `
      <div class="nav-group-label">${esc(group.label)}</div>
      ${group.items.map((key) => {
        const count = key === "tasks" ? state.tasks.filter((t) => t.status !== "erledigt").length : 0;
        return `<a class="side-link" data-nav="${key}" href="#/${key}">${icon(NAV_ICONS[key])}<span>${esc(ROUTES[key].title)}</span>${count ? `<span class="nav-count">${count}</span>` : ""}</a>`;
      }).join("")}
    `).join("");

    const bottom = $("#bottomNav");
    bottom.innerHTML = BOTTOM_NAV.map((key) => {
      const count = key === "tasks" ? state.tasks.filter((t) => t.status !== "erledigt").length : 0;
      const label = key === "home" ? "Home" : key === "status" ? "Status" : key === "loop" ? "Loop" : key === "settings" ? "Einstellungen" : "Mehr";
      return `<a class="bottom-link" data-nav="${key}" href="#/${key}">${icon(NAV_ICONS[key])}<span>${label}</span>${count ? `<span class="nav-count">${count}</span>` : ""}</a>`;
    }).join("");
  }

  function updateNavActive(route) {
    const activeKey = BOTTOM_NAV.includes(route) ? route : "more";
    $$("[data-nav]").forEach((el) => {
      el.classList.toggle("active", el.dataset.nav === route || (el.classList.contains("bottom-link") && el.dataset.nav === activeKey));
    });
  }

  function renderRoute() {
    const route = getRoute();
    const meta = ROUTES[route];
    $("#pageTitle").textContent = meta.title;
    $("#pageEyebrow").textContent = meta.eyebrow;
    document.title = `NEXUS CLAW · ${meta.title}`;
    document.body.dataset.route = route;
    const content = $("#view");
    content.innerHTML = `<div class="view-enter">${RENDERERS[route]()}</div>`;
    updateNavActive(route);
    updateOnlinePill();
    updateClock();
    ui.lastRoute = route;

    if (route === "terminal") {
      const input = $("#termInput");
      if (input && window.innerWidth > 820) input.focus();
      scrollTerminal();
    }
    if (route === "chat") requestAnimationFrame(scrollChat);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function updateClock() {
    const el = $("#topClock");
    if (el) el.textContent = clockNow();
  }

  function updateOnlinePill() {
    const pill = $("#onlinePill");
    const label = $("#onlineLabel");
    if (!pill || !label) return;
    const online = navigator.onLine;
    const running = state.loop.running && !state.loop.paused;
    label.textContent = running ? "RUNNING" : online ? "ONLINE" : "OFFLINE";
    pill.classList.toggle("err", !online);
    pill.classList.toggle("warn", online && running);
  }

  function pageHead(title, sub, actions = "") {
    return `<div class="page-head"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>${actions ? `<div class="head-actions">${actions}</div>` : ""}</div>`;
  }

  /* ---------- Renderers ---------- */
  const RENDERERS = {
    home: renderHome, status: renderStatus, models: renderModels, loop: renderLoop, projects: renderProjects,
    more: renderMore, agents: renderAgents, rooms: renderRooms, skills: renderSkills,
    library: renderLibrary, tasks: renderTasks, chat: renderChat, notes: renderNotes,
    settings: renderSettings, audit: renderAudit, terminal: renderTerminal
  };

  /* ============ HOME ============ */
  function renderHome() {
    const m = ui.metrics;
    const connected = state.connection.status === "ok";
    return `
      <div class="overview-layout">
        <div class="overview-main">
          <div class="home-label"><span>System Status</span><span class="home-label-note">${connected ? "Ollama verbunden" : "Demo-Daten"}</span></div>
          <div class="metric-grid">
            ${metricCard("Speicher", "database", m.storage.toFixed(1) + " GB", "frei", "#8dff48", "demo")}
            ${metricCard("RAM", "memory", m.ram.toFixed(1) + " GB", "verfügbar", "#8fd8ff", "demo")}
            ${metricCard("Netzwerk", "wifi", "Wi-Fi", "verbunden", "#d8ecff", "live")}
            ${metricCard("Batterie", "battery", Math.round(m.battery) + "%", "geladen", "#8dff48", "demo")}
          </div>

          <div class="home-label home-label-accent"><span><span class="play-tri"></span>Open a Session</span><a class="link desktop-only" href="#/agents">Alle Agenten ${icon("arrow-right")}</a></div>
          <div class="session-tile-grid">
            ${PROVIDERS.map((p) => `
              <button class="session-tile" style="--accent:${p.accent}" data-action="launch" data-provider="${p.id}">
                <span class="session-tile-icon">${icon(p.icon)}</span>
                <span class="session-tile-name">${esc(p.name)}</span>
              </button>`).join("")}
          </div>

          <div class="home-link-list">
            <button class="home-link-row" data-action="open-terminal">
              <span class="home-link-icon" style="--accent:#8dff48">${icon("terminal")}</span>
              <span class="home-link-copy"><strong>Bare Terminal</strong><small>Direkter Terminal-Zugriff</small></span>
              <span class="chev">${icon("chevron")}</span>
            </button>
            <button class="home-link-row" data-action="open-library">
              <span class="home-link-icon" style="--accent:#8dff48">${icon("folder")}</span>
              <span class="home-link-copy"><strong>Browse your files</strong><small>Nur lesen (Read Only)</small></span>
              <span class="chev">${icon("chevron")}</span>
            </button>
          </div>

          <div class="home-label session-label"><span>Active Sessions</span><span class="badge green">${state.sessions.length} aktiv</span></div>
          <div class="session-panel">
            <div class="session-list">
              ${state.sessions.map((s) => `
                <div class="session-row">
                  <span class="session-dot ${s.status === "Läuft" ? "" : "idle"}"></span>
                  <span class="session-name">${esc(s.name)}</span>
                  <button class="manage-btn" data-action="session-manage" data-session="${s.id}">Manage</button>
                </div>`).join("") || `
                <div class="empty">${icon("radio")}<strong>Keine aktiven Sitzungen</strong><p>Starte einen Agenten über die Karten oben.</p></div>`}
            </div>
          </div>

          <div class="home-label"><span>Offene Aufgaben</span><a class="link" href="#/tasks">Alle ${icon("arrow-right")}</a></div>
          <div class="panel pad home-task-panel">
            ${state.tasks.slice(0, 4).map((t) => `
              <div class="session-row">
                <span class="session-dot ${t.status === "erledigt" ? "idle" : ""}"></span>
                <span class="session-name ${t.status === "erledigt" ? "muted" : ""}">${esc(t.title)}</span>
                <span class="badge ${PRIORITY[t.priority].cls}">${esc(t.priority)}</span>
                <span class="session-meta">${esc(agentById(t.agent)?.name || "–")}</span>
              </div>`).join("")}
          </div>
        </div>

        <aside class="overview-aside home-aside">
          ${loopPanel()}
          ${focusTaskPanel()}
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">${icon("activity")} Audit-Log</div>
              <a class="badge ${connected ? "green" : "cyan"}" href="#/audit">Live</a>
            </div>
            <div class="panel-body" style="padding-top:8px;padding-bottom:8px">
              <div class="audit-list">${state.audit.slice(0, 6).map(auditRow).join("")}</div>
            </div>
          </div>
        </aside>
      </div>`;
  }

  function metricCard(label, ic, value, sub, color, kind) {
    return `
      <div class="metric" style="--metric-color:${color}">
        <div class="metric-label"><span>${esc(label)}</span><span class="metric-kind ${kind === "live" ? "live" : ""}">${kind === "live" ? "Live" : "Demo"}</span></div>
        <div class="metric-icon">${icon(ic)}</div>
        <div class="metric-value" data-metric-value="${esc(label)}">${esc(value)}</div>
        <div class="metric-sub">${esc(sub)}</div>
      </div>`;
  }

  function loopPanel() {
    const loop = state.loop;
    const pct = Math.max(0, Math.min(100, loop.progress));
    const C = 2 * Math.PI * 74;
    const offset = C * (1 - pct / 100);
    return `
      <div class="panel loop-panel">
        <div class="between">
          <div class="panel-title">${icon("loop")} Entwicklungs-Loop</div>
          <span class="badge ${loop.running ? (loop.paused ? "orange" : "green") : ""}">${loop.running ? (loop.paused ? "Pausiert" : "Läuft") : "Bereit"}</span>
        </div>
        <div class="loop-visual">
          <svg class="ring" viewBox="0 0 176 176" aria-label="Loop-Fortschritt ${pct}%">
            <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8dff48"/><stop offset="1" stop-color="#31d8ff"/></linearGradient></defs>
            <circle class="track" cx="88" cy="88" r="74"/>
            <circle class="progress" id="loopRingProgress" cx="88" cy="88" r="74" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
          </svg>
          <div class="ring-center">
            <span class="cycle" id="loopCycle">Zyklus ${loop.cycle} / ${loop.total}</span>
            <span class="pct" id="loopPct">${Math.round(pct)} %</span>
            <span class="state" id="loopState">${loop.running ? (loop.paused ? "Pausiert" : "Simulation") : "Bereit"}</span>
          </div>
        </div>
        <div class="loop-steps" id="loopSteps">
          ${LOOP_PHASES.map((phase, i) => loopStep(phase, i, loop)).join("")}
        </div>
        <div class="loop-controls">
          <button class="btn primary" data-action="loop-start">${icon("play")} Start</button>
          <button class="btn" data-action="loop-pause">${icon("pause")} Pause</button>
          <button class="btn danger" data-action="loop-stop">${icon("stop")} Stop</button>
        </div>
        <p class="field-hint" style="margin-top:9px">Simulation · keine echte Codeausführung. Der Loop speichert nur einen Steuerzustand.</p>
      </div>`;
  }

  function loopStep(phase, i, loop) {
    const phaseIndex = Math.min(LOOP_PHASES.length - 1, Math.floor((loop.progress / 100) * LOOP_PHASES.length));
    const done = i < phaseIndex || loop.progress >= 100;
    const active = i === phaseIndex && loop.running && !loop.paused && loop.progress < 100;
    return `<div class="loop-step ${done ? "done" : active ? "active" : ""}">
      <span class="bullet">${done ? icon("check") : ""}</span>
      <span>${esc(phase)}</span>
      <span class="step-time">${done ? "✓" : active ? "läuft" : "–"}</span>
    </div>`;
  }

  function focusTaskPanel() {
    const loop = state.loop;
    const liveIndex = Math.max(0, Math.min(loop.steps.length - 1, Math.floor((loop.progress / 100) * loop.steps.length)));
    return `
      <div class="panel task-focus">
        <div class="between"><div class="panel-title">${icon("clipboard")} Aktuelle Aufgabe</div><span class="badge orange">A3 ${esc(loop.owner)}</span></div>
        <div class="task-title">${esc(loop.task)}</div>
        <div class="task-meta"><span class="badge">Schritte</span><span class="muted small">${liveIndex + 1} / ${loop.steps.length}</span></div>
        <div class="focus-steps">
          ${loop.steps.map((step, i) => {
            const done = i < liveIndex || loop.progress >= 100;
            const live = i === liveIndex && loop.running && !loop.paused && loop.progress < 100;
            return `<div class="focus-step ${done ? "done" : live ? "live" : ""}">
              <span class="n">${done ? "✓" : i + 1}</span><span>${esc(step)}</span>
              <span class="status">${done ? "Fertig" : live ? "Läuft" : "Wartet"}</span>
            </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  function auditRow(a) {
    const style = AUDIT_STYLE[a.type] || AUDIT_STYLE.system;
    return `<div class="audit-row">
      <span class="audit-time">${esc(a.time)}</span>
      <span class="audit-icon" style="--evt:${style.color}">${icon(style.icon)}</span>
      <span class="audit-text"><b>${esc(a.actor)}</b> · ${esc(a.text)}</span>
    </div>`;
  }

  /* ============ STATUS ============ */
  function renderStatus() {
    const m = ui.metrics;
    const connected = state.connection.status === "ok";
    const openTasks = state.tasks.filter((t) => t.status !== "erledigt").length;
    return `
      ${pageHead("System Status", "Live-Messwerte und Demo-Kennzahlen sind getrennt markiert. Alle Werte bleiben lokal.", `
        <button class="btn ghost sm" data-action="test-connection">${icon("refresh")} Verbindung testen</button>
        <a class="btn primary sm" href="#/models">${icon("cpu")} Modellzentrale</a>
      `)}
      <div class="metric-grid status-metrics">
        ${metricCard("Speicher", "database", m.storage.toFixed(1) + " GB", "frei · Demo", "#8dff48", "demo")}
        ${metricCard("RAM", "memory", m.ram.toFixed(1) + " GB", "verfügbar · Demo", "#8fd8ff", "demo")}
        ${metricCard("Netzwerk", "wifi", "Wi-Fi", "verbunden · Live", "#d8ecff", "live")}
        ${metricCard("Batterie", "battery", Math.round(m.battery) + "%", "geladen · Demo", "#8dff48", "demo")}
      </div>
      <div class="two-col" style="margin-top:18px">
        <div class="stack">
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("radio")} Verbindungen</div><span class="badge ${connected ? "green" : "orange"}">${connected ? "Ollama OK" : "Demo-Modus"}</span></div>
            <div class="panel-body">
              <div class="session-row"><span class="session-dot"></span><span class="session-name">Frontend · NEXUS CLAW</span><span class="badge green">Bereit</span></div>
              <div class="session-row"><span class="session-dot ${connected ? "" : "idle"}"></span><span class="session-name">Ollama · ${esc(cleanUrl(state.settings.ollamaUrl))}</span><span class="badge ${connected ? "green" : "orange"}">${connected ? "Verbunden" : "Nicht geprüft"}</span></div>
              <div class="session-row"><span class="session-dot ${state.loop.running ? "" : "idle"}"></span><span class="session-name">Entwicklungs-Loop</span><span class="badge ${state.loop.running ? "green" : ""}">${state.loop.running ? (state.loop.paused ? "Pausiert" : "Läuft") : "Bereit"}</span></div>
              <div class="session-row"><span class="session-dot"></span><span class="session-name">Lokale Persistenz</span><span class="badge cyan">localStorage</span></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("activity")} Auslastung</div><span class="badge">Demo</span></div>
            <div class="panel-body">
              <div class="status-meter"><div class="between"><span class="small">Speicher</span><span class="mono small">${m.storage.toFixed(1)} GB frei</span></div><div class="metric-bar"><i style="width:62%;background:var(--green)"></i></div></div>
              <div class="status-meter"><div class="between"><span class="small">RAM</span><span class="mono small">${m.ram.toFixed(1)} GB / 8 GB</span></div><div class="metric-bar"><i style="width:25%;background:var(--cyan)"></i></div></div>
              <div class="status-meter"><div class="between"><span class="small">Batterie</span><span class="mono small">${Math.round(m.battery)}%</span></div><div class="metric-bar"><i style="width:${Math.round(m.battery)}%;background:var(--green)"></i></div></div>
              <div class="status-meter"><div class="between"><span class="small">Loop-Zyklus</span><span class="mono small">${state.loop.cycle} / ${state.loop.total}</span></div><div class="metric-bar"><i style="width:${state.loop.progress}%;background:var(--cyan)"></i></div></div>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("users")} Aktive Sitzungen</div><span class="badge green">${state.sessions.length}</span></div>
            <div class="panel-body">
              ${state.sessions.map((s) => `
                <div class="session-row">
                  <span class="session-dot ${s.status === "Läuft" ? "" : "idle"}"></span>
                  <span class="session-name">${esc(s.name)}</span>
                  <button class="manage-btn" data-action="session-manage" data-session="${s.id}">Manage</button>
                </div>`).join("") || `<p class="field-hint">Keine Sitzungen aktiv.</p>`}
            </div>
          </div>
          <div class="panel pad">
            <div class="between"><span class="panel-title">${icon("check-square")} Aufgaben</span><span class="badge orange">${openTasks} offen</span></div>
            <p class="field-hint" style="margin-top:8px">Aufgaben werden lokal gespeichert und bei jeder Änderung im Audit-Protokoll erfasst.</p>
            <a class="btn ghost sm block" style="margin-top:10px" href="#/tasks">Aufgaben öffnen ${icon("arrow-right")}</a>
          </div>
          <div class="panel pad">
            <div class="between"><span class="panel-title">${icon("activity")} Audit</span><span class="badge green"><span class="dot"></span> Live</span></div>
            <p class="field-hint" style="margin-top:8px">${state.audit.length} lokale Ereignisse protokolliert.</p>
            <a class="btn ghost sm block" style="margin-top:10px" href="#/audit">Protokoll öffnen ${icon("arrow-right")}</a>
          </div>
        </div>
      </div>`;
  }

  /* ============ MODELS ============ */
  function renderModels() {
    const conn = state.connection;
    const connected = conn.status === "ok";
    const models = modelChoices();
    const installed = conn.models && conn.models.length ? conn.models : DEMO_MODELS;
    const activeId = MODEL_SEED.find((m) => m.model === state.settings.model)?.id;
    return `
      ${pageHead("KI-Modelle (Routing)", "Provider und lokale Modelle verbinden. Die Verbindung wird direkt über die Ollama-HTTP-API geprüft.", `
        <button class="btn ghost sm" data-action="test-connection">${icon("refresh")} Verbindung testen</button>
        <button class="btn primary sm" data-action="new-model">${icon("plus")} Neues Modell</button>
      `)}
      <div class="two-col">
        <div>
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">${icon("cpu")} Modelle & Provider</div>
              <span class="badge ${connected ? "green" : "orange"}">${connected ? "Ollama verbunden" : "Demo-Routing"}</span>
            </div>
            <div class="panel-body">
              <div class="model-list">
                ${MODEL_SEED.map((m) => modelCard(m, activeId === m.id)).join("")}
                ${(state.customModels || []).map((m) => modelCard({ id: m.id, name: m.name, sub: m.kind || "Benutzerdefiniert", icon: "cpu", accent: "#8dff48", model: m.name, tags: [m.kind || "Custom"], status: "Bereit" }, state.settings.model === m.name)).join("")}
              </div>
            </div>
          </div>

          <div class="section-head"><h3>Routing-Regeln</h3><span class="badge">Prototyp</span></div>
          <div class="panel">
            <div class="panel-body">
              <div class="stack">
                ${routeRule("Strategie & Planung", "Ollama · qwen2.5-coder", "Architektur, Zerlegung", "#8dff48")}
                ${routeRule("Code & Refactoring", "Codex / OpenCode", "Änderungen, Tests", "#31d8ff")}
                ${routeRule("Sicherheitsprüfung", "DeepSeek · Reasoning", "Risiko, Freigaben", "#ff5566")}
                ${routeRule("Recherche", "mcp-duckgo Skill", "Quellen, Vergleiche", "#b379ff")}
              </div>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("radio")} Ollama-Verbindung</div><span class="badge ${connected ? "green" : conn.status === "error" ? "red" : ""}">${connected ? "OK" : conn.status === "error" ? "Fehler" : "Ungeprüft"}</span></div>
            <div class="panel-body">
              <div class="conn-row ${conn.status === "error" ? "err" : ""}">
                ${icon(connected ? "check" : conn.status === "error" ? "alert" : "radio")}
                <span>${connected ? `Verbunden · ${installed.length} Modelle gemeldet` : conn.status === "error" ? "Nicht erreichbar – Demo-Modus aktiv" : "Verbindung noch nicht geprüft"}</span>
              </div>
              <div class="field" style="margin-top:13px">
                <label for="ollamaUrl">Ollama-Adresse</label>
                <input class="input mono" id="ollamaUrl" data-setting="ollamaUrl" value="${esc(state.settings.ollamaUrl)}" spellcheck="false" />
              </div>
              <div class="field" style="margin-top:11px">
                <label for="defaultModelSelect">Standardmodell</label>
                <select class="select" id="defaultModelSelect" data-setting="model">
                  ${models.map((m) => `<option value="${esc(m.name)}" ${m.name === state.settings.model ? "selected" : ""}>${esc(m.name)}${m.provider ? ` · ${esc(m.provider)}` : ""}</option>`).join("")}
                </select>
              </div>
              <div class="row" style="margin-top:12px">
                <button class="btn primary grow" data-action="test-connection">${icon("wifi")} Verbindung prüfen</button>
                <button class="btn ghost" data-action="open-settings" aria-label="Einstellungen">${icon("settings")}</button>
              </div>
              <p class="field-hint" style="margin-top:9px">Bei Browser-Zugriff auf einen anderen Host: <code>OLLAMA_ORIGINS=* ollama serve</code>.</p>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("database")} Lokale Modelle</div><span class="badge">${installed.length}</span></div>
            <div class="panel-body">
              <div class="ollama-models">
                ${installed.map((m) => `<div class="ollama-model ${m.installed !== false ? "installed" : ""}">${icon(m.installed !== false ? "check" : "download")}<span>${esc(m.name)}</span><span class="size">${esc(m.size || "—")}</span></div>`).join("")}
              </div>
              <button class="btn block ghost sm" style="margin-top:10px" data-action="test-connection">${icon("refresh")} Modellliste aktualisieren</button>
            </div>
          </div>

          <div class="panel pad">
            <div class="badge orange">Sicherheitsgrenze</div>
            <p class="field-hint" style="margin-top:8px">Modellaufrufe sind im Prototyp auf Textgenerierung beschränkt. Codeausführung und Schreibzugriff bleiben deaktiviert.</p>
          </div>
        </div>
      </div>`;
  }

  function modelCard(m, active) {
    return `<div class="model-card ${active ? "active" : ""}" style="--accent:${m.accent}" data-action="model-select" data-model-id="${m.id}" data-model-name="${esc(m.model)}" role="button" tabindex="0">
      <span class="model-icon">${icon(m.icon)}</span>
      <span class="model-copy">
        <strong>${esc(m.name)} ${active ? '<span class="badge green">Standard</span>' : ""}</strong>
        <span class="model-sub">${esc(m.sub)}</span>
        <span class="model-tags">${m.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}</span>
      </span>
      <span class="model-status">${icon("check")} ${esc(m.status)}</span>
      <span class="chev">${icon("chevron")}</span>
    </div>`;
  }

  function routeRule(task, model, note, accent) {
    return `<div class="session-row">
      <span class="session-dot" style="background:${accent};box-shadow:0 0 9px ${accent}"></span>
      <div class="grow"><div class="small" style="font-weight:600">${esc(task)}</div><div class="small muted">${esc(note)}</div></div>
      <span class="badge">${esc(model)}</span>
    </div>`;
  }

  function modelChoices() {
    const fromConn = (state.connection.models || []).map((m) => ({ id: m.name, name: m.name, provider: "Ollama" }));
    const known = DEMO_MODELS.map((m) => ({ id: m.name, name: m.name, provider: "Ollama" }));
    const custom = (state.customModels || []).map((m) => ({ id: m.name, name: m.name, provider: m.kind || "Custom" }));
    const extras = MODEL_SEED.filter((m) => !m.model.includes(":")).map((m) => ({ id: m.model, name: m.model, provider: m.name }));
    const seen = new Set();
    return [...fromConn, ...known, ...custom, ...extras].filter((m) => {
      if (!m.name || seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    });
  }

  /* ============ LOOP ============ */
  function renderLoop() {
    const loop = state.loop;
    const model = state.settings.model || "qwen2.5-coder:1.5b";
    return `
      <div class="loop-screen">
        <div class="home-label"><span>Model Routing</span><a class="link" href="#/models">Modelle ${icon("arrow-right")}</a></div>
        <div class="routing-grid">
          <button class="routing-card" data-action="model-select" data-model-id="ollama" data-model-name="${esc(model)}" style="--accent:#8dff48">
            <span class="routing-icon">${icon("cpu")}</span>
            <span class="routing-copy"><strong>Ollama</strong><small>${esc(model)}</small></span>
            <span class="routing-signal"></span>
          </button>
          <button class="routing-card" data-action="open-chat" style="--accent:#b379ff">
            <span class="routing-icon">${icon("brain")}</span>
            <span class="routing-copy"><strong>DeepSeek</strong><small>Reasoning</small></span>
            <span class="routing-signal"></span>
          </button>
          <button class="routing-card" data-action="open-more" style="--accent:#8fbcff">
            <span class="routing-icon">${icon("github")}</span>
            <span class="routing-copy"><strong>Copilot</strong><small>Code Assist</small></span>
            <span class="routing-signal"></span>
          </button>
        </div>

        <div class="console-shell">
          <div class="console-head">
            <span class="console-title">${icon("terminal")} nexus@claw:~/NeinGames</span>
            <span class="badge ${loop.running ? (loop.paused ? "orange" : "green") : ""}" id="loopConsoleBadge"><span class="dot"></span> ${loop.running ? (loop.paused ? "Pausiert" : "Loop läuft") : "Autonomous Loop"}</span>
            <button class="icon-btn console-menu" data-action="loop-menu" aria-label="Loop-Menü">${icon("kebab")}</button>
          </div>
          <div class="console-body">
            <div class="loop-log" id="loopLog">${loopLogStages(loop)}</div>
            <div id="loopBanner">${loopBanner(loop)}</div>
            <div class="last-output">
              <div class="last-output-head">Letzte Ausgabe</div>
              <div class="last-output-line"><span class="out-check">${icon("check")}</span> <span>Commit: <b>feat: add game logic and test case</b></span></div>
              <div class="last-output-line"><span class="out-check">${icon("check")}</span> <span>Branch: <b>nexus-dev</b> · Tests: <b>10/10</b></span></div>
              <div class="last-output-line"><span class="out-check">${icon("check")}</span> <span>Audit: <b>${state.audit.length}</b> Ereignisse · Simulation</span></div>
            </div>
            <div class="console-prompt">
              <span class="prompt-user">nexus@claw</span><span class="prompt-path">:~/NeinGames</span><span class="prompt-caret"></span>
            </div>
          </div>
          <div class="keypad" aria-label="Terminal-Tastatur">
            <div class="key-row">${["ESC", "/", "-", "TAB", "CTRL", "↑"].map((k) => loopKey(k)).join("")}</div>
            <div class="key-row">${["TAB", "CTRL", "ALT", "ALT", "←", "↓", "→", "ENTER"].map((k) => loopKey(k, k === "ENTER" ? "enter" : "")).join("")}</div>
          </div>
        </div>
        <p class="field-hint loop-hint">Simulation ohne echte Codeausführung. Start, Pause und Stop über das Menü oben rechts.</p>
      </div>`;
  }

  function loopStageStatus(loop, index) {
    if (!loop.running && loop.progress <= 0) return "pending";
    const scaled = (loop.progress / 100) * LOOP_LOG_STAGES.length;
    if (scaled >= index + 1) return "done";
    if (scaled >= index) return "active";
    return "pending";
  }

  function loopLogStages(loop) {
    return LOOP_LOG_STAGES.map((stage, i) => {
      const status = loopStageStatus(loop, i);
      return `
        <div class="log-stage ${status}">
          <div class="log-stage-head">
            <span class="log-stage-title">${i + 1}. ${esc(stage.title)}</span>
            <span class="log-stage-state">${status === "done" ? `<span class="stage-check">${icon("check")}</span>` : status === "active" ? `<span class="stage-live">läuft</span>` : `<span class="stage-pending">—</span>`}</span>
            <span class="log-time">${esc(stage.time)}</span>
          </div>
          <div class="log-lines">
            ${stage.lines.map((line) => `
              <div class="log-line">
                <span class="log-tag">[${esc(line.tag)}]</span>
                <span class="log-text">${esc(line.text)}</span>
                ${line.end ? `<span class="log-end ${line.tone === "green" ? "ok" : ""}">${esc(line.end)}</span>` : ""}
              </div>`).join("")}
          </div>
        </div>`;
    }).join("");
  }

  function loopBanner(loop) {
    if (loop.progress >= 100) {
      return `<div class="loop-success">
        <span class="success-check">${icon("check")}</span>
        <span class="success-copy"><strong>Zyklus erfolgreich abgeschlossen!</strong><small>Simulation · keine echten Änderungen</small></span>
        <span class="success-cycle">${icon("refresh")} Zyklus ${loop.cycle}/${loop.total}</span>
      </div>`;
    }
    return `<div class="loop-progress">
      <div class="between"><span>Zyklus ${loop.cycle} / ${loop.total}</span><span>${Math.round(loop.progress)}%</span></div>
      <div class="loop-progress-bar"><i style="width:${loop.progress}%"></i></div>
    </div>`;
  }

  function loopKey(label, extra = "") {
    const action = label === "ENTER" ? "loop-menu" : "term-key";
    return `<button class="key ${extra}" data-action="${action}" data-key="${esc(label)}">${esc(label)}</button>`;
  }

  /* ============ PROJECTS ============ */
  function renderProjects() {
    const filter = state.ui.projectFilter;
    const counts = {
      alle: state.projects.length,
      aktiv: state.projects.filter((p) => p.status === "Aktiv" || p.status === "In Arbeit").length,
      archiv: state.projects.filter((p) => p.status === "Archiv").length
    };
    const list = state.projects.filter((p) => filter === "alle" ? true : filter === "archiv" ? p.status === "Archiv" : p.status === "Aktiv" || p.status === "In Arbeit");
    const statusBadge = (s) => s === "Aktiv" ? "green" : s === "In Arbeit" ? "orange" : s === "Pause" ? "purple" : "";
    return `
      ${pageHead("Projekte", "Arbeitsbereiche, Meilensteine und archivierte Experimente.", `<button class="btn primary sm" data-action="new-project">${icon("plus")} Neues Projekt</button>`)}
      <div class="project-filters">
        ${[["alle", "Alle", counts.alle], ["aktiv", "Aktiv", counts.aktiv], ["archiv", "Archiv", counts.archiv]].map(([key, label, count]) => `
          <button class="chip ${filter === key ? "active" : ""}" data-action="project-filter" data-value="${key}">${label} <span class="count">${count}</span></button>
        `).join("")}
      </div>
      <div class="project-grid">
        ${list.map((p) => `
          <button class="project-card" style="--accent:${p.accent}" data-action="project-open" data-project="${p.id}">
            <span class="project-icon">${icon(p.icon)}</span>
            <span class="project-copy">
              <strong>${esc(p.name)}</strong>
              <small>${esc(p.type)} · ${esc(p.language)}</small>
              <span class="project-meta">
                <span class="badge ${statusBadge(p.status)}">${esc(p.status)}</span>
                <span class="small muted">Geändert: ${esc(formatDate(p.updated))}</span>
              </span>
              <span class="project-progress"><i style="width:${p.progress}%"></i></span>
              <span class="project-foot"><span>${p.progress}% Fortschritt</span><span>${icon("chevron")}</span></span>
            </span>
          </button>`).join("")}
      </div>
      <div class="section-head"><h3>Projektübersicht</h3><span class="badge">${list.length} Einträge</span></div>
      <div class="panel pad">
        <table class="file-table">
          <thead><tr><th>Projekt</th><th>Status</th><th>Typ</th><th>Zuletzt</th><th></th></tr></thead>
          <tbody>
            ${list.map((p) => `<tr>
              <td><span class="file-name">${icon(p.icon)} ${esc(p.name)}</span></td>
              <td><span class="badge ${statusBadge(p.status)}">${esc(p.status)}</span></td>
              <td><span class="file-type">${esc(p.type)}</span></td>
              <td><span class="file-size">${esc(formatDate(p.updated))}</span></td>
              <td><button class="icon-btn sm" data-action="project-open" data-project="${p.id}" aria-label="Projekt öffnen">${icon("arrow-right")}</button></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* ============ MORE ============ */
  function renderMore() {
    const entries = Object.keys(ROUTES).filter((key) => key !== "home" && key !== "more");
    return `
      ${pageHead("Mehr", "Alle Module der NEXUS CLAW Steuerzentrale an einem Ort.", `<button class="btn ghost sm" data-action="search-open">${icon("search")} Suche</button>`)}
      <div class="panel more-banner">
        <span class="brand-mark"><svg viewBox="0 0 48 48"><path d="M8 38C12 27 16 18 23 8c-1 9-1 18 2 27"/><path d="M17 40c4-11 8-20 15-30-1 10-1 19 2 29"/><path d="M27 40c4-9 7-16 13-24-1 8-1 15 1 22"/></svg></span>
        <div class="grow"><h3>NEXUS CLAW V7.4.1</h3><p>Hybrid AI Office · lokaler Prototyp mit 8 Agentenprofilen und 8 Büroräumen.</p></div>
        <span class="badge green"><span class="dot"></span> Online</span>
      </div>
      <div class="more-grid">
        ${entries.map((key) => `
          <a class="more-card" href="#/${key}">
            <span class="launch-icon" style="--accent:#8dff48">${icon(NAV_ICONS[key])}</span>
            <strong>${esc(ROUTES[key].title)}</strong>
            <small>${esc(ROUTES[key].sub)}</small>
          </a>`).join("")}
      </div>`;
  }

  /* ============ AGENTS ============ */
  function renderAgents() {
    return `
      ${pageHead("KI-Agenten", "Profile organisieren Aufgaben und Rollen. Sie laufen nicht automatisch als acht unabhängige KI-Prozesse.", `
        <button class="btn ghost sm" data-action="open-tasks">${icon("check-square")} Aufgaben</button>
        <button class="btn primary sm" data-action="open-chat">${icon("chat")} Chat</button>
      `)}
      <div class="agent-grid">
        ${AGENT_SEED.map((a) => {
          const active = state.tasks.filter((t) => t.agent === a.id && t.status !== "erledigt").length;
          return `<div class="agent-card" style="--accent:${a.accent}">
            <div class="agent-top">
              <span class="agent-ava">${esc(a.code)}</span>
              <div class="grow"><strong>${esc(a.name)}</strong><div class="agent-role">${esc(a.role)}</div></div>
              <span class="badge ${a.status === "Aktiv" ? "green" : ""}">${esc(a.status)}</span>
            </div>
            <p class="agent-desc">${esc(a.desc)}</p>
            <div class="agent-stats"><span>${active} offene Aufgaben</span><span class="sep"></span><span>${esc(a.task)}</span></div>
            <div class="agent-actions">
              <button class="btn" data-action="chat-agent" data-agent="${a.id}">${icon("chat")} Chat</button>
              <button class="btn ghost" data-action="assign-agent" data-agent="${a.id}">${icon("plus")} Aufgabe</button>
            </div>
          </div>`;
        }).join("")}
      </div>`;
  }

  /* ============ ROOMS ============ */
  function renderRooms() {
    return `
      ${pageHead("Digitale Büroräume", "Acht thematische Arbeitsbereiche bilden die organisatorische Struktur des geplanten Agentensystems.")}
      <div class="room-grid">
        ${ROOM_SEED.map((r) => `
          <button class="room-card" style="--accent:${r.accent}" data-action="room-enter" data-room="${r.id}">
            <span class="room-num">RAUM ${esc(r.num)}</span>
            <h4>${esc(r.name)}</h4>
            <p>${esc(r.desc)}</p>
            <span class="room-foot">
              <span class="room-occupants">${r.occupants.map((o) => `<span>${esc(o)}</span>`).join("")}</span>
              <span class="room-enter">Betreten ${icon("arrow-right")}</span>
            </span>
          </button>`).join("")}
      </div>
      <div class="section-head"><h3>Raumbelegung</h3><span class="badge">8 Räume</span></div>
      <div class="panel pad">
        <div class="three-col">
          ${ROOM_SEED.slice(0, 6).map((r) => `<div class="between" style="padding:8px 0;border-bottom:1px dashed rgba(255,255,255,.05)"><span class="small"><span class="dot" style="display:inline-block;color:${r.accent};margin-right:7px"></span>${esc(r.name)}</span><span class="badge">${r.occupants.length} Agent</span></div>`).join("")}
        </div>
      </div>`;
  }

  /* ============ SKILLS ============ */
  function renderSkills() {
    const enabled = SKILL_SEED.filter((s) => state.skills[s.id]).length;
    return `
      ${pageHead("Skills", "Lokale und mitgelieferte Fähigkeiten. Aktivierung ist im Prototyp nur ein lokaler Schalter.", `
        <span class="badge green">${enabled} aktiv</span>
      `)}
      <div class="note-grid">
        ${SKILL_SEED.map((s) => {
          const on = !!state.skills[s.id];
          return `<div class="note-card" style="--accent:${on ? "#8dff48" : "#6f8989"}">
            <div class="between">
              <span class="badge ${on ? "green" : ""}">${esc(s.tag)}</span>
              <button class="switch ${on ? "on" : ""}" data-action="skill-toggle" data-skill="${s.id}" aria-label="${esc(s.name)} ${on ? "deaktivieren" : "aktivieren"}" aria-pressed="${on}"></button>
            </div>
            <h4 style="margin-top:10px">${esc(s.name)}</h4>
            <p>${esc(s.desc)}</p>
            <div class="note-foot"><span class="mono">${esc(s.source)}</span><span class="spacer"></span><span class="badge ${on ? "green" : ""}">${on ? "Aktiv" : "Inaktiv"}</span></div>
          </div>`;
        }).join("")}
      </div>`;
  }

  /* ============ LIBRARY ============ */
  function renderLibrary() {
    const q = state.ui.libraryQuery.toLowerCase();
    const files = LIBRARY_SEED.filter((f) => !q || f.name.toLowerCase().includes(q) || f.project.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));
    return `
      ${pageHead("Bibliothek", "Read-Only Dateibrowser. Keine Schreib-, Lösch- oder Ausführungsrechte im Prototyp.", `
        <span class="badge cyan">${icon("lock")} Read only</span>
      `)}
      <div class="library-toolbar">
        <div class="search-box">
          ${icon("search")}
          <input type="search" id="librarySearch" placeholder="Dateien filtern…" value="${esc(state.ui.libraryQuery)}" aria-label="Dateien filtern" />
        </div>
        <span class="badge">${files.length} Dateien</span>
        <span class="badge">${new Set(LIBRARY_SEED.map((f) => f.project)).size} Projekte</span>
      </div>
      <div class="panel">
        <table class="file-table">
          <thead><tr><th>Name</th><th>Typ</th><th>Größe</th><th>Projekt</th><th>Geändert</th><th></th></tr></thead>
          <tbody id="libraryRows">${fileRows(files)}</tbody>
        </table>
        ${files.length === 0 ? `<div class="empty">${icon("search")}<strong>Keine Dateien gefunden</strong><p>Passe den Filter an.</p></div>` : ""}
      </div>`;
  }

  function fileRows(files) {
    return files.map((f) => `<tr>
      <td><span class="file-name" style="--accent:${f.accent}">${icon(f.icon)} ${esc(f.name)}</span></td>
      <td><span class="file-type">${esc(f.type)}</span></td>
      <td><span class="file-size">${esc(f.size)}</span></td>
      <td><span class="small">${esc(f.project)}</span></td>
      <td><span class="file-size">${esc(f.updated)}</span></td>
      <td><button class="icon-btn sm" data-action="file-open" data-file="${f.id}" aria-label="${esc(f.name)} ansehen">${icon("eye")}</button></td>
    </tr>`).join("");
  }

  /* ============ TASKS ============ */
  function renderTasks() {
    const filter = state.ui.taskFilter;
    const tasks = state.tasks.filter((t) => filter === "alle" ? true : t.status === filter);
    const counts = {
      alle: state.tasks.length,
      offen: state.tasks.filter((t) => t.status === "offen").length,
      arbeit: state.tasks.filter((t) => t.status === "arbeit").length,
      erledigt: state.tasks.filter((t) => t.status === "erledigt").length
    };
    return `
      ${pageHead("Aufgaben", "Aufgaben erstellen, priorisieren und lokal in einer JSON-Struktur speichern.", `<button class="btn primary sm" data-action="new-task">${icon("plus")} Neue Aufgabe</button>`)}
      <div class="task-layout">
        <div>
          <div class="task-summary">
            <div class="task-sum" style="--c:var(--red)"><div class="n">${counts.offen}</div><div class="l">Offen</div></div>
            <div class="task-sum" style="--c:var(--orange)"><div class="n">${counts.arbeit}</div><div class="l">In Arbeit</div></div>
            <div class="task-sum" style="--c:var(--green)"><div class="n">${counts.erledigt}</div><div class="l">Erledigt</div></div>
          </div>
          <div class="task-filters">
            ${[["alle", "Alle", counts.alle], ["offen", "Offen", counts.offen], ["arbeit", "In Arbeit", counts.arbeit], ["erledigt", "Erledigt", counts.erledigt]].map(([key, label, count]) => `
              <button class="chip ${filter === key ? "active" : ""}" data-action="task-filter" data-value="${key}">${label} <span class="count">${count}</span></button>
            `).join("")}
          </div>
          <div class="panel">
            <div class="panel-body" style="padding:11px 12px">
              <div class="task-list" id="taskList">
                ${tasks.length ? tasks.map(taskRow).join("") : `<div class="empty">${icon("check-square")}<strong>Keine Aufgaben in diesem Filter</strong><p>Erstelle eine neue Aufgabe oder wechsle den Filter.</p></div>`}
              </div>
              <form class="quick-add" data-form="quick-task">
                <input class="input" name="quickTitle" placeholder="Aufgabe hinzufügen…" aria-label="Neue Aufgabe" required />
                <select class="select" name="quickPriority" aria-label="Priorität">
                  <option value="mittel">Mittel</option><option value="hoch">Hoch</option><option value="niedrig">Niedrig</option>
                </select>
                <button class="btn primary" type="submit" aria-label="Hinzufügen">${icon("plus")}</button>
              </form>
            </div>
          </div>
        </div>
        <div class="stack">
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("clipboard")} To-do-Tafel</div><span class="badge">${counts.alle}</span></div>
            <div class="panel-body">
              <div class="task-board">
                ${["offen", "arbeit", "erledigt"].map((key) => `
                  <div class="task-col">
                    <h5><span>${TASK_STATUS[key].label}</span><span class="count">${counts[key]}</span></h5>
                    ${state.tasks.filter((t) => t.status === key).map((t) => `
                      <div class="task-card">
                        <span class="prio" style="background:${PRIORITY[t.priority].color}"></span>${esc(t.title)}
                        <div class="small muted" style="margin-top:3px">${esc(agentById(t.agent)?.name || "–")}</div>
                      </div>`).join("") || `<p class="small muted">—</p>`}
                  </div>`).join("")}
              </div>
            </div>
          </div>
          <div class="panel pad">
            <div class="badge green">Lokale Speicherung</div>
            <p class="field-hint" style="margin-top:8px">Aufgaben liegen in <code>localStorage</code> und werden nicht automatisch zwischen Geräten synchronisiert.</p>
          </div>
        </div>
      </div>`;
  }

  function taskRow(t) {
    const agent = agentById(t.agent);
    return `<div class="task-row ${t.status === "erledigt" ? "done" : ""}">
      <button class="check-btn" data-action="toggle-task" data-task="${t.id}" aria-label="Aufgabe ${t.status === "erledigt" ? "öffnen" : "abschließen"}">${icon("check")}</button>
      <div class="task-main">
        <div class="task-name">${esc(t.title)}</div>
        <div class="task-sub">
          <span class="badge ${PRIORITY[t.priority].cls}">${esc(t.priority)}</span>
          <span><span class="agent-dot" style="background:${agent?.accent || "var(--green)"}"></span> ${esc(agent?.name || "–")}</span>
          <span>${esc(t.project || "Allgemein")}</span>
          <span>${esc(formatDate(t.due))}</span>
        </div>
      </div>
      <button class="icon-btn sm task-del" data-action="delete-task" data-task="${t.id}" aria-label="Aufgabe löschen">${icon("trash")}</button>
    </div>`;
  }

  /* ============ CHAT ============ */
  function renderChat() {
    const activeAgent = chatAgent();
    const connected = state.connection.status === "ok";
    const models = modelChoices();
    return `
      ${pageHead("Lokaler KI-Chat", "Anfragen gehen an das konfigurierte Ollama-Modell. Ohne Verbindung wird eine klar gekennzeichnete Demo-Antwort erzeugt.")}
      <div class="chat-layout">
        <div class="panel chat-side">
          <div class="panel-head"><div class="panel-title">${icon("chat")} Sitzungen</div><span class="badge">${AGENT_SEED.length + 1}</span></div>
          <button class="btn primary sm chat-new" data-action="new-chat">${icon("plus")} Neue Sitzung</button>
          <div class="convo-list">
            <div class="convo ${state.chat.agent === "nexus" ? "active" : ""}" data-action="chat-agent" data-agent="nexus">${icon("sparkles")} NEXUS Chat <span class="conv-meta">Standard</span></div>
            ${AGENT_SEED.map((a) => `<div class="convo ${state.chat.agent === a.id ? "active" : ""}" data-action="chat-agent" data-agent="${a.id}">${icon("users")} ${esc(a.name)} <span class="conv-meta">${esc(a.role.split(" ")[0])}</span></div>`).join("")}
          </div>
          <div style="padding:10px;border-top:1px solid var(--line)">
            <div class="conn-row ${connected ? "" : "err"}" style="font-size:10.5px;padding:7px 8px">${icon(connected ? "wifi" : "alert")} ${connected ? "Ollama verbunden" : "Demo-Modus"}</div>
          </div>
        </div>

        <div class="panel chat-main">
          <div class="chat-head">
            <span class="agent-ava" style="--accent:${activeAgent?.accent || "#8dff48"};color:${activeAgent?.accent || "#8dff48"}">${esc(activeAgent?.code || "NX")}</span>
            <div class="chat-head-copy">
              <strong id="chatAgentName">${esc(activeAgent?.name || "NEXUS Chat")}</strong>
              <small>${activeAgent ? esc(activeAgent.role) : "Lokale Chat-Schnittstelle"} · <span id="chatModelLabel">${esc(state.settings.model)}</span></small>
            </div>
            <span class="badge ${connected ? "green" : "orange"}" id="chatConnBadge">${connected ? "Lokal verbunden" : "Demo"}</span>
            <button class="icon-btn sm" data-action="clear-chat" aria-label="Chat leeren">${icon("trash")}</button>
          </div>
          <div class="chat-messages" id="chatMessages">${chatMessages()}</div>
          <div class="chat-composer">
            <form data-form="chat" id="chatForm">
              <div class="composer-box">
                <textarea id="chatInput" name="message" rows="1" placeholder="Nachricht an ${esc(activeAgent?.name || "NEXUS")} …" aria-label="Chat-Nachricht" ${ui.chatTyping ? "disabled" : ""}></textarea>
                <button class="btn primary" type="submit" id="chatSend" aria-label="Senden" ${ui.chatTyping ? "disabled" : ""}>${icon("send")}</button>
              </div>
              <div class="composer-meta">
                <span class="dot" style="color:${connected ? "var(--green)" : "var(--orange)"}"></span>
                <span>${connected ? "Ollama erreichbar · echte Generierung" : "Demo-Modus · keine echte Modellantwort"}</span>
                <span class="spacer"></span>
                <select class="select chat-select" id="chatModel" aria-label="Modell wählen">
                  ${models.map((m) => `<option value="${esc(m.name)}" ${m.name === state.settings.model ? "selected" : ""}>${esc(m.name)}</option>`).join("")}
                </select>
                <span class="kbd">Enter</span>
              </div>
            </form>
          </div>
        </div>
      </div>`;
  }

  function chatMessages() {
    if (!state.chat.messages.length) {
      return `<div class="empty">${icon("chat")}<strong>Neue Sitzung</strong><p>Stelle eine Frage an das lokale Modell.</p></div>`;
    }
    return state.chat.messages.map((m) => {
      const agent = m.role === "user" ? null : chatAgent();
      const initials = m.role === "user" ? "DU" : agent?.code || "NX";
      return `<div class="msg ${m.role}">
        <span class="msg-ava" ${agent ? `style="color:${agent.accent};border-color:${agent.accent}44;background:${agent.accent}11"` : ""}>${esc(initials)}</span>
        <div>
          <div class="msg-bubble">${formatMessage(m.text)}</div>
          <div class="msg-meta">${esc(m.time)}${m.demo ? ` · <span class="badge orange" style="font-size:8px;padding:1px 5px">Demo</span>` : m.model ? ` · ${esc(m.model)}` : ""}</div>
        </div>
      </div>`;
    }).join("") + (ui.chatTyping ? `<div class="msg"><span class="msg-ava">NX</span><div class="msg-bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>` : "");
  }

  function formatMessage(text) {
    let safe = esc(text);
    const blocks = [];
    safe = safe.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const idx = blocks.length;
      blocks.push(`<pre><code>${code.replace(/\n$/, "")}</code></pre>`);
      return `\u0000BLOCK${idx}\u0000`;
    });
    safe = safe.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    safe = safe.replace(/\u0000BLOCK(\d+)\u0000/g, (_, i) => blocks[Number(i)]);
    return safe.replace(/\n/g, "<br />");
  }

  function chatAgent() {
    if (state.chat.agent === "nexus") return null;
    return agentById(state.chat.agent) || null;
  }

  function scrollChat() {
    const el = $("#chatMessages");
    if (el) el.scrollTop = el.scrollHeight;
  }

  function refreshChat() {
    const msgs = $("#chatMessages");
    if (!msgs) return;
    msgs.innerHTML = chatMessages();
    scrollChat();
    const input = $("#chatInput");
    if (input) input.disabled = ui.chatTyping;
    const send = $("#chatSend");
    if (send) send.disabled = ui.chatTyping;
  }

  /* ============ NOTES ============ */
  function renderNotes() {
    const q = state.ui.noteQuery.toLowerCase();
    const notes = state.notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    return `
      ${pageHead("Notizen", "Notizen werden ausschließlich im Browser über localStorage gespeichert.", `<button class="btn primary sm" data-action="new-note">${icon("plus")} Neue Notiz</button>`)}
      <div class="library-toolbar">
        <div class="search-box">
          ${icon("search")}
          <input type="search" id="noteSearch" placeholder="Notizen durchsuchen…" value="${esc(state.ui.noteQuery)}" aria-label="Notizen durchsuchen" />
        </div>
        <span class="badge">${notes.length} Notizen</span>
        <span class="badge cyan">${icon("lock")} lokal</span>
      </div>
      <div class="note-grid" id="noteGrid">${noteCards(notes)}</div>`;
  }

  function noteCards(notes) {
    if (!notes.length) return `<div class="empty" style="grid-column:1/-1">${icon("note")}<strong>Keine Notizen gefunden</strong><p>Erstelle eine neue Notiz oder passe die Suche an.</p></div>`;
    return notes.map((n) => `<div class="note-card" style="--accent:${n.accent || "#8dff48"}">
      <div class="note-actions">
        <button class="icon-btn" data-action="edit-note" data-note="${n.id}" aria-label="Notiz bearbeiten">${icon("note")}</button>
        <button class="icon-btn" data-action="delete-note" data-note="${n.id}" aria-label="Notiz löschen">${icon("trash")}</button>
      </div>
      <h4>${esc(n.title)}</h4>
      <p>${esc(n.body)}</p>
      <div class="note-foot"><span class="dot" style="color:${n.accent || "var(--green)"}"></span><span>${relativeTime(n.updated)}</span><span class="spacer"></span><span>Local</span></div>
    </div>`).join("");
  }

  /* ============ SETTINGS ============ */
  function renderSettings() {
    const s = state.settings;
    const models = modelChoices();
    return `
      ${pageHead("Einstellungen", "Ollama, Darstellung, Sicherheitsgrenzen und lokale Limits.", `
        <button class="btn ghost sm" data-action="export-data">${icon("download")} Exportieren</button>
      `)}
      <div class="settings-grid">
        <div class="stack">
          <div class="panel">
            <div class="settings-section">
              <h4>${icon("cpu")} Allgemein</h4>
              <div class="setting-row">
                <div class="setting-copy"><strong>Ollama URL</strong><small>Adresse der lokalen Ollama-API</small></div>
                <input class="input mono" style="font-size:12px" data-setting="ollamaUrl" value="${esc(s.ollamaUrl)}" spellcheck="false" aria-label="Ollama URL" />
              </div>
              <div class="setting-row">
                <div class="setting-copy"><strong>Standardmodell</strong><small>Wird für neue Chat-Anfragen verwendet</small></div>
                <select class="select" data-setting="model" aria-label="Standardmodell">
                  ${models.map((m) => `<option value="${esc(m.name)}" ${m.name === s.model ? "selected" : ""}>${esc(m.name)}</option>`).join("")}
                </select>
              </div>
              <div class="setting-row">
                <div class="setting-copy"><strong>Sprache</strong><small>Oberflächensprache des Prototyps</small></div>
                <select class="select" data-setting="language" aria-label="Sprache">
                  <option value="de" ${s.language === "de" ? "selected" : ""}>Deutsch</option>
                  <option value="en" ${s.language === "en" ? "selected" : ""}>English (Vorschau)</option>
                </select>
              </div>
              <div class="setting-row">
                <div class="setting-copy"><strong>Theme</strong><small>Akzentfarbe des Dashboards</small></div>
                <select class="select" data-setting="theme" aria-label="Theme">
                  <option value="cyberpunk" ${s.theme === "cyberpunk" ? "selected" : ""}>Cyberpunk (Grün)</option>
                  <option value="plasma" ${s.theme === "plasma" ? "selected" : ""}>Plasma (Cyan)</option>
                  <option value="amber" ${s.theme === "amber" ? "selected" : ""}>Amber (Orange)</option>
                </select>
              </div>
            </div>

            <div class="settings-section">
              <h4>${icon("shield")} Sicherheit</h4>
              ${toggleSetting("Sicherheits-Controller", "Prüft Aktionen vor der Ausführung", "safety.controller", s.safety.controller)}
              ${toggleSetting("Autonomer Modus", "Erlaubt unbestätigte Loop-Schritte", "safety.autonomous", s.safety.autonomous)}
              ${toggleSetting("Code-Ausführung", "Shell- und Skriptausführung", "safety.codeExec", s.safety.codeExec)}
              ${toggleSetting("Netzwerkzugriff", "Externe Endpunkte verwenden", "safety.network", s.safety.network)}
              ${toggleSetting("Freigabe erforderlich", "Änderungen nur nach Bestätigung", "safety.release", s.safety.release)}
            </div>

            <div class="settings-section">
              <h4>${icon("sliders")} Limits</h4>
              <div class="setting-row">
                <div class="setting-copy"><strong>Mutationen pro Stunde</strong><small>Maximale Änderungen im Loop (Demo)</small></div>
                <div class="limit-row"><input class="input" type="number" min="1" max="200" data-setting="limits.mutations" value="${esc(s.limits.mutations)}" /><span class="muted small">/ h</span></div>
              </div>
              <div class="setting-row">
                <div class="setting-copy"><strong>Cooldown</strong><small>Wartezeit zwischen Zyklen (Demo)</small></div>
                <div class="limit-row"><input class="input" type="number" min="0" max="3600" data-setting="limits.cooldown" value="${esc(s.limits.cooldown)}" /><span class="muted small">s</span></div>
              </div>
            </div>
          </div>

          <div class="panel pad">
            <div class="between">
              <div><strong style="font-size:13px">Daten exportieren</strong><p class="field-hint">Aufgaben, Notizen, Einstellungen und Audit-Protokoll als JSON.</p></div>
              <button class="btn ghost sm" data-action="export-data">${icon("download")} JSON</button>
            </div>
            <hr class="hr" />
            <div class="between">
              <div><strong style="font-size:13px;color:var(--red)">Lokale Daten zurücksetzen</strong><p class="field-hint">Entfernt alle lokalen Zustände und stellt die Demo-Daten wieder her.</p></div>
              <button class="btn danger sm" data-action="reset-data">${icon("trash")} Reset</button>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="panel">
            <div class="panel-head"><div class="panel-title">${icon("radio")} Systemstatus</div><span class="badge green"><span class="dot"></span> Online</span></div>
            <div class="panel-body">
              <div class="session-row"><span class="session-dot"></span><span class="session-name">Frontend</span><span class="badge green">Bereit</span></div>
              <div class="session-row"><span class="session-dot ${state.connection.status === "ok" ? "" : "idle"}"></span><span class="session-name">Ollama</span><span class="badge ${state.connection.status === "ok" ? "green" : "orange"}">${state.connection.status === "ok" ? "Verbunden" : "Demo"}</span></div>
              <div class="session-row"><span class="session-dot ${state.loop.running ? "" : "idle"}"></span><span class="session-name">Loop</span><span class="badge ${state.loop.running ? "green" : ""}">${state.loop.running ? (state.loop.paused ? "Pausiert" : "Läuft") : "Bereit"}</span></div>
              <button class="btn block ghost sm" style="margin-top:10px" data-action="test-connection">${icon("refresh")} Verbindung testen</button>
            </div>
          </div>
          <div class="panel pad">
            <div class="badge cyan">Version</div>
            <h4 style="margin-top:9px;font-family:var(--font-brand);font-size:15px">NEXUS CLAW V7.4.1</h4>
            <p class="field-hint" style="margin-top:4px">Hybrid AI Office · Mobile Dashboard.<br />Funktionsfähiger Prototyp mit lokaler Demo-Persistenz.</p>
            <div class="hr"></div>
            <p class="field-hint">Dashboard-Port (optionales Flask-Backend): <span class="mono">5000</span><br />Ollama: <span class="mono">${esc(s.ollamaUrl)}</span></p>
          </div>
          <div class="panel pad">
            <div class="badge orange">Hinweis</div>
            <p class="field-hint" style="margin-top:8px">Sicherheits-Schalter sind im Prototyp rein lokal. Sie erzwingen keine echten Berechtigungen und ersetzen keine Sandbox.</p>
          </div>
        </div>
      </div>`;
  }

  function toggleSetting(label, hint, key, on) {
    return `<div class="setting-row">
      <div class="setting-copy"><strong>${esc(label)}</strong><small>${esc(hint)}</small></div>
      <button class="switch ${on ? "on" : ""}" data-action="toggle-setting" data-setting-key="${key}" aria-pressed="${on}" aria-label="${esc(label)} ${on ? "deaktivieren" : "aktivieren"}"></button>
    </div>`;
  }

  /* ============ AUDIT ============ */
  function renderAudit() {
    const filter = state.ui.auditFilter;
    const filters = ["alle", "mutation", "code", "test", "safety", "system"];
    const list = state.audit.filter((a) => filter === "alle" ? true : a.type === filter);
    return `
      ${pageHead("Audit-Protokoll", "Alle Ereignisse werden lokal gespeichert. Einträge entstehen durch Aktionen im Prototyp.", `<button class="btn danger sm" data-action="clear-audit">${icon("trash")} Leeren</button>`)}
      <div class="library-toolbar">
        ${filters.map((key) => `<button class="chip ${filter === key ? "active" : ""}" data-action="audit-filter" data-value="${key}">${key === "alle" ? "Alle" : key} <span class="count">${state.audit.filter((a) => key === "alle" ? true : a.type === key).length}</span></button>`).join("")}
        <span class="spacer"></span>
        <span class="badge green"><span class="dot"></span> Live</span>
      </div>
      <div class="panel">
        <div class="panel-body" id="auditFeed">
          <div class="audit-feed">
            ${list.length ? list.map((a) => {
              const style = AUDIT_STYLE[a.type] || AUDIT_STYLE.system;
              return `<div class="audit-item">
                <span class="audit-item-time">${esc(a.time)}</span>
                <span class="audit-icon" style="--evt:${style.color}">${icon(style.icon)}</span>
                <div class="audit-item-body"><strong>${esc(a.actor)}</strong> <span class="who">${esc(a.text)}</span></div>
                <span class="badge">${esc(a.type)}</span>
              </div>`;
            }).join("") : `<div class="empty">${icon("activity")}<strong>Keine Einträge</strong><p>Wähle einen anderen Filter.</p></div>`}
          </div>
        </div>
      </div>`;
  }

  /* ============ TERMINAL ============ */
  function renderTerminal() {
    return `
      ${pageHead("Terminal (Horus Linux)", "Simulierte Shell. Befehle werden nicht ausgeführt und verändern keine Dateien.", `
        <span class="badge orange">${icon("alert")} Nur Simulation</span>
      `)}
      <div class="terminal-wrap">
        <div class="terminal-head">
          <span class="term-dots"><span></span><span></span><span></span></span>
          <strong>nexus@horus: ~/NEXUS_V7</strong>
          <span class="badge green">verbunden</span>
        </div>
        <div class="terminal-body" id="terminalBody" tabindex="0">${terminalLines()}</div>
        <div class="term-keys">
          <button class="term-key" data-action="term-key" data-key="CTRL">CTRL</button>
          <button class="term-key" data-action="term-key" data-key="ALT">ALT</button>
          <button class="term-key" data-action="term-key" data-key="TAB">TAB</button>
          <button class="term-key" data-action="term-key" data-key="ESC">ESC</button>
          <button class="term-key" data-action="term-key" data-key="help">help</button>
          <button class="term-key" data-action="term-key" data-key="clear">clear</button>
          <span class="spacer"></span>
          <span class="badge">Horus Linux</span>
        </div>
      </div>
      <div class="section-head"><h3>Befehlsreferenz</h3><span class="badge">simuliert</span></div>
      <div class="three-col">
        ${terminalHelp().map((c) => `<div class="panel pad"><div class="mono text-green" style="font-size:12px">${esc(c.cmd)}</div><p class="field-hint" style="margin-top:5px">${esc(c.desc)}</p></div>`).join("")}
      </div>`;
  }

  function terminalLines() {
    return state.terminal.slice(-80).map((line) => {
      if (line.kind === "cmd") return `<div class="term-line"><span class="prompt">nexus@horus:~$</span> ${esc(line.text)}</div>`;
      const cls = line.kind === "sys" ? "cyan" : line.kind === "ok" ? "text-green" : line.kind === "warn" ? "yellow" : line.kind === "err" ? "red" : "dim";
      return `<div class="term-line ${cls}">${esc(line.text)}</div>`;
    }).join("") + `
      <form class="term-input-row" data-form="terminal">
        <span class="prompt">nexus@horus:~$</span>
        <input class="term-input" id="termInput" name="command" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal-Befehl" />
      </form>`;
  }

  function scrollTerminal() {
    const body = $("#terminalBody");
    if (body) body.scrollTop = body.scrollHeight;
  }

  function terminalHelp() {
    return [
      { cmd: "help", desc: "Zeigt diese Befehlsübersicht." },
      { cmd: "status", desc: "System-, Loop- und Verbindungsstatus." },
      { cmd: "ollama list", desc: "Simulierte Liste lokaler Modelle." },
      { cmd: "python server.py", desc: "Simulierter Start des Flask-Dashboards." },
      { cmd: "ls / neofetch", desc: "Projektdateien und Systeminfo." },
      { cmd: "clear", desc: "Leert das Terminal." }
    ];
  }

  /* ============ LOOP ENGINE ============ */
  function startLoop() {
    closeModal();
    if (state.loop.running && !state.loop.paused) {
      toast("Loop läuft bereits", "warn");
      return;
    }
    state.loop.running = true;
    state.loop.paused = false;
    if (state.loop.progress >= 100) {
      state.loop.progress = 0;
      state.loop.phaseIndex = 0;
    }
    addAudit("loop", "Simulation gestartet", "loop");
    save();
    ensureLoopTimer();
    refreshLoopDom();
    updateOnlinePill();
    toast("Loop-Simulation gestartet");
  }

  function pauseLoop() {
    closeModal();
    if (!state.loop.running) {
      toast("Loop ist nicht aktiv", "warn");
      return;
    }
    state.loop.paused = !state.loop.paused;
    addAudit("loop", state.loop.paused ? "Simulation pausiert" : "Simulation fortgesetzt", "loop");
    save();
    refreshLoopDom();
    updateOnlinePill();
    toast(state.loop.paused ? "Loop pausiert" : "Loop fortgesetzt");
  }

  function stopLoop() {
    closeModal();
    state.loop.running = false;
    state.loop.paused = false;
    state.loop.progress = 0;
    state.loop.phaseIndex = 0;
    addAudit("loop", "Simulation gestoppt und zurückgesetzt", "loop");
    save();
    refreshLoopDom();
    updateOnlinePill();
    toast("Loop gestoppt");
  }

  function ensureLoopTimer() {
    if (ui.loopTimer) return;
    ui.loopTimer = setInterval(() => {
      if (!state.loop.running || state.loop.paused) return;
      const step = 1 + Math.random() * 2.2;
      state.loop.progress = Math.min(100, state.loop.progress + step);
      state.loop.phaseIndex = Math.min(LOOP_PHASES.length - 1, Math.floor((state.loop.progress / 100) * LOOP_PHASES.length));
      if (state.loop.progress >= 100) {
        const completed = state.loop.cycle;
        state.loop.cycle = state.loop.cycle >= state.loop.total ? 1 : state.loop.cycle + 1;
        state.loop.progress = 0;
        state.loop.phaseIndex = 0;
        addAudit("loop", `Zyklus ${completed} abgeschlossen · nächster Zyklus ${state.loop.cycle}`, "loop");
        toast(`Zyklus ${completed} abgeschlossen (Simulation)`);
      }
      save();
      refreshLoopDom();
    }, 1200);
  }

  function refreshLoopDom() {
    const loop = state.loop;
    const pct = Math.max(0, Math.min(100, loop.progress));
    const C = 2 * Math.PI * 74;
    const ring = $("#loopRingProgress");
    if (ring) {
      ring.setAttribute("stroke-dashoffset", (C * (1 - pct / 100)).toFixed(1));
      ring.setAttribute("stroke-dasharray", C.toFixed(1));
    }
    const pctEl = $("#loopPct");
    if (pctEl) pctEl.textContent = `${Math.round(pct)} %`;
    const cycleEl = $("#loopCycle");
    if (cycleEl) cycleEl.textContent = `Zyklus ${loop.cycle} / ${loop.total}`;
    const stateEl = $("#loopState");
    if (stateEl) stateEl.textContent = loop.running ? (loop.paused ? "Pausiert" : "Simulation") : "Bereit";
    const stepsEl = $("#loopSteps");
    if (stepsEl) stepsEl.innerHTML = LOOP_PHASES.map((phase, i) => loopStep(phase, i, loop)).join("");
    const logEl = $("#loopLog");
    if (logEl) logEl.innerHTML = loopLogStages(loop);
    const bannerEl = $("#loopBanner");
    if (bannerEl) bannerEl.innerHTML = loopBanner(loop);
    const consoleBadge = $("#loopConsoleBadge");
    if (consoleBadge) {
      consoleBadge.className = `badge ${loop.running ? (loop.paused ? "orange" : "green") : ""}`;
      consoleBadge.innerHTML = `<span class="dot"></span> ${loop.running ? (loop.paused ? "Pausiert" : "Loop läuft") : "Autonomous Loop"}`;
    }
    const focusEl = $(".task-focus");
    if (focusEl) {
      const probe = document.createElement("div");
      probe.innerHTML = focusTaskPanel();
      focusEl.replaceWith(probe.firstElementChild);
    }
  }

  /* ============ OLLAMA CONNECTION ============ */
  async function testConnection() {
    if (ui.connectionTesting) return;
    ui.connectionTesting = true;
    const url = cleanUrl(state.settings.ollamaUrl);
    toast("Prüfe Ollama-Verbindung…");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(`${url}/api/tags`, { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const models = (data.models || []).map((m) => ({
        name: m.name,
        size: typeof m.size === "number" ? formatBytes(m.size) : m.size || "—",
        installed: true
      }));
      state.connection = { status: "ok", checkedAt: Date.now(), models: models.length ? models : DEMO_MODELS };
      addAudit("system", `Ollama verbunden · ${state.connection.models.length} Modelle`, "system");
      toast("Ollama-Verbindung erfolgreich");
    } catch (error) {
      state.connection = { status: "error", checkedAt: Date.now(), models: DEMO_MODELS, error: String(error?.message || error) };
      addAudit("system", "Ollama nicht erreichbar · Demo-Modus aktiv", "system");
      toast("Ollama nicht erreichbar – Demo-Modus aktiv", "err");
    } finally {
      clearTimeout(timeout);
      ui.connectionTesting = false;
      save();
      if (getRoute() === "models" || getRoute() === "chat" || getRoute() === "settings") renderRoute();
      else updateOnlinePill();
    }
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "—";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  }

  /* ============ CHAT LOGIC ============ */
  async function sendChat(rawText) {
    const text = String(rawText || "").trim();
    if (!text || ui.chatTyping) return;
    const input = $("#chatInput");
    if (input) input.value = "";
    state.chat.messages.push({ id: uid("m"), role: "user", text, time: clockNow() });
    save();
    ui.chatTyping = true;
    refreshChat();

    const agent = chatAgent();
    let reply;
    let demo = false;
    let model = state.settings.model;
    if (state.connection.status === "ok") {
      try {
        const response = await fetch(`${cleanUrl(state.settings.ollamaUrl)}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            prompt: text,
            stream: false,
            system: `Du bist ${agent ? agent.name : "NEXUS CLAW"}, ein lokaler KI-Agent im Hybrid AI Office. Antworte präzise auf Deutsch. Führe keine Codeänderungen aus.`
          })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        reply = String(data.response || "").trim();
        if (!reply) throw new Error("Leere Antwort");
      } catch (error) {
        demo = true;
        reply = demoReply(text, agent);
        addAudit("chat", `Ollama-Antwort fehlgeschlagen · Demo verwendet`, "chat");
        save();
      }
    } else {
      demo = true;
      await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 500));
      reply = demoReply(text, agent);
    }

    ui.chatTyping = false;
    state.chat.messages.push({ id: uid("m"), role: "assistant", text: reply, time: clockNow(), demo, model: demo ? "" : model });
    save();
    addAudit("chat", `Anfrage an ${model}`, agent?.name || "NEXUS");
    refreshChat();
  }

  function demoReply(prompt, agent) {
    const name = agent?.name || "NEXUS";
    const p = prompt.toLowerCase();
    if (/hallo|hi\b|hey|moin|servus/.test(p)) {
      return `${name} hier. Der Chat läuft im Demo-Modus, weil keine aktive Ollama-Verbindung erkannt wurde.\n\nIch kann dir trotzdem helfen, Aufgaben zu strukturieren. Prüfe in der Modellzentrale die Adresse ${state.settings.ollamaUrl} und starte Ollama mit \`OLLAMA_ORIGINS=*\` für Browser-Zugriff.`;
    }
    if (/test|prüf|verify/.test(p)) {
      return `Testplan (Demo)\n\n1. Ziel und Akzeptanzkriterien festhalten.\n2. Kleinsten reproduzierbaren Fall isolieren.\n3. Positiv- und Negativfälle prüfen.\n4. Ergebnis im Audit-Protokoll dokumentieren.\n\nHinweis: Dies ist eine simulierte Antwort. Für echte Modellantworten muss Ollama erreichbar sein.`;
    }
    if (/code|bug|fehler|refactor|funktion/.test(p)) {
      return `Analyse (Demo)\n\n• Änderung zuerst als kleinen, prüfbaren Diff planen.\n• Bestehende Tests vor der Änderung ausführen.\n• Fehlerursache dokumentieren, nicht nur Symptome beheben.\n• Freigabe einholen, bevor Code ausgeführt wird.\n\nBeispiel:\n\`\`\`python\ndef health():\n    return {"status": "ok"}\n\`\`\`\n\nDemo-Modus: Es wurde kein Modell aufgerufen.`;
    }
    if (/loop|zyklus/.test(p)) {
      return `Der Entwicklungs-Loop ist im Prototyp eine Simulation mit sieben Phasen: Analyse, Planung, Entwicklung, Tests, Fehlerbehebung, Dokumentation und Lernen.\n\nStart, Pause und Stop speichern nur einen Steuerzustand. Echte Codeänderungen, Sandbox-Ausführung und Testautomatisierung sind noch nicht implementiert.`;
    }
    return `Anfrage aufgenommen (Demo):\n\n„${prompt.slice(0, 220)}${prompt.length > 220 ? "…" : ""}“\n\nIch bin ${name}. Ohne erreichbare Ollama-Instanz kann ich keine echte Modellantwort erzeugen. Die Anfrage wurde lokal gespeichert und als Demo gekennzeichnet.`;
  }

  /* ============ MODALS ============ */
  function openModal({ title, eyebrow = "NEXUS CLAW", body, footer = "", wide = false }) {
    ui.modalReturnFocus = document.activeElement;
    $("#modalTitle").textContent = title;
    $("#modalEyebrow").textContent = eyebrow;
    $("#modalBody").innerHTML = body;
    $("#modalFoot").innerHTML = footer;
    const modal = $(".modal");
    if (modal) modal.style.width = wide ? "min(720px, 100%)" : "";
    $("#modalLayer").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const focusable = $("#modalBody input, #modalBody select, #modalBody textarea, #modalFoot button");
      if (focusable) focusable.focus();
    }, 40);
  }

  function closeModal() {
    $("#modalLayer").hidden = true;
    document.body.style.overflow = "";
    if (ui.modalReturnFocus && typeof ui.modalReturnFocus.focus === "function") {
      ui.modalReturnFocus.focus();
    }
    ui.modalReturnFocus = null;
  }

  function agentOptions(selected = "rick") {
    return AGENT_SEED.map((a) => `<option value="${a.id}" ${a.id === selected ? "selected" : ""}>${esc(a.name)} · ${esc(a.role)}</option>`).join("");
  }

  function openTaskModal(agentId = "rick", task = null) {
    const isEdit = !!task;
    openModal({
      title: isEdit ? "Aufgabe bearbeiten" : "Neue Aufgabe",
      eyebrow: "AUFGABENVERWALTUNG",
      body: `<form data-form="task" id="taskForm">
        <div class="form-grid">
          <div class="field full"><label for="taskTitle">Titel</label><input class="input" id="taskTitle" name="title" required maxlength="120" value="${esc(task?.title || "")}" placeholder="Was soll erledigt werden?" /></div>
          <div class="field"><label for="taskPriority">Priorität</label><select class="select" id="taskPriority" name="priority">
            ${["hoch", "mittel", "niedrig"].map((p) => `<option value="${p}" ${task?.priority === p ? "selected" : ""}>${p[0].toUpperCase() + p.slice(1)}</option>`).join("")}
          </select></div>
          <div class="field"><label for="taskAgent">Agent</label><select class="select" id="taskAgent" name="agent">${agentOptions(task?.agent || agentId)}</select></div>
          <div class="field"><label for="taskProject">Projekt</label><select class="select" id="taskProject" name="project">
            ${state.projects.map((p) => `<option value="${esc(p.name)}" ${task?.project === p.name ? "selected" : ""}>${esc(p.name)}</option>`).join("")}
          </select></div>
          <div class="field"><label for="taskDue">Fällig</label><input class="input" type="date" id="taskDue" name="due" value="${esc(task?.due || new Date().toISOString().slice(0, 10))}" /></div>
        </div>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="taskForm">${isEdit ? "Speichern" : "Anlegen"}</button>`,
      wide: true
    });
    if (isEdit) $("#taskForm").dataset.edit = task.id;
  }

  function openNoteModal(note = null) {
    openModal({
      title: note ? "Notiz bearbeiten" : "Neue Notiz",
      eyebrow: "LOCALSTORAGE",
      body: `<form data-form="note" id="noteForm">
        <div class="field"><label for="noteTitle">Titel</label><input class="input" id="noteTitle" name="title" required maxlength="100" value="${esc(note?.title || "")}" placeholder="Titel der Notiz" /></div>
        <div class="field" style="margin-top:12px"><label for="noteBody">Inhalt</label><textarea class="textarea" id="noteBody" name="body" rows="7" placeholder="Gedanken, Befehle, Entscheidungen…">${esc(note?.body || "")}</textarea></div>
        <div class="field" style="margin-top:12px"><label for="noteAccent">Akzent</label><select class="select" id="noteAccent" name="accent">
          <option value="#8dff48" ${note?.accent === "#8dff48" ? "selected" : ""}>Grün</option>
          <option value="#31d8ff" ${note?.accent === "#31d8ff" ? "selected" : ""}>Cyan</option>
          <option value="#b379ff" ${note?.accent === "#b379ff" ? "selected" : ""}>Violett</option>
          <option value="#ffa53c" ${note?.accent === "#ffa53c" ? "selected" : ""}>Orange</option>
        </select></div>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="noteForm">${note ? "Speichern" : "Anlegen"}</button>`
    });
    if (note) $("#noteForm").dataset.edit = note.id;
  }

  function openProjectModal() {
    openModal({
      title: "Neues Projekt",
      eyebrow: "ARBEITSBEREICHE",
      body: `<form data-form="project" id="projectForm">
        <div class="form-grid">
          <div class="field full"><label for="projectName">Name</label><input class="input" id="projectName" name="name" required maxlength="80" placeholder="Projektname" /></div>
          <div class="field"><label for="projectType">Typ</label><input class="input" id="projectType" name="type" placeholder="z. B. Python / Web" /></div>
          <div class="field"><label for="projectStatus">Status</label><select class="select" id="projectStatus" name="status"><option>Aktiv</option><option>In Arbeit</option><option>Pause</option><option>Archiv</option></select></div>
          <div class="field full"><label for="projectDesc">Beschreibung</label><input class="input" id="projectDesc" name="desc" maxlength="160" placeholder="Kurzbeschreibung" /></div>
        </div>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="projectForm">Anlegen</button>`,
      wide: true
    });
  }

  function openModelModal() {
    openModal({
      title: "Neues Modell",
      eyebrow: "MODELLZENTRALE",
      body: `<form data-form="model" id="modelForm">
        <div class="form-grid">
          <div class="field full"><label for="modelName">Modellname</label><input class="input mono" id="modelName" name="name" required placeholder="z. B. mistral:7b" /></div>
          <div class="field"><label for="modelKind">Typ</label><select class="select" id="modelKind" name="kind"><option>Ollama</option><option>OpenAI-kompatibel</option><option>Lokal</option><option>Custom</option></select></div>
          <div class="field"><label for="modelBase">Basis-URL</label><input class="input mono" id="modelBase" name="base" placeholder="http://127.0.0.1:11434" /></div>
          <div class="field full"><label for="modelNote">Notiz</label><input class="input" id="modelNote" name="note" placeholder="Verwendungszweck (optional)" /></div>
        </div>
        <p class="field-hint" style="margin-top:10px">Modelle werden lokal registriert. Installation und Download erfolgen außerhalb des Prototyps über <span class="mono">ollama pull</span>.</p>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="modelForm">Hinzufügen</button>`,
      wide: true
    });
  }

  function openLaunchModal(providerId) {
    const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
    const model = MODEL_SEED.find((m) => m.id === providerId);
    openModal({
      title: `${provider.name} starten`,
      eyebrow: "AGENT STARTEN",
      body: `<form data-form="launch" id="launchForm" data-provider="${provider.id}">
        <div class="row" style="gap:12px">
          <span class="launch-icon" style="--accent:${provider.accent};width:46px;height:46px">${icon(provider.icon)}</span>
          <div><strong style="font-size:15px">${esc(provider.name)}</strong><div class="small muted">${esc(provider.sub)}</div></div>
          <span class="badge green" style="margin-left:auto">Bereit</span>
        </div>
        <hr class="hr" />
        <div class="form-grid">
          <div class="field"><label for="launchAgent">Agent-Profil</label><select class="select" id="launchAgent" name="agent">${agentOptions(provider.agent)}</select></div>
          <div class="field"><label for="launchModel">Modell</label><select class="select" id="launchModel" name="model">${modelChoices().map((m) => `<option value="${esc(m.name)}" ${m.name === (model?.model || state.settings.model) ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></div>
          <div class="field full"><label for="launchTask">Startauftrag</label><input class="input" id="launchTask" name="task" value="${esc(AGENT_SEED.find((a) => a.id === provider.agent)?.task || "")}" /></div>
        </div>
        <p class="field-hint" style="margin-top:11px">Der Prototyp startet eine simulierte Sitzung. Es werden keine Prozesse ausgeführt und keine Dateien verändert.</p>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="launchForm">${icon("play")} Sitzung starten</button>`,
      wide: true
    });
  }

  function openSessionModal(id) {
    const session = state.sessions.find((s) => s.id === id);
    if (!session) return;
    const agent = AGENT_SEED.find((a) => session.name.toLowerCase().includes(a.name.toLowerCase()));
    openModal({
      title: session.name,
      eyebrow: "SITZUNG · MANAGE",
      body: `<div class="row" style="gap:12px">
          <span class="session-dot ${session.status === "Läuft" ? "" : "idle"}" style="width:11px;height:11px"></span>
          <div><strong>${esc(session.status)}</strong><div class="small muted">Gestartet ${esc(session.started)} · Simulation</div></div>
          <span class="badge ${session.status === "Läuft" ? "green" : ""}" style="margin-left:auto">${esc(session.status)}</span>
        </div>
        <hr class="hr" />
        <div class="session-detail-grid">
          <div class="panel pad"><div class="small muted">Agent</div><strong>${esc(agent?.name || "NEXUS")}</strong></div>
          <div class="panel pad"><div class="small muted">Modell</div><strong>${esc(state.settings.model)}</strong></div>
        </div>
        <div class="manage-actions">
          <button class="btn" data-action="open-terminal">${icon("terminal")} Terminal</button>
          <button class="btn" data-action="open-chat">${icon("chat")} Chat</button>
        </div>
        <p class="field-hint" style="margin-top:10px">Sitzungen sind simulierte Einträge. Es laufen keine echten Prozesse.</p>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button><button class="btn danger" data-action="end-session" data-session="${session.id}">${icon("stop")} Sitzung beenden</button>`
    });
  }

  function endSession(id) {
    const session = state.sessions.find((s) => s.id === id);
    if (!session) return;
    state.sessions = state.sessions.filter((s) => s.id !== id);
    addAudit("system", `Sitzung beendet: ${session.name}`, "session");
    save();
    closeModal();
    renderRoute();
    toast(`Sitzung beendet: ${session.name}`);
  }

  function openLoopMenu() {
    const loop = state.loop;
    openModal({
      title: "Autonomous Loop",
      eyebrow: "LOOP · STEUERUNG",
      body: `<div class="row" style="gap:12px">
          <span class="badge ${loop.running ? (loop.paused ? "orange" : "green") : ""}"><span class="dot"></span> ${loop.running ? (loop.paused ? "Pausiert" : "Läuft") : "Bereit"}</span>
          <span class="mono small" style="margin-left:auto">Zyklus ${loop.cycle}/${loop.total} · ${Math.round(loop.progress)}%</span>
        </div>
        <div class="loop-menu-actions">
          <button class="btn primary" data-action="loop-start">${icon("play")} Start</button>
          <button class="btn" data-action="loop-pause">${icon("pause")} ${loop.paused ? "Fortsetzen" : "Pause"}</button>
          <button class="btn danger" data-action="loop-stop">${icon("stop")} Stop</button>
        </div>
        <p class="field-hint" style="margin-top:12px">Die Simulation verändert keine Dateien. Jede Aktion wird lokal im Audit-Protokoll gespeichert.</p>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button>`
    });
  }

  function openProjectDetail(id) {
    const p = state.projects.find((x) => x.id === id);
    if (!p) return;
    openModal({
      title: p.name,
      eyebrow: "PROJEKTDETAILS",
      body: `<div class="row" style="gap:12px"><span class="project-icon" style="--accent:${p.accent};width:46px;height:46px">${icon(p.icon)}</span><div><strong>${esc(p.type)}</strong><div class="small muted">${esc(p.language)}</div></div><span class="badge ${p.status === "Aktiv" ? "green" : p.status === "In Arbeit" ? "orange" : ""}" style="margin-left:auto">${esc(p.status)}</span></div>
        <p class="field-hint" style="margin-top:14px">${esc(p.desc)}</p>
        <hr class="hr" />
        <div class="between"><span class="small muted">Fortschritt</span><span class="mono small">${p.progress}%</span></div>
        <div class="project-progress" style="--accent:${p.accent}"><i style="width:${p.progress}%"></i></div>
        <div class="grid" style="margin-top:14px;grid-template-columns:1fr 1fr">
          <div class="panel pad"><div class="small muted">Zuletzt geändert</div><strong>${esc(formatDate(p.updated))}</strong></div>
          <div class="panel pad"><div class="small muted">Offene Aufgaben</div><strong>${state.tasks.filter((t) => t.project === p.name && t.status !== "erledigt").length}</strong></div>
        </div>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button><button class="btn primary" data-action="project-task" data-project="${p.id}">${icon("plus")} Aufgabe</button>`
    });
  }

  function openFileModal(id) {
    const f = LIBRARY_SEED.find((x) => x.id === id);
    if (!f) return;
    openModal({
      title: f.name,
      eyebrow: "BIBLIOTHEK · READ ONLY",
      body: `<div class="row"><span class="project-icon" style="--accent:${f.accent}">${icon(f.icon)}</span><div><strong>${esc(f.type)}</strong><div class="small muted">${esc(f.project)} · ${esc(f.size)}</div></div><span class="badge cyan" style="margin-left:auto">${icon("lock")} Read only</span></div>
        <div class="terminal-wrap" style="margin-top:14px"><div class="terminal-head"><strong>Vorschau</strong><span class="badge">${esc(f.type)}</span></div><div class="terminal-body" style="height:200px">${filePreview(f)}</div></div>
        <p class="field-hint" style="margin-top:10px">Die Datei ist im Prototyp nicht lesbar. Diese Vorschau ist ein statischer Platzhalter.</p>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button>`
    });
  }

  function filePreview(f) {
    if (f.type === "Python") return `<div class="term-line dim"># ${f.name}</div><div class="term-line"><span class="cyan">from</span> flask <span class="cyan">import</span> Flask</div><div class="term-line">app = Flask(__name__)</div><div class="term-line"></div><div class="term-line">@app.get(<span class="yellow">"/api/status"</span>)</div><div class="term-line"><span class="cyan">def</span> status():</div><div class="term-line">    <span class="cyan">return</span> {<span class="yellow">"ok"</span>: <span class="cyan">True</span>}</div>`;
    if (f.type === "C#") return `<div class="term-line dim">// ${f.name}</div><div class="term-line"><span class="cyan">public class</span> GameLogic : MonoBehaviour</div><div class="term-line">{</div><div class="term-line">    <span class="cyan">void</span> Update() { }</div><div class="term-line">}</div>`;
    if (f.type === "Bash") return `<div class="term-line dim">#!/usr/bin/env bash</div><div class="term-line">set -euo pipefail</div><div class="term-line">echo <span class="yellow">"Horus Tools"</span></div>`;
    if (f.type === "Markdown") return `<div class="term-line cyan"># ${f.name}</div><div class="term-line dim">Dokumentation · ${f.project}</div><div class="term-line">- Lokale Verarbeitung bevorzugen.</div><div class="term-line">- Änderungen vor Ausführung prüfen.</div>`;
    return `<div class="term-line dim">&lt;${esc(f.type)}-Vorschau nicht verfügbar&gt;</div>`;
  }

  function openSearchModal() {
    openModal({
      title: "Suche",
      eyebrow: "NEXUS CLAW",
      body: `<div class="search-box" style="width:100%">${icon("search")}<input type="search" id="searchModalInput" placeholder="Bereiche, Aufgaben, Notizen, Projekte…" aria-label="Suche" autocomplete="off" /></div><div id="searchResults" style="margin-top:14px"></div>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button>`,
      wide: true
    });
    renderSearchResults("");
    setTimeout(() => { $("#searchModalInput")?.focus(); }, 50);
  }

  function searchIndex() {
    const items = Object.entries(ROUTES).map(([key, meta]) => ({ label: meta.title, sub: meta.sub, href: `#/${key}`, ic: NAV_ICONS[key], kind: "Bereich" }));
    state.tasks.forEach((t) => items.push({ label: t.title, sub: `Aufgabe · ${agentById(t.agent)?.name || "–"} · ${t.priority}`, href: "#/tasks", ic: "check-square", kind: "Aufgabe" }));
    state.notes.forEach((n) => items.push({ label: n.title, sub: `Notiz · ${relativeTime(n.updated)}`, href: "#/notes", ic: "note", kind: "Notiz" }));
    state.projects.forEach((p) => items.push({ label: p.name, sub: `Projekt · ${p.status} · ${p.type}`, href: "#/projects", ic: p.icon, kind: "Projekt" }));
    AGENT_SEED.forEach((a) => items.push({ label: a.name, sub: `Agent · ${a.role}`, href: "#/agents", ic: "users", kind: "Agent" }));
    return items;
  }

  function renderSearchResults(query) {
    const el = $("#searchResults");
    if (!el) return;
    const q = query.trim().toLowerCase();
    const results = (q ? searchIndex().filter((x) => `${x.label} ${x.sub} ${x.kind}`.toLowerCase().includes(q)) : searchIndex().filter((x) => x.kind === "Bereich")).slice(0, 10);
    el.innerHTML = results.length ? `<div class="stack">${results.map((r) => `<a class="more-card" style="flex-direction:row;align-items:center;gap:10px" href="${r.href}" data-action="search-result">${icon(r.ic)}<span class="grow"><strong style="font-size:13px">${esc(r.label)}</strong><small>${esc(r.sub)}</small></span><span class="badge">${esc(r.kind)}</span></a>`).join("")}</div>` : `<div class="empty">${icon("search")}<strong>Keine Treffer</strong><p>Versuche einen anderen Begriff.</p></div>`;
  }

  /* ============ TERMINAL COMMANDS ============ */
  function pushTerm(kind, text) {
    state.terminal.push({ kind, text });
    state.terminal = state.terminal.slice(-100);
  }

  function runTerminalCommand(raw) {
    const cmd = String(raw || "").trim();
    if (!cmd) return;
    pushTerm("cmd", cmd);
    const [base, ...args] = cmd.split(/\s+/);
    const command = base.toLowerCase();
    if (command === "clear") {
      state.terminal = [];
      save();
      renderRoute();
      return;
    }
    if (command === "help") {
      pushTerm("ok", "Verfügbare Befehle:");
      terminalHelp().forEach((h) => pushTerm("dim", `  ${h.cmd.padEnd(18)} ${h.desc}`));
    } else if (command === "ls" || command === "dir") {
      pushTerm("ok", "NEXUS_V7/   Unity_Game/   KI_Modelle/   Horus_Tools/   Experimente/");
      pushTerm("dim", "app.py  agent_orchestrator.py  loop_engine.py  README.md  requirements.txt");
    } else if (command === "pwd") {
      pushTerm("ok", "/home/nexus/NEXUS_V7");
    } else if (command === "whoami") {
      pushTerm("ok", "nexus");
    } else if (command === "date") {
      pushTerm("ok", new Date().toLocaleString("de-DE"));
    } else if (command === "uptime") {
      pushTerm("ok", `up 4 hours, 12 minutes · load average: 0.18, 0.11, 0.07`);
    } else if (command === "neofetch") {
      pushTerm("sys", "       NEXUS // HORUS LINUX");
      pushTerm("dim", "  OS:       Horus Linux 7.4 (proot)");
      pushTerm("dim", "  Shell:    bash 5.2 (simuliert)");
      pushTerm("dim", "  Host:     Android / Termux");
      pushTerm("dim", "  Model:    qwen2.5-coder:1.5b");
      pushTerm("dim", "  Agents:   8 Profile · 0 autonome Prozesse");
    } else if (command === "status") {
      pushTerm("sys", "SYSTEM STATUS");
      pushTerm("ok", `  Frontend:  bereit`);
      pushTerm("ok", `  Loop:      ${state.loop.running ? (state.loop.paused ? "pausiert" : "läuft") : "bereit"} · Zyklus ${state.loop.cycle}/${state.loop.total} · ${Math.round(state.loop.progress)}%`);
      pushTerm(state.connection.status === "ok" ? "ok" : "warn", `  Ollama:    ${state.connection.status === "ok" ? "verbunden" : "Demo-Modus"} · ${state.settings.ollamaUrl}`);
      pushTerm("dim", `  Aufgaben:  ${state.tasks.filter((t) => t.status !== "erledigt").length} offen`);
    } else if (command === "ollama") {
      if ((args[0] || "").toLowerCase() === "list") {
        pushTerm("sys", "NAME                        ID              SIZE      MODIFIED");
        pushTerm("ok", "qwen2.5-coder:1.5b          a1b2c3d4     1.0 GB    2 days ago");
        pushTerm("ok", "deepseek-r1:1.5b            4d3e2f1a     1.1 GB    3 days ago");
        pushTerm("ok", "llama3:8b                   e5f6a7b8     4.7 GB    5 days ago");
        pushTerm("dim", "Hinweis: simulierte Ausgabe.");
      } else if ((args[0] || "").toLowerCase() === "ps") {
        pushTerm("warn", "Kein laufendes Modell · Simulation.");
      } else {
        pushTerm("warn", "Verwendung: ollama list | ollama ps");
      }
    } else if (command === "python" || command === "flask") {
      if (cmd.includes("server.py") || cmd.includes("app.py")) {
        pushTerm("sys", " * Serving Flask app 'server'");
        pushTerm("sys", " * Running on http://127.0.0.1:5000");
        pushTerm("warn", "SIMULATION: Es wird kein Prozess gestartet.");
        addAudit("system", "Simulierter Serverstart im Terminal", "terminal");
      } else {
        pushTerm("dim", "Python 3.12.3 (simuliert)");
      }
    } else if (command === "cat") {
      if ((args[0] || "").toLowerCase() === "readme.md") {
        pushTerm("ok", "# NEXUS CLAW V7.4.1");
        pushTerm("dim", "Hybrid AI Office · lokale Verarbeitung bevorzugen.");
        pushTerm("dim", "Dashboard-Prototyp ohne autonome Codeausführung.");
      } else {
        pushTerm("err", `cat: ${args[0] || "Datei"}: Datei nicht lesbar (Read-Only-Prototyp)`);
      }
    } else if (command === "open") {
      const target = (args[0] || "").replace("#/", "");
      if (ROUTES[target]) {
        pushTerm("ok", `Öffne ${ROUTES[target].title}…`);
        save();
        navigate(target);
        return;
      }
      pushTerm("err", "Unbekannter Bereich. Nutze help oder open home.");
    } else if (command === "echo") {
      pushTerm("ok", args.join(" "));
    } else if (command === "sudo") {
      pushTerm("err", "sudo ist im Prototyp deaktiviert. Keine Codeausführung.");
    } else {
      pushTerm("err", `${base}: Befehl nicht gefunden (Simulation). Tippe "help".`);
    }
    save();
    renderRoute();
  }

  /* ============ ACTIONS ============ */
  function toggleTask(id) {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    t.status = t.status === "erledigt" ? "offen" : "erledigt";
    addAudit("test", `${t.title} · ${t.status === "erledigt" ? "erledigt" : "wieder geöffnet"}`, agentById(t.agent)?.name || "system");
    save();
    renderRoute();
    toast(t.status === "erledigt" ? "Aufgabe abgeschlossen" : "Aufgabe wieder geöffnet");
  }

  function deleteTask(id) {
    const t = state.tasks.find((x) => x.id === id);
    state.tasks = state.tasks.filter((x) => x.id !== id);
    if (t) addAudit("note", `Aufgabe entfernt: ${t.title}`, "tasks");
    save();
    renderRoute();
    toast("Aufgabe gelöscht");
  }

  function deleteNote(id) {
    const n = state.notes.find((x) => x.id === id);
    state.notes = state.notes.filter((x) => x.id !== id);
    if (n) addAudit("note", `Notiz entfernt: ${n.title}`, "notes");
    save();
    renderRoute();
    toast("Notiz gelöscht");
  }

  function openRoomModal(id) {
    const r = ROOM_SEED.find((x) => x.id === id);
    if (!r) return;
    openModal({
      title: r.name,
      eyebrow: `RAUM ${r.num}`,
      body: `<p class="field-hint">${esc(r.desc)}</p>
        <div class="row" style="margin-top:14px"><span class="badge cyan">${r.occupants.length} Agent</span>${r.occupants.map((o) => `<span class="agent-ava" style="width:28px;height:28px;font-size:9px;--accent:${r.accent};color:${r.accent}">${esc(o)}</span>`).join("")}</div>
        <hr class="hr" />
        <div class="small muted">Der Raum ist im Prototyp eine organisatorische Zuordnung. Es läuft kein eigener Prozess.</div>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button><button class="btn primary" data-action="room-chat" data-room="${r.id}">${icon("chat")} Raum-Chat</button>`
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nexus-claw-v741-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    addAudit("system", "Lokale Daten exportiert", "settings");
    save();
    toast("Export erstellt");
  }

  function confirmModal(title, text, action, label = "Bestätigen") {
    openModal({
      title,
      eyebrow: "BESTÄTIGUNG",
      body: `<p class="field-hint">${esc(text)}</p>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn danger" data-action="${action}">${icon("alert")} ${esc(label)}</button>`
    });
  }

  function handleAction(action, el) {
    switch (action) {
      case "close-modal": closeModal(); break;
      case "open-more": navigate("more"); break;
      case "open-profile": navigate("settings"); break;
      case "open-terminal": closeModal(); navigate("terminal"); break;
      case "open-library": closeModal(); navigate("library"); break;
      case "open-chat": closeModal(); navigate("chat"); break;
      case "open-tasks": closeModal(); navigate("tasks"); break;
      case "open-settings": closeModal(); navigate("settings"); break;
      case "search-open": openSearchModal(); break;
      case "search-result": closeModal(); break;
      case "launch": openLaunchModal(el.dataset.provider); break;
      case "session-manage": openSessionModal(el.dataset.session); break;
      case "end-session": endSession(el.dataset.session); break;
      case "loop-menu": openLoopMenu(); break;
      case "term-key": toast(`Taste ${el.dataset.key} · Terminal-Tastatur (Demo)`); break;
      case "new-task": openTaskModal(); break;
      case "new-note": openNoteModal(); break;
      case "new-project": openProjectModal(); break;
      case "new-model": openModelModal(); break;
      case "toggle-task": toggleTask(el.dataset.task); break;
      case "delete-task": deleteTask(el.dataset.task); break;
      case "task-filter": state.ui.taskFilter = el.dataset.value; save(); renderRoute(); break;
      case "project-filter": state.ui.projectFilter = el.dataset.value; save(); renderRoute(); break;
      case "project-open": openProjectDetail(el.dataset.project); break;
      case "project-task": {
        const p = state.projects.find((x) => x.id === el.dataset.project);
        openTaskModal();
        if (p) { const sel = $("#taskProject"); if (sel) sel.value = p.name; }
        break;
      }
      case "edit-note": openNoteModal(state.notes.find((n) => n.id === el.dataset.note)); break;
      case "delete-note": confirmModal("Notiz löschen", "Diese Notiz wird dauerhaft aus dem lokalen Speicher entfernt.", "confirm-delete-note", "Löschen"); ui.pendingDelete = el.dataset.note; break;
      case "confirm-delete-note": deleteNote(ui.pendingDelete); ui.pendingDelete = null; closeModal(); break;
      case "file-open": openFileModal(el.dataset.file); break;
      case "chat-agent": {
        state.chat.agent = el.dataset.agent;
        save();
        closeModal();
        if (getRoute() === "chat") renderRoute();
        else navigate("chat");
        const a = agentById(el.dataset.agent);
        toast(a ? `Chat mit ${a.name}` : "NEXUS Chat geöffnet");
        break;
      }
      case "assign-agent": openTaskModal(el.dataset.agent); break;
      case "room-enter": openRoomModal(el.dataset.room); break;
      case "room-chat": closeModal(); navigate("chat"); toast("Raum-Chat geöffnet (simuliert)"); break;
      case "skill-toggle": {
        const id = el.dataset.skill;
        state.skills[id] = !state.skills[id];
        const s = SKILL_SEED.find((x) => x.id === id);
        addAudit("system", `Skill ${state.skills[id] ? "aktiviert" : "deaktiviert"}: ${s?.name || id}`, "skills");
        save();
        renderRoute();
        toast(`Skill ${state.skills[id] ? "aktiviert" : "deaktiviert"}`);
        break;
      }
      case "audit-filter": state.ui.auditFilter = el.dataset.value; save(); renderRoute(); break;
      case "clear-audit": confirmModal("Audit-Protokoll leeren", "Alle lokalen Audit-Einträge werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.", "confirm-clear-audit", "Leeren"); break;
      case "confirm-clear-audit": state.audit = []; save(); closeModal(); renderRoute(); toast("Audit-Protokoll geleert"); break;
      case "clear-chat": confirmModal("Chat leeren", "Der lokale Chatverlauf wird entfernt. Die Sitzung bleibt bestehen.", "confirm-clear-chat", "Leeren"); break;
      case "confirm-clear-chat": resetChat(); closeModal(); break;
      case "new-chat": resetChat(); toast("Neue Sitzung gestartet"); break;
      case "loop-start": startLoop(); break;
      case "loop-pause": pauseLoop(); break;
      case "loop-stop": stopLoop(); break;
      case "test-connection": testConnection(); break;
      case "model-select": {
        const id = el.dataset.modelId;
        const name = el.dataset.modelName;
        state.settings.model = name;
        addAudit("model", `Standardmodell → ${name}`, "model");
        save();
        renderRoute();
        toast(`Modell gesetzt: ${name}`);
        break;
      }
      case "toggle-setting": {
        const path = el.dataset.settingKey;
        const parts = path.split(".");
        let obj = state.settings;
        for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
        obj[parts[parts.length - 1]] = !obj[parts[parts.length - 1]];
        addAudit("safety", `${path} → ${obj[parts[parts.length - 1]] ? "an" : "aus"}`, "settings");
        save();
        renderRoute();
        toast("Einstellung gespeichert");
        break;
      }
      case "reset-data": confirmModal("Lokale Daten zurücksetzen", "Alle Aufgaben, Notizen, Sitzungen und Einstellungen werden durch die Demo-Daten ersetzt.", "confirm-reset", "Zurücksetzen"); break;
      case "confirm-reset": {
        state = freshState();
        applyTheme();
        save();
        closeModal();
        buildNav();
        renderRoute();
        toast("Demo-Daten wiederhergestellt");
        break;
      }
      case "export-data": exportData(); break;
      case "term-key": {
        const key = el.dataset.key;
        if (key === "help" || key === "clear") runTerminalCommand(key);
        else toast(`${key} ist im Prototyp ohne Funktion`, "warn");
        break;
      }
      default: break;
    }
  }

  function resetChat() {
    state.chat.messages = [{
      id: uid("m"),
      role: "assistant",
      text: "Neue Sitzung gestartet. Stelle eine Frage oder wähle links ein Agentenprofil.",
      time: clockNow(),
      demo: true
    }];
    save();
    renderRoute();
  }

  /* ============ FORMS ============ */
  function handleForm(form) {
    const type = form.dataset.form;
    if (type === "task") {
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      if (!title) return;
      const editId = form.dataset.edit;
      if (editId) {
        const t = state.tasks.find((x) => x.id === editId);
        if (t) Object.assign(t, { title, priority: data.get("priority"), agent: data.get("agent"), project: data.get("project"), due: data.get("due") });
        addAudit("note", `Aufgabe aktualisiert: ${title}`, "tasks");
      } else {
        state.tasks.unshift({ id: uid("t"), title, priority: data.get("priority"), status: "offen", agent: data.get("agent"), project: data.get("project"), due: data.get("due") });
        addAudit("note", `Aufgabe erstellt: ${title}`, "tasks");
      }
      save();
      closeModal();
      renderRoute();
      toast(editId ? "Aufgabe gespeichert" : "Aufgabe erstellt");
      return;
    }
    if (type === "quick-task") {
      const title = String(new FormData(form).get("quickTitle") || "").trim();
      if (!title) return;
      const priority = String(new FormData(form).get("quickPriority") || "mittel");
      state.tasks.unshift({ id: uid("t"), title, priority, status: "offen", agent: "rick", project: "NEXUS V7", due: new Date().toISOString().slice(0, 10) });
      addAudit("note", `Aufgabe erstellt: ${title}`, "tasks");
      save();
      renderRoute();
      toast("Aufgabe hinzugefügt");
      return;
    }
    if (type === "note") {
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      const body = String(data.get("body") || "").trim();
      if (!title) return;
      const accent = String(data.get("accent") || "#8dff48");
      const editId = form.dataset.edit;
      if (editId) {
        const n = state.notes.find((x) => x.id === editId);
        if (n) Object.assign(n, { title, body, accent, updated: new Date().toISOString() });
        addAudit("note", `Notiz aktualisiert: ${title}`, "notes");
      } else {
        state.notes.unshift({ id: uid("n"), title, body, accent, updated: new Date().toISOString() });
        addAudit("note", `Notiz erstellt: ${title}`, "notes");
      }
      save();
      closeModal();
      renderRoute();
      toast(editId ? "Notiz gespeichert" : "Notiz erstellt");
      return;
    }
    if (type === "project") {
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      if (!name) return;
      state.projects.unshift({
        id: uid("p"), name, type: String(data.get("type") || "Diverses"), status: String(data.get("status") || "Aktiv"),
        language: String(data.get("type") || "Mixed"), updated: new Date().toISOString().slice(0, 10), progress: 0,
        accent: "#8dff48", icon: "folder", desc: String(data.get("desc") || "Neues Projekt.")
      });
      addAudit("project", `Projekt erstellt: ${name}`, "projects");
      save();
      closeModal();
      renderRoute();
      toast("Projekt erstellt");
      return;
    }
    if (type === "model") {
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      if (!name) return;
      state.customModels = state.customModels || [];
      state.customModels.push({ id: uid("m"), name, kind: String(data.get("kind") || "Custom"), base: String(data.get("base") || ""), note: String(data.get("note") || "") });
      addAudit("model", `Modell registriert: ${name}`, "models");
      save();
      closeModal();
      renderRoute();
      toast("Modell hinzugefügt");
      return;
    }
    if (type === "launch") {
      const data = new FormData(form);
      const providerId = form.dataset.provider;
      const provider = PROVIDERS.find((p) => p.id === providerId) || PROVIDERS[0];
      const agentId = String(data.get("agent") || "rick");
      const agent = agentById(agentId);
      const model = String(data.get("model") || state.settings.model);
      const task = String(data.get("task") || "");
      state.sessions.unshift({ id: uid("s"), name: `${provider.name} · ${agent?.name || "Agent"}`, status: "Läuft", started: timeNow() });
      state.settings.model = model;
      state.chat.agent = agentId;
      state.chat.messages.push({
        id: uid("m"), role: "assistant", time: clockNow(), demo: true,
        text: `Simulierte Sitzung gestartet.\n\nProvider: ${provider.name}\nAgent: ${agent?.name || agentId}\nModell: ${model}\nAuftrag: ${task || "—"}\n\nEs wurde kein Prozess ausgeführt. Für echte Antworten verbinde Ollama in der Modellzentrale.`
      });
      addAudit("system", `${provider.name}-Sitzung gestartet · ${agent?.name || agentId}`, "sessions");
      save();
      closeModal();
      navigate("chat");
      toast(`Sitzung mit ${agent?.name || "Agent"} gestartet`);
      return;
    }
    if (type === "chat") {
      const input = $("#chatInput");
      sendChat(input?.value || "");
      return;
    }
    if (type === "terminal") {
      const input = $("#termInput");
      runTerminalCommand(input?.value || "");
      return;
    }
  }

  /* ============ CHANGE / INPUT ============ */
  function setSettingPath(path, value) {
    const parts = path.split(".");
    let obj = state.settings;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = value;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme || "cyberpunk";
  }

  function handleChange(el) {
    if (el.matches("[data-setting]")) {
      let value = el.value;
      if (el.dataset.setting.startsWith("limits.")) value = Number(value) || 0;
      setSettingPath(el.dataset.setting, value);
      if (el.dataset.setting === "theme") applyTheme();
      save();
      if (el.dataset.setting === "language" && value === "en") toast("English ist im Prototyp noch nicht vollständig", "warn");
      else toast("Einstellung gespeichert");
      return;
    }
    if (el.id === "chatModel") {
      state.settings.model = el.value;
      addAudit("model", `Chat-Modell → ${el.value}`, "chat");
      save();
      const label = $("#chatModelLabel");
      if (label) label.textContent = el.value;
      toast(`Chat-Modell: ${el.value}`);
    }
  }

  function handleInput(el) {
    if (el.id === "noteSearch") {
      state.ui.noteQuery = el.value;
      const q = el.value.toLowerCase();
      const notes = state.notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
      const grid = $("#noteGrid");
      if (grid) grid.innerHTML = noteCards(notes);
    } else if (el.id === "librarySearch") {
      state.ui.libraryQuery = el.value;
      const q = el.value.toLowerCase();
      const files = LIBRARY_SEED.filter((f) => !q || f.name.toLowerCase().includes(q) || f.project.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));
      const rows = $("#libraryRows");
      if (rows) rows.innerHTML = fileRows(files);
    } else if (el.id === "searchModalInput") {
      renderSearchResults(el.value);
    } else if (el.id === "chatInput") {
      el.style.height = "auto";
      el.style.height = `${Math.min(120, el.scrollHeight)}px`;
    } else if (el.id === "globalSearch") {
      el.value = "";
      openSearchModal();
    }
  }

  /* ============ METRICS ============ */
  function tickMetrics() {
    ui.metrics.storage = clamp(ui.metrics.storage + (Math.random() - 0.5) * 0.12, 88, 110);
    ui.metrics.ram = clamp(ui.metrics.ram + (Math.random() - 0.5) * 0.16, 1.4, 3.2);
    ui.metrics.battery = clamp(ui.metrics.battery - Math.random() * 0.02, 88, 100);
    if (!["home", "status"].includes(getRoute())) return;
    const cards = $$(".metric");
    if (!cards.length) return;
    cards.forEach((card) => {
      const label = card.querySelector(".metric-label > span")?.textContent;
      const el = card.querySelector(".metric-value");
      if (!el || !label) return;
      if (label === "Speicher") el.textContent = `${ui.metrics.storage.toFixed(1)} GB`;
      if (label === "RAM") el.textContent = `${ui.metrics.ram.toFixed(1)} GB`;
      if (label === "Batterie") el.textContent = `${Math.round(ui.metrics.battery)}%`;
    });
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  /* ============ EVENTS ============ */
  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (!el) return;
    if (el.tagName === "A" && el.getAttribute("href")?.startsWith("#/")) {
      if (el.dataset.action === "search-result") closeModal();
    }
    if (el.dataset.action === "launch" || el.dataset.action === "model-select") {
      if (event.type === "click" && el.dataset.action === "model-select") event.preventDefault();
    }
    handleAction(el.dataset.action, el);
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    handleForm(form);
    if (form.dataset.form === "chat") {
      const input = $("#chatInput");
      if (input) { input.value = ""; input.style.height = "auto"; }
    }
    if (form.dataset.form === "terminal") {
      const input = $("#termInput");
      if (input) input.value = "";
    }
  });

  document.addEventListener("change", (event) => handleChange(event.target));
  document.addEventListener("input", (event) => handleInput(event.target));

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearchModal();
      return;
    }
    if (event.key === "Escape" && !$("#modalLayer").hidden) {
      closeModal();
      return;
    }
    if (event.target.id === "chatInput" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      $("#chatForm")?.requestSubmit();
      return;
    }
    if (event.target.id === "searchModalInput" && event.key === "Enter") {
      event.preventDefault();
      const first = $("#searchResults a");
      if (first) first.click();
      return;
    }
    if (event.target.closest('[data-action="model-select"]') && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      handleAction("model-select", event.target.closest('[data-action="model-select"]'));
    }
  });

  window.addEventListener("hashchange", () => {
    closeModal();
    renderRoute();
  });

  window.addEventListener("online", () => { updateOnlinePill(); if (getRoute() === "home") renderRoute(); });
  window.addEventListener("offline", () => { updateOnlinePill(); if (getRoute() === "home") renderRoute(); });

  /* ============ INIT ============ */
  function init() {
    applyTheme();
    buildNav();
    if (!location.hash) history.replaceState(null, "", "#/home");
    renderRoute();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(tickMetrics, 7000);
    if (state.loop.running) ensureLoopTimer();
    updateOnlinePill();
  }

  init();
})();
