const collectionModel = require("../models/collection.schema");
const itemCollectionModel = require("../models/itemCollection.schema");
const asyncHandler = require("express-async-handler");
const helperFunc = require("../utils/helperFunc");

async function getItemCollection(collectionId) {
  // collectionId is an array of ids
  console.log(`find item in collection ${collectionId}`);
  const itemCollection = await itemCollectionModel.find({
    id: { $in: collectionId },
  });
  console.log(`Found ${itemCollection.length} items in collection`);
  return itemCollection;
}

exports.getCollectionById = asyncHandler(async (req, res) => {
  console.log(req.params);
  const collectionId = req.params.collectionId;
  const userId = req.params.id;
  if (!collectionId || !userId) {
    console.error("some ID not provided");
    return helperFunc.respondPOSTItem(res, 400, null, "Some ID not provided");
  }
  const existingCollection = await collectionModel.findOne({
    id: collectionId,
  });
  if (!existingCollection) {
    console.log(`Collection with id: ${collectionId} - does not exist`);
    return helperFunc.respondPOSTItem(
      res,
      404,
      null,
      `Collection with id: ${collectionId} does not exist`
    );
  }
  // helperFunc.respondPOSTItem(res, 200, existingCollection, null);
  const itemCollection = await getItemCollection([collectionId]);
  helperFunc.respondPOSTItem(res, 200, itemCollection, null);
});

exports.getFavouriteCollection = asyncHandler(async (req, res) => {
  const favouriteCollection = await collectionModel.findOne({
    type: "favourite",
    ownerId: req.params.id,
  });
  if (!favouriteCollection) {
    console.log(
      `Favourite collection for user with id: ${req.params.id} - does not exist`
    );
    return helperFunc.respondPOSTItem(
      res,
      404,
      null,
      `Favourite collection for user with id: ${req.params.id} does not exist`
    );
  }
  let collectionId = favouriteCollection.id;
  const itemCollection = await getItemCollection([collectionId]);
  helperFunc.respondPOSTItem(res, 200, itemCollection, null);
});

exports.listCollection = asyncHandler(async (req, res) => {
  const allCollections = await collectionModel.find({
    ownerId: req.params.id,
  });
  if (!allCollections) {
    console.log(
      `Collections ALL for user with id: ${req.params.id} - do not exist`
    );
    return helperFunc.respondPOSTItem(
      res,
      404,
      null,
      `Collections ALL for user with id: ${req.params.id} do not exist`
    );
  }
  helperFunc.respondPOSTItem(res, 200, allCollections, null);
});

exports.listAllCollection = asyncHandler(async (req, res) => {
  const allCollections = await collectionModel.find({
    ownerId: req.params.id,
  });
  if (!allCollections) {
    console.log(
      `Collections ALL for user with id: ${req.params.id} - do not exist`
    );
    return helperFunc.respondPOSTItem(
      res,
      404,
      null,
      `Collections ALL for user with id: ${req.params.id} do not exist`
    );
  }
  let collectionId = allCollections.map((collection) => collection.id);
  const itemCollection = await getItemCollection(collectionId);
  helperFunc.respondPOSTItem(res, 200, itemCollection, null);
  // helperFunc.respondPOSTItem(res, 200, allCollections, null);
});
