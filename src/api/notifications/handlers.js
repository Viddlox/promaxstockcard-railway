import {
  HttpError,
  formatResponse,
  formatErrorResponse,
} from "../../utils/http.js";
import {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} from "./services.js";

export const handleGetNotifications = async (req, res) => {
  try {
    const { limit, cursor } = req.query;
    const { userId } = req.user;

    const { data, nextCursor, total, hasNextPage } = await getNotifications({
      limit,
      cursor,
      userId,
    });

    res
      .status(200)
      .json(formatResponse(data, nextCursor, { total, hasNextPage }));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error getting notifications"));
  }
};

export const handleMarkNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    const result = await markNotificationsAsRead({ notificationIds });

    res.status(200).json(formatResponse(result));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error marking notifications as read"));
  }
};

export const handleMarkAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await markAllNotificationsAsRead({ userId });

    res.status(200).json(formatResponse(result));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error marking all notifications as read"));
  }
};

export const handleGetUnreadNotificationsCount = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await getUnreadNotificationsCount({ userId });

    res.status(200).json(formatResponse(result));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error getting unread notifications count"));
  }
};
