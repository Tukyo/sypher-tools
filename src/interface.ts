import { IInterfaceModule } from "./interface.d";

export const InterfaceModule: IInterfaceModule = {
    applyTheme: function (elements, params) {
        console.log(elements);
        const validInput = sypher.validateInput(
            { elements, ...params },
            {
                elements: { type: "array", required: true },
                type: { type: "string", required: true },
                theme: { type: "string", required: true }
            }, "InterfaceModule.applyTheme"
        );
        if (!validInput) { return; }
    
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
    createButton: function (
        element = document.body,
        onClick = () => sypher.connect("ethereum"),
        params = { type: "connect", text: "Connect Wallet", options: { modal: false, theme: "default" } }
    ) {
        const defaultParams = { type: "connect", text: "Connect Wallet", options: { modal: false, theme: "default" } };
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
    
        const validInput = sypher.validateInput(
            { ...mergedParams },
            {
                append: { type: "object", required: true },
                type: { type: "string", required: true },
                theme: { type: "string", required: true }
            }, "InterfaceModule.createModal"
        );
        if (!validInput) { return null; }

        const { append, type, theme } = mergedParams;

        const types = ["log"];
        const themes = ["default", "light"];
        if (!types.includes(type)) { throw new Error(`InterfaceModule.applyTheme: Type '${type}' not found.`); }
        if (!themes.includes(theme)) { throw new Error(`InterfaceModule.applyTheme: Theme '${theme}' not found.`); }

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

        if (type === "log") { sypher.initLogger(); }

        return modal;
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