const InterfaceModule = {
    /**
     * Toggles the loader on a given element by updating its inner HTML.
     * 
     * @example toggleLoader(elementVariable, true, `<div class="loader"></div>`) // Show loader
     * @example toggleLoader(elementVariable, false, "", "New Text") // No loader and replacement text
     * 
     * @param {HTMLElement} element - The target HTML element where the loader or text will be shown.
     * @param {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
     * @param {boolean} [isEnabled=true] - Whether to show the loader (true) or the new text (false).
     * @param {string} [newText=""] - The new text to display when the loader is disabled.
     * 
     * CSS Loaders Resource: [Link](https://css-loaders.com/)
     **/
    toggleLoader: function (element, isEnabled = true, loaderHTML, newText = "") {
        if (!element) return;
        if (isEnabled) {
            element.innerHTML = loaderHTML;
        } else {
            element.innerHTML = newText;
        }
    }
}