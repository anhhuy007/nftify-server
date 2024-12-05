const mongoose = require("mongoose");
const collectionModel = require("../models/collection.schema");
const User = require("../models/user.schema");
const stampService = require("./stamp.service");
/*
Table Collection {
  _id string [pk]
  name varchar(255) [not null]
  description text
  ownerId id [not null]
  items array [note: "list of item ids"]
  status varchar(10) [note: "enum: selling, sold, displaying, favourite"]
  viewCount integer [default: 0]
  favouriteCount integer [default: 0]
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]
}
*/

class CollectionService {
  validateCollectionInput(collection) {
    if (!collection) {
      throw new Error("Collection data is required");
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "ownerId",
      "status",
    ];
    for (const field of requiredFields) {
      if (!collection[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate ownerId format
    if (!mongoose.Types.ObjectId.isValid(collection.ownerId)) {
      throw new Error("Invalid ownerId format");
    }

    // Validate status
    const validStatus = ["selling", "sold", "displaying", "favourite"];
    if (!validStatus.includes(collection.status)) {
      throw new Error("Invalid status value");
    }
  }

  async createCollection(collection, ownerId) {
    // Validate input
    this.validateCollectionInput(collection);

    // Prepare collection for saving
    const preparedCollection = {
      ...collection,
      ownerId,
      viewCount: 0,
      favouriteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newCollection = await collectionModel.create(preparedCollection);
    return newCollection;
  }

  async getCollectionById(collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error("Invalid collectionId format");
    }

    const collection = await collectionModel.findOne({ _id: collectionId });
    return collection;
  }

  async filterCollections(options = {}) {
    const { page = 1, limit = 10, filters = {} } = options;
    const mongoFilter = {};

    // Filter by name
    if (filters.name) {
      mongoFilter.name = { $regex: new RegExp(filters.name, "i") };
    }

    // Filter by description
    if (filters.description) {
      mongoFilter.description = {
        $regex: new RegExp(filters.description, "i"),
      };
    }

    // Filter by ownerId
    if (filters.ownerId) {
      mongoFilter.ownerId = new mongoose.Types.ObjectId(filters.ownerId);
    }

    // Filter by status
    if (filters.status) {
      mongoFilter.status = filters.status;
    }

    // View count range filter
    if (filters.minViewCount || filters.maxViewCount) {
      mongoFilter.viewCount = {};
      if (filters.minViewCount) {
        mongoFilter.viewCount.$gte = filters.minViewCount;
      }
      if (filters.maxViewCount) {
        mongoFilter.viewCount.$lte = filters.maxViewCount;
      }
    }

    // Favourite count range filter
    if (filters.minFavouriteCount || filters.maxFavouriteCount) {
      mongoFilter.favouriteCount = {};
      if (filters.minFavouriteCount) {
        mongoFilter.favouriteCount.$gte = filters.minFavouriteCount;
      }
      if (filters.maxFavouriteCount) {
        mongoFilter.favouriteCount.$lte = filters.maxFavouriteCount;
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      mongoFilter.createdAt = {};
      if (filters.startDate) {
        mongoFilter.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        mongoFilter.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Sorting
    let sortField = "createdAt";
    let sortOrder = -1; // Descending
    if (filters.sortBy) {
      sortField = filters.sortBy;
    }
    if (filters.sortOrder === "asc") {
      sortOrder = 1; // Ascending
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, collections] = await Promise.all([
      collectionModel.countDocuments(mongoFilter),
      collectionModel
        .find(mongoFilter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(parsedLimit),
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      items: collections,
    };
  }

  async updateCollection(collectionId, update) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error("Invalid collectionId format");
    }

    if (!update) {
      throw new Error("Update data is required");
    }
    
    // Validate update fields
    const allowedFields = ["name", "description", "items", "status"];
    for (const field in update) {
      if (!allowedFields.includes(field)) {
        throw new Error(`Field not allowed: ${field}`);
      }
    }

    // Update updatedAt field
    update.updatedAt = new Date();

    const updatedCollection = await collectionModel.findOneAndUpdate(
      { _id: collectionId },
      { $set: update },
      { new: true }
    );

    return updatedCollection;
  }

  async getTrendingCollections(options = {}) {
    const { page = 1, limit = 10 } = options;

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, collections] = await Promise.all([
      collectionModel.countDocuments(),
      collectionModel
        .find()
        .sort({ viewCount: -1 })
        .skip(skip)
        .limit(parsedLimit),
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      items: collections,
    };
  }

  async increaseViewCount(collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error("Invalid collectionId format");
    }

    const updatedCollection = await collectionModel.findOneAndUpdate(
      { _id: collectionId },
      { $inc: { viewCount: 1 } },
      { new: true } // Return the updated document
    );

    return updatedCollection;
  }

  async increaseFavouriteCount(collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error("Invalid collectionId format");
    }

    const updatedCollection = await collectionModel.findOneAndUpdate(
      { _id: collectionId },
      { $inc: { favouriteCount: 1 } },
      { new: true } // Return the updated document
    );

    return updatedCollection;
  }

  async deleteCollection(collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error("Invalid collectionId format");
    }

    await collectionModel.deleteOne({ _id: collectionId });
  }

  async getColletionDetails(collectionId) {
    
    const collection = await collectionModel.findOne({ _id: collectionId });
    const name = collection.name;
    const collectionDescription = collection.description;
    const owner = User.findOne({id: collection.ownerId});
    const ownerName = owner.name;
    const ownerAvatar = owner.avatarUrl;
    const ownerDescription = owner.description;
    // calculate price sum of all items in collection
    const itemIds = collection.items;
    let totalPrice = 0;
    for (const itemId of itemIds) {
      const itemPrice = await stampService.getStampPrice(itemId);
      price += itemPrice;
    }
    return {
      name,
      collectionDescription,
      ownerName,
      ownerAvatar,
      ownerDescription,
      totalPrice
    }
  }
  async getCollectionStamps(collectionId, option = {}) {
    const collection = await collectionModel.findOne({ _id: collectionId });
    const itemIds = collection.items;
    const result = await stampService.filterStamps(itemIds, option);
    return result
  }
}

module.exports = new CollectionService();
