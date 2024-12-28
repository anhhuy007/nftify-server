const transactionModel = require("../models/transaction.schema");

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
      transactionModel.find().skip(skip).limit(parsedLimit).exec(),
    ]);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      items: transactions,
    };
  }

  async getTransactionByHash(hash) {
    return await this.transactionModel.findOne({ transactionHash });
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
