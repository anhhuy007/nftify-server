const { ethers } = require("hardhat");
const fs = require("fs");

const BATCH_SIZE = 10; // Process 10 NFTs at a time
const DELAY_BETWEEN_BATCHES = 1000; // 5 seconds delay

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function processBatch(marketplace, batch, batchIndex, totalBatches) {
  console.log(
    `Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} NFTs)`
  );

  try {
    const tx = await marketplace.bulkInitializeNFTs(batch, {
      gasLimit: 5000000,
    });
    console.log(`Batch ${batchIndex + 1} transaction sent:`, tx.hash);

    const receipt = await tx.wait();
    console.log(`Batch ${batchIndex + 1} confirmed!`);
    return true;
  } catch (error) {
    console.error(`Batch ${batchIndex + 1} failed:`, error);
    return false;
  }
}

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log(`Initialize NFTs on marketplace at address: ${address}`);

  const nfts = require("../data/nfts.json");
  const formattedNFTs = nfts.map((nft) => ({
    owner: nft.metamask,
    tokenURI: nft.cid,
    price: ethers.parseEther(nft.price.toString()),
    isListed: true,
  }));

  const batches = chunkArray(formattedNFTs, BATCH_SIZE);
  console.log(
    `Split ${formattedNFTs.length} NFTs into ${batches.length} batches`
  );

  let successfulBatches = 0;
  let failedBatches = [];

  for (let i = 0; i < batches.length; i++) {
    const success = await processBatch(
      marketplace,
      batches[i],
      i,
      batches.length
    );
    if (success) {
      successfulBatches++;
    } else {
      failedBatches.push(i);
    }

    if (i < batches.length - 1) {
      console.log(
        `Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`
      );
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  console.log("\nInitialization Complete!");
  console.log(
    `Successfully processed: ${successfulBatches}/${batches.length} batches`
  );
  if (failedBatches.length > 0) {
    console.log("Failed batch indexes:", failedBatches);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
