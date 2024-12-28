const express = require("express");
const notificationRouter = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");


notificationRouter.use(authenticateToken);
notificationRouter.get("/", notificationController.getNotifications);
notificationRouter.post("/createNotification", notificationController.createNotification);
notificationRouter.put("/:id", notificationController.markAsRead);
notificationRouter.delete("/:id", notificationController.deleteNotification);
notificationRouter.delete("/", notificationController.clearAllNotifications);
notificationRouter.put("/", notificationController.markAllAsRead);


module.exports = notificationRouter;