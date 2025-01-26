import { DISCOVERED_PROVIDERS } from "./constants";
import { TProviderDetail } from "./crypto.d";
import { IInterfaceModule, TConnectModal, TLogModal } from "./interface.d";

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

        const typeStylesheetId = `sypher-${type}-style`;
        if (!document.getElementById(typeStylesheetId)) {
            const typeLink = document.createElement('link');
            typeLink.id = typeStylesheetId;
            typeLink.rel = 'stylesheet';
            typeLink.href = `/dist/css/sypher-${type}.css`;
            document.head.appendChild(typeLink);
        };
    },
    createButton: function (
        element = document.body,
        onClick = () => sypher.connect("ethereum"),
        params = { type: "none", text: "Click Me!", icon: "", options: { modal: false, theme: "none", chain: "ethereum" } }
    ) {
        const defaultParams = { type: "none", text: "Click Me!", icon: "", options: { modal: false, theme: "none", chain: "ethereum" } };
        const mergedParams = {
            ...defaultParams,
            ...params,
            options: { ...defaultParams.options, ...params.options },
        };
    
        const validInput = sypher.validateInput(
            { element, onClick, ...mergedParams },
            {
                element: { type: "object", required: false },
                onClick: { type: "function", required: false },
                type: { type: "string", required: true },
                text: { type: "string", required: true },
                options: { type: "object", required: true },
            }, "InterfaceModule.createButton"
        );
        if (!validInput) { return null; }

        const { type, text, icon, options: { modal, theme, chain } } = mergedParams;

        const types = ["none", "custom", "connect", "provider"];
        const themes = ["none", "custom", "default", "light"];
        if (!types.includes(type)) { throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`); }
        if (!themes.includes(theme)) { throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`); }

        let appliedTheme = this._theme || theme;
        if (theme === "none") { appliedTheme = "custom"; }

        let appliedType = type;
        if (type === "none") { appliedType = "custom"; }

        const themeParams = { type, theme: appliedTheme };
        if (!themeParams) { return null; }

        if (appliedType === "connect") {
            const className = `${appliedType}-button`;
            const themeName = `${appliedTheme}-button`;
            const buttonId = `${appliedType}-button`;

            const button: HTMLButtonElement = document.createElement('button');
            button.id = buttonId;
            button.classList.add(className, themeName);
            button.textContent = text;
        
            if (modal) {
                console.log("Modal Enabled...");
                this.createModal({ append: document.body, type: "connect", theme: appliedTheme, chain });
            } else { button.onclick = onClick; }

            this.applyStyle([button], themeParams);

            element.appendChild(button);
            return button
        } else if (appliedType === "provider") {
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

            element.appendChild(modalItem);
            modalItem.appendChild(modalItemIcon);
            modalItem.appendChild(modalItemName);
            return modalItem;
        } else { return null; } //TODO: Throw error
    },
    createModal: function (params) {
        const defaultParams = { append: document.body, type: "none", theme: "none", chain: "none" };
        const mergedParams = { ...defaultParams, ...params };
    
        const validInput = sypher.validateInput(
            { ...mergedParams },
            {
                append: { type: "object", required: true },
                type: { type: "string", required: true },
                theme: { type: "string", required: false },
                chain: { type: "string", required: false }
            }, "InterfaceModule.createModal"
        );
        if (!validInput) { return; }

        const { append, type, theme, chain } = mergedParams;

        const types = ["none", "custom", "log", "connect"];
        const themes = ["none", "custom", "default", "light"];
        if (!types.includes(type)) { throw new Error(`InterfaceModule.createModal: Type '${type}' not found.`); }
        if (!themes.includes(theme)) { throw new Error(`InterfaceModule.createModal: Theme '${theme}' not found.`); }

        if (type === "none" || theme === "none") { return; } //TODO: Enable custom modals

        const modalObj = this.initModal(type, theme);
        if (!modalObj) { return; }

        if (modalObj.type  === "log") { 
            this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle], mergedParams);

            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.parent.appendChild(modalObj.toggle);

            sypher.initLogger();
        } else if (modalObj.type  === "connect") {
            this.applyStyle([modalObj.parent, modalObj.container, modalObj.toggle, modalObj.head, modalObj.title, modalObj.body], mergedParams);

            append.appendChild(modalObj.parent);
            modalObj.parent.appendChild(modalObj.container);
            modalObj.container.appendChild(modalObj.head);
            modalObj.head.appendChild(modalObj.title);
            modalObj.head.appendChild(modalObj.toggle);
            modalObj.container.appendChild(modalObj.body);

            DISCOVERED_PROVIDERS.forEach((providerDetail: TProviderDetail) => {
                const { name, icon } = providerDetail.info;

                this.createButton(
                    modalObj.body,
                    () => sypher.connect(chain, providerDetail),
                    {
                        type: "provider",
                        text: name,
                        icon: icon,
                        options: { modal: false, theme: "none", chain: chain }
                    }
                );
            });
        } else { return; } //TODO: Throw error
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
    toggleLoader: function (element, loaderHTML, isEnabled = true, newText = "") {
        const validInput = sypher.validateInput(
                { element, isEnabled, loaderHTML, newText },
                {
                    element: { type: "object", required: true },
                    isEnabled: { type: "bool", required: false },
                    loaderHTML: { type: "string", required: true },
                    newText: { type: "string", required: false }
                }, "InterfaceModule.toggleLoader"
            );
        if (!validInput) { return; }

        if (isEnabled) {
            element.innerHTML = loaderHTML;
        } else {
            element.innerHTML = newText;
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

        const elements = document.querySelectorAll('[data-fade]')  as NodeListOf<HTMLElement>;;
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