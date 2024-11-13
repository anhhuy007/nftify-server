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

  // describe("Transfers", function () {
  //   beforeEach(async function () {
  //     // Mint an NFT to owner before testing transfers
  //     this.tokenId = await myNFT.safeMint(owner.address, "ipfs://QmTestHash");
  //   });

  //   it("Should transfer an NFT from owner to another address", async function () {
  //     await myNFT.safeTransferFrom(owner.address, addr1.address, this.tokenId);

  //     expect(await myNFT.ownerOf(this.tokenId)).to.equal(addr1.address);
  //   });

  //   it("Should fail to transfer if sender is not the owner or approved", async function () {
  //     await expect(
  //       myNFT.connect(addr1).safeTransferFrom(owner.address, addr2.address, this.tokenId)
  //     ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  //   });

  //   it("Should allow transfer by an approved address", async function () {
  //     await myNFT.approve(addr1.address, this.tokenId);
  //     await myNFT.connect(addr1).safeTransferFrom(owner.address, addr2.address, this.tokenId);

  //     expect(await myNFT.ownerOf(this.tokenId)).to.equal(addr2.address);
  //   });
  // });
});
