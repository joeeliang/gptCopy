function latexToGoogleDocs(latex) {
    // Remove any outer math delimiters if present
    latex = latex.replace(/^\$|\$$/g, '')
                 .replace(/^\\\(|\\\)$/g, '')
                 .replace(/^\\\[|\\\]$/g, '');
    
    // Create base HTML structure
    let output = '<meta charset="utf-8"><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-' + 
                generateGuid() + '">';

    // Common style for all spans
    const baseStyle = 'font-size:12pt;font-family:\'Times New Roman\',serif;color:#000000;' +
                     'background-color:transparent;font-weight:400;font-style:normal;' +
                     'font-variant:normal;text-decoration:none;vertical-align:baseline;' +
                     'white-space:pre;white-space:pre-wrap;';
    
    function createSpan(content) {
        return `<span style="${baseStyle}">${content}</span>`;
    }

    // Handle superscripts (like x^2)
    latex = latex.replace(/([a-zA-Z0-9])\^([0-9])/g, (match, base, exp) => {
        return createSpan(base) + createSpan(exp);
    });

    // Handle subscripts (like x_n)
    latex = latex.replace(/([a-zA-Z0-9])_([0-9])/g, (match, base, sub) => {
        return createSpan(base) + createSpan(sub);
    });

    // Handle basic operators
    const operators = {
        '\\times': '×',
        '\\div': '÷',
        '\\pm': '±',
        '=': '=',
        '+': '+',
        '-': '-'
    };

    for (let [latexOp, symbol] of Object.entries(operators)) {
        latex = latex.replace(new RegExp(latexOp.replace(/\\/g, '\\\\'), 'g'), symbol);
    }

    // Split the equation into parts and wrap each in a span
    const parts = latex.split(/([+\-=×÷±])/);
    output += parts.map(part => part ? createSpan(part) : '').join('');
    
    output += '</b>';
    return output;
}

// Helper function to generate a guid-like string for the internal ID
function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function convertEquation() {
    const input = document.getElementById('latex').value;
    const result = latexToGoogleDocs(input);
    document.getElementById('output').textContent = result;
}

function copyToClipboard() {
    const output = document.getElementById('output').textContent;
    navigator.clipboard.writeText(output).then(() => {
        const message = document.getElementById('copyMessage');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
    });
}
