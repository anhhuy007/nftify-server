const mongoose = require("mongoose");
const stampModel = require("../models/stamp.schema");
const itemInsightModel = require("../models/itemInsight.schema");
const itemSellPriceModel = require("../models/itemPricing.schema");
const ownershipModel = require("../models/ownership.schema");
const collectionModel = require("../models/collection.schema");
const StampService = require("./stamp.service");
const collectionService = require("./collection.service");
const nftService = require("./nft.service");
const stampService = require("./stamp.service");
const userModel = require("../models/user.schema");
class MarketplaceService {
    async getTrendingStamps(options = {}) {
        const { page = 1, limit = 10 } = options;
        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        // Get trending stamps with full details: include item insights and sell price
        const [total, items] = await Promise.all([
            itemInsightModel.countDocuments(),
            stampModel.aggregate([
                {
                    $addFields: {
                        itemIdString: { $toString: "$_id" },
                    },
                },
                {
                    $lookup: {
                        from: "ItemInsight",
                        localField: "itemIdString",
                        foreignField: "itemId",
                        as: "insight",
                    },
                },
                {
                    $lookup: {
                        from: "Collection",
                        localField: "itemIdString",
                        foreignField: "items",
                        as: "collection",
                    },
                },
                {
                    $addFields: {
                        collectionName: {
                            $ifNull: [
                                { $arrayElemAt: ["$collection.name", 0] },
                                "null",
                            ],
                        },
                    },
                },
                {
                    $sort: { "insight.viewCount": -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: 10,
                },
                {
                    $project: {
                        itemIdString: 1,
                        _id: 1,
                        title: 1,
                        imgUrl: 1,
                        "insight.viewCount": 1, //check purpose
                    },
                },
            ]),
        ]);
        // const ownerId = stampService.getOwnerId(id )
        // const price = await stampService.getStampPrice(id)
        // Then, fetch prices for each stamp
        const addOwnerAndPrice = await Promise.all(
            items.map(async (item) => {
                const price = await stampService.getStampPrice(
                    item.itemIdString
                );
                const ownerId = await stampService.getOwnerId(
                    item.itemIdString
                );
                const ownerDetails = await userModel
                    .findOne({ _id: ownerId })
                    .select("name avatarUrl");
                return {
                    ...item,
                    price,
                    ownerDetails,
                };
            })
        );
        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items: addOwnerAndPrice,
        };
    }

    async getStampById(id) {
        const stamp = await stampModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $addFields: {
                    itemIdString: { $toString: "$_id" },
                },
            },
            {
                $lookup: {
                    from: "ItemInsight",
                    localField: "itemIdString",
                    foreignField: "itemId",
                    as: "insight",
                },
            },
            { $unwind: "$insight" },
            {
                $lookup: {
                    from: "ItemPricing",
                    localField: "itemIdString",
                    foreignField: "itemId",
                    as: "price",
                },
            },
            { $unwind: "$price" },
            { $addFields: { creatorObjId: { $toObjectId: "$creatorId" } } },
            {
                $lookup: {
                    from: "User",
                    localField: "creatorObjId",
                    foreignField: "_id",
                    as: "creatorDetails",
                },
            },
            {
                $unwind: {
                    path: "$creatorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "OwnerShip",
                    localField: "itemIdString",
                    foreignField: "itemId",
                    as: "ownershipDetails",
                },
            },
            {
                $unwind: {
                    path: "$ownershipDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $sort: { "ownershipDetails.createdAt": -1 } },
            { $limit: 1 },
            {
                $addFields: {
                    ownerObjId: { $toObjectId: "$ownershipDetails.ownerId" },
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "ownerObjId",
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
                $lookup: {
                    from: "Collection",
                    localField: "itemIdString",
                    foreignField: "items",
                    as: "collection",
                },
            },
            {
                $unwind: {
                    path: "$collection",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    "insight._id": 0,
                    "insight.itemId": 0,
                    "insight.updatedAt": 0,
                    "price._id": 0,
                    "price.itemId": 0,
                    "price.createdAt": 0,
                    itemIdString: 0,
                    creatorObjId: 0,
                    "creatorDetails.description": 0,
                    "creatorDetails.gender": 0,
                    "creatorDetails.status": 0,
                    "creatorDetails.createdAt": 0,
                    "creatorDetails.updatedAt": 0,
                    ownershipDetails: 0,
                    ownerObjId: 0,
                    "ownerDetails.description": 0,
                    "ownerDetails.gender": 0,
                    "ownerDetails.status": 0,
                    "ownerDetails.createdAt": 0,
                    "ownerDetails.updatedAt": 0,
                    "collection.description": 0,
                    "collection.ownerId": 0,
                    "collection.items": 0,
                    "collection.createdAt": 0,
                    "collection.updatedAt": 0,
                },
            },
        ]);

        return stamp[0];
    }

    async getStampPriceHistory(id) {
        const prices = await itemSellPriceModel.aggregate([
            {
                $match: { itemId: id },
            },
            { $sort: { createdAt: -1 } },
        ]);

        return prices;
    }

    async getStampOwnerHistory(id) {
        const ownerships = await ownershipModel.aggregate([
            {
                $match: { itemId: id },
            },
            {
                $addFields: { ownerObjectId: { $toObjectId: "$ownerId" } },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "ownerObjectId",
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
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    "ownerDetails.password": 0,
                    "ownerDetails.email": 0,
                    "ownerDetails.createdAt": 0,
                    "ownerDetails.updatedAt": 0,
                },
            },
        ]);

        return ownerships;
    }

    async getTopCategories() {
        const categories = await stampModel.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
        ]);

        return categories;
    }

    async getTopCreators(options = {}) {
        const { page = 1, limit = 10 } = options;

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const creators = await ownershipModel.aggregate([
            {
                $lookup: {
                    from: "ItemInsight",
                    localField: "itemId",
                    foreignField: "itemId",
                    as: "insight",
                },
            },
            {
                $unwind: "$insight",
            },
            {
                $group: {
                    _id: "$ownerId",
                    totalViewCount: { $sum: "$insight.viewCount" },
                },
            },
            {
                $sort: { totalViewCount: -1 },
            },
            {
                $skip: skip,
            },
            {
                $limit: parsedLimit,
            },
            {
                $addFields: {
                    creatorId: { $toObjectId: "$_id" },
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorDetails",
                },
            },
            {
                $unwind: {
                    path: "$creatorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Stamp",
                    localField: "_id",
                    foreignField: "creatorId",
                    as: "creatorStamps",
                    pipeline: [
                        { $limit: 3 },
                        {
                            $project: { imgUrl: 1 },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    totalViewCount: 1,
                    "creatorDetails.name": 1,
                    "creatorDetails.description": 1,
                    creatorStamps: "$creatorStamps.imgUrl",
                },
            },
        ]);

        const total = await await ownershipModel
            .distinct("ownerId")
            .then((owners) => owners.length);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit > total ? total : parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items: creators,
        };
    }

    async getTopCollections(options = {}) {
        const { page = 1, limit = 10 } = options;

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const [total, collections] = await Promise.all([
            collectionModel.countDocuments(),
            collectionModel.aggregate([
                {
                    $sort: { viewCount: -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: parsedLimit,
                },
                {
                    $project: {
                        items: 0,
                    },
                },
            ]),
        ]);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items: collections,
        };
    }

    async getStampsWithFilter(options = {}) {
        const { page = 1, limit = 10, filters = {} } = options;

        // Prepare dynamic filter
        const mongoFilter = {};
        if (filters.creatorId) {
            mongoFilter.creatorId = new mongoose.Types.ObjectId(
                filters.creatorId
            );
        }
        if (filters.title) {
            mongoFilter.title = { $regex: filters.title, $options: "i" };
        }
        if (filters.issuedBy) {
            mongoFilter.issuedBy = filters.issuedBy;
        }
        if (filters.color) {
            mongoFilter.color = filters.color;
        }
        if (filters.function) {
            mongoFilter.function = filters.function;
        }

        // Date and denomination filters
        if (filters.startDate || filters.endDate) {
            mongoFilter.date = {};
            if (filters.startDate) mongoFilter.date.$gte = filters.startDate;
            if (filters.endDate) mongoFilter.date.$lte = filters.endDate;
        }
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

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        if (!filters.minPrice && !filters.maxPrice) {
            filters.minPrice = 0.1;
        }

        const priceFilter = {};
        if (filters.minPrice)
            priceFilter.$gte = mongoose.Types.Decimal128.fromString(
                filters.minPrice.toString()
            );
        if (filters.maxPrice)
            priceFilter.$lte = mongoose.Types.Decimal128.fromString(
                filters.maxPrice.toString()
            );

        // Sorting
        const { sortField, sortOrder } = this.handleSortOption(filters.sort);

        // Aggregation Pipeline
        const pipeline = [
            { $match: mongoFilter },
            {
                $addFields: {
                    itemIdString: { $toString: "$_id" },
                },
            },
            {
                $lookup: {
                    from: "ItemInsight",
                    localField: "itemIdString",
                    foreignField: "itemId",
                    as: "insight",
                },
            },
            { $unwind: { path: "$insight", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "Collection",
                    localField: "itemIdString",
                    foreignField: "items",
                    as: "collection",
                },
            },
            {
                $unwind: {
                    path: "$collection",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "ItemPricing",
                    localField: "itemIdString",
                    foreignField: "itemId",
                    pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
                    as: "currentPrice",
                },
            },
            {
                $unwind: {
                    path: "$currentPrice",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "OwnerShip",
                    localField: "itemIdString",
                    foreignField: "itemId",
                    pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
                    as: "ownership",
                },
            },
            {
                $unwind: {
                    path: "$ownership",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "User",
                    let: { ownerId: "$ownership.ownerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$ownerId" }],
                                },
                            },
                        },
                    ],
                    as: "ownerDetails",
                },
            },
            {
                $unwind: {
                    path: "$ownerDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        // Price filter
        pipeline.push({
            $match: { "currentPrice.price": priceFilter },
        });
        // Conditional filters for ownerName and collectionName
        if (filters.collectionName) {
            pipeline.push({
                $match: {
                    "collection.name": {
                        $regex: filters.collectionName,
                        $options: "i",
                    },
                },
            });
        }
        if (filters.ownerName) {
            pipeline.push({
                $match: {
                    "ownerDetails.name": {
                        $regex: filters.ownerName,
                        $options: "i",
                    },
                },
            });
        }

        // apply status filter
        if (filters.status === "all") {
            pipeline.push({
                $match: {
                    "insight.verifyStatus": { $ne: "rejected" },
                },
            });
        }
        else if (filters.status) {
            pipeline.push({
                $match: {
                    "insight.verifyStatus": filters.status,
                },
            });
        }

        pipeline.push(
            {
                $project: {
                    _id: 1,
                    title: 1,
                    imgUrl: 1,
                    price: "$currentPrice.price",
                    viewCount: "$insight.viewCount",
                    favouriteCount: "$insight.favoriteCount",
                    status: "$insight.verifyStatus",
                    collectionName: { $ifNull: ["$collection.name", "null"] },
                    ownerDetails: {
                        name: "$ownerDetails.name",
                        avatarUrl: "$ownerDetails.avatarUrl",
                    },
                },
            },
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: parsedLimit }
        );

        // Execute the queries
        const [total, items] = await Promise.all([
            stampModel.countDocuments(mongoFilter),
            stampModel.aggregate(pipeline),
        ]);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items,
        };
    }

    handleSortOption(sortOption) {
        // Sorting
        let sortField = "createdAt";
        let sortOrder = -1; // Descending

        if (sortOption) {
            switch (sortOption) {
                case "price-up":
                    sortField = "price";
                    sortOrder = 1; // Ascending
                    break;
                case "price-down":
                    sortField = "price";
                    sortOrder = -1; // Descending
                    break;
                case "trending":
                    sortField = "viewCount";
                    sortOrder = -1; // Descending
                    break;
                case "favourite":
                    sortField = "favouriteCount";
                    sortOrder = -1; // Descending
                    break;
                case "a-to-z":
                    sortField = "title";
                    sortOrder = 1; // Ascending
                    break;
                case "z-to-a":
                    sortField = "title";
                    sortOrder = -1; // Descending
                    break;
                default:
                    sortField = "createdAt";
                    sortOrder = -1; // Descending
                    break;
            }
        }
        return { sortField, sortOrder };
    }
    async getCollectionsWithFilter(options = {}) {
        const { page = 1, limit = 10, filters = {} } = options;
        const mongoFilter = {};

        // Apply filters
        if (filters.name) {
            mongoFilter.name = { $regex: new RegExp(filters.name, "i") };
        }
        // if (filters.description) {
        //     mongoFilter.description = { $regex: new RegExp(filters.description, "i") };
        // }
        if (filters.ownerId) {
            mongoFilter.ownerId = new mongoose.Types.ObjectId(filters.ownerId);
        }
        if (filters.status) {
            mongoFilter.status = filters.status;
        }

        // Range filters
        if (filters.minViewCount || filters.maxViewCount) {
            mongoFilter.viewCount = {};
            if (filters.minViewCount) {
                const minViewCount = Number(filters.minViewCount);
                mongoFilter.viewCount.$gte = minViewCount;
            }
            if (filters.maxViewCount) {
                const maxViewCount = Number(filters.maxViewCount);
                mongoFilter.viewCount.$lte = maxViewCount;
            }
        }
        if (filters.minFavouriteCount || filters.maxFavouriteCount) {
            mongoFilter.favouriteCount = {};
            if (filters.minFavouriteCount) {
                const minFavouriteCount = Number(filters.minFavouriteCount);
                mongoFilter.favouriteCount.$gte = minFavouriteCount;
            }
            if (filters.maxFavouriteCount) {
                const maxFavouriteCount = Number(filters.maxFavouriteCount);
                mongoFilter.favouriteCount.$lte = maxFavouriteCount;
            }
        }

        // if (filters.startDate || filters.endDate) {
        //     mongoFilter.createdAt = {};
        //     if (filters.startDate) mongoFilter.createdAt.$gte = new Date(filters.startDate);
        //     if (filters.endDate) mongoFilter.createdAt.$lte = new Date(filters.endDate);
        // }

        // Sorting
        let sortField = "createdAt";
        let sortOrder = -1; // Descending
        if (filters.sortBy) {
            sortField = filters.sortBy;
        }
        if (filters.sortOrder || filters.sortOrder === "asc") {
            sortOrder = 1; // Ascending
        }

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const [total, collections] = await Promise.all([
            collectionModel.countDocuments(mongoFilter),
            collectionModel.aggregate([
                { $match: mongoFilter },
                {
                    $addFields: {
                        ownerIdObj: { $toObjectId: "$ownerId" },
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
                { $unwind: "$ownerDetails" },
                {
                    $project: {
                        name: 1,
                        description: 1,
                        status: 1,
                        items: 1,
                        viewCount: 1,
                        favouriteCount: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        thumbUrl: 1,
                        ownerDetails: {
                            name: "$ownerDetails.name",
                            avatarUrl: "$ownerDetails.avatarUrl",
                            description: "$ownerDetails.description",
                        },
                    },
                },
                {
                    $sort: {
                        [filters.sortBy || "createdAt"]:
                            sortOrder === 1 ? 1 : -1,
                    },
                },
                { $skip: skip },
                { $limit: parsedLimit },
            ]),
        ]);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items: collections,
        };
    }

    async getCreatorsWithFilter(options = {}) {
        const { page = 1, limit = 10, name = "" } = options;

        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        // Base pipeline stages
        const pipeline = [
            {
                $group: {
                    _id: "$creatorId",
                    total: { $sum: 1 },
                },
            },
            {
                $addFields: {
                    creatorId: { $toObjectId: "$_id" },
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "creatorId",
                    foreignField: "_id",
                    as: "creatorDetails",
                },
            },
            {
                $unwind: {
                    path: "$creatorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        // Add name filter if provided
        if (name) {
            pipeline.push({
                $match: {
                    "creatorDetails.name": {
                        $regex: name,
                        $options: "i",
                    },
                },
            });
        }

        // Add pagination
        pipeline.push(
            { $skip: skip },
            { $limit: parsedLimit },
            {
                $project: {
                    _id: 1,
                    total: 1,
                    name: "$creatorDetails.name",
                    avatar: "$creatorDetails.avatarUrl",
                },
            }
        );

        const creators = await stampModel.aggregate(pipeline);
        const total = creators.length;

        return {
            total,
            page: parsedPage,
            limit: parsedLimit > total ? total : parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items: creators,
        };
    }

    async getAllNFTs() {
        const nfts = await nftService.getAllNFTs();
        const total = nfts.length;

        return {
            total,
            data: nfts,
        };
    }
}

module.exports = new MarketplaceService();
