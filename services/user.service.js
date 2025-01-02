const mongoose = require("mongoose");
const userModel = require("../models/user.schema");
const stampModel = require("../models/stamp.schema");
const stampService = require("./stamp.service");
const nftService = require("./nft.service");
const ownershipModel = require("../models/ownership.schema");
const favouriteModel = require("../models/favouriteItem.schema");
const itemInsightModel = require("../models/itemInsight.schema");
const marketplaceService = require("./marketplace.service");
const accountModel = require("../models/account.schema");
const bcrypt = require("bcrypt");
const cartModel = require("../models/cart.schema");
const { bigint } = require("hardhat/internal/core/params/argumentTypes");
const itemPricingModel = require("../models/itemPricing.schema");
const CollectionService = require("./collection.service");
const collectionService = require("./collection.service");
const { verify } = require("jsonwebtoken");
class UserService {
  validateUserInput(user) {
    if (!user) {
      throw new Error("User data is required");
    }

    // Validate required fields
    const requiredFields = ["name"];
    for (const field of requiredFields) {
      if (!user[field]) {
        throw new Error(`[Error][Missing] Missing required field: ${field}`);
      }
    }

    // Validate status
    const validStatus = ["pending", "verified", "rejected"];
    if (!validStatus.includes(user.status)) {
      throw new Error("[Error][Invalid] Invalid status value");
    }

    // Validate gender
    const validGender = ["male", "female"];
    if (!validGender.includes(user.gender)) {
      throw new Error("[Error][Invalid] Invalid gender value");
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

    // remove password field
    newUser.password = undefined;

    return newUser;
  }

  async getUserById(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("[Error][Invalid] Invalid userId format");
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
      throw new Error("[Error][Invalid] Invalid userId format");
    }

    if (!update) {
      throw new Error("[Error][Missing] Update data is required");
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
        throw new Error(`[Error][Other] Field not allowed: ${field}`);
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
      throw new Error("[Error][Invalid] Invalid userId format");
    }

    const oid = new mongoose.Types.ObjectId(userId);

    await userModel.deleteOne({ _id: oid });
    await accountModel.deleteOne({ _id: oid });
    await ownershipModel.deleteMany({ ownerId: userId });
    await cartModel.deleteOne({ userId: userId });
  }

  async getCreatedStamps(userId, options = {}) {
    // const createdStamp = await stampModel.find({
    //   creatorId: userId,
    // });
    const { page = 1, limit = 10, filters = {} } = options;
    filters.creatorId = userId;
    // const stampIds = createdStamp.map((stamp) => stamp._id);
    const result = await marketplaceService.getStampsWithFilter({
      page,
      limit,
      filters,
    });
    return result;
  }

  async getOwnedStamps(userId, options = {}) {
    // Extract pagination from options with defaults
    const { page = 1, limit = 10, filters = {} } = options;

    filters.ownerId = userId;

    const response = await marketplaceService.getStampsWithFilter({
      page,
      limit,
      filters,
    });
    return response;
  }

  async getStampsIDsByOwner(userId) {
    // Fetch all ownership records for the user
    const ownerships = await ownershipModel.find({ ownerId: userId });

    // If ownerships are stored with a timestamp to indicate the most recent ownership
    const latestOwnerships = ownerships.reduce((acc, ownership) => {
      const existingOwnership = acc[ownership.itemId];
      if (
        !existingOwnership ||
        new Date(ownership.timestamp) > new Date(existingOwnership.timestamp)
      ) {
        acc[ownership.itemId] = ownership; // Keep the most recent ownership
      }
      return acc;
    }, {});

    // Extract only the unique and latest stamp IDs
    const stampIds = Object.keys(latestOwnerships);
    return stampIds;
  }

  async getFavoriteStamps(userId, options = {}) {
    const favouriteStamps = await favouriteModel.findOne({
      userId: userId,
    });
    const stampIds = favouriteStamps?.itemId || [];
    const result = await stampService.filterStamps(stampIds, options);
    return result;
  }

  async getUserCollections(options = {}) {
    // console.log("userId", userId);
    const page = options.page || 1;
    const limit = options.limit || 10;
    const filters = options.filters || {};
    // filters.ownerId = userId;

    // console.log("Filters", filters);
    const collection = await marketplaceService.getCollectionsWithFilter({
      page: page,
      limit: limit,
      filters,
    });

    return collection;
  }

  async createNewStamp(stamp) {
    // Validate input
    if (!stamp) {
      throw new Error("[Error][Missing] data is required");
    }
    // Get last tokenID
    const lastStamp = await stampModel.findOne().sort({ tokenID: -1 });
    const lastTokenID = lastStamp ? lastStamp.tokenID : 0;
    const preparedStamp = {
      creatorId: stamp.creatorId,
      title: stamp.title,
      issuedBy: stamp.issuedBy,
      function: stamp.function,
      date: stamp.date,
      denom: stamp.denom,
      color: stamp.color,
      imgUrl: stamp.imgUrl,
      tokenUrl: stamp.tokenUrl,

      createdAt: new Date(),
      tokenID: lastTokenID + 1,
    };

    const newStamp = await stampModel.create(preparedStamp);
    const newOwnership = await ownershipModel.create({
      ownerId: stamp.creatorId,
      itemId: newStamp._id,
      createdAt: new Date(),
    });

    const newPrice = await itemPricingModel.create({
      itemId: newStamp._id,
      price: stamp.price,
      currency: "ETH", // only currency now
      createdAt: new Date(),
    });

    const newItemInsight = await itemInsightModel.create({
      itemId: newStamp._id,
      verifyStatus: stamp.verifyStatus,
      isListed: stamp.isListed,
      createdAt: new Date(),
    });
    console.log("new item insight", newItemInsight);

    if (stamp.collection) {
      await collectionService.addStampToCollection(
        stamp.collection.id,
        newStamp._id
      );
    }
    return { newStamp, newOwnership, newPrice, newItemInsight };
  }

  async editStamp(stamp) {
    //_id
    // price: nft.price,
    // isListed: isOnMarketplace,
    // collection: selectedCollection,
    // oldCollection: newCollection,
    try {
      if (stamp.price) {
        const newPrice = await itemPricingModel.create({
          itemId: stamp._id,
          price: stamp.price,
          currency: "ETH", // only currency now
          createdAt: new Date(),
        });
        // console.log("New price created", newPrice);
      }
      if (stamp.isListed === true || stamp.isListed === false) {
        const newItemInsight = await itemInsightModel.findOneAndUpdate(
          { itemId: stamp._id },
          {
            isListed: stamp.isListed,
            updatedAt: new Date(),
          },
          { new: true }
        );
        // console.log("new item insigh===---...=", newItemInsight);
      }

      if (stamp.collection.id) {
        const collectionWithStamp =
          await collectionService.addStampToCollection(
            stamp.collection.id,
            stamp._id
          );
        // console.log("new collection with stamp", collectionWithStamp);
      }
      if (stamp.oldCollection.id) {
        const oldCollection = await collectionService.removeStampFromCollection(
          stamp.oldCollection.id,
          stamp._id
        );

        // console.log("old collection", oldCollection);
      }
    } catch (error) {
      return {
        status: "fail",
        message: error.message,
      };
    }
    return {
      status: "success",
      message: "Stamp updated successfully",
    };
  }

  async deleteStamp(userId, stampId) {
    // check if stamp is owned by user (latest ownership)
    const ownedIds = await ownershipModel
      .find({
        itemId: stampId,
      })
      .sort({ createdAt: -1 });
    const currentOwnership = ownedIds[0] || {};

    console.log("User ID", userId);

    if (currentOwnership && currentOwnership.ownerId.toString() !== userId) {
      console.log("Cannot delete stamp owned by another user");
      throw new Error("Cannot delete stamp owned by another user");
    }

    await stampModel.deleteOne({ _id: stampId });
    await ownershipModel.deleteMany({ itemId: stampId });
    await itemPricingModel.deleteMany({ itemId: stampId });
    await itemInsightModel.deleteOne({ itemId: stampId });

    const collection = await collectionService.findCollectionByStampId(stampId);
    if (collection) {
      await collectionService.removeStampFromCollection(
        collection._id,
        stampId
      );
    }

    return true;
  }

  async getUserOnSaleItems(userId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;

    // Build filters correctly
    const filters = {
      ownerId: userId,
      status: "selling",
      ...options.filters,
    };
    console.log("Filters", filters);
    const response = await marketplaceService.getStampsWithFilter({
      page,
      limit,
      filters,
    });

    return response;
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
          tokenID: 1,
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

  async buyItem(userId, itemId) {
    // check if item is for sale
    const item = await itemInsightModel.findOne({ itemId });
    if (!item || !item.isListed) {
      throw new Error("Item not for sale");
    }

    // Transfer item ownership
    await ownershipModel.create({
      ownerId: userId,
      itemId,
    });

    // Update item status
    await itemInsightModel.findOneAndUpdate(
      { itemId },
      { verifyStatus: "displaying" }
    );

    // Check if item is in cart and remove it
    const cartItemExists = await cartModel.findOne({ userId });
    if (cartItemExists) {
      await this.removeFromCart(userId, itemId);
    }

    return true;
  }

  async checkoutCart(userId) {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Create ownership records and update stamp insight status
    const ownerships = [];
    for (const itemId of cart.items) {
      const ownership = {
        ownerId: userId,
        itemId,
      };
      ownerships.push(ownership);

      // Update stamp insight status
      await itemInsightModel.findOneAndUpdate(
        { itemId },
        { isListed: false }
      );
    }
    await ownershipModel.insertMany(ownerships);

    // Clear cart
    await cartModel.findOneAndUpdate(
      { userId },
      {
        totalItem: 0,
        totalPrice: 0,
        items: [],
      }
    );

    return true;
  }

  async clearCart(userId) {
    await cartModel.findOneAndUpdate(
      { userId },
      {
        totalItem: 0,
        totalPrice: 0,
        items: [],
      }
    );

    return true;
  }

  async getUserSettings(userId) {
    const pipeline = [
      {
        $addFields: {
          userId: { $toObjectId: "$_id" },
        },
      },
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "Account",
          localField: "_id",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $unwind: {
          path: "$account",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          name: 1,
          description: 1,
          avatarUrl: 1,
          gender: 1,
          status: 1,
          bgUrl: 1,
          email: "$account.email",
          password: "$account.password",
          username: "$account.username",
        },
      },
    ];
    const user = await userModel.aggregate(pipeline);
    return user;
  }

  async changeUserProfile(userId, user) {
    const update = {
      name: user.name,
      description: user.description,
      avatarUrl: user.avatarUrl,
      bgUrl: user.bgUrl,
    };

    const filter = { _id: userId };
    const newUserProfile = await userModel.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (newUserProfile) {
      return {
        status: "success",
        data: newUserProfile,
      };
    } else {
      const oldUserProfile = await userModel.findById(userId);
      return {
        status: "fail",
        data: oldUserProfile,
      };
    }
  }
  // changeUserPassword
  async checkPassword(userId, body) {
    const currentPassword = await accountModel
      .findById(userId)
      .select("password");
    const isMatch = await bcrypt.compare(
      body.password,
      currentPassword.password
    );

    if (isMatch) {
      return {
        status: "success",
        message: "Password is correct",
      };
    }
    return {
      status: "fail",
      message: "Password is incorrect",
    };
  }
  async changePassword(userId, body) {
    const newPassword = await bcrypt.hash(body.password, 10);
    const update = {
      password: newPassword,
    };

    const filter = { _id: userId };
    const newUserAccount = await accountModel.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (newUserAccount) {
      return {
        status: "success",
        data: newUserAccount,
      };
    } else {
      const oldUserAccount = await accountModel.findById(userId);
      return {
        status: "fail",
        data: oldUserAccount,
      };
    }
  }
  async changeEmail(accountId, body) {
    const update = {
      email: body.email,
    };

    const filter = { _id: accountId };
    const newAccount = await accountModel.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (newAccount) {
      return {
        status: "success",
        data: newAccount,
      };
    } else {
      const oldAccount = await accountModel.findById(accountId);
      return {
        status: "fail",
        data: oldAccount,
      };
    }
  }

  async getTotalOwnedStamps(userId) {
    const totalOwnedStamps = await ownershipModel.countDocuments({
      ownerId: userId,
    });
    return totalOwnedStamps;
  }

  async getTotalCreatedStamps(userId) {
    const totalCreatedStamps = await stampModel.countDocuments({
      creatorId: userId,
    });
    return totalCreatedStamps;
  }

  async initWallet(userId, walletAddress) {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // check if wallet address already exists
    const existingUser = await userModel.findOne({
      wallet_address: walletAddress,
    });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      throw new Error("Wallet address already exists");
    }

    if (user.wallet_address && user.wallet_address !== walletAddress) {
      throw new Error("Wallet address already exists");
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { wallet_address: walletAddress } },
      { new: true }
    );

    return updatedUser;
  }
}

module.exports = new UserService();
