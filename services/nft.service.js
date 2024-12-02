const { ethers } = require("ethers");
const { model } = require("mongoose");
const helperFunc = require("../utils/helperFunc");
const ipfsService = require("./ipfs.service");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require("../contract/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json").abi;

class NFTService {
    constructor() {
        this.contract = new ethers.Contract(contractAddress, contractABI, signer);
    }
    
    async mintNFT(receiver, tokenURI) {
        try {
            const tx = await this.contract.safeMint(receiver, tokenURI);
            const receipt = await tx.wait();

            const transferEvent = receipt.logs.find(
                (log) => log.eventName === "Transfer"
            );

            if (!transferEvent) {
                throw new Error("No Transfer event found in the receipt");
            }

            return {
                tokenId: transferEvent.args[2].toString(),
                transactionHash: receipt.hash
            }
        }
        catch (error) {
            console.error("Error minting NFT:", error);
            throw new Error("Failed to mint NFT: " + error.message);
        }
    }

    async getNFTData(tokenId) {
        var tokenURI = await this.contract.tokenURI(tokenId);
        const listedToken = await this.contract.getListedTokenForId(tokenId);
        tokenURI = `${process.env.GATEWAY_URL}/ipfs/${ipfsHash}`;
        let meta = await fetch(tokenURI);
        console.log("Listed token: ", listedToken);
    }

    async listNFT(nft, price) {
        try {
            // create metadata file and upload to IPFS
            const metadata = helperFunc.convertStampToNFTMeta(nft);
            const file = new File(
                [JSON.stringify(metadata)],
                "metadata.json",
                { type: "application/json" }
            )

            console.log("Uploading metadata to IPFS...");
            const ipfsResult = await ipfsService.uploadFile(file, nft._id);
            const metaDataUrl = helperFunc.getIPFSUrl(ipfsResult.IpfsHash);
            console.log("IPFS Result:", ipfsResult);

            // get price
            const priceInWei = ethers.parseEther(price.toString());
            let listingPrice = await this.contract.getListPrice();
            listingPrice = listingPrice.toString();

            // create NFT
            console.log("Creating new transaction...");
            let transaction = await this.contract.createToken(metaDataUrl, priceInWei, { value: listingPrice, gasLimit: 500000 });   
            const receipt = await transaction.wait();

            if (!receipt.status) {
                throw new Error("Transaction failed");
            }

            console.log("NFT created successfully", receipt.hash); 
        }
        catch (error) {
            console.error("Error listing NFT:", error);
            throw new Error("Failed to list NFT: " + error.message);
        }
    }
}

module.exports = new NFTService();