// <reference path="defs.d.ts" />


const header = document.querySelector('header');
console.log(ethers);
if (typeof ethers == "undefined") { }
console.log(sypher);
addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    sypher.init({
        interface: {
            button: {
                type: "connect",
                text: "Connect Wallet",
                modal: true,
                append: header
            }
        },
        crypto: {
            chain: "base"
        }
    });

});

window.addEventListener('sypher:initCrypto', function (e) {
    const chain = sypher.getChain();
    console.log("--------------------------------", chain);
});