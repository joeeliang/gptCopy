document.addEventListener('DOMContentLoaded', async function() {
    const enableBtn = document.getElementById('enable-btn');
    const statusText = document.getElementById('status-text');
    const latexButton = document.getElementById('format1');
    const mathmlButton = document.getElementById('format2');

    let currentOrigin = null;
    let currentTabId = null;

    // Get current tab info
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url) {
            currentOrigin = new URL(tab.url).origin;
            currentTabId = tab.id;
        }
    } catch (err) {
        console.log('Could not get tab info:', err.message);
    }

    // Check if current origin is enabled
    async function checkEnabled() {
        if (!currentOrigin) {
            enableBtn.disabled = true;
            statusText.textContent = 'Cannot enable on this page';
            return false;
        }

        const { enabledOrigins = [] } = await chrome.storage.sync.get('enabledOrigins');
        const isEnabled = enabledOrigins.includes(currentOrigin);

        if (isEnabled) {
            statusText.textContent = 'Enabled on this site ✓';
            statusText.parentElement.classList.add('enabled');
            enableBtn.textContent = 'Disable on this site';
            enableBtn.classList.add('enabled');
        } else {
            statusText.textContent = 'Not enabled on this site';
            statusText.parentElement.classList.remove('enabled');
            enableBtn.textContent = 'Enable on this site';
            enableBtn.classList.remove('enabled');
        }

        return isEnabled;
    }

    // Enable on current site
    async function enableSite() {
        if (!currentOrigin) return;

        // Request permission for this origin
        const granted = await chrome.permissions.request({
            origins: [currentOrigin + '/*']
        });

        if (!granted) {
            statusText.textContent = 'Permission denied';
            return;
        }

        // Add to enabled origins
        const { enabledOrigins = [] } = await chrome.storage.sync.get('enabledOrigins');
        if (!enabledOrigins.includes(currentOrigin)) {
            enabledOrigins.push(currentOrigin);
            await chrome.storage.sync.set({ enabledOrigins });
        }

        // Inject content script via background
        await chrome.runtime.sendMessage({
            action: 'inject',
            tabId: currentTabId
        });

        await checkEnabled();
    }

    // Disable on current site
    async function disableSite() {
        if (!currentOrigin) return;

        // Remove from enabled origins
        const { enabledOrigins = [] } = await chrome.storage.sync.get('enabledOrigins');
        const index = enabledOrigins.indexOf(currentOrigin);
        if (index > -1) {
            enabledOrigins.splice(index, 1);
            await chrome.storage.sync.set({ enabledOrigins });
        }

        // Optionally revoke permission (uncomment if desired)
        // await chrome.permissions.remove({ origins: [currentOrigin + '/*'] });

        await checkEnabled();
        statusText.textContent = 'Disabled - reload page to remove';
    }

    // Toggle enable/disable
    enableBtn.addEventListener('click', async () => {
        const isEnabled = await checkEnabled();
        if (isEnabled) {
            await disableSite();
        } else {
            await enableSite();
        }
    });

    // Initial check
    await checkEnabled();

    // Format button handlers
    latexButton.addEventListener('click', function() {
        chrome.storage.sync.set({ format: 'latex' }, function() {
            updateButtonStyles('latex');
        });
    });

    mathmlButton.addEventListener('click', function() {
        chrome.storage.sync.set({ format: 'mathml' }, function() {
            updateButtonStyles('mathml');
        });
    });

    function updateButtonStyles(selectedFormat) {
        latexButton.classList.remove('button-selected');
        mathmlButton.classList.remove('button-selected');

        if (selectedFormat === 'latex') {
            latexButton.classList.add('button-selected');
        } else if (selectedFormat === 'mathml') {
            mathmlButton.classList.add('button-selected');
        }
    }

    // Initialize with stored format or default to 'latex'
    chrome.storage.sync.get('format', function(result) {
        const storedFormat = result.format || 'latex';
        updateButtonStyles(storedFormat);
    });
});
