require('dotenv').config();
const mongoose = require('mongoose');
const itemModel = require('./models/items.model'); 
const userModel = require('./models/users.model');
const collectionModel = require('./models/collections.model');

const fs = require('fs');
const helperFunc = require ('./helperFunc');


const connect_url = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@nftify-1.omipa.mongodb.net/`
const database_name = "NFTify_1"
let collection1 = "collectionName"
async function connectDB() {
    try {
        await mongoose.connect(connect_url, {
            dbName: database_name // Explicitly specify database name
        });
        console.log('Connected to MongoDB - Database: ', database_name);
        
        // Verify the connection and collection
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
}
// data from file
const dataItems = JSON.parse(fs.readFileSync('testing_data/stamps.json', 'utf8'));
const dataUsers = JSON.parse(fs.readFileSync('datajson/Users.json', 'utf8'));
const dataCollections = JSON.parse(fs.readFileSync('datajson/Collections.json', 'utf8'));

async function saveData(data) {
    collection1 = itemModel.collection.name;
    console.log(`Attempting to save ${data.length} items to ${database_name}.${collection1} collection`);
    await itemModel.collection.dropIndexes();
    await itemModel.syncIndexes();
    for (const item of data) {
        try {
            // Check if document with this id already exists
            const existingItem = await itemModel.findOne({ id: parseInt(item.id) });

            if (existingItem) {
                console.log(`Skipping item with id: ${item.id} - already exists`);
                continue; // Skip to next item
            }
            // Convert the date format to match your manual entry
            const modifiedItem = {
                ...item,
                id: item.id, // Convert id to number
                creatorId : Math.floor(Math.random() * 3)+1,
                denom : ((Math.round(Math.random() * 10000) + 1 )/100).toFixed(2),
                date: helperFunc.randomDates('01/01/1900', '01/01/2000'),
                createdAt: helperFunc.randomDates('01/01/2022', '01/12/2024'),
            };
            const newItem = new itemModel(modifiedItem);
            await newItem.save();
            console.log(`Saved with id: ${item.id} to ${database_name}.${collection1}`);
        } catch (error) {
            console.error(`Failed to save with id: ${item.id}`, error);
        }
    }
}

async function saveDataUsers(data) {
    collection1 = userModel.collection.name;
    console.log(`Attempting to save ${data.length} items to ${database_name}.${collection1} collection`);
    await userModel.collection.dropIndexes();
    await userModel.syncIndexes();
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
                // id: item.id,
            };
            const newUser = new userModel(modifiedUser);
            await newUser.save();
            console.log(`Saved with id: ${user.id} to ${database_name}.${collection1}`);
        } catch (error) {
            console.error(`Failed to save with id: ${user.id}`, error);
        }
    }
}

async function closeConnectDB() {
    console.log('Closing connection to MongoDB');
    await mongoose.connection.close();
}

async function saveDataCollection(data) {
    collection1 = collectionModel.collection.name;
    console.log(`Attempting to save ${data.length} items to ${database_name}.${collection1} collection`);
    await collectionModel.collection.dropIndexes();
    await collectionModel.syncIndexes();
    for (const collection of data) {
        try {
            // Check if document with this id already exists
            const existingCollection = await collectionModel.findOne({ id: parseInt(collection.id) });

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
            console.log(`Saved with id: ${collection.id} to ${database_name}.${collection1}`);
        } catch (error) {
            console.error(`Failed to save with id: ${collection.id}`, error);
        }
    }
}
// comment this to run server
// connectDB()
// saveDataCollection(dataCollections)
// .then(() => console.log('Data save process completed.'))
//     .catch((err) => console.error('Error in data saving process:', err))
//     .finally(() => {
//         //
//     });

module.exports = {
    connectDB,
    saveData,
    closeConnectDB
}