// Guard against multiple injections
if (window.__gptCopyInitialized) {
    console.log('GPTCopy already initialized on this page');
    throw new Error('Already initialized'); // Exit early
}
window.__gptCopyInitialized = true;

function getColorLuminance(color) {
  // Convert color to RGB if needed
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  const rgb = ctx.fillStyle; // Returns #rrggbb
  
  const hex = rgb.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance (WCAG formula)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function adaptKatexHoverColorFromText(wrapper, equation) {
  // equation is your `.katex-html` node (the visible KaTeX HTML)
  // Try to find a child that actually has text / is used for rendering
  const target =
    equation.querySelector('.mord, .mop, .mbin, .mrel, .mopen, .mclose, .mpunct, .minner') ||
    equation.querySelector('span') ||
    equation;

  const computed = getComputedStyle(target);
  const textColor = computed.color;

  const textLuminance = getColorLuminance(textColor);

  // If text is dark, background should be light, and vice versa
  // (This is more about contrast than "theme")
  const hoverBg = textLuminance > 0.5 ? '#111' : '#e8e8e8';
  // If text is dark, use black text on light bg; if text is light, use white on dark bg
  const text = textLuminance > 0.5 ? '#ffffff' : '#000000' ;

  // Set on document root so it applies to all elements using this variable
  document.documentElement.style.setProperty('--katex-hover-bg', hoverBg);
  document.documentElement.style.setProperty('--katex-text-color', text);
  // Store the value for later use
  wrapper.dataset.hoverBg = hoverBg;
}

function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.className = 'katex-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-arrow"></div>
    <span class="tooltip-content">Copy</span>
  `;
  return tooltip;
}

function setupEquation(equation) {
  const tooltip = createTooltip();
  document.body.appendChild(tooltip);

  // Create a wrapper div if it doesn't exist
  let wrapper = equation.parentElement.querySelector('.katex-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'katex-wrapper';
    equation.parentElement.insertBefore(wrapper, equation);
    wrapper.appendChild(equation);
  }

  // Apply adaptive hover color based on background
  adaptKatexHoverColorFromText(wrapper, equation);


  function updateTooltipPosition() {
    const rect = wrapper.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
  }

  wrapper.addEventListener('mouseenter', (event) => {
    wrapper.classList.add('katex-hover');
    tooltip.style.display = 'block';
    updateTooltipPosition();
  });

  wrapper.addEventListener('mouseleave', (event) => {
    wrapper.classList.remove('katex-hover');
    tooltip.style.display = 'none';
  });
    
  // Turn green on mousedown
  wrapper.addEventListener('mousedown', () => {
    wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
  });

  // Copy MathML on mouseup
  wrapper.addEventListener('mouseup', async () => {
    try {
      const format = await chrome.storage.sync.get('format');
      console.log('Format:', format);
      let mathmlContent;
      if (format.format === 'latex') {
        mathmlContent = equation.closest('.katex').querySelector('annotation').innerHTML;
      } else {
        mathmlContent = equation.closest('.katex').querySelector('.katex-mathml math').outerHTML;;
      }
        
      wrapper.style.backgroundColor = '';
      if (mathmlContent) {
        navigator.clipboard.writeText(mathmlContent).then(() => {
          tooltip.querySelector('.tooltip-content').textContent = '✓';
          updateTooltipPosition();
          setTimeout(() => {
            tooltip.querySelector('.tooltip-content').textContent = 'Copy';
            updateTooltipPosition();
            tooltip.style.display = 'none';
          }, 800);
        }).catch(err => {
          console.error('Failed to copy to clipboard:', err);
          wrapper.style.backgroundColor = '#FFB6C1';
          setTimeout(() => {
            wrapper.style.backgroundColor = '';
          }, 200);
        });
      }
    } catch (error) {
      console.error('Error processing equation:', error);
    }
  });

}

function initialize() {
    console.log('Initializing KaTeX MathML Copier...');
    
    // Select all KaTeX elements
    const equations = document.querySelectorAll('.katex-html:not([data-katex-processed])');
    console.log(`Found ${equations.length} KaTeX equations`);
    
    equations.forEach(equation => {
        console.log(`Setting up equation`);
        setupEquation(equation);
        equation.setAttribute('data-katex-processed', 'true');
    });

    // Add mutation observer for new equations
    const observer = new MutationObserver(mutations => {
        const newEquations = document.querySelectorAll('.katex-html:not([data-katex-processed])');
        if (newEquations.length > 0) {
            console.log(`Found ${newEquations.length} new equations`);
            newEquations.forEach(equation => {
                setupEquation(equation);
                equation.setAttribute('data-katex-processed', 'true');
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  console.log('Document still loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  console.log('Document already loaded, initializing immediately');
  initialize();
}

// Hide all tooltips on scroll
window.addEventListener('wheel', () => {
  const tooltips = document.querySelectorAll('.katex-tooltip');
  tooltips.forEach(tooltip => {
    tooltip.style.display = 'none';
  });
  const equations = document.querySelectorAll('.katex-html');
  equations.forEach(equation => {
    equation.classList.remove('katex-hover');
  });
}, { passive: true });

