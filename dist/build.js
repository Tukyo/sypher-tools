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
            throw new TypeError(`TruncationModule.truncate: "string" must be a valid string but received ${typeof string}`);
        }
        if (!Number.isInteger(startLength) || startLength < 0) {
            throw new RangeError(`TruncationModule.truncate: "startLength" must be a non-negative integer but received ${startLength}`);
        }
        if (!Number.isInteger(endLength) || endLength < 0) {
            throw new RangeError(`TruncationModule.truncate: "endLength" must be a non-negative integer but received ${endLength}`);
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
            throw new TypeError(`TruncationModule.truncateBalance: "balance" must be a valid number but received ${balance}`);
        }
        if (!Number.isInteger(decimals) || decimals < 0) {
            throw new RangeError(`TruncationModule.truncateBalance: "decimals" must be a non-negative integer but received ${decimals}`);
        }
        if (!Number.isInteger(maxLength) || maxLength <= 0) {
            throw new RangeError(`TruncationModule.truncateBalance: "maxLength" must be a positive integer but received ${maxLength}`);
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
     * @param {HTMLElement} element - The target HTML element where the loader or text will be shown
     * @param {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
     * @param {boolean} [isEnabled=true] - Whether to show the loader (true) or the new text (false)
     * @param {string} [newText=""] - The new text to display when the loader is disabled
     * 
     * CSS Loaders Resource: [Link](https://css-loaders.com/)
     **/
    toggleLoader: function (element, isEnabled = true, loaderHTML, newText = "") {
        if (!element || typeof loaderHTML !== 'string' || typeof newText !== 'string') {
            throw new TypeError(`InterfaceModule.toggleLoader: "element" must be a valid HTMLElement, "loaderHTML" and "newText" must be valid strings.`);
        }

        if (isEnabled) {
            element.innerHTML = loaderHTML;
        } else {
            element.innerHTML = newText;
        }
    },
    /**
     * Applies parallax effect to elements based on the [data-speed] attribute.
     * 
     * @example 
     * // HTML
     * <div data-speed="0.5"></div>
     * // JS
     * window.addEventListener('load', () => { sypher.parallax(); });
     * 
     * @param {HTMLElement} element - The target HTML element where the parallax effect will be applied
     * 
     */
    parallax: function () {
        const parallaxElements = document.querySelectorAll('[data-speed]');

        if (parallaxElements.length === 0) {
            console.warn(`InterfaceModule.parallax: Parallax enabled, but no elements found with the [data-speed] attribute.`);
            return;
        }

        function applyParallax() {
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.5;
                const offset = window.scrollY * speed;
                element.style.transform = `translateY(${-offset}px)`;
            });
        }
        function onScroll() { requestAnimationFrame(applyParallax); }
        window.addEventListener('scroll', onScroll);
        applyParallax();
    },
    /**
     * Fades in elements when they are in the viewport.
     * 
     * @example
     * // HTML
     * <div data-fade></div>
     * // JS
     * document.addEventListener('DOMContentLoaded', function () { sypher.fade('30px', '0.25s'); });
     * // ---> This will fade in the element over 0.25 seconds while moving it 30px upwards
     * 
     * @param {string} [distance] - The distance to move the element when fading in [Default: '20px']
     * @param {string} [length] - The duration of the fade effect [Default: '0.5s']
     * 
     */
    fade: function (distance = '20px', length = '0.5s') {
        if (typeof distance !== 'string' || typeof length !== 'string') {
            throw new TypeError(`InterfaceModule.fade: "distance" and "length" must be valid strings.`);
        }

        const elements = document.querySelectorAll('[data-fade]');
        if (elements.length === 0) {
            console.warn(`InterfaceModule.fade: Fade enabled, but no elements found with the [data-fade] attribute.`);
            return;
        }

        elements.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = `translateY(${distance})`;
            el.style.transition = `opacity ${length} ease-out, transform ${length} ease-out`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    el.style.opacity = 1;
                    el.style.transform = 'translateY(0)';
                } else {
                    el.style.opacity = 0;
                    el.style.transform = `translateY(${distance})`;
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    }
};
const CryptoInterfaceModule = {
    /**
     * Creates a button to connect the wallet.
     * 
     * @example createConnectButton(element, async () => await sypher.connect("base"), { text: "Connect Now!", modal: true });
     * 
     * @param {HTMLElement} element - The target HTML element where the button will be created [Default: document.body]
     * @param {function} onClick - The function to call when the button is clicked [Default: sypher.connect("ethereum")]
     * @param {object} params - The parameters to customize the button [Default: { text: "Connect Wallet", modal: false }]
     * 
     */
    createConnectButton: function (
        element = document.body,
        onClick = () => sypher.connect("ethereum"),
        params = { text: "Connect Wallet", modal: false }
    ) {
        if (!element || typeof element !== 'object') {
            throw new TypeError(`CryptoInterfaceModule.createConnectButton: "element" must be a valid HTMLElement.`);
        }
        if (typeof onClick !== 'function') {
            throw new TypeError(`CryptoInterfaceModule.createConnectButton: "onClick" must be a valid function.`);
        }
        if (typeof params !== 'object' || params === null) {
            throw new TypeError(`CryptoInterfaceModule.createConnectButton: "params" must be a valid object.`);
        }

        const { text = "Connect Wallet", modal = false } = params;

        if (typeof text !== 'string') {
            throw new TypeError(`CryptoInterfaceModule.createConnectButton: "params.text" must be a valid string.`);
        }

        const button = document.createElement('button');
        button.classList.add('connect-button');
        button.textContent = text;
        button.onclick = onClick;

        if (modal) {
            // TODO: Create modal flow for viewing wallet details when connected
        }

        element.appendChild(button);
        return button;
    }
};
const CHAINLINK_ABI = [
    "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];
const ERC20_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
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
            eth: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
        },
        pairAddresses: {
            eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
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
     * @example initCrypto("ethereum", "0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678", "V2") => { contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue }
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain.
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @param {string} version - The target Uniswap version (V2 or V3).
     * @param {string} pair - The paired asset to get the price in (default: "eth")
     * @returns {Promise<object>} { contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue }
     * 
     * -------> Call this function to get started! <-------
     * 
     */
    initCrypto: async function (chain, contractAddress, poolAddress, version, pair = "eth") {
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.initCrypto: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (typeof contractAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            throw new TypeError(`CryptoModule.initCrypto: "contractAddress" must be a valid Ethereum address but received "${contractAddress}"`);
        }
        if (typeof poolAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(poolAddress)) {
            throw new TypeError(`CryptoModule.initCrypto: "poolAddress" must be a valid Ethereum address but received "${poolAddress}"`);
        }
        if (typeof version !== 'string' || !['V2', 'V3'].includes(version)) {
            throw new RangeError(`CryptoModule.initCrypto: "version" must be "V2" or "V3" but received "${version}"`);
        }
        if (typeof pair !== 'string' || !pair.trim()) {
            throw new TypeError(`CryptoModule.initCrypto: "pair" must be a non-empty string but received "${pair}"`);
        }

        const chainData = CHAINS[chain];
        if (!chainData) {
            throw new Error(`CryptoModule.getPriceFeed: Chain "${chain}" is not supported.`);
        }
        const chainID = chainData.params[0]?.chainId;
        if (!chainID) {
            throw new Error(`CryptoModule.getPriceFeed: Missing chainId for chain "${chain}".`);
        }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            console.log("Getting details for:", { chain, contractAddress, poolAddress, version, pair });
            const { balance, decimals, name, symbol, totalSupply } = await this.getTokenDetails(chain, contractAddress);

            let tokenPrice = null;
            if (version === "V2") {
                tokenPrice = await this.getPriceV2(chain, poolAddress, pair);
            }
            if (version === "V3") {
                tokenPrice = await this.getPriceV3(chain, contractAddress, poolAddress, pair);
            }

            const userValue = this.getUserValue(balance, tokenPrice);
            const cleanedDetails = this.clean({ contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue });

            return cleanedDetails;
        } catch (error) {
            console.error(`CryptoModule.initCrypto: An error occurred during initialization: ${error.message}`);
            return null;
        }
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
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.connect: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (!window.ethereum) {throw new Error("CryptoModule.connect: No Ethereum provider found....");}

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!Array.isArray(accounts) || accounts.length === 0) { throw new Error("CryptoModule.connect: No accounts returned by the Ethereum provider."); }
            
            if (!this.connect.logged) {
                console.log("Accounts:", accounts);
                this.connect.logged = true;
            }
    
            await this.switchChain(chain);
    
            const primaryAccount = accounts[0];
            if (primaryAccount) {
                return primaryAccount;
            } else {
                console.warn("CryptoModule.connect: Wallet not connected.");
                return null;
            }
        } catch (error) {
            console.error(`CryptoModule.connect: Connection error occurred: ${error.message}`);
            throw new Error(`CryptoModule.connect: Failed to connect to the Ethereum provider. Details: ${error.message}`);
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
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.switchChain: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (!window.ethereum) { throw new Error("CryptoModule.switchChain: No Ethereum provider found...."); }

        const chainData = CHAINS[chain];
        if (!chainData || !chainData.params) {
            throw new Error(`CryptoModule.switchChain: Chain "${chain}" is not supported.`);
        }

        try {
            const chainId = chainData.params[0].chainId;

            const currentChainID = await window.ethereum.request({ method: 'eth_chainId' });
            if (currentChainID === chainId) { return; } // Already on the target chain

            console.log(`Switching to ${chain} chain...`);
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
        } catch (switchError) {
            console.warn(`CryptoModule.switchChain: Attempting to add chain: ${chain}`);
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: chainData.params,
                    });
                } catch (addError) {
                    throw new Error(`CryptoModule.switchChain: Unable to switch or add chain "${chain}". Details: ${addError.message}`);
                }
            } else {
                throw new Error(`CryptoModule.switchChain: Failed to switch to chain "${chain}". Details: ${switchError.message}`);
            }
        }
    },
    /**
     * Get the current price of Ethereum on a specified chain
     * 
     * @example getPriceFeed("optimism", "eth") => "1234.56"
     * 
     * > This will fetch the price for a token on "optimism" chain with "ETH" as the paired asset
     * 
     * @see CHAINS - for supported chains
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} pair - The paired asset to get the price in (default: "eth")
     * @returns {Promise<string>} The current price of Ethereum on the specified chain
     * 
     */
    getPriceFeed: async function (chain, pair = "eth") {
        if (!window.ethereum) { throw new Error("CryptoModule.getPriceFeed: No Ethereum provider found...."); }

        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.getPriceFeed: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (typeof pair !== 'string' || !pair.trim()) {
            throw new TypeError(`CryptoModule.getPriceFeed: "pair" must be a non-empty string but received "${pair}"`);
        }

        const chainData = CHAINS[chain];
        if (!chainData) {
            throw new Error(`CryptoModule.getPriceFeed: Chain "${chain}" is not supported.`);
        }
        const chainID = chainData.params[0]?.chainId;
        if (!chainID) {
            throw new Error(`CryptoModule.getPriceFeed: Missing chainId for chain "${chain}".`);
        }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const chainlinkAddress = CHAINS[chain].priceFeeds[pair];
            if (!chainlinkAddress) { throw new Error(`Chain ${chain} is not supported`);}

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(chainlinkAddress, CHAINLINK_ABI, signer);
            const roundData = await contract.latestRoundData();

            const price = ethers.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price on ${chain}: $${price}`);

            return price;
        } catch (error) {
            throw new Error(`CryptoModule.getPriceFeed: Error fetching price feed: ${error.message}`);
        }
    },
    /**
     * Get the details of a specified ERC20 token.
     * 
     * @example getTokenDetails("optimism", "0x1234567890abcdef1234567890abcdef12345678") => { balance, decimals, name, symbol }
     * 
     * @param {string} contractAddress - The target ERC20 contract address
     * @returns {Promise<object>} The details of the specified ERC20 token
     * 
     */
    getTokenDetails: async function (chain, contractAddress) {
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.getTokenDetails: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (typeof contractAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            throw new TypeError(`CryptoModule.getTokenDetails: "contractAddress" must be a valid Ethereum address but received "${contractAddress}"`);
        }
        if (!window.ethereum) { throw new Error("CryptoModule.getTokenDetails: No Ethereum provider found...."); }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);

            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            const name = await contract.name();
            const symbol = await contract.symbol();
            const totalSupply = await contract.totalSupply();

            console.log("Token Details:", { balance, decimals, name, symbol, totalSupply });
            return { balance, decimals, name, symbol, totalSupply };
        } catch (error) {
            throw new Error(`CryptoModule.getTokenDetails: Error fetching token details: ${error.message}`);
        }
    },
    /**
     * Get the price of a token in a Uniswap V2 pool.
     * 
     * @example getPriceV2("base", "0x1234567890abcdef1234567890abcdef12345678") => "1234.56"
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain
     * @param {string} poolAddress - The target Uniswap V2 pool address
     * @returns {Promise<string>} The price of the token in the specified Uniswap V2 pool
     * 
     * @see getPriceFeed
     * 
     */
    getPriceV2: async function (chain, poolAddress, pair) {
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.getPriceV2: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (typeof poolAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(poolAddress)) {
            throw new TypeError(`CryptoModule.getPriceV2: "poolAddress" must be a valid Ethereum address but received "${poolAddress}"`);
        }
        if (typeof pair !== 'string' || !pair.trim()) {
            throw new TypeError(`CryptoModule.getPriceV2: "pair" must be a non-empty string but received "${pair}"`);
        }
        if (!window.ethereum) { throw new Error("CryptoModule.getPriceV2: No Ethereum provider found...."); }

        const chainData = CHAINS[chain];
        if (!chainData) {
            throw new Error(`CryptoModule.getPriceFeed: Chain "${chain}" is not supported.`);
        }
        const chainID = chainData.params[0]?.chainId;
        if (!chainID) {
            throw new Error(`CryptoModule.getPriceFeed: Missing chainId for chain "${chain}".`);
        }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const chainlinkResult = await this.getPriceFeed(chain, pair);
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

            let priceRatio = null;
            if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve1Float / reserve0Float; // Price in pair = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
            } else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve0Float / reserve1Float; // Price in pair = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
            } else {
                throw new Error(`CryptoModule.getPriceV2: Neither token is ${pair}`);
            }

            const tokenPriceUSD = priceRatio * chainlinkResult;
            console.log(`V2 Price for token in pool ${poolAddress}: $${tokenPriceUSD}`);

            return tokenPriceUSD;
        } catch (error) {
            throw new Error(`CryptoModule.getPriceV2: Error calculating V2 token price: ${error.message}`);
        }
    },
    /**
     * Get the price of a token in a Uniswap V3 pool.
     * 
     * @example getPriceV3("ethereum", "0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678", "eth") => "1234.56"
     * 
     * @param {string} chain - The target chain to get the price from - Connected wallet must be on a supported chain
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @returns {Promise<string>} The price of the token in the specified Uniswap V3 pool
     * 
     * @see getPriceFeed
     * @see getPoolV3
     * 
     */
    getPriceV3: async function (chain, contractAddress, poolAddress, pair) {
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.getPriceV3: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (typeof contractAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            throw new TypeError(`CryptoModule.getPriceV3: "contractAddress" must be a valid Ethereum address but received "${contractAddress}"`);
        }
        if (typeof poolAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(poolAddress)) {
            throw new TypeError(`CryptoModule.getPriceV3: "poolAddress" must be a valid Ethereum address but received "${poolAddress}"`);
        }
        if (typeof pair !== 'string' || !pair.trim()) {
            throw new TypeError(`CryptoModule.getPriceV3: "pair" must be a non-empty string but received "${pair}"`);
        }

        if (!window.ethereum) { throw new Error("CryptoModule.getPriceV3: No Ethereum provider found...."); }

        const chainData = CHAINS[chain];
        if (!chainData) {
            throw new Error(`CryptoModule.getPriceFeed: Chain "${chain}" is not supported.`);
        }
        const chainID = chainData.params[0]?.chainId;
        if (!chainID) {
            throw new Error(`CryptoModule.getPriceFeed: Missing chainId for chain "${chain}".`);
        }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            // 1: Get all pool details
            const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = await this.getPoolV3(chain, contractAddress, poolAddress);
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
                throw new Error(`CryptoModule.getPriceV3: Neither token is ${pair}`);
            }

            // 4: Fetch the ETH price in USD
            const chainlinkResult = await this.getPriceFeed(chain, pair);
            if (!chainlinkResult) return null;

            // 5: Convert token price from WETH to USD
            const tokenPriceUSD = tokenRatio * parseFloat(chainlinkResult);
            console.log(`V3 Price for token in pool ${poolAddress}: $${tokenPriceUSD}`);

            return tokenPriceUSD;
        } catch (error) {
            throw new Error(`CryptoModule.getPriceV3: Error calculating V3 token price: ${error.message}`);
        }
    },
    /**
     * Get the pool details of a Uniswap V3 pool.
     * 
     * @example getPoolV3("base", "0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678") => { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity }
     * 
     * @param {string} contractAddress - The CA for the token
     * @param {string} poolAddress - The LP address for the token
     * @returns {Promise<object>} The pool details of the specified Uniswap V3 pool
     * 
     */
    getPoolV3: async function (chain, contractAddress, poolAddress) {
        if (typeof chain !== 'string' || !chain.trim()) {
            throw new TypeError(`CryptoModule.getPoolV3: "chain" must be a non-empty string but received ${typeof chain} with value "${chain}"`);
        }
        if (typeof contractAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            throw new TypeError(`CryptoModule.getPoolV3: "contractAddress" must be a valid Ethereum address but received "${contractAddress}"`);
        }
        if (typeof poolAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(poolAddress)) {
            throw new TypeError(`CryptoModule.getPoolV3: "poolAddress" must be a valid Ethereum address but received "${poolAddress}"`);
        }

        if (!window.ethereum) { throw new Error("CryptoModule.getPoolV3: No Ethereum provider found...."); }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

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
            throw new Error(`CryptoModule.getPoolV3: Error fetching V3 pool details: ${error.message}`);
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
        try {
            const value = parseFloat(balance) * parseFloat(price);
            console.log(`User Value: ${value}`);
            return value;
        } catch (error) {
            console.error("Error calculating user value:", error);
            return null;
        }
    },
    /**
     * Clean up the token details for easier readability.
     * 
     * @example clean({ contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue }) => { contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue }
     * 
     * @param {object} tokenDetails - The raw token details object
     * @returns {object} The cleaned token details object
     * 
     */
    clean: function (tokenDetails) {
        if (!tokenDetails || typeof tokenDetails !== 'object') {
            throw new TypeError(`CryptoModule.clean: "tokenDetails" must be an object but received ${typeof tokenDetails} with value "${tokenDetails}"`);
        }
        
        const { contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue } = tokenDetails;

        const cleanedDetails = {
            contractAddress,
            poolAddress,
            balance: parseFloat(ethers.utils.formatUnits(balance, decimals)),
            decimals,
            name,
            symbol,
            totalSupply: parseFloat(ethers.utils.formatUnits(totalSupply, decimals)),
            tokenPrice: parseFloat(tokenPrice),
            userValue: (parseFloat(userValue) / Math.pow(10, decimals)).toFixed(decimals)
        };

        console.log("Token Details:", cleanedDetails);
        return cleanedDetails;
    }
};
/***************************************
 * [Namespace] "sypher"
 * --------------------------
 * [Description]:
 * | Sypher is a collection of utility functions for web development.
 * ----> Window management, text truncation, interface effects, and crypto functions.
 * | > Entry Point
 * | /dist/build.js | /dist/build.min.js
 * --------------------------
 * [Modules]:
 * | > WindowModule
 * | /src/utils.js
 * --------------------------
 * ----> pageFocus
 * --------------------------
 * | > TruncationModule
 * | /src/utils.js
 * --------------------------
 * ----> truncate
 * ----> truncateBalance
 * --------------------------
 * | > InterfaceModule
 * | /src/interface.js
 * --------------------------
 * ----> toggleLoader
 * ----> parallax
 * ----> fade
 * --------------------------
 * | > CryptoModule
 * | /src/crypto.js
 * --------------------------
 * ----> initCrypto
 * ----> connect
 * ----> switchChain
 * ----> getPriceFeed
 * ----> getTokenDetails
 * ----> getPriceV2
 * ----> getPriceV3
 * ----> getPoolV3
 * ----> getUserValue
 * ----> clean
 * --------------------------
 * [Guide] <-----------------
 * | > Include ethers.js in the header of your HTML file.
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.0/ethers.umd.min.js"></script>
 * | > Load the sypher namespace in the header of your HTML file.
 * <script src="https://cdn.jsdelivr.net/gh/Tukyo/sypher-tools@latest/dist/build.min.js"></script>
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
    Object.assign(sypher, CryptoInterfaceModule);

    // Expose to global namespace
    global.sypher = sypher;

    console.log("Sypher Modules Initialized!");
})(window);
////
// #endregion Namespace Declaration & Initialization
////////////////////////////////////////
