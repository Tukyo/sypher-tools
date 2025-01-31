import { CHAINLINK_ABI, DISCOVERED_PROVIDERS, ERC20_ABI, UNISWAP_V2_POOL_ABI, UNISWAP_V3_POOL_ABI, ADDRESS_REGEXP, MAINNET_RPCS } from "./constants";
import { TCleanedDetails, ICryptoModule, TPoolV3Data, TRawDetails, TChainParams, TInitParams, TEIP6963, EIP1193Provider, TChainlistData, TRoundData } from "./crypto.d";
import { ethers } from "ethers";
import { TLoaderParams } from "./interface.d";

export const CryptoModule: ICryptoModule = {
    initCrypto: async function (params: TInitParams): Promise<TCleanedDetails | null> {
        if (!params) { return null; }
        if (!params.pair) { params.pair = "ethereum"; }

        this.flush();

        try {
            const chainId = this._chain?.chainId ?? await sypher.validateChain(params.chain);
            if (!chainId) { return null; }

            const connection = await this.connect(params.chain, params.detail);
            if (!connection) { return null; }

            const address = connection.primaryAccount;
            if (!address) { return null; }

            const ethBalance = connection.ethBalance;
            if (ethBalance === null || ethBalance === undefined) { return null; }

            console.log("Getting details for:", params);

            const tokenDetails = await this.getTokenDetails(params.chain, params.contractAddress);
            if (!tokenDetails) { return null; }
            const { balance, decimals, name, symbol, totalSupply } = tokenDetails;

            let tokenPrice: number;
            if (params.version === "V2") {
                const priceV2 = await this.getPriceV2(params.chain, params.poolAddress, params.pair, params.pairAddress);
                if (!priceV2) { return null; }
                tokenPrice = priceV2;
            } else if (params.version === "V3") {
                const priceV3 = await this.getPriceV3(params.chain, params.contractAddress, params.poolAddress, params.pair, params.pairAddress);
                if (!priceV3) { return null; }
                tokenPrice = priceV3;
            } else { return null; }

            const userValue = this.getUserValue(balance, tokenPrice);
            if (userValue === null || userValue === undefined) { return null; }

            const contractAddress = params.contractAddress;
            const poolAddress = params.poolAddress;
            const pairAddress = params.pairAddress;
            const icon = params.icon ?? "";
            const version = params.version;
            const pair = params.pair;

            const ens = (await this.getENS(address)) ?? undefined;

            const details = { address, ens, contractAddress, poolAddress, pairAddress, balance, ethBalance, decimals, name, symbol, icon, totalSupply, tokenPrice, userValue, version, pair };
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
        if (!chain) { throw new Error("CryptoModule.connect: Chain is required"); }

        console.log("Chain:", chain, "Detail:", providerDetail);

        const connectButton = document.getElementById("connect-button") || null;

        const details = providerDetail || this._EIP6963;

        if (this._connected && !details) { return { primaryAccount: this._connected, ethBalance: this._ethBalance }; }

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
                console.log("[EIP-6963] Connection Success!");

                await this.switchChain(chain);

                this._connected = primaryAccount;

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

                const ethBalance = await this.getETH();
                this._ethBalance = ethBalance;

                const ens = await this.getENS(primaryAccount);
                this._ens = ens;

                if (ens !== null && ens !== undefined && connectButton) { connectButton.innerHTML = `${sypher.truncate(ens)}`; }

                return { primaryAccount, ethBalance };
            } catch (error: unknown) {
                const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                if ((error as any).code === 4001) {
                    console.log("User denied wallet access...");
                    window.dispatchEvent(new CustomEvent("sypher:connectFail", { detail: "User denied wallet access" }));

                    if (connectBody) {
                        const params: TLoaderParams = {
                            element: connectBody,
                            isEnabled: false,
                            newText: "sypher.revert"
                        }
                        sypher.toggleLoader(params);
                    }
                    connectButtons.forEach((button) => { (button as HTMLButtonElement).style.display = "flex"; });
                    return null;
                }
                throw new Error(`CryptoModule.connect: ${detailedError}`);
            }
        } else {
            try {
                const ethereum = this.getProvider();
                if (!ethereum) { return null; }

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
                console.log("[WINDOW] Connection Success!");

                if (connectButton !== null) { connectButton.innerHTML = `${sypher.truncate(primaryAccount)}`; }
                window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                this.accountChange(true);

                const ethBalance = await this.getETH();
                this._ethBalance = ethBalance;

                const ens = await this.getENS(primaryAccount);
                this._ens = ens;

                if (ens !== null && ens !== undefined && connectButton) { connectButton.innerHTML = `${sypher.truncate(ens)}`; }

                return { primaryAccount, ethBalance };
            } catch (error: unknown) {
                const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                throw new Error(`CryptoModule.connect: ${detailedError}`);
            }
        }
    },
    disconnect: async function () {
        this._connected = undefined;
        this._details = undefined;

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

                if (this._chain) {
                    if (this._details) {
                        if (this._EIP6963) {
                            this.initCrypto({
                                chain: this._chain.shortName.toLowerCase(),
                                contractAddress: this._details.token.contractAddress,
                                poolAddress: this._details.token.poolAddress,
                                pairAddress: this._details.token.pairAddress,
                                version: this._details.token.version,
                                pair: this._details.token.pair,
                                icon: this._details.token.icon,
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
                        const userConfirmed = confirm("Unable to open the app. Please click confirm to download from the app store.");

                        if (userConfirmed) {
                            window.location.href = fallback[platform];
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
    getETH: async function () {
        let provider = this._EIP6963?.provider
        if (!provider) { provider = this.getProvider(); }

        const web3 = new ethers.providers.Web3Provider(provider);
        const signer = web3.getSigner();
        const balance = await signer.getBalance();
        const eth = parseFloat(ethers.utils.formatEther(balance));

        console.log("ETH Balance:", eth);

        return eth;
    },
    getENS: async function (address: string) {
        if (!address) { throw new Error("CryptoModule.getENS: Address is required"); }

        if (this._ens) { return this._ens; }

        try {
            const provider = await this.getProvider(true);
            const ens = await provider.lookupAddress(address);
            if (!ens) { return undefined; }

            console.log("ENS:", ens);
            
            this._ens = ens;
            return ens;
        }
        catch (error: unknown) {
            throw new Error(`CryptoModule.getENS: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getChain: function () {
        // console.log(this._chain);
        return this._chain;
    },
    switchChain: async function (chain) {
        if (!chain) { throw new Error("CryptoModule.switchChain: Chain is required"); }

        let provider = this._EIP6963?.provider as EIP1193Provider
        if (!provider) { provider = this.getProvider(); }

        const chainData: TChainParams | null = await this.getChainData(chain);
        if (!chainData) { return; }

        const targetChainId = chainData.chainId;
        if (this._chain?.chainId === targetChainId) { return; }

        if (chainData) { this._chain = chainData; }

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
                        params: [chainData],
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
        if (!chain) { throw new Error("CryptoModule.getChainData: Chain is required"); }

        try {
            const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
            if (!chainId) { return null; }

            const chainIdDecimal = parseInt(chainId, 16);

            const url = `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/chains/eip155-${chainIdDecimal}.json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Chain data for ID ${chainId} not found`);

            const data = await response.json();
            console.log(`Fetched chain data:`, data);

            let iconData = undefined;
            if (data.icon) {
                try {
                    const iconURL = `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/icons/${data.icon}.json`;
                    const iconResponse = await fetch(iconURL);
                    if (iconResponse.ok) {
                        iconData = await iconResponse.json();
                    } else {
                        console.warn(`Icon data for ${data.icon} not found`);
                    }
                } catch (iconError) {
                    console.warn(`Error fetching icon data for ${data.icon}:`, iconError);
                }
            }

            const params: TChainParams = {
                name: data.name,
                chain: data.chain,
                icon: iconData,
                rpc: data.rpc,
                nativeCurrency: data.nativeCurrency,
                infoURL: data.infoURL,
                shortName: data.shortName,
                chainId: `0x${parseInt(data.chainId, 10).toString(16)}`,
                networkId: data.networkId,
                ens: data.ens || undefined,
                explorers: data.explorers || undefined,
            };

            return params
        } catch (error: unknown) {
            throw new Error(`CryptoModule.getChainData: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getPriceFeed: async function (pair = "ethereum") {
        if (this._pairPrice && this._pairPrice.value && this._pairPrice.timestamp && (Date.now() - this._pairPrice.timestamp) < 60000) {
            return this._pairPrice.value;
        }
        if (pair.toLowerCase().replace(/\s+/g, '') === "wrappedbitcoin") { pair = "bitcoin"; }

        try {
            const response = await fetch("https://raw.githubusercontent.com/Tukyo/sypher-tools/refs/heads/main/config/chainlink.min.json");
            if (!response.ok) {
                throw new Error("CryptoModule.getPriceFeed: Unable to fetch Chainlink data");
            }

            const pairMap: TChainlistData = await response.json();
            const pairData = pairMap[pair.toLowerCase().replace(/\s+/g, '')];
            if (!pairData) { throw new Error(`CryptoModule.getPriceFeed: No data found for ${pair}. Reference: https://github.com/Tukyo/sypher-tools/blob/main/config/chainlink.json`); }

            const availableQuotes = Object.keys(pairData);
            console.log(`Available quotes for ${pair}:`, availableQuotes);

            let quoteDetails = pairData["usd"] || pairData["eth"];
            if (!quoteDetails) {
                throw new Error(`CryptoModule.getPriceFeed: No USD, ETH, or BTC quote found for ${pair}`);
            }
            console.log("Chosen Quote Details:", quoteDetails);

            const { proxy, decimals } = quoteDetails;

            const web3 = await this.getProvider(true);
            if (!web3) { return null; }

            const contract = new ethers.Contract(proxy, CHAINLINK_ABI, web3);
            const roundData: TRoundData = await contract.latestRoundData();
            const description = await contract.description();
            const price = ethers.utils.formatUnits(roundData.answer, decimals);
            console.log(`${description}: ${price}`);

            if (pairData["usd"]) { this._pairPrice = { value: price, timestamp: Date.now() }; return price; }
            else {
                const ethUSD = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
                const ethUSDContract = new ethers.Contract(ethUSD, CHAINLINK_ABI, web3);
                const ethUSDRoundData: TRoundData = await ethUSDContract.latestRoundData();
                const ethUSDPrice = ethers.utils.formatUnits(ethUSDRoundData.answer, 8);

                const finalPrice = parseFloat(price) * parseFloat(ethUSDPrice);
                console.log(`Final Price for ${pair}: $${finalPrice}`);

                this._pairPrice = { value: finalPrice.toString(), timestamp: Date.now() };
                return finalPrice.toString();
            }
        } catch (error: unknown) {
            throw new Error(`CryptoModule.getPriceFeed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getTokenDetails: async function (chain, contractAddress) {
        if (!chain) { throw new Error("CryptoModule.getTokenDetails: Chain is required"); }
        if (!contractAddress) { throw new Error("CryptoModule.getTokenDetails: Contract address is required"); }
        if (!contractAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getTokenDetails: Invalid contract address"); }

        try {
            let account = this._connected;
            if (account === null || account === undefined) {
                const connection = await this.connect(chain);
                if (!connection) { return null; }
                account = connection.primaryAccount;
            }
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
    getPriceV2: async function (chain, poolAddress, pair, pairAddress) {
        if (!chain) { throw new Error("CryptoModule.getPriceV2: Chain is required"); }
        if (!poolAddress) { throw new Error("CryptoModule.getPriceV2: Pool address is required"); }
        if (!poolAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPriceV2: Invalid pool address"); }
        if (!pair) { throw new Error("CryptoModule.getPriceV2: Pair is required"); }
        if (!pairAddress) { throw new Error("CryptoModule.getPriceV2: Pair address is required"); }
        if (!pairAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPriceV2: Invalid pair address"); }

        try {
            const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
            if (!chainId) { return null; }

            let account = this._connected;
            if (account === null || account === undefined) {
                const connection = await this.connect(chain);
                if (!connection) { return null; }
                account = connection.primaryAccount;
            }
            if (!account) { return null; }

            const chainlinkResult = await this.getPriceFeed(pair);
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
    getPriceV3: async function (chain, contractAddress, poolAddress, pair, pairAddress) {
        if (!chain) { throw new Error("CryptoModule.getPriceV3: Chain is required"); }
        if (!contractAddress) { throw new Error("CryptoModule.getPriceV3: Contract address is required"); }
        if (!contractAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPriceV3: Invalid contract address"); }
        if (!poolAddress) { throw new Error("CryptoModule.getPriceV3: Pool address is required"); }
        if (!poolAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPriceV3: Invalid pool address"); }
        if (!pair) { throw new Error("CryptoModule.getPriceV3: Pair is required"); }
        if (!pairAddress) { throw new Error("CryptoModule.getPriceV3: Pair address is required"); }
        if (!pairAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPriceV3: Invalid pair address"); }

        try {
            const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
            if (!chainId) { return null; }

            let account = this._connected;
            if (account === null || account === undefined) {
                const connection = await this.connect(chain);
                if (!connection) { return null; }
                account = connection.primaryAccount;
            }
            if (!account) { return null; }

            // 1: Get all pool details
            const poolV3Data = await this.getPoolV3(chain, contractAddress, poolAddress);
            if (!poolV3Data) { return null; }

            const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = poolV3Data;

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
            const chainlinkResult = await this.getPriceFeed(pair);
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
        if (!chain) { throw new Error("CryptoModule.getPoolV3: Chain is required"); }
        if (!contractAddress) { throw new Error("CryptoModule.getPoolV3: Contract address is required"); }
        if (!contractAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPoolV3: Invalid contract address"); }
        if (!poolAddress) { throw new Error("CryptoModule.getPoolV3: Pool address is required"); }
        if (!poolAddress.match(ADDRESS_REGEXP)) { throw new Error("CryptoModule.getPoolV3: Invalid pool address"); }

        try {
            const chainId = this._chain?.chainId ?? await sypher.validateChain(chain);
            if (!chainId) { return null; }

            let account = this._connected;
            if (account === null || account === undefined) {
                const connection = await this.connect(chain);
                if (!connection) { return null; }
                account = connection.primaryAccount;
            }
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
        if (!balance) { throw new Error("CryptoModule.getUserValue: Balance is required"); }
        if (!price) { throw new Error("CryptoModule.getUserValue: Price is required"); }
        if (typeof balance !== "object") { throw new Error("CryptoModule.getUserValue: Invalid balance"); }
        if (typeof price !== "number") { throw new Error("CryptoModule.getUserValue: Invalid price"); }

        try {
            const value = parseFloat(balance.toString()) * parseFloat(price.toString());
            console.log(`User Value: ${value}`);
            return value;
        } catch (error: unknown) {
            throw new Error(`CryptoModule.getUserValue: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    clean: function (details: TRawDetails) {
        if (!details) { throw new Error("CryptoModule.clean: Token details are required"); }

        const { address, ens, contractAddress, poolAddress, pairAddress, ethBalance, balance, decimals, name, symbol, icon, totalSupply, tokenPrice, userValue, version, pair } = details;

        const cleanedDetails: TCleanedDetails = {
            user: {
                address,
                ens,
                ethBalance,
                tokenBalance: parseFloat(ethers.utils.formatUnits(balance, decimals)),
                value: (parseFloat(userValue.toString()) / Math.pow(10, decimals)).toFixed(decimals).toString()
            },
            token: {
                contractAddress,
                poolAddress,
                pairAddress,
                decimals,
                name,
                symbol,
                icon,
                totalSupply: parseFloat(ethers.utils.formatUnits(totalSupply, decimals)),
                tokenPrice: parseFloat(tokenPrice.toString()),
                version,
                pair
            }
        };
        this._details = cleanedDetails;

        console.log("Details:", cleanedDetails);
        return cleanedDetails;
    },
    getCleaned: function () {
        console.log(this._details);
        return this._details ?? null;
    },
    initProviderSearch: function () {
        window.addEventListener("eip6963:announceProvider", (event: Event) => {
            const customEvent = event as CustomEvent<TEIP6963>;

            DISCOVERED_PROVIDERS.push(customEvent.detail);

            // TODO: Create isLogging check - console.log("[EIP-6963]:", (customEvent.detail));
        });
        window.dispatchEvent(new Event("eip6963:requestProvider"));
    },
    getProvider: async function (isPublic: boolean = false) {
        if (isPublic) {
            for (const rpc of MAINNET_RPCS) {
                try {
                    const provider = new ethers.providers.JsonRpcProvider(rpc);
                    await provider.getBlockNumber(); // Quick test to see if the provider is working

                    console.log(`[Public RPC]: ${rpc}`);
                    return provider;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    throw new Error(`CryptoModule.getProvider: ${rpc} - ${errorMessage}`);
                }
            }
        } else {
            if (this._EIP6963) {
                console.log("[EIP6963]: ", this._EIP6963.provider);
                return this._EIP6963.provider;
            }
            if (typeof window === "undefined" || !window.ethereum) { throw new Error("CryptoModule.getProvider: No Ethereum provider found."); }
            console.log("[WINDOW]:", window.ethereum);
            return window.ethereum as EIP1193Provider;
        }
    },
    getConnected(): string | null {
        return this._connected ?? null;
    },
    flush: function () {
        if (this._connected === null || this._connected === undefined) {
            console.log("Nothing to flush...");
            return;
        }

        this._connected = undefined;
        this._details = undefined;
        this._pairPrice = undefined;
        this._ethBalance = undefined;
        this._ens = undefined;

        let provider = this._EIP6963?.provider
        if (!provider) { provider = this.getProvider(); }

        provider.removeAllListeners("accountsChanged");

        const button = document.getElementById("connect-button");

        const txt = sypher.getUI().connectText;
        if (button) { button.innerHTML = txt; }
    }
};