const HelperModule = {
    /**
     * Validate the inputs based on the rules provided.
     * 
     * @example validateInput({ name: "John Doe" }, { name: { required: true, type: "string" } });
     * 
     * @param {object} inputs - The inputs to validate
     * @param {object} rules - The rules to validate the inputs against
     * @param {string} context - The context of the validation
     * @returns {boolean} The validation status
     * 
     */
    validateInput: function (inputs, rules, context = "validateInput") {
        // 1: Validate the inputs for this method
        if (typeof inputs !== 'object') {
            throw new TypeError(`${context}: "inputs" must be a valid object.`);
        }
        if (typeof rules !== 'object') {
            throw new TypeError(`${context}: "rules" must be a valid object.`);
        }
        if (typeof context !== 'string') {
            throw new TypeError(`${context}: "context" must be a valid string.`);
        }

        // 2: Validate each input based on the rules
        Object.entries(rules).forEach(([key, rule]) => {
            const value = inputs[key];

            if (rule.required && (value === undefined || value === null)) { // No value provided for required field
                throw new Error(`${context}: "${key}" is required.`);
            }
            if (!rule.required && (value === undefined || value === null)) return; // Skip optional fields

            if (rule.type && typeof value !== rule.type) { // Type validation
                throw new TypeError(`${context}: Validation failed: "${key}" must be of type "${rule.type}", but received type "${typeof value}".`);
            }

            if (rule.type === "bool" && typeof value !== "boolean") { // Bool validation
                throw new TypeError(`${context}: Validation failed: "${key}" must be of type "boolean", but received type "${typeof value}".`);
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

        // 3: Return the validation status
        return true;
    },
    /**
     * Validate the chain for methods that require support.
     * 
     * @param {string} chain - The chain to validate
     * @returns {{ chainData: object, chainId: string }} The chain data and chainId for the specified chain
     * 
     * @throws {Error} If the chain is unsupported or has missing data
     */
    validateChain: function (chain) {
        const validInput = this.validateInput({ chain }, { chain: { required: true, type: "string" } }, "CryptoModule.validateChain");
        if (!validInput) { return; }

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
    truncate: function (string, startLength = 6, endLength = 4) {
        const validInput = sypher.validateInput(
                { string, startLength, endLength },
                {
                    string: { type: "string", required: true },
                    startLength: { type: "number", required: false },
                    endLength: { type: "number", required: false }
                }, "TruncationModule.truncate"
            );
        if (!validInput) { return; }

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
    truncateBalance: function (balance, decimals = 2, maxLength = 8) {
        const validInput = sypher.validateInput(
                { balance, decimals, maxLength },
                {
                    balance: { type: "number", required: true },
                    decimals: { type: "number", required: false },
                    maxLength: { type: "number", required: false }
                }, "TruncationModule.truncateBalance"
            );
        if (!validInput) { return; }

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
const WindowModule = {
    /**
     * Get the current window dimensions.
     * 
     * @example document.addEventListener("visibilitychange", pageFocus);
     * 
     * @returns {boolean} Whether the page is focused.
     * 
     */
    pageFocus: function () {
        const pageFocused = document.visibilityState === "visible";
        if (pageFocused) console.log(`Page Focused...`); else console.log(`Page Unfocused...`);
        return pageFocused;
    }
}