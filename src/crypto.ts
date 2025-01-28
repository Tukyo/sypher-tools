import { CHAINS, CHAINLINK_ABI, DISCOVERED_PROVIDERS, ERC20_ABI, UNISWAP_V2_POOL_ABI, UNISWAP_V3_POOL_ABI, ADDRESS_REGEXP } from "./constants";
import { TCleanedDetails, ICryptoModule, TPoolV3Data, TTokenDetails, TChainParams, TInitParams, TEIP6963, EIP1193Provider } from "./crypto.d";
import { ethers } from "ethers";
import { TLoaderParams } from "./interface.d";

export const CryptoModule: ICryptoModule = {
    initCrypto: async function (params: TInitParams): Promise<TCleanedDetails | null> {
        const defaultParams = { chain: "ethereum", contractAddress: "", poolAddress: "", version: "V2", pair: "eth" };
        const p = { ...defaultParams, ...params };
        if (!p) { return null; }

        this.flush();

        const chainValidation = sypher.validateChain(p.chain);
        if (!chainValidation) { return null; }

        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) { return null; }

        try {
            const account = await this.connect(p.chain, p.detail);
            if (!account) { return null; }

            console.log("Getting details for:", p);

            const tokenDetails = await this.getTokenDetails(p.chain, p.contractAddress);
            if (!tokenDetails) { return null; }
            const { balance, decimals, name, symbol, totalSupply } = tokenDetails;

            let tokenPrice: number;
            if (p.version === "V2") {
                const priceV2 = await this.getPriceV2(p.chain, p.poolAddress, p.pair);
                if (!priceV2) { return null; }
                tokenPrice = priceV2;
            } else if (p.version === "V3") {
                const priceV3 = await this.getPriceV3(p.chain, p.contractAddress, p.poolAddress, p.pair);
                if (!priceV3) { return null; }
                tokenPrice = priceV3;
            } else { return null; }

            const userValue = this.getUserValue(balance, tokenPrice);
            if (userValue === null || userValue === undefined) { return null; }

            const contractAddress = p.contractAddress;
            const poolAddress = p.poolAddress;
            const icon = p.icon ?? "";
            const version = p.version;
            const pair = p.pair;

            const details = { contractAddress, poolAddress, balance, decimals, name, symbol, icon, totalSupply, tokenPrice, userValue, version, pair };
            if (!details) { return null; }

            const cleanedDetails = this.clean(details);
            if (!cleanedDetails) { return null; }

            const detailsObj: TCleanedDetails = cleanedDetails;

            window.dispatchEvent(new CustomEvent("sypher:initCrypto", { detail: detailsObj }));
            return detailsObj;
        } catch (error: unknown) {
            throw new Error(`CryptoModule.initCrypto: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    connect: async function (chain, providerDetail: TEIP6963 | null = null) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.connect");
        if (!validInput) { return null; }

        console.log("Chain: ", chain, "Detail: ", providerDetail);

        const connectButton = document.getElementById("connect-button") || null;

        const ethereum = this.getProvider();
        if (!ethereum) { return null; }

        const details = providerDetail || this._EIP6963;

        if (this._connected && !details) { return this._connected; }

        if (details) {
            const connectButtons = document.querySelectorAll(".connect-mi");
            const connectBody = document.getElementById("connect-mb");
            const connectModalC = document.getElementById("connect-mc");
            const connectModal = document.getElementById("connect-modal");
            if (connectButtons.length > 0) {
                connectButtons.forEach((button) => { (button as HTMLButtonElement).style.display = "none"; });
            }
            if (connectBody) {
                const params: TLoaderParams = {
                    element: connectBody,
                    loaderHTML: "<div class='loader'></div>",
                    isEnabled: true,
                    replace: false
                }
                sypher.toggleLoader(params);
            }

            this._EIP6963 = details;

            try {
                const provider = details.provider;
                console.log("[EIP-6963] Using provider:", details.info.name);

                const accounts = await provider.request({ method: "eth_requestAccounts" });
                if (!Array.isArray(accounts) || !accounts.length) {
                    throw new Error("No accounts returned by the chosen provider.");
                }

                const primaryAccount = accounts[0];
                console.log("[EIP-6963] Connected account:", primaryAccount);

                await this.switchChain(chain);

                this._connected = primaryAccount;
                console.log("Connected account:", primaryAccount);

                if (connectBody) {
                    connectBody.innerHTML = `
                        <div class="connect-sb">
                            <p class="connect-s">Connected to ${details.info.name}</p>
                            <p class="connect-s">Account: <span class="sypher-a">${sypher.truncate(primaryAccount)}</span></p>
                        </div>
                    `;
                    connectBody.classList.add("min-height-a");
                }

                if (connectModalC) { connectModalC.classList.add("height-a"); }
                if (connectModal) { 
                    setTimeout(() => { connectModal.style.opacity = "0%"; }, 5000);
                    setTimeout(() => { connectModal.remove(); }, 6000);
                }

                if (connectButton !== null) { connectButton.innerHTML = `${sypher.truncate(primaryAccount)}`; }
                window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                this.accountChange(true);
                return primaryAccount;
            } catch (error: unknown) {
                const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                if ((error as any).code === 4001) {
                    console.log("User denied wallet access...");

                    if (connectBody) {
                        const params: TLoaderParams = {
                            element: connectBody,
                            isEnabled: false,
                            newText: "sypher.revert"
                        }
                        sypher.toggleLoader(params);
                    }
                    connectButtons.forEach((button) => { (button as HTMLButtonElement).style.display = "flex"; });
                    return;
                }
                throw new Error(`CryptoModule.connect: ${detailedError}`);
            }
        } else {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                if (!Array.isArray(accounts) || accounts.length === 0) {
                    throw new Error("CryptoModule.connect: No accounts returned by the Ethereum provider.");
                }

                const primaryAccount = accounts[0];
                if (!primaryAccount) {
                    console.warn("CryptoModule.connect: Wallet not connected.");
                    return null;
                }

                await this.switchChain(chain);

                this._connected = primaryAccount;
                console.log("Connected account:", primaryAccount);

                if (connectButton !== null) { connectButton.innerHTML = `${sypher.truncate(primaryAccount)}`; }
                window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                this.accountChange(true);
                return primaryAccount;
            } catch (error: unknown) {
                const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                throw new Error(`CryptoModule.connect: ${detailedError}`);
            }
        }
    },
    disconnect: async function () {
        this._connected = undefined;
        this._token = undefined;

        window.dispatchEvent(new CustomEvent("sypher:disconnect", { detail: this._connected }));
        this.accountChange(false);
    },
    accountChange: function (active: boolean) {
        let provider = this._EIP6963?.provider
        if (!provider) { provider = this.getProvider(); }

        if (this._connected === null || this._connected === undefined) { return; }

        if (active) {
            console.log("Listening for account changes...");
            provider.on("accountsChanged", (accounts: string[]) => {
                if (!accounts.length) { this.disconnect(); return; }
                this._connected = accounts[0];
                window.dispatchEvent(new CustomEvent("sypher:accountChange", { detail: this.getConnected() }));

                const modal = document.getElementById("connect-modal");
                if (modal) { modal.remove(); }
                
                this._connected = undefined; // Refefine as null to allow for reconnection
                if (this._chain) {
                    if (this._token) {
                        if (this._EIP6963) {
                            this.initCrypto({
                                chain: this._chain.chainName.toLowerCase(),
                                contractAddress: this._token.contractAddress,
                                poolAddress: this._token.poolAddress,
                                version: this._token.version,
                                pair: this._token.pair,
                                icon: this._token.icon,
                                detail: this._EIP6963
                            })
                        } else { console.log("Unknown Error Occured..."); }
                    } else { this.connect(this._chain.chainId, this._EIP6963); }
                }
            });
        } else { 
            provider.removeAllListeners("accountsChanged");
            const modal = document.getElementById("connect-modal");
            if (modal) { modal.remove(); }
        }
    },
    onboard: async function (providerDetail: TEIP6963) {
        const userEnv = sypher.userEnvironment();
    
        const isMobile = userEnv.isMobile;
        const isApple = userEnv.operatingSystem.toLowerCase() === "macos";
        const isAndroid = userEnv.operatingSystem.toLowerCase() === "android";
    
        if (!isMobile) { window.open(providerDetail.info.onboard.link, "_blank"); return; }
    
        if (isMobile) {
            const { deeplink, fallback } = providerDetail.info.onboard;
    
            if (isApple || isAndroid) {
                const platform = isApple ? "ios" : "android";
    
                const fallbackTimer = setTimeout(() => {
                    console.log("Deeplink failed, prompting user for App Store redirection...");
    
                    if (platform === "ios") {
                        const userConfirmed = confirm( "Unable to open the app. Please click confirm to download from the app store." );
    
                        if (userConfirmed) { window.location.href = fallback[platform];
                        } else { console.log("User canceled App Store redirection."); }
                    } else {
                        const link = document.createElement("a");
                        link.href = fallback[platform];
                        link.target = "_self";
                        link.rel = "noopener";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }, 1000);
    
                window.location.href = deeplink;
                window.addEventListener("blur", () => clearTimeout(fallbackTimer), { once: true });
            } else { return; }
        }
    },
    // getChain: function () { console.log(this.chain); return this._chain; },
    switchChain: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.switchChain");
        if (!validInput) { return; }

        let provider = this._EIP6963?.provider as EIP1193Provider
        if (!provider) { provider = this.getProvider(); }

        const chainData = await this.getChainData(chain);
        if (!chainData) { return; }

        const { chainlistData, params } = chainData;
        if (!chainlistData) { return; }

        const targetChainId = params.chainId;
        if (this._chain?.chainId === targetChainId) { return; }

        if (params) { this._chain = params; }

        try {
            const currentChainID = await provider.request({ method: 'eth_chainId' });
            if (currentChainID === targetChainId) { 
                if (this._chain) { this._chain.chainId = targetChainId; }
                return; 
            }

            console.log(`Switching to ${chain} chain...`);
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
            });
            if (this._chain) { this._chain.chainId = targetChainId; }
        } catch (switchError) {
            console.warn(`CryptoModule.switchChain: Attempting to add chain: ${chain}`);
            if ((switchError as { code: number }).code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [params],
                    });
                    if (this._chain) { this._chain.chainId = targetChainId; }
                } catch (addError) {
                    throw new Error(`CryptoModule.switchChain: Unable to add chain "${chain}". Details: ${addError}`);
                }
            } else {
                throw new Error(`CryptoModule.switchChain: Unable to switch chain "${chain}". Details: ${switchError}`);
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
                chainName: data.name.toLowerCase(),
                nativeCurrency: data.nativeCurrency,
                rpcUrls: data.rpc,
                blockExplorerUrls: data.explorers?.map((explorer: { url: any; }) => explorer.url) || []
            };

            return { chainlistData: data, params };
        } catch (error: unknown) {
            throw new Error(`CryptoModule.getChainData: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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
            let account = this._connected;
            if (account === null || account === undefined) { account = await this.connect(chain); }
            if (!account) { return null; }

            const chainlinkAddress = CHAINS[chain].priceFeeds[pair];
            if (!chainlinkAddress) { throw new Error(`Chain ${chain} is not supported`); }

            let provider = this._EIP6963?.provider
            if (!provider) { provider = this.getProvider(); }
            const web3 = new ethers.providers.Web3Provider(provider);
            const signer = web3.getSigner();

            const contract = new ethers.Contract(chainlinkAddress, CHAINLINK_ABI, signer);
            const roundData = await contract.latestRoundData();

            const price = ethers.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price on ${chain}: $${price}`);

            return price;
        } catch (error: unknown) {
            throw new Error(`CryptoModule.getPriceFeed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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

        try {
            let account = this._connected;
            if (account === null || account === undefined) { account = await this.connect(chain); }
            if (!account) { return null; }

            let provider = this._EIP6963?.provider
            if (!provider) { provider = this.getProvider(); }
            const web3 = new ethers.providers.Web3Provider(provider);
            const signer = web3.getSigner();

            const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);

            const balance = await contract.balanceOf(account);
            const decimals = await contract.decimals();
            const name = await contract.name();
            const symbol = await contract.symbol();
            const totalSupply = await contract.totalSupply();

            console.log("Raw Details:", { balance, decimals, name, symbol, totalSupply });
            return { balance, decimals, name, symbol, totalSupply };
        } catch (error: unknown) {
            throw new Error(`CryptoModule.getTokenDetails: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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
            let account = this._connected;
            if (account === null || account === undefined) { account = await this.connect(chain); }
            if (!account) { return null; }

            const chainlinkResult = await this.getPriceFeed(chain, pair);
            if (!chainlinkResult) return null;

            let provider = this._EIP6963?.provider
            if (!provider) { provider = this.getProvider(); }
            const web3 = new ethers.providers.Web3Provider(provider);
            const signer = web3.getSigner();

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
            throw new Error(`CryptoModule.getPriceV2: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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
            let account = this._connected;
            if (account === null || account === undefined) { account = await this.connect(chain); }
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
            throw new Error(`CryptoModule.getPriceV3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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
            let account = this._connected;
            if (account === null || account === undefined) { account = await this.connect(chain); }
            if (!account) { return null; }

            let provider = this._EIP6963?.provider
            if (!provider) { provider = this.getProvider(); }
            const web3 = new ethers.providers.Web3Provider(provider);
            const signer = web3.getSigner();

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
            throw new Error(`CryptoModule.getPoolV3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
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
            throw new Error(`CryptoModule.getUserValue: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    clean: function (tokenDetails: TTokenDetails) {
        const validInput = sypher.validateInput(
            { tokenDetails },
            { tokenDetails: { type: "object", required: true } }, "CryptoModule.clean"
        );
        if (!validInput) { return null; }

        const { contractAddress, poolAddress, balance, decimals, name, symbol, icon, totalSupply, tokenPrice, userValue, version, pair } = tokenDetails;

        const cleanedDetails: TCleanedDetails = {
            contractAddress,
            poolAddress,
            balance: parseFloat(ethers.utils.formatUnits(balance, decimals)),
            decimals,
            name,
            symbol,
            icon,
            totalSupply: parseFloat(ethers.utils.formatUnits(totalSupply, decimals)),
            tokenPrice: parseFloat(tokenPrice.toString()),
            userValue: (parseFloat(userValue.toString()) / Math.pow(10, decimals)).toFixed(decimals).toString(),
            version,
            pair
        };

        console.log(this._token);
        this._token = cleanedDetails;

        console.log("Token Details:", cleanedDetails);
        return cleanedDetails;
    },
    getCleaned: function () { 
        console.log(this._token);
        return this._token ?? null; 
    },
    initProviderSearch: function () {
        window.addEventListener("eip6963:announceProvider", (event: Event) => {
            const customEvent = event as CustomEvent<TEIP6963>;

            DISCOVERED_PROVIDERS.push(customEvent.detail);

            // TODO: Create isLogging check - console.log("[EIP-6963]:", (customEvent.detail));
        });
        window.dispatchEvent(new Event("eip6963:requestProvider"));
    },
    getProvider: function () {
        if (this._EIP6963) {
            // console.log(this._EIP6963.provider);
            return this._EIP6963.provider;
        }
        if (typeof window === "undefined" || !window.ethereum) { throw new Error("CryptoModule.getProvider: No Ethereum provider found."); }
        // console.log(window.ethereum);
        return window.ethereum as EIP1193Provider;
    },
    getConnected(): string | null {
        return this._connected ?? null;
    },
    flush: function () {
        this._connected = undefined;
        this._token = undefined;

        let provider = this._EIP6963?.provider
        if (!provider) { provider = this.getProvider(); }

        provider.removeAllListeners("accountsChanged");

        const button = document.getElementById("connect-button");

        const txt = sypher.getUI().connectText;
        if (button) { button.innerHTML = txt; }
    }
};