const collectionModel = require("../models/collection.schema");

async function getCollectionById(collectionId, userId) {
  if (!collectionId || !userId) {
    console.error("some ID not provided");
    throw new Error("Some ID not provided");
  }
  const existingCollection = await collectionModel.findOne({
    id: collectionId,
  });
  if (!existingCollection) {
    console.log(`Collection with id: ${collectionId} - does not exist`);
    throw new Error(`Collection with id: ${collectionId} does not exist`);
  }
  const itemCollection = await getItemCollection([collectionId]);
  return itemCollection;
}

module.exports = {
  getCollectionById
};