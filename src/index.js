/***************************************
 * [Namespace] "sypher"
 * --------------------------
 * [Description]:
 * | Sypher is a collection of utility functions for web development.
 * ----> Window management, text truncation, interface effects, and crypto functions.
 * | > Entry Point
 * | /dist/build.js | /dist/build.min.js
 * --------------------------
 * [Modules]:
 * | > WindowModule
 * | /src/utils.js
 * --------------------------
 * ----> pageFocus
 * --------------------------
 * | > TruncationModule
 * | /src/utils.js
 * --------------------------
 * ----> truncate
 * ----> truncateBalance
 * --------------------------
 * | > InterfaceModule
 * | /src/interface.js
 * --------------------------
 * ----> toggleLoader
 * ----> parallax
 * ----> fade
 * --------------------------
 * | > CryptoModule
 * | /src/crypto.js
 * --------------------------
 * ----> initCrypto
 * ----> connect
 * ----> switchChain
 * ----> getPricefeed
 * ----> getTokenDetails
 * ----> getPriceV2
 * ----> getPriceV3
 * ----> getPoolV3
 * ----> getUserValue
 * ----> clean
 * --------------------------
 * [Guide] <-----------------
 * | > Include ethers.js in the header of your HTML file.
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.0/ethers.umd.min.js"></script>
 * | > Load the sypher namespace in the header of your HTML file.
 * <script src="https://cdn.jsdelivr.net/gh/Tukyo/sypher-tools@latest/dist/build.min.js"></script>
 * | > Call functions from the sypher namespace using "sypher.functionName()"
 ***************************************/
////////////////////////////////////////
// #region Namespace Declaration & Initialization
////
(function(global) {
    const sypher = {};

    // Attach each module to sypherTools
    Object.assign(sypher, WindowModule);
    Object.assign(sypher, TruncationModule);
    Object.assign(sypher, InterfaceModule);
    Object.assign(sypher, CryptoModule);
    Object.assign(sypher, CryptoInterfaceModule);

    // Expose to global namespace
    global.sypher = sypher;

    console.log("Sypher Modules Initialized!");
})(window);
////
// #endregion Namespace Declaration & Initialization
////////////////////////////////////////