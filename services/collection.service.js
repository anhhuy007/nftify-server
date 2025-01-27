const mongoose = require("mongoose");
const collectionModel = require("../models/collection.schema");
const User = require("../models/user.schema");
const stampService = require("./stamp.service");
const marketplaceService = require("./marketplace.service");
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
      throw new Error("[Error][Missing] Collection data is required");
    }

    // Validate required fields
    const requiredFields = ["name"];
    for (const field of requiredFields) {
      if (!collection[field]) {
        throw new Error(`[Error][Missing] Missing required field: ${field}`);
      }
    }

    // // Validate status
    // const validStatus = ["selling", "sold", "displaying", "favourite"];
    // if (!validStatus.includes(collection.status)) {
    //     throw new Error("[Error][Invalid] Invalid status value");
    // }
  }

  async createCollection(collection, ownerId) {
    // Validate input
    this.validateCollectionInput(collection);

    // Prepare collection for saving
    const preparedCollection = {
      ...collection,
      ownerId: ownerId,
      viewCount: 0,
      favouriteCount: 0,
      status: "selling",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newCollection = await collectionModel.create(preparedCollection);
    return newCollection;
  }

  async getCollectionById(collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new Error("[Error][Invalid] Invalid collectionId format");
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
      throw new Error("[Error][Invalid] Invalid collectionId format");
    }

    if (!update) {
      throw new Error("[Error][Missing] Update data is required");
    }

    // Validate update fields
    const allowedFields = ["name", "description", "items", "status"];
    for (const field in update) {
      if (!allowedFields.includes(field)) {
        throw new Error(`[Error][Other] Field not allowed: ${field}`);
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
      throw new Error("[Error][Invalid] Invalid collectionId format");
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
      throw new Error("[Error][Invalid] Invalid collectionId format");
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
      throw new Error("[Error][Invalid] Invalid collectionId format");
    }

    await collectionModel.deleteOne({ _id: collectionId });
  }

  async getColletionDetails(collectionId) {
    const collection = await collectionModel.findOne({ _id: collectionId });
    const name = collection.name;
    const collectionDescription = collection.description;
    const owner = User.findOne({ id: collection.ownerId });
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
      totalPrice,
    };
  }
  async getCollectionStamps(collectionId, option = {}) {
    const collection = await collectionModel.findOne({ _id: collectionId });
    const itemIds = collection.items;
    const result = await stampService.filterStamps(itemIds, option);
    return result;
  }
  async getCollectionAbout(collectionId) {
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(collectionId),
        },
      },
      {
        $addFields: {
          collectionId: { $toObjectId: collectionId },
        },
      },
      {
        $addFields: {
          ownerIdObj: { $toObjectId: "$ownerId" }, // Convert string ownerId to ObjectId
        },
      },
      // Because items is an array of itemIds
      {
        $unwind: { path: "$items", preserveNullAndEmptyArrays: true },
      },
      // a picture of the collection
      {
        $lookup: {
          from: "Stamp",
          localField: "items",
          foreignField: "_id",
          as: "stamp",
        },
      },
      {
        $unwind: {
          path: "$stamp",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ItemPricing",
          localField: "items",
          foreignField: "itemId",
          as: "itemPrices",
        },
      },
      {
        $unwind: {
          path: "$itemPrices",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "ownerIdObj",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          ownerId: { $first: "$ownerId" },
          description: { $first: "$description" },
          thumbUrl: { $first: "$thumbUrl" },
          ownerDetails: { $first: "$ownerDetails" }, // Maintain ownerDetails
          totalPrice: { $sum: "$itemPrices.price" },
          stampPicture: { $first: "$stamp.imgUrl" },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          ownerId: 1,
          ownerDetails: {
            _id: "$ownerDetails._id",
            name: "$ownerDetails.name",
            avatarUrl: "$ownerDetails.avatarUrl",
            description: "$ownerDetails.description",
          },
          totalPrice: 1,
          thumbUrl: "$thumbUrl", //change to thumbUrl
        },
      },
    ];

    // Execute the aggregation pipeline
    const result = await collectionModel.aggregate(pipeline);
    return result[0] ?? null;
  }

  async getCollectionItems(params = {}) {
    const collectionId = params.collectionId;
    const filters = params.filters;

    // Set default values for page and limit, and merge with existing options
    const page = params.page || 1;
    const limit = params.limit || 10;

    const stamps = await marketplaceService.getStampsWithFilter({
      page: 1,
      limit: 1000,
      filters,
    }); // maybe lack of data

    // Fetch the collection from the database by ID
    const collection = await collectionModel.findById(collectionId);

    // Get the collection's item IDs
    const collectionItemIds = collection.items;
    const collectionItemIdsStrings = collectionItemIds.map((id) =>
      id.toString()
    ); // Convert to string for easy comparison

    let arr = [];
    for (let i = 0; i < stamps.items.length; i++) {
      // console.log(stamps.items[i]._id)
      if (collectionItemIdsStrings.includes(stamps.items[i]._id.toString())) {
        arr.push(stamps.items[i]);
      }
    }

    const total = arr.length;
    const endpage = total;
    if (limit * page <= total - 1) {
      endpage = limit * page;
    }
    const items = arr.slice(limit * (page - 1), endpage); // as page start = 1

    return {
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      items: items,
    };
  }

    async addStampToCollection(collectionId, stampId) {
    
        // Check if the collection exists
        // console.log(collectionId);
        const collection = await collectionModel.findById(collectionId);
        // console.log(collection);
        if (collection.items.includes(stampId)) {
            return collection;
        }
        let currItems = collection.items;
        currItems.push(stampId);
        // Add stamp to the collection
        // curcollection.items.push(stampId);

        // Save the updated collection
        const updatedCollection = await collectionModel.findByIdAndUpdate(collectionId,{
            items: currItems
        },{ new: true })

        return updatedCollection;
    }
    async removeStampFromCollection(collectionId, stampId) {
        const collection = await collectionModel.findById(collectionId);
        let currItems = collection.items;
        const index = currItems.indexOf(stampId);
        // console.log("index = ",index);
        if (index > -1) {
            currItems.splice(index, 1);
        }
        // console.log("curr = ",currItems); 
        const updatedCollection = await collectionModel.findByIdAndUpdate(collectionId,{
            items: currItems
        },
        { new: true })
        return updatedCollection;
    }

  // getCollectionList
  async getCollectionList(userId) {
    // console.log(userId);
    const pipeline = [
      {
        $match: {
          ownerId: userId.toString(),
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          ownerId: 1,
          thumbUrl: 1,
        },
      },
    ];
    const collections = await collectionModel.aggregate(pipeline);
    // console.log(collections);
    return collections;
  }

  async findCollectionByStampId(stampId) {
    const collections = await collectionModel.findOne({ items: stampId });
    return collections;
  }

  async removeStampFromCollection(collectionId, stampId) {
    // Check if the collection exists
    const collection = await collectionModel.findOne({ _id: collectionId });
    if (!collection) {
      throw new Error("[Error][NotFound] Collection not found");
    }

    let currItems = collection.items;
    currItems = currItems.filter(
      (item) => item.toString() !== stampId.toString()
    );
    // Save the updated collection
    const updatedCollection = await collectionModel.findByIdAndUpdate(
      collectionId,
      {
        items: currItems,
      }
    );

    return updatedCollection;
  }
}

module.exports = new CollectionService();
