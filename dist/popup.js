document.addEventListener('DOMContentLoaded', async function() {
    // Inject content script into the active tab
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            // Inject CSS first
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ['styles.css']
            });
            // Then inject the content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
        }
    } catch (err) {
        // Silently fail - user may be on a restricted page (chrome://, etc.)
        console.log('Could not inject script:', err.message);
    }

    // Get the buttons
    const latexButton = document.getElementById('format1');
    const mathmlButton = document.getElementById('format2');
    
    // Add event listeners to buttons
    latexButton.addEventListener('click', function() {
        chrome.storage.sync.set({ format: 'latex' }, function() {
            console.log("Format set to LaTeX");
            updateButtonStyles('latex');
        });
    });
    
    mathmlButton.addEventListener('click', function() {
        chrome.storage.sync.set({ format: 'mathml' }, function() {
            console.log("Format set to MathML");
            updateButtonStyles('mathml');
        });
    });
    
    // Function to update button styles
    function updateButtonStyles(selectedFormat) {
        // Remove selected class from all buttons
        latexButton.classList.remove('button-selected');
        mathmlButton.classList.remove('button-selected');
        
        // Add selected class to active button
        if (selectedFormat === 'latex') {
            latexButton.classList.add('button-selected');
        } else if (selectedFormat === 'mathml') {
            mathmlButton.classList.add('button-selected');
        }
        console.log('changed css');
    }
    
    // Initialize with stored format or default to 'latex'
    chrome.storage.sync.get('format', function(result) {
        const storedFormat = result.format || 'latex';
        updateButtonStyles(storedFormat);
    });
});