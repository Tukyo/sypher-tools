// <reference path="defs.d.ts" />

const header = document.querySelector('header');



document.addEventListener("visibilitychange", sypher.pageFocus);
document.addEventListener('DOMContentLoaded', async function () {
    sypher.initTheme("default");

    const userEnvironment = sypher.userEnvironment();
    console.log(userEnvironment);
    
    // const modal = sypher.createModal({ type: "log" });

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

// async function getWalletTransactions() {
//     try {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const address = await signer.getAddress();
        
//         const currentBlock = await provider.getBlockNumber();
//         const startBlock = currentBlock - 1000;
//         const transactions = [];
//         let lastRequestTime = 0;
//         const MIN_REQUEST_INTERVAL = 100;

//         console.log("Fetching transactions for address:", address);
        
//         const waitForRateLimit = async () => {
//             const now = Date.now();
//             const timeSinceLastRequest = now - lastRequestTime;
//             if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
//                 await new Promise(resolve => 
//                     setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
//                 );
//             }
//             lastRequestTime = Date.now();
//         };

//         for (let blockNumber = currentBlock; blockNumber >= startBlock; blockNumber--) {
//             await waitForRateLimit();

//             console.log("Fetching block:", blockNumber);
            
//             const block = await provider.getBlock(blockNumber, true);
            
//             if (!block || !block.transactions) continue;

//             const walletTxs = block.transactions.filter(tx => {
//                 const fromMatch = tx.from?.toLowerCase() === address.toLowerCase();
//                 const toMatch = tx.to?.toLowerCase() === address.toLowerCase();
//                 console.log("Tx:", tx, fromMatch, toMatch);
//                 return fromMatch || toMatch;
//             });

//             transactions.push(...walletTxs);
//             if (transactions.length >= 1) { break; }
//         }

//         console.log("Transactions:", transactions);
//         return transactions.slice(0, 50);
//     } catch (error) {
//         console.error("Error fetching transactions:", error);
//         throw error;
//     }
// }