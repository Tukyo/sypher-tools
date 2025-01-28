import { BUTTON_TYPES, DISCOVERED_PROVIDERS, MODAL_TYPES, PLACEHOLDER_PROVIDERS, THEMES } from "./constants";
import { TInitParams, TEIP6963, TCleanedDetails } from "./crypto.d";
import { IInterfaceModule, TButtonParams, TConnectModal, TElementParams, TLoaderParams, TLogModal } from "./interface.d";

export const InterfaceModule: IInterfaceModule = {
    initTheme: function (theme = "default") {
        const validInput = sypher.validateInput(
            { theme },
            {
                theme: { type: "string", required: true }
            }, "InterfaceModule.initTheme"
        );
        if (!validInput) { return; }
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
        const validInput = sypher.validateInput(
            { elements, ...params },
            {
                elements: { type: "array", required: true },
                type: { type: "string", required: true },
                theme: { type: "string", required: true }
            }, "InterfaceModule.applyStyle"
        );
        if (!validInput) { return; }

        const type = params.type;

        let theme = params.theme;
        if (theme === "none") { theme = "custom"; }
        if (!this._theme) { this.initTheme(theme); }

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

            const finalOnClick = onClick === defaultParams.onClick
                ? () => sypher.connect(initCrypto.chain !== "none" ? initCrypto.chain : "ethereum")
                : onClick;

            if (modal) {
                console.log("Modal Enabled...");
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
        } else { return null; } //TODO: Throw error
    },
    createModal: async function (params) {
        const defaultParams = { append: document.body, type: "none", theme: "none", initCrypto: {} as TInitParams };
        const mergedParams = { ...defaultParams, ...params };

        const validInput = sypher.validateInput(
            { ...mergedParams },
            {
                append: { type: "object", required: false },
                type: { type: "string", required: true },
                theme: { type: "string", required: false }
            }, "InterfaceModule.createModal"
        );
        if (!validInput) { return null; }

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

            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.container.appendChild(modalObj.head);
            modalObj.head.appendChild(modalObj.title);
            modalObj.head.appendChild(modalObj.toggle);
            modalObj.container.appendChild(modalObj.body);

            // TODO: Create isLogging check - console.log(PLACEHOLDER_PROVIDERS);

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

            // TODO: Create isLogging check - console.log(mergedProviders);

            const account = sypher.getConnected();

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
                                version: initCrypto.version, //TODO: Check how to make this work with non eth pairs
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

            if (account !== null && account !== undefined) {
                modalObj.title.innerHTML = "Account";

                const provider = sypher.getProvider();
                const web3 = new ethers.providers.Web3Provider(provider);
                const signer = web3.getSigner();
                const balance = await signer.getBalance();
                const eth = ethers.utils.formatEther(balance);

                const tokenDetails = sypher.getCleaned() as TCleanedDetails | null;

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

                const accountView: HTMLElement | null = this.createElement(
                    {
                        append: modalObj.body,
                        type: "div",
                        id: 'account-view',
                        children: [
                            { // Header
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
                            { // Body
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
                                                if (accountView) { accountView.style.display = "none"; }

                                                const buttons = document.querySelectorAll('.connect-mi');
                                                if (buttons) { buttons.forEach((button) => { (button as HTMLDivElement).style.display = "flex"; }); }

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
                            {// Disconnect
                                type: "div",
                                classes: ["av-x"],
                                events: {
                                    click: () => {
                                        sypher.disconnect();

                                        if (accountView && accountView.parentNode) {
                                            accountView.parentNode.removeChild(accountView);
                                        }

                                        const buttons = document.querySelectorAll('.connect-mi');
                                        if (buttons) { buttons.forEach((button) => { (button as HTMLDivElement).style.display = "flex"; }); }

                                        const connectButton = document.getElementById('connect-button');
                                        if (connectButton && this._connectText) { connectButton.innerHTML = this._connectText; }

                                        modalObj.title.innerHTML = "Connect Wallet";
                                    }
                                },
                                innerHTML: "Disconnect"
                            }
                        ]
                    }
                );
                if (!accountView) { return null; }
            }
            return modalObj;
        } else { return null; } //TODO: Throw error
    },
    initModal: function (type, theme = "custom") {
        const validInput = sypher.validateInput(
            { type },
            {
                type: { type: "string", required: true },
                theme: { type: "string", required: false }
            }, "InterfaceModule.initModal"
        );
        if (!validInput) { return null; }

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

        if (classes) { classes.forEach((className) => { element.classList.add(className); }); }
        if (attributes) { for (const [key, value] of Object.entries(attributes)) { element.setAttribute(key, value); } }
        if (events) { for (const [key, value] of Object.entries(events)) { element.addEventListener(key, value); } }
        if (innerHTML && innerHTML !== "") { element.innerHTML = innerHTML; }
        if (children) {
            children.forEach((childParams) => {
                const childElement = this.createElement(childParams);
                if (childElement) {
                    element.appendChild(childElement);
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
        const validInput = sypher.validateInput(
            { distance, length },
            {
                distance: { type: "string", required: false },
                length: { type: "string", required: false }
            }, "InterfaceModule.fade"
        );
        if (!validInput) { return; }

        const elements = document.querySelectorAll('[data-fade]') as NodeListOf<HTMLElement>;;
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
    }
};