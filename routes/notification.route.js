const express = require("express");
const notificationRouter = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");


notificationRouter.use(authenticateToken);
notificationRouter.get("/notifications", notificationController.getNotifications);
notificationRouter.post("/notification", notificationController.createNotification);
notificationRouter.put("/notification/:id", notificationController.markAsRead);
notificationRouter.delete("/notification/:id", notificationController.deleteNotification);
notificationRouter.delete("/notifications", notificationController.clearAllNotifications);
notificationRouter.put("/notifications", notificationController.markAllAsRead);


module.exports = notificationRouter;