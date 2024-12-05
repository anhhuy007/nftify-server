const mongoose = require('mongoose');
const stampModel = require('../models/stamp.schema');
const itemInsightModel = require('../models/itemInsight.schema');
const ItemSellPrice = require('../models/itemPricing.schema');
const OwnerShip = require('../models/ownership.schema');
const Collection = require('../models/collection.schema');
const StampService = require('./stamp.service');
const collectionService = require('./collection.service');
const nftService = require("./nft.service");
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
                        itemIdString: { $toString: '$_id' },
                    },
                },
                {
                    $lookup: {
                        from: 'ItemInsight',
                        localField: 'itemIdString',
                        foreignField: 'itemId',
                        as: 'insight',
                    },
                },
                {
                    $lookup: {
                        from: 'ItemPricing',
                        localField: 'itemIdString',
                        foreignField: 'itemId',
                        as: 'price',
                    },
                },
                {
                    $lookup: {
                        from: 'Collection',
                        localField: 'itemIdString',
                        foreignField: 'items',
                        as: 'collection',
                    },
                },
                {
                    $addFields: {
                        collectionName: { 
                            $ifNull: [{ $arrayElemAt: ['$collection.name', 0] }, 'null'] 
                        },
                    },
                },
                {
                    $sort: { 'insight.viewCount': -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: 10,
                },
                {
                    $project: {
                        collection: 0
                    },
                }
            ])
        ]);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            items,
        }
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
                    itemIdString: { $toString: '$_id' },
                },
            },
            {
                $lookup: {
                    from: 'ItemInsight',
                    localField: 'itemIdString',
                    foreignField: 'itemId',
                    as: 'insight',
                },
            },
            { $unwind: '$insight' },
            {
                $lookup: {
                    from: 'ItemPricing',
                    localField: 'itemIdString',
                    foreignField: 'itemId',
                    as: 'price',
                },
            },
            { $unwind: '$price' },
            { $addFields: { creatorObjId: { $toObjectId: '$creatorId' } } },
            {
                $lookup: {
                    from: 'User',
                    localField: 'creatorObjId',
                    foreignField: '_id',
                    as: 'creatorDetails',
                }
            },
            { $unwind: { path: '$creatorDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'OwnerShip',
                    localField: 'itemIdString', 
                    foreignField: 'itemId',
                    as: 'ownershipDetails',
                }
            },
            { $unwind: { path: '$ownershipDetails', preserveNullAndEmptyArrays: true } },
            { $sort: { 'ownershipDetails.createdAt': -1 } },
            { $limit: 1 },
            {
                $addFields: {
                    ownerObjId: { $toObjectId: '$ownershipDetails.ownerId' }
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'ownerObjId',
                    foreignField: '_id',
                    as: 'ownerDetails',
                }
            },
            { $unwind: { path: '$ownerDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'Collection',
                    localField: 'itemIdString',
                    foreignField: 'items',
                    as: 'collection',
                }
            },
            {
                $project: {
                    'insight._id': 0,
                    'insight.itemId': 0,
                    'insight.updatedAt': 0,
                    'price._id': 0,
                    'price.itemId': 0,
                    'price.createdAt': 0,
                    itemIdString: 0,
                    creatorObjId: 0,
                    'creatorDetails.description': 0,
                    'creatorDetails.gender': 0,
                    'creatorDetails.status': 0,
                    'creatorDetails.createdAt': 0,
                    'creatorDetails.updatedAt': 0,
                    'ownershipDetails': 0,
                    ownerObjId: 0,
                    'ownerDetails.description': 0,
                    'ownerDetails.gender': 0,
                    'ownerDetails.status': 0,
                    'ownerDetails.createdAt': 0,
                    'ownerDetails.updatedAt': 0,
                    'collection.description': 0,
                    'collection.ownerId': 0,
                    'collection.items': 0,
                    'collection.createdAt': 0,
                    'collection.updatedAt': 0
                }
            }
        ]);

        return stamp[0];
    }

    async getStampPriceHistory(id) {
        const prices = await ItemSellPrice.aggregate([
            {
                $match: { itemId: id }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return prices;
    }

    async getStampOwnerHistory(id) {
        const ownerships = await OwnerShip.aggregate([
            {
                $match: { itemId: id }
            },
            {
                $addFields: { ownerObjectId: { $toObjectId: '$ownerId' } }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'ownerObjectId',
                    foreignField: '_id',
                    as: 'ownerDetails',
                },
            },
            {
                $unwind: { path: '$ownerDetails', preserveNullAndEmptyArrays: true },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    'ownerDetails.password': 0,
                    'ownerDetails.email': 0,
                    'ownerDetails.createdAt': 0,
                    'ownerDetails.updatedAt': 0,
                }
            }
        ]);

        return ownerships;
    }

    async getTopCategories() {
        const categories = await stampModel.aggregate([
            {
                $group: {
                    _id: '$category',
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

        const creators = await OwnerShip.aggregate([
            {
                $lookup: {
                    from: 'ItemInsight',
                    localField: 'itemId',
                    foreignField: 'itemId',
                    as: 'insight',
                }
            },
            {
                $unwind: '$insight',
            },
            {
                $group: {
                    _id: '$ownerId',
                    totalViewCount: { $sum: '$insight.viewCount' },
                }
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
                    creatorId: { $toObjectId: '$_id' },
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'creatorId',
                    foreignField: '_id',
                    as: 'creatorDetails',
                }
            },
            {
                $unwind: { path: '$creatorDetails', preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 1, 
                    totalViewCount: 1,
                    'creatorDetails.name': 1
                }
            }
        ]);

        const total = await await OwnerShip.distinct('ownerId').then((owners) => owners.length);

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
            Collection.countDocuments(),
            Collection.aggregate([
                {
                    $sort: { viewCount: -1 }
                },
                {
                    $skip: skip
                },
                {
                    $limit: parsedLimit
                },
                {
                    $project: {
                        items: 0
                    }
                }
            ])
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
        return await StampService.filterItems(options);
    }

    async getCollectionsWithFilter(options = {}) {
        return await collectionService.filterCollections(options);
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
                    _id: '$creatorId',
                    total: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    creatorId: { $toObjectId: '$_id' }
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'creatorId',    
                    foreignField: '_id',
                    as: 'creatorDetails'
                }
            },
            {
                $unwind: { 
                    path: '$creatorDetails', 
                    preserveNullAndEmptyArrays: true 
                }
            }
        ];

        // Add name filter if provided
        if (name) {
            pipeline.push({
                $match: {
                    'creatorDetails.name': { 
                        $regex: name, 
                        $options: 'i' 
                    }
                }
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
                    name: '$creatorDetails.name',
                    avatar: '$creatorDetails.avatarUrl'
                }
            }
        );

        const creators = await stampModel.aggregate(pipeline);
        const total = creators.length;

        return {
            total,
            page: parsedPage,
            limit: parsedLimit > total ? total : parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            creators,
        };
    }

    async getAllNFTs() {
        const nfts = await nftService.getAllNFTs();
        const total = nfts.length;

        return {
            total,
            data: nfts
        };
    }
}

module.exports = new MarketplaceService();