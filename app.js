let provider;
let signer;
const coffeeShopAddress = "0xf78DD4D420264190e491f87F12f1e81c1C1c7285";
const usdcAddress = "0x3600000000000000000000000000000000000000"; // Arc Testnet USDC

const coffeeShopABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "uint256", "name": "_price", "type": "uint256" }
    ],
    "name": "addCoffee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_coffeeId", "type": "uint256" }],
    "name": "buyCoffee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_usdcAddress", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "coffeeName", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CoffeePurchased",
    "type": "event"
  }
];

const usdcABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)"
];

// Load & Update User Balance
async function updateBalance(userAddress) {
    try {
        const usdcContract = new ethers.Contract(usdcAddress, usdcABI, provider);
        const balance = await usdcContract.balanceOf(userAddress);
        // USDC uses 6 decimals
        const formattedBalance = ethers.formatUnits(balance, 6);
        document.getElementById('usdcBalance').innerText = parseFloat(formattedBalance).toFixed(2);
    } catch (err) {
        console.error("Error fetching balance:", err);
    }
}

// Wallet Connect Function
document.getElementById('connectButton').addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            document.getElementById('walletAddress').innerText = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            
            // Trigger balance fetching
            await updateBalance(address);
        } catch (err) {
            console.error(err);
            alert("Connection rejected.");
        }
    } else {
        alert("Please install MetaMask!");
    }
});

// Main Coffee Buy Logic
async function buyCoffeeFromWeb(coffeeId) {
    if (!signer) return alert("Please connect wallet first!");
    try {
        const usdcContract = new ethers.Contract(usdcAddress, usdcABI, signer);
        const price = ethers.parseUnits(coffeeId.toString(), 6);
        
        console.log("Requesting USDC Approval...");
        const approveTx = await usdcContract.approve(coffeeShopAddress, price);
        await approveTx.wait();
        console.log("Approval Success!");
        
        const coffeeShopContract = new ethers.Contract(coffeeShopAddress, coffeeShopABI, signer);
        console.log("Buying Coffee...");
        const buyTx = await coffeeShopContract.buyCoffee(coffeeId);
        await buyTx.wait();
        
        alert("Coffee Successfully Purchased! 🎉☕");
        
        // Update balance after purchase
        const address = await signer.getAddress();
        await updateBalance(address);
    } catch (error) {
        console.error(error);
        alert("Transaction Failed!");
    }
}
