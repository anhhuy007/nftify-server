const jsend = require('jsend');

const ItemModel = require('../models/Items.model');

const asyncHandler = require("express-async-handler");

// funtion that return respond based on error or success
function respondPOSTItem(res, status, data, errorMessage) {
    res.send(jsend(status, data, errorMessage));
} 
exports.createItem = asyncHandler( async (req, res, next) => 
{
    const item = req.body;
    console.log('Received item:', item);    
    // Check if document with this id already exists
    const existingItem = await ItemModel.findOne({ id: parseInt(item.id) });
    if (existingItem) {
        console.log(`item with id: ${item.id} - already exists`);

        return respondPOSTItem(res, 409, null, `item with id: ${item.id} - already exists`);
    }
    // Convert the date format to match your manual entry
    try {
        const modifiedItem = {
            ...item,
            id: parseInt(item.id)
        };
        const newItem = new ItemModel(modifiedItem);
        await newItem.save();
        
        console.log(`Saved item with id: ${item.id}`);
        respondPOSTItem(res, 201, newItem, null);
    } catch (error) {
        console.error(`Failed to save item with id: ${item.id}`, error);
        respondPOSTItem(res, 500, null, `Failed to save item with id: ${item.id}, ${error.message}`);
    }
});
exports.getByID = asyncHandler( async (req, res, next) => 
{
    // Explicitly extract the ID parameter
    const ItemId = req.params.id;
    console.log('Extracted ItemId:', ItemId);
    if (!ItemId) {
        console.error('Item ID not provided');
        return respondPOSTItem(res, 400, null, 'Item ID not provided');
    }
    // Check if document with this id already exists
    const existingItem = await ItemModel.findOne({ id: parseInt(ItemId) });
    if (!existingItem) {
        console.log(`item with id: ${ItemId} - does not exist`);
        return respondPOSTItem(res, 404, null, `Item with id: ${ItemId} does not exist`);
    }
    respondPOSTItem(res, 200, existingItem, null);
});

