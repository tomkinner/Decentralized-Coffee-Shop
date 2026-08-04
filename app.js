// Smart Contract Configurations
const COFFEE_SHOP_ADDRESS = "0xf78DD4D420264190e491f87F12f1e81c1C1c7285"; // Your deployed contract address
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC Address

// Contract ABIs
const COFFEE_SHOP_ABI = [
    "function coffees(uint256) view returns (string name, uint256 price)",
    "function buyCoffee(uint256 _id) external",
    "function owner() view returns (address)"
];

const USDC_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

// Global Variables
let provider;
let signer;
let coffeeContract;
let usdcContract;
let userAddress;

// DOM Elements
const connectButton = document.getElementById("connectButton");
const walletAddressSpan = document.getElementById("walletAddress");
const usdcBalanceSpan = document.getElementById("usdcBalance");

// Connect Wallet Function
async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            userAddress = await signer.getAddress();

            // Initialize Contracts
            coffeeContract = new ethers.Contract(COFFEE_SHOP_ADDRESS, COFFEE_SHOP_ABI, signer);
            usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

            // Update UI
            walletAddressSpan.innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
            
            // Fetch & Update Balance
            await updateBalance();
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Failed to connect wallet.");
        }
    } else {
        alert("MetaMask is not installed. Please install MetaMask!");
    }
}

// Fetch USDC Balance
async function updateBalance() {
    if (usdcContract && userAddress) {
        try {
            const rawBalance = await usdcContract.balanceOf(userAddress);
            // USDC uses 6 decimals
            const formattedBalance = ethers.formatUnits(rawBalance, 6);
            usdcBalanceSpan.innerText = parseFloat(formattedBalance).toFixed(2);
        } catch (error) {
            console.error("Failed to fetch USDC balance:", error);
        }
    }
}

// Multi-Quantity Buy Coffee Function
async function buyCoffeeWithQty(coffeeId) {
    if (!coffeeContract || !usdcContract) {
        alert("Please connect your wallet first!");
        return;
    }

    const qtyInput = document.getElementById(`qty-${coffeeId}`);
    const quantity = parseInt(qtyInput ? qtyInput.value : 1);

    if (isNaN(quantity) || quantity < 1) {
        alert("Please enter a valid quantity!");
        return;
    }

    try {
        // 1. Get Coffee price from smart contract
        const coffee = await coffeeContract.coffees(coffeeId);
        const singlePrice = coffee.price; // BigInt value in USDC units (6 decimals)

        // Calculate total required USDC price
        const totalPrice = BigInt(singlePrice) * BigInt(quantity);

        console.log(`Purchasing ${quantity} coffee(s). Total USDC: ${totalPrice.toString()}`);

        // 2. Approve total amount of USDC in 1 transaction
        alert(`Step 1/2: Approving USDC for ${quantity} item(s)... Please confirm in wallet.`);
        const approveTx = await usdcContract.approve(COFFEE_SHOP_ADDRESS, totalPrice);
        await approveTx.wait();

        // 3. Sequential purchase transactions for each item
        alert("Step 2/2: Approval successful! Processing your purchase...");
        for (let i = 0; i < quantity; i++) {
            const buyTx = await coffeeContract.buyCoffee(coffeeId);
            await buyTx.wait();
        }

        alert(`Successfully bought ${quantity} coffee(s)!`);
        
        // Refresh Balance
        await updateBalance();
    } catch (error) {
        console.error("Purchase failed:", error);
        alert("Transaction failed or was rejected.");
    }
}

// Event Listeners
if (connectButton) {
    connectButton.addEventListener("click", connectWallet);
}
