const transactionModel = require("../models/transaction.schema");
const stampModel = require("../models/stamp.schema");

class TransactionService {
  async createTransaction(transaction) {
    return await transactionModel.create(transaction);
  }

  async getTransactions(options = {}) {
    const { page = 1, limit = 10 } = options;

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, transactions] = await Promise.all([
      transactionModel.countDocuments(),
      transactionModel
        .aggregate([
          {
            $lookup: {
              from: "Stamp",
              localField: "tokenID",
              foreignField: "tokenID",
              as: "stampDetails",
            },
          },
          {
            $unwind: {
              path: "$stampDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $project: {
              transactionHash: 1,
              transactionFee: 1,
              block: 1,
              from: 1,
              to: 1,
              tokenID: 1,
              value: 1,
              gasPrice: 1,
              createdAt: 1,
              "stampDetails.title": 1,
              "stampDetails.imgUrl": 1,
            },
          },
        ])
        .skip(skip)
        .limit(parsedLimit),
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      items: transactions,
    };
  }

  async getTransactionByHash(transactionHash) {
    return await transactionModel.findOne({ transactionHash });
  }

  async getTransactionOverview() {
    try {
      const transactions = await transactionModel
        .find({})
        .sort({ createdAt: -1 })
        .lean();

      const overview = transactions.reduce(
        (acc, transaction) => {
          return {
            totalEthersSent:
              acc.totalEthersSent + parseFloat(transaction.value),
            totalGasPrice: acc.totalGasPrice + parseFloat(transaction.gasPrice),
            totalFees: acc.totalFees + parseFloat(transaction.transactionFee),
          };
        },
        {
          totalEthersSent: 0,
          totalGasPrice: 0,
          totalFees: 0,
        }
      );

      return {
        success: true,
        data: {
          totalEthersSent: overview.totalEthersSent.toFixed(4),
          totalTransactions: transactions.length,
          totalGasPrice: overview.totalGasPrice.toFixed(18),
          totalFees: overview.totalFees.toFixed(4),
        },
      };
    } catch (error) {
      console.error("Error in getTransactionOverview:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new TransactionService();
