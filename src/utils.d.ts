export interface IHelperModule {
    /**
     * @description Validate the inputs based on the rules provided.
     * @param {object} inputs - The inputs to validate
     * @param {object} rules - The rules to validate the inputs against
     * @param {string} [context="validateInput"] - The context of the validation
     * @returns {boolean} The validation status
     */
    validateInput(
        inputs: object,
        rules: object,
        context?: string
    ): boolean;

    /**
     * @description Validate the chain for methods that require support.
     * @param {string} chain - The chain to validate
     * @returns {{ chainData: object, chainId: string }} The chain data and chainId for the specified chain
     */
    validateChain(
        chain: string
    ): { chainData: object, chainId: string } | null;
}
export interface ILogModule {
    /**
     * @description Initialize the logger for the logger modal. (Or for a custom modal)
     * @returns {void}
     */
    initLogger(): void;
}
export interface ITruncationModule {
    /**
     * @description Truncate a string to a specified length.
     * @param {string} string - The target string to truncate.
     * @param {number} [startLength] - The number of characters to keep from the start. [Default: 6]
     * @param {number} [endLength] - The number of characters to keep from the end. [Default: 4]
     * @returns {string} The truncated {string}.
     */
    truncate(
        string: string,
        startLength?: number,
        endLength?: number
    ): string | null;
    /**
     * @description Truncate a balance number to a specified length.
     * @param {number} balance - The target balance to truncate.
     * @param {number} [decimals] - The number of decimal places to keep. [Default: 2]
     * @param {number} [maxLength=8] - The maximum length of the truncated string. [Default: 8]
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
     * @description Get the current window dimensions.
     * @returns {boolean} Whether the page is focused.
     */
    pageFocus(): boolean;
}