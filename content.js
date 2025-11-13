// Define the options for the dropdown
const options = [
    "None",
    "To Do",
    "In Progress",
    "Done",
    "Ignore"
];

function addSelectFields() {
    const headers = document.querySelectorAll('h4.target-tooltip-codename-header span');
    headers.forEach(span => {
        const codename = span.textContent.trim();

        // Skip if select already exists
        if (span.nextSibling && span.nextSibling.className === 'codename-select') return;

        // Create select dropdown
        const select = document.createElement('select');
        select.className = 'codename-select';
        select.style.marginLeft = '10px';
        select.style.pointerEvents = 'auto';
        select.style.backgroundColor = '#212121'; // dark background
        select.style.color = 'red';               // red text
        select.style.border = '1px solid #555';
        select.style.padding = '2px 5px';
        select.style.borderRadius = '4px';
        select.style.fontWeight = 'bold';

        // Add options
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });

        // Highlight function with white text readability
        const updateHighlight = (value) => {
            switch(value) {
                case "To Do":
                    span.style.backgroundColor = "#1976d2"; // blue
                    span.style.color = "white"; break;
                case "In Progress":
                    span.style.backgroundColor = "#f57c00"; // orange
                    span.style.color = "white"; break;
                case "Done":
                    span.style.backgroundColor = "#388e3c"; // green
                    span.style.color = "white"; break;
                case "Ignore":
                    span.style.backgroundColor = "#d32f2f"; // red
                    span.style.color = "white"; break;
                default:
                    span.style.backgroundColor = "";
                    span.style.color = ""; 
            }
        };

        // Load saved selection
        chrome.storage.local.get([codename], (result) => {
            select.value = result[codename] || "None";
            updateHighlight(select.value);
        });

        // Save selection on change
        select.addEventListener('change', () => {
            const obj = {};
            obj[codename] = select.value;
            chrome.storage.local.set(obj);
            updateHighlight(select.value);
        });

        // Insert select after the span
        span.parentNode.insertBefore(select, span.nextSibling);
    });
}

// Run after full page load
window.addEventListener('load', addSelectFields);

// Observe DOM changes
const observer = new MutationObserver(addSelectFields);
observer.observe(document.body, { childList: true, subtree: true });

