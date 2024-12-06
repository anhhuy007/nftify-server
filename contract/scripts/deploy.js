const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
//   const balance = await deployer.getBalance();
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();

  console.log("Marketplace deployed to:", address);
//   console.log("Balance: ", balance);

  const artifact = require("../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json");

  const data = {
    address: address,
    abi: artifact.abi
  };

  try {
    fs.writeFileSync(
      "./src/Marketplace.json",
      JSON.stringify(data, null, 2)
    );
    console.log("Contract data written to src/Marketplace.json");
  } catch (error) {
    console.error("Error writing contract data:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("Error: ", error);
    process.exit(1);
  });
