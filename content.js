// ================= OPTIONS =================
const OPTIONS = ["None", "To Do", "In Progress", "Done", "Ignore"];

const STATUS_STYLES = {
    "None":        { bg: "",        color: ""    },
    "To Do":       { bg: "#1976d2", color: "#fff" },
    "In Progress": { bg: "#f57c00", color: "#fff" },
    "Done":        { bg: "#388e3c", color: "#fff" },
    "Ignore":      { bg: "#d32f2f", color: "#fff" }
};

const STAT_META = [
    { key: "To Do",       color: "#1976d2" },
    { key: "In Progress", color: "#f57c00" },
    { key: "Done",        color: "#388e3c" },
    { key: "Ignore",      color: "#d32f2f" }
];

const FILTER_LIST = ["All", "To Do", "In Progress", "Done", "Ignore"];
const FILTER_COLORS = {
    "All":         "#555",
    "To Do":       "#1976d2",
    "In Progress": "#f57c00",
    "Done":        "#388e3c",
    "Ignore":      "#d32f2f"
};

// ================= STORAGE =================
function parseStoredValue(raw) {
    if (!raw) return { status: "None", reason: "" };
    if (typeof raw === "string") return { status: raw, reason: "" };
    return { status: raw.status || "None", reason: raw.reason || "" };
}

function isContextValid() {
    try { return !!chrome.runtime?.id; } catch { return false; }
}

function getTarget(codename) {
    return new Promise(resolve => {
        if (!isContextValid()) return resolve({ status: "None", reason: "" });
        try {
            chrome.storage.local.get([codename], r => {
                if (chrome.runtime.lastError) return resolve({ status: "None", reason: "" });
                resolve(parseStoredValue(r[codename]));
            });
        } catch { resolve({ status: "None", reason: "" }); }
    });
}

function setTarget(codename, status, reason = "") {
    return new Promise(resolve => {
        if (!isContextValid()) return resolve();
        try {
            chrome.storage.local.set({ [codename]: { status, reason } }, () => {
                if (chrome.runtime.lastError) return resolve();
                resolve();
            });
        } catch { resolve(); }
    });
}

function getAllTargets() {
    return new Promise(resolve => {
        if (!isContextValid()) return resolve({});
        try {
            chrome.storage.local.get(null, result => {
                if (chrome.runtime.lastError) return resolve({});
                const out = {};
                for (const [k, v] of Object.entries(result)) out[k] = parseStoredValue(v);
                resolve(out);
            });
        } catch { resolve({}); }
    });
}

// ================= INJECT CSS =================
function injectStyles() {
    if (document.getElementById("hm-styles")) return;
    const el = document.createElement("style");
    el.id = "hm-styles";
    el.textContent = `
        #hm-panel {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            width: 340px !important;
            height: 100vh !important;
            background: #111 !important;
            border-left: 1px solid #252525 !important;
            z-index: 2147483646 !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            display: flex !important;
            flex-direction: column !important;
            transform: translateX(100%) !important;
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1) !important;
            box-shadow: -8px 0 40px rgba(0,0,0,0.8) !important;
            color: #e0e0e0 !important;
            box-sizing: border-box !important;
        }
        #hm-panel.hm-open {
            transform: translateX(0) !important;
        }

        #hm-tab {
            position: fixed !important;
            top: 50% !important;
            right: 0 !important;
            transform: translateY(-50%) !important;
            background: linear-gradient(160deg, #1976d2 0%, #1565c0 50%, #388e3c 100%) !important;
            color: #fff !important;
            writing-mode: vertical-rl !important;
            text-orientation: mixed !important;
            padding: 16px 8px !important;
            border-radius: 8px 0 0 8px !important;
            cursor: pointer !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            letter-spacing: 2.5px !important;
            text-shadow: 0 1px 4px rgba(0,0,0,0.55) !important;
            z-index: 2147483647 !important;
            transition: right 0.28s cubic-bezier(0.4,0,0.2,1) !important;
            box-shadow: -3px 0 16px rgba(0,0,0,0.6) !important;
            user-select: none !important;
            font-family: system-ui, sans-serif !important;
        }
        #hm-tab.hm-open {
            right: 340px !important;
        }
        #hm-tab:hover {
            filter: brightness(1.15) !important;
        }
        #hm-tab-tier-wrap {
            display: inline-flex !important;
            flex-direction: column !important;
            align-items: center !important;
            writing-mode: horizontal-tb !important;
            margin-top: 10px !important;
            margin-bottom: 4px !important;
            gap: 3px !important;
        }
        .hm-tier-seg {
            width: 18px !important;
            height: 13px !important;
            border-radius: 3px !important;
            background: rgba(0,0,0,0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 9px !important;
            font-weight: 900 !important;
            color: rgba(255,255,255,0.35) !important;
            transition: all 0.25s !important;
            writing-mode: horizontal-tb !important;
        }
        .hm-tier-seg.hm-tier-filled {
            background: rgba(255,255,255,0.18) !important;
            color: rgba(255,255,255,0.7) !important;
        }
        .hm-tier-seg.hm-tier-current {
            background: #fff !important;
            color: #1565c0 !important;
            font-size: 10px !important;
            box-shadow: 0 0 8px rgba(255,255,255,0.5) !important;
        }
        #hm-tab-pts {
            margin-top: 8px !important;
            font-size: 14px !important;
            font-weight: 900 !important;
            letter-spacing: 1px !important;
            text-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;
        }
        #hm-tab-pts-label {
            margin-top: 3px !important;
            font-size: 9px !important;
            font-weight: 700 !important;
            letter-spacing: 1px !important;
            opacity: 0.85 !important;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
        }

        /* ---- Header ---- */
        #hm-header {
            display: flex !important;
            align-items: center !important;
            padding: 16px 18px 14px !important;
            border-bottom: 1px solid #1e1e1e !important;
            flex-shrink: 0 !important;
            gap: 10px !important;
        }
        .hm-logo {
            font-size: 15px !important;
            font-weight: 800 !important;
            letter-spacing: 0.5px !important;
            background: linear-gradient(135deg, #42a5f5, #66bb6a) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            flex: 1 !important;
        }
        .hm-header-count {
            font-size: 11px !important;
            color: #555 !important;
            font-weight: 500 !important;
        }

        /* ---- Stats grid ---- */
        #hm-stats {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            padding: 14px 18px !important;
            border-bottom: 1px solid #1e1e1e !important;
            flex-shrink: 0 !important;
        }
        .hm-stat-card {
            background: #181818 !important;
            border: 1px solid #222 !important;
            border-radius: 8px !important;
            padding: 10px 12px !important;
        }
        .hm-stat-num {
            font-size: 24px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            font-variant-numeric: tabular-nums !important;
        }
        .hm-stat-label {
            font-size: 9px !important;
            color: #666 !important;
            margin-top: 4px !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.8px !important;
        }

        /* ---- Synack vuln stats ---- */
        #hm-vuln-stats {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            padding: 10px 18px 12px !important;
            border-bottom: 1px solid #1e1e1e !important;
            flex-shrink: 0 !important;
        }
        #hm-vuln-section-label {
            grid-column: 1 / -1 !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            color: #3a3a3a !important;
            text-transform: uppercase !important;
            letter-spacing: 1.2px !important;
            margin-bottom: 2px !important;
        }
        .hm-vuln-card {
            background: #181818 !important;
            border: 1px solid #222 !important;
            border-radius: 8px !important;
            padding: 9px 12px !important;
        }
        .hm-vuln-num {
            font-size: 22px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            font-variant-numeric: tabular-nums !important;
        }
        .hm-vuln-label {
            font-size: 8px !important;
            color: #555 !important;
            margin-top: 4px !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.7px !important;
        }

        /* ---- Filter bar ---- */
        #hm-filters {
            display: flex !important;
            gap: 5px !important;
            padding: 10px 18px !important;
            border-bottom: 1px solid #1e1e1e !important;
            flex-shrink: 0 !important;
            flex-wrap: wrap !important;
        }
        .hm-filter-btn {
            padding: 4px 10px !important;
            border-radius: 20px !important;
            border: 1px solid #2a2a2a !important;
            background: transparent !important;
            color: #666 !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            transition: all 0.15s !important;
            font-family: inherit !important;
            letter-spacing: 0.3px !important;
        }
        .hm-filter-btn:hover {
            border-color: #444 !important;
            color: #aaa !important;
        }
        .hm-filter-btn.hm-active {
            color: #fff !important;
            border-color: transparent !important;
        }

        /* ---- Target list ---- */
        #hm-list {
            flex: 1 !important;
            overflow-y: auto !important;
            padding: 6px 0 !important;
        }
        #hm-list::-webkit-scrollbar { width: 3px !important; }
        #hm-list::-webkit-scrollbar-track { background: transparent !important; }
        #hm-list::-webkit-scrollbar-thumb { background: #2a2a2a !important; border-radius: 4px !important; }

        .hm-item {
            padding: 11px 18px !important;
            border-bottom: 1px solid #171717 !important;
            transition: background 0.12s !important;
        }
        .hm-item:hover { background: #171717 !important; }
        .hm-item:last-child { border-bottom: none !important; }

        .hm-item-row {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }
        .hm-item-dot {
            width: 7px !important;
            height: 7px !important;
            border-radius: 50% !important;
            flex-shrink: 0 !important;
        }
        .hm-item-name {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #d0d0d0 !important;
            flex: 1 !important;
            font-family: 'Courier New', monospace !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }
        .hm-item-sel {
            padding: 3px 6px !important;
            border-radius: 5px !important;
            border: 1px solid #2a2a2a !important;
            background: #1a1a1a !important;
            color: #ccc !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            font-family: inherit !important;
            flex-shrink: 0 !important;
            transition: border-color 0.15s !important;
        }
        .hm-item-sel:focus { outline: none !important; }
        .hm-item-sel option { background: #1a1a1a !important; }

        /* ---- Reason row (Ignore) ---- */
        .hm-reason-row {
            display: flex !important;
            align-items: center !important;
            margin-top: 8px !important;
            gap: 6px !important;
            padding-left: 15px !important;
        }
        .hm-reason-tag {
            font-size: 9px !important;
            color: #c62828 !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.6px !important;
            flex-shrink: 0 !important;
        }
        .hm-reason-input {
            flex: 1 !important;
            padding: 4px 8px !important;
            background: #181818 !important;
            border: 1px solid #2a2a2a !important;
            border-radius: 5px !important;
            color: #bbb !important;
            font-size: 11px !important;
            font-family: inherit !important;
            outline: none !important;
            transition: border-color 0.15s !important;
        }
        .hm-reason-input:focus { border-color: #c62828 !important; }
        .hm-reason-input::placeholder { color: #444 !important; }

        /* ---- Empty states ---- */
        .hm-empty {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            padding: 48px 24px !important;
            color: #444 !important;
            font-size: 12px !important;
            text-align: center !important;
            gap: 10px !important;
            line-height: 1.5 !important;
        }
        .hm-empty-icon {
            font-size: 36px !important;
            opacity: 0.4 !important;
        }
    `;
    (document.head || document.documentElement).appendChild(el);
}

// ================= PANEL STATE =================
let activeFilter = "All";

// ================= CREATE PANEL =================
function createSidePanel() {
    if (document.getElementById("hm-panel")) return;
    injectStyles();

    // Vertical tab (toggle handle)
    const tab = document.createElement("div");
    tab.id = "hm-tab";
    tab.innerHTML = `<span>HUNTMARK</span><span id="hm-tab-tier-wrap"><span class="hm-tier-seg" id="hm-tier-seg-5">5</span><span class="hm-tier-seg" id="hm-tier-seg-4">4</span><span class="hm-tier-seg" id="hm-tier-seg-3">3</span><span class="hm-tier-seg" id="hm-tier-seg-2">2</span><span class="hm-tier-seg" id="hm-tier-seg-1">1</span></span><span id="hm-tab-pts"></span><span id="hm-tab-pts-label"></span>`;
    tab.addEventListener("click", togglePanel);
    document.body.appendChild(tab);

    // Side panel
    const panel = document.createElement("div");
    panel.id = "hm-panel";

    // -- Header --
    const header = document.createElement("div");
    header.id = "hm-header";

    const logo = document.createElement("span");
    logo.className = "hm-logo";
    logo.textContent = "HuntMark";

    const totalBadge = document.createElement("span");
    totalBadge.className = "hm-header-count";
    totalBadge.id = "hm-total";
    totalBadge.textContent = "0 tracked";

    header.appendChild(logo);
    header.appendChild(totalBadge);
    panel.appendChild(header);

    // -- Stats 2x2 grid --
    const statsGrid = document.createElement("div");
    statsGrid.id = "hm-stats";

    STAT_META.forEach(({ key, color }) => {
        const card = document.createElement("div");
        card.className = "hm-stat-card";
        card.dataset.statKey = key;
        card.style.borderLeft = `3px solid ${color}`;

        const num = document.createElement("div");
        num.className = "hm-stat-num";
        num.style.color = color;
        num.textContent = "0";

        const lbl = document.createElement("div");
        lbl.className = "hm-stat-label";
        lbl.textContent = key;

        card.appendChild(num);
        card.appendChild(lbl);
        statsGrid.appendChild(card);
    });

    panel.appendChild(statsGrid);

    // -- Synack vuln stats --
    const vulnStats = document.createElement("div");
    vulnStats.id = "hm-vuln-stats";

    const vulnLabel = document.createElement("div");
    vulnLabel.id = "hm-vuln-section-label";
    vulnLabel.textContent = "Synack · Vulns";
    vulnStats.appendChild(vulnLabel);

    [
        { id: "hm-vuln-under-review", color: "#ff8f00", label: "Under Review" },
        { id: "hm-vuln-pending",      color: "#7c3aed", label: "Pending"      }
    ].forEach(({ id, color, label }) => {
        const card = document.createElement("div");
        card.className = "hm-vuln-card";
        card.style.borderLeft = `3px solid ${color}`;

        const num = document.createElement("div");
        num.className = "hm-vuln-num";
        num.style.color = color;
        num.id = id;
        num.textContent = "—";

        const lbl = document.createElement("div");
        lbl.className = "hm-vuln-label";
        lbl.textContent = label;

        card.appendChild(num);
        card.appendChild(lbl);
        vulnStats.appendChild(card);
    });

    panel.appendChild(vulnStats);

    // -- Filter bar --
    const filterBar = document.createElement("div");
    filterBar.id = "hm-filters";

    FILTER_LIST.forEach(f => {
        const btn = document.createElement("button");
        btn.className = "hm-filter-btn" + (f === "All" ? " hm-active" : "");
        btn.textContent = f;
        btn.dataset.filter = f;
        if (f === "All") btn.style.background = "#252525";

        btn.addEventListener("click", () => {
            activeFilter = f;
            filterBar.querySelectorAll(".hm-filter-btn").forEach(b => {
                b.classList.remove("hm-active");
                b.style.background = "transparent";
                b.style.color = "";
            });
            btn.classList.add("hm-active");
            btn.style.background = FILTER_COLORS[f];
            btn.style.color = "#fff";
            refreshPanel();
        });

        filterBar.appendChild(btn);
    });

    // Set initial "All" active style
    filterBar.querySelector('[data-filter="All"]').style.background = "#252525";

    panel.appendChild(filterBar);

    // -- Target list --
    const list = document.createElement("div");
    list.id = "hm-list";
    panel.appendChild(list);

    document.body.appendChild(panel);
    updateTabPoints();
    updateVulnStats();
}

// ================= TOGGLE =================
function togglePanel() {
    const panel = document.getElementById("hm-panel");
    const tab   = document.getElementById("hm-tab");
    if (!panel) return;

    const opening = !panel.classList.contains("hm-open");
    panel.classList.toggle("hm-open", opening);
    tab.classList.toggle("hm-open", opening);

    if (opening) { refreshPanel(); updateTabPoints(); updateVulnStats(); }
}

// ================= REFRESH =================
async function refreshPanel() {
    const panel = document.getElementById("hm-panel");
    if (!panel?.classList.contains("hm-open")) return;

    const targets = await getAllTargets();

    // Update stat counts
    const counts = { "To Do": 0, "In Progress": 0, "Done": 0, "Ignore": 0 };
    let total = 0;
    for (const { status } of Object.values(targets)) {
        if (status !== "None") total++;
        if (counts[status] !== undefined) counts[status]++;
    }

    document.querySelectorAll("#hm-stats .hm-stat-card").forEach(card => {
        card.querySelector(".hm-stat-num").textContent = counts[card.dataset.statKey] ?? 0;
    });

    const totalEl = document.getElementById("hm-total");
    if (totalEl) totalEl.textContent = `${total} tracked`;

    // Render filtered list
    const list = document.getElementById("hm-list");
    if (!list) return;
    list.innerHTML = "";

    const entries = Object.entries(targets).filter(([, { status }]) =>
        activeFilter === "All" || status === activeFilter
    );

    const ORDER = { "To Do": 0, "In Progress": 1, "Done": 2, "Ignore": 3, "None": 4 };
    entries.sort(([a, da], [b, db]) => {
        const d = (ORDER[da.status] ?? 4) - (ORDER[db.status] ?? 4);
        return d !== 0 ? d : a.localeCompare(b);
    });

    if (entries.length === 0) {
        const empty = document.createElement("div");
        empty.className = "hm-empty";
        const icon = document.createElement("div");
        icon.className = "hm-empty-icon";
        icon.textContent = "🎯";
        const msg = document.createElement("div");
        msg.textContent = activeFilter === "All"
            ? "No targets tracked yet.\nMark targets on the page to see them here."
            : `No targets with status "${activeFilter}".`;
        empty.appendChild(icon);
        empty.appendChild(msg);
        list.appendChild(empty);
        return;
    }

    entries.forEach(([codename, data]) => list.appendChild(buildItem(codename, data)));
}

// ================= BUILD LIST ITEM =================
function buildItem(codename, { status, reason }) {
    const item = document.createElement("div");
    item.className = "hm-item";

    // Top row: dot + name + status select
    const row = document.createElement("div");
    row.className = "hm-item-row";

    const dot = document.createElement("span");
    dot.className = "hm-item-dot";
    dot.style.backgroundColor = STATUS_STYLES[status]?.bg || "#444";

    const name = document.createElement("span");
    name.className = "hm-item-name";
    name.textContent = codename;
    name.title = codename;

    const sel = document.createElement("select");
    sel.className = "hm-item-sel";
    OPTIONS.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
    });
    sel.value = status;
    applySelectColor(sel, status);

    sel.addEventListener("change", async () => {
        const newStatus = sel.value;
        const currentReason = item.querySelector(".hm-reason-input")?.value || "";
        await setTarget(codename, newStatus, newStatus === "Ignore" ? currentReason : "");

        // Update dot color
        dot.style.backgroundColor = STATUS_STYLES[newStatus]?.bg || "#444";
        applySelectColor(sel, newStatus);

        // Show/hide reason row
        const existingReason = item.querySelector(".hm-reason-row");
        if (newStatus === "Ignore" && !existingReason) {
            item.appendChild(buildReasonRow(codename, ""));
        } else if (newStatus !== "Ignore" && existingReason) {
            existingReason.remove();
        }

        // Sync inline select on the page
        syncPageSelect(codename, newStatus);

        // Refresh stats only (not the whole list, to avoid focus loss on reason input)
        refreshStats();
    });

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(sel);
    item.appendChild(row);

    // Reason row always visible for Ignore items
    if (status === "Ignore") {
        item.appendChild(buildReasonRow(codename, reason));
    }

    return item;
}

function applySelectColor(sel, status) {
    const ss = STATUS_STYLES[status];
    if (ss?.bg) {
        sel.style.background = ss.bg;
        sel.style.color = ss.color;
        sel.style.borderColor = ss.bg;
    } else {
        sel.style.background = "#1a1a1a";
        sel.style.color = "#ccc";
        sel.style.borderColor = "#2a2a2a";
    }
}

function buildReasonRow(codename, reason) {
    const row = document.createElement("div");
    row.className = "hm-reason-row";

    const tag = document.createElement("span");
    tag.className = "hm-reason-tag";
    tag.textContent = "Why:";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "hm-reason-input";
    input.placeholder = "Add a reason...";
    input.value = reason || "";
    input.addEventListener("keydown", e => e.stopPropagation());
    input.addEventListener("input", () => setTarget(codename, "Ignore", input.value));

    row.appendChild(tag);
    row.appendChild(input);
    return row;
}

// Update stat counts without re-rendering the list (preserves focus/input state)
async function refreshStats() {
    const targets = await getAllTargets();
    const counts = { "To Do": 0, "In Progress": 0, "Done": 0, "Ignore": 0 };
    let total = 0;
    for (const { status } of Object.values(targets)) {
        if (status !== "None") total++;
        if (counts[status] !== undefined) counts[status]++;
    }
    document.querySelectorAll("#hm-stats .hm-stat-card").forEach(card => {
        card.querySelector(".hm-stat-num").textContent = counts[card.dataset.statKey] ?? 0;
    });
    const totalEl = document.getElementById("hm-total");
    if (totalEl) totalEl.textContent = `${total} tracked`;
}

// ================= SYNC PAGE → PANEL =================
function syncPageSelect(codename, newStatus) {
    document.querySelectorAll(".codename-select").forEach(sel => {
        const span = sel.previousSibling;
        if (span?.textContent?.trim() === codename) {
            sel.value = newStatus;
            updateHighlight(span, newStatus);
        }
    });
}

// ================= PAGE INLINE SELECTS =================
function styleSelect(select) {
    Object.assign(select.style, {
        marginLeft: "10px",
        padding: "4px 8px",
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        border: "1px solid #555",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        pointerEvents: "auto"
    });
}

function styleOption(option) {
    option.style.backgroundColor = "#1e1e1e";
    option.style.color = "#ffffff";
    option.style.fontWeight = "600";
}

function updateHighlight(span, value) {
    const s = STATUS_STYLES[value] || {};
    span.style.backgroundColor = s.bg || "";
    span.style.color = s.color || "";
    span.style.borderRadius = s.bg ? "6px" : "";
    span.style.padding = s.bg ? "2px 6px" : "";
}

function createSelect(span) {
    const codename = span.textContent.trim();
    if (!codename) return;
    if (span.nextSibling?.classList?.contains("codename-select")) return;

    const select = document.createElement("select");
    select.className = "codename-select";
    styleSelect(select);

    OPTIONS.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        styleOption(option);
        select.appendChild(option);
    });

    getTarget(codename).then(({ status }) => {
        select.value = status;
        updateHighlight(span, status);
    });

    select.addEventListener("change", async () => {
        const value = select.value;
        // Preserve existing reason when toggling back to Ignore
        const existing = await getTarget(codename);
        const reason = value === "Ignore" ? existing.reason : "";
        await setTarget(codename, value, reason);
        updateHighlight(span, value);
        // Reflect change in open panel
        refreshPanel();
    });

    span.parentNode.insertBefore(select, span.nextSibling);
}

// ================= SCAN PAGE =================
function addSelectFields() {
    const headerSpans = document.querySelectorAll("h4.target-tooltip-codename-header span");
    const pageTitleSpans = document.querySelectorAll('span[data-auto-type="label"][data-auto-name="Page Title"]');
    [...headerSpans, ...pageTitleSpans].forEach(createSelect);
}

// ================= VULN STATS =================
let _vulnCache = {};
let _vulnFetchedAt = 0;

async function fetchVulnCount(status) {
    try {
        const token = sessionStorage.getItem('shared-session-com.synack.accessToken');
        if (!token) return null;
        const res = await fetch(
            `https://platform.synack.com/api/vulnerabilities?page=1&per_page=100&filters%5Bstatus%5D=${status}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!Array.isArray(data)) return null;
        return data.length === 100 ? '99+' : data.length;
    } catch { return null; }
}

async function updateVulnStats() {
    const now = Date.now();
    if (Object.keys(_vulnCache).length && now - _vulnFetchedAt < 5 * 60 * 1000) {
        applyVulnCounts(_vulnCache);
        return;
    }
    const [underReview, pending] = await Promise.all([
        fetchVulnCount('under_review'),
        fetchVulnCount('pending_review')
    ]);
    _vulnCache = { underReview, pending };
    _vulnFetchedAt = now;
    applyVulnCounts(_vulnCache);
}

function applyVulnCounts({ underReview, pending }) {
    const urEl = document.getElementById('hm-vuln-under-review');
    const pdEl = document.getElementById('hm-vuln-pending');
    if (urEl) urEl.textContent = underReview ?? '—';
    if (pdEl) pdEl.textContent = pending ?? '—';
}

// ================= RESEARCHER STATS =================
let _statsCache = null;
let _statsFetchedAt = 0;

async function fetchResearcherStats() {
    const now = Date.now();
    if (_statsCache && now - _statsFetchedAt < 5 * 60 * 1000) return _statsCache;
    try {
        const token = sessionStorage.getItem('shared-session-com.synack.accessToken');
        if (!token) return null;
        const res = await fetch('https://platform.synack.com/api/researcher_statistics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        _statsCache = await res.json();
        _statsFetchedAt = now;
        return _statsCache;
    } catch { return null; }
}

async function updateTabPoints() {
    const data = await fetchResearcherStats();
    const ptsEl = document.getElementById('hm-tab-pts');
    const lblEl = document.getElementById('hm-tab-pts-label');
    if (!ptsEl || !lblEl) return;
    if (!data) { ptsEl.textContent = ''; lblEl.textContent = ''; return; }
    const tier = data.find(s => s.id === 'tier');
    if (!tier) return;

    ptsEl.textContent = tier.pts_to_next_tier != null ? tier.pts_to_next_tier.toLocaleString() : '';
    lblEl.textContent = 'TO NEXT';

    const currentTier = tier.tier;
    for (let t = 1; t <= 5; t++) {
        const seg = document.getElementById(`hm-tier-seg-${t}`);
        if (!seg) continue;
        seg.className = 'hm-tier-seg' + (
            t === currentTier ? ' hm-tier-current' :
            t < currentTier  ? ' hm-tier-filled'  : ''
        );
    }
}

// ================= INIT =================
window.addEventListener("load", () => {
    addSelectFields();
    createSidePanel();
});

const observer = new MutationObserver(addSelectFields);
const _observeTarget = document.body || document.documentElement;
observer.observe(_observeTarget, { childList: true, subtree: true });
