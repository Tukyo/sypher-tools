// <reference path="defs.d.ts" />

const header = document.querySelector('header');

document.addEventListener('DOMContentLoaded', function () {
    sypher.initTheme("default");

    const userEnvironment = sypher.userEnvironment();
    console.log(userEnvironment);

    const cbut = sypher.createButton({
        type: "connect",
        text: "Connect Wallet",
        modal: true,
        theme: "default",
        append: header,
        initCrypto: {
            chain: "base",
            contractAddress: "0xf83cde146AC35E99dd61b6448f7aD9a4534133cc",
            poolAddress: "0x1a02A0cc19d703CCD40C2Fc63684dFf89B52eEEE",
            version: "V3",
            icon: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png"
        }
    })
    cbut.addEventListener('click', async () => {

    });
});

window.addEventListener('sypher:connect', function (e) {
    console.log("%c✅-------------✅", "color: white; background: green; font-size: 16px; padding: 4px;");
    console.log(e.detail);
    console.log("%c✅-------------✅", "color: white; background: green; font-size: 16px; padding: 4px;");
});

window.addEventListener('sypher:disconnect', function (e) {
    console.log("%c❌-------------❌", "color: white; background: red; font-size: 16px; padding: 4px;");
    console.log(e.detail);
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