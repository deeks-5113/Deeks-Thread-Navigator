# 🧭 Deeks Gemini Thread Navigator Chrome Extension

**Navigate long conversation threads instantly with a floating button and compact prompt menu.**  
Currently stable on **ChatGPT** ✅. **Gemini** and **Perplexity** integrations are in progress.  

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![Platforms](https://img.shields.io/badge/Platforms-ChatGPT%20(stable)%20|%20Gemini%20(dev)%20|%20Perplexity%20(dev)-orange)

---

## ✨ Features & Value Proposition

Tired of endless scrolling? The Thread Navigator overlays a **dynamic menu** to instantly jump to any AI response in a long conversation, significantly improving workflow and context retrieval.

- **🎯 Floating Action Button (FAB):** Overlays on the chat UI without interfering with typing.
- **📋 Prompt List Navigation:** Shows each user prompt as an anchor point. Click a prompt row to **smoothly scroll** to the corresponding AI response (reply briefly highlights for tracking).
- **📝 Instant Copy:** Quickly copy the AI’s full reply to the clipboard with a single click.
- **🔧 Cross-Platform Compatibility:** Designed to adapt to the challenging Document Object Model (DOM) structures of leading AI platforms.
    - **ChatGPT (Stable):** Full production support for prompt detection, copy-response, and jump-to-response.
    - **Gemini & Perplexity (In Progress):** UI integration is complete. Currently finalizing DOM selectors and pairing logic for full functionality.

---

## 🚀 Installation & Setup

### Step 1: Download Files
Clone this repo or save the following core files into a single local folder (e.g., `deeks-thread-navigator`):

- `manifest.json`
- `content.js`
- `styles.css`

### Step 2: Load Extension in Chrome
1.  Open Chrome and navigate to `chrome://extensions/`
2.  Enable the **Developer Mode** toggle in the top-right corner.
3.  Click the **Load unpacked** button.
4.  Select the folder containing your extension files.

---

## 🎯 Usage Guide

1.  Open a chat on a supported platform (e.g., ChatGPT).
2.  Look for the **floating clipboard button** 📋 anchored to the right edge of the chat UI.
3.  Click the button to open the navigator panel.
4.  **In the navigator panel:**
    * Click the **Prompt Row** → Smoothly jump to the AI's full reply in the main thread.
    * Click the **Clipboard Icon** → Copy the AI’s full response text to your clipboard.

---

## 🛠️ Troubleshooting & Development Notes

This extension relies heavily on stable DOM selectors within complex, evolving chat UIs.

- **Issue: Button Missing?**
    * Ensure **Developer Mode** is enabled on the `chrome://extensions/` page.
    * **Reload the tab** where the chat is open.
- **Issue: Empty list or actions failing?**
    * The extension may have failed to lock onto the correct DOM selectors.
    * Check the **DevTools Console** (`F12`) for any error logs related to `content.js`.
    * Ensure the chat UI is fully rendered before opening the navigator panel.
- **Integration Status:**
    * If testing on **Gemini** or **Perplexity**, note that full functionality (jump/copy) is dependent on the completion of the respective platform's DOM pairing logic.

---