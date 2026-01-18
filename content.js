// ================= OPTIONS =================
const OPTIONS = ["None", "To Do", "In Progress", "Done", "Ignore"];

const STATUS_STYLES = {
    "None": { bg: "", color: "" },
    "To Do": { bg: "#1976d2", color: "#fff" },
    "In Progress": { bg: "#f57c00", color: "#fff" },
    "Done": { bg: "#388e3c", color: "#fff" },
    "Ignore": { bg: "#d32f2f", color: "#fff" }
};

// ================= STYLES =================
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
    // This is CRITICAL to avoid white-on-white
    option.style.backgroundColor = "#1e1e1e";
    option.style.color = "#ffffff";
    option.style.fontWeight = "600";
}

// ================= LOGIC =================
function updateHighlight(span, value) {
    const style = STATUS_STYLES[value] || {};
    span.style.backgroundColor = style.bg || "";
    span.style.color = style.color || "";
    span.style.borderRadius = style.bg ? "6px" : "";
    span.style.padding = style.bg ? "2px 6px" : "";
}

function createSelect(span) {
    const codename = span.textContent.trim();
    if (!codename) return;

    // Prevent duplicate selects
    if (span.nextSibling?.classList?.contains("codename-select")) return;

    const select = document.createElement("select");
    select.className = "codename-select";
    styleSelect(select);

    // Build options
    OPTIONS.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        styleOption(option);
        select.appendChild(option);
    });

    // Load saved value
    chrome.storage.local.get([codename], result => {
        const value = result[codename] || "None";
        select.value = value;
        updateHighlight(span, value);
    });

    // Save on change
    select.addEventListener("change", () => {
        const value = select.value;
        chrome.storage.local.set({ [codename]: value });
        updateHighlight(span, value);
    });

    span.parentNode.insertBefore(select, span.nextSibling);
}

// ================= SCAN PAGE =================
function addSelectFields() {
    const headerSpans = document.querySelectorAll(
        "h4.target-tooltip-codename-header span"
    );

    const pageTitleSpans = document.querySelectorAll(
        'span[data-auto-type="label"][data-auto-name="Page Title"]'
    );

    [...headerSpans, ...pageTitleSpans].forEach(createSelect);
}

// ================= INIT =================
window.addEventListener("load", addSelectFields);

const observer = new MutationObserver(addSelectFields);
observer.observe(document.body, { childList: true, subtree: true });
