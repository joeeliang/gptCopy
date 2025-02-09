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