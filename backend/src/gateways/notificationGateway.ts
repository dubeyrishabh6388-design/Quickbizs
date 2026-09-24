import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger";

export class NotificationGateway {
  private static io: Server | null = null;

  static initialize(ioInstance: Server) {
    this.io = ioInstance;

    this.io.on("connection", (socket: Socket) => {
      logger.info(`Socket client connected: ${socket.id}`);

      socket.on("register", (data: { businessId: string; userId: string; role: string }) => {
        if (data.businessId && data.userId) {
          const userRoom = `user:${data.userId}`;
          const businessRoom = `business:${data.businessId}`;
          const roleRoom = `role:${data.businessId}:${data.role}`;

          socket.join(userRoom);
          socket.join(businessRoom);
          socket.join(roleRoom);
          
          logger.info(`Socket ${socket.id} joined rooms: [${userRoom}], [${businessRoom}], [${roleRoom}]`);

          // Offline recovery check: notify client that socket is ready
          socket.emit("registered", { success: true });
        }
      });

      socket.on("disconnect", () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
      });
    });
  }

  static emitNewNotification(businessId: string, userId: string | null, roleTarget: string | null, notification: any) {
    if (!this.io) {
      logger.warn("NotificationGateway io is not active. Socket emission skipped.");
      return;
    }

    if (userId) {
      this.io.to(`user:${userId}`).emit("notification:new", notification);
    } else if (roleTarget) {
      this.io.to(`role:${businessId}:${roleTarget}`).emit("notification:new", notification);
    } else {
      this.io.to(`business:${businessId}`).emit("notification:new", notification);
    }

    // Emit live counts trigger
    if (userId) {
      this.io.to(`user:${userId}`).emit("notification:count");
    } else {
      this.io.to(`business:${businessId}`).emit("notification:count");
    }
  }

  static emitUpdateNotification(businessId: string, userId: string | null, notification: any) {
    if (!this.io) return;

    if (userId) {
      this.io.to(`user:${userId}`).emit("notification:update", notification);
    } else {
      this.io.to(`business:${businessId}`).emit("notification:update", notification);
    }
  }

  static emitDeleteNotification(businessId: string, userId: string | null, notificationId: string) {
    if (!this.io) return;

    if (userId) {
      this.io.to(`user:${userId}`).emit("notification:delete", { id: notificationId });
    } else {
      this.io.to(`business:${businessId}`).emit("notification:delete", { id: notificationId });
    }
  }
}
