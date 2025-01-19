const WindowModule = {
    /**
     * Get the current window dimensions.
     * 
     * @example document.addEventListener("visibilitychange", pageFocus);
     * 
     * @returns {boolean} Whether the page is focused.
     * 
     */
    pageFocus: function() {
        const pageFocused = document.visibilityState === "visible";
        if (pageFocused) console.log(`Page Focused...`); else console.log(`Page Unfocused...`);
        return pageFocused;
    }
}
const TruncationModule = {
    /**
     * Truncate a string to a specified length.
     * 
     * @example truncate("Hello, World!", 5, 3) => "Hello...ld!"
     * 
     * @param {string} string - The target string to truncate.
     * @param {number} [startLength] - The number of characters to keep from the start. [Default: 6]
     * @param {number} [endLength] - The number of characters to keep from the end. [Default: 4]
     * @returns {string} The truncated {string}.
     * 
     */
    truncate: function(string, startLength = 6, endLength = 4) {
        if (typeof string !== 'string') {
            throw new TypeError(
                `TruncationModule.truncate: "string" must be a valid string but received ${typeof string}`
            );
        }
        if (!Number.isInteger(startLength) || startLength < 0) {
            throw new RangeError(
                `TruncationModule.truncate: "startLength" must be a non-negative integer but received ${startLength}`
            );
        }
        if (!Number.isInteger(endLength) || endLength < 0) {
            throw new RangeError(
                `TruncationModule.truncate: "endLength" must be a non-negative integer but received ${endLength}`
            );
        }

        if (string.length <= startLength + endLength + 3) { return string; }
        return `${string.slice(0, startLength)}...${string.slice(-endLength)}`;
    },
    /**
     * Truncate a balance number to a specified length.
     * 
     * @example truncateBalance(123456789) => "123.45M" // Balance returned with default decimals and maxLength
     * @example truncateBalance(123456789, 9) => "123.456496785M" // Balance returned with 9 decimals
     * 
     * @param {number} balance - The target balance to truncate.
     * @param {number} [decimals] - The number of decimal places to keep. [Default: 2]
     * @param {number} [maxLength=8] - The maximum length of the truncated string. [Default: 8]
     * @returns {string} The truncated balance {string}.
     * 
     */
    truncateBalance: function(balance, decimals = 2, maxLength = 8) {
        if (typeof balance !== 'number' || isNaN(balance)) {
            throw new TypeError(
                `TruncationModule.truncateBalance: "balance" must be a valid number but received ${balance}`
            );
        }
        if (!Number.isInteger(decimals) || decimals < 0) {
            throw new RangeError(
                `TruncationModule.truncateBalance: "decimals" must be a non-negative integer but received ${decimals}`
            );
        }
        if (!Number.isInteger(maxLength) || maxLength <= 0) {
            throw new RangeError(
                `TruncationModule.truncateBalance: "maxLength" must be a positive integer but received ${maxLength}`
            );
        }
        
        const num = parseFloat(balance);

        if (num >= 1e15) return `${(num / 1e15).toFixed(decimals)}Q`;
        if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;

        const [intPart, decPart = ""] = num.toString().split(".");
        if (intPart.length >= maxLength) { return intPart; }

        const remainingLength = maxLength - intPart.length - 1;
        const truncatedDecimal = decPart.slice(0, Math.max(remainingLength, 0));
        return truncatedDecimal ? `${intPart}.${truncatedDecimal}` : intPart;
    }
}
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
const CHAINLINK_ABI = [
    "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];
const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function transfer(address to, uint256 amount) returns (bool)",
];
const UNISWAP_V2_POOL_ABI = [
    "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)"
];
const UNISWAP_V3_POOL_ABI = [
    "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function fee() view returns (uint24)",
    "function decimals() view returns (uint8)",
    "function liquidity() view returns (uint128)"
];
const CHAINS = {
    ethereum: {
        params: [{
            chainId: "0x1",
            chainName: "Ethereum",
            nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ['https://eth.llamarpc.com'],
            blockExplorerUrls: ['https://etherscan.io']
        }],
        priceFeeds: {
            eth: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
        },
        pairAddresses: {
            eth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
    },
    arbitrum: {
        params: [{
            chainId: "0xa4b1",
            chainName: "Arbitrum",
            nativeCurrency: {
                name: "Arbitrum",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ['https://arbitrum.llamarpc.com'],
            blockExplorerUrls: ['https://arbiscan.io']
        }],
        priceFeeds: {
            eth: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
            arb: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6"
        },
        pairAddresses: {
            eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            arb: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1"
        }
    },
    optimism: {
        params: [{
            chainId: "0xa",
            chainName: "Optimism",
            nativeCurrency: {
                name: "Optimism",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ['https://optimism.llamarpc.com'],
            blockExplorerUrls: ['https://optimistic.etherscan.io']
        }],
        priceFeeds: {
            eth: "0xb7B9A39CC63f856b90B364911CC324dC46aC1770",
            op: "0x0D276FC14719f9292D5C1eA2198673d1f4269246"
        },
        pairAddresses: {
            eth: "0x4200000000000000000000000000000000000006",
            op: "0x4200000000000000000000000000000000000042"
        }
    },
    base: {
        params: [{
            chainId: "0x2105",
            chainName: "Base",
            nativeCurrency: {
                name: "Base",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
        }],
        priceFeeds: {
            eth: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
        },
        pairAddresses: {
            eth: "0x4200000000000000000000000000000000000006"
        }
    },
    polygon: {
        params: [{
            chainId: "0x89",
            chainName: "Polygon",
            nativeCurrency: {
                name: "Polygon",
                symbol: "POL",
                decimals: 18
            },
            rpcUrls: ['https://polygon.llamarpc.com'],
            blockExplorerUrls: ['https://polygonscan.com']

        }],
        priceFeeds: {
            eth: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
            matic: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
        },
        pairAddresses: {
            eth: "0x11CD37bb86F65419713f30673A480EA33c826872",
            matic: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
        }
    },
    avalanche: {
        params: [{
            chainID: "0xa86a",
            chainName: "Avalanche",
            nativeCurrency: {
                name: "Avalanche",
                symbol: "AVAX",
                decimals: 18
            },
            rpcUrls: ['https://avalanche.drpc.org'],
            blockExplorerUrls: ['https://snowtrace.io']

        }],
        priceFeeds: {
            eth: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
            avax: "0x0A77230d17318075983913bC2145DB16C7366156"
        },
        pairAddresses: { 
            eth: "",
            avax: ""
        }
    },
    fantom: {
        params: [{
            chainId: "0xfa",
            chainName: "Fantom",
            nativeCurrency: {
                name: "Fantom",
                symbol: "FTM",
                decimals: 18
            },
            rpcUrls: ['https://rpc.ftm.tools'],
            blockExplorerUrls: ['https://ftmscan.com']

        }],
        priceFeeds: {
            eth: "0x11DdD3d147E5b83D01cee7070027092397d63658",
            ftm: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc"
        },
        pairAddresses: {
            eth: "",
            ftm: ""
        }
    }
};
const CryptoModule = {
    /**
     * Initialize the Crypto Module by fetching the token balance, price, and user value.
     * 
     * @example initCrypto("ethereum", "0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678", "V2") => { tokenBalance, tokenPrice, userValue }
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain.
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @param {string} version - The target Uniswap version (V2 or V3).
     * @returns {Promise<object>} { tokenBalance, tokenPrice, userValue }
     * 
     * -------> Call this function to get started! <-------
     * 
     * Supported Chains: "ethereum", "arbitrum", "optimism", "base"
     * 
     */
    initCrypto: async function (chain, contractAddress, poolAddress, version, pair = "eth") {
        const account = await this.connect(chain);
        if (!account) { return null; }

        console.log("Getting details for:", { chain, contractAddress, poolAddress, version, pair });

        const tokenBalance = await this.getBalance(contractAddress);

        let tokenPrice = null;
        if (version === "V2") {
            tokenPrice = await this.getPriceV2(chain, poolAddress, pair);
        }
        if (version === "V3") {
            tokenPrice = await this.getPriceV3(chain, contractAddress, poolAddress, pair);
        }

        const userValue = this.getUserValue(tokenBalance, tokenPrice);

        console.log("Token Details: ", { tokenBalance, tokenPrice, userValue });

        return { tokenBalance, tokenPrice, userValue };
    },
    /**
     * Connect the user's wallet to the website.
     * 
     * @example connect("ethereum") => "0x1234567890abcdef1234567890abcdef12345678"
     * 
     * @param {string} chain - The target chain to connect to
     * @returns {Promise<string>} The connected wallet address
     * 
     * @see CHAINS - for supported chains
     * 
     */
    connect: async function (chain) {
        if (!window.ethereum) { return; }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Accounts:", accounts);
    
            await this.switchChain(chain);
    
            if (accounts[0]) {
                console.log("Wallet connected...");
                return accounts[0];
            } else {
                console.log("Wallet not connected...");
                return null;
            }
        } catch (error) {
            console.error('Connection error:', error);
            return null;
        }
    },
    /**
     * Switch the connected wallet to a specified chain.
     * 
     * @example switchChain("ethereum")
     * 
     * @param {string} chain - The target chain to switch to
     * 
     * @see CHAINS - for supported chains
     * 
     */
    switchChain: async function (chain) { 
        if (!window.ethereum) { return; }
        const chainID = CHAINS[chain].params[0].chainId;
        if (!chainID) { return; }

        const currentChainID = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainID === chainID) { return; }

        try {
            console.log(`Switching to ${chain} chain...`);
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: CHAINS[chain].params
            });
        } catch (switchError) {
            console.log('Switch error:', switchError);
            if (switchError.code === 4902) {
                console.log(`Adding ${chain} chain...`);
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: CHAINS[chain].params
                });
            }
        }
    },
    /**
     * Get the current price of Ethereum on a specified chain
     * 
     * @example getChainlinkPrice("optimism", "ethereum") => "1234.56"
     * 
     * > This will fetch the price for a token on "optimism" chain with "ETH" as the paired asset
     * 
     * @see CHAINS - for supported chains
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @returns {Promise<string>} The current price of Ethereum on the specified chain
     * 
     */
    getChainlinkPrice: async function (chain, pair = "eth") {
        if (!window.ethereum) { return null; }
        if (!(chain in CHAINS)) { return null; }
        try {
            const chainlinkAddress = CHAINS[chain].priceFeeds[pair];
            if (!chainlinkAddress) {
                throw new Error(`Chain ${chain} is not supported`);
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(chainlinkAddress, CHAINLINK_ABI, signer);
            const roundData = await contract.latestRoundData();

            const price = ethers.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price on ${chain}: $${price}`);

            return price;
        } catch (error) {
            console.error("Error getting ETH price:", error);
            return null;
        }
    },
    /**
     * Get the balance of a specified ERC20 token.
     * 
     * @example getBalance("0x1234567890abcdef1234567890abcdef12345678") => "1234.56"
     * 
     * @param {string} contractAddress - The target ERC20 contract address
     * @returns {Promise<string>} The balance of the connected wallet in the specified ERC20 token
     * 
     */
    getBalance: async function (contractAddress) {
        if (!window.ethereum) { return null; }
        if (!contractAddress) { return null; }
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);

            const balance = await contract.balanceOf(address);
            console.log(`Balance: ${balance}`);

            return balance;
        } catch (error) {
            console.error("Error getting balance:", error);
            return null;
        }
    },
    /**
     * Get the price of a token in a Uniswap V2 pool.
     * 
     * @example getPriceV2("0x1234567890abcdef1234567890abcdef12345678", "ethereum") => "1234.56"
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} poolAddress - The target Uniswap V2 pool address
     * @returns {Promise<string>} The price of the token in the specified Uniswap V2 pool
     * 
     * @see getChainlinkPrice
     * 
     */
    getPriceV2: async function (chain, poolAddress, pair) {
        if (!window.ethereum) { return null; }
        if (!poolAddress) { return null; }
        if (!(chain in CHAINS)) { return null; }
        try {
            const chainlinkResult = await this.getChainlinkPrice(chain, pair);
            if (!chainlinkResult) return null;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const uniswapV2 = new ethers.Contract(poolAddress, UNISWAP_V2_POOL_ABI, signer);

            const token0 = await uniswapV2.token0();
            const token1 = await uniswapV2.token1();

            const reserves = await uniswapV2.getReserves();
            const reserve0 = reserves._reserve0;
            const reserve1 = reserves._reserve1;

            const token0Contract = new ethers.Contract(token0, ERC20_ABI, signer);
            const token1Contract = new ethers.Contract(token1, ERC20_ABI, signer);

            const decimals0 = await token0Contract.decimals();
            const decimals1 = await token1Contract.decimals();

            console.log("Reserve 0:", reserve0);
            console.log("Reserve 1:", reserve1);
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);
            console.log("Decimals 0:", decimals0);
            console.log("Decimals 1:", decimals1);

            const reserve0BN = ethers.BigNumber.from(reserve0);
            const reserve1BN = ethers.BigNumber.from(reserve1);

            // Convert each reserve to a normal floating-point value, adjusting by its decimals
            // e.g. if reserve0 = 123456789 (raw) and decimals0 = 6, then
            // parseFloat(ethers.utils.formatUnits(reserve0BN, 6)) => 123.456789
            const reserve0Float = parseFloat(ethers.utils.formatUnits(reserve0BN, decimals0));
            const reserve1Float = parseFloat(ethers.utils.formatUnits(reserve1BN, decimals1));

            const pairAddress = CHAINS[chain].pairAddresses[pair];
            console.log("Pair Address:", pairAddress);

            let priceRatio;
            if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve1Float / reserve0Float; // Price in pair = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
            } else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve0Float / reserve1Float; // Price in pair = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
            } else {
                console.log(`Skipping pool ${poolAddress} - Neither token is ${pair}`);
                return null;
            }

            const tokenPriceUSD = priceInWETH * chainlinkResult;
            console.log(`V2 Price for token in pool ${poolAddress}: ${tokenPriceUSD} USD`);

            return tokenPriceUSD;
        } catch (error) {
            console.error('Error calculating V2 token price:', error);
            return null;
        }
    },
    /**
     * Get the pool details of a Uniswap V3 pool.
     * 
     * @example getPoolV3("0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678") => { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity }
     * 
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @returns {Promise<object>} The pool details of the specified Uniswap V3 pool
     * 
     */
    getPoolV3: async function (contractAddress, poolAddress) {
        if (!window.ethereum) { return null; }
        if (!poolAddress || !contractAddress) { return null; }
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, signer);
            const slot0 = await pool.slot0();

            const sqrtPriceX96 = slot0.sqrtPriceX96;
            console.log("Sqrt Price X96:", sqrtPriceX96);

            const token0 = await pool.token0();
            const token1 = await pool.token1();
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);

            const token0Contract = new ethers.Contract(token0, ERC20_ABI, signer);
            const token1Contract = new ethers.Contract(token1, ERC20_ABI, signer);

            const decimals0 = await token0Contract.decimals();
            const decimals1 = await token1Contract.decimals();
            console.log("Decimals 0:", decimals0);
            console.log("Decimals 1:", decimals1);

            const liquidity = await pool.liquidity();
            console.log("Liquidity:", liquidity);

            return { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity };
        } catch (error) {
            console.error("Error getting pool data:", error);
            return null;
        }
    },
    /**
     * Get the price of a token in a Uniswap V3 pool.
     * 
     * @example getPriceV3("ethereum", "0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678") => "1234.56"
     * 
     * @param {string} chain - The target chain to get the price from - Connected wallet must be on a supported chain
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @returns {Promise<string>} The price of the token in the specified Uniswap V3 pool
     * 
     * @see getChainlinkPrice
     * @see getPoolV3
     * 
     */
    getPriceV3: async function (chain, contractAddress, poolAddress, pair) {
        if (!window.ethereum) { return null; }
        if (!poolAddress || !contractAddress) { return null; }
        if (!(chain in CHAINS)) { return null; }
        try {
            // 1: Get all pool details
            const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = await this.getPoolV3(contractAddress, poolAddress);
            const pairAddress = CHAINS[chain].pairAddresses[pair];
            console.log("Pair Address:", pairAddress);

            // 2: Calculate the price ratio = token1/token0 using precise big-number math
            const formattedSqrtPricex96 = ethers.BigNumber.from(sqrtPriceX96);
            const Q96 = ethers.BigNumber.from("79228162514264337593543950336");
            const numerator = formattedSqrtPricex96
                .mul(formattedSqrtPricex96)
                .mul(ethers.BigNumber.from(10).pow(decimals0));
            const denominator = Q96.mul(Q96).mul(ethers.BigNumber.from(10).pow(decimals1));
            const ratioBN = numerator.div(denominator);
            const remainder = numerator.mod(denominator);

            const decimalsWanted = 8;
            const scaleFactor = ethers.BigNumber.from(10).pow(decimalsWanted);
            const remainderScaled = remainder.mul(scaleFactor).div(denominator);
            const ratioFloat =
                parseFloat(ratioBN.toString()) +
                parseFloat(remainderScaled.toString()) / Math.pow(10, decimalsWanted);

            // 3: Determine which token is in the pool and calculate the token price
            let tokenRatio;
            if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                tokenRatio = ratioFloat;
            } else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                tokenRatio = 1 / ratioFloat;
            } else {
                console.log(`Skipping pool ${poolAddress} - Neither token is ${pair}`);
                return null;
            }

            // 4: Fetch the ETH price in USD
            const chainlinkResult = await this.getChainlinkPrice(chain);
            if (!chainlinkResult) return null;

            // 5: Convert token price from WETH to USD
            const tokenPriceUSD = tokenRatio * parseFloat(chainlinkResult);
            console.log(`V3 Price for token in pool ${poolAddress}: ${tokenPriceUSD} USD`);

            return tokenPriceUSD;
        } catch (error) {
            console.error("Error calculating V3 token price:", error);
            return null;
        }
    },
    /**
     * Calculate the value of a user's token holdings.
     * 
     * @example getUserValue("1000", "1200") => "1200000"
     * 
     * @param {string} balance - The user's token balance
     * @param {string} price - The current price of the token
     * 
     * @returns {number} The value of the user's token holdings
     * 
     */
    getUserValue: function (balance, price) {
        if (!balance || !price) { return null; }
        try {
            const value = parseFloat(balance) * parseFloat(price);
            console.log(`User Value: ${value}`);
            return value;
        } catch (error) {
            console.error("Error calculating user value:", error);
            return null;
        }

    }
};
/***************************************
 * [Namespace] "sypher"
 * [Modules]:
 * | > WindowModule
 * | /modules/utils.js
 * --------------------------
 * ----> pageFocus
 * --------------------------
 * | > TruncationModule
 * | /modules/utils.js
 * --------------------------
 * ----> truncate
 * ----> truncateBalance
 * --------------------------
 * | > InterfaceModule
 * | /modules/interface.js
 * --------------------------
 * ----> toggleLoader
 * --------------------------
 * | > CryptoModule
 * | /modules/crypto.js
 * --------------------------
 * ----> initCrypto
 * ----> getETHPrice
 * ----> getBalance
 * ----> getPriceV2
 * ----> getPriceV3
 * ----> getPoolV3
 * ----> getUserValue
 * --------------------------
 * [Guide] <-----------------
 * | > Load the sypher in the header of your HTML file.
 * <script src="path/to/sypher.js"></script> // TODO: Update path
 * | > Call functions from the sypher namespace using "sypher.functionName()"
 ***************************************/
////////////////////////////////////////
// #region Namespace Declaration & Initialization
////
(function(global) {
    const sypher = {};

    // Attach each module to sypherTools
    Object.assign(sypher, WindowModule);
    Object.assign(sypher, TruncationModule);
    Object.assign(sypher, InterfaceModule);
    Object.assign(sypher, CryptoModule);

    // Expose to global namespace
    global.sypher = sypher;

    console.log("Sypher Modules Initialized!");
})(window);
////
// #endregion Namespace Declaration & Initialization
////////////////////////////////////////
