// #region INTERFACE
export interface ICryptoModule {
    /**
     * Connected wallet address.
     */
    _connected?: string | null;

    /**
     * The chain the wallet is currently connected to.
     */
    _chain?: TChainParams | null;

    /**
     * The price of the paired asset on the connected chain.
     */
    _pairPrice?: {value: string, timestamp: number} | null | undefined;

    /**
     * The stored token details.
     */
    _details?: TCleanedDetails | null;
    
    /**
     * The stored provider.
     */
    _EIP6963?: TEIP6963 | null;

    /**
     * Connected user's ETH balance.
     */
    _ethBalance?: number | null;

    /**
     * Connected user's ENS name.
     */
    _ens?: string | null | undefined;

    /**
     * Initialize the Crypto Module by fetching TCleanedDetails.
     * -------> Call this function to get started! <-------
     */
    initCrypto(params: TInitParams): Promise<TCleanedDetails | null>;

    /**
     * Connect the user's wallet to the website.
     * @returns {Promise<string>} The connected wallet address
     * @see TEIP6963
     */
    connect(
        chain: string, 
        providerDetail?: TEIP6963 | null
    ): Promise<{ primaryAccount?: string | null; ethBalance?: number | null } | null>;

    /**
     * Disconnect the user's wallet from the website.
     */
    disconnect(): void;

    /**
     * Detect when the connected account changes.
     * @param {boolean} active - Add or remove the event listener
     */
    accountChange(active: boolean): void;

    /**
     * Onboard the user if they have no wallet.
     * @see TEIP6963
     */
    onboard(providerDetail: TEIP6963): void;

    /**
     * Get the user's ETH balance.
     */
    getETH(): Promise<number | null>;

    /**
     * Get the user's ens name.
     */
    getENS: (address: string) => Promise<string | null | undefined>;

    /**
     * Get the chain the wallet is connected to.
     */
    getChain(): TChainParams | null | undefined;

    /**
     * Switch the connected wallet to a specified chain.
     * @param {string} chain - The target chain to switch to
     */
    switchChain(chain: string): void;

    /**
     * Get the data for a specific chain from chainlist
     * @param {string} chain - The target chain to get the data for
     * @returns {Promise<IChainlistData | null>} The chainlist data for the specified chain
     */
    getChainData(chain: string): Promise<TChainParams | null>;

    /**
     * Get the current price of Ethereum on a specified chain
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} pair - The paired asset to get the price in (default: "eth")
     * @returns {Promise<string | null>} The current price of Ethereum on the specified chain
     */
    getPriceFeed(
        chain: string,
        pair?: string
    ): Promise<string | null | undefined>;

    /**
     * Get the details of a specified ERC20 token.
     * @param {string} chain - The chain to fetch the token details on
     * @param {string} contractAddress - The target ERC20 contract address
     * @returns {Promise<{ balance: any; decimals: any; name: any; symbol: any; totalSupply: any } | null>} The details of the specified ERC20 token
     */
    getTokenDetails(
        chain: string,
        contractAddress: string
    ): Promise<{ balance: any; decimals: any; name: any; symbol: any; totalSupply: any } | null>;

    /**
     * Get the price of a token in a Uniswap V2 pool.
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} poolAddress - The target Uniswap V2 pool address
     * @param {string} pair - The pair token to calculate price against
     * @returns {Promise<number | null>} The price of the token in the specified Uniswap V2 pool or `null` if unavailable
     */
    getPriceV2(
        chain: string,
        poolAddress: string,
        pair: string,
        pairAddress: string
    ): Promise<number | null>;

    /**
     * Get the price of a token in a Uniswap V3 pool.
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
        pair: string,
        pairAddress: string
    ): Promise<number | null>;

    /**
     * Get the pool details of a Uniswap V3 pool.
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
     * Calculate the value of a user's token holdings.
     * @param {object} balance - The user's token balance (BN)
     * @param {number} price - The current price of the token
     * @returns {number} The value of the user's token holdings
     */
    getUserValue(
        balance: object,
        price: number
    ): number | null;

    /**
     * Clean up the token details for easier readability.
     * @param {object} tokenDetails - The raw token details object
     * @returns {object} The cleaned token details object
     */
    clean(tokenDetails: TRawDetails): TCleanedDetails | null;

    /**
     * Get the cleaned token details.
     * @returns {object | null} The cleaned token details
     */
    getCleaned(): TCleanedDetails | null;

    /**
     * Initialize the discovery of all installed wallets.
     */
    async initProviderSearch(): void;

    /**
     * Get the provider for the current wallet connection.
     * 
     * ----> Use "await" only when fetching the mainnet provider <----
     * @returns Either the EIP6963 provider or the EIP1193 window.ethereum provider if false, returns the public mainnet provider if true
     */
    getProvider(isPublic: boolean = false): EIP1193Provider | any;

    /**
     * Get the connected wallet address.
     * @returns {string | null} The connected wallet address or `null` if no wallet is connected
     */
    getConnected(): string | null;

    /**
     * Clear the internal memory of the CryptoModule.
     */
    flush(): void;
}
export interface IChainConfig {
    params: { chainId: string }[];
    priceFeeds: Record<string, string>;
    pairAddresses: Record<string, string>;
}
export interface EIP1193Provider {
    isStatus?: boolean
    host?: string
    path?: string
    sendAsync?: (
        request: { method: string; params?: Array<unknown> },
        callback: (error: Error | null, response: unknown) => void
    ) => void
    send?: (
        request: { method: string; params?: Array<unknown> },
        callback: (error: Error | null, response: unknown) => void
    ) => void
    request: (request: {
        method: string
        params?: Array<unknown>
    }) => Promise<unknown>
}
interface ProviderRpcError extends Error {
    code: number;
    data?: unknown;
}
interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}
// #endregion INTERFACE
////
// #region TYPES
////
    // #region PROVIDER
    /**
     * Discovered EIP6963 providers
     * @property {TProviderInfo} - Custom EIP6963 Info Object containing onboarding properties : { icon, name, rdns, uuid, onboard }
     * @property {any} - EIP1193Provider 'any' used for type ignorance
     */
    export type TEIP6963 = { 
        info: TProviderInfo,
        provider: any;
    }
    /**
     * Custom EIP6963 Provider Info containing onboarding properties
     */
    export type TProviderInfo = {
        icon: string,
        name: string,
        rdns: string,
        uuid: string,
        onboard: TOnboardInfo
    }
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
////
    // #region TOKEN
    /**
     * Parameters to initialize the CryptoModule
     */
    export type TInitParams = {
        chain: string;
        contractAddress: string;
        poolAddress: string;
        pairAddress: string;
        version: string;
        pair?: string;
        detail?: TEIP6963
        icon?: string
    }
    /**
     * Raw token details fetched pre-cleaning in the CryptoModule
     * @see TCleanedDetails
     */
    export type TRawDetails = {
        address: string;
        ens?: string;
        contractAddress: string;
        poolAddress: string;
        pairAddress: string;
        ethBalance: number;
        balance: string;
        decimals: number;
        name: string;
        symbol: string;
        icon: string;
        totalSupply: string;
        tokenPrice: number;
        userValue: number;
        version: string;
        pair: string;
    }
    /**
     * Cleaned token details stored in the CryptoModule
     * @see TRawDetails
     */
    export type TCleanedDetails = {
        user: {
            address: string;
            ens?: string;
            ethBalance: number;
            tokenBalance: number;
            value: string;
        },
        token: {
            contractAddress: string;
            poolAddress: string;
            pairAddress: string;
            decimals: number;
            name: string;
            symbol: string;
            icon: string;
            totalSupply: number;
            tokenPrice: number;
            version: string;
            pair: string;
        }
    }
    /**
     * Uniswap V3 pool
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
    export type TChainParams = {
        name: string;
        chain: string;
        icon?: [{
            url: string;
            width: number;
            height: number;
            format: string;
        }];
        rpc: string[];
        nativeCurrency: {
            name: string;
            symbol: string;
            decimals: number;
        };
        infoURL: string;
        shortName: string;
        chainId: string;
        networkId: string;
        ens?: { registry: string };
        explorers?: [{
            name: string;
            url: string;
            icon: string;
            standard: string;
        }];
    }
    export type TChainlistData = {
        [pair: string]: {
            eth?: {
                decimals: number;
                proxy: string;
            };
            usd?: {
                decimals: number;
                proxy: string;
            };
        };
    };
    export type TRoundData = {
        roundId: number;
        answer: number;
        startedAt: number;
        updatedAt: number;
        answeredInRound: number;
    }
    // #endregion CHAIN
////
// #endregion TYPES