const jsend = require('jsend');
const itemModel = require('../models/items.model');
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
    const existingItem = await itemModel.findOne({ id: parseInt(item.id) });
    if (existingItem) {
        console.log(`item with id: ${item.id} - already exists`);

        return respondPOSTItem(res, 409, `item with id: ${item.id} - already exists`, null);
    }
    // Convert the date format to match your manual entry
    try {
        const modifiedItem = {
            ...item,
            id: parseInt(item.id)
        };
        const newItem = new itemModel(modifiedItem);
        await newItem.save();
        
        console.log(`Saved item with id: ${item.id}`);
        respondPOSTItem(res, 201, newItem, null);
    } catch (error) {
        console.error(`Failed to save item with id: ${item.id}`, error);
        respondPOSTItem(res, 500, `Failed to save item with id: ${item.id}, ${error.message}`);
    }
});
exports.getByID = asyncHandler( async (req, res, next) => 
{
    //show collection 
    console.log('Collection name:', itemModel.collection.name);
    // Explicitly extract the ID parameter
    const ItemId = req.params.id;
    console.log('Extracted ItemId:', ItemId);
    if (!ItemId) {
        console.error('Item ID not provided');
        return respondPOSTItem(res, 400, null, 'Item ID not provided');
    }
    // Check if document with this id already exists
    const existingItem = await itemModel.findOne({ id: parseInt(ItemId) });
    if (!existingItem) {
        console.log(`item with id: ${ItemId} - does not exist`);
        return respondPOSTItem(res, 404, null, `Item with id: ${ItemId} does not exist`);
    }
    respondPOSTItem(res, 200, existingItem, null);
});

exports.getAllItems = asyncHandler( async (req, res, next) =>
{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const total = await itemModel.countDocuments();

    // const item = await ItemModel.find().skip(startIndex).limit(limit);
    const item = await itemModel.aggregate([{ $sample: { size: limit } }]);
    res.json({
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
    data: item
    });
});

exports.itemFilteredDate = asyncHandler( async (req, res, next) =>
{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start_date = req.query.start || "1950";
    const end_date = req.query.end || "1960";
    
    const startIndex = (page - 1) * limit;
    
    try {
        // Helper function to extract year pattern
        const yearPattern = /\d{4}$/;  // matches 4 digits at the end of string
    
        const total = await itemModel.find({
            date: {
                $regex: yearPattern,  // first ensure the date ends with 4 digits
                $gte: start_date,
                $lte: end_date
            }
        }).countDocuments();
    
        const items = await itemModel.find({
            date: {
                $regex: yearPattern,
                $gte: start_date,
                $lte: end_date
            }
        }).skip(startIndex).limit(limit);
    
        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            items
        });
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

exports.itemFilteredTitle = asyncHandler( async (req, res, next) =>
{

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTitle = req.query.title || "";  // search term
        const startIndex = (page - 1) * limit;

        // Create case-insensitive regex for partial matching
        const titleRegex = new RegExp(searchTitle, 'i');
    try {
        const total = await itemModel.countDocuments({
            title: { $regex: titleRegex }
        });

        const items = await itemModel.find({
            title: { $regex: titleRegex }
        }).skip(startIndex).limit(limit);

        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            items
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});