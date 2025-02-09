class KaTeXConverter {
    constructor() {
      this.katexClassMap = {
        'mord': 'mi',
        'mbin': 'mo',
        'mrel': 'mo',
        'mopen': 'mo',
        'mclose': 'mo',
        'mpunct': 'mo',
        'minner': 'mrow',
        'mfrac': 'mfrac',
        'msqrt': 'msqrt',
        'msup': 'msup'
      };
    }
  
    convert(katexHTML) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(katexHTML, 'text/html');
      const katexElement = `<span class="katex-html" aria-hidden="true">
    <span class="base">
        <span class="strut"></span>
        <span class="mord">x</span>
        <span class="mrel">=</span>
        <span class="mspace"></span>
        <span class="mord">
            <span class="mfrac">
                <span class="vlist-t vlist-t2">
                    <span class="vlist-r">
                        <span class="vlist">
                            <span class="mord">−b ± √(b² − 4ac)</span>
                            <span class="mord">2a</span>
                        </span>
                    </span>
                </span>
            </span>
        </span>
    </span>
</span>`;

    //   const katexElement = doc.querySelector('.katex-html');
      
      if (!katexElement) {
        throw new Error('No KaTeX HTML element found');
      }
  
      const mathML = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
      mathML.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
      
      const semantics = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'semantics');
      const mrow = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
      
      this.processKaTeXElement(katexElement, mrow);
      
      semantics.appendChild(mrow);
      mathML.appendChild(semantics);
      
      return mathML;
    }
  
    processKaTeXElement(element, parentMathML) {
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent.trim()) {
            const mi = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
            mi.textContent = child.textContent.trim();
            parentMathML.appendChild(mi);
          }
          continue;
        }
  
        if (child.nodeType !== Node.ELEMENT_NODE) continue;
  
        const katexClasses = Array.from(child.classList)
          .filter(cls => cls in this.katexClassMap);
  
        if (katexClasses.length === 0) {
          this.processKaTeXElement(child, parentMathML);
          continue;
        }
  
        const mathMLTag = this.katexClassMap[katexClasses[0]];
        const mathMLElement = document.createElementNS('http://www.w3.org/1998/Math/MathML', mathMLTag);
  
        // Handle special cases
        if (mathMLTag === 'mfrac') {
          const num = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
          const den = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
          
          const numerator = child.querySelector('.vlist > span:last-child .mord');
          const denominator = child.querySelector('.vlist > span:first-child .mord');
          
          if (numerator) this.processKaTeXElement(numerator, num);
          if (denominator) this.processKaTeXElement(denominator, den);
          
          mathMLElement.appendChild(num);
          mathMLElement.appendChild(den);
        } else if (mathMLTag === 'msup') {
          const base = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
          const sup = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mrow');
          
          const baseElement = child.querySelector('.vlist > span:last-child');
          const supElement = child.querySelector('.vlist > span:first-child');
          
          if (baseElement) this.processKaTeXElement(baseElement, base);
          if (supElement) this.processKaTeXElement(supElement, sup);
          
          mathMLElement.appendChild(base);
          mathMLElement.appendChild(sup);
        } else {
          this.processKaTeXElement(child, mathMLElement);
        }
  
        parentMathML.appendChild(mathMLElement);
      }
    }
  }

  // Create an instance of the converter
const converter = new KaTeXConverter();

// Get your KaTeX HTML element
// const katexHTML = document.querySelector('.katex-html').outerHTML;
const katexHTML = `<span class="katex-html" aria-hidden="true">
    <span class="base">
        <span class="strut"></span>
        <span class="mord">x</span>
        <span class="mrel">=</span>
        <span class="mspace"></span>
        <span class="mord">
            <span class="mfrac">
                <span class="vlist-t vlist-t2">
                    <span class="vlist-r">
                        <span class="vlist">
                            <span class="mord">−b ± √(b² − 4ac)</span>
                            <span class="mord">2a</span>
                        </span>
                    </span>
                </span>
            </span>
        </span>
    </span>
</span>`;

// Convert to MathML
try {
  const mathML = converter.convert(katexHTML);
  console.log(mathML.outerHTML);
} catch (error) {
  console.error('Conversion failed:', error);
}