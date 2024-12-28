const { ethers } = require("hardhat");
const fs = require("fs");
const { create } = require("../../models/stamp.schema");


const itemModel = require("../../models/stamp.schema");
const itemPricingModel = require("../../models/itemPricing.schema");
const itemInsightModel = require("../../models/itemInsight.schema");
const userModel = require("../../models/user.schema");
const connect = require("../../utils/connect");
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

async function createNFTsJson() {
  try {
    const items = await itemModel.find({});
    
    const itemPrice = await itemPricingModel.find({});
    const itemInsights = await itemInsightModel.find({});
    const users = await userModel.find({});

    console.log(`Found ${users.length} users`);
    const data = [];

    for (const item of items) {
      var price = itemPrice.find((p) => String(p.itemId) === String(item._id));
      // price = parseFloat(price)
      
      const user = users.find((u) => String(u._id) === String(item.creatorId));
      const verified = itemInsights.find((i) => String(i.itemId) === String(item._id));

      if (!user) {
        console.log(`Debug - creatorId: ${item.creatorId}`);
        console.log(`Debug - available user IDs: ${users.map(u => u._id).join(', ')}`);
        console.log(`Skipping item ${item._id} - User not found for creatorId: ${item.creatorId}`);
        continue;
      }

      data.push({
        cid: item.tokenUrl,
        tokenID: item.tokenID,
        metamask: user.wallet_address || null,
        price: price ? parseFloat(price.price) : null,
        status: verified ? verified.verifyStatus : null,
      });
    }

    console.log(`Processed ${data.length} items successfully`);
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '..', 'data', 'nfts.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Blocks data exported successfully to ${outputPath}`);
  } catch (error) {
    console.error("An error occurred during the exportBlocksData process:", error);
    throw error;
  }
}

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log(`Initialize NFTs on marketplace at address: ${address}`);

  console.log("Creating NFTs JSON...");
  connect.connectDB();
  const blocks = await createNFTsJson();
  connect.closeConnectDB();

  console.log("Reading NFTs JSON...");
  const nfts = require("../data/nfts.json");
  const formattedNFTs = nfts.map((nft) => ({
    owner: nft.metamask,
    tokenURI: nft.cid,
    price: ethers.parseEther(nft?.price?.toString() ?? "0"),
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
