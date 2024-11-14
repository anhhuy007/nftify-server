const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let MyNFT, myNFT, owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy the contract
    [owner, addr1, addr2] = await ethers.getSigners();
    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with the correct name and symbol", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT and assign it to the owner", async function () {
      const tokenURI = "ipfs://QmTestHash";
      await myNFT.safeMint(owner.address, tokenURI);

      const tokenId = 0;
      expect(await myNFT.ownerOf(tokenId)).to.equal(owner.address);
      expect(await myNFT.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should increment token IDs correctly", async function () {
      await myNFT.safeMint(owner.address, "ipfs://QmTestHash1");
      await myNFT.safeMint(owner.address, "ipfs://QmTestHash2");

      const tokenURI1 = await myNFT.tokenURI(0);
      const tokenURI2 = await myNFT.tokenURI(1);

      expect(tokenURI1).to.equal("ipfs://QmTestHash1");
      expect(tokenURI2).to.equal("ipfs://QmTestHash2");
    });
  });

  describe("Transfers with Payment", function () {
    beforeEach(async function () {
      // Mint an NFT and set up initial owner balance before each payment transfer test
      const tx = await myNFT.safeMint(
        owner.address,
        "ipfs://QmTestHashWithPayment"
      );
      const receipt = await tx.wait();

      // Get tokenId from the Transfer event
      const transferEvent = receipt.logs.find(
        (log) => log.eventName === "Transfer"
      );

      if (transferEvent) {
        this.tokenId = transferEvent.args[2]; // tokenId is the third argument
      } else {
        throw new Error("No Transfer event found in the receipt");
      }

      this.price = ethers.parseEther("1.0"); // Updated for newer ethers version
      this.ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      // approve addr1 to transfer the NFT
      await myNFT.approve(addr1.address, this.tokenId);
    });

    it("Should transfer NFT and payment to the owner when recipient sends the correct amount", async function () {
      // Get initial owner balance
      this.ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    
      // Perform transfer with payment
      const tx = await myNFT
        .connect(addr1)
        .transferWithPayment(
          owner.address,
          addr1.address,
          this.tokenId,
          this.price,
          { value: this.price }
        );
    
      // Verify the ownership
      expect(await myNFT.ownerOf(this.tokenId)).to.equal(addr1.address);
    
      // Get the owner's balance after the transaction
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    
      // Assert that the owner's balance increased by the price (excluding gas cost)
      expect((ownerBalanceAfter - this.ownerBalanceBefore).toString()).to.equal(
        this.price.toString()
      );
    });    

    it("Should revert if the recipients sends insufficient payment", async function () {
      const insufficientAmount = ethers.parseEther("0.5");

      await expect(
        myNFT
          .connect(addr1)
          .transferWithPayment(
            owner.address,
            addr1.address,
            this.tokenId,
            this.price,
            { value: insufficientAmount }
          )
      ).to.be.revertedWith("Insufficient payment sent");
    });
  });

  it("Should mint and emit Transfer event", async function () {
    const tx = await myNFT.safeMint(
      owner.address,
      "https://example.com/token-metadata.json"
    );
    const receipt = await tx.wait();

    // Check for Transfer event in logs
    const transferEvent = receipt.logs.find(
      (log) => log.eventName === "Transfer"
    );
    expect(transferEvent).to.not.be.undefined;
    console.log(
      "Transfer Event found with Token ID:",
      transferEvent.args[2].toString()
    );
  });
});
