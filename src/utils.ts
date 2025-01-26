import { CHAINS } from "./constants";
import { IHelperModule, ILogModule, ITruncationModule, IWindowModule } from "./utils.d";

export const HelperModule: IHelperModule = {
    validateInput: function (inputs: { [key: string]: any }, rules, context = "validateInput") {
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
            if (!rule.required && (value === undefined || value === null)) return; // Skip optional fields
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
            } else if (rule.type && typeof value !== rule.type) { // Type validation for non-arrays
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
        if (!validInput) { return null; }

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
}
export const LogModule: ILogModule = { // TODO: Add error throwing
    initLogger: function () {
        const logModal = document.querySelector("#log-modal");
        const logContainer = document.querySelector("#log-mc");
        const logToggle = document.querySelector("#log-mt");
        const logShowHTML = `<i class="fa-solid fa-caret-right"></i>`;  // TODO: Replace FontAwesome with custom SVG 
        const logHideHTML = `<i class="fa-solid fa-caret-left"></i>`;

        const originalLog = console.log;
        const originalError = console.error;
        console.log = function (...args) { originalLog.apply(console, args); appendLog(args); };
        console.error = function (...args) { originalError.apply(console, args); appendLog(args); };
        window.onerror = function (message, source, lineno, colno, error) { appendLog([`Error: ${message} at ${source}:${lineno}:${colno}`, error]); };
        window.addEventListener("unhandledrejection", function (event) { appendLog(["Unhandled Promise Rejection:", event.reason]); });
    
        function appendLog(args: any[]) {
            const logItem = document.createElement("div");
            logItem.className = "log-item";
            args.forEach(arg => {
                if (Array.isArray(arg)) {
                    arg.forEach(item => handleSingleArgument(item, logItem));
                } else {
                    handleSingleArgument(arg, logItem);
                }
            });
        
            if (logContainer) {
                logContainer.appendChild(logItem);
                logContainer.scrollTop = logContainer.scrollHeight;
            }
        }
        function handleSingleArgument(arg: any, logItem: HTMLDivElement) {
            const logDiv = document.createElement("div");
        
            if (arg instanceof Error) {
                logItem.classList.add("log-error");
                logDiv.className = "log-object error-object";
                logDiv.innerHTML = `<pre>${syntaxHighlight(safeStringify({
                    message: arg.message,
                    name: arg.name,
                    stack: arg.stack
                }, 2))}</pre>`;
        
            } else if (arg instanceof HTMLElement) {
                logDiv.className = "log-dom";
                logDiv.innerHTML = `<pre>&lt;${arg.tagName.toLowerCase()} id="${arg.id}" class="${arg.className}"&gt;</pre>`;
        
            } else if (typeof arg === "object" && arg !== null) {
                logDiv.className = "log-object";
                try {
                    logDiv.innerHTML = `<pre>${syntaxHighlight(safeStringify(arg, 2))}</pre>`;
                } catch (e: any) {
                    logDiv.textContent = `[Unserializable object: ${e.message}]`;
                }
        
            } else if (typeof arg === "string") {
                logDiv.className = isAddress(arg) ? "log-address" : "log-string";
                logDiv.textContent = arg;
        
            } else if (typeof arg === "number") {
                logDiv.className = "log-number";
                logDiv.textContent = arg.toString();
        
            } else {
                logDiv.className = "log-unknown";
                logDiv.textContent = String(arg);
            }
            logItem.appendChild(logDiv);
        }
        function safeStringify(obj: { message: string; name: string; stack: string | undefined; }, space = 2) {
            const seen = new WeakSet();
            return JSON.stringify(
                obj,
                (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (seen.has(value)) {
                            return "[Circular]";
                        }
                        seen.add(value);
                    }
                    return value;
                },
                space
            );
        }
        function syntaxHighlight(json: string) {
            return json.replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
                match => {
                    let cls = "log-number";
        
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = "log-key";
                        } else if (isAddress(match.replace(/"/g, ""))) {
                            cls = "log-address";
                        } else {
                            cls = "log-string";
                        }
                    } else if (/true|false/.test(match)) {
                        cls = "log-boolean";
                    } else if (/null/.test(match)) {
                        cls = "log-null";
                    }
                    return `<span class="${cls}">${match}</span>`;
                }
            );
        }
        function isAddress(value: string) { return /^0x[a-fA-F0-9]{40}$/.test(value); }
        if (logToggle) { logToggle.addEventListener("click", toggleLogContainer); }
        function toggleLogContainer() {
            if (!logModal || !logContainer || !logToggle) { return; }

            if (logContainer.classList.contains("lc-hide")) {
                logContainer.classList.remove("lc-hide");
                logContainer.classList.add("lc-show");
                logToggle.innerHTML = logHideHTML;
                logModal.classList.remove("lm-hide");
                logModal.classList.add("lm-show");
            } else {
                logContainer.classList.remove("lc-show");
                logContainer.classList.add("lc-hide");
                logToggle.innerHTML = logShowHTML;
                logModal.classList.remove("lm-show");
                logModal.classList.add("lm-hide");
            }
        }
        toggleLogContainer();
    }
}
export const TruncationModule: ITruncationModule = {
    truncate: function (string, startLength = 6, endLength = 4) {
        const validInput = sypher.validateInput(
                { string, startLength, endLength },
                {
                    string: { type: "string", required: true },
                    startLength: { type: "number", required: false },
                    endLength: { type: "number", required: false }
                }, "TruncationModule.truncate"
            );
        if (!validInput) { return null; }

        if (string.length <= startLength + endLength + 3) { return string; }
        return `${string.slice(0, startLength)}...${string.slice(-endLength)}`;
    },
    truncateBalance: function (balance, decimals = 2, maxLength = 8) {
        const validInput = sypher.validateInput(
                { balance, decimals, maxLength },
                {
                    balance: { type: "number", required: true },
                    decimals: { type: "number", required: false },
                    maxLength: { type: "number", required: false }
                }, "TruncationModule.truncateBalance"
            );
        if (!validInput) { return null; }

        const num = parseFloat(balance.toString());

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
export const WindowModule: IWindowModule = {
    pageFocus: function () {
        const pageFocused = document.visibilityState === "visible";
        if (pageFocused) console.log(`Page Focused...`); else console.log(`Page Unfocused...`);
        return pageFocused;
    }
}