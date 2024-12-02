const mongoose = require("mongoose");
const userModel = require("../models/user.schema");
const stampModel = require("../models/stamp.schema");
const stampService = require("./stamp.service");
const ipfsService = require("./ipfs.service");
const nftService = require("./nft.service");
const helperFunc = require("../utils/helperFunc");

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

  async createNewStamp(userId, stampData) {
    try {
      // 1. Validate and create stamp in database
      const newStamp = await stampService.createItem({
        ...stampData,
        creatorId: userId,
      });

      console.log("Creating NFT, this might take a few seconds...");
      await nftService.listNFT(newStamp, 1.2);

      // // 2. Prepare metadata for IPFS
      // const metadata = helperFunc.convertStampToNFTMeta(newStamp);

      // // 3. Upload metadata to IPFS
      // const metadataFile = new File(
      //   [JSON.stringify(metadata)],
      //   "metadata.json",
      //   { type: "application/json" }
      // );
      // const ipfsResult = await ipfsService.uploadFile(metadataFile, newStamp._id);
      // console.log("IPFS Result:", ipfsResult);

      // // 4. Mint NFT
      // const receiver = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 
      // const tokenURI = `${process.env.GATEWAY_URL}/ipfs/${ipfsResult.IpfsHash}`;
      // const mintResult = await nftService.mintNFT(receiver, tokenURI);
      // console.log("Mint Result:", mintResult);

      // // 5. Return combined result
      // return {
      //   stamp: newStamp,
      //   nft: {
      //     tokenId: mintResult.tokenId,
      //     tokenURI: tokenURI,
      //     transaction: mintResult.transactionHash,
      //   },
      //   ipfs: {
      //     hash: ipfsResult.IpfsHash,
      //     url: tokenURI,
      //   },
      // };
    } catch (error) {
      console.error("Error creating new stamp:", error);
      throw new Error("Failed to create new stamp: " + error.message);
    }
  }
}

module.exports = new UserService();
