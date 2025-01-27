export interface IChainConfig {
    params: { chainId: string }[];
    priceFeeds: Record<string, string>;
    pairAddresses: Record<string, string>;
}
export interface ICryptoModule {
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
     */
    initCrypto( params: TInitParams ): Promise<TTokenDetails | null>;

    /**
     * @description Connect the user's wallet to the website.
     * @param {string} chain - The target chain to connect to
     * @param {TProviderDetail} providerDetail - The provider details for the wallet
     * @returns {Promise<string>} The connected wallet address
     * @see CHAINS - for supported chains
     */
    connect(chain: string, providerDetail: TProviderDetail | null = null): Promise<string> | null;

    /**
     * @description Disconnect the user's wallet from the website.
     */
    disconnect(): void;

    /**
     * @description Onboard the user if they have no wallet.
     * @see TProviderDetail
     */
    onboard(providerDetail: TProviderDetail): void;

    /**
     * @description Connection status.
     * 
     * @type {string | null}
     */
    _connected?: string | null;

    /**
     * @description Switch the connected wallet to a specified chain.
     * @param {string} chain - The target chain to switch to
     * @see CHAINS - for supported chains
     */
    switchChain(chain: string): void;

    /**
     * @description The chain the wallet is currently connected to.
     * 
     * @type {string | null}
     */
    _currentChain?: string | null;

    /**
     * @description Get the data for a specific chain from chainlist
     * @param {string} chain - The target chain to get the data for
     * @returns {Promise<IChainlistData | null>} The chainlist data for the specified chain
     * @see CHAINS - for supported chains
     */
    getChainData(chain: string): Promise<IChainlistData | null>;

    /**
     * @description Get the current price of Ethereum on a specified chain
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} pair - The paired asset to get the price in (default: "eth")
     * @returns {Promise<string | null>} The current price of Ethereum on the specified chain
     * @see CHAINS - for supported chains
     */
    getPriceFeed(
        chain: string,
        pair?: string
    ): Promise<string | null>;

    /**
     * @description Get the details of a specified ERC20 token.
     * @param {string} chain - The chain to fetch the token details on
     * @param {string} contractAddress - The target ERC20 contract address
     * @returns {Promise<{ balance: any; decimals: any; name: any; symbol: any; totalSupply: any } | null>} The details of the specified ERC20 token
     */
    getTokenDetails(
        chain: string,
        contractAddress: string
    ): Promise<{ balance: any; decimals: any; name: any; symbol: any; totalSupply: any } | null>;

    /**
     * @description Get the price of a token in a Uniswap V2 pool.
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} poolAddress - The target Uniswap V2 pool address
     * @param {string} pair - The pair token to calculate price against
     * @returns {Promise<number | null>} The price of the token in the specified Uniswap V2 pool or `null` if unavailable
     */
    getPriceV2(
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
     */
    getPriceV3(
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
     */
    getPoolV3(
        chain: string,
        contractAddress: string,
        poolAddress: string
    ): Promise<TPoolV3Data | null>;

    /**
     * @description Calculate the value of a user's token holdings.
     * @param {object} balance - The user's token balance (BN)
     * @param {number} price - The current price of the token
     * @returns {number} The value of the user's token holdings
     */
    getUserValue(
        balance: object,
        price: number
    ): number | null;

    /**
     * @description Clean up the token details for easier readability.
     * @param {object} tokenDetails - The raw token details object
     * @returns {object} The cleaned token details object
     */
    clean(tokenDetails: TTokenDetails): object | null;

    /**
     * @description Initialize the discovery of all installed wallets.
     */
    async initProviderSearch(): void;

    /**
     * @description Get the provider for the current wallet connection.
     * @returns {any} The provider for the current wallet connection
     */
    getProvider(): any;

    /**
     * @description Get the connected wallet address.
     * @returns {string | null} The connected wallet address or `null` if no wallet is connected
     */
    getConnected(): string | null;
}

// #region TOKEN
/**
 * @description The parameters to initialize the CryptoModule
 * @typedef {object} TInitParams
 * @property {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
 * @property {string} contractAddress - The CA for the token
 * @property {string} poolAddress - The LP address for the token
 * @property {string} version - The target Uniswap version (V2 or V3)
 * @property {string} pair - The paired asset to get the price in (default: "eth")
 * @property {TProviderDetail} detail - The provider details for the wallet
 */
export type TInitParams = {
    chain: string;
    contractAddress: string;
    poolAddress: string;
    version: string;
    pair?: string;
    detail?: TProviderDetail
}
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
export type TTokenDetails = {
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
export type TCleanedDetails = {
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
export type TPoolV3Data = {
    sqrtPriceX96: ethers.BigNumber;
    token0: string;
    token1: string;
    decimals0: number;
    decimals1: number;
    liquidity: ethers.BigNumber;
}
// #endregion TOKEN
////
// #region CHAIN
export interface IChainlistData {
    chainlistData: TChainlistData;
    params: TChainParams;
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
export type TChainlistData = {
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
export type TChainParams = {
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
// #endregion CHAIN
////
// #region PROVIDER
/**
 * @description EIP-1193 interface
 */
export interface EIP1193 {
    request(args: RequestArguments): Promise<unknown>;
    on?(event: string, listener: (...args: unknown[]) => void): void;
    removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}
interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}
/**
 * @description The Ethereum provider
 */
export type TEthereumProvider = { request: (args: { method: string; params?: any[] }) => Promise<any>; };
/**
 * @description Discovered providers
 * @typedef {object} TProviderDetail
 * @property {TProviderInfo} info - The provider info
 * @property {EIP1193} provider - The provider object
 */
export type TProviderDetail = { info: TProviderInfo, provider: EIP1193; }
/**
 * @description Provider info
 * @typedef {object} TProviderInfo
 * @property {string} icon - The icon encoded in base64
 * @property {string} name - The name of the provider
 * @property {string} rdns - The reverse DNS of the provider
 * @property {string} uuid - The UUID of the provider
 * @property {boolean} onboard - Flag to signal if the provider is a placeholder
 */
export type TProviderInfo = {
    icon: string,
    name: string,
    rdns: string,
    uuid: string,
    onboard: TOnboardInfo
}
/**
 * @description Onboard info
 * @typedef {object} TOnboardInfo
 * @property {boolean} bool - Flag to signal if the provider is a placeholder
 * @property {string} link - The URL to onboard the provider
 * @property {string} deeplink - The deeplink to onboard the provider
 * @property {object} fallbacklinks
 */
export type TOnboardInfo = {
    bool: boolean,
    link: string,
    deeplink: string,
    fallback: {
        ios: string,
        android: string
    }
}
// #endregion PROVIDER