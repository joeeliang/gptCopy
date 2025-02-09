function katexToMathML(html) {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all KaTeX elements
    const katexElements = doc.querySelectorAll('.katex-mathml');
    
    // Extract MathML from each element
    const mathMLStrings = Array.from(katexElements).map(element => {
        const mathElement = element.querySelector('math');
        return mathElement ? mathElement.outerHTML : '';
    });
    
    return mathMLStrings;
}

// Example usage:
const html = `<p>The equation <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>y</mi><mo>=</mo><mi>m</mi><mi>x</mi><mo>+</mo><mi>b</mi></mrow><annotation encoding="application/x-tex">y = mx + b</annotation></semantics></math></span><div class="katex-wrapper"><span class="katex-html" aria-hidden="true" data-katex-processed="true"><span class="base"><span class="strut" style="height: 0.625em; vertical-align: -0.1944em;"></span><span class="mord mathnormal" style="margin-right: 0.03588em;">y</span><span class="mspace" style="margin-right: 0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right: 0.2778em;"></span></span><span class="base"><span class="strut" style="height: 0.6667em; vertical-align: -0.0833em;"></span><span class="mord mathnormal">m</span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right: 0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right: 0.2222em;"></span></span><span class="base"><span class="strut" style="height: 0.6944em;"></span><span class="mord mathnormal">b</span></span></span></div></span> is the <strong>slope-intercept form</strong> of a linear equation, which describes a straight line on a Cartesian plane.</p>`;

const mathMLResults = katexToMathML(html);
console.log(mathMLResults[0]);