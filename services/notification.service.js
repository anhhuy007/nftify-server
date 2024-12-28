const NotificationModel = require('../models/notification.schema');

class NotificationService {
    // Create new notification
    async createNotification(userId, message) {
        try {
            const notification = {
                message: message,
                read: false,
                time: new Date()
            };

            const existingNotifications = await NotificationModel.findOne({ userId });

            if (existingNotifications) {
                await NotificationModel.updateOne(
                    { userId },
                    { $push: { notifications: notification } }
                );
                return { success: true, message: 'Notification added' };
            }

            const newNotification = new NotificationModel({
                userId,
                notifications: [notification]
            });
            await newNotification.save();
            return { success: true, message: 'Notification created' };
        } catch (error) {
            throw new Error(`Create notification failed: ${error.message}`);
        }
    }

    // Read notifications with pagination
    async getNotifications(userId, page = 1, limit = 10) {
        const notifications = await NotificationModel.findOne({ userId });
        if (!notifications) {
            return { notifications: [], total: 0 };
        }

        const start = (page - 1) * limit;
        const end = Math.min(start + limit, notifications.notifications.length);
        const paginatedNotifications = notifications.notifications.slice(start, end);

        return {
            notifications: paginatedNotifications,
            total: notifications.notifications.length
        };
    }

    // Update notification read status
    async markAsRead(userId, notificationIndex) {
        try {
            // Find user notifications first
            const userNotifications = await NotificationModel.findOne({ userId });
            
            if (!userNotifications || !userNotifications.notifications) {
                return { success: false, message: 'No notifications found' };
            }
    
            // Validate index
            if (notificationIndex < 0 || notificationIndex > userNotifications.notifications.length) {
                return { success: false, message: 'Invalid notification index' };
            }
    
            // Update read status
            const result = await NotificationModel.updateOne(
                { userId },
                { $set: { [`notifications.${notificationIndex}.read`]: true } }
            );
    
            return { success: true, message: 'Notification marked as read' };
        } catch (error) {
            throw new Error(`Mark as read failed: ${error.message}`);
        }
    }

    // Delete notification
    async deleteNotification(userId, notificationIndex) {
        const result = await NotificationModel.updateOne(
            { userId },
            { $unset: { ['notifications.' + notificationIndex]: 1 } }
        );
        await NotificationModel.updateOne(
            { userId },
            { $pull: { notifications: null } }
        );
        return { success: true, message: 'Notification deleted' };
    }

    // Clear all notifications
    async clearAllNotifications(userId) {
        const result = await NotificationModel.updateOne(
            { userId },
            { $set: { notifications: [] } }
        );
        return { success: true, message: 'All notifications cleared' };
    }

    async markAllNotificationsAsRead(userId) {
        const result = await NotificationModel.updateOne(
            { userId },
            { $set: { 'notifications.$[].read': true } }
        );
        return { success: true, message: 'All notifications marked as read' };
    }

    // Get unread count
    async getUnreadCount(userId) {
        const notifications = await NotificationModel.findOne({ userId });
        if (!notifications) return 0;

        return notifications.notifications.filter(n => !n.read).length;
    }
}

module.exports = new NotificationService();