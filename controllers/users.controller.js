const jsend = require('jsend');
const userModel = require('../models/users.model');
const asyncHandler = require("express-async-handler");

exports.getAllUser = asyncHandler( async (req, res, next) =>
{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const total = await userModel.countDocuments();

    // const item = await ItemModel.find().skip(startIndex).limit(limit);
    const item = await userModel.aggregate([{ $sample: { size: limit } }]);
    res.json({
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
    data: item
    });
});
exports.getByID = asyncHandler( async (req, res, next) => 
    {
        //show collection 
        console.log('Collection name:', userModel.collection.name);
        // Explicitly extract the ID parameter
        const userId = req.params.id;
        console.log('Extracted USERS:', userId);
        if (!userId) {
            console.error('User ID not provided');
            return respondPOSTItem(res, 400, null, 'User ID not provided');
        }
        // Check if document with this id already exists
        const existingItem = await userModel.findOne({ id: parseInt(userId) });
        if (!existingItem) {
            console.log(`item with id: ${ItemId} - does not exist`);
            return respondPOSTItem(res, 404, null, `User with id: ${userId} does not exist`);
        }
        respondPOSTItem(res, 200, existingItem, null);
    });

