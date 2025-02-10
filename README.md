# GPTCopy

GPTCopy is a browser extension that allows users to copy equations from ChatGPT to Word with a single click. The extension detects KaTeX-rendered equations on the ChatGPT website and provides a tooltip to copy the equation in MathML or LaTeX format.

## Features

- Detects KaTeX-rendered equations on ChatGPT.
- Provides a tooltip to copy equations in MathML or LaTeX format.
- Automatically hides tooltips on scroll.
- Supports dynamic content with a MutationObserver.

## Installation

1. Clone the repository to your local machine:
    ```sh
    git clone https://github.com/yourusername/GPTCopy.git
    ```

2. Navigate to the project directory:
    ```sh
    cd GPTCopy/gptCopy/dist
    ```

3. Load the extension in your browser:
    - Open Chrome and go to `chrome://extensions/`.
    - Enable "Developer mode" in the top right corner.
    - Click "Load unpacked" and select the `dist` directory of the project.

Alternatively, you can install the extension directly from the Chrome Web Store:
[GPTCopy on Chrome Web Store](https://chromewebstore.google.com/detail/gptcopy/ibnfnmnloecjgmephfokgmlppccheoed)

## Usage

1. Navigate to the ChatGPT website.
2. Hover over any KaTeX-rendered equation to see the "Copy" tooltip.
3. Click on the tooltip to copy the equation in the selected format (MathML or LaTeX).
4. Paste the copied equation into Word or any other application that supports MathML or LaTeX.

## Configuration

You can configure the format (MathML or LaTeX) by setting the `format` key in Chrome's storage. By default, the format is set to MathML.

## Development

### Project Structure

- `dist/manifest.json`: The extension manifest file.
- `dist/content.js`: The content script that handles equation detection and copying.
- `dist/styles.css`: The stylesheet for the tooltip.
- `useless/test.html`: A test HTML file for development purposes.

### Running the Extension

1. Make changes to the code in the `dist` directory.
2. Reload the extension in Chrome by going to `chrome://extensions/` and clicking the reload button for GPTCopy.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
