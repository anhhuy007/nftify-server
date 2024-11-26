const asyncHandler = require("express-async-handler");
const helperFunc = require("../utils/helperFunc");
const collectionService = require("../services/collection.service");

exports.getCollectionById = asyncHandler(async (req, res) => {
  console.log(req.params);
  const collectionId = req.params.collectionId;
  const userId = req.params.id;
  try {
    const itemCollection = await collectionService.getCollectionById(collectionId, userId);
    helperFunc.respondPOSTItem(res, 200, itemCollection, null);
  } catch (error) {
    helperFunc.respondPOSTItem(res, 400, null, error.message);
  }
});