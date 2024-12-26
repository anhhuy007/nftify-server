const { ethers } = require("hardhat");

async function formatNFTResponse([
  tokenIds,
  tokenURIs,
  creators,
  owners,
  prices,
  currentlyListeds,
]) {
  return tokenIds.map((id, index) => ({
    tokenId: Number(id),
    tokenURI: tokenURIs[index],
    creator: creators[index],
    owner: owners[index],
    price: ethers.formatEther(prices[index]),
    currentlyListed: currentlyListeds[index],
  }));
}

async function main() {
  // Get contract instance
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.attach(
    "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
  );

  console.log("Fetching all NFTs...");

  try {
    console.log("Fetching NFTs...");
    const nfts = await marketplace.getAllNFTs();

    // Verify data returned
    if (!nfts || nfts.tokenIds.length === 0) {
      console.log("No NFTs found in marketplace");
      return;
    }

    const formattedNFTs = await formatNFTResponse(nfts);
    console.log("\nNFT Status Summary:");
    console.log("-------------------");
    console.log(`Total NFTs: ${formattedNFTs.length}`);

    // Count statistics
    const listedCount = formattedNFTs.filter(
      (nft) => nft.currentlyListed
    ).length;
    const uniqueOwners = new Set(formattedNFTs.map((nft) => nft.owner)).size;
    const uniqueCreators = new Set(formattedNFTs.map((nft) => nft.creator))
      .size;

    console.log(`Listed NFTs: ${listedCount}`);
    console.log(`Unlisted NFTs: ${formattedNFTs.length - listedCount}`);
    console.log(`Unique Owners: ${uniqueOwners}`);
    console.log(`Unique Creators: ${uniqueCreators}`);

    // Detail check
    console.log("\nDetailed NFT Listing:");
    console.log("-------------------");
    formattedNFTs.forEach((nft) => {
      console.log(`\nToken ID: ${nft.tokenId}`);
      console.log(`URI: ${nft.tokenURI}`);
      console.log(`Price: ${nft.price} ETH`);
      console.log(`Listed: ${nft.currentlyListed}`);
      console.log(`Owner: ${nft.owner}`);
      console.log(`Creator: ${nft.creator}`);
    });
  } catch (error) {
    console.error("Failed to fetch NFTs:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
