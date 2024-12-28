const notificationService = require('../services/notification.service');
const asyncHandler = require('express-async-handler');
const { handleServiceError, handleResponse } = require('../utils/helperFunc');

exports.getNotifications = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.getNotifications(req.user._id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.createNotification = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.createNotification(req.user._id, req.body.message);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.markAsRead = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.markAsRead(req.user._id, req.params.id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
}
);

exports.deleteNotification = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.deleteNotification(req.user._id, req.params.id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.clearAllNotifications = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.clearAllNotifications(req.user._id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.markAllNotificationsAsRead(req.user._id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getAllUnreadNotifications = asyncHandler(async (req, res) => {
    try {
        const result = await notificationService.getAllUnreadNotifications(req.user._id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

