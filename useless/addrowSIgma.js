function wrapSummationExpressionInMrow(mathML) {
    // Look for various possible summation tags
    const possibleStartTags = ['</munderover>', '</msubsup>', '</msub>', '</msup>'];
    let startTagFound = '';
    let startIndex = -1;
    
    // Find which tag is being used
    for (const tag of possibleStartTags) {
      const index = mathML.indexOf(tag);
      if (index !== -1) {
        if (startIndex === -1 || index < startIndex) {
          // Check if this is actually a summation
          const precedingContent = mathML.substring(0, index + tag.length);
          if (precedingContent.includes('<mo>∑</mo>') || 
              precedingContent.includes('<mo>&sum;</mo>') || 
              precedingContent.includes('<mo>&#x2211;</mo>')) {
            startTagFound = tag;
            startIndex = index;
          }
        }
      }
    }
    
    // If we didn't find any tag, look for just the summation symbol
    if (startIndex === -1) {
      const sumSymbols = ['<mo>∑</mo>', '<mo>&sum;</mo>', '<mo>&#x2211;</mo>'];
      for (const symbol of sumSymbols) {
        const index = mathML.indexOf(symbol);
        if (index !== -1) {
          startTagFound = symbol;
          startIndex = index + symbol.length;
          break;
        }
      }
    }
    
    // If still no summation found, return original
    if (startIndex === -1) {
      return mathML;
    }
    
    // Find the expression start (right after the found tag)
    const expressionStartIndex = startIndex + startTagFound.length;
    
    // Find the position where the expression should end
    // Look for equals sign
    const equalSignPatterns = ['<mo>=</mo>', '<mo>&equals;</mo>', '<mo>&#x3D;</mo>'];
    let equalSignIndex = -1;
    
    for (const pattern of equalSignPatterns) {
      const index = mathML.indexOf(pattern, expressionStartIndex);
      if (index !== -1 && (equalSignIndex === -1 || index < equalSignIndex)) {
        equalSignIndex = index;
      }
    }
    
    // Determine where to end the mrow
    let expressionEndIndex;
    
    if (equalSignIndex !== -1) {
      // End before the equals sign
      expressionEndIndex = equalSignIndex;
    } else {
      // Look for the end of the main <mrow> that contains the expression
      const closingMrowIndex = findMatchingClosingTag(mathML, expressionStartIndex);
      if (closingMrowIndex !== -1) {
        expressionEndIndex = closingMrowIndex;
      } else {
        // If no clear end found, just go to the end of the semantics tag
        const semanticsEnd = mathML.indexOf('</semantics>', expressionStartIndex);
        if (semanticsEnd !== -1) {
          expressionEndIndex = semanticsEnd;
        } else {
          // Last resort: go to the end of the math tag
          expressionEndIndex = mathML.indexOf('</math>', expressionStartIndex);
          if (expressionEndIndex === -1) {
            expressionEndIndex = mathML.length;
          }
        }
      }
    }
    
    // Extract the expression content
    const expressionContent = mathML.substring(expressionStartIndex, expressionEndIndex);
    
    // Create the new MathML with the expression wrapped in <mrow>
    return (
      mathML.substring(0, expressionStartIndex) +
      '<mrow>' + expressionContent + '</mrow>' +
      mathML.substring(expressionEndIndex)
    );
  }
  
  // Helper function to find matching closing mrow tag
  function findMatchingClosingTag(mathML, startFrom) {
    // Find the first <mrow> that contains the summation
    const mainMrowStart = mathML.lastIndexOf('<mrow>', startFrom);
    if (mainMrowStart === -1) return -1;
    
    // Count opening and closing mrow tags to find the matching one
    let openCount = 1;
    let position = startFrom;
    
    while (position < mathML.length) {
      const nextOpenPos = mathML.indexOf('<mrow>', position);
      const nextClosePos = mathML.indexOf('</mrow>', position);
      
      // If no more tags, break
      if (nextOpenPos === -1 && nextClosePos === -1) break;
      
      // If next tag is opening tag
      if (nextOpenPos !== -1 && (nextClosePos === -1 || nextOpenPos < nextClosePos)) {
        openCount++;
        position = nextOpenPos + 6; // length of "<mrow>"
      } 
      // If next tag is closing tag
      else if (nextClosePos !== -1) {
        openCount--;
        if (openCount === 0) {
          return nextClosePos;
        }
        position = nextClosePos + 7; // length of "</mrow>"
      }
    }
    
    return -1; // No matching tag found
  }
  
  // Test example for summation
  const testSummationMathML = `
  <math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mn>5</mn></munderover><msup><mi>i</mi><mn>2</mn></msup><mo>=</mo><msup><mn>1</mn><mn>2</mn></msup><mo>+</mo><msup><mn>2</mn><mn>2</mn></msup><mo>+</mo><msup><mn>3</mn><mn>2</mn></msup><mo>+</mo><msup><mn>4</mn><mn>2</mn></msup><mo>+</mo><msup><mn>5</mn><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\sum_{i=1}^{5} i^2 = 1^2 + 2^2 + 3^2 + 4^2 + 5^2</annotation></semantics></math>
  `;
  
  console.log(wrapSummationExpressionInMrow(testSummationMathML));  