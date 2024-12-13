const mongoose = require("mongoose");
const userModel = require("../models/user.schema");
const stampModel = require("../models/stamp.schema");
const stampService = require("./stamp.service");
const ipfsService = require("./ipfs.service");
const nftService = require("./nft.service");
const helperFunc = require("../utils/helperFunc");
const ownershipModel = require("../models/ownership.schema");
const favouriteModel = require("../models/favouriteItem.schema");
const collectionModel = require("../models/collection.schema");
const marketplaceService = require("./marketplace.service");

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


  async getUsers(options = {}) {
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

    
    async getCreatedStamps(userId, options = {}) {
        const createdStamp = await stampModel.find({
            creatorId: userId,
        });
        const stampIds = createdStamp.map((stamp) => stamp._id);
        const result = await stampService.filterStamps(stampIds, options);
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
        const result = await stampService.filterStamps(ownedStampsId, options);
        return result;
    }
    async getFavoriteStamps(userId, options = {}) {
        const favouriteStamps = await favouriteModel.findOne({ userId: userId });
        const stampIds = favouriteStamps?.itemId || [];
        const result = await stampService.filterStamps(stampIds, options);
        return result;
    }

    async getUserCollections(userId) {
      const collections = await collectionModel.find({ ownerId: userId });
      return collections;
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

    async getUserOnSaleItems(userId, options = {}) {
      const filters = {
        options,
        verifyStatus: 'selling',
      };

      const page = params.page || 1;
      const limit = params.limit||10;

      const stamps = await marketplaceService.getStampsWithFilter({page:1, limit:1000, filters})

      let arr = [];
      stamps.forEach(stamp => {
        if(stamp.ownerId === userId){
          arr.push(stamp);
        }
      });
    }
}

module.exports = new UserService();
