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