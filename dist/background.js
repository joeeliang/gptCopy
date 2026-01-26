// Show extension icon on pages with KaTeX content
chrome.runtime.onInstalled.addListener(() => {
  // Clear existing rules and add new ones
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            css: ['.katex']
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
    ]);
  });
});

// Auto-inject on enabled origins when navigating
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only run when page finishes loading
  if (changeInfo.status !== 'complete' || !tab.url) return;

  try {
    const origin = new URL(tab.url).origin;
    const { enabledOrigins = [] } = await chrome.storage.sync.get('enabledOrigins');

    if (enabledOrigins.includes(origin)) {
      // Check if we still have permission for this origin
      const hasPermission = await chrome.permissions.contains({
        origins: [origin + '/*']
      });

      if (hasPermission) {
        await injectContentScript(tabId);
      }
    }
  } catch (err) {
    // Ignore errors (e.g., chrome:// URLs)
  }
});

// Inject content script and CSS into a tab
async function injectContentScript(tabId) {
  try {
    // Check if already injected
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.__gptCopyInitialized
    });

    if (results[0]?.result) {
      return; // Already initialized
    }

    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['styles.css']
    });

    // Then inject the content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
  } catch (err) {
    console.log('Could not inject script:', err.message);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'inject') {
    injectContentScript(message.tabId).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async response
  }
});
