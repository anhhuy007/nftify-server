

const collectionModel = require('../models/collections.model');
const asyncHandler = require("express-async-handler");
const helperFunc = require ('../helperFunc');


exports.getCollectionById = asyncHandler(async (req, res) => {
    console.log(req.params);
    const collectionId = req.params.collectionId;
    const userId = req.params.id;
    if (!collectionId || !userId) {
        console.error('some ID not provided');
        return helperFunc.respondPOSTItem(res, 400, null, 'Some ID not provided');
    }
    const existingCollection = await collectionModel.findOne({
        id: parseInt(collectionId),
        ownerId: parseInt(userId)
    });
    if (!existingCollection) {
        console.log(`Collection with id: ${collectionId} - does not exist`);
        return helperFunc.respondPOSTItem(res, 404, null, `Collection with id: ${collectionId} does not exist`);
    }
    helperFunc.respondPOSTItem(res, 200, existingCollection, null);
});

    
exports.getFavouriteCollection = asyncHandler(async (req, res) => {
    const favouriteCollection = await collectionModel.findOne({
        type: 'favourite',
        ownerId: req.params.id
    });
    if (!favouriteCollection) {
        console.log(`Favourite collection for user with id: ${req.params.id} - does not exist`);
        return helperFunc.respondPOSTItem(res, 404, null, `Favourite collection for user with id: ${req.params.id} does not exist`);
    }
    helperFunc.respondPOSTItem(res, 200, favouriteCollection, null);
});
exports.listCollection = asyncHandler(async (req, res) => {
    const allCollections = await collectionModel.find({
        ownerId: req.params.id
    });
    if (!allCollections) {
        console.log(`Collections ALL for user with id: ${req.params.id} - do not exist`);
        return helperFunc.respondPOSTItem(res, 404, null, `Collections ALL for user with id: ${req.params.id} do not exist`);
    }
    helperFunc.respondPOSTItem(res, 200, allCollections, null);
});