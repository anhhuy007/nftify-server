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
    fs.readFileSync("../datajson/Stamp.json", "utf8")
  );
  const dataUsers = JSON.parse(
    fs.readFileSync("../datajson/Users.json", "utf8")
  );
  const dataCollections = JSON.parse(
    fs.readFileSync("../datajson/Collections.json", "utf8")
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
  const status = ["verified", "pending", "rejected"];
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
  genderArr = ["M", "F"]
  for (const user of data) {
    try {
      // Check if document with this id already exists
      const existingUser = await userModel.findOne({ id: parseInt(user.id) });

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
  collection1 = collectionModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${collection1} collection`
  );
  await collectionModel.collection.dropIndexes();
  await collectionModel.syncIndexes();
  for (const collection of data) {
    try {
      // Check if document with this id already exists
      const existingCollection = await collectionModel.findOne({
        id: parseInt(collection.id),
      });

      if (existingCollection) {
        console.log(`Skipping user with id: ${collection.id} - already exists`);
        continue; // Skip to next item
      }
      // Convert the date format to match your manual entry
      const modifiedCollection = {
        ...collection,
        // id: item.id,
      };
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

async function saveDataItemCollection(data) {
  collection1 = itemCollectionModel.collection.name;
  console.log(
    `Attempting to save ${data.length} items to ${database_name}.${collection1} collection`
  );
  await itemCollectionModel.collection.dropIndexes();
  await itemCollectionModel.syncIndexes();
  for (const itemCollection of data) {
    try {
      // Check if document with this id already exists
      const existingCollection = await itemCollectionModel.findOne({
        id: itemCollection.id,
        itemId: itemCollection.itemId,
      });

      if (existingCollection) {
        console.log(
          `Skipping itemCollection with id: ${itemCollection.id} - already exists`
        );
        continue; // Skip to next item
      }
      // Convert the date format to match your manual entry
      const modifiedItemCollection = {
        ...itemCollection,
        // id: item.id,
      };
      const newItemCollection = new itemCollectionModel(modifiedItemCollection);
      await newItemCollection.save();
      console.log(
        `Saved with id: ${itemCollection.id} to ${database_name}.${collection1}`
      );
    } catch (error) {
      console.error(`Failed to save with id: ${itemCollection.id}`, error);
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
// comment this to run server
// connectDB()
// saveDataUsers(readData().dataUsers)
// .then(() => console.log('Data save process completed.'))
//     .catch((err) => console.error('Error in data saving process:', err))
//     .finally(() => {
//         //
//     });

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
//connectDB()
// Run the update script
//updateStampSchema();

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
    fs.writeFileSync("../datajson/Items.json", itemsData);
    console.log("Items data exported successfully");
  } catch (error) {
    console.error("An error occurred during the exportItemsData process:", error);
  }
}
connectDB()
exportItemsData()
  .then(() => console.log("Data export process completed."))
  .catch((err) => console.error("Error in data export process:", err))
  .finally(() => {
    closeConnectDB();
  });


// connectDB()
// updateCollectionSchema()
//   .then(() => console.log('Data save process completed.'))
//   .catch((err) => console.error('Error in data saving process:', err))
//   .finally(() => {
//     closeConnectDB();
//   });

module.exports = {
  connectDB,
  //saveData,
  closeConnectDB,
};
