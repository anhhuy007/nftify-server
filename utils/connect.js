require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const itemModel = require("../models/stamp.schema");
const userModel = require("../models/user.schema");
const accountModel = require("../models/account.schema");
const itemInsightModel = require("../models/itemInsight.schema");
const collectionModel = require("../models/collection.schema");

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
    fs.readFileSync("../testing_data/stamps.json", "utf8")
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
  genderArr = ["M", "F"];
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
// comment this to run server
// connectDB();
// saveDataCollection(readData().dataCollections).then(() => {
//   closeConnectDB();
// });

module.exports = {
  connectDB,
  saveStampData,
  closeConnectDB,
};
