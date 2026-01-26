function addMrowToMathML(mathMLString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mathMLString, "application/xml");
    
    function wrapInMrow(target) {
        if (target) {
            const mrow = doc.createElement("mrow");
            while (target.nextSibling && target.nextSibling.tagName !== "mo") {
                mrow.appendChild(target.nextSibling);
            }
            target.parentNode.insertBefore(mrow, target.nextSibling);
        }
    }
    
    const symbols = doc.querySelectorAll("msubsup mo, mo");
    symbols.forEach(symbol => {
        if (symbol.textContent === "∫" || symbol.textContent === "∑") {
            wrapInMrow(symbol.parentNode);
        }
    });
    
    return new XMLSerializer().serializeToString(doc);
}

// Example usage:
const mathML = `
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <semantics>
    <mrow>
      <mi>W</mi>
      <mo>=</mo>
      <msubsup>
        <mo>∫</mo>
        <msub>
          <mi>x</mi>
          <mn>1</mn>
        </msub>
        <msub>
          <mi>x</mi>
          <mn>2</mn>
        </msub>
      </msubsup>
      <mi>F</mi>
      <mo stretchy="false">(</mo>
      <mi>x</mi>
      <mo stretchy="false">)</mo>
      <mtext></mtext>
      <mi>d</mi>
      <mi>x</mi>
    </mrow>
    <annotation encoding="application/x-tex">W = \int_{x_1}^{x_2} F(x) \,dx</annotation>
  </semantics>
</math>`;

console.log(addMrowToMathML(mathML));

