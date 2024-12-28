// routes/index.js
const express = require("express");
const authRoutes = require("./auth.route.js");
const collectionRoutes = require("./collection.route.js");
const marketplaceRoutes = require("./marketplace.route.js");
const stampRoutes = require("./stamp.route.js");
const userRoutes = require("./user.route.js");
const transactionRoutes = require("./transaction.route.js");

const routers = express.Router();

// Public Routes
routers.use("/auth", authRoutes);
routers.use("/collection", collectionRoutes);
routers.use("/marketplace", marketplaceRoutes);
routers.use("/stamp", stampRoutes);
routers.use("/user", userRoutes);
routers.use("/transaction", transactionRoutes);

// Protected Routes
// routers.use("/user", userRoutes);
// routers.use("/writer", writerRoutes);
// routers.use("/editor", editorRoutes);
// routers.use("/admin", adminRoutes);

module.exports = routers;