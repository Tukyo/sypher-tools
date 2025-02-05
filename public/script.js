// <reference path="defs.d.ts" />

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const crypto = {
        chain: "base",
        pair: "ethereum",
        version: "V3",
        contractAddress: "0x21b9D428EB20FA075A29d51813E57BAb85406620",
        poolAddress: "0xb0fbaa5c7d28b33ac18d9861d4909396c1b8029b",
        pairAddress: "0x4200000000000000000000000000000000000006",
        icon: "https://raw.githubusercontent.com/Tukyo/sypherbot-public/refs/heads/main/assets/img/botpic.png"
    }
    sypher.init({
        interface: {
            theme: "default",
            button: {
                type: "connect",
                text: "Connect Wallet",
                modal: true,
                append: header
            }
        },
        crypto: crypto,
        dev: {
            logs: {
                enabled: true,
                modal: false
            }
        }
    });
});

window.addEventListener('sypher:initCrypto', function (e) {
    const chain = sypher.getChain();
    console.log("--------------------------------", chain);
});