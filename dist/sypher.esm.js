import { ethers as ethers$1 } from 'ethers';

const ADDRESS_REGEXP = /^0x[a-fA-F0-9]{40}$/;
const CHAINS = {
    ethereum: {
        params: [{ chainId: "0x1" }],
        priceFeeds: {
            eth: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
        },
        pairAddresses: {
            eth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        }
    },
    arbitrum: {
        params: [{ chainId: "0xa4b1" }],
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
        params: [{ chainId: "0xa" }],
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
        params: [{ chainId: "0x2105" }],
        priceFeeds: {
            eth: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
        },
        pairAddresses: {
            eth: "0x4200000000000000000000000000000000000006"
        }
    },
    polygon: {
        params: [{ chainId: "0x89" }],
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
        params: [{ chainId: "0xa86a" }],
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
        params: [{ chainId: "0xfa" }],
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
const DISCOVERED_PROVIDERS = [];
const PLACEHOLDER_PROVIDERS = [
    {
        info: {
            icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4IDU2YzE1LjQ2NCAwIDI4LTEyLjUzNiAyOC0yOFM0My40NjQgMCAyOCAwIDAgMTIuNTM2IDAgMjhzMTIuNTM2IDI4IDI4IDI4WiIgZmlsbD0iIzFCNTNFNCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNyAyOGMwIDExLjU5OCA5LjQwMiAyMSAyMSAyMXMyMS05LjQwMiAyMS0yMVMzOS41OTggNyAyOCA3IDcgMTYuNDAyIDcgMjhabTE3LjIzNC02Ljc2NmEzIDMgMCAwIDAtMyAzdjcuNTMzYTMgMyAwIDAgMCAzIDNoNy41MzNhMyAzIDAgMCAwIDMtM3YtNy41MzNhMyAzIDAgMCAwLTMtM2gtNy41MzNaIiBmaWxsPSIjZmZmIi8+PC9zdmc+",
            name: "Coinbase Wallet",
            rdns: "com.coinbase.wallet",
            uuid: "96b79a0d-c5cd-48de-924b-af5c7bb68b7e",
            onboard: {
                bool: true,
                link: "https://www.coinbase.com/wallet",
                deeplink: "cbwallet://",
                fallback: {
                    ios: "https://apps.apple.com/us/app/coinbase-wallet-nfts-crypto/id1278383455",
                    android: "https://play.google.com/store/apps/details?id=org.toshi"
                }
            }
        },
        provider: {}
    },
    {
        info: {
            icon: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMzUgMzMiIHdpZHRoPSIzNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjI1Ij48cGF0aCBkPSJtMzIuOTU4MiAxLTEzLjEzNDEgOS43MTgzIDIuNDQyNC01LjcyNzMxeiIgZmlsbD0iI2UxNzcyNiIgc3Ryb2tlPSIjZTE3NzI2Ii8+PGcgZmlsbD0iI2UyNzYyNSIgc3Ryb2tlPSIjZTI3NjI1Ij48cGF0aCBkPSJtMi42NjI5NiAxIDEzLjAxNzE0IDkuODA5LTIuMzI1NC01LjgxODAyeiIvPjxwYXRoIGQ9Im0yOC4yMjk1IDIzLjUzMzUtMy40OTQ3IDUuMzM4NiA3LjQ4MjkgMi4wNjAzIDIuMTQzNi03LjI4MjN6Ii8+PHBhdGggZD0ibTEuMjcyODEgMjMuNjUwMSAyLjEzMDU1IDcuMjgyMyA3LjQ2OTk0LTIuMDYwMy0zLjQ4MTY2LTUuMzM4NnoiLz48cGF0aCBkPSJtMTAuNDcwNiAxNC41MTQ5LTIuMDc4NiAzLjEzNTggNy40MDUuMzM2OS0uMjQ2OS03Ljk2OXoiLz48cGF0aCBkPSJtMjUuMTUwNSAxNC41MTQ5LTUuMTU3NS00LjU4NzA0LS4xNjg4IDguMDU5NzQgNy40MDQ5LS4zMzY5eiIvPjxwYXRoIGQ9Im0xMC44NzMzIDI4Ljg3MjEgNC40ODE5LTIuMTYzOS0zLjg1ODMtMy4wMDYyeiIvPjxwYXRoIGQ9Im0yMC4yNjU5IDI2LjcwODIgNC40Njg5IDIuMTYzOS0uNjEwNS01LjE3MDF6Ii8+PC9nPjxwYXRoIGQ9Im0yNC43MzQ4IDI4Ljg3MjEtNC40NjktMi4xNjM5LjM2MzggMi45MDI1LS4wMzkgMS4yMzF6IiBmaWxsPSIjZDViZmIyIiBzdHJva2U9IiNkNWJmYjIiLz48cGF0aCBkPSJtMTAuODczMiAyOC44NzIxIDQuMTU3MiAxLjk2OTYtLjAyNi0xLjIzMS4zNTA4LTIuOTAyNXoiIGZpbGw9IiNkNWJmYjIiIHN0cm9rZT0iI2Q1YmZiMiIvPjxwYXRoIGQ9Im0xNS4xMDg0IDIxLjc4NDItMy43MTU1LTEuMDg4NCAyLjYyNDMtMS4yMDUxeiIgZmlsbD0iIzIzMzQ0NyIgc3Ryb2tlPSIjMjMzNDQ3Ii8+PHBhdGggZD0ibTIwLjUxMjYgMjEuNzg0MiAxLjA5MTMtMi4yOTM1IDIuNjM3MiAxLjIwNTF6IiBmaWxsPSIjMjMzNDQ3IiBzdHJva2U9IiMyMzM0NDciLz48cGF0aCBkPSJtMTAuODczMyAyOC44NzIxLjY0OTUtNS4zMzg2LTQuMTMxMTcuMTE2N3oiIGZpbGw9IiNjYzYyMjgiIHN0cm9rZT0iI2NjNjIyOCIvPjxwYXRoIGQ9Im0yNC4wOTgyIDIzLjUzMzUuNjM2NiA1LjMzODYgMy40OTQ2LTUuMjIxOXoiIGZpbGw9IiNjYzYyMjgiIHN0cm9rZT0iI2NjNjIyOCIvPjxwYXRoIGQ9Im0yNy4yMjkxIDE3LjY1MDctNy40MDUuMzM2OS42ODg1IDMuNzk2NiAxLjA5MTMtMi4yOTM1IDIuNjM3MiAxLjIwNTF6IiBmaWxsPSIjY2M2MjI4IiBzdHJva2U9IiNjYzYyMjgiLz48cGF0aCBkPSJtMTEuMzkyOSAyMC42OTU4IDIuNjI0Mi0xLjIwNTEgMS4wOTEzIDIuMjkzNS42ODg1LTMuNzk2Ni03LjQwNDk1LS4zMzY5eiIgZmlsbD0iI2NjNjIyOCIgc3Ryb2tlPSIjY2M2MjI4Ii8+PHBhdGggZD0ibTguMzkyIDE3LjY1MDcgMy4xMDQ5IDYuMDUxMy0uMTAzOS0zLjAwNjJ6IiBmaWxsPSIjZTI3NTI1IiBzdHJva2U9IiNlMjc1MjUiLz48cGF0aCBkPSJtMjQuMjQxMiAyMC42OTU4LS4xMTY5IDMuMDA2MiAzLjEwNDktNi4wNTEzeiIgZmlsbD0iI2UyNzUyNSIgc3Ryb2tlPSIjZTI3NTI1Ii8+PHBhdGggZD0ibTE1Ljc5NyAxNy45ODc2LS42ODg2IDMuNzk2Ny44NzA0IDQuNDgzMy4xOTQ5LTUuOTA4N3oiIGZpbGw9IiNlMjc1MjUiIHN0cm9rZT0iI2UyNzUyNSIvPjxwYXRoIGQ9Im0xOS44MjQyIDE3Ljk4NzYtLjM2MzggMi4zNTg0LjE4MTkgNS45MjE2Ljg3MDQtNC40ODMzeiIgZmlsbD0iI2UyNzUyNSIgc3Ryb2tlPSIjZTI3NTI1Ii8+PHBhdGggZD0ibTIwLjUxMjcgMjEuNzg0Mi0uODcwNCA0LjQ4MzQuNjIzNi40NDA2IDMuODU4NC0zLjAwNjIuMTE2OS0zLjAwNjJ6IiBmaWxsPSIjZjU4NDFmIiBzdHJva2U9IiNmNTg0MWYiLz48cGF0aCBkPSJtMTEuMzkyOSAyMC42OTU4LjEwNCAzLjAwNjIgMy44NTgzIDMuMDA2Mi42MjM2LS40NDA2LS44NzA0LTQuNDgzNHoiIGZpbGw9IiNmNTg0MWYiIHN0cm9rZT0iI2Y1ODQxZiIvPjxwYXRoIGQ9Im0yMC41OTA2IDMwLjg0MTcuMDM5LTEuMjMxLS4zMzc4LS4yODUxaC00Ljk2MjZsLS4zMjQ4LjI4NTEuMDI2IDEuMjMxLTQuMTU3Mi0xLjk2OTYgMS40NTUxIDEuMTkyMSAyLjk0ODkgMi4wMzQ0aDUuMDUzNmwyLjk2Mi0yLjAzNDQgMS40NDItMS4xOTIxeiIgZmlsbD0iI2MwYWM5ZCIgc3Ryb2tlPSIjYzBhYzlkIi8+PHBhdGggZD0ibTIwLjI2NTkgMjYuNzA4Mi0uNjIzNi0uNDQwNmgtMy42NjM1bC0uNjIzNi40NDA2LS4zNTA4IDIuOTAyNS4zMjQ4LS4yODUxaDQuOTYyNmwuMzM3OC4yODUxeiIgZmlsbD0iIzE2MTYxNiIgc3Ryb2tlPSIjMTYxNjE2Ii8+PHBhdGggZD0ibTMzLjUxNjggMTEuMzUzMiAxLjEwNDMtNS4zNjQ0Ny0xLjY2MjktNC45ODg3My0xMi42OTIzIDkuMzk0NCA0Ljg4NDYgNC4xMjA1IDYuODk4MyAyLjAwODUgMS41Mi0xLjc3NTItLjY2MjYtLjQ3OTUgMS4wNTIzLS45NTg4LS44MDU0LS42MjIgMS4wNTIzLS44MDM0eiIgZmlsbD0iIzc2M2UxYSIgc3Ryb2tlPSIjNzYzZTFhIi8+PHBhdGggZD0ibTEgNS45ODg3MyAxLjExNzI0IDUuMzY0NDctLjcxNDUxLjUzMTMgMS4wNjUyNy44MDM0LS44MDU0NS42MjIgMS4wNTIyOC45NTg4LS42NjI1NS40Nzk1IDEuNTE5OTcgMS43NzUyIDYuODk4MzUtMi4wMDg1IDQuODg0Ni00LjEyMDUtMTIuNjkyMzMtOS4zOTQ0eiIgZmlsbD0iIzc2M2UxYSIgc3Ryb2tlPSIjNzYzZTFhIi8+PHBhdGggZD0ibTMyLjA0ODkgMTYuNTIzNC02Ljg5ODMtMi4wMDg1IDIuMDc4NiAzLjEzNTgtMy4xMDQ5IDYuMDUxMyA0LjEwNTItLjA1MTloNi4xMzE4eiIgZmlsbD0iI2Y1ODQxZiIgc3Ryb2tlPSIjZjU4NDFmIi8+PHBhdGggZD0ibTEwLjQ3MDUgMTQuNTE0OS02Ljg5ODI4IDIuMDA4NS0yLjI5OTQ0IDcuMTI2N2g2LjExODgzbDQuMTA1MTkuMDUxOS0zLjEwNDg3LTYuMDUxM3oiIGZpbGw9IiNmNTg0MWYiIHN0cm9rZT0iI2Y1ODQxZiIvPjxwYXRoIGQ9Im0xOS44MjQxIDE3Ljk4NzYuNDQxNy03LjU5MzIgMi4wMDA3LTUuNDAzNGgtOC45MTE5bDIuMDAwNiA1LjQwMzQuNDQxNyA3LjU5MzIuMTY4OSAyLjM4NDIuMDEzIDUuODk1OGgzLjY2MzVsLjAxMy01Ljg5NTh6IiBmaWxsPSIjZjU4NDFmIiBzdHJva2U9IiNmNTg0MWYiLz48L2c+PC9zdmc+",
            name: "MetaMask",
            rdns: "io.metamask",
            uuid: "974b295e-a371-4e37-a428-b82abf69ec3c",
            onboard: {
                bool: true,
                link: "https://metamask.io/",
                deeplink: "metamask://",
                fallback: {
                    ios: "https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202",
                    android: "https://play.google.com/store/apps/details?id=io.metamask&pli=1"
                }
            }
        },
        provider: {}
    }
];
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
const THEMES = ["none", "custom", "default", "light"];
const BUTTON_TYPES = ["none", "custom", "connect", "provider"];
const MODAL_TYPES = ["none", "custom", "log", "connect"];

const HelperModule = {
    validateInput: function (inputs, rules, context = "validateInput") {
        if (typeof inputs !== 'object') {
            throw new TypeError(`${context}: "inputs" must be a valid object.`);
        }
        if (typeof rules !== 'object') {
            throw new TypeError(`${context}: "rules" must be a valid object.`);
        }
        if (typeof context !== 'string') {
            throw new TypeError(`${context}: "context" must be a valid string.`);
        }
        Object.entries(rules).forEach(([key, rule]) => {
            const value = inputs[key];
            if (rule.required && (value === undefined || value === null)) { // Required field validation
                throw new Error(`${context}: "${key}" is required.`);
            }
            if (!rule.required && (value === undefined || value === null))
                return; // Skip optional fields
            if (rule.type === "array") { // Array validation
                if (!Array.isArray(value)) {
                    throw new TypeError(`${context}: Validation failed: "${key}" must be an array.`);
                }
                if (rule.items) { // Validate each item in the array
                    value.forEach((item, index) => {
                        if (rule.items.type && typeof item !== rule.items.type) {
                            throw new TypeError(`${context}: Validation failed: "${key}[${index}]" must be of type "${rule.items.type}", but received type "${typeof item}".`);
                        }
                        if (rule.items.regex && !rule.items.regex.test(item)) {
                            throw new Error(`${context}: Validation failed: "${key}[${index}]" must match the pattern "${rule.items.regex}".`);
                        }
                        if (rule.items.values && !rule.items.values.includes(item)) {
                            throw new Error(`${context}: Validation failed: "${key}[${index}]" must be one of [${rule.items.values}].`);
                        }
                    });
                }
                if (rule.length) { // Validate array length
                    if (rule.length.min !== undefined && value.length < rule.length.min) {
                        throw new Error(`${context}: Validation failed: "${key}" must have a minimum length of ${rule.length.min}, but got ${value.length}.`);
                    }
                    if (rule.length.max !== undefined && value.length > rule.length.max) {
                        throw new Error(`${context}: Validation failed: "${key}" must have a maximum length of ${rule.length.max}, but got ${value.length}.`);
                    }
                }
            }
            else if (rule.type && typeof value !== rule.type) { // Type validation for non-arrays
                throw new TypeError(`${context}: Validation failed: "${key}" must be of type "${rule.type}", but received type "${typeof value}".`);
            }
            if (rule.regex && !rule.regex.test(value)) { // Regex validation
                throw new Error(`${context}: Validation failed: "${key}" must match the pattern "${rule.regex}".`);
            }
            if (rule.values && !rule.values.includes(value)) { // Values validation
                throw new Error(`${context}: Validation failed: "${key}" must be one of [${rule.values}].`);
            }
            if (rule.enum && !rule.enum.includes(value)) { // Enum validation
                throw new Error(`${context}: Validation failed: "${key}" must be one of [${rule.enum}].`);
            }
            if (rule.range && (value < rule.range.min || value > rule.range.max)) { // Range validation
                throw new RangeError(`${context}: Validation failed: "${key}" must be within the range [${rule.range.min}, ${rule.range.max}].`);
            }
            if (rule.length) { // Length validation
                const length = value.length;
                if (typeof length !== "number") {
                    throw new TypeError(`${context}: "${key}" must have a valid length property.`);
                }
                if (typeof rule.length === "number" && length !== rule.length) { // Exact length
                    throw new Error(`${context}: "${key}" must have a length of ${rule.length}, but got ${length}.`);
                }
                if (typeof rule.length === "object") { // Min and max length
                    if (rule.length.min !== undefined && length < rule.length.min) {
                        throw new Error(`${context}: "${key}" must have a minimum length of ${rule.length.min}, but got ${length}.`);
                    }
                    if (rule.length.max !== undefined && length > rule.length.max) {
                        throw new Error(`${context}: "${key}" must have a maximum length of ${rule.length.max}, but got ${length}.`);
                    }
                }
            }
        });
        return true;
    },
    validateChain: function (chain) {
        const validInput = this.validateInput({ chain }, { chain: { required: true, type: "string" } }, "CryptoModule.validateChain");
        if (!validInput) {
            return null;
        }
        const chainData = CHAINS[chain];
        if (!chainData) {
            throw new Error(`CryptoModule.validateChain: Chain "${chain}" is not supported.`);
        }
        const chainId = chainData.params[0]?.chainId;
        if (!chainId) {
            throw new Error(`CryptoModule.validateChain: Missing chainId for chain "${chain}".`);
        }
        return { chainData, chainId };
    },
};
const LogModule = {
    initLogger: function () {
        const logModal = document.querySelector("#log-modal");
        const logContainer = document.querySelector("#log-mc");
        const logToggle = document.querySelector("#log-mt");
        const logShowHTML = `<i class="fa-solid fa-caret-right"></i>`; // TODO: Replace FontAwesome with custom SVG 
        const logHideHTML = `<i class="fa-solid fa-caret-left"></i>`;
        const originalLog = console.log;
        const originalError = console.error;
        console.log = function (...args) { originalLog.apply(console, args); appendLog(args); };
        console.error = function (...args) { originalError.apply(console, args); appendLog(args); };
        window.onerror = function (message, source, lineno, colno, error) { appendLog([`Error: ${message} at ${source}:${lineno}:${colno}`, error]); };
        window.addEventListener("unhandledrejection", function (event) { appendLog(["Unhandled Promise Rejection:", event.reason]); });
        function appendLog(args) {
            const logItem = document.createElement("div");
            logItem.className = "log-item";
            args.forEach(arg => {
                if (Array.isArray(arg)) {
                    arg.forEach(item => handleSingleArgument(item, logItem));
                }
                else {
                    handleSingleArgument(arg, logItem);
                }
            });
            if (logContainer) {
                logContainer.appendChild(logItem);
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        }
        function handleSingleArgument(arg, logItem) {
            const logDiv = document.createElement("div");
            if (arg instanceof Error) {
                logItem.classList.add("log-error");
                logDiv.className = "log-object error-object";
                logDiv.innerHTML = `<pre>${syntaxHighlight(safeStringify({
                    message: arg.message,
                    name: arg.name,
                    stack: arg.stack
                }, 2))}</pre>`;
            }
            else if (arg instanceof HTMLElement) {
                logDiv.className = "log-dom";
                logDiv.innerHTML = `<pre>&lt;${arg.tagName.toLowerCase()} id="${arg.id}" class="${arg.className}"&gt;</pre>`;
            }
            else if (typeof arg === "object" && arg !== null) {
                logDiv.className = "log-object";
                try {
                    logDiv.innerHTML = `<pre>${syntaxHighlight(safeStringify(arg, 2))}</pre>`;
                }
                catch (e) {
                    logDiv.textContent = `[Unserializable object: ${e.message}]`;
                }
            }
            else if (typeof arg === "string") {
                logDiv.className = isAddress(arg) ? "log-address" : "log-string";
                logDiv.textContent = arg;
            }
            else if (typeof arg === "number") {
                logDiv.className = "log-number";
                logDiv.textContent = arg.toString();
            }
            else {
                logDiv.className = "log-unknown";
                logDiv.textContent = String(arg);
            }
            logItem.appendChild(logDiv);
        }
        function safeStringify(obj, space = 2) {
            const seen = new WeakSet();
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return "[Circular]";
                    }
                    seen.add(value);
                }
                return value;
            }, space);
        }
        function syntaxHighlight(json) {
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g, match => {
                let cls = "log-number";
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = "log-key";
                    }
                    else if (isAddress(match.replace(/"/g, ""))) {
                        cls = "log-address";
                    }
                    else {
                        cls = "log-string";
                    }
                }
                else if (/true|false/.test(match)) {
                    cls = "log-boolean";
                }
                else if (/null/.test(match)) {
                    cls = "log-null";
                }
                return `<span class="${cls}">${match}</span>`;
            });
        }
        function isAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value); }
        if (logToggle) {
            logToggle.addEventListener("click", toggleLogContainer);
        }
        function toggleLogContainer() {
            if (!logModal || !logContainer || !logToggle) {
                return;
            }
            if (logContainer.classList.contains("lc-hide")) {
                logContainer.classList.remove("lc-hide");
                logContainer.classList.add("lc-show");
                logToggle.innerHTML = logHideHTML;
                logModal.classList.remove("lm-hide");
                logModal.classList.add("lm-show");
            }
            else {
                logContainer.classList.remove("lc-show");
                logContainer.classList.add("lc-hide");
                logToggle.innerHTML = logShowHTML;
                logModal.classList.remove("lm-show");
                logModal.classList.add("lm-hide");
            }
        }
        toggleLogContainer();
    }
};
const TruncationModule = {
    truncate: function (string, startLength = 6, endLength = 4) {
        const validInput = sypher.validateInput({ string, startLength, endLength }, {
            string: { type: "string", required: true },
            startLength: { type: "number", required: false },
            endLength: { type: "number", required: false }
        }, "TruncationModule.truncate");
        if (!validInput) {
            return null;
        }
        if (string.length <= startLength + endLength + 3) {
            return string;
        }
        return `${string.slice(0, startLength)}...${string.slice(-endLength)}`;
    },
    truncateBalance: function (balance, decimals = 2, maxLength = 8) {
        const validInput = sypher.validateInput({ balance, decimals, maxLength }, {
            balance: { type: "number", required: true },
            decimals: { type: "number", required: false },
            maxLength: { type: "number", required: false }
        }, "TruncationModule.truncateBalance");
        if (!validInput) {
            return null;
        }
        const num = parseFloat(balance.toString());
        if (num >= 1e15)
            return `${(num / 1e15).toFixed(decimals)}Q`;
        if (num >= 1e12)
            return `${(num / 1e12).toFixed(decimals)}T`;
        if (num >= 1e9)
            return `${(num / 1e9).toFixed(decimals)}B`;
        if (num >= 1e6)
            return `${(num / 1e6).toFixed(decimals)}M`;
        if (num >= 1e3)
            return `${(num / 1e3).toFixed(decimals)}K`;
        const [intPart, decPart = ""] = num.toString().split(".");
        if (intPart.length >= maxLength) {
            return intPart;
        }
        const remainingLength = maxLength - intPart.length - 1;
        const truncatedDecimal = decPart.slice(0, Math.max(remainingLength, 0));
        return truncatedDecimal ? `${intPart}.${truncatedDecimal}` : intPart;
    }
};
const WindowModule = {
    pageFocus: function () {
        const pageFocused = document.visibilityState === "visible";
        if (pageFocused)
            console.log(`Page Focused...`);
        else
            console.log(`Page Unfocused...`);
        return pageFocused;
    },
    userEnvironment: function () {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS/i.test(userAgent);
        const isTablet = /iPad|Tablet/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        const screenDetails = {
            width: window.screen.width,
            height: window.screen.height,
            availableWidth: window.screen.availWidth,
            availableHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
        };
        const browserDetails = (() => {
            const ua = userAgent.toLowerCase();
            if (/chrome|crios|crmo/i.test(ua) && !/edge|opr\//i.test(ua))
                return 'Chrome';
            if (/firefox|fxios/i.test(ua))
                return 'Firefox';
            if (/safari/i.test(ua) && !/chrome|crios|crmo|opr\//i.test(ua))
                return 'Safari';
            if (/opr\//i.test(ua))
                return 'Opera';
            if (/edg/i.test(ua))
                return 'Edge';
            if (/msie|trident/i.test(ua))
                return 'Internet Explorer';
            return 'Unknown';
        })();
        const osDetails = (() => {
            if (/windows phone/i.test(userAgent))
                return 'Windows Phone';
            if (/win/i.test(userAgent))
                return 'Windows';
            if (/android/i.test(userAgent))
                return 'Android';
            if (/mac/i.test(userAgent))
                return 'MacOS';
            if (/iphone|ipad|ipod/i.test(userAgent))
                return 'iOS';
            if (/linux/i.test(userAgent))
                return 'Linux';
            return 'Unknown';
        })();
        const environment = {
            isMobile: isMobile,
            isTablet: isTablet,
            isDesktop: isDesktop,
            deviceType: isMobile ? (isTablet ? 'Tablet' : 'Mobile') : 'Desktop',
            browser: browserDetails,
            operatingSystem: osDetails,
            userAgent: userAgent,
            ethereum: ("ethereum" in window) && typeof window.ethereum !== 'undefined',
            platform: navigator.platform,
            languages: navigator.languages || [navigator.language],
            cookiesEnabled: navigator.cookieEnabled,
            screenDetails: screenDetails,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        return environment;
    }
};

const InterfaceModule = {
    initTheme: function (theme = "default") {
        const validInput = sypher.validateInput({ theme }, {
            theme: { type: "string", required: true }
        }, "InterfaceModule.initTheme");
        if (!validInput) {
            return;
        }
        if (this._theme) {
            return;
        }
        if (theme === "none") {
            theme = "custom";
        }
        const themeStylesheetId = `sypher-${theme}-theme`;
        if (!document.getElementById(themeStylesheetId)) {
            const themeLink = document.createElement('link');
            themeLink.id = themeStylesheetId;
            themeLink.rel = 'stylesheet';
            themeLink.href = `/dist/css/themes/sypher-${theme}-theme.css`;
            document.head.appendChild(themeLink);
            this._theme = theme;
        }
    },
    applyStyle: function (elements, params) {
        const validInput = sypher.validateInput({ elements, ...params }, {
            elements: { type: "array", required: true },
            type: { type: "string", required: true },
            theme: { type: "string", required: true }
        }, "InterfaceModule.applyStyle");
        if (!validInput) {
            return;
        }
        const type = params.type;
        let theme = params.theme;
        if (theme === "none") {
            theme = "custom";
        }
        if (!this._theme) {
            this.initTheme(theme);
        }
        const typeStylesheetId = `sypher-${type}`;
        if (!document.getElementById(typeStylesheetId)) {
            const typeLink = document.createElement('link');
            typeLink.id = typeStylesheetId;
            typeLink.rel = 'stylesheet';
            typeLink.href = `/dist/css/sypher-${type}.css`;
            document.head.appendChild(typeLink);
        }
    },
    createButton: function (params) {
        const defaultParams = {
            type: "connect",
            text: "Connect Wallet",
            icon: "",
            modal: false,
            theme: "none",
            append: document.body,
            onClick: () => sypher.connect("ethereum"),
            initCrypto: {}
        };
        const mergedParams = { ...defaultParams, ...params };
        const { type, text, icon, modal, theme, append, onClick, initCrypto } = mergedParams;
        if (!BUTTON_TYPES.includes(type)) {
            throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`);
        }
        if (!THEMES.includes(theme)) {
            throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`);
        }
        let appliedTheme = this._theme || theme;
        if (theme === "none") {
            appliedTheme = "custom";
        }
        let appliedType = type;
        if (type === "none") {
            appliedType = "custom";
        }
        const themeParams = { type, theme: appliedTheme };
        if (!themeParams) {
            return null;
        }
        if (appliedType === "connect") {
            if (initCrypto.chain === "none") {
                throw new Error(`InterfaceModule.createButton: Chain is required for type 'connect'.`);
            }
            const className = `${appliedType}-button`;
            const themeName = `${appliedTheme}-button`;
            const buttonId = `${appliedType}-button`;
            let button = document.getElementById(buttonId);
            if (!button) {
                button = document.createElement('button');
                button.id = buttonId;
                append.appendChild(button);
            }
            button.classList.add(className, themeName);
            button.textContent = text;
            this._connectText = text;
            const finalOnClick = onClick === defaultParams.onClick
                ? () => sypher.connect(initCrypto.chain !== "none" ? initCrypto.chain : "ethereum")
                : onClick;
            if (modal) {
                console.log("Modal Enabled...");
                button.onclick = () => this.createModal({ append: document.body, type: "connect", theme: appliedTheme, initCrypto });
                sypher.initProviderSearch();
            }
            else {
                button.onclick = finalOnClick;
            }
            this.applyStyle([button], themeParams);
            return button;
        }
        else if (appliedType === "provider") {
            if (initCrypto.chain === "none") {
                throw new Error(`InterfaceModule.createButton: Chain is required for type 'provider'.`);
            }
            const modalItem = document.createElement('div');
            modalItem.id = text.toLowerCase().replace(/\s+/g, '-');
            modalItem.classList.add('connect-mi');
            modalItem.addEventListener('click', onClick);
            const modalItemIcon = document.createElement('img');
            modalItemIcon.classList.add('connect-mim');
            modalItemIcon.src = icon;
            const modalItemName = document.createElement('span');
            modalItemName.classList.add('connect-min');
            modalItemName.innerText = text;
            this.applyStyle([modalItem, modalItemIcon, modalItemName], themeParams);
            append.appendChild(modalItem);
            modalItem.appendChild(modalItemIcon);
            modalItem.appendChild(modalItemName);
            return modalItem;
        }
        else {
            return null;
        } //TODO: Throw error
    },
    createModal: async function (params) {
        const defaultParams = { append: document.body, type: "none", theme: "none", initCrypto: {} };
        const mergedParams = { ...defaultParams, ...params };
        const validInput = sypher.validateInput({ ...mergedParams }, {
            append: { type: "object", required: false },
            type: { type: "string", required: true },
            theme: { type: "string", required: false }
        }, "InterfaceModule.createModal");
        if (!validInput) {
            return null;
        }
        const { append, type, theme, initCrypto } = mergedParams;
        if (!MODAL_TYPES.includes(type)) {
            throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`);
        }
        if (!THEMES.includes(theme)) {
            throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`);
        }
        let appliedTheme = this._theme || theme;
        if (theme === "none") {
            appliedTheme = "custom";
        }
        if (type === "none") {
            return null;
        } //TODO: Enable custom modals
        const modalObj = this.initModal(type, appliedTheme);
        if (!modalObj) {
            return null;
        }
        if (modalObj.type === "log") {
            this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle], mergedParams);
            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.parent.appendChild(modalObj.toggle);
            sypher.initLogger();
            return modalObj;
        }
        else if (modalObj.type === "connect") {
            this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle, modalObj.head, modalObj.title, modalObj.body], mergedParams);
            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.container.appendChild(modalObj.head);
            modalObj.head.appendChild(modalObj.title);
            modalObj.head.appendChild(modalObj.toggle);
            modalObj.container.appendChild(modalObj.body);
            // TODO: Create isLogging check - console.log(PLACEHOLDER_PROVIDERS);
            const mergedProviders = [
                ...PLACEHOLDER_PROVIDERS.map((placeholder) => {
                    const match = DISCOVERED_PROVIDERS.find((discovered) => discovered.info.name === placeholder.info.name);
                    const merged = match || placeholder;
                    if (match) {
                        if (!merged.info.onboard) {
                            merged.info.onboard = {
                                bool: false,
                                link: "",
                                deeplink: "",
                                fallback: {
                                    ios: "",
                                    android: "",
                                },
                            };
                        }
                        merged.info.onboard.bool = false;
                    }
                    return merged;
                }),
                ...DISCOVERED_PROVIDERS.filter((discovered) => !PLACEHOLDER_PROVIDERS.some((placeholder) => placeholder.info.name === discovered.info.name)),
            ];
            // TODO: Create isLogging check - console.log(mergedProviders);
            const account = sypher.getConnected();
            mergedProviders.forEach((providerDetail) => {
                const { name, icon } = providerDetail.info;
                const onClick = providerDetail.info.onboard?.bool
                    ? () => { sypher.onboard(providerDetail); }
                    : () => {
                        if (initCrypto.chain !== "none") {
                            sypher.initCrypto({
                                chain: initCrypto.chain,
                                contractAddress: initCrypto.contractAddress,
                                poolAddress: initCrypto.poolAddress,
                                version: initCrypto.version, //TODO: Check how to make this work with non eth pairs
                                detail: providerDetail,
                                icon: initCrypto.icon
                            });
                        }
                        else {
                            sypher.connect(initCrypto.chain, providerDetail);
                        }
                    };
                const button = this.createButton({
                    append: modalObj.body,
                    type: "provider",
                    text: name,
                    icon: icon,
                    modal: false,
                    theme: appliedTheme,
                    onClick: onClick,
                    initCrypto: initCrypto
                });
                if (button !== null) {
                    if (account !== null && account !== undefined) {
                        button.style.display = "none";
                    }
                }
            });
            if (account !== null && account !== undefined) {
                modalObj.title.innerHTML = "Account";
                const provider = sypher.getProvider();
                const web3 = new ethers.providers.Web3Provider(provider);
                const signer = web3.getSigner();
                const balance = await signer.getBalance();
                const eth = ethers.utils.formatEther(balance);
                const tokenDetails = sypher.getCleaned();
                let showTokenDetails = false;
                let tokenDetailClass = "av-b-c-hide";
                let icon = "";
                let tokenName = "";
                let userBalance = 0;
                let userValue = "";
                let tokenPrice = 0;
                let tokenDecimals = 0;
                if (tokenDetails) {
                    showTokenDetails = true;
                    tokenDetailClass = "av-b-c";
                    icon = tokenDetails.icon || "";
                    tokenName = tokenDetails.name || "";
                    userBalance = tokenDetails.balance || 0;
                    userValue = tokenDetails.userValue || "";
                    tokenPrice = tokenDetails.tokenPrice || 0;
                    tokenDecimals = tokenDetails.decimals || 0;
                }
                const accountView = this.createElement({
                    append: modalObj.body,
                    type: "div",
                    id: 'account-view',
                    children: [
                        {
                            type: "div",
                            classes: ["av-h"],
                            children: [
                                {
                                    type: "h2",
                                    classes: ["av-h-ti"],
                                    innerHTML: `${sypher.truncate(account)}`
                                },
                                {
                                    type: "h3",
                                    classes: ["av-h-ba"],
                                    innerHTML: `${sypher.truncateBalance(parseFloat(eth.toString()))} ETH` // TODO: Update 'ETH' to native token of chain
                                }
                            ]
                        },
                        {
                            type: "div",
                            classes: ["av-b"],
                            children: [
                                {
                                    type: "div",
                                    id: "av-b-td",
                                    classes: [tokenDetailClass],
                                    children: [
                                        {
                                            type: "div",
                                            classes: ["av-b-td-ic"],
                                            children: [
                                                {
                                                    type: "img",
                                                    classes: ["av-b-td-i"],
                                                    attributes: {
                                                        src: icon
                                                    }
                                                },
                                                {
                                                    type: "div",
                                                    classes: ["av-b-td-n"],
                                                    innerHTML: showTokenDetails
                                                        ? `$${sypher.truncateBalance(parseFloat(tokenPrice.toString()))}`
                                                        : ""
                                                }
                                            ]
                                        },
                                        {
                                            type: "div",
                                            classes: ["av-b-td-bal"],
                                            innerHTML: showTokenDetails
                                                ? `${sypher.truncateBalance(parseFloat(userBalance.toString()), tokenDecimals)} ${tokenName}`
                                                : ""
                                        },
                                        {
                                            type: "div",
                                            classes: ["av-b-td-val"],
                                            innerHTML: showTokenDetails
                                                ? `$${sypher.truncateBalance(parseFloat(userValue.toString()))}`
                                                : ""
                                        }
                                    ]
                                },
                                {
                                    type: "div",
                                    id: "av-b-provider",
                                    classes: ["av-b-b"],
                                    events: {
                                        click: () => {
                                            if (accountView) {
                                                accountView.style.display = "none";
                                            }
                                            const buttons = document.querySelectorAll('.connect-mi');
                                            if (buttons) {
                                                buttons.forEach((button) => { button.style.display = "flex"; });
                                            }
                                            modalObj.title.innerHTML = "Change Wallet";
                                        }
                                    },
                                    children: [
                                        {
                                            type: "div",
                                            classes: ["av-b-bn-ic"],
                                            children: [
                                                {
                                                    type: "img",
                                                    classes: ["av-b-bn-i"],
                                                    attributes: {
                                                        src: mergedProviders[0].info.icon
                                                    }
                                                },
                                                {
                                                    type: "img",
                                                    classes: ["av-b-bn-i"],
                                                    attributes: {
                                                        src: mergedProviders[1].info.icon
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type: "div",
                                            classes: ["av-b-bn-t"],
                                            innerHTML: "Change Wallet"
                                        }
                                    ],
                                }
                                // {
                                //     type: "div",
                                //     id: "av-b-history",
                                //     classes: ["av-b-b"],
                                //     innerHTML: "Recent Activity"
                                // }
                            ]
                        },
                        {
                            type: "div",
                            classes: ["av-x"],
                            events: {
                                click: () => {
                                    sypher.disconnect();
                                    if (accountView && accountView.parentNode) {
                                        accountView.parentNode.removeChild(accountView);
                                    }
                                    const buttons = document.querySelectorAll('.connect-mi');
                                    if (buttons) {
                                        buttons.forEach((button) => { button.style.display = "flex"; });
                                    }
                                    const connectButton = document.getElementById('connect-button');
                                    if (connectButton && this._connectText) {
                                        connectButton.innerHTML = this._connectText;
                                    }
                                    modalObj.title.innerHTML = "Connect Wallet";
                                }
                            },
                            innerHTML: "Disconnect"
                        }
                    ]
                });
                if (!accountView) {
                    return null;
                }
            }
            return modalObj;
        }
        else {
            return null;
        } //TODO: Throw error
    },
    initModal: function (type, theme = "custom") {
        const validInput = sypher.validateInput({ type }, {
            type: { type: "string", required: true },
            theme: { type: "string", required: false }
        }, "InterfaceModule.initModal");
        if (!validInput) {
            return null;
        }
        if (type === "none" || type === "custom") {
            return null;
        } //TODO: Enable custom modals
        if (type === "log") {
            const modal = document.createElement('div');
            modal.id = `${type}-modal`;
            modal.classList.add(`${theme}-modal`);
            const modalContainer = document.createElement('div');
            modalContainer.id = `${type}-mc`;
            modalContainer.classList.add(`${theme}-mc`);
            const modalToggle = document.createElement('div');
            modalToggle.id = `${type}-mt`;
            modalToggle.classList.add(`${theme}-mt`);
            const modalObj = {
                type: type,
                parent: modal,
                container: modalContainer,
                toggle: modalToggle
            };
            return modalObj;
        }
        else if (type === "connect") {
            const connectModal = document.createElement('div');
            connectModal.id = `${type}-modal`;
            connectModal.classList.add(`${theme}-modal`);
            const modalContainer = document.createElement('div');
            modalContainer.id = `${type}-mc`;
            modalContainer.classList.add(`${theme}-mc`);
            const modalHeader = document.createElement('div');
            modalHeader.id = `${type}-mh`;
            modalHeader.classList.add(`${theme}-mh`);
            const modalClose = document.createElement('img');
            modalClose.id = `${type}-mx`;
            modalClose.classList.add(`${theme}-mx`);
            modalClose.src = "https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/close-c.svg";
            modalClose.addEventListener('click', () => { connectModal.remove(); }); // TODO: Might need to change this
            const modalTitle = document.createElement('h2');
            modalTitle.id = `${type}-mt`;
            modalTitle.classList.add(`${theme}-mt`);
            modalTitle.innerText = "Connect Wallet";
            const modalBody = document.createElement('div');
            modalBody.id = `${type}-mb`;
            modalBody.classList.add(`${theme}-mb`);
            const modalObj = {
                type: type,
                parent: connectModal,
                container: modalContainer,
                toggle: modalClose,
                head: modalHeader,
                title: modalTitle,
                body: modalBody
            };
            return modalObj;
        }
        else {
            return null;
        }
    },
    createElement: function (params) {
        const defaultParams = {
            append: document.body,
            type: "div",
            id: "",
            classes: [],
            attributes: {},
            events: {},
            innerHTML: "",
            children: []
        };
        const mergedParams = { ...defaultParams, ...params };
        const { append, type, id, theme, classes, attributes, events, innerHTML, children } = mergedParams;
        if (theme) {
            if (!THEMES.includes(theme)) {
                throw new Error(`InterfaceModule.createElement: Theme '${theme}' not found.`);
            }
        }
        let appliedTheme = this._theme || theme;
        if (theme === "none") {
            appliedTheme = "custom";
        }
        const element = document.createElement(type);
        if (id && id !== "") {
            element.id = id;
        }
        element.classList.add(`sypher-${appliedTheme}-element`);
        if (classes) {
            classes.forEach((className) => { element.classList.add(className); });
        }
        if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
                element.setAttribute(key, value);
            }
        }
        if (events) {
            for (const [key, value] of Object.entries(events)) {
                element.addEventListener(key, value);
            }
        }
        if (innerHTML && innerHTML !== "") {
            element.innerHTML = innerHTML;
        }
        if (children) {
            children.forEach((childParams) => {
                const childElement = this.createElement(childParams);
                if (childElement) {
                    element.appendChild(childElement);
                }
            });
        }
        if (append) {
            append.appendChild(element);
        }
        return element;
    },
    toggleLoader: function (params) {
        const defaultParams = {
            element: document.body,
            isEnabled: true,
            newText: "",
            loaderHTML: `<div class="loader"></div>`,
            replace: true
        };
        const mergedParams = { ...defaultParams, ...params };
        const { element, isEnabled, newText, loaderHTML, replace } = mergedParams;
        if (isEnabled) {
            if (replace) {
                element.innerHTML = loaderHTML;
            }
            else if (!element.querySelector('.loader')) {
                const loader = document.createElement('div');
                loader.classList.add('loader');
                element.appendChild(loader);
            }
        }
        else {
            if (newText === "sypher.revert") {
                const loader = element.querySelector('.loader');
                if (loader) {
                    loader.remove();
                }
                return;
            }
            else {
                element.innerHTML = newText;
            }
        }
    },
    parallax: function () {
        const parallaxElements = document.querySelectorAll('[data-speed]');
        if (parallaxElements.length === 0) {
            console.warn(`InterfaceModule.parallax: Parallax enabled, but no elements found with the [data-speed] attribute.`);
            return;
        }
        console.log("Parallax enabled on ", parallaxElements.length, " elements.");
        function applyParallax() {
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed || '0.5');
                const offset = window.scrollY * speed;
                element.style.transform = `translateY(${-offset}px)`;
            });
        }
        function onScroll() { requestAnimationFrame(applyParallax); }
        window.addEventListener('scroll', onScroll);
        applyParallax();
    },
    fade: function (distance = '20px', length = '0.5s') {
        const validInput = sypher.validateInput({ distance, length }, {
            distance: { type: "string", required: false },
            length: { type: "string", required: false }
        }, "InterfaceModule.fade");
        if (!validInput) {
            return;
        }
        const elements = document.querySelectorAll('[data-fade]');
        if (elements.length === 0) {
            console.warn(`InterfaceModule.fade: Fade enabled, but no elements found with the [data-fade] attribute.`);
            return;
        }
        console.log("Fade enabled on ", elements.length, " elements.");
        elements.forEach(el => {
            el.style.opacity = "0";
            el.style.transform = `translateY(${distance})`;
            el.style.transition = `opacity ${length} ease-out, transform ${length} ease-out`;
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    el.style.opacity = "1";
                    el.style.transform = 'translateY(0)';
                }
                else {
                    el.style.opacity = "0";
                    el.style.transform = `translateY(${distance})`;
                }
            });
        }, { threshold: 0.1 });
        elements.forEach(el => observer.observe(el));
    }
};

const CryptoModule = {
    initCrypto: async function (params) {
        const defaultParams = { chain: "ethereum", contractAddress: "", poolAddress: "", version: "V2", pair: "eth" };
        const p = { ...defaultParams, ...params };
        if (!p) {
            return null;
        }
        this.flush();
        const chainValidation = sypher.validateChain(p.chain);
        if (!chainValidation) {
            return null;
        }
        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) {
            return null;
        }
        try {
            const account = await this.connect(p.chain, p.detail);
            if (!account) {
                return null;
            }
            console.log("Getting details for:", p);
            const tokenDetails = await this.getTokenDetails(p.chain, p.contractAddress);
            if (!tokenDetails) {
                return null;
            }
            const { balance, decimals, name, symbol, totalSupply } = tokenDetails;
            let tokenPrice;
            if (p.version === "V2") {
                const priceV2 = await this.getPriceV2(p.chain, p.poolAddress, p.pair);
                if (!priceV2) {
                    return null;
                }
                tokenPrice = priceV2;
            }
            else if (p.version === "V3") {
                const priceV3 = await this.getPriceV3(p.chain, p.contractAddress, p.poolAddress, p.pair);
                if (!priceV3) {
                    return null;
                }
                tokenPrice = priceV3;
            }
            else {
                return null;
            }
            const userValue = this.getUserValue(balance, tokenPrice);
            if (userValue === null || userValue === undefined) {
                return null;
            }
            const contractAddress = p.contractAddress;
            const poolAddress = p.poolAddress;
            const icon = p.icon ?? "";
            const version = p.version;
            const pair = p.pair;
            const details = { contractAddress, poolAddress, balance, decimals, name, symbol, icon, totalSupply, tokenPrice, userValue, version, pair };
            if (!details) {
                return null;
            }
            const cleanedDetails = this.clean(details);
            if (!cleanedDetails) {
                return null;
            }
            const detailsObj = cleanedDetails;
            window.dispatchEvent(new CustomEvent("sypher:initCrypto", { detail: detailsObj }));
            return detailsObj;
        }
        catch (error) {
            throw new Error(`CryptoModule.initCrypto: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    connect: async function (chain, providerDetail = null) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.connect");
        if (!validInput) {
            return null;
        }
        console.log("Chain: ", chain, "Detail: ", providerDetail);
        const connectButton = document.getElementById("connect-button") || null;
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        const details = providerDetail || this._EIP6963;
        if (this._connected && !details) {
            return this._connected;
        }
        if (details) {
            const connectButtons = document.querySelectorAll(".connect-mi");
            const connectBody = document.getElementById("connect-mb");
            const connectModalC = document.getElementById("connect-mc");
            const connectModal = document.getElementById("connect-modal");
            if (connectButtons.length > 0) {
                connectButtons.forEach((button) => { button.style.display = "none"; });
            }
            if (connectBody) {
                const params = {
                    element: connectBody,
                    loaderHTML: "<div class='loader'></div>",
                    isEnabled: true,
                    replace: false
                };
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
                if (connectModalC) {
                    connectModalC.classList.add("height-a");
                }
                if (connectModal) {
                    setTimeout(() => { connectModal.style.opacity = "0%"; }, 5000);
                    setTimeout(() => { connectModal.remove(); }, 6000);
                }
                if (connectButton !== null) {
                    connectButton.innerHTML = `${sypher.truncate(primaryAccount)}`;
                }
                window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                this.accountChange(true);
                return primaryAccount;
            }
            catch (error) {
                const detailedError = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error, Object.getOwnPropertyNames(error));
                if (error.code === 4001) {
                    console.log("User denied wallet access...");
                    if (connectBody) {
                        const params = {
                            element: connectBody,
                            isEnabled: false,
                            newText: "sypher.revert"
                        };
                        sypher.toggleLoader(params);
                    }
                    connectButtons.forEach((button) => { button.style.display = "flex"; });
                    return;
                }
                throw new Error(`CryptoModule.connect: ${detailedError}`);
            }
        }
        else {
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
                if (connectButton !== null) {
                    connectButton.innerHTML = `${sypher.truncate(primaryAccount)}`;
                }
                window.dispatchEvent(new CustomEvent("sypher:connect", { detail: primaryAccount }));
                this.accountChange(true);
                return primaryAccount;
            }
            catch (error) {
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
    accountChange: function (active) {
        let provider = this._EIP6963?.provider;
        if (!provider) {
            provider = this.getProvider();
        }
        if (this._connected === null || this._connected === undefined) {
            return;
        }
        if (active) {
            console.log("Listening for account changes...");
            provider.on("accountsChanged", (accounts) => {
                if (!accounts.length) {
                    this.disconnect();
                }
                this._connected = accounts[0];
                window.dispatchEvent(new CustomEvent("sypher:accountChange", { detail: this.getConnected() }));
                provider.removeAllListeners("accountsChanged");
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
                            });
                        }
                        else {
                            console.log("Unknown Error Occured...");
                        }
                    }
                    else {
                        this.connect(this._chain.chainId, this._EIP6963);
                    }
                }
            });
        }
        else {
            provider.removeAllListeners("accountsChanged");
        }
    },
    onboard: async function (providerDetail) {
        const userEnv = sypher.userEnvironment();
        const isMobile = userEnv.isMobile;
        const isApple = userEnv.operatingSystem.toLowerCase() === "macos";
        const isAndroid = userEnv.operatingSystem.toLowerCase() === "android";
        if (!isMobile) {
            window.open(providerDetail.info.onboard.link, "_blank");
            return;
        }
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
                        }
                        else {
                            console.log("User canceled App Store redirection.");
                        }
                    }
                    else {
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
            }
            else {
                return;
            }
        }
    },
    // getChain: function () { console.log(this.chain); return this._chain; },
    switchChain: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.switchChain");
        if (!validInput) {
            return;
        }
        let provider = this._EIP6963?.provider;
        if (!provider) {
            provider = this.getProvider();
        }
        const chainData = await this.getChainData(chain);
        if (!chainData) {
            return;
        }
        const { chainlistData, params } = chainData;
        if (!chainlistData) {
            return;
        }
        const targetChainId = params.chainId;
        if (this._chain?.chainId === targetChainId) {
            return;
        }
        if (params) {
            this._chain = params;
        }
        try {
            const currentChainID = await provider.request({ method: 'eth_chainId' });
            if (currentChainID === targetChainId) {
                if (this._chain) {
                    this._chain.chainId = targetChainId;
                }
                return;
            }
            console.log(`Switching to ${chain} chain...`);
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
            });
            if (this._chain) {
                this._chain.chainId = targetChainId;
            }
        }
        catch (switchError) {
            console.warn(`CryptoModule.switchChain: Attempting to add chain: ${chain}`);
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [params],
                    });
                    if (this._chain) {
                        this._chain.chainId = targetChainId;
                    }
                }
                catch (addError) {
                    throw new Error(`CryptoModule.switchChain: Unable to add chain "${chain}". Details: ${addError}`);
                }
            }
            else {
                throw new Error(`CryptoModule.switchChain: Unable to switch chain "${chain}". Details: ${switchError}`);
            }
        }
    },
    getChainData: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.getChainData");
        if (!validInput) {
            return null;
        }
        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) {
            return null;
        }
        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) {
            return null;
        }
        try {
            const chainIdDecimal = parseInt(chainId, 16);
            const url = `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/chains/eip155-${chainIdDecimal}.json`;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Chain data for ID ${chainId} not found`);
            const data = await response.json();
            console.log(`Fetched chain data:`, data);
            const params = {
                chainId: `0x${parseInt(data.chainId, 10).toString(16)}`,
                chainName: data.name.toLowerCase(),
                nativeCurrency: data.nativeCurrency,
                rpcUrls: data.rpc,
                blockExplorerUrls: data.explorers?.map((explorer) => explorer.url) || []
            };
            return { chainlistData: data, params };
        }
        catch (error) {
            throw new Error(`CryptoModule.getChainData: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getPriceFeed: async function (chain, pair = "eth") {
        const validInput = sypher.validateInput({ chain, pair }, {
            chain: { type: "string", required: true },
            pair: { type: "string", required: false }
        }, "CryptoModule.getPriceFeed");
        if (!validInput) {
            return null;
        }
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) {
            return null;
        }
        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) {
            return null;
        }
        try {
            let account = this._connected;
            if (account === null || account === undefined) {
                account = await this.connect(chain);
            }
            if (!account) {
                return null;
            }
            const chainlinkAddress = CHAINS[chain].priceFeeds[pair];
            if (!chainlinkAddress) {
                throw new Error(`Chain ${chain} is not supported`);
            }
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            const web3 = new ethers$1.providers.Web3Provider(provider);
            const signer = web3.getSigner();
            const contract = new ethers$1.Contract(chainlinkAddress, CHAINLINK_ABI, signer);
            const roundData = await contract.latestRoundData();
            const price = ethers$1.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price on ${chain}: $${price}`);
            return price;
        }
        catch (error) {
            throw new Error(`CryptoModule.getPriceFeed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getTokenDetails: async function (chain, contractAddress) {
        const validInput = sypher.validateInput({ chain, contractAddress }, {
            chain: { type: "string", required: true },
            contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP }
        }, "CryptoModule.getTokenDetails");
        if (!validInput) {
            return null;
        }
        try {
            let account = this._connected;
            if (account === null || account === undefined) {
                account = await this.connect(chain);
            }
            if (!account) {
                return null;
            }
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            const web3 = new ethers$1.providers.Web3Provider(provider);
            const signer = web3.getSigner();
            const contract = new ethers$1.Contract(contractAddress, ERC20_ABI, signer);
            const balance = await contract.balanceOf(account);
            const decimals = await contract.decimals();
            const name = await contract.name();
            const symbol = await contract.symbol();
            const totalSupply = await contract.totalSupply();
            console.log("Raw Details:", { balance, decimals, name, symbol, totalSupply });
            return { balance, decimals, name, symbol, totalSupply };
        }
        catch (error) {
            throw new Error(`CryptoModule.getTokenDetails: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getPriceV2: async function (chain, poolAddress, pair) {
        const validInput = sypher.validateInput({ chain, poolAddress, pair }, {
            chain: { type: "string", required: true },
            poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
            pair: { type: "string", required: true }
        }, "CryptoModule.getPriceV2");
        if (!validInput) {
            return null;
        }
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) {
            return null;
        }
        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) {
            return null;
        }
        try {
            let account = this._connected;
            if (account === null || account === undefined) {
                account = await this.connect(chain);
            }
            if (!account) {
                return null;
            }
            const chainlinkResult = await this.getPriceFeed(chain, pair);
            if (!chainlinkResult)
                return null;
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            const web3 = new ethers$1.providers.Web3Provider(provider);
            const signer = web3.getSigner();
            const uniswapV2 = new ethers$1.Contract(poolAddress, UNISWAP_V2_POOL_ABI, signer);
            const token0 = await uniswapV2.token0();
            const token1 = await uniswapV2.token1();
            const reserves = await uniswapV2.getReserves();
            const reserve0 = reserves._reserve0;
            const reserve1 = reserves._reserve1;
            const token0Contract = new ethers$1.Contract(token0, ERC20_ABI, signer);
            const token1Contract = new ethers$1.Contract(token1, ERC20_ABI, signer);
            const decimals0 = await token0Contract.decimals();
            const decimals1 = await token1Contract.decimals();
            console.log("Reserve 0:", reserve0);
            console.log("Reserve 1:", reserve1);
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);
            console.log("Decimals 0:", decimals0);
            console.log("Decimals 1:", decimals1);
            const reserve0BN = ethers$1.BigNumber.from(reserve0);
            const reserve1BN = ethers$1.BigNumber.from(reserve1);
            // Convert each reserve to a normal floating-point value, adjusting by its decimals
            // e.g. if reserve0 = 123456789 (raw) and decimals0 = 6, then
            // parseFloat(ethers.utils.formatUnits(reserve0BN, 6)) => 123.456789
            const reserve0Float = parseFloat(ethers$1.utils.formatUnits(reserve0BN, decimals0));
            const reserve1Float = parseFloat(ethers$1.utils.formatUnits(reserve1BN, decimals1));
            const pairAddress = CHAINS[chain].pairAddresses[pair];
            console.log("Pair Address:", pairAddress);
            let priceRatio;
            if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve1Float / reserve0Float; // Price in pair = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
            }
            else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                priceRatio = reserve0Float / reserve1Float; // Price in pair = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
            }
            else {
                throw new Error(`CryptoModule.getPriceV2: Neither token is ${pair}`);
            }
            const tokenPriceUSD = priceRatio * parseFloat(chainlinkResult);
            console.log(`V2 Price for token in pool ${poolAddress}: $${tokenPriceUSD}`);
            return tokenPriceUSD;
        }
        catch (error) {
            throw new Error(`CryptoModule.getPriceV2: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getPriceV3: async function (chain, contractAddress, poolAddress, pair) {
        const validInput = sypher.validateInput({ chain, contractAddress, poolAddress, pair }, {
            chain: { type: "string", required: true },
            contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
            poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
            pair: { type: "string", required: true }
        }, "CryptoModule.getPriceV3");
        if (!validInput) {
            return null;
        }
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) {
            return null;
        }
        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) {
            return null;
        }
        try {
            let account = this._connected;
            if (account === null || account === undefined) {
                account = await this.connect(chain);
            }
            if (!account) {
                return null;
            }
            // 1: Get all pool details
            const poolV3Data = await this.getPoolV3(chain, contractAddress, poolAddress);
            if (!poolV3Data) {
                return null;
            }
            const { sqrtPriceX96, token0, token1, decimals0, decimals1 } = poolV3Data;
            const pairAddress = CHAINS[chain].pairAddresses[pair];
            console.log("Pair Address:", pairAddress);
            // 2: Calculate the price ratio = token1/token0 using precise big-number math
            const formattedSqrtPricex96 = ethers$1.BigNumber.from(sqrtPriceX96);
            const Q96 = ethers$1.BigNumber.from("79228162514264337593543950336");
            const numerator = formattedSqrtPricex96
                .mul(formattedSqrtPricex96)
                .mul(ethers$1.BigNumber.from(10).pow(decimals0));
            const denominator = Q96.mul(Q96).mul(ethers$1.BigNumber.from(10).pow(decimals1));
            const ratioBN = numerator.div(denominator);
            const remainder = numerator.mod(denominator);
            const decimalsWanted = 8;
            const scaleFactor = ethers$1.BigNumber.from(10).pow(decimalsWanted);
            const remainderScaled = remainder.mul(scaleFactor).div(denominator);
            const ratioFloat = parseFloat(ratioBN.toString()) +
                parseFloat(remainderScaled.toString()) / Math.pow(10, decimalsWanted);
            // 3: Determine which token is in the pool and calculate the token price
            let tokenRatio;
            if (token1.toLowerCase() === pairAddress.toLowerCase()) {
                tokenRatio = ratioFloat;
            }
            else if (token0.toLowerCase() === pairAddress.toLowerCase()) {
                tokenRatio = 1 / ratioFloat;
            }
            else {
                throw new Error(`CryptoModule.getPriceV3: Neither token is ${pair}`);
            }
            // 4: Fetch the ETH price in USD
            const chainlinkResult = await this.getPriceFeed(chain, pair);
            if (!chainlinkResult)
                return null;
            // 5: Convert token price from WETH to USD
            const tokenPriceUSD = tokenRatio * parseFloat(chainlinkResult);
            console.log(`V3 Price for token in pool ${sypher.truncate(poolAddress)}: $${tokenPriceUSD}`);
            return tokenPriceUSD;
        }
        catch (error) {
            throw new Error(`CryptoModule.getPriceV3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getPoolV3: async function (chain, contractAddress, poolAddress) {
        const validInput = sypher.validateInput({ chain, contractAddress, poolAddress }, {
            chain: { type: "string", required: true },
            contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
            poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP }
        }, "CryptoModule.getPoolV3");
        if (!validInput) {
            return null;
        }
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        const chainValidation = sypher.validateChain(chain);
        if (!chainValidation) {
            return null;
        }
        const { chainData, chainId } = chainValidation;
        if (!chainData || !chainId) {
            return null;
        }
        try {
            let account = this._connected;
            if (account === null || account === undefined) {
                account = await this.connect(chain);
            }
            if (!account) {
                return null;
            }
            let provider = this._EIP6963?.provider;
            if (!provider) {
                provider = this.getProvider();
            }
            const web3 = new ethers$1.providers.Web3Provider(provider);
            const signer = web3.getSigner();
            const pool = new ethers$1.Contract(poolAddress, UNISWAP_V3_POOL_ABI, signer);
            const slot0 = await pool.slot0();
            const sqrtPriceX96 = slot0.sqrtPriceX96;
            console.log("Sqrt Price X96:", sqrtPriceX96);
            const token0 = await pool.token0();
            const token1 = await pool.token1();
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);
            const token0Contract = new ethers$1.Contract(token0, ERC20_ABI, signer);
            const token1Contract = new ethers$1.Contract(token1, ERC20_ABI, signer);
            const decimals0 = await token0Contract.decimals();
            const decimals1 = await token1Contract.decimals();
            console.log("Decimals 0:", decimals0);
            console.log("Decimals 1:", decimals1);
            const liquidity = await pool.liquidity();
            console.log("Liquidity:", liquidity);
            const poolData = { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity };
            return poolData;
        }
        catch (error) {
            throw new Error(`CryptoModule.getPoolV3: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    getUserValue: function (balance, price) {
        const validInput = sypher.validateInput({ balance, price }, {
            balance: { type: "object", required: true },
            price: { type: "number", required: true }
        }, "CryptoModule.getUserValue");
        if (!validInput) {
            return null;
        }
        try {
            const value = parseFloat(balance.toString()) * parseFloat(price.toString());
            console.log(`User Value: ${value}`);
            return value;
        }
        catch (error) {
            throw new Error(`CryptoModule.getUserValue: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    },
    clean: function (tokenDetails) {
        const validInput = sypher.validateInput({ tokenDetails }, { tokenDetails: { type: "object", required: true } }, "CryptoModule.clean");
        if (!validInput) {
            return null;
        }
        const { contractAddress, poolAddress, balance, decimals, name, symbol, icon, totalSupply, tokenPrice, userValue, version, pair } = tokenDetails;
        const cleanedDetails = {
            contractAddress,
            poolAddress,
            balance: parseFloat(ethers$1.utils.formatUnits(balance, decimals)),
            decimals,
            name,
            symbol,
            icon,
            totalSupply: parseFloat(ethers$1.utils.formatUnits(totalSupply, decimals)),
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
        window.addEventListener("eip6963:announceProvider", (event) => {
            const customEvent = event;
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
        if (typeof window === "undefined" || !window.ethereum) {
            throw new Error("CryptoModule.getProvider: No Ethereum provider found.");
        }
        // console.log(window.ethereum);
        return window.ethereum;
    },
    getConnected() {
        return this._connected ?? null;
    },
    flush: function () {
        this._connected = undefined;
        this._token = undefined;
    }
};

(function (global) {
    const sypher = {
        ...CryptoModule,
        ...HelperModule,
        ...LogModule,
        ...InterfaceModule,
        ...TruncationModule,
        ...WindowModule,
    };
    global.sypher = sypher;
    console.log("Sypher Modules Initialized");
})(window);
//# sourceMappingURL=sypher.esm.js.map
