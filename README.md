# SypherTools <!-- omit in toc -->
![Banner](https://raw.githubusercontent.com/Tukyo/sypherbot-public/refs/heads/main/assets/img/readme_banner.jpg)

A comprehensive library of utility functions designed to enhance web development, with a specific focus on crypto frontends. Sypher-Tools provides modules for window management, text truncation, interface effects, and crypto operations, all in one lightweight package. **[~10kb]**

## 💾 **Technologies Used** <!-- omit in toc -->
![Javascript](https://shields.io/badge/JavaScript-F7DF1E?logo=JavaScript&logoColor=000&style=flat-square)

![License](https://img.shields.io/badge/license-MIT-green) ![Web3](https://img.shields.io/badge/web3-ethers.js-teal)

## ☎️ **Contact** <!-- omit in toc -->
🌐 **Web:** [Tukyo](https://tukyowave.com/) • [Tukyo Games](https://tukyogames.com/) • [deSypher](https://desypher.net/)

📰 **Socials:** [X/Twitter](https://x.com/tukyowave/) • [Telegram](https/t.me/tukyogames) *(If you have any issues please reach out on telegram)*

---

## 📝 **Table of Contents** <!-- omit in toc -->

- [🔎 **Overview**](#-overview)
- [💿 **Installation**](#-installation)
- [🛠️ **Usage**](#️-usage)
- [📂 **Modules**](#-modules)
  - [WindowModule](#windowmodule)
  - [TruncationModule](#truncationmodule)
  - [InterfaceModule](#interfacemodule)
  - [Crypto Interface Module](#crypto-interface-module)
  - [CryptoModule](#cryptomodule)
---

## 🔎 **Overview**

**Sypher-Tools** simplifies common tasks for web development, including:

- Window management
- Text truncation
- Smooth interface animations
- Crypto-related operations like fetching token details, price feeds, and user values

Entry Points:
- `/dist/build.js`
- `/dist/build.min.js`
  
CDN:
https://cdn.jsdelivr.net/gh/Tukyo/sypher-tools@latest/

---

## 💿 **Installation**

Include `ethers.js` & `sypher.js` in the `<head>` section of your HTML file:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.0/ethers.umd.min.js"></script>
   ```
   ```html
   <script src="https://cdn.jsdelivr.net/gh/Tukyo/sypher-tools@latest/dist/build.min.js"></script>
   ```

---

## 🛠️ **Usage**

Access all functions via the global `sypher` namespace:

```javascript
// Example: Initialization
    const cryptoObject = sypher.initCrypto(
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
        "tokenPrice": 0.1094491127855805,
        "userValue": "2124.384804021992200000"
    }
```
With a single function call, you have a crypto object for your project's token! You can then reuse this throughout the website, and access any of your token details as needed for each connected user.

**You can access any of the details like this:**

```javascript
element.innerHTML = cryptoObject.userValue;
```

**Or combine features of the library, like this:**
```javascript
const truncatedValue = sypher.truncateBalance(cryptoObject.userValue);
element.innerHTML = truncatedValue; // => <p>2124.38k</p>
```

---

## 📂 **Modules**

### WindowModule
**File**: `/src/utils.js`

#### Methods: <!-- omit in toc -->
`pageFocus`: Manage page focus events and behaviors.

#### Usage: <!-- omit in toc -->
```javascript
document.addEventListener("visibilitychange", focus()); // => retuns a bool indicating page focus
if (!pageFocused) { return; } // => Stop doing some code when the page isn't focused
```

---

### TruncationModule
**File**: `/src/utils.js`

#### Methods: <!-- omit in toc -->
`truncate`: Shorten text strings with an ellipsis.

`truncateBalance`: Format and truncate crypto balances for display.

---

### InterfaceModule
**File**: `/src/interface.js`

#### Methods: <!-- omit in toc -->
`toggleLoader`: Show or hide loading indicators.

`parallax`: Apply parallax scrolling effects.

`fade`: Perform fade-in or fade-out animations.

---

### Crypto Interface Module
**File** `/src/interface.js`

#### Methods: <!-- omit in toc -->
`createConnectButton`: Create a connect button in the page.

---

### CryptoModule
**File**: `/src/crypto.js`

#### Methods: <!-- omit in toc -->
`initCrypto`: Initialize crypto-related settings and connections.

`connect`: Connect to a wallet.

`switchChain`: Switch between blockchain networks.

`getPricefeed`: Fetch price feeds for tokens.

`getTokenDetails`: Retrieve detailed token information.

`getPriceV2`: Fetch token prices using version 2 price logic.

`getPriceV3`: Fetch token prices using version 3 price logic.

`getPoolV3`: Get details of a liquidity pool.

`getUserValue`: Calculate user-specific values.

`clean`: Perform cleanup tasks for crypto data.

---