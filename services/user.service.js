const mongoose = require("mongoose");
const userModel = require("../models/user.schema");
const stampModel = require("../models/stamp.schema");
const stampService = require("./stamp.service");
const nftService = require("./nft.service");
const ownershipModel = require("../models/ownership.schema");
const favouriteModel = require("../models/favouriteItem.schema");
const cartModel = require("../models/cart.schema");

class UserService {
  validateUserInput(user) {
    if (!user) {
      throw new Error("User data is required");
    }

    // Validate required fields
    const requiredFields = ["name"];
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
    // const existingUser = userModel.find({
    //   name: user.name,
    // });
    // console.log("Existing user", existingUser);
    // if (existingUser) throw new Error("Username already exists");
  }

  async createUser(userId, user) {
    console.log("Create new user", user);

    // Validate input
    this.validateUserInput(user);
    // Prepare user for saving
    const preparedUser = {
      ...user,
      _id: userId,
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

  async connectWallet(userId, walletAddress) {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { walletAddress } },
      { new: true }
    );
    return updatedUser;
  }

  async getCartItemById(itemId) {
    const item = await stampModel.aggregate([
      { $addFields: { _id: { $toString: "$_id" } } },
      { $match: { _id: itemId } },
      {
        $lookup: {
          from: "ItemPricing",
          localField: "_id",
          foreignField: "itemId",
          as: "StampPrice",
        },
      },
      {
        $unwind: "$StampPrice",
      },
      {
        $addFields: {
          "StampPrice.price": { $toDouble: "$StampPrice.price" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          imgUrl: 1,
          price: "$StampPrice.price",
        },
      },
    ]);

    if (!item) {
      throw new Error("Item not found");
    }

    return item[0];
  }

  async addToCart(userId, itemId) {
    // Check if item exists
    const item = await this.getCartItemById(itemId);
    console.log("Item found", item);

    // Check if item is already in cart
    const existingItem = await cartModel.findOne({
      userId,
      items: itemId,
    });
    if (existingItem) {
      throw new Error("Item already in cart");
    }

    // Add item to cart
    const cart = await cartModel.findOne({ userId });
    // Add item to cart
    if (!cart) {
      const newCart = await cartModel.create({
        userId,
        totalItem: 1,
        totalPrice: item.price,
        items: [item],
      });

      return newCart;
    } else {
      const updatedCart = await cartModel.findOneAndUpdate(
        { userId },
        {
          $inc: { totalItem: 1, totalPrice: item.price },
          $addToSet: { items: item._id },
        },
        { new: true } // Return the updated document
      );

      return updatedCart;
    }
  }

  async removeFromCart(userId, itemId) {
    // Check if item exists
    const item = await this.getCartItemById(itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Check if item is in cart
    const cart = await cartModel.findOne({ userId, items: itemId });
    if (!cart) {
      throw new Error("Item not in cart");
    }

    // Remove item from cart
    await cartModel.findOneAndUpdate(
      { userId },
      {
        $inc: { totalItem: -1, totalPrice: -item.price },
        $pull: { items: itemId },
      }
    );
  }

  async getCart(userId) {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      // create cart
      await cartModel.create({
        userId,
        totalItem: 0,
        totalPrice: 0,
        items: [],
      });

      return {
        totalItem: 0,
        totalPrice: 0,
        items: [],
      };
    }

    const items = [];
    for (const itemId of cart.items) {
      const item = await this.getCartItemById(itemId);
      items.push(item);
    }

    return {
      totalItem: cart.totalItem,
      totalPrice: cart.totalPrice,
      items,
    };
  }
}

module.exports = new UserService();
