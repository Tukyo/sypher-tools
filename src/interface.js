const InterfaceModule = {
    /**
     * Creates a button to connect the wallet.
     * 
     * @example createButton(element, async () => await sypher.connect("base"), { text: "Connect Now!", modal: true });
     * 
     * @param {HTMLElement} element - The target HTML element where the button will be created [Default: document.body]
     * @param {function} onClick - The function to call when the button is clicked [Default: sypher.connect("ethereum")]
     * @param {object} params - The parameters to customize the button [Default: { text: "Connect Wallet", modal: false }]
     * 
     */
    createButton: function (
        element = document.body,
        onClick = () => sypher.connect("ethereum"),
        params = { text: "Connect Wallet", className: "connect-button", modal: false }
    ) {
        const defaultParams = { text: "Connect Wallet", className: "connect-button", modal: false };
        const mergedParams = { ...defaultParams, ...params };
    
        const validInput = sypher.validateInput(
            { element, onClick, ...mergedParams },
            {
                element: { type: "object", required: false },
                onClick: { type: "function", required: false },
                text: { type: "string", required: true },
                className: { type: "string", required: true },
                modal: { type: "boolean", required: true }
            }, "InterfaceModule.createButton"
        );
    
        if (!validInput) { return; }
    
        const { text, className, modal } = mergedParams;
    
        const button = document.createElement('button');
        button.classList.add(className);
        button.textContent = text;
        button.onclick = onClick; 
    
        if (modal) {
            console.log("Modal Enabled...");
            // TODO: Create modal flow for viewing wallet details when connected
        }
    
        element.appendChild(button);
        return button;
    },    
    /**
     * Toggles the loader on a given element by updating its inner HTML.
     * 
     * @example toggleLoader(elementVariable, true, `<div class="loader"></div>`) // Show loader
     * @example toggleLoader(elementVariable, false, "", "New Text") // No loader and replacement text
     * 
     * @param {HTMLElement} element - The target HTML element where the loader or text will be shown
     * @param {string} loaderHTML - The HTML content to use for the loader. Example: `<div class="loader"></div>`
     * @param {boolean} [isEnabled=true] - Whether to show the loader (true) or the new text (false)
     * @param {string} [newText=""] - The new text to display when the loader is disabled
     * 
     * CSS Loaders Resource: [Link](https://css-loaders.com/)
     **/
    toggleLoader: function (element, isEnabled = true, loaderHTML, newText = "") {
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
    /**
     * Applies parallax effect to elements based on the [data-speed] attribute.
     * 
     * @example 
     * // HTML
     * <div data-speed="0.5"></div>
     * // JS
     * window.addEventListener('load', () => { sypher.parallax(); });
     * 
     * @param {HTMLElement} element - The target HTML element where the parallax effect will be applied
     * 
     */
    parallax: function () {
        const parallaxElements = document.querySelectorAll('[data-speed]');
        if (parallaxElements.length === 0) {
            console.warn(`InterfaceModule.parallax: Parallax enabled, but no elements found with the [data-speed] attribute.`);
            return;
        }

        function applyParallax() {
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.5;
                const offset = window.scrollY * speed;
                element.style.transform = `translateY(${-offset}px)`;
            });
        }
        function onScroll() { requestAnimationFrame(applyParallax); }
        window.addEventListener('scroll', onScroll);
        applyParallax();
    },
    /**
     * Fades in elements when they are in the viewport.
     * 
     * @example
     * // HTML
     * <div data-fade></div>
     * // JS
     * document.addEventListener('DOMContentLoaded', function () { sypher.fade('30px', '0.25s'); });
     * // ---> This will fade in the element over 0.25 seconds while moving it 30px upwards
     * 
     * @param {string} [distance] - The distance to move the element when fading in [Default: '20px']
     * @param {string} [length] - The duration of the fade effect [Default: '0.5s']
     * 
     */
    fade: function (distance = '20px', length = '0.5s') {
        const validInput = sypher.validateInput(
                { distance, length },
                {
                    distance: { type: "string", required: false },
                    length: { type: "string", required: false }
                }, "InterfaceModule.fade"
            );
        if (!validInput) { return; }

        const elements = document.querySelectorAll('[data-fade]');
        if (elements.length === 0) {
            console.warn(`InterfaceModule.fade: Fade enabled, but no elements found with the [data-fade] attribute.`);
            return;
        }

        elements.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = `translateY(${distance})`;
            el.style.transition = `opacity ${length} ease-out, transform ${length} ease-out`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    el.style.opacity = 1;
                    el.style.transform = 'translateY(0)';
                } else {
                    el.style.opacity = 0;
                    el.style.transform = `translateY(${distance})`;
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    }
};