const userModel = require('../models/users.model');
const itemModel = require('../models/items.model');
const collectionModel = require('../models/collections.model');
const asyncHandler = require("express-async-handler");
const helperFunc = require ('../helperFunc');





exports.getAllSeller = asyncHandler( async (req, res, next) =>
    {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
    
        const startIndex = (page - 1) * limit;

        
        const userCollections = await collectionModel.aggregate([
            // Step 1: $lookup to perform a left join between COLLECTION and USERS
            {
              $lookup: {
                from: 'users',               // The collection we are joining with
                localField: 'ownerId',        // Field from the collection to join on
                foreignField: '_id',          // Field from the users collection to match
                as: 'userDetails'             // The resulting array of joined users
              }
            },
            // Step 2: $unwind to deconstruct the array from $lookup (optional, if you expect only one user per collection)
            {
              $unwind: {
                path: '$userDetails',        // Flatten the userDetails array
                preserveNullAndEmptyArrays: true  // Keep documents without matches
              }
            },
            // Step 3: $match to filter for collections where TYPE is "SELLING"
            {
              $match: {
                type: 'selling'             // Filter to only those with type "SELLING"
              }
            }
          ]);
        
        const total = userCollections.length;
        const item = userCollections.slice(startIndex, startIndex + limit);
          
        
        res.json({
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        data: item
        });
    });

