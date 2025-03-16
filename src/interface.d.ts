import { TInitParams } from "./crypto.d";

// #region INTERFACE
export interface IInterfaceModule {
    /**
     * @description Currently applied theme.
     * @type {string | null}
     */
    _theme?: string | null;

    /**
     * @description The text to display on the connect button.
     */
    _connectText?: string | null;

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
     * @description Creates a modal on the page with the given params
     * @param {object} params - The parameters to customize the modal
     */
    createModal(
        params: { append: HTMLElement, type: string, theme: string, initCrypto?: TInitParams }
    ): Promise<TLogModal | TConnectModal | TMintModal | null>;

    /**
     * @description Initializes a modal based on the provided type.
     * @param type - The type of modal to initialize
     * @param theme - The theme to apply to the modal
     * @returns The initialized modal object, or null if the type is invalid.
     */
    initModal(type: string, theme: string): TLogModal | TConnectModal | TMintModal | null;

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

    /**
     * @description Fetches UI details
     */
    getUI(): {
        theme: string,
        connectText: string
    };
}
export interface IViewsModule {
    brandingView(
        modalObj: TConnectModal
    ): void;
    accountView(
        account: string,
        modalObj: TConnectModal,
        mergedProviders: TEIP6963[]
    ): void;
    currentProviderView(
        modalObj: TConnectModal,
    ): void;
    providerSelectView(
        account: string | null,
        modalObj: TConnectModal,
        initCrypto: TInitParams,
        appliedTheme: string
    ): TEIP6963[];
}
// #endregion INTERFACE
////
// #region TYPES
export type TMintModal = {
    type: "mint";
    parent: HTMLElement;
    container: HTMLElement;
}
export type TLogModal = {
    type: "log";
    parent: HTMLElement;
    container: HTMLElement;
    toggle: HTMLElement;
}
export type TConnectModal = {
    type: "connect";
    parent: HTMLElement;
    container: HTMLElement;
    toggle: HTMLElement;
    head: HTMLElement;
    title: HTMLElement;
    body: HTMLElement;
}
export type TCModalItem = {
    container: HTMLElement;
    icon: HTMLElement;
    name: HTMLElement;
}
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
export type TLoaderParams = {
    element: HTMLElement,
    loaderHTML?: string,
    isEnabled?: boolean,
    newText?: string
    replace?: boolean
}
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
// #endregion TYPES