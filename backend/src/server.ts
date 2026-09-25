import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { env, getAllowedOrigins } from "./config/environment";
import { prisma } from "./config/prisma";
import { logger } from "./utils/logger";
import { NotificationGateway } from "./gateways/notificationGateway";
import { NotificationScheduler } from "./schedulers/notificationScheduler";
import { CustomerReminderScheduler } from "./services/customerReminderScheduler";
import { PaymentScheduler } from "./services/paymentScheduler";

const startServer = async () => {
  try {
    logger.info("Initializing relational database ledger connection...");
    
    // Connect to database to verify credential validity
    await prisma.$connect();
    logger.info(`Database connection established successfully in [${env.nodeEnv}] mode.`);

    // Create HTTP wrapper for Socket.IO support
    const server = http.createServer(app);
    
    const allowedOrigins = getAllowedOrigins();

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          const isAllowed = allowedOrigins.some((pattern) => {
            if (typeof pattern === "string") return pattern === origin;
            if (pattern instanceof RegExp) return pattern.test(origin);
            return false;
          });
          callback(null, isAllowed || env.nodeEnv === "development");
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });

    // Initialize Gateway and schedulers
    NotificationGateway.initialize(io);
    NotificationScheduler.start();
    CustomerReminderScheduler.start();
    PaymentScheduler.initialize();

    const PORT = env.port || 5000;
    const HOST = "0.0.0.0";

    server.listen(PORT, HOST, () => {
      logger.info(`QuickBizs Backend Service initialized in [${env.nodeEnv}] mode.`);
      logger.info(`Server listening on ${HOST}:${PORT}`);
    });

    // Graceful shutdown handling for Render container restarts
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP/Socket server closed.");
        try {
          await prisma.$disconnect();
          logger.info("Prisma database connection closed.");
        } catch (err) {
          logger.error("Error disconnecting Prisma:", err);
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    logger.error("Relational database connection check failed on boot sequence:", error);
    process.exit(1);
  }
};

startServer();
