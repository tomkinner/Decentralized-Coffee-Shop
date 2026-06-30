# ☕ Decentralized Coffee Shop

A Web3 decentralized application (dApp) built on the Arc Network that allows users to purchase their favorite coffee using USDC. This project demonstrates smart contract integration with a frontend interface for handling decentralized payments.

---

## 🚀 Live Demo

Check out the live deployment here:  
🔗 **[decentralized-coffee-shop.vercel.app](https://decentralized-coffee-shop.vercel.app)**

---

## 🛠️ Tech Stack

- **Smart Contract:** Solidity (`^0.8.0`)
- **Frontend:** HTML, CSS, JavaScript
- **Web3 Integration:** Ethers.js / Web3.js (Interfacing with ERC-20 USDC)
- **Deployment:** Vercel

---

## 📋 Features

- **Decentralized Menu:** Coffee items (Espresso, Cappuccino, Latte) are stored and managed directly on the blockchain smart contract.
- **USDC Payments:** Integrates standard ERC-20 `transferFrom` functionality to securely process payments in USDC.
- **Event Logging:** Emits a `CoffeePurchased` event upon every successful transaction for transparent on-chain tracking.
- **Owner Controls:** Includes restrictive modifiers (`addCoffee`) allowing only the contract owner to update or add new items to the menu.

---

## 📄 Smart Contract Deployment

- **Network:** Arc Testnet / Mainnet
- **Contract Address:** `0xf78DD4D420264190e491f87F12f1e81c1C1c7285`

---

## 📂 Smart Contract Overview (`CoffeeShop.sol`)

The core logic handles the coffee menu mapping and payment transfers:

```solidity
// Standard ERC-20 Interface used for USDC payment validation
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
