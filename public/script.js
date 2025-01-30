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
            contractAddress: "0x21b9D428EB20FA075A29d51813E57BAb85406620",
            poolAddress: "0xb0fbaa5c7d28b33ac18d9861d4909396c1b8029b",
            version: "V3",
            icon: "https://raw.githubusercontent.com/Tukyo/sypherbot-public/refs/heads/main/assets/img/botpic.png"
        }
    })
    cbut.addEventListener('click', async () => {

    });
    getWorkingProvider();
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












const FEED_REGISTRY_ADDRESS = "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf";
const FEED_REGISTRY_ABI = [
    "function getFeed(address base, address quote) view returns (address)"
];

const MAINNET_RPCS = [
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://ethereum-rpc.publicnode.com",
    "https://1rpc.io/eth",
    "https://rpc.mevblocker.io"
];

async function getProvider(){
    for (const rpc of MAINNET_RPCS) {
        try {
            const provider = new ethers.providers.JsonRpcProvider(rpc);
            await provider.getBlockNumber(); // Test
            console.log(`✅ Working RPC found: ${rpc}`);
            return provider;
        } catch (error) { console.warn(`❌ RPC failed: ${rpc} - ${error.message}`); }
    }
    console.error("🚨 No working RPCs found.");
    return null;
}



// Function to fetch the Chainlink price feed address
async function fetchPriceFeed(base, quote) {
    const provider = await getProvider();
    const registry = new ethers.Contract(FEED_REGISTRY_ADDRESS, FEED_REGISTRY_ABI, provider);

    try {
        const priceFeedAddress = await registry.getFeed(base, quote);
        console.log(`Price Feed Address: ${priceFeedAddress}`);
        return priceFeedAddress;
    } catch (error) {
        console.error("Error fetching price feed:", error);
    }
}