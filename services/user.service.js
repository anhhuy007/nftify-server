const mongoose = require("mongoose");
const userModel = require("../models/user.schema");

// Table User {
//     _id string [pk]
//     name varchar [not null]
//     description string
//     avatarUrl string [default: "default.image"]
//     gender varchar [note: "field: 'male', 'female'"]
//     status string [note: "field: pending, verified, rejected"]
//   }

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

        /*
    update: {

// Table User {
//     name varchar [not null]
//     description string
//     avatarUrl string [default: "default.image"]
//     gender varchar [note: "field: 'male', 'female'"]
//     status string [note: "field: pending, verified, rejected"]
//   }
    }
    */
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
}

module.exports = new UserService();
