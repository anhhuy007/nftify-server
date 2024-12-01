const mongoose = require("mongoose");
const stampModel = require("../models/stamp.schema");
const itemInsightModel = require("../models/itemInsight.schema");

class StampService {
  // Validate input data
  validateItemInput(item) {
    if (!item) {
      throw new Error("Item data is required");
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "issuedBy",
      "function",
      "date",
      "denom",
      "color",
      "creatorId",
      "imgUrl",
    ];
    for (const field of requiredFields) {
      if (!item[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(item.date)) {
      throw new Error("Invalid date format. Use DD/MM/YYYY");
    }

    // Validate denomination
    if (isNaN(parseFloat(item.denom))) {
      throw new Error("Denomination must be a valid number");
    }

    // Optional: Validate URL if imgUrl is present
    if (item.imgUrl) {
      try {
        new URL(item.imgUrl);
      } catch {
        throw new Error("Invalid image URL format");
      }
    }
  }

  async createItem(item) {
    // Validate input
    this.validateItemInput(item);

    /*
    sample item data
    {
      title: "First Stamp",
      issuedBy: "Issuer 1",
      function: "Postage",
      date: "01/01/2021",
      denom: 1.5,
      color: "Red",
      imgUrl: "https://example.com/image.jpg",
      creatorId: "abcdef123456", // Optional
    }
    */

    // Prepare item for saving
    const preparedItem = {
      ...item,
      // Ensure numeric denomination
      denom: parseFloat(item.denom),
      // Add creation timestamp if not exists
      createdAt: item.createdAt || new Date(),
    };

    const newItem = new stampModel(preparedItem);

    try {
      await newItem.save();
      return newItem;
    } catch (error) {
      // Detailed error handling
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      throw error;
    }
  }

  async getItemById(id) {
    return stampModel.findById(id).select("-__v"); // Exclude version key
  }

  async filterItems(options = {}) {
    const { page = 1, limit = 10, filters = {} } = options;
    // Prepare dynamic filter
    const mongoFilter = {};
    if (filters.creatorId) {
      mongoFilter.creatorId = new mongoose.Types.ObjectId(filters.creatorId);
    }

    // Title filter (case-insensitive partial match)
    if (filters.title) {
      mongoFilter.title = { $regex: filters.title, $options: "i" };
    }

    // Issued By filter (exact match)
    if (filters.issuedBy) {
      mongoFilter.issuedBy = filters.issuedBy;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      mongoFilter.date = {};
      if (filters.startDate) {
        mongoFilter.date.$gte = filters.startDate;
      }
      if (filters.endDate) {
        mongoFilter.date.$lte = filters.endDate;
      }
    }

    // Denomination range filter
    if (filters.minDenom || filters.maxDenom) {
      mongoFilter.denom = {};
      if (filters.minDenom) {
        mongoFilter.denom.$gte = mongoose.Types.Decimal128.fromString(
          filters.minDenom.toString()
        );
      }
      if (filters.maxDenom) {
        mongoFilter.denom.$lte = mongoose.Types.Decimal128.fromString(
          filters.maxDenom.toString()
        );
      }
    }

    // Color filter
    if (filters.color) {
      mongoFilter.color = filters.color;
    }

    // Function filter
    if (filters.function) {
      mongoFilter.function = filters.function;
    }

    // Sorting
    let sortField = "createdAt";
    let sortOrder = -1; // Descending
    if (filters.sortBy) {
      sortField = filters.sortBy;
    }
    if (filters.sortOrder || filters.sortOrder.toLowerCase() === "asc") {
      sortOrder = 1; // Ascending
    }

    console.log(`Sorting by ${sortField} in ${sortOrder === 1 ? "ascending" : "descending"} order`);

    // Pagination
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    // Execute query
    const [total, items] = await Promise.all([
      stampModel.countDocuments(mongoFilter),
      stampModel
        .find(mongoFilter)
        .sort({[sortField]: sortOrder})
        .skip(skip)
        .limit(parsedLimit)
        .select("-__v"), // Exclude version key
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      items,
    };
  }

  async getStampStatistics() {
    return {
      totalStamps: await stampModel.countDocuments(),
      uniqueIssuers: await stampModel.distinct("issuedBy"),
      denominations: await stampModel.aggregate([
        {
          $group: {
            _id: null,
            minDenom: { $min: "$denom" },
            maxDenom: { $max: "$denom" },
            avgDenom: { $avg: "$denom" },
          },
        },
      ]),
      stampsByFunction: await stampModel.aggregate([
        {
          $group: {
            _id: "$function",
            count: { $sum: 1 },
          },
        },
      ]),
      stampsByColor: await stampModel.aggregate([
        {
          $group: {
            _id: "$color",
            count: { $sum: 1 },
          },
        },
      ]),
    };
  }

  async getTrendingStamps(options = {}) {
    const { page = 1, limit = 10 } = options;

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, stamps] = await Promise.all([
      stampModel.countDocuments(),
      itemInsightModel.aggregate([
        { $sort: { viewCount: -1 }},
        {
          $addFields: {
            itemIdObj: { $toObjectId: "$itemId" }
          }
        },
        { $skip: skip },
        { $limit: parsedLimit },
        {
          $lookup: {
            from: "Stamp",
            localField: "itemIdObj",
            foreignField: "_id",
            as: "stampDetails",
          },
        },
        { $unwind: "$stampDetails" },
        {
          $project: {
            _id: 0,
            itemId: 1, 
            viewCount: 1,
            title: "$stampDetails.title",
            issuedBy: "$stampDetails.issuedBy",
            function: "$stampDetails.function",
            date: "$stampDetails.date",
            denom: "$stampDetails.denom",
            color: "$stampDetails.color",
            imgUrl: "$stampDetails.imgUrl",
          },
        },
      ])
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit > total ? total : parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      items: stamps,
    };
  }

  async deleteItemById(id) {
    // check if id is of type ObjectId, if not convert it
    if (!mongoose.Types.ObjectId.isValid(id)) {
      id = new mongoose.Types.ObjectId(id);
    }
    await stampModel.findByIdAndDelete(id);

    return { id };
  }

  async increaseViewCount(itemId) {
    const itemInsight = await itemInsightModel.findOne({ itemId });
    if (itemInsight) {
      itemInsight.viewCount += 1;
      await itemInsight.save();
    } else {
      await itemInsightModel.create({ itemId, viewCount: 1 });
    }

    // Return updated view count
    return {
      id: itemId,
      viewCount: itemInsight ? itemInsight.viewCount + 1 : 1,
    }
  }

  async increaseFavouriteCount(itemId) {
    const itemInsight = await itemInsightModel.findOne({ itemId });
    if (itemInsight) {
      itemInsight.favouriteCount += 1;
      await itemInsight.save();
    } else {
      await itemInsightModel.create({ itemId, favouriteCount: 1 });
    }

    // Return updated favourite count
    return {
      id: itemId,
      favouriteCount: itemInsight ? itemInsight.favouriteCount + 1 : 1,
    }
  }
}

module.exports = new StampService();
