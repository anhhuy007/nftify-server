const itemModel = require('../models/items.model');
const asyncHandler = require("express-async-handler");
const helperFunc = require ('../helperFunc');


exports.createItem = asyncHandler( async (req, res, next) => 
{
    const item = req.body;
    console.log('Received item:', item);    
    // Check if document with this id already exists
    const existingItem = await itemModel.findOne({ id: parseInt(item.id) });
    if (existingItem) {
        console.log(`item with id: ${item.id} - already exists`);

        return helperFunc.respondPOSTItem(res, 409, `item with id: ${item.id} - already exists`, null);
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
        helperFunc.respondPOSTItem(res, 201, newItem, null);
    } catch (error) {
        console.error(`Failed to save item with id: ${item.id}`, error);
        helperFunc.respondPOSTItem(res, 500, `Failed to save item with id: ${item.id}, ${error.message}`);
    }
});
exports.getByID = asyncHandler( async (req, res, next) => 
{
    //show collection 
    console.log('Received query get by ID:', req.params.id);
    console.log('Collection name:', itemModel.collection.name);
    // Explicitly extract the ID parameter
    const ItemId = req.params.id;
    if (!ItemId) {
        console.error('Item ID not provided');
        return helperFunc.respondPOSTItem(res, 400, null, 'Item ID not provided');
    }
    // Check if document with this id already exists
    const existingItem = await itemModel.findOne({ id: parseInt(ItemId) });
    if (!existingItem) {
        console.log(`item with id: ${ItemId} - does not exist`);
        return helperFunc.respondPOSTItem(res, 404, null, `Item with id: ${ItemId} does not exist`);
    }
    helperFunc.respondPOSTItem(res, 200, existingItem, null);
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

exports.itemFilteredDate = asyncHandler(async (req, res, next) => {
    console.log('Received query:', req.query);
    console.log("collection name:", itemModel.collection.name);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startYear = req.query.start || "1950";
    const endYear = req.query.end || "1960";
  
    const startIndex = (page - 1) * limit;
  
    try {
      // Helper function to extract day, month, and year from date string

        const total = await itemModel.countDocuments({
            date: {
            $gte: new Date(startYear, 0, 1), // January 1st of start year
            $lte: new Date(endYear, 11, 31) // December 31st of end year
            }
        });
    
        const items = await itemModel.find({
            date: {
            $gte: new Date(startYear, 0, 1),
            $lte: new Date(endYear, 11, 31)
            }
        })
        .skip(startIndex)
        .limit(limit);
    
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