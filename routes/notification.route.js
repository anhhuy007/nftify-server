const express = require("express");
const notificationRouter = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");


notificationRouter.use(authenticateToken);
notificationRouter.get("/", notificationController.getNotifications);
notificationRouter.post("/createNotification", notificationController.createNotification);
notificationRouter.put("/markAsRead", notificationController.markAsRead);
notificationRouter.delete("/:id", notificationController.deleteNotification);
notificationRouter.delete("/", notificationController.clearAllNotifications);
notificationRouter.put("/markAllAsRead", notificationController.markAllAsRead);


module.exports = notificationRouter;