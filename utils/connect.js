require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const itemModel = require("../models/stamp.schema");
const userModel = require("../models/user.schema");
const collectionModel = require("../models/collection.schema");
const accountModel = require("../models/account.schema");
const itemInsightModel = require("../models/itemInsight.schema");
const ownershipModel = require("../models/ownership.schema");
const itemPricingModel = require("../models/itemPricing.schema");
const fs = require("fs");
const helperFunc = require("./helperFunc");
const ipfsService = require("../services/ipfs.service");
const stampService = require("../services/stamp.service");

const connect_url = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@nftify-1.omipa.mongodb.net/`;
const database_name = "NFTify_1";
let collection1 = "collectionName";

async function connectDB() {
  try {
    await mongoose.connect(connect_url, {
      dbName: database_name, // Explicitly specify database name
    });
    console.log("Connected to MongoDB - Database: ", database_name);

    mongoose.connection.once("open", async () => {
      // Verify the connection and collection
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      console.log(
        "Available collections:",
        collections.map((c) => c.name)
      );
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// get documents id from database and save to file
async function createTableDocumentsIdFile(tableName, outputFileName) {
  const stamps = await tableName.find({});
  const stampIds = stamps.map((stamp) => stamp.id);
  fs.writeFileSync(
    `../testing_data/${outputFileName}.json`,
    JSON.stringify(stampIds)
  );
}

// get documents id from database and return array
async function getDocumentsId(objectModel) {
  const stamps = await objectModel.find({});
  const stampIds = stamps.map((stamp) => stamp.id);

  return stampIds;
}

// data from file
function readData() {
  const dataItems = JSON.parse(
    fs.readFileSync("../testing_data/Stamps.json", "utf8")
  );
  const dataUsers = JSON.parse(
    fs.readFileSync("../datajson/Users.json", "utf8")
  );
  const dataCollections = JSON.parse(
    fs.readFileSync("../testing_data/collection_data.json", "utf8")
  );
  const dataItemCollections = JSON.parse(
    fs.readFileSync("../datajson/ItemCollection.json", "utf8")
  );
  const dataAccounts = JSON.parse(
    fs.readFileSync("../datajson/Account.json", "utf8")
  );
  return {
    dataItems,
    dataUsers,
    dataCollections,
    dataItemCollections,
    dataAccounts,
  };
}

async function saveStampData(data) {
  items = itemModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${items} collection`
  );

  await itemModel.collection.dropIndexes();
  await itemModel.syncIndexes();

  for (const item of data) {
    try {
      // check existing item by name
      const existingItem = await itemModel.findOne({ title: item.title });
      if (existingItem) {
        console.log(`Skipping item with title: ${item.title} - already exists`);
        continue;
      }

      const creatorId = await getDocumentsId(userModel);

      const modifiedItem = {
        ...item,
        creatorId: creatorId[Math.floor(Math.random() * creatorId.length)],
        denom: ((Math.round(Math.random() * 10000) + 1) / 100).toFixed(2),
        date: helperFunc.randomDates("01/01/1900", "01/01/2000"),
      };

      const newItem = new itemModel(modifiedItem);
      await newItem.save();
      console.log(
        `Saved with title: ${item.title} to ${database_name}.${items}`
      );
    } catch (error) {
      console.error(`Failed to save with title: ${item.title}`, error);
    }
  }
}

async function saveItemInsightData() {
  items = itemInsightModel.collection.name;
  console.log(
    `Attempting to save items to ${database_name}.${items} collection`
  );

  await itemInsightModel.collection.dropIndexes();
  await itemInsightModel.syncIndexes();

  const stampIds = await getDocumentsId(itemModel);
  const status = ["verified", "selling", "displaying", "unverified"];
  for (const stampId of stampIds) {
    try {
      const modifiedItemInsight = {
        itemId: stampId,
        verifyStatus: status[Math.floor(Math.random() * status.length)],
        favoriteCount: Math.floor(Math.random() * 1000) + 1,
        viewCount: Math.floor(Math.random() * 1000) + 1,
      };

      const newItemInsight = new itemInsightModel(modifiedItemInsight);
      await newItemInsight.save();
      console.log(`Saved with itemId: ${stampId} to ${database_name}.${items}`);
    } catch (error) {
      console.error(`Failed to save with itemId: ${stampId}`, error);
    }
  }
}


async function saveDataUsers(data) {
  collection1 = userModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${collection1} collection`
  );
  await userModel.collection.dropIndexes();
  await userModel.syncIndexes();
  genderArr = ["M", "F"];
  for (const user of data) {
    try {
      // Check if document with this id already exists
      const existingUser = await userModel.findOne({ id: user._id });

      if (existingUser) {
        console.log(`Skipping user with id: ${user.id} - already exists`);
        continue; // Skip to next item
      }
      // Convert the date format to match your manual entry
      const modifiedUser = {
        ...user,
        gender: genderArr[await Math.floor(Math.random() * 2)],
        // id: item.id,
      };
      const newUser = new userModel(modifiedUser);
      await newUser.save();
      console.log(
        `Saved with id: ${user.id} to ${database_name}.${collection1}`
      );
    } catch (error) {
      console.error(`Failed to save with id: ${user.id}`, error);
    }
  }
}

async function closeConnectDB() {
  console.log("Closing connection to MongoDB");
  await mongoose.connection.close();
}

async function saveDataCollection(data) {
  const stampIds = await getDocumentsId(itemModel);
  const userIds = await getDocumentsId(userModel);

  // shuffle the stampIds
  helperFunc.shuffleArray(stampIds);

  collection1 = collectionModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${collection1} collection`
  );

  await collectionModel.collection.dropIndexes();
  await collectionModel.syncIndexes();

  const status = ["selling", "sold", "displaying"];
  let i = 0; let count = 0;
  const len = stampIds.length / data.length;
  for (const collection of data) {
    try {
      // Check if document with this id already exists
      // const existingCollection = await collectionModel.findOne({
      //   id: collection.id,
      // });

      // if (existingCollection) {
      //   console.log(
      //     `Skipping collection with id: ${collection.id} - already exists`
      //   );
      //   continue; // Skip to next item
      // }

      const modifiedCollection = {
        ...collection,
        ownerId: userIds[count % userIds.length],
        items: stampIds.slice(i, i + len),
        status: status[Math.floor(Math.random() * status.length)],
        viewCount: Math.floor(Math.random() * 1000) + 1,
        favouriteCount: Math.floor(Math.random() * 1000) + 1,
        createdAt: helperFunc.randomDates("01/10/2024", "01/12/2024"),
      };
      i += len;
      count += 1;

      const newCollection = new collectionModel(modifiedCollection);
      await newCollection.save();
      console.log(
        `Saved with id: ${collection.id} to ${database_name}.${collection1}`
      );
    } catch (error) {
      console.error(`Failed to save with id: ${collection.id}`, error);
    }
  }
}

async function saveDataAccount(data) {
  collection1 = accountModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${collection1} collection`
  );
  await accountModel.collection.dropIndexes();
  await accountModel.syncIndexes();
  for (const account of data) {
    try {
      // Check if document with this id already exists
      const existingAccount = await accountModel.findOne({
        id: account.id,
      });

      if (existingAccount) {
        console.log(`Skipping account with id: ${account.id} - already exists`);
        continue; // Skip to next item
      }
      // Convert the date format to match your manual entry
      const modifiedaccount = {
        ...account,
        createdAt: helperFunc.randomDates("01/10/2024", "01/12/2024"),
      };
      const newaccount = new accountModel(modifiedaccount);
      await newaccount.save();
      console.log(
        `Saved with id: ${account.id} to ${database_name}.${collection1}`
      );
    } catch (error) {
      console.error(`Failed to save with id: ${account.id}`, error);
    }
  }
}

async function saveGeneratedOwnership() {
  try {
    const ownership = ownershipModel.collection.name;
    console.log(`Attempting to save ownership to ${database_name}.${ownership} collection`);

    await ownershipModel.collection.dropIndexes();
    await ownershipModel.syncIndexes();

    const stampIds = await getDocumentsId(itemModel);
    const ownerIds = await getDocumentsId(userModel);

    for (const item of stampIds) {
      try {
        const modifiedOwnership = {
          itemId: item,
          ownerId: ownerIds[Math.floor(Math.random() * ownerIds.length)],
        };

        const newOwnership = new ownershipModel(modifiedOwnership);
        await newOwnership.save();
        console.log(`Saved with itemId: ${item} to ${database_name}.${ownership}`);
      } catch (error) {
        console.error(`Failed to save with itemId: ${item}`, error);
      }
    }
  } catch (error) {
    console.error('An error occurred during the saveGeneratedOwnership process:', error);
  }
}

async function saveGeneratedItemPrice() {
  try {
    const itemPricing = itemPricingModel.collection.name;
    console.log(`Attempting to save itemPricing to ${database_name}.${itemPricing} collection`);

    await itemPricingModel.collection.dropIndexes();
    await itemPricingModel.syncIndexes();

    const stampIds = await getDocumentsId(itemModel);

    for (const item of stampIds) {
      try {
        const modifiedItemPricing = {
          itemId: item,
          price: ((Math.round(Math.random() * 10000) + 1) / 100).toFixed(2),
          currency: 'ETH',
        };

        const newItemPricing = new itemPricingModel(modifiedItemPricing);
        await newItemPricing.save();
        console.log(`Saved with itemId: ${item} to ${database_name}.${itemPricing}`);
      } catch (error) {
        console.error(`Failed to save with itemId: ${item}`, error);
      }
    }
  } catch (error) {
    console.error('An error occurred during the saveGeneratedItemPrice process:', error);
  }
}

async function updateStampSchema() {
  try {
    console.log('Starting schema update for items collection');
    
    // Get all existing items
    const items = await itemModel.find({});
    console.log(`Found ${items.length} items to update`);
      try {
        // Update all documents to remove the `thumbUrl` field
      const result = await itemModel.updateMany({}, { $unset: { thumbUrl: "" } });
      console.log(`Documents updated: ${result.modifiedCount}`);
  }   catch (error) {
      console.error("Error updating schema:", error);
  }   finally {
      // Close the database connection
      await mongoose.disconnect();
      console.log("Database connection closed");
  }
  } catch (error) {
    console.error('An error occurred during the updateStampSchema process:', error);
  }
}

async function updateCollectionSchema(){
  const collections = await collectionModel.find({});
  console.log(`Found ${collections.length} collections to update`);

  for (const collection of collections) {
    try {
      await collectionModel.updateOne(
        { _id: collection._id },
        {
          $set: {
            thumbUrl: "default url",
          },
        }
      );
      console.log(`Updated schema for collection ${collection._id}`);
    } catch (err) {
      console.error(`Failed to update collection ${collection._id}:`, err);
    }
  }


}

async function exportItemsData() {
  try {
    const items = await itemModel.find({});
    const itemsData = JSON.stringify(items, null, 2);
    fs.writeFileSync("../datajson/Stamps.json", itemsData);
    console.log("Items data exported successfully");
  } catch (error) {
    console.error("An error occurred during the exportItemsData process:", error);
  }
}

async function exportUsersData() {
  try {
    const users = await userModel.find({});
    const usersData = JSON.stringify(users, null, 2);
    fs.writeFileSync("../datajson/Users.json", usersData);
    console.log("Users data exported successfully");
  } catch (error) {
    console.error("An error occurred during the exportUsersData process:", error);
  }
}

async function updateURLCollection() {
  const thumbUrls = [
    "https://preview.redd.it/timeskip-boruto-art-by-v0-d25xyhlzbhib1.jpg?auto=webp&s=8d65ea78cb1d1ff1758d2a6cc817291364204786",
    "https://free-images.com/lg/96ec/anime_fig_anime_figures_4.jpg",
    "https://free-images.com/lg/c5d8/anime_fig_anime_figures_3.jpg",
    "https://free-images.com/lg/f52e/anime_fig_anime_figures.jpg",
    "https://cdn.pixabay.com/photo/2022/12/01/04/43/girl-7628308_1280.jpg",
    "https://cdn.pixabay.com/photo/2022/12/01/04/40/backpacker-7628303_1280.jpg",
    "https://cdn.pixabay.com/photo/2024/05/09/08/07/ai-generated-8750163_1280.jpg",
    "https://cdn.pixabay.com/photo/2024/01/10/13/13/ai-generated-8499585_960_720.png",
    "https://cdn.pixabay.com/photo/2024/05/09/08/07/ai-generated-8750161_1280.jpg"
  ];

  try {
    const collections = await collectionModel.find({});
    console.log(`Found ${collections.length} collections to update`);

    const updatePromises = collections.map(async (collection) => {
      const randomThumbUrl = thumbUrls[Math.floor(Math.random() * thumbUrls.length)];

      try {
        await collectionModel.updateOne(
          { _id: collection._id },
          {
            $set: {
              thumbUrl: randomThumbUrl,
            },
          }
        );
        console.log(`Updated collection ${collection._id} with thumb URL: ${randomThumbUrl}`);
        return collection._id;
      } catch (err) {
        console.error(`Failed to update collection ${collection._id}:`, err);
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    
    // Filter out any failed updates
    const successfulUpdates = results.filter(result => result !== null);
    
    console.log(`Successfully updated ${successfulUpdates.length} out of ${collections.length} collections`);
  } catch (error) {
    console.error('An error occurred during the updateURLCollection process:', error);
    throw error;
  }
}

async function deleteAllUsers() {
  try {
    await connectDB();
    const result = await userModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
  } catch (error) {
    console.error('Error deleting users:', error);
  }
}

async function getCIDbyIdUsingLog(id) {
  try {
    // convert to string
    const stringId = id.toString();
    // Read log file
    const data = fs.readFileSync("../logs/metadata.log", "utf8");
    const lines = data.trim().split("\n");
    
    for (const line of lines) {
      const [stampId, cid] = line.split(": ");
      
      if (stampId.toString().trim() === stringId.toString().trim()) {
        return cid.trim();
      }
    }
    
    // cannot find CID
    console.log(`No CID found for stamp ID: ${stringId}`);
    return null;
  } catch (error) {
    console.error(`Error reading metadata log for ID ${id}:`, error);
    throw error;
  }
}

async function updateStampTokenUrl() {
  try {
    const items = await itemModel.find({});
    console.log(`Found ${items.length} items to update`);

    const updatePromises = items.map(async (item) => {
      try {
        // Upload stamp metadata to IPFS

        CID = (await ipfsService.uploadStampMetadata(item)).IpfsHash;

        // Update cid
        await itemModel.updateOne(
          { _id: item._id },
          {
            $set: {
              tokenUrl: existingCID,
            },
          }
        );
        
        console.log(`Updated item ${item._id} with token URL: ${existingCID}`);
        return item._id;
      } catch (err) {
        console.error(`Failed to update item ${item._id}:`, err);
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    
    const successfulUpdates = results.filter(result => result !== null);
    
    console.log(`Successfully updated ${successfulUpdates.length} out of ${items.length} items`);
  } catch (error) {
    console.error('An error occurred during the updateStampTokenUrl process:', error);
    throw error;
  }
}

async function reGenerateCreatorId() {
  try {
    const items = await itemModel.find({});
    console.log(`Found ${items.length} items to update`);

    const creatorIds = await getDocumentsId(userModel);

    const updatePromises = items.map(async (item) => {
      try {
        const newCreatorId = creatorIds[Math.floor(Math.random() * creatorIds.length)];
        
        // Update creatorId
        await itemModel.updateOne(
          { _id: item._id },
          {
            $set: {
              creatorId: newCreatorId,
            },
          }
        );
        
        console.log(`Updated item ${item._id} with creatorId: ${newCreatorId}`);
        return item._id;
      } catch (err) {
        console.error(`Failed to update item ${item._id}:`, err);
        return null;
      }
    });

    const results = await Promise.all(updatePromises);
    
    const successfulUpdates = results.filter(result => result !== null);
    
    console.log(`Successfully updated ${successfulUpdates.length} out of ${items.length} items`);
  } catch (error) {
    console.error('An error occurred during the reGenerateCreatorId process:', error);
    throw error;
  }
}

async function deleteItemNotMatch(){
  try {
    const items = await itemModel.find({});
    const stampList = JSON.parse(fs.readFileSync("../datajson/Stamps.json", "utf8"));
    const stampIds = stampList.map((stamp) => stamp._id);
    console.log(`Found ${items.length} items to update`);

    const updatePromises = items.map(async (item) => {
      try {
        if (!stampIds.includes(item._id)) {
          // Delete item
          await itemModel.deleteOne({ _id: item._id });
          console.log(`Deleted item ${item._id}`);
          return item._id;
        }
      } catch (err) {
        console.error(`Failed to delete item ${item._id}:`, err);
      }
    });

    const results = await Promise.all(updatePromises);
    
    const successfulUpdates = results.filter(result => result !== null);
    
    console.log(`Successfully deleted ${successfulUpdates.length} out of ${items.length} items`);
  } catch (error) {
    console.error('An error occurred during the deleteItemNotMatch process:', error);
    throw error;
  }
}

async function saveStampDataFromJson(data) {
  const items = itemModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${items} collection`
  );

  try {
    await itemModel.collection.dropIndexes();
    await itemModel.syncIndexes();

    const creatorIds = await getDocumentsId(userModel);

    for (const item of data) {
      try {
        // Check existing item by title
        const existingItem = await itemModel.findOne({ title: item.title });
        if (existingItem) {
          console.log(`Skipping item with title: ${item.title} - already exists`);
          continue;
        }

        // Get token URL from IPFS
        const uploadedMetadata = await ipfsService.uploadStampMetadata(item);
        const tokenUrl = uploadedMetadata.IpfsHash;

        const modifiedItem = {
          ...item,
          creatorId: creatorIds[Math.floor(Math.random() * creatorIds.length)],
          denom: ((Math.round(Math.random() * 10000) + 1) / 100).toFixed(2),
          date: helperFunc.randomDates("01/01/1900", "01/01/2000"),
          tokenUrl: tokenUrl,
        };

        const newItem = new itemModel(modifiedItem);
        await newItem.save();
        console.log(
          `Saved with title: ${item.title} to ${database_name}.${items}`
        );
      } catch (error) {
        console.error(`Failed to save with title: ${item.title}`, error);
      }
    }
  } catch (mainError) {
    console.error('An error occurred during the saveStampData process:', mainError);
    throw mainError;
  }
}

async function deleteRecords() {
  try {
    // đổi model cần xóa, tốt nhất là không nên dùng:)))))
    const result = await itemInsightModel.deleteMany({ });
    console.log('Delete operation successful:', result);
  } catch (error) {
    console.error('Error deleting records:', error);
  }
}



const marketplaceService = require("../services/marketplace.service");
const { connect } = require("http2");


async function createTransactionJson() {
  try {
    const items = await itemModel.find({});
    const transactions = [];

    for (const item of items) {
      const stamp = await marketplaceService.getStampById(item._id);
      const ownerId = stamp.ownerId;
      const creatorId = stamp.creatorId;

      console.log('itemId:', item._id);
      console.log('ownerId:', ownerId);
      console.log('creatorId:', creatorId);
      console.log('---------------------------------');
      if (ownerId !== creatorId) {
        const transaction = {
          itemId: item._id,
          ownerId: ownerId,
          creatorId: creatorId,
        };
        transactions.push(transaction);
      }
    }

    fs.writeFileSync("../datajson/Transactions.json", JSON.stringify(transactions, null, 2));
    console.log('Transactions data exported successfully');
    
  } catch (error) {
    console.error('An error occurred during the createTransactionJson process:', error);
    throw error;
  }
}


async function saveGeneratedCollections(){
  try {
    const collections = await collectionModel.find({});
    console.log(`Found ${collections.length} collections to update`);
    i = 0;
    // Update item ids in each collection
    for (const collection of collections) {
      const stampIds = await getDocumentsId(itemModel);
      const len = stampIds.length / collections.length;
      const modifiedCollection = {
        ...collection,
        items: stampIds.slice(i, i + len),
      };

      await collectionModel.updateOne(
        { _id: collection._id },
        {
          $set: {
            items: modifiedCollection.items,
          },
        }
      );
      console.log(`Updated collection ${collection._id}`);
      i += len;
    }
  } catch (error) {
    console.error('An error occurred during the saveGeneratedCollections process:', error);
  }
}

async function addUserBGColumn() {
  try {
    const users = await userModel.find({});
    console.log(`Found ${users.length} users to update`);

    for (const user of users) {
      await userModel.updateOne(
        { _id: user._id },
        {
          $set: {
            bgUrl: "https://plum-glamorous-cephalopod-335.mypinata.cloud/ipfs/bafybeicr3a52vtv56ft6aec2qoxalk3ozi47qyufiwnbroacsw5upxrlha",
          },
        }
      );
      console.log(`Updated item ${user._id}`);
    }
  } catch (error) {
    console.error('An error occurred during the addBGColumn process:', error);
  }
}

async function getOwnedStamps(userID) {
  try {
    const ownedStamps = await ownershipModel.find({ ownerId: userID });
    console.log(`Found ${ownedStamps.length} stamps owned by user ${userID}`);
    return ownedStamps;
  }
  catch (error) {
    console.error('An error occurred during the getOwnedStamps process:', error);
    throw error;
  }
  
}

async function setOwnerSameAsCreator() {
  try {
    const ownerships = await ownershipModel.find({});
    console.log(`Found ${ownerships.length} ownership records to update`);

    for (const own of ownerships) {
      const item = await itemModel.findById(own.itemId).lean();
      if (item) {
        await ownershipModel.updateOne(
          { _id: own._id },
          { $set: { ownerId: item.creatorId } }
        );
        console.log(`Updated ownership record ${own._id} with ownerId ${item.creatorId}`);
      } else {
        console.log(`Item with ID ${own.itemId} not found`);
      }
    }
  } catch (error) {
    console.error('An error occurred during the setOwnerSameAsCreator process:', error);
  }
}

async function generateFavorite(params, min = 5, max = 35) {
  try {
    const favouriteModel = require("../models/favouriteItem.schema");
    const userIds = await getDocumentsId(userModel);
    const stampIds = await getDocumentsId(itemModel);

    console.log('Found', userIds.length, 'users and', stampIds.length, 'stamps');

    for (const user of userIds) {
      const itemCount = Math.floor(Math.random() * (max - min + 1)) + min;
      const items = stampIds.sort(() => 0.5 - Math.random()).slice(0, itemCount);

      const favourite = await favouriteModel.findOne({ userId: user });
      if (favourite) {
        favourite.itemId.push(...items);
        await favourite.save();
      } else {
        const newFavourite = new favouriteModel({
          userId: user,
          itemId: items,
        });
        await newFavourite.save();
      }
      console.log('Generated favourite items for user', user);
    }
  } catch (error) {
    console.error('An error occurred during the generateFavorite process:', error);
    throw error;
  }
}

async function updateBalancedPrice(maxPrice = 10, minPrice = 0.1) {
  try {
    const items = await itemPricingModel.find({});
    console.log(`Found ${items.length} items to update`);

    for (const item of items) {
      const price = minPrice + (maxPrice - minPrice) * Math.random();
      await itemPricingModel.updateOne(
        { _id: item._id },
        { $set: { price: price.toFixed(2) } }
      );
      console.log(`Updated item ${item._id} with price: ${price.toFixed(2)}`);
    }
  } catch (error) {
    console.error('An error occurred during the updateBalancedPrice process:', error);
    throw error;
  }
}

async function exportBlockData(){
  try {
    const items = await itemModel.find({});
    const itemsPrice = await itemPricingModel.find({});
    const itemsInsight = await itemInsightModel.find({});
    const itemsOwnership = await ownershipModel.find({});
    let itemsData = [];
    console.log("Found", items.length, "items");

    for (const item of items){
      const itemPrice = itemsPrice.find((price) => price.itemId.toString() === item._id.toString());
      const itemInsight = itemsInsight.find((insight) => insight.itemId.toString() === item._id.toString());
      const itemOwnership = itemsOwnership.find((ownership) => ownership.itemId.toString() === item._id.toString());
      const user = await userModel.findById(item.creatorId);

      const itemData = {
        cid: "https://plum-glamorous-cephalopod-335.mypinata.cloud/ipfs/"+ item.tokenUrl,
        price: parseFloat(itemPrice.price),
        sellingStatus: itemInsight.verifyStatus === "selling",
        metamaskAddress: user.wallet_address,
      };

      itemsData.push(itemData);
      console.log("Exported item with ID:", item._id);
    }
    console.log("Exported", itemsData.length, "items to BlockData.json");

    fs.writeFileSync("../datajson/BlockData.json", JSON.stringify(itemsData, null, 2));

  } catch (error) {
    console.error("An error occurred during the exportBlockData process:", error);
  }
}

// connectDB();
// exportBlockData();

// connectDB();
// updateBalancedPrice();

// connectDB();
// generateFavorite();
// connectDB();
// setOwnerSameAsCreator();

// connectDB()
// getOwnedStamps("673876c24af03358be502d87")
// connectDB();
// addUserBGColumn();

// connectDB();
// saveGeneratedCollections();

// connectDB();
// createTransactionJson();



// connectDB();
// deleteRecords();


module.exports = {
  connectDB,
  //saveData,
  closeConnectDB,
};
