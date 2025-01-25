// <reference path="defs.d.ts" />

const header = document.querySelector('header');



document.addEventListener("visibilitychange", sypher.pageFocus );
document.addEventListener('DOMContentLoaded', async function() {
    const modal = sypher.createModal({ type: "log", theme: "default" });

    const connectButton = sypher.createButton(
        header,
        async () => { const cryptoObject = await sypher.initCrypto(
            "base",
            "0x21b9D428EB20FA075A29d51813E57BAb85406620",
            "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
            "V3"
        )},
    );
});