import { BUTTON_TYPES, DISCOVERED_PROVIDERS, MODAL_TYPES, PLACEHOLDER_PROVIDERS, THEMES } from "./constants";
import { TInitParams, TEIP6963, TCleanedDetails, TChainParams } from "./crypto.d";
import { IInterfaceModule, TButtonParams, TConnectModal, TElementParams, TLoaderParams, TLogModal } from "./interface.d";
import { TPAccountView } from "./prefabs.d";
import { PAccountView, PBranding } from "./prefabs";

export const InterfaceModule: IInterfaceModule = {
    initTheme: function (theme = "default") {
        if (typeof theme !== "string") { throw new Error(`InterfaceModule.initTheme: Theme must be a string.`); }
        if (this._theme) { return; }

        if (theme === "none") { theme = "custom"; }

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
        if (!elements || elements.length === 0) { throw new Error(`InterfaceModule.applyStyle: Elements are required.`); }
        if (!params || typeof params !== "object") { throw new Error(`InterfaceModule.applyStyle: Params object is required.`); }

        const type = params.type;

        let theme = params.theme;
        if (theme === "none") { theme = "custom"; }
        if (!this._theme) { this.initTheme(theme); }

        elements.forEach((element) => { element.classList.add(`sypher`); });

        const typeStylesheetId = `sypher-${type}`;
        if (!document.getElementById(typeStylesheetId)) {
            const typeLink = document.createElement('link');
            typeLink.id = typeStylesheetId;
            typeLink.rel = 'stylesheet';
            typeLink.href = `/dist/css/sypher-${type}.css`;
            document.head.appendChild(typeLink);
        };
    },
    createButton: function (params: TButtonParams) {
        const defaultParams = {
            type: "connect",
            text: "Connect Wallet",
            icon: "",
            modal: false,
            theme: "none",
            append: document.body,
            onClick: () => sypher.connect("ethereum"),
            initCrypto: {} as TInitParams
        }
        const mergedParams = { ...defaultParams, ...params };
        const { type, text, icon, modal, theme, append, onClick, initCrypto } = mergedParams;

        if (!BUTTON_TYPES.includes(type)) { throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`); }
        if (!THEMES.includes(theme)) { throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`); }

        let appliedTheme = this._theme || theme;
        if (theme === "none") { appliedTheme = "custom"; }

        let appliedType = type;
        if (type === "none") { appliedType = "custom"; }

        const themeParams = { type, theme: appliedTheme };
        if (!themeParams) { return null; }

        if (appliedType === "connect") {
            if (initCrypto.chain === "none") { throw new Error(`InterfaceModule.createButton: Chain is required for type 'connect'.`); }

            const className = `${appliedType}-button`;
            const themeName = `${appliedTheme}-button`;
            const buttonId = `${appliedType}-button`;

            let button = document.getElementById(buttonId) as HTMLButtonElement;

            if (!button) {
                button = document.createElement('button') as HTMLButtonElement;
                button.id = buttonId;
                append.appendChild(button);
            }

            button.classList.add(className, themeName);
            button.textContent = text;
            this._connectText = text;

            window.addEventListener('sypher:ens', (e) => {
                const ens = (e as CustomEvent).detail;
                button.textContent = ens;
            });

            const finalOnClick = onClick === defaultParams.onClick
                ? () => sypher.connect(initCrypto.chain !== "none" ? initCrypto.chain : "ethereum")
                : onClick;

            if (modal) {
                sypher.log("Modal Enabled...");
                button.onclick = () => this.createModal({ append: document.body, type: "connect", theme: appliedTheme, initCrypto });
                sypher.initProviderSearch();
            } else { button.onclick = finalOnClick; }

            this.applyStyle([button], themeParams);

            return button
        } else if (appliedType === "provider") {
            if (initCrypto.chain === "none") { throw new Error(`InterfaceModule.createButton: Chain is required for type 'provider'.`); }

            const modalItem: HTMLDivElement = document.createElement('div');
            modalItem.id = text.toLowerCase().replace(/\s+/g, '-');
            modalItem.classList.add('connect-mi');

            modalItem.addEventListener('click', onClick);

            const modalIconContainer = document.createElement('div');
            modalIconContainer.classList.add('connect-mic');

            const modalItemIcon = document.createElement('img');
            modalItemIcon.classList.add('connect-mim');
            modalItemIcon.src = icon;

            const modalItemName = document.createElement('span');
            modalItemName.classList.add('connect-min');
            modalItemName.innerText = text;

            this.applyStyle([modalItem, modalItemIcon, modalItemName], themeParams);

            append.appendChild(modalItem);
            modalItem.appendChild(modalIconContainer);
            modalIconContainer.appendChild(modalItemIcon);
            modalItem.appendChild(modalItemName);
            return modalItem;
        } else { return null; } //TODO: Throw error
    },
    createModal: async function (params) {
        const defaultParams = { append: document.body, type: "none", theme: "none", initCrypto: {} as TInitParams };
        const mergedParams = { ...defaultParams, ...params };
        const { append, type, theme, initCrypto } = mergedParams;

        if (!MODAL_TYPES.includes(type)) { throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`); }
        if (!THEMES.includes(theme)) { throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`); }

        let appliedTheme = this._theme || theme;
        if (theme === "none") { appliedTheme = "custom"; }

        if (type === "none") { return null; } //TODO: Enable custom modals

        const modalObj = this.initModal(type, appliedTheme);
        if (!modalObj) { return null; }

        if (modalObj.type === "log") {
            this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle], mergedParams);

            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.parent.appendChild(modalObj.toggle);

            sypher.initLogger();
            return modalObj;
        } else if (modalObj.type === "connect") {
            this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle, modalObj.head, modalObj.title, modalObj.body], mergedParams);

            modalObj.parent.addEventListener('click', (e: MouseEvent) => {
                if (e.target === modalObj.parent) { modalObj.parent.remove(); }
            });

            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.container.appendChild(modalObj.head);
            modalObj.head.appendChild(modalObj.title);
            modalObj.head.appendChild(modalObj.toggle);
            modalObj.container.appendChild(modalObj.body);

            sypher.currentProviderView(modalObj);

            const account = sypher.getConnected();
            
            const mergedProviders: TEIP6963[] = [
                ...PLACEHOLDER_PROVIDERS.map((placeholder) => {
                    const match = DISCOVERED_PROVIDERS.find(
                        (discovered) => discovered.info.name === placeholder.info.name
                    );
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
                ...DISCOVERED_PROVIDERS.filter(
                    (discovered) =>
                        !PLACEHOLDER_PROVIDERS.some(
                            (placeholder) => placeholder.info.name === discovered.info.name
                        )
                ),
            ];

            sypher.log("[EIP-6963] Providers:", mergedProviders);

            mergedProviders.forEach((providerDetail: TEIP6963) => {
                const { name, icon } = providerDetail.info;

                const onClick = providerDetail.info.onboard?.bool
                    ? () => { sypher.onboard(providerDetail); }
                    : () => {
                        if (initCrypto.chain !== "none") {
                            sypher.initCrypto({
                                chain: initCrypto.chain,
                                contractAddress: initCrypto.contractAddress,
                                poolAddress: initCrypto.poolAddress,
                                pairAddress: initCrypto.pairAddress,
                                version: initCrypto.version,
                                detail: providerDetail,
                                icon: initCrypto.icon
                            });
                        } else { sypher.connect(initCrypto.chain, providerDetail); }
                    }

                const button: HTMLDivElement | HTMLButtonElement | null = this.createButton({
                    append: modalObj.body,
                    type: "provider",
                    text: name,
                    icon: icon,
                    modal: false,
                    theme: appliedTheme,
                    onClick: onClick,
                    initCrypto: initCrypto
                });

                if (button !== null) { if (account !== null && account !== undefined) { button.style.display = "none"; } }
            });

            if (account !== null && account !== undefined) { sypher.accountView(account, modalObj, mergedProviders); }

            return modalObj;
        } else { return null; } //TODO: Throw error
    },
    initModal: function (type, theme = "custom") {
        if (!type || typeof type !== "string") { throw new Error(`InterfaceModule.initModal: Type is required.`); }
        if (!MODAL_TYPES.includes(type)) { throw new Error(`InterfaceModule.initModal: Type '${type}' not found.`); }

        if (type === "none" || type === "custom") { return null; } //TODO: Enable custom modals

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

            const modalObj: TLogModal = {
                type: type,
                parent: modal,
                container: modalContainer,
                toggle: modalToggle
            };
            return modalObj;
        } else if (type === "connect") {
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
            modalClose.addEventListener('click', () => { connectModal.remove() }); // TODO: Might need to change this

            const modalTitle = document.createElement('h2');
            modalTitle.id = `${type}-mt`;
            modalTitle.classList.add(`${theme}-mt`);
            modalTitle.innerText = "Connect Wallet";

            const modalBody = document.createElement('div');
            modalBody.id = `${type}-mb`;
            modalBody.classList.add(`${theme}-mb`);

            const modalObj: TConnectModal = {
                type: type,
                parent: connectModal,
                container: modalContainer,
                toggle: modalClose,
                head: modalHeader,
                title: modalTitle,
                body: modalBody
            }
            return modalObj;
        } else { return null; }
    },
    createElement: function (params: TElementParams): HTMLElement | null {
        const defaultParams: TElementParams = {
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

        if (theme) { if (!THEMES.includes(theme)) { throw new Error(`InterfaceModule.createElement: Theme '${theme}' not found.`); } }

        let appliedTheme = this._theme || theme;
        if (theme === "none") { appliedTheme = "custom"; }

        const element = document.createElement(type);
        if (id && id !== "") { element.id = id; }
        element.classList.add(`sypher-${appliedTheme}-element`);

        element.classList.add('sypher');

        if (classes) { classes.forEach((className) => { element.classList.add(className); }); }
        if (attributes) { for (const [key, value] of Object.entries(attributes)) { element.setAttribute(key, value); } }
        if (events) { for (const [key, value] of Object.entries(events)) { element.addEventListener(key, value); } }
        if (innerHTML && innerHTML !== "") { element.innerHTML = innerHTML; }
        if (children) {
            children.forEach((childParams) => {
                const childElement = this.createElement(childParams);
                if (childElement) {
                    element.appendChild(childElement);
                    childElement.classList.add('sypher');
                }
            });
        }

        if (append) { append.appendChild(element); }
        return element;
    },
    toggleLoader: function (params: TLoaderParams) {
        const defaultParams = {
            element: document.body,
            isEnabled: true,
            newText: "",
            loaderHTML: `<div class="loader"></div>`,
            replace: true
        }
        const mergedParams = { ...defaultParams, ...params };

        const { element, isEnabled, newText, loaderHTML, replace } = mergedParams;

        if (isEnabled) {
            if (replace) { element.innerHTML = loaderHTML; }
            else if (!element.querySelector('.loader')) {
                const loader = document.createElement('div');
                loader.classList.add('loader');
                element.appendChild(loader);
            }
        } else {
            if (newText === "sypher.revert") {
                const loader = element.querySelector('.loader');
                if (loader) { loader.remove(); }
                return;
            }
            else { element.innerHTML = newText; }
        }
    },
    parallax: function () {
        const parallaxElements = document.querySelectorAll('[data-speed]') as NodeListOf<HTMLElement>;
        if (parallaxElements.length === 0) {
            console.warn(`InterfaceModule.parallax: Parallax enabled, but no elements found with the [data-speed] attribute.`);
            return;
        }

        sypher.log("Parallax enabled on ", parallaxElements.length, " elements.");

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
        if (typeof distance !== "string" || typeof length !== "string") { throw new Error(`InterfaceModule.fade: Params must be strings.`); }

        const elements = document.querySelectorAll('[data-fade]') as NodeListOf<HTMLElement>;;
        if (elements.length === 0) {
            console.warn(`InterfaceModule.fade: Fade enabled, but no elements found with the [data-fade] attribute.`);
            return;
        }

        sypher.log("Fade enabled on ", elements.length, " elements.");

        elements.forEach(el => {
            el.style.opacity = "0";
            el.style.transform = `translateY(${distance})`;
            el.style.transition = `opacity ${length} ease-out, transform ${length} ease-out`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target as HTMLElement;
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    el.style.opacity = "1";
                    el.style.transform = 'translateY(0)';
                } else {
                    el.style.opacity = "0";
                    el.style.transform = `translateY(${distance})`;
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    },
    getUI: function () {
        return {
            theme: this._theme || '',
            connectText: this._connectText || ''
        }
    }
};

export const ViewsModule = {
    brandingView: function (modalObj: TConnectModal) {
        const brandingConfig = PBranding({ modalObj });
        const branding: HTMLElement | null = sypher.createElement(brandingConfig);
        if (!branding) { return null; }
    },
    accountView: function (account: string, modalObj: TConnectModal, mergedProviders: TEIP6963[]) {
        modalObj.title.innerHTML = "Account";
        modalObj.body.style.padding = "0px";

        const tokenDetails = sypher.getCleaned() as TCleanedDetails | null;
        const chainDetails = sypher.getChain() as TChainParams | null;
        
        const {
            user: { ens = undefined, ethBalance = 0, tokenBalance: userBalance = 0, value: userValue = "" } = {},
            token: { address: address = "", icon: tokenIcon = "", symbol: tokenSymbol = "", price: tokenPrice = 0, decimals: tokenDecimals = 0 } = {}
        } = tokenDetails || {};
        
        const {
            name: chainName = "",
            icon = [{ url: "" }], 
            nativeCurrency: { symbol: nativeCurrencySymbol = "", decimals: nativeCurrencyDecimals = 0 } = {},
            explorers = [{ name: "", url: "", icon: "" }]
        } = chainDetails || {};
        
        const params: TPAccountView = {
            sypher,
            modalObj,
            mergedProviders,
            user: {
                ens,
                account,
                ethBalance
            },
            token: {
                tokenDetailClass: tokenDetails ? "av-b-c" : "av-b-c-hide",
                showTokenDetails: !!tokenDetails,
                address,
                icon: tokenIcon,
                tokenPrice,
                tokenDecimals,
                userBalance,
                tokenSymbol,
                userValue
            },
            chain: {
                name: chainName,
                icon,
                nativeCurrency: {
                    symbol: nativeCurrencySymbol,
                    decimals: nativeCurrencyDecimals
                },
                explorers
            }
        };
        
        const accountViewConfig = PAccountView(params);                

        const accountView: HTMLElement | null = sypher.createElement(accountViewConfig);
        if (!accountView) { return null; }
    },
    currentProviderView: function (modalObj: TConnectModal) {
        const currentProviderContainer = document.createElement('div');
        currentProviderContainer.id = "current-provider-container";
        
        const currentProviderInfoContainer = document.createElement('div');
        currentProviderInfoContainer.id = "current-provider-info-container";

        const currentProviderIconContainer = document.createElement('div');
        currentProviderIconContainer.id = "current-provider-icon-container";

        const currentProviderIcon = document.createElement('img');
        currentProviderIcon.id = "current-provider-icon";

        const currentProviderName = document.createElement('span');
        currentProviderName.id = "current-provider-name";

        const backButton = document.createElement('div');
        backButton.id = "sypher-back";

        const backButtonIcon = document.createElement('img');
        backButtonIcon.id = "sypher-back-icon";
        backButtonIcon.src = "https://raw.githubusercontent.com/leungwensen/svg-icon/8b84d725b0d2be8f5d87cac7f2c386682ce43563/dist/svg/zero/arrow-left-l.svg"

        modalObj.body.appendChild(currentProviderContainer);
        currentProviderContainer.appendChild(backButton);
        backButton.appendChild(backButtonIcon);
        currentProviderContainer.appendChild(currentProviderInfoContainer);
        currentProviderInfoContainer.appendChild(currentProviderName);
        currentProviderInfoContainer.appendChild(currentProviderIconContainer);
        currentProviderIconContainer.appendChild(currentProviderIcon);

        currentProviderContainer.style.display = "none";
    }
};