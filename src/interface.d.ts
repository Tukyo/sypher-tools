export interface IInterfaceModule {
    /**
     * @description Initializes a theme by adding a stylesheet to the head of the document.
     * @param {string} [theme="default"] - The theme to apply [Default: "default"]
     */
    initTheme(theme: string): void;
    /**
     * @description Applies a theme to a given set of elements.
     * @param {HTMLElement[]} elements - The target HTML elements to apply the theme
     * @param {object} params - The parameters to customize the theme
     */

    /**
     * @description Currently applied theme.
     * @type {string | null}
     */
    _theme?: string | null;

    applyStyle(
        elements: HTMLElement[],
        params: { type: string, theme: string }
    ): void;

    /**
     * @description Creates a button to connect the wallet.
     * @param {HTMLElement} [element] - The target HTML element to append the button
     * @param {function} [onClick] - The function to execute when the button is clicked
     * @param {object} [params] - The parameters to customize the button
     * @param {string} [params.type="connect"] - The type of button to create [Default: "connect"]
     * @param {string} [params.text="Connect Wallet"] - The text to display on the button [Default: "Connect Wallet"]
     * @param {string} [params.icon="wallet"] - The icon to display on the button [Default: "wallet"]
     * @param {object} [params.options] - The options to customize the button     * 
     */
    createButton(
        element?: HTMLElement,
        onClick?: () => void,
        params?: { type: string, text: string, icon: string, options: { modal: boolean, theme: string, chain: string } }
    ): HTMLButtonElement | HTMLDivElement | null;

    /**
     * @description Creates a modal on the page with the given params
     * @param {object} params - The parameters to customize the modal
     */
    createModal(
        params: { append: HTMLElement, type: string, theme: string, chain: string }
    ): void;

    /**
     * @description Initializes a modal based on the provided type.
     * @param type - The type of modal to initialize
     * @param theme - The theme to apply to the modal
     * @returns The initialized modal object, or null if the type is invalid.
     */
    initModal(type: string, theme: string): TLogModal | TConnectModal | null;

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

/**
 * @description Type declaration for the Log Modal
 * @typedef {object} LogModal
 * @property {HTMLElement} parent - The parent element to append the modal
 * @property {HTMLElement} container - The container element for the modal
 * @property {HTMLElement} toggle - The toggle button for the modal
 */
export type TLogModal = {
    type: "log";
    parent: HTMLElement;
    container: HTMLElement;
    toggle: HTMLElement;
}

/**
 * @description Type declaration for the Connect Modal
 * @typedef {object} ConnectModal
 * @property {HTMLElement} parent - The parent element to append the modal
 * @property {HTMLElement} container - The container element for the modal
 * @property {HTMLElement} toggle - The toggle button for the modal
 * @property {HTMLElement} head - The header element for the modal
 * @property {HTMLElement} title - The title element for the modal
 * @property {HTMLElement} body - The body element for the modal
 */
export type TConnectModal = {
    type: "connect";
    parent: HTMLElement;
    container: HTMLElement;
    toggle: HTMLElement;
    head: HTMLElement;
    title: HTMLElement;
    body: HTMLElement;
}

/**
 * @description Type declaration for connect modal items
 * @typedef {object} CModalItem
 * @property {HTMLElement} container - The container element for the item
 * @property {HTMLElement} icon - The icon element for the item
 * @property {HTMLElement} name - The name element for the item
 */
export type TCModalItem = {
    container: HTMLElement;
    icon: HTMLElement;
    name: HTMLElement;
}

// export type TConnectButton = {

// }

// export type TProviderButton = {
    
// }