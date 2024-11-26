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

    // Prepare item for saving
    const preparedItem = {
      ...item,
      // Ensure numeric denomination
      denom: parseFloat(item.denom),
      // Add creator ID if not provided (optional)
      creatorId: item.creatorId || mongoose.Types.ObjectId(),
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

  async filterStamps(options = {}) {
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
        mongoFilter.denom.$gte = mongoose.Types.Decimal128.fromString(filters.minDenom.toString());
      }
      if (filters.maxDenom) {
        mongoFilter.denom.$lte = mongoose.Types.Decimal128.fromString(filters.maxDenom.toString());
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

    // Pagination
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    // Execute query
    const [total, items] = await Promise.all([
      stampModel.countDocuments(mongoFilter),
      stampModel
        .find(mongoFilter)
        .sort({ createdAt: -1 }) // Most recent first
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

  async getTrendingStamp() {
    return stampModel.aggregate([
      {
        $lookup: {
          from: "ItemInsight",
          localField: "_id",
          foreignField: "stampId",
          as: "insights",
        },
      },
      {
        $sort: { "insights.views": -1 },
      },
      {
        $limit: 10,
      },
    ]);
  }
}

module.exports = new StampService();
