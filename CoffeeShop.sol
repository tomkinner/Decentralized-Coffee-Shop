// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract DecentralizedCoffeeShop {
    address public owner;
    address public usdcTokenAddress; 

    struct Coffee {
        string name;
        uint256 price; 
    }

    mapping(uint256 => Coffee) public menu;
    uint256 public coffeeCount;

    event CoffeePurchased(address indexed buyer, string coffeeName, uint256 price, uint256 timestamp);

    constructor(address _usdcAddress) {
        owner = msg.sender; 
        usdcTokenAddress = _usdcAddress;

        addCoffee("Espresso", 1 * 10**6);   
        addCoffee("Cappuccino", 2 * 10**6); 
        addCoffee("Latte", 3 * 10**6);      
    }

    function addCoffee(string memory _name, uint256 _price) public {
        require(msg.sender == owner, "Only owner can add coffee");
        coffeeCount++;
        menu[coffeeCount] = Coffee(_name, _price);
    }

    function buyCoffee(uint256 _coffeeId) public {
        require(_coffeeId > 0 && _coffeeId <= coffeeCount, "Invalid Coffee ID");
        Coffee memory coffee = menu[_coffeeId];

        bool success = IERC20(usdcTokenAddress).transferFrom(msg.sender, owner, coffee.price);
        require(success, "USDC Payment failed!");

        emit CoffeePurchased(msg.sender, coffee.name, coffee.price, block.timestamp);
    }
}
