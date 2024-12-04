const mongoose = require("mongoose");
const userModel = require("../models/user.schema");
const stampModel = require("../models/stamp.schema");
const stampService = require("./stamp.service");
const ipfsService = require("./ipfs.service");
const nftService = require("./nft.service");
const helperFunc = require("../utils/helperFunc");
const ownershipModel = require("../models/ownership.schema");
const favouriteModel = require("../models/favouriteItem.schema");

class UserService {
  validateUserInput(user) {
    if (!user) {
      throw new Error("User data is required");
    }
    // Validate required fields
    const requiredFields = ["name", "gender", "status"];
    for (const field of requiredFields) {
      if (!user[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    // Validate status
    const validStatus = ["pending", "verified", "rejected"];
    if (!validStatus.includes(user.status)) {
      throw new Error("Invalid status value");
    }
    // Validate gender
    const validGender = ["male", "female"];
    if (!validGender.includes(user.gender)) {
      throw new Error("Invalid gender value");
    }
    // check if username already exists
    const existingUser = userModel.find({
      name: user.name,
    });
    if (existingUser) throw new Error("Username already exists");
  }

  async createUser(user) {
    // Validate input
    this.validateUserInput(user);
    // Prepare user for saving
    const preparedUser = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUser = await userModel.create(preparedUser);
    return newUser;
  }

  async getUsesById(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }
    const user = await userModel.findOne({ _id: userId });
    return user;
  }

  async filterUser(options = {}) {
    const { page = 1, limit = 10, filters = {} } = options;
    const mongoFilter = {};

    // Filter by name
    if (filters.name) {
      mongoFilter.name = { $regex: new RegExp(filters.name, "i") };
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, users] = await Promise.all([
      userModel.countDocuments(mongoFilter),
      userModel
        .find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      items: users,
    };
  }

  async updateUser(userId, update) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

    if (!update) {
      throw new Error("Update data is required");
    }

    // Validate update fields
    const allowedFields = [
      "name",
      "description",
      "avatarUrl",
      "gender",
      "status",
    ];
    for (const field in update) {
      if (!allowedFields.includes(field)) {
        throw new Error(`Field not allowed: ${field}`);
      }
    }
    // Update updatedAt field
    update.updatedAt = new Date();
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: update },
      { new: true }
    );
    return updatedUser;
  }

  async deleteUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }

        await userModel.deleteOne({ _id: userId });
    }

    //filterStamps based on stamp id array that are returned from user query
    async filterStamps(stampIds, options = {}) {
        const { page = 1, limit = 10, filters = {} } = options;
        // Prepare dynamic filter
        const mongoFilter = {
            _id: { $in: stampIds },
        };
        if (filters.creatorId) {
            mongoFilter.creatorId = new mongoose.Types.ObjectId(
                filters.creatorId
            );
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

        console.log(
            `Sorting by ${sortField} in ${
                sortOrder === 1 ? "ascending" : "descending"
            } order`
        );

        // Pagination
        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        // Execute query
        const [total, items] = await Promise.all([
            stampModel.countDocuments(mongoFilter),
            stampModel
                .find(mongoFilter)
                .sort({ [sortField]: sortOrder })
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
    async getCreatedStamps(userId, options = {}) {
        const createdStamp = await stampModel.find({
            creatorId: userId,
        });
        const stampIds = createdStamp.map((stamp) => stamp._id);
        const result = await this.filterStamps(stampIds, options);
        return result;
    }

    async getOwnedStamps(userId, options = {}) {
        // Fetch all stamps that were ever owned by the user
        const onceOwnedStamps = await ownershipModel.find({ ownerId: userId });

        // Extract the itemIds of stamps once owned by the user
        const itemIds = onceOwnedStamps.map((ownership) => ownership.itemId);

        // Fetch the latest ownership record for each of these stamps
        const subTable = await ownershipModel.aggregate([
            { $match: { itemId: { $in: itemIds } } }, // Filter to relevant stamps
            { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
            {
                $group: {
                    // Group by itemId
                    _id: "$itemId",
                    latestOwnerId: { $first: "$ownerId" }, // Keep only the latest ownerId
                },
            },
            { $match: { latestOwnerId: userId } }, // Filter to stamps where the latest owner is the user
        ]);
        // Return the list of currently owned stamps (extracting itemId)
        const ownedStampsId = subTable.map((record) => record._id);
        const result = await this.filterStamps(ownedStampsId, options);
        return result;
    }
    async getFavoriteStamps(userId, options = {}) {
        const favouriteStamps = await favouriteModel.findOne({ userId: userId });
        const stampIds = favouriteStamps?.itemId || [];
        const result = await this.filterStamps(stampIds, options);
        return result;
    }

    async createNewStamp(userId, stamp) {
        // Validate input
        if (!stamp) {
            throw new Error("Stamp data is required");
        }
        // Prepare stamp for saving
        const preparedStamp = {
            ...stamp,
            creatorId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Create stamp
        const result = await nftService.mintNFT(preparedStamp, 1.2, true);

        return result;
    }
}

module.exports = new UserService();
