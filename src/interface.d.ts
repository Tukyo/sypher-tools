export interface IInterfaceModule {
    /**
     * @description Applies a theme to a given set of elements.
     * @param {HTMLElement[]} elements - The target HTML elements to apply the theme
     * @param {object} params - The parameters to customize the theme
     */
    applyTheme(
        elements: HTMLElement[],
        params: { type: string, theme: string }
    ): void;

    /**
     * @description Creates a button to connect the wallet.
     * @param {HTMLElement} element - The target HTML element where the button will be created [Default: document.body]
     * @param {function} onClick - The function to call when the button is clicked [Default: sypher.connect("ethereum")]
     * @param {object} params - The parameters to customize the button [Default: { type:, "connect", text: "Connect Wallet", modal: false }]
     * 
     */
    createButton(
        element?: HTMLElement,
        onClick?: () => void,
        params?: { type: string, text: string, options: { modal: boolean, theme: string } }
    ): HTMLButtonElement | null;

    /**
     * @description Creates a modal on the page with the given params
     * @param {object} params - The parameters to customize the modal
     */
    createModal(
        params: { append: HTMLElement, type: string, theme: string }
    ): HTMLElement | null;

    /**
     * @description Toggles the loader on a given element by updating its inner HTML.
     * @param {HTMLElement} element - The target HTML element where the loader or text will be shown
     * @param {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
     * @param {boolean} [isEnabled=true] - Whether to show the loader (true) or the new text (false)
     * @param {string} [newText=""] - The new text to display when the loader is disabled
     * 
     * CSS Loaders Resource: [Link](https://css-loaders.com/)
     **/
    toggleLoader(
        element: HTMLElement,
        loaderHTML: string,
        isEnabled?: boolean,
        newText?: string
    ): void;

    /**
     * @description Applies parallax effect to elements based on the [data-speed] attribute.
     * @example 
     * ```html
     * <div data-speed="0.5"></div> <!-- HTML -->
     * ```
     * ```
     * window.addEventListener('load', () => { sypher.parallax(); }); // js
     * ```
     */
    parallax(): void;

    /**
     * @description Fades in elements when they are in the viewport.
     * @example
     * // HTML
     * <div data-fade></div>
     * // JS
     * document.addEventListener('DOMContentLoaded', function () { sypher.fade('30px', '0.25s'); });
     * // ---> This will fade in the element over 0.25 seconds while moving it 30px upwards
     * 
     * @param {string} [distance='20px'] - The distance to move the element when fading in [Default: '20px']
     * @param {string} [length='0.5s'] - The duration of the fade effect [Default: '0.5s']
     * 
     */
    fade(
        distance?: string,
        length?: string
    ): void;
}