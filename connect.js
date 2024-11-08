require('dotenv').config();
const mongoose = require('mongoose');
const itemModel = require('./models/items.model');  // No need for '.js' extension
const fs = require('fs');


const connect_url = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@nftify-1.omipa.mongodb.net/`
const database_name = "NFTify_1"
const collection1 = "Items"
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

const data = JSON.parse(fs.readFileSync('testing_data/stamps2.json', 'utf8'));


async function saveData(data) {
    console.log(`Attempting to save ${data.length} items to ${database_name}.${collection1} collection`);
    
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
                id: parseInt(item.id), // Convert id to number
                denom : ((Math.round(Math.random() * 10000) + 1 )/100).toFixed(2)
            };
            const newItem = new itemModel(modifiedItem);
            await newItem.save();
            console.log(`Saved item with id: ${item.id} to ${database_name}.${collection1}`);
        } catch (error) {
            console.error(`Failed to save item with id: ${item.id}`, error);
        }
    }
}

async function closeConnectDB() {
    console.log('Closing connection to MongoDB');
    await mongoose.connection.close();


}
// connectDB()
// saveData(data).then(() => console.log('Data save process completed.'))
//     .catch((err) => console.error('Error in data saving process:', err))
//     .finally(() => {
//         closeConnectDB()
//     });

module.exports = {
    connectDB,
    saveData,
    closeConnectDB
}