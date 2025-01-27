import { TInitParams } from "./crypto.d";

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
     * @description Creates a button on the page with the given parameters.
     * @param {object} params - The parameters to customize the button
     * @returns {HTMLButtonElement | HTMLDivElement | null} The created button element, or null if the type is invalid.
     * 
     * @see TButtonParams
     */
    createButton(params: TButtonParams): HTMLButtonElement | HTMLDivElement | null;

    /**
     * @description The text to display on the connect button.
     */
    _connectText?: string | null;

    /**
     * @description Creates a modal on the page with the given params
     * @param {object} params - The parameters to customize the modal
     */
    createModal(
        params: { append: HTMLElement, type: string, theme: string, initCrypto?: TInitParams }
    ): Promise<TLogModal | TConnectModal | null>;

    /**
     * @description Initializes a modal based on the provided type.
     * @param type - The type of modal to initialize
     * @param theme - The theme to apply to the modal
     * @returns The initialized modal object, or null if the type is invalid.
     */
    initModal(type: string, theme: string): TLogModal | TConnectModal | null;

    /**
     * @description Creates a view on the page with the given params
     * @param {object} params - The parameters to customize the view
     * @returns {HTMLElement | null} The created view element, or null if the type is invalid.
     */
    createElement(params: TElementParams): HTMLElement | null;

    /**
     * @description Toggles the loader on a given element by updating its inner HTML.
     * @param {HTMLElement} element - The target HTML element where the loader or text will be shown
     * @param {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
     * @param {boolean} [isEnabled=true] - Whether to show the loader (true) or the new text (false)
     * @param {string} [newText=""] - The new text to display when the loader is disabled
     * 
     * CSS Loaders Resource: [Link](https://css-loaders.com/)
     **/
    toggleLoader(params: TLoaderParams): void;

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

/**
 * @description Type declaration for the button parameters
 * @typedef {object} ButtonParams
 * @property {string} type - The type of button to create
 * @property {string} text - The text to display on the button
 * @property {string} icon - The icon to display on the button
 * @property {boolean} modal - Whether the button should open a modal
 * @property {string} theme - The theme to apply to the button
 * @property {HTMLElement} append - The element to append the button
 * @property {function} onClick - The function to execute when the button is clicked
 */
export type TButtonParams = {
    type?: string,
    text: string,
    icon?: string,
    modal?: boolean,
    theme?: string,
    append?: HTMLElement,
    onClick?: () => void,
    initCrypto?: TInitParams
}

/**
 * @description Type declaration for the loader parameters
 * @typedef {object} LoaderParams
 * @property {HTMLElement} element - The target HTML element where the loader or text will be shown
 * @property {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
 * @property {boolean} isEnabled - Whether to show the loader (true) or the new text (false)
 * @property {string} newText - The new text to display when the loader is disabled
 * @property {boolean} replace - Whether to replace the existing content or append to it
 */
export type TLoaderParams = {
    element: HTMLElement,
    loaderHTML?: string,
    isEnabled?: boolean,
    newText?: string
    replace?: boolean
}

/**
 * @description Type declaration for the element parameters
 * @typedef {object} ElementParams
 * @property {HTMLElement} append
 * @property {string} type
 * @property {string} id
 * @property {string} theme
 * @property {object} attributes
 * @property {object} styles
 * @property {object} events
 * @property {string} innerHTML
 * @property {ElementParams[]} children - The children elements to append to the element
 */
export type TElementParams = {
    append?: HTMLElement;
    type: string;
    id?: string;
    theme?: string;
    classes?: string[];
    attributes?: { [key: string]: string };
    events?: { [key: string]: (event: Event) => void };
    innerHTML?: string;
    children?: TElementParams[];
};