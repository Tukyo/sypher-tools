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
const CHAINLINK_ADDRESSES = {
    ethereum: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    arbitrum: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    optimism: "0xb7B9A39CC63f856b90B364911CC324dC46aC1770",
    base: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
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
     */
    initCrypto: async function (chain, contractAddress, poolAddress, version) {
        const tokenBalance = await this.getBalance(contractAddress);

        let tokenPrice = null;
        if (version === "V2") {
            tokenPrice = await this.getPriceV2(chain, poolAddress);
        }
        if (version === "V3") {
            tokenPrice = await this.getPriceV3(chain, contractAddress, poolAddress);
        }

        const userValue = await this.getUserValue(tokenBalance, tokenPrice);

        console.log("Token Details: ", { tokenBalance, tokenPrice, userValue });

        return { tokenBalance, tokenPrice, userValue };
    },
    /**
     * Get the current price of Ethereum on a specified chain.
     * 
     * @example getETHPrice("ethereum") => "1234.56"
     * 
     * @see CHAINLINK_ADDRESSES - for supported chains.
     * 
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain.
     * @returns {Promise<string>} The current price of Ethereum on the specified chain.
     * 
     */
    getETHPrice: async function (chain) {
        if (!window.ethereum) { return null; }
        if (!(chain in CHAINLINK_ADDRESSES)) { return null; }
        try {
            const chainlinkAddress = CHAINLINK_ADDRESSES[chain];
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
     * @param {string} contractAddress - The target ERC20 contract address.
     * @returns {Promise<string>} The balance of the connected wallet in the specified ERC20 token.
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
     * @param {string} chain - The target chain to get the price from. Connected wallet must be on a supported chain.
     * @param {string} poolAddress - The target Uniswap V2 pool address.
     * @returns {Promise<string>} The price of the token in the specified Uniswap V2 pool.
     * 
     * @see getETHPrice
     * 
     */
    getPriceV2: async function (chain, poolAddress) {
        if (!window.ethereum) { return null; }
        if (!poolAddress) { return null; }
        if (!(chain in CHAINLINK_ADDRESSES)) { return null; }
        try {
            const currentETHPrice = await this.getETHPrice(chain);
            if (!currentETHPrice) return null;

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

            let priceInWETH;
            if (token1.toLowerCase() === wethAddress.toLowerCase()) {
                priceInWETH = reserve1Float / reserve0Float; // Price in WETH = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
            } else if (token0.toLowerCase() === wethAddress.toLowerCase()) {
                priceInWETH = reserve0Float / reserve1Float; // Price in WETH = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
            } else {
                console.log(`Skipping pool ${poolAddress} - Neither token is WETH.`);
                return null;
            }

            const tokenPriceUSD = priceInWETH * currentETHPrice;
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
     * @see getETHPrice
     * @see getPoolV3
     * 
     */
    getPriceV3: async function (chain, contractAddress, poolAddress) {
        if (!window.ethereum) { return null; }
        if (!poolAddress || !contractAddress) { return null; }
        if (!(chain in CHAINLINK_ADDRESSES)) { return null; }
        try {
            // 1: Get all pool details
            const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = await this.getPoolV3(poolAddress, contractAddress);

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

            // 3: Determine how many WETH per token or tokens per WETH
            let tokenWETH;
            if (token1.toLowerCase() === wethAddress.toLowerCase()) {
                tokenWETH = ratioFloat;
            } else if (token0.toLowerCase() === wethAddress.toLowerCase()) {
                tokenWETH = 1 / ratioFloat;
            } else {
                console.log(`Skipping pool ${poolAddress} - Neither token is WETH.`);
                return null;
            }

            // 4: Fetch the ETH price in USD
            const currentETHPrice = await this.getETHPrice(chain);
            if (!currentETHPrice) return null;

            // 5: Convert token price from WETH to USD
            const tokenPriceUSD = tokenWETH * parseFloat(currentETHPrice);
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
     * @param {string} balance - The user's token balance.
     * @param {string} price - The current price of the token.
     * 
     * @returns {number} The value of the user's token holdings.
     * 
     */
    getUserValue: async function (balance, price) {
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