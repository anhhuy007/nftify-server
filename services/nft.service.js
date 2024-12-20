const { ethers } = require("ethers");
const { model } = require("mongoose");
const helperFunc = require("../utils/helperFunc");
const ipfsService = require("./ipfs.service");
const axios = require("axios")

class NFTService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.contractABI = require("../contract/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json").abi;
        this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, this.contractABI, this.signer);
    }

    async mintNFT(nft, price, forSale) {
        try {
            const metadata = helperFunc.convertStampToNFTMeta(nft);
            const file = new File(
                [JSON.stringify(metadata)],
                "metadata.json",
                { type: "application/json" }
            );

            console.log("Uploading metadata to IPFS...");
            const ipfsResult = await ipfsService.uploadFile(file, nft._id);
            const ipfsHash = ipfsResult.IpfsHash;
            console.log("IPFS Result: ", ipfsResult);

            // get listing price
            const listingPrice = await this.contract.getListPrice();
            const priceInWei = ethers.parseEther(price.toString());

            // create tracsaction
            console.log("Creating new transaction...");
            const tx = await this.contract.createToken(
                ipfsHash, 
                priceInWei, 
                forSale,
                { gasLimit: 500000 }
            );
            const receipt = await tx.wait();

            if (!receipt.status) {
                throw new Error("[Error][Fail] Transaction failed");
            }

            const tokenListedEvent = receipt.logs.find(log => {
                try {
                    const parsedLog = this.contract.interface.parseLog(log);
                    return parsedLog.name === 'TokenListedSuccess';
                } catch (e) {
                    return false;
                }
            });
    
            if (!tokenListedEvent) {
                throw new Error("[Error][NoneExist] TokenListedSuccess event not found");
            }

            const parsedEvent = this.contract.interface.parseLog(tokenListedEvent);

            return {
                tokenId: parsedEvent.args.tokenId.toString(),
                tokenURI: ipfsHash,
                transactionHash: receipt.hash,
                creator: parsedEvent.args.creator,
                owner: parsedEvent.args.owner,
                price: ethers.formatEther(parsedEvent.args.price)
            };
        } catch(error) {
            console.log("Error: ", error);
            throw new Error("[Error][Fail] Failed to mint NFT: ", error);
        }
    }

    async buyNFT(tokenId, price) {
        try {
            const priceInWei = ethers.parseEther(price.toString());
            const tx = await this.contract.excuteSale(
                tokenId, 
                { value: priceInWei, gasLimit: 500000 }
        );
            const receipt = await tx.wait();

            if (!receipt.status) {
                throw new Error("[Error][Fail] Transaction failed");
            }

            const tokenPurchasedEvent = receipt.logs.find(log => {
                try {
                    const parsedLog = this.contract.interface.parseLog(log);
                    return parsedLog.name === 'TokenPurchasedSuccess';
                } catch (e) {
                    return false;
                }
            });

            if (!tokenPurchasedEvent) {
                throw new Error("[Error][NoneExist] TokenPurchasedSuccess event not found");
            }

            const parsedEvent = this.contract.interface.parseLog(tokenPurchasedEvent);
            console.log("NFT created successfully");

            return {
                tokenId: parsedEvent.args.tokenId.toString(),
                transactionHash: receipt.hash,
                buyer: parsedEvent.args.buyer,
                seller: parsedEvent.args.seller,
                price: ethers.formatEther(parsedEvent.args.price)
            };
        } catch(error) {
            console.log("Error: ", error);
            throw new Error("[Error][Fail] Failed to buy NFT: ", error);
        }
    }

    async getAllNFTs() {
        try {
            // Get raw data from contract
            const [tokenIds, creators, owners, prices, currentlyListeds] = await this.contract.getAllNFTs();
            
            // Map the tuple data to objects
            const nfts = await Promise.all(
                tokenIds.map(async (tokenId, index) => {
                    try {
                        const tokenIdStr = tokenId.toString();
                        // Get token URI and metadata
                        const tokenURI = await this.contract.tokenURI(tokenIdStr);
                        const ipfsUrl = helperFunc.getIPFSUrl(tokenURI);
                        const pinataUrl = helperFunc.getPinataUrl(ipfsUrl);
                        console.log("Pinata URL: ", pinataUrl);
                        const metadata = await axios.get(pinataUrl);
    
                        return {
                            tokenId: tokenIdStr,
                            creator: creators[index],
                            owner: owners[index],
                            price: ethers.formatEther(prices[index]),
                            isListed: currentlyListeds[index],
                            metadata: metadata.data
                        };
                    } catch (error) {
                        console.error(`[Error][Fail] Error processing NFT ${tokenId}:`, error);
                        return null;
                    }
                })
            );
    
            // Filter out any failed NFT processing
            return nfts.filter(nft => nft !== null);
    
        } catch (error) {
            console.error("Error getting all NFTs:", error);
            throw new Error(`[Error][Fail] Failed to get all NFTs: ${error.message}`);
        }
    }

    async getNFTsByOwner(owner) {
        try {
            const [tokenIds, creators, owners, prices, currentlyListeds] = await this.contract.getMyNFTs({ from: owner });

            const nfts = await Promise.all(
                tokenIds.map(async (tokenId, index) => {
                    try {
                        const tokenIdStr = tokenId.toString();
                        // Get token URI and metadata
                        const tokenURI = await this.contract.tokenURI(tokenIdStr);
                        const ipfsUrl = helperFunc.getIPFSUrl(tokenURI);
                        const pinataUrl = helperFunc.getPinataUrl(ipfsUrl);
                        const metadata = await axios.get(pinataUrl);
    
                        return {
                            tokenId: tokenIdStr,
                            creator: creators[index],
                            owner: owners[index],
                            price: ethers.formatEther(prices[index]),
                            isListed: currentlyListeds[index],
                            metadata: metadata.data
                        };
                    } catch (error) {
                        console.error(`[Error][Fail] Error processing NFT ${tokenId}:`, error);
                        return null;
                    }
                })
            );

            return nfts.filter(nft => nft !== null);
        } catch (error) {
            console.error("Error getting NFTs by owner:", error);
            throw new Error(`[Error][Fail] Failed to get NFTs by owner: ${error.message}`);
        }
    }

    async getNFTById(tokenId) {
        try {
            const tokenIdStr = tokenId.toString();
            // Get token URI and metadata
            const tokenURI = await this.contract.tokenURI(tokenIdStr);
            const ipfsUrl = helperFunc.getIPFSUrl(tokenURI);
            const pinataUrl = helperFunc.getPinataUrl(ipfsUrl);
            console.log("Pinata URL: ", pinataUrl);
            const metadata = await axios.get(pinataUrl);

            return {
                tokenId: tokenIdStr,
                metadata: metadata.data
            };
        } catch (error) {
            console.error(`Error getting NFT ${tokenId}:`, error);
            throw new Error(`[Error][Fail] Failed to get NFT ${tokenId}: ${error.message}`);
        }
    }
}

module.exports = new NFTService();