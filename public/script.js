// <reference path="defs.d.ts" />

const header = document.querySelector('header');

document.addEventListener('DOMContentLoaded', function () {
    sypher.initTheme("default");

    const userEnvironment = sypher.userEnvironment();
    console.log(userEnvironment);

    const button = sypher.createButton({
        type: "connect",
        text: "Connect Wallet",
        modal: true,
        theme: "default",
        append: header,
        initCrypto: {
            chain: "base",
            pair: "ethereum",
            contractAddress: "0x21b9D428EB20FA075A29d51813E57BAb85406620",
            poolAddress: "0xb0fbaa5c7d28b33ac18d9861d4909396c1b8029b",
            pairAddress: "0x4200000000000000000000000000000000000006",
            version: "V3",
            icon: "https://raw.githubusercontent.com/Tukyo/sypherbot-public/refs/heads/main/assets/img/botpic.png"
        }
    });
});

window.addEventListener('sypher:connect', function (e) {
    console.log("%c✅-------------✅", "color: white; background: green; font-size: 16px; padding: 4px;");
    console.log(e.detail);
    console.log("%c✅-------------✅", "color: white; background: green; font-size: 16px; padding: 4px;");
});

window.addEventListener('sypher:disconnect', function (e) {
    console.log("%c❌-------------❌", "color: white; background: red; font-size: 16px; padding: 4px;");
});

window.addEventListener('sypher:accountChange', function (e) {
    console.log("%c🟡-------------🟡", "color: white; background: yellow; font-size: 16px; padding: 4px;");
    console.log(e.detail);
    console.log("%c🟡-------------🟡", "color: white; background: yellow; font-size: 16px; padding: 4px;");
});

window.addEventListener('sypher:initCrypto', function (e) {
    console.log("%c🔵-------------🔵", "color: white; background: blue; font-size: 16px; padding: 4px;");
});