let provider;
let signer;

const coffeeShopAddress = "0xf78DD4D420264190e491f87F12f1e81c1C1c7285";
const usdcAddress = "0x3600000000000000000000000000000000000000"; // Arc Testnet USDC

const coffeeShopABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "_coffeeId", "type": "uint256" }],
        "name": "buyCoffee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "coffees",
        "outputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const usdcABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)"
];

// Load & Update User Balance
async function updateBalance(userAddress) {
    try {
        const usdcContract = new ethers.Contract(usdcAddress, usdcABI, provider);
        const balance = await usdcContract.balanceOf(userAddress);
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
            await updateBalance(address);
        } catch (err) {
            console.error(err);
            alert("Connection rejected.");
        }
    } else {
        alert("Please install MetaMask!");
    }
});

// Multi-Quantity Buy Coffee Function (Fixed Name to Match index.html)
async function buyCoffeeWithQty(coffeeId) {
    if (!signer) return alert("Please connect wallet first!");

    const qtyInput = document.getElementById(`qty-${coffeeId}`);
    const quantity = parseInt(qtyInput ? qtyInput.value : 1);

    if (isNaN(quantity) || quantity < 1) {
        alert("Please enter a valid quantity!");
        return;
    }

    try {
        const usdcContract = new ethers.Contract(usdcAddress, usdcABI, signer);
        const coffeeShopContract = new ethers.Contract(coffeeShopAddress, coffeeShopABI, signer);
        const userAddress = await signer.getAddress();

        // 1. Get price (1 USDC = 1,000,000 units in 6 decimals)
        const pricePerItem = ethers.parseUnits(coffeeId.toString(), 6);
        const totalPrice = pricePerItem * BigInt(quantity);

        // 2. Approve Total USDC in 1 Transaction
        console.log("Requesting USDC Approval for total:", totalPrice.toString());
        const approveTx = await usdcContract.approve(coffeeShopAddress, totalPrice);
        await approveTx.wait();
        console.log("Approval Success!");

        // 3. Loop through and process buyCoffee calls
        for (let i = 0; i < quantity; i++) {
            console.log(`Purchasing Coffee ${i + 1} of ${quantity}...`);
            const buyTx = await coffeeShopContract.buyCoffee(coffeeId);
            await buyTx.wait();
        }

        alert(`Successfully Purchased ${quantity} Coffee(s)! 🎉☕`);
        await updateBalance(userAddress);
    } catch (error) {
        console.error("Purchase failed:", error);
        alert("Transaction failed or was canceled.");
    }
}
