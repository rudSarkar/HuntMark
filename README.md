# HuntMark

**HuntMark** is a Chrome extension designed for synack target to efficiently track and manage Codenames. It allows you to mark the status of each target with a customizable dropdown and visually highlights them for quick identification. All selections persist across tabs and browser sessions using Chrome's local storage.

---

## Features

- Adds a dropdown next to each CODENAME for customizable status tracking.
- Persistent storage using `chrome.storage.local` across tabs and sessions.
- Color-coded highlights for quick visual tracking:
  - **To Do** – Blue  
  - **In Progress** – Orange  
  - **Done** – Green  
  - **Ignore** – Red
- Dark-theme friendly UI:
  - Dropdown background: `#212121`  
  - Dropdown text color: Red  
  - Span highlights with white text for readability
- Supports dynamic content via `MutationObserver`.
- Lightweight and easy to use.

---

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the project folder.
5. The extension will be active and automatically add dropdowns next to Codenames.

---

## Usage

1. Navigate to your bug bounty dashboard or page with CODENAME elements.
2. Next to each CODENAME, select the desired status from the dropdown:
   - `None` – default, unmarked
   - `To Do` – needs attention
   - `In Progress` – currently working
   - `Done` – completed
   - `Ignore` – not relevant
3. The CODENAME will be highlighted based on the selected status.
4. Your selections are automatically saved and restored across sessions.

---

## Customization

- You can customize the dropdown options by editing the `options` array in `content.js`.
- Adjust highlight colors in the `updateHighlight` function to match your preferred theme.

---

## Contributing

Contributions are welcome! You can submit bug reports, suggest new features, or open pull requests to enhance functionality.

---

## License

This project is open-source and free to use under the MIT License.

