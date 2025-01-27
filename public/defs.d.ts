// WHAT IS THIS FILE FOR?
////
// ---> You are developing outside of and NPM environment
// ---> You are have the sypher library directly imported into your project
// ---> You want to have intellesense for the sypher library
////
// HOW TO USE THIS FILE?
////
////// FOR ANY SCRIPT REFERENCING {sypher.[FUNCTION]} - Import this line at the top of the script
// ---> // <reference path="[PATH]/defs.d.ts" />

declare namespace sypher {
    /**
     * @description Raw token details fetched in the CryptoModule
     * @typedef {object} TTokenDetails
     * @property {string} contractAddress - The contract address of the token
     * @property {string} poolAddress - The pool address of the token
     * @property {string} balance - The balance of the token
     * @property {number} decimals - The decimals of the token
     * @property {string} name - The name of the token
     * @property {string} symbol - The symbol of the token
     * @property {string} totalSupply - The total supply of the token
     * @property {number} tokenPrice - The price of the token
     * @property {number} userValue - The value of the user's holdings
     * @see TCleanedDetails
     */
    declare type TTokenDetails = {
        contractAddress: string;
        poolAddress: string;
        balance: string;
        decimals: number;
        name: string;
        symbol: string;
        totalSupply: string;
        tokenPrice: number;
        userValue: number;
    }
    /**
     * @description The final cleaned token details
     * @typedef {object} TCleanedDetails
     * @property {string} contractAddress - The contract address of the token
     * @property {string} poolAddress - The pool address of the token
     * @property {number} balance - The balance of the token
     * @property {number} decimals - The decimals of the token
     * @property {string} name - The name of the token
     * @property {string} symbol - The symbol of the token
     * @property {number} totalSupply - The total supply of the token
     * @property {number} tokenPrice - The price of the token
     * @property {string} userValue - The value of the user's holdings
     * 
     * @see TTokenDetails
     */
    declare type TCleanedDetails = {
        contractAddress: string;
        poolAddress: string;
        balance: number;
        decimals: number;
        name: string;
        symbol: string;
        totalSupply: number;
        tokenPrice: number;
        userValue: string;
    }
    /**
     * @description The data for a Uniswap V3 pool
     * @typedef {object} TPoolV3Data
     * @property {ethers.BigNumber} sqrtPriceX96 - The square root price of the pool
     * @property {string} token0 - The address of token0
     * @property {string} token1 - The address of token1
     * @property {number} decimals0 - The decimals of token0
     * @property {number} decimals1 - The decimals of token1
     * @property {ethers.BigNumber} liquidity - The liquidity of the pool
     */
    declare type TPoolV3Data = {
        sqrtPriceX96: ethers.BigNumber;
        token0: string;
        token1: string;
        decimals0: number;
        decimals1: number;
        liquidity: ethers.BigNumber;
    }
    /**
     * @description The pricefeed data for a chain from chainlist
     * @typedef {object} IChainlistData
     * @property {string} name - The name of the chain
     * @property {number} chainId - The chainId of the chain
     * @property {object} nativeCurrency - The native currency of the chain
     * @property {string} nativeCurrency.name - The name of the native currency
     * @property {string} nativeCurrency.symbol - The symbol of the native currency
     * @property {number} nativeCurrency.decimals - The decimals of the native currency
     * @property {string[]} rpc - The RPC URLs for the chain
     * @property {object[]} explorers - The explorers for the chain
     * @property {string} explorers.url - The URL of the explorer
     * @property {string} explorers.name - The name of the explorer
     * @property {string} explorers.standard - The standard of the explorer
     * 
     * @see TChainParams
     * @see CHAINS
     */
    declare type TChainlistData = {
        name: string;
        chainId: number;
        nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
        };
        rpc: string[];
        explorers?: {
            url: string;
            name?: string;
            standard?: string;
        }[];
    };
    declare type TChainParams = {
        chainId: string;
        chainName: string;
        nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
        };
        rpcUrls: string[];
        blockExplorerUrls: string[];
    }

    /**
     * @description Initialize the Crypto Module by fetching the token balance, price, and user value.
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @param {string} version - The target Uniswap version (V2 or V3)
     * @param {string} pair - The paired asset to get the price in (default: "eth")
     * @returns {Promise<object | null>}
     * { contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue }
     * 
     * -------> Call this function to get started! <-------
     * 
     * @interface ICryptoModule
     */
    declare function initCrypto(
        chain: string,
        contractAddress: string,
        poolAddress: string,
        version: string,
        pair?: string
    ): Promise<object | null>;

   /**
     * @description Connect the user's wallet to the website.
     * @param {string} chain - The target chain to connect to
     * @param {TProviderDetail} providerDetail - The provider details for the wallet
     * @returns {Promise<string>} The connected wallet address
     * @see CHAINS - for supported chains
     * 
     * @interface ICryptoModule
     */
   declare function connect(chain: string, providerDetail: TProviderDetail | null = null): Promise<string> | null;

    /**
     * @description Switch the connected wallet to a specified chain.
     * @param {string} chain - The target chain to switch to
     * @see CHAINS - for supported chains
     * 
     * @interface ICryptoModule
     */
    declare function switchChain(chain: string): void;

    /**
     * @description Get the data for a specific chain from chainlist
     * @param {string} chain - The target chain to get the data for
     * @returns {Promise<IChainlistData | null>} The chainlist data for the specified chain
     * @see CHAINS - for supported chains
     * 
     * @interface ICryptoModule
     */
    declare function getChainData(chain: string): Promise<IChainlistData | null>;

    /**
     * @description Get the current price of Ethereum on a specified chain
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} pair - The paired asset to get the price in (default: "eth")
     * @returns {Promise<string | null>} The current price of Ethereum on the specified chain
     * @see CHAINS - for supported chains
     * 
     * @interface ICryptoModule
     */
    declare function getPriceFeed(
        chain: string,
        pair?: string
    ): Promise<string | null>;

    /**
     * @description Get the details of a specified ERC20 token.
     * @param {string} chain - The chain to fetch the token details on
     * @param {string} contractAddress - The target ERC20 contract address
     * @returns {Promise<{ balance: any; decimals: any; name: any; symbol: any; totalSupply: any } | null>} The details of the specified ERC20 token
     *
     * @interface ICryptoModule
     */
    declare function getTokenDetails(
        chain: string,
        contractAddress: string
    ): Promise<{ balance: any; decimals: any; name: any; symbol: any; totalSupply: any } | null>;

    /**
     * @description Get the price of a token in a Uniswap V2 pool.
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} poolAddress - The target Uniswap V2 pool address
     * @param {string} pair - The pair token to calculate price against
     * @returns {Promise<number | null>} The price of the token in the specified Uniswap V2 pool or `null` if unavailable
     * 
     * @interface ICryptoModule
     */
    declare function getPriceV2(
        chain: string,
        poolAddress: string,
        pair: string
    ): Promise<number | null>;

    /**
     * @description Get the price of a token in a Uniswap V3 pool.
     * @param {string} chain - The target chain to get the price from - Connected wallet must be on a supported chain
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @returns {Promise<number | null>} The price of the token in the specified Uniswap V3 pool
     * @see getPriceFeed
     * @see getPoolV3
     * 
     * @interface ICryptoModule
     */
    declare function getPriceV3(
        chain: string,
        contractAddress: string,
        poolAddress: string,
        pair: string
    ): Promise<number | null>;

    /**
     * @description Get the pool details of a Uniswap V3 pool.
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @returns {Promise<TPoolV3Data | null>} The pool details of the specified Uniswap V3 pool
     * @see TPoolV3Data
     * 
     * @interface ICryptoModule
     */
    declare function getPoolV3(
        chain: string,
        contractAddress: string,
        poolAddress: string
    ): Promise<TPoolV3Data | null>;

    /**
     * @description Calculate the value of a user's token holdings.
     * @param {object} balance - The user's token balance (BN)
     * @param {number} price - The current price of the token
     * @returns {number} The value of the user's token holdings
     * 
     * @interface ICryptoModule
     */
    declare function getUserValue(
        balance: object,
        price: number
    ): number | null;

    /**
     * @description Clean up the token details for easier readability.
     * @param {object} tokenDetails - The raw token details object
     * @returns {object} The cleaned token details object
     * 
     * @interface ICryptoModule
     */
    declare function clean(tokenDetails: TTokenDetails): object | null;

    /**
     * @description — Initialize the discovery of all installed wallets.
     */
    declare function initProviderSearch(): void;

    /**
     * @description Get the provider for the current wallet connection.
     * @returns {any} The provider for the current wallet connection
     * 
     * @interface ICryptoModule
     */
    declare function getProvider(): any;

    /**
     * @description Initializes a theme by adding a stylesheet to the head of the document.
     * @param {string} [theme="default"] - The theme to apply [Default: "default"]
     */
    declare function initTheme(theme: string): void;

    /**
     * @description Applies a style to a given set of elements.
     * @param {HTMLElement[]} elements - The target HTML elements to apply the theme
     * @param {object} params - The parameters to customize the theme
     * 
     * @interface IInterfaceModule
     */
    declare function applyStyle(
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
    declare function createButton(params: TButtonParams): HTMLButtonElement | HTMLDivElement | null;
    declare type TButtonParams = {
        type?: string,
        text: string,
        icon?: string,
        modal?: boolean,
        theme?: string,
        chain?: string,
        append?: HTMLElement,
        onClick?: () => void,
    }
    /**
     * @description Creates a modal on the page with the given params
     * @param {object} params - The parameters to customize the modal
     * 
     * @interface IInterfaceModule
     */
    declare function createModal(
        params: { append: HTMLElement, type: string, theme: string, chain: string }
    ): TLogModal | TConnectModal | null;

    /**
     * @description Toggles the loader on a given element by updating its inner HTML.
     * @param {HTMLElement} element - The target HTML element where the loader or text will be shown
     * @param {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
     * @param {boolean} [isEnabled=true] - Whether to show the loader (true) or the new text (false)
     * @param {string} [newText=""] - The new text to display when the loader is disabled
     * 
     * CSS Loaders Resource: [Link](https://css-loaders.com/)
     * 
     * @interface IInterfaceModule
     **/
    declare function toggleLoader(
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
     * 
     * @interface IInterfaceModule
     */
    declare function parallax(): void;

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
     * @interface IInterfaceModule
     * 
     */
    declare function fade(
        distance?: string,
        length?: string
    ): void;

    /**
     * @description Validate the inputs based on the rules provided.
     * @param {object} inputs - The inputs to validate
     * @param {object} rules - The rules to validate the inputs against
     * @param {string} [context="validateInput"] - The context of the validation
     * @returns {boolean} The validation status
     * 
     * @interface IHelperModule
     */
    declare function validateInput(
        inputs: object,
        rules: object,
        context ?: string
    ): boolean;

    /**
     * @description Validate the chain for methods that require support.
     * @param {string} chain - The chain to validate
     * @returns {{ chainData: object, chainId: string }} The chain data and chainId for the specified chain
     * 
     * @interface IHelperModule
     */
    declare function validateChain(
        chain: string
    ): { chainData: object, chainId: string } | null;

    /**
     * @description Initialize the logger for the logger modal. (Or for a custom modal)
     * @returns {void}
     * 
     * @interface ILogModule
     */
    declare function initLogger(): void;
    
    /**
     * @description Truncate a string to a specified length.
     * @param {string} string - The target string to truncate.
     * @param {number} [startLength] - The number of characters to keep from the start. [Default: 6]
     * @param {number} [endLength] - The number of characters to keep from the end. [Default: 4]
     * @returns {string} The truncated {string}.
     * 
     * @interface ITruncationModule
     */
    declare function truncate(
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
     * 
     * @interface ITruncationModule
     */
    declare function truncateBalance(
        balance: number,
        decimals?: number,
        maxLength?: number
    ): string | null;

    /**
     * @description Get the current window dimensions.
     * @returns {boolean} Whether the page is focused.
     * 
     * @interface IWindowModule
     */
    declare function pageFocus(): boolean;
}