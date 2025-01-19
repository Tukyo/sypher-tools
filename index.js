/***************************************
 * [Namespace] "sypher"
 * [Modules]:
 * | > WindowModule
 * | /modules/utils.js
 * --------------------------
 * ----> pageFocus
 * --------------------------
 * | > TruncationModule
 * | /modules/utils.js
 * --------------------------
 * ----> truncate
 * ----> truncateBalance
 * --------------------------
 * | > InterfaceModule
 * | /modules/interface.js
 * --------------------------
 * ----> toggleLoader
 * --------------------------
 * | > CryptoModule
 * | /modules/crypto.js
 * --------------------------
 * ----> initCrypto
 * ----> getETHPrice
 * ----> getBalance
 * ----> getPriceV2
 * ----> getPriceV3
 * ----> getPoolV3
 * ----> getUserValue
 * --------------------------
 * [Guide] <-----------------
 * | > Load the sypher in the header of your HTML file.
 * <script src="path/to/sypher.js"></script> // TODO: Update path
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

    // Expose to global namespace
    global.sypher = sypher;

    console.log("sypher initialized:", sypherTools);
})(window);
////
// #endregion Namespace Declaration & Initialization
////////////////////////////////////////