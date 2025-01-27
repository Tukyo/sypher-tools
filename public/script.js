// <reference path="defs.d.ts" />

const header = document.querySelector('header');



document.addEventListener("visibilitychange", sypher.pageFocus);
document.addEventListener('DOMContentLoaded', async function () {
    sypher.initTheme();

    const userEnvironment = sypher.userEnvironment();
    console.log(userEnvironment);
    
    const modal = sypher.createModal({ type: "log" });

    const connectButton = sypher.createButton(
        {
            type: "connect",
            text: "Connect Now!",
            modal: true,
            append: header,
            initCrypto: {
                chain: "base",
                contractAddress: "0x21b9D428EB20FA075A29d51813E57BAb85406620",
                poolAddress: "0xb0fbaa5c7d28b33ac18d9861d4909396c1b8029b",
                version: "V3"
            }
        }
    );
});