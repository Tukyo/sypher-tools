// #region INTERFACE
export interface IHelperModule {
    /**
     * Validate the chain for methods that require support.
     */
    validateChain(
        chain: string
    ): Promise<string | null>;
}
export interface ILogModule {
    /**
     * Initialize the logger for the logger modal. (Or for a custom modal)
     * @returns {void}
     */
    initLogger(): void;

    /**
     * Log a message to the console.
     * @see TLogParams
     */
    log(message: string, params?: TLogParams): void;
}
export interface ITruncationModule {
    /**
     * Truncate a string to a specified length.
     * @returns {string} The truncated {string}.
     */
    truncate(
        string: string,
        startLength?: number,
        endLength?: number
    ): string | null;
    /**
     * Truncate a balance number to a specified length.
     * @returns {string} The truncated balance {string}.
     */
    truncateBalance(
        balance: number,
        decimals?: number,
        maxLength?: number
    ): string | null;
}
export interface IWindowModule {
    /**
     * Get the visibility state of the page.
     */
    pageFocus(): boolean;

    /**
     * Get the current environment of the user.
     * @see TUserEnvironment
     */
    userEnvironment(): TUserEnvironment;
}
// #endregion INTERFACE
////
// #region TYPES
export type TUserEnvironment = {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    deviceType: string;
    browser: string;
    operatingSystem: string;
    userAgent: string;
    platform: string;
    ethereum: boolean;
    languages: readonly string[];
    cookiesEnabled: boolean;
    screenDetails: TScreenDetails;
    timezone: string;
}
export type TScreenDetails = {
    width: number;
    height: number;
    availableWidth: number;
    availableHeight: number;
    colorDepth: number;
    pixelDepth: number;
}
export type TLogType = 'log' | 'warn' | 'error';

export type TLogParams = {
    type?: TLogType;
    styles?: Partial<{
        color: string;
        background: string;
        fontSize: string;
        fontWeight: string;
        fontStyle: string;
        textDecoration: string;
        textTransform: string;
        padding: string;
        margin: string;
        border: string;
        borderRadius: string;
        textShadow: string;
    }>;
};
// #endregion TYPES