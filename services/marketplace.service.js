const mongoose = require('mongoose');
const stampModel = require('../models/stamp.schema');
const itemInsightModel = require('../models/itemInsight.schema');
const ItemSellPrice = require('../models/itemPricing.schema');

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
                    $sort: { 'insight.viewCount': -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: 10,
                },
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
            }
        ]);

        return stamp[0];
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
}

module.exports = new MarketplaceService();