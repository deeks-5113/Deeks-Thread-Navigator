// ==========================================
// Universal Thread Navigator
// Supports: ChatGPT, Gemini
// ==========================================

const CONFIG = {
    retryLimit: 20,
    retryInterval: 1000
};

let retryCount = 0;

// --- Platform Detection ---
const PLATFORMS = {
    CHATGPT: 'ChatGPT',
    GEMINI: 'Gemini',
    UNKNOWN: 'Unknown'
};

function getCurrentPlatform() {
    const host = window.location.hostname;
    if (host.includes('chatgpt.com') || host.includes('openai.com')) {
        return PLATFORMS.CHATGPT;
    } else if (host.includes('gemini.google.com')) {
        return PLATFORMS.GEMINI;
    }
    return PLATFORMS.UNKNOWN;
}

// --- Initialization ---
function initExtension() {
    const platform = getCurrentPlatform();
    if (platform === PLATFORMS.UNKNOWN) return;

    // Check if button already exists to prevent duplicates
    if (document.getElementById('thread-navigator-btn')) return;

    // Wait for the specific platform's content to load
    const isReady = checkPageReady(platform);
    
    if (isReady) {
        console.log(`Thread Navigator: Initializing for ${platform}...`);
        createFloatingButton(platform);
    } else {
        if (retryCount < CONFIG.retryLimit) {
            retryCount++;
            setTimeout(initExtension, CONFIG.retryInterval);
        }
    }
}

function checkPageReady(platform) {
    if (platform === PLATFORMS.GEMINI) {
        return document.querySelector('user-query') || document.querySelector('[data-testid="user-query"]');
    }
    if (platform === PLATFORMS.CHATGPT) {
        return document.querySelector('[data-message-author-role="user"]');
    }
    return false;
}

// --- UI Creation ---
function createFloatingButton(platform) {
    const btn = document.createElement('div');
    btn.id = 'thread-navigator-btn';
    btn.title = `Show ${platform} Thread`;
    
    // You can use this class to style the button differently per platform if desired
    btn.classList.add(platform.toLowerCase());

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showPromptsList(platform);
    });

    document.body.appendChild(btn);
}

function showPromptsList(platform) {
    // Remove existing modal
    const existing = document.getElementById('thread-prompts-modal');
    if (existing) existing.remove();

    const userMessages = findUserMessages(platform);
    
    const modal = document.createElement('div');
    modal.id = 'thread-prompts-modal';
    
    // Dynamic Title based on platform
    const modalHTML = `
        <div class="modal-card">
            <div class="prompts-header">
                <div class="header-top">
                    <h3>${platform} Thread Navigator</h3>
                    <button id="close-prompts-list" title="Close">✕</button>
                </div>
                <div class="search-container">
                    <input type="text" id="thread-navigator-search" placeholder="Search prompts..." autocomplete="off">
                </div>
            </div>
            
            <div class="prompts-content">
                <div id="prompts-container">
                    ${generatePromptsListHTML(userMessages, platform)}
                </div>
            </div>
        </div>
    `;

    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    // Auto-focus search
    setTimeout(() => {
        const input = document.getElementById('thread-navigator-search');
        if (input) input.focus();
    }, 100);

    setupEventListeners(modal, userMessages, platform);
}

// --- List Generation ---
function generatePromptsListHTML(userMessages, platform) {
    if (!userMessages || userMessages.length === 0) {
        return '<div class="no-prompts">No prompts found. Try scrolling up to load history.</div>';
    }

    return userMessages.map((msg, index) => {
        const text = extractMessageText(msg, platform);
        const safeText = text.replace(/"/g, '&quot;');
        
        return `
            <div class="prompt-item" data-index="${index}" data-full-text="${safeText.toLowerCase()}">
                <div class="prompt-number">${index + 1}</div>
                <div class="prompt-text">${text}</div>
                <div class="prompt-actions">
                    <button class="action-btn copy-btn" title="Copy Response">📋</button>
                    <button class="action-btn goto-btn" title="Jump to Message">🔗</button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Interaction Logic ---
function setupEventListeners(modal, userMessages, platform) {
    // Close
    modal.querySelector('#close-prompts-list').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Search
    modal.querySelector('#thread-navigator-search').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        modal.querySelectorAll('.prompt-item').forEach(item => {
            const text = item.getAttribute('data-full-text');
            item.style.display = text.includes(term) ? 'grid' : 'none';
        });
    });

    // Item Actions
    modal.querySelector('#prompts-container').addEventListener('click', (e) => {
        const item = e.target.closest('.prompt-item');
        if (!item) return;
        const index = parseInt(item.dataset.index);
        const msg = userMessages[index];

        if (e.target.closest('.copy-btn')) {
            copyAIResponse(msg, platform);
        } else if (e.target.closest('.goto-btn')) {
            goToAIResponse(msg, platform);
            modal.remove();
        } else {
            scrollToElement(msg);
            modal.remove();
        }
    });
}

// ==========================================
// DOM SELECTORS (Platform Specific)
// ==========================================

function findUserMessages(platform) {
    if (platform === PLATFORMS.GEMINI) {
        // Gemini uses custom tags or specific data attributes
        let msgs = Array.from(document.querySelectorAll('user-query'));
        if (msgs.length === 0) {
            msgs = Array.from(document.querySelectorAll('[data-testid="user-query"], .user-query'));
        }
        return msgs.filter(el => el.innerText && el.innerText.trim().length > 0);
    }
    
    if (platform === PLATFORMS.CHATGPT) {
        // ChatGPT uses role attributes
        return Array.from(document.querySelectorAll('[data-message-author-role="user"]'));
    }

    return [];
}

function findAIResponse(userMessage, platform) {
    let candidate = userMessage.nextElementSibling;
    let attempts = 0;
    
    // Look ahead a few siblings to find the AI response
    while (candidate && attempts < 10) {
        if (platform === PLATFORMS.GEMINI) {
            if (candidate.tagName === 'MODEL-RESPONSE' || 
                candidate.classList.contains('model-response') ||
                candidate.getAttribute('data-testid') === 'model-response') {
                return candidate;
            }
        }
        
        if (platform === PLATFORMS.CHATGPT) {
            // ChatGPT structure varies, but usually it's the next turn with role="assistant"
            if (candidate.querySelector('[data-message-author-role="assistant"]') ||
                candidate.getAttribute('data-message-author-role') === 'assistant') {
                return candidate;
            }
        }
        
        candidate = candidate.nextElementSibling;
        attempts++;
    }
    
    // Fallback for ChatGPT nested structure
    if (platform === PLATFORMS.CHATGPT) {
        const turn = userMessage.closest('[data-testid^="conversation-turn"]');
        if (turn && turn.nextElementSibling) {
            return turn.nextElementSibling;
        }
    }

    return null;
}

function extractMessageText(element, platform) {
    if (!element) return '';
    return element.innerText?.trim() || element.textContent?.trim() || '';
}

// ==========================================
// ACTIONS
// ==========================================

async function copyAIResponse(userMessage, platform) {
    const aiResponse = findAIResponse(userMessage, platform);
    
    if (!aiResponse) {
        showNotification('AI response not found', 'error');
        return;
    }
    
    const text = aiResponse.innerText || aiResponse.textContent;
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Response copied!', 'success');
    } catch (err) {
        showNotification('Failed to copy', 'error');
    }
}

function goToAIResponse(userMessage, platform) {
    const aiResponse = findAIResponse(userMessage, platform);
    // If we can't find the AI response, at least jump to the user prompt
    const target = aiResponse || userMessage;
    scrollToElement(target);
    highlightElement(target, platform);
}

// ==========================================
// UTILITIES
// ==========================================

function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function highlightElement(element, platform) {
    const originalBg = element.style.backgroundColor;
    const originalTransition = element.style.transition;
    
    // Platform specific highlight colors
    const highlightColor = platform === PLATFORMS.GEMINI 
        ? 'rgba(26, 115, 232, 0.2)' // Gemini Blue
        : 'rgba(16, 163, 127, 0.2)'; // ChatGPT Green

    element.style.transition = 'background-color 0.5s ease';
    element.style.backgroundColor = highlightColor;
    
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
        setTimeout(() => {
            element.style.transition = originalTransition;
        }, 500);
    }, 1500);
}

function showNotification(message, type) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `
        position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
        background: #2d3748; color: #fff; padding: 10px 20px;
        border-radius: 8px; font-family: sans-serif; font-size: 14px;
        z-index: 1000002; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        pointer-events: none;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

// ==========================================
// BOOTSTRAP
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
} else {
    initExtension();
}

// Watch for SPA page changes (URL changes)
let lastUrl = window.location.href;
new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        retryCount = 0;
        setTimeout(initExtension, 1000);
    }
}).observe(document.body, { childList: true, subtree: true });