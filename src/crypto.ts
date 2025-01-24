import { CHAINS, CHAINLINK_ABI, ERC20_ABI, UNISWAP_V2_POOL_ABI, UNISWAP_V3_POOL_ABI, ADDRESS_REGEXP, LP_VER } from "./constants";
import { TCleanedDetails, ICryptoModule, TPoolV3Data, TTokenDetails, TChainParams } from "./crypto.d";
import { ethers } from "ethers";

type EthereumProvider = { request: (args: { method: string; params?: any[] }) => Promise<any>; };

export const CryptoModule: ICryptoModule = {
    initCrypto: async function (chain, contractAddress, poolAddress, version, pair = "eth") {
        const validInput = sypher.validateInput(
                { chain, contractAddress, poolAddress, version, pair },
                {
                    chain: { type: "string", required: true },
                    contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
                    poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
                    version: { type: "string", required: true, enum: LP_VER },
                    pair: { type: "string", required: false }
                }, "CryptoModule.initCrypto"
            );
        if (!validInput) { return null; }

        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            console.log("Getting details for:", { chain, contractAddress, poolAddress, version, pair });

            const tokenDetails = await this.getTokenDetails(chain, contractAddress);
            if (!tokenDetails) { return null; }
            const { balance, decimals, name, symbol, totalSupply } = tokenDetails;

            let tokenPrice: number;
            if (version === "V2") {
                const priceV2 = await this.getPriceV2(chain, poolAddress, pair);
                if (!priceV2) { return null; }
                tokenPrice = priceV2;
            } else if (version === "V3") {
                const priceV3 = await this.getPriceV3(chain, contractAddress, poolAddress, pair);
                if (!priceV3) { return null; }
                tokenPrice = priceV3;
            } else { return null; }

            const userValue = this.getUserValue(balance, tokenPrice);
            if (!userValue) { return null; }

            const cleanedDetails = this.clean({ contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue });

            return cleanedDetails;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.initCrypto: ${message}`);
        }        
    },
    connect: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.connect");
        if (!validInput) { return null; }
        
        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        if (this._connected) { return this._connected; }

        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (!Array.isArray(accounts) || accounts.length === 0) { throw new Error("CryptoModule.connect: No accounts returned by the Ethereum provider."); }

            const primaryAccount = accounts[0];
            if (!primaryAccount) {
                console.warn("CryptoModule.connect: Wallet not connected.");
                return null;
            }

            await this.switchChain(chain);

            this._connected = primaryAccount;
            console.log("Connected account:", primaryAccount);

            return primaryAccount;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.connect: ${message}`);
        }
    },
    switchChain: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.switchChain");
        if (!validInput) { return; }
        
        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        const chainData = await this.getChainData(chain);
        if (!chainData) { return; }

        const { chainlistData, params } = chainData;
        if (!chainlistData) { return; }

        const targetChainId = params.chainId;
        if (this._currentChain === targetChainId) { return; }

        try {
            const currentChainID = await ethereum.request({ method: 'eth_chainId' });
            if (currentChainID === targetChainId) { this._currentChain = targetChainId; return; }

            console.log(`Switching to ${chain} chain...`);
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
            });
            this._currentChain = targetChainId;
        } catch (switchError) {
            console.warn(`CryptoModule.switchChain: Attempting to add chain: ${chain}`);
            if ((switchError as { code: number }).code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [params],
                    });
                    this._currentChain = targetChainId;
                } catch (addError) {
                    const addErrorMessage = addError instanceof Error ? addError.message : "An unknown error occurred.";
                    throw new Error(`CryptoModule.switchChain: Unable to switch or add chain "${chain}". Details: ${addErrorMessage}`);
                }
            } else {
                const switchErrorMessage = switchError instanceof Error ? switchError.message : "An unknown error occurred.";
                throw new Error(`CryptoModule.switchChain: Failed to switch to chain "${chain}". Details: ${switchErrorMessage}`);
            }
        }
    },
    getChainData: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.getChainData");
        if (!validInput) { return null; }

        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const chainIdDecimal = parseInt(chainId, 16);
            const url = `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/chains/eip155-${chainIdDecimal}.json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Chain data for ID ${chainId} not found`);
            const data = await response.json();
            console.log(`Fetched chain data:`, data);
    
            const params: TChainParams = {
                chainId: `0x${parseInt(data.chainId, 10).toString(16)}`,
                chainName: data.name,
                nativeCurrency: data.nativeCurrency,
                rpcUrls: data.rpc,
                blockExplorerUrls: data.explorers?.map((explorer: { url: any; }) => explorer.url) || []
            };
    
            return { chainlistData: data, params };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getChainData: ${message}`);
        }
    },
    getPriceFeed: async function (chain, pair = "eth") {
        const validInput = sypher.validateInput(
                { chain, pair },
                {
                    chain: { type: "string", required: true },
                    pair: { type: "string", required: false }
                }, "CryptoModule.getPriceFeed"
            );
        if (!validInput) { return null; }

        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const chainlinkAddress = CHAINS[chain].priceFeeds[pair];
            if (!chainlinkAddress) { throw new Error(`Chain ${chain} is not supported`); }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(chainlinkAddress, CHAINLINK_ABI, signer);
            const roundData = await contract.latestRoundData();

            const price = ethers.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price on ${chain}: $${price}`);

            return price;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPriceFeed: ${message}`);
        }
    },
    getTokenDetails: async function (chain, contractAddress) {
        const validInput = sypher.validateInput(
                { chain, contractAddress },
                {
                    chain: { type: "string", required: true },
                    contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP }
                }, "CryptoModule.getTokenDetails"
            );
        if (!validInput) { return null; }

        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const provider = new ethers.providers.Web3Provider(ethereum);
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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getTokenDetails: ${message}`);
        }
    },
    getPriceV2: async function (chain, poolAddress, pair) {
        const validInput = sypher.validateInput(
                { chain, poolAddress, pair },
                {
                    chain: { type: "string", required: true },
                    poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
                    pair: { type: "string", required: true }
                }, "CryptoModule.getPriceV2"
            );
        if (!validInput) { return null; }

        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const chainlinkResult = await this.getPriceFeed(chain, pair);
            if (!chainlinkResult) return null;

            const provider = new ethers.providers.Web3Provider(ethereum);
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

            let priceRatio: number;
            if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve1Float / reserve0Float; // Price in pair = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
            } else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve0Float / reserve1Float; // Price in pair = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
            } else {
                throw new Error(`CryptoModule.getPriceV2: Neither token is ${pair}`);
            }

            const tokenPriceUSD = priceRatio * parseFloat(chainlinkResult);
            console.log(`V2 Price for token in pool ${poolAddress}: $${tokenPriceUSD}`);

            return tokenPriceUSD;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPriceV2: Error ${message}`);
        }
    },
    getPriceV3: async function (chain, contractAddress, poolAddress, pair) {
        const validInput = sypher.validateInput(
                { chain, contractAddress, poolAddress, pair },
                {
                    chain: { type: "string", required: true },
                    contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
                    poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
                    pair: { type: "string", required: true }
                }, "CryptoModule.getPriceV3"
            );
        if (!validInput) { return null; }

        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            // 1: Get all pool details
            const poolV3Data = await this.getPoolV3(chain, contractAddress, poolAddress);
            if (!poolV3Data) { return null; }

            const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = poolV3Data;
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
            console.log(`V3 Price for token in pool ${sypher.truncate(poolAddress)}: $${tokenPriceUSD}`);

            return tokenPriceUSD;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPriceV3: ${message}`);
        }
    },
    getPoolV3: async function (chain, contractAddress, poolAddress) {
        const validInput = sypher.validateInput(
                { chain, contractAddress, poolAddress },
                {
                    chain: { type: "string", required: true },
                    contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
                    poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP }
                }, "CryptoModule.getPoolV3"
            );
        if (!validInput) { return null; }

        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const account = await this.connect(chain);
            if (!account) { return null; }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();

            const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, signer);
            const slot0 = await pool.slot0();

            const sqrtPriceX96: ethers.BigNumber = slot0.sqrtPriceX96;
            console.log("Sqrt Price X96:", sqrtPriceX96);

            const token0: string = await pool.token0();
            const token1: string = await pool.token1();
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);

            const token0Contract = new ethers.Contract(token0, ERC20_ABI, signer);
            const token1Contract = new ethers.Contract(token1, ERC20_ABI, signer);

            const decimals0: number = await token0Contract.decimals();
            const decimals1: number = await token1Contract.decimals();
            console.log("Decimals 0:", decimals0);
            console.log("Decimals 1:", decimals1);

            const liquidity: ethers.BigNumber = await pool.liquidity();
            console.log("Liquidity:", liquidity);

            const poolData: TPoolV3Data = { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity };

            return poolData;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPoolV3: ${message}`);
        }
    },
    getUserValue: function (balance, price) {
        const validInput = sypher.validateInput(
                { balance, price },
                {
                    balance: { type: "object", required: true },
                    price: { type: "number", required: true }
                }, "CryptoModule.getUserValue"
            );
        if (!validInput) { return null; }
        
        try {
            const value = parseFloat(balance.toString()) * parseFloat(price.toString());
            console.log(`User Value: ${value}`);
            return value;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getUserValue: ${message}`);
        }
    },
    clean: function (tokenDetails: TTokenDetails) {
        const validInput = sypher.validateInput(
                { tokenDetails },
                { tokenDetails: { type: "object", required: true } }, "CryptoModule.clean"
            );
        if (!validInput) { return null; }

        const { contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue } = tokenDetails;

        const cleanedDetails: TCleanedDetails = {
            contractAddress,
            poolAddress,
            balance: parseFloat(ethers.utils.formatUnits(balance, decimals)),
            decimals,
            name,
            symbol,
            totalSupply: parseFloat(ethers.utils.formatUnits(totalSupply, decimals)),
            tokenPrice: parseFloat(tokenPrice.toString()),
            userValue: (parseFloat(userValue.toString()) / Math.pow(10, decimals)).toFixed(decimals).toString()
        };

        console.log("Token Details:", cleanedDetails);
        return cleanedDetails;
    },
    getProvider: function () {
        if (!("ethereum" in window)) { throw new Error("CryptoModule.getProvider: No Ethereum provider found."); }

        const ethereum = (window.ethereum as unknown) as EthereumProvider;
        return ethereum;
    }
};