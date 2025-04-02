import { HttpError } from "../../utils/http.js";
import { getLimitAndCursor } from "../../utils/query.js";
import { prisma } from "../../../prisma/prisma.js";
import { notificationEmailQueue } from "../../queues/notificationEmailQueue.js";
import { getSocket } from "../../config/socket.js";

export const getNotifications = async ({ userId, cursor, limit }) => {
  const { limitQuery, cursorQuery } = getLimitAndCursor({ limit, cursor });

  const parsedCursor = cursorQuery ? JSON.parse(cursorQuery) : null;

  const notifications = await prisma.notifications.findMany({
    where: { receiverId: userId },
    take: limitQuery,
    skip: parsedCursor ? 1 : 0,
    cursor: parsedCursor
      ? {
          createdAt_notificationId: {
            createdAt: parsedCursor.createdAt,
            notificationId: parsedCursor.notificationId,
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const totalCount = await prisma.notifications.count({
    where: { receiverId: userId, isRead: false },
  });

  const nextCursor =
    notifications.length === limitQuery
      ? {
          createdAt: notifications[notifications.length - 1].createdAt,
          notificationId:
            notifications[notifications.length - 1].notificationId,
        }
      : null;

  return {
    data: notifications,
    nextCursor,
    total: totalCount,
    hasNextPage: nextCursor !== null,
  };
};

export const getUnreadNotificationsCount = async ({ userId }) => {
  const notifications = await prisma.notifications.count({
    where: { receiverId: userId, isRead: false },
  });
  return notifications;
};

export const markNotificationsAsRead = async ({ notificationIds }) => {
  await prisma.notifications.updateMany({
    where: { notificationId: { in: notificationIds } },
    data: { isRead: true },
  });
  return "Successfully marked notifications as read";
};

export const markAllNotificationsAsRead = async ({ userId }) => {
  await prisma.notifications.updateMany({
    where: { receiverId: userId },
    data: { isRead: true },
  });
  return "Successfully marked all notifications as read";
};

export const sendAndCreateNotification = async ({
  type,
  content,
  orderId = "",
  productId = "",
  partId = "",
  html,
  title,
}) => {
  if (!type || (!orderId && !productId && !partId)) {
    throw new HttpError(
      400,
      "At least one of orderId, productId, or partId is required"
    );
  }

  const recipientRoles = ["LOW_STOCK", "ORDER_SALE", "ORDER_STOCK"].includes(
    type
  )
    ? ["ADMIN", "OWNER"]
    : ["OWNER"];

  const users = await prisma.users.findMany({
    where: {
      role: { in: recipientRoles },
    },
    select: {
      userId: true,
      fullName: true,
      email: true,
    },
  });

  const notifications = await Promise.all(
    users.map(async (user) => {
      const notification = await prisma.notifications.create({
        data: {
          receiverId: user.userId,
          type,
          title,
          content,
          ...((orderId && { orderId }) || {}),
          ...((productId && { productId }) || {}),
          ...((partId && { partId }) || {}),
        },
      });

      const io = getSocket();
      io.to(`user:${user.userId}`).emit("notification", {
        title,
        content,
        type,
        ...((orderId && { orderId }) || {}),
        ...((productId && { productId }) || {}),
        ...((partId && { partId }) || {}),
      });

      try {
        // Add email job to the queue
        const job = await notificationEmailQueue.add(
          "send-notification",
          {
            subject: String(title),
            to: String(user.email),
            html: String(html || ""),
          },
          {
            removeOnComplete: true,
            removeOnFail: 100,
          }
        );
        console.log(
          `Email notification queued for ${user.email}, job ID: ${job.id}`
        );
      } catch (error) {
        console.error(
          `Failed to queue email notification for ${user.email}:`,
          error
        );
      }

      return notification;
    })
  );

  return notifications;
};
