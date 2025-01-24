import { ethers } from 'ethers';

const ADDRESS_REGEXP = /^0x[a-fA-F0-9]{40}$/;
const LP_VER = ["V2", "V3"];
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
        const logShowHTML = `<i class="fa-solid fa-caret-right"></i>`;
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
    }
};

const InterfaceModule = {
    applyTheme: function (elements, params) {
        console.log(elements);
        const validInput = sypher.validateInput({ elements, ...params }, {
            elements: { type: "array", required: true },
            type: { type: "string", required: true },
            theme: { type: "string", required: true }
        }, "InterfaceModule.applyTheme");
        if (!validInput) {
            return;
        }
        const { type, theme } = params;
        const themeStylesheetId = `sypher-${theme}-theme`;
        if (!document.getElementById(themeStylesheetId)) {
            const themeLink = document.createElement('link');
            themeLink.id = themeStylesheetId;
            themeLink.rel = 'stylesheet';
            themeLink.href = `/dist/css/themes/sypher-${theme}-theme.css`;
            document.head.appendChild(themeLink);
        }
        const typeStylesheetId = `sypher-${type}-style`;
        if (!document.getElementById(typeStylesheetId)) {
            const typeLink = document.createElement('link');
            typeLink.id = typeStylesheetId;
            typeLink.rel = 'stylesheet';
            typeLink.href = `/dist/css/sypher-${type}.css`;
            document.head.appendChild(typeLink);
        }
        elements.forEach(element => {
            element.classList.add(`${theme}-modal`, `${type}-modal`);
        });
    },
    createButton: function (element = document.body, onClick = () => sypher.connect("ethereum"), params = { type: "connect", text: "Connect Wallet", options: { modal: false, theme: "default" } }) {
        const defaultParams = { type: "connect", text: "Connect Wallet", options: { modal: false, theme: "default" } };
        const mergedParams = {
            ...defaultParams,
            ...params,
            options: { ...defaultParams.options, ...params.options },
        };
        const validInput = sypher.validateInput({ element, onClick, ...mergedParams }, {
            element: { type: "object", required: false },
            onClick: { type: "function", required: false },
            type: { type: "string", required: true },
            text: { type: "string", required: true },
            options: { type: "object", required: true },
        }, "InterfaceModule.createButton");
        if (!validInput) {
            return null;
        }
        const { type, text, options: { modal, theme } } = mergedParams;
        const className = `${type}-button`;
        const themeName = `${theme}-button`;
        const buttonId = `${type}-button`;
        const button = document.createElement('button');
        button.id = buttonId;
        button.classList.add(className, themeName);
        button.textContent = text;
        button.onclick = onClick;
        if (modal) {
            console.log("Modal Enabled...");
            // TODO: Create modal flow for viewing wallet details when connected
        }
        element.appendChild(button);
        return button;
    },
    createModal: function (params) {
        const defaultParams = { append: document.body, type: "log", theme: "default" };
        const mergedParams = { ...defaultParams, ...params };
        const validInput = sypher.validateInput({ ...mergedParams }, {
            append: { type: "object", required: true },
            type: { type: "string", required: true },
            theme: { type: "string", required: true }
        }, "InterfaceModule.createModal");
        if (!validInput) {
            return null;
        }
        const { append, type, theme } = mergedParams;
        const types = ["log"];
        const themes = ["default", "light"];
        if (!types.includes(type)) {
            throw new Error(`InterfaceModule.applyTheme: Type '${type}' not found.`);
        }
        if (!themes.includes(theme)) {
            throw new Error(`InterfaceModule.applyTheme: Theme '${theme}' not found.`);
        }
        const modal = document.createElement('div');
        modal.id = `${type}-modal`;
        modal.classList.add(`${theme}-modal`);
        const modalContainer = document.createElement('div');
        modalContainer.id = `${type}-mc`;
        modalContainer.classList.add(`${theme}-mc`);
        const modalToggle = document.createElement('div');
        modalToggle.id = `${type}-mt`;
        modalToggle.classList.add(`${theme}-mt`);
        this.applyTheme([modal, modalContainer, modalToggle], mergedParams);
        append.appendChild(modal);
        modal.appendChild(modalContainer);
        modal.appendChild(modalToggle);
        if (type === "log") {
            sypher.initLogger();
        }
        return modal;
    },
    toggleLoader: function (element, loaderHTML, isEnabled = true, newText = "") {
        const validInput = sypher.validateInput({ element, isEnabled, loaderHTML, newText }, {
            element: { type: "object", required: true },
            isEnabled: { type: "bool", required: false },
            loaderHTML: { type: "string", required: true },
            newText: { type: "string", required: false }
        }, "InterfaceModule.toggleLoader");
        if (!validInput) {
            return;
        }
        if (isEnabled) {
            element.innerHTML = loaderHTML;
        }
        else {
            element.innerHTML = newText;
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
    initCrypto: async function (chain, contractAddress, poolAddress, version, pair = "eth") {
        const validInput = sypher.validateInput({ chain, contractAddress, poolAddress, version, pair }, {
            chain: { type: "string", required: true },
            contractAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
            poolAddress: { type: "string", required: true, regex: ADDRESS_REGEXP },
            version: { type: "string", required: true, enum: LP_VER },
            pair: { type: "string", required: false }
        }, "CryptoModule.initCrypto");
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
            const account = await this.connect(chain);
            if (!account) {
                return null;
            }
            console.log("Getting details for:", { chain, contractAddress, poolAddress, version, pair });
            const tokenDetails = await this.getTokenDetails(chain, contractAddress);
            if (!tokenDetails) {
                return null;
            }
            const { balance, decimals, name, symbol, totalSupply } = tokenDetails;
            let tokenPrice;
            if (version === "V2") {
                const priceV2 = await this.getPriceV2(chain, poolAddress, pair);
                if (!priceV2) {
                    return null;
                }
                tokenPrice = priceV2;
            }
            else if (version === "V3") {
                const priceV3 = await this.getPriceV3(chain, contractAddress, poolAddress, pair);
                if (!priceV3) {
                    return null;
                }
                tokenPrice = priceV3;
            }
            else {
                return null;
            }
            const userValue = this.getUserValue(balance, tokenPrice);
            if (!userValue) {
                return null;
            }
            const cleanedDetails = this.clean({ contractAddress, poolAddress, balance, decimals, name, symbol, totalSupply, tokenPrice, userValue });
            return cleanedDetails;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.initCrypto: ${message}`);
        }
    },
    connect: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.connect");
        if (!validInput) {
            return null;
        }
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        if (this._connected) {
            return this._connected;
        }
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
            return primaryAccount;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.connect: ${message}`);
        }
    },
    switchChain: async function (chain) {
        const validInput = sypher.validateInput({ chain }, { chain: { type: "string", required: true } }, "CryptoModule.switchChain");
        if (!validInput) {
            return;
        }
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
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
        if (this._currentChain === targetChainId) {
            return;
        }
        try {
            const currentChainID = await ethereum.request({ method: 'eth_chainId' });
            if (currentChainID === targetChainId) {
                this._currentChain = targetChainId;
                return;
            }
            console.log(`Switching to ${chain} chain...`);
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
            });
            this._currentChain = targetChainId;
        }
        catch (switchError) {
            console.warn(`CryptoModule.switchChain: Attempting to add chain: ${chain}`);
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [params],
                    });
                    this._currentChain = targetChainId;
                }
                catch (addError) {
                    const addErrorMessage = addError instanceof Error ? addError.message : "An unknown error occurred.";
                    throw new Error(`CryptoModule.switchChain: Unable to switch or add chain "${chain}". Details: ${addErrorMessage}`);
                }
            }
            else {
                const switchErrorMessage = switchError instanceof Error ? switchError.message : "An unknown error occurred.";
                throw new Error(`CryptoModule.switchChain: Failed to switch to chain "${chain}". Details: ${switchErrorMessage}`);
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
                chainName: data.name,
                nativeCurrency: data.nativeCurrency,
                rpcUrls: data.rpc,
                blockExplorerUrls: data.explorers?.map((explorer) => explorer.url) || []
            };
            return { chainlistData: data, params };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getChainData: ${message}`);
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
            const account = await this.connect(chain);
            if (!account) {
                return null;
            }
            const chainlinkAddress = CHAINS[chain].priceFeeds[pair];
            if (!chainlinkAddress) {
                throw new Error(`Chain ${chain} is not supported`);
            }
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(chainlinkAddress, CHAINLINK_ABI, signer);
            const roundData = await contract.latestRoundData();
            const price = ethers.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price on ${chain}: $${price}`);
            return price;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPriceFeed: ${message}`);
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
        const ethereum = this.getProvider();
        if (!ethereum) {
            return null;
        }
        try {
            const account = await this.connect(chain);
            if (!account) {
                return null;
            }
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getTokenDetails: ${message}`);
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
            const account = await this.connect(chain);
            if (!account) {
                return null;
            }
            const chainlinkResult = await this.getPriceFeed(chain, pair);
            if (!chainlinkResult)
                return null;
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
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPriceV2: Error ${message}`);
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
            const account = await this.connect(chain);
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
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPriceV3: ${message}`);
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
            const account = await this.connect(chain);
            if (!account) {
                return null;
            }
            const provider = new ethers.providers.Web3Provider(ethereum);
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
            const poolData = { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity };
            return poolData;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getPoolV3: ${message}`);
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
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            throw new Error(`CryptoModule.getUserValue: ${message}`);
        }
    },
    clean: function (tokenDetails) {
        const validInput = sypher.validateInput({ tokenDetails }, { tokenDetails: { type: "object", required: true } }, "CryptoModule.clean");
        if (!validInput) {
            return null;
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
            tokenPrice: parseFloat(tokenPrice.toString()),
            userValue: (parseFloat(userValue.toString()) / Math.pow(10, decimals)).toFixed(decimals).toString()
        };
        console.log("Token Details:", cleanedDetails);
        return cleanedDetails;
    },
    getProvider: function () {
        if (!("ethereum" in window)) {
            throw new Error("CryptoModule.getProvider: No Ethereum provider found.");
        }
        const ethereum = window.ethereum;
        return ethereum;
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
