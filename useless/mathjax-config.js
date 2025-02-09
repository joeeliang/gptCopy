// Set the equation as a string
const equation = "x = \\frac{a + b}{c}";

// Set the formatting metadata
const formatMetadata = {
  "font-family": "Cambria Math",
  "font-size": "18px",
  "font-style": "italic",
  "math-variant": "italic",
};

// Create a TextFragment with the equation and metadata
const textFragment = new TextFragment(equation, {
  formats: {
    "text/html": `<span style="font-family: ${formatMetadata["font-family"]}; font-size: ${formatMetadata["font-size"]}; font-style: ${formatMetadata["font-style"]};">${equation}</span>`,
    "application/xhtml+xml": `<span xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${formatMetadata["font-family"]}; font-size: ${formatMetadata["font-size"]}; font-style: ${formatMetadata["font-style"]};">${equation}</span>`,
    "text/plain": equation,
  },
  metadata: {
    "org.openxmlformats.office.spreadsheetml.sheet.formula": equation,
    "application/vnd.google_docs.formula": equation,
  },
});

// Copy the TextFragment to the clipboard
navigator.clipboard.writeText(textFragment).then(() => {
  console.log("Equation copied to clipboard with metadata!");
});
