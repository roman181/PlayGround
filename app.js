(() => {
  "use strict";

  const STORAGE_KEY = "nexus-v7-autonomous";
  const VERSION = 7;

  const AGENTS = [
    { id: "rick", name: "Rick", code: "A1", role1: "Strategic Chaos", role2: "Portal-Mathe", skill: "Portal-Mathe", level: 8, portrait: "assets/agents/rick.png", color: "#2bd7ff", desc: "Zerlegt chaotische Probleme in präzise, prüfbare Schritte." },
    { id: "peter", name: "Peter", code: "A2", role1: "Creative Order", role2: "Kreativität", skill: "Kreativität", level: 6, portrait: "assets/agents/peter.png", color: "#3c8cff", desc: "Erzeugt ungewöhnliche Lösungswege und neue Produktideen." },
    { id: "morty", name: "Morty", code: "A3", role1: "Logik", role2: "Datenanalyse", skill: "Datenanalyse", level: 5, portrait: "assets/agents/morty.png", color: "#26d9ff", desc: "Sammelt Daten, erkennt Muster und bewertet Risiken." },
    { id: "stewie", name: "Stewie", code: "A4", role1: "Tech-Arch", role2: "Tech-Gen", skill: "Tech-Gen", level: 5, portrait: "assets/agents/stewie.png", color: "#4a9dff", desc: "Entwirft Architektur, Code und technische Systeme." },
    { id: "lois", name: "Lois", code: "A5", role1: "Data Dominion", role2: "Kommunikation", skill: "Kommunikation", level: 7, portrait: "assets/agents/lois.png", color: "#ff7e5f", desc: "Koordiniert Übergaben, Aufgaben und Kommunikation." },
    { id: "happy", name: "Happy Tree", code: "A6", role1: "Data Domin", role2: "Test-Automation", skill: "Test-Automation", level: 6, portrait: "assets/agents/happy.png", color: "#38a4ff", desc: "Automatisiert Tests und prüft Qualitätsstandards." },
    { id: "evil", name: "Evil Morty", code: "A7", role1: "Manipulation", role2: "Strategic Chaos", skill: "Strategic Chaos", level: 10, portrait: "assets/agents/evil.png", color: "#8b5cff", desc: "Analysiert Angriffsflächen, Grenzen und Manipulationsrisiken." },
    { id: "archive", name: "Archive", code: "A8", role1: "Tech Arch", role2: "Wissensspeicher", skill: "Wissensspeicher", level: 10, portrait: "assets/agents/archive.png", color: "#7c5cff", desc: "Archiviert Entscheidungen, Snapshots und Wissen." }
  ];

  const AGENT_SKILLS = {
    rick: [
      { name: "Portal-Mathe", level: 8, desc: "Berechnung multidimensionaler Portale und Wahrscheinlichkeiten.", icon: "skills" },
      { name: "Strategie", level: 6, desc: "Langfristige Planung und Chaos-Analyse.", icon: "grid" },
      { name: "Analyse", level: 5, desc: "Systemanalysen und Mustererkennung.", icon: "brain" },
      { name: "Mutation", level: 4, desc: "Kreative Entwicklung neuer Ansätze.", icon: "bolt" }
    ],
    default: [
      { name: "Analyse", level: 6, desc: "Strukturierte Auswertung von Systemen und Signalen.", icon: "brain" },
      { name: "Planung", level: 5, desc: "Zerlegung von Zielen in prüfbare Schritte.", icon: "grid" },
      { name: "Umsetzung", level: 4, desc: "Kontrollierte Durchführung im Arbeitsbereich.", icon: "skills" },
      { name: "Mutation", level: 3, desc: "Kreative Entwicklung neuer Ansätze.", icon: "bolt" }
    ]
  };

  const PROJECTS = [
    { id: "p1", name: "NEXUS V7", type: "Android / Python", status: "Aktiv", updated: "2026-10-16", icon: "file", c1: "#146dff", c2: "#0c3fa0", progress: 72, desc: "Lokales KI-Büro und autonome Agentensteuerung." },
    { id: "p2", name: "Unity Game", type: "C# / Unity", status: "In Arbeit", updated: "2026-10-15", icon: "gamepad", c1: "#ff9d22", c2: "#c74b07", progress: 46, desc: "Gameplay-Prototyp mit modularen Systemen." },
    { id: "p3", name: "KI-Modelle Test", type: "Python", status: "Aktiv", updated: "2026-10-14", icon: "brain", c1: "#8d4cff", c2: "#4c17a8", progress: 88, desc: "Benchmarks und Routing-Vergleiche lokaler Modelle." },
    { id: "p4", name: "Horus Tools", type: "Bash / Linux", status: "Pause", updated: "2026-10-12", icon: "folder", c1: "#25d16d", c2: "#0b7437", progress: 63, desc: "Termux-Werkzeuge, proot und Shell-Integration." },
    { id: "p5", name: "Experimente", type: "Diverses", status: "Archiv", updated: "2026-10-10", icon: "star", c1: "#9b4dff", c2: "#5a17b5", progress: 100, desc: "Archivierte Prototypen und verworfene Ansätze." }
  ];

  const TASKS = [
    { id: "t1", title: "Unity Projekt einrichten", priority: "hoch", status: "offen", agent: "rick", due: "2026-10-16" },
    { id: "t2", title: "KI-Modelle evaluieren", priority: "mittel", status: "arbeit", agent: "stewie", due: "2026-10-16" },
    { id: "t3", title: "Gameplay testen", priority: "mittel", status: "arbeit", agent: "happy", due: "2026-10-15" },
    { id: "t4", title: "UI verbessern", priority: "niedrig", status: "offen", agent: "peter", due: "2026-10-14" },
    { id: "t5", title: "Fehleranalyse", priority: "hoch", status: "offen", agent: "morty", due: "2026-10-14" },
    { id: "t6", title: "Ollama-Verbindung dokumentieren", priority: "mittel", status: "erledigt", agent: "lois", due: "2026-10-13" }
  ];

  const AUDIT_TYPES = {
    mutation: { color: "#a94dff", icon: "bolt", label: "mutation", group: "mutation" },
    note_create: { color: "#ffd12e", icon: "note", label: "note_create", group: "notes" },
    personality_change: { color: "#21d9ff", icon: "user", label: "personality_change", group: "system" },
    note_delete: { color: "#ffd12e", icon: "note", label: "note_delete", group: "notes" },
    safety_change: { color: "#2cff8f", icon: "shield", label: "safety_change", group: "system" },
    rollback: { color: "#ffd12e", icon: "refresh", label: "rollback", group: "system" },
    note_update: { color: "#ff9b2f", icon: "note", label: "note_update", group: "notes" },
    system: { color: "#21d9ff", icon: "monitor", label: "system", group: "system" },
    skill: { color: "#a94dff", icon: "skills", label: "skill", group: "skills" },
    test: { color: "#2cff8f", icon: "check-circle", label: "test", group: "system" }
  };

  const SEED_AUDIT = [
    { id: "a1", time: "14:35:12", type: "mutation", actor: "Rick", text: "/ Portal-Mathe Lv. 8 → 9" },
    { id: "a2", time: "14:33:45", type: "note_create", actor: "", text: "Unity Projekt eingerichtet" },
    { id: "a3", time: "14:31:27", type: "personality_change", actor: "Morty", text: "→ rotzig" },
    { id: "a4", time: "14:28:11", type: "mutation", actor: "Stewie", text: "/ Tech-Gen Lv. 9 → 10" },
    { id: "a5", time: "14:24:09", type: "note_delete", actor: "", text: "test-notiz-1" },
    { id: "a6", time: "14:20:33", type: "safety_change", actor: "", text: "aktiviert" },
    { id: "a7", time: "14:18:55", type: "rollback", actor: "", text: "mutation #a1b2c3d4" },
    { id: "a8", time: "14:15:02", type: "note_update", actor: "", text: "Gameplay testen" },
    { id: "a9", time: "14:12:37", type: "system", actor: "", text: "Server gestartet" },
    { id: "a10", time: "14:10:22", type: "mutation", actor: "Happy Tree", text: "/ Test-Auto Lv. 6 → 7" }
  ];

  const MODELS = [
    { id: "qwen2.5:latest", name: "qwen2.5:latest", color: "linear-gradient(160deg,#a44dff,#5a15b8)", icon: "brain", tags: ["Chat", "Code"] },
    { id: "deepseek-r1:latest", name: "deepseek-r1:latest", color: "linear-gradient(160deg,#176dff,#0a3f9e)", icon: "brain", tags: ["Analyse", "Code"] },
    { id: "llama3:latest", name: "llama3:latest", color: "linear-gradient(160deg,#e9eef5,#8794a3)", icon: "grid", tags: ["Chat", "Instruct"], dark: true },
    { id: "mistral:latest", name: "mistral:latest", color: "linear-gradient(160deg,#ff8a1c,#d14300)", icon: "bolt", tags: ["Schnell", "Code"] }
  ];

  const SEED_TERMINAL = [
    { type: "prompt", cmd: "git status" },
    { type: "out", text: "Auf Branch main\nnichts zu committen, Arbeitsverzeichnis sauber" },
    { type: "prompt", cmd: "ollama list" },
    { type: "out", text: "NAME         ID       SIZE   MODIFIED\nqwen2.5      a1b2c3d4 4.1 GB 2 days ago\ndeepseek-r1  d4c3b2a1 7.8 GB 3 days ago\nllama3       e5f6a7b8 4.7 GB 5 days ago" },
    { type: "prompt", cmd: "python server.py" },
    { type: "out", text: "* Running on http://127.0.0.1:5000\n* Press CTRL+C to quit" }
  ];

  const LOOP_PHASES = ["Analyse", "Planung", "Freigabe", "Entwicklung", "Tests", "Fehlerbehebung", "Lernen"];
  const DASH_PHASES = ["Analyse", "Planung", "Freigabe", "Entwicklung", "Tests", "Lernen"];

  function freshState() {
    return {
      version: VERSION,
      settings: {
        ollamaUrl: "http://127.0.0.1:11434",
        model: "qwen2.5:latest",
        language: "Deutsch",
        theme: "Cyberpunk (Dark)",
        safety: { controller: true, autonomous: true, codeExec: false, network: false },
        system: { dir: "~/.nexus_v7", logs: 30, autostart: false }
      },
      tasks: TASKS.map((t) => ({ ...t })),
      projects: PROJECTS.map((p) => ({ ...p })),
      audit: SEED_AUDIT.map((a) => ({ ...a })),
      terminal: SEED_TERMINAL.map((l) => ({ ...l })),
      metrics: { cpu: 24, ram: 3.2, storage: 12.4, battery: 92 },
      connection: { status: "ok", checkedAt: Date.now(), models: [] },
      loop: {
        running: false, paused: false, cycle: 3, total: 10, progress: 35, completed: 4,
        interval: 5, mutationChance: 12, elapsed: 135,
        phase: "Planung", lastAction: "Projektanalyse", nextAction: "Freigabe",
        task: "Unity-Gameplay verbessern"
      },
      modelTest: {
        model: "deepseek-r1:latest",
        prompt: "Erkläre kurz das Konzept von NEXUS V7.",
        answer: "NEXUS V7 ist ein lokales KI-Büro für Android, das mehrere spezialisierte KI-Agenten mit Ollama-Modellen verbindet, um Projekte autonom zu planen, zu entwickeln, zu testen und zu verbessern."
      },
      customModels: [],
      agentLevels: Object.fromEntries(AGENTS.map((a) => [a.id, a.level])),
      skillLevels: {},
      customSkills: {},
      mutationResult: { levelFrom: 8, levelTo: 9, versionFrom: 4, versionTo: 5, hash: "a1b2c3… → d4e5f6…" },
      ui: {
        selectedAgent: "rick",
        agentTab: "skills",
        taskFilter: "alle",
        projectFilter: "alle",
        auditFilter: "Alle",
        terminalTab: "terminal",
        mutationMode: "manuell",
        mutationAgent: "rick",
        mutationSkill: "Portal-Mathe",
        mutationContent: "Erweiterte Berechnung von stabilen Portalrouten unter Berücksichtigung von Zeitdilation und Multiverseninstabilitäten."
      }
    };
  }

  function mergeState(base, saved) {
    if (!saved || saved.version !== VERSION) return base;
    return {
      ...base,
      ...saved,
      settings: {
        ...base.settings,
        ...(saved.settings || {}),
        safety: { ...base.settings.safety, ...(saved.settings?.safety || {}) },
        system: { ...base.settings.system, ...(saved.settings?.system || {}) }
      },
      loop: { ...base.loop, ...(saved.loop || {}) },
      metrics: { ...base.metrics, ...(saved.metrics || {}) },
      connection: { ...base.connection, ...(saved.connection || {}) },
      modelTest: { ...base.modelTest, ...(saved.modelTest || {}) },
      agentLevels: { ...base.agentLevels, ...(saved.agentLevels || {}) },
      skillLevels: { ...base.skillLevels, ...(saved.skillLevels || {}) },
      customSkills: { ...base.customSkills, ...(saved.customSkills || {}) },
      ui: { ...base.ui, ...(saved.ui || {}) }
    };
  }

  let state = freshState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = mergeState(freshState(), JSON.parse(raw));
  } catch { state = freshState(); }

  AGENTS.forEach((agent) => {
    const level = Number(state.agentLevels?.[agent.id]);
    if (Number.isFinite(level)) agent.level = Math.max(1, Math.min(10, level));
  });

  const ui = { timer: null, connectionBusy: false, lastFocus: null };

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function icon(name, cls = "") { return `<svg class="ico ${cls}"><use href="#i-${name}"/></svg>`; }
  function agentById(id) { return AGENTS.find((a) => a.id === id); }
  function uid(prefix = "id") { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`; }
  function timeNow() { return new Date().toLocaleTimeString("de-DE", { hour12: false }); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  function dotPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }
  function setPath(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
  }
  function addAudit(type, actor, text) {
    const meta = AUDIT_TYPES[type] || AUDIT_TYPES.system;
    state.audit.unshift({ id: uid("a"), time: timeNow(), type, actor, text });
    state.audit = state.audit.slice(0, 120);
    if (!state.audit.length) state.audit = [];
    save();
  }
  function toast(message, tone = "") {
    const stack = $("#toastStack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = `toast ${tone}`;
    el.innerHTML = `${icon(tone === "err" ? "x" : tone === "warn" ? "alert" : "check-circle")}<span>${esc(message)}</span>`;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  /* ---------------- routing ---------------- */
  const ROUTES = {
    home: { title: "Dashboard", eyebrow: "NEXUS V7 · ZENTRALE" },
    agents: { title: "Agenten", eyebrow: "KI-AGENTEN" },
    agent: { title: "Agent", eyebrow: "AGENTENPROFIL" },
    mutation: { title: "Skill-Mutation", eyebrow: "SKILLS" },
    models: { title: "KI-Modelle", eyebrow: "OLLAMA" },
    loop: { title: "Entwicklungsloop", eyebrow: "AUTONOMER ZYKLUS" },
    projects: { title: "Projekte", eyebrow: "PROJEKTVERWALTUNG" },
    tasks: { title: "To-Do Tafel", eyebrow: "AUFGABEN" },
    terminal: { title: "Terminal", eyebrow: "HORUS LINUX" },
    audit: { title: "Audit-Log", eyebrow: "PROTOKOLL" },
    status: { title: "Systemmonitor", eyebrow: "SYSTEM" },
    settings: { title: "Einstellungen", eyebrow: "KONFIGURATION" },
    menu: { title: "Menü", eyebrow: "ALLE BEREICHE" }
  };
  const BOTTOM_NAV = [
    { route: "home", label: "Home", icon: "home" },
    { route: "agents", label: "Agenten", icon: "agent" },
    { route: "loop", label: "Loop", icon: "loop" },
    { route: "projects", label: "Projekte", icon: "folder" },
    { route: "menu", label: "Menü", icon: "menu-dots" }
  ];
  const MENU_ROUTES = new Set(["menu", "models", "mutation", "tasks", "terminal", "audit", "status", "settings"]);

  function getRoute() {
    const match = location.hash.match(/^#\/([a-z-]+)/);
    return match && ROUTES[match[1]] ? match[1] : "home";
  }
  function navigate(route) {
    if (!ROUTES[route]) route = "home";
    if (location.hash === `#/${route}`) renderRoute();
    else location.hash = `#/${route}`;
  }
  function activeNav(route) {
    if (route === "agent") return "agents";
    if (MENU_ROUTES.has(route)) return "menu";
    return route;
  }
  function buildNav() {
    $("#bottomNav").innerHTML = BOTTOM_NAV.map((item) => `
      <a class="nav-item" data-nav="${item.route}" href="#/${item.route}">
        ${icon(item.icon)}
        <span>${item.label}</span>
      </a>`).join("");
  }
  function updateNav(route) {
    const active = activeNav(route);
    $$("[data-nav]").forEach((el) => el.classList.toggle("active", el.dataset.nav === active));
  }
  function renderRoute() {
    const route = getRoute();
    const meta = ROUTES[route];
    document.title = `NEXUS V7 · ${meta.title}`;
    document.body.dataset.route = route;
    const renderers = {
      home: renderHome, agents: renderAgents, agent: renderAgentDetail, mutation: renderMutation,
      models: renderModels, loop: renderLoop, projects: renderProjects, tasks: renderTasks,
      terminal: renderTerminal, audit: renderAudit, status: renderStatus, settings: renderSettings,
      menu: renderMenu
    };
    $("#view").innerHTML = `<div class="view-enter">${(renderers[route] || renderHome)()}</div>`;
    updateNav(route);
  }

  /* ---------------- shared components ---------------- */
  function screenHead(iconName, title, { tone = "", action = "", back = false } = {}) {
    return `<div class="screen-head ${tone}">
      ${back ? `<button class="hud-btn back-btn" data-action="back" aria-label="Zurück">${icon("back")}</button>` : `<span class="head-icon">${icon(iconName)}</span>`}
      <h1>${esc(title)}</h1>
      ${action ? `<div class="head-action">${action}</div>` : ""}
    </div>`;
  }
  function panelHead(iconName, title, { tone = "", right = "" } = {}) {
    return `<div class="panel-head ${tone}">
      <span class="p-icon">${icon(iconName)}</span>
      <span>${esc(title)}</span>
      ${right ? `<span class="head-right">${right}</span>` : ""}
    </div>`;
  }
  function gaugeCard(label, value, pct, color, spark = true) {
    return `<div class="gauge-card">
      <div class="gauge" style="--p:${Math.max(0, Math.min(100, pct))};--c:${color}">
        <div class="gauge-inner"><span class="gauge-label">${esc(label)}</span><span class="gauge-value">${esc(value)}</span></div>
      </div>
      ${spark ? sparkline(color) : ""}
    </div>`;
  }
  function sparkline(color) {
    const points = [11, 8, 12, 6, 10, 13, 7, 9, 14, 8, 11, 5, 10, 13, 8, 6, 12, 9, 14, 10, 7, 12, 8, 5];
    return `<svg class="spark" viewBox="0 0 100 18" preserveAspectRatio="none" style="color:${color}" aria-hidden="true">
      <polyline points="${points.map((v, i) => `${(i / (points.length - 1)) * 100},${18 - v}`).join(" ")}"/>
    </svg>`;
  }
  function gaugeGrid(monitor = false) {
    const m = state.metrics;
    return `<div class="${monitor ? "monitor-grid" : "gauge-grid"}">
      ${gaugeCard("CPU", `${Math.round(m.cpu)}%`, m.cpu, "#21d9ff")}
      ${gaugeCard("RAM", `${m.ram.toFixed(1)}/8`, (m.ram / 8) * 100, "#a94dff")}
      ${gaugeCard("Speicher", `${m.storage.toFixed(1)}/64`, (m.storage / 64) * 100, "#1785ff")}
      ${gaugeCard("Akku", `${Math.round(m.battery)}%`, m.battery, "#2cff8f")}
    </div>`;
  }
  function phaseIcon(index) {
    return ["plan", "loop", "shield", "skills", "flask", "wrench", "brain", "bolt"][index % 8];
  }
  function dashboardPhases() {
    const done = Math.min(DASH_PHASES.length, state.loop.completed);
    return `<div class="loop-phases">${DASH_PHASES.map((name, i) => `
      <div class="phase ${i < done ? "done" : i === done && state.loop.running ? "active" : ""}">
        <span class="phase-icon">${icon(phaseIcon(i))}</span>
        <span class="phase-label">${name}</span>
      </div>`).join("")}</div>`;
  }
  function loopRingSvg(progress, size = 150) {
    const r = 63;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - Math.max(0, Math.min(100, progress)) / 100);
    return `<svg class="loop-ring" viewBox="0 0 150 150" width="${size}" height="${size}" aria-hidden="true">
      <defs><linearGradient id="loopGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2cff8f"/><stop offset=".38" stop-color="#21d9ff"/><stop offset="1" stop-color="#167dff"/>
      </linearGradient></defs>
      <circle class="track" cx="75" cy="75" r="${r}"/>
      <circle class="prog" id="loopRingProg" cx="75" cy="75" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
    </svg>`;
  }
  function loopPhaseList() {
    return LOOP_PHASES.map((name, i) => {
      const done = i < state.loop.completed;
      const current = state.loop.running && i === state.loop.completed;
      return `<div class="loop-phase-item ${done ? "done" : current ? "current" : "pending"}">
        <span class="check">${done ? icon("check") : ""}</span><span>${name}</span>
      </div>`;
    }).join("");
  }
  function controlButtons() {
    return `<div class="control-row">
      <button class="control-btn start" data-action="loop-start">${icon("play")} Start</button>
      <button class="control-btn pause" data-action="loop-pause">${icon("pause")} Pause</button>
      <button class="control-btn stop" data-action="loop-stop">${icon("stop")} Stop</button>
    </div>`;
  }
  function progressRow(progress) {
    return `<div class="cycle-progress-row">
      <div class="cycle-bar"><i id="dashLoopBar" style="width:${progress}%"></i></div>
      <span class="cycle-pct" id="dashLoopPct">${Math.round(progress)}%</span>
    </div>`;
  }

  /* ---------------- dashboard ---------------- */
  function renderHome() {
    const loop = state.loop;
    const quick = [
      { action: "open-task", icon: "plan", label: "Neuer Plan", color: "#2bd7ff" },
      { action: "open-project", icon: "folder", label: "Neues Projekt", color: "#1d8cff" },
      { action: "open-file", icon: "file", label: "Datei öffnen", color: "#ffb52e" },
      { action: "open-terminal", icon: "terminal", label: "Terminal", color: "#31d5ff" },
      { action: "test-connection", icon: "agent", label: "Ollama testen", color: "#a96bff" },
      { action: "system-check", icon: "gear", label: "Systemcheck", color: "#46a8ff" }
    ];
    return `
      <section class="core-card">
        <div class="core-hud" aria-hidden="true">
          <span class="hud-ring r1"></span><span class="hud-ring r2"></span><span class="hud-ring r3"></span><span class="hud-ring r4"></span>
          <span class="hud-spinner"></span><span class="hud-axis"></span><span class="hud-axis x"></span><span class="hud-core"></span>
        </div>
        <div class="core-copy">
          <h1 class="core-title">NEXUS CORE</h1>
          <div class="core-sub">EVOLUTION DURCH CHAOS</div>
          <p class="core-quote">„Evolution ist kein Ziel,<br />sondern ein Prozess.“</p>
          <span class="core-online"><span class="dot live"></span> System Online</span>
        </div>
      </section>

      <section class="panel">
        ${panelHead("refresh", "Systemstatus", { right: `<span class="badge neutral">DEMO</span>` })}
        <div class="panel-body">${gaugeGrid()}</div>
      </section>

      <section class="panel">
        ${panelHead("bolt", "Schnellaktionen", { right: `<button class="icon-btn" data-action="system-check" aria-label="Systemcheck">${icon("refresh")}</button>` })}
        <div class="panel-body">
          <div class="quick-grid">
            ${quick.map((q) => `<button class="quick-btn" data-action="${q.action}" style="--c:${q.color}">
              <span class="qa-icon">${icon(q.icon)}</span><span>${q.label}</span>
            </button>`).join("")}
          </div>
        </div>
      </section>

      <section class="panel">
        ${panelHead("loop", "Lernschleife", { right: `Zyklus ${loop.cycle} / ${loop.total}` })}
        <div class="panel-body">
          <div id="dashPhases">${dashboardPhases()}</div>
          <div id="dashProgress">${progressRow(loop.progress)}</div>
          ${controlButtons()}
        </div>
      </section>`;
  }

  /* ---------------- agents ---------------- */
  function agentCard(a) {
    return `<button class="agent-card" data-action="agent-open" data-agent="${a.id}">
      <img class="agent-photo" src="${a.portrait}" alt="${esc(a.name)}" loading="lazy" />
      <span class="agent-info">
        <span class="agent-name">${esc(a.name)}</span>
        <span class="agent-code">${a.code}</span>
        <span class="agent-role">${esc(a.role1)}<br />${esc(a.role2)}</span>
        <span class="agent-bottom">
          <span class="skill-orb">${icon("shield")}</span>
          <span class="agent-bar"><i style="width:${Math.min(100, a.level * 10)}%"></i></span>
          <span class="agent-lv">Lv. ${a.level}</span>
        </span>
      </span>
    </button>`;
  }
  function renderAgents() {
    return `
      ${screenHead("user", "Agenten Übersicht", { action: `<span class="badge green"><span class="dot live"></span> 8 Online</span>` })}
      <div class="agent-grid">${AGENTS.map(agentCard).join("")}</div>`;
  }

  function skillsFor(agent) {
    const base = (AGENT_SKILLS[agent.id] || AGENT_SKILLS.default).map((skill) => ({
      ...skill,
      level: state.skillLevels[`${agent.id}:${skill.name}`] ?? skill.level
    }));
    const custom = (state.customSkills[agent.id] || []).map((skill) => ({
      ...skill,
      level: state.skillLevels[`${agent.id}:${skill.name}`] ?? skill.level
    }));
    return [...base, ...custom];
  }
  function skillRows(agent) {
    return skillsFor(agent).map((s) => `
      <div class="skill-row">
        <span class="skill-icon">${icon(s.icon)}</span>
        <span class="skill-copy">
          <span class="skill-title">${esc(s.name)} <span>Lv. ${s.level}</span></span>
          <span class="skill-desc">${esc(s.desc)}</span>
        </span>
        <button class="skill-edit" data-action="skill-edit" data-agent="${agent.id}" data-skill="${esc(s.name)}">Bearbeiten</button>
      </div>`).join("");
  }
  function personalityBox(agent) {
    const base = agent.level;
    return `<div class="personality-box panel" style="margin-top:0">
      ${panelHead("clock", "Persönlichkeitsprofil", { tone: "purple", right: `<select class="select-mini" data-setting="ui.personality" id="personalitySelect"><option>sassy</option><option>ruhig</option><option>präzise</option><option>verspielt</option></select>` })}
      <div class="panel-body" style="padding-top:3px">
        <div class="persona-row">${icon("bolt")}<span style="width:45px">Direktheit</span><span class="persona-bar"><i style="width:${Math.min(100, base * 9)}%"></i></span></div>
        <div class="persona-row">${icon("brain")}<span style="width:45px">Sarkasmus</span><span class="persona-bar"><i style="width:${Math.min(100, base * 8)}%"></i></span></div>
        <div class="persona-row">${icon("shield")}<span style="width:45px">Fluchlevel</span><span class="persona-bar"><i style="width:${Math.min(100, base * 3)}%"></i></span></div>
      </div>
    </div>`;
  }
  function renderAgentDetail() {
    const agent = agentById(state.ui.selectedAgent) || AGENTS[0];
    const tab = state.ui.agentTab || "skills";
    let content = "";
    if (tab === "overview") {
      content = `<div class="panel">${panelHead("user", "Übersicht")}<div class="panel-body"><p class="hint">${esc(agent.desc)}</p>
        <div class="stat-strip" style="margin-top:8px">
          <div class="stat-box"><b>${agent.level}</b><small>LEVEL</small></div>
          <div class="stat-box"><b>${skillsFor(agent).length}</b><small>SKILLS</small></div>
          <div class="stat-box"><b>${state.tasks.filter((t) => t.agent === agent.id && t.status !== "erledigt").length}</b><small>AUFGABEN</small></div>
        </div></div></div>`;
    } else if (tab === "personality") {
      content = personalityBox(agent);
    } else {
      content = `<div class="panel">${panelHead("skills", "Skills")}<div class="panel-body">
        <div class="skill-list">${skillRows(agent)}</div>
        <button class="add-skill-btn" data-action="add-skill" data-agent="${agent.id}">${icon("plus")} Neuen Skill hinzufügen</button>
        ${personalityBox(agent)}
      </div></div>`;
    }
    return `
      ${screenHead("agent", `${agent.name} (${agent.code})`, { back: true, action: `<span class="badge green"><span class="dot live"></span> Online</span>` })}
      <div class="panel">
        <div class="agent-profile">
          <img class="agent-profile-photo" src="${agent.portrait}" alt="${esc(agent.name)}" />
          <div class="profile-stats">
            <div class="profile-stat">${icon("check-circle")} ${esc(agent.role1)}</div>
            <div class="profile-stat">${icon("check-circle")} ${esc(agent.role2)}</div>
            <div class="profile-stat">${icon("check-circle")} Lv. ${agent.level}</div>
            <div class="profile-level">
              <span class="agent-bar"><i style="width:${Math.min(100, agent.level * 10)}%"></i></span>
            </div>
          </div>
        </div>
        <div class="tabs">
          <button class="tab ${tab === "overview" ? "active" : ""}" data-action="agent-tab" data-tab="overview">Übersicht</button>
          <button class="tab ${tab === "skills" ? "active" : ""}" data-action="agent-tab" data-tab="skills">Skills</button>
          <button class="tab ${tab === "personality" ? "active" : ""}" data-action="agent-tab" data-tab="personality">Persönlichkeit</button>
        </div>
      </div>
      ${content}`;
  }

  /* ---------------- mutation ---------------- */
  function mutationAgent() { return agentById(state.ui.mutationAgent) || AGENTS[0]; }
  function mutationSkills() {
    const a = mutationAgent();
    return skillsFor(a).map((s) => s.name);
  }
  function renderMutation() {
    const agent = mutationAgent();
    const skills = mutationSkills();
    if (!skills.includes(state.ui.mutationSkill)) state.ui.mutationSkill = skills[0];
    const result = state.mutationResult;
    const content = state.ui.mutationContent || "";
    return `
      ${screenHead("brain", "Skill-Mutation", { tone: "purple" })}
      <div class="panel">
        <div class="panel-body">
          <div class="form-row">
            <label for="mutationAgent">Agent</label>
            <select class="select" id="mutationAgent" data-change="mutation-agent">
              ${AGENTS.map((a) => `<option value="${a.id}" ${a.id === agent.id ? "selected" : ""}>${esc(a.name)} (${a.code})</option>`).join("")}
            </select>
          </div>
          <div class="form-row">
            <label for="mutationSkill">Skill</label>
            <select class="select" id="mutationSkill" data-change="mutation-skill">
              ${skills.map((s) => `<option ${s === state.ui.mutationSkill ? "selected" : ""}>${esc(s)} (Lv. ${agent.level})</option>`).join("")}
            </select>
          </div>
          <div class="segmented">
            <button class="${state.ui.mutationMode === "manuell" ? "active" : ""}" data-action="mutation-mode" data-mode="manuell">Manuell</button>
            <button class="${state.ui.mutationMode === "ki" ? "active" : ""}" data-action="mutation-mode" data-mode="ki">Mit KI (Ollama)</button>
          </div>
          <div class="form-row" style="align-items:flex-start;padding-top:0">
            <label for="mutationContent" style="padding-top:6px">Neuer Inhalt</label>
            <div style="flex:1;min-width:0">
              <textarea class="textarea" id="mutationContent" maxlength="500" data-bind="mutationContent">${esc(content)}</textarea>
              <div class="counter" id="mutationCounter">${content.length}/500</div>
            </div>
          </div>
          <label class="check-row"><input type="checkbox" id="mutationAutonomous" data-toggle="ui.mutationAutonomous" ${state.ui.mutationAutonomous ? "checked" : ""} /> autonom (Safety-Check)</label>
          <button class="btn purple wide" style="min-height:34px" data-action="mutation-run">${icon("skills")} Mutation ausführen</button>
        </div>
      </div>
      <div class="panel">
        ${panelHead("skills", "Ergebnis", { tone: "purple" })}
        <div class="panel-body">
          <div class="result-box" style="margin-top:0">
            <div class="result-success">${icon("check-circle")} Mutation erfolgreich!</div>
            <div class="result-meta">
              <div>${icon("skills")} Level: ${result.levelFrom} → ${result.levelTo}</div>
              <div>${icon("check-circle")} Version: ${result.versionFrom} → ${result.versionTo}</div>
              <div>${icon("lock")} Hash: ${esc(result.hash)}</div>
            </div>
            <button class="btn ghost wide" data-action="open-audit">${icon("clipboard")} Im Audit-Log anzeigen</button>
          </div>
        </div>
      </div>`;
  }

  /* ---------------- models ---------------- */
  function renderModels() {
    const connected = state.connection.status === "ok";
    const models = [...MODELS, ...(state.customModels || [])];
    return `
      ${screenHead("brain", "KI-Modelle (Ollama)", { tone: "purple", action: `<button class="icon-btn" data-action="test-connection" aria-label="Verbindung testen">${icon("refresh")}</button>` })}
      <div class="panel">
        <div class="connection-line">
          <span class="dot ${connected ? "live" : ""}" style="color:${connected ? "var(--green)" : "var(--yellow)"}"></span>
          <span>${connected ? "Verbunden" : "Demo-Modus"}</span>
          <span class="url">${esc(state.settings.ollamaUrl)}</span>
        </div>
        <div class="model-list">
          ${models.map((m) => `<button class="model-row ${state.settings.model === m.id ? "active" : ""}" data-action="model-select" data-model="${esc(m.id)}">
            <span class="model-logo" style="background:${m.color};${m.dark ? "color:#24303d" : ""}">${m.logo || icon(m.icon)}</span>
            <span class="grow"><span class="model-name">${esc(m.name)}</span><span class="model-tags">${(m.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</span></span>
            <span class="model-status"><span class="dot"></span> Bereit</span>
          </button>`).join("")}
        </div>
        <div class="panel-body" style="padding-top:0"><button class="btn wide" data-action="test-connection">${icon("refresh")} Modelle aktualisieren</button></div>
      </div>
      <div class="panel test-panel">
        ${panelHead("bolt", "Testen")}
        <div class="panel-body">
          <div class="form-row" style="padding-top:0">
            <label for="testModel">Modell</label>
            <select class="select" id="testModel" data-change="test-model">
              ${models.map((m) => `<option value="${esc(m.id)}" ${state.modelTest.model === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}
            </select>
          </div>
          <textarea class="textarea" id="modelPrompt" data-bind="modelTest.prompt" style="min-height:64px">${esc(state.modelTest.prompt)}</textarea>
          <button class="btn primary wide" style="margin-top:6px" data-action="model-send">${icon("play")} Senden</button>
          <div class="test-answer-title">Antwort</div>
          <div class="test-answer" id="modelAnswer">${esc(state.modelTest.answer || "Noch keine Antwort.")}</div>
        </div>
      </div>`;
  }

  /* ---------------- loop ---------------- */
  function renderLoop() {
    const loop = state.loop;
    const phase = LOOP_PHASES[Math.min(LOOP_PHASES.length - 1, loop.completed)] || "Analyse";
    return `
      ${screenHead("loop", "Entwicklungsloop")}
      <div class="panel">
        <div class="loop-top">
          <div class="loop-ring-wrap">
            ${loopRingSvg(loop.progress)}
            <div class="loop-center"><small>Zyklus ${loop.cycle} / ${loop.total}</small><b id="loopPctText">${Math.round(loop.progress)}%</b></div>
          </div>
          <div class="loop-phase-list" id="loopPhaseList">${loopPhaseList()}</div>
        </div>
        <div class="panel-body" style="padding-top:0">${controlButtons()}</div>
      </div>
      <div class="panel">
        ${panelHead("gear", "Loop-Einstellungen")}
        <div class="panel-body" style="padding-top:2px">
          <div class="settings-list">
            <div class="setting-line"><span>Zyklen gesamt</span><select class="select" data-change="loop-total">${[5, 10, 15, 20, 30].map((n) => `<option ${n === loop.total ? "selected" : ""}>${n}</option>`).join("")}</select></div>
            <div class="setting-line"><span>Intervall (Sek.)</span><select class="select" data-change="loop-interval">${[3, 5, 10, 30, 60].map((n) => `<option ${n === loop.interval ? "selected" : ""}>${n}</option>`).join("")}</select></div>
            <div class="setting-line"><span>Mutation-Chance</span><input class="input" type="number" min="0" max="100" value="${loop.mutationChance}" data-change="loop-mutation" /><span class="unit">%</span></div>
            <div class="setting-line"><span class="green">${icon("check-circle")} Autonomer Modus</span><label class="switch"><input type="checkbox" data-toggle="loopAutonomous" ${loop.autonomous ? "checked" : ""} /><span></span></label></div>
            <div class="setting-line"><span class="green">${icon("shield")} Safety-Controller</span><label class="switch"><input type="checkbox" data-toggle="loopSafety" ${loop.safety !== false ? "checked" : ""} /><span></span></label></div>
          </div>
        </div>
      </div>
      <div class="panel">
        ${panelHead("check-circle", "Aktueller Status")}
        <div class="panel-body">
          <div class="status-info">
            <div>${icon("clock")} Phase: <span id="loopStatusPhase">${esc(phase)}</span></div>
            <div>${icon("brain")} Letzte Aktion: <span id="loopLastAction">${esc(loop.lastAction)}</span></div>
            <div>${icon("shield")} Nächste Aktion: <span id="loopNextAction">${esc(loop.nextAction)}</span></div>
            <div>${icon("refresh")} Laufzeit: <span class="mono" id="loopElapsed">${formatElapsed(loop.elapsed)}</span></div>
          </div>
        </div>
      </div>`;
  }
  function formatElapsed(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  /* ---------------- projects ---------------- */
  function renderProjects() {
    const filter = state.ui.projectFilter || "alle";
    const filtered = state.projects.filter((p) => filter === "alle" || (filter === "aktiv" ? ["Aktiv", "In Arbeit"].includes(p.status) : p.status === "Archiv"));
    const count = (f) => state.projects.filter((p) => f === "alle" || (f === "aktiv" ? ["Aktiv", "In Arbeit"].includes(p.status) : p.status === "Archiv")).length;
    return `
      ${screenHead("folder", "Projekte", { action: `<button class="btn primary sm" data-action="open-project">${icon("plus")} Neues Projekt</button>` })}
      <div class="filter-tabs">
        <button class="filter-tab ${filter === "alle" ? "active" : ""}" data-action="project-filter" data-filter="alle">Alle (${count("alle")})</button>
        <button class="filter-tab ${filter === "aktiv" ? "active" : ""}" data-action="project-filter" data-filter="aktiv">Aktiv (${count("aktiv")})</button>
        <button class="filter-tab ${filter === "archiv" ? "active" : ""}" data-action="project-filter" data-filter="archiv">Archiv (${count("archiv")})</button>
      </div>
      <div class="project-list">
        ${filtered.map((p) => `<button class="project-row" data-action="project-open" data-project="${p.id}">
          <span class="project-icon" style="--c1:${p.c1};--c2:${p.c2}">${icon(p.icon)}</span>
          <span class="project-copy">
            <span class="project-name">${esc(p.name)}</span>
            <span class="project-type">${esc(p.type)}</span>
            <span class="project-meta">${icon("clock")} Geändert: ${formatDate(p.updated)}</span>
          </span>
          <span class="badge ${p.status === "Aktiv" ? "green" : p.status === "In Arbeit" ? "orange" : p.status === "Pause" ? "red" : "neutral"}">${icon(p.status === "Archiv" ? "lock" : "check-circle")} ${esc(p.status)}</span>
        </button>`).join("") || `<div class="empty">Keine Projekte in diesem Filter.</div>`}
      </div>`;
  }

  /* ---------------- tasks ---------------- */
  function taskStatusClass(s) { return s === "erledigt" ? "done" : s === "arbeit" ? "doing" : "open"; }
  function renderTasks() {
    const filter = state.ui.taskFilter || "alle";
    const filtered = state.tasks.filter((t) => filter === "alle" || (filter === "offen" ? t.status === "offen" : filter === "arbeit" ? t.status === "arbeit" : t.status === "erledigt"));
    const counts = {
      offen: state.tasks.filter((t) => t.status === "offen").length,
      arbeit: state.tasks.filter((t) => t.status === "arbeit").length,
      erledigt: state.tasks.filter((t) => t.status === "erledigt").length
    };
    return `
      ${screenHead("check-circle", "To-Do Tafel", { tone: "purple", action: `<button class="btn primary sm" data-action="open-task">${icon("plus")} Neue Notiz</button>` })}
      <div class="task-filters">
        <button class="task-filter open ${filter === "offen" ? "active" : ""}" data-action="task-filter" data-filter="offen">Offen (${counts.offen})</button>
        <button class="task-filter doing ${filter === "arbeit" ? "active" : ""}" data-action="task-filter" data-filter="arbeit">In Arbeit (${counts.arbeit})</button>
        <button class="task-filter done ${filter === "erledigt" ? "active" : ""}" data-action="task-filter" data-filter="erledigt">Erledigt (${counts.erledigt})</button>
      </div>
      <div class="task-list">
        ${filtered.map((t) => {
          const a = agentById(t.agent) || AGENTS[0];
          const done = t.status === "erledigt";
          return `<div class="task-row" style="--priority:${t.priority === "hoch" ? "#ff3a67" : t.priority === "mittel" ? "#ffd12e" : "#2cff8f"}">
            <button class="task-check ${done ? "done" : ""}" data-action="task-toggle" data-task="${t.id}" aria-label="Aufgabe abhaken">${done ? icon("check") : ""}</button>
            <img class="task-avatar" src="${a.portrait}" alt="${esc(a.name)}" loading="lazy" />
            <span class="task-copy">
              <span class="task-title" style="${done ? "text-decoration:line-through;opacity:.7" : ""}">${esc(t.title)}</span>
              <span class="task-meta"><span class="agent-chip">${a.code} <b>${esc(a.name)}</b></span> ${icon("clock")} ${formatDate(t.due)}</span>
            </span>
            <span class="task-priority ${t.priority}">${esc(t.priority)}</span>
          </div>`;
        }).join("") || `<div class="empty">Keine Aufgaben in diesem Filter.</div>`}
      </div>`;
  }

  /* ---------------- terminal ---------------- */
  function renderTerminal() {
    const tab = state.ui.terminalTab || "terminal";
    let body = "";
    if (tab === "processes") {
      body = `<div class="term-processes">${terminalProcesses().map((p) => `<div class="proc-row">${icon(p.icon)}<span>${esc(p.name)}</span><span class="num">${p.cpu}%</span><span class="num">${p.ram}</span></div>`).join("")}</div>`;
    } else if (tab === "logs") {
      body = `<div class="term-logs">${state.audit.slice(0, 10).map((a) => `<div class="audit-row"><span class="audit-time">${a.time}</span><span class="audit-type" style="color:${(AUDIT_TYPES[a.type] || AUDIT_TYPES.system).color}">${esc(a.type)}</span><span class="audit-text">${esc(a.actor)} ${esc(a.text)}</span></div>`).join("")}</div>`;
    } else {
      body = `<div class="term-output" id="termOutput">${state.terminal.map(termLine).join("")}</div>
        <form class="term-input-row" data-form="terminal">
          <span class="term-prompt">nexus@horus:~/nexus_v7$</span>
          <input class="term-input" id="termInput" name="command" autocomplete="off" spellcheck="false" aria-label="Terminal-Befehl" />
        </form>`;
    }
    return `
      ${screenHead("terminal", "Terminal (HORUS Linux)")}
      <div class="terminal-shell">
        <div class="term-tabs">
          <button class="term-tab ${tab === "terminal" ? "active" : ""}" data-action="term-tab" data-tab="terminal">Terminal</button>
          <button class="term-tab ${tab === "processes" ? "active" : ""}" data-action="term-tab" data-tab="processes">Prozesse</button>
          <button class="term-tab ${tab === "logs" ? "active" : ""}" data-action="term-tab" data-tab="logs">Logs</button>
          <button class="term-tab add" data-action="term-new" aria-label="Neue Terminal-Sitzung">${icon("plus")}</button>
        </div>
        ${body}
      </div>`;
  }
  function termLine(line) {
    if (line.type === "prompt") {
      return `<div class="term-line prompt"><span class="host">nexus@horus</span><span class="path">:~/nexus_v7$</span> ${esc(line.cmd)}</div>`;
    }
    return `<div class="term-line ${line.type || "out"}">${esc(line.text)}</div>`;
  }
  function terminalProcesses() {
    return [
      { name: "python", cpu: 12.4, ram: "320 MB", icon: "code" },
      { name: "ollama", cpu: 8.7, ram: "1.4 GB", icon: "brain" },
      { name: "termux", cpu: 4.1, ram: "180 MB", icon: "terminal" },
      { name: "node", cpu: 2.3, ram: "96 MB", icon: "grid" },
      { name: "system", cpu: 1.8, ram: "70 MB", icon: "monitor" }
    ];
  }

  /* ---------------- audit ---------------- */
  function auditGroup(type) {
    return (AUDIT_TYPES[type] || AUDIT_TYPES.system).group;
  }
  function renderAudit() {
    const filter = state.ui.auditFilter || "Alle";
    const filterMap = { Mutation: "mutation", Notizen: "notes", System: "system", Skills: "skills" };
    const rows = state.audit.filter((a) => filter === "Alle" || auditGroup(a.type) === filterMap[filter]);
    return `
      ${screenHead("clipboard", "Audit-Log", { tone: "purple", action: `<button class="btn ghost sm" data-action="audit-all">Alle anzeigen</button>` })}
      <div class="audit-filters">
        ${["Alle", "Mutation", "Notizen", "System", "Skills"].map((f) => `<button class="audit-filter ${filter === f ? "active" : ""}" data-action="audit-filter" data-filter="${f}">${f}</button>`).join("")}
      </div>
      <div class="panel"><div class="panel-body" style="padding-top:3px;padding-bottom:3px">
        <div class="audit-list">
          ${rows.map((a) => auditRow(a)).join("") || `<div class="empty">Keine Einträge.</div>`}
        </div>
      </div></div>`;
  }
  function auditRow(a) {
    const meta = AUDIT_TYPES[a.type] || AUDIT_TYPES.system;
    return `<div class="audit-row">
      <span class="audit-time">${esc(a.time)}</span>
      <span class="audit-icon" style="--ac:${meta.color}">${icon(meta.icon)}</span>
      <span class="audit-type" style="--ac:${meta.color};color:${meta.color}">${esc(meta.label)}</span>
      <span class="audit-text"><b>${esc(a.actor || "")}</b> ${esc(a.text)}</span>
    </div>`;
  }

  /* ---------------- system monitor ---------------- */
  function renderStatus() {
    return `
      ${screenHead("monitor", "Systemmonitor")}
      <div class="panel">${panelHead("activity", "Ressourcen", { right: `<span class="badge neutral">DEMO</span>` })}<div class="panel-body">${gaugeGrid(true)}</div></div>
      <div class="panel">${panelHead("grid", "Prozesse (Top 5)")}<div class="panel-body" style="padding-top:2px">
        <div class="process-list">${terminalProcesses().map((p) => `<div class="process-row">${icon(p.icon)}<span>${esc(p.name)}</span><span class="num">${p.cpu}%</span><span class="num">${p.ram}</span></div>`).join("")}</div>
      </div></div>
      <div class="monitor-duo">
        <div class="panel">${panelHead("network", "Netzwerk")}<div class="panel-body" style="padding-top:4px">
          <div class="net-row">${icon("upload")} Upload <b>1.2 MB/s</b></div>
          <div class="net-row">${icon("download")} Download <b>4.8 MB/s</b></div>
        </div></div>
        <div class="panel">${panelHead("thermometer", "Temperatur")}<div class="panel-body" style="padding-top:4px">
          <div class="temp-row">${icon("thermometer")} 38 °C</div>
          <div class="temp-bar"><i></i></div>
        </div></div>
      </div>`;
  }

  /* ---------------- settings ---------------- */
  function switchRow(label, path, checked) {
    return `<div class="setting-item"><span>${esc(label)}</span><label class="switch"><input type="checkbox" data-toggle="${esc(path)}" ${checked ? "checked" : ""} /><span></span></label></div>`;
  }
  function renderSettings() {
    const s = state.settings;
    return `
      ${screenHead("gear", "Einstellungen")}
      <div class="panel">
        <div class="settings-section">
          <h3>Allgemein</h3>
          <div class="settings-body">
            <div class="setting-item"><span>Ollama URL</span><input class="input mono" value="${esc(s.ollamaUrl)}" data-setting="settings.ollamaUrl" spellcheck="false" /></div>
            <div class="setting-item"><span>Standardmodell</span><select class="select" data-setting="settings.model">${MODELS.map((m) => `<option ${m.id === s.model ? "selected" : ""}>${esc(m.id)}</option>`).join("")}</select></div>
            <div class="setting-item"><span>Sprache</span><select class="select" data-setting="settings.language"><option ${s.language === "Deutsch" ? "selected" : ""}>Deutsch</option><option ${s.language === "English" ? "selected" : ""}>English</option></select></div>
            <div class="setting-item"><span>Theme</span><select class="select" data-setting="settings.theme"><option>Cyberpunk (Dark)</option><option>Plasma (Dark)</option><option>Amber (Dark)</option></select></div>
          </div>
        </div>
        <div class="settings-section">
          <h3>Sicherheit</h3>
          <div class="settings-body">
            ${switchRow("Safety-Controller", "settings.safety.controller", s.safety.controller)}
            ${switchRow("Autonomer Modus", "settings.safety.autonomous", s.safety.autonomous)}
            ${switchRow("Code-Ausführung", "settings.safety.codeExec", s.safety.codeExec)}
            ${switchRow("Netzwerkzugriff", "settings.safety.network", s.safety.network)}
          </div>
        </div>
        <div class="settings-section">
          <h3>System</h3>
          <div class="settings-body">
            <div class="setting-item"><span>Datenverzeichnis</span><input class="input mono" value="${esc(s.system.dir)}" data-setting="settings.system.dir" /></div>
            <div class="setting-item"><span>Logs behalten (Tage)</span><select class="select" data-setting="settings.system.logs">${[7, 14, 30, 60, 90].map((n) => `<option ${n === s.system.logs ? "selected" : ""}>${n}</option>`).join("")}</select></div>
            ${switchRow("Automatischer Start", "settings.system.autostart", s.system.autostart)}
          </div>
        </div>
      </div>`;
  }

  /* ---------------- menu ---------------- */
  function renderMenu() {
    const items = [
      { route: "agents", icon: "agent", label: "Agenten", desc: "8 Profile", color: "#2bd7ff" },
      { route: "models", icon: "brain", label: "KI-Modelle", desc: "Ollama Routing", color: "#a96bff" },
      { route: "mutation", icon: "skills", label: "Skill-Mutation", desc: "Skills verbessern", color: "#c45bff" },
      { route: "tasks", icon: "check-circle", label: "To-Do Tafel", desc: "6 Aufgaben", color: "#ff6f9c" },
      { route: "terminal", icon: "terminal", label: "Terminal", desc: "HORUS Linux", color: "#2bd7ff" },
      { route: "audit", icon: "clipboard", label: "Audit-Log", desc: `${state.audit.length} Einträge`, color: "#b25cff" },
      { route: "status", icon: "monitor", label: "Systemmonitor", desc: "Ressourcen", color: "#35d2ff" },
      { route: "settings", icon: "gear", label: "Einstellungen", desc: "Konfiguration", color: "#62b7ff" }
    ];
    return `
      ${screenHead("menu-dots", "Menü")}
      <div class="menu-grid">
        ${items.map((i) => `<a class="menu-item" href="#/${i.route}" style="--c:${i.color}">
          <span class="menu-icon">${icon(i.icon)}</span>
          <span><strong>${i.label}</strong><small>${i.desc}</small></span>
          <span class="chev">${icon("chevron")}</span>
        </a>`).join("")}
      </div>
      <div class="panel">${panelHead("shield", "Systemstatus", { right: `<span class="badge green"><span class="dot live"></span> Online</span>` })}<div class="panel-body">
        <div class="status-info">
          <div>${icon("cpu")} Host: HORUS Linux · Termux</div>
          <div>${icon("brain")} Agenten: 8 Profile · 8 Online</div>
          <div>${icon("loop")} Loop: Zyklus ${state.loop.cycle} / ${state.loop.total}</div>
        </div>
      </div></div>`;
  }

  /* ---------------- modals ---------------- */
  function openModal({ title, eyebrow = "NEXUS V7", body = "", footer = "", wide = false }) {
    ui.lastFocus = document.activeElement;
    $("#modalEyebrow").textContent = eyebrow;
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = body;
    $("#modalFoot").innerHTML = footer;
    $("#modalLayer").hidden = false;
    document.body.style.overflow = "hidden";
    const modal = $(".modal");
    if (modal) modal.style.width = wide ? "min(100%, 470px)" : "";
    setTimeout(() => { const first = $("#modalBody input, #modalBody select, #modalBody textarea, #modalFoot button"); if (first) first.focus({ preventScroll: true }); }, 30);
  }
  function closeModal() {
    $("#modalLayer").hidden = true;
    document.body.style.overflow = "";
    if (ui.lastFocus && typeof ui.lastFocus.focus === "function") ui.lastFocus.focus({ preventScroll: true });
    ui.lastFocus = null;
  }
  function openTaskModal() {
    openModal({
      title: "Neue Aufgabe",
      eyebrow: "TO-DO TAFEL",
      body: `<form data-form="task" id="taskForm">
        <div class="form-field"><label for="taskTitle">Titel</label><input class="input" id="taskTitle" name="title" required placeholder="Was soll erledigt werden?" /></div>
        <div class="form-grid">
          <div class="form-field"><label for="taskPriority">Priorität</label><select class="select" id="taskPriority" name="priority"><option value="hoch">Hoch</option><option value="mittel" selected>Mittel</option><option value="niedrig">Niedrig</option></select></div>
          <div class="form-field"><label for="taskAgent">Agent</label><select class="select" id="taskAgent" name="agent">${AGENTS.map((a) => `<option value="${a.id}">${esc(a.name)} (${a.code})</option>`).join("")}</select></div>
          <div class="form-field full"><label for="taskDue">Fällig</label><input class="input" id="taskDue" name="due" type="date" value="${todayISO()}" /></div>
        </div>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="taskForm">${icon("plus")} Anlegen</button>`
    });
  }
  function openProjectModal() {
    openModal({
      title: "Neues Projekt",
      eyebrow: "PROJEKTE",
      body: `<form data-form="project" id="projectForm">
        <div class="form-field"><label for="projectName">Name</label><input class="input" id="projectName" name="name" required placeholder="Projektname" /></div>
        <div class="form-grid">
          <div class="form-field"><label for="projectType">Typ</label><input class="input" id="projectType" name="type" value="Android / Python" /></div>
          <div class="form-field"><label for="projectStatus">Status</label><select class="select" id="projectStatus" name="status"><option>Aktiv</option><option>In Arbeit</option><option>Pause</option><option>Archiv</option></select></div>
        </div>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn primary" type="submit" form="projectForm">${icon("plus")} Anlegen</button>`
    });
  }
  function openProjectDetail(id) {
    const p = state.projects.find((x) => x.id === id);
    if (!p) return;
    openModal({
      title: p.name,
      eyebrow: "PROJEKTDETAILS",
      body: `<div class="between" style="margin-bottom:9px">
          <span class="project-icon" style="--c1:${p.c1};--c2:${p.c2};width:46px;height:46px">${icon(p.icon)}</span>
          <span class="grow" style="margin-left:9px"><strong style="font-size:13px">${esc(p.type)}</strong><div class="hint">${esc(p.desc)}</div></span>
          <span class="badge ${p.status === "Aktiv" ? "green" : p.status === "In Arbeit" ? "orange" : p.status === "Pause" ? "red" : "neutral"}">${esc(p.status)}</span>
        </div>
        <hr class="hr" />
        <div class="between"><span class="hint">Fortschritt</span><span class="mono small">${p.progress}%</span></div>
        <div class="cycle-bar" style="margin-top:5px"><i style="width:${p.progress}%"></i></div>
        <div class="form-grid" style="margin-top:10px">
          <div class="stat-box"><b style="font-size:12px">${formatDate(p.updated)}</b><small>GEÄNDERT</small></div>
          <div class="stat-box"><b style="font-size:12px">${state.tasks.filter((t) => t.status !== "erledigt").length}</b><small>OFFENE TASKS</small></div>
        </div>`,
      footer: `<button class="btn ghost" data-action="close-modal">Schließen</button><button class="btn primary" data-action="project-task" data-project="${p.id}">${icon("plus")} Aufgabe</button>`
    });
  }
  function openSkillModal(agentId) {
    const a = agentById(agentId) || AGENTS[0];
    openModal({
      title: "Neuen Skill hinzufügen",
      eyebrow: `${a.name.toUpperCase()} · ${a.code}`,
      body: `<form data-form="skill" id="skillForm" data-agent="${a.id}">
        <div class="form-field"><label for="skillName">Skill-Name</label><input class="input" id="skillName" name="name" required placeholder="z. B. Zeitreise-Logik" /></div>
        <div class="form-field"><label for="skillDesc">Beschreibung</label><textarea class="textarea" id="skillDesc" name="desc" style="min-height:62px"></textarea></div>
        <div class="form-field"><label for="skillLevel">Startlevel</label><input class="input" id="skillLevel" name="level" type="number" min="1" max="10" value="1" /></div>
      </form>`,
      footer: `<button class="btn ghost" data-action="close-modal">Abbrechen</button><button class="btn purple" type="submit" form="skillForm">${icon("plus")} Hinzufügen</button>`
    });
  }

  /* ---------------- loop engine ---------------- */
  function startLoop() {
    if (state.loop.running && !state.loop.paused) { toast("Loop läuft bereits", "warn"); return; }
    state.loop.running = true;
    state.loop.paused = false;
    if (state.loop.progress >= 100) { state.loop.progress = 0; state.loop.completed = 0; state.loop.elapsed = 0; }
    addAudit("system", "Loop", "Simulation gestartet");
    save();
    ensureLoopTimer();
    updateLoopUI();
    toast("Entwicklungsloop gestartet");
  }
  function pauseLoop() {
    if (!state.loop.running) { toast("Loop ist nicht aktiv", "warn"); return; }
    state.loop.paused = !state.loop.paused;
    addAudit("system", "Loop", state.loop.paused ? "pausiert" : "fortgesetzt");
    save();
    updateLoopUI();
    toast(state.loop.paused ? "Loop pausiert" : "Loop fortgesetzt");
  }
  function stopLoop() {
    state.loop.running = false;
    state.loop.paused = false;
    state.loop.progress = 0;
    state.loop.completed = 0;
    state.loop.elapsed = 0;
    addAudit("system", "Loop", "gestoppt und zurückgesetzt");
    save();
    updateLoopUI();
    renderRoute();
    toast("Loop gestoppt");
  }
  function ensureLoopTimer() {
    if (ui.timer) return;
    ui.timer = setInterval(() => {
      const loop = state.loop;
      if (!loop.running || loop.paused) return;
      loop.progress = Math.min(100, loop.progress + 1.2 + Math.random() * 2.2);
      loop.completed = Math.max(loop.completed, Math.min(LOOP_PHASES.length, Math.floor((loop.progress / 100) * LOOP_PHASES.length)));
      loop.elapsed += 1.2 * (Number(loop.interval) || 5) / 5;
      const phase = LOOP_PHASES[Math.min(LOOP_PHASES.length - 1, loop.completed)];
      loop.phase = phase;
      loop.lastAction = phase === "Tests" ? "Testlauf" : phase === "Freigabe" ? "Safety-Check" : phase;
      loop.nextAction = LOOP_PHASES[Math.min(LOOP_PHASES.length - 1, loop.completed + 1)];
      if (loop.progress >= 100) {
        const completedCycle = loop.cycle;
        loop.cycle = loop.cycle >= loop.total ? 1 : loop.cycle + 1;
        loop.progress = 0;
        loop.completed = 0;
        loop.elapsed = 0;
        addAudit("system", "Loop", `Zyklus ${completedCycle} abgeschlossen`);
        toast(`Zyklus ${completedCycle} abgeschlossen`);
      }
      save();
      updateLoopUI();
    }, 1200);
  }
  function updateLoopUI() {
    const loop = state.loop;
    const c = 2 * Math.PI * 63;
    const ring = $("#loopRingProg");
    if (ring) ring.setAttribute("stroke-dashoffset", (c * (1 - loop.progress / 100)).toFixed(1));
    const pct = $("#loopPctText");
    if (pct) pct.textContent = `${Math.round(loop.progress)}%`;
    const phaseList = $("#loopPhaseList");
    if (phaseList) phaseList.innerHTML = loopPhaseList();
    const phaseEl = $("#loopStatusPhase");
    if (phaseEl) phaseEl.textContent = LOOP_PHASES[Math.min(LOOP_PHASES.length - 1, loop.completed)] || "Analyse";
    const lastEl = $("#loopLastAction");
    if (lastEl) lastEl.textContent = loop.lastAction;
    const nextEl = $("#loopNextAction");
    if (nextEl) nextEl.textContent = loop.nextAction;
    const elapsedEl = $("#loopElapsed");
    if (elapsedEl) elapsedEl.textContent = formatElapsed(loop.elapsed);
    const dashBar = $("#dashLoopBar");
    if (dashBar) dashBar.style.width = `${loop.progress}%`;
    const dashPct = $("#dashLoopPct");
    if (dashPct) dashPct.textContent = `${Math.round(loop.progress)}%`;
    const dashPhases = $("#dashPhases");
    if (dashPhases) dashPhases.innerHTML = dashboardPhases();
  }

  /* ---------------- ollama ---------------- */
  async function testConnection() {
    if (ui.connectionBusy) return;
    ui.connectionBusy = true;
    toast("Prüfe Ollama-Verbindung…");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch(`${state.settings.ollamaUrl.replace(/\/$/, "")}/api/tags`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.connection = { status: "ok", checkedAt: Date.now(), models: Array.isArray(data.models) ? data.models.map((m) => m.name) : [] };
      addAudit("system", "Ollama", `verbunden · ${state.connection.models.length} Modelle`);
      toast("Ollama-Verbindung erfolgreich");
    } catch {
      state.connection = { status: "error", checkedAt: Date.now(), models: [] };
      addAudit("system", "Ollama", "nicht erreichbar · Demo-Modus");
      toast("Ollama nicht erreichbar – Demo-Modus", "warn");
    } finally {
      clearTimeout(timer);
      ui.connectionBusy = false;
      save();
      if (["models", "home"].includes(getRoute())) renderRoute();
    }
  }
  async function sendModelTest() {
    const prompt = state.modelTest.prompt.trim();
    if (!prompt) { toast("Bitte eine Frage eingeben", "warn"); return; }
    const answerEl = $("#modelAnswer");
    if (answerEl) answerEl.textContent = "Denke nach …";
    if (state.connection.status === "ok") {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      try {
        const res = await fetch(`${state.settings.ollamaUrl.replace(/\/$/, "")}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: state.modelTest.model || state.settings.model, prompt, stream: false }),
          signal: ctrl.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.response) {
          state.modelTest.answer = data.response.trim();
          clearTimeout(timer);
          save();
          if (answerEl) answerEl.textContent = state.modelTest.answer;
          toast("Antwort empfangen");
          return;
        }
      } catch { /* fall through to demo */ }
      clearTimeout(timer);
    }
    await new Promise((resolve) => setTimeout(resolve, 550));
    state.modelTest.answer = demoAnswer(prompt);
    addAudit("system", "Ollama", "Demo-Antwort erzeugt");
    save();
    if (answerEl) answerEl.textContent = state.modelTest.answer;
    toast("Demo-Antwort erzeugt");
  }
  function demoAnswer(prompt) {
    const base = "NEXUS V7 ist ein lokales KI-Büro für Android, das mehrere spezialisierte KI-Agenten mit Ollama-Modellen verbindet, um Projekte autonom zu planen, zu entwickeln, zu testen und zu verbessern.";
    if (/loop|zyklus/i.test(prompt)) return `${base}\n\nDer Entwicklungsloop arbeitet in sieben Phasen: Analyse, Planung, Freigabe, Entwicklung, Tests, Fehlerbehebung und Lernen. Jede Phase wird lokal protokolliert.`;
    return base;
  }

  /* ---------------- terminal commands ---------------- */
  function runTerminalCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    if (cmd === "clear") {
      state.terminal = [];
      save();
      renderRoute();
      return;
    }
    const next = [{ type: "prompt", cmd }];
    if (cmd === "help") {
      next.push({ type: "out", text: "Befehle: help, status, git status, ollama list, python server.py, ls, neofetch, audit, clear" });
    } else if (cmd === "git status") {
      next.push({ type: "out", text: "Auf Branch main\nnichts zu committen, Arbeitsverzeichnis sauber" });
    } else if (cmd === "ollama list") {
      next.push({ type: "out", text: "NAME         ID       SIZE   MODIFIED\nqwen2.5      a1b2c3d4 4.1 GB 2 days ago\ndeepseek-r1  d4c3b2a1 7.8 GB 3 days ago\nllama3       e5f6a7b8 4.7 GB 5 days ago\nmistral      b7c8d9e0 4.3 GB 1 day ago" });
    } else if (cmd === "python server.py") {
      next.push({ type: "out", text: "* Running on http://127.0.0.1:5000\n* Press CTRL+C to quit" });
    } else if (cmd === "ls") {
      next.push({ type: "out", text: state.projects.map((p) => p.name.toLowerCase().replace(/\s+/g, "_")).join("  ") });
    } else if (cmd === "status") {
      next.push({ type: "out", text: `NEXUS V7 · ${state.connection.status === "ok" ? "Ollama verbunden" : "Demo-Modus"}\nLoop: Zyklus ${state.loop.cycle}/${state.loop.total} · ${Math.round(state.loop.progress)}%\nOffene Aufgaben: ${state.tasks.filter((t) => t.status !== "erledigt").length}` });
    } else if (cmd === "audit") {
      next.push({ type: "out", text: state.audit.slice(0, 5).map((a) => `${a.time}  ${a.type}  ${a.actor} ${a.text}`).join("\n") });
    } else if (cmd === "neofetch") {
      next.push({ type: "out", text: "       /\\        nexus@horus\n      /  \\       ------------\n     / /\\ \\      OS: HORUS Linux (Termux)\n    / ____ \\     Shell: bash 5.2\n   /_/    \\_\\    Agents: 8 online\n                 Loop: 7 phases" });
    } else if (cmd.startsWith("echo ")) {
      next.push({ type: "out", text: cmd.slice(5) });
    } else {
      next.push({ type: "err", text: `bash: ${cmd}: Kommando nicht gefunden` });
    }
    state.terminal.push(...next);
    state.terminal = state.terminal.slice(-120);
    addAudit("system", "Terminal", cmd);
    save();
    renderRoute();
    setTimeout(() => {
      const out = $("#termOutput");
      if (out) out.scrollTop = out.scrollHeight;
      const input = $("#termInput");
      if (input) input.focus({ preventScroll: true });
    }, 30);
  }

  /* ---------------- actions ---------------- */
  function handleAction(action, el) {
    switch (action) {
      case "close-modal": closeModal(); break;
      case "open-menu": navigate("menu"); break;
      case "open-settings": navigate("settings"); break;
      case "back": navigate("agents"); break;
      case "open-terminal": navigate("terminal"); break;
      case "open-file": navigate("terminal"); setTimeout(() => toast("Dateisystem über Terminal geöffnet"), 50); break;
      case "open-audit": navigate("audit"); break;
      case "open-task": openTaskModal(); break;
      case "open-project": openProjectModal(); break;
      case "open-project-detail": openProjectDetail(el.dataset.project); break;
      case "add-skill": openSkillModal(el.dataset.agent); break;
      case "agent-open":
        state.ui.selectedAgent = el.dataset.agent;
        state.ui.agentTab = "skills";
        save();
        navigate("agent");
        break;
      case "agent-tab":
        state.ui.agentTab = el.dataset.tab;
        save();
        renderRoute();
        break;
      case "skill-edit": {
        state.ui.mutationAgent = el.dataset.agent;
        state.ui.mutationSkill = el.dataset.skill;
        state.ui.mutationMode = "manuell";
        save();
        navigate("mutation");
        break;
      }
      case "mutation-mode":
        state.ui.mutationMode = el.dataset.mode;
        save();
        renderRoute();
        break;
      case "mutation-run": {
        const agent = mutationAgent();
        const skill = skillsFor(agent).find((s) => s.name === state.ui.mutationSkill);
        const from = skill ? skill.level : agent.level;
        const to = Math.min(10, from + 1);
        if (skill) skill.level = to;
        if (skill) state.skillLevels[`${agent.id}:${skill.name}`] = to;
        agent.level = Math.max(agent.level, to);
        state.agentLevels[agent.id] = agent.level;
        const result = state.mutationResult;
        state.mutationResult = {
          levelFrom: from, levelTo: to,
          versionFrom: result.versionTo, versionTo: result.versionTo + 1,
          hash: `${Math.random().toString(16).slice(2, 8)}… → ${Math.random().toString(16).slice(2, 8)}…`
        };
        addAudit("mutation", agent.name, `/ ${state.ui.mutationSkill} Lv. ${from} → ${to}`);
        save();
        renderRoute();
        toast(`Mutation ausgeführt: ${state.ui.mutationSkill} Lv. ${to}`);
        break;
      }
      case "model-select":
        state.settings.model = el.dataset.model;
        addAudit("system", "Modell", `Standardmodell → ${el.dataset.model}`);
        save();
        renderRoute();
        toast(`Modell gewählt: ${el.dataset.model}`);
        break;
      case "model-send": sendModelTest(); break;
      case "test-connection": testConnection(); break;
      case "system-check":
        testConnection();
        toast("Systemcheck gestartet");
        break;
      case "loop-start": startLoop(); break;
      case "loop-pause": pauseLoop(); break;
      case "loop-stop": stopLoop(); break;
      case "project-filter":
        state.ui.projectFilter = el.dataset.filter;
        save();
        renderRoute();
        break;
      case "project-open": openProjectDetail(el.dataset.project); break;
      case "project-task":
        closeModal();
        openTaskModal();
        break;
      case "task-filter":
        state.ui.taskFilter = el.dataset.filter;
        save();
        renderRoute();
        break;
      case "task-toggle": {
        const task = state.tasks.find((t) => t.id === el.dataset.task);
        if (!task) break;
        task.status = task.status === "erledigt" ? "offen" : "erledigt";
        addAudit("note_update", "", `${task.title} → ${task.status}`);
        save();
        renderRoute();
        toast(task.status === "erledigt" ? "Aufgabe erledigt" : "Aufgabe wieder geöffnet");
        break;
      }
      case "term-tab":
        state.ui.terminalTab = el.dataset.tab;
        save();
        renderRoute();
        break;
      case "term-new":
        state.terminal = [{ type: "out", text: "Neue Terminal-Sitzung · nexus@horus" }];
        state.ui.terminalTab = "terminal";
        save();
        renderRoute();
        break;
      case "audit-filter":
        state.ui.auditFilter = el.dataset.filter;
        save();
        renderRoute();
        break;
      case "audit-all":
        state.ui.auditFilter = "Alle";
        save();
        renderRoute();
        break;
      default: break;
    }
  }

  function handleForm(form) {
    const type = form.dataset.form;
    if (type === "terminal") {
      const input = $("#termInput");
      const value = input ? input.value : "";
      if (input) input.value = "";
      runTerminalCommand(value);
      return;
    }
    if (type === "task") {
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      if (!title) return;
      state.tasks.unshift({ id: uid("t"), title, priority: String(data.get("priority") || "mittel"), status: "offen", agent: String(data.get("agent") || "rick"), due: String(data.get("due") || todayISO()) });
      addAudit("note_create", "", title);
      save();
      closeModal();
      state.ui.taskFilter = "alle";
      save();
      renderRoute();
      toast("Aufgabe angelegt");
      return;
    }
    if (type === "project") {
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      if (!name) return;
      const colors = [["#146dff", "#0c3fa0"], ["#ff9d22", "#c74b07"], ["#8d4cff", "#4c17a8"], ["#25d16d", "#0b7437"]];
      const c = colors[state.projects.length % colors.length];
      state.projects.unshift({ id: uid("p"), name, type: String(data.get("type") || "Projekt"), status: String(data.get("status") || "Aktiv"), updated: todayISO(), icon: "folder", c1: c[0], c2: c[1], progress: 0, desc: "Neu angelegtes Projekt." });
      addAudit("system", "Projekt", `${name} angelegt`);
      save();
      closeModal();
      state.ui.projectFilter = "alle";
      save();
      renderRoute();
      toast("Projekt angelegt");
      return;
    }
    if (type === "skill") {
      const data = new FormData(form);
      const agent = agentById(form.dataset.agent) || AGENTS[0];
      const name = String(data.get("name") || "").trim();
      if (!name) return;
      if (!state.customSkills[agent.id]) state.customSkills[agent.id] = [];
      state.customSkills[agent.id].push({ name, level: Number(data.get("level")) || 1, desc: String(data.get("desc") || "Neuer Skill."), icon: "skills" });
      addAudit("skill", agent.name, `/ ${name} hinzugefügt`);
      save();
      closeModal();
      state.ui.selectedAgent = agent.id;
      state.ui.agentTab = "skills";
      save();
      navigate("agent");
      toast(`Skill ${name} hinzugefügt`);
    }
  }

  function handleSettingChange(el) {
    if (!el.dataset.setting) return;
    const path = el.dataset.setting;
    let value;
    if (el.type === "checkbox") value = el.checked;
    else if (el.type === "number") value = Number(el.value);
    else value = el.value;
    setPath(state, path, value);
    addAudit("system", "Einstellungen", `${path} geändert`);
    save();
    toast("Einstellung gespeichert");
    if (path === "settings.model" && getRoute() === "models") renderRoute();
  }

  function handleToggle(el) {
    const path = el.dataset.toggle;
    if (!path) return;
    if (path.startsWith("ui.")) { setPath(state.ui, path.slice(3), el.checked); save(); return; }
    if (path.startsWith("loop")) {
      if (path === "loopAutonomous") state.loop.autonomous = el.checked;
      if (path === "loopSafety") state.loop.safety = el.checked;
      addAudit("safety", "Loop", `${path} → ${el.checked ? "an" : "aus"}`);
      save();
      return;
    }
    setPath(state, path, el.checked);
    addAudit("safety", "Einstellungen", `${path} → ${el.checked ? "an" : "aus"}`);
    save();
    toast("Sicherheitseinstellung gespeichert");
  }

  function handleLoopChange(el) {
    const type = el.dataset.change;
    if (type === "loop-total") state.loop.total = Number(el.value) || 10;
    if (type === "loop-interval") state.loop.interval = Number(el.value) || 5;
    if (type === "loop-mutation") state.loop.mutationChance = Math.max(0, Math.min(100, Number(el.value) || 0));
    if (type === "test-model") state.modelTest.model = el.value;
    if (type === "mutation-agent") {
      state.ui.mutationAgent = el.value;
      const a = agentById(el.value);
      state.ui.mutationSkill = (skillsFor(a)[0] || {}).name || "";
    }
    if (type === "mutation-skill") state.ui.mutationSkill = el.value.replace(/\s*\(Lv\.\s*\d+\)$/, "");
    save();
    if (type === "mutation-agent") renderRoute();
  }

  function handleBindInput(el) {
    const path = el.dataset.bind;
    if (!path) return;
    if (path === "modelTest.prompt") state.modelTest.prompt = el.value;
    if (path === "mutationContent") {
      state.ui.mutationContent = el.value;
      const counter = $("#mutationCounter");
      if (counter) counter.textContent = `${el.value.length}/500`;
    }
    save();
  }

  /* ---------------- clock ---------------- */
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const el = $("#statusClock");
    if (el) el.textContent = time;
  }

  /* ---------------- init ---------------- */
  function init() {
    buildNav();
    if (!location.hash) history.replaceState(null, "", "#/home");
    renderRoute();
    updateClock();
    setInterval(updateClock, 30000);
    if (state.loop.running) ensureLoopTimer();
  }

  document.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.dataset.action;
      const isLink = actionEl.tagName === "A" && actionEl.getAttribute("href")?.startsWith("#/");
      if (isLink) {
        if (action === "close-modal") closeModal();
      } else {
        event.preventDefault();
      }
      handleAction(action, actionEl);
      return;
    }
    const switchEl = event.target.closest(".switch");
    if (switchEl) {
      event.preventDefault();
      const input = switchEl.querySelector("input");
      if (input) {
        input.checked = !input.checked;
        handleToggle(input);
      }
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    handleForm(form);
  });

  document.addEventListener("change", (event) => {
    const el = event.target;
    if (el.dataset.setting) handleSettingChange(el);
    else if (el.dataset.toggle) handleToggle(el);
    else if (el.dataset.change) handleLoopChange(el);
  });

  document.addEventListener("input", (event) => {
    const el = event.target;
    if (el.dataset.bind) handleBindInput(el);
    if (el.dataset.setting && el.type !== "checkbox") {
      setPath(state, el.dataset.setting, el.type === "number" ? Number(el.value) : el.value);
      save();
    }
  });

  window.addEventListener("hashchange", renderRoute);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#modalLayer").hidden) closeModal();
  });

  init();
})();
