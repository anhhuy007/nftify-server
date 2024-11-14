const { ethers } = require("hardhat")

async function main() {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    console.log("Deploying contracts with account: ", address);

    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy();
    const nftAddress = await myNFT.getAddress();
    console.log("My contract deployed to: ", nftAddress);
}

async function mintNFT(receiver) {
    const [deployer] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();

    const uri = "https://plum-quickest-aardvark-348.mypinata.cloud/ipfs/QmUeJjMpbH8hp7r6t9UsT4pT9RujST5B9Qe3XXxnYWTEkN";
    const tx = await myNFT.safeMint(receiver, uri);
    const receipt = await tx.wait();
    // Get tokenId from the Transfer event
    const transferEvent = receipt.logs.find(
        (log) => log.eventName === "Transfer"
    );

    if (transferEvent) {
        const tokenId = transferEvent.args[2]; // tokenId is the third argument
        console.log("Token ID: ", tokenId.toString());
    } else {
        throw new Error("No Transfer event found in the receipt");
    }
}

async function transferWithPayment() {
    // default parameters value
    const sender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const tokenId = 0;
    const price = ethers.parseEther("1.0");

    // init 
    const [deployer] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();

    // mint an NFT for the sender
    await myNFT.safeMint(sender, "https://example.com/token-metadata.json");

    // ensure the sender is the owner of the NFT
    const currentOwner = await myNFT.ownerOf(tokenId);
    if (currentOwner != sender) {
        throw new Error("Sender doesn't own the NFT");
    }

    // ensure the payment is correct
    if (price < 0) {
        throw new Error("Price must be greater than zero!");
    }

    // perform transfer with payment
    const tx = await myNFT
        .connect(receiver)
        .transferWithPayment(sender, receiver, tokenId, price, { value: price });

    const receipt = await tx.wait();

    // verify the transfer event 
    const transferEvent = receipt.logs.find(
        (log) => log.eventName == "Transfer"
    );

    if (transferEvent) {
        const tokenId = transferEvent.args[2]; 
        console.log("Transfer successful. Token ID: ", tokenId.toString());

        // check the balance of sender to ensure they received the payment
        const senderBalance = await ethers.provider.getBalance(sender);
        console.log("Sender's balance after transfer: ", senderBalance.toString());
    }
    else {
        throw new Error("No transfer event found in the receipt");
    }
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });