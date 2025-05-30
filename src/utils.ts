import { IHelperModule, ILogModule, ITruncationModule, IWindowModule, TScreenDetails, TUserEnvironment } from "./utils.d";

export const HelperModule: IHelperModule = {
    validateChain: async function (chain: string): Promise<string | null> {
        if (!chain) { 
            throw new Error("CryptoModule.validateChain: Please provide a chain to validate."); 
        }
    
        try {
            sypher.log("Validating chain...");

            const response = await fetch("https://raw.githubusercontent.com/Tukyo/sypher-tools/refs/heads/main/config/chains.min.json");
            if (!response.ok) {
                throw new Error("CryptoModule.validateChain: Failed to fetch chain data.");
            }
    
            const chainMap = await response.json();
            const chainData = chainMap[chain.toLowerCase()];
    
            if (!chainData || !chainData.id) {
                throw new Error(`CryptoModule.validateChain: Chain "${chain}" is not supported. Supported Chains: https://github.com/Tukyo/sypher-tools/blob/main/config/chains.json`);
            }
    
            return `0x${chainData.id.toString(16)}`;
        } catch (error: unknown) {
            throw new Error(`CryptoModule.validateChain: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        }
    }    
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
        
            const userTimezone = sypher.cache()?.user?.environment?.timezone || 'UTC';
            const timestamp = new Date().toLocaleString('en-US', { timeZone: userTimezone });
        
            // Remove `%c` and associated inline CSS styles
            const filteredArgs = args.filter((arg, index, arr) => {
                return !(
                    typeof arg === "string" &&
                    (arg.startsWith("%c") || (index > 0 && typeof arr[index - 1] === "string" && arr[index - 1].startsWith("%c")))
                );
            });
        
            // Prepend the timestamp to the log
            filteredArgs.unshift(`[${timestamp}]`);
        
            filteredArgs.forEach(arg => {
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
        
            if (typeof arg === "string" && arg.match(/^\[\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} (AM|PM)\]$/)) {
                logDiv.className = "log-timestamp";
                logDiv.textContent = arg;
            } else if (arg instanceof Error) {
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
                    } else if (/true/.test(match)) {
                        cls = "log-bool-true";
                    } else if (/false/.test(match)) {
                        cls = "log-bool-false";
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
    },
    log: function (...args: any[]) {
        if (!sypher.prefs().dev || !sypher.prefs().dev.logs || !sypher.prefs().dev.logs.enabled) return;
    
        const userTimezone = sypher.cache()?.user?.environment?.timezone || 'UTC';
        const timestamp = new Date().toLocaleString('en-US', { timeZone: userTimezone });
    
        // If the first argument is a styled message (starts with %c)
        if (typeof args[0] === "string" && args[0].startsWith("%c")) {
            const [firstArg, ...restArgs] = args;
            console.log(`%c[${timestamp}] %c${firstArg.slice(2)}`, "color: gray; font-weight: bold;", ...restArgs);
        } else {
            console.log(`%c[${timestamp}]`, "color: gray; font-weight: bold;", ...args);
        }
    }
}
export const TruncationModule: ITruncationModule = {
    truncate: function (string, startLength = 6, endLength = 4) {
        if (!string) { throw new Error("TruncationModule.truncate: Please provide a string to truncate."); }

        if (string.length <= startLength + endLength + 3) { return string; }
        return `${string.slice(0, startLength)}...${string.slice(-endLength)}`;
    },
    truncateBalance: function (balance, decimals = 2, maxLength = 8) {
        if (balance === null || balance === undefined) { 
            throw new Error("TruncationModule.truncateBalance: Please provide a number to truncate."); 
        }

        const num = parseFloat(balance.toString());

        if (num >= 1e15) return `${(num / 1e15).toFixed(decimals)}Q`;
        if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;

        const formatted = num.toFixed(decimals);

        const [intPart, decPart = ""] = formatted.split(".");
        if (intPart.length >= maxLength) { return intPart; }

        const remainingLength = maxLength - intPart.length - 1;
        const truncatedDecimal = decPart.slice(0, Math.max(remainingLength, 0));

        return truncatedDecimal ? `${intPart}.${truncatedDecimal}` : intPart;
    }
}
export const WindowModule: IWindowModule = {
    pageFocus: function () {
        const pageFocused = document.visibilityState === "visible";
        if (pageFocused) sypher.log(`Page Focused...`); else sypher.log(`Page Unfocused...`);
        return pageFocused;
    },
    userEnvironment: function() {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS/i.test(userAgent);
        const isTablet = /iPad|Tablet/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        const screenDetails: TScreenDetails = {
            width: window.screen.width,
            height: window.screen.height,
            availableWidth: window.screen.availWidth,
            availableHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
        };
        const browserDetails = (() => {
            const ua = userAgent.toLowerCase();
            if (/chrome|crios|crmo/i.test(ua) && !/edge|opr\//i.test(ua)) return 'Chrome';
            if (/firefox|fxios/i.test(ua)) return 'Firefox';
            if (/safari/i.test(ua) && !/chrome|crios|crmo|opr\//i.test(ua)) return 'Safari';
            if (/opr\//i.test(ua)) return 'Opera';
            if (/edg/i.test(ua)) return 'Edge';
            if (/msie|trident/i.test(ua)) return 'Internet Explorer';
            return 'Unknown';
        })();
        const osDetails = (() => {
            if (/windows phone/i.test(userAgent)) return 'Windows Phone';
            if (/win/i.test(userAgent)) return 'Windows';
            if (/android/i.test(userAgent)) return 'Android';
            if (/mac/i.test(userAgent)) return 'MacOS';
            if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
            if (/linux/i.test(userAgent)) return 'Linux';
            return 'Unknown';
        })();

        const environment: TUserEnvironment = {
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

        sypher.log(environment);
        return environment;
    }
}