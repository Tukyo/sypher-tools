# SypherTools <!-- omit in toc -->
![Banner](https://raw.githubusercontent.com/Tukyo/sypherbot-public/refs/heads/main/assets/img/readme_banner.jpg)

A comprehensive library of utility methods designed to enhance web development, with a specific focus on crypto frontends. Sypher Tools provides modules for window management, text truncation, interface effects, and crypto operations, all in one lightweight package. **[~20kb]**

## 💾 **Technologies Used** <!-- omit in toc -->
![Typescript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)
![CSS](https://shields.io/badge/CSS-FFFFFF?logo=CSS&logoColor=76b8ff&style=flat-square)
![Javascript](https://shields.io/badge/-F7DF1E?logo=Javascript&logoColor=000&style=flat-square)

![License](https://img.shields.io/badge/license-MIT-green) ![Web3](https://img.shields.io/badge/web3-ethers.js-teal)

## ☎️ **Contact** <!-- omit in toc -->
🌐 **Web:** [Tukyo](https://tukyowave.com/) • [Tukyo Games](https://tukyogames.com/) • [deSypher](https://desypher.net/)

📰 **Socials:** [X/Twitter](https://x.com/tukyowave/) • [Telegram](https://t.me/tukyohub) *(If you have any issues please reach out on telegram)*

---

## 📝 **Table of Contents** <!-- omit in toc -->

- [🔎 **Overview**](#-overview)
- [💿 **Installation**](#-installation)
- [🛠️ **Usage**](#️-usage)
- [📂 **Modules**](#-modules)
  - [TruncationModule](#truncationmodule)
  - [WindowModule](#windowmodule)
  - [InterfaceModule](#interfacemodule)
  - [CryptoModule](#cryptomodule)
  - [HelperModule](#helpermodule)
---

## 🔎 **Overview**

**Sypher Tools** simplifies common tasks for web development, including:

- Window management
- Text truncation
- Smooth interface animations
- Type validation
- Crypto-related operations like fetching token details, price feeds, and user values

Entry Points:
- `/dist/build.js`
- `/dist/build.min.js`
  
CDN:
https://cdn.jsdelivr.net/gh/Tukyo/sypher-tools/

---

## 💿 **Installation**

**Please Note:** The most efficient way to use this library is with direct import. `ethers.js` is included in the *dist/* directory if needed.

### CDN <!-- omit in toc -->

Include `ethers.js` & `sypher.js` in the `<head>` section of your HTML file:
 ```html
 <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.0/ethers.umd.min.js"></script>

 <script src="https://cdn.jsdelivr.net/gh/Tukyo/sypher-tools@0.2.3/dist/build.min.js"></script>
 ```

### Direct Import <!-- omit in toc -->

**Recommended**: Import both scripts into the document body.
 ```html
<script src="dist/ethers.umd.min.js"></script>
<script src="dist/build.js"></script>
 ```
---

## 🛠️ **Usage**

Access all methods via the global `sypher` namespace:

```javascript
// Example: Initialization
const cryptoObject = await sypher.initCrypto(
    "base",
    "0x21b9D428EB20FA075A29d51813E57BAb85406620",
    "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
    "V3"
)
```
```javascript
returns =>
{
    "contractAddress": "0x21b9D428EB20FA075A29d51813E57BAb85406620",
    "poolAddress": "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
    "balance": 19409.794652093988,
    "decimals": 18,
    "name": "Sypher",
    "symbol": "SYPHER",
    "totalSupply": "1000000.000000000000000000",
    "tokenPrice": 0.1094491127855805,
    "userValue": "2124.384804021992200000"
}
```
With a single method call, you have a crypto object for your project's token! You can then reuse this throughout the website, and access any of your token details as needed for each connected user.

**You can access any of the details - like this:**

```javascript
element.innerHTML = cryptoObject.userValue;
```

**Or, combine features of the library - like this:**
```javascript
const truncatedValue = sypher.truncateBalance(cryptoObject.userValue);
element.innerHTML = truncatedValue; // => <p>2124.38k</p>
```

---

## 📂 **Modules**

### TruncationModule
**File**: `/src/utils.js`

#### Methods: <!-- omit in toc -->
1: **`truncate`:** Shorten text strings with an ellipsis.

#### | Usage: <!-- omit in toc -->
```javascript
element.textContent = sypher.truncate('0xA66DF2f59C6e37E66a063EE3A82eA63C0D521d14', 3, 5); // => Output: 0xA...21d14
```

2: **`truncateBalance`:** Format and truncate balances for display.
#### | Usage: <!-- omit in toc -->
```javascript
const balance = 19409.794652093988;
element.textContent = sypher.truncateBalance(balance); // Output => 19409.79k
```

---

### WindowModule
**File**: `/src/utils.js`

#### Methods: <!-- omit in toc -->
1: **`pageFocus`:** Manage page focus events and behaviors.

#### | Usage: <!-- omit in toc -->
```javascript
let isFocused = null;
document.addEventListener("visibilitychange", isFocused = sypher.pageFocus()); // => retuns a bool indicating page focus
if (!isFocused) { return; } // => Stop doing some code when the page isn't focused
```

---

### InterfaceModule
**File**: `/src/interface.js`

1: **`createButton`:** Create a button in the page.
#### | Usage: <!-- omit in toc -->
```javascript
let cryptoObject = null;
const connectButton = await sypher.createButton(
    element, // Choose the element you want to attach the button to
    async () => {
      cryptoObject = await sypher.initCrypto(
          "base",
          "0x21b9D428EB20FA075A29d51813E57BAb85406620",
          "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
          "V3"
      );
    },
    {
        text: "Connect Yo!", // What you want the button to say
        modal: true, // Enable optional modal for expanded wallet connection features
    }
); // => This will connect the user to the website, and return a cryptoObject of the passed token.
```
```javascript
// This simplified version will attach a button to the root of the page that will connect the wallet to ethereum onClick
const connectButton = await sypher.createButton();
```

#### Methods: <!-- omit in toc -->
2: **`toggleLoader`:** Show or hide loading indicators.
#### | Usage: <!-- omit in toc -->
```javascript
const loaderHTML = `<div class="loader"></div>`;
sypher.toggleLoader(elementVariable, true, loaderHTML) // => Show loader
sypher.toggleLoader(elementVariable, false, "", "New Text") // => No loader and replacement text
```
**CSS Loaders Resource:** [Link](https://css-loaders.com/)

3: **`parallax`:** Apply parallax scrolling effects.
#### | Usage: <!-- omit in toc -->
```html
<!--HTML-->
<div data-speed="0.5"></div>
```
```javascript
// js
window.addEventListener('load', () => { sypher.parallax(); });
```
Now, the div element with the *[data-speed]* attribute will be effected by the parallax!

4: **`fade`:** Perform fade-in or fade-out animations.

---

### CryptoModule
**File**: `/src/crypto.js`

**| > All methods below require the user to have a wallet provider** 

#### Methods: <!-- omit in toc -->
1: **`initCrypto`:** Initialize crypto-related settings and connections.
#### | Usage: <!-- omit in toc -->
```javascript
// Please see references above for how to initialize a crypto object in your site!
const cryptoObject = await sypher.initCrypto(
    "base",
    "0x21b9D428EB20FA075A29d51813E57BAb85406620",
    "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
    "V3"
); // => Returns a crypto object with all details of your token and the connected user's balance, value and more!
```

**| > All methods below are called when initializing crypto** 

You can call them individually, but it is **recommended** to just call sypher.initCrypto();

2: **`connect`:** Connect to a wallet.
#### | Usage: <!-- omit in toc -->
```javascript
await sypher.connect("base"); // Connects user to your site on the base chain
```

3: **`switchChain`:** Switch between blockchain networks.

> *This method is called in connect(); to retain the selected chain in the wallet*
#### | Usage: <!-- omit in toc -->
```javascript
await sypher.switchChain("optimism"); // Switches or requests the addition of the chain in the user's wallet
```

4: **`getPriceFeed`:** Fetch chainlink price feed.
#### | Usage: <!-- omit in toc -->
```javascript
await sypher.getPriceFeed("arbitrum", "eth"); // Gets the price feed for "ETH/USD" on the Arbitrum network
```

5: **`getTokenDetails`:** Retrieve token details using onchain calls.
#### | Usage: <!-- omit in toc -->
```javascript
const sypherCA = "0x21b9D428EB20FA075A29d51813E57BAb85406620";
await sypher.getTokenDetails("base", sypherCA);
// => Returns { balance, decimals, name, symbol, totalSupply } for 0x21b...6620
```

6: **`getPriceV2`:** Fetch token prices using Uniswap V2 price logic.
#### | Usage: <!-- omit in toc -->
```javascript
await sypher.getPriceV2(
    "base", // Chain
    "0x21594b992F68495dD28d605834b58889d0a727c7", // Pool Address
    "eth" // Pair
); // => Returns the token price for a Uniswap V2 pool in USD (Virtuals)
```

7: **`getPriceV3`:** Fetch token prices using Uniswap V3 price logic.
#### | Usage: <!-- omit in toc -->
```javascript
await sypher.getPriceV3(
    "base", // Chain
    "0x21b9D428EB20FA075A29d51813E57BAb85406620", // Contract Address
    "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b", // Pool Address
    "eth" // Pair
); // => Returns the token price for a Uniswap V3 pool in USD (Sypher)
```
> *This method uses {getPoolV3} to get the necessary pool details for the token*

8: **`getPoolV3`:** Get details of a Uniswap V3 liquidity pool.
#### | Usage: <!-- omit in toc -->
```javascript
await sypher.getPoolV3(
    "base", // Chain
    "0x21b9D428EB20FA075A29d51813E57BAb85406620", // Contract Address
    "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b" // Pool Address
); // => Returns { sqrtPriceX96, token0, token1, decimals0, decimals1, liquidity } for a Uniswap V3 pool
```

9: **`getUserValue`:** Calculate user-specific values for your project's token.
#### | Usage: <!-- omit in toc -->
```javascript
const userBalance = "1234.56";
const tokenPrice = "$100.00";
const userValue = await sypher.getUserValue(userBalance, tokenPrice);
// => Returns the value of the user's tokens [$123,459.00]
```
> *Only call this method if you already know the price of the token in USD and the user's balance*

10: **`clean`:** Clean the {cryptoObject} output for ease of development use.
#### | Usage: <!-- omit in toc -->
```javascript
const cryptoObject = {yourCryptoObject};
const cleanedCryptoObject = await sypher.clean(cryptoObject); 
// => Returns a cleaned object with formatted values.
```
> *This method is called upon returning the initial crypto object. You should not need to call this method under normal circumstances*

---

### HelperModule
**File**: `/src/utils.js`

#### This module is primarly used by this library internally for processing but can be used if needed. <!-- omit in toc -->

### Methods: <!-- omit in toc -->
1: **`validateInput`:** Validates input for processing in methods.

#### | Usage: <!-- omit in toc -->
```javascript
const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const validInput = sypher.validateInput(
      { chain, contractAddress, poolAddress }, // Validation params
      { // Validation Rules
          chain: { type: "string", required: true },
          contractAddress: { type: "string", required: true, regex: addressRegex },
          poolAddress: { type: "string", required: true, regex: addressRegex }
      }, "CryptoModule.getPoolV3" // Context
  );
if (!validInput) { return; } // Just return because all logging and context is passed to the validation
```
***

2: **`validateChain`:** Validates chain data from supported chains.

#### | Usage: <!-- omit in toc -->
```javascript
const { chainData, chainId } = sypher.validateChain(chain); // Chain = "base" : string
if (!chainData || !chainId) { return null; }
```

---